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

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
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

type MenuSection = "services" | "expertise" | "work" | "packages" | null;

const menuItems = [
  { id: "services" as const, icon: "grid" as const, label: "Services", subtitle: "What we build" },
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
];

const packages = [
  { name: "Starter", price: "$129", time: "2-3 days", badge: "AI + Figma" },
  { name: "Prototype", price: "$489", time: "3-5 days", badge: "AI + Figma", popular: true },
  { name: "Production", price: "$1.5k-$5k", time: "2-3 weeks", badge: "AI + Figma" },
  { name: "Custom", price: "$7.5k+", time: "1-6 months", badge: "No AI" },
];

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [expandedSection, setExpandedSection] = React.useState<MenuSection>(null);

  const toggleSection = (section: MenuSection) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: insets.top + Spacing["2xl"],
        paddingBottom: insets.bottom + Spacing["3xl"],
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section */}
      <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.heroSection}>
        <Image
          source={require("../../assets/images/icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <ThemedText type="display" style={styles.heroTitle}>
          Start Apps{"\n"}Studio
        </ThemedText>
        <ThemedText type="body" style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
          Design, development & strategy — all in one partnership.
        </ThemedText>
      </Animated.View>

      {/* CTA Buttons */}
      <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.ctaSection}>
        <Button
          onPress={() => navigation.navigate("Register")}
          style={styles.primaryButton}
        >
          Get Started
        </Button>
        <Button
          variant="secondary"
          onPress={() => navigation.navigate("Login")}
          style={styles.secondaryButton}
        >
          Sign In
        </Button>
      </Animated.View>

      {/* Menu Sections */}
      <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.menuSection}>
        <ThemedText type="caption" style={[styles.menuLabel, { color: theme.textTertiary }]}>
          EXPLORE
        </ThemedText>
        
        {menuItems.map((item, index) => (
          <Animated.View
            key={item.id}
            entering={FadeInDown.delay(350 + index * 50).duration(400)}
          >
            <Pressable onPress={() => toggleSection(item.id)}>
              <Card style={{...styles.menuCard, ...(expandedSection === item.id ? { borderColor: theme.text } : {})}}>
                <View style={styles.menuHeader}>
                  <View style={[styles.menuIcon, { backgroundColor: theme.backgroundDefault }]}>
                    <Feather name={item.icon} size={18} color={theme.text} />
                  </View>
                  <View style={styles.menuInfo}>
                    <ThemedText type="body" style={{ fontWeight: "600" }}>{item.label}</ThemedText>
                    <ThemedText type="caption" style={{ color: theme.textSecondary }}>{item.subtitle}</ThemedText>
                  </View>
                  <Feather 
                    name={expandedSection === item.id ? "chevron-up" : "chevron-down"} 
                    size={18} 
                    color={theme.textSecondary} 
                  />
                </View>

                {/* Expanded Content */}
                {expandedSection === item.id ? (
                  <View style={styles.expandedContent}>
                    {item.id === "services" ? (
                      <View style={styles.gridContent}>
                        {services.map((service, i) => (
                          <View key={i} style={[styles.gridItem, { backgroundColor: theme.backgroundDefault }]}>
                            <Feather name={service.icon} size={16} color={theme.text} />
                            <ThemedText type="small" style={{ fontWeight: "500" }}>{service.title}</ThemedText>
                            <ThemedText type="caption" style={{ color: theme.textSecondary }}>{service.desc}</ThemedText>
                          </View>
                        ))}
                      </View>
                    ) : null}

                    {item.id === "expertise" ? (
                      <View style={styles.listContent}>
                        {hats.map((hat, i) => (
                          <View key={i} style={styles.listItem}>
                            <Feather name={hatIcons[hat.type]} size={16} color={theme.text} />
                            <ThemedText type="small" style={{ fontWeight: "500", flex: 1 }}>{hat.label}</ThemedText>
                            <ThemedText type="caption" style={{ color: theme.textSecondary }}>{hat.desc}</ThemedText>
                          </View>
                        ))}
                      </View>
                    ) : null}

                    {item.id === "work" ? (
                      <View style={styles.listContent}>
                        {caseStudies.map((study, i) => (
                          <View key={i} style={styles.workItem}>
                            <View style={styles.workInfo}>
                              <ThemedText type="small" style={{ fontWeight: "500" }}>{study.title}</ThemedText>
                              <ThemedText type="caption" style={{ color: theme.textSecondary }}>{study.industry}</ThemedText>
                            </View>
                            <View style={[styles.resultBadge, { backgroundColor: theme.success + "20" }]}>
                              <ThemedText type="caption" style={{ color: theme.success }}>{study.result}</ThemedText>
                            </View>
                          </View>
                        ))}
                        <Pressable 
                          onPress={() => navigation.navigate("Register")}
                          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                        >
                          <ThemedText type="caption" style={{ color: theme.link, textAlign: "center", marginTop: Spacing.sm, textDecorationLine: "underline" }}>
                            +8 more projects →
                          </ThemedText>
                        </Pressable>
                      </View>
                    ) : null}

                    {item.id === "packages" ? (
                      <View style={styles.listContent}>
                        {packages.map((pkg, i) => (
                          <View key={i} style={[styles.packageItem, pkg.popular && { backgroundColor: theme.backgroundDefault }]}>
                            <View style={styles.packageInfo}>
                              <View style={styles.packageNameRow}>
                                <ThemedText type="small" style={{ fontWeight: "600" }}>{pkg.name}</ThemedText>
                                {pkg.popular ? (
                                  <View style={[styles.popularBadge, { backgroundColor: theme.text }]}>
                                    <ThemedText type="caption" style={{ color: theme.backgroundRoot, fontSize: 9 }}>Popular</ThemedText>
                                  </View>
                                ) : null}
                              </View>
                              <ThemedText type="caption" style={{ color: theme.textSecondary }}>{pkg.time}</ThemedText>
                            </View>
                            <View style={styles.packagePricing}>
                              <ThemedText type="body" style={{ fontWeight: "600" }}>{pkg.price}</ThemedText>
                              <View style={[styles.methodBadge, { backgroundColor: pkg.badge === "No AI" ? theme.text : theme.success + "20" }]}>
                                <ThemedText type="caption" style={{ color: pkg.badge === "No AI" ? theme.backgroundRoot : theme.success, fontSize: 9 }}>
                                  {pkg.badge}
                                </ThemedText>
                              </View>
                            </View>
                          </View>
                        ))}
                      </View>
                    ) : null}
                  </View>
                ) : null}
              </Card>
            </Pressable>
          </Animated.View>
        ))}
      </Animated.View>

      {/* Footer */}
      <Animated.View entering={FadeInDown.delay(550).duration(500)} style={styles.footer}>
        <ThemedText type="caption" style={{ color: theme.textTertiary, textAlign: "center" }}>
          create@startappsstudio.com
        </ThemedText>
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
  menuSection: {
    paddingHorizontal: Spacing.lg,
  },
  menuLabel: {
    marginBottom: Spacing.md,
    marginLeft: Spacing.xs,
    letterSpacing: 1,
  },
  menuCard: {
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: "transparent",
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
  expandedContent: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(128,128,128,0.15)",
  },
  gridContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  gridItem: {
    width: "48%",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  listContent: {
    gap: Spacing.sm,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  workItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  workInfo: {
    flex: 1,
  },
  resultBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  packageItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  packageInfo: {
    flex: 1,
  },
  packageNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  packagePricing: {
    alignItems: "flex-end",
    gap: Spacing.xs,
  },
  popularBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  methodBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  footer: {
    marginTop: Spacing["2xl"],
    paddingHorizontal: Spacing.xl,
  },
});
