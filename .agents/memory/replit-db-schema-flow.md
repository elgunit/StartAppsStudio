---
name: Replit database schema flow
description: Managed PostgreSQL schema changes should come from the Drizzle source and Replit's development/publish flow, not new startup-time DDL.
---

Keep new managed-Postgres tables and columns in the schema source of truth. Apply additive changes to development through the supported dev database flow, then let Publish diff the development schema into production. Do not add application-startup DDL or direct production migration scripts.

**Why:** Replit's managed database flow handles production schema diffs and rename confirmation during Publish; startup-time DDL can leave production schema changes outside that safety path.

**How to apply:** When a feature needs new tables or columns, update the schema, apply and verify it in development, and tell the user to republish before relying on the new schema in production.