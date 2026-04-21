import React from "react";
import { StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

type HatType = "designer" | "developer" | "strategist" | "manager" | "analyst";

export const HAT_META: Record<
  HatType,
  { label: string; title: string; icon: keyof typeof Feather.glyphMap; color: string }
> = {
  designer: { label: "Designer", title: "CDO", icon: "pen-tool", color: "#FF2D55" },
  developer: { label: "Developer", title: "CTO", icon: "code", color: "#007AFF" },
  strategist: { label: "Strategist", title: "CSO", icon: "target", color: "#AF52DE" },
  manager: { label: "Manager", title: "PM", icon: "clipboard", color: "#FF9500" },
  analyst: { label: "Analyst", title: "Data", icon: "bar-chart-2", color: "#10B981" },
};

const hatLabels: Record<HatType, string> = {
  designer: "Designer",
  developer: "Developer",
  strategist: "Strategist",
  manager: "Manager",
  analyst: "Analyst",
};

interface HatBadgeProps {
  type: HatType;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  selected?: boolean;
}

export function HatBadge({ type, size = "md", showLabel = true, selected = false }: HatBadgeProps) {
  const { theme } = useTheme();

  const getSize = () => {
    switch (size) {
      case "sm":
        return 32;
      case "md":
        return 48;
      case "lg":
        return 64;
      default:
        return 48;
    }
  };

  const imageSize = getSize();
  const meta = HAT_META[type];

  return (
    <View style={[
      styles.container,
      selected && { backgroundColor: theme.backgroundDefault, borderColor: theme.text },
    ]}>
      <View
        style={[
          styles.iconWrap,
          {
            width: imageSize,
            height: imageSize,
            borderRadius: imageSize / 2,
            backgroundColor: meta.color + "22",
          },
        ]}
      >
        <Feather name={meta.icon} size={Math.round(imageSize * 0.5)} color={meta.color} />
      </View>
      {showLabel ? (
        <ThemedText type="caption" style={styles.label}>
          {hatLabels[type]}
        </ThemedText>
      ) : null}
    </View>
  );
}

interface HatIconProps {
  type: HatType;
  size?: number;
}

export function HatIcon({ type, size = 24 }: HatIconProps) {
  const meta = HAT_META[type];
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: meta.color + "22",
      }}
    >
      <Feather name={meta.icon} size={Math.round(size * 0.55)} color={meta.color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "transparent",
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  label: {
    textAlign: "center",
  },
});
