---
name: Editorial route validation
description: Why localized editorial checks must exercise live HTTP routes, not only renderer functions.
---

Localized editorial work must be verified through the running server for every locale/article path, including redirect behavior, document language, localized links, and structured data.

**Why:** Static renderer validation once passed while a separate Express route still redirected every newly translated article except the original special-case article to English. Renderer-only checks could not observe that behavior.

**How to apply:** When expanding localized editorial coverage, run one programmatic browser or HTTP sweep across the actual locale-prefixed routes at desktop and mobile widths. Assert the final URL, `<html lang>`, localized title, locale-prefixed related links, JSON-LD language, and no horizontal overflow.