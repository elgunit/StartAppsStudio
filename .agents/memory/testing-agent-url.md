---
name: Testing development URLs
description: Pin development explicitly and account for remote browsers having a different loopback from the workspace.
---

The Playwright testing subagent once ran an entire verification cycle against the live production domain (startappsstudio.com) instead of the local dev server, producing repeated false failures for changes that only existed locally.

**Why:** The tester picks a base URL from context; if the plan doesn't pin one, it may choose the published site.

**How to apply:** Every test plan must name the development target and forbid production. A browser running inside the workspace can use `http://127.0.0.1:5000`; a remote Browserbase browser needs the actual HTTPS development domain resolved from `REPLIT_DEV_DOMAIN`. Include that explicit fallback rather than letting the tester guess a URL.

**Why:** A remote browser's loopback is not the workspace server. A connection refusal there does not mean the application is down. If results contradict local checks, verify the exact target and browser location before debugging application code.
