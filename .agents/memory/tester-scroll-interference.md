---
name: Testing agent interferes with scroll animations
description: Playwright-based tester auto-scrolls and retries clicks, corrupting custom scroll-animation tests; how to test them reliably.
---

# Testing agent interferes with custom scroll animations

The rule: when asking the testing agent to verify custom JS scroll animations (eased anchor scrolling, carousels), instruct it to perform exactly ONE click and then do absolutely nothing — no screenshots, no extra evaluates, no element queries — until the final read. Collect data via pre-injected in-page instrumentation (setInterval samplers, monkey-patched scrollTo) and read it in a single evaluate at the end.

**Why:** Playwright clicks auto-scroll the element into view first and may silently retry clicks. During a warm anchor-scroll test this scrolled the page back to top mid-animation and re-triggered the handler, producing false failures ("scroll stopped short") in an implementation that was actually correct. Two runs of the same feature: interference → fail, clean instrumentation-only run → perfect landing.

**How to apply:** For any scroll/animation verification, write the test plan with explicit "take NO screenshots and perform NO page interactions between the click and the final read" language, and diagnose disputed failures with a monkey-patch trace (scrollTo/scrollIntoView/focus/hashchange logging) before changing code.

Related durable detail: custom eased anchor scrolls on pages with scroll-reveal animations must re-measure the target position on every tick — a distance snapshotted at click time lands short when below-the-fold reveals shift layout mid-scroll.
