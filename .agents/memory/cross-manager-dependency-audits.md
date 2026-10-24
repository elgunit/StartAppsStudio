---
name: Cross-manager dependency audits
description: Avoid incomplete security fixes when npm and pnpm lockfiles coexist.
---

Audit every tracked lockfile independently after dependency remediation, including the separate mockup artifact.

**Why:** A clean npm audit did not imply a clean project scan. Importing npm's updated lockfile into an existing pnpm lockfile retained older vulnerable transitive versions. npm overrides also need an explicit pnpm counterpart.

**How to apply:** After importing, update affected transitive dependencies in pnpm's lockfile with `pnpm update --lockfile-only --depth Infinity <packages>`, then audit it separately. Keep security overrides consistent across package managers.
