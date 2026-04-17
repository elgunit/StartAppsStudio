import React from "react";
import { StyleSheet, View, Image, ActivityIndicator, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import {
  resolveAssetUrl,
  formatJournalDate as formatDate,
  type JournalPostSummary,
} from "@/lib/journal";

export type { JournalPostSummary };
export { resolveAssetUrl };

export default function JournalListScreen() {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const { data, isLoading, isError, refetch, isRefetching } = useQuery<{
    posts: JournalPostSummary[];
  }>({
    queryKey: ["/api/journal/posts"],
  });

  const posts = data?.posts ?? [];

  if (isLoading) {
    return (
      <View
        style={[
          styles.center,
          { backgroundColor: theme.backgroundRoot, paddingTop: headerHeight },
        ]}
      >
        <ActivityIndicator color={theme.text} />
      </View>
    );
  }

  if (isError) {
    return (
      <View
        style={[
          styles.center,
          { backgroundColor: theme.backgroundRoot, paddingTop: headerHeight },
        ]}
      >
        <ThemedText type="body">Couldn't load the Journal.</ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList<JournalPostSummary>
        data={posts}
        keyExtractor={(item) => item.slug}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        onRefresh={refetch}
        refreshing={isRefetching}
        ListHeaderComponent={
          <View style={styles.intro}>
            <ThemedText type="h1">Journal</ThemedText>
            <ThemedText
              type="body"
              style={{ color: theme.textSecondary, marginTop: Spacing.xs }}
            >
              Field notes from Start Apps Studio on shipping MVPs that rank.
            </ThemedText>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <Card
              testID={`card-journal-${item.slug}`}
              onPress={() =>
                navigation.navigate("JournalArticle", { slug: item.slug })
              }
              style={styles.card}
            >
              <Image
                source={{ uri: resolveAssetUrl(item.heroImage) }}
                style={[styles.hero, { backgroundColor: theme.backgroundSecondary }]}
                resizeMode="cover"
                accessibilityLabel={item.heroAlt}
              />
              <View style={styles.cardBody}>
                <ThemedText type="caption" style={{ color: theme.textTertiary }}>
                  {formatDate(item.publishedAt)} · {item.readMinutes} min read
                </ThemedText>
                <ThemedText type="h3" style={{ marginTop: Spacing.xs }}>
                  {item.title}
                </ThemedText>
                <ThemedText
                  type="small"
                  style={{ color: theme.textSecondary, marginTop: Spacing.sm }}
                  numberOfLines={3}
                >
                  {item.excerpt}
                </ThemedText>
                {item.tags.length > 0 ? (
                  <View style={styles.tagRow}>
                    {item.tags.slice(0, 4).map((tag) => (
                      <View
                        key={tag}
                        style={[
                          styles.tag,
                          { backgroundColor: theme.backgroundSecondary },
                        ]}
                      >
                        <ThemedText
                          type="caption"
                          style={{ color: theme.textSecondary }}
                        >
                          {tag}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            </Card>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  intro: { marginBottom: Spacing.lg },
  cardWrap: { marginBottom: Spacing.lg },
  card: { padding: 0, overflow: "hidden" },
  hero: { width: "100%", height: 180 },
  cardBody: { padding: Spacing.lg },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
});
