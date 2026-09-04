import * as fs from "node:fs";
import * as path from "node:path";
import { extractJsStrings } from "../server/i18n/js-strings";
import { extractStrings } from "../server/i18n/localize";
import { collectMetaStrings } from "../server/i18n/meta";
import { SUPPORTED_CODES, DEFAULT_LOCALE } from "../server/i18n/locales";
import {
  isSafeTranslationForKey,
  loadDictionary,
} from "../server/i18n/render";

interface SourceEntry {
  key: string;
  kind: "unit" | "text" | "attr" | "js" | "meta";
  context: string;
}

const root = process.cwd();
const templatePath = path.join(root, "server", "templates", "desktop-landing.html");
const stringsDir = path.join(root, "server", "i18n", "strings");
const sourcePath = path.join(stringsDir, "_source.json");

/**
 * Values that are intentionally identical in every locale: proper names,
 * platform names, technical abbreviations, contact details, and visual glyphs.
 * Keep this exact and narrow. Sentences and ordinary UI words never belong here.
 */
const INTENTIONAL_INVARIANTS = new Set([
  "MVP",
  "SaaS",
  "Fintech",
  "SEO",
  "AI",
  "API",
  "CRM",
  "QA",
  "UI/UX",
  "Web",
  "iOS",
  "Android",
  "Xcode",
  "Android Studio",
  "React",
  "Webflow",
  "Start Apps Studio",
  "Elgar Sirajov",
  "create@startappsstudio.com",
  "Lovable &middot; Replit",
  "iOS &middot; Android &middot; Web",
  "&times;",
  "→",
  "✓",
  "&#9998;",
  "&lt;/&gt;",
  "&#9733;",
  "&#9776;",
  "&#931;",
]);

function collectCurrentSource(html: string): SourceEntry[] {
  const entries: SourceEntry[] = extractStrings(html).map((entry) => ({
    key: entry.value,
    kind: entry.kind,
    context: entry.context,
  }));
  const seen = new Set(entries.map((entry) => entry.key));

  for (const key of extractJsStrings(html)) {
    if (seen.has(key)) continue;
    seen.add(key);
    entries.push({ key, kind: "js", context: "inline script" });
  }
  for (const key of collectMetaStrings(html)) {
    if (seen.has(key)) continue;
    seen.add(key);
    entries.push({ key, kind: "meta", context: "head metadata / JSON-LD" });
  }

  return entries;
}

function isNumericOrSymbolOnly(key: string): boolean {
  const plain = key
    .replace(/<[^>]*>/g, "")
    .replace(/&(?:nbsp|middot|times);/g, " ")
    .replace(/&#(?:x[0-9a-f]+|\d+);/gi, "")
    .trim();
  return !!plain && /^[\d\s$€£¥₼₽₺,.+%–—-]+$/u.test(plain);
}

function isIntentionalInvariant(key: string): boolean {
  return INTENTIONAL_INVARIANTS.has(key) || isNumericOrSymbolOnly(key);
}

function formatExamples(items: SourceEntry[], limit = 8): string {
  return items
    .slice(0, limit)
    .map((entry) => `    - [${entry.context}] ${entry.key.slice(0, 140)}`)
    .join("\n");
}

const html = fs.readFileSync(templatePath, "utf8");
const currentSource = collectCurrentSource(html);
const storedSource = JSON.parse(
  fs.readFileSync(sourcePath, "utf8"),
) as SourceEntry[];
const errors: string[] = [];

const markupGuardCases = [
  {
    key: "Plain text",
    value: "<span>Injected wrapper</span>",
    expected: false,
  },
  {
    key: "<a href=\"/safe\">Safe link</a>",
    value: "<a href=\"https://attacker.example\">Changed link</a>",
    expected: false,
  },
  {
    key: "<strong>Original</strong>",
    value: "<strong>Unclosed",
    expected: false,
  },
  {
    key: "<strong>Original</strong>",
    value: "<strong>Translated</strong>",
    expected: true,
  },
] as const;
for (const test of markupGuardCases) {
  if (isSafeTranslationForKey(test.key, test.value) !== test.expected) {
    errors.push(
      `Translation markup guard regression for value: ${test.value}`,
    );
  }
}

if (JSON.stringify(storedSource) !== JSON.stringify(currentSource)) {
  errors.push(
    "_source.json is out of date; run `npx tsx scripts/build-i18n-source.ts`.",
  );
}

const sourceKeys = new Set(currentSource.map((entry) => entry.key));
for (const code of SUPPORTED_CODES) {
  if (code === DEFAULT_LOCALE) continue;

  const file = path.join(stringsDir, `${code}.json`);
  if (!fs.existsSync(file)) {
    errors.push(`${code}: locale dictionary is missing.`);
    continue;
  }

  const raw = JSON.parse(fs.readFileSync(file, "utf8")) as Record<
    string,
    string
  >;
  const loaded = loadDictionary(code);
  const missing = currentSource.filter(
    (entry) => typeof raw[entry.key] !== "string" || !raw[entry.key].trim(),
  );
  const rejected = currentSource.filter(
    (entry) => raw[entry.key] && !loaded[entry.key],
  );
  const untranslated = currentSource.filter(
    (entry) =>
      raw[entry.key] === entry.key && !isIntentionalInvariant(entry.key),
  );
  const stale = Object.keys(raw).filter((key) => !sourceKeys.has(key));

  if (missing.length) {
    errors.push(
      `${code}: ${missing.length} source strings are not defined directly in the locale file.\n${formatExamples(missing)}`,
    );
  }
  if (rejected.length) {
    errors.push(
      `${code}: ${rejected.length} translations are rejected by the production loader.\n${formatExamples(rejected)}`,
    );
  }
  if (untranslated.length) {
    errors.push(
      `${code}: ${untranslated.length} ordinary strings still repeat the English source.\n${formatExamples(untranslated)}`,
    );
  }
  if (stale.length) {
    errors.push(
      `${code}: ${stale.length} stale dictionary keys are no longer in the source inventory.\n` +
        stale
          .slice(0, 8)
          .map((key) => `    - ${key.slice(0, 140)}`)
          .join("\n"),
    );
  }
}

if (errors.length) {
  console.error(
    `Landing translation completeness check failed with ${errors.length} problem group(s):\n\n${errors.join("\n\n")}`,
  );
  process.exit(1);
}

console.log(
  `Landing translation completeness check passed: ${currentSource.length} source strings are directly covered across ${SUPPORTED_CODES.length - 1} locale dictionaries.`,
);