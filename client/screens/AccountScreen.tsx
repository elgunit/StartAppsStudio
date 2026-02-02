import React from "react";
import { StyleSheet, View, Image, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/lib/auth";
import { Spacing, BorderRadius } from "@/constants/theme";

export default function AccountScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: logout,
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: "credit-card" as const,
      label: "Credits & Billing",
      onPress: () => navigation.navigate("Credits"),
      visible: user?.role === "client",
    },
    {
      icon: "bell" as const,
      label: "Notifications",
      onPress: () => {},
      visible: true,
    },
    {
      icon: "help-circle" as const,
      label: "Help & Support",
      onPress: () => {},
      visible: true,
    },
  ];

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      {/* Profile Section */}
      <Animated.View entering={FadeInDown.duration(500)} style={styles.profileSection}>
        <Image
          source={
            user?.avatarUrl
              ? { uri: user.avatarUrl }
              : require("../../assets/images/avatar-default.png")
          }
          style={styles.avatar}
        />
        <ThemedText type="h2">{user?.name}</ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {user?.email}
        </ThemedText>
        {user?.role === "designer" ? (
          <View style={[styles.roleBadge, { backgroundColor: theme.text }]}>
            <ThemedText type="caption" style={{ color: theme.backgroundRoot }}>
              Designer
            </ThemedText>
          </View>
        ) : null}
      </Animated.View>

      {/* Credits for Clients */}
      {user?.role === "client" ? (
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <Card style={styles.creditsCard}>
            <View style={styles.creditsRow}>
              <View>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Credit Balance
                </ThemedText>
                <ThemedText type="h1">{user.credits}</ThemedText>
              </View>
              <Button
                variant="outline"
                size="sm"
                onPress={() => navigation.navigate("Credits")}
              >
                Add More
              </Button>
            </View>
          </Card>
        </Animated.View>
      ) : null}

      {/* Menu Items */}
      <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.menuSection}>
        {menuItems
          .filter((item) => item.visible)
          .map((item, index) => (
            <Card key={index} onPress={item.onPress} style={styles.menuItem}>
              <View style={styles.menuItemContent}>
                <View style={[styles.iconContainer, { backgroundColor: theme.backgroundDefault }]}>
                  <Feather name={item.icon} size={20} color={theme.text} />
                </View>
                <ThemedText type="body">{item.label}</ThemedText>
              </View>
              <Feather name="chevron-right" size={20} color={theme.textTertiary} />
            </Card>
          ))}
      </Animated.View>

      {/* Sign Out */}
      <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.signOutSection}>
        <Button
          variant="outline"
          onPress={handleLogout}
          testID="button-logout"
        >
          Sign Out
        </Button>
      </Animated.View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: Spacing.md,
  },
  roleBadge: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  creditsCard: {
    marginBottom: Spacing.xl,
  },
  creditsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menuSection: {
    marginBottom: Spacing.xl,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  signOutSection: {},
});
