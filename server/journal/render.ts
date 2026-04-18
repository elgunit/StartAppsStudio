import type { Block, Post } from "./posts";
import { AUTHOR_NAME, allPostsNewestFirst } from "./posts";

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
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
  "#06b6d4",
  "#8b5cf6",
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

function renderArticleJsonLd(post: Post, canonical: string, origin: string): string {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    image: [`${origin}/assets/images/favicon.png`],
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

function formatDate(iso: string): string {
  try {
    const d = new Date(iso + "T00:00:00Z");
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return iso;
  }
}

const STYLE = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #ffffff;
    --bg-elevated: #f9fafb;
    --bg-subtle: #f3f4f6;
    --text: #0a0a0a;
    --text-secondary: #6b7280;
    --text-muted: #9ca3af;
    --border: #e5e7eb;
    --accent: #0a0a0a;
    --link: #4f46e5;
    --success: #16a34a;
    --callout-bg: rgba(139, 92, 246, 0.06);
    --callout-border: rgba(139, 92, 246, 0.25);
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #0a0a0a;
      --bg-elevated: #18181b;
      --bg-subtle: #111114;
      --text: #fafafa;
      --text-secondary: #a1a1aa;
      --text-muted: #6b7280;
      --border: #27272a;
      --accent: #fafafa;
      --link: #a78bfa;
      --success: #22c55e;
      --callout-bg: rgba(139, 92, 246, 0.1);
      --callout-border: rgba(139, 92, 246, 0.35);
    }
  }
  html { -webkit-text-size-adjust: 100%; }
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.65;
    min-height: 100vh;
    font-size: 16px;
  }
  a { color: var(--link); text-decoration: none; }
  a:hover { text-decoration: underline; }
  img { max-width: 100%; height: auto; display: block; }
  .site-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    max-width: 1080px;
    margin: 0 auto;
    border-bottom: 1px solid var(--border);
  }
  .site-nav .brand {
    font-weight: 700;
    font-size: 16px;
    color: var(--text);
  }
  .site-nav .nav-links {
    display: flex;
    gap: 24px;
    font-size: 14px;
    color: var(--text-secondary);
  }
  .site-nav .nav-links a { color: var(--text-secondary); }
  .site-nav .nav-links a:hover { color: var(--text); text-decoration: none; }
  .container { max-width: 720px; margin: 0 auto; padding: 48px 24px 80px; }
  .container-wide { max-width: 1080px; margin: 0 auto; padding: 48px 24px 80px; }
  .crumb {
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 16px;
  }
  .crumb a { color: var(--text-secondary); }
  .crumb a:hover { color: var(--text); }
  .article-title {
    font-size: 40px;
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -0.02em;
    margin-bottom: 16px;
  }
  .article-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    color: var(--text-secondary);
    font-size: 14px;
    margin-bottom: 32px;
  }
  .tag-list { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; margin-bottom: 24px; }
  .tag {
    display: inline-block;
    padding: 2px 10px;
    font-size: 12px;
    border-radius: 999px;
    background: var(--bg-subtle);
    color: var(--text-secondary);
    border: 1px solid var(--border);
  }
  .article-body { font-size: 17px; color: var(--text); }
  .article-body p { margin: 0 0 18px; }
  .article-body h2 {
    font-size: 26px;
    font-weight: 700;
    margin: 44px 0 14px;
    line-height: 1.25;
    letter-spacing: -0.01em;
  }
  .article-body h2 .anchor { color: inherit; text-decoration: none; }
  .article-body h3 {
    font-size: 19px;
    font-weight: 700;
    margin: 28px 0 10px;
  }
  .article-body ul, .article-body ol {
    margin: 0 0 20px 20px;
  }
  .article-body li { margin: 8px 0; }
  .article-body blockquote {
    margin: 20px 0;
    padding: 12px 18px;
    border-left: 3px solid var(--border);
    color: var(--text-secondary);
    font-style: italic;
  }
  .article-body blockquote cite { display: block; margin-top: 8px; font-size: 14px; font-style: normal; }
  .article-body code {
    background: var(--bg-subtle);
    border: 1px solid var(--border);
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 14px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  }
  .answer-box {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-left: 3px solid var(--link);
    border-radius: 10px;
    padding: 16px 18px;
    margin: 0 0 28px;
  }
  .answer-box .answer-label {
    display: inline-block;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--link);
    margin-bottom: 6px;
  }
  .answer-box p { margin: 0; }
  .callout {
    display: block;
    background: var(--callout-bg);
    border: 1px solid var(--callout-border);
    border-radius: 10px;
    padding: 14px 18px;
    margin: 24px 0;
    color: var(--text);
  }
  .callout strong { margin-right: 6px; }
  .faq {
    border-top: 1px solid var(--border);
    margin-top: 8px;
  }
  .faq-item {
    border-bottom: 1px solid var(--border);
    padding: 14px 0;
  }
  .faq-item summary {
    cursor: pointer;
    font-weight: 600;
    font-size: 16px;
    list-style: none;
    position: relative;
    padding-right: 24px;
  }
  .faq-item summary::-webkit-details-marker { display: none; }
  .faq-item summary::after {
    content: '+';
    position: absolute;
    right: 0;
    top: 0;
    font-weight: 400;
    color: var(--text-secondary);
    font-size: 20px;
    transition: transform 0.2s;
  }
  .faq-item[open] summary::after { content: '−'; }
  .faq-answer { padding-top: 10px; color: var(--text-secondary); }
  .sources {
    margin-top: 48px;
    padding-top: 24px;
    border-top: 1px solid var(--border);
    font-size: 14px;
    color: var(--text-secondary);
  }
  .sources h3 { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); margin-bottom: 10px; }
  .sources ul { margin-left: 18px; }
  .article-cta {
    margin-top: 48px;
    padding: 28px 24px;
    border: 1px solid var(--border);
    border-radius: 14px;
    background: var(--bg-elevated);
    text-align: center;
  }
  .article-cta h3 { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
  .article-cta p { color: var(--text-secondary); margin: 0 0 16px; }
  .cta-btn {
    display: inline-block;
    background: var(--accent);
    color: var(--bg);
    padding: 12px 22px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 15px;
  }
  .cta-btn:hover { opacity: 0.9; text-decoration: none; }
  .site-footer {
    max-width: 1080px;
    margin: 0 auto;
    padding: 32px 24px 48px;
    text-align: center;
    color: var(--text-secondary);
    font-size: 13px;
    border-top: 1px solid var(--border);
  }
  .site-footer a { color: var(--text-secondary); }
  /* Journal index */
  .index-header { margin-bottom: 40px; text-align: center; }
  .index-title {
    font-size: 44px;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin-bottom: 12px;
  }
  .index-subtitle {
    color: var(--text-secondary);
    font-size: 17px;
    max-width: 620px;
    margin: 0 auto;
  }
  .post-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
  }
  .post-card {
    display: block;
    border: 1px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
    background: var(--bg);
    transition: transform 0.15s, border-color 0.15s;
  }
  .post-card:hover {
    transform: translateY(-2px);
    border-color: var(--text-secondary);
    text-decoration: none;
  }
  .post-card-accent { height: 4px; width: 100%; }
  .post-card-body { padding: 18px 20px 22px; }
  .post-card h2 {
    font-size: 19px;
    font-weight: 700;
    line-height: 1.3;
    margin-bottom: 8px;
    color: var(--text);
  }
  .post-card p { font-size: 14.5px; color: var(--text-secondary); margin-bottom: 14px; }
  .post-card-meta { font-size: 12.5px; color: var(--text-muted); display: flex; gap: 8px; align-items: center; }
  .post-card-meta .dot { width: 3px; height: 3px; border-radius: 50%; background: var(--border); }
  @media (max-width: 640px) {
    .article-title { font-size: 30px; }
    .index-title { font-size: 34px; }
    .container, .container-wide { padding: 32px 18px 64px; }
    .article-body { font-size: 16px; }
    .article-body h2 { font-size: 22px; }
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
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
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
  const jsonLd = `${articleJsonLd}${faqJsonLd}`;

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

  const bodyInner = `
  <main class="container">
    <div class="crumb"><a href="/journal">← Journal</a></div>
    <article>
      <h1 class="article-title">${esc(post.title)}</h1>
      <div class="article-meta">
        <span>${esc(AUTHOR_NAME)}</span>
        <span>·</span>
        <time datetime="${esc(post.publishedAt)}">${esc(formatDate(post.publishedAt))}</time>
        <span>·</span>
        <span>${post.readMinutes} min read</span>
      </div>
      <div class="tag-list">${tags}</div>
      <div class="article-body">${body}</div>
      ${sources}
      <section class="article-cta">
        <h3>Need the version built for you?</h3>
        <p>We ship MVPs that are indexed, GEO-ready and revenue-tied from day one.</p>
        <a href="/#contact" class="cta-btn">Start a project</a>
      </section>
    </article>
  </main>`;

  return shell({
    title: `${post.title} · ${AUTHOR_NAME} Journal`,
    description: post.description,
    canonical,
    origin,
    ogImage: "/assets/images/favicon.png",
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
          <time datetime="${esc(p.publishedAt)}">${esc(formatDate(p.publishedAt))}</time>
          <span class="dot"></span>
          <span>${p.readMinutes} min read</span>
        </div>
      </div>
    </a>`,
    )
    .join("");

  const bodyInner = `
  <main class="container-wide">
    <header class="index-header">
      <h1 class="index-title">Journal</h1>
      <p class="index-subtitle">Field notes on shipping MVPs that rank on Google and get quoted by AI. New posts every few weeks.</p>
    </header>
    <div class="post-grid">${cards}</div>
  </main>`;

  return shell({
    title: `Journal · ${AUTHOR_NAME}`,
    description:
      "Field notes on shipping MVPs that rank on Google and get quoted by AI — GEO, vibe-coding, and the state of AI at work.",
    canonical,
    origin,
    ogImage: "/assets/images/favicon.png",
    ogType: "website",
    jsonLd,
    bodyInner,
  });
}

export function renderSitemapXml(origin: string): string {
  const urls: { loc: string; lastmod?: string; priority?: string }[] = [
    { loc: `${origin}/`, priority: "1.0" },
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
  return `User-agent: *
Allow: /
Allow: /journal
Allow: /journal/

Sitemap: ${origin}/sitemap.xml
`;
}
