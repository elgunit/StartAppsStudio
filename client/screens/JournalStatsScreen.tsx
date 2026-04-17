import React, { useMemo, useState, useEffect } from "react";
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
  TextInput,
  Switch,
  ActivityIndicator,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeIn, FadeOut } from "react-native-reanimated";
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

interface ReportSchedule {
  id: string;
  frequency: string;
  recipientEmail: string;
  enabled: boolean;
  lastSentAt: string | null;
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

const COMPARE_A_VIEWS = "#3B82F6";
const COMPARE_A_CTA = "#10B981";
const COMPARE_B_VIEWS = "#F97316";
const COMPARE_B_CTA = "#EC4899";

function pct(numerator: number, denominator: number): string {
  if (!denominator) return "—";
  return `${Math.round((numerator / denominator) * 100)}%`;
}

function buildCsvContent(
  stats: JournalConversionRow[],
  rangeLabel: string,
  from: string | null,
  to: string | null,
  trends?: JournalTrendRow[],
): string {
  const escape = (val: string | number) => {
    const s = String(val);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };

  const fromStr = from ? new Date(from).toISOString().slice(0, 10) : "all";
  const toStr = to ? new Date(to).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);

  const summaryHeader = ["Range", "From", "To", "Slug", "Title", "Views", "CTA Clicks", "Create Account", "Open Contact", "Guest Emails"];
  const summaryRows = stats.map((r) => [
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

  const summarySection = [summaryHeader, ...summaryRows, totalRow]
    .map((row) => row.map(escape).join(","))
    .join("\n");

  if (!trends || trends.length === 0) return summarySection;

  const trendHeader = ["Slug", "Title", "Bucket", "Bucket Size", "Views", "CTA Clicks", "Create Account", "Open Contact", "Guest Emails"];
  const trendRows: (string | number)[][] = [];
  for (const t of trends) {
    for (const b of t.buckets) {
      trendRows.push([
        t.slug,
        t.title ?? t.slug,
        b.label,
        t.bucketSize,
        b.views,
        b.ctaClicks,
        b.createAccountChoices,
        b.openContactChoices,
        b.guestEmails,
      ]);
    }
  }

  const trendSection = [trendHeader, ...trendRows]
    .map((row) => row.map(escape).join(","))
    .join("\n");

  return `${summarySection}\n\n${trendSection}`;
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
  const [compareMode, setCompareMode] = useState(false);
  const [compareSelection, setCompareSelection] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const toggleCompareMode = () => {
    setCompareMode((prev) => {
      if (prev) {
        setCompareSelection([]);
        setShowCompare(false);
      }
      return !prev;
    });
  };

  const toggleCompareSelection = (slug: string) => {
    setCompareSelection((prev) => {
      if (prev.includes(slug)) {
        return prev.filter((s) => s !== slug);
      }
      if (prev.length >= 2) {
        return [prev[1], slug];
      }
      return [...prev, slug];
    });
  };

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
      const csv = buildCsvContent(stats, rangeLabel, data?.from ?? null, data?.to ?? null, trendsData?.trends);
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
        <View style={styles.headerActions}>
          <Pressable
            testID="button-compare-mode"
            onPress={toggleCompareMode}
            style={[
              styles.exportButton,
              { borderColor: compareMode ? theme.text : theme.border, backgroundColor: compareMode ? theme.text : theme.backgroundDefault },
            ]}
          >
            <Feather name="bar-chart-2" size={14} color={compareMode ? theme.backgroundRoot : theme.textSecondary} />
            <ThemedText type="caption" style={{ color: compareMode ? theme.backgroundRoot : theme.textSecondary }}>
              Compare
            </ThemedText>
          </Pressable>
          <Pressable
            testID="button-export-csv"
            onPress={handleExport}
            disabled={exporting || stats.length === 0 || trendsLoading}
            style={[
              styles.exportButton,
              { borderColor: theme.border, backgroundColor: theme.backgroundDefault },
              (exporting || stats.length === 0 || trendsLoading) && { opacity: 0.4 },
            ]}
          >
            <Feather name="download" size={14} color={theme.textSecondary} />
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              {exporting ? "Exporting..." : trendsLoading ? "Loading..." : "CSV"}
            </ThemedText>
          </Pressable>
        </View>
      </View>
      {compareMode ? (
        <View style={[styles.compareBanner, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
          <Feather name="info" size={13} color={theme.textSecondary} />
          <ThemedText type="caption" style={{ color: theme.textSecondary, flex: 1 }}>
            {compareSelection.length === 0
              ? "Select 2 articles to compare"
              : compareSelection.length === 1
              ? "Select 1 more article"
              : `${compareSelection.length} selected — ready to compare`}
          </ThemedText>
          {compareSelection.length === 2 ? (
            <Pressable
              testID="button-open-compare"
              onPress={() => setShowCompare(true)}
              style={[styles.compareGoBtn, { backgroundColor: theme.text }]}
            >
              <ThemedText type="caption" style={{ color: theme.backgroundRoot, fontWeight: "600" }}>
                Compare
              </ThemedText>
            </Pressable>
          ) : null}
        </View>
      ) : null}
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
      {user?.sessionToken ? <ScheduleReportCard sessionToken={user.sessionToken} /> : null}
    </Animated.View>
  );

  const renderRow = ({ item, index }: { item: JournalConversionRow; index: number }) => {
    const trend = trendsMap.get(item.slug);
    const hasTrend = trend && trend.buckets.length >= 2;
    const selectedIndex = compareSelection.indexOf(item.slug);
    const isSelected = selectedIndex !== -1;
    const isDisabled = compareMode && compareSelection.length === 2 && !isSelected;
    const selectedColor = selectedIndex === 0 ? COMPARE_A_VIEWS : COMPARE_B_VIEWS;

    return (
      <Animated.View entering={FadeInDown.delay(80 + index * 40).duration(350)}>
        <Pressable
          testID={`article-card-${item.slug}`}
          onPress={() => {
            if (compareMode) {
              toggleCompareSelection(item.slug);
            } else if (hasTrend) {
              setSelectedArticle(trend);
            }
          }}
          style={({ pressed }) => ({ opacity: pressed ? 0.75 : isDisabled ? 0.4 : 1 })}
        >
          <Card style={[styles.card, isSelected && { borderWidth: 2, borderColor: selectedColor }]}>
            <View style={styles.titleRow}>
              <View style={styles.titleTextRow}>
                <ThemedText type="h4" testID={`stat-title-${item.slug}`}>
                  {item.title || item.slug}
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textTertiary }}>
                  {item.slug}
                </ThemedText>
              </View>
              {compareMode ? (
                <View
                  testID={`compare-checkbox-${item.slug}`}
                  style={[
                    styles.compareCheckbox,
                    {
                      borderColor: isSelected ? selectedColor : theme.border,
                      backgroundColor: isSelected ? selectedColor : theme.backgroundDefault,
                    },
                  ]}
                >
                  {isSelected ? <Feather name="check" size={12} color="#fff" /> : null}
                </View>
              ) : hasTrend ? (
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

  const compareTrendA = compareSelection.length >= 1 ? trendsMap.get(compareSelection[0]) ?? null : null;
  const compareTrendB = compareSelection.length >= 2 ? trendsMap.get(compareSelection[1]) ?? null : null;
  const compareStatA = compareSelection.length >= 1 ? stats.find((s) => s.slug === compareSelection[0]) ?? null : null;
  const compareStatB = compareSelection.length >= 2 ? stats.find((s) => s.slug === compareSelection[1]) ?? null : null;

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
      <CompareModal
        visible={showCompare && compareSelection.length === 2}
        trendA={compareTrendA}
        trendB={compareTrendB}
        statA={compareStatA}
        statB={compareStatB}
        onClose={() => setShowCompare(false)}
      />
    </>
  );
}

function MetricSection({
  metricKey,
  label,
  color,
  values,
  total,
  bucketLabels,
  maxViews,
}: {
  metricKey: string;
  label: string;
  color: string;
  values: number[];
  total: number;
  bucketLabels: string[];
  maxViews: number;
}) {
  const { theme } = useTheme();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleSelect = (index: number) => {
    setSelectedIndex((prev) => (prev === index ? null : index));
  };

  return (
    <View>
      <View style={styles.metricHeader}>
        <View style={[styles.metricDot, { backgroundColor: color }]} />
        <ThemedText type="small" style={{ fontWeight: "600" }}>{label}</ThemedText>
        <ThemedText type="caption" style={{ color: theme.textSecondary, marginLeft: "auto" }}>
          {total} total
        </ThemedText>
      </View>

      {selectedIndex !== null ? (
        <Animated.View
          entering={FadeIn.duration(180).springify().damping(18).stiffness(220)}
          exiting={FadeOut.duration(140)}
          style={[styles.tooltip, { backgroundColor: color + "18", borderColor: color + "44" }]}
        >
          <ThemedText type="caption" style={{ color, fontWeight: "700", fontSize: 15 }}>
            {values[selectedIndex]}
          </ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}>
            {bucketLabels[selectedIndex]}
          </ThemedText>
          <Pressable onPress={() => setSelectedIndex(null)} style={styles.tooltipClose}>
            <Feather name="x" size={12} color={theme.textTertiary} />
          </Pressable>
        </Animated.View>
      ) : null}

      <Sparkline
        width={320}
        height={56}
        showDots
        series={[{ values, color, fillColor: color }]}
        onDotPress={handleSelect}
        selectedIndex={selectedIndex ?? undefined}
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
      <BarChart
        values={values}
        color={color}
        maxVal={maxViews}
        bucketLabels={bucketLabels}
        onBarPress={handleSelect}
        selectedIndex={selectedIndex ?? undefined}
      />
    </View>
  );
}

function CompareModal({
  visible,
  trendA,
  trendB,
  statA,
  statB,
  onClose,
}: {
  visible: boolean;
  trendA: JournalTrendRow | null;
  trendB: JournalTrendRow | null;
  statA: JournalConversionRow | null;
  statB: JournalConversionRow | null;
  onClose: () => void;
}) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  if (!trendA || !trendB || !statA || !statB) return null;

  const hasTrendDataA = trendA.buckets.length >= 2;
  const hasTrendDataB = trendB.buckets.length >= 2;

  const alignBuckets = (
    bucketsA: TrendBucket[],
    bucketsB: TrendBucket[],
  ): { labelsA: string[]; labelsB: string[]; viewsA: number[]; viewsB: number[]; ctaA: number[]; ctaB: number[] } => {
    return {
      labelsA: bucketsA.map((b) => formatBucketLabel(b.label, trendA.bucketSize)),
      labelsB: bucketsB.map((b) => formatBucketLabel(b.label, trendB.bucketSize)),
      viewsA: bucketsA.map((b) => b.views),
      viewsB: bucketsB.map((b) => b.views),
      ctaA: bucketsA.map((b) => b.ctaClicks),
      ctaB: bucketsB.map((b) => b.ctaClicks),
    };
  };

  const { viewsA, viewsB, ctaA, ctaB } = alignBuckets(trendA.buckets, trendB.buckets);

  const CHART_WIDTH = 300;
  const CHART_HEIGHT = 72;

  const metricsCompare: { label: string; valueA: number; valueB: number; subA?: string; subB?: string }[] = [
    { label: "Views", valueA: statA.views, valueB: statB.views },
    {
      label: "CTA clicks",
      valueA: statA.ctaClicks,
      valueB: statB.ctaClicks,
      subA: pct(statA.ctaClicks, statA.views),
      subB: pct(statB.ctaClicks, statB.views),
    },
    {
      label: "Create account",
      valueA: statA.createAccountChoices,
      valueB: statB.createAccountChoices,
      subA: pct(statA.createAccountChoices, statA.ctaClicks),
      subB: pct(statB.createAccountChoices, statB.ctaClicks),
    },
    {
      label: "Guest emails",
      valueA: statA.guestEmails,
      valueB: statB.guestEmails,
      subA: pct(statA.guestEmails, statA.ctaClicks),
      subB: pct(statB.guestEmails, statB.ctaClicks),
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.modalRoot, { backgroundColor: theme.backgroundRoot, paddingTop: insets.top + Spacing.lg }]}>
        <View style={styles.modalHeader}>
          <View style={styles.modalTitleBlock}>
            <ThemedText type="h3">Article Comparison</ThemedText>
            <ThemedText type="caption" style={{ color: theme.textTertiary }}>
              Side-by-side performance
            </ThemedText>
          </View>
          <Pressable
            onPress={onClose}
            testID="compare-modal-close"
            style={[styles.closeBtn, { backgroundColor: theme.backgroundSecondary }]}
          >
            <Feather name="x" size={18} color={theme.textSecondary} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
            gap: Spacing.lg,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.compareLegendRow, { borderColor: theme.border }]}>
            <View style={styles.compareLegendItem}>
              <View style={[styles.compareLegendSwatch, { backgroundColor: COMPARE_A_VIEWS }]} />
              <View style={{ flex: 1 }}>
                <ThemedText type="small" style={{ fontWeight: "600" }} numberOfLines={2}>
                  {trendA.title || trendA.slug}
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textTertiary }}>{trendA.slug}</ThemedText>
              </View>
            </View>
            <View style={[styles.compareLegendDivider, { backgroundColor: theme.border }]} />
            <View style={styles.compareLegendItem}>
              <View style={[styles.compareLegendSwatch, { backgroundColor: COMPARE_B_VIEWS }]} />
              <View style={{ flex: 1 }}>
                <ThemedText type="small" style={{ fontWeight: "600" }} numberOfLines={2}>
                  {trendB.title || trendB.slug}
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textTertiary }}>{trendB.slug}</ThemedText>
              </View>
            </View>
          </View>

          {hasTrendDataA && hasTrendDataB ? (
            <>
              <Card style={styles.compareChartCard}>
                <View style={styles.compareChartHeader}>
                  <ThemedText type="small" style={{ fontWeight: "600" }}>Views over time</ThemedText>
                  <View style={styles.compareChartLegend}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: COMPARE_A_VIEWS }]} />
                      <ThemedText type="caption" style={{ color: theme.textTertiary }}>A</ThemedText>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: COMPARE_B_VIEWS }]} />
                      <ThemedText type="caption" style={{ color: theme.textTertiary }}>B</ThemedText>
                    </View>
                  </View>
                </View>
                <Sparkline
                  width={CHART_WIDTH}
                  height={CHART_HEIGHT}
                  showDots={false}
                  series={[
                    { values: viewsA, color: COMPARE_A_VIEWS, fillColor: COMPARE_A_VIEWS },
                    { values: viewsB, color: COMPARE_B_VIEWS, fillColor: COMPARE_B_VIEWS },
                  ]}
                />
              </Card>

              <Card style={styles.compareChartCard}>
                <View style={styles.compareChartHeader}>
                  <ThemedText type="small" style={{ fontWeight: "600" }}>CTA clicks over time</ThemedText>
                  <View style={styles.compareChartLegend}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: COMPARE_A_CTA }]} />
                      <ThemedText type="caption" style={{ color: theme.textTertiary }}>A</ThemedText>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: COMPARE_B_CTA }]} />
                      <ThemedText type="caption" style={{ color: theme.textTertiary }}>B</ThemedText>
                    </View>
                  </View>
                </View>
                <Sparkline
                  width={CHART_WIDTH}
                  height={CHART_HEIGHT}
                  showDots={false}
                  series={[
                    { values: ctaA, color: COMPARE_A_CTA, fillColor: COMPARE_A_CTA },
                    { values: ctaB, color: COMPARE_B_CTA, fillColor: COMPARE_B_CTA },
                  ]}
                />
              </Card>
            </>
          ) : null}

          <Card style={styles.compareTableCard}>
            <View style={styles.compareTableHeader}>
              <ThemedText type="caption" style={[styles.compareTableMetricCol, { color: theme.textSecondary }]}>
                Metric
              </ThemedText>
              <View style={styles.compareTableValueCols}>
                <View style={styles.compareTableValueCol}>
                  <View style={[styles.compareLegendSwatchSmall, { backgroundColor: COMPARE_A_VIEWS }]} />
                  <ThemedText type="caption" style={{ color: theme.textSecondary }} numberOfLines={1}>
                    A
                  </ThemedText>
                </View>
                <View style={styles.compareTableValueCol}>
                  <View style={[styles.compareLegendSwatchSmall, { backgroundColor: COMPARE_B_VIEWS }]} />
                  <ThemedText type="caption" style={{ color: theme.textSecondary }} numberOfLines={1}>
                    B
                  </ThemedText>
                </View>
                <View style={[styles.compareTableValueCol, { minWidth: 52 }]}>
                  <ThemedText type="caption" style={{ color: theme.textSecondary }}>Winner</ThemedText>
                </View>
              </View>
            </View>

            <View style={[styles.compareTableDivider, { backgroundColor: theme.border }]} />

            {metricsCompare.map((m, i) => {
              const aWins = m.valueA > m.valueB;
              const bWins = m.valueB > m.valueA;
              const tie = m.valueA === m.valueB;
              return (
                <View key={m.label} style={[styles.compareTableRow, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border }]}>
                  <ThemedText type="caption" style={[styles.compareTableMetricCol, { color: theme.textSecondary }]}>
                    {m.label}
                  </ThemedText>
                  <View style={styles.compareTableValueCols}>
                    <View style={[styles.compareTableValueCol, aWins && styles.compareWinnerCell]}>
                      <ThemedText type="small" style={{ fontWeight: aWins ? "700" : "400" }}>
                        {m.valueA}
                      </ThemedText>
                      {m.subA ? (
                        <ThemedText type="caption" style={{ color: theme.textTertiary, fontSize: 10 }}>
                          {m.subA}
                        </ThemedText>
                      ) : null}
                    </View>
                    <View style={[styles.compareTableValueCol, bWins && styles.compareWinnerCell]}>
                      <ThemedText type="small" style={{ fontWeight: bWins ? "700" : "400" }}>
                        {m.valueB}
                      </ThemedText>
                      {m.subB ? (
                        <ThemedText type="caption" style={{ color: theme.textTertiary, fontSize: 10 }}>
                          {m.subB}
                        </ThemedText>
                      ) : null}
                    </View>
                    <View style={[styles.compareTableValueCol, { minWidth: 52 }]}>
                      {tie ? (
                        <ThemedText type="caption" style={{ color: theme.textTertiary }}>Tie</ThemedText>
                      ) : aWins ? (
                        <View style={[styles.winnerBadge, { backgroundColor: COMPARE_A_VIEWS + "22" }]}>
                          <ThemedText type="caption" style={{ color: COMPARE_A_VIEWS, fontWeight: "600", fontSize: 10 }}>A wins</ThemedText>
                        </View>
                      ) : (
                        <View style={[styles.winnerBadge, { backgroundColor: COMPARE_B_VIEWS + "22" }]}>
                          <ThemedText type="caption" style={{ color: COMPARE_B_VIEWS, fontWeight: "600", fontSize: 10 }}>B wins</ThemedText>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </Card>
        </ScrollView>
      </View>
    </Modal>
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
              <MetricSection
                key={m.key}
                metricKey={m.key}
                label={m.label}
                color={m.color}
                values={values}
                total={total}
                bucketLabels={bucketLabels}
                maxViews={maxViews}
              />
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
  onBarPress,
  selectedIndex,
}: {
  values: number[];
  color: string;
  maxVal: number;
  bucketLabels: string[];
  onBarPress?: (index: number) => void;
  selectedIndex?: number;
}) {
  const { theme } = useTheme();
  const BAR_HEIGHT = 80;

  return (
    <View style={styles.barChart}>
      {values.map((v, i) => {
        const heightPct = maxVal > 0 ? v / maxVal : 0;
        const isSelected = selectedIndex === i;
        return (
          <Pressable
            key={i}
            style={styles.barColumn}
            onPress={() => onBarPress?.(i)}
            testID={`bar-${i}`}
          >
            <ThemedText
              type="caption"
              style={{
                color: isSelected ? color : theme.textSecondary,
                fontSize: 10,
                minWidth: 14,
                textAlign: "center",
                fontWeight: isSelected ? "700" : "400",
              }}
            >
              {v > 0 ? v : ""}
            </ThemedText>
            <View
              style={[
                styles.barTrack,
                {
                  height: BAR_HEIGHT,
                  backgroundColor: isSelected ? color + "22" : theme.backgroundSecondary,
                  borderWidth: isSelected ? 1 : 0,
                  borderColor: isSelected ? color + "66" : "transparent",
                },
              ]}
            >
              <View
                style={[
                  styles.barFill,
                  { height: BAR_HEIGHT * heightPct, backgroundColor: color, opacity: isSelected ? 1 : 0.8 },
                ]}
              />
            </View>
            <ThemedText type="caption" style={{ color: isSelected ? color : theme.textTertiary, fontSize: 9, textAlign: "center", fontWeight: isSelected ? "600" : "400" }}>
              {bucketLabels[i]}
            </ThemedText>
          </Pressable>
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

function ScheduleReportCard({ sessionToken }: { sessionToken: string }) {
  const { theme } = useTheme();
  const [frequency, setFrequency] = useState<"weekly" | "monthly">("weekly");
  const [email, setEmail] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [savedOk, setSavedOk] = useState(false);

  const { data: schedule, isLoading, refetch } = useQuery<ReportSchedule | null>({
    queryKey: ["/api/admin/journal/report-schedule", sessionToken],
    queryFn: async () => {
      const url = new URL("/api/admin/journal/report-schedule", getApiUrl());
      const res = await fetch(url.toString(), {
        credentials: "include",
        headers: { "x-session-token": sessionToken },
      });
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
  });

  useEffect(() => {
    if (schedule) {
      setFrequency(schedule.frequency === "monthly" ? "monthly" : "weekly");
      setEmail(schedule.recipientEmail);
      setEnabled(schedule.enabled);
    }
  }, [schedule]);

  const authHeaders = { "x-session-token": sessionToken, "Content-Type": "application/json" };

  const handleSave = async () => {
    if (!email.trim()) {
      Alert.alert("Email required", "Enter a recipient email address.");
      return;
    }
    setSaving(true);
    setSavedOk(false);
    try {
      const url = new URL("/api/admin/journal/report-schedule", getApiUrl());
      const res = await fetch(url.toString(), {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ frequency, recipientEmail: email.trim(), enabled }),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `${res.status}`);
      }
      setSavedOk(true);
      refetch();
      setTimeout(() => setSavedOk(false), 2500);
    } catch (e: any) {
      Alert.alert("Save failed", e?.message || "Could not save schedule.");
    } finally {
      setSaving(false);
    }
  };

  const handleSendNow = async () => {
    if (!email.trim()) {
      Alert.alert("Email required", "Enter a recipient email address before sending.");
      return;
    }
    setSending(true);
    try {
      const url = new URL("/api/admin/journal/report-schedule/send-now", getApiUrl());
      const res = await fetch(url.toString(), {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ frequency, recipientEmail: email.trim() }),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `${res.status}`);
      }
      Alert.alert("Report sent", `A ${frequency} report was emailed to ${email.trim()}.`);
    } catch (e: any) {
      Alert.alert("Send failed", e?.message || "Could not send report. Check the Resend integration.");
    } finally {
      setSending(false);
    }
  };

  if (isLoading) return null;

  return (
    <Card style={styles.scheduleCard}>
      <View style={styles.scheduleHeader}>
        <View style={{ flex: 1 }}>
          <ThemedText type="h4">Scheduled Report</ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary, marginTop: 2 }}>
            Deliver a CSV report by email
          </ThemedText>
        </View>
        <Switch
          testID="toggle-schedule-enabled"
          value={enabled}
          onValueChange={setEnabled}
          thumbColor={enabled ? theme.text : theme.textTertiary}
          trackColor={{ false: theme.backgroundSecondary, true: theme.border }}
        />
      </View>

      <View style={[styles.freqRow, { opacity: enabled ? 1 : 0.45 }]} pointerEvents={enabled ? "auto" : "none"}>
        {(["weekly", "monthly"] as const).map((f) => (
          <Pressable
            key={f}
            testID={`freq-${f}`}
            onPress={() => setFrequency(f)}
            style={[
              styles.freqPill,
              { borderColor: theme.border, backgroundColor: theme.backgroundDefault },
              frequency === f && { backgroundColor: theme.text },
            ]}
          >
            <ThemedText
              type="caption"
              style={{ color: frequency === f ? theme.backgroundRoot : theme.textSecondary }}
            >
              {f === "weekly" ? "Weekly" : "Monthly"}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <TextInput
        testID="input-recipient-email"
        value={email}
        onChangeText={setEmail}
        placeholder="Recipient email"
        placeholderTextColor={theme.textTertiary}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={enabled}
        style={[
          styles.emailInput,
          {
            color: theme.text,
            borderColor: theme.border,
            backgroundColor: theme.backgroundDefault,
            opacity: enabled ? 1 : 0.45,
          },
        ]}
      />

      {schedule?.lastSentAt ? (
        <ThemedText type="caption" style={{ color: theme.textTertiary, marginTop: Spacing.xs }}>
          Last sent {new Date(schedule.lastSentAt).toLocaleDateString()}
        </ThemedText>
      ) : null}

      <View style={styles.scheduleActions}>
        <Pressable
          testID="button-send-now"
          onPress={handleSendNow}
          disabled={sending}
          style={[styles.sendNowBtn, { borderColor: theme.border, backgroundColor: theme.backgroundDefault, opacity: sending ? 0.5 : 1 }]}
        >
          {sending ? (
            <ActivityIndicator size="small" color={theme.textSecondary} />
          ) : (
            <Feather name="send" size={13} color={theme.textSecondary} />
          )}
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {sending ? "Sending..." : "Send now"}
          </ThemedText>
        </Pressable>

        <Pressable
          testID="button-save-schedule"
          onPress={handleSave}
          disabled={saving}
          style={[styles.saveBtn, { backgroundColor: theme.text, opacity: saving ? 0.6 : 1 }]}
        >
          {saving ? (
            <ActivityIndicator size="small" color={theme.backgroundRoot} />
          ) : (
            <Feather name={savedOk ? "check" : "save"} size={13} color={theme.backgroundRoot} />
          )}
          <ThemedText type="caption" style={{ color: theme.backgroundRoot }}>
            {savedOk ? "Saved" : saving ? "Saving..." : "Save"}
          </ThemedText>
        </Pressable>
      </View>
    </Card>
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
  scheduleCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  scheduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  freqRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  freqPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  emailInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 14,
  },
  scheduleActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  sendNowBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    flex: 1,
    justifyContent: "center",
  },
  tooltip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  tooltipClose: {
    marginLeft: "auto",
    padding: 4,
  },
  headerActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    alignItems: "center",
  },
  compareBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.md,
  },
  compareGoBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  compareCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  compareLegendRow: {
    flexDirection: "row",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  compareLegendItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  compareLegendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  compareLegendSwatchSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  compareLegendDivider: {
    width: StyleSheet.hairlineWidth,
  },
  compareChartCard: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  compareChartHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  compareChartLegend: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  compareTableCard: {
    padding: Spacing.lg,
    overflow: "hidden",
  },
  compareTableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: Spacing.sm,
  },
  compareTableDivider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: Spacing.xs,
  },
  compareTableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  compareTableMetricCol: {
    width: 90,
  },
  compareTableValueCols: {
    flex: 1,
    flexDirection: "row",
    gap: Spacing.sm,
  },
  compareTableValueCol: {
    flex: 1,
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 4,
    alignSelf: "center",
    flexWrap: "wrap",
  },
  compareWinnerCell: {
    opacity: 1,
  },
  winnerBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
});
