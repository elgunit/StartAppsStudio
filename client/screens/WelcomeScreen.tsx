import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, {
  FadeInDown,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

type HatType = "designer" | "developer" | "strategist" | "manager" | "analyst";

const hatIcons: Record<HatType, keyof typeof Feather.glyphMap> = {
  designer: "pen-tool",
  developer: "code",
  strategist: "compass",
  manager: "clipboard",
  analyst: "bar-chart-2",
};

type MenuSection = "services" | "grow" | "expertise" | "work" | "packages" | null;

const menuItems = [
  { id: "services" as const, icon: "grid" as const, label: "Services", subtitle: "Build products" },
  { id: "grow" as const, icon: "trending-up" as const, label: "Grow", subtitle: "Marketing & SEO" },
  { id: "expertise" as const, icon: "award" as const, label: "Expertise", subtitle: "5 specialized roles" },
  { id: "work" as const, icon: "briefcase" as const, label: "Work", subtitle: "13 case studies" },
  { id: "packages" as const, icon: "package" as const, label: "Packages", subtitle: "Pricing & timelines" },
];

const services = [
  { icon: "layout" as const, title: "Landing Pages", desc: "High-converting pages" },
  { icon: "smartphone" as const, title: "Native Apps", desc: "iOS & Android" },
  { icon: "globe" as const, title: "Web Apps", desc: "Modern & responsive" },
  { icon: "layers" as const, title: "Full MVP", desc: "End-to-end development" },
];

const growthServices = [
  { icon: "search" as const, title: "SEO Audit", desc: "Site analysis & fixes", color: "#10B981" },
  { icon: "search" as const, title: "Keyword Strategy", desc: "Rankings & traffic", color: "#10B981" },
  { icon: "file-text" as const, title: "Content Plan", desc: "Blog & copy strategy", color: "#3B82F6" },
  { icon: "target" as const, title: "Paid Ads", desc: "Google & Meta ads", color: "#F59E0B" },
  { icon: "share-2" as const, title: "Social Media Kit", desc: "Templates & calendar", color: "#8B5CF6" },
  { icon: "mail" as const, title: "Email Sequences", desc: "Drip & onboarding", color: "#EF4444" },
  { icon: "award" as const, title: "Brand Identity", desc: "Logo, voice & style", color: "#EC4899" },
];

const hats = [
  { type: "designer" as HatType, label: "Designer", desc: "UI/UX & Visual" },
  { type: "developer" as HatType, label: "Developer", desc: "Code & Build" },
  { type: "strategist" as HatType, label: "Strategist", desc: "Plan & Research" },
  { type: "manager" as HatType, label: "Manager", desc: "Lead & Deliver" },
  { type: "analyst" as HatType, label: "Analyst", desc: "Data & Insights" },
];

const caseStudies = [
  { title: "AI Health Platform", result: "+40% retention", industry: "Healthcare" },
  { title: "E-Commerce Solution", result: "+60% traffic", industry: "Retail" },
  { title: "Digital Banking", result: "-35% costs", industry: "Fintech" },
  { title: "EdTech Platform", result: "92% completion", industry: "Education" },
  { title: "Fitness App", result: "85% DAU", industry: "Wellness" },
  { title: "Real Estate Platform", result: "+55% leads", industry: "Property" },
  { title: "Food Delivery App", result: "4.8★ rating", industry: "Logistics" },
  { title: "Travel Booking", result: "+70% bookings", industry: "Travel" },
  { title: "HR Management", result: "-40% admin time", industry: "Enterprise" },
  { title: "Crypto Dashboard", result: "50k+ users", industry: "Finance" },
  { title: "Social Platform", result: "3x engagement", industry: "Social" },
  { title: "IoT Control App", result: "99.9% uptime", industry: "Technology" },
  { title: "Legal Tech Portal", result: "+45% efficiency", industry: "Legal" },
];

const packages = [
  { name: "Starter", price: "$459", credits: "450 credits", time: "2-5 days", badge: "AI + Figma" },
  { name: "Prototype", price: "$959", credits: "1,000 credits", time: "5-10 days", badge: "AI + Figma", popular: true },
  { name: "Production", price: "$1.5k-$5k", credits: "4,000 credits", time: "3-10 weeks", badge: "AI + Figma", note: "Up to 10k users" },
  { name: "Custom", price: "$7.5k+", credits: "Billed internally", time: "1-6 months", badge: "No AI", note: "10k+ users" },
];

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [expandedSection, setExpandedSection] = React.useState<MenuSection>(null);
  const [showAllProjects, setShowAllProjects] = React.useState(false);
  const displayedCaseStudies = showAllProjects ? caseStudies : caseStudies.slice(0, 5);
  const loopingCaseStudies = [...displayedCaseStudies, ...displayedCaseStudies];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: insets.top + Spacing.xl,
        paddingBottom: insets.bottom + Spacing["3xl"],
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroSection}>
        <Image
          source={isDark ? require("../../assets/images/icon-dark.png") : require("../../assets/images/icon.png")}
          style={[styles.logo, { borderRadius: 16 }]}
          resizeMode="contain"
        />
        <ThemedText type="display" style={styles.heroTitle}>
          Start Apps{"\n"}Studio
        </ThemedText>
        <ThemedText type="body" style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
          Design, development & growth — all in one partnership.
        </ThemedText>
        <View style={styles.statsRow}>
          <ThemedText type="caption" style={[styles.statItem, { color: theme.textTertiary }]}>
            145+ MVPs
          </ThemedText>
          <ThemedText type="caption" style={{ color: theme.textTertiary }}>·</ThemedText>
          <ThemedText type="caption" style={[styles.statItem, { color: theme.textTertiary }]}>
            Since 2010
          </ThemedText>
          <ThemedText type="caption" style={{ color: theme.textTertiary }}>·</ThemedText>
          <ThemedText type="caption" style={[styles.statItem, { color: theme.textTertiary }]}>
            5 Roles
          </ThemedText>
        </View>
      </View>

      <View style={styles.ctaSection}>
        <View style={styles.menuHeader}>
          <View style={[styles.menuIcon, { backgroundColor: theme.backgroundDefault }]}>
            <Feather name="layout" size={18} color={theme.text} />
          </View>
          <View style={styles.menuInfo}>
            <ThemedText type="body" style={{ fontWeight: "600" }}>
              Build products
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              Scroll to explore services, work, and packages
            </ThemedText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroSection: {
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: Spacing.lg,
  },
  heroTitle: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  heroSubtitle: {
    textAlign: "center",
    maxWidth: 280,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  statItem: {
    fontWeight: "500" as const,
  },
  ctaSection: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    marginBottom: Spacing["2xl"],
  },
  primaryButton: {
    width: "100%",
  },
  secondaryButton: {
    width: "100%",
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  menuInfo: {
    flex: 1,
  },
  floatingMenu: {
    position: "absolute",
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 20,
  },
  floatingMenuCard: {
    padding: Spacing.sm,
  },
  floatingMenuRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.xs,
  },
  floatingMenuButton: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingVertical: Spacing.sm,
  },
});
