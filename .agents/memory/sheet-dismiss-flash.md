---
name: Bottom-sheet dismiss flash
description: Why swipe-dismissing a bottom sheet made the section behind it visibly re-animate, and the lock pattern that avoids it
---

# Bottom-sheet dismiss flash

**Rule:** Don't use the position:fixed body-pin scroll lock for an overlay that already blocks page scrolling with its own non-passive `touchmove` preventDefault handler. Use a plain `overflow:hidden` lock on html+body instead — no scroll restore needed on unlock.

**Why:** The body-pin pattern (`position:fixed; top:-scrollY` → restore + `window.scrollTo`) forces a full-page re-layout and a scroll jump on unlock. That jump re-fires the scroll-reveal IntersectionObserver, so already-revealed cards behind the sheet replay their opacity/translate entrance — a visible "refresh" flash right where the user is looking.

**How to apply:** Sheets/modals with their own touchmove blocking get the light overflow lock. If a pinned lock is unavoidable (modals without touch handling), disconnect the reveal observer before `scrollTo` and re-observe only the not-yet-revealed elements two rAFs later.
