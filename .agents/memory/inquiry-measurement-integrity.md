---
name: Inquiry measurement integrity
description: Rules for treating website inquiry analytics as credible demand evidence.
---

Count a contact inquiry only after the server confirms that it saved the submission. Keep CTA clicks and failed attempts separate, and never send names, email addresses, or message text into analytics.

**Why:** Valuation and business decisions depend on real demand; logging before persistence can make failed form attempts look like leads.

**How to apply:** When changing inquiry tracking or analytics reports, verify the database write succeeded before emitting a saved-inquiry event. Treat older events recorded before this distinction as ambiguous.
