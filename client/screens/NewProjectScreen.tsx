import React, { useState } from "react";
import { StyleSheet, View, Pressable, Alert, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Card } from "@/components/Card";
import { HatBadge } from "@/components/HatBadge";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/query-client";
import { Spacing, BorderRadius } from "@/constants/theme";

type HatType = "designer" | "developer" | "strategist" | "manager" | "analyst";

const hatOptions: { type: HatType; label: string; credits: number }[] = [
  { type: "designer", label: "Designer", credits: 10 },
  { type: "developer", label: "Developer", credits: 15 },
  { type: "strategist", label: "Strategist", credits: 8 },
  { type: "manager", label: "Manager", credits: 5 },
  { type: "analyst", label: "Analyst", credits: 7 },
];

export default function NewProjectScreen() {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedHats, setSelectedHats] = useState<HatType[]>([]);
  const [errors, setErrors] = useState<{ name?: string; description?: string; hats?: string }>({});

  const estimatedCredits = selectedHats.reduce((sum, hat) => {
    const hatOption = hatOptions.find((h) => h.type === hat);
    return sum + (hatOption?.credits || 0);
  }, 0);

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
      navigation.goBack();
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to create project");
    },
  });

  const toggleHat = (hat: HatType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedHats((prev) =>
      prev.includes(hat) ? prev.filter((h) => h !== hat) : [...prev, hat]
    );
  };

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = "Project name is required";
    }

    if (!description.trim()) {
      newErrors.description = "Please describe your project";
    } else if (description.length < 20) {
      newErrors.description = "Please provide more details (at least 20 characters)";
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

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: insets.bottom + Spacing["4xl"],
        paddingHorizontal: Spacing.lg,
      }}
    >
      <Animated.View entering={FadeInDown.duration(500)}>
        <ThemedText type="h2" style={styles.title}>
          Start a New Project
        </ThemedText>
        <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
          Describe your MVP idea and select the expertise you need
        </ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.form}>
        <Input
          label="Project Name"
          placeholder="e.g., My Awesome App"
          value={name}
          onChangeText={setName}
          leftIcon="folder"
          error={errors.name}
          testID="input-project-name"
        />

        <View style={styles.inputGroup}>
          <ThemedText type="small" style={styles.label}>
            Project Description
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
            <Input
              placeholder="Describe your project idea, goals, and any specific requirements..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
              style={styles.textArea}
              testID="input-project-description"
            />
          </View>
          {errors.description ? (
            <ThemedText type="caption" style={[styles.error, { color: theme.error }]}>
              {errors.description}
            </ThemedText>
          ) : null}
        </View>

        <View style={styles.inputGroup}>
          <ThemedText type="small" style={styles.label}>
            Select Expertise Needed
          </ThemedText>
          <View style={styles.hatsGrid}>
            {hatOptions.map((hat) => (
              <Pressable
                key={hat.type}
                onPress={() => toggleHat(hat.type)}
                style={[
                  styles.hatOption,
                  {
                    borderColor: selectedHats.includes(hat.type)
                      ? theme.text
                      : theme.border,
                    backgroundColor: selectedHats.includes(hat.type)
                      ? theme.backgroundDefault
                      : theme.backgroundRoot,
                  },
                ]}
              >
                <HatBadge type={hat.type} size="sm" showLabel />
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  +{hat.credits} credits
                </ThemedText>
              </Pressable>
            ))}
          </View>
          {errors.hats ? (
            <ThemedText type="caption" style={[styles.error, { color: theme.error }]}>
              {errors.hats}
            </ThemedText>
          ) : null}
        </View>

        {/* Estimated Credits */}
        <Card style={styles.estimateCard}>
          <View style={styles.estimateRow}>
            <ThemedText type="body">Estimated Credits</ThemedText>
            <ThemedText type="h3">{estimatedCredits}</ThemedText>
          </View>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            Your balance: {user?.credits || 0} credits
          </ThemedText>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(500)}>
        <Button
          onPress={handleSubmit}
          loading={createProjectMutation.isPending}
          disabled={(user?.credits || 0) < estimatedCredits}
          testID="button-submit-project"
        >
          Submit Project Brief
        </Button>
        {(user?.credits || 0) < estimatedCredits ? (
          <ThemedText
            type="caption"
            style={[styles.insufficientCredits, { color: theme.error }]}
          >
            Insufficient credits. Please add more credits to continue.
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
    marginBottom: Spacing.sm,
  },
  subtitle: {
    marginBottom: Spacing.xl,
  },
  form: {
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
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
    minHeight: 120,
    textAlignVertical: "top",
    padding: Spacing.md,
  },
  error: {
    marginTop: Spacing.xs,
  },
  hatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  hatOption: {
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    minWidth: 100,
  },
  estimateCard: {
    marginTop: Spacing.md,
  },
  estimateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  insufficientCredits: {
    textAlign: "center",
    marginTop: Spacing.md,
  },
});
