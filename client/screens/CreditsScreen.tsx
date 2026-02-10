import React from "react";
import { StyleSheet, View, SectionList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { formatDistanceToNow } from "date-fns";

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

interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  type: string;
  description: string | null;
  createdAt: string;
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

  const { data: transactions = [] } = useQuery<CreditTransaction[]>({
    queryKey: ["/api/credit-transactions", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const res = await fetch(`${require("@/lib/query-client").getApiUrl()}/api/credit-transactions/${user!.id}`);
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return res.json();
    },
  });

  const hasPurchasedPlan = transactions.some((t) => t.type === "purchase" && t.amount > 0);

  const purchaseMutation = useMutation({
    mutationFn: async (packageData: CreditPackage) => {
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
      queryClient.invalidateQueries({ queryKey: ["/api/credit-transactions"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const purchaseAdditionalMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/credits/add", {
        userId: user?.id,
        amount: 400,
        description: "Additional Credits (400)",
      });
      return res.json();
    },
    onSuccess: () => {
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ["/api/credit-transactions"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const formatPrice = (cents: number) => {
    if (cents >= 100000) {
      const k = cents / 100 / 1000;
      return `$${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
    }
    return `$${(cents / 100).toFixed(0)}`;
  };

  const isCustomPackage = (item: CreditPackage) => item.name === "Custom";

  const getDeliveryTime = (name: string) => {
    switch (name) {
      case "Starter": return "2-5 days";
      case "Prototype": return "5-10 days";
      case "Production": return "3-10 weeks";
      case "Custom": return "1-6 months";
      default: return "";
    }
  };

  const getMethodBadge = (name: string) => {
    return name === "Custom" ? "No AI" : "AI + Figma";
  };

  const sections = [
    { title: "balance", data: ["balance"] as const },
    ...(hasPurchasedPlan
      ? [{ title: "additional", data: ["additional"] as const }]
      : [{ title: "packages", data: packages }]),
    ...(transactions.length > 0
      ? [{ title: "history", data: transactions }]
      : []),
  ];

  const renderSectionHeader = ({ section }: any) => {
    if (section.title === "balance") return null;
    if (section.title === "additional") {
      return (
        <ThemedText type="h3" style={styles.sectionTitle}>
          Need More Credits?
        </ThemedText>
      );
    }
    if (section.title === "packages") {
      return (
        <ThemedText type="h3" style={styles.sectionTitle}>
          Choose a Package
        </ThemedText>
      );
    }
    if (section.title === "history") {
      return (
        <ThemedText type="h3" style={styles.sectionTitle}>
          Activity
        </ThemedText>
      );
    }
    return null;
  };

  const renderItem = ({ item, section, index }: any) => {
    if (section.title === "balance") {
      return (
        <Animated.View entering={FadeInDown.duration(500)}>
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
        </Animated.View>
      );
    }

    if (section.title === "additional") {
      return (
        <Animated.View entering={FadeInDown.delay(50).duration(400)}>
          <Card style={styles.packageCard}>
            <View style={styles.packageHeader}>
              <ThemedText type="h3">Additional Credits</ThemedText>
              <View style={[styles.methodBadge, { backgroundColor: theme.success + "20" }]}>
                <ThemedText type="caption" style={{ color: theme.success, fontSize: 10 }}>
                  Top-up
                </ThemedText>
              </View>
            </View>
            <View style={styles.priceRow}>
              <ThemedText type="display">$99</ThemedText>
            </View>
            <View style={styles.creditsRow}>
              <Feather name="zap" size={14} color={theme.text} />
              <ThemedText type="body" style={{ color: theme.text, fontWeight: "600" }}>
                400 credits
              </ThemedText>
            </View>
            <ThemedText type="small" style={[styles.description, { color: theme.textSecondary }]}>
              Top up your balance with additional credits anytime. Perfect for extending your current project scope.
            </ThemedText>
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Feather name="check" size={14} color={theme.success} />
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  $0.25/credit
                </ThemedText>
              </View>
              <View style={styles.detailItem}>
                <Feather name="check" size={14} color={theme.success} />
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Instant delivery
                </ThemedText>
              </View>
            </View>
            <Button
              onPress={() => purchaseAdditionalMutation.mutate()}
              loading={purchaseAdditionalMutation.isPending}
              variant="outline"
              style={styles.purchaseButton}
              testID="button-purchase-additional"
            >
              Purchase
            </Button>
          </Card>
        </Animated.View>
      );
    }

    if (section.title === "packages") {
      const pkg = item as CreditPackage;
      const custom = isCustomPackage(pkg);

      return (
        <Animated.View entering={FadeInDown.delay(100 + index * 50).duration(400)}>
          <Card
            style={[
              styles.packageCard,
              pkg.isPopular && { borderColor: theme.text, borderWidth: 2 },
            ]}
          >
            {pkg.isPopular ? (
              <View style={[styles.popularBadge, { backgroundColor: theme.text }]}>
                <ThemedText type="caption" style={{ color: theme.backgroundRoot }}>
                  Most Popular
                </ThemedText>
              </View>
            ) : null}

            <View style={styles.packageHeader}>
              <ThemedText type="h3">{pkg.name}</ThemedText>
              <View style={[styles.methodBadge, { backgroundColor: custom ? theme.text : theme.success + "20" }]}>
                <ThemedText type="caption" style={{ color: custom ? theme.backgroundRoot : theme.success, fontSize: 10 }}>
                  {getMethodBadge(pkg.name)}
                </ThemedText>
              </View>
            </View>

            <View style={styles.priceRow}>
              <ThemedText type="display">
                {custom ? "$7.5k+" : formatPrice(pkg.priceInCents)}
              </ThemedText>
            </View>

            <View style={styles.creditsRow}>
              <Feather name="zap" size={14} color={theme.text} />
              <ThemedText type="body" style={{ color: theme.text, fontWeight: "600" }}>
                {custom ? "Credits billed internally" : `${pkg.credits.toLocaleString()} credits`}
              </ThemedText>
            </View>

            {pkg.description ? (
              <ThemedText type="small" style={[styles.description, { color: theme.textSecondary }]}>
                {pkg.description}
              </ThemedText>
            ) : null}

            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Feather name="clock" size={14} color={theme.textSecondary} />
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {getDeliveryTime(pkg.name)}
                </ThemedText>
              </View>
              {!custom ? (
                <View style={styles.detailItem}>
                  <Feather name="check" size={14} color={theme.success} />
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    ${(pkg.priceInCents / 100 / pkg.credits).toFixed(2)}/credit
                  </ThemedText>
                </View>
              ) : (
                <View style={styles.detailItem}>
                  <Feather name="check" size={14} color={theme.success} />
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    10k+ users
                  </ThemedText>
                </View>
              )}
            </View>

            <Button
              onPress={() => {
                if (custom) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                } else {
                  purchaseMutation.mutate(pkg);
                }
              }}
              loading={!custom && purchaseMutation.isPending}
              variant={pkg.isPopular ? "primary" : "outline"}
              style={styles.purchaseButton}
              testID={`button-purchase-${pkg.id}`}
            >
              {custom ? "Contact Us" : "Purchase"}
            </Button>
          </Card>
        </Animated.View>
      );
    }

    if (section.title === "history") {
      const tx = item as CreditTransaction;
      const isDeduction = tx.amount < 0;
      const icon = isDeduction ? "minus-circle" : "plus-circle";
      const color = isDeduction ? theme.error : theme.success;

      return (
        <View style={[styles.transactionItem, { borderBottomColor: theme.border }]} testID={`transaction-${tx.id}`}>
          <View style={styles.transactionIcon}>
            <Feather name={icon} size={20} color={color} />
          </View>
          <View style={styles.transactionInfo}>
            <ThemedText type="small" style={{ fontWeight: "500" }}>
              {tx.description || (isDeduction ? "Credit used" : "Credits added")}
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
            </ThemedText>
          </View>
          <ThemedText type="body" style={{ color, fontWeight: "600" }}>
            {isDeduction ? "" : "+"}{tx.amount}
          </ThemedText>
        </View>
      );
    }

    return null;
  };

  return (
    <SectionList
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: insets.bottom + Spacing["4xl"],
        paddingHorizontal: Spacing.lg,
      }}
      sections={sections}
      keyExtractor={(item: any, index) => item?.id || `section-${index}`}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      stickySectionHeadersEnabled={false}
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
    marginTop: Spacing.sm,
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
  packageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  methodBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  priceRow: {
    marginTop: Spacing.sm,
  },
  creditsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  description: {
    marginBottom: Spacing.md,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  purchaseButton: {},
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    gap: Spacing.md,
  },
  transactionIcon: {
    width: 32,
    alignItems: "center",
  },
  transactionInfo: {
    flex: 1,
  },
});
