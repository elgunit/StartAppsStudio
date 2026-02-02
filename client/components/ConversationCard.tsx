import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { formatDistanceToNow } from "date-fns";

interface ConversationCardProps {
  projectName: string;
  clientName?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  onPress?: () => void;
  testID?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ConversationCard({
  projectName,
  clientName,
  lastMessage,
  lastMessageTime,
  unreadCount,
  onPress,
  testID,
}: ConversationCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const timeAgo = formatDistanceToNow(new Date(lastMessageTime), { addSuffix: true });

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      testID={testID}
      style={[
        styles.container,
        {
          backgroundColor: unreadCount > 0 ? theme.backgroundDefault : theme.backgroundRoot,
          borderColor: theme.border,
        },
        animatedStyle,
      ]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText type="h4" numberOfLines={1} style={styles.projectName}>
            {projectName}
          </ThemedText>
          <ThemedText type="caption" style={{ color: theme.textTertiary }}>
            {timeAgo}
          </ThemedText>
        </View>
        {clientName ? (
          <ThemedText type="caption" style={[styles.clientName, { color: theme.textSecondary }]}>
            {clientName}
          </ThemedText>
        ) : null}
        <ThemedText
          type="small"
          numberOfLines={2}
          style={[
            styles.message,
            { color: unreadCount > 0 ? theme.text : theme.textSecondary },
            unreadCount > 0 && styles.unreadMessage,
          ]}
        >
          {lastMessage}
        </ThemedText>
      </View>
      {unreadCount > 0 ? (
        <View style={[styles.badge, { backgroundColor: theme.text }]}>
          <ThemedText type="caption" style={{ color: theme.backgroundRoot }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </ThemedText>
        </View>
      ) : null}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  projectName: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  clientName: {
    marginBottom: Spacing.xs,
  },
  message: {},
  unreadMessage: {
    fontWeight: "500",
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
});
