import React from "react";
import { StyleSheet, View, FlatList, RefreshControl } from "react-native";
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
import { ProjectCard } from "@/components/ProjectCard";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/lib/auth";
import { Spacing, BorderRadius } from "@/constants/theme";
import { formatDistanceToNow } from "date-fns";

export default function DesignerDashboardScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { user } = useAuth();

  const { data: projects = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ["/api/projects"],
  });

  const { data: activeSession } = useQuery({
    queryKey: ["/api/work-sessions/active"],
  });

  const activeProjects = projects.filter((p) => p.status !== "completed");
  const pendingReview = projects.filter((p) => p.status === "client_review");

  const renderHeader = () => (
    <Animated.View entering={FadeInDown.duration(500)}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <ThemedText type="h2">Projects</ThemedText>
        <View style={styles.stats}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {activeProjects.length} active
          </ThemedText>
          {pendingReview.length > 0 ? (
            <View style={[styles.reviewBadge, { backgroundColor: theme.warning + "20" }]}>
              <ThemedText type="caption" style={{ color: theme.warning }}>
                {pendingReview.length} pending review
              </ThemedText>
            </View>
          ) : null}
        </View>
      </View>

      {/* Active Session Card */}
      {activeSession ? (
        <Card
          style={styles.sessionCard}
          onPress={() => navigation.navigate("WorkSession")}
        >
          <View style={styles.sessionHeader}>
            <View style={[styles.liveIndicator, { backgroundColor: theme.success }]} />
            <ThemedText type="h4">Active Session</ThemedText>
          </View>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Working on a project - tap to view
          </ThemedText>
        </Card>
      ) : null}

      {/* AI Traffic shortcut */}
      <Card
        style={styles.aiTrafficCard}
        onPress={() => navigation.navigate("AiTraffic")}
        testID="card-ai-traffic"
      >
        <View style={styles.aiTrafficHeader}>
          <View style={[styles.aiIcon, { backgroundColor: theme.text }]}>
            <Feather name="cpu" size={16} color={theme.backgroundRoot} />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText type="h4">AI Assistant Traffic</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              See which AI assistants are visiting the site
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={18} color={theme.textTertiary} />
        </View>
      </Card>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <ThemedText type="h3">All Projects</ThemedText>
      </View>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <EmptyState
      image={require("../../assets/images/empty-projects.png")}
      title="No Projects Yet"
      description="Projects from clients will appear here."
    />
  );

  const renderProject = ({ item, index }: { item: any; index: number }) => (
    <Animated.View entering={FadeInDown.delay(100 + index * 50).duration(400)}>
      <ProjectCard
        name={item.name}
        description={item.description}
        status={item.status}
        currentHat={item.currentHat}
        isDesignerOnline={user?.isOnline || false}
        lastActivity={formatDistanceToNow(new Date(item.updatedAt), {
          addSuffix: true,
        })}
        onPress={() => navigation.navigate("ProjectDetail", { projectId: item.id })}
        testID={`card-project-${item.id}`}
      />
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
      data={projects}
      keyExtractor={(item) => item.id}
      renderItem={renderProject}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={isLoading ? null : renderEmptyState}
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
  stats: {
    alignItems: "flex-end",
    gap: Spacing.xs,
  },
  reviewBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  sessionCard: {
    marginBottom: Spacing.xl,
  },
  sessionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionHeader: {
    marginBottom: Spacing.lg,
  },
  aiTrafficCard: {
    marginBottom: Spacing.xl,
  },
  aiTrafficHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  aiIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
