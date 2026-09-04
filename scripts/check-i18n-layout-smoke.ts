/**
 * Browser smoke checks for every localized landing-page route.
 *
 * Usage:
 *   npm run check:i18n:layout
 *
 * This check intentionally targets the local development server. Set
 * I18N_LAYOUT_SMOKE_URL only when it is exposed on another local port;
 * production URLs are rejected.
 */
import { chromium, type ConsoleMessage, type Page } from "playwright";
import { DEFAULT_LOCALE, LOCALES } from "../server/i18n/locales";
import { loadDictionary } from "../server/i18n/render";

const configuredUrl =
  process.env.I18N_LAYOUT_SMOKE_URL ?? "http://127.0.0.1:5000";
const baseUrl = new URL(configuredUrl);
if (!["127.0.0.1", "localhost"].includes(baseUrl.hostname)) {
  throw new Error(
    `Localized layout smoke checks must use a local development URL, received ${configuredUrl}`,
  );
}

const HERO_SOURCE =
  '<span class="hero-line hero-line-nowrap">Ship your <span class="accent-word">product</span> in weeks.</span>';
const ENGLISH_TESTIMONIAL_LABEL = "Problem";
const viewports = [
  { name: "desktop", width: 1280, height: 900 },
  { name: "mobile", width: 360, height: 800 },
] as const;
const localizedLocales = LOCALES.filter(
  (locale) => locale.code !== DEFAULT_LOCALE,
);

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function routeUrl(code: string): string {
  return new URL(`/${code}`, baseUrl).toString();
}

function consoleErrorText(message: ConsoleMessage): string {
  return `${message.type()}: ${message.text()}`;
}

async function checkLocale(
  page: Page,
  locale: (typeof localizedLocales)[number],
  viewport: (typeof viewports)[number],
): Promise<void> {
  const context = `/${locale.code} ${viewport.name} (${viewport.width}x${viewport.height})`;
  const browserErrors: string[] = [];
  const requestErrors: string[] = [];
  const onConsole = (message: ConsoleMessage) => {
    if (message.type() === "error")
      browserErrors.push(consoleErrorText(message));
  };
  const onPageError = (error: Error) =>
    browserErrors.push(`pageerror: ${error.message}`);
  const onRequestFailed = (request: {
    url(): string;
    failure(): { errorText: string } | null;
  }) => {
    requestErrors.push(
      `${request.url()}: ${request.failure()?.errorText ?? "unknown request failure"}`,
    );
  };

  page.on("console", onConsole);
  page.on("pageerror", onPageError);
  page.on("requestfailed", onRequestFailed);

  try {
    await page.setViewportSize(viewport);
    const response = await page.goto(routeUrl(locale.code), {
      waitUntil: "networkidle",
    });
    assert(
      response?.ok(),
      `${context}: returned HTTP ${response?.status() ?? "no response"}`,
    );

    const expectedHero = loadDictionary(locale.code)[HERO_SOURCE];
    assert(
      expectedHero && expectedHero !== HERO_SOURCE,
      `${context}: locale dictionary has no direct hero translation`,
    );

    const result = await page.evaluate(() => {
      const hero = document.querySelector<HTMLElement>(".hero-headline");
      const testimonialLabels = Array.from(
        document.querySelectorAll<HTMLElement>(".testimonial-problem-label"),
      ).map((label) => label.innerText.trim());
      const root = document.documentElement;

      return {
        htmlLang: root.lang,
        heroHtml: hero?.innerHTML.trim() ?? "",
        testimonialLabels,
        horizontalOverflow: root.scrollWidth - root.clientWidth,
        hasReplacementGlyph: document.body.innerText.includes("\uFFFD"),
      };
    });

    assert(
      result.htmlLang === locale.htmlLang,
      `${context}: expected html lang="${locale.htmlLang}", found "${result.htmlLang}"`,
    );
    assert(
      result.heroHtml === expectedHero,
      `${context}: hero is not the direct localized copy; expected "${expectedHero}", found "${result.heroHtml}"`,
    );
    assert(
      !result.testimonialLabels.includes(ENGLISH_TESTIMONIAL_LABEL),
      `${context}: testimonial label fell back to English`,
    );
    assert(
      result.horizontalOverflow <= 1,
      `${context}: page overflows horizontally by ${result.horizontalOverflow}px`,
    );
    assert(
      !result.hasReplacementGlyph,
      `${context}: page contains a missing-glyph replacement character`,
    );
    assert(
      requestErrors.length === 0,
      `${context}: request failures:\n${requestErrors.join("\n")}`,
    );
    assert(
      browserErrors.length === 0,
      `${context}: browser errors:\n${browserErrors.join("\n")}`,
    );

    console.log(`PASS ${context}`);
  } finally {
    page.off("console", onConsole);
    page.off("pageerror", onPageError);
    page.off("requestfailed", onRequestFailed);
  }
}

async function main(): Promise<void> {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    for (const locale of localizedLocales) {
      for (const viewport of viewports) {
        await checkLocale(page, locale, viewport);
      }
    }
    console.log(
      `Localized layout smoke checks passed: ${localizedLocales.length} locales across ${viewports.length} viewports.`,
    );
  } finally {
    await browser.close();
  }
}

main().catch((error: unknown) => {
  console.error(
    `Localized layout smoke checks failed: ${
      error instanceof Error ? error.message : String(error)
    }`,
  );
  process.exitCode = 1;
});
