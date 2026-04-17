# Journal Publishing Backlog

The Journal compounds for SEO and GEO only when new posts ship on a steady
cadence. This file is the working backlog: pull the next item off the top,
write it as a typed `Post` in `server/journal/posts.ts`, and ship. Posts
are text-only — no hero images or inline screenshots.

## Cadence

- One post every **2–4 weeks**. Aim for the shorter end (2 weeks) when the
  pipeline is healthy; never let it slip past 4.
- Refresh `updatedAt` on stats-heavy or tools-heavy posts whenever the
  underlying numbers or product details drift (review quarterly).
- Each new post automatically adds a `<url>` entry with `<lastmod>` to
  `/sitemap.xml` via `renderSitemapXml` — no extra wiring needed.

## How to add a post

1. Add a new entry to the `posts` array in `server/journal/posts.ts`.
2. Required fields: `slug`, `title`, `description`, `excerpt`,
   `publishedAt` (ISO date), `readMinutes`, `tags`, `body`.
3. Optional: `updatedAt` (set on republish), `sources`.
4. Reuse existing block types in `render.ts`. Only edit the renderer if a
   genuinely new block type is needed. Posts are text-only — there is no
   `image` block type.

## Drift-prone posts (review quarterly)

Set or bump `updatedAt` on these whenever the underlying content shifts:

- `ai-at-work-2026-what-it-means-for-founders` — stats-heavy (exposure
  percentages, HubSpot 2026 figures).
- `vibe-coded-apps-have-an-seo-problem` — tools and ecosystem (Lovable,
  Claude Code, Supabase, Vercel UIs change often).
- `make-your-brand-visible-in-chatgpt` — references "current-year" context
  and AI discovery share; refresh annually at minimum.

---

## Backlog (next up at the top)

### 1. The AI Overviews citation playbook for MVPs — SHIPPED 2026-04-17
- **Target keyword:** "how to get cited in google ai overviews"
- **Brief:** Concrete patterns we see in pages that get pulled into AIO:
  one-sentence answers, FAQPage schema, table-formatted comparisons, named
  entities in the first 100 words. Walk through three real before/after
  examples from Start Apps Studio MVPs.
- **Slug:** `ai-overviews-citation-playbook-for-mvps`

### 2. Schema.org cheatsheet: the 6 JSON-LD blocks every MVP needs
- **Target keyword:** "json-ld schema for startup landing page"
- **Brief:** Copy-pasteable JSON-LD for `Organization`, `WebSite`,
  `SoftwareApplication`, `FAQPage`, `Article`, and `BreadcrumbList`. Show
  what each one unlocks (sitelinks, rich results, AI extraction).

### 3. Lovable vs Bolt vs v0: which vibe-coding tool ranks (and which doesn't)
- **Target keyword:** "lovable vs bolt vs v0 seo"
- **Brief:** Side-by-side audit of what each tool ships to crawlers
  (initial HTML, schema, meta, sitemap). Includes the SSR-proxy fix from
  the Lovable post, applied to each.

### 4. From "MVP shipped" to "first 100 organic visitors" — the 14-day plan
- **Target keyword:** "how to get first organic traffic for new saas"
- **Brief:** A two-week post-launch checklist: indexing, sitemap submission,
  three pillar pages, three comparison pages, one Reddit/HN seed, one
  Product Hunt launch. With acceptance criteria for each step.

### 5. The comparison-page template that earns LLM citations
- **Target keyword:** "x vs y comparison page template"
- **Brief:** The exact section structure (TL;DR table, who-each-is-for,
  pricing, deal-breakers, recommendation) that LLMs prefer to quote. With
  a downloadable template and a worked example.

### 6. Speed budget for an MVP landing page in 2026
- **Target keyword:** "landing page performance budget 2026"
- **Brief:** Real Core Web Vitals targets for a single-page MVP in 2026
  (LCP, INP, CLS), the cheapest ways to hit them on Vercel/Cloudflare,
  and how performance feeds GEO (faster pages get re-crawled more often).

### 7. How to write product copy that ChatGPT will quote verbatim
- **Target keyword:** "write content for chatgpt to cite"
- **Brief:** The five micro-patterns we see quoted: definition sentences,
  numbered lists, "X is Y because Z" causal statements, comparative claims
  with named alternatives, and dated stats. With before/after rewrites.

### 8. The internal linking graph that doubled our MVP's topical authority
- **Target keyword:** "internal linking strategy for small site"
- **Brief:** Hub-and-spoke vs cluster vs mesh. Show the actual graph from
  one of our MVPs before and after a 30-link refactor, with traffic delta.

### 9. Stretch: A founder's guide to GPTBot, ClaudeBot and PerplexityBot
- **Target keyword:** "should i allow gptbot in robots.txt"
- **Brief:** What each AI crawler does, how often it visits, what it
  caches, and the pros/cons of allowing/blocking each in `robots.txt`. With
  recommended defaults for marketing sites vs proprietary apps.

### 10. Stretch: From three articles to thirty — scaling the Journal without
losing E-E-A-T
- **Target keyword:** "scale blog without losing quality"
- **Brief:** The editorial process we use at Start Apps Studio: outline
  template, source bar, fact-check pass, schema pass, internal-link pass.
  How to keep one-author voice while shipping every two weeks.
