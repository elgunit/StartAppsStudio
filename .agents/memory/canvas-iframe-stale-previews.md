---
name: Canvas iframe stale previews
description: Recovering a canvas mockup iframe that remains blank after its preview server and route have been repaired.
---

When a live canvas mockup iframe previously loaded a 404, it may keep the failed embed even after the route returns a successful page. Update the same frame through `modifying` and back to `live` with a cache-busting query parameter on its valid preview URL, then present the frame again.

**Why:** Fixing the preview server alone did not make the existing canvas embed retry the corrected route.

**How to apply:** First verify the workflow is healthy and capture the preview route directly. Preserve the selected frame and component source; only refresh its iframe state and URL, retaining its suggested actions.