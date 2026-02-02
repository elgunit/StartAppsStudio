import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useSharedValue,
  withSequence,
} from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { Spacing } from "@/constants/theme";

interface OnlineIndicatorProps {
  isOnline: boolean;
  showLabel?: boolean;
  size?: "sm" | "md";
}

export function OnlineIndicator({ isOnline, showLabel = true, size = "md" }: OnlineIndicatorProps) {
  const { theme } = useTheme();
  const pulse = useSharedValue(1);

  React.useEffect(() => {
    if (isOnline) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        false
      );
    } else {
      pulse.value = 1;
    }
  }, [isOnline]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: isOnline ? 0.4 : 0,
  }));

  const dotSize = size === "sm" ? 8 : 10;

  return (
    <View style={styles.container}>
      <View style={styles.dotContainer}>
        <Animated.View
          style={[
            styles.pulse,
            {
              width: dotSize * 2,
              height: dotSize * 2,
              borderRadius: dotSize,
              backgroundColor: theme.online,
            },
            pulseStyle,
          ]}
        />
        <View
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: isOnline ? theme.online : theme.textTertiary,
            },
          ]}
        />
      </View>
      {showLabel ? (
        <ThemedText
          type={size === "sm" ? "caption" : "small"}
          style={{ color: isOnline ? theme.online : theme.textSecondary }}
        >
          {isOnline ? "Online" : "Offline"}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  dotContainer: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  pulse: {
    position: "absolute",
  },
  dot: {},
});
