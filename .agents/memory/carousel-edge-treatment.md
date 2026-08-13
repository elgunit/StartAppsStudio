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

A faint horizontal band appeared between the card shadow and the pagination dots. Two wrong fixes preceded the real one:

1. **A bottom fade overlay (transparent → canvas hex) cannot fix it** — the carousel sits inside a translucent panel, so even an opaque canvas-colored gradient doesn't match the visible background and paints its own sharp rectangle. Same lesson as failure mode 1, but it applies even with opaque colors when the true backdrop is a blend.
2. **Softening the card box-shadow alone is not enough** — the band persisted.
3. **Real culprit: the left/right edge vignettes terminate at `bottom: 44px` with a hard horizontal cut.** Fix: `mask-image: linear-gradient(to bottom, black 60%, transparent 100%)` on the vignettes so they dissolve before their bottom edge.

**Rule:** every fade/vignette overlay must itself fade out on ALL edges that sit over visible background — an overlay that solves one edge can create a new hard edge where it ends. Also keep `padding-bottom >= shadow offset-y + 2×blur` so shadows dissolve inside the scroller.
