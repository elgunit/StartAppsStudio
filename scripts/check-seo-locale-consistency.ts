/**
 * Audits the server-rendered public search surface for every landing locale.
 *
 * This intentionally checks the renderer directly rather than a running server:
 * it catches metadata drift in CI and keeps the locale contract independent of
 * whichever host or cookie happens to be used for a browser smoke test.
 */
import { renderLandingPage } from "../server/i18n/render";
import {
  DEFAULT_LOCALE,
  LOCALES,
  PREFIXED_CODES,
  SERVICE_AREA,
  SUPPORTED_CODES,
  SUPPORTED_LANGUAGE_NAMES,
  localeUrl,
} from "../server/i18n/locales";
import {
  renderLlmsFullTxt,
  renderLlmsTxt,
  renderRobotsTxt,
  renderSitemapXml,
  CANONICAL_ORIGIN,
} from "../server/journal/render";

const failures: string[] = [];
const expect = (condition: unknown, message: string) => {
  if (!condition) failures.push(message);
};
const count = (haystack: string, needle: string) =>
  haystack.split(needle).length - 1;
const jsonLdBlocks = (html: string): Record<string, unknown>[] =>
  [
    ...html.matchAll(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
    ),
  ]
    .map((match) => {
      try {
        return JSON.parse(match[1]) as Record<string, unknown>;
      } catch {
        return null;
      }
    })
    .filter((block): block is Record<string, unknown> => !!block);
const findLanguageArrays = (node: unknown): string[][] => {
  if (Array.isArray(node)) {
    return node.every((value) => typeof value === "string") ? [node] : [];
  }
  if (!node || typeof node !== "object") return [];
  return Object.entries(node).flatMap(([key, value]) =>
    key === "availableLanguage" && Array.isArray(value)
      ? findLanguageArrays(value)
      : findLanguageArrays(value),
  );
};

expect(
  new Set(SUPPORTED_CODES).size === SUPPORTED_CODES.length,
  "duplicate locale code",
);
expect(
  new Set(LOCALES.map((locale) => locale.hreflang)).size === LOCALES.length,
  "duplicate hreflang value",
);
expect(
  PREFIXED_CODES.length === SUPPORTED_CODES.length - 1 &&
    !PREFIXED_CODES.includes(DEFAULT_LOCALE),
  "prefixed locale list is out of sync",
);

const sitemap = renderSitemapXml(CANONICAL_ORIGIN);
expect(
  count(sitemap, `${CANONICAL_ORIGIN}/</loc>`) === 1,
  "homepage missing or duplicated in sitemap",
);
for (const code of SUPPORTED_CODES) {
  const url = localeUrl(code);
  expect(
    count(sitemap, `<loc>${url}</loc>`) === 1,
    `${code}: sitemap URL missing or duplicated`,
  );
}

expect(
  !sitemap.includes(`${CANONICAL_ORIGIN}/en</loc>`),
  "non-canonical /en URL in sitemap",
);

for (const locale of LOCALES) {
  const html = renderLandingPage(locale.code);
  const head = html.slice(html.indexOf("<head>"), html.indexOf("</head>"));
  const canonical = localeUrl(locale.code);
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1] || "";
  const description =
    html.match(/<meta name="description" content="([^"]+)"/)?.[1] || "";
  const structuredData = jsonLdBlocks(html);
  expect(
    html.includes(`<html lang="${locale.htmlLang}">`),
    `${locale.code}: incorrect html lang`,
  );
  expect(
    html.includes(`<link rel="canonical" href="${canonical}" />`),
    `${locale.code}: incorrect self-canonical`,
  );
  expect(
    count(head, `hreflang="${locale.hreflang}" href="${canonical}"`) === 1,
    `${locale.code}: missing self hreflang`,
  );
  expect(
    count(head, 'hreflang="x-default"') === 1,
    `${locale.code}: missing x-default hreflang`,
  );
  expect(
    html.includes(`<meta property="og:locale" content="${locale.ogLocale}" />`),
    `${locale.code}: incorrect og:locale`,
  );
  expect(
    count(
      html,
      `"inLanguage": "${locale.code === DEFAULT_LOCALE ? "en-US" : locale.htmlLang}"`,
    ) >= 2,
    `${locale.code}: WebSite/WebPage inLanguage is incomplete`,
  );
  const serviceAreas = structuredData
    .map((block) => block.areaServed)
    .filter((value): value is string => typeof value === "string");
  expect(
    serviceAreas.length >= 2 && serviceAreas.every((value) => value.length > 0),
    `${locale.code}: structured-data service area is missing`,
  );
  expect(
    html.includes('"availableLanguage"'),
    `${locale.code}: structured-data language coverage is missing`,
  );
  const languageArrays = structuredData.flatMap(findLanguageArrays);
  expect(
    languageArrays.some(
      (languages) =>
        JSON.stringify(languages) === JSON.stringify(SUPPORTED_LANGUAGE_NAMES),
    ),
    `${locale.code}: structured-data language list drifted`,
  );
  expect(
    title.length > 0 && description.length > 0,
    `${locale.code}: title or description is empty`,
  );
  for (const alternate of LOCALES) {
    expect(
      count(head, `hreflang="${alternate.hreflang}"`) === 1,
      `${locale.code}: hreflang ${alternate.code} missing or duplicated`,
    );
  }
  if (locale.code !== DEFAULT_LOCALE) {
    expect(
      !html.includes(
        'content="Ship Your Product in Weeks | Start Apps Studio"',
      ),
      `${locale.code}: English Open Graph title fallback`,
    );
    expect(
      title !== "Ship Your Product in Weeks | Start Apps Studio",
      `${locale.code}: English title fallback`,
    );
  }
}

const robots = renderRobotsTxt(CANONICAL_ORIGIN);
expect(
  robots.includes(`Sitemap: ${CANONICAL_ORIGIN}/sitemap.xml`),
  "robots sitemap missing",
);
expect(robots.includes("Allow: /"), "robots crawl allow missing");
expect(robots.includes("Disallow: /api/"), "robots API disallow missing");
expect(robots.includes(SERVICE_AREA), "robots service area missing");

const llms = renderLlmsTxt(CANONICAL_ORIGIN);
const llmsFull = renderLlmsFullTxt(CANONICAL_ORIGIN);
for (const name of SUPPORTED_LANGUAGE_NAMES) {
  expect(
    llms.includes(name) || llmsFull.includes(name),
    `LLM files missing ${name}`,
  );
}
expect(
  llms.includes(SERVICE_AREA) &&
    llmsFull.toLowerCase().includes(SERVICE_AREA.toLowerCase()),
  "LLM files missing service area",
);
expect(
  llms.toLowerCase().includes("remote delivery") &&
    llmsFull.toLowerCase().includes("remote delivery"),
  "LLM files missing remote model",
);
for (const code of PREFIXED_CODES) {
  expect(
    llms.includes(`${CANONICAL_ORIGIN}/${code}`),
    `llms.txt missing /${code}`,
  );
  expect(
    llmsFull.includes(`${CANONICAL_ORIGIN}/${code}`),
    `llms-full.txt missing /${code}`,
  );
}

if (failures.length) {
  console.error(`SEO locale consistency check failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    `SEO locale consistency check passed: ${SUPPORTED_CODES.length} locales, sitemap, robots, and LLM sources verified.`,
  );
}