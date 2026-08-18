/**
 * Shared traversal used by BOTH the string extractor and the runtime
 * localiser. Keeping one traversal means the set of strings we hand to
 * translators is exactly the set of strings we later substitute — the two can
 * never drift apart.
 */
import {
  applySplices,
  buildTree,
  isTranslationUnit,
  normalizeKey,
  preserveEdgeWhitespace,
  tokenize,
  type ElementNode,
  type Splice,
} from "./html-tokenizer";
import { TRANSLATABLE_ATTRS } from "./translatable-attrs";

/**
 * Content that must never be translated, identified by CSS class so the
 * template itself stays untouched. These are brand names, avatar initials,
 * technology labels, and numeric prices — translating them would be wrong in
 * every language.
 */
const SKIP_CLASSES = new Set([
  "toolkit-avatar",
  "toolkit-chip-name",
  "hat-badge",
  "tke-avatar",
  "tke-chip-name",
  "price-amount",
  "budget-price",
  "logo-mark",
  "footer-brand-name",
  // Language names are always written in their own language.
  "footer-lang-link",
]);

function classList(node: ElementNode): string[] {
  const cls = node.open.attrs.find((a) => a.name === "class")?.value;
  return cls ? cls.split(/\s+/).filter(Boolean) : [];
}

function isSkipped(node: ElementNode): boolean {
  if (node.open.attrs.some((a) => a.name === "data-i18n-skip")) return true;
  return classList(node).some((c) => SKIP_CLASSES.has(c));
}

/** A unit may not span skipped content, or we would translate brand names. */
function containsSkipped(node: ElementNode): boolean {
  for (const child of node.children) {
    if (child.type !== "element") continue;
    if (isSkipped(child)) return true;
    if (containsSkipped(child)) return true;
  }
  return false;
}

export interface UnitHit {
  /** Whitespace-normalised source string, used as the dictionary key. */
  key: string;
  kind: "unit" | "text" | "attr";
  context: string;
  start: number;
  end: number;
  raw: string;
}

function describe(node: ElementNode): string {
  const cls = classList(node)[0] ?? "";
  const id = node.open.attrs.find((a) => a.name === "id")?.value ?? "";
  return [node.name, id && `#${id}`, cls && `.${cls}`].filter(Boolean).join("");
}

/** Walks the tree and reports every translatable span of the document. */
export function collectHits(html: string, root: ElementNode): UnitHit[] {
  const hits: UnitHit[] = [];

  const visitAttrs = (node: ElementNode) => {
    if (isSkipped(node)) return;
    for (const attr of node.open.attrs) {
      if (!TRANSLATABLE_ATTRS.has(attr.name)) continue;
      if (!attr.value.trim()) continue;
      hits.push({
        key: normalizeKey(attr.value),
        kind: "attr",
        context: `${describe(node)}[${attr.name}]`,
        start: attr.valueStart,
        end: attr.valueEnd,
        raw: attr.value,
      });
    }
  };

  const visitAttrsDeep = (node: ElementNode) => {
    visitAttrs(node);
    for (const child of node.children) {
      if (child.type === "element") visitAttrsDeep(child);
    }
  };

  const walk = (node: ElementNode) => {
    if (node.name !== "#root" && isSkipped(node)) return;

    visitAttrs(node);

    if (node.opaque) return;

    if (
      node.name !== "#root" &&
      isTranslationUnit(html, node) &&
      !containsSkipped(node)
    ) {
      const raw = html.slice(node.innerStart, node.innerEnd);
      hits.push({
        key: normalizeKey(raw),
        kind: "unit",
        context: describe(node),
        start: node.innerStart,
        end: node.innerEnd,
        raw,
      });
      // Descendant attributes still need translating even though the text is
      // handled as one unit.
      for (const child of node.children) {
        if (child.type === "element") visitAttrsDeep(child);
      }
      return;
    }

    for (const child of node.children) {
      if (child.type === "text") {
        const raw = html.slice(child.start, child.end);
        if (!raw.trim()) continue;
        hits.push({
          key: normalizeKey(raw),
          kind: "text",
          context: describe(node),
          start: child.start,
          end: child.end,
          raw,
        });
      } else {
        walk(child);
      }
    }
  };

  walk(root);
  return hits;
}

export function parseHtml(html: string): ElementNode {
  return buildTree(html, tokenize(html));
}

/** Returns the unique translatable strings in document order. */
export function extractStrings(
  html: string,
): Array<{ value: string; kind: UnitHit["kind"]; context: string }> {
  const hits = collectHits(html, parseHtml(html));
  const seen = new Set<string>();
  const out: Array<{ value: string; kind: UnitHit["kind"]; context: string }> =
    [];
  for (const hit of hits) {
    if (!hit.key || seen.has(hit.key)) continue;
    seen.add(hit.key);
    out.push({ value: hit.key, kind: hit.kind, context: hit.context });
  }
  return out;
}

function escapeAttr(value: string): string {
  // Dictionary values keep HTML entities as entities (&amp;, &rarr;, …), so
  // only escape a bare `&` that is not already the start of an entity.
  return value
    .replace(/&(?!(?:[a-zA-Z][a-zA-Z0-9]*|#\d+|#x[0-9a-fA-F]+);)/g, "&amp;")
    .replace(/"/g, "&quot;");
}

/**
 * Applies a dictionary to the document. Strings with no entry are left in
 * English, which is the required fallback behaviour.
 */
export function localizeHtml(
  html: string,
  dictionary: Record<string, string>,
): string {
  const hits = collectHits(html, parseHtml(html));
  const splices: Splice[] = [];

  for (const hit of hits) {
    const translated = dictionary[hit.key];
    if (!translated || translated === hit.key) continue;

    if (hit.kind === "attr") {
      splices.push({
        start: hit.start,
        end: hit.end,
        replacement: escapeAttr(translated),
      });
      continue;
    }

    const { lead, trail } = preserveEdgeWhitespace(hit.raw);
    splices.push({
      start: hit.start,
      end: hit.end,
      replacement: `${lead}${translated}${trail}`,
    });
  }

  return applySplices(html, splices);
}

export { SKIP_CLASSES };
