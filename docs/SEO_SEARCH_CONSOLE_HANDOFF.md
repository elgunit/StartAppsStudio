# Search Console & SEO Handoff

One-time manual steps to complete after this SEO pass is deployed. Everything below is configuration in third-party dashboards — no code changes required.

## 1. Verify the domain in Google Search Console

1. Go to [search.google.com/search-console](https://search.google.com/search-console).
2. Click **Add property** → **Domain** (recommended over URL prefix — covers `www`, `https`, and all subpaths).
3. Enter `startappsstudio.com`.
4. Google will show a TXT record. Add it to your DNS provider (the same one that holds the `MX` and `A` records for the domain). Propagation can take a few minutes to a few hours.
5. Click **Verify**. Re-try after a coffee if it fails the first time.

## 2. Submit the sitemap

1. In Search Console, open the verified property.
2. Left nav → **Sitemaps**.
3. Enter `sitemap.xml` and click **Submit**.
4. Confirm status reads "Success" within a day. Pages discovered will trickle into the **Pages** report over the following days.

## 3. Request indexing for the homepage and journal

1. Open the **URL Inspection** tool (top search bar in GSC).
2. Paste `https://startappsstudio.com/` → press Enter → **Request indexing**.
3. Repeat for `https://startappsstudio.com/journal`.
4. Optionally request indexing for the most important journal posts. (New posts will be picked up automatically once they appear in the sitemap.)

## 4. Set up email alerts

1. Search Console → **Settings** → **Users and permissions** — confirm the right email is on the property as **Owner** or **Full** user.
2. Search Console → **Settings** → **Email preferences** — make sure **Critical site issues** and **Recommendations** are enabled.

## 5. Link Search Console to GA4

This makes search query data flow into your Analytics dashboards.

1. Go to [analytics.google.com](https://analytics.google.com).
2. Open the property `G-FQCKTE2CF8` (already wired into the landing page).
3. **Admin** (gear icon, bottom left) → **Property settings** → **Product links** → **Search Console links**.
4. Click **Link** → choose the verified `startappsstudio.com` property → select your GA4 web stream → confirm.
5. Within ~24 hours, GA4 will show a **Search Console** report under **Reports → Acquisition**.

## 6. Bing Webmaster Tools (optional but quick)

Bing powers DuckDuckGo, Ecosia, and parts of ChatGPT search. Five-minute add.

1. Go to [bing.com/webmasters](https://www.bing.com/webmasters).
2. Click **Import from Google Search Console** — this skips re-verification entirely.
3. Authorise the import; the sitemap and property come across automatically.

## 7. Validate the live changes

After deploy, run each of these once to confirm the SEO pass landed:

| Check | Tool | Expected |
|-------|------|----------|
| JSON-LD structured data | [Rich Results Test](https://search.google.com/test/rich-results) on the homepage | Organization, WebSite, and ProfessionalService entities detected, no errors |
| Open Graph card | [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) | Title, description, and 1200×630 cover image preview |
| Twitter / X card | [X Card Validator](https://cards-dev.twitter.com/validator) (or paste in a draft post) | `summary_large_image` card with title, description, and cover |
| Mobile friendliness | [PageSpeed Insights](https://pagespeed.web.dev/) | Mobile score in the green; no usability errors |
| Robots & sitemap | Visit `/robots.txt` and `/sitemap.xml` directly | Robots lists explicit AI bots; sitemap lists homepage + journal pages |
| LLM overview | Visit `/llms.txt` and `/llms-full.txt` directly | Plaintext overviews load with current pricing and toolkit |

## 8. After two weeks

1. Search Console → **Performance** → confirm impressions are accumulating for queries like *MVP studio*, *startup MVP development*, *mockup design service*.
2. If the homepage still hasn't been indexed, re-run **URL Inspection → Request indexing**.
3. If a journal post is performing well, consider promoting its key keyword in the homepage hero copy.

## Files touched in this SEO pass

- `server/templates/desktop-landing.html` — head: title, meta, canonical, Open Graph, Twitter Card, JSON-LD (Organization, WebSite, ProfessionalService with all four packages and prices)
- `server/journal/render.ts` — `renderRobotsTxt` expanded with explicit AI bot allows; new `renderLlmsTxt` and `renderLlmsFullTxt` helpers
- `server/routes.ts` — new `/llms.txt` and `/llms-full.txt` routes
- `assets/images/og-cover.png` — new 1200×630 brand-teal social share image

## Notes

- The page already had Google Analytics (`G-FQCKTE2CF8`) and Microsoft Clarity wired up. No change needed there.
- The Resend domain `startappsstudio.com` is still pending verification (separate task) — does not affect SEO.
- Sitemap is generated dynamically from `server/journal/posts/`, so new journal posts will automatically appear once they exist on disk.
