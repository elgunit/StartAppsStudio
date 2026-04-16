export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string; id?: string }
  | { type: "h3"; text: string; id?: string }
  | { type: "answer"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "quote"; text: string; cite?: string }
  | { type: "callout"; title?: string; text: string }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "faq"; items: { q: string; a: string }[] };

export interface Post {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  heroImage: string;
  heroAlt: string;
  publishedAt: string; // ISO date
  updatedAt?: string;
  readMinutes: number;
  tags: string[];
  body: Block[];
  sources?: { label: string; url?: string }[];
}

const AUTHOR = "Start Apps Studio";

export const posts: Post[] = [
  {
    slug: "make-your-brand-visible-in-chatgpt",
    title:
      "How to make your brand visible in ChatGPT and AI answers",
    description:
      "A 12-point GEO checklist — answer-first writing, Q&A structure, schema, entity signals, social proof, fresh content and E-E-A-T — so ChatGPT, Perplexity and Google AI Overviews actually surface your brand.",
    excerpt:
      "If ChatGPT never names your product when someone asks for a recommendation, your site is failing 12 specific tests. Here's the checklist we run on every MVP we ship.",
    heroImage: "/assets/journal/chatgpt-visibility-12-reasons.jpeg",
    heroAlt:
      "Infographic titled '12 Reasons Your Brand Is Invisible in ChatGPT Responses' listing GEO failures.",
    publishedAt: "2026-04-16",
    readMinutes: 7,
    tags: ["GEO", "LLM SEO", "Brand", "MVP"],
    body: [
      {
        type: "answer",
        text:
          "LLMs surface brands that lead with a direct answer, are structured as real Q&A, define their own entities clearly, expose structured data, and prove themselves with third-party social proof. If your site doesn't do those five things, ChatGPT won't mention you.",
      },
      {
        type: "p",
        text:
          "Generative Engine Optimization (GEO) is the new SEO. Your MVP can rank on Google and still be invisible inside ChatGPT, Claude, Perplexity and Google's AI Overviews, because LLMs don't index pages the way crawlers do — they extract answers. Below is the 12-point audit we run on every MVP we ship at Start Apps Studio, based on the patterns we see across brands that actually get quoted by AI.",
      },
      {
        type: "image",
        src: "/assets/journal/chatgpt-visibility-12-reasons.jpeg",
        alt: "Twelve reasons a brand becomes invisible inside ChatGPT, arranged as a 3x4 grid.",
        caption:
          "Source: '12 Reasons Your Brand Is Invisible in ChatGPT Responses', Francesco Gatti.",
      },
      { type: "h2", text: "Why this matters for MVPs", id: "why" },
      {
        type: "p",
        text:
          "Roughly a third of product discovery is already happening inside chat interfaces. For an MVP the stakes are higher than for an incumbent: you don't have the 10,000 third-party mentions Stripe or Notion have, so every signal you send has to be intentional. The good news is that GEO wins compound quickly — a single well-structured page can start getting quoted within days of indexing.",
      },
      {
        type: "h2",
        text: "The 12-point GEO checklist",
        id: "checklist",
      },
      {
        type: "h3",
        text: "1. Lead with a 1-sentence direct answer",
        id: "direct-answer",
      },
      {
        type: "p",
        text:
          "AI models favor front-loaded responses. Every page should open with a single sentence that answers the obvious question. Pages that bury the answer in marketing copy lose visibility to competitors who don't.",
      },
      {
        type: "h3",
        text: "2. Use a real question-and-answer structure",
        id: "qa-structure",
      },
      {
        type: "p",
        text:
          "Use real shopper questions as section headings on every page. Follow each with a short, factual answer, then expand the detail below. This mirrors the format LLMs are trained to extract.",
      },
      {
        type: "h3",
        text: "3. Cover each product end-to-end",
        id: "thin-content",
      },
      {
        type: "p",
        text:
          "Thin product pages are invisible product pages. Cover the use case, ingredients or components, who it's for, and when to use it. LLMs reward completeness over keyword repetition.",
      },
      {
        type: "h3",
        text: "4. Send clear entity signals",
        id: "entities",
      },
      {
        type: "p",
        text:
          "Clearly state brand name, product name, category and use case on every page. That's how an AI knows what you sell and surfaces you to the right shopper. Weak entity signals are the #1 reason new MVPs are ignored.",
      },
      {
        type: "h3",
        text: "5. Define your own terms — inline",
        id: "definitions",
      },
      {
        type: "p",
        text:
          "Add product glossaries or inline schema to power entity extraction. LLMs quote clean definitions verbatim; undefined jargon gets skipped entirely.",
      },
      {
        type: "h3",
        text: "6. Publish structured product data",
        id: "schema",
      },
      {
        type: "p",
        text:
          "Use schema markup, bullet specs, comparison tables and short sections. Structured schemas help AI parse, extract and recommend your products accurately. Every MVP should ship with Product, FAQPage and Article JSON-LD wherever it applies.",
      },
      {
        type: "h3",
        text: "7. Make social proof verifiable",
        id: "social-proof",
      },
      {
        type: "p",
        text:
          "Review counts, star ratings, third-party mentions and real user-generated content. LLMs prefer verifiable evidence over brand-generated claims. A handful of Reddit threads, Product Hunt reviews and press mentions outperform a page of testimonials.",
      },
      {
        type: "h3",
        text: "8. Keep content fresh and dated",
        id: "freshness",
      },
      {
        type: "p",
        text:
          "LLMs prioritize fresh, crawlable pages over static content. Update regularly, and add \"last updated\" dates, recent data and current-year context so your pages stay indexed and re-crawled.",
      },
      {
        type: "h3",
        text: "9. Build comparison pages",
        id: "comparisons",
      },
      {
        type: "p",
        text:
          "Create pages structured as \"X vs Y\", \"Best for [use case]\" and \"When to choose us over alternatives\". LLMs rely heavily on comparative reasoning to recommend products. A single comparison page can earn more LLM mentions than a whole product catalog.",
      },
      {
        type: "h3",
        text: "10. Link topics into clusters",
        id: "internal-linking",
      },
      {
        type: "p",
        text:
          "Avoid siloed pages. Link related topics to build topical authority clusters. LLMs favor well-linked sites; siloed pages break the context chain AI needs to recommend confidently.",
      },
      {
        type: "h3",
        text: "11. Swap jargon for E-E-A-T signals",
        id: "eeat",
      },
      {
        type: "p",
        text:
          "Add author credentials, cite real expertise, and include real-world examples. Google and AI both reward Experience, Expertise, Authority and Trust over hype.",
      },
      {
        type: "h3",
        text: "12. Write unique descriptions",
        id: "duplicates",
      },
      {
        type: "p",
        text:
          "Every page needs unique, structured product schema — not copy-pasted text. Duplicate content collapses topical authority and confuses AI indexing. If you have 20 near-identical SKU pages, LLMs will pick none of them.",
      },
      {
        type: "h2",
        text: "The brand identity layer underneath",
        id: "brand",
      },
      {
        type: "p",
        text:
          "GEO works only when your brand identity is well-defined. Before you audit a single page, you should be able to answer five questions in one sentence each: why this brand needs to exist, who it is not for, what success looks like, the competitive landscape, and the clarity (not a hunch) you're designing toward. That clarity becomes the source of truth every piece of copy and schema inherits from.",
      },
      {
        type: "callout",
        title: "Where we plug in",
        text:
          "Every MVP we ship at Start Apps Studio launches with brand identity, on-page GEO, structured data and at least one comparison page wired in from day one. That's why our MVPs start getting AI citations before they've shipped their first marketing campaign.",
      },
      {
        type: "h2",
        text: "Frequently asked questions",
        id: "faq",
      },
      {
        type: "faq",
        items: [
          {
            q: "What is GEO (Generative Engine Optimization)?",
            a: "GEO is the practice of optimizing a site so large language models like ChatGPT, Claude and Perplexity surface and cite it when users ask product questions. It overlaps with SEO but prioritizes direct answers, entity clarity and structured data over keyword density.",
          },
          {
            q: "How fast can a new MVP start getting cited by ChatGPT?",
            a: "Typically within 2–6 weeks once the site is crawlable, has clear entity signals, structured data and a few third-party mentions. Pages that lead with a one-sentence answer and include FAQ schema tend to get picked up first.",
          },
          {
            q: "Is GEO different from SEO?",
            a: "They share foundations (crawlability, schema, authority) but diverge on format. SEO rewards keyword-targeted pages; GEO rewards answer-first structure, explicit definitions and comparative content that LLMs can extract in one shot.",
          },
          {
            q: "Do small MVPs really need schema markup?",
            a: "Yes — more than big brands do. Schema is the cheapest way for a small site to punch above its weight in AI answers, because LLMs use structured data to disambiguate unknown brands.",
          },
        ],
      },
    ],
    sources: [
      {
        label:
          "'12 Reasons Your Brand Is Invisible in ChatGPT Responses' — Francesco Gatti (LinkedIn).",
      },
      {
        label:
          "'The key to nailing every brand identity project' — Maik Noblovits (Instagram).",
      },
    ],
  },

  {
    slug: "vibe-coded-apps-have-an-seo-problem",
    title:
      "Vibe-coded apps have an SEO problem — here's how to fix it",
    description:
      "Lovable, Bolt and v0 ship empty divs to crawlers. This is how to fix it: a Cloudflare Worker SSR proxy pattern, or a full migration to Claude Code + Supabase + Vercel when you need to rank.",
    excerpt:
      "Lovable builds ship in hours and are invisible to Google in seconds. Two ways to fix it — a Cloudflare Worker proxy for a quick win, and a full migration pattern when you're serious about ranking.",
    heroImage: "/assets/journal/lovable-seo-cloudflare-fix.png",
    heroAlt:
      "Reddit post titled 'I solved Lovable's biggest SEO problem' describing a Cloudflare Worker fix.",
    publishedAt: "2026-04-16",
    readMinutes: 9,
    tags: ["Vibe coding", "Lovable", "SEO", "SSR", "Claude"],
    body: [
      {
        type: "answer",
        text:
          "Vibe-coded apps render client-side, so crawlers see an empty <div>. You fix it either by putting a Cloudflare Worker between your domain and Lovable that returns server-rendered HTML to bots, or by migrating the project to a real stack (Claude Code + Supabase + Vercel) before you invest in marketing.",
      },
      {
        type: "p",
        text:
          "Tools like Lovable, Bolt and v0 are amazing for shipping an idea in an afternoon. They are not amazing at SEO. The whole page is a client-side React bundle, which means Googlebot on its first crawl sees an empty <div id=\"root\" />. No content. No headings. No schema. No rankings. For an MVP that relies on organic traffic, that is a founding-year problem.",
      },
      {
        type: "p",
        text:
          "Here are the two fixes we use at Start Apps Studio, ordered from smallest effort to largest payoff.",
      },
      {
        type: "h2",
        text: "Fix 1 — Cloudflare Worker SSR proxy",
        id: "cloudflare-worker",
      },
      {
        type: "p",
        text:
          "A Cloudflare Worker sits between your domain and Lovable. When a request comes in, the Worker checks the User-Agent: real visitors are proxied through to Lovable as usual; bots (Googlebot, Bingbot, GPTBot, PerplexityBot, ClaudeBot) get server-rendered HTML with real content and full schema markup, from the same URL.",
      },
      {
        type: "image",
        src: "/assets/journal/lovable-seo-cloudflare-fix.png",
        alt: "r/lovable post describing a Cloudflare Worker that server-renders HTML for crawlers while real visitors get the Lovable app.",
        caption:
          "Source: r/lovable showcase post 'I solved Lovable's biggest SEO problem'.",
      },
      {
        type: "p",
        text:
          "This is not cloaking when it's done correctly — the content the bot receives has to match what the user eventually sees once the JS executes. The setup is two steps:",
      },
      {
        type: "ol",
        items: [
          "Add one CNAME to your DNS pointing your custom domain at the Cloudflare Worker.",
          "Paste one prompt inside Lovable so the worker has a canonical page inventory to server-render from.",
        ],
      },
      {
        type: "callout",
        title: "When to use the Worker approach",
        text:
          "If you are not ready to migrate off Lovable, and you need pages indexed this week, the Cloudflare Worker is the right call. It's the only fix that keeps Lovable's visual editing flow intact.",
      },
      {
        type: "h2",
        text: "Fix 2 — Migrate off Lovable with Claude Code",
        id: "migrate-claude",
      },
      {
        type: "p",
        text:
          "The Worker buys you time. But if the app has to rank seriously, handle dynamic content, or be maintained by humans a year from now, you'll want to move to a \"normal\" web stack. The fastest way we've seen is to let Claude Code do the migration for you.",
      },
      {
        type: "image",
        src: "/assets/journal/migrate-lovable-claude-steps-1.png",
        alt: "Reddit post listing steps 1 through 8 of migrating a Lovable project to Claude Code, Supabase and Vercel.",
        caption: "Steps 1–8 — push to GitHub, install Claude Code, and migrate.",
      },
      {
        type: "image",
        src: "/assets/journal/migrate-lovable-claude-steps-2.png",
        alt: "Continued Reddit post listing steps 6 through 10 of migrating a Lovable project to a standard web stack.",
        caption: "Steps 6–10 — hosting, secrets, deployment and debugging.",
      },
      { type: "h3", text: "The 10-step migration recipe", id: "recipe" },
      {
        type: "ol",
        items: [
          "Push your Lovable project to GitHub so Claude can work with it easily.",
          "Install Claude Code locally so it can read and edit your repo directly.",
          "Point Claude at your repo (GitHub remote or local path).",
          "Create a Supabase project for database and auth (roughly five minutes).",
          "Ask Claude to migrate the project away from Lovable — prompt: \"Migrate this Lovable project into a normal web stack and organize the repo cleanly.\"",
          "Set up hosting on Vercel. The free tier covers most MVPs.",
          "Ask Claude which environment variables and API keys are required — it's surprisingly good at identifying them.",
          "Generate the keys and create a .env file (Supabase keys, API tokens, etc).",
          "Ask Claude to configure deployment — it can wire the GitHub → Vercel flow and connect Supabase.",
          "Fix anything that breaks by asking Claude to debug, one error at a time.",
        ],
      },
      {
        type: "p",
        text:
          "This setup ends up more flexible than Lovable itself. You stop paying per-prompt credits for app changes, and you can fall back to free models for small edits — because Lovable is already using Claude under the hood for most of its generation.",
      },
      {
        type: "h2",
        text: "The Lovable + Claude hybrid",
        id: "hybrid",
      },
      {
        type: "p",
        text:
          "If you're mid-project and not ready to migrate, there's a middle path that multiple r/lovable users have validated: connect Lovable to GitHub, then give Claude Code access to the same repo. Claude sits on a layer above Lovable, guiding it through complex features, debugging, and enhancements, while you run SQL directly in Supabase for database changes (free — Lovable doesn't charge to run a query).",
      },
      {
        type: "image",
        src: "/assets/journal/lovable-claude-workflow.png",
        alt: "Reddit post titled 'Lovable + Claude = 10X performance' describing a hybrid workflow.",
        caption:
          "Source: r/lovable tutorial 'Lovable <> Claude = 10X performance'.",
      },
      {
        type: "p",
        text:
          "Results: fewer burned credits on blocking components (users report 100+ credits saved on a single component), better handling of tangled logic, and, critically for this article, enough control over the output HTML that you can retrofit SSR and schema incrementally.",
      },
      {
        type: "h2",
        text: "Which fix should you pick?",
        id: "decision",
      },
      {
        type: "ul",
        items: [
          "Marketing site or landing page only → Cloudflare Worker SSR. Cheapest, fastest.",
          "Product with dynamic content that needs to rank → migrate to Claude Code + Supabase + Vercel.",
          "Mid-project and can't rebuild → Lovable + Claude hybrid, then retrofit SSR on the pages that matter.",
        ],
      },
      {
        type: "callout",
        title: "Where we plug in",
        text:
          "Start Apps Studio has migrated a handful of Lovable MVPs off the platform using exactly this recipe. If you'd rather not burn a week on the plumbing, we can take it from prompt to indexed production — usually in under two weeks.",
      },
      {
        type: "h2",
        text: "Frequently asked questions",
        id: "faq",
      },
      {
        type: "faq",
        items: [
          {
            q: "Why can't Google index Lovable pages directly?",
            a: "Lovable ships a client-rendered React bundle, so the initial HTML is an empty root div. Googlebot's first-pass crawl captures that empty HTML; it may (or may not) come back later to render JavaScript. For new domains with no authority, that second-pass render is often never triggered.",
          },
          {
            q: "Is the Cloudflare Worker fix considered cloaking?",
            a: "Not if the bot sees the same content a user eventually sees once JS executes. Serving pre-rendered HTML to bots is an established SEO pattern; it only becomes cloaking if you serve different content to bots than to users.",
          },
          {
            q: "How much does the full migration cost?",
            a: "DIY: a weekend and a Vercel + Supabase free-tier account. Delivered by Start Apps Studio: typically around one sprint, bundled into our MVP Production package.",
          },
          {
            q: "Can I keep editing visually after migrating?",
            a: "You lose Lovable's in-browser editor, but gain a normal dev loop and can bring any visual tool (or another AI builder) on top of the repo. Most teams don't miss it once they see how much faster Claude Code iterates.",
          },
        ],
      },
    ],
    sources: [
      {
        label:
          "r/lovable showcase — 'I solved Lovable's biggest SEO problem' (Cloudflare Worker pattern).",
      },
      {
        label:
          "r/lovable tutorial — 'Lovable <> Claude = 10X performance' by u/EIAMM.",
      },
      {
        label:
          "r/lovable — 10-step migration to Claude Code + Supabase + Vercel.",
      },
    ],
  },

  {
    slug: "ai-at-work-2026-what-it-means-for-founders",
    title:
      "AI at work in 2026: what the exposure data means for founders",
    description:
      "74.5% of programmers are AI-exposed, observed usage trails theoretical capability, and HubSpot's 2026 marketing report is about lead generation, not content. What that means if you're building an MVP in 2026.",
    excerpt:
      "The gap between what AI can do and what workers actually use it for is now the biggest arbitrage of the decade. Here's how to read the 2026 data as a founder.",
    heroImage: "/assets/journal/ai-at-work-exposure.jpeg",
    heroAlt:
      "Infographic titled 'AI at Work: Mapping the Landscape of Occupational Exposure' showing high exposure for programmers, customer service and data entry.",
    publishedAt: "2026-04-16",
    readMinutes: 8,
    tags: ["AI at work", "State of marketing 2026", "Founders", "Research"],
    body: [
      {
        type: "answer",
        text:
          "In 2026, AI exposure is highest for white-collar knowledge work (programmers 74.5%, customer service 70.1%, data entry 67.1%), but observed usage still trails theoretical capability in almost every sector. HubSpot's 2026 marketing report confirms the shift: marketers are being measured on revenue and leads, not content output. The founders who win are the ones who turn that gap into leverage.",
      },
      {
        type: "p",
        text:
          "Three pieces of research landed in the last quarter that should reshape how you think about building an MVP in 2026. Read together, they tell a clear story: AI capability is sprinting ahead of AI adoption, and the founders who close that gap for their customers are the ones getting paid.",
      },
      {
        type: "h2",
        text: "1. Exposure is now a job-level fact",
        id: "exposure",
      },
      {
        type: "image",
        src: "/assets/journal/ai-at-work-exposure.jpeg",
        alt: "AI at work infographic with 74.5% programmer exposure, 70.1% customer service, 67.1% data entry, plus wage and demographic breakdowns.",
        caption:
          "Source: 'AI at Work: Mapping the Landscape of Occupational Exposure'.",
      },
      { type: "h3", text: "The headline numbers" },
      {
        type: "ul",
        items: [
          "Computer programmers: 74.5% exposure. The leading automated tasks are writing, updating and maintaining software programs.",
          "Customer service reps: 70.1% exposure. AI is taking over information delivery, order intake and complaint handling.",
          "Data entry keyers: 67.1% exposure. Automation focuses on reading source documents and entering data into digital systems.",
        ],
      },
      { type: "h3", text: "Who is most exposed" },
      {
        type: "ul",
        items: [
          "Workers with a bachelor's degree are 23.8 percentage points more likely to be in the top AI-exposure quartile (37.1% vs 13.3%).",
          "The average hourly wage in high-exposure roles is $32.69, versus $22.23 in no-exposure roles — a $10.45 wage premium.",
          "Female workers are 15.5 percentage points more represented in high-exposure roles than in no-exposure roles.",
        ],
      },
      {
        type: "callout",
        text:
          "Translation for founders: the most expensive hours in your organization are also the most automatable. Your MVP's best wedge is almost always an internal productivity one, not a brand-new consumer category.",
      },
      {
        type: "h2",
        text: "2. Theoretical capability ≫ observed usage",
        id: "capability-gap",
      },
      {
        type: "image",
        src: "/assets/journal/ai-occupational-radar.jpeg",
        alt: "Radar chart comparing theoretical AI capability against observed AI usage across 20+ occupational categories; theoretical capability far exceeds observed usage almost everywhere.",
        caption:
          "Theoretical capability (blue) vs observed usage (red) across occupations.",
      },
      {
        type: "p",
        text:
          "Across every occupational category we looked at — management, business and finance, computer and math, architecture and engineering, legal, arts and media — observed AI usage is a fraction of theoretical capability. Even in office and admin work, where exposure is highest, the red-shaded \"observed\" footprint sits at roughly a third of the blue \"theoretical\" one.",
      },
      {
        type: "p",
        text:
          "That gap is the arbitrage. Enterprise users are not short on access to LLMs; they are short on workflows that turn access into outcomes. Every startup that closes one such workflow — \"draft the contract\", \"reconcile the invoice\", \"write the follow-up\" — is pricing on the gap.",
      },
      {
        type: "h2",
        text: "3. HubSpot's 2026 marketing report reframes the funnel",
        id: "hubspot-2026",
      },
      {
        type: "image",
        src: "/assets/journal/hubspot-state-marketing-2026.png",
        alt: "HubSpot's 2026 marketing dashboard listing top marketing goals (revenue, traffic, engagement, CX, closing deals) and top challenges (generating traffic, leads, hiring, driving purchases, budget).",
        caption:
          "Source: HubSpot State of Marketing 2026 — what's new vs 2025.",
      },
      { type: "h3", text: "Top marketing goals in 2026" },
      {
        type: "ol",
        items: [
          "Increasing revenue and sales.",
          "Driving traffic to your website.",
          "Increasing engagement.",
          "Improving the customer experience.",
          "Closing more deals.",
        ],
      },
      { type: "h3", text: "Top marketing challenges in 2026" },
      {
        type: "ol",
        items: [
          "Generating traffic.",
          "Generating leads.",
          "Hiring top talent.",
          "Driving purchases.",
          "Securing the budget you need.",
        ],
      },
      {
        type: "p",
        text:
          "The shift from 2025 is subtle but real. \"Producing content\" has dropped out of the top goals entirely; marketers are being measured on revenue and lead velocity. In a world where AI content is effectively free, the scarce resource is distribution — traffic, leads and trust.",
      },
      {
        type: "h2",
        text: "What this means if you're shipping an MVP",
        id: "playbook",
      },
      {
        type: "ol",
        items: [
          "Price on the capability gap. If you can ship a workflow that converts a 'theoretical' AI capability into a reliable 'observed' outcome for a specific role, you have a business.",
          "Target the high-exposure, high-wage seats first. Programmers, customer service leads, finance and legal analysts — they have both the budget and the pain.",
          "Assume AI content is free. Don't compete on output. Compete on distribution — SEO, GEO, partnerships and owned audience.",
          "Measure on revenue, not reach. HubSpot's 2026 data says every B2B buyer is doing the same. Tie every marketing dollar to a pipeline number or cut it.",
        ],
      },
      {
        type: "callout",
        title: "Where we plug in",
        text:
          "Every MVP we ship at Start Apps Studio is built around a single measurable outcome — revenue, leads, or time saved. We don't ship pretty demos. If you've got a capability-gap idea, we can get you from signal to shipped in weeks, not quarters.",
      },
      {
        type: "h2",
        text: "Frequently asked questions",
        id: "faq",
      },
      {
        type: "faq",
        items: [
          {
            q: "Which occupations have the highest AI exposure in 2026?",
            a: "Computer programmers (74.5%), customer service representatives (70.1%) and data entry keyers (67.1%) top the exposure charts. All three are knowledge-work roles with high automation potential.",
          },
          {
            q: "Why is observed AI usage lower than theoretical capability?",
            a: "Because adoption lags capability. LLMs are accessible; reliable, integrated workflows that translate capability into outcomes inside specific roles are not. That gap is the single biggest opportunity for 2026 MVPs.",
          },
          {
            q: "What are HubSpot's top marketing goals for 2026?",
            a: "Increasing revenue and sales, driving traffic, increasing engagement, improving the customer experience, and closing more deals. Notably, 'producing content' is no longer a top-tier goal.",
          },
          {
            q: "What should an early-stage founder prioritize in 2026?",
            a: "Revenue-tied distribution over content volume, plus a tight wedge into a high-exposure, high-wage role. Shipping a pretty demo is no longer a differentiator; shipping a workflow that replaces or augments an expensive hour is.",
          },
        ],
      },
    ],
    sources: [
      {
        label:
          "'AI at Work: Mapping the Landscape of Occupational Exposure' (research summary infographic).",
      },
      {
        label:
          "'Theoretical capability and observed usage by occupational category' — occupational radar chart.",
      },
      {
        label: "HubSpot State of Marketing 2026 — in-app dashboard.",
      },
    ],
  },
];

export const AUTHOR_NAME = AUTHOR;

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

export function allPostsNewestFirst(): Post[] {
  return [...posts].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );
}
