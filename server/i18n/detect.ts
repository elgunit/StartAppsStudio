/**
 * Chooses the language for a request without ever interrupting the visitor.
 *
 * Precedence:
 *   1. An explicit locale in the URL path (/tr, /ru, …) — shareable and wins.
 *   2. The visitor's saved choice (cookie), set by the footer switcher.
 *   3. The browser's Accept-Language header, best match by quality value.
 *   4. English.
 *
 * Deliberately no IP geolocation: a Turkish speaker in Berlin should get
 * Turkish, and a German speaker in Istanbul should get German.
 */
import { DEFAULT_LOCALE, isSupportedLocale, SUPPORTED_CODES } from "./locales";

export const LOCALE_COOKIE = "sas_lang";
/** One year, in seconds. */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export type LocaleSource = "path" | "cookie" | "header" | "default";

export interface LocaleResolution {
  locale: string;
  source: LocaleSource;
}

/**
 * Maps a browser language tag onto a supported locale.
 * `zh-TW`/`zh-Hant` are intentionally NOT matched to Simplified Chinese —
 * traditional-script readers are better served by English than by the wrong
 * script, and we can add zh-Hant later.
 */
export function matchLanguageTag(tag: string): string | null {
  const normalized = tag.trim().toLowerCase();
  if (!normalized) return null;

  const [base, ...rest] = normalized.split("-");
  const script = rest.find((part) => part.length === 4);
  const region = rest.find((part) => part.length === 2);

  if (base === "zh") {
    if (script === "hant") return null;
    if (region === "tw" || region === "hk" || region === "mo") return null;
    return "zh";
  }

  return SUPPORTED_CODES.includes(base) ? base : null;
}

/** Parses Accept-Language and returns the best supported match. */
export function pickFromAcceptLanguage(header: string | undefined): string | null {
  if (!header) return null;

  const candidates = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const qParam = params.find((p) => p.trim().startsWith("q="));
      const q = qParam ? Number.parseFloat(qParam.trim().slice(2)) : 1;
      return { tag: tag.trim(), q: Number.isFinite(q) ? q : 0 };
    })
    .filter((c) => c.tag && c.q > 0)
    // Stable sort by descending quality so equal-q tags keep header order.
    .map((c, index) => ({ ...c, index }))
    .sort((a, b) => b.q - a.q || a.index - b.index);

  for (const candidate of candidates) {
    if (candidate.tag === "*") continue;
    const match = matchLanguageTag(candidate.tag);
    if (match) return match;
  }
  return null;
}

/** Reads the saved language choice from a raw Cookie header. */
export function readLocaleCookie(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() !== LOCALE_COOKIE) continue;
    let value: string;
    try {
      value = decodeURIComponent(part.slice(eq + 1).trim());
    } catch {
      // Malformed percent-encoding in an untrusted cookie: treat as absent.
      return null;
    }
    return isSupportedLocale(value) ? value : null;
  }
  return null;
}

/** Extracts an explicit locale prefix such as `/tr` or `/tr/` from a path. */
export function localeFromPath(pathname: string): string | null {
  const match = /^\/([a-z-]{2,7})\/?$/i.exec(pathname);
  if (!match) return null;
  const code = match[1].toLowerCase();
  return isSupportedLocale(code) ? code : null;
}

export function resolveLocale(input: {
  path: string;
  cookieHeader?: string;
  acceptLanguage?: string;
}): LocaleResolution {
  const fromPath = localeFromPath(input.path);
  if (fromPath) return { locale: fromPath, source: "path" };

  const fromCookie = readLocaleCookie(input.cookieHeader);
  if (fromCookie) return { locale: fromCookie, source: "cookie" };

  const fromHeader = pickFromAcceptLanguage(input.acceptLanguage);
  if (fromHeader) return { locale: fromHeader, source: "header" };

  return { locale: DEFAULT_LOCALE, source: "default" };
}
