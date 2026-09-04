/**
 * Renders the landing page for a given locale.
 *
 * English is served byte-for-byte as authored (aside from hreflang alternates
 * which are part of the template). Other locales are produced by splicing
 * translations into the English source, then patching metadata:
 * <html lang>, canonical, og:locale/og:url, JSON-LD inLanguage/url, the
 * JS-string payload, and the footer switcher's active state.
 *
 * Localized documents are cached in memory per locale and invalidated when
 * the template or a dictionary file changes (dev convenience; in production
 * these never change while the process runs).
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { localizeHtml } from "./localize";
import { localizeMeta } from "./meta";
import { extractJsStrings } from "./js-strings";
import {
  DEFAULT_LOCALE,
  getLocale,
  localeUrl,
  LOCALES,
  type LocaleDefinition,
} from "./locales";

const TEMPLATE_PATH = path.resolve(
  process.cwd(),
  "server",
  "templates",
  "desktop-landing.html",
);
const STRINGS_DIR = path.resolve(process.cwd(), "server", "i18n", "strings");

interface CacheEntry {
  html: string;
  templateMtimeMs: number;
  dictMtimeMs: number;
}

const cache = new Map<string, CacheEntry>();

function dictPath(code: string): string {
  return path.join(STRINGS_DIR, `${code}.json`);
}

function mtimeOrZero(file: string): number {
  try {
    return fs.statSync(file).mtimeMs;
  } catch {
    return 0;
  }
}

/**
 * Markup allowed inside a translated value: the same inline elements the
 * tokenizer treats as part of a phrase. Anything else (script, iframe, event
 * handlers, javascript: URLs) marks the entry as unsafe and it is dropped.
 * Dictionaries are our own committed files, but the render path must not be
 * an injection sink if one is ever edited carelessly or generated upstream.
 */
const SAFE_INLINE_TAGS = new Set([
  "a",
  "abbr",
  "b",
  "br",
  "code",
  "em",
  "i",
  "mark",
  "small",
  "span",
  "strong",
  "sub",
  "sup",
  "u",
]);

export function isSafeTranslation(value: string): boolean {
  // Event-handler attributes and scriptable URL schemes are never legitimate
  // in translated copy.
  if (/\bon[a-z]+\s*=/i.test(value)) return false;
  if (/(?:javascript|vbscript)\s*:/i.test(value)) return false;
  if (/data\s*:\s*text\/html/i.test(value)) return false;

  const tagRe = /<\s*\/?\s*([a-zA-Z][a-zA-Z0-9-]*)/g;
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(value)) !== null) {
    if (!SAFE_INLINE_TAGS.has(m[1].toLowerCase())) return false;
  }
  return true;
}

/** Ordered sequence of complete tags in a string. */
function tagSkeleton(s: string): string[] {
  return s.match(/<[^>]*>/g) ?? [];
}

/** Text remaining once complete tags are removed. */
function strippedText(s: string): string {
  return s.replace(/<[^>]*>/g, "");
}

/**
 * A translation is renderable only when its complete tag sequence is
 * byte-identical to the source key's tag sequence. Translators may change the
 * human text between tags, but cannot introduce markup, alter a link target,
 * remove a closing tag, or change an authored form attribute/inline handler.
 * Unbalanced `<` in the remaining text is rejected so a value cannot smuggle a
 * tag fragment past the skeleton check.
 */
export function isSafeTranslationForKey(key: string, value: string): boolean {
  const keyTags = tagSkeleton(key);
  const valueTags = tagSkeleton(value);
  if (keyTags.length !== valueTags.length) return false;
  for (let i = 0; i < keyTags.length; i++) {
    if (keyTags[i] !== valueTags[i]) return false;
  }
  // With markup pinned to the source, remaining text must be tag-free.
  return !strippedText(value).includes("<");
}

export function loadDictionary(code: string): Record<string, string> {
  const file = dictPath(code);
  if (!fs.existsSync(file)) return {};
  try {
    const sharedFile = path.join(STRINGS_DIR, "_audience.json");
    const raw = JSON.parse(fs.readFileSync(file, "utf8")) as Record<
      string,
      string
    >;
    const safe: Record<string, string> = {};
    for (const [key, value] of Object.entries(raw)) {
      if (typeof value !== "string") continue;
      if (!isSafeTranslationForKey(key, value)) {
        console.error(
          `[i18n] dropped unsafe ${code} translation for key: ${key.slice(0, 80)}`,
        );
        continue;
      }
      safe[key] = value;
    }
    if (fs.existsSync(sharedFile)) {
      const shared = JSON.parse(fs.readFileSync(sharedFile, "utf8")) as Record<string, string>;
      for (const [key, value] of Object.entries(shared)) {
        if (safe[key] || typeof value !== "string" || !isSafeTranslationForKey(key, value)) continue;
        safe[key] = value;
      }
    }
    return safe;
  } catch (error) {
    console.error(`[i18n] failed to parse ${file}:`, error);
    return {};
  }
}

/** hreflang alternates; identical on every language version per Google spec. */
function hreflangBlock(): string {
  const lines = LOCALES.map(
    (l) =>
      `    <link rel="alternate" hreflang="${l.hreflang}" href="${localeUrl(l.code)}" />`,
  );
  lines.push(
    `    <link rel="alternate" hreflang="x-default" href="${localeUrl(DEFAULT_LOCALE)}" />`,
  );
  return lines.join("\n");
}

function escapeForJsonScript(json: string): string {
  // Prevent `</script>` breakout inside the inline JSON payload.
  return json.replace(/</g, "\\u003c");
}

/** Builds the inline payload consumed by `__t()` / `__dateLocale()`. */
function i18nPayloadScript(
  locale: LocaleDefinition,
  dictionary: Record<string, string>,
  jsKeys: string[],
): string {
  const strings: Record<string, string> = {};
  for (const key of jsKeys) {
    const translated = dictionary[key];
    if (translated && translated !== key) strings[key] = translated;
  }
  const payload = {
    locale: locale.code,
    dateLocale: locale.dateLocale,
    strings,
  };
  return `<script>window.__SAS_I18N__ = ${escapeForJsonScript(JSON.stringify(payload))};</script>`;
}

/** Shows only the matched locale and English in the footer switcher. */
function setActiveSwitcherLink(html: string, locale: LocaleDefinition): string {
  if (locale.code === DEFAULT_LOCALE) return html; // template default is English-active
  return html
    .replace('class="english-escape is-hidden"', 'class="english-escape"')
    .replace(
      'class="footer-lang-wrap is-current-english"',
      'class="footer-lang-wrap"',
    )
    .replace(
      /class="footer-lang-link is-active is-hidden"(\s+href="[^"]*"\s+hreflang)/,
      'class="footer-lang-link"$1',
    )
    .replace(
      new RegExp(
        `class="footer-lang-link is-hidden"((?:(?!>)[\\s\\S])*?data-lang="${locale.code}")`,
      ),
      'class="footer-lang-link is-active"$1',
    )
    .replace(
      '<span class="footer-lang-current" data-i18n-skip="true">English</span>',
      `<span class="footer-lang-current" data-i18n-skip="true">${locale.nativeName}</span>`,
    );
}

/**
 * Rewrites head metadata and JSON-LD for a non-default locale.
 * Each replacement is anchored to exact, known template bytes; if the
 * template changes shape, the replacement is a no-op rather than a corruption.
 */
function patchMetadata(html: string, locale: LocaleDefinition): string {
  const url = localeUrl(locale.code);
  let out = html;

  out = out.replace('<html lang="en">', `<html lang="${locale.htmlLang}">`);
  if (locale.code === "zh") {
    out = out.replace(
      "    <style>",
      `    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&amp;family=Noto+Serif+SC:wght@400;600;700;800&amp;display=swap" />
    <style>`,
    );
  }
  out = out.replace(
    '<link rel="canonical" href="https://startappsstudio.com/" />',
    `<link rel="canonical" href="${url}" />`,
  );
  out = out.replace(
    '<meta property="og:url" content="https://startappsstudio.com/" />',
    `<meta property="og:url" content="${url}" />`,
  );
  out = out.replace(
    '<meta property="og:locale" content="en_US" />',
    `<meta property="og:locale" content="${locale.ogLocale}" />` +
      `\n    <meta property="og:locale:alternate" content="en_US" />`,
  );
  // JSON-LD: language + page URL. WebSite/Organization keep the canonical
  // root URL (they describe the site, not this page); WebPage gets the
  // locale URL.
  // Keep every page-level JSON-LD entity in the rendered document aligned.
  // This matters once both WebSite and WebPage expose inLanguage.
  out = out.replace(
    /"inLanguage": "en-US"/g,
    `"inLanguage": "${locale.htmlLang}"`,
  );
  out = out.replace(
    `"@type": "WebPage",
      "@id": "https://startappsstudio.com/#webpage",
      "url": "https://startappsstudio.com/",`,
    `"@type": "WebPage",
      "@id": "${url}#webpage",
      "url": "${url}",`,
  );
  return out;
}

/**
 * Returns the full HTML document for a locale. English returns the template
 * with hreflang alternates and the payload marker resolved; other locales are
 * fully localized. Falls back to English when a dictionary is missing.
 */
export function renderLandingPage(code: string): string {
  const locale = getLocale(code);
  const templateMtimeMs = mtimeOrZero(TEMPLATE_PATH);
  const dictMtimeMs =
    locale.code === DEFAULT_LOCALE ? 0 : mtimeOrZero(dictPath(locale.code));

  const cached = cache.get(locale.code);
  if (
    cached &&
    cached.templateMtimeMs === templateMtimeMs &&
    cached.dictMtimeMs === dictMtimeMs
  ) {
    return cached.html;
  }

  const template = fs.readFileSync(TEMPLATE_PATH, "utf8");
  const jsKeys = extractJsStrings(template);

  let html: string;
  if (locale.code === DEFAULT_LOCALE) {
    html = template.replace(
      "<!--SAS_I18N_PAYLOAD-->",
      i18nPayloadScript(locale, {}, jsKeys),
    );
  } else {
    const dictionary = loadDictionary(locale.code);
    html = localizeHtml(template, dictionary);
    html = localizeMeta(html, dictionary);
    html = patchMetadata(html, locale);
    html = setActiveSwitcherLink(html, locale);
    html = html.replace(
      "<!--SAS_I18N_PAYLOAD-->",
      i18nPayloadScript(locale, dictionary, jsKeys),
    );
  }

  // hreflang alternates go on every version, right after the canonical link.
  html = html.replace(
    /(<link rel="canonical" href="[^"]*" \/>)/,
    `$1\n${hreflangBlock()}`,
  );

  cache.set(locale.code, { html, templateMtimeMs, dictMtimeMs });
  return html;
}

/** True when the locale has a usable dictionary (English always qualifies). */
export function hasDictionary(code: string): boolean {
  if (code === DEFAULT_LOCALE) return true;
  return fs.existsSync(dictPath(code));
}
