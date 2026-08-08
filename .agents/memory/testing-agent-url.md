---
name: Testing agent must be given the local dev URL
description: Playwright testing subagent may default to the production domain, invalidating verification of unpublished changes
---

The Playwright testing subagent once ran an entire verification cycle against the live production domain (startappsstudio.com) instead of the local dev server, producing repeated false failures for changes that only existed locally.

**Why:** The tester picks a base URL from context; if the plan doesn't pin one, it may choose the published site.

**How to apply:** Every test plan must state the target explicitly (`http://127.0.0.1:5000`). If results contradict what `curl` against localhost shows, first ask the tester which exact URL it is testing before debugging CSS/code.
