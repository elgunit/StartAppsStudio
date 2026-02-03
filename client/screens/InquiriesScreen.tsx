import React from "react";
import { StyleSheet, View, FlatList, RefreshControl, Linking } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { formatDistanceToNow } from "date-fns";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface ContactSubmission {
  id: string;
  fullName: string;
  email: string;
  company: string | null;
  budget: string | null;
  interests: string[];
  message: string;
  createdAt: string;
}

const budgetLabels: Record<string, string> = {
  starter: "$99 - Starter",
  prototype: "$299 - Prototype",
  production: "$999-3.5k - Production",
  custom: "$5k-75k - Custom",
  enterprise: "$75k+ - Enterprise",
};

const interestLabels: Record<string, string> = {
  landing: "Landing Page",
  mobile: "Mobile App",
  webapp: "Web App",
  mvp: "Full MVP",
  other: "Other",
  hiring: "Hiring a Team",
  outsourcing: "Outsourcing",
  aiml: "AI/ML",
};

export default function InquiriesScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const { data: submissions = [], isLoading, refetch } = useQuery<ContactSubmission[]>({
    queryKey: ["/api/contact-submissions"],
  });

  const renderHeader = () => (
    <Animated.View entering={FadeInDown.duration(500)}>
      <View style={styles.welcomeSection}>
        <ThemedText type="h2">Inquiries</ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {submissions.length} total
        </ThemedText>
      </View>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <EmptyState
      image={require("../../assets/images/empty-projects.png")}
      title="No Inquiries Yet"
      description="Form submissions from the landing page will appear here."
    />
  );

  const handleEmailPress = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const renderSubmission = ({ item, index }: { item: ContactSubmission; index: number }) => (
    <Animated.View entering={FadeInDown.delay(100 + index * 50).duration(400)}>
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.nameRow}>
            <ThemedText type="h4">{item.fullName}</ThemedText>
            {item.company ? (
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {item.company}
              </ThemedText>
            ) : null}
          </View>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
          </ThemedText>
        </View>

        <Card style={styles.emailRow} onPress={() => handleEmailPress(item.email)}>
          <View style={styles.emailContent}>
            <Feather name="mail" size={14} color={theme.link} />
            <ThemedText type="body" style={{ color: theme.link }}>{item.email}</ThemedText>
          </View>
          <Feather name="external-link" size={14} color={theme.textSecondary} />
        </Card>

        {item.budget ? (
          <View style={styles.row}>
            <Feather name="dollar-sign" size={14} color={theme.textSecondary} />
            <ThemedText type="body">{budgetLabels[item.budget] || item.budget}</ThemedText>
          </View>
        ) : null}

        {item.interests && item.interests.length > 0 ? (
          <View style={styles.badgesRow}>
            {item.interests.map((interest, i) => (
              <View key={i} style={[styles.badge, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                <ThemedText type="caption">{interestLabels[interest] || interest}</ThemedText>
              </View>
            ))}
          </View>
        ) : null}

        <View style={[styles.messageBox, { backgroundColor: theme.backgroundRoot }]}>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            {item.message}
          </ThemedText>
        </View>
      </Card>
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
      data={submissions}
      keyExtractor={(item) => item.id}
      renderItem={renderSubmission}
      ListHeaderComponent={renderHeader}
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
  welcomeSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  card: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  nameRow: {
    gap: Spacing.xs,
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  emailContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  messageBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
});
