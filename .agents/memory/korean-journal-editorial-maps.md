---
name: Korean Journal editorial maps
description: Durable guidance for maintaining native Korean Journal article translations.
---

Korean Journal translations must use explicit, article-specific copy for scalar blocks, list items, and FAQ question/answer paths. Source-derived structure can remain shared, but prose should not be generated from a shared sentence template or nearest-block fallback.

**Why:** A generic translator can satisfy protected-term, number, markdown-shape, and length checks while silently replacing an article’s examples, claims, and recommendations with interchangeable product advice.

**How to apply:** Keep the Korean adapter responsible for dates, ids, links, source URLs, and block shape. Add explicit copy for every authored path, fail on missing paths, and run both static editorial validation and live locale-prefixed article routes after copy changes.