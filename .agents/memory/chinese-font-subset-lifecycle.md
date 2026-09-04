---
name: Chinese font subset lifecycle
description: How to keep self-hosted Chinese fonts complete and cache-safe as localized copy changes.
---

Chinese font subsets must be generated from the complete current Chinese dictionary character set. When that copy changes, regenerate every required weight, give the new files content-hashed names, and update the locale-only font declarations together.

**Why:** CJK source fonts are very large, and remote text-subsetting endpoints may silently return full binaries or segmented generic subsets rather than one optimized file covering the requested copy. Long immutable caching also makes reusing an old filename unsafe.

**How to apply:** Treat Chinese dictionary edits and subset regeneration as one change. Verify both sans and serif faces against representative Chinese text, confirm the rendered route makes no third-party font requests, and keep other locales untouched.