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
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

type HatType = "designer" | "developer" | "strategist" | "manager" | "analyst";

const hatIcons: Record<HatType, keyof typeof Feather.glyphMap> = {
  designer: "pen-tool",
  developer: "code",
  strategist: "compass",
  manager: "clipboard",
  analyst: "bar-chart-2",
};

const hatAccents: Record<HatType, string> = {
  designer: "#0d9488",
  developer: "#3b82f6",
  strategist: "#10b981",
  manager: "#f59e0b",
  analyst: "#14b8a6",
};

const services = [
  { icon: "layout" as const, title: "Landing Pages", desc: "High-converting pages" },
  { icon: "smartphone" as const, title: "Native Apps", desc: "iOS & Android" },
  { icon: "globe" as const, title: "Web Apps", desc: "Modern & responsive" },
  { icon: "layers" as const, title: "Full MVP", desc: "End-to-end build" },
];

const growthServices = [
  { icon: "search" as const, title: "SEO Audit", desc: "Site analysis & fixes", color: "#10B981" },
  { icon: "trending-up" as const, title: "Keyword Strategy", desc: "Rankings & traffic", color: "#10B981" },
  { icon: "file-text" as const, title: "Content Plan", desc: "Blog & copy strategy", color: "#3B82F6" },
  { icon: "target" as const, title: "Paid Ads", desc: "Google & Meta ads", color: "#F59E0B" },
  { icon: "share-2" as const, title: "Social Media Kit", desc: "Templates & calendar", color: "#8B5CF6" },
  { icon: "mail" as const, title: "Email Sequences", desc: "Drip & onboarding", color: "#EF4444" },
  { icon: "award" as const, title: "Brand Identity", desc: "Logo, voice & style", color: "#EC4899" },
];

const hats: { type: HatType; label: string; desc: string }[] = [
  { type: "designer", label: "Designer", desc: "UI/UX & visual" },
  { type: "developer", label: "Developer", desc: "Code & build" },
  { type: "strategist", label: "Strategist", desc: "Plan & research" },
  { type: "manager", label: "Manager", desc: "Lead & deliver" },
  { type: "analyst", label: "Analyst", desc: "Data & insights" },
];

type ToolkitGroup = {
  label: string;
  tools: { name: string; role: string; letter: string; color: string }[];
};

const toolkitGroups: ToolkitGroup[] = [
  {
    label: "Reasoning & Code",
    tools: [
      { name: "Claude Sonnet 4.7", role: "primary builder", letter: "C", color: "#D97757" },
      { name: "Gemini 2.5 Pro", role: "long-context review", letter: "G", color: "#4285F4" },
      { name: "GPT-5", role: "creative & copy", letter: "G", color: "#10A37F" },
      { name: "Llama 4", role: "self-hosted fallback", letter: "L", color: "#0866FF" },
    ],
  },
  {
    label: "Mockups & Prototyping",
    tools: [
      { name: "Figma", role: "design system + Dev Mode", letter: "F", color: "#A259FF" },
      { name: "Replit", role: "React hybrid builds", letter: "R", color: "#F26207" },
      { name: "Lovable", role: "rapid mockups", letter: "L", color: "#FF4D8B" },
      { name: "Rork", role: "iOS & Android prototypes", letter: "R", color: "#0EA5E9" },
    ],
  },
  {
    label: "Production & Delivery",
    tools: [
      { name: "Webflow", role: "marketing site builds", letter: "W", color: "#4353FF" },
      { name: "WordPress", role: "content sites & blogs", letter: "W", color: "#21759B" },
      { name: "GitHub", role: "daily updates + version control", letter: "G", color: "#24292E" },
      { name: "Swift", role: "native iOS apps", letter: "S", color: "#F05138" },
      { name: "Kotlin", role: "native Android apps", letter: "K", color: "#7F52FF" },
      { name: "Automation Hooks", role: "n8n + Make + webhooks", letter: "A", color: "#0d9488" },
    ],
  },
  {
    label: "Content & Media",
    tools: [
      { name: "ElevenLabs", role: "voiceover & speech", letter: "E", color: "#000000" },
      { name: "Higgsfield", role: "video & motion", letter: "H", color: "#7C3AED" },
    ],
  },
];

const caseStudies = [
  { title: "AI Health Platform", result: "+40% retention", industry: "Healthcare" },
  { title: "E-Commerce Solution", result: "+60% traffic", industry: "Retail" },
  { title: "Digital Banking", result: "-35% costs", industry: "Fintech" },
  { title: "EdTech Platform", result: "92% completion", industry: "Education" },
  { title: "Fitness App", result: "85% DAU", industry: "Wellness" },
  { title: "Real Estate Platform", result: "+55% leads", industry: "Property" },
  { title: "Food Delivery App", result: "4.8 rating", industry: "Logistics" },
  { title: "Travel Booking", result: "+70% bookings", industry: "Travel" },
  { title: "HR Management", result: "-40% admin time", industry: "Enterprise" },
  { title: "Crypto Dashboard", result: "50k+ users", industry: "Finance" },
  { title: "Social Platform", result: "3x engagement", industry: "Social" },
  { title: "IoT Control App", result: "99.9% uptime", industry: "Technology" },
  { title: "Legal Tech Portal", result: "+45% efficiency", industry: "Legal" },
];

const packages = [
  { name: "Mockup", price: "$399", credits: "Founder-ready visuals", time: "Under 1 week", badge: "AI + Figma" },
  { name: "Prototype", price: "$1,800", credits: "Clickable end-to-end demo", time: "1-2 weeks", badge: "AI + Figma", popular: true },
  { name: "MVP", price: "$4,500-$9,500", credits: "Shippable iOS, Android or web", time: "3-8 weeks", badge: "AI + Figma" },
  { name: "Custom", price: "$15,000+", credits: "Multi-platform & scale", time: "1-6 months", badge: "Hybrid", note: "10k+ users" },
];

function SectionHeading({ kicker, title, subtitle }: { kicker?: string; title: string; subtitle?: string }) {
  const { theme } = useTheme();
  return (
    <View style={styles.sectionHeading}>
      {kicker ? (
        <ThemedText type="caption" style={[styles.kicker, { color: theme.textTertiary }]}>
          {kicker.toUpperCase()}
        </ThemedText>
      ) : null}
      <ThemedText type="h2" style={styles.sectionTitle}>{title}</ThemedText>
      {subtitle ? (
        <ThemedText type="body" style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>{subtitle}</ThemedText>
      ) : null}
    </View>
  );
}

function ToolkitChip({
  name,
  role,
  letter,
  color,
  onReveal,
}: {
  name: string;
  role: string;
  letter: string;
  color: string;
  onReveal: (name: string) => void;
}) {
  const { theme } = useTheme();
  const [revealed, setRevealed] = React.useState(false);
  const handlePress = React.useCallback(() => {
    if (!revealed) {
      setRevealed(true);
      onReveal(name);
    }
  }, [revealed, onReveal, name]);

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.toolkitChip,
        { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
      ]}
      testID={`toolkit-chip-${name}`}
      accessibilityRole="button"
      accessibilityLabel={revealed ? name : "Reveal tool name"}
    >
      <View style={[styles.toolkitAvatar, { backgroundColor: color }]}>
        <ThemedText style={styles.toolkitAvatarLetter}>{letter}</ThemedText>
      </View>
      <View style={styles.toolkitChipText}>
        <ThemedText
          type="body"
          style={styles.toolkitChipName}
          numberOfLines={1}
        >
          {name}
        </ThemedText>
        <ThemedText
          type="caption"
          style={[
            styles.toolkitChipRole,
            { color: theme.textSecondary },
            !revealed && { color: theme.textTertiary, letterSpacing: 2 },
          ]}
          numberOfLines={1}
          accessibilityElementsHidden={!revealed}
          importantForAccessibility={revealed ? "yes" : "no-hide-descendants"}
        >
          {revealed ? role : "•".repeat(Math.min(role.length, 18))}
        </ThemedText>
      </View>
    </Pressable>
  );
}

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const [showAllProjects, setShowAllProjects] = React.useState(false);
  const displayedCaseStudies = showAllProjects ? caseStudies : caseStudies.slice(0, 5);
  const loggedRevealsRef = React.useRef<Set<string>>(new Set());

  // Build a quick lookup of group label per tool so logging matches desktop.
  const toolGroupLookup = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const g of toolkitGroups) for (const t of g.tools) map.set(t.name, g.label);
    return map;
  }, []);

  const logToolkitReveal = React.useCallback(
    (toolName: string) => {
      if (loggedRevealsRef.current.has(toolName)) return;
      loggedRevealsRef.current.add(toolName);
      try {
        const url = new URL("/api/toolkit-reveal", getApiUrl()).toString();
        fetch(url, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            toolName,
            toolGroup: toolGroupLookup.get(toolName) ?? null,
            source: "mobile-app",
          }),
          keepalive: true,
        }).catch(() => {});
      } catch {
        // ignore
      }
    },
    [toolGroupLookup],
  );

  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const openContact = React.useCallback(() => {
    navigation.navigate("JournalSignup", {
      slug: "welcome-cta",
      title: "Start a project",
    });
  }, [navigation]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: insets.top + Spacing.xl,
        paddingBottom: insets.bottom + Spacing["3xl"],
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
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
          <ThemedText type="caption" style={[styles.statItem, { color: theme.textTertiary }]}>145+ MVPs</ThemedText>
          <ThemedText type="caption" style={{ color: theme.textTertiary }}>·</ThemedText>
          <ThemedText type="caption" style={[styles.statItem, { color: theme.textTertiary }]}>Since 2010</ThemedText>
          <ThemedText type="caption" style={{ color: theme.textTertiary }}>·</ThemedText>
          <ThemedText type="caption" style={[styles.statItem, { color: theme.textTertiary }]}>5 Roles</ThemedText>
        </View>

        <Pressable
          onPress={openContact}
          style={[styles.heroCta, { backgroundColor: theme.text }]}
          testID="button-hero-contact"
        >
          <ThemedText style={[styles.heroCtaText, { color: theme.buttonText }]}>Get a free plan</ThemedText>
          <Feather name="arrow-right" size={16} color={theme.buttonText} />
        </Pressable>
      </View>

      {/* Services */}
      <View style={styles.section}>
        <SectionHeading
          kicker="Build"
          title="What we ship"
          subtitle="One landing page or a full multi-platform product — we cover both."
        />
        <View style={styles.gridTwo}>
          {services.map((s) => (
            <View
              key={s.title}
              style={[styles.tile, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
              testID={`tile-service-${s.title}`}
            >
              <View style={[styles.tileIcon, { backgroundColor: theme.backgroundSecondary }]}>
                <Feather name={s.icon} size={18} color={theme.text} />
              </View>
              <ThemedText type="h4" style={styles.tileTitle}>{s.title}</ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>{s.desc}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      {/* Roles / Hats */}
      <View style={styles.section}>
        <SectionHeading
          kicker="Expertise"
          title="Five hats, one partner"
          subtitle="One team that swaps roles as your project moves from idea to launch."
        />
        <View style={{ gap: Spacing.sm }}>
          {hats.map((h) => (
            <View
              key={h.type}
              style={[styles.hatRow, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
              testID={`row-hat-${h.type}`}
            >
              <View style={[styles.hatIcon, { backgroundColor: hatAccents[h.type] + "22", borderColor: hatAccents[h.type] }]}>
                <Feather name={hatIcons[h.type]} size={18} color={hatAccents[h.type]} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText type="h4">{h.label}</ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>{h.desc}</ThemedText>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Grow */}
      <View style={styles.section}>
        <SectionHeading
          kicker="Grow"
          title="Marketing & SEO"
          subtitle="The studio that built it can also bring people to it."
        />
        <View style={styles.gridTwo}>
          {growthServices.map((g) => (
            <View
              key={g.title}
              style={[styles.tile, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
              testID={`tile-grow-${g.title}`}
            >
              <View style={[styles.tileIcon, { backgroundColor: g.color + "22" }]}>
                <Feather name={g.icon} size={18} color={g.color} />
              </View>
              <ThemedText type="h4" style={styles.tileTitle}>{g.title}</ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>{g.desc}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      {/* Toolkit */}
      <View style={styles.section}>
        <SectionHeading
          kicker="Toolkit"
          title="Backed by the best models"
          subtitle="A small team that ships like a big one. Tap any tile to see what that tool does for you."
        />
        {toolkitGroups.map((group) => (
          <View key={group.label} style={{ marginBottom: Spacing.lg }}>
            <ThemedText type="caption" style={[styles.toolkitGroupLabel, { color: theme.textTertiary }]}>
              {group.label.toUpperCase()}
            </ThemedText>
            <View style={{ gap: Spacing.sm }}>
              {group.tools.map((t) => (
                <ToolkitChip
                  key={t.name}
                  name={t.name}
                  role={t.role}
                  letter={t.letter}
                  color={t.color}
                  onReveal={logToolkitReveal}
                />
              ))}
            </View>
          </View>
        ))}
        <ThemedText
          type="caption"
          style={[styles.footnote, { color: theme.textSecondary }]}
        >
          These models don't just build for us. They critique each other's output, flag weak flows, and spot edge cases before you do.
        </ThemedText>
      </View>

      {/* Packages */}
      <View style={styles.section}>
        <SectionHeading
          kicker="Packages"
          title="Pricing & timelines"
          subtitle="Pick the lane that fits your stage. Every package includes unlimited revisions while we build."
        />
        <View style={{ gap: Spacing.md }}>
          {packages.map((p) => (
            <View
              key={p.name}
              style={[
                styles.packageCard,
                {
                  backgroundColor: theme.backgroundDefault,
                  borderColor: p.popular ? "#0d9488" : theme.border,
                  borderWidth: p.popular ? 2 : 1,
                },
              ]}
              testID={`card-package-${p.name}`}
            >
              <View style={styles.packageHeader}>
                <View>
                  <ThemedText type="h3">{p.name}</ThemedText>
                  <ThemedText type="caption" style={{ color: theme.textSecondary }}>{p.badge} · {p.time}</ThemedText>
                </View>
                {p.popular ? (
                  <View style={styles.popularBadge}>
                    <ThemedText style={styles.popularBadgeText}>Popular</ThemedText>
                  </View>
                ) : null}
              </View>
              <ThemedText type="display" style={styles.packagePrice}>{p.price}</ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>{p.credits}</ThemedText>
              {p.note ? (
                <ThemedText type="caption" style={[styles.packageNote, { color: theme.textTertiary }]}>{p.note}</ThemedText>
              ) : null}
            </View>
          ))}
        </View>
      </View>

      {/* Case studies */}
      <View style={styles.section}>
        <SectionHeading
          kicker="Work"
          title="Selected projects"
          subtitle={`${caseStudies.length} products shipped across healthcare, fintech, retail and more.`}
        />
        <View style={{ gap: Spacing.sm }}>
          {displayedCaseStudies.map((c) => (
            <View
              key={c.title}
              style={[styles.caseCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
              testID={`card-case-${c.title}`}
            >
              <View style={{ flex: 1 }}>
                <ThemedText type="h4">{c.title}</ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>{c.industry}</ThemedText>
              </View>
              <View style={[styles.caseResult, { borderColor: theme.border }]}>
                <Feather name="trending-up" size={12} color={"#0d9488"} />
                <ThemedText type="caption" style={{ color: "#0d9488", fontWeight: "600" }}>{c.result}</ThemedText>
              </View>
            </View>
          ))}
        </View>
        {!showAllProjects && caseStudies.length > 5 ? (
          <Pressable
            onPress={() => setShowAllProjects(true)}
            style={[styles.loadMoreBtn, { borderColor: theme.border }]}
            testID="button-load-more-cases"
          >
            <ThemedText type="body" style={{ fontWeight: "600" }}>Show all {caseStudies.length} projects</ThemedText>
            <Feather name="chevron-down" size={16} color={theme.text} />
          </Pressable>
        ) : null}
      </View>

      {/* Footer CTA */}
      <View style={styles.section}>
        <View style={[styles.ctaCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <ThemedText type="h2" style={{ textAlign: "center", marginBottom: Spacing.sm }}>
            Have an idea? Let's scope it.
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.ctaSubtitle, { color: theme.textSecondary }]}
          >
            Describe it in plain English. You'll get a plan, a price, and a timeline back — usually within 24 hours.
          </ThemedText>
          <Pressable
            onPress={openContact}
            style={[styles.heroCta, { backgroundColor: theme.text, alignSelf: "center", marginTop: Spacing.lg }]}
            testID="button-footer-contact"
          >
            <ThemedText style={[styles.heroCtaText, { color: theme.buttonText }]}>Get my free plan</ThemedText>
            <Feather name="arrow-right" size={16} color={theme.buttonText} />
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroSection: {
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  logo: { width: 80, height: 80, marginBottom: Spacing.lg },
  heroTitle: { textAlign: "center", marginBottom: Spacing.md },
  heroSubtitle: { textAlign: "center", maxWidth: 280 },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  statItem: { fontWeight: "500" as const },
  heroCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.xl,
  },
  heroCtaText: { fontSize: 15, fontWeight: "600" as const },
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing["2xl"],
  },
  sectionHeading: { marginBottom: Spacing.lg },
  kicker: { letterSpacing: 1.5, fontWeight: "700" as const, marginBottom: 6 },
  sectionTitle: { marginBottom: 6 },
  sectionSubtitle: { lineHeight: 22 },
  gridTwo: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  tile: {
    flexBasis: "48%",
    flexGrow: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  tileIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  tileTitle: { marginBottom: 2 },
  hatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  hatIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  toolkitGroupLabel: {
    letterSpacing: 1.4,
    fontWeight: "700" as const,
    marginBottom: Spacing.sm,
  },
  toolkitChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  toolkitAvatar: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  toolkitAvatarLetter: { color: "#fff", fontWeight: "700" as const, fontSize: 14 },
  toolkitChipText: { flex: 1, minWidth: 0 },
  toolkitChipName: { fontWeight: "700" as const, fontSize: 14 },
  toolkitChipRole: { marginTop: 2, fontSize: 12 },
  footnote: { lineHeight: 20, marginTop: Spacing.sm },
  packageCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  packageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  popularBadge: {
    backgroundColor: "#0d9488",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  popularBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700" as const },
  packagePrice: { fontSize: 28, lineHeight: 34, marginBottom: 4 },
  packageNote: { marginTop: Spacing.xs },
  caseCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  caseResult: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  loadMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  ctaCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: "center",
  },
  ctaSubtitle: { textAlign: "center", maxWidth: 320, lineHeight: 22 },
});
