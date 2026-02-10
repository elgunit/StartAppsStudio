import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Alert } from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { HatIcon } from "@/components/HatBadge";
import { useTheme } from "@/hooks/useTheme";
import { apiRequest } from "@/lib/query-client";
import { Spacing, BorderRadius } from "@/constants/theme";

type RootStackParamList = {
  WorkSession: { projectId?: string };
};

interface ClientUser {
  id: string;
  name: string;
  email: string;
  credits: number;
}

export default function WorkSessionScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "WorkSession">>();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const queryClient = useQueryClient();

  const projectIdParam = route.params?.projectId;

  const [elapsedTime, setElapsedTime] = useState(0);
  const [notes, setNotes] = useState("");
  const [deductCredits, setDeductCredits] = useState("");
  const [deductDescription, setDeductDescription] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { data: activeSession, refetch: refetchSession } = useQuery({
    queryKey: ["/api/work-sessions/active"],
  });

  const { data: projects = [] } = useQuery<any[]>({
    queryKey: ["/api/projects"],
  });

  const { data: clients = [] } = useQuery<ClientUser[]>({
    queryKey: ["/api/clients"],
  });

  const activeProject = activeSession
    ? projects.find((p) => p.id === activeSession.projectId)
    : projectIdParam
    ? projects.find((p) => p.id === projectIdParam)
    : null;

  useEffect(() => {
    if (activeProject?.clientId && !selectedClientId) {
      setSelectedClientId(activeProject.clientId);
    }
  }, [activeProject]);

  useEffect(() => {
    if (activeSession?.isActive && activeSession.startTime) {
      const startTime = new Date(activeSession.startTime).getTime();

      const updateTimer = () => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setElapsedTime(elapsed);
      };

      updateTimer();
      timerRef.current = setInterval(updateTimer, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    } else {
      setElapsedTime(0);
    }
  }, [activeSession]);

  const startSessionMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const res = await apiRequest("POST", "/api/work-sessions", { projectId });
      return res.json();
    },
    onSuccess: () => {
      refetchSession();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to start session");
    },
  });

  const stopSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await apiRequest("POST", `/api/work-sessions/${sessionId}/stop`, {});
      return res.json();
    },
    onSuccess: () => {
      refetchSession();
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to stop session");
    },
  });

  const incrementPromptMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await apiRequest("POST", `/api/work-sessions/${sessionId}/increment-prompt`, {});
      return res.json();
    },
    onSuccess: () => {
      refetchSession();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },
  });

  const pushToClientMutation = useMutation({
    mutationFn: async (data: { projectId: string; previewUrl: string; notes: string }) => {
      const res = await apiRequest("POST", "/api/project-versions", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setNotes("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Update pushed to client!");
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to push update");
    },
  });

  const deductCreditsMutation = useMutation({
    mutationFn: async (data: { userId: string; amount: number; description: string }) => {
      const res = await apiRequest("POST", "/api/credits/deduct", data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/credit-transactions"] });
      setDeductCredits("");
      setDeductDescription("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Credits Deducted", `Client now has ${data.credits} credits remaining.`);
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to deduct credits");
    },
  });

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartSession = () => {
    if (projectIdParam) {
      startSessionMutation.mutate(projectIdParam);
    }
  };

  const handleStopSession = () => {
    if (activeSession) {
      Alert.alert(
        "Stop Session",
        "Are you sure you want to end this work session?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Stop",
            style: "destructive",
            onPress: () => stopSessionMutation.mutate(activeSession.id),
          },
        ]
      );
    }
  };

  const handlePushToClient = () => {
    if (!activeProject) return;

    pushToClientMutation.mutate({
      projectId: activeProject.id,
      previewUrl: `https://preview.example.com/${activeProject.id}`,
      notes,
    });
  };

  const handleDeductCredits = () => {
    const amount = parseInt(deductCredits, 10);
    const clientId = selectedClientId || activeProject?.clientId;

    if (!clientId) {
      Alert.alert("Error", "No client selected");
      return;
    }
    if (!amount || amount <= 0) {
      Alert.alert("Error", "Please enter a valid credit amount");
      return;
    }
    if (!deductDescription.trim()) {
      Alert.alert("Error", "Please add a description for this deduction");
      return;
    }

    const client = clients.find((c) => c.id === clientId);
    Alert.alert(
      "Deduct Credits",
      `Deduct ${amount} credits from ${client?.name || "client"} for:\n"${deductDescription}"`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Deduct",
          onPress: () => {
            deductCreditsMutation.mutate({
              userId: clientId,
              amount,
              description: deductDescription,
            });
          },
        },
      ]
    );
  };

  const isSessionActive = activeSession?.isActive;

  const currentClient = clients.find(
    (c) => c.id === (selectedClientId || activeProject?.clientId)
  );

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
    >
      {/* Timer Display */}
      <Animated.View entering={FadeInDown.duration(500)} style={styles.timerSection}>
        <View style={[styles.timerCircle, { borderColor: isSessionActive ? theme.success : theme.border }]}>
          {isSessionActive ? (
            <View style={[styles.liveIndicator, { backgroundColor: theme.success }]} />
          ) : null}
          <ThemedText type="display" style={styles.timerText}>
            {formatTime(elapsedTime)}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {isSessionActive ? "Active Session" : "No Active Session"}
          </ThemedText>
        </View>
      </Animated.View>

      {/* Active Project Card */}
      {activeProject ? (
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <Card style={styles.projectCard}>
            <View style={styles.projectHeader}>
              <View style={styles.projectInfo}>
                <ThemedText type="h4">{activeProject.name}</ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  {activeProject.client?.name || "Client"}
                </ThemedText>
              </View>
              {activeProject.currentHat ? (
                <HatIcon type={activeProject.currentHat} size={32} />
              ) : null}
            </View>
          </Card>
        </Animated.View>
      ) : null}

      {/* Session Controls */}
      <Animated.View entering={FadeInDown.delay(150).duration(500)} style={styles.controls}>
        {isSessionActive ? (
          <>
            {/* Prompt Counter */}
            <Card style={styles.counterCard}>
              <View style={styles.counterRow}>
                <View>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    Prompts Used
                  </ThemedText>
                  <ThemedText type="h1">{activeSession?.promptCount || 0}</ThemedText>
                </View>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => incrementPromptMutation.mutate(activeSession.id)}
                  testID="button-increment-prompt"
                >
                  +1 Prompt
                </Button>
              </View>
            </Card>

            {/* Notes */}
            <View style={styles.notesSection}>
              <ThemedText type="small" style={styles.label}>
                Session Notes (private)
              </ThemedText>
              <View
                style={[
                  styles.notesInput,
                  { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
                ]}
              >
                <Input
                  placeholder="Add notes about this session..."
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                  style={styles.notesTextInput}
                  testID="input-session-notes"
                />
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <Button
                onPress={handlePushToClient}
                disabled={!activeProject}
                loading={pushToClientMutation.isPending}
                style={styles.pushButton}
                testID="button-push-to-client"
              >
                Push to Client
              </Button>
              <Button
                variant="outline"
                onPress={handleStopSession}
                loading={stopSessionMutation.isPending}
                testID="button-stop-session"
              >
                Stop Session
              </Button>
            </View>
          </>
        ) : (
          <View style={styles.startSection}>
            {projectIdParam && activeProject ? (
              <Button
                onPress={handleStartSession}
                loading={startSessionMutation.isPending}
                testID="button-start-session"
              >
                Start Working on {activeProject.name}
              </Button>
            ) : (
              <ThemedText type="body" style={[styles.noProjectText, { color: theme.textSecondary }]}>
                Select a project from the Projects tab to start a work session
              </ThemedText>
            )}
          </View>
        )}
      </Animated.View>

      {/* Credit Management Section */}
      <Animated.View entering={FadeInDown.delay(200).duration(500)}>
        <View style={styles.creditManagementDivider}>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            CREDIT MANAGEMENT
          </ThemedText>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
        </View>

        <Card style={styles.creditCard}>
          {/* Client selector - show list of clients */}
          {clients.length > 0 ? (
            <View style={styles.clientSelector}>
              <ThemedText type="small" style={styles.label}>
                Client
              </ThemedText>
              <View style={styles.clientList}>
                {clients.map((client) => (
                  <View
                    key={client.id}
                    style={[
                      styles.clientChip,
                      {
                        backgroundColor:
                          (selectedClientId || activeProject?.clientId) === client.id
                            ? theme.text
                            : theme.backgroundDefault,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <ThemedText
                      type="caption"
                      style={{
                        color:
                          (selectedClientId || activeProject?.clientId) === client.id
                            ? theme.backgroundRoot
                            : theme.text,
                        fontWeight: "500",
                      }}
                      onPress={() => setSelectedClientId(client.id)}
                    >
                      {client.name} ({client.credits} cr)
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {currentClient ? (
            <View style={[styles.clientBalance, { backgroundColor: theme.backgroundDefault }]}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {currentClient.name}'s balance
              </ThemedText>
              <ThemedText type="h3">{currentClient.credits} credits</ThemedText>
            </View>
          ) : null}

          <View style={styles.deductSection}>
            <ThemedText type="small" style={styles.label}>
              Credits to deduct
            </ThemedText>
            <Input
              placeholder="e.g. 25"
              value={deductCredits}
              onChangeText={setDeductCredits}
              keyboardType="numeric"
              testID="input-deduct-credits"
            />
          </View>

          <View style={styles.deductSection}>
            <ThemedText type="small" style={styles.label}>
              Work description
            </ThemedText>
            <Input
              placeholder="e.g. Homepage design review & iterations"
              value={deductDescription}
              onChangeText={setDeductDescription}
              testID="input-deduct-description"
            />
          </View>

          <Button
            onPress={handleDeductCredits}
            loading={deductCreditsMutation.isPending}
            variant="primary"
            testID="button-deduct-credits"
          >
            Deduct Credits
          </Button>
        </Card>
      </Animated.View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  timerSection: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  liveIndicator: {
    position: "absolute",
    top: 20,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timerText: {
    fontSize: 40,
    marginBottom: Spacing.xs,
  },
  projectCard: {
    marginBottom: Spacing.lg,
  },
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  projectInfo: {
    flex: 1,
  },
  controls: {},
  counterCard: {
    marginBottom: Spacing.lg,
  },
  counterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notesSection: {
    marginBottom: Spacing.xl,
  },
  label: {
    marginBottom: Spacing.xs,
    fontWeight: "500",
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  notesTextInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  actionButtons: {
    gap: Spacing.md,
  },
  pushButton: {
    marginBottom: Spacing.sm,
  },
  startSection: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  noProjectText: {
    textAlign: "center",
  },
  creditManagementDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginTop: Spacing["2xl"],
    marginBottom: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  creditCard: {
    marginBottom: Spacing.lg,
  },
  clientSelector: {
    marginBottom: Spacing.md,
  },
  clientList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  clientChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  clientBalance: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  deductSection: {
    marginBottom: Spacing.md,
  },
});
