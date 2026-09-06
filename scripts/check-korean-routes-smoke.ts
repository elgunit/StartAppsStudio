/**
 * Browser smoke checks for the Korean landing and editorial routes.
 *
 * Usage:
 *   npm run check:i18n:ko
 *
 * The check intentionally targets the local development server. Set
 * KOREAN_ROUTES_SMOKE_URL only when the app is exposed on another local port;
 * production URLs are rejected.
 */
import { chromium, type ConsoleMessage, type Page } from "playwright";
import { LOCALES, SITE_ORIGIN } from "../server/i18n/locales";

const configuredUrl =
  process.env.KOREAN_ROUTES_SMOKE_URL ?? "http://127.0.0.1:5000";
const baseUrl = new URL(configuredUrl);
if (!["127.0.0.1", "localhost"].includes(baseUrl.hostname)) {
  throw new Error(
    `Korean route smoke checks must use a local development URL, received ${configuredUrl}`,
  );
}

const articleSlugs = [
  "the-mvp-brief-is-your-first-product-decision",
  "base44-vs-lovable-which-one-for-your-next-app",
] as const;

const routes = [
  "/ko",
  "/ko/resources",
  "/ko/journal",
  ...articleSlugs.map((slug) => `/ko/journal/${slug}`),
] as const;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function routeUrl(path: string): string {
  return new URL(path, baseUrl).toString();
}

function expectedCanonical(path: string): string {
  return `${SITE_ORIGIN}${path}`;
}

function consoleErrorText(message: ConsoleMessage): string {
  return `${message.type()}: ${message.text()}`;
}

async function inspectRoute(page: Page, path: string): Promise<void> {
  const browserErrors: string[] = [];
  const requestErrors: string[] = [];
  const onConsole = (message: ConsoleMessage) => {
    if (message.type() === "error") {
      browserErrors.push(consoleErrorText(message));
    }
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
    const response = await page.goto(routeUrl(path), {
      waitUntil: "networkidle",
    });
    assert(
      response?.ok(),
      `${path}: returned HTTP ${response?.status() ?? "no response"}`,
    );

    const result = await page.evaluate(() => {
      const jsonLd = Array.from(
        document.querySelectorAll<HTMLScriptElement>(
          'script[type="application/ld+json"]',
        ),
      )
        .map((script) => {
          try {
            return JSON.parse(script.textContent ?? "") as {
              inLanguage?: string;
            };
          } catch {
            return null;
          }
        })
        .filter((value): value is { inLanguage?: string } => value !== null);

      return {
        htmlLang: document.documentElement.lang,
        canonical:
          document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
            ?.href ?? "",
        alternates: Array.from(
          document.querySelectorAll<HTMLLinkElement>(
            'link[rel="alternate"][hreflang]',
          ),
        ).map((link) => ({
          hreflang: link.hreflang,
          href: link.href,
        })),
        jsonLdLanguages: jsonLd
          .map((value) => value.inLanguage)
          .filter((value): value is string => typeof value === "string"),
        replacementGlyph: document.body.innerText.includes("\uFFFD"),
      };
    });

    assert(
      result.htmlLang === "ko",
      `${path}: expected html lang="ko", found "${result.htmlLang}"`,
    );
    assert(
      result.canonical === expectedCanonical(path),
      `${path}: expected canonical ${expectedCanonical(path)}, found ${result.canonical}`,
    );

    for (const locale of LOCALES) {
      const matches = result.alternates.filter(
        (alternate) => alternate.hreflang === locale.hreflang,
      );
      assert(
        matches.length === 1,
        `${path}: expected one ${locale.hreflang} alternate, found ${matches.length}`,
      );
    }
    const koreanAlternate = result.alternates.find(
      (alternate) => alternate.hreflang === "ko",
    );
    assert(
      koreanAlternate?.href === expectedCanonical(path),
      `${path}: Korean alternate does not point to its self-canonical route`,
    );
    assert(
      result.alternates.filter(
        (alternate) => alternate.hreflang === "x-default",
      ).length === 1,
      `${path}: x-default alternate is missing or duplicated`,
    );
    assert(
      result.jsonLdLanguages.includes("ko"),
      `${path}: JSON-LD does not declare Korean inLanguage`,
    );
    assert(
      !result.replacementGlyph,
      `${path}: page contains a missing-glyph replacement character`,
    );
    assert(
      requestErrors.length === 0,
      `${path}: request failures:\n${requestErrors.join("\n")}`,
    );
    assert(
      browserErrors.length === 0,
      `${path}: browser errors:\n${browserErrors.join("\n")}`,
    );

    console.log(`PASS ${path}`);
  } finally {
    page.off("console", onConsole);
    page.off("pageerror", onPageError);
    page.off("requestfailed", onRequestFailed);
  }
}

async function checkLocaleNavigation(page: Page): Promise<void> {
  await page.goto(routeUrl("/ko"), { waitUntil: "networkidle" });
  const target = await page
    .locator('link[rel="alternate"][hreflang="ko"]')
    .getAttribute("href");
  assert(target, "Korean locale navigation link is missing");

  const targetPath = new URL(target).pathname;
  assert(
    targetPath === "/ko",
    `Korean locale navigation points to ${targetPath} instead of /ko`,
  );
  const response = await page.goto(routeUrl(targetPath), {
    waitUntil: "networkidle",
  });
  assert(
    response?.ok(),
    `Korean locale navigation returned HTTP ${response?.status() ?? "no response"}`,
  );
  assert(
    (await page.locator('html[lang="ko"]').count()) === 1,
    "Korean locale navigation did not land on a Korean document",
  );
  console.log("PASS Korean locale navigation");
}

async function main(): Promise<void> {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    for (const path of routes) {
      await inspectRoute(page, path);
    }
    await checkLocaleNavigation(page);
    console.log(
      `Korean route smoke checks passed: ${routes.length} routes and locale navigation.`,
    );
  } finally {
    await browser.close();
  }
}

main().catch((error: unknown) => {
  console.error(
    `Korean route smoke checks failed: ${
      error instanceof Error ? error.message : String(error)
    }`,
  );
  process.exitCode = 1;
});