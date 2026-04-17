import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Image,
  ActivityIndicator,
  Pressable,
  ScrollView,
} from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/lib/auth";
import { Spacing, BorderRadius } from "@/constants/theme";
import { resolveAssetUrl } from "@/lib/journal";
import { trackVisitorEvent } from "@/lib/tracking";

type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string; id?: string }
  | { type: "h3"; text: string; id?: string }
  | { type: "answer"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "quote"; text: string; cite?: string }
  | { type: "callout"; title?: string; text: string }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "faq"; items: { q: string; a: string }[] };

type Post = {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  heroImage: string;
  heroAlt: string;
  publishedAt: string;
  updatedAt?: string;
  readMinutes: number;
  tags: string[];
  body: Block[];
  sources?: { label: string; url?: string }[];
};

type JournalArticleRoute = RouteProp<
  { JournalArticle: { slug: string } },
  "JournalArticle"
>;

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function stripInline(s: string): string {
  return s
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const { theme } = useTheme();
  return (
    <Pressable
      testID={`faq-${q.slice(0, 20)}`}
      onPress={() => setOpen((v) => !v)}
      style={[
        styles.faqItem,
        { borderColor: theme.border, backgroundColor: theme.backgroundDefault },
      ]}
    >
      <View style={styles.faqHeader}>
        <ThemedText type="h4" style={styles.faqQ}>
          {q}
        </ThemedText>
        <Feather
          name={open ? "chevron-up" : "chevron-down"}
          size={20}
          color={theme.textSecondary}
        />
      </View>
      {open ? (
        <ThemedText
          type="body"
          style={{ color: theme.textSecondary, marginTop: Spacing.sm }}
        >
          {stripInline(a)}
        </ThemedText>
      ) : null}
    </Pressable>
  );
}

function BlockView({ block }: { block: Block }) {
  const { theme } = useTheme();
  switch (block.type) {
    case "p":
      return (
        <ThemedText type="body" style={styles.block}>
          {stripInline(block.text)}
        </ThemedText>
      );
    case "h2":
      return (
        <ThemedText type="h2" style={[styles.block, styles.h2]}>
          {stripInline(block.text)}
        </ThemedText>
      );
    case "h3":
      return (
        <ThemedText type="h3" style={[styles.block, styles.h3]}>
          {stripInline(block.text)}
        </ThemedText>
      );
    case "answer":
      return (
        <View
          style={[
            styles.answer,
            styles.block,
            { borderLeftColor: theme.text, backgroundColor: theme.backgroundDefault },
          ]}
        >
          <ThemedText type="body" style={{ fontStyle: "italic" }}>
            {stripInline(block.text)}
          </ThemedText>
        </View>
      );
    case "ul":
      return (
        <View style={styles.block}>
          {block.items.map((it, i) => (
            <View key={i} style={styles.listRow}>
              <ThemedText type="body" style={styles.bullet}>
                •
              </ThemedText>
              <ThemedText type="body" style={styles.listText}>
                {stripInline(it)}
              </ThemedText>
            </View>
          ))}
        </View>
      );
    case "ol":
      return (
        <View style={styles.block}>
          {block.items.map((it, i) => (
            <View key={i} style={styles.listRow}>
              <ThemedText type="body" style={styles.bullet}>
                {i + 1}.
              </ThemedText>
              <ThemedText type="body" style={styles.listText}>
                {stripInline(it)}
              </ThemedText>
            </View>
          ))}
        </View>
      );
    case "quote":
      return (
        <View
          style={[
            styles.quote,
            styles.block,
            { borderLeftColor: theme.border },
          ]}
        >
          <ThemedText type="body" style={{ fontStyle: "italic" }}>
            “{stripInline(block.text)}”
          </ThemedText>
          {block.cite ? (
            <ThemedText
              type="caption"
              style={{ color: theme.textSecondary, marginTop: Spacing.xs }}
            >
              — {block.cite}
            </ThemedText>
          ) : null}
        </View>
      );
    case "callout":
      return (
        <Card style={styles.block} elevation={2}>
          {block.title ? (
            <ThemedText type="h4" style={{ marginBottom: Spacing.xs }}>
              {block.title}
            </ThemedText>
          ) : null}
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            {stripInline(block.text)}
          </ThemedText>
        </Card>
      );
    case "image":
      return (
        <View style={styles.block}>
          <Image
            source={{ uri: resolveAssetUrl(block.src) }}
            style={[
              styles.contentImage,
              { backgroundColor: theme.backgroundSecondary },
            ]}
            resizeMode="cover"
            accessibilityLabel={block.alt}
          />
          {block.caption ? (
            <ThemedText
              type="caption"
              style={{
                color: theme.textTertiary,
                marginTop: Spacing.xs,
                textAlign: "center",
              }}
            >
              {block.caption}
            </ThemedText>
          ) : null}
        </View>
      );
    case "faq":
      return (
        <View style={styles.block}>
          {block.items.map((it, i) => (
            <FaqItem key={i} q={it.q} a={it.a} />
          ))}
        </View>
      );
    default:
      return null;
  }
}

export default function JournalArticleScreen() {
  const route = useRoute<JournalArticleRoute>();
  const { slug } = route.params;
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { isAuthenticated, user } = useAuth();

  const { data, isLoading, isError } = useQuery<{ post: Post }>({
    queryKey: ["/api/journal/posts", slug],
  });

  const post = data?.post;

  if (isLoading) {
    return (
      <View
        style={[
          styles.center,
          { backgroundColor: theme.backgroundRoot, paddingTop: headerHeight },
        ]}
      >
        <ActivityIndicator color={theme.text} />
      </View>
    );
  }

  if (isError || !post) {
    return (
      <View
        style={[
          styles.center,
          { backgroundColor: theme.backgroundRoot, paddingTop: headerHeight },
        ]}
      >
        <ThemedText type="body">Article not found.</ThemedText>
      </View>
    );
  }

  const handleCta = () => {
    if (isAuthenticated && user?.role === "client") {
      trackVisitorEvent("journal_cta_click", {
        slug: post.slug,
        title: post.title,
        destination: "new_project",
      });
      navigation.navigate("NewProject");
    } else if (isAuthenticated) {
      trackVisitorEvent("journal_cta_click", {
        slug: post.slug,
        title: post.title,
        destination: "client_main",
      });
      navigation.navigate("ClientMain");
    } else {
      trackVisitorEvent("journal_cta_click", {
        slug: post.slug,
        title: post.title,
        destination: "journal_signup",
      });
      navigation.navigate("JournalSignup", {
        slug: post.slug,
        title: post.title,
      });
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <ThemedText type="caption" style={{ color: theme.textTertiary }}>
        {formatDate(post.publishedAt)} · {post.readMinutes} min read
      </ThemedText>
      <ThemedText
        type="display"
        style={{ marginTop: Spacing.sm }}
        testID={`text-journal-title-${post.slug}`}
      >
        {post.title}
      </ThemedText>
      <ThemedText
        type="body"
        style={{ color: theme.textSecondary, marginTop: Spacing.md }}
      >
        {post.description}
      </ThemedText>

      {post.tags.length > 0 ? (
        <View style={styles.tagRow}>
          {post.tags.map((tag) => (
            <View
              key={tag}
              style={[styles.tag, { backgroundColor: theme.backgroundSecondary }]}
            >
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                {tag}
              </ThemedText>
            </View>
          ))}
        </View>
      ) : null}

      <Image
        source={{ uri: resolveAssetUrl(post.heroImage) }}
        style={[
          styles.hero,
          { backgroundColor: theme.backgroundSecondary, marginTop: Spacing.xl },
        ]}
        resizeMode="cover"
        accessibilityLabel={post.heroAlt}
      />

      <View style={{ marginTop: Spacing.xl }}>
        {post.body.map((b, i) => (
          <BlockView key={i} block={b} />
        ))}
      </View>

      {post.sources && post.sources.length > 0 ? (
        <View style={[styles.sources, { borderTopColor: theme.border }]}>
          <ThemedText type="h4" style={{ marginBottom: Spacing.sm }}>
            Sources
          </ThemedText>
          {post.sources.map((s, i) => (
            <ThemedText
              key={i}
              type="small"
              style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}
            >
              • {s.label}
            </ThemedText>
          ))}
        </View>
      ) : null}

      <Card style={styles.cta} elevation={2}>
        <ThemedText type="h3">Ready to ship an MVP that ranks?</ThemedText>
        <ThemedText
          type="body"
          style={{ color: theme.textSecondary, marginTop: Spacing.sm }}
        >
          Start Apps Studio designs and builds GEO-ready MVPs from prompt to
          production.
        </ThemedText>
        <View style={{ marginTop: Spacing.lg }}>
          <Button onPress={handleCta} testID="button-journal-cta">
            Start a project
          </Button>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  hero: { width: "100%", height: 220, borderRadius: BorderRadius.lg },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  block: { marginBottom: Spacing.lg },
  h2: { marginTop: Spacing.lg },
  h3: { marginTop: Spacing.md },
  answer: {
    borderLeftWidth: 3,
    paddingLeft: Spacing.md,
    paddingVertical: Spacing.md,
    paddingRight: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  listRow: { flexDirection: "row", marginBottom: Spacing.xs },
  bullet: { width: 24 },
  listText: { flex: 1 },
  quote: {
    borderLeftWidth: 3,
    paddingLeft: Spacing.md,
  },
  callout: {},
  contentImage: {
    width: "100%",
    height: 220,
    borderRadius: BorderRadius.lg,
  },
  faqItem: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  faqHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  faqQ: { flex: 1, paddingRight: Spacing.md },
  sources: {
    borderTopWidth: 1,
    paddingTop: Spacing.lg,
    marginTop: Spacing.lg,
  },
  cta: { marginTop: Spacing.xl },
});
