import React from "react";
import { StyleSheet, View, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/query-client";
import { Spacing, BorderRadius } from "@/constants/theme";

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  priceInCents: number;
  description: string | null;
  isPopular: boolean;
}

export default function CreditsScreen() {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: packages = [] } = useQuery<CreditPackage[]>({
    queryKey: ["/api/credit-packages"],
  });

  const purchaseMutation = useMutation({
    mutationFn: async (packageData: CreditPackage) => {
      // In a real app, this would go through Stripe
      // For now, we'll simulate a purchase
      const res = await apiRequest("POST", "/api/credits/add", {
        userId: user?.id,
        amount: packageData.credits,
        description: `Purchased ${packageData.name}`,
      });
      return res.json();
    },
    onSuccess: () => {
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ["/api/credit-packages"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`;
  };

  const renderPackage = ({ item, index }: { item: CreditPackage; index: number }) => (
    <Animated.View entering={FadeInDown.delay(100 + index * 50).duration(400)}>
      <Card
        style={[
          styles.packageCard,
          item.isPopular && { borderColor: theme.text, borderWidth: 2 },
        ]}
      >
        {item.isPopular ? (
          <View style={[styles.popularBadge, { backgroundColor: theme.text }]}>
            <ThemedText type="caption" style={{ color: theme.backgroundRoot }}>
              Most Popular
            </ThemedText>
          </View>
        ) : null}

        <ThemedText type="h3">{item.name}</ThemedText>
        
        <View style={styles.priceRow}>
          <ThemedText type="display">{formatPrice(item.priceInCents)}</ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            {" "}/ {item.credits} credits
          </ThemedText>
        </View>

        {item.description ? (
          <ThemedText type="small" style={[styles.description, { color: theme.textSecondary }]}>
            {item.description}
          </ThemedText>
        ) : null}

        <View style={styles.valueRow}>
          <Feather name="check" size={16} color={theme.success} />
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            ${(item.priceInCents / 100 / item.credits).toFixed(2)} per credit
          </ThemedText>
        </View>

        <Button
          onPress={() => purchaseMutation.mutate(item)}
          loading={purchaseMutation.isPending}
          variant={item.isPopular ? "primary" : "outline"}
          style={styles.purchaseButton}
          testID={`button-purchase-${item.id}`}
        >
          Purchase
        </Button>
      </Card>
    </Animated.View>
  );

  const renderHeader = () => (
    <Animated.View entering={FadeInDown.duration(500)}>
      {/* Current Balance */}
      <Card style={styles.balanceCard}>
        <View style={styles.balanceContent}>
          <View>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Current Balance
            </ThemedText>
            <ThemedText type="display">{user?.credits || 0}</ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              credits available
            </ThemedText>
          </View>
          <View style={[styles.creditIcon, { backgroundColor: theme.backgroundDefault }]}>
            <Feather name="zap" size={32} color={theme.text} />
          </View>
        </View>
      </Card>

      <ThemedText type="h3" style={styles.sectionTitle}>
        Choose a Package
      </ThemedText>
    </Animated.View>
  );

  return (
    <FlatList
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: insets.bottom + Spacing["4xl"],
        paddingHorizontal: Spacing.lg,
      }}
      data={packages}
      keyExtractor={(item) => item.id}
      renderItem={renderPackage}
      ListHeaderComponent={renderHeader}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  balanceCard: {
    marginBottom: Spacing.xl,
  },
  balanceContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  creditIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  packageCard: {
    marginBottom: Spacing.md,
    position: "relative",
  },
  popularBadge: {
    position: "absolute",
    top: -10,
    right: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  description: {
    marginBottom: Spacing.md,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  purchaseButton: {},
});
