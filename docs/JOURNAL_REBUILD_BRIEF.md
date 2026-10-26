# Start Apps Studio Journal — Content & Rebuild Brief

This is the Journal-only handoff: its purpose, index and article-page structure, current article inventory, localization, editorial rules, and implementation source. The article excerpts below are the current index summaries; the complete article bodies remain in the source files listed at the end.

## Purpose and editorial position

The Journal is Start Apps Studio’s editorial publication for founders making product and growth decisions. It covers MVP strategy, product design and delivery, SEO/GEO, AI-assisted work, and technology choices.

- **Index heading:** “Field notes from the studio.”
- **Current introduction:** “Dispatches on shipping MVPs that rank on Google and get quoted by AI: GEO, vibe-coding, and the state of AI at work.”
- **Voice:** Practical, direct, and specific. Lead with the useful answer; explain the trade-offs and cite sources where appropriate.
- **Role in the site:** Build trust and help readers make better product decisions, with a clear route back to Resources or a project conversation.
- **Not a news feed:** The index should read as a considered editorial collection, not a chronological news ticker or a generic blog template.

## Public routes and localization

- `/journal` — English Journal index.
- `/journal/:slug` — English article.
- `/:locale/journal` and `/:locale/journal/:slug` — localized index and articles.
- The current site supports English plus Azerbaijani, Turkish, Russian, Simplified Chinese, French, Spanish, German, Ukrainian, Italian, and Korean.
- The pages are server-rendered. Preserve localized titles, excerpts, article copy, canonical URLs, language alternates, and structured metadata.

## Journal index

Each article card carries:

- Category
- Reading time
- Title
- Short excerpt
- Link to the article

The index is ordered newest first. Publication dates are retained as metadata for sorting, search, and structured data, but are not displayed in the reader-facing index or article UI.

### Current article inventory

1. **Base44 vs. Lovable: which one is right for your next app?**
   - Slug: `base44-vs-lovable-which-one-for-your-next-app`
   - Category: Field Notes · 8 min read · Published September 15, 2026
   - Excerpt: “Base44 and Lovable can both get an idea moving quickly. The important difference appears later, when your app needs custom auth, search visibility, or a clean handoff.”

2. **The MVP brief is your first product decision**
   - Slug: `the-mvp-brief-is-your-first-product-decision`
   - Category: Field Notes · 6 min read · Published August 12, 2026
   - Excerpt: “The best MVP briefs are not long. They decide who the product is for, what version one refuses to do, and what evidence earns the next week of work.”

3. **How to make your brand visible in ChatGPT and AI answers**
   - Slug: `make-your-brand-visible-in-chatgpt`
   - Category: Playbook · 7 min read · Published July 24, 2026
   - Excerpt: “If ChatGPT never names your product when someone asks for a recommendation, your site is failing 12 specific tests. Here's the checklist we run on every MVP we ship.”

4. **Vibe-coded apps have an SEO problem. Here's how to fix it**
   - Slug: `vibe-coded-apps-have-an-seo-problem`
   - Category: Field Notes · 9 min read · Published June 6, 2026
   - Excerpt: “Lovable builds ship in hours and are invisible to Google in seconds. Two ways to fix it: a Cloudflare Worker proxy for a quick win, and a full migration pattern when you're serious about ranking.”

5. **Backlinks still decide who gets recommended in 2026**
   - Slug: `backlinks-still-decide-who-gets-recommended`
   - Category: Playbook · 6 min read · Published May 26, 2026
   - Excerpt: “Schema and answer-first writing get you eligible to be cited. Backlinks are what tip a brand-new MVP from eligible to actually recommended.”

6. **The AI Overviews citation playbook for MVPs**
   - Slug: `ai-overviews-citation-playbook-for-mvps`
   - Category: Playbook · 6 min read · Published April 17, 2026
   - Excerpt: “Most MVPs wait months to be cited in Google's AI Overviews. The pages that get pulled in early all do the same five things, and none of them are luck.”

7. **Designing for the AI-native era: generative UI and building for agents**
   - Slug: `designing-for-the-ai-native-era`
   - Category: Essay · 7 min read · Published March 9, 2026
   - Excerpt: “Replacing your dashboard with a chat bar is a downgrade. The real shift is to interfaces that get generated on the fly for the task at hand, and to backends that an agent can drive without ever touching your UI.”

8. **AI at work in 2026: what the exposure data means for founders**
   - Slug: `ai-at-work-2026-what-it-means-for-founders`
   - Category: Research · 8 min read · Published February 22, 2026
   - Excerpt: “The gap between what AI can do and what workers actually use it for is now the biggest arbitrage of the decade. Here's how to read the 2026 data as a founder.”

9. **Your design system matters more in the AI era, not less**
   - Slug: `design-systems-matter-more-in-the-ai-era`
   - Category: Essay · 6 min read · Published January 13, 2026
   - Excerpt: “If AI is going to generate your screens, the ceiling on what it can produce is your design system. A weak system means weak output, every time. Here is what changes.”

## Article page structure

An article page includes:

1. Category and reading time.
2. Article title, excerpt/deck, and author.
3. A concise, answer-first summary when the article has one.
4. The article body, preserving its authored hierarchy and block order.
5. Tags and source links when present.
6. A relevant Start Apps Studio CTA.
7. Two related article links.

The current content model supports these body blocks: paragraph, H2, H3, short answer, unordered list, ordered list, quotation, callout, and FAQ. Preserve article-specific headings, quotes, examples, lists, and source references when migrating; do not flatten every article into uniform paragraphs.

## Resources cross-link

The Resources page features six Journal posts in this order:

1. `base44-vs-lovable-which-one-for-your-next-app`
2. `the-mvp-brief-is-your-first-product-decision`
3. `make-your-brand-visible-in-chatgpt`
4. `vibe-coded-apps-have-an-seo-problem`
5. `backlinks-still-decide-who-gets-recommended`
6. `ai-overviews-citation-playbook-for-mvps`

The homepage also has a Journal preview in its template, but it is currently hidden or inactive in the default page state. Decide deliberately whether to surface it in a rebuild.

## Editorial and design rules

- Publish about one article per month, with publication days varied across the month.
- Keep publication dates in metadata, but do not show dates in the reader-facing Journal or article UI.
- Keep category and reading time visible so readers can scan the collection.
- Use a distinct visual treatment for editorial pages while maintaining the site’s deep-teal, warm-paper, and editorial-type system.
- Keep the Journal focused on practical decisions and readable long-form content; do not turn it into a news feed.
- For comparisons, explain the fit and trade-offs for different readers. Avoid unsupported or adversarial claims.
- Preserve sources and citations, and re-check time-sensitive AI, SEO, and platform claims before republishing.

## Source of truth

- Article metadata and full article bodies: `server/journal/posts.ts`
- Journal index copy, Resources cross-links, and localized editorial content: `server/journal/editorial.ts` and `server/journal/locales/`
- Journal and article rendering, routes, and SEO output: `server/journal/render.ts`

This file is a portable Journal handoff, not a replacement for the full article bodies in the source of truth.
