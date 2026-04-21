import React, { useState } from "react";
import { StyleSheet, View, Switch, ScrollView } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

type Pref = {
  key: string;
  icon: keyof typeof Feather.glyphMap;
  label: string;
  description: string;
  defaultOn: boolean;
};

const PREFS: Pref[] = [
  {
    key: "project_updates",
    icon: "activity",
    label: "Project updates",
    description: "Status changes, milestones, and version drops on your projects.",
    defaultOn: true,
  },
  {
    key: "message_replies",
    icon: "message-circle",
    label: "Message replies",
    description: "New replies from the studio inside your project chats.",
    defaultOn: true,
  },
  {
    key: "weekly_digest",
    icon: "calendar",
    label: "Weekly digest",
    description: "Friday roundup of progress, decisions, and what's next.",
    defaultOn: false,
  },
  {
    key: "journal",
    icon: "book-open",
    label: "Journal & studio notes",
    description: "Occasional posts when we publish something we think you'll want.",
    defaultOn: false,
  },
];

export default function NotificationsScreen() {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(PREFS.map((p) => [p.key, p.defaultOn]))
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: insets.bottom + Spacing["4xl"],
        paddingHorizontal: Spacing.lg,
      }}
    >
      <Animated.View entering={FadeInDown.duration(400)}>
        <ThemedText type="h2">Notifications</ThemedText>
        <ThemedText
          type="small"
          style={{ color: theme.textSecondary, marginTop: Spacing.xs, marginBottom: Spacing.xl }}
        >
          Choose what we ping you about. You can change these any time.
        </ThemedText>
      </Animated.View>

      {PREFS.map((pref, index) => (
        <Animated.View
          key={pref.key}
          entering={FadeInDown.delay(80 + index * 50).duration(400)}
        >
          <Card style={styles.row} testID={`row-pref-${pref.key}`}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconCircle, { backgroundColor: theme.backgroundDefault }]}>
                <Feather name={pref.icon} size={18} color={theme.text} />
              </View>
              <View style={styles.rowText}>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  {pref.label}
                </ThemedText>
                <ThemedText
                  type="caption"
                  style={{ color: theme.textSecondary, marginTop: 2 }}
                >
                  {pref.description}
                </ThemedText>
              </View>
            </View>
            <Switch
              value={prefs[pref.key]}
              onValueChange={(v) => setPrefs((prev) => ({ ...prev, [pref.key]: v }))}
              testID={`switch-${pref.key}`}
            />
          </Card>
        </Animated.View>
      ))}

      <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.footer}>
        <ThemedText type="caption" style={{ color: theme.textTertiary, textAlign: "center" }}>
          Push notifications need to be enabled in your device settings before any of these can reach you.
        </ThemedText>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  rowLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: { flex: 1 },
  footer: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
});
