import { LOCALES, PREFIXED_CODES } from "../server/i18n/locales";
import { localeEditorialContent, TRANSLATED_MVP_SLUG, validateInstalledEditorialContent } from "../server/journal/editorial";
import { getPost } from "../server/journal/posts";
import { renderArticleHtml, renderIndexHtml, renderResourcesHtml } from "../server/journal/render";

const source = getPost(TRANSLATED_MVP_SLUG);
if (!source) throw new Error("Translated MVP source post is missing.");
const errors: string[] = validateInstalledEditorialContent();

function shape(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(shape).join(",")}]`;
  if (value && typeof value === "object") {
    const item = value as Record<string, unknown>;
    return `{${Object.keys(item).filter((key) => !["text", "title", "cite", "q", "a", "label"].includes(key)).sort().map((key) => `${key}:${shape(item[key])}`).join(",")}}`;
  }
  return typeof value;
}

for (const locale of PREFIXED_CODES) {
  const installed = localeEditorialContent[locale];
  if (!installed?.copy || !installed.resources || !installed.post) {
    errors.push(`${locale}: complete editorial content is missing`);
    continue;
  }
  const localized = installed.post;
  if (shape(localized.body) !== shape(source.body)) {
    errors.push(`${locale}: MVP body does not retain the authored block structure`);
  }
  const articleHtml = renderArticleHtml(source, "https://startappsstudio.com", locale);
  const resourcesHtml = renderResourcesHtml("https://startappsstudio.com", locale);
  const indexHtml = renderIndexHtml("https://startappsstudio.com", locale);
  const prefix = `https://startappsstudio.com/${locale}`;
  for (const [name, html, canonical] of [
    ["article", articleHtml, `${prefix}/journal/${TRANSLATED_MVP_SLUG}`],
    ["resources", resourcesHtml, `${prefix}/resources`],
    ["journal", indexHtml, `${prefix}/journal`],
  ] as const) {
    if (!html.includes(`<link rel="canonical" href="${canonical}"`)) errors.push(`${locale}: ${name} canonical is missing`);
    if (!html.includes('hreflang="x-default"')) errors.push(`${locale}: ${name} x-default hreflang is missing`);
  }
  if (!indexHtml.includes(`/journal/${source.slug}`)) errors.push(`${locale}: translated journal card link is missing`);
  if (!indexHtml.includes(`${prefix}/journal/${source.slug}`)) errors.push(`${locale}: translated BlogPosting URL is not localized`);
  if (!indexHtml.includes(`"description":"${localized.description.replace(/"/g, '\\"')}"`)) {
    errors.push(`${locale}: translated BlogPosting description is missing`);
  }
  if (!articleHtml.includes(`"item":"${prefix}/"`)) errors.push(`${locale}: localized Home breadcrumb URL is missing`);
  if (resourcesHtml.includes(">Talk through your project<")) errors.push(`${locale}: Resources rendered an English action fallback`);
  if (resourcesHtml.includes(">Choose the next route<")) errors.push(`${locale}: Resources rendered an English section fallback`);
}

const englishOnly = getPost("base44-vs-lovable-which-one-for-your-next-app");
if (!englishOnly) {
  errors.push("English-only regression article is missing");
} else {
  const englishOnlyHtml = renderArticleHtml(englishOnly, "https://startappsstudio.com");
  for (const locale of PREFIXED_CODES) {
    if (englishOnlyHtml.includes(`/${locale}/journal/${englishOnly.slug}`)) {
      errors.push(`English-only article advertises a false ${locale} alternate`);
    }
  }
}

if (Object.keys(localeEditorialContent).length !== LOCALES.length) {
  errors.push(`editorial registry has ${Object.keys(localeEditorialContent).length} locales; expected ${LOCALES.length}`);
}

if (errors.length) {
  console.error(`Editorial completeness check failed:\n${errors.join("\n")}`);
  process.exit(1);
}
console.log(`Editorial completeness check passed: Resources and the selected Journal article cover all ${LOCALES.length} locales.`);