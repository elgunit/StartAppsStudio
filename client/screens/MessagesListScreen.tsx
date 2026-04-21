import React from "react";
import { StyleSheet, View, FlatList, RefreshControl, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";

import { ConversationCard } from "@/components/ConversationCard";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/lib/auth";
import { Spacing, BorderRadius } from "@/constants/theme";

export default function MessagesListScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { user } = useAuth();

  const { data: conversations = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ["/api/conversations", user?.id],
    enabled: !!user,
  });

  const isClient = user?.role !== "designer";

  const renderEmptyState = () => (
    <View style={styles.emptyOuter}>
      <Animated.View
        entering={FadeIn.duration(500)}
        style={[styles.emptyCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
      >
        <View style={[styles.iconRing, { borderColor: theme.text + "1A" }]}>
          <View style={[styles.iconRingInner, { borderColor: theme.text + "33" }]}>
            <View style={[styles.iconCenter, { backgroundColor: theme.text }]}>
              <Feather name="message-circle" size={24} color={theme.backgroundRoot} />
            </View>
          </View>
        </View>
        <ThemedText type="h2" style={styles.emptyTitle}>
          Your build conversations live here
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.emptyDesc, { color: theme.textSecondary }]}
        >
          Every project gets its own thread with the studio. Decisions, files, and the day-to-day pulse of the build all stay in one place.
        </ThemedText>
        {isClient ? (
          <Button
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate("NewProject");
            }}
            style={styles.primaryCta}
            testID="button-empty-new-project"
          >
            Start a new project
          </Button>
        ) : null}
        <Pressable
          onPress={() => navigation.navigate("JournalList")}
          testID="button-empty-journal"
          style={({ pressed }) => [styles.secondaryLink, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Feather name="book-open" size={14} color={theme.textSecondary} />
          <ThemedText type="small" style={{ color: theme.textSecondary, fontWeight: "600" }}>
            Read the studio journal
          </ThemedText>
        </Pressable>
      </Animated.View>
    </View>
  );

  const renderConversation = ({ item, index }: { item: any; index: number }) => (
    <Animated.View entering={FadeInDown.delay(50 + index * 30).duration(400)}>
      <ConversationCard
        projectName={item.projectName}
        clientName={user?.role === "designer" ? item.clientName : undefined}
        lastMessage={item.lastMessage}
        lastMessageTime={item.lastMessageTime}
        unreadCount={item.unreadCount}
        onPress={() =>
          navigation.navigate("Chat", { projectId: item.projectId })
        }
        testID={`conversation-${item.projectId}`}
      />
    </Animated.View>
  );

  return (
    <FlatList
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
        flexGrow: 1,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      data={conversations}
      keyExtractor={(item) => item.projectId}
      renderItem={renderConversation}
      ListEmptyComponent={isLoading ? null : renderEmptyState}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  emptyOuter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["3xl"],
  },
  emptyCard: {
    width: "100%",
    maxWidth: 380,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
    alignItems: "center",
  },
  iconRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  iconRingInner: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCenter: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  emptyDesc: {
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  primaryCta: {
    minWidth: 200,
    marginBottom: Spacing.md,
  },
  secondaryLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
});
