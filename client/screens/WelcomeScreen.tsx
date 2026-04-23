import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  Pressable,
  Modal,
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
  { icon: "link" as const, title: "Backlink Outreach", desc: "Earned links from real editors", color: "#10B981" },
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
      { name: "Automation", role: "n8n + Make + webhooks", letter: "A", color: "#0d9488" },
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

const aloneBullets = [
  "Thousands of credits spent on prompts that almost work",
  "Generic outputs that ignore your niche, users, and voice",
  "Half-built assets with no one to stitch them together",
  "Open-ended bills that grow every month you delay shipping",
];

const managedBullets = [
  "Proprietary in-house model stack tuned for product, code, and copy",
  "Expert prompting and review, so outputs land your niche on the first pass",
  "Full lifecycle of assets and code, from first mock to live product",
  "Fixed scope, fixed budget, no surprise bills mid-build",
];

const proofCards: { icon: keyof typeof Feather.glyphMap; title: string; desc: string }[] = [
  {
    icon: "star",
    title: "Proprietary AI stack",
    desc: "A curated mix of frontier and in-house models, picked per task so you pay for output, not experimentation.",
  },
  {
    icon: "package",
    title: "Full asset & code lifecycle",
    desc: "One team owns the brand, design system, copy, code, and launch, so nothing gets dropped between tools.",
  },
  {
    icon: "check-square",
    title: "Fixed scope, fixed budget",
    desc: "Clear deliverables and a flat price agreed up front, so there are no surprise bills mid-build.",
  },
];

const packages = [
  { name: "Mockup", price: "$699", credits: "Founder-ready visuals + starter functions", time: "3-5 days", badge: "AI + Figma" },
  { name: "Prototype", price: "$2,399", credits: "Clickable end-to-end demo", time: "5-10 days", badge: "AI + Figma", popular: true },
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
  const [showAiEfficiency, setShowAiEfficiency] = React.useState(false);
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
    <>
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
        <View style={[styles.heroEyebrow, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <View style={styles.heroEyebrowDot} />
          <ThemedText type="caption" style={[styles.heroEyebrowText, { color: theme.text }]}>
            Booking April-May 2026 · 3 slots left
          </ThemedText>
        </View>
        <ThemedText type="display" style={styles.heroTitle}>
          Your technical{"\n"}co-founder, without{"\n"}the equity split.
        </ThemedText>
        <ThemedText type="body" style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
          A small AI-native studio building mockups, prototypes, and shippable MVPs in 3 to 8 weeks.
        </ThemedText>
        <View style={styles.statsRow}>
          <ThemedText type="caption" style={[styles.statItem, { color: theme.textTertiary }]}>
            <ThemedText type="caption" style={{ color: theme.text, fontWeight: "700" }}>~200</ThemedText> founders shipped
          </ThemedText>
          <ThemedText type="caption" style={{ color: theme.textTertiary }}>·</ThemedText>
          <ThemedText type="caption" style={[styles.statItem, { color: theme.textTertiary }]}>
            <ThemedText type="caption" style={{ color: theme.text, fontWeight: "700" }}>$50M+</ThemedText> raised
          </ThemedText>
          <ThemedText type="caption" style={{ color: theme.textTertiary }}>·</ThemedText>
          <ThemedText type="caption" style={[styles.statItem, { color: theme.textTertiary }]}>
            <ThemedText type="caption" style={{ color: theme.text, fontWeight: "700" }}>3-8 weeks</ThemedText> to launch
          </ThemedText>
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
          subtitle="One landing page or a full multi-platform product. We cover both."
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

      {/* AI Efficiency teaser */}
      <View style={styles.section}>
        <Pressable
          onPress={() => setShowAiEfficiency(true)}
          style={({ pressed }) => [
            styles.aeTeaser,
            {
              backgroundColor: theme.backgroundDefault,
              borderColor: "#14b8a6",
              opacity: pressed ? 0.85 : 1,
            },
          ]}
          testID="button-open-ae-modal"
        >
          <View style={styles.aeTeaserHeader}>
            <View style={[styles.aeTeaserBadge, { backgroundColor: "#14b8a622", borderColor: "#14b8a6" }]}>
              <View style={styles.aeTeaserDot} />
              <ThemedText style={[styles.aeTagText, { color: "#14b8a6" }]}>AI Efficiency & Value</ThemedText>
            </View>
            <Feather name="arrow-up-right" size={18} color={theme.textSecondary} />
          </View>
          <ThemedText type="h3" style={{ marginBottom: 4 }}>
            Stop burning credits. Start shipping product.
          </ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary, marginBottom: Spacing.md }}>
            Why a managed AI stack delivers 3-10x the value of going it alone.
          </ThemedText>
          <View style={[styles.aeTeaserCta, { borderTopColor: theme.border }]}>
            <ThemedText style={[styles.aeTeaserCtaText, { color: "#14b8a6" }]}>See the comparison</ThemedText>
            <Feather name="chevron-right" size={16} color="#14b8a6" />
          </View>
        </Pressable>
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
            Describe it in plain English. You'll get a plan, a price, and a timeline back, usually within 24 hours.
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

    <Modal
      visible={showAiEfficiency}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowAiEfficiency(false)}
    >
      <View style={[styles.aeModalRoot, { backgroundColor: theme.backgroundRoot }]}>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: Spacing.xl,
            paddingTop: Spacing["2xl"],
            paddingBottom: insets.bottom + Spacing["2xl"],
            gap: Spacing.lg,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.aeModalHero}>
            <Pressable
              onPress={() => setShowAiEfficiency(false)}
              hitSlop={12}
              style={({ pressed }) => [
                styles.aeModalCloseFloat,
                { backgroundColor: theme.backgroundDefault, borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
              ]}
              testID="button-close-ae-modal"
            >
              <Feather name="x" size={18} color={theme.text} />
            </Pressable>
            <View style={[styles.aeEyebrow, { backgroundColor: "#14b8a615", borderColor: "#14b8a655" }]}>
              <View style={styles.aeEyebrowDot} />
              <ThemedText style={[styles.aeEyebrowText, { color: "#14b8a6" }]}>AI EFFICIENCY & VALUE</ThemedText>
            </View>
            <ThemedText type="h2" style={styles.aeModalTitle}>
              Stop burning credits.{"\n"}Start shipping product.
            </ThemedText>
            <ThemedText type="body" style={[styles.aeModalLede, { color: theme.textSecondary }]}>
              Most founders quietly burn $10,000+ on AI credits and tools that never quite fit their niche before they ship anything real. We turn that spend into working product.
            </ThemedText>
          </View>

          <View
            style={[
              styles.aePanelV2,
              { backgroundColor: theme.backgroundDefault, borderColor: theme.border, borderLeftColor: "#f87171", borderLeftWidth: 4 },
            ]}
            testID="card-ae-alone"
          >
            <View style={[styles.aeTagV2, { backgroundColor: "#f8717118", borderColor: "#f8717155", marginBottom: Spacing.sm }]}>
              <ThemedText style={[styles.aeTagText, { color: "#f87171" }]}>GOING IT ALONE</ThemedText>
            </View>
            <ThemedText type="h3" style={styles.aePanelTitle}>
              Trial, error, and a credit card on file
            </ThemedText>
            <ThemedText type="caption" style={[styles.aePanelLede, { color: theme.textSecondary }]}>
              The cost of figuring it out yourself, in public, on the clock.
            </ThemedText>
            <View style={{ gap: Spacing.sm + 2 }}>
              {aloneBullets.map((b) => (
                <View key={b} style={styles.aeBulletRow}>
                  <View style={[styles.aeBulletChip, { backgroundColor: "#f8717118", borderColor: "#f8717140" }]}>
                    <Feather name="x" size={13} color="#f87171" />
                  </View>
                  <ThemedText type="caption" style={[styles.aeBulletText, { color: theme.textSecondary }]}>
                    {b}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>

          <View
            style={[
              styles.aePanelV2,
              { backgroundColor: theme.backgroundDefault, borderColor: "#14b8a6", borderWidth: 1.5, borderLeftColor: "#14b8a6", borderLeftWidth: 4 },
            ]}
            testID="card-ae-managed"
          >
            <View style={[styles.aeTagV2, { backgroundColor: "#14b8a618", borderColor: "#14b8a655", marginBottom: Spacing.sm }]}>
              <ThemedText style={[styles.aeTagText, { color: "#14b8a6" }]}>WITH START APPS STUDIO</ThemedText>
            </View>
            <ThemedText type="h3" style={styles.aePanelTitle}>
              Know-how, plus the delivery to back it up
            </ThemedText>
            <ThemedText type="caption" style={[styles.aePanelLede, { color: theme.textSecondary }]}>
              A managed AI stack and a team that has done this hundreds of times.
            </ThemedText>
            <View style={{ gap: Spacing.sm + 2 }}>
              {managedBullets.map((b) => (
                <View key={b} style={styles.aeBulletRow}>
                  <View style={[styles.aeBulletChip, { backgroundColor: "#14b8a618", borderColor: "#14b8a640" }]}>
                    <Feather name="check" size={13} color="#14b8a6" />
                  </View>
                  <ThemedText type="caption" style={[styles.aeBulletText, { color: theme.textSecondary }]}>
                    {b}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>

          <View
            style={[
              styles.aeRatio,
              { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
            ]}
            testID="card-ae-ratio"
            accessibilityLabel="Credit waste comparison: managed delivery uses about 32 percent on iteration while solo founders lose about 68 percent to trial and error."
          >
            <View style={styles.aeRatioHead}>
              <ThemedText type="caption" style={[styles.aeRatioTitle, { color: theme.textSecondary }]}>
                CREDIT WASTE, AT A GLANCE
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary, lineHeight: 18 }}>
                Managed delivery converts about{" "}
                <ThemedText type="caption" style={{ color: "#14b8a6", fontWeight: "700" }}>3x</ThemedText>
                {" "}more spend into shipped product.
              </ThemedText>
            </View>
            <View style={[styles.aeRatioTrack, { borderColor: "#f8717140", backgroundColor: "#f8717122" }]}>
              <View style={styles.aeRatioFill} />
            </View>
            <View style={styles.aeRatioLegend}>
              <View style={styles.aeRatioLegendItem}>
                <View style={[styles.aeRatioSwatch, { backgroundColor: "#14b8a6" }]} />
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  <ThemedText type="caption" style={{ color: theme.text, fontWeight: "700" }}>Managed</ThemedText>
                  {" "}·{" "}~32% iteration
                </ThemedText>
              </View>
              <View style={styles.aeRatioLegendItem}>
                <View style={[styles.aeRatioSwatch, { backgroundColor: "#f87171" }]} />
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  <ThemedText type="caption" style={{ color: theme.text, fontWeight: "700" }}>Solo</ThemedText>
                  {" "}·{" "}~68% lost
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={{ gap: Spacing.xs, marginTop: Spacing.xs }}>
            <ThemedText type="caption" style={[styles.aeSectionLabel, { color: theme.textSecondary }]}>
              WHAT MANAGED DELIVERY GIVES YOU
            </ThemedText>
          </View>

          <View style={{ gap: Spacing.sm }}>
            {proofCards.map((p) => (
              <View
                key={p.title}
                style={[
                  styles.aeProofCardV2,
                  { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
                ]}
                testID={`card-ae-proof-${p.title}`}
              >
                <View style={[styles.aeProofIcon, { backgroundColor: "#14b8a618", borderColor: "#14b8a640" }]}>
                  <Feather name={p.icon} size={18} color="#14b8a6" />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText type="h4" style={{ marginBottom: 2 }}>{p.title}</ThemedText>
                  <ThemedText type="caption" style={{ color: theme.textSecondary, lineHeight: 18 }}>
                    {p.desc}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>

          <Pressable
            onPress={() => {
              setShowAiEfficiency(false);
              openContact();
            }}
            style={({ pressed }) => [
              styles.aeModalCta,
              { backgroundColor: theme.text, opacity: pressed ? 0.85 : 1 },
            ]}
            testID="button-ae-modal-cta"
          >
            <ThemedText style={[styles.heroCtaText, { color: theme.buttonText }]}>Start your build</ThemedText>
            <Feather name="arrow-right" size={16} color={theme.buttonText} />
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
    </>
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
  heroEyebrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  heroEyebrowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#0d9488",
  },
  heroEyebrowText: { fontWeight: "600" as const, fontSize: 12 },
  heroTitle: { textAlign: "center", marginBottom: Spacing.md },
  heroSubtitle: { textAlign: "center", maxWidth: 320 },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.md,
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
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
  aePanel: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  aeTag: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  aeTagText: { fontSize: 11, fontWeight: "700" as const, letterSpacing: 0.4 },
  aePanelTitle: { marginBottom: 4 },
  aePanelLede: { marginBottom: Spacing.md, lineHeight: 20 },
  aeBulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  aeBulletIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  aeBulletText: { flex: 1, lineHeight: 18 },
  aeStatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  aeStatValue: { fontSize: 22, fontWeight: "700" as const, letterSpacing: -0.5 },
  aeRatio: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  aeRatioHead: { gap: 4, marginBottom: Spacing.md },
  aeRatioTitle: { letterSpacing: 1.4, fontWeight: "700" as const, fontSize: 11 },
  aeRatioTrack: {
    height: 14,
    borderRadius: 999,
    borderWidth: 1,
    overflow: "hidden",
  },
  aeRatioFill: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: "32%",
    borderRadius: 999,
    backgroundColor: "#14b8a6",
  },
  aeRatioLegend: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 4,
    marginTop: Spacing.sm,
  },
  aeProofCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  aeProofIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  aeTeaser: {
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    padding: Spacing.lg,
  },
  aeTeaserHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  aeTeaserBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  aeTeaserDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#14b8a6",
  },
  aeTeaserCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  aeTeaserCtaText: { fontSize: 14, fontWeight: "600" as const },
  aeModalRoot: { flex: 1 },
  aeModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  aeModalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  aeModalHero: {
    alignItems: "center",
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  aeModalCloseFloat: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  aeEyebrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  aeEyebrowDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#14b8a6" },
  aeEyebrowText: { fontSize: 11, fontWeight: "700" as const, letterSpacing: 1.2 },
  aeModalTitle: {
    textAlign: "center",
    letterSpacing: -0.5,
    lineHeight: 32,
    marginTop: 4,
  },
  aeModalLede: {
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 360,
    marginTop: 4,
  },
  aePanelV2: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  aePanelHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  aeTagV2: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  aeStatBig: { fontSize: 24, fontWeight: "800" as const, letterSpacing: -0.5 },
  aeBulletChip: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  aeSectionLabel: {
    fontSize: 11,
    fontWeight: "700" as const,
    letterSpacing: 1.2,
    textAlign: "center",
  },
  aeProofCardV2: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  aeRatioLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  aeRatioSwatch: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  aeModalCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
  },
});
