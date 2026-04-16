import React from "react";
import { StyleSheet, View, Pressable, Linking, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { postTracking } from "@/lib/tracking";
import { Spacing, BorderRadius } from "@/constants/theme";

const SOCIAL_LINKS: { platform: "Instagram" | "LinkedIn"; icon: keyof typeof Feather.glyphMap; url: string }[] = [
  { platform: "Instagram", icon: "instagram", url: "https://instagram.com/startappsstudio" },
  { platform: "LinkedIn", icon: "linkedin", url: "https://linkedin.com/company/startappsstudio" },
];

export default function Footer() {
  const { theme } = useTheme();

  const handleSocialPress = (platform: "Instagram" | "LinkedIn", url: string) => {
    const pagePath =
      Platform.OS === "web" && typeof window !== "undefined"
        ? window.location.pathname
        : "/";

    // /api/track/social-click both persists a visitor_event row AND
    // sends the instant email — single write, no duplication.
    postTracking("/api/track/social-click", {
      platform,
      pagePath,
    });

    Linking.openURL(url).catch(() => {
      /* ignore */
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.socialRow}>
        {SOCIAL_LINKS.map((link) => (
          <Pressable
            key={link.platform}
            onPress={() => handleSocialPress(link.platform, link.url)}
            style={({ pressed }) => [
              styles.socialButton,
              {
                backgroundColor: theme.backgroundSecondary,
                borderColor: theme.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            testID={`button-social-${link.platform.toLowerCase()}`}
            accessibilityRole="link"
            accessibilityLabel={`Open ${link.platform}`}
          >
            <Feather name={link.icon} size={18} color={theme.text} />
          </Pressable>
        ))}
      </View>
      <ThemedText
        type="caption"
        style={{ color: theme.textTertiary, textAlign: "center" }}
      >
        create@startappsstudio.com
      </ThemedText>
      <ThemedText
        type="caption"
        style={{ color: theme.textTertiary, textAlign: "center", marginTop: 4 }}
      >
        © {new Date().getFullYear()} Start Apps Studio
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
    gap: Spacing.md,
  },
  socialRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
