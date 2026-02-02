import React from "react";
import { StyleSheet, View, Image, ImageSourcePropType } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

type HatType = "designer" | "developer" | "strategist" | "manager" | "analyst";

const hatImages: Record<HatType, ImageSourcePropType> = {
  designer: require("../../assets/images/hat-designer.png"),
  developer: require("../../assets/images/hat-developer.png"),
  strategist: require("../../assets/images/hat-strategist.png"),
  manager: require("../../assets/images/hat-manager.png"),
  analyst: require("../../assets/images/hat-analyst.png"),
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

  return (
    <View style={[
      styles.container,
      selected && { backgroundColor: theme.backgroundDefault, borderColor: theme.text },
    ]}>
      <Image
        source={hatImages[type]}
        style={[styles.image, { width: imageSize, height: imageSize }]}
        resizeMode="contain"
      />
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
  return (
    <Image
      source={hatImages[type]}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
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
  image: {
    marginBottom: Spacing.xs,
  },
  label: {
    textAlign: "center",
  },
});
