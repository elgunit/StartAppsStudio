import React, { useEffect, useState } from "react";
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
import { Button } from "@/components/Button";
import { ProjectCard } from "@/components/ProjectCard";
import { OnlineIndicator } from "@/components/OnlineIndicator";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/lib/auth";
import { getApiUrl } from "@/lib/query-client";
import { Spacing } from "@/constants/theme";
import { formatDistanceToNow } from "date-fns";

export default function ClientDashboardScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { user, refreshUser } = useAuth();

  const { data: projects = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ["/api/projects", `?clientId=${user?.id}`],
    enabled: !!user,
  });

  const { data: designer } = useQuery({
    queryKey: ["/api/designer"],
  });

  useEffect(() => {
    refreshUser();
  }, []);

  const activeProjects = projects.filter(
    (p) => p.status !== "completed"
  );

  const renderHeader = () => (
    <Animated.View entering={FadeInDown.duration(500)}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <View>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            Welcome back,
          </ThemedText>
          <ThemedText type="h2">{user?.name || "Guest"}</ThemedText>
        </View>
        <OnlineIndicator isOnline={designer?.isOnline || false} />
      </View>

      {/* Credits Card */}
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

      {/* Active Projects Header */}
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
        isDesignerOnline={designer?.isOnline || false}
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
      data={activeProjects}
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
  creditsCard: {
    marginBottom: Spacing.xl,
  },
  creditsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
});
