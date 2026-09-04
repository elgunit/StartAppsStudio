/**
 * Browser smoke checks for the public pricing decision path.
 *
 * Usage:
 *   npm run check:pricing:smoke
 *
 * The check intentionally targets the local development server. Set
 * PRICING_SMOKE_URL only when the local server is exposed on another local
 * port; production URLs are rejected.
 */
import { chromium, type Page } from "playwright";

const configuredUrl = process.env.PRICING_SMOKE_URL ?? "http://127.0.0.1:5000";
const baseUrl = new URL(configuredUrl);
if (!["127.0.0.1", "localhost"].includes(baseUrl.hostname)) {
  throw new Error(
    `Pricing smoke checks must use a local development URL, received ${configuredUrl}`,
  );
}

const offers = [
  { label: "Launch Site", amount: "$2,600" },
  { label: "Prototype", amount: "$6,000" },
  { label: "MVP", amount: "$15,000–$30,000" },
  { label: "Custom", amount: "$25,000" },
] as const;

const localizedOffers = [
  { label: "Saytı başlat", amount: "$2,600" },
  { label: "Prototip", amount: "$6,000" },
  { label: "MVP", amount: "$15,000–$30,000" },
  { label: "Verilmiş müddət", amount: "$25,000" },
] as const;

type Viewport = { name: string; width: number; height: number };
type Theme = "light" | "dark";

const viewports: Viewport[] = [
  { name: "desktop", width: 1280, height: 900 },
  { name: "narrow-mobile", width: 360, height: 800 },
];

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function routeUrl(route: string): string {
  return new URL(route, baseUrl).toString();
}

async function loadPricing(
  page: Page,
  route: string,
  viewport: Viewport,
  theme: Theme,
  expectedOffers: ReadonlyArray<{ label: string; amount: string }>,
): Promise<{
  canvas: string;
  ink: string;
  sectionColor: string;
  featuredBackground: string;
  featuredColor: string;
  featuredBorder: string;
}> {
  await page.setViewportSize({
    width: viewport.width,
    height: viewport.height,
  });
  await page.emulateMedia({ colorScheme: theme });

  const response = await page.goto(routeUrl(route), {
    waitUntil: "domcontentloaded",
  });
  assert(
    response?.ok(),
    `${route} returned ${response?.status() ?? "no response"} at ${viewport.name}/${theme}`,
  );
  await page.locator("#pricing").waitFor({ state: "attached" });

  const result = await page.evaluate(() => {
    const section = document.querySelector<HTMLElement>("#pricing");
    if (!section) return null;

    const cards = Array.from(
      section.querySelectorAll<HTMLElement>(".price-card, .special-package"),
    );
    const sectionRect = section.getBoundingClientRect();
    const rootStyle = getComputedStyle(document.documentElement);
    const sectionStyle = getComputedStyle(section);
    const featured = section.querySelector<HTMLElement>(".price-card.featured");
    const featuredStyle = featured ? getComputedStyle(featured) : null;

    return {
      section: {
        clientWidth: section.clientWidth,
        scrollWidth: section.scrollWidth,
      },
      cards: cards.map((card) => {
        const rect = card.getBoundingClientRect();
        const title = card.querySelector<HTMLElement>(
          ".price-title, .special-identity-row h4",
        );
        const amount = card.querySelector<HTMLElement>(
          ".price-amount, .special-price-amount",
        );
        const titleStyle = title ? getComputedStyle(title) : null;
        const amountStyle = amount ? getComputedStyle(amount) : null;
        return {
          text: card.innerText,
          visible:
            rect.width > 0 &&
            rect.height > 0 &&
            getComputedStyle(card).display !== "none" &&
            getComputedStyle(card).visibility !== "hidden",
          withinSection:
            rect.left >= sectionRect.left - 1 &&
            rect.right <= sectionRect.right + 1,
          noCardOverflow: card.scrollWidth <= card.clientWidth + 1,
          title: title?.innerText ?? "",
          titleReadable:
            !!titleStyle &&
            Number.parseFloat(titleStyle.fontSize) >= 12 &&
            titleStyle.lineHeight !== "normal",
          amount: amount?.innerText ?? "",
          amountReadable:
            !!amountStyle &&
            Number.parseFloat(amountStyle.fontSize) >= 12 &&
            amountStyle.lineHeight !== "normal",
        };
      }),
      theme: {
        canvas: rootStyle.getPropertyValue("--canvas").trim(),
        ink: rootStyle.getPropertyValue("--ink").trim(),
        sectionColor: sectionStyle.color,
        featuredBackground: featuredStyle?.backgroundColor ?? "",
        featuredColor: featuredStyle?.color ?? "",
        featuredBorder: featuredStyle?.borderTopColor ?? "",
      },
    };
  });

  assert(result, "Pricing section was not found");
  assert(
    result.cards.length === expectedOffers.length,
    `${route} ${viewport.name}/${theme} expected ${expectedOffers.length} public offers, found ${result.cards.length}`,
  );
  assert(
    result.section.scrollWidth <= result.section.clientWidth + 1,
    `${route} ${viewport.name}/${theme} pricing section overflows horizontally`,
  );

  result.cards.forEach((card, index) => {
    const expected = expectedOffers[index];
    assert(
      card.visible,
      `${route} ${viewport.name}/${theme} offer ${index + 1} is not visible`,
    );
    assert(
      card.withinSection,
      `${route} ${viewport.name}/${theme} offer ${index + 1} extends outside the pricing section`,
    );
    assert(
      card.noCardOverflow,
      `${route} ${viewport.name}/${theme} offer ${index + 1} has clipped content`,
    );
    assert(
      card.title === expected.label,
      `${route} ${viewport.name}/${theme} expected offer label "${expected.label}", found "${card.title}"`,
    );
    assert(
      card.amount.includes(expected.amount),
      `${route} ${viewport.name}/${theme} expected ${expected.amount} in "${card.title}", found "${card.amount}"`,
    );
    assert(
      card.titleReadable && card.amountReadable,
      `${route} ${viewport.name}/${theme} offer "${card.title}" is not readable`,
    );
  });

  assert(
    result.theme.sectionColor &&
      result.theme.featuredBackground &&
      result.theme.featuredColor &&
      result.theme.featuredBorder,
    `${route} ${viewport.name}/${theme} pricing theme styles are missing`,
  );

  console.log(
    `PASS ${route} ${viewport.name}/${theme}: ${result.cards.length} offers, no horizontal overflow`,
  );
  return result.theme;
}

async function main(): Promise<void> {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const themes = new Map<string, Awaited<ReturnType<typeof loadPricing>>>();

    for (const viewport of viewports) {
      for (const theme of ["light", "dark"] as const) {
        const snapshot = await loadPricing(page, "/", viewport, theme, offers);
        themes.set(`${viewport.name}/${theme}`, snapshot);
      }
    }

    const localizedSnapshot = await loadPricing(
      page,
      "/az",
      viewports[1],
      "light",
      localizedOffers,
    );
    const localizedHeading = await page
      .locator("#pricing .section-title")
      .innerText();
    assert(
      localizedHeading ===
       "Növbəti mərhələnizi seçin",
      `Azerbaijani pricing heading was not localized: "${localizedHeading}"`,
    );
    assert(
      localizedSnapshot.featuredColor,
      "Azerbaijani featured pricing card lost its theme color",
    );
    assert(
      (await page.locator('html[lang="az"]').count()) === 1,
      "Azerbaijani pricing route did not set the document language",
    );

    const light = themes.get("desktop/light");
    const dark = themes.get("desktop/dark");
    assert(light && dark, "Desktop light/dark pricing snapshots are missing");
    assert(
      light.canvas !== dark.canvas && light.ink !== dark.ink,
      "Pricing light and dark themes resolve to the same color tokens",
    );

    console.log("Pricing smoke checks passed.");
  } finally {
    await browser.close();
  }
}

main().catch((error: unknown) => {
  console.error(
    `Pricing smoke checks failed: ${
      error instanceof Error ? error.message : String(error)
    }`,
  );
  process.exitCode = 1;
});
