import React, { useState, useCallback } from "react";
import { StyleSheet, View, Pressable, TextInput } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/query-client";
import { Spacing, BorderRadius } from "@/constants/theme";

type HatType = "designer" | "developer" | "strategist" | "manager" | "analyst";
type PlanTier = "starter" | "prototype" | "production" | "custom";

interface RoleAllocation {
  hat: HatType;
  label: string;
  title: string;
  icon: keyof typeof Feather.glyphMap;
  credits: number;
}

interface PlanConfig {
  tier: PlanTier;
  name: string;
  tagline: string;
  totalCredits: number;
  price: string;
  icon: keyof typeof Feather.glyphMap;
  roles: RoleAllocation[];
  highlight?: boolean;
}

const PLANS: PlanConfig[] = [
  {
    tier: "starter",
    name: "Starter",
    tagline: "Core build focus",
    totalCredits: 450,
    price: "$459",
    icon: "zap",
    roles: [
      { hat: "designer", label: "Designer", title: "CDO", icon: "pen-tool", credits: 200 },
      { hat: "developer", label: "Developer", title: "CTO", icon: "code", credits: 250 },
    ],
  },
  {
    tier: "prototype",
    name: "Prototype",
    tagline: "Full prototype with strategy",
    totalCredits: 1000,
    price: "$959",
    icon: "layers",
    highlight: true,
    roles: [
      { hat: "designer", label: "Designer", title: "CDO", icon: "pen-tool", credits: 300 },
      { hat: "developer", label: "Developer", title: "CTO", icon: "code", credits: 400 },
      { hat: "strategist", label: "Strategist", title: "CSO", icon: "target", credits: 150 },
      { hat: "manager", label: "Manager", title: "COO", icon: "clipboard", credits: 150 },
    ],
  },
  {
    tier: "production",
    name: "Production",
    tagline: "All 5 hats, deep engagement",
    totalCredits: 4000,
    price: "$2k - $6k",
    icon: "box",
    roles: [
      { hat: "designer", label: "Designer", title: "CDO", icon: "pen-tool", credits: 800 },
      { hat: "developer", label: "Developer", title: "CTO", icon: "code", credits: 1500 },
      { hat: "strategist", label: "Strategist", title: "CSO", icon: "target", credits: 600 },
      { hat: "manager", label: "Manager", title: "COO", icon: "clipboard", credits: 500 },
      { hat: "analyst", label: "Analyst", title: "CAO", icon: "bar-chart-2", credits: 600 },
    ],
  },
  {
    tier: "custom",
    name: "Custom",
    tagline: "Full ongoing partnership",
    totalCredits: 7500,
    price: "$7.5k+",
    icon: "star",
    roles: [
      { hat: "designer", label: "Designer", title: "CDO", icon: "pen-tool", credits: 1500 },
      { hat: "developer", label: "Developer", title: "CTO", icon: "code", credits: 2500 },
      { hat: "strategist", label: "Strategist", title: "CSO", icon: "target", credits: 1200 },
      { hat: "manager", label: "Manager", title: "COO", icon: "clipboard", credits: 1000 },
      { hat: "analyst", label: "Analyst", title: "CAO", icon: "bar-chart-2", credits: 1300 },
    ],
  },
];

function PlanCard({
  plan,
  selected,
  onSelect,
}: {
  plan: PlanConfig;
  selected: boolean;
  onSelect: () => void;
}) {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const maxCredits = Math.max(...plan.roles.map((r) => r.credits));

  const selectedBg = isDark ? "#1C1C1E" : "#000000";
  const selectedBorder = isDark ? "#3A3A3C" : "#000000";
  const selectedText = "#FFFFFF";
  const selectedSubtle = isDark ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.85)";
  const selectedMuted = isDark ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.6)";

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={() => {
          scale.value = withSpring(0.98, { damping: 15, stiffness: 200 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 15, stiffness: 200 });
        }}
        onPress={onSelect}
        testID={`plan-${plan.tier}`}
      >
        <View
          style={[
            styles.planCard,
            {
              backgroundColor: selected
                ? selectedBg
                : theme.backgroundDefault,
              borderColor: selected
                ? selectedBorder
                : plan.highlight
                  ? isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)"
                  : theme.border,
              borderWidth: selected ? 2 : plan.highlight && !selected ? 1.5 : 1,
            },
          ]}
        >
          {plan.highlight ? (
            <View
              style={[
                styles.popularBadge,
                {
                  backgroundColor: selected
                    ? "rgba(255,255,255,0.15)"
                    : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
                },
              ]}
            >
              <ThemedText
                type="caption"
                style={{
                  fontWeight: "700",
                  fontSize: 10,
                  color: selected ? selectedText : theme.textSecondary,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Most Popular
              </ThemedText>
            </View>
          ) : null}

          <View style={styles.planHeader}>
            <View style={styles.planTitleRow}>
              <View
                style={[
                  styles.planIconWrap,
                  {
                    backgroundColor: selected
                      ? "rgba(255,255,255,0.12)"
                      : theme.backgroundSecondary,
                  },
                ]}
              >
                <Feather
                  name={plan.icon}
                  size={18}
                  color={selected ? selectedText : theme.text}
                />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText
                  type="h4"
                  style={{
                    color: selected ? selectedText : theme.text,
                  }}
                >
                  {plan.name}
                </ThemedText>
                <ThemedText
                  type="caption"
                  style={{
                    color: selected ? selectedMuted : theme.textSecondary,
                    marginTop: 1,
                  }}
                >
                  {plan.tagline}
                </ThemedText>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <ThemedText
                  type="h3"
                  style={{
                    color: selected ? selectedText : theme.text,
                  }}
                >
                  {plan.price}
                </ThemedText>
                <ThemedText
                  type="caption"
                  style={{
                    color: selected ? selectedMuted : theme.textTertiary,
                  }}
                >
                  {plan.totalCredits} credits
                </ThemedText>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.divider,
              {
                backgroundColor: selected
                  ? "rgba(255,255,255,0.1)"
                  : theme.border,
              },
            ]}
          />

          <View style={styles.rolesSection}>
            {plan.roles.map((role) => {
              const barWidth = (role.credits / maxCredits) * 100;
              return (
                <View key={role.hat} style={styles.roleRow}>
                  <View style={styles.roleInfo}>
                    <Feather
                      name={role.icon}
                      size={13}
                      color={selected ? selectedSubtle : theme.textSecondary}
                    />
                    <ThemedText
                      type="caption"
                      style={{
                        color: selected ? selectedSubtle : theme.text,
                        fontWeight: "500",
                      }}
                    >
                      {role.title}
                    </ThemedText>
                  </View>
                  <View style={styles.roleBarContainer}>
                    <View
                      style={[
                        styles.roleBarTrack,
                        {
                          backgroundColor: selected
                            ? "rgba(255,255,255,0.08)"
                            : theme.backgroundSecondary,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.roleBarFill,
                          {
                            width: `${barWidth}%`,
                            backgroundColor: selected
                              ? "rgba(255,255,255,0.3)"
                              : isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
                          },
                        ]}
                      />
                    </View>
                  </View>
                  <ThemedText
                    type="caption"
                    style={{
                      fontWeight: "600",
                      color: selected ? selectedSubtle : theme.textSecondary,
                      width: 40,
                      textAlign: "right",
                    }}
                  >
                    {role.credits}
                  </ThemedText>
                </View>
              );
            })}
          </View>

          <View style={styles.planFooter}>
            <View
              style={[
                styles.selectIndicator,
                {
                  backgroundColor: selected
                    ? selectedText
                    : "transparent",
                  borderColor: selected ? selectedText : theme.border,
                },
              ]}
            >
              {selected ? (
                <Feather name="check" size={14} color={selectedBg} />
              ) : null}
            </View>
            <ThemedText
              type="small"
              style={{
                fontWeight: "500",
                color: selected ? selectedSubtle : theme.textSecondary,
              }}
            >
              {selected ? "Selected" : "Select this plan"}
            </ThemedText>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function NewProjectScreen() {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<PlanTier | null>(null);
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
    plan?: string;
  }>({});

  const selectedPlanConfig = PLANS.find((p) => p.tier === selectedPlan);

  const resetForm = useCallback(() => {
    setName("");
    setDescription("");
    setSelectedPlan(null);
    setErrors({});
  }, []);

  const createProjectMutation = useMutation({
    mutationFn: async (data: {
      clientId: string;
      name: string;
      description: string;
      planTier: PlanTier;
      hats: HatType[];
      estimatedCredits: number;
    }) => {
      const res = await apiRequest("POST", "/api/projects", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      resetForm();
      navigation.goBack();
    },
  });

  const selectPlan = (tier: PlanTier) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedPlan((prev) => (prev === tier ? null : tier));
    if (errors.plan) {
      setErrors((prev) => ({ ...prev, plan: undefined }));
    }
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) {
      newErrors.name = "Project name is required";
    }
    if (!description.trim()) {
      newErrors.description = "Please describe your project";
    } else if (description.length < 20) {
      newErrors.description =
        "Please provide more details (at least 20 characters)";
    }
    if (!selectedPlan) {
      newErrors.plan = "Please select a plan";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate() || !user || !selectedPlanConfig) return;
    createProjectMutation.mutate({
      clientId: user.id,
      name: name.trim(),
      description: description.trim(),
      planTier: selectedPlanConfig.tier,
      hats: selectedPlanConfig.roles.map((r) => r.hat),
      estimatedCredits: selectedPlanConfig.totalCredits,
    });
  };

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
        <ThemedText type="h2" style={styles.title}>
          New Project
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.subtitle, { color: theme.textSecondary }]}
        >
          Tell us about your MVP and choose your plan
        </ThemedText>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(80).duration(400)}
        style={styles.section}
      >
        <View style={styles.stepHeader}>
          <View
            style={[styles.stepBadge, { backgroundColor: theme.text }]}
          >
            <ThemedText
              type="caption"
              style={{ color: theme.backgroundRoot, fontWeight: "700" }}
            >
              1
            </ThemedText>
          </View>
          <ThemedText type="h4">Project Details</ThemedText>
        </View>

        <Input
          label="Project Name"
          placeholder="e.g., FitTrack, Foodie, ShopDrop"
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          leftIcon="folder"
          error={errors.name}
          testID="input-project-name"
        />

        <View style={styles.inputGroup}>
          <ThemedText type="small" style={styles.label}>
            What are you building?
          </ThemedText>
          <View
            style={[
              styles.textAreaContainer,
              {
                borderColor: errors.description ? theme.error : theme.border,
                backgroundColor: theme.backgroundDefault,
              },
            ]}
          >
            <TextInput
              placeholder="Describe your idea, target audience, key features, and goals..."
              placeholderTextColor={theme.textTertiary}
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                if (errors.description)
                  setErrors((prev) => ({ ...prev, description: undefined }));
              }}
              multiline
              numberOfLines={4}
              style={[styles.textArea, { color: theme.text }]}
              testID="input-project-description"
            />
          </View>
          <View style={styles.charCount}>
            <ThemedText
              type="caption"
              style={{
                color:
                  description.length > 0 && description.length < 20
                    ? theme.error
                    : theme.textTertiary,
              }}
            >
              {description.length}/20 min
            </ThemedText>
          </View>
          {errors.description ? (
            <ThemedText
              type="caption"
              style={[styles.error, { color: theme.error }]}
            >
              {errors.description}
            </ThemedText>
          ) : null}
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(160).duration(400)}
        style={styles.section}
      >
        <View style={styles.stepHeader}>
          <View
            style={[styles.stepBadge, { backgroundColor: theme.text }]}
          >
            <ThemedText
              type="caption"
              style={{ color: theme.backgroundRoot, fontWeight: "700" }}
            >
              2
            </ThemedText>
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText type="h4">Choose Your Plan</ThemedText>
            <ThemedText
              type="caption"
              style={{ color: theme.textSecondary, marginTop: 2 }}
            >
              Each plan includes preset expertise with credit allocation
            </ThemedText>
          </View>
        </View>

        {PLANS.map((plan, index) => (
          <Animated.View
            key={plan.tier}
            entering={FadeInDown.delay(200 + index * 60).duration(350)}
            style={{ marginBottom: Spacing.md }}
          >
            <PlanCard
              plan={plan}
              selected={selectedPlan === plan.tier}
              onSelect={() => selectPlan(plan.tier)}
            />
          </Animated.View>
        ))}

        {errors.plan ? (
          <ThemedText
            type="caption"
            style={[styles.error, { color: theme.error }]}
          >
            {errors.plan}
          </ThemedText>
        ) : null}
      </Animated.View>

      {selectedPlanConfig ? (
        <Animated.View entering={FadeInUp.duration(350)}>
          <Card style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Feather name="check-circle" size={18} color={theme.success} />
              <ThemedText type="h4">Plan Summary</ThemedText>
            </View>

            <View
              style={[
                styles.summaryRow,
                { borderBottomColor: theme.border },
              ]}
            >
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Plan
              </ThemedText>
              <ThemedText type="small" style={{ fontWeight: "600" }}>
                {selectedPlanConfig.name}
              </ThemedText>
            </View>

            <View
              style={[
                styles.summaryRow,
                { borderBottomColor: theme.border },
              ]}
            >
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Roles Included
              </ThemedText>
              <ThemedText type="small" style={{ fontWeight: "600" }}>
                {selectedPlanConfig.roles.map((r) => r.title).join(", ")}
              </ThemedText>
            </View>

            <View
              style={[
                styles.summaryRow,
                { borderBottomColor: theme.border },
              ]}
            >
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Total Credits
              </ThemedText>
              <ThemedText type="small" style={{ fontWeight: "600" }}>
                {selectedPlanConfig.totalCredits}
              </ThemedText>
            </View>

            <View style={styles.summaryTotal}>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                Price
              </ThemedText>
              <ThemedText type="h3">{selectedPlanConfig.price}</ThemedText>
            </View>
          </Card>
        </Animated.View>
      ) : null}

      <Animated.View
        entering={FadeInDown.delay(500).duration(400)}
        style={styles.submitSection}
      >
        <Button
          onPress={handleSubmit}
          loading={createProjectMutation.isPending}
          testID="button-submit-project"
        >
          Submit Project Brief
        </Button>

        {createProjectMutation.isError ? (
          <ThemedText
            type="caption"
            style={[styles.errorMessage, { color: theme.error }]}
          >
            Something went wrong. Please try again.
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
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  inputGroup: {
    marginBottom: Spacing.sm,
  },
  label: {
    marginBottom: Spacing.xs,
    fontWeight: "500",
  },
  textAreaContainer: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
    padding: Spacing.md,
  },
  charCount: {
    alignItems: "flex-end",
    marginTop: Spacing.xs,
  },
  error: {
    marginTop: Spacing.xs,
  },
  planCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  popularBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  planHeader: {
    marginBottom: Spacing.md,
  },
  planTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  planIconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    marginBottom: Spacing.md,
  },
  rolesSection: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  roleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  roleInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    width: 58,
  },
  roleBarContainer: {
    flex: 1,
  },
  roleBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  roleBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  planFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  selectIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryCard: {
    marginBottom: Spacing.xl,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  summaryTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Spacing.md,
  },
  submitSection: {
    marginTop: Spacing.sm,
  },
  errorMessage: {
    textAlign: "center",
    marginTop: Spacing.md,
  },
});
