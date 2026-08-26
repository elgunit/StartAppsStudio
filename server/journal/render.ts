import type { Block, Post } from "./posts";
import { AUTHOR_NAME, allPostsNewestFirst } from "./posts";
import { PREFIXED_CODES } from "../i18n/locales";

/**
 * The single authoritative public origin for all SEO-facing URLs.
 * Set PUBLIC_SITE_URL in the environment to override (no trailing slash).
 * This value is used for canonicals, sitemap <loc> entries, robots.txt
 * Sitemap directive, og:url, and llms.txt links — never the request host.
 */
export const CANONICAL_ORIGIN: string = (
  process.env.PUBLIC_SITE_URL || "https://startappsstudio.com"
).replace(/\/$/, "");

// Keep the homepage freshness signal in sync with meaningful public copy changes.
export const HOMEPAGE_LAST_MODIFIED = "2026-08-11";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function inline(s: string): string {
  let out = esc(s);
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
  // text+href are already escaped (we ran esc() first), so this is safe.
  out = out.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_m, text, href) => `<a href="${href}" rel="nofollow noopener">${text}</a>`,
  );
  return out;
}

function safeJson(data: unknown): string {
  // Prevent </script> injection when embedding JSON inside <script> tags.
  return JSON.stringify(data).replace(/<\/script/gi, "<\\/script");
}

const ACCENT_PALETTE = [
  "#0d9488", // teal
  "#10b981", // emerald
  "#f59e0b", // amber
  "#f43f5e", // rose
  "#06b6d4", // cyan
  "#14b8a6", // teal-mint
];

function accentColor(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return ACCENT_PALETTE[hash % ACCENT_PALETTE.length];
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function renderBlock(block: Block): string {
  switch (block.type) {
    case "p":
      return `<p>${inline(block.text)}</p>`;
    case "h2": {
      const id = block.id || slugify(block.text);
      return `<h2 id="${esc(id)}"><a href="#${esc(id)}" class="anchor">${inline(block.text)}</a></h2>`;
    }
    case "h3": {
      const id = block.id || slugify(block.text);
      return `<h3 id="${esc(id)}">${inline(block.text)}</h3>`;
    }
    case "answer":
      return `<div class="answer-box"><span class="answer-label">Short answer</span><p>${inline(block.text)}</p></div>`;
    case "ul":
      return `<ul>${block.items.map((i) => `<li>${inline(i)}</li>`).join("")}</ul>`;
    case "ol":
      return `<ol>${block.items.map((i) => `<li>${inline(i)}</li>`).join("")}</ol>`;
    case "quote":
      return `<blockquote><p>${inline(block.text)}</p>${block.cite ? `<cite>— ${inline(block.cite)}</cite>` : ""}</blockquote>`;
    case "callout":
      return `<aside class="callout">${block.title ? `<strong>${inline(block.title)}</strong> ` : ""}${inline(block.text)}</aside>`;
    case "faq": {
      const items = block.items
        .map(
          (it) =>
            `<details class="faq-item"><summary>${inline(it.q)}</summary><div class="faq-answer"><p>${inline(it.a)}</p></div></details>`,
        )
        .join("");
      return `<div class="faq">${items}</div>`;
    }
  }
}

function renderFaqJsonLd(post: Post): string {
  const faq = post.body.find((b) => b.type === "faq");
  if (!faq || faq.type !== "faq") return "";
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: it.a,
      },
    })),
  };
  return `<script type="application/ld+json">${safeJson(data)}</script>`;
}

function renderBreadcrumbJsonLd(post: Post, canonical: string, origin: string): string {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${origin}/` },
      { "@type": "ListItem", position: 2, name: "Journal", item: `${origin}/journal` },
      { "@type": "ListItem", position: 3, name: post.title, item: canonical },
    ],
  };
  return `<script type="application/ld+json">${safeJson(data)}</script>`;
}

function renderArticleJsonLd(post: Post, canonical: string, origin: string): string {
  const articleImage = `${origin}/assets/images/og-journal-default.png`;
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seoDescription || post.description,
    image: [articleImage],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      "@type": "Organization",
      name: AUTHOR_NAME,
      url: origin,
    },
    publisher: {
      "@type": "Organization",
      name: AUTHOR_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${origin}/assets/images/favicon.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical,
    },
    keywords: post.tags.join(", "),
  };
  return `<script type="application/ld+json">${safeJson(data)}</script>`;
}

const STYLE = `
  /* Self-hosted variable fonts (latin + latin-ext subsets) — replaces render-blocking Google Fonts */
  @font-face{font-family:'Inter';font-style:normal;font-weight:100 900;font-display:swap;src:url(/assets/fonts/inter-latin.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;}
  @font-face{font-family:'Inter';font-style:normal;font-weight:100 900;font-display:swap;src:url(/assets/fonts/inter-latin-ext.woff2) format('woff2');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF;}
  @font-face{font-family:'Fraunces';font-style:normal;font-weight:100 900;font-display:swap;src:url(/assets/fonts/fraunces-latin.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;}
  @font-face{font-family:'Fraunces';font-style:normal;font-weight:100 900;font-display:swap;src:url(/assets/fonts/fraunces-latin-ext.woff2) format('woff2');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF;}
  @font-face{font-family:'Fraunces';font-style:italic;font-weight:100 900;font-display:swap;src:url(/assets/fonts/fraunces-italic-latin.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;}
  @font-face{font-family:'Fraunces';font-style:italic;font-weight:100 900;font-display:swap;src:url(/assets/fonts/fraunces-italic-latin-ext.woff2) format('woff2');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF;}
  @font-face{font-family:'Archivo Narrow';font-style:normal;font-weight:100 900;font-display:swap;src:url(/assets/fonts/archivo-narrow-latin.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;}
  @font-face{font-family:'Archivo Narrow';font-style:normal;font-weight:100 900;font-display:swap;src:url(/assets/fonts/archivo-narrow-latin-ext.woff2) format('woff2');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF;}
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #fbf9f4;
    --bg-elevated: #f5f3ee;
    --bg-subtle: #f5f3ee;
    --text: #0a0a0a;
    --text-secondary: #57534e;
    --text-muted: #78716c;
    --border: #0a0a0a;
    --hair: rgba(10,10,10,0.14);
    --accent: #0a0a0a;
    --link: #0a0a0a;
    --yellow: #FCD34D;
    --yellow-deep: #F59E0B;
    --pop: #FF5A1F;
    --on-yellow: #0a0a0a;
    --display: 'Fraunces', 'Times New Roman', Georgia, serif;
    --kicker: 'Archivo Narrow', 'Inter', sans-serif;
    --serif: 'Fraunces', 'Iowan Old Style', Georgia, 'Times New Roman', serif;
    --sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    --mono: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #0a0a0a;
      --bg-elevated: #14130f;
      --bg-subtle: #14130f;
      --text: #fafafa;
      --text-secondary: #a8a29e;
      --text-muted: #78716c;
      --border: #fafafa;
      --hair: rgba(250,250,250,0.16);
      --accent: #fafafa;
      --link: #fafafa;
      --on-yellow: #0a0a0a;
    }
  }
  html { -webkit-text-size-adjust: 100%; }
  body {
    font-family: var(--sans);
    background: var(--bg);
    color: var(--text);
    line-height: 1.65;
    min-height: 100vh;
    font-size: 16px;
    letter-spacing: -0.005em;
  }
  a { color: var(--link); text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; }
  a:hover { text-decoration-thickness: 2px; }
  img { max-width: 100%; height: auto; display: block; }
  .site-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 24px;
    max-width: 1080px;
    margin: 0 auto;
    border-bottom: 2px solid var(--border);
  }
  .site-nav .brand {
    font-family: var(--display);
    font-weight: 900;
    font-size: 18px;
    letter-spacing: -0.02em;
    color: var(--text);
    text-decoration: none;
  }
  .site-nav .nav-links {
    display: flex;
    gap: 20px;
    font-family: var(--kicker);
    text-transform: uppercase;
    letter-spacing: 0.14em;
    font-size: 12px;
    font-weight: 700;
  }
  .site-nav .nav-links a { color: var(--text); text-decoration: none; }
  .site-nav .nav-links a:hover { color: var(--pop); }
  .container { max-width: 720px; margin: 0 auto; padding: 48px 24px 80px; }
  .container-wide { max-width: 1080px; margin: 0 auto; padding: 48px 24px 80px; }
  .crumb {
    font-family: var(--kicker);
    text-transform: uppercase;
    letter-spacing: 0.14em;
    font-size: 11.5px;
    font-weight: 700;
    color: var(--text-secondary);
    margin-bottom: 28px;
  }
  .crumb a { color: var(--text-secondary); text-decoration: none; }
  .crumb a:hover { color: var(--text); }

  /* ---- Article hero / masthead ----------------------------------- */
  .article-kicker {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    font-family: var(--kicker);
    text-transform: uppercase;
    letter-spacing: 0.16em;
    font-size: 11.5px;
    font-weight: 700;
    margin-bottom: 22px;
  }
  .article-kicker .kicker-cat {
    display: inline-block;
    background: var(--yellow);
    color: var(--on-yellow);
    border: 1.5px solid #0a0a0a;
    padding: 5px 11px;
    box-shadow: 4px 4px 0 0 #0a0a0a;
  }
  @media (prefers-color-scheme: dark) {
    .article-kicker .kicker-cat { border-color: var(--yellow); box-shadow: 4px 4px 0 0 var(--yellow); background: #0a0a0a; color: var(--yellow); }
  }
  .article-kicker .kicker-sep { color: var(--text-muted); }
  .article-kicker .kicker-meta { color: var(--text-secondary); }
  .article-title {
    font-family: var(--display);
    font-optical-sizing: auto;
    font-variation-settings: "opsz" 144;
    font-size: clamp(36px, 6vw, 64px);
    font-weight: 900;
    line-height: 0.98;
    letter-spacing: -0.03em;
    margin-bottom: 20px;
  }
  .article-deck {
    font-family: var(--display);
    font-style: italic;
    font-weight: 500;
    font-size: clamp(18px, 2.1vw, 22px);
    line-height: 1.45;
    color: var(--text);
    opacity: 0.85;
    max-width: 42ch;
    margin-bottom: 24px;
  }
  .article-byline {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    align-items: center;
    font-family: var(--kicker);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 11.5px;
    font-weight: 700;
    color: var(--text-secondary);
    padding: 14px 0;
    border-top: 1px solid var(--hair);
    border-bottom: 1px solid var(--hair);
    margin-bottom: 36px;
  }
  .article-byline .byline-author { color: var(--text); }
  .article-byline .byline-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--text-muted); }

  .tag-list { display: flex; flex-wrap: wrap; gap: 6px; margin: 28px 0 0; }
  .tag {
    display: inline-block;
    padding: 4px 10px;
    font-family: var(--kicker);
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--text-secondary);
    border: 1px solid var(--hair);
    background: transparent;
  }

  /* ---- Article body — serif reading column ----------------------- */
  .article-body {
    font-family: var(--serif);
    font-size: 19px;
    line-height: 1.7;
    color: var(--text);
    counter-reset: art-section;
  }
  .article-body p { margin: 0 0 22px; }
  .article-body > p:first-of-type::first-letter {
    font-family: var(--display);
    font-weight: 900;
    float: left;
    font-size: 5.4em;
    line-height: 0.88;
    padding: 6px 12px 0 0;
    margin: 4px 4px 0 0;
    color: var(--text);
    font-variation-settings: "opsz" 144;
  }
  .article-body h2 {
    font-family: var(--display);
    font-optical-sizing: auto;
    font-variation-settings: "opsz" 144;
    font-size: clamp(26px, 3vw, 34px);
    font-weight: 900;
    margin: 56px 0 18px;
    padding-top: 28px;
    line-height: 1.1;
    letter-spacing: -0.02em;
    border-top: 2px solid var(--border);
    position: relative;
  }
  .article-body h2::before {
    counter-increment: art-section;
    content: "§ " counter(art-section, decimal-leading-zero);
    display: block;
    font-family: var(--kicker);
    text-transform: uppercase;
    letter-spacing: 0.16em;
    font-size: 11px;
    font-weight: 700;
    color: var(--pop);
    margin-bottom: 10px;
  }
  .article-body h2 .anchor { color: inherit; text-decoration: none; }
  .article-body h2 .anchor:hover { color: var(--pop); }
  .article-body h3 {
    font-family: var(--display);
    font-style: italic;
    font-weight: 700;
    font-size: 22px;
    margin: 36px 0 12px;
    letter-spacing: -0.01em;
    color: var(--text);
  }
  .article-body ul, .article-body ol {
    margin: 0 0 24px 22px;
  }
  .article-body li { margin: 10px 0; padding-left: 4px; }
  .article-body ul li::marker { color: var(--pop); }
  .article-body ol li::marker { font-family: var(--kicker); font-weight: 700; color: var(--pop); }

  /* Pull quote */
  .article-body blockquote {
    margin: 36px 0;
    padding: 28px 28px 28px 32px;
    border-top: 2px solid var(--border);
    border-bottom: 2px solid var(--border);
    border-left: 6px solid var(--yellow);
    background: transparent;
    font-family: var(--display);
    font-style: italic;
    font-weight: 500;
    font-size: 24px;
    line-height: 1.35;
    color: var(--text);
    letter-spacing: -0.01em;
  }
  .article-body blockquote p { margin: 0; }
  .article-body blockquote cite {
    display: block;
    margin-top: 14px;
    font-family: var(--kicker);
    font-style: normal;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    font-size: 11px;
    font-weight: 700;
    color: var(--text-secondary);
  }
  .article-body code {
    background: var(--bg-subtle);
    border: 1px solid var(--hair);
    padding: 1px 6px;
    font-size: 0.88em;
    font-family: var(--mono);
  }

  /* Short-answer box — yellow tab + hairline rule */
  .answer-box {
    position: relative;
    background: var(--bg);
    border-top: 2px solid var(--border);
    border-bottom: 2px solid var(--border);
    padding: 22px 22px 20px;
    margin: 0 0 36px;
  }
  .answer-box .answer-label {
    display: inline-block;
    background: var(--yellow);
    color: var(--on-yellow);
    border: 1.5px solid #0a0a0a;
    padding: 4px 10px;
    font-family: var(--kicker);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    margin-bottom: 12px;
  }
  @media (prefers-color-scheme: dark) {
    .answer-box .answer-label { border-color: var(--yellow); background: #0a0a0a; color: var(--yellow); }
  }
  .answer-box p {
    margin: 0;
    font-family: var(--serif);
    font-size: 19px;
    line-height: 1.55;
    color: var(--text);
  }

  /* Callout — image-caption style hairline rule */
  .callout {
    display: block;
    background: transparent;
    border: none;
    border-left: 3px solid var(--pop);
    padding: 6px 0 6px 16px;
    margin: 28px 0;
    color: var(--text-secondary);
    font-family: var(--sans);
    font-size: 14px;
    line-height: 1.55;
    letter-spacing: 0.01em;
  }
  .callout strong {
    display: inline-block;
    margin-right: 8px;
    font-family: var(--kicker);
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: var(--pop);
  }

  /* FAQ */
  .faq {
    border-top: 2px solid var(--border);
    margin-top: 8px;
  }
  .faq-item {
    border-bottom: 1px solid var(--hair);
    padding: 18px 0;
  }
  .faq-item summary {
    cursor: pointer;
    font-family: var(--display);
    font-weight: 700;
    font-size: 19px;
    line-height: 1.3;
    list-style: none;
    position: relative;
    padding-right: 28px;
    color: var(--text);
    letter-spacing: -0.01em;
  }
  .faq-item summary::-webkit-details-marker { display: none; }
  .faq-item summary::after {
    content: '+';
    position: absolute;
    right: 0;
    top: -2px;
    font-family: var(--kicker);
    font-weight: 700;
    color: var(--pop);
    font-size: 22px;
    transition: transform 0.2s;
  }
  .faq-item[open] summary::after { content: '−'; }
  .faq-answer {
    padding-top: 12px;
    font-family: var(--serif);
    font-size: 17px;
    line-height: 1.65;
    color: var(--text-secondary);
  }

  /* Sources */
  .sources {
    margin-top: 56px;
    padding-top: 24px;
    border-top: 2px solid var(--border);
    font-family: var(--sans);
    font-size: 14px;
    color: var(--text-secondary);
  }
  .sources h3 {
    font-family: var(--kicker);
    font-size: 11.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: var(--pop);
    margin-bottom: 12px;
  }
  .sources ul { margin-left: 18px; }
  .sources li { margin: 6px 0; }

  /* ---- Article footer block: bordered grid (matches landing journal-notes) ---- */
  .article-footer {
    margin-top: 64px;
    padding-top: 32px;
    border-top: 2px solid var(--border);
  }
  .article-footer-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 24px;
    gap: 16px;
    flex-wrap: wrap;
  }
  .article-footer-title {
    font-family: var(--display);
    font-weight: 900;
    font-size: clamp(28px, 4vw, 42px);
    letter-spacing: -0.025em;
    line-height: 1.02;
    color: var(--text);
  }
  .article-footer-title em {
    font-style: italic;
    font-weight: 500;
    font-size: 0.55em;
    color: var(--pop);
    letter-spacing: -0.01em;
  }
  .article-footer-link {
    font-family: var(--kicker);
    text-transform: uppercase;
    letter-spacing: 0.14em;
    font-size: 12px;
    font-weight: 700;
    border-bottom: 2px solid var(--border);
    color: var(--text);
    text-decoration: none;
    padding-bottom: 2px;
  }
  .article-footer-link:hover { color: var(--pop); border-color: var(--pop); text-decoration: none; }
  .next-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0;
    border-top: 2px solid var(--border);
  }
  .next-card {
    display: block;
    border-bottom: 1px solid var(--border);
    border-right: 1px solid var(--border);
    background: var(--bg);
    padding: 28px 24px;
    text-decoration: none;
    color: inherit;
    transition: background 0.15s ease;
  }
  .next-card:last-child { border-right: none; }
  .next-card:hover { background: var(--yellow); text-decoration: none; }
  .next-card:hover, .next-card:hover * { color: var(--on-yellow); }
  .next-card-meta {
    font-family: var(--mono);
    text-transform: uppercase;
    letter-spacing: 0.14em;
    font-size: 10.5px;
    color: var(--pop);
    margin-bottom: 10px;
  }
  .next-card-title {
    font-family: var(--display);
    font-weight: 700;
    font-size: 22px;
    letter-spacing: -0.015em;
    line-height: 1.2;
    color: var(--text);
    margin-bottom: 8px;
  }
  .next-card-excerpt {
    font-family: var(--sans);
    font-size: 14.5px;
    line-height: 1.5;
    color: var(--text-secondary);
    margin-bottom: 14px;
  }
  .next-card-cta {
    font-family: var(--kicker);
    text-transform: uppercase;
    letter-spacing: 0.14em;
    font-size: 11.5px;
    font-weight: 700;
    color: var(--text);
  }

  /* CTA — editorial card */
  .article-cta {
    margin-top: 48px;
    padding: 32px 28px;
    border: 1.5px solid var(--border);
    background: var(--bg-elevated);
    box-shadow: 6px 6px 0 0 var(--yellow);
    text-align: left;
  }
  .article-cta-label {
    display: inline-block;
    font-family: var(--kicker);
    text-transform: uppercase;
    letter-spacing: 0.16em;
    font-size: 11px;
    font-weight: 700;
    color: var(--pop);
    margin-bottom: 10px;
  }
  .article-cta h3 {
    font-family: var(--display);
    font-weight: 900;
    font-size: 26px;
    letter-spacing: -0.02em;
    line-height: 1.1;
    margin-bottom: 10px;
    color: var(--text);
  }
  .article-cta p {
    font-family: var(--serif);
    color: var(--text-secondary);
    margin: 0 0 18px;
    font-size: 17px;
    line-height: 1.5;
  }
  .cta-btn {
    display: inline-block;
    background: var(--text);
    color: var(--bg);
    padding: 14px 24px;
    border: 1.5px solid var(--text);
    font-family: var(--kicker);
    font-weight: 700;
    font-size: 12.5px;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    text-decoration: none;
    transition: transform 0.12s ease, box-shadow 0.12s ease;
    box-shadow: 4px 4px 0 0 var(--text);
  }
  .cta-btn:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 0 var(--text); text-decoration: none; opacity: 1; }

  .site-footer {
    max-width: 1080px;
    margin: 0 auto;
    padding: 32px 24px 48px;
    text-align: center;
    color: var(--text-secondary);
    font-family: var(--kicker);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 11.5px;
    font-weight: 700;
    border-top: 2px solid var(--border);
  }
  .site-footer a { color: var(--text-secondary); text-decoration: none; }
  .site-footer a:hover { color: var(--text); }

  /* Journal index */
  .index-header { margin-bottom: 40px; }
  .index-eyebrow {
    display: inline-block;
    background: var(--yellow);
    color: var(--on-yellow);
    border: 1.5px solid #0a0a0a;
    padding: 5px 11px;
    font-family: var(--kicker);
    text-transform: uppercase;
    letter-spacing: 0.16em;
    font-size: 11.5px;
    font-weight: 700;
    box-shadow: 4px 4px 0 0 #0a0a0a;
    margin-bottom: 18px;
  }
  @media (prefers-color-scheme: dark) {
    .index-eyebrow { border-color: var(--yellow); box-shadow: 4px 4px 0 0 var(--yellow); background: #0a0a0a; color: var(--yellow); }
  }
  .index-title {
    font-family: var(--display);
    font-optical-sizing: auto;
    font-variation-settings: "opsz" 144;
    font-size: clamp(44px, 7vw, 80px);
    font-weight: 900;
    letter-spacing: -0.03em;
    line-height: 0.98;
    margin-bottom: 16px;
  }
  .index-subtitle {
    font-family: var(--display);
    font-style: italic;
    font-weight: 500;
    color: var(--text);
    opacity: 0.85;
    font-size: clamp(17px, 2vw, 22px);
    max-width: 48ch;
    line-height: 1.45;
  }
  .post-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 0;
    border-top: 2px solid var(--border);
    margin-top: 32px;
  }
  .post-card {
    display: block;
    border-bottom: 1px solid var(--border);
    border-right: 1px solid var(--border);
    background: var(--bg);
    text-decoration: none;
    color: inherit;
    transition: background 0.15s ease;
  }
  .post-card:hover { background: var(--yellow); text-decoration: none; }
  .post-card:hover, .post-card:hover * { color: var(--on-yellow); }
  .post-card-accent { display: none; }
  .post-card-body { padding: 28px 24px; }
  .post-card h2 {
    font-family: var(--display);
    font-size: 22px;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.015em;
    margin-bottom: 10px;
    color: var(--text);
  }
  .post-card p { font-family: var(--sans); font-size: 14.5px; color: var(--text-secondary); margin-bottom: 14px; line-height: 1.5; }
  .post-card-meta {
    font-family: var(--mono);
    text-transform: uppercase;
    letter-spacing: 0.14em;
    font-size: 10.5px;
    color: var(--pop);
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .post-card-meta .dot { width: 3px; height: 3px; border-radius: 50%; background: currentColor; opacity: 0.6; }
  @media (max-width: 720px) {
    .next-grid { grid-template-columns: 1fr; }
    .next-card { border-right: none; }
  }
  @media (max-width: 640px) {
    .container, .container-wide { padding: 32px 18px 64px; }
    .article-body { font-size: 17.5px; }
    .article-body > p:first-of-type::first-letter { font-size: 4.4em; }
    .article-byline { gap: 10px; font-size: 11px; }
    .article-cta { padding: 24px 20px; }
  }

  /* THEME CONSOLIDATION — journal uses the same mineral glass, ink, saffron signal,
     and rose action language as the landing page. */
  :root {
    --glass-bg:#eef2f0; --glass-ink:#182a2d; --glass-muted:#5d7071;
    --glass-line:rgba(24,42,45,.14); --glass-panel:rgba(255,255,255,.62);
    --glass-teal:#1d5960; --glass-coral:#e07a5f; --glass-signal:#d4a72c;
  }
  @media (prefers-color-scheme: dark) {
    :root { --glass-bg:#102124; --glass-ink:#edf4ef; --glass-muted:#afc1bc;
      --glass-line:rgba(237,244,239,.16); --glass-panel:rgba(28,52,55,.72);
      --glass-teal:#8bc8bd; --glass-coral:#ef987e; --glass-signal:#e6c45a; }
  }
  /* Consolidated text token: legacy --pop consumers are links, labels and
     markers, so they must be ink-safe. Rose remains available as glass-coral
     for borders and non-text emphasis. */
  :root { --pop: #1d5960; }
  @media (prefers-color-scheme: dark) { :root { --pop: #8bc8bd; } }
  html { background:radial-gradient(ellipse at 10% 0%,rgba(29,89,96,.13),transparent 34rem),radial-gradient(ellipse at 90% 16%,rgba(224,122,95,.10),transparent 30rem),var(--glass-bg); overflow-x:clip; }
  body { background:transparent; color:var(--glass-ink); overflow-x:clip; }
  body::before { content:""; position:fixed; inset:0; pointer-events:none; opacity:.12; background-image:radial-gradient(rgba(24,42,45,.5) .55px,transparent .55px); background-size:7px 7px; }
  .site-nav { width:calc(100% - 32px); max-width:1080px; margin:18px auto; padding:14px 20px; border:1px solid var(--glass-line); border-radius:999px; background:var(--glass-panel); box-shadow:0 14px 40px rgba(13,58,67,.1),0 1px 0 rgba(255,255,255,.7) inset; backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); overflow:hidden; }
  .site-nav .brand, .site-nav .nav-links a { color:var(--glass-ink); }
  .site-nav .brand { font-family:var(--display); }
  .container, .container-wide { position:relative; }
  .index-header, .article-kicker, .article-body, .article-footer, .post-grid, .article-cta { position:relative; }
  /* The journal hero shares the page surface instead of sitting inside a
     second rectangular glass panel. */
  .article-body { background:transparent; }
  .index-title, .article-title, .article-footer-title { color:var(--glass-ink); }
  .index-eyebrow, .article-kicker .kicker-cat { background:rgba(212,167,44,.18); border:1px solid rgba(212,167,44,.42); color:var(--glass-ink); box-shadow:none; border-radius:999px; }
  .post-grid, .next-grid { gap:14px; border:0; }
  .post-card, .next-card { border:1px solid var(--glass-line); border-radius:20px; background:var(--glass-panel); box-shadow:0 18px 48px rgba(13,58,67,.09),0 1px 0 rgba(255,255,255,.62) inset; overflow:hidden; transition:transform .3s ease, border-color .3s ease; }
  .post-card:hover, .next-card:hover { background:var(--glass-panel); transform:translateY(-5px); border-color:rgba(8,127,131,.45); }
  .post-card:hover *, .next-card:hover * { color:inherit; }
  .post-card-meta, .next-card-meta, .article-kicker .kicker-meta { color:var(--glass-teal); }
  .article-body h2 { border-top:1px solid var(--glass-line); }
  .article-body h2::before,.sources h3,.callout strong,.post-card-meta,.next-card-meta { color:var(--glass-coral); }
  .article-body blockquote, .answer-box, .callout, .article-cta { border-color:var(--glass-line); background:var(--glass-panel); border-radius:18px; box-shadow:0 18px 55px rgba(29,72,73,.10); }
  .article-body blockquote { border-left:4px solid var(--glass-coral); }
  .answer-box .answer-label { background:rgba(212,167,44,.18); color:var(--glass-ink); border:1px solid rgba(212,167,44,.42); box-shadow:none; border-radius:999px; }
  .article-cta { box-shadow:0 20px 56px rgba(13,58,67,.12),0 1px 0 rgba(255,255,255,.7) inset; }
  .cta-btn { background:var(--glass-teal); color:var(--glass-bg); border:0; border-radius:999px; box-shadow:0 10px 24px rgba(13,58,67,.18); min-height:48px; }
  /* Final audit: journal never falls back to editorial markers or offset shadows. */
  .article-kicker .kicker-cat, .index-eyebrow, .answer-box .answer-label {
    background:rgba(212,167,44,.18)!important; color:var(--glass-ink)!important;
    border:1px solid rgba(212,167,44,.42)!important; box-shadow:none!important;
    border-radius:999px!important;
  }
  .article-body blockquote { border-left:4px solid var(--glass-coral)!important; }
  .next-card:hover, .post-card:hover { background:var(--glass-panel)!important; color:inherit!important; }
  .next-card:hover *, .post-card:hover * { color:inherit!important; }
  .article-cta, .cta-btn { box-shadow:0 18px 55px rgba(29,72,73,.10)!important; }
  .cta-btn:hover { transform:translateY(-2px); box-shadow:0 18px 55px rgba(29,72,73,.16)!important; }
  /* Final article-internals sweep: all reading aids stay in the mineral system. */
  .article-body code { background:var(--glass-panel)!important; border-color:var(--glass-line)!important; }
  .article-body h2, .faq, .sources, .article-footer { border-color:var(--glass-line)!important; }
  .article-body h2::before, .sources h3, .callout strong,
  .post-card-meta, .next-card-meta { color:var(--glass-coral)!important; }
  .article-body blockquote { background:var(--glass-panel)!important; border-left-color:var(--glass-coral)!important; }
  .article-kicker .kicker-cat, .index-eyebrow, .answer-box .answer-label {
    background:color-mix(in srgb,var(--glass-signal) 18%,transparent)!important;
    border-color:color-mix(in srgb,var(--glass-signal) 42%,transparent)!important;
    color:var(--glass-ink)!important; box-shadow:none!important;
  }
  .article-cta, .post-card, .next-card { box-shadow:0 18px 55px rgba(29,72,73,.10)!important; }
  .tag { border-color:var(--glass-line); border-radius:999px; color:var(--glass-muted); }
  .site-footer { border-top:1px solid var(--glass-line); }
  /* Liquid Glass depth refinements for the journal */
  .post-card, .next-card {
    box-shadow:0 18px 48px rgba(13,58,67,.09), inset 0 1px 0 rgba(255,255,255,.64)!important;
    background: linear-gradient(180deg,rgba(255,255,255,.08) 0%,transparent 52%), var(--glass-panel)!important;
  }
  .post-card:hover, .next-card:hover {
    transform:translateY(-5px)!important;
    border-color:rgba(8,127,131,.5)!important;
    box-shadow:
      inset 0 1px 0 rgba(29,89,96,.26),
      0 22px 52px -12px rgba(13,89,96,.22)!important;
  }
  .article-cta {
    box-shadow:0 20px 56px rgba(13,58,67,.12), inset 0 1px 0 rgba(255,255,255,.64)!important;
    background: linear-gradient(180deg,rgba(255,255,255,.07) 0%,transparent 54%), var(--glass-panel)!important;
  }
  .article-body blockquote, .answer-box, .callout {
    box-shadow: inset 0 1px 0 rgba(255,255,255,.5)!important;
    background: linear-gradient(180deg,rgba(255,255,255,.06) 0%,transparent 52%), var(--glass-panel)!important;
  }
  .site-nav {
    box-shadow:0 14px 40px rgba(13,58,67,.1), inset 0 1px 0 rgba(255,255,255,.72)!important;
  }
  @media (prefers-reduced-motion:no-preference) {
    .post-card, .next-card { transition: transform .32s ease, box-shadow .32s ease, border-color .32s ease!important; }
  }
  @media (max-width:640px) {
    .container,.container-wide { padding:32px 16px 64px; }
    .site-nav { width:calc(100% - 32px); margin:12px 16px; padding-left:14px; padding-right:14px; }
    .site-nav .nav-links { gap:10px; }
    .post-grid,.next-grid { grid-template-columns:1fr; gap:12px; }
    .article-title { font-size:clamp(38px,12vw,58px); }
    .article-body { font-size:18px; }
    .article-cta { padding:24px 18px; }
  }
  @media (prefers-reduced-motion: reduce) {
    *,*::before,*::after { animation:none!important; transition:none!important; scroll-behavior:auto!important; }
  }
  /* Fluid journal rhythm: reading width and spacing adapt continuously. */
  :root {
    --j-space-1:clamp(8px,1vw,12px); --j-space-2:clamp(14px,2vw,24px);
    --j-space-3:clamp(24px,4vw,48px); --j-space-4:clamp(44px,8vw,96px);
    --j-body:clamp(17px,1.35vw,20px); --j-title:clamp(40px,8vw,82px);
  }
  .site-nav { width:min(calc(100% - 32px),1080px); margin-inline:auto; }
  .container,.container-wide { width:min(100%,1080px); padding:var(--j-space-4) clamp(16px,4vw,32px) var(--j-space-4); }
  .index-title { font-size:var(--j-title); }
  .index-header { margin-bottom:var(--j-space-3); }
  .post-grid,.next-grid { grid-template-columns:repeat(auto-fit,minmax(min(100%,270px),1fr)); gap:var(--j-space-2); }
  .post-card,.next-card { min-width:0; }
  .article-title { font-size:clamp(38px,7vw,72px); }
  .article-body { font-size:var(--j-body); line-height:1.7; }
  .article-body blockquote,.answer-box,.callout,.article-cta { margin-block:var(--j-space-3); padding:var(--j-space-2); }
  .article-footer { margin-top:var(--j-space-4); }
  @media (max-width:640px) {
    .site-nav { width:calc(100% - 24px); margin:12px auto; }
    .site-nav .nav-links { gap:8px; font-size:10px; }
    .container,.container-wide { padding-inline:16px; }
    .article-kicker { gap:8px; }
    .article-body h2 { margin-top:var(--j-space-3); }
    .article-body blockquote { font-size:clamp(20px,6vw,26px); }
    .next-grid,.post-grid { grid-template-columns:1fr; }
  }
`;

function shell({
  title,
  description,
  canonical,
  origin,
  ogImage,
  ogType,
  jsonLd,
  bodyClass,
  bodyInner,
}: {
  title: string;
  description: string;
  canonical: string;
  origin: string;
  ogImage: string;
  ogType: "website" | "article";
  jsonLd: string;
  bodyClass?: string;
  bodyInner: string;
}): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
<meta name="theme-color" content="#0a0a0a" />
<link rel="canonical" href="${esc(canonical)}" />
<link rel="icon" type="image/png" href="/assets/images/favicon.png" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:type" content="${ogType}" />
<meta property="og:url" content="${esc(canonical)}" />
<meta property="og:image" content="${esc(`${origin}${ogImage}`)}" />
<meta property="og:site_name" content="${esc(AUTHOR_NAME)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
<meta name="twitter:image" content="${esc(`${origin}${ogImage}`)}" />
<link rel="preload" as="font" type="font/woff2" href="/assets/fonts/inter-latin.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="/assets/fonts/fraunces-latin.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="/assets/fonts/archivo-narrow-latin.woff2" crossorigin>
${jsonLd}
<style>${STYLE}</style>
</head>
<body${bodyClass ? ` class="${esc(bodyClass)}"` : ""}>
  <nav class="site-nav">
    <a href="/" class="brand">${esc(AUTHOR_NAME)}</a>
    <div class="nav-links">
      <a href="/journal">Journal</a>
      <a href="/#pricing">Pricing</a>
      <a href="/#contact">Contact</a>
    </div>
  </nav>
  ${bodyInner}
  <footer class="site-footer">
    <div>&copy; 2026 ${esc(AUTHOR_NAME)} · <a href="/">Home</a> · <a href="/journal">Journal</a> · <a href="mailto:create@startappsstudio.com">create@startappsstudio.com</a></div>
  </footer>
</body>
</html>`;
}

export function renderArticleHtml(post: Post, origin: string): string {
  const canonical = `${origin}/journal/${post.slug}`;
  const articleJsonLd = renderArticleJsonLd(post, canonical, origin);
  const faqJsonLd = renderFaqJsonLd(post);
  const breadcrumbJsonLd = renderBreadcrumbJsonLd(post, canonical, origin);
  const jsonLd = `${articleJsonLd}${faqJsonLd}${breadcrumbJsonLd}`;

  const body = post.body.map(renderBlock).join("\n");
  const tags = post.tags
    .map((t) => `<span class="tag">${esc(t)}</span>`)
    .join("");
  const sources = post.sources?.length
    ? `<section class="sources"><h3>Sources</h3><ul>${post.sources
        .map(
          (s) =>
            `<li>${s.url ? `<a href="${esc(s.url)}" rel="nofollow noopener">${esc(s.label)}</a>` : esc(s.label)}</li>`,
        )
        .join("")}</ul></section>`
    : "";

  const category = post.category || "Journal";
  const deckSource = post.excerpt || post.description;

  const others = allPostsNewestFirst().filter((p) => p.slug !== post.slug).slice(0, 2);
  const nextCards = others
    .map((p) => {
      const cat = p.category || "Journal";
      return `
      <a href="/journal/${esc(p.slug)}" class="next-card">
        <div class="next-card-meta">${esc(cat)}</div>
        <h3 class="next-card-title">${esc(p.title)}</h3>
        <p class="next-card-excerpt">${esc(p.excerpt)}</p>
        <span class="next-card-cta">Read note &rarr;</span>
      </a>`;
    })
    .join("");
  const nextBlock = others.length
    ? `
      <section class="article-footer">
        <div class="article-footer-header">
          <h2 class="article-footer-title">Keep reading <em>· from the journal</em></h2>
          <a href="/journal" class="article-footer-link">All notes &rarr;</a>
        </div>
        <div class="next-grid">${nextCards}</div>
      </section>`
    : "";

  const bodyInner = `
  <main class="container">
    <div class="crumb"><a href="/journal">&larr; Journal</a></div>
    <article>
      <div class="article-kicker">
        <span class="kicker-cat">${esc(category)}</span>
        <span class="kicker-sep">·</span>
        <span class="kicker-meta">${post.readMinutes} min read</span>
      </div>
      <h1 class="article-title">${esc(post.title)}</h1>
      ${deckSource ? `<p class="article-deck">${esc(deckSource)}</p>` : ""}
      <div class="article-byline">
        <span class="byline-author">By ${esc(AUTHOR_NAME)}</span>
      </div>
      <div class="article-body">${body}</div>
      <div class="tag-list">${tags}</div>
      ${sources}
      <section class="article-cta">
        <span class="article-cta-label">The Studio</span>
        <h3>Need the version built for you?</h3>
        <p>We ship MVPs that are indexed, GEO-ready, and revenue-tied from day one.</p>
        <a href="/#contact" class="cta-btn">Start a project &rarr;</a>
      </section>
      ${nextBlock}
    </article>
  </main>`;

  const resolvedTitle = post.seoTitle || `${post.title} | Start Apps Studio`;
  const resolvedDescription = post.seoDescription || post.description;
  if (resolvedTitle.length > 65) {
    console.warn(
      `[SEO] "${post.slug}" seoTitle is ${resolvedTitle.length} chars (target ≤65): "${resolvedTitle}"`
    );
  }
  if (resolvedDescription.length > 160) {
    console.warn(
      `[SEO] "${post.slug}" seoDescription is ${resolvedDescription.length} chars (target ≤160): "${resolvedDescription}"`
    );
  }

  return shell({
    title: resolvedTitle,
    description: resolvedDescription,
    canonical,
    origin,
    ogImage: "/assets/images/og-journal-default.png",
    ogType: "article",
    jsonLd,
    bodyInner,
  });
}

export function renderIndexHtml(origin: string): string {
  const postsList = allPostsNewestFirst();
  const canonical = `${origin}/journal`;
  const jsonLd = `<script type="application/ld+json">${safeJson({
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${AUTHOR_NAME} Journal`,
    url: canonical,
    description:
      "Field notes on shipping MVPs that rank in Google and get quoted by AI.",
    blogPost: postsList.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${origin}/journal/${p.slug}`,
      datePublished: p.publishedAt,
      description: p.description,
    })),
  })}</script>`;

  const cards = postsList
    .map(
      (p) => `
    <a href="/journal/${esc(p.slug)}" class="post-card">
      <div class="post-card-accent" style="background:${accentColor(p.slug)}"></div>
      <div class="post-card-body">
        <h2>${esc(p.title)}</h2>
        <p>${esc(p.excerpt)}</p>
        <div class="post-card-meta">
          <span>${p.readMinutes} min read</span>
        </div>
      </div>
    </a>`,
    )
    .join("");

  const bodyInner = `
  <main class="container-wide">
    <header class="index-header">
      <span class="index-eyebrow">The Journal · Vol. I</span>
      <h1 class="index-title">Field notes from the studio.</h1>
      <p class="index-subtitle">Dispatches on shipping MVPs that rank on Google and get quoted by AI: GEO, vibe-coding, and the state of AI at work.</p>
    </header>
    <div class="post-grid">${cards}</div>
  </main>`;

  return shell({
    title: `MVP SEO & GEO Journal | ${AUTHOR_NAME}`,
    description:
      "Field notes on shipping MVPs that rank on Google and get quoted by AI: GEO, vibe-coding, and the state of AI at work.",
    canonical,
    origin,
    ogImage: "/assets/images/og-journal-default.png",
    ogType: "website",
    jsonLd,
    bodyInner,
  });
}

export function renderSitemapXml(origin: string): string {
  const urls: { loc: string; lastmod?: string; priority?: string }[] = [
    { loc: `${origin}/`, lastmod: HOMEPAGE_LAST_MODIFIED, priority: "1.0" },
    // Localized landing pages (Journal remains English-only for now).
    ...PREFIXED_CODES.map((code) => ({
      loc: `${origin}/${code}`,
      lastmod: HOMEPAGE_LAST_MODIFIED,
      priority: "0.9",
    })),
    { loc: `${origin}/journal`, priority: "0.8" },
  ];
  for (const p of allPostsNewestFirst()) {
    urls.push({
      loc: `${origin}/journal/${p.slug}`,
      lastmod: p.updatedAt || p.publishedAt,
      priority: "0.7",
    });
  }
  const body = urls
    .map(
      (u) =>
        `  <url><loc>${esc(u.loc)}</loc>${u.lastmod ? `<lastmod>${esc(u.lastmod)}</lastmod>` : ""}${u.priority ? `<priority>${u.priority}</priority>` : ""}</url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;
}

export function renderRobotsTxt(origin: string): string {
  // Major AI / search crawlers we explicitly welcome.
  const aiBots = [
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "ClaudeBot",
    "anthropic-ai",
    "Claude-Web",
    "PerplexityBot",
    "Perplexity-User",
    "Google-Extended",
    "Applebot-Extended",
    "Bytespider",
    "CCBot",
    "Amazonbot",
    "DuckAssistBot",
    "MistralAI-User",
    "cohere-ai",
  ];
  const aiBlocks = aiBots
    .map((ua) => `User-agent: ${ua}\nAllow: /`)
    .join("\n\n");
  return `# Start Apps Studio — robots.txt
# We explicitly welcome AI crawlers so model overviews stay accurate.

User-agent: *
Allow: /
Allow: /journal
Allow: /journal/
Disallow: /api/
Disallow: /admin/

${aiBlocks}

Sitemap: ${origin}/sitemap.xml
`;
}

export function renderLlmsTxt(origin: string): string {
  return `# Start Apps Studio

> A strategy-first product studio building mockups, prototypes, and shippable MVPs for early-stage founders. From $1,399 mockups to full apps in 3 to 8 weeks.

We are a small team augmented by the best AI models available (Claude Opus 5 & Fable 5, Gemini 2.5 Pro, GPT-5.6 Sol, and Llama 4), so we ship at the pace of a much larger studio. Founders work directly with the people building their product.

## Services

- Mockups: polished, founder-ready visual mockups of your product idea
- Prototypes: clickable, end-to-end prototype of the core flow, ready to demo
- MVPs: real, shippable MVPs delivered in 3 to 8 weeks for iOS, Android, or web
- Custom-Scale: handcrafted multi-platform builds for funded teams ready to scale

## Pricing

- Mockup: $1,399, fixed price
- Prototype: $4,799, fixed price
- MVP: $9,000 to $19,000, fixed price
- Custom-Scale: $30,000+, custom quote

All packages are fixed-price. Timeline is 3 to 8 weeks for MVP-tier and below.

## Toolkit

- Reasoning & Code: Claude Opus 5 & Fable 5, Gemini 2.5 Pro, GPT-5.6 Sol, Llama 4
- Mockups & Prototyping: Figma, Replit, Lovable, Rork
- Production & Delivery: Webflow, WordPress, GitHub, Swift (iOS), Kotlin and Compose UI (Android), n8n, Make, custom webhooks
- Content & Media: ElevenLabs, Seedance 2.0

## Contact

- Website: ${origin}/
- Email: create@startappsstudio.com
- Inquiry form: ${origin}/#contact

## Key URLs

- [Homepage](${origin}/)
- [Journal](${origin}/journal)
- [Sitemap](${origin}/sitemap.xml)
- [Full overview for LLMs](${origin}/llms-full.txt)
`;
}

export function renderLlmsFullTxt(origin: string): string {
  const toolkitAsOf = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  return `# Start Apps Studio: Full Overview

## Who we are

Start Apps Studio is an AI-native product studio for early-stage founders. We design mockups, build clickable prototypes, and ship real MVPs in 3 to 8 weeks. Our small team is paired with multiple frontier AI models that act as a second set of eyes, brainstorming alternatives, stress-testing flows, and quietly playing tester and QA before any work reaches you.

## Who we serve

- First-time founders who need a real product before raising
- Funded teams who want a small studio to ship faster than their internal team can
- Operators with a market and customers who need their idea expressed as a working product
- Indie makers who want a polished mockup or prototype before committing to a full build

## How we work

1. You share the idea and your audience.
2. We propose the smallest fixed-price package that proves the core hypothesis.
3. We ship in weeks, not months. You can see daily progress on GitHub if you want it.
4. Every build is paired with multiple AI models that critique each other's output, flag weak flows, and spot edge cases before you do.

## Packages

### Mockup: $1,399, fixed
Polished visual mockups of your product idea. Use them to talk to users, raise pre-seed, or decide whether to commit to a real build.

### Prototype: $4,799, fixed
A clickable, end-to-end prototype of your core flow. Real navigation, realistic data, demo-ready in 5 to 10 days.

### MVP: $9,000 to $19,000, fixed
A real, shippable MVP. iOS, Android, or web. 3 to 8 weeks from kickoff to launch. Your product is in the App Store, Play Store, or live on the web by the end.

### Custom-Scale: $30,000+
Handcrafted multi-platform builds for funded teams ready to scale. Quoted per engagement.

## Toolkit (current as of ${toolkitAsOf})

We swap in new model versions the week they ship.

**Reasoning & Code**
- Claude Opus 5 & Fable 5: primary builder
- Gemini 2.5 Pro: long-context review
- GPT-5.6 Sol: creative & copy
- Llama 4: self-hosted fallback

**Mockups & Prototyping**
- Figma: design system + Dev Mode
- Replit: React hybrid builds
- Lovable: rapid mockups
- Rork: iOS & Android prototypes

**Production & Delivery**
- Webflow: marketing site builds
- WordPress: content sites & blogs
- GitHub: daily updates + version control
- Swift: native iOS apps
- Kotlin and Compose UI: native Android apps
- Automation: n8n + Make + custom webhooks

**Content & Media**
- ElevenLabs: voiceover & speech
- Seedance 2.0: video & image gen

## What makes us different

- **Fixed price.** No hourly billing surprises. You know what every package costs before kickoff.
- **3 to 8 weeks.** We bias toward shipping. If a feature can't be shipped in that window, it gets descoped or split into a follow-up.
- **AI-native, not AI-only.** Real humans own every decision; AI accelerates the work and reviews it.
- **Daily updates.** GitHub commits and short async messages keep you in the loop without endless meetings.

## Contact

- Email: create@startappsstudio.com
- Inquiry form: ${origin}/#contact
- Website: ${origin}/
- Journal: ${origin}/journal

## Source links

- Homepage: ${origin}/
- Journal index: ${origin}/journal
- Sitemap: ${origin}/sitemap.xml
- Robots: ${origin}/robots.txt
- LLM overview (this file): ${origin}/llms-full.txt
- LLM short overview: ${origin}/llms.txt
`;
}
