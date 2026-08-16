---
name: iOS scroll-container stacking
description: Why z-index on children of a touch-scroll container fails against overlays on iOS Safari, and the fix.
---

# iOS Safari: touch-scroll containers trap child z-index

**Rule:** To layer the contents of a horizontally scrolling (`overflow-x: auto`, `-webkit-overflow-scrolling: touch`) container above a sibling/pseudo-element overlay, put `position: relative; z-index` on the **scroll container itself**, not on the cards inside it.

**Why:** iOS Safari promotes the touch-scroll container to its own composited layer. Child z-index values are then resolved only *within* that layer, so an overlay outside the container (e.g. a `::after` scrim on the wrapper) can paint over the whole track even when the children carry a higher z-index. Desktop browsers and Playwright screenshots may look correct while the real iPhone still shows the overlay on top — a first fix that only bumps child z-index will appear verified but fail on device.

**How to apply:** Whenever a scrim/gradient/fade overlay must sit behind cards in a snap-scroll carousel, set the stacking order between the *scroll container* and the overlay (container z-index > overlay z-index), and keep any floating UI (pagination dots) above both.
