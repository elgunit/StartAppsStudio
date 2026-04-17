import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  RefreshControl,
  Pressable,
  Platform,
  Alert,
  Modal,
  ScrollView,
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
import { Sparkline } from "@/components/Sparkline";
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

interface TrendBucket {
  label: string;
  views: number;
  ctaClicks: number;
  createAccountChoices: number;
  openContactChoices: number;
  guestEmails: number;
}

interface JournalTrendRow {
  slug: string;
  title: string | null;
  bucketSize: "day" | "week" | "month";
  buckets: TrendBucket[];
}

interface JournalTrendsResponse {
  from: string | null;
  to: string | null;
  trends: JournalTrendRow[];
}

type RangeKey = "7d" | "30d" | "90d" | "all";

const RANGE_OPTIONS: { key: RangeKey; label: string; days: number | null }[] = [
  { key: "7d", label: "7d", days: 7 },
  { key: "30d", label: "30d", days: 30 },
  { key: "90d", label: "90d", days: 90 },
  { key: "all", label: "All", days: null },
];

const VIEWS_COLOR = "#3B82F6";
const CTA_COLOR = "#10B981";
const ACCOUNT_COLOR = "#8B5CF6";
const EMAIL_COLOR = "#F59E0B";

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
  const totalViews = stats.reduce((sum, r) => sum + r.views, 0);
  const totalCtaClicks = stats.reduce((sum, r) => sum + r.ctaClicks, 0);
  const totalCreateAccount = stats.reduce((sum, r) => sum + r.createAccountChoices, 0);
  const totalOpenContact = stats.reduce((sum, r) => sum + r.openContactChoices, 0);
  const totalGuestEmails = stats.reduce((sum, r) => sum + r.guestEmails, 0);
  const totalRow = ["TOTAL", "", "", "", "", totalViews, totalCtaClicks, totalCreateAccount, totalOpenContact, totalGuestEmails];
  const escape = (val: string | number) => {
    const s = String(val);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  return [header, ...rows, totalRow].map((row) => row.map(escape).join(",")).join("\n");
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

function formatBucketLabel(label: string, bucketSize: "day" | "week" | "month"): string {
  if (bucketSize === "month") {
    const [year, month] = label.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months[parseInt(month, 10) - 1] ?? label;
  }
  const date = new Date(label + "T00:00:00");
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
}

export default function JournalStatsScreen() {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [range, setRange] = useState<RangeKey>("30d");
  const [exporting, setExporting] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<JournalTrendRow | null>(null);

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
  const trendsQueryKey = useMemo(
    () => ["/api/admin/journal/conversion-trends", range, adminId] as const,
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

  const { data: trendsData, isLoading: trendsLoading, refetch: refetchTrends } = useQuery<JournalTrendsResponse>({
    queryKey: trendsQueryKey,
    enabled: Boolean(adminId),
    queryFn: async () => {
      const url = new URL("/api/admin/journal/conversion-trends", getApiUrl());
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
  const trendsMap = useMemo(() => {
    const m = new Map<string, JournalTrendRow>();
    for (const t of (trendsData?.trends ?? [])) {
      m.set(t.slug, t);
    }
    return m;
  }, [trendsData]);

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

  const handleRefresh = () => {
    refetch();
    refetchTrends();
  };

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

  const renderRow = ({ item, index }: { item: JournalConversionRow; index: number }) => {
    const trend = trendsMap.get(item.slug);
    const hasTrend = trend && trend.buckets.length >= 2;

    return (
      <Animated.View entering={FadeInDown.delay(80 + index * 40).duration(350)}>
        <Pressable
          testID={`article-card-${item.slug}`}
          onPress={() => {
            if (hasTrend) setSelectedArticle(trend);
          }}
          style={({ pressed }) => ({ opacity: pressed && hasTrend ? 0.75 : 1 })}
        >
          <Card style={styles.card}>
            <View style={styles.titleRow}>
              <View style={styles.titleTextRow}>
                <ThemedText type="h4" testID={`stat-title-${item.slug}`}>
                  {item.title || item.slug}
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textTertiary }}>
                  {item.slug}
                </ThemedText>
              </View>
              {hasTrend ? (
                <Feather name="chevron-right" size={16} color={theme.textTertiary} />
              ) : null}
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

            {hasTrend ? (
              <View style={styles.sparklineContainer}>
                <View style={styles.sparklineLegend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: VIEWS_COLOR }]} />
                    <ThemedText type="caption" style={{ color: theme.textTertiary }}>Views</ThemedText>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: CTA_COLOR }]} />
                    <ThemedText type="caption" style={{ color: theme.textTertiary }}>CTA</ThemedText>
                  </View>
                </View>
                <Sparkline
                  width={240}
                  height={40}
                  series={[
                    {
                      values: trend.buckets.map((b) => b.views),
                      color: VIEWS_COLOR,
                      fillColor: VIEWS_COLOR,
                    },
                    {
                      values: trend.buckets.map((b) => b.ctaClicks),
                      color: CTA_COLOR,
                    },
                  ]}
                />
                <ThemedText type="caption" style={{ color: theme.textTertiary, marginTop: 2 }}>
                  Tap for full breakdown
                </ThemedText>
              </View>
            ) : null}
          </Card>
        </Pressable>
      </Animated.View>
    );
  };

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
    <>
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
        refreshControl={<RefreshControl refreshing={isLoading || trendsLoading} onRefresh={handleRefresh} />}
      />
      <ArticleDetailModal
        trend={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </>
  );
}

function ArticleDetailModal({
  trend,
  onClose,
}: {
  trend: JournalTrendRow | null;
  onClose: () => void;
}) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  if (!trend) return null;

  const bucketLabels = trend.buckets.map((b) => formatBucketLabel(b.label, trend.bucketSize));
  const maxViews = Math.max(...trend.buckets.map((b) => b.views), 1);

  const METRICS: { key: keyof TrendBucket; label: string; color: string }[] = [
    { key: "views", label: "Views", color: VIEWS_COLOR },
    { key: "ctaClicks", label: "CTA clicks", color: CTA_COLOR },
    { key: "createAccountChoices", label: "Create account", color: ACCOUNT_COLOR },
    { key: "guestEmails", label: "Guest emails", color: EMAIL_COLOR },
  ];

  return (
    <Modal
      visible
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.modalRoot, { backgroundColor: theme.backgroundRoot, paddingTop: insets.top + Spacing.lg }]}>
        <View style={styles.modalHeader}>
          <View style={styles.modalTitleBlock}>
            <ThemedText type="h3" numberOfLines={1}>{trend.title || trend.slug}</ThemedText>
            <ThemedText type="caption" style={{ color: theme.textTertiary }}>{trend.slug}</ThemedText>
          </View>
          <Pressable
            onPress={onClose}
            testID="modal-close"
            style={[styles.closeBtn, { backgroundColor: theme.backgroundSecondary }]}
          >
            <Feather name="x" size={18} color={theme.textSecondary} />
          </Pressable>
        </View>

        <ThemedText type="caption" style={{ color: theme.textTertiary, marginHorizontal: Spacing.lg, marginBottom: Spacing.lg }}>
          {trend.bucketSize === "day" ? "Daily" : trend.bucketSize === "week" ? "Weekly" : "Monthly"} breakdown — {trend.buckets.length} {trend.bucketSize === "day" ? "days" : trend.bucketSize === "week" ? "weeks" : "months"}
        </ThemedText>

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
            gap: Spacing.lg,
          }}
          showsVerticalScrollIndicator={false}
        >
          {METRICS.map((m) => {
            const values = trend.buckets.map((b) => b[m.key] as number);
            const total = values.reduce((s, v) => s + v, 0);
            if (total === 0) return null;

            return (
              <View key={m.key}>
                <View style={styles.metricHeader}>
                  <View style={[styles.metricDot, { backgroundColor: m.color }]} />
                  <ThemedText type="small" style={{ fontWeight: "600" }}>{m.label}</ThemedText>
                  <ThemedText type="caption" style={{ color: theme.textSecondary, marginLeft: "auto" }}>
                    {total} total
                  </ThemedText>
                </View>
                <Sparkline
                  width={320}
                  height={56}
                  showDots
                  series={[{ values, color: m.color, fillColor: m.color }]}
                />
                <View style={styles.bucketLabels}>
                  {bucketLabels.map((lbl, i) =>
                    i % Math.max(1, Math.ceil(bucketLabels.length / 6)) === 0 ? (
                      <ThemedText key={i} type="caption" style={{ color: theme.textTertiary, fontSize: 10 }}>
                        {lbl}
                      </ThemedText>
                    ) : null,
                  )}
                </View>
                <BarChart values={values} color={m.color} maxVal={maxViews} bucketLabels={bucketLabels} />
              </View>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

function BarChart({
  values,
  color,
  maxVal,
  bucketLabels,
}: {
  values: number[];
  color: string;
  maxVal: number;
  bucketLabels: string[];
}) {
  const { theme } = useTheme();
  const BAR_HEIGHT = 80;

  return (
    <View style={styles.barChart}>
      {values.map((v, i) => {
        const heightPct = maxVal > 0 ? v / maxVal : 0;
        return (
          <View key={i} style={styles.barColumn}>
            <ThemedText type="caption" style={{ color: theme.textSecondary, fontSize: 10, minWidth: 14, textAlign: "center" }}>
              {v > 0 ? v : ""}
            </ThemedText>
            <View style={[styles.barTrack, { height: BAR_HEIGHT, backgroundColor: theme.backgroundSecondary }]}>
              <View
                style={[
                  styles.barFill,
                  { height: BAR_HEIGHT * heightPct, backgroundColor: color, opacity: 0.8 },
                ]}
              />
            </View>
            <ThemedText type="caption" style={{ color: theme.textTertiary, fontSize: 9, textAlign: "center" }}>
              {bucketLabels[i]}
            </ThemedText>
          </View>
        );
      })}
    </View>
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
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  titleTextRow: {
    flex: 1,
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
  sparklineContainer: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.06)",
    gap: Spacing.xs,
  },
  sparklineLegend: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xs,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  modalRoot: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  modalTitleBlock: {
    flex: 1,
    gap: Spacing.xs,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  metricDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bucketLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
    marginBottom: Spacing.sm,
  },
  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    marginTop: Spacing.xs,
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  barTrack: {
    width: "100%",
    borderRadius: BorderRadius.xs,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    borderRadius: BorderRadius.xs,
  },
});
