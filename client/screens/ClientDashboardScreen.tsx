import React, { useEffect } from "react";
import { StyleSheet, View, FlatList, RefreshControl, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { ProjectCard } from "@/components/ProjectCard";
import { journalAccentColor, type JournalPostSummary } from "@/lib/journal";
import { OnlineIndicator } from "@/components/OnlineIndicator";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/lib/auth";
import { Spacing, BorderRadius } from "@/constants/theme";
import { formatDistanceToNow } from "date-fns";

export default function ClientDashboardScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { user, refreshUser } = useAuth();

  const { data: projects = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ["/api/projects", `?clientId=${user?.id}`],
    enabled: !!user,
  });

  const { data: designer } = useQuery({
    queryKey: ["/api/designer"],
  });

  const { data: journalData } = useQuery<{ posts: JournalPostSummary[] }>({
    queryKey: ["/api/journal/posts"],
  });
  const journalPreview = (journalData?.posts ?? []).slice(0, 2);

  useEffect(() => {
    refreshUser();
  }, []);

  const activeProjects = projects.filter(
    (p) => p.status !== "completed"
  );
  const completedProjects = projects.filter(
    (p) => p.status === "completed"
  );

  const renderHeader = () => (
    <Animated.View entering={FadeInDown.duration(500)}>
      <View style={styles.welcomeSection}>
        <View>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            Welcome back,
          </ThemedText>
          <ThemedText type="h2">{user?.name || "Guest"}</ThemedText>
        </View>
        <OnlineIndicator isOnline={designer?.isOnline || false} />
      </View>

      <Card style={styles.creditsCard}>
        <View style={styles.creditsHeader}>
          <View>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Available Credits
            </ThemedText>
            <ThemedText type="display">{user?.credits || 0}</ThemedText>
          </View>
          <Button
            variant="outline"
            size="sm"
            onPress={() => navigation.navigate("Credits")}
            testID="button-add-credits"
          >
            Add Credits
          </Button>
        </View>
      </Card>

      <Pressable
        onPress={() => navigation.navigate("NewProject")}
        testID="button-new-project"
        style={({ pressed }) => [
          styles.newProjectButton,
          {
            backgroundColor: isDark ? "#FFFFFF" : "#000000",
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Feather name="plus" size={18} color={isDark ? "#000000" : "#FFFFFF"} />
        <ThemedText
          type="body"
          style={{
            color: isDark ? "#000000" : "#FFFFFF",
            fontWeight: "600",
          }}
        >
          Start New Project
        </ThemedText>
      </Pressable>

      <View style={styles.sectionHeader}>
        <ThemedText type="h3">Active Projects</ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {activeProjects.length} project{activeProjects.length !== 1 ? "s" : ""}
        </ThemedText>
      </View>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <EmptyState
      image={require("../../assets/images/empty-projects.png")}
      title="No Projects Yet"
      description="Start your first project and bring your MVP vision to life."
      actionLabel="Start New Project"
      onAction={() => navigation.navigate("NewProject")}
    />
  );

  const renderProject = ({ item, index }: { item: any; index: number }) => (
    <Animated.View entering={FadeInDown.delay(100 + index * 50).duration(400)}>
      <ProjectCard
        name={item.name}
        description={item.description}
        status={item.status}
        currentHat={item.currentHat}
        planTier={item.planTier}
        estimatedCredits={item.estimatedCredits}
        usedCredits={item.usedCredits}
        lastActivity={formatDistanceToNow(new Date(item.updatedAt), {
          addSuffix: true,
        })}
        onPress={() => navigation.navigate("ProjectDetail", { projectId: item.id })}
        testID={`card-project-${item.id}`}
      />
    </Animated.View>
  );

  const renderJournalSection = () => {
    if (journalPreview.length === 0) return null;
    return (
      <View style={{ marginTop: Spacing.lg }} testID="section-journal-preview">
        <View style={styles.sectionHeader}>
          <ThemedText type="h3">From the Journal</ThemedText>
          <Pressable
            onPress={() => navigation.navigate("JournalList")}
            testID="button-journal-see-all"
          >
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              See all
            </ThemedText>
          </Pressable>
        </View>
        {journalPreview.map((post, index) => (
          <Animated.View
            key={post.slug}
            entering={FadeInDown.delay(100 + index * 50).duration(400)}
            style={styles.journalCardWrap}
          >
            <Card
              testID={`card-journal-${post.slug}`}
              onPress={() =>
                navigation.navigate("JournalArticle", { slug: post.slug })
              }
              style={styles.journalCard}
            >
              <View
                style={[
                  styles.journalAccentStripe,
                  { backgroundColor: journalAccentColor(post.slug) },
                ]}
              />
              <View style={styles.journalCardBody}>
                <ThemedText type="caption" style={{ color: theme.textTertiary }}>
                  {new Date(post.publishedAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  · {post.readMinutes} min read
                </ThemedText>
                <ThemedText type="h3" style={{ marginTop: Spacing.xs }}>
                  {post.title}
                </ThemedText>
                <ThemedText
                  type="small"
                  style={{ color: theme.textSecondary, marginTop: Spacing.sm }}
                  numberOfLines={3}
                >
                  {post.excerpt}
                </ThemedText>
              </View>
            </Card>
          </Animated.View>
        ))}
      </View>
    );
  };

  const renderFooter = () => {
    return (
      <View>
        {completedProjects.length > 0 ? (
          <View>
            <View style={[styles.sectionHeader, { marginTop: Spacing.lg }]}>
              <ThemedText type="h3">Completed</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {completedProjects.length} project
                {completedProjects.length !== 1 ? "s" : ""}
              </ThemedText>
            </View>
            {completedProjects.map((item, index) => (
              <Animated.View
                key={item.id}
                entering={FadeInDown.delay(100 + index * 50).duration(400)}
              >
                <ProjectCard
                  name={item.name}
                  description={item.description}
                  status={item.status}
                  planTier={item.planTier}
                  estimatedCredits={item.estimatedCredits}
                  usedCredits={item.usedCredits}
                  lastActivity={formatDistanceToNow(new Date(item.updatedAt), {
                    addSuffix: true,
                  })}
                  onPress={() =>
                    navigation.navigate("ProjectDetail", { projectId: item.id })
                  }
                  testID={`card-project-${item.id}`}
                />
              </Animated.View>
            ))}
          </View>
        ) : null}
        {renderJournalSection()}
      </View>
    );
  };

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
      data={activeProjects}
      keyExtractor={(item) => item.id}
      renderItem={renderProject}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={isLoading ? null : renderEmptyState}
      ListFooterComponent={renderFooter}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.xl,
  },
  creditsCard: {
    marginBottom: Spacing.lg,
  },
  creditsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  newProjectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  journalCardWrap: { marginBottom: Spacing.lg },
  journalCard: { padding: 0, overflow: "hidden" },
  journalAccentStripe: { height: 4, width: "100%" },
  journalCardBody: { padding: Spacing.lg },
});
