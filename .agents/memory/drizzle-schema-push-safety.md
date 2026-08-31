---
name: Drizzle schema push safety
description: Why isolated schema changes need an additive migration path in this project
---

When changing only a few fields in the contact model, do not force the interactive Drizzle push if it proposes dropping unrelated application tables. Apply additive `ADD COLUMN IF NOT EXISTS` changes through the development database workflow instead.

**Why:** The schema snapshot does not represent every existing table in the development database, so an unrestricted push can present destructive drop statements for live data that is unrelated to the requested change.

**How to apply:** Inspect the proposed SQL first; preserve unrelated tables and data, and reserve production schema application for the normal publish/migration path.