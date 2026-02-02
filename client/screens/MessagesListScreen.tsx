import React from "react";
import { StyleSheet, FlatList, RefreshControl } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ConversationCard } from "@/components/ConversationCard";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/lib/auth";
import { Spacing } from "@/constants/theme";

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

  const renderEmptyState = () => (
    <EmptyState
      image={require("../../assets/images/empty-messages.png")}
      title="No Messages Yet"
      description="Start a project to begin chatting with the designer."
    />
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
  container: {
    flex: 1,
  },
});
