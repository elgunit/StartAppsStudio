---
name: Journal date policy
description: Maintain a monthly journal cadence while keeping publication dates out of reader-facing UI.
---

Do not show publication dates on journal cards, article headers, or related-article cards. Keep useful context such as category and reading time instead.

**Why:** The founder prefers the journal to feel more timeless and intriguing, without signaling that an article is old.

**How to apply:** Preserve publication dates in post data, ordering, sitemaps, and JSON-LD (`datePublished`/`dateModified`), but omit them from visible page markup.

Publish one journal article per calendar month, using a varied day of the month rather than a fixed schedule.

**Why:** A consistent monthly rhythm makes the journal feel actively maintained without becoming mechanically predictable.

**How to apply:** Keep each post’s `publishedAt` month unique within a planned sequence, use a sensible non-repeating day, and ensure new posts lead the API, journal index, landing fallback, sitemap, and structured metadata.