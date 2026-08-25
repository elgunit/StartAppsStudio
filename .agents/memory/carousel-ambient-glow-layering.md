---
name: Carousel ambient glow layering
description: Keep wide carousel glow outside horizontal scroll clipping.
---

Wide ambient effects should be painted by a positioned, non-scrolling carousel
shell (for example, a pseudo-element behind the scroll track), with a radial
or masked gradient that becomes transparent before the shell boundary. Cards
inside a horizontal scroller should use only short, contained local shadows.

**Why:** A horizontal scroll container clips all painted overflow at its
scrollport edges. Extra padding can move that clipping line but cannot turn a
large card shadow into a smooth fade.

**How to apply:** When a carousel needs a broad colored backdrop or glow,
leave the shell `overflow: visible`, place the ambient gradient on the shell,
stack the scrolling track above it, and keep the card shadow’s spread small
enough to remain inside the track’s padding.