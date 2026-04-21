import React, { useState } from "react";
import { StyleSheet, View, Image, Alert, Pressable, Platform, Linking, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/query-client";
import { Spacing, BorderRadius } from "@/constants/theme";

export default function AccountScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { user, logout, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);

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

  const handleAvatarPress = async () => {
    if (!user || uploading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    let permission = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      if (permission.status === "denied" && !permission.canAskAgain) {
        if (Platform.OS !== "web") {
          try {
            await Linking.openSettings();
          } catch {
            // ignore
          }
        }
        return;
      }
      permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];

    setUploading(true);
    let base64: string | undefined;
    try {
      // Downscale aggressively to 256px JPEG so the resulting data URI is well
      // under any reverse-proxy body limit (typical result: 20-60KB raw, ~30-80KB base64).
      const manipulated = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: 256, height: 256 } }],
        {
          compress: 0.6,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        },
      );
      base64 = manipulated.base64 ?? "";
    } catch (error) {
      console.error("Image processing failed", error);
      setUploading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Couldn't read that photo",
        "We weren't able to process that image. Try picking a different one.",
      );
      return;
    }

    if (!base64) {
      setUploading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Couldn't read that photo",
        "We weren't able to process that image. Try picking a different one.",
      );
      return;
    }

    try {
      const dataUri = `data:image/jpeg;base64,${base64}`;
      await updateUser({ avatarUrl: dataUri });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Photo updated", "Your new profile picture has been saved.");
    } catch (error) {
      console.error("Avatar upload failed", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const message = error instanceof Error ? error.message : String(error);
      if (/^401:/.test(message)) {
        Alert.alert(
          "Please sign in again",
          "Your session has expired. Sign back in and try uploading your photo again.",
          [{ text: "OK", onPress: () => logout() }],
        );
      } else if (/^413:/.test(message) || /too large/i.test(message)) {
        Alert.alert(
          "Photo is too large",
          "That image was too big to upload. Try a different photo.",
        );
      } else {
        Alert.alert(
          "Couldn't update your photo",
          `Something went wrong saving your picture. Please try again.\n\nDetails: ${message.slice(0, 140)}`,
        );
      }
    } finally {
      setUploading(false);
    }
  };

  const menuItems = [
    {
      icon: "credit-card" as const,
      label: "Credits & Billing",
      onPress: () => navigation.navigate("Credits"),
      visible: user?.role === "client",
    },
    {
      icon: "book-open" as const,
      label: "Journal",
      onPress: () => navigation.navigate("JournalList"),
      visible: true,
    },
    {
      icon: "bell" as const,
      label: "Notifications",
      onPress: () => navigation.navigate("Notifications"),
      visible: true,
    },
    {
      icon: "help-circle" as const,
      label: "Help & Support",
      onPress: () => navigation.navigate("Help"),
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
        <Pressable
          onPress={handleAvatarPress}
          disabled={uploading}
          testID="button-edit-avatar"
          style={({ pressed }) => [
            styles.avatarPress,
            { opacity: pressed || uploading ? 0.85 : 1 },
          ]}
        >
          <Image
            source={
              user?.avatarUrl
                ? { uri: user.avatarUrl }
                : require("../../assets/images/avatar-default.png")
            }
            style={styles.avatar}
          />
          {uploading ? (
            <View style={[styles.avatarOverlay, { backgroundColor: "rgba(0,0,0,0.45)" }]}>
              <ActivityIndicator color="#fff" />
            </View>
          ) : null}
          <View
            style={[
              styles.avatarEdit,
              { backgroundColor: theme.text, borderColor: theme.backgroundRoot },
            ]}
          >
            <Feather
              name="camera"
              size={14}
              color={theme.backgroundRoot}
            />
          </View>
        </Pressable>
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
                testID="button-account-add-more"
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
            <Card
              key={index}
              onPress={item.onPress}
              style={styles.menuItem}
              testID={`menu-${item.icon}`}
            >
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
  avatarPress: {
    marginBottom: Spacing.md,
    position: "relative",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEdit: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
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
