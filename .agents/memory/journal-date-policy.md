---
name: Journal date policy
description: Keep publication dates out of reader-facing journal UI while preserving their operational and SEO roles.
---

Do not show publication dates on journal cards, article headers, or related-article cards. Keep useful context such as category and reading time instead.

**Why:** The founder prefers the journal to feel more timeless and intriguing, without signaling that an article is old.

**How to apply:** Preserve publication dates in post data, ordering, sitemaps, and JSON-LD (`datePublished`/`dateModified`), but omit them from visible page markup.