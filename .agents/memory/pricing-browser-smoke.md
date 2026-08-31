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