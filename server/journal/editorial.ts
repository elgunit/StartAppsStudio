import { getLocale, type LocaleDefinition } from "../i18n/locales";
import { getPost, posts as sourcePosts, type Post } from "./posts";
import AZ_EDITORIAL_CONTENT from "./locales/az";
import DE_EDITORIAL_CONTENT from "./locales/de";
import ES_EDITORIAL_CONTENT from "./locales/es";
import FR_EDITORIAL_CONTENT from "./locales/fr";
import IT_EDITORIAL_CONTENT from "./locales/it";
import KO_EDITORIAL_CONTENT from "./locales/ko";
import RU_EDITORIAL_CONTENT from "./locales/ru";
import TR_EDITORIAL_CONTENT from "./locales/tr";
import UK_EDITORIAL_CONTENT from "./locales/uk";
import ZH_EDITORIAL_CONTENT from "./locales/zh";

export const TRANSLATED_MVP_SLUG = "the-mvp-brief-is-your-first-product-decision";

export interface EditorialCopy {
  journalName: string;
  journalTitle: string;
  journalDescription: string;
  resourcesTitle: string;
  resourcesDescription: string;
  read: string;
  minutes: string;
  allNotes: string;
  sources: string;
  shortAnswer: string;
  language: string;
  translatedArticleTitle: string;
  translatedArticleDescription: string;
}

export interface ResourceRouteCard {
  kicker: string;
  title: string;
  text: string;
  bullets: readonly string[];
}

export interface ResourcePackage {
  route: string;
  investment: string;
  timing: string;
  bestFor: string;
}

export interface ResourceTool {
  name: string;
  note: string;
  tone: string;
}

export interface ResourceToolkitGroup {
  label: string;
  description: string;
  tools: readonly ResourceTool[];
  open?: boolean;
}

export interface ResourcesContent {
  title: string;
  description: string;
  eyebrow: string;
  primaryAction: string;
  journalAction: string;
  routes: { title: string; intro: string; cards: readonly ResourceRouteCard[] };
  packages: {
    title: string;
    intro: string;
    columns: readonly [string, string, string, string];
    rows: readonly ResourcePackage[];
  };
  toolkit: {
    title: string;
    intro: string;
    groups: readonly ResourceToolkitGroup[];
    footnote: string;
  };
  journal: {
    title: string;
    text: string;
    readAction: string;
    minutesLabel: string;
    allAction: string;
    fallbackCategory: string;
    postSlugs: readonly string[];
  };
  cta: { title: string; text: string; action: string };
}

/**
 * A translation is deliberately all-or-nothing: copy, Resources, and the
 * complete authored Post must travel together. Locale modules can export this
 * interface once their translation is ready.
 */
export interface LocaleEditorialContent {
  copy: EditorialCopy;
  resources: ResourcesContent;
  post: Post;
  translatedPosts: Readonly<Record<string, Post>>;
}

export type PendingLocaleEditorialContent = Partial<LocaleEditorialContent>;

const sourcePost = getPost(TRANSLATED_MVP_SLUG);
if (!sourcePost) throw new Error(`Missing editorial source post "${TRANSLATED_MVP_SLUG}".`);

const ENGLISH_CONTENT: LocaleEditorialContent = {
  copy: {
    journalName: "The Journal · Vol. I",
    journalTitle: "Field notes from the studio.",
    journalDescription: "Dispatches on shipping MVPs that rank on Google and get quoted by AI: GEO, vibe-coding, and the state of AI at work.",
    resourcesTitle: "Practical guides for building and launching digital products.",
    resourcesDescription: "Practical resources on product strategy, AI-assisted delivery, technology choices, ownership, handoff, and launching an MVP.",
    read: "Read note",
    minutes: "min read",
    allNotes: "All notes",
    sources: "Sources",
    shortAnswer: "Short answer",
    language: "Language",
    translatedArticleTitle: "The MVP brief is your first product decision",
    translatedArticleDescription: "A useful MVP brief names the first user, sets the boundary of version one, and defines the evidence for the next decision.",
  },
  resources: {
    title: "Practical guides for building and launching digital products.",
    description: "Practical resources on product strategy, AI-assisted delivery, technology choices, ownership, handoff, and launching an MVP.",
    eyebrow: "Start Apps Studio · Resources",
    primaryAction: "Talk through your project",
    journalAction: "Read the Journal",
    routes: {
      title: "Choose the next route",
      intro: "The right first milestone depends on what you need to prove, not on how much software you can imagine.",
      cards: [
        { kicker: "01 · Direction", title: "Start with the smallest useful proof", text: "A launch site answers whether people understand the offer. A prototype answers whether they can react to the experience. An MVP answers what real users do.", bullets: ["Choose one decision the next release must unlock", "Keep the first version narrow enough to learn from", "Use the package that matches the evidence you need"] },
        { kicker: "02 · AI-assisted delivery", title: "Speed is useful when the structure holds", text: "AI can accelerate exploration, coding, and review. It does not replace product judgment, architecture, testing, or the person accountable for the result.", bullets: ["Use AI to explore options and reduce repetition", "Review generated code against real user flows", "Keep the shipped system understandable and extensible"] },
        { kicker: "03 · Ownership", title: "Ask what arrives at handoff", text: "A successful build is more than a final presentation. The source code, design files, accounts, deployment access, and context should be ready for you or your next team.", bullets: ["Confirm who owns the accounts and working files", "Review working progress before the final week", "Leave with a documented, maintainable foundation"] },
        { kicker: "04 · Partner fit", title: "Compare the way of working", text: "Before choosing a product partner, compare scope clarity, feedback loops, responsibility, support after launch, and whether the route fits the stage of your business.", bullets: ["Who makes the product decisions?", "When will you see something real?", "Can another team continue without starting over?"] },
      ],
    },
    packages: {
      title: "Package routing guide",
      intro: "Use the public packages as a starting point for the conversation. Scope is agreed before work starts.",
      columns: ["Route", "Investment", "Typical timing", "Best when you need to"],
      rows: [
        { route: "Launch Site", investment: "$2,600", timing: "3–5 business days", bestFor: "Explain the offer and create a credible digital presence" },
        { route: "Prototype", investment: "$6,000", timing: "5–10 days", bestFor: "Make an idea tangible for validation, fundraising, or early conversations" },
        { route: "MVP", investment: "$15,000–$30,000", timing: "3–8 weeks", bestFor: "Put a real web, iOS, or Android product in users’ hands" },
        { route: "Custom", investment: "$25,000", timing: "1–6 months", bestFor: "Build a larger or more complex system with longer-term accountability" },
      ],
    },
    toolkit: {
      title: "The toolkit behind the work",
      intro: "Tools are selected for the product outcome, the team taking it over, and the stage of the business.",
      groups: [
        { label: "Your idea, made visible", description: "How a concept becomes screens you can tap, share with investors, and test with real users.", tools: [{ name: "Figma", note: "every screen designed before code", tone: "figma" }, { name: "Rork", note: "try it on a real phone in days", tone: "rork" }, { name: "Lovable", note: "launch site live in days", tone: "lovable" }, { name: "Replit", note: "working product you can run and edit", tone: "replit" }] },
        { label: "Your product, built to last", description: "The engineering that powers the app your users install, open, and pay for.", tools: [{ name: "React Native", note: "one codebase, iOS + Android", tone: "expo" }, { name: "Swift", note: "native iOS, fastest on iPhone", tone: "swift" }, { name: "Kotlin", note: "native Android, full Play Store reach", tone: "kotlin" }, { name: "Node + PostgreSQL", note: "your data, secure and yours to export", tone: "node" }] },
        { label: "Revenue & launch, day one", description: "Payments, updates, and code safety wired in from the start, not bolted on after.", open: true, tools: [{ name: "Stripe", note: "one-time, subscriptions, upgrades", tone: "stripe" }, { name: "RevenueCat", note: "App Store & Play Store billing", tone: "revenuecat" }, { name: "GitHub", note: "daily backups: your code is always safe", tone: "github" }, { name: "Automation", note: "n8n + Make handle the busywork", tone: "hooks" }] },
        { label: "AI in the background, not in your way", description: "AI can support research, implementation, and review while a person owns the direction and quality bar.", tools: [{ name: "Claude", note: "primary builder and code reviewer", tone: "claude" }, { name: "Gemini", note: "reviews the whole product at once", tone: "gemini" }, { name: "GPT-5", note: "copy, flows & creative direction", tone: "gpt" }, { name: "Llama 4", note: "self-hosted option for sensitive work", tone: "llama" }] },
      ],
      footnote: "You keep the code, accounts, and working files. When a better tool ships, it can be swapped in without holding your product hostage.",
    },
    journal: {
      title: "Field notes from the Journal",
      text: "Longer notes on MVP strategy, SEO, GEO, vibe-coded apps, and the decisions that make a product easier to ship.",
      readAction: "Read note",
      minutesLabel: "min read",
      allAction: "All journal notes",
      fallbackCategory: "Journal",
      postSlugs: [
        "base44-vs-lovable-which-one-for-your-next-app",
        "the-mvp-brief-is-your-first-product-decision",
        "make-your-brand-visible-in-chatgpt",
        "vibe-coded-apps-have-an-seo-problem",
        "backlinks-still-decide-who-gets-recommended",
        "ai-overviews-citation-playbook-for-mvps",
      ],
    },
    cta: { title: "Have a route in mind?", text: "Share where you are, what you need to prove, and what is currently stuck.", action: "Get a clear next step" },
  },
  post: sourcePost,
  translatedPosts: Object.fromEntries(
    sourcePosts.map((post) => [post.slug, post]),
  ),
};

export const localeEditorialContent: Record<string, PendingLocaleEditorialContent> = {
  en: ENGLISH_CONTENT,
  az: AZ_EDITORIAL_CONTENT,
  tr: TR_EDITORIAL_CONTENT,
  ru: RU_EDITORIAL_CONTENT,
  zh: ZH_EDITORIAL_CONTENT,
  fr: FR_EDITORIAL_CONTENT,
  es: ES_EDITORIAL_CONTENT,
  de: DE_EDITORIAL_CONTENT,
  uk: UK_EDITORIAL_CONTENT,
  it: IT_EDITORIAL_CONTENT,
  ko: KO_EDITORIAL_CONTENT,
};

function resolvedContent(locale: string): LocaleEditorialContent {
  if (locale === "en") return ENGLISH_CONTENT;
  const candidate = localeEditorialContent[locale];
  if (
    candidate?.copy &&
    candidate.resources &&
    candidate.post &&
    candidate.translatedPosts
  ) {
    return candidate as LocaleEditorialContent;
  }
  throw new Error(`Incomplete editorial content for locale "${locale}".`);
}

export function editorialCopy(locale: string): EditorialCopy {
  return resolvedContent(locale).copy;
}

export function resourcesContent(locale: string): ResourcesContent {
  return resolvedContent(locale).resources;
}

export function editorialPath(locale: string, path: string): string {
  return locale === "en" ? path : `/${locale}${path}`;
}

export function translatedPost(post: Post, locale: string): Post {
  if (locale === "en") return post;
  const content = resolvedContent(locale);
  if (post.slug === TRANSLATED_MVP_SLUG) return content.post;
  const localized = content.translatedPosts[post.slug];
  if (!localized) {
    throw new Error(
      `Missing ${locale} Journal translation for "${post.slug}".`,
    );
  }
  return localized;
}

export function validateLocaleEditorialContent(content: LocaleEditorialContent): string[] {
  const errors: string[] = [];
  if (!content.copy || !content.resources || !content.post) errors.push("copy, resources, and post are required");
  if (content.post?.slug !== TRANSLATED_MVP_SLUG) errors.push(`post must be "${TRANSLATED_MVP_SLUG}"`);
  if (content.resources?.routes.cards.length !== 4) errors.push("Resources must include four route cards");
  if (content.resources?.packages.rows.length !== 4) errors.push("Resources must include four package rows");
  if (content.resources?.toolkit.groups.length !== 4) errors.push("Resources must include four toolkit groups");
  if (content.post && sourcePost && JSON.stringify(postStructure(content.post.body)) !== JSON.stringify(postStructure(sourcePost.body))) {
    errors.push("post body must retain the source block structure");
  }
  for (const source of sourcePosts) {
    const translated =
      source.slug === TRANSLATED_MVP_SLUG
        ? content.post
        : content.translatedPosts[source.slug];
    if (!translated) {
      errors.push(`translated post "${source.slug}" is missing`);
      continue;
    }
    if (translated.slug !== source.slug) {
      errors.push(`translated post "${source.slug}" changed its slug`);
    }
    if (
      JSON.stringify(postStructure(translated.body)) !==
      JSON.stringify(postStructure(source.body))
    ) {
      errors.push(`translated post "${source.slug}" must retain the source block structure`);
    }
  }
  return errors;
}

function postStructure(body: Post["body"]): unknown {
  return body.map((block) => {
    if (block.type === "ul" || block.type === "ol") return { type: block.type, items: block.items.length };
    if (block.type === "faq") return { type: block.type, items: block.items.length };
    return { type: block.type, id: "id" in block ? block.id : undefined };
  });
}

export function validateInstalledEditorialContent(): string[] {
  return Object.entries(localeEditorialContent).flatMap(([locale, content]) => {
    if (!content.copy || !content.resources || !content.post) {
      return [`${locale}: copy, resources, and post are required`];
    }
    return validateLocaleEditorialContent(content as LocaleEditorialContent).map((error) => `${locale}: ${error}`);
  });
}

export function localeDefinition(locale: string): LocaleDefinition {
  return getLocale(locale);
}