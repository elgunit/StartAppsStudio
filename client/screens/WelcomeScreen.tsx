import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  Dimensions,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, {
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

const { width } = Dimensions.get("window");

type HatType = "designer" | "developer" | "strategist" | "manager" | "analyst";

const hats: { type: HatType; label: string; description: string }[] = [
  { type: "designer", label: "Designer", description: "UI/UX & Visual Design" },
  { type: "developer", label: "Developer", description: "Code & Implementation" },
  { type: "strategist", label: "Strategist", description: "Planning & Research" },
  { type: "manager", label: "Manager", description: "Project Leadership" },
  { type: "analyst", label: "Analyst", description: "Data & Insights" },
];

const hatImages: Record<HatType, any> = {
  designer: require("../../assets/images/hat-designer.png"),
  developer: require("../../assets/images/hat-developer.png"),
  strategist: require("../../assets/images/hat-strategist.png"),
  manager: require("../../assets/images/hat-manager.png"),
  analyst: require("../../assets/images/hat-analyst.png"),
};

const caseStudies = [
  {
    title: "AI Health Platform",
    industry: "Healthcare",
    result: "40% user retention increase",
  },
  {
    title: "E-Commerce Solution",
    industry: "Retail",
    result: "60% organic traffic growth",
  },
  {
    title: "Web3 Interface",
    industry: "Fintech",
    result: "18% fewer transaction errors",
  },
];

const pricingTiers = [
  { name: "Starter Pack", credits: 50, price: "$99" },
  { name: "Growth Suite", credits: 150, price: "$249", popular: true },
  { name: "Enterprise", credits: 500, price: "$699" },
];

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: insets.top + Spacing["3xl"],
        paddingBottom: insets.bottom + Spacing["4xl"],
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section */}
      <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.heroSection}>
        <Image
          source={require("../../assets/images/icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <ThemedText type="display" style={styles.heroTitle}>
          One Designer.{"\n"}Five Hats.{"\n"}Your Complete{"\n"}MVP Team.
        </ThemedText>
        <ThemedText type="body" style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
          I bring your product vision to life with design expertise, development skills, and strategic thinking - all in one partnership.
        </ThemedText>
      </Animated.View>

      {/* Hats Section */}
      <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          The Expertise You Need
        </ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hatsScroll}
        >
          {hats.map((hat, index) => (
            <Animated.View
              key={hat.type}
              entering={FadeInDown.delay(300 + index * 100).duration(500)}
            >
              <Card style={styles.hatCard}>
                <Image
                  source={hatImages[hat.type]}
                  style={styles.hatImage}
                  resizeMode="contain"
                />
                <ThemedText type="h4" style={styles.hatLabel}>
                  {hat.label}
                </ThemedText>
                <ThemedText
                  type="caption"
                  style={[styles.hatDescription, { color: theme.textSecondary }]}
                >
                  {hat.description}
                </ThemedText>
              </Card>
            </Animated.View>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Portfolio Preview */}
      <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Recent Work
        </ThemedText>
        {caseStudies.map((study, index) => (
          <Card key={index} style={styles.caseStudyCard}>
            <View style={styles.caseStudyHeader}>
              <ThemedText type="h4">{study.title}</ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                {study.industry}
              </ThemedText>
            </View>
            <View style={[styles.resultBadge, { backgroundColor: theme.success + "20" }]}>
              <Feather name="trending-up" size={14} color={theme.success} />
              <ThemedText type="small" style={{ color: theme.success }}>
                {study.result}
              </ThemedText>
            </View>
          </Card>
        ))}
      </Animated.View>

      {/* Pricing Preview */}
      <Animated.View entering={FadeInDown.delay(500).duration(600)} style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Credit Packages
        </ThemedText>
        <View style={styles.pricingGrid}>
          {pricingTiers.map((tier, index) => (
            <Card
              key={index}
              style={[
                styles.pricingCard,
                tier.popular && { borderColor: theme.text, borderWidth: 2 },
              ]}
            >
              {tier.popular ? (
                <View style={[styles.popularBadge, { backgroundColor: theme.text }]}>
                  <ThemedText type="caption" style={{ color: theme.backgroundRoot }}>
                    Popular
                  </ThemedText>
                </View>
              ) : null}
              <ThemedText type="h4">{tier.name}</ThemedText>
              <ThemedText type="display" style={styles.price}>
                {tier.price}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {tier.credits} credits
              </ThemedText>
            </Card>
          ))}
        </View>
      </Animated.View>

      {/* CTA Section */}
      <Animated.View entering={FadeInUp.delay(600).duration(600)} style={styles.ctaSection}>
        <Button
          onPress={() => navigation.navigate("Register")}
          style={styles.ctaButton}
          testID="button-get-started"
        >
          Get Started
        </Button>
        <Pressable
          onPress={() => navigation.navigate("Login")}
          style={styles.signInLink}
        >
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            Already have an account?{" "}
          </ThemedText>
          <ThemedText type="link">Sign In</ThemedText>
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroSection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing["4xl"],
    alignItems: "center",
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: Spacing.xl,
  },
  heroTitle: {
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  heroSubtitle: {
    textAlign: "center",
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginBottom: Spacing["3xl"],
  },
  sectionTitle: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  hatsScroll: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  hatCard: {
    width: 140,
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  hatImage: {
    width: 56,
    height: 56,
    marginBottom: Spacing.md,
  },
  hatLabel: {
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  hatDescription: {
    textAlign: "center",
  },
  caseStudyCard: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  caseStudyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  resultBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    alignSelf: "flex-start",
  },
  pricingGrid: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  pricingCard: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  popularBadge: {
    position: "absolute",
    top: -10,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  price: {
    marginVertical: Spacing.sm,
  },
  ctaSection: {
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
  },
  ctaButton: {
    width: "100%",
    marginBottom: Spacing.lg,
  },
  signInLink: {
    flexDirection: "row",
    alignItems: "center",
  },
});
