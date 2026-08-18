/**
 * Attributes whose values are shown to the visitor (directly, or through the
 * showcase modal that reads them back out of the DOM) and therefore need
 * translating. Anything not listed here is left untouched.
 */
export const TRANSLATABLE_ATTRS = new Set([
  "alt",
  "aria-label",
  "data-category",
  "data-name",
  "data-problem",
  "data-result",
  "data-solution",
  "placeholder",
  "title",
]);
