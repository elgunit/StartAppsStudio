import React, { useState, useMemo } from "react";
import { StyleSheet, View, ScrollView, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
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
import { apiRequest, getApiUrl } from "@/lib/query-client";
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
  projectId: string | null;
  amount: number;
  type: string;
  description: string | null;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  planTier: string | null;
  status: string;
  usedCredits: number;
  estimatedCredits: number;
}

const TIER_ORDER = ["Starter", "Prototype", "Production", "Custom"];

export default function CreditsScreen() {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user, refreshUser } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const queryClient = useQueryClient();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const { data: packages = [] } = useQuery<CreditPackage[]>({
    queryKey: ["/api/credit-packages"],
  });

  const { data: allProjects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects", { clientId: user?.id }],
    enabled: !!user?.id,
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/projects?clientId=${user!.id}`);
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
  });

  const { data: transactions = [] } = useQuery<CreditTransaction[]>({
    queryKey: ["/api/credit-transactions", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/credit-transactions/${user!.id}`);
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return res.json();
    },
  });

  const selectedProject = useMemo(() => {
    if (selectedProjectId) return allProjects.find((p) => p.id === selectedProjectId);
    if (allProjects.length > 0) return allProjects[0];
    return null;
  }, [selectedProjectId, allProjects]);

  const currentTierIndex = useMemo(() => {
    if (!selectedProject?.planTier) return -1;
    return TIER_ORDER.indexOf(selectedProject.planTier);
  }, [selectedProject]);

  const hasPlan = currentTierIndex >= 0;

  const visiblePackages = useMemo(() => {
    return packages.filter((pkg) => {
      const pkgIndex = TIER_ORDER.indexOf(pkg.name);
      return pkgIndex > currentTierIndex;
    });
  }, [packages, currentTierIndex]);

  const purchaseMutation = useMutation({
    mutationFn: async (packageData: CreditPackage) => {
      if (!selectedProject) throw new Error("No project selected");
      const res = await apiRequest("POST", "/api/credits/purchase", {
        userId: user?.id,
        projectId: selectedProject.id,
        packageId: packageData.id,
      });
      return res.json();
    },
    onSuccess: () => {
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/credit-transactions"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  // Project-attached top-up (used when a project is selected and active).
  const purchaseAdditionalMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProject) throw new Error("No project selected");
      const res = await apiRequest("POST", "/api/credits/add", {
        userId: user?.id,
        amount: 400,
        description: `Additional Credits for ${selectedProject.name}`,
        projectId: selectedProject.id,
      });
      return res.json();
    },
    onSuccess: () => {
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ["/api/credit-transactions"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  // Project-agnostic top-up — anyone can buy this regardless of project state.
  const topupMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/credits/topup", {
        userId: user?.id,
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

  const renderCurrentPlan = () => {
    if (!selectedProject?.planTier) return null;
    const currentPkg = packages.find((p) => p.name === selectedProject.planTier);
    if (!currentPkg) return null;

    return (
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <Card style={[styles.currentPlanCard, { borderColor: theme.success, borderWidth: 2 }]}>
          <View style={[styles.currentPlanBadge, { backgroundColor: theme.success }]}>
            <ThemedText type="caption" style={{ color: "#FFFFFF" }}>
              Active Plan
            </ThemedText>
          </View>
          <View style={styles.packageHeader}>
            <ThemedText type="h3">{currentPkg.name}</ThemedText>
            <View style={styles.creditsRow}>
              <Feather name="zap" size={14} color={theme.text} />
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                {currentPkg.credits.toLocaleString()} credits
              </ThemedText>
            </View>
          </View>
          <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
            {getDeliveryTime(currentPkg.name)} delivery
          </ThemedText>
        </Card>
      </Animated.View>
    );
  };

  const renderAdditionalCreditsCard = () => {
    // Show the top-up card to every client. If a project is selected and active,
    // attribute the top-up to that project; otherwise it goes to the user balance.
    const attachable = !!selectedProject && hasPlan;
    const isPending = attachable
      ? purchaseAdditionalMutation.isPending
      : topupMutation.isPending;

    return (
      <Animated.View entering={FadeInDown.delay(150).duration(400)}>
        <Card style={styles.packageCard}>
          <View style={styles.packageHeader}>
            <ThemedText type="h3">Credit top-up</ThemedText>
            <View style={[styles.methodBadge, { backgroundColor: theme.success + "20" }]}>
              <ThemedText type="caption" style={{ color: theme.success, fontSize: 10 }}>
                Always available
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
            {attachable
              ? `Top up ${selectedProject!.name} with extra credits whenever scope grows.`
              : "Add credits to your account now. They'll attach to your next project automatically, or to any project you pick later."}
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
            onPress={() => {
              if (attachable) purchaseAdditionalMutation.mutate();
              else topupMutation.mutate();
            }}
            loading={isPending}
            variant={allProjects.length === 0 ? "primary" : "outline"}
            style={styles.purchaseButton}
            testID="button-purchase-additional"
          >
            Purchase top-up
          </Button>
        </Card>
      </Animated.View>
    );
  };

  const renderPackageCard = (pkg: CreditPackage, index: number) => {
    const custom = pkg.name === "Custom";
    const isUpgrade = hasPlan;

    return (
      <Animated.View key={pkg.id} entering={FadeInDown.delay(200 + index * 50).duration(400)}>
        <Card
          style={[
            styles.packageCard,
            pkg.isPopular && !isUpgrade && { borderColor: theme.text, borderWidth: 2 },
          ]}
        >
          {pkg.isPopular && !isUpgrade ? (
            <View style={[styles.popularBadge, { backgroundColor: theme.text }]}>
              <ThemedText type="caption" style={{ color: theme.backgroundRoot }}>
                Most Popular
              </ThemedText>
            </View>
          ) : null}

          {isUpgrade ? (
            <View style={[styles.upgradeBadge, { backgroundColor: theme.info + "20" }]}>
              <Feather name="arrow-up" size={10} color={theme.info} />
              <ThemedText type="caption" style={{ color: theme.info, fontSize: 10 }}>
                Upgrade
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
            variant={pkg.isPopular && !isUpgrade ? "primary" : "outline"}
            style={styles.purchaseButton}
            testID={`button-purchase-${pkg.id}`}
          >
            {custom ? "Contact Us" : isUpgrade ? "Upgrade" : "Purchase"}
          </Button>
        </Card>
      </Animated.View>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: insets.bottom + Spacing["4xl"],
        paddingHorizontal: Spacing.lg,
      }}
    >
      {/* Balance Card */}
      <Animated.View entering={FadeInDown.duration(500)}>
        <Card style={styles.balanceCard}>
          <View style={styles.balanceContent}>
            <View>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Total Balance
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

      {/* Project Selector */}
      {allProjects.length > 0 ? (
        <View style={styles.projectSection}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Select Project
          </ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.projectScroll}>
            {allProjects.map((project) => {
              const isSelected = selectedProject?.id === project.id;
              return (
                <Pressable
                  key={project.id}
                  onPress={() => {
                    setSelectedProjectId(project.id);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  testID={`project-chip-${project.id}`}
                >
                  <View
                    style={[
                      styles.projectChip,
                      {
                        backgroundColor: isSelected ? theme.text : theme.backgroundDefault,
                        borderColor: isSelected ? theme.text : theme.border,
                      },
                    ]}
                  >
                    <ThemedText
                      type="small"
                      style={{
                        color: isSelected ? theme.backgroundRoot : theme.text,
                        fontWeight: isSelected ? "600" : "400",
                      }}
                    >
                      {project.name}
                    </ThemedText>
                    {project.planTier ? (
                      <View style={[styles.tierDot, { backgroundColor: isSelected ? theme.backgroundRoot : theme.success }]}>
                        <ThemedText
                          type="caption"
                          style={{
                            color: isSelected ? theme.text : "#FFFFFF",
                            fontSize: 9,
                          }}
                        >
                          {project.planTier}
                        </ThemedText>
                      </View>
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      {/* Current Plan (if project has one) */}
      {renderCurrentPlan()}

      {/* Additional Credits (shown when project has a plan) */}
      {renderAdditionalCreditsCard()}

      {/* Available Plans / Upgrade Options */}
      {visiblePackages.length > 0 && selectedProject ? (
        <View style={styles.packagesSection}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            {hasPlan ? "Upgrade Options" : "Choose a Plan"}
          </ThemedText>
          <ThemedText type="small" style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            {hasPlan
              ? `Upgrade ${selectedProject.name} to unlock more credits`
              : `Select a plan for ${selectedProject.name}`}
          </ThemedText>
          {visiblePackages.map((pkg, index) => renderPackageCard(pkg, index))}
        </View>
      ) : null}

      {/* No projects upsell */}
      {allProjects.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="folder-plus" size={40} color={theme.textSecondary} />
          <ThemedText type="h3" style={{ textAlign: "center", marginTop: Spacing.md }}>
            Pick a plan when you're ready
          </ThemedText>
          <ThemedText
            type="small"
            style={{
              color: theme.textSecondary,
              textAlign: "center",
              marginTop: Spacing.xs,
              marginBottom: Spacing.lg,
              maxWidth: 320,
            }}
          >
            Plans attach to a specific project, so start one and you'll be able to choose Mockup, Prototype, MVP, or Custom right after submitting your brief. Need credits for a future project? The top-up above adds them to your account.
          </ThemedText>
          <Button
            onPress={() => navigation.navigate("NewProject")}
            testID="button-empty-start-project"
            style={{ minWidth: 220 }}
          >
            Start a new project
          </Button>
        </View>
      ) : null}

      {/* Transaction History */}
      {transactions.length > 0 ? (
        <View style={styles.historySection}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Activity
          </ThemedText>
          {transactions.map((tx) => {
            const isDeduction = tx.amount < 0;
            const icon = isDeduction ? "minus-circle" : "plus-circle";
            const color = isDeduction ? theme.error : theme.success;

            return (
              <View key={tx.id} style={[styles.transactionItem, { borderBottomColor: theme.border }]} testID={`transaction-${tx.id}`}>
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
          })}
        </View>
      ) : null}
    </ScrollView>
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
  projectSection: {
    marginBottom: Spacing.lg,
  },
  projectScroll: {
    flexGrow: 0,
  },
  projectChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  tierDot: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 1,
    borderRadius: BorderRadius.sm,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
  },
  sectionSubtitle: {
    marginBottom: Spacing.lg,
  },
  currentPlanCard: {
    marginBottom: Spacing.md,
    position: "relative",
  },
  currentPlanBadge: {
    position: "absolute",
    top: -10,
    right: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  packagesSection: {
    marginTop: Spacing.md,
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
  upgradeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
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
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["4xl"],
  },
  historySection: {
    marginTop: Spacing.xl,
  },
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
