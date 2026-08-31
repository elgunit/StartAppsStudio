/**
 * Supported locales for the landing page.
 *
 * URL strategy:
 *   /            → auto-detected (cookie, then Accept-Language), x-default
 *   /az /tr /ru /zh
 *   /fr /es /de  → explicit, shareable, self-canonical
 *
 * English is always the fallback: any string missing from a dictionary is
 * rendered in English rather than left blank.
 */
export const DEFAULT_LOCALE = "en";

export interface LocaleDefinition {
  /** Short code used in the URL path and the cookie. */
  code: string;
  /** English language name used in machine-readable coverage statements. */
  englishName: string;
  /** Value for <html lang>. */
  htmlLang: string;
  /** BCP 47 tag handed to toLocaleDateString in the browser. */
  dateLocale: string;
  /** Value for og:locale. */
  ogLocale: string;
  /** hreflang value. */
  hreflang: string;
  /** Name shown in the footer switcher, in the language itself. */
  nativeName: string;
  /** Text direction; all launch languages are LTR. */
  dir: "ltr" | "rtl";
}

export const LOCALES: LocaleDefinition[] = [
  {
    code: "en",
    englishName: "English",
    htmlLang: "en",
    dateLocale: "en-US",
    ogLocale: "en_US",
    hreflang: "en",
    nativeName: "English",
    dir: "ltr",
  },
  {
    code: "az",
    englishName: "Azerbaijani",
    htmlLang: "az",
    dateLocale: "az-AZ",
    ogLocale: "az_AZ",
    hreflang: "az",
    nativeName: "Azərbaycanca",
    dir: "ltr",
  },
  {
    code: "tr",
    englishName: "Turkish",
    htmlLang: "tr",
    dateLocale: "tr-TR",
    ogLocale: "tr_TR",
    hreflang: "tr",
    nativeName: "Türkçe",
    dir: "ltr",
  },
  {
    code: "ru",
    englishName: "Russian",
    htmlLang: "ru",
    dateLocale: "ru-RU",
    ogLocale: "ru_RU",
    hreflang: "ru",
    nativeName: "Русский",
    dir: "ltr",
  },
  {
    code: "zh",
    englishName: "Simplified Chinese",
    htmlLang: "zh-Hans",
    dateLocale: "zh-CN",
    ogLocale: "zh_CN",
    hreflang: "zh-Hans",
    nativeName: "简体中文",
    dir: "ltr",
  },
  {
    code: "fr",
    englishName: "French",
    htmlLang: "fr",
    dateLocale: "fr-FR",
    ogLocale: "fr_FR",
    hreflang: "fr",
    nativeName: "Français",
    dir: "ltr",
  },
  {
    code: "es",
    englishName: "Spanish",
    htmlLang: "es",
    dateLocale: "es-ES",
    ogLocale: "es_ES",
    hreflang: "es",
    nativeName: "Español",
    dir: "ltr",
  },
  {
    code: "de",
    englishName: "German",
    htmlLang: "de",
    dateLocale: "de-DE",
    ogLocale: "de_DE",
    hreflang: "de",
    nativeName: "Deutsch",
    dir: "ltr",
  },
  {
    code: "uk",
    englishName: "Ukrainian",
    htmlLang: "uk",
    dateLocale: "uk-UA",
    ogLocale: "uk_UA",
    hreflang: "uk",
    nativeName: "Українська",
    dir: "ltr",
  },
  {
    code: "it",
    englishName: "Italian",
    htmlLang: "it",
    dateLocale: "it-IT",
    ogLocale: "it_IT",
    hreflang: "it",
    nativeName: "Italiano",
    dir: "ltr",
  },
];

const BY_CODE = new Map(LOCALES.map((l) => [l.code, l]));

export const SUPPORTED_CODES = LOCALES.map((l) => l.code);

/** Non-default locales, i.e. the ones that own a URL prefix. */
export const PREFIXED_CODES = SUPPORTED_CODES.filter(
  (c) => c !== DEFAULT_LOCALE,
);

/** The languages represented by the public landing-page experience. */
export const SUPPORTED_LANGUAGE_NAMES = LOCALES.map(
  (locale) => locale.englishName,
);

/** Confirmed service geography and delivery model; this is not a local-office claim. */
export const SERVICE_AREA = "Worldwide";
export const DELIVERY_MODEL = "Remote delivery worldwide";

export function isSupportedLocale(code: string | undefined | null): boolean {
  return !!code && BY_CODE.has(code);
}

export function getLocale(code: string | undefined | null): LocaleDefinition {
  return (code && BY_CODE.get(code)) || BY_CODE.get(DEFAULT_LOCALE)!;
}

/** Canonical site origin used for canonical + hreflang URLs. */
export const SITE_ORIGIN = "https://startappsstudio.com";

export function localeUrl(code: string): string {
  return code === DEFAULT_LOCALE ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}/${code}`;
}

/** Path (not absolute URL) the language switcher should link to. */
export function localePath(code: string): string {
  return code === DEFAULT_LOCALE ? "/" : `/${code}`;
}
