import React, { useState } from "react";
import { StyleSheet, View, FlatList, RefreshControl, Linking, Pressable, Platform, ActivityIndicator } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
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

interface JournalLead {
  id: string;
  slug: string;
  title: string | null;
  email: string;
  source: string;
  createdAt: string;
}

export default function JournalLeadsScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user } = useAuth();

  const sessionToken = user?.sessionToken || null;
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExportCsv = async () => {
    if (!sessionToken || exporting) return;
    setExporting(true);
    setExportError(null);
    try {
      const url = new URL("/api/admin/journal-leads", getApiUrl());
      url.searchParams.set("format", "csv");
      const res = await fetch(url.toString(), {
        headers: { "x-session-token": sessionToken },
      });
      if (!res.ok) {
        throw new Error(`${res.status}: ${await res.text()}`);
      }
      const csv = await res.text();
      const stamp = new Date().toISOString().slice(0, 10);
      const filename = `journal-leads-${stamp}.csv`;

      if (Platform.OS === "web") {
        // Browser download via Blob + anchor click.
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(objectUrl);
      } else {
        const dir = FileSystem.cacheDirectory || FileSystem.documentDirectory;
        if (!dir) throw new Error("No writable directory available");
        const fileUri = `${dir}${filename}`;
        await FileSystem.writeAsStringAsync(fileUri, csv, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: "text/csv",
            dialogTitle: "Export Journal Leads",
            UTI: "public.comma-separated-values-text",
          });
        } else {
          setExportError(`Saved to ${fileUri}`);
        }
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setExportError(message);
    } finally {
      setExporting(false);
    }
  };

  const { data: leads = [], isLoading, refetch } = useQuery<JournalLead[]>({
    queryKey: ["/api/admin/journal-leads", sessionToken],
    queryFn: async () => {
      const url = new URL("/api/admin/journal-leads", getApiUrl()).toString();
      const res = await fetch(url, {
        headers: {
          "x-session-token": sessionToken!,
        },
      });
      if (!res.ok) {
        throw new Error(`${res.status}: ${await res.text()}`);
      }
      return res.json();
    },
    enabled: !!sessionToken,
  });

  const renderHeader = () => (
    <Animated.View entering={FadeInDown.duration(500)}>
      <View style={styles.welcomeSection}>
        <View style={{ flex: 1 }}>
          <ThemedText type="h2">Journal Leads</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }} testID="text-leads-count">
            {leads.length} captured
          </ThemedText>
        </View>
        <Pressable
          onPress={handleExportCsv}
          disabled={exporting || leads.length === 0}
          testID="button-export-csv"
          style={[
            styles.exportButton,
            {
              backgroundColor: theme.backgroundDefault,
              borderColor: theme.border,
              opacity: exporting || leads.length === 0 ? 0.5 : 1,
            },
          ]}
        >
          {exporting ? (
            <ActivityIndicator size="small" color={theme.text} />
          ) : (
            <Feather name="download" size={14} color={theme.text} />
          )}
          <ThemedText type="small">{exporting ? "Exporting..." : "Export CSV"}</ThemedText>
        </Pressable>
      </View>
      {exportError ? (
        <ThemedText
          type="caption"
          style={{ color: theme.error ?? theme.textSecondary, marginBottom: Spacing.md }}
          testID="text-export-error"
        >
          {exportError}
        </ThemedText>
      ) : null}
    </Animated.View>
  );

  const renderEmptyState = () => (
    <EmptyState
      image={require("../../assets/images/empty-projects.png")}
      title="No Leads Yet"
      description="Guest emails captured from Journal articles will appear here."
    />
  );

  const handleEmailPress = (email: string, title: string | null) => {
    const subject = title ? `Re: ${title}` : "Following up on your Journal interest";
    Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}`);
  };

  const renderLead = ({ item, index }: { item: JournalLead; index: number }) => (
    <Animated.View entering={FadeInDown.delay(100 + index * 50).duration(400)}>
      <Card style={styles.card} testID={`card-lead-${item.id}`}>
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <ThemedText type="h4">{item.title || item.slug}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              /journal/{item.slug}
            </ThemedText>
          </View>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
          </ThemedText>
        </View>

        <Card style={styles.emailRow} onPress={() => handleEmailPress(item.email, item.title)}>
          <View style={styles.emailContent}>
            <Feather name="mail" size={14} color={theme.link} />
            <ThemedText type="body" style={{ color: theme.link }} testID={`text-lead-email-${item.id}`}>
              {item.email}
            </ThemedText>
          </View>
          <Feather name="external-link" size={14} color={theme.textSecondary} />
        </Card>

        <View style={styles.metaRow}>
          <View style={[styles.badge, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <ThemedText type="caption">{item.source}</ThemedText>
          </View>
        </View>
      </Card>
    </Animated.View>
  );

  return (
    <FlatList
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
        flexGrow: 1,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      data={leads}
      keyExtractor={(item) => item.id}
      renderItem={renderLead}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={isLoading ? null : renderEmptyState}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  welcomeSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  card: { marginBottom: Spacing.md, padding: Spacing.lg },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  titleRow: { flex: 1, gap: Spacing.xs },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  emailContent: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.xs },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
});
