import React, { useState } from "react";
import { StyleSheet, View, Pressable, Linking } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { trackVisitorEvent } from "@/lib/tracking";
import { apiRequest } from "@/lib/query-client";

type JournalSignupRoute = RouteProp<
  { JournalSignup: { slug: string; title?: string } },
  "JournalSignup"
>;

export default function JournalSignupScreen() {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<JournalSignupRoute>();
  const { slug, title } = route.params;

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleCreateAccount = () => {
    trackVisitorEvent("journal_signup_choose", {
      slug,
      title,
      choice: "create_account",
    });
    navigation.navigate("Auth", { screen: "Register" });
  };

  const handleGuestSubmit = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError("Email is required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(trimmed)) {
      setEmailError("Please enter a valid email");
      return;
    }
    setEmailError(undefined);
    setSubmitting(true);
    try {
      trackVisitorEvent("journal_guest_email", {
        slug,
        title,
        email: trimmed,
      });
      try {
        await apiRequest("POST", "/api/journal/leads", {
          slug,
          title,
          email: trimmed,
          source: "journal_signup",
        });
      } catch (err) {
        // Persisting the lead failed — surface the error instead of
        // silently confirming, otherwise leads would be lost without the
        // user knowing to retry.
        console.warn("journal lead save failed", err);
        setEmailError(
          "We couldn't save your email just now. Please try again.",
        );
        return;
      }
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenContact = () => {
    trackVisitorEvent("journal_signup_choose", {
      slug,
      title,
      choice: "open_contact",
    });
    const url = "https://startappsstudio.com/#contact";
    Linking.openURL(url).catch(() => {});
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: insets.bottom + Spacing["3xl"],
        paddingHorizontal: Spacing.xl,
      }}
    >
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <Feather name="zap" size={22} color={theme.text} />
        </View>
        <ThemedText type="h1" style={styles.title}>
          Let's build the thing.
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.subtitle, { color: theme.textSecondary }]}
        >
          {title
            ? `Enjoyed "${title}"? Pick how you want to start working with the studio. Both take under a minute.`
            : "Pick how you want to start working with the studio. Both take under a minute, no sales call required."}
        </ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <Card style={styles.section} elevation={2}>
          <ThemedText type="h3">Start a project (recommended)</ThemedText>
          <ThemedText
            type="body"
            style={{ color: theme.textSecondary, marginTop: Spacing.xs }}
          >
            Spin up a private project space, message the studio directly, and watch your build progress in real time. New accounts unlock the $99 top-up with the 2x bonus, so your first 200 credits are ready when you are.
          </ThemedText>
          <Button
            onPress={handleCreateAccount}
            style={styles.primaryButton}
            testID="button-journal-signup-create"
          >
            Create my account
          </Button>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(150).duration(400)}>
        <Card style={styles.section} elevation={1}>
          <ThemedText type="h3">Just send me a recap</ThemedText>
          <ThemedText
            type="body"
            style={{ color: theme.textSecondary, marginTop: Spacing.xs }}
          >
            Not ready yet? Drop your email and we'll send a short recap of what we'd build for you, plus a link back here whenever you want to pick it up.
          </ThemedText>

          {submitted ? (
            <View
              style={[
                styles.successBox,
                { backgroundColor: theme.success + "15" },
              ]}
              testID="text-journal-signup-success"
            >
              <Feather name="check-circle" size={18} color={theme.success} />
              <ThemedText
                type="body"
                style={{ color: theme.success, flex: 1 }}
              >
                Got it. Check your inbox in the next day or two.
              </ThemedText>
            </View>
          ) : (
            <>
              <View style={styles.emailRow}>
                <Input
                  label="Email"
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  leftIcon="mail"
                  error={emailError}
                  testID="input-journal-guest-email"
                />
              </View>
              <Button
                variant="secondary"
                onPress={handleGuestSubmit}
                loading={submitting}
                style={styles.primaryButton}
                testID="button-journal-signup-guest"
              >
                Send me the recap
              </Button>
            </>
          )}
        </Card>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(200).duration(400)}
        style={styles.footer}
      >
        <Pressable
          onPress={handleOpenContact}
          testID="link-journal-signup-contact"
        >
          <ThemedText type="link" style={{ textAlign: "center" }}>
            Rather chat first? Book a quick intro on our contact page
          </ThemedText>
        </Pressable>
      </Animated.View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  title: { textAlign: "center" },
  subtitle: {
    textAlign: "center",
    marginTop: Spacing.sm,
    maxWidth: 320,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  primaryButton: {
    marginTop: Spacing.lg,
    width: "100%",
  },
  emailRow: {
    marginTop: Spacing.md,
  },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  footer: {
    marginTop: Spacing.md,
    alignItems: "center",
  },
});
