---
name: Landing i18n engine
description: Durable decisions for the multi-locale landing-page localization layer
---

# Landing i18n — durable decisions

**Rule:** Missing translations fall back to English silently by design. After any landing-template copy change, regenerate the translation source inventory and top up every locale; measure coverage through the renderer's own dictionary loader (which drops entries it rejects), never by counting raw JSON entries.

**Why:** Validation and coverage sharing one code path is the only way "100% translated" can be trusted — a stricter loader than the coverage check silently serves English.

**Rule:** Translated values may carry non-inline markup only when their tag sequence is byte-identical to the English source key's — translators change text between tags, never the tags themselves. Void elements (inputs inside labels, images) must be visible to the traversal so their translatable attributes (alt, placeholder, aria-label) are extracted.

**Why:** A blanket inline-tag whitelist either blocks our own authored markup or reopens the stored-XSS sink; skeleton equality permits authored markup while preventing translator-introduced elements/attributes.

**Rule:** A testimonial project header containing inline `<strong>` and `<span>` text is one translation unit keyed by its complete markup; adding only the child phrases does not satisfy locale coverage.

**Why:** The extractor groups the header as a compound unit, so the shared English fallback must contain the exact tag skeleton and normalized spacing.

**Rule:** Explicit-English selection needs its own URL that sets the language cookie; a switcher link to bare `/` cannot override a saved non-English cookie because `/` resolves the cookie before the default.

**Rule:** Treat malformed language-cookie values as absent; decoding an untrusted cookie can throw before route-level error handling and 500 the page.

**Rule:** A locale with complete renderable dictionary coverage is not automatically ready to ship; render representative long and short strings, then perform a linguistic audit for cross-language leakage and unnatural copy.

**Why:** Coverage validates source-key parity and markup safety, but it cannot detect a dictionary that reads as a mixture of closely related languages.

**How to apply:** For every newly added locale, test its explicit URL and `Accept-Language` resolution, review the visible hero and long sales/FAQ copy, and scan for known language-specific leakage before declaring it complete.
