/**
 * Pulls the keys out of every `__t('…')` call in the page's inline scripts.
 *
 * Reading them straight from the template means the runtime payload can never
 * drift from the code: add a `__t()` call and the string is picked up
 * automatically, with no separate list to remember to update.
 */
const T_CALL = /__t\(\s*'((?:[^'\\]|\\.)*)'\s*\)/g;

/** Resolves the JS escape sequences we actually use in the template. */
function unescapeJsSingleQuoted(raw: string): string {
  return raw.replace(/\\(u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|.)/g, (_m, esc: string) => {
    if (esc[0] === "u") return String.fromCharCode(parseInt(esc.slice(1), 16));
    if (esc[0] === "x") return String.fromCharCode(parseInt(esc.slice(1), 16));
    switch (esc) {
      case "n":
        return "\n";
      case "t":
        return "\t";
      case "r":
        return "\r";
      default:
        return esc;
    }
  });
}

/** Unique `__t()` keys, in the order they appear in the document. */
export function extractJsStrings(html: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  T_CALL.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = T_CALL.exec(html)) !== null) {
    const key = unescapeJsSingleQuoted(match[1]);
    // Skip the helper's own definition, which contains no literal.
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}
