import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInUp } from "react-native-reanimated";
import { formatDistanceToNow } from "date-fns";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/query-client";
import { Spacing, BorderRadius } from "@/constants/theme";

type RootStackParamList = {
  Chat: { projectId: string };
};

interface Message {
  id: string;
  projectId: string;
  senderId: string;
  content: string;
  fileUrl?: string | null;
  fileName?: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function ChatScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "Chat">>();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const flatListRef = useRef<FlatList>(null);

  const { projectId } = route.params;
  const [message, setMessage] = useState("");

  const { data: messages = [], refetch } = useQuery<Message[]>({
    queryKey: ["/api/messages", projectId],
    enabled: !!projectId,
    refetchInterval: 5000, // Poll every 5 seconds
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/messages", {
        projectId,
        senderId: user?.id,
        content,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", projectId] });
      setMessage("");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
  });

  // Mark messages as read
  useEffect(() => {
    if (user && projectId) {
      apiRequest("POST", `/api/messages/${projectId}/read`, { userId: user.id }).catch(() => {});
    }
  }, [projectId, user, messages.length]);

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate(message.trim());
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwnMessage = item.senderId === user?.id;
    const timeAgo = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true });

    return (
      <Animated.View
        entering={FadeInUp.delay(index * 30).duration(300)}
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isOwnMessage ? theme.text : theme.backgroundDefault,
            },
          ]}
        >
          <ThemedText
            type="body"
            style={{
              color: isOwnMessage ? theme.backgroundRoot : theme.text,
            }}
          >
            {item.content}
          </ThemedText>
        </View>
        <ThemedText type="caption" style={[styles.messageTime, { color: theme.textTertiary }]}>
          {timeAgo}
        </ThemedText>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Feather name="message-circle" size={48} color={theme.textTertiary} />
      <ThemedText type="body" style={[styles.emptyText, { color: theme.textSecondary }]}>
        Start the conversation
      </ThemedText>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={headerHeight}
    >
      <FlatList
        ref={flatListRef}
        data={messages.toReversed()}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        inverted={messages.length > 0}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          styles.messagesList,
          {
            paddingTop: Spacing.lg,
            paddingBottom: Spacing.lg,
            flexGrow: messages.length === 0 ? 1 : undefined,
          },
        ]}
        showsVerticalScrollIndicator={false}
      />

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.backgroundRoot,
            borderTopColor: theme.border,
            paddingBottom: insets.bottom + Spacing.sm,
          },
        ]}
      >
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: theme.backgroundDefault,
              borderColor: theme.border,
            },
          ]}
        >
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor={theme.textTertiary}
            style={[styles.input, { color: theme.text }]}
            multiline
            maxLength={1000}
            testID="input-message"
          />
          <Pressable
            onPress={handleSend}
            disabled={!message.trim() || sendMessageMutation.isPending}
            style={[
              styles.sendButton,
              {
                backgroundColor: message.trim() ? theme.text : theme.border,
              },
            ]}
            testID="button-send"
          >
            <Feather
              name="send"
              size={18}
              color={message.trim() ? theme.backgroundRoot : theme.textTertiary}
            />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: Spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },
  emptyText: {},
  messageContainer: {
    marginBottom: Spacing.md,
    maxWidth: "80%",
  },
  ownMessage: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  otherMessage: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  messageBubble: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  messageTime: {
    marginTop: Spacing.xs,
  },
  inputContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingVertical: Spacing.sm,
    fontSize: 16,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
