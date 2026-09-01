---
name: Localized pricing drift
description: Why pricing checks must inspect translated values as well as dictionary keys
---

A localization dictionary can retain the current English pricing key while its translated value still contains an older amount. Currency placement and separators vary by locale, so consistency checks should compare normalized amounts rather than raw strings.

**Why:** A French public translation had an old Launch Site amount while the source key and every other pricing surface were current.

**How to apply:** For pricing-related keys, extract currency amounts from both the source key and each locale value, normalize separators and currency placement, and report the exact locale file and key on mismatch.

The pricing-surface scan must exclude nested proof/outcome copy when a testimonial section shares a page wrapper with pricing; currency-like results are not package prices.

**Why:** A nonprofit case-study result such as "$120k raised" was correctly valid testimonial content but was incorrectly reported as a stale public package price.

**How to apply:** Keep the scan boundary anchored to actual offer, budget, contact, and FAQ pricing surfaces, and explicitly remove nested testimonial proof content before checking currency tokens.