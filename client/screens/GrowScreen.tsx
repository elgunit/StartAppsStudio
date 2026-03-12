import React, { useState } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  ScrollView,
  Pressable,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { formatDistanceToNow } from "date-fns";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/lib/auth";
import { Spacing, BorderRadius } from "@/constants/theme";

type ServiceCategory = "All" | "SEO" | "Content" | "Ads" | "Social" | "Email" | "Brand";

const CATEGORIES: ServiceCategory[] = [
  "All",
  "SEO",
  "Content",
  "Ads",
  "Social",
  "Email",
  "Brand",
];

const CATEGORY_DISPLAY_LABELS: Record<string, string> = {
  All: "All",
  SEO: "SEO",
  Content: "Content",
  Ads: "Paid Ads",
  Social: "Social",
  Email: "Email",
  Brand: "Brand Identity",
};

const CATEGORY_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  SEO: "search",
  Content: "file-text",
  Ads: "target",
  Social: "share-2",
  Email: "mail",
  Brand: "award",
};

const CATEGORY_COLORS: Record<string, string> = {
  SEO: "#10B981",
  Content: "#3B82F6",
  Ads: "#F59E0B",
  Social: "#8B5CF6",
  Email: "#EF4444",
  Brand: "#EC4899",
};

const ORDER_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  submitted: { label: "Submitted", color: "#F59E0B" },
  in_progress: { label: "In Progress", color: "#3B82F6" },
  delivered: { label: "Delivered", color: "#10B981" },
};

export default function GrowScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] =
    useState<ServiceCategory>("All");

  const {
    data: services = [],
    isLoading: servicesLoading,
    refetch: refetchServices,
  } = useQuery<any[]>({
    queryKey: ["/api/marketing/services"],
  });

  const {
    data: orders = [],
    isLoading: ordersLoading,
    refetch: refetchOrders,
  } = useQuery<any[]>({
    queryKey: ["/api/marketing/orders", `?clientId=${user?.id}`],
    enabled: !!user,
  });

  const filteredServices =
    selectedCategory === "All"
      ? services
      : services.filter((s) => s.category === selectedCategory);

  const activeOrders = orders.filter((o) => o.status !== "delivered");
  const pastOrders = orders.filter((o) => o.status === "delivered");

  const handleRefresh = () => {
    refetchServices();
    refetchOrders();
  };

  const renderHeader = () => (
    <Animated.View entering={FadeInDown.duration(500)}>
      <ThemedText type="h2" style={styles.pageTitle}>
        Grow Your Reach
      </ThemedText>
      <ThemedText
        type="body"
        style={[styles.pageSubtitle, { color: theme.textSecondary }]}
      >
        Marketing & SEO services to help your MVP reach users
      </ThemedText>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        style={styles.chipScroll}
      >
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <Pressable
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              testID={`chip-${cat}`}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected
                    ? isDark
                      ? "#FFFFFF"
                      : "#000000"
                    : isDark
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.05)",
                },
              ]}
            >
              {cat !== "All" && CATEGORY_ICONS[cat] ? (
                <Feather
                  name={CATEGORY_ICONS[cat]}
                  size={13}
                  color={
                    isSelected
                      ? isDark
                        ? "#000000"
                        : "#FFFFFF"
                      : theme.textSecondary
                  }
                />
              ) : null}
              <ThemedText
                type="caption"
                style={{
                  fontWeight: "600",
                  color: isSelected
                    ? isDark
                      ? "#000000"
                      : "#FFFFFF"
                    : theme.textSecondary,
                }}
              >
                {CATEGORY_DISPLAY_LABELS[cat] || cat}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <ThemedText type="h3">Services</ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {filteredServices.length} available
        </ThemedText>
      </View>
    </Animated.View>
  );

  const renderServiceCard = ({
    item,
    index,
  }: {
    item: any;
    index: number;
  }) => {
    const catColor = CATEGORY_COLORS[item.category] || theme.info;
    return (
      <Animated.View
        entering={FadeInDown.delay(80 + index * 40).duration(350)}
      >
        <Card style={styles.serviceCard} testID={`service-${item.id}`}>
          <View style={styles.serviceHeader}>
            <View style={styles.serviceInfo}>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: catColor + "18" },
                ]}
              >
                {CATEGORY_ICONS[item.category] ? (
                  <Feather
                    name={CATEGORY_ICONS[item.category]}
                    size={11}
                    color={catColor}
                  />
                ) : null}
                <ThemedText
                  type="caption"
                  style={{
                    color: catColor,
                    fontWeight: "600",
                    fontSize: 11,
                  }}
                >
                  {item.category}
                </ThemedText>
              </View>
              <View style={styles.creditsBadge}>
                <Feather
                  name="zap"
                  size={11}
                  color={theme.textSecondary}
                />
                <ThemedText
                  type="caption"
                  style={{
                    fontWeight: "700",
                    color: theme.text,
                  }}
                >
                  {item.creditsRequired}
                </ThemedText>
              </View>
            </View>
            <ThemedText type="h4" style={styles.serviceName}>
              {item.name}
            </ThemedText>
            <ThemedText
              type="small"
              style={{ color: theme.textSecondary }}
              numberOfLines={2}
            >
              {item.description}
            </ThemedText>
          </View>

          <View
            style={[styles.divider, { backgroundColor: theme.border }]}
          />

          <View style={styles.deliverablesList}>
            {(item.deliverables || []).map((d: string, i: number) => (
              <View key={i} style={styles.deliverableRow}>
                <Feather
                  name="check"
                  size={12}
                  color={theme.success}
                />
                <ThemedText
                  type="caption"
                  style={{ color: theme.textSecondary, flex: 1 }}
                >
                  {d}
                </ThemedText>
              </View>
            ))}
          </View>

          <Pressable
            onPress={() =>
              navigation.navigate("RequestService", { serviceId: item.id })
            }
            testID={`button-request-${item.id}`}
            style={({ pressed }) => [
              styles.requestButton,
              {
                backgroundColor: isDark ? "#FFFFFF" : "#000000",
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <ThemedText
              type="small"
              style={{
                color: isDark ? "#000000" : "#FFFFFF",
                fontWeight: "600",
              }}
            >
              Request Service
            </ThemedText>
          </Pressable>
        </Card>
      </Animated.View>
    );
  };

  const renderFooter = () => {
    if (activeOrders.length === 0 && pastOrders.length === 0) return null;

    return (
      <View style={styles.ordersSection}>
        {activeOrders.length > 0 ? (
          <>
            <View style={styles.sectionHeader}>
              <ThemedText type="h3">Active Orders</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {activeOrders.length}
              </ThemedText>
            </View>
            {activeOrders.map((order, index) => (
              <Animated.View
                key={order.id}
                entering={FadeInDown.delay(50 + index * 30).duration(300)}
              >
                <OrderCard order={order} theme={theme} isDark={isDark} />
              </Animated.View>
            ))}
          </>
        ) : null}

        {pastOrders.length > 0 ? (
          <>
            <View style={[styles.sectionHeader, { marginTop: Spacing.lg }]}>
              <ThemedText type="h3">Completed</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {pastOrders.length}
              </ThemedText>
            </View>
            {pastOrders.map((order, index) => (
              <Animated.View
                key={order.id}
                entering={FadeInDown.delay(50 + index * 30).duration(300)}
              >
                <OrderCard order={order} theme={theme} isDark={isDark} />
              </Animated.View>
            ))}
          </>
        ) : null}
      </View>
    );
  };

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
      data={filteredServices}
      keyExtractor={(item) => item.id}
      renderItem={renderServiceCard}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      refreshControl={
        <RefreshControl
          refreshing={servicesLoading || ordersLoading}
          onRefresh={handleRefresh}
        />
      }
    />
  );
}

function OrderCard({
  order,
  theme,
  isDark,
}: {
  order: any;
  theme: any;
  isDark: boolean;
}) {
  const statusInfo = ORDER_STATUS_LABELS[order.status] || {
    label: order.status,
    color: theme.textSecondary,
  };
  const catColor =
    CATEGORY_COLORS[order.service?.category] || theme.info;

  return (
    <Card style={styles.orderCard} testID={`order-${order.id}`}>
      <View style={styles.orderHeader}>
        <View style={{ flex: 1 }}>
          <ThemedText type="small" style={{ fontWeight: "600" }}>
            {order.service?.name || "Service"}
          </ThemedText>
          <ThemedText
            type="caption"
            style={{ color: theme.textSecondary, marginTop: 2 }}
            numberOfLines={1}
          >
            {order.goals}
          </ThemedText>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusInfo.color + "18" },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: statusInfo.color },
            ]}
          />
          <ThemedText
            type="caption"
            style={{
              color: statusInfo.color,
              fontWeight: "600",
              fontSize: 11,
            }}
          >
            {statusInfo.label}
          </ThemedText>
        </View>
      </View>
      <View style={styles.orderFooter}>
        <View style={styles.orderMeta}>
          <Feather name="zap" size={11} color={theme.textTertiary} />
          <ThemedText type="caption" style={{ color: theme.textTertiary }}>
            {order.creditsCharged} credits
          </ThemedText>
        </View>
        <ThemedText type="caption" style={{ color: theme.textTertiary }}>
          {formatDistanceToNow(new Date(order.createdAt), {
            addSuffix: true,
          })}
        </ThemedText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pageTitle: {
    marginBottom: Spacing.xs,
  },
  pageSubtitle: {
    marginBottom: Spacing.lg,
  },
  chipScroll: {
    marginBottom: Spacing.xl,
    marginHorizontal: -Spacing.lg,
  },
  chipRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  serviceCard: {
    marginBottom: Spacing.md,
  },
  serviceHeader: {
    marginBottom: Spacing.sm,
  },
  serviceInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  creditsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  serviceName: {
    marginBottom: Spacing.xs,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.sm,
  },
  deliverablesList: {
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  deliverableRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  requestButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  ordersSection: {
    marginTop: Spacing.xl,
  },
  orderCard: {
    marginBottom: Spacing.sm,
  },
  orderHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  orderMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
