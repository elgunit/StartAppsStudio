---
name: Pricing browser smoke
description: Constraints for running the landing page pricing smoke suite locally
---

The pricing browser smoke check is intentionally local-only and requires a
Chromium runtime with the standard GTK, GLib, X11, font, and audio libraries
available in the Replit environment.

**Why:** The project environment does not include a browser binary or its
shared libraries by default, so an otherwise valid Playwright check fails
before it can inspect the page.

**How to apply:** Keep the smoke URL on loopback, keep Playwright development
only, and preserve the declared runtime libraries when refreshing the Replit
environment or moving the check to CI.

The package and browser binary may still be absent from a restored workspace
even when `playwright` is already declared in package.json and the runtime
libraries are present. Install the declared Node package through the workspace
package manager, then run `npx playwright install chromium` before running the
smoke suite; do not weaken or bypass the browser checks.

**Why:** Dependency manifests and the local node_modules/browser cache can be
restored independently, so a clean-looking project can fail before Playwright
launches.

**How to apply:** If the smoke command reports a missing module, restore the
declared package first. If it reports a missing executable, install Chromium
for the checked-in Playwright version.