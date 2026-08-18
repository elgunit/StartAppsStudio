/**
 * A minimal, position-preserving HTML tokenizer.
 *
 * Why not a real DOM parser? The landing page is a single ~9,900-line
 * hand-authored document with inline CSS/JS, SVG, and carefully tuned
 * whitespace. Parsing and re-serialising it with a general-purpose library
 * risks silent, hard-to-spot changes (entity re-encoding, attribute
 * reordering, self-closing-tag normalisation).
 *
 * Instead we tokenise into byte ranges and only ever apply *splices* to the
 * original string. Every byte we do not explicitly target is preserved
 * exactly, which makes localisation a provably narrow transformation.
 */

/** Elements that never have a closing tag. */
const VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

/**
 * Elements whose contents must be treated as an opaque blob. Their text is
 * either code (script/style), vector data (svg), or whitespace-sensitive
 * (pre/textarea), so the text-node walker must never touch it.
 */
const OPAQUE_ELEMENTS = new Set(["script", "style", "svg", "pre", "textarea"]);

/**
 * Inline elements that may appear *inside* a single translatable phrase.
 * An element containing only these can be translated as one unit, which keeps
 * word order correct in languages that reorder clauses.
 */
const INLINE_ELEMENTS = new Set([
  "a",
  "abbr",
  "b",
  "br",
  "code",
  "em",
  "i",
  "mark",
  "small",
  "span",
  "strong",
  "sub",
  "sup",
  "u",
]);

export interface ParsedAttr {
  name: string;
  /** Byte offset of the first character of the attribute value. */
  valueStart: number;
  /** Byte offset one past the last character of the attribute value. */
  valueEnd: number;
  value: string;
}

export interface TagToken {
  kind: "tag";
  name: string;
  closing: boolean;
  selfClosing: boolean;
  start: number;
  end: number;
  attrs: ParsedAttr[];
}

export interface TextToken {
  kind: "text";
  start: number;
  end: number;
}

export interface OtherToken {
  kind: "other";
  start: number;
  end: number;
}

export type Token = TagToken | TextToken | OtherToken;

export interface ElementNode {
  type: "element";
  name: string;
  open: TagToken;
  /** Byte offset where the element's inner content begins. */
  innerStart: number;
  /** Byte offset where the element's inner content ends. */
  innerEnd: number;
  opaque: boolean;
  children: TreeNode[];
}

export interface TextNode {
  type: "text";
  start: number;
  end: number;
}

export type TreeNode = ElementNode | TextNode;

function isNameChar(ch: string): boolean {
  return /[A-Za-z0-9:_.-]/.test(ch);
}

/**
 * Parses a single tag beginning at `<`. Attribute scanning is quote-aware, so
 * a `>` inside an attribute value does not terminate the tag.
 */
function parseTag(html: string, start: number): TagToken {
  let i = start + 1;
  let closing = false;
  if (html[i] === "/") {
    closing = true;
    i++;
  }

  const nameStart = i;
  while (i < html.length && isNameChar(html[i])) i++;
  const name = html.slice(nameStart, i).toLowerCase();

  const attrs: ParsedAttr[] = [];
  let selfClosing = false;

  while (i < html.length) {
    while (i < html.length && /\s/.test(html[i])) i++;
    if (i >= html.length) break;

    if (html[i] === "/") {
      selfClosing = true;
      i++;
      continue;
    }
    if (html[i] === ">") {
      i++;
      break;
    }

    const attrNameStart = i;
    while (i < html.length && !/[\s=>/]/.test(html[i])) i++;
    const attrName = html.slice(attrNameStart, i).toLowerCase();
    if (!attrName) {
      i++;
      continue;
    }

    while (i < html.length && /\s/.test(html[i])) i++;

    if (html[i] !== "=") {
      // Valueless attribute (e.g. `async`, `hidden`).
      attrs.push({ name: attrName, valueStart: i, valueEnd: i, value: "" });
      continue;
    }

    i++; // consume '='
    while (i < html.length && /\s/.test(html[i])) i++;

    const quote = html[i];
    if (quote === '"' || quote === "'") {
      i++;
      const valueStart = i;
      while (i < html.length && html[i] !== quote) i++;
      const valueEnd = i;
      i++; // consume closing quote
      attrs.push({
        name: attrName,
        valueStart,
        valueEnd,
        value: html.slice(valueStart, valueEnd),
      });
    } else {
      const valueStart = i;
      while (i < html.length && !/[\s>]/.test(html[i])) i++;
      const valueEnd = i;
      attrs.push({
        name: attrName,
        valueStart,
        valueEnd,
        value: html.slice(valueStart, valueEnd),
      });
    }
  }

  return { kind: "tag", name, closing, selfClosing, start, end: i, attrs };
}

/** Finds the index of the closing tag for an opaque element. */
function findOpaqueEnd(html: string, name: string, from: number): number {
  const needle = `</${name}`;
  const idx = html.toLowerCase().indexOf(needle, from);
  return idx === -1 ? html.length : idx;
}

export function tokenize(html: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < html.length) {
    const lt = html.indexOf("<", i);
    if (lt === -1) {
      tokens.push({ kind: "text", start: i, end: html.length });
      break;
    }
    if (lt > i) {
      tokens.push({ kind: "text", start: i, end: lt });
    }

    if (html.startsWith("<!--", lt)) {
      const close = html.indexOf("-->", lt + 4);
      const end = close === -1 ? html.length : close + 3;
      tokens.push({ kind: "other", start: lt, end });
      i = end;
      continue;
    }

    if (html[lt + 1] === "!" || html[lt + 1] === "?") {
      const close = html.indexOf(">", lt);
      const end = close === -1 ? html.length : close + 1;
      tokens.push({ kind: "other", start: lt, end });
      i = end;
      continue;
    }

    if (!isNameChar(html[lt + 1] ?? "") && html[lt + 1] !== "/") {
      // A stray `<` that is not markup.
      tokens.push({ kind: "text", start: lt, end: lt + 1 });
      i = lt + 1;
      continue;
    }

    const tag = parseTag(html, lt);
    tokens.push(tag);
    i = tag.end;

    // Skip the body of opaque elements wholesale.
    if (
      !tag.closing &&
      !tag.selfClosing &&
      OPAQUE_ELEMENTS.has(tag.name) &&
      tag.name !== "svg"
    ) {
      const bodyEnd = findOpaqueEnd(html, tag.name, i);
      if (bodyEnd > i) {
        tokens.push({ kind: "other", start: i, end: bodyEnd });
      }
      i = bodyEnd;
    }
  }

  return tokens;
}

/**
 * Builds a lightweight element tree from tokens. Unclosed or mismatched tags
 * are tolerated: we only unwind the stack when a matching open tag exists.
 */
export function buildTree(html: string, tokens: Token[]): ElementNode {
  const root: ElementNode = {
    type: "element",
    name: "#root",
    open: {
      kind: "tag",
      name: "#root",
      closing: false,
      selfClosing: false,
      start: 0,
      end: 0,
      attrs: [],
    },
    innerStart: 0,
    innerEnd: html.length,
    opaque: false,
    children: [],
  };

  const stack: ElementNode[] = [root];

  for (const token of tokens) {
    const parent = stack[stack.length - 1];

    if (token.kind === "text") {
      parent.children.push({ type: "text", start: token.start, end: token.end });
      continue;
    }
    if (token.kind === "other") continue;

    if (token.closing) {
      // Unwind only if this tag was actually opened somewhere up the stack.
      let depth = -1;
      for (let d = stack.length - 1; d >= 1; d--) {
        if (stack[d].name === token.name) {
          depth = d;
          break;
        }
      }
      if (depth === -1) continue;
      for (let d = stack.length - 1; d >= depth; d--) {
        stack[d].innerEnd = d === depth ? token.start : token.start;
        stack.pop();
      }
      continue;
    }

    if (VOID_ELEMENTS.has(token.name) || token.selfClosing) {
      // Void elements carry no children but may carry translatable
      // attributes (img[alt], input[placeholder], …), so they must exist in
      // the tree for the attribute walker to visit them.
      parent.children.push({
        type: "element",
        name: token.name,
        open: token,
        innerStart: token.end,
        innerEnd: token.end,
        opaque: false,
        children: [],
      });
      continue;
    }

    const node: ElementNode = {
      type: "element",
      name: token.name,
      open: token,
      innerStart: token.end,
      innerEnd: token.end,
      opaque: OPAQUE_ELEMENTS.has(token.name),
      children: [],
    };
    parent.children.push(node);
    stack.push(node);
  }

  // Close anything still open at EOF.
  while (stack.length > 1) {
    const node = stack.pop()!;
    node.innerEnd = Math.max(node.innerEnd, node.innerStart);
  }

  return root;
}

/**
 * True when an element's entire content is a single translatable phrase:
 * it has visible text and any element children are purely inline formatting.
 */
export function isTranslationUnit(html: string, node: ElementNode): boolean {
  if (node.opaque || node.name === "#root") return false;

  let hasText = false;
  for (const child of node.children) {
    if (child.type === "text") {
      if (html.slice(child.start, child.end).trim()) hasText = true;
    } else {
      // Void elements (input, img, br, …) have no text of their own and are
      // carried through units verbatim, exactly as when they were invisible
      // to the tree — this keeps historical dictionary keys stable.
      if (VOID_ELEMENTS.has(child.name)) continue;
      if (!INLINE_ELEMENTS.has(child.name)) return false;
      if (child.opaque) return false;
      if (!elementHasOnlyInlineDescendants(html, child)) return false;
      if (textContent(html, child).trim()) hasText = true;
    }
  }
  return hasText;
}

function elementHasOnlyInlineDescendants(
  html: string,
  node: ElementNode,
): boolean {
  for (const child of node.children) {
    if (child.type === "text") continue;
    if (VOID_ELEMENTS.has(child.name)) continue;
    if (!INLINE_ELEMENTS.has(child.name)) return false;
    if (!elementHasOnlyInlineDescendants(html, child)) return false;
  }
  return true;
}

export function textContent(html: string, node: ElementNode): string {
  let out = "";
  for (const child of node.children) {
    if (child.type === "text") out += html.slice(child.start, child.end);
    else out += textContent(html, child);
  }
  return out;
}

/** Collapses whitespace runs so source line-wrapping never affects lookups. */
export function normalizeKey(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

export interface Splice {
  start: number;
  end: number;
  replacement: string;
}

/** Applies splices to the source string, right-to-left so offsets stay valid. */
export function applySplices(source: string, splices: Splice[]): string {
  const ordered = [...splices].sort((a, b) => a.start - b.start);

  // Drop any splice that overlaps an earlier one; the outermost wins.
  const safe: Splice[] = [];
  let lastEnd = -1;
  for (const splice of ordered) {
    if (splice.start < lastEnd) continue;
    safe.push(splice);
    lastEnd = splice.end;
  }

  let out = "";
  let cursor = 0;
  for (const splice of safe) {
    out += source.slice(cursor, splice.start);
    out += splice.replacement;
    cursor = splice.end;
  }
  out += source.slice(cursor);
  return out;
}

/** Splits leading/trailing whitespace so replacements keep original spacing. */
export function preserveEdgeWhitespace(raw: string): {
  lead: string;
  trail: string;
} {
  const lead = /^\s*/.exec(raw)?.[0] ?? "";
  const trail = raw.trim() ? (/\s*$/.exec(raw)?.[0] ?? "") : "";
  return { lead, trail };
}

export { INLINE_ELEMENTS, OPAQUE_ELEMENTS, VOID_ELEMENTS };
