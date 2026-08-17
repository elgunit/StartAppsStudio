---
name: Mobile carousel edge treatment
description: Why edge-fade overlays and vw-based card widths broke the mobile project carousel, and the rules that finally fixed it.
---

# Mobile carousel edge treatment (landing page project showcase)

Three interacting failure modes produced a recurring "ugly cutoff" bug that survived two fix attempts:

1. **Translucent-token gradients cannot act as edge fades.** `--surface` is `rgba(255,255,255,.62)` — a gradient from it to transparent can never fully cover a card, so the overlay reads as a grey veil with a sharp inner edge, not a fade. Rule: never build cover/fade overlays from translucent design tokens; either use an opaque color that matches the visible background, or drop the overlay entirely.
2. **`overflow: hidden` on any wrapper around the scroller clips card box-shadows** into a hard rectangle. Rule: wrappers stay `overflow: visible`; give the scroll container itself enough bottom padding (~32px) so shadows fade out inside its padding box.
3. **vw-based card widths overflow the panel.** The carousel lives inside a padded white panel narrower than the viewport, so `min-width: 84vw` made cards wider than the panel's inner width and they were physically clipped at both edges. Rule: size carousel cards against the container (`width: min(calc(100% - 48px), 340px)`), never against the viewport.

**Why:** each symptom looked like a different bug (detached band, moving rectangle, grey strip, clipped edges), causing repeated wrong fixes that reshuffled the overlay instead of removing the root causes.

**How to apply:** any horizontal snap carousel inside a padded panel on this site — no fade overlays from translucent tokens, no overflow:hidden wrappers, container-relative card widths, endpoint spacers matched to the card width formula.

## Bottom-edge band (fourth failure mode, fixed Aug 2026)

A shadow band kept appearing between the card bottom and the pagination dots, surviving several fixes:

1. **Root cause: a late global liquid-glass rule re-applied the heavy desktop shadow (`var(--shadow)` = 0 18px 55px) to `.showcase-card` with `!important`**, silently defeating the soft mobile shadow set in the carousel media query. Tuning the carousel rules could never work while that override stood. Fix: re-assert the soft mobile shadow with `!important` *later in source* inside a max-width media query.
2. The left/right edge vignettes also terminated at `bottom: 44px` with a hard horizontal cut — fixed with `mask-image: linear-gradient(to bottom, black 60%, transparent 100%)` so they dissolve before their bottom edge.
3. ~~A bottom scrim on `.showcase-carousel-wrap::after`~~ — **disproven Aug 2026**: the carousel sits on the section's translucent glass panel (`.section::before` with backdrop-filter), NOT bare opaque canvas, so any canvas-coloured scrim (hardcoded or `var(--canvas)`) paints a visible band, worst in dark mode. The user reported it twice. Final fix: **delete the scrim entirely** — the soft mobile card shadow (0 4px 14px) dissolves on its own inside the grid's 44px bottom padding; nothing needs covering.

**Rules:**
- When a shadow "won't soften," grep for later `!important` rules on the same selector before touching layout — the glass-styling blocks near the end of the stylesheet override component rules.
- Every fade/vignette overlay must itself fade out on ALL edges that sit over visible background.
- Cover scrims are only safe when their solid edge coincides with an element boundary over the same opaque background color. On this site the showcase section background is translucent glass, so NO bottom scrim can ever match it — do not reintroduce one; rely on soft shadows + padding instead.
- Keep `padding-bottom >= shadow offset-y + 2×blur` so shadows dissolve inside the scroller.
