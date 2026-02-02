import React from "react";
import { StyleSheet, View } from "react-native";
import { Card } from "@/components/Card";
import { ThemedText } from "@/components/ThemedText";
import { StatusBadge } from "@/components/StatusBadge";
import { OnlineIndicator } from "@/components/OnlineIndicator";
import { HatIcon } from "@/components/HatBadge";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

type Status = "brief_submitted" | "hat_selection" | "discovery" | "design_build" | "client_review" | "iteration" | "completed";
type HatType = "designer" | "developer" | "strategist" | "manager" | "analyst";

interface ProjectCardProps {
  name: string;
  description?: string;
  status: Status;
  currentHat?: HatType | null;
  isDesignerOnline?: boolean;
  lastActivity?: string;
  onPress?: () => void;
  testID?: string;
}

export function ProjectCard({
  name,
  description,
  status,
  currentHat,
  isDesignerOnline = false,
  lastActivity,
  onPress,
  testID,
}: ProjectCardProps) {
  const { theme } = useTheme();

  return (
    <Card onPress={onPress} style={styles.card} testID={testID}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <ThemedText type="h4" numberOfLines={1} style={styles.title}>
            {name}
          </ThemedText>
          {currentHat ? <HatIcon type={currentHat} size={20} /> : null}
        </View>
        <OnlineIndicator isOnline={isDesignerOnline} size="sm" />
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

      <View style={styles.footer}>
        <StatusBadge status={status} size="sm" />
        {lastActivity ? (
          <ThemedText type="caption" style={{ color: theme.textTertiary }}>
            {lastActivity}
          </ThemedText>
        ) : null}
      </View>
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
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flex: 1,
  },
  title: {
    flex: 1,
  },
  description: {
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
