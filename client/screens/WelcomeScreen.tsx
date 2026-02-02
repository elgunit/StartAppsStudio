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

const hats: { type: HatType; label: string; description: string; skills: string[] }[] = [
  { 
    type: "designer", 
    label: "Designer", 
    description: "UI/UX & Visual Design",
    skills: ["User Interface Design", "User Experience", "Prototyping", "Design Systems", "Brand Identity"]
  },
  { 
    type: "developer", 
    label: "Developer", 
    description: "Code & Implementation",
    skills: ["React & React Native", "Full-Stack Development", "API Integration", "Database Design", "Performance Optimization"]
  },
  { 
    type: "strategist", 
    label: "Strategist", 
    description: "Planning & Research",
    skills: ["Market Research", "Competitive Analysis", "Product Strategy", "User Research", "Roadmap Planning"]
  },
  { 
    type: "manager", 
    label: "Manager", 
    description: "Project Leadership",
    skills: ["Project Planning", "Timeline Management", "Stakeholder Communication", "Risk Assessment", "Quality Assurance"]
  },
  { 
    type: "analyst", 
    label: "Analyst", 
    description: "Data & Insights",
    skills: ["Data Analysis", "Metrics & KPIs", "User Analytics", "A/B Testing", "Reporting"]
  },
];

const hatImages: Record<HatType, any> = {
  designer: require("../../assets/images/hat-designer.png"),
  developer: require("../../assets/images/hat-developer.png"),
  strategist: require("../../assets/images/hat-strategist.png"),
  manager: require("../../assets/images/hat-manager.png"),
  analyst: require("../../assets/images/hat-analyst.png"),
};

const services = [
  {
    icon: "layers" as const,
    title: "MVP Development",
    description: "Transform your idea into a working product with end-to-end design and development.",
  },
  {
    icon: "smartphone" as const,
    title: "Mobile Apps",
    description: "Native iOS and Android apps built with React Native for a seamless user experience.",
  },
  {
    icon: "globe" as const,
    title: "Web Applications",
    description: "Responsive web apps with modern technologies and beautiful interfaces.",
  },
  {
    icon: "compass" as const,
    title: "Product Strategy",
    description: "Research-driven strategy to validate your idea and plan your product roadmap.",
  },
];

const caseStudies = [
  {
    title: "AI Health Platform",
    industry: "Healthcare",
    result: "40% user retention increase",
    hats: ["designer", "developer", "strategist"] as HatType[],
  },
  {
    title: "E-Commerce Solution",
    industry: "Retail",
    result: "60% organic traffic growth",
    hats: ["designer", "developer", "analyst"] as HatType[],
  },
  {
    title: "Web3 Interface",
    industry: "Fintech",
    result: "18% fewer transaction errors",
    hats: ["designer", "developer"] as HatType[],
  },
];

const pricingTiers = [
  { name: "Starter Pack", credits: 50, price: "$99", description: "For prototypes & small projects" },
  { name: "Growth Suite", credits: 150, price: "$249", popular: true, description: "Best for growing startups" },
  { name: "Enterprise", credits: 500, price: "$699", description: "Large-scale MVPs" },
];

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const [expandedHat, setExpandedHat] = React.useState<HatType | null>(null);

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

      {/* Services Section */}
      <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.section}>
        <ThemedText type="h2" style={styles.sectionTitle}>
          Services
        </ThemedText>
        <ThemedText type="body" style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
          End-to-end product development tailored to your needs
        </ThemedText>
        
        <View style={styles.servicesGrid}>
          {services.map((service, index) => (
            <Animated.View
              key={service.title}
              entering={FadeInDown.delay(250 + index * 50).duration(400)}
              style={styles.serviceCardWrapper}
            >
              <Card style={styles.serviceCard}>
                <View style={[styles.serviceIcon, { backgroundColor: theme.backgroundDefault }]}>
                  <Feather name={service.icon} size={24} color={theme.text} />
                </View>
                <ThemedText type="h4" style={styles.serviceTitle}>
                  {service.title}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {service.description}
                </ThemedText>
              </Card>
            </Animated.View>
          ))}
        </View>
      </Animated.View>

      {/* Expertise Hats Section */}
      <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.section}>
        <ThemedText type="h2" style={styles.sectionTitle}>
          The Expertise You Need
        </ThemedText>
        <ThemedText type="body" style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
          Five specialized roles, one dedicated partner
        </ThemedText>
        
        <View style={styles.hatsContainer}>
          {hats.map((hat, index) => (
            <Animated.View
              key={hat.type}
              entering={FadeInDown.delay(350 + index * 50).duration(400)}
            >
              <Pressable
                onPress={() => setExpandedHat(expandedHat === hat.type ? null : hat.type)}
              >
                <Card 
                  style={[
                    styles.hatCard,
                    expandedHat === hat.type && { borderColor: theme.text },
                  ]}
                >
                  <View style={styles.hatHeader}>
                    <Image
                      source={hatImages[hat.type]}
                      style={styles.hatImage}
                      resizeMode="contain"
                    />
                    <View style={styles.hatInfo}>
                      <ThemedText type="h4">{hat.label}</ThemedText>
                      <ThemedText type="small" style={{ color: theme.textSecondary }}>
                        {hat.description}
                      </ThemedText>
                    </View>
                    <Feather 
                      name={expandedHat === hat.type ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color={theme.textSecondary} 
                    />
                  </View>
                  
                  {expandedHat === hat.type ? (
                    <View style={styles.skillsList}>
                      {hat.skills.map((skill, skillIndex) => (
                        <View key={skillIndex} style={styles.skillItem}>
                          <Feather name="check" size={14} color={theme.success} />
                          <ThemedText type="small">{skill}</ThemedText>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </Card>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </Animated.View>

      {/* Portfolio Preview */}
      <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.section}>
        <ThemedText type="h2" style={styles.sectionTitle}>
          Recent Work
        </ThemedText>
        <ThemedText type="body" style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
          Real results for real products
        </ThemedText>
        
        {caseStudies.map((study, index) => (
          <Animated.View
            key={index}
            entering={FadeInDown.delay(450 + index * 50).duration(400)}
          >
            <Card style={styles.caseStudyCard}>
              <View style={styles.caseStudyHeader}>
                <View>
                  <ThemedText type="h4">{study.title}</ThemedText>
                  <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                    {study.industry}
                  </ThemedText>
                </View>
                <View style={styles.caseHats}>
                  {study.hats.map((hatType, hatIndex) => (
                    <Image
                      key={hatIndex}
                      source={hatImages[hatType]}
                      style={styles.caseHatIcon}
                      resizeMode="contain"
                    />
                  ))}
                </View>
              </View>
              <View style={[styles.resultBadge, { backgroundColor: theme.success + "20" }]}>
                <Feather name="trending-up" size={14} color={theme.success} />
                <ThemedText type="small" style={{ color: theme.success }}>
                  {study.result}
                </ThemedText>
              </View>
            </Card>
          </Animated.View>
        ))}
      </Animated.View>

      {/* Pricing Preview */}
      <Animated.View entering={FadeInDown.delay(500).duration(600)} style={styles.section}>
        <ThemedText type="h2" style={styles.sectionTitle}>
          Credit Packages
        </ThemedText>
        <ThemedText type="body" style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
          Flexible pricing that scales with your project
        </ThemedText>
        
        <View style={styles.pricingGrid}>
          {pricingTiers.map((tier, index) => (
            <Animated.View
              key={index}
              entering={FadeInDown.delay(550 + index * 50).duration(400)}
            >
              <Card
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
                <ThemedText type="body" style={{ color: theme.textSecondary }}>
                  {tier.credits} credits
                </ThemedText>
                <ThemedText type="caption" style={[styles.pricingDesc, { color: theme.textTertiary }]}>
                  {tier.description}
                </ThemedText>
              </Card>
            </Animated.View>
          ))}
        </View>
      </Animated.View>

      {/* How It Works */}
      <Animated.View entering={FadeInDown.delay(550).duration(600)} style={styles.section}>
        <ThemedText type="h2" style={styles.sectionTitle}>
          How It Works
        </ThemedText>
        
        <View style={styles.stepsContainer}>
          {[
            { step: "1", title: "Submit Your Brief", desc: "Describe your project and select the expertise you need" },
            { step: "2", title: "I Start Building", desc: "Track my progress with real-time transparency metrics" },
            { step: "3", title: "Review & Iterate", desc: "Provide feedback and watch your product evolve" },
            { step: "4", title: "Launch Your MVP", desc: "Get your polished product ready for the world" },
          ].map((item, index) => (
            <View key={index} style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: theme.text }]}>
                <ThemedText type="h4" style={{ color: theme.backgroundRoot }}>
                  {item.step}
                </ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText type="h4">{item.title}</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {item.desc}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* CTA Section */}
      <Animated.View entering={FadeInUp.delay(600).duration(600)} style={styles.ctaSection}>
        <ThemedText type="h3" style={styles.ctaTitle}>
          Ready to Build Your MVP?
        </ThemedText>
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
    width: 72,
    height: 72,
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
    paddingHorizontal: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    marginBottom: Spacing.xl,
  },
  servicesGrid: {
    gap: Spacing.md,
  },
  serviceCardWrapper: {},
  serviceCard: {
    paddingVertical: Spacing.xl,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  serviceTitle: {
    marginBottom: Spacing.xs,
  },
  hatsContainer: {
    gap: Spacing.sm,
  },
  hatCard: {
    marginBottom: Spacing.xs,
  },
  hatHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  hatImage: {
    width: 40,
    height: 40,
  },
  hatInfo: {
    flex: 1,
  },
  skillsList: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    gap: Spacing.sm,
  },
  skillItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  caseStudyCard: {
    marginBottom: Spacing.md,
  },
  caseStudyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  caseHats: {
    flexDirection: "row",
    gap: -8,
  },
  caseHatIcon: {
    width: 24,
    height: 24,
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
    gap: Spacing.md,
  },
  pricingCard: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    position: "relative",
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
  pricingDesc: {
    marginTop: Spacing.xs,
  },
  stepsContainer: {
    gap: Spacing.xl,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.lg,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  stepContent: {
    flex: 1,
  },
  ctaSection: {
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
    paddingTop: Spacing.xl,
  },
  ctaTitle: {
    textAlign: "center",
    marginBottom: Spacing.xl,
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
