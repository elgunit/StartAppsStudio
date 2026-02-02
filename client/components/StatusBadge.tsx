import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

type Status = "brief_submitted" | "hat_selection" | "discovery" | "design_build" | "client_review" | "iteration" | "completed";

const statusLabels: Record<Status, string> = {
  brief_submitted: "Brief Submitted",
  hat_selection: "Hat Selection",
  discovery: "Discovery",
  design_build: "Design & Build",
  client_review: "Client Review",
  iteration: "Iteration",
  completed: "Completed",
};

interface StatusBadgeProps {
  status: Status;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const { theme } = useTheme();

  const getStatusColor = () => {
    switch (status) {
      case "brief_submitted":
        return theme.warning;
      case "hat_selection":
      case "discovery":
        return theme.info;
      case "design_build":
      case "iteration":
        return theme.info;
      case "client_review":
        return theme.warning;
      case "completed":
        return theme.success;
      default:
        return theme.textSecondary;
    }
  };

  return (
    <View
      style={[
        styles.badge,
        size === "sm" && styles.badgeSm,
        { backgroundColor: getStatusColor() + "20" },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: getStatusColor() }]} />
      <ThemedText
        type={size === "sm" ? "caption" : "small"}
        style={{ color: getStatusColor() }}
      >
        {statusLabels[status]}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  badgeSm: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
