/**
 * Checks that public package prices and their translation keys stay in sync.
 *
 * Usage: npx tsx scripts/check-pricing-consistency.ts
 *
 * PRICING_CHECK_ROOT is supported for isolated regression tests. It should
 * point at a project-shaped directory containing the checked source files.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { DEFAULT_LOCALE, SUPPORTED_CODES } from "../server/i18n/locales";

const root = path.resolve(process.env.PRICING_CHECK_ROOT ?? process.cwd());
const templateFile = "server/templates/desktop-landing.html";
const journalFile = "server/journal/render.ts";
const sourceFile = "server/i18n/strings/_source.json";

const currentPrices = {
  "Launch Site": {
    template: "$2,000",
    journal: "$2,000",
  },
  Prototype: {
    template: "$7,000",
    journal: "$7,000",
  },
  MVP: {
    template: "$10,000–$30,000",
    journal: "$10,000 to $30,000",
  },
  Custom: {
    template: "$45,000+",
    journal: "$45,000+",
  },
} as const;

/**
 * These are the pricing-related strings which must be present in every
 * dictionary. Amount-only spans are intentionally excluded because the
 * localizer skips numeric price classes.
 */
const pricingTranslationKeys = [
  "Choose the next move",
  "Launch Site",
  "Prototype",
  "MVP",
  "Custom",
  '<span class="special-price-amount">$45,000+</span> <span class="special-price-note">or monthly retainer</span> <span class="special-duration">1–6 months</span>',
  "Fixed pricing",
  "Investment range",
  "How much does it cost to work with Start Apps Studio?",
  "What is included in the price?",
  "Scope and price are agreed before work starts.",
  "We keep the public path simple: a $2,000 Launch Site for a credible launch presence, a $7,000 Prototype to make the idea tangible for validation or fundraising, an MVP from $10,000 to $30,000 to put a real product in users' hands, and Custom from $45,000 or monthly retainer for bespoke work. Each starts with a clear scope and fixed price, so you know what the next step costs before we begin.",
  "Yes. Our $2,000 Launch Site gives you a polished, responsive website without committing to the full product build. We shape the message and page around your audience, build it in your Lovable or Replit account, then deploy and hand over an editable site in 3 to 5 business days.",
] as const;

type JsonRecord = Record<string, unknown>;

const errors: string[] = [];

function displayPath(file: string): string {
  return path.relative(root, path.join(root, file)) || file;
}

function readText(file: string): string | null {
  const absolute = path.join(root, file);
  try {
    return fs.readFileSync(absolute, "utf8");
  } catch {
    errors.push(`${displayPath(file)}: file could not be read`);
    return null;
  }
}

function readJson(file: string): unknown | null {
  const text = readText(file);
  if (text === null) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    errors.push(`${displayPath(file)}: invalid JSON`);
    return null;
  }
}

function requireMatch(
  file: string,
  text: string,
  pattern: RegExp,
  description: string,
): void {
  if (!pattern.test(text)) {
    errors.push(
      `${displayPath(file)}: missing current ${description} (expected ${pattern})`,
    );
  }
}

function requireValue(
  file: string,
  actual: unknown,
  expected: string,
  description: string,
): void {
  if (actual !== expected) {
    errors.push(
      `${displayPath(file)}: stale ${description}; expected "${expected}", found ${JSON.stringify(actual)}`,
    );
  }
}

function extractBetween(
  text: string,
  startMarker: string,
  endMarker: string,
  file: string,
  description: string,
): string {
  const start = text.indexOf(startMarker);
  const end =
    start < 0 ? -1 : text.indexOf(endMarker, start + startMarker.length);
  if (start < 0 || end < 0) {
    errors.push(
      `${displayPath(file)}: could not locate ${description} for price validation`,
    );
    return "";
  }
  return text.slice(start, end + endMarker.length);
}

function checkCurrencyTokens(
  file: string,
  text: string,
  allowed: ReadonlySet<string>,
): void {
  const currencyToken = /\$[0-9]+(?:,[0-9]{3})*(?:\.[0-9]+)?k?\+?/g;
  for (const token of text.match(currencyToken) ?? []) {
    if (!allowed.has(token)) {
      errors.push(
        `${displayPath(file)}: unexpected price "${token}" in a public pricing surface; update the current anchor or remove the stale price`,
      );
    }
  }
}

function extractPriceAmounts(text: string): string[] {
  const amounts: string[] = [];
  const normalise = (value: string, hasThousandsUnit: boolean) => {
    const digits = value.replace(/[ ,.]/g, "");
    return hasThousandsUnit ? `${digits}k` : digits;
  };
  const dollarBefore = /\$\s*([0-9]+(?:[ ,.][0-9]{3})*)\s*(k)?/gi;
  const dollarAfter = /([0-9]+(?:[ ,.][0-9]{3})*)\s*(k)?\s*\$/gi;

  for (const match of text.matchAll(dollarBefore)) {
    amounts.push(normalise(match[1], !!match[2]));
  }
  for (const match of text.matchAll(dollarAfter)) {
    amounts.push(normalise(match[1], !!match[2]));
  }
  return amounts;
}

function sameAmounts(left: string[], right: string[]): boolean {
  const sortedLeft = [...left].sort();
  const sortedRight = [...right].sort();
  return (
    sortedLeft.length === sortedRight.length &&
    sortedLeft.every((amount, index) => amount === sortedRight[index])
  );
}

function checkTemplate(template: string): void {
  const templatePricing = extractBetween(
    template,
    '<section class="section" id="pricing"',
    "<!-- Contact -->",
    templateFile,
    "landing pricing and budget sections",
  );
  const templateFaq = extractBetween(
    template,
    '<section class="faq-section" id="faq"',
    '<!-- Journal "book notes"',
    templateFile,
    "landing FAQ section",
  );
  const templateContact = extractBetween(
    template,
    "<!-- Contact -->",
    '<section class="faq-section" id="faq"',
    templateFile,
    "landing contact budget section",
  );

  const pricingSurface = `${templatePricing}\n${templateContact}\n${templateFaq}`;
  const templateAllowedPrices = new Set([
    "$2,000",
    "$7,000",
    "$10,000",
    "$30,000",
    "$45,000",
    "$45,000+",
  ]);
  checkCurrencyTokens(templateFile, pricingSurface, templateAllowedPrices);

  requireMatch(
    templateFile,
    templatePricing,
    /<div class="price-title">Launch Site<\/div>[\s\S]{0,300}<div class="price-amount">\$2,000<\/div>/,
    `Launch Site anchor ${currentPrices["Launch Site"].template}`,
  );
  requireMatch(
    templateFile,
    templatePricing,
    /<div class="price-title">Prototype<\/div>[\s\S]{0,300}<div class="price-amount">\$7,000<\/div>/,
    `Prototype anchor ${currentPrices.Prototype.template}`,
  );
  requireMatch(
    templateFile,
    templatePricing,
    /<div class="price-title">MVP<\/div>[\s\S]{0,300}<div class="price-amount">\$10,000–\$30,000<\/div>/,
    `MVP anchor ${currentPrices.MVP.template}`,
  );
  requireMatch(
    templateFile,
    templatePricing,
    /<h4>Custom<\/h4>[\s\S]{0,300}<span class="special-price-amount">\$45,000\+<\/span>/,
    `Custom anchor ${currentPrices.Custom.template}`,
  );

  const jsonLdScripts = [
    ...template.matchAll(
      /<script type="application\/ld\+json">\s*([\s\S]*?)<\/script>/g,
    ),
  ];
  let professionalService: JsonRecord | null = null;
  for (const match of jsonLdScripts) {
    try {
      const data = JSON.parse(match[1]) as JsonRecord;
      if (data["@type"] === "ProfessionalService") {
        professionalService = data;
        break;
      }
    } catch {
      // The landing renderer will handle malformed JSON-LD separately. Keep
      // searching so a later valid ProfessionalService block can be checked.
    }
  }

  if (!professionalService) {
    errors.push(
      `${displayPath(templateFile)}: structured pricing metadata is missing or invalid`,
    );
    return;
  }

  requireValue(
    templateFile,
    professionalService.priceRange,
    "$2,000 - $45,000+",
    "structured price range",
  );

  const catalog = professionalService.hasOfferCatalog as JsonRecord | undefined;
  const offers = Array.isArray(catalog?.itemListElement)
    ? catalog.itemListElement
    : [];
  const offerByName = new Map<string, JsonRecord>();
  for (const offer of offers) {
    if (!offer || typeof offer !== "object") continue;
    const item = (offer as JsonRecord).itemOffered;
    if (!item || typeof item !== "object") continue;
    const name = (item as JsonRecord).name;
    if (typeof name === "string") offerByName.set(name, offer as JsonRecord);
  }

  const launchOffer = offerByName.get("Launch Site");
  const prototypeOffer = offerByName.get("Prototype");
  const mvpOffer = offerByName.get("MVP");
  const customOffer = offerByName.get("Custom-Scale");
  if (!launchOffer) {
    errors.push(
      `${displayPath(templateFile)}: structured metadata missing offer "Launch Site"`,
    );
  } else {
    requireValue(
      templateFile,
      launchOffer.price,
      "2000",
      'Launch Site "price"',
    );
  }
  if (!prototypeOffer) {
    errors.push(
      `${displayPath(templateFile)}: structured metadata missing offer "Prototype"`,
    );
  } else {
    requireValue(
      templateFile,
      prototypeOffer.price,
      "7000",
      'Prototype "price"',
    );
  }
  if (!mvpOffer) {
    errors.push(
      `${displayPath(templateFile)}: structured metadata missing offer "MVP"`,
    );
  } else {
    const specification = mvpOffer.priceSpecification as JsonRecord | undefined;
    requireValue(
      templateFile,
      specification?.minPrice,
      "10000",
      'MVP "minPrice"',
    );
    requireValue(
      templateFile,
      specification?.maxPrice,
      "30000",
      'MVP "maxPrice"',
    );
  }
  if (!customOffer) {
    errors.push(
      `${displayPath(templateFile)}: structured metadata missing offer "Custom-Scale"`,
    );
  } else {
    const specification = customOffer.priceSpecification as
      | JsonRecord
      | undefined;
    requireValue(
      templateFile,
      specification?.minPrice,
      "45000",
      'Custom-Scale "minPrice"',
    );
  }

  const structuredPricing = jsonLdScripts
    .map((match) => match[1])
    .find((body) => body.includes('"@type": "ProfessionalService"'));
  if (structuredPricing) {
    checkCurrencyTokens(
      templateFile,
      structuredPricing,
    new Set(["$2,000", "$45,000+"]),
    );
  }
}

function checkJournal(journal: string): void {
  const llms = extractBetween(
    journal,
    "export function renderLlmsTxt",
    "export function renderLlmsFullTxt",
    journalFile,
    "renderLlmsTxt pricing section",
  );
  const llmsFullStart = journal.indexOf("export function renderLlmsFullTxt");
  const llmsFull = llmsFullStart >= 0 ? journal.slice(llmsFullStart) : "";
  if (!llmsFull) {
    errors.push(
      `${displayPath(journalFile)}: renderLlmsFullTxt source is missing`,
    );
  }

  const journalPricing = `${llms}\n${llmsFull}`;
  const journalAllowedPrices = new Set([
    "$2,000",
    "$7,000",
    "$10,000",
    "$30,000",
    "$45,000+",
  ]);
  checkCurrencyTokens(journalFile, journalPricing, journalAllowedPrices);

  for (const [packageName, prices] of Object.entries(currentPrices)) {
    const escapeRegExp = (value: string) =>
      value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    requireMatch(
      journalFile,
      journalPricing,
      new RegExp(
        `(?:- |### )${escapeRegExp(packageName)}: ${escapeRegExp(prices.journal)}`,
      ),
      `${packageName} anchor ${prices.journal}`,
    );
  }
}

function checkTranslationKeys(): void {
  const source = readJson(sourceFile);
  if (!Array.isArray(source)) return;
  const sourceKeys = new Set(
    source
      .filter(
        (entry): entry is JsonRecord => !!entry && typeof entry === "object",
      )
      .map((entry) => entry.key)
      .filter((key): key is string => typeof key === "string"),
  );

  for (const key of pricingTranslationKeys) {
    if (!sourceKeys.has(key)) {
      errors.push(
        `${displayPath(sourceFile)}: missing pricing key ${JSON.stringify(key)}`,
      );
    }
  }

  for (const code of SUPPORTED_CODES) {
    if (code === DEFAULT_LOCALE) continue;
    const file = `server/i18n/strings/${code}.json`;
    const dictionary = readJson(file);
    if (
      !dictionary ||
      typeof dictionary !== "object" ||
      Array.isArray(dictionary)
    ) {
      continue;
    }
    for (const key of pricingTranslationKeys) {
      if (!(key in dictionary)) {
        errors.push(
          `${displayPath(file)}: missing pricing key ${JSON.stringify(key)}`,
        );
        continue;
      }
      const expectedAmounts = extractPriceAmounts(key);
      if (expectedAmounts.length === 0) continue;
      const actualAmounts = extractPriceAmounts(String(dictionary[key]));
      if (!sameAmounts(expectedAmounts, actualAmounts)) {
        errors.push(
          `${displayPath(file)}: stale price in pricing key ${JSON.stringify(key)}; expected ${expectedAmounts.join(", ")}, found ${actualAmounts.join(", ") || "none"}`,
        );
      }
    }
  }
}

const template = readText(templateFile);
if (template !== null) checkTemplate(template);

const journal = readText(journalFile);
if (journal !== null) checkJournal(journal);

checkTranslationKeys();

if (errors.length > 0) {
  process.stderr.write(
    `Pricing consistency check failed with ${errors.length} problem(s):\n` +
      errors.map((error) => `- ${error}`).join("\n") +
      "\n",
  );
  process.exitCode = 1;
} else {
  process.stdout.write(
    `Pricing consistency check passed: ${Object.keys(currentPrices).length} package anchors and ${pricingTranslationKeys.length} pricing translation keys verified across ${SUPPORTED_CODES.length - 1} locale dictionaries.\n`,
  );
}
