import React, { useState, useCallback } from "react";
import { StyleSheet, View, Pressable, ScrollView, TextInput } from "react-native";
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
import { HatIcon } from "@/components/HatBadge";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/query-client";
import { Spacing, BorderRadius } from "@/constants/theme";

type HatType = "designer" | "developer" | "strategist" | "manager" | "analyst";

const hatOptions: {
  type: HatType;
  label: string;
  credits: number;
  icon: keyof typeof Feather.glyphMap;
  description: string;
}[] = [
  {
    type: "designer",
    label: "Designer",
    credits: 120,
    icon: "pen-tool",
    description: "UI/UX design, wireframes, prototypes, visual identity",
  },
  {
    type: "developer",
    label: "Developer",
    credits: 180,
    icon: "code",
    description: "Frontend & backend code, APIs, database, deployment",
  },
  {
    type: "strategist",
    label: "Strategist",
    credits: 80,
    icon: "target",
    description: "Market research, positioning, go-to-market planning",
  },
  {
    type: "manager",
    label: "Manager",
    credits: 60,
    icon: "clipboard",
    description: "Sprint planning, timeline, deliverables, coordination",
  },
  {
    type: "analyst",
    label: "Analyst",
    credits: 70,
    icon: "bar-chart-2",
    description: "Data modeling, KPIs, analytics setup, user insights",
  },
];

function HatCard({
  hat,
  selected,
  onToggle,
}: {
  hat: (typeof hatOptions)[0];
  selected: boolean;
  onToggle: () => void;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={() => {
          scale.value = withSpring(0.97, { damping: 15, stiffness: 200 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 15, stiffness: 200 });
        }}
        onPress={onToggle}
        testID={`hat-${hat.type}`}
      >
        <View
          style={[
            styles.hatCard,
            {
              backgroundColor: selected
                ? theme.text
                : theme.backgroundDefault,
              borderColor: selected ? theme.text : theme.border,
            },
          ]}
        >
          <View style={styles.hatCardTop}>
            <View
              style={[
                styles.hatIconWrap,
                {
                  backgroundColor: selected
                    ? "rgba(255,255,255,0.15)"
                    : theme.backgroundSecondary,
                },
              ]}
            >
              <Feather
                name={hat.icon}
                size={20}
                color={selected ? "#FFFFFF" : theme.text}
              />
            </View>
            <View
              style={[
                styles.hatCheck,
                {
                  backgroundColor: selected
                    ? "#FFFFFF"
                    : "transparent",
                  borderColor: selected ? "#FFFFFF" : theme.border,
                },
              ]}
            >
              {selected ? (
                <Feather name="check" size={12} color={theme.text} />
              ) : null}
            </View>
          </View>

          <ThemedText
            type="body"
            style={{
              fontWeight: "600",
              color: selected ? "#FFFFFF" : theme.text,
              marginBottom: 2,
            }}
          >
            {hat.label}
          </ThemedText>

          <ThemedText
            type="caption"
            style={{
              color: selected
                ? "rgba(255,255,255,0.7)"
                : theme.textSecondary,
              marginBottom: Spacing.sm,
            }}
            numberOfLines={2}
          >
            {hat.description}
          </ThemedText>

          <View style={styles.hatCreditsRow}>
            <Feather
              name="zap"
              size={12}
              color={selected ? "rgba(255,255,255,0.8)" : theme.textSecondary}
            />
            <ThemedText
              type="caption"
              style={{
                fontWeight: "600",
                color: selected
                  ? "rgba(255,255,255,0.9)"
                  : theme.textSecondary,
              }}
            >
              {hat.credits} credits
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
  const [selectedHats, setSelectedHats] = useState<HatType[]>([]);
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
    hats?: string;
  }>({});

  const estimatedCredits = selectedHats.reduce((sum, hat) => {
    const hatOption = hatOptions.find((h) => h.type === hat);
    return sum + (hatOption?.credits || 0);
  }, 0);

  const resetForm = useCallback(() => {
    setName("");
    setDescription("");
    setSelectedHats([]);
    setErrors({});
  }, []);

  const createProjectMutation = useMutation({
    mutationFn: async (data: {
      clientId: string;
      name: string;
      description: string;
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

  const toggleHat = (hat: HatType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedHats((prev) =>
      prev.includes(hat) ? prev.filter((h) => h !== hat) : [...prev, hat]
    );
    if (errors.hats) {
      setErrors((prev) => ({ ...prev, hats: undefined }));
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
    if (selectedHats.length === 0) {
      newErrors.hats = "Select at least one expertise area";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate() || !user) return;
    createProjectMutation.mutate({
      clientId: user.id,
      name: name.trim(),
      description: description.trim(),
      hats: selectedHats,
      estimatedCredits,
    });
  };

  const selectedHatDetails = hatOptions.filter((h) =>
    selectedHats.includes(h.type)
  );

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
          Tell us about your MVP and pick the expertise you need
        </ThemedText>
      </Animated.View>

      {/* Step 1: Project Details */}
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

      {/* Step 2: Expertise Selection */}
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
            <ThemedText type="h4">Select Expertise</ThemedText>
            <ThemedText
              type="caption"
              style={{ color: theme.textSecondary, marginTop: 2 }}
            >
              Choose the hats you need for this project
            </ThemedText>
          </View>
        </View>

        <View style={styles.hatsGrid}>
          {hatOptions.map((hat, index) => (
            <Animated.View
              key={hat.type}
              entering={FadeInDown.delay(200 + index * 40).duration(350)}
              style={styles.hatGridItem}
            >
              <HatCard
                hat={hat}
                selected={selectedHats.includes(hat.type)}
                onToggle={() => toggleHat(hat.type)}
              />
            </Animated.View>
          ))}
        </View>
        {errors.hats ? (
          <ThemedText
            type="caption"
            style={[styles.error, { color: theme.error }]}
          >
            {errors.hats}
          </ThemedText>
        ) : null}
      </Animated.View>

      {/* Credit Breakdown */}
      {selectedHats.length > 0 ? (
        <Animated.View entering={FadeInUp.duration(350)}>
          <Card style={styles.breakdownCard}>
            <View style={styles.breakdownHeader}>
              <Feather name="zap" size={18} color={theme.text} />
              <ThemedText type="h4">Credit Breakdown</ThemedText>
            </View>

            {selectedHatDetails.map((hat) => (
              <View
                key={hat.type}
                style={[
                  styles.breakdownRow,
                  { borderBottomColor: theme.border },
                ]}
              >
                <View style={styles.breakdownLabel}>
                  <Feather
                    name={hat.icon}
                    size={14}
                    color={theme.textSecondary}
                  />
                  <ThemedText type="small">{hat.label}</ThemedText>
                </View>
                <ThemedText
                  type="small"
                  style={{ fontWeight: "600" }}
                >
                  {hat.credits}
                </ThemedText>
              </View>
            ))}

            <View style={styles.breakdownTotal}>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                Estimated Total
              </ThemedText>
              <ThemedText type="h3">{estimatedCredits}</ThemedText>
            </View>

            <View
              style={[
                styles.balanceIndicator,
                {
                  backgroundColor:
                    (user?.credits || 0) >= estimatedCredits
                      ? theme.success + "15"
                      : theme.error + "15",
                },
              ]}
            >
              <Feather
                name={
                  (user?.credits || 0) >= estimatedCredits
                    ? "check-circle"
                    : "alert-circle"
                }
                size={14}
                color={
                  (user?.credits || 0) >= estimatedCredits
                    ? theme.success
                    : theme.error
                }
              />
              <ThemedText
                type="caption"
                style={{
                  color:
                    (user?.credits || 0) >= estimatedCredits
                      ? theme.success
                      : theme.error,
                  fontWeight: "500",
                }}
              >
                Your balance: {user?.credits || 0} credits
              </ThemedText>
            </View>
          </Card>
        </Animated.View>
      ) : null}

      {/* Submit */}
      <Animated.View
        entering={FadeInDown.delay(400).duration(400)}
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
  hatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  hatGridItem: {
    width: "48%",
    flexGrow: 1,
  },
  hatCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  hatCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  hatIconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  hatCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  hatCreditsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  breakdownCard: {
    marginBottom: Spacing.xl,
  },
  breakdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  breakdownLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  breakdownTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  balanceIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  submitSection: {
    marginTop: Spacing.sm,
  },
  errorMessage: {
    textAlign: "center",
    marginTop: Spacing.md,
  },
});
