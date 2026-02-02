import React, { ReactNode } from "react";
import { StyleSheet, Pressable, ViewStyle, StyleProp, ActivityIndicator } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

interface ButtonProps {
  onPress?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  testID?: string;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
  energyThreshold: 0.001,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  onPress,
  children,
  style,
  disabled = false,
  variant = "primary",
  size = "md",
  loading = false,
  testID,
}: ButtonProps) {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.97, springConfig);
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(1, springConfig);
    }
  };

  const handlePress = () => {
    if (!disabled && !loading && onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const getBackgroundColor = () => {
    if (disabled) return theme.border;
    switch (variant) {
      case "primary":
        return theme.text;
      case "secondary":
        return theme.backgroundDefault;
      case "outline":
      case "ghost":
        return "transparent";
      default:
        return theme.text;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.textTertiary;
    switch (variant) {
      case "primary":
        return isDark ? "#000000" : "#FFFFFF";
      case "secondary":
      case "outline":
      case "ghost":
        return theme.text;
      default:
        return isDark ? "#000000" : "#FFFFFF";
    }
  };

  const getBorderStyle = () => {
    if (variant === "outline") {
      return {
        borderWidth: 1,
        borderColor: disabled ? theme.border : theme.text,
      };
    }
    return {};
  };

  const getHeight = () => {
    switch (size) {
      case "sm":
        return 40;
      case "md":
        return Spacing.buttonHeight;
      case "lg":
        return 56;
      default:
        return Spacing.buttonHeight;
    }
  };

  const getPadding = () => {
    switch (size) {
      case "sm":
        return Spacing.md;
      case "md":
        return Spacing.lg;
      case "lg":
        return Spacing.xl;
      default:
        return Spacing.lg;
    }
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      testID={testID}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          height: getHeight(),
          paddingHorizontal: getPadding(),
          opacity: disabled ? 0.5 : 1,
        },
        getBorderStyle(),
        style,
        animatedStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <ThemedText
          type="button"
          style={[styles.buttonText, { color: getTextColor() }]}
        >
          {children}
        </ThemedText>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  buttonText: {
    textAlign: "center",
  },
});
