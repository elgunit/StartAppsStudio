import React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { StatusBadge } from "@/components/StatusBadge";
import { OnlineIndicator } from "@/components/OnlineIndicator";
import { HatIcon } from "@/components/HatBadge";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/lib/auth";
import { Spacing, BorderRadius } from "@/constants/theme";

type RootStackParamList = {
  ProjectDetail: { projectId: string };
};

export default function ProjectDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "ProjectDetail">>();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { user } = useAuth();

  const { projectId } = route.params;

  const { data: project, isLoading } = useQuery({
    queryKey: ["/api/projects", projectId],
    enabled: !!projectId,
  });

  const { data: designer } = useQuery({
    queryKey: ["/api/designer"],
  });

  if (isLoading || !project) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText>Loading...</ThemedText>
      </View>
    );
  }

  const isDesigner = user?.role === "designer";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: insets.bottom + Spacing["4xl"],
        paddingHorizontal: Spacing.lg,
      }}
    >
      {/* Header Section */}
      <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
        <View style={styles.titleRow}>
          <ThemedText type="h1" style={styles.title}>
            {project.name}
          </ThemedText>
          {project.currentHat ? <HatIcon type={project.currentHat} size={28} /> : null}
        </View>
        <View style={styles.statusRow}>
          <StatusBadge status={project.status} />
          <OnlineIndicator isOnline={designer?.isOnline || false} />
        </View>
      </Animated.View>

      {/* Description */}
      <Animated.View entering={FadeInDown.delay(100).duration(500)}>
        <Card style={styles.descriptionCard}>
          <ThemedText type="h4" style={styles.cardTitle}>
            Project Brief
          </ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            {project.description}
          </ThemedText>
        </Card>
      </Animated.View>

      {/* Expertise Hats */}
      {project.hats?.length > 0 ? (
        <Animated.View entering={FadeInDown.delay(150).duration(500)}>
          <Card style={styles.hatsCard}>
            <ThemedText type="h4" style={styles.cardTitle}>
              Expertise Required
            </ThemedText>
            <View style={styles.hatsRow}>
              {project.hats.map((hat: string, index: number) => (
                <View
                  key={index}
                  style={[
                    styles.hatBadge,
                    {
                      backgroundColor: theme.backgroundDefault,
                      borderColor: project.currentHat === hat ? theme.text : theme.border,
                    },
                  ]}
                >
                  <HatIcon type={hat as any} size={20} />
                  <ThemedText type="caption">{hat}</ThemedText>
                </View>
              ))}
            </View>
          </Card>
        </Animated.View>
      ) : null}

      {/* Work Progress */}
      <Animated.View entering={FadeInDown.delay(200).duration(500)}>
        <Card style={styles.progressCard}>
          <ThemedText type="h4" style={styles.cardTitle}>
            Work Progress
          </ThemedText>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Feather name="clock" size={20} color={theme.textSecondary} />
              <ThemedText type="h3">{project.totalWorkTime || 0}</ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                minutes
              </ThemedText>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.stat}>
              <Feather name="zap" size={20} color={theme.textSecondary} />
              <ThemedText type="h3">{project.totalPrompts || 0}</ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                prompts
              </ThemedText>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.stat}>
              <Feather name="layers" size={20} color={theme.textSecondary} />
              <ThemedText type="h3">{project.versions?.length || 0}</ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                versions
              </ThemedText>
            </View>
          </View>
        </Card>
      </Animated.View>

      {/* Preview Section */}
      {project.previewUrl ? (
        <Animated.View entering={FadeInDown.delay(250).duration(500)}>
          <Card style={styles.previewCard}>
            <ThemedText type="h4" style={styles.cardTitle}>
              Latest Preview
            </ThemedText>
            <View style={[styles.previewPlaceholder, { backgroundColor: theme.backgroundDefault }]}>
              <Feather name="eye" size={32} color={theme.textSecondary} />
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                Preview Available
              </ThemedText>
            </View>
            <Button
              variant="outline"
              onPress={() => {}}
              style={styles.previewButton}
            >
              Open Preview
            </Button>
          </Card>
        </Animated.View>
      ) : null}

      {/* Action Buttons */}
      <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.actions}>
        <Button
          onPress={() => navigation.navigate("Chat", { projectId })}
          style={styles.actionButton}
          testID="button-open-chat"
        >
          Open Chat
        </Button>

        {isDesigner ? (
          <Button
            variant="outline"
            onPress={() => navigation.navigate("WorkSession", { projectId })}
            style={styles.actionButton}
            testID="button-start-work"
          >
            Start Working
          </Button>
        ) : null}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  title: {
    flex: 1,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  descriptionCard: {
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    marginBottom: Spacing.md,
  },
  hatsCard: {
    marginBottom: Spacing.lg,
  },
  hatsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  hatBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  progressCard: {
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  stat: {
    alignItems: "center",
    gap: Spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  previewCard: {
    marginBottom: Spacing.lg,
  },
  previewPlaceholder: {
    height: 200,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  previewButton: {},
  actions: {
    gap: Spacing.md,
  },
  actionButton: {},
});
