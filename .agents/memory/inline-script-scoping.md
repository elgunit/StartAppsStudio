---
name: Landing inline-script scoping & enter animations
description: Two recurring failure modes in the single-file landing page's inline JS — IIFE-scoped helpers and rAF-started enter animations.
---

# Inline-script scoping & enter animations (landing page)

**Rule 1:** Global handlers (onclick functions like the showcase toggles) cannot call helpers defined inside other IIFEs on the page (e.g. an `escapeHtml` defined in the journal block). The error only surfaces at interaction time as a silent mid-handler throw — the page loads clean. Prefer `textContent` / attribute updates over building HTML strings so no escaping helper is needed at all.

**Rule 2:** Don't start "display:none → animate in" transitions with double `requestAnimationFrame`. rAF is throttled/deferred in headless browsers and backgrounded tabs, so the animated class lands seconds late or not at all. Force a synchronous reflow instead (`void el.offsetHeight`) between adding the layout class and the animated-state class — deterministic everywhere.

**Why:** The "See more builds" expand silently broke both ways: an out-of-scope `escapeHtml` threw mid-expand (dots never refreshed), and after fixing that, double-rAF delayed the transition past test checkpoints.

**How to apply:** Any new expand/collapse or enter animation in the landing template: use class toggles + forced reflow, keep handler code self-contained, and e2e-test with in-page polling of computed styles rather than fixed waits alone.
