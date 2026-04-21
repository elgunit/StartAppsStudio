import React, { useState } from "react";
import { StyleSheet, View, ScrollView, Pressable, Linking, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

const SUPPORT_EMAIL = "hello@startappsstudio.com";

const FAQS: { q: string; a: string }[] = [
  {
    q: "How does pricing work?",
    a: "Mockup, Prototype, and MVP plans are flat fees that get attached to a project. Custom builds are scoped together. You can also top up any project with extra credits at $99 for 400 credits.",
  },
  {
    q: "How long does a project take?",
    a: "Mockups land in 2-5 days, prototypes in 5-10 days, and MVPs in 3-10 weeks. Custom builds run 1-6 months depending on scope. We share a delivery date the moment we accept the brief.",
  },
  {
    q: "Can I cancel a project?",
    a: "Yes, while it's still in Brief Submitted state. Once we accept and start work, cancelling moves into a conversation so we can refund unused credits.",
  },
  {
    q: "Where do my files live?",
    a: "Designs go in Figma, code in a private GitHub repo, and any deliverables stay attached to the project chat. You keep full ownership.",
  },
  {
    q: "Who do I talk to during the build?",
    a: "One studio lead per project, plus the specialist whose hat is currently on. The Expertise card on each project shows who that is right now.",
  },
];

export default function HelpScreen() {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [open, setOpen] = useState<number | null>(0);

  const handleEmail = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const url = `mailto:${SUPPORT_EMAIL}?subject=Start%20Apps%20Studio%20-%20Support`;
    try {
      const ok = await Linking.canOpenURL(url);
      if (ok) await Linking.openURL(url);
    } catch {
      // ignore — best-effort on web
    }
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
      <Animated.View entering={FadeInDown.duration(400)}>
        <ThemedText type="h2">Help & Support</ThemedText>
        <ThemedText
          type="small"
          style={{ color: theme.textSecondary, marginTop: Spacing.xs, marginBottom: Spacing.xl }}
        >
          A real person reads every email. Usually back within a few hours.
        </ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(400)}>
        <Card style={styles.contactCard}>
          <View style={styles.contactRow}>
            <View style={[styles.iconCircle, { backgroundColor: theme.backgroundDefault }]}>
              <Feather name="mail" size={20} color={theme.text} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                Email the studio
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                {SUPPORT_EMAIL}
              </ThemedText>
            </View>
          </View>
          <Button
            onPress={handleEmail}
            style={styles.emailButton}
            testID="button-email-support"
          >
            {Platform.OS === "web" ? "Open email" : "Send email"}
          </Button>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(150).duration(400)}>
        <Card
          onPress={() => navigation.navigate("JournalList")}
          style={styles.linkCard}
          testID="card-journal-link"
        >
          <View style={styles.contactRow}>
            <View style={[styles.iconCircle, { backgroundColor: theme.backgroundDefault }]}>
              <Feather name="book-open" size={20} color={theme.text} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                Studio journal
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                How we build, what we learned, what we'd do differently.
              </ThemedText>
            </View>
            <Feather name="chevron-right" size={20} color={theme.textTertiary} />
          </View>
        </Card>
      </Animated.View>

      <ThemedText type="h3" style={styles.faqTitle}>
        FAQ
      </ThemedText>

      {FAQS.map((faq, i) => {
        const isOpen = open === i;
        return (
          <Animated.View
            key={faq.q}
            entering={FadeInDown.delay(220 + i * 40).duration(400)}
          >
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                setOpen(isOpen ? null : i);
              }}
              testID={`faq-${i}`}
            >
              <Card style={styles.faqCard}>
                <View style={styles.faqHeader}>
                  <ThemedText type="body" style={[styles.faqQ, { flex: 1 }]}>
                    {faq.q}
                  </ThemedText>
                  <Feather
                    name={isOpen ? "minus" : "plus"}
                    size={18}
                    color={theme.textSecondary}
                  />
                </View>
                {isOpen ? (
                  <ThemedText
                    type="small"
                    style={{ color: theme.textSecondary, marginTop: Spacing.sm }}
                  >
                    {faq.a}
                  </ThemedText>
                ) : null}
              </Card>
            </Pressable>
          </Animated.View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contactCard: { marginBottom: Spacing.md },
  linkCard: { marginBottom: Spacing.lg },
  contactRow: {
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
  emailButton: {
    marginTop: Spacing.md,
  },
  faqTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  faqCard: {
    marginBottom: Spacing.sm,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  faqQ: {
    fontWeight: "600",
  },
});
