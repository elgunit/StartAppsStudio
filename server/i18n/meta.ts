/**
 * Localizes head metadata the HTML walker cannot reach:
 *   - <meta … content="…"> values (description, Open Graph, Twitter)
 *   - JSON-LD structured data (script blocks are opaque to the tokenizer)
 *
 * Both use the same dictionaries as the visible page. JSON-LD keys are looked
 * up entity-decoded because JSON text is raw while HTML dictionary keys may
 * carry entities.
 */

/** Meta tags whose content is human-readable and locale-specific. */
const META_SELECTORS =
  /(<meta (?:name|property)="(?:description|og:title|og:description|og:image:alt|twitter:title|twitter:description|twitter:image:alt)" content=")([^"]*)(")/g;

/** JSON-LD fields containing human-readable text. */
const JSONLD_TEXT_KEYS = new Set([
  "name",
  "description",
  "text",
  "serviceType",
  "areaServed",
]);

const JSONLD_BLOCK =
  /(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g;

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function encodeForAttr(s: string): string {
  return s
    .replace(/&(?!(?:[a-zA-Z][a-zA-Z0-9]*|#\d+|#x[0-9a-fA-F]+);)/g, "&amp;")
    .replace(/"/g, "&quot;");
}

/** All translatable meta-content and JSON-LD strings in the document. */
export function collectMetaStrings(html: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (value: string) => {
    const key = value.replace(/\s+/g, " ").trim();
    if (!key || seen.has(key)) return;
    seen.add(key);
    out.push(key);
  };

  META_SELECTORS.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = META_SELECTORS.exec(html)) !== null) {
    push(m[2]);
  }

  JSONLD_BLOCK.lastIndex = 0;
  while ((m = JSONLD_BLOCK.exec(html)) !== null) {
    try {
      const data = JSON.parse(m[2]) as unknown;
      walkJsonLd(data, (value) => {
        push(value);
        return value;
      });
    } catch {
      // Malformed block: leave it alone.
    }
  }

  return out;
}

/** Depth-first walk that lets the caller replace text values. */
function walkJsonLd(
  node: unknown,
  visit: (value: string) => string,
  parentKey?: string,
): unknown {
  if (Array.isArray(node)) {
    return node.map((item) =>
      typeof item === "string" && parentKey === "knowsAbout"
        ? visit(item)
        : walkJsonLd(item, visit, parentKey),
    );
  }
  if (node && typeof node === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(node)) {
      if (typeof value === "string" && JSONLD_TEXT_KEYS.has(key)) {
        out[key] = visit(value);
      } else {
        out[key] = walkJsonLd(value, visit, key);
      }
    }
    return out;
  }
  return node;
}

/**
 * Applies the dictionary to meta content values and JSON-LD blocks.
 * Untranslated strings stay English (standard fallback).
 */
export function localizeMeta(
  html: string,
  dictionary: Record<string, string>,
): string {
  const lookup = (raw: string): string | null => {
    const key = raw.replace(/\s+/g, " ").trim();
    if (dictionary[key]) return dictionary[key];
    // JSON-LD text is unescaped; dictionary keys may carry HTML entities.
    for (const candidate of Object.keys(dictionary)) {
      if (decodeEntities(candidate) === key) return dictionary[candidate];
    }
    return null;
  };

  let out = html.replace(
    META_SELECTORS,
    (_all, before: string, value: string, after: string) => {
      const translated = lookup(value);
      return translated
        ? `${before}${encodeForAttr(decodeEntities(translated))}${after}`
        : `${before}${value}${after}`;
    },
  );

  out = out.replace(
    JSONLD_BLOCK,
    (all, open: string, body: string, close: string) => {
      try {
        const data = JSON.parse(body) as unknown;
        const translated = walkJsonLd(data, (value) => {
          const hit = lookup(value);
          return hit ? decodeEntities(hit) : value;
        });
        const json = JSON.stringify(translated, null, 2).replace(
          /</g,
          "\\u003c",
        );
        return `${open}\n    ${json.split("\n").join("\n    ")}\n    ${close}`;
      } catch {
        return all;
      }
    },
  );

  return out;
}
