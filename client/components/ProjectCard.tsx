import React from "react";
import { StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Card } from "@/components/Card";
import { ThemedText } from "@/components/ThemedText";
import { StatusBadge } from "@/components/StatusBadge";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

type Status = "brief_submitted" | "hat_selection" | "discovery" | "design_build" | "client_review" | "iteration" | "completed";
type HatType = "designer" | "developer" | "strategist" | "manager" | "analyst";
type PlanTier = "starter" | "prototype" | "production" | "custom";

const STATUS_ORDER: Status[] = [
  "brief_submitted",
  "hat_selection",
  "discovery",
  "design_build",
  "client_review",
  "iteration",
  "completed",
];

const PLAN_META: Record<PlanTier, { label: string; icon: keyof typeof Feather.glyphMap; color: string }> = {
  starter: { label: "Mockup", icon: "image", color: "#FF9500" },
  prototype: { label: "Prototype", icon: "layers", color: "#007AFF" },
  production: { label: "MVP", icon: "box", color: "#AF52DE" },
  custom: { label: "Custom", icon: "star", color: "#FF2D55" },
};

interface ProjectCardProps {
  name: string;
  description?: string;
  status: Status;
  currentHat?: HatType | null;
  planTier?: PlanTier | null;
  estimatedCredits?: number;
  usedCredits?: number;
  lastActivity?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  testID?: string;
}

export function ProjectCard({
  name,
  description,
  status,
  currentHat,
  planTier,
  estimatedCredits = 0,
  usedCredits = 0,
  lastActivity,
  onPress,
  onLongPress,
  testID,
}: ProjectCardProps) {
  const { theme, isDark } = useTheme();

  const currentStageIndex = STATUS_ORDER.indexOf(status);
  const totalStages = STATUS_ORDER.length;
  const progress = status === "completed" ? 1 : (currentStageIndex + 1) / totalStages;
  const plan = planTier ? PLAN_META[planTier] : null;

  return (
    <Card onPress={onPress} onLongPress={onLongPress} style={styles.card} testID={testID}>
      <View style={styles.header}>
        <ThemedText type="h4" numberOfLines={1} style={styles.title}>
          {name}
        </ThemedText>
        {plan ? (
          <View style={[styles.planBadge, { backgroundColor: plan.color + "18" }]}>
            <Feather name={plan.icon} size={11} color={plan.color} />
            <ThemedText
              type="caption"
              style={{ color: plan.color, fontWeight: "600", fontSize: 11 }}
            >
              {plan.label}
            </ThemedText>
          </View>
        ) : null}
      </View>

      {description ? (
        <ThemedText
          type="small"
          numberOfLines={2}
          style={[styles.description, { color: theme.textSecondary }]}
        >
          {description}
        </ThemedText>
      ) : null}

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <StatusBadge status={status} size="sm" />
          <ThemedText type="caption" style={{ color: theme.textTertiary }}>
            Stage {currentStageIndex + 1} of {totalStages}
          </ThemedText>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progress * 100}%`,
                backgroundColor: status === "completed"
                  ? theme.success
                  : plan ? plan.color : theme.info,
              },
            ]}
          />
        </View>
      </View>

      {estimatedCredits > 0 ? (
        <View style={styles.creditsRow}>
          <View style={styles.creditsStat}>
            <ThemedText type="caption" style={{ color: theme.textTertiary }}>
              Credits used
            </ThemedText>
            <ThemedText type="caption" style={{ fontWeight: "600" }}>
              {usedCredits} / {estimatedCredits}
            </ThemedText>
          </View>
          {lastActivity ? (
            <ThemedText type="caption" style={{ color: theme.textTertiary }}>
              {lastActivity}
            </ThemedText>
          ) : null}
        </View>
      ) : lastActivity ? (
        <View style={styles.creditsRow}>
          <View />
          <ThemedText type="caption" style={{ color: theme.textTertiary }}>
            {lastActivity}
          </ThemedText>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  title: {
    flex: 1,
  },
  planBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  description: {
    marginBottom: Spacing.md,
  },
  progressSection: {
    marginBottom: Spacing.sm,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  creditsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  creditsStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
});
