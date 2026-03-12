import React, { useState } from "react";
import { StyleSheet, View, TextInput } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/query-client";
import { Spacing, BorderRadius } from "@/constants/theme";

const CATEGORY_COLORS: Record<string, string> = {
  SEO: "#10B981",
  Content: "#3B82F6",
  Ads: "#F59E0B",
  Social: "#8B5CF6",
  Email: "#EF4444",
  Brand: "#EC4899",
};

export default function RequestServiceScreen() {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<RouteProp<{ params: { serviceId: string } }, "params">>();
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  const serviceId = route.params?.serviceId;

  const { data: services = [] } = useQuery<any[]>({
    queryKey: ["/api/marketing/services"],
  });

  const service = services.find((s) => s.id === serviceId);

  const [goals, setGoals] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [errors, setErrors] = useState<{ goals?: string }>({});

  const createOrderMutation = useMutation({
    mutationFn: async (data: {
      clientId: string;
      serviceId: string;
      goals: string;
      websiteUrl?: string;
    }) => {
      const res = await apiRequest("POST", "/api/marketing/orders", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketing/orders"] });
      refreshUser();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    },
  });

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!goals.trim()) {
      newErrors.goals = "Please describe your goals";
    } else if (goals.length < 20) {
      newErrors.goals = "Please provide more detail (at least 20 characters)";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate() || !user || !serviceId) return;
    createOrderMutation.mutate({
      clientId: user.id,
      serviceId,
      goals: goals.trim(),
      websiteUrl: websiteUrl.trim() || undefined,
    });
  };

  if (!service) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.backgroundRoot,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          Loading service...
        </ThemedText>
      </View>
    );
  }

  const catColor = CATEGORY_COLORS[service.category] || theme.info;
  const hasSufficientCredits = (user?.credits || 0) >= service.creditsRequired;
  const isSeoRelated = service.category === "SEO" || service.category === "Content";

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: insets.bottom + Spacing["4xl"],
        paddingHorizontal: Spacing.lg,
      }}
    >
      <Animated.View entering={FadeInDown.duration(400)}>
        <Card style={styles.serviceOverview}>
          <View style={styles.serviceRow}>
            <View style={{ flex: 1 }}>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: catColor + "18", alignSelf: "flex-start" },
                ]}
              >
                <ThemedText
                  type="caption"
                  style={{
                    color: catColor,
                    fontWeight: "600",
                    fontSize: 11,
                  }}
                >
                  {service.category}
                </ThemedText>
              </View>
              <ThemedText type="h3" style={{ marginTop: Spacing.sm }}>
                {service.name}
              </ThemedText>
              <ThemedText
                type="small"
                style={{ color: theme.textSecondary, marginTop: Spacing.xs }}
              >
                {service.description}
              </ThemedText>
            </View>
          </View>

          <View
            style={[styles.divider, { backgroundColor: theme.border }]}
          />

          <View style={styles.deliverablesList}>
            <ThemedText
              type="caption"
              style={{
                fontWeight: "600",
                textTransform: "uppercase" as const,
                letterSpacing: 0.5,
                color: theme.textSecondary,
                marginBottom: Spacing.xs,
              }}
            >
              What you'll receive
            </ThemedText>
            {(service.deliverables || []).map((d: string, i: number) => (
              <View key={i} style={styles.deliverableRow}>
                <Feather name="check" size={13} color={theme.success} />
                <ThemedText type="small" style={{ flex: 1 }}>
                  {d}
                </ThemedText>
              </View>
            ))}
          </View>
        </Card>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(100).duration(400)}
        style={styles.section}
      >
        <ThemedText type="h4" style={styles.sectionTitle}>
          Your Goals
        </ThemedText>
        <ThemedText
          type="small"
          style={{ color: theme.textSecondary, marginBottom: Spacing.md }}
        >
          Tell us what you want to achieve with this service
        </ThemedText>

        <View
          style={[
            styles.textAreaContainer,
            {
              borderColor: errors.goals ? theme.error : theme.border,
              backgroundColor: theme.backgroundDefault,
            },
          ]}
        >
          <TextInput
            placeholder="Describe your goals, target audience, timeline expectations..."
            placeholderTextColor={theme.textTertiary}
            value={goals}
            onChangeText={(text) => {
              setGoals(text);
              if (errors.goals) setErrors({});
            }}
            multiline
            numberOfLines={4}
            style={[styles.textArea, { color: theme.text }]}
            testID="input-goals"
          />
        </View>
        <View style={styles.charCount}>
          <ThemedText
            type="caption"
            style={{
              color:
                goals.length > 0 && goals.length < 20
                  ? theme.error
                  : theme.textTertiary,
            }}
          >
            {goals.length}/20 min
          </ThemedText>
        </View>
        {errors.goals ? (
          <ThemedText
            type="caption"
            style={{ color: theme.error, marginTop: Spacing.xs }}
          >
            {errors.goals}
          </ThemedText>
        ) : null}
      </Animated.View>

      {isSeoRelated ? (
        <Animated.View
          entering={FadeInDown.delay(160).duration(400)}
          style={styles.section}
        >
          <Input
            label="Website URL (optional)"
            placeholder="https://yourapp.com"
            value={websiteUrl}
            onChangeText={setWebsiteUrl}
            leftIcon="globe"
            autoCapitalize="none"
            keyboardType="url"
            testID="input-website-url"
          />
        </Animated.View>
      ) : null}

      <Animated.View entering={FadeInDown.delay(220).duration(400)}>
        <Card style={styles.costSummary}>
          <View style={styles.costRow}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Service Cost
            </ThemedText>
            <View style={styles.creditDisplay}>
              <Feather name="zap" size={14} color={theme.text} />
              <ThemedText type="h4">{service.creditsRequired}</ThemedText>
              <ThemedText
                type="small"
                style={{ color: theme.textSecondary }}
              >
                credits
              </ThemedText>
            </View>
          </View>
          <View style={styles.costRow}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Your Balance
            </ThemedText>
            <ThemedText
              type="small"
              style={{
                fontWeight: "600",
                color: hasSufficientCredits
                  ? theme.success
                  : theme.error,
              }}
            >
              {user?.credits || 0} credits
            </ThemedText>
          </View>
          {!hasSufficientCredits ? (
            <ThemedText
              type="caption"
              style={{
                color: theme.error,
                marginTop: Spacing.sm,
              }}
            >
              You need {service.creditsRequired - (user?.credits || 0)} more
              credits to request this service.
            </ThemedText>
          ) : null}
        </Card>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(300).duration(400)}
        style={styles.submitSection}
      >
        <Button
          onPress={handleSubmit}
          loading={createOrderMutation.isPending}
          disabled={!hasSufficientCredits}
          testID="button-submit-order"
        >
          Confirm & Submit Request
        </Button>

        {createOrderMutation.isError ? (
          <ThemedText
            type="caption"
            style={{
              color: theme.error,
              textAlign: "center",
              marginTop: Spacing.sm,
            }}
          >
            {(createOrderMutation.error as any)?.message?.includes("Insufficient")
              ? "Insufficient credits. Please add more credits first."
              : "Something went wrong. Please try again."}
          </ThemedText>
        ) : null}
      </Animated.View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  serviceOverview: {
    marginBottom: Spacing.xl,
  },
  serviceRow: {
    flexDirection: "row",
  },
  categoryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.md,
  },
  deliverablesList: {
    gap: Spacing.xs,
  },
  deliverableRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.xs,
  },
  textAreaContainer: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    minHeight: 120,
  },
  textArea: {
    fontSize: 14,
    lineHeight: 20,
    textAlignVertical: "top",
  },
  charCount: {
    alignItems: "flex-end",
    marginTop: Spacing.xs,
  },
  costSummary: {
    marginBottom: Spacing.xl,
  },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  creditDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  submitSection: {
    paddingBottom: Spacing.xl,
  },
});
