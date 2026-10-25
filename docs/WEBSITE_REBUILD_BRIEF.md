# Start Apps Studio Website — Rebuild Brief

This document captures the public website’s current purpose, page structure, content, interactions, and constraints so the site can be reorganized or rebuilt without losing decisions already made. It is an inventory of the current site, not a request to copy its implementation literally.

## 1. Brand and business context

- **Brand:** Start Apps Studio.
- **Positioning:** A founder-led digital product partner for new ventures, family businesses, and established teams.
- **Audience:** Especially early-stage and non-technical founders who need a credible launch presence, a prototype, or a real product.
- **Delivery:** One accountable partner owns strategy, design, engineering, QA, and launch. Work is remote and available worldwide.
- **Core promise:** Build the right next milestone, keep the client involved through working previews, and hand over an understandable product the client owns.
- **Common trust points:** Fixed scope and pricing, client ownership of code/designs/accounts, a reply within 24 hours, and typical MVP delivery in 3–8 weeks.
- **Brand voice:** Direct, clear, constructive, and founder-aware. Frame comparisons around what clients can review, own, operate, and hand off. Avoid adversarial competitor claims or exaggerated promises.

## 2. Public site map

The public marketing site is primarily a single-page homepage with editorial pages alongside it.

| URL | Purpose |
| --- | --- |
| `/` | Main marketing homepage; contains the portfolio, service tabs, process, pricing, founder story, lead form, FAQ, and footer. |
| `/resources` | Product-decision hub for choosing a route, comparing packages, understanding tools, and finding Journal notes. |
| `/journal` | Editorial index of all Journal articles. |
| `/journal/:slug` | Individual long-form article. |
| `/:locale` | Localized homepage. |
| `/:locale/resources`, `/:locale/journal`, `/:locale/journal/:slug` | Localized editorial pages and articles. |
| `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/llms-full.txt` | Search and AI-crawler discovery files, not reader-facing pages. |

There are no separate public Pricing, Services, About, or Contact pages today; those are homepage sections or anchors. The repository also contains a separate Expo client app. This brief covers the public website, not authenticated app screens or dashboards.

### Language behavior

English is the default. The current code supports English plus Azerbaijani, Turkish, Russian, Simplified Chinese, French, Spanish, German, Ukrainian, Italian, and Korean. `/` can use the saved language choice or browser language; non-English versions have explicit language-prefixed URLs. Treat the current locale registry as the source of truth.

### Main navigation

Homepage navigation: Work, Services, Pricing, About, FAQ, and “Get a free plan.” Editorial pages link to the homepage, Resources, Journal, Pricing, and Contact. The footer also links to Resources and Journal.

## 3. Homepage structure and content

### 3.1 Hero and founder strip

- **Headline:** “Ship your product in weeks.”
- **Lead:** “Real products for real customers. Not a mockup from a one-line prompt.”
- **Context:** Start Apps Studio is a founder-led product partner; one person owns the project from plan to launch.
- **Timing cue:** “3 to 8 weeks to launch” describes the general MVP path; package-specific timings below are more precise.
- **Actions:** “Get a free plan” and “See pricing.”
- **Visual:** Browser/app product preview, honestly labeled “Project preview”; it is illustrative, not a claimed client product screenshot.
- **Founder strip:** “One person owns your product from plan to launch.”

### 3.2 Selected projects

- **Intro (keep industry-neutral):** “Real products in users' hands, across the industries below.”
- **Industry filters:** Fintech, Education, Healthcare, Fitness & Wellness, Hospitality, Media & Telecom, Real Estate, SaaS, E-Commerce, Logistics, HR & Recruiting, Cybersecurity.
- **Current project cards:**
  1. Coaching & Tracking App — wellness, iOS and Android.
  2. Operations Dashboard — SaaS rescue build.
  3. Payments & Ledger MVP — fintech web platform.
  4. Course & Learning Platform — education web app.
  5. Property Discovery App — real estate, iOS and Android.
  6. Investor-Ready Demo — pitch prototype for web.
- Cards contain the problem, solution, platform/technology tags, an outcome line, and an expandable detail view. The filter and mobile carousel are part of the experience.
- **Visual rule:** Show believable, category-specific product interfaces, but do not put invented client names, logos, or brand marks inside showcase artwork.

### 3.3 What we ship: Build and Grow tabs

The two tabs are important; preserve the full descriptions and details in both.

**Build**

- **Landing Pages:** Conversion-focused launch presence with email capture, analytics, SEO, and CRM hooks.
- **Native iOS & Android:** Store-ready native apps, push notifications, deep links, subscriptions, and source handoff.
- **Web Applications:** Mobile-first web apps with accounts, database, payments, and integrations.
- **Full MVP:** Scope, design, engineering, core infrastructure, and launch support for a real first product.

**Grow**

- **SEO Audit:** Site-health review and plain-English, impact-ranked fix list; focused sprint, 1–2 weeks.
- **Keyword Strategy:** Search demand and a plan to rank; 1–2 weeks.
- **Backlink Strategy & Outreach:** Real outreach to editors; 4–8 weeks.
- **Content Plan:** 90-day editorial calendar, topics, outlines, and briefs.
- **Paid Ads Setup:** Google and Meta campaign setup, creative, and targeting; 2–3 weeks.
- **Social Media Kit:** Branded templates, content calendar, and voice; 30-day system.
- **Email Sequences:** Welcome, onboarding, and win-back flows; ongoing lifecycle support.
- **Brand Identity:** Visual system covering logo, colors, typography, and voice; 3–5 weeks.

### 3.4 From idea to launch

Four steps:

1. **Understand the problem and the market** — review the business, competitors, rankings, and reviews; define the first release.
2. **Choose the right route** — compare launch site, prototype, web app, or native delivery against the need.
3. **Make the solution tangible** — map flows, design key screens, and build against real scenarios with previews.
4. **Launch with room to grow** — ship the working version, connect accounts, hand over code and keys, and identify the next move.

### 3.5 Pricing and package routing

Keep four distinct routes and make all pricing, FAQs, Resources tables, and form choices consistent.

| Route | Price | Typical timing | Purpose |
| --- | ---: | --- | --- |
| Launch Site | $2,600 | 3–5 business days | Editable, owned website for a credible story before a full product. |
| Prototype | $6,000 | 5–10 days | Figma-led, clickable experience for validation, fundraising, or early conversations; responsive web, not native apps. |
| MVP | $15,000–$30,000 | 3–8 weeks | A working web, iOS, or Android product for real users; built to learn and grow. |
| Custom | From $25,000 or monthly retainer | 1–6 months | Hand-built, larger or more complex product with longer-term accountability. |

MVP is the recommended card. The Prototype owns the full design phase; do not imply it is included in the entry-level Launch Site. Do not promise a numerical user capacity. Each card has expandable “What’s included” details and a route-specific contact action.

### 3.6 Native delivery explainer

An additional explainer distinguishes the shared web-app core from platform-specific delivery: Prototype proves the idea in responsive web; MVP can carry the core to Web, iOS, and Android with native UI/UX. This content is currently hidden/inert in the default homepage markup and opens through a detail interaction.

### 3.7 Founder accountability and proof

- **Headline:** “One person. Full accountability.”
- Explains that the same person scopes, designs, builds, and ships the product, avoiding agency or marketplace handoffs.
- Four principles: direct access, feedback while decisions are easy, client-owned foundations, and a partner path as the product grows.
- The section contains customer quotes and attributed project proof. The site owner’s decision about which testimonials to keep was not recorded in the source brief; retain only quotes the owner selects and has permission to publish.

### 3.8 Expertise, toolkit, and AI

The template also contains additional expertise/toolkit/AI content. Some of these panels are hidden or conditionally revealed, so decide deliberately whether to make them visible sections in a rebuild.

- **Five disciplines:** Product design, product engineering, product strategy, delivery leadership, and product insight.
- **Toolkit groups:** Make the idea visible; build a durable product; revenue and launch; AI working in the background. Current tools named include Figma, Rork, Lovable, Replit, React Native, Swift, Kotlin, Node/PostgreSQL, Stripe, RevenueCat, GitHub, n8n/Make, Claude, Gemini, GPT-5, and Llama.
- **AI position:** AI assists research, implementation, and review; a person owns direction and quality. The Custom package is described as hand-coded. Tool/vendor lists and claims such as “no surprise AI fees” should be checked for current accuracy before reuse.
- **AI value comparison:** The intended frame is a product the client can own and operate, not a competitor attack.

### 3.9 Contact / scope form

The main conversion form is a two-step project-scoping form.

- **Step 1 — About you:** Full name, email, business/project stage, what exists today, optional business/project name, and desired outcome.
- **Step 2 — Project details:** Investment range, project type, optional launch timing, and a free-text description.
- **Project types:** Landing Page, Mobile App, Web App, Full MVP, Prototype/Pitch Demo, Rescue/Takeover, Existing App, AI/ML Feature, Growth & Marketing, Outsourcing/Team Extension.
- Trust points: a real founder reviews the brief, the client owns the work, fixed pricing, and a clear reply within 24 hours.
- **Success state:** Confirms receipt and explains that the founder will review scope, priorities, and timing before replying.
- The form posts to the existing contact endpoint. A previous test was accepted by the email provider, but arrival at the destination inbox was not confirmed; do not represent email-alert delivery as verified until retested.
- Contact inquiries should count only after server confirmation; keep CTA clicks and failed submissions as separate events.

### 3.10 FAQ

Current FAQ topics include cost, timelines, what an MVP includes, ownership, technology choices, post-launch support, existing businesses, investor demos, launch sites without a full app, marketing/Grow services, and rescuing an existing or AI-built project.

### 3.11 Journal preview and footer

- The homepage includes a Journal-note preview in the template, but that block is currently hidden/inert in the default page state and can be populated from the Journal API.
- Footer includes the studio identity, contact links, Resources and Journal links, a return-to-top control, and copyright.
- Do **not** restore a floating bottom “Get a free plan” bar. Regular navigation and in-section CTAs are intended.

## 4. Resources page

**Purpose:** A scannable product-decision hub, not a news feed or a generic article index.

- **Hero:** “Practical guides for building and launching digital products.” Links to the project-scoping form and Journal.
- **Route map:** A visual 01–04 route guide with jump links into the page.
- **Section 1 — Choose the next route:** Four decision cards: smallest useful proof; AI-assisted delivery with sound structure; ownership and handoff; and partner fit.
- **Section 2 — Package routing guide:** A comparison table with route, investment, typical timing, and what the user needs to accomplish. It mirrors the four homepage packages.
- **Section 3 — Toolkit behind the work:** Four expandable groups of tools and plain-language reasons for using them; ownership/portability note.
- **Section 4 — Field notes from the Journal:** Six selected article cards plus a link to all Journal notes.
- **Closing CTA:** Invites founders to share their current stage, what they need to prove, and what is stuck.
- **Design rule:** Give route cards, package comparisons, tool accordions, and Journal cards distinct visual treatments. Do not turn every section into the same grid of article cards.

## 5. Journal and article pages

### Journal index

- Editorial title: “Field notes from the studio.”
- Topics: MVP strategy, product decisions, SEO/GEO, AI-assisted delivery, and technology choices.
- Shows article title, category, excerpt, and reading time; publication dates remain metadata, not visible reader UI.
- Current article inventory:
  1. **The AI Overviews citation playbook for MVPs** — Playbook.
  2. **How to make your brand visible in ChatGPT and AI answers** — Playbook.
  3. **Vibe-coded apps have an SEO problem. Here's how to fix it** — Field Notes.
  4. **AI at work in 2026: what the exposure data means for founders** — Research.
  5. **Backlinks still decide who gets recommended in 2026** — Playbook.
  6. **Designing for the AI-native era: generative UI and building for agents** — Essay.
  7. **Your design system matters more in the AI era, not less** — Essay.
  8. **The MVP brief is your first product decision** — Field Notes.
  9. **Base44 vs. Lovable: which one is right for your next app?** — Field Notes.
- Editorial cadence: one article per calendar month, on varied dates; retain dates for sorting, sitemap, and structured data.

### Individual article template

Article pages include category and reading time, title and excerpt, author, structured body blocks, tags, optional sources, a studio/project CTA, and two related article cards. Supported body blocks include direct-answer summaries, paragraphs, headings, lists, quotes, callouts, and FAQs. Preserve article-specific structure and citations when migrating.

## 6. Claims and content safety

Several specific case-study outcomes remain unconfirmed in the owner’s earlier claim review. The current source includes claims such as “Shipped in 6 weeks · Pre-seed raised,” “Live in 9 days,” an 11-day rescue and contract signature, a seven-week build and Series A, a cohort selling out, and a four-week delivery. Treat these as **needs owner confirmation**, not approved facts. If not confirmed, replace them with factual descriptions without specific numbers or outcomes.

The earlier “about 40 products shipped” claim is not present in the current homepage source. Do not add it without confirmation.

The selection of testimonials to retain was also not specified. Preserve the quote inventory for review, but publish only selected, permission-cleared quotes. Do not invent client names, attributions, metrics, funding results, or testimonials.

## 7. Visual and interaction constraints

- Preserve the existing page’s intentional compositions; fix local layout defects without broadly reflowing a designed section.
- Current visual direction: editorial serif display type with clean sans-serif body text; deep teal, warm cream, muted sage, coral accent, and warm gold calls to action.
- Maintain both light and dark modes with readable contrast.
- Current wide-screen pricing layout is four cards across; tablet is two columns; mobile is one column. Keep the Custom action on one line and its feature icons vertically centered.
- Keep responsive behavior for the project filters/carousel, mobile navigation, pricing expanders, FAQ accordion, modals, and two-step form.
- Avoid adding a floating bottom free-plan CTA.

## 8. Localization, SEO, and operational behavior

- Landing page, Resources, Journal, and article pages have localized versions. The homepage locale dictionary is keyed to exact English source strings; edits require updating translations and Chinese font subsets where relevant.
- Pages use canonical URLs, localized alternates/hreflang, Open Graph metadata, and structured data. Preserve sitemap, robots, and LLM-readable files.
- Public routes are server-rendered. Contact form and Journal lead capture use backend APIs; section views, CTA events, and social clicks have separate tracking.
- For a rebuild, retest contact storage and inbox delivery, the locale URL contract, all editorial routes, and analytics semantics instead of assuming that visual parity proves those flows work.

## 9. Current source-of-truth map

- Homepage content and interactions: `server/templates/desktop-landing.html`
- Visual refinements and responsive system: `assets/startapps-refinement.css`, `assets/startapps-refinement.js`
- Homepage translations and locale routing: `server/i18n/`
- Editorial content and translations: `server/journal/editorial.ts`, `server/journal/posts.ts`, `server/journal/locales/`
- Journal/Resources rendering and SEO output: `server/journal/render.ts`
- Public route handling and APIs: `server/index.ts`, `server/routes.ts`
- SEO handoff: `docs/SEO_SEARCH_CONSOLE_HANDOFF.md`

Use the running site and these source files as the content baseline. This brief should help reorganize the experience without silently dropping copy, pricing, languages, interactions, or ownership commitments.
