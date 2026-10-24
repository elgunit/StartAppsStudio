---
name: Chinese font subset lifecycle
description: How to keep self-hosted Chinese fonts complete and cache-safe as localized copy changes.
---

Chinese font subsets must be generated from the complete current Chinese dictionary character set. When that copy changes, regenerate every required weight, give the new files content-hashed names, and update the locale-only font declarations together.

**Why:** CJK source fonts are very large, and remote text-subsetting endpoints may silently return full binaries or segmented generic subsets rather than one optimized file covering the requested copy. Long immutable caching also makes reusing an old filename unsafe.

**How to apply:** Treat Chinese dictionary edits and subset regeneration as one change. Verify both sans and serif faces against representative Chinese text, confirm the rendered route makes no third-party font requests, and keep other locales untouched.

Nix-wrapped FontTools commands may not see the separately installed Brotli Python extension even when both packages are available.

**Why:** Each command's wrapper exposes its own Python module paths, not necessarily the union of the configured Python packages. WOFF2 generation and decoding fail without Brotli.

**How to apply:** Expose the installed Brotli site-packages directory through `PYTHONPATH` for both subsetting and font inspection. Validate Unicode cmap coverage rather than relying only on successful file creation; variation cmap entries do not all have a `code` attribute.