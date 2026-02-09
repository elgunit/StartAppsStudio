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

  const renderPackage = ({ item, index }: { item: CreditPackage; index: number }) => {
    const custom = isCustomPackage(item);

    return (
      <Animated.View entering={FadeInDown.delay(100 + index * 50).duration(400)}>
        <Card
          style={[
            styles.packageCard,
            item.isPopular && { borderColor: theme.tabIconSelected, borderWidth: 2 },
          ]}
        >
          {item.isPopular ? (
            <View style={[styles.popularBadge, { backgroundColor: theme.tabIconSelected }]}>
              <ThemedText type="caption" style={{ color: "#FFFFFF" }}>
                Most Popular
              </ThemedText>
            </View>
          ) : null}

          <View style={styles.packageHeader}>
            <ThemedText type="h3">{item.name}</ThemedText>
            <View style={[styles.methodBadge, { backgroundColor: custom ? theme.text : theme.success + "20" }]}>
              <ThemedText type="caption" style={{ color: custom ? theme.backgroundRoot : theme.success, fontSize: 10 }}>
                {getMethodBadge(item.name)}
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.priceRow}>
            <ThemedText type="display">
              {custom ? "$7.5k+" : formatPrice(item.priceInCents)}
            </ThemedText>
          </View>

          <View style={styles.creditsRow}>
            <Feather name="zap" size={14} color={theme.tabIconSelected} />
            <ThemedText type="body" style={{ color: theme.text, fontWeight: "600" }}>
              {custom ? "Credits billed internally" : `${item.credits.toLocaleString()} credits`}
            </ThemedText>
          </View>

          {item.description ? (
            <ThemedText type="small" style={[styles.description, { color: theme.textSecondary }]}>
              {item.description}
            </ThemedText>
          ) : null}

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Feather name="clock" size={14} color={theme.textSecondary} />
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {getDeliveryTime(item.name)}
              </ThemedText>
            </View>
            {!custom ? (
              <View style={styles.detailItem}>
                <Feather name="check" size={14} color={theme.success} />
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  ${(item.priceInCents / 100 / item.credits).toFixed(2)}/credit
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
                purchaseMutation.mutate(item);
              }
            }}
            loading={!custom && purchaseMutation.isPending}
            variant={item.isPopular ? "primary" : "outline"}
            style={styles.purchaseButton}
            testID={`button-purchase-${item.id}`}
          >
            {custom ? "Contact Us" : "Purchase"}
          </Button>
        </Card>
      </Animated.View>
    );
  };

  const renderHeader = () => (
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
          <View style={[styles.creditIcon, { backgroundColor: theme.tabIconSelected + "15" }]}>
            <Feather name="zap" size={32} color={theme.tabIconSelected} />
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
});
