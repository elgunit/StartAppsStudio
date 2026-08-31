---
name: Localized pricing drift
description: Why pricing checks must inspect translated values as well as dictionary keys
---

A localization dictionary can retain the current English pricing key while its translated value still contains an older amount. Currency placement and separators vary by locale, so consistency checks should compare normalized amounts rather than raw strings.

**Why:** A French public translation had an old Launch Site amount while the source key and every other pricing surface were current.

**How to apply:** For pricing-related keys, extract currency amounts from both the source key and each locale value, normalize separators and currency placement, and report the exact locale file and key on mismatch.