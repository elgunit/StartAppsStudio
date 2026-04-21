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

  const STARTERS: { icon: keyof typeof Feather.glyphMap; label: string; prompt: string }[] = [
    {
      icon: "target",
      label: "Problem",
      prompt: "The core problem I'm trying to solve is ",
    },
    {
      icon: "users",
      label: "Audience",
      prompt: "My main users are ",
    },
    {
      icon: "link",
      label: "References",
      prompt: "Some products I love that feel close to this: ",
    },
    {
      icon: "calendar",
      label: "Timeline & budget",
      prompt: "I'd like to launch by ___ and my budget is around ",
    },
    {
      icon: "check-circle",
      label: "Must-have vs nice-to-have",
      prompt: "Must-have for v1: \nNice-to-have for later: ",
    },
    {
      icon: "trending-up",
      label: "Success metric",
      prompt: "I'll know this is working if ",
    },
  ];

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.backgroundDefault }]}>
        <Feather name="message-circle" size={28} color={theme.text} />
      </View>
      <ThemedText type="h3" style={styles.emptyHeading}>
        Let's scope your build
      </ThemedText>
      <ThemedText
        type="small"
        style={[styles.emptyDesc, { color: theme.textSecondary }]}
      >
        We use this chat to qualify the project, agree on what v1 looks like, and lock the timeline. Tap a starter to drop it into the composer.
      </ThemedText>
      <View style={styles.starterGrid}>
        {STARTERS.map((s) => (
          <Pressable
            key={s.label}
            onPress={() => {
              Haptics.selectionAsync();
              setMessage(s.prompt);
            }}
            testID={`starter-${s.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
            style={({ pressed }) => [
              styles.starterChip,
              {
                backgroundColor: theme.backgroundDefault,
                borderColor: theme.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Feather name={s.icon} size={14} color={theme.text} />
            <ThemedText type="caption" style={{ fontWeight: "600" }}>
              {s.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>
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
    paddingHorizontal: Spacing.lg,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  emptyHeading: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  emptyDesc: {
    textAlign: "center",
    marginBottom: Spacing.xl,
    maxWidth: 320,
  },
  starterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.sm,
    maxWidth: 360,
  },
  starterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
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
