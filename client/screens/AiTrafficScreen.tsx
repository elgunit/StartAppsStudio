import React, { useMemo, useState } from "react";
import { StyleSheet, View, FlatList, RefreshControl, Pressable } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { formatDistanceToNow } from "date-fns";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/lib/auth";
import { getApiUrl } from "@/lib/query-client";
import { Spacing, BorderRadius } from "@/constants/theme";

interface AiTrafficStatRow {
  botName: string;
  hits: number;
  verifiedHits: number;
  unverifiableHits: number;
  spoofedHits: number;
  uniquePages: number;
  topPagePath: string | null;
  lastSeenAt: string | null;
}

interface AiTrafficHit {
  id: string;
  botName: string;
  pagePath: string;
  userAgent: string | null;
  referrerUrl: string | null;
  verification: "verified" | "spoofed" | "unverifiable";
  createdAt: string;
}

interface AiTrafficResponse {
  from: string | null;
  to: string | null;
  totalHits: number;
  verifiedHits: number;
  unverifiableHits: number;
  spoofedHits: number;
  stats: AiTrafficStatRow[];
  recent: AiTrafficHit[];
  verification?: {
    lastRefreshAt: string | null;
    lastError: string | null;
    botRangeCounts: Record<string, number>;
  };
}

type RangeKey = "7d" | "30d" | "90d" | "all";

const RANGE_OPTIONS: { key: RangeKey; label: string; days: number | null }[] = [
  { key: "7d", label: "7d", days: 7 },
  { key: "30d", label: "30d", days: 30 },
  { key: "90d", label: "90d", days: 90 },
  { key: "all", label: "All", days: null },
];

export default function AiTrafficScreen() {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user } = useAuth();
  const sessionToken = user?.sessionToken || null;
  const [range, setRange] = useState<RangeKey>("7d");

  const fromDate = useMemo(() => {
    const opt = RANGE_OPTIONS.find((r) => r.key === range);
    if (!opt || opt.days === null) return null;
    const d = new Date();
    d.setDate(d.getDate() - opt.days);
    return d;
  }, [range]);

  const { data, isLoading, refetch, isError } = useQuery<AiTrafficResponse>({
    queryKey: ["/api/admin/ai-traffic", range, sessionToken],
    enabled: Boolean(sessionToken),
    queryFn: async () => {
      const url = new URL("/api/admin/ai-traffic", getApiUrl());
      if (fromDate) url.searchParams.set("from", fromDate.toISOString());
      url.searchParams.set("limit", "25");
      const res = await fetch(url.toString(), {
        headers: { "x-session-token": sessionToken! },
      });
      if (!res.ok) {
        throw new Error(`${res.status}: ${await res.text()}`);
      }
      return res.json();
    },
  });

  const stats = useMemo(
    () => [...(data?.stats ?? [])].sort((a, b) => b.hits - a.hits),
    [data],
  );
  const recent = data?.recent ?? [];
  const totalHits = data?.totalHits ?? 0;
  const verifiedHits = data?.verifiedHits ?? 0;
  const spoofedHits = data?.spoofedHits ?? 0;
  const uniqueBots = stats.length;
  const totalPages = useMemo(() => {
    const s = new Set<string>();
    for (const r of recent) s.add(r.pagePath);
    for (const st of stats) if (st.topPagePath) s.add(st.topPagePath);
    return s.size;
  }, [recent, stats]);

  const renderRangePicker = () => (
    <View
      style={[
        styles.rangeRow,
        { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
      ]}
    >
      {RANGE_OPTIONS.map((opt) => {
        const active = opt.key === range;
        return (
          <Pressable
            key={opt.key}
            testID={`range-${opt.key}`}
            onPress={() => setRange(opt.key)}
            style={[styles.rangePill, active && { backgroundColor: theme.text }]}
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
          <ThemedText type="h2">AI Traffic</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {uniqueBots} {uniqueBots === 1 ? "assistant" : "assistants"}
          </ThemedText>
        </View>
      </View>
      {renderRangePicker()}
      <Card style={styles.totalsCard}>
        <ThemedText
          type="caption"
          style={{ color: theme.textSecondary, marginBottom: Spacing.sm }}
        >
          Totals in range
        </ThemedText>
        <View style={styles.totalsGrid}>
          <Totals label="Hits" value={totalHits} testID="totals-hits" />
          <Totals label="Assistants" value={uniqueBots} testID="totals-assistants" />
          <Totals label="Pages" value={totalPages} testID="totals-pages" />
        </View>
        <View style={styles.spoofRow}>
          <Feather
            name={spoofedHits > 0 ? "alert-triangle" : "shield"}
            size={13}
            color={spoofedHits > 0 ? "#c2410c" : theme.textTertiary}
          />
          <ThemedText
            type="caption"
            style={{ color: theme.textSecondary }}
            testID="text-spoof-summary"
          >
            {verifiedHits} verified by IP
            {spoofedHits > 0
              ? ` · ${spoofedHits} suspected spoof${spoofedHits === 1 ? "" : "s"} excluded`
              : " · no suspected spoofs"}
          </ThemedText>
        </View>
      </Card>
      <View style={styles.sectionHeader}>
        <ThemedText type="h3">Top assistants</ThemedText>
      </View>
    </Animated.View>
  );

  const renderRow = ({ item, index }: { item: AiTrafficStatRow; index: number }) => (
    <Animated.View entering={FadeInDown.delay(80 + index * 40).duration(350)}>
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <ThemedText type="h4" testID={`ai-bot-name-${item.botName}`}>
              {item.botName}
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textTertiary }}>
              {item.lastSeenAt
                ? `Last seen ${formatDistanceToNow(new Date(item.lastSeenAt), {
                    addSuffix: true,
                  })}`
                : "No recent activity"}
            </ThemedText>
          </View>
          <View
            style={[styles.hitsBadge, { backgroundColor: theme.text }]}
          >
            <ThemedText
              type="caption"
              style={{ color: theme.backgroundRoot, fontWeight: "600" }}
              testID={`ai-bot-hits-${item.botName}`}
            >
              {item.hits} {item.hits === 1 ? "hit" : "hits"}
            </ThemedText>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Feather name="file-text" size={13} color={theme.textSecondary} />
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              {item.uniquePages} {item.uniquePages === 1 ? "page" : "pages"}
            </ThemedText>
          </View>
          {item.verifiedHits > 0 ? (
            <View style={styles.metaItem}>
              <Feather name="shield" size={13} color="#15803d" />
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                {item.verifiedHits} verified
              </ThemedText>
            </View>
          ) : null}
          {item.spoofedHits > 0 ? (
            <View style={styles.metaItem}>
              <Feather name="alert-triangle" size={13} color="#c2410c" />
              <ThemedText
                type="caption"
                style={{ color: "#c2410c" }}
                testID={`ai-bot-spoofed-${item.botName}`}
              >
                {item.spoofedHits} spoofed
              </ThemedText>
            </View>
          ) : null}
        </View>

        {item.topPagePath ? (
          <View style={[styles.topPageBox, { backgroundColor: theme.backgroundRoot }]}>
            <ThemedText
              type="caption"
              style={{ color: theme.textTertiary, marginBottom: 2 }}
            >
              Top page
            </ThemedText>
            <ThemedText
              type="body"
              numberOfLines={1}
              testID={`ai-bot-toppage-${item.botName}`}
            >
              {item.topPagePath}
            </ThemedText>
          </View>
        ) : null}
      </Card>
    </Animated.View>
  );

  const renderFooter = () => {
    if (recent.length === 0) return null;
    return (
      <Animated.View entering={FadeInDown.duration(400)} style={{ marginTop: Spacing.lg }}>
        <View style={styles.sectionHeader}>
          <ThemedText type="h3">Recent hits</ThemedText>
        </View>
        <Card style={styles.card}>
          {recent.slice(0, 15).map((hit, i) => (
            <View
              key={hit.id}
              style={[
                styles.recentRow,
                i < Math.min(recent.length, 15) - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: theme.border,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <ThemedText type="body" numberOfLines={1}>
                  {hit.botName}
                </ThemedText>
                <ThemedText
                  type="caption"
                  style={{ color: theme.textTertiary }}
                  numberOfLines={1}
                >
                  {hit.pagePath}
                </ThemedText>
              </View>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                {formatDistanceToNow(new Date(hit.createdAt), { addSuffix: true })}
              </ThemedText>
            </View>
          ))}
        </Card>
      </Animated.View>
    );
  };

  const renderEmpty = () => (
    <EmptyState
      image={require("../../assets/images/empty-projects.png")}
      title={isError ? "Couldn't load AI traffic" : "No AI traffic yet"}
      description={
        isError
          ? "Try refreshing. If this keeps happening, check the server logs."
          : "Once AI assistants like GPTBot or ClaudeBot visit the site, they'll show up here."
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
      keyExtractor={(item) => item.botName}
      renderItem={renderRow}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={isLoading ? null : renderEmpty}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
    />
  );
}

function Totals({
  label,
  value,
  testID,
}: {
  label: string;
  value: number;
  testID?: string;
}) {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <ThemedText type="caption" style={{ color: theme.textTertiary }}>
        {label}
      </ThemedText>
      <ThemedText type="h3" testID={testID}>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  rangeRow: {
    flexDirection: "row",
    padding: 4,
    borderRadius: BorderRadius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignSelf: "flex-start",
    gap: 4,
    marginBottom: Spacing.lg,
  },
  rangePill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  totalsCard: {
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
  },
  totalsGrid: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  spoofRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: Spacing.md,
  },
  sectionHeader: {
    marginBottom: Spacing.md,
  },
  card: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  hitsBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  metaRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  topPageBox: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
});
