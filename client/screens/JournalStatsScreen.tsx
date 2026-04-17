import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  RefreshControl,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { useAuth } from "@/lib/auth";

interface JournalConversionRow {
  slug: string;
  title: string | null;
  views: number;
  ctaClicks: number;
  createAccountChoices: number;
  openContactChoices: number;
  guestEmails: number;
}

interface JournalStatsResponse {
  from: string | null;
  to: string | null;
  stats: JournalConversionRow[];
}

type RangeKey = "7d" | "30d" | "90d" | "all";

const RANGE_OPTIONS: { key: RangeKey; label: string; days: number | null }[] = [
  { key: "7d", label: "7d", days: 7 },
  { key: "30d", label: "30d", days: 30 },
  { key: "90d", label: "90d", days: 90 },
  { key: "all", label: "All", days: null },
];

function pct(numerator: number, denominator: number): string {
  if (!denominator) return "—";
  return `${Math.round((numerator / denominator) * 100)}%`;
}

function buildCsvContent(
  stats: JournalConversionRow[],
  rangeLabel: string,
  from: string | null,
  to: string | null,
): string {
  const header = ["Range", "From", "To", "Slug", "Title", "Views", "CTA Clicks", "Create Account", "Open Contact", "Guest Emails"];
  const fromStr = from ? new Date(from).toISOString().slice(0, 10) : "all";
  const toStr = to ? new Date(to).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
  const rows = stats.map((r) => [
    rangeLabel,
    fromStr,
    toStr,
    r.slug,
    r.title ?? r.slug,
    r.views,
    r.ctaClicks,
    r.createAccountChoices,
    r.openContactChoices,
    r.guestEmails,
  ]);
  const escape = (val: string | number) => {
    const s = String(val);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  return [header, ...rows].map((row) => row.map(escape).join(",")).join("\n");
}

async function exportCsvNative(csv: string, filename: string) {
  const path = `${FileSystem.cacheDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(path, { mimeType: "text/csv", dialogTitle: "Export Journal Stats" });
  } else {
    Alert.alert("Sharing not available", "Your device does not support file sharing.");
  }
}

function exportCsvWeb(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function JournalStatsScreen() {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [range, setRange] = useState<RangeKey>("30d");
  const [exporting, setExporting] = useState(false);

  const fromDate = useMemo(() => {
    const opt = RANGE_OPTIONS.find((r) => r.key === range);
    if (!opt || opt.days === null) return null;
    const d = new Date();
    d.setDate(d.getDate() - opt.days);
    return d;
  }, [range]);

  const adminId = user?.id;
  const queryKey = useMemo(
    () => ["/api/admin/journal/conversion-stats", range, adminId] as const,
    [range, adminId],
  );

  const { data, isLoading, refetch, isError } = useQuery<JournalStatsResponse>({
    queryKey,
    enabled: Boolean(adminId),
    queryFn: async () => {
      const url = new URL("/api/admin/journal/conversion-stats", getApiUrl());
      if (adminId) url.searchParams.set("adminId", adminId);
      if (fromDate) url.searchParams.set("from", fromDate.toISOString());
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) {
        throw new Error(`${res.status}: ${await res.text()}`);
      }
      return res.json();
    },
  });

  const stats = data?.stats ?? [];

  const handleExport = async () => {
    if (stats.length === 0) return;
    setExporting(true);
    try {
      const rangeLabel = RANGE_OPTIONS.find((r) => r.key === range)?.label ?? range;
      const csv = buildCsvContent(stats, rangeLabel, data?.from ?? null, data?.to ?? null);
      const filename = `journal-stats-${range}-${new Date().toISOString().slice(0, 10)}.csv`;
      if (Platform.OS === "web") {
        exportCsvWeb(csv, filename);
      } else {
        await exportCsvNative(csv, filename);
      }
    } catch (e) {
      Alert.alert("Export failed", "Could not export CSV. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const totals = useMemo(() => {
    return stats.reduce(
      (acc, r) => {
        acc.views += r.views;
        acc.ctaClicks += r.ctaClicks;
        acc.createAccountChoices += r.createAccountChoices;
        acc.openContactChoices += r.openContactChoices;
        acc.guestEmails += r.guestEmails;
        return acc;
      },
      {
        views: 0,
        ctaClicks: 0,
        createAccountChoices: 0,
        openContactChoices: 0,
        guestEmails: 0,
      },
    );
  }, [stats]);

  const renderRangePicker = () => (
    <View style={[styles.rangeRow, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
      {RANGE_OPTIONS.map((opt) => {
        const active = opt.key === range;
        return (
          <Pressable
            key={opt.key}
            testID={`range-${opt.key}`}
            onPress={() => setRange(opt.key)}
            style={[
              styles.rangePill,
              active && { backgroundColor: theme.text },
            ]}
          >
            <ThemedText
              type="caption"
              style={{ color: active ? theme.backgroundRoot : theme.textSecondary }}
            >
              {opt.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );

  const renderHeader = () => (
    <Animated.View entering={FadeInDown.duration(400)}>
      <View style={styles.headerSection}>
        <View>
          <ThemedText type="h2">Journal Stats</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {stats.length} {stats.length === 1 ? "article" : "articles"}
          </ThemedText>
        </View>
        <Pressable
          testID="button-export-csv"
          onPress={handleExport}
          disabled={exporting || stats.length === 0}
          style={[
            styles.exportButton,
            { borderColor: theme.border, backgroundColor: theme.backgroundDefault },
            (exporting || stats.length === 0) && { opacity: 0.4 },
          ]}
        >
          <Feather name="download" size={14} color={theme.textSecondary} />
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {exporting ? "Exporting..." : "CSV"}
          </ThemedText>
        </Pressable>
      </View>
      {renderRangePicker()}
      <Card style={styles.totalsCard}>
        <ThemedText type="caption" style={{ color: theme.textSecondary, marginBottom: Spacing.sm }}>
          Totals in range
        </ThemedText>
        <View style={styles.totalsGrid}>
          <Totals label="Views" value={totals.views} />
          <Totals label="CTA clicks" value={totals.ctaClicks} sub={pct(totals.ctaClicks, totals.views)} />
          <Totals label="Create account" value={totals.createAccountChoices} sub={pct(totals.createAccountChoices, totals.ctaClicks)} />
          <Totals label="Guest emails" value={totals.guestEmails} sub={pct(totals.guestEmails, totals.ctaClicks)} />
        </View>
      </Card>
    </Animated.View>
  );

  const renderRow = ({ item, index }: { item: JournalConversionRow; index: number }) => (
    <Animated.View entering={FadeInDown.delay(80 + index * 40).duration(350)}>
      <Card style={styles.card}>
        <View style={styles.titleRow}>
          <ThemedText type="h4" testID={`stat-title-${item.slug}`}>
            {item.title || item.slug}
          </ThemedText>
          <ThemedText type="caption" style={{ color: theme.textTertiary }}>
            {item.slug}
          </ThemedText>
        </View>

        <View style={styles.funnelRow}>
          <FunnelStep label="Views" value={item.views} testID={`stat-views-${item.slug}`} />
          <Feather name="chevron-right" size={14} color={theme.textTertiary} />
          <FunnelStep
            label="CTA"
            value={item.ctaClicks}
            sub={pct(item.ctaClicks, item.views)}
            testID={`stat-cta-${item.slug}`}
          />
          <Feather name="chevron-right" size={14} color={theme.textTertiary} />
          <FunnelStep
            label="Account"
            value={item.createAccountChoices}
            sub={pct(item.createAccountChoices, item.ctaClicks)}
            testID={`stat-account-${item.slug}`}
          />
          <Feather name="chevron-right" size={14} color={theme.textTertiary} />
          <FunnelStep
            label="Email"
            value={item.guestEmails}
            sub={pct(item.guestEmails, item.ctaClicks)}
            testID={`stat-email-${item.slug}`}
          />
        </View>

        {item.openContactChoices > 0 ? (
          <ThemedText type="caption" style={{ color: theme.textSecondary, marginTop: Spacing.sm }}>
            {item.openContactChoices} opened contact form
          </ThemedText>
        ) : null}
      </Card>
    </Animated.View>
  );

  const renderEmpty = () => (
    <EmptyState
      image={require("../../assets/images/empty-projects.png")}
      title={isError ? "Couldn't load stats" : "No journal events yet"}
      description={
        isError
          ? "Try refreshing. If this keeps happening, check the server logs."
          : "Once readers visit Journal articles, conversion numbers will show up here."
      }
    />
  );

  return (
    <FlatList
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
        flexGrow: 1,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      data={stats}
      keyExtractor={(item) => item.slug}
      renderItem={renderRow}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={isLoading ? null : renderEmpty}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
    />
  );
}

function Totals({ label, value, sub }: { label: string; value: number; sub?: string }) {
  const { theme } = useTheme();
  return (
    <View style={styles.totalsCell}>
      <ThemedText type="caption" style={{ color: theme.textSecondary }}>{label}</ThemedText>
      <ThemedText type="h3">{value}</ThemedText>
      {sub ? (
        <ThemedText type="caption" style={{ color: theme.textTertiary }}>{sub}</ThemedText>
      ) : null}
    </View>
  );
}

function FunnelStep({
  label,
  value,
  sub,
  testID,
}: {
  label: string;
  value: number;
  sub?: string;
  testID?: string;
}) {
  const { theme } = useTheme();
  return (
    <View style={styles.funnelStep} testID={testID}>
      <ThemedText type="caption" style={{ color: theme.textSecondary }}>{label}</ThemedText>
      <ThemedText type="h4">{value}</ThemedText>
      {sub ? (
        <ThemedText type="caption" style={{ color: theme.textTertiary }}>{sub}</ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  rangeRow: {
    flexDirection: "row",
    padding: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.lg,
    alignSelf: "flex-start",
    gap: Spacing.xs,
  },
  rangePill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  totalsCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  totalsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  totalsCell: {
    minWidth: 80,
    flexGrow: 1,
  },
  card: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  titleRow: {
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  funnelRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  funnelStep: {
    minWidth: 64,
  },
});
