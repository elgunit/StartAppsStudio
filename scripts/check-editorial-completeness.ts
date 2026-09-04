import { LOCALES, PREFIXED_CODES } from "../server/i18n/locales";
import {
  localeEditorialContent,
  TRANSLATED_MVP_SLUG,
  validateInstalledEditorialContent,
} from "../server/journal/editorial";
import {
  allPostsNewestFirst,
  type Block,
  type Post,
} from "../server/journal/posts";
import {
  renderArticleHtml,
  renderIndexHtml,
  renderResourcesHtml,
  renderSitemapXml,
} from "../server/journal/render";

const origin = "https://startappsstudio.com";
const sourcePosts = allPostsNewestFirst();
const errors: string[] = validateInstalledEditorialContent();

const INTENTIONAL_INVARIANTS = new Set([
  "AI",
  "AI Overviews",
  "AI-native",
  "AIO",
  "API",
  "B2B",
  "Base44",
  "Backlinks",
  "ChatGPT",
  "Claude",
  "Claude Code",
  "DR",
  "Design",
  "Design Systems",
  "E-E-A-T",
  "FAQ",
  "FAQPage",
  "GEO",
  "Generative UI",
  "Google",
  "Google Search Console",
  "HTML",
  "JSON-LD",
  "LLM",
  "LLM SEO",
  "Lovable",
  "MVP",
  "Notion",
  "Off-page",
  "Perplexity",
  "Play Store",
  "Reddit",
  "SEO",
  "SSR",
  "SaaS",
  "Schema",
  "Start Apps Studio",
  "Stripe",
  "TikTok",
  "UI",
  "UX",
  "Vercel",
  "Vibe coding",
  "Web",
]);

const PROTECTED_TERMS = [
  "Start Apps Studio",
  "Google Search Console",
  "Google AI Overviews",
  "Cloudflare Worker",
  "Claude Code",
  "Product Hunt",
  "FAQPage",
  "JSON-LD",
  "ChatGPT",
  "Perplexity",
  "Supabase",
  "Vercel",
  "Lovable",
  "Base44",
  "GitHub",
  "HubSpot",
  "Reddit",
  "TikTok",
  "Bolt",
  "React",
] as const;

const PLACEHOLDER_PATTERNS = [
  /\b(?:tbd|translation pending|translate this|not translated|placeholder|lorem ipsum)\b/i,
  /\bTODO\s*:/i,
  /\b(?:key point to examine|this article explains|item \d+ to verify|step \d+: proceed deliberately)\b/i,
  /\b(?:point important à examiner|cette analyse présente les faits essentiels|élément \d+ à vérifier)\b/i,
  /(?:待翻译|翻译待定|占位文本|常见问题 \d+|第 \d+ 项关键实践)/,
] as const;

const ENGLISH_STOPWORDS = new Set([
  "and", "are", "as", "at", "be", "because", "before", "but", "by",
  "can", "for", "from", "has", "have", "how", "if", "in", "is", "it",
  "not", "of", "on", "or", "that", "the", "their", "this", "to", "when",
  "which", "with", "you", "your",
]);

const ENGLISH_EXCLUSIVE_WORDS = new Set([
  "after", "before", "better", "coming", "from", "learn", "must", "read",
  "should", "soon", "these", "this", "those", "when", "which", "without",
  "with", "why", "will", "you", "your",
]);

const LOCALE_STOPWORDS: Record<string, ReadonlySet<string>> = {
  az: new Set(["bir", "bu", "üçün", "və", "ilə", "olan", "ki", "necə", "daha", "hər"]),
  tr: new Set(["bir", "bu", "için", "ve", "ile", "olan", "nasıl", "daha", "her", "de"]),
  fr: new Set(["le", "la", "les", "un", "une", "des", "de", "du", "et", "pour", "avec", "dans", "que", "qui", "votre"]),
  es: new Set(["el", "la", "los", "las", "un", "una", "de", "del", "y", "para", "con", "en", "que", "tu"]),
  de: new Set(["der", "die", "das", "ein", "eine", "und", "für", "mit", "von", "in", "ist", "wenn", "sie", "ihr"]),
  it: new Set(["il", "la", "i", "gli", "le", "un", "una", "di", "e", "per", "con", "in", "che", "tu"]),
};

function normalizedText(value: string): string {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("en")
    .replace(/[\p{P}\p{S}\s]+/gu, "");
}

function isPlaceholder(value: string): boolean {
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value));
}

function wrongLanguageReason(value: string, locale: string): string | undefined {
  if (isIntentionalInvariant(value)) return undefined;
  const residual = PROTECTED_TERMS.reduce(
    (copy, term) => copy.replaceAll(term, " "),
    value,
  ).replace(/https?:\/\/\S+/g, " ");
  const letters = residual.match(/\p{L}/gu)?.length ?? 0;
  if (letters < 4) return undefined;
  if (!letters) return undefined;
  if (locale === "zh") {
    const cjk = residual.match(/\p{Script=Han}/gu)?.length ?? 0;
    if (cjk / letters < 0.15) return "contains too little Chinese script";
    return undefined;
  }
  if (locale === "ru" || locale === "uk") {
    const cyrillic = residual.match(/\p{Script=Cyrillic}/gu)?.length ?? 0;
    if (cyrillic / letters < 0.25) return "contains too little Cyrillic script";
    return undefined;
  }
  const localeWords = LOCALE_STOPWORDS[locale];
  if (!localeWords) return undefined;
  const words = residual
    .toLocaleLowerCase(locale)
    .match(/\p{L}+/gu) ?? [];
  const englishHits = words.filter((word) => ENGLISH_STOPWORDS.has(word)).length;
  const exclusiveHits = words.filter((word) =>
    ENGLISH_EXCLUSIVE_WORDS.has(word),
  ).length;
  const localeHits = words.filter((word) => localeWords.has(word)).length;
  if (
    (exclusiveHits >= 1 && localeHits === 0) ||
    (englishHits >= 3 && englishHits > localeHits * 2)
  ) {
    return "looks predominantly English";
  }
  return undefined;
}

if (
  normalizedText(" Translation pending! ") !==
    normalizedText("translation-pending") ||
  !isPlaceholder("Translation pending") ||
  !wrongLanguageReason(
    "This is an English placeholder and it should not be accepted by the localized editorial completeness validation.",
    "fr",
  )
) {
  throw new Error("Editorial negative validation fixtures are not working");
}

function shape(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(shape).join(",")}]`;
  if (value && typeof value === "object") {
    const item = value as Record<string, unknown>;
    return `{${Object.keys(item)
      .filter(
        (key) =>
          !["text", "title", "cite", "q", "a", "label"].includes(key),
      )
      .sort()
      .map((key) => `${key}:${shape(item[key])}`)
      .join(",")}}`;
  }
  return typeof value;
}

function inlineShape(value: string): string {
  const links = [...value.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)].map(
    (match) => match[2],
  );
  const withoutLinks = value.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");
  const bold = [...withoutLinks.matchAll(/\*\*([^*]+)\*\*/g)].length;
  const withoutBold = withoutLinks.replace(/\*\*([^*]+)\*\*/g, "$1");
  const emphasis = [...withoutBold.matchAll(/\*([^*]+)\*/g)].length;
  const code = [...withoutBold.matchAll(/`([^`]+)`/g)].length;
  return JSON.stringify({ links, bold, emphasis, code });
}

function postTextFields(post: Post): Map<string, string> {
  const fields = new Map<string, string>();
  const put = (key: string, value: string | undefined) => {
    if (typeof value === "string") fields.set(key, value);
  };

  put("title", post.title);
  put("seoTitle", post.seoTitle);
  put("description", post.description);
  put("seoDescription", post.seoDescription);
  put("excerpt", post.excerpt);
  put("category", post.category);
  post.tags.forEach((tag, index) => put(`tags.${index}`, tag));
  post.sources?.forEach((source, index) => {
    put(`sources.${index}.label`, source.label);
  });

  post.body.forEach((block, blockIndex) => {
    const prefix = `body.${blockIndex}`;
    if ("text" in block) put(`${prefix}.text`, block.text);
    if ("title" in block) put(`${prefix}.title`, block.title);
    if ("cite" in block) put(`${prefix}.cite`, block.cite);
    if (block.type === "ul" || block.type === "ol") {
      block.items.forEach((item, index) =>
        put(`${prefix}.items.${index}`, item),
      );
    }
    if (block.type === "faq") {
      block.items.forEach((item, index) => {
        put(`${prefix}.items.${index}.q`, item.q);
        put(`${prefix}.items.${index}.a`, item.a);
      });
    }
  });

  return fields;
}

function isIntentionalInvariant(value: string): boolean {
  return (
    INTENTIONAL_INVARIANTS.has(value) ||
    /^[\d\s.,:%+–—-]+$/u.test(value.trim())
  );
}

function occurrenceCount(value: string, term: string): number {
  return value.split(term).length - 1;
}

function numbers(value: string): string[] {
  return [...value.matchAll(/%?\s*\d+(?:[.,]\d+)?\s*%?/g)].map((match) => {
    const raw = match[0];
    return raw.replace(/[%\s]/g, "").replace(",", ".");
  });
}

function validatePost(
  source: Post,
  localized: Post,
  locale: string,
  targetErrors: string[] = errors,
): void {
  const label = `${locale}/${source.slug}`;
  if (localized.slug !== source.slug) targetErrors.push(`${label}: slug changed`);
  if (localized.publishedAt !== source.publishedAt) {
    targetErrors.push(`${label}: publishedAt changed`);
  }
  if (localized.updatedAt !== source.updatedAt) {
    targetErrors.push(`${label}: updatedAt changed`);
  }
  if (localized.readMinutes !== source.readMinutes) {
    targetErrors.push(`${label}: readMinutes changed`);
  }
  if (shape(localized.body) !== shape(source.body)) {
    targetErrors.push(`${label}: body block structure or heading anchors drifted`);
  }
  if (shape(localized.sources) !== shape(source.sources)) {
    targetErrors.push(`${label}: source count or URLs drifted`);
  }

  const sourceFields = postTextFields(source);
  const localizedFields = postTextFields(localized);
  const repeatedProse = new Map<string, string[]>();
  for (const [path, sourceValue] of sourceFields) {
    const localizedValue = localizedFields.get(path);
    if (!localizedValue?.trim()) {
      targetErrors.push(`${label}: ${path} is missing`);
      continue;
    }
    if (inlineShape(localizedValue) !== inlineShape(sourceValue)) {
      targetErrors.push(`${label}: ${path} changed inline Markdown or link URLs`);
    }
    if (
      normalizedText(localizedValue) === normalizedText(sourceValue) &&
      !isIntentionalInvariant(sourceValue)
    ) {
      targetErrors.push(`${label}: ${path} still repeats normalized English`);
    }
    if (isPlaceholder(localizedValue)) {
      targetErrors.push(`${label}: ${path} contains placeholder copy`);
    }
    const languageIssue = wrongLanguageReason(localizedValue, locale);
    if (languageIssue) {
      targetErrors.push(`${label}: ${path} ${languageIssue}`);
    }
    const minimumLengthRatio = locale === "zh" ? 0.18 : 0.3;
    if (
      sourceValue.length >= 100 &&
      localizedValue.length < sourceValue.length * minimumLengthRatio
    ) {
      targetErrors.push(`${label}: ${path} is suspiciously shorter than English`);
    }
    if (localizedValue.length >= 60) {
      const key = normalizedText(localizedValue);
      repeatedProse.set(key, [...(repeatedProse.get(key) ?? []), path]);
    }
    const bodyPath = path.match(/^body\.(\d+)\./);
    const sourceBlock = bodyPath
      ? source.body[Number(bodyPath[1])]
      : undefined;
    if (sourceBlock?.type !== "h2" && sourceBlock?.type !== "h3") {
      const localizedNumbers = numbers(localizedValue);
      for (const number of numbers(sourceValue)) {
        const matchIndex = localizedNumbers.indexOf(number);
        if (matchIndex === -1) {
          targetErrors.push(`${label}: ${path} dropped numeric fact "${number}"`);
        } else {
          localizedNumbers.splice(matchIndex, 1);
        }
      }
    }
    for (const term of PROTECTED_TERMS) {
      const expected = occurrenceCount(sourceValue, term);
      if (
        expected > 0 &&
        occurrenceCount(localizedValue, term) !== expected
      ) {
        targetErrors.push(`${label}: ${path} changed protected term "${term}"`);
      }
    }
    if (
      localizedValue === sourceValue &&
      !isIntentionalInvariant(sourceValue)
    ) {
      targetErrors.push(`${label}: ${path} still repeats English`);
    }
  }
  for (const paths of repeatedProse.values()) {
    if (paths.length >= 3) {
      targetErrors.push(
        `${label}: repeated generic prose appears in ${paths.join(", ")}`,
      );
    }
  }
}

const negativeFixtureSource = sourcePosts[0];
const negativeFixtureBase =
  localeEditorialContent.fr.translatedPosts?.[negativeFixtureSource.slug];
if (!negativeFixtureBase) {
  throw new Error("Missing French negative-fixture baseline");
}
const fixtureBody = negativeFixtureBase.body.map((block) => ({ ...block }));
const repeatableIndexes = fixtureBody
  .map((block, index) => block.type === "p" ? index : -1)
  .filter((index) => index >= 0)
  .slice(0, 3);
for (const index of repeatableIndexes) {
  const block = fixtureBody[index];
  if ("text" in block) {
    fixtureBody[index] = {
      ...block,
      text: "Ce texte générique décrit une décision produit sans traduire le contenu source demandé.",
    };
  }
}
const negativeFixtureErrors: string[] = [];
validatePost(
  negativeFixtureSource,
  {
    ...negativeFixtureBase,
    title: "This is your better product",
    body: fixtureBody,
  },
  "fr",
  negativeFixtureErrors,
);
if (
  !negativeFixtureErrors.some((error) =>
    error.includes("title looks predominantly English"),
  ) ||
  !negativeFixtureErrors.some((error) =>
    error.includes("repeated generic prose"),
  )
) {
  throw new Error("Full editorial negative fixtures are not working");
}

for (const locale of PREFIXED_CODES) {
  const installed = localeEditorialContent[locale];
  if (!installed?.copy || !installed.resources || !installed.post) {
    errors.push(`${locale}: complete editorial content is missing`);
    continue;
  }

  for (const source of sourcePosts) {
    const localized =
      source.slug === TRANSLATED_MVP_SLUG
        ? installed.post
        : installed.translatedPosts[source.slug];
    if (!localized) {
      errors.push(`${locale}/${source.slug}: translated article is missing`);
      continue;
    }
    validatePost(source, localized, locale);

    const articleHtml = renderArticleHtml(source, origin, locale);
    const prefix = `${origin}/${locale}`;
    const canonical = `${prefix}/journal/${source.slug}`;
    if (
      !articleHtml.includes(
        `<link rel="canonical" href="${canonical}"`,
      )
    ) {
      errors.push(`${locale}/${source.slug}: canonical is missing`);
    }
    for (const alternate of [...LOCALES.map((item) => item.hreflang), "x-default"]) {
      if (!articleHtml.includes(`hreflang="${alternate}"`)) {
        errors.push(
          `${locale}/${source.slug}: ${alternate} alternate is missing`,
        );
      }
    }
    if (
      !articleHtml.includes(
        `"inLanguage":"${LOCALES.find((item) => item.code === locale)?.htmlLang}"`,
      )
    ) {
      errors.push(`${locale}/${source.slug}: Article language is missing`);
    }
    if (!articleHtml.includes(`"headline":"${localized.title.replace(/"/g, '\\"')}"`)) {
      errors.push(`${locale}/${source.slug}: localized Article headline is missing`);
    }
    if (!articleHtml.includes(`"item":"${prefix}/"`)) {
      errors.push(`${locale}/${source.slug}: localized Home breadcrumb is missing`);
    }
  }

  const resourcesHtml = renderResourcesHtml(origin, locale);
  const indexHtml = renderIndexHtml(origin, locale);
  const prefix = `${origin}/${locale}`;
  for (const [name, html, canonical] of [
    ["resources", resourcesHtml, `${prefix}/resources`],
    ["journal", indexHtml, `${prefix}/journal`],
  ] as const) {
    if (!html.includes(`<link rel="canonical" href="${canonical}"`)) {
      errors.push(`${locale}: ${name} canonical is missing`);
    }
    if (!html.includes('hreflang="x-default"')) {
      errors.push(`${locale}: ${name} x-default hreflang is missing`);
    }
  }
  for (const source of sourcePosts) {
    const localized =
      source.slug === TRANSLATED_MVP_SLUG
        ? installed.post
        : installed.translatedPosts[source.slug];
    if (!localized) continue;
    const route = `/${locale}/journal/${source.slug}`;
    if (!indexHtml.includes(`href="${route}"`)) {
      errors.push(`${locale}/${source.slug}: localized Journal card link is missing`);
    }
    if (!indexHtml.includes(`"url":"${origin}${route}"`)) {
      errors.push(`${locale}/${source.slug}: localized BlogPosting URL is missing`);
    }
    if (!indexHtml.includes(`"headline":"${localized.title.replace(/"/g, '\\"')}"`)) {
      errors.push(`${locale}/${source.slug}: localized BlogPosting headline is missing`);
    }
  }
  if (indexHtml.includes(`>${editorialEnglishOnlyLabel(locale)}<`)) {
    errors.push(`${locale}: Journal still shows the English-only label`);
  }
  if (resourcesHtml.includes(">Talk through your project<")) {
    errors.push(`${locale}: Resources rendered an English action fallback`);
  }
}

function editorialEnglishOnlyLabel(locale: string): string {
  const labels: Record<string, string> = {
    az: "İngiliscə məqalə",
    tr: "İngilizce makale",
    ru: "Статья на английском",
    zh: "英文文章",
    fr: "Article en anglais",
    es: "Artículo en inglés",
    de: "Englischer Artikel",
    uk: "Стаття англійською",
    it: "Articolo in inglese",
  };
  return labels[locale] ?? "English article";
}

const sitemap = renderSitemapXml(origin);
for (const source of sourcePosts) {
  if (!sitemap.includes(`<loc>${origin}/journal/${source.slug}</loc>`)) {
    errors.push(`sitemap: English URL missing for ${source.slug}`);
  }
  for (const locale of PREFIXED_CODES) {
    if (
      !sitemap.includes(
        `<loc>${origin}/${locale}/journal/${source.slug}</loc>`,
      )
    ) {
      errors.push(`sitemap: ${locale} URL missing for ${source.slug}`);
    }
  }
}

if (Object.keys(localeEditorialContent).length !== LOCALES.length) {
  errors.push(
    `editorial registry has ${Object.keys(localeEditorialContent).length} locales; expected ${LOCALES.length}`,
  );
}

if (errors.length) {
  console.error(
    `Editorial completeness check failed with ${errors.length} issue(s):\n${errors.join("\n")}`,
  );
  process.exit(1);
}

console.log(
  `Editorial completeness check passed: ${sourcePosts.length} Journal articles cover all ${LOCALES.length} locales with matching authored structure.`,
);