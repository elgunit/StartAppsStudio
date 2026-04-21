import React, { useState } from "react";
import { StyleSheet, View, ScrollView, Modal, Pressable } from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { StatusBadge } from "@/components/StatusBadge";
import { OnlineIndicator } from "@/components/OnlineIndicator";
import { HAT_META } from "@/components/HatBadge";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/query-client";
import { Spacing, BorderRadius } from "@/constants/theme";

type RootStackParamList = {
  ProjectDetail: { projectId: string };
};

type HatType = keyof typeof HAT_META;

export default function ProjectDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "ProjectDetail">>();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [confirmCancel, setConfirmCancel] = useState(false);

  const { projectId } = route.params;

  const { data: project, isLoading } = useQuery({
    queryKey: ["/api/projects", projectId],
    enabled: !!projectId,
  });

  const { data: designer } = useQuery({
    queryKey: ["/api/designer"],
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/projects/${projectId}`);
      return res.json();
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setConfirmCancel(false);
      // Always land back on the dashboard tab, regardless of how the user
      // got to this detail screen.
      navigation.navigate("ClientMain" as never, { screen: "Dashboard" } as never);
    },
    onError: (err: unknown) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setConfirmCancel(false);
      const message = err instanceof Error ? err.message : String(err);
      Alert.alert(
        "Couldn't cancel project",
        /^4\d\d:/.test(message)
          ? message.replace(/^4\d\d:\s*/, "").replace(/^\{.*"error"\s*:\s*"([^"]+)".*\}$/, "$1")
          : "Something went wrong cancelling that project. Please try again.",
      );
    },
  });

  if (isLoading || !project) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText>Loading...</ThemedText>
      </View>
    );
  }

  const isDesigner = user?.role === "designer";
  const canCancel = !isDesigner && project.status !== "completed";

  const currentHatMeta = project.currentHat ? HAT_META[project.currentHat as HatType] : null;

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
          {currentHatMeta ? (
            <View
              style={[
                styles.titleHatBadge,
                { backgroundColor: currentHatMeta.color + "22" },
              ]}
            >
              <Feather name={currentHatMeta.icon} size={16} color={currentHatMeta.color} />
            </View>
          ) : null}
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
              {project.hats.map((hat: HatType, index: number) => {
                const meta = HAT_META[hat];
                if (!meta) return null;
                const isActive = project.currentHat === hat;
                return (
                  <View
                    key={index}
                    style={[
                      styles.hatChip,
                      {
                        backgroundColor: isActive
                          ? meta.color + "1F"
                          : theme.backgroundDefault,
                        borderColor: isActive ? meta.color : theme.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.hatChipIcon,
                        { backgroundColor: meta.color + "22" },
                      ]}
                    >
                      <Feather name={meta.icon} size={16} color={meta.color} />
                    </View>
                    <View style={styles.hatChipText}>
                      <ThemedText
                        type="caption"
                        style={{
                          fontWeight: "600",
                          color: isActive ? meta.color : theme.text,
                        }}
                      >
                        {meta.label}
                      </ThemedText>
                      <ThemedText
                        type="caption"
                        style={{ color: theme.textTertiary, fontSize: 10 }}
                      >
                        {meta.title}
                      </ThemedText>
                    </View>
                  </View>
                );
              })}
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

        {canCancel ? (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setConfirmCancel(true);
            }}
            testID="button-cancel-project"
            style={({ pressed }) => [
              styles.cancelButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Feather name="x-circle" size={16} color={theme.error} />
            <ThemedText type="small" style={{ color: theme.error, fontWeight: "600" }}>
              Cancel project
            </ThemedText>
          </Pressable>
        ) : null}
      </Animated.View>

      {/* Cancel confirmation modal */}
      <Modal
        visible={confirmCancel}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmCancel(false)}
      >
        <Animated.View entering={FadeIn.duration(150)} style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.backgroundDefault }]}>
            <View
              style={[
                styles.modalIconCircle,
                { backgroundColor: theme.error + "1A" },
              ]}
            >
              <Feather name="alert-triangle" size={24} color={theme.error} />
            </View>
            <ThemedText type="h3" style={styles.modalTitle}>
              Cancel this project?
            </ThemedText>
            <ThemedText
              type="small"
              style={{ color: theme.textSecondary, textAlign: "center", marginBottom: Spacing.lg }}
            >
              "{project.name}" hasn't been accepted yet, so we can withdraw it cleanly. This will permanently remove the brief and any messages on it.
            </ThemedText>
            <View style={styles.modalActions}>
              <Button
                variant="outline"
                onPress={() => setConfirmCancel(false)}
                style={styles.modalButton}
                testID="button-cancel-dismiss"
              >
                Keep project
              </Button>
              <Pressable
                onPress={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
                style={({ pressed }) => [
                  styles.modalDestructive,
                  {
                    backgroundColor: theme.error,
                    opacity: pressed || cancelMutation.isPending ? 0.7 : 1,
                  },
                ]}
                testID="button-cancel-confirm"
              >
                <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                  {cancelMutation.isPending ? "Cancelling..." : "Yes, cancel"}
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </Modal>
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
  titleHatBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
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
  hatChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  hatChipIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  hatChipText: {
    gap: 1,
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
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: "center",
  },
  modalIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  modalTitle: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  modalActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    width: "100%",
  },
  modalButton: {
    flex: 1,
  },
  modalDestructive: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
});
