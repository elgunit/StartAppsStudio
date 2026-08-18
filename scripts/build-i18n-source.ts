/**
 * Regenerates the canonical list of translatable English strings from the
 * live template. Run this after editing landing-page copy, then top up each
 * locale file with any newly added keys.
 *
 * Usage: npx tsx scripts/build-i18n-source.ts
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { extractStrings } from "../server/i18n/localize";
import { extractJsStrings } from "../server/i18n/js-strings";
import { collectMetaStrings } from "../server/i18n/meta";
import { loadDictionary } from "../server/i18n/render";
import { SUPPORTED_CODES, DEFAULT_LOCALE } from "../server/i18n/locales";

const root = process.cwd();
const templatePath = path.resolve(
  root,
  "server",
  "templates",
  "desktop-landing.html",
);
const stringsDir = path.resolve(root, "server", "i18n", "strings");

const html = fs.readFileSync(templatePath, "utf8");

interface SourceEntry {
  key: string;
  kind: "unit" | "text" | "attr" | "js" | "meta";
  context: string;
}

const entries: SourceEntry[] = extractStrings(html).map((s) => ({
  key: s.value,
  kind: s.kind,
  context: s.context,
}));

const seen = new Set(entries.map((e) => e.key));
for (const key of extractJsStrings(html)) {
  if (seen.has(key)) continue;
  seen.add(key);
  entries.push({ key, kind: "js", context: "inline script" });
}
for (const key of collectMetaStrings(html)) {
  if (seen.has(key)) continue;
  seen.add(key);
  entries.push({ key, kind: "meta", context: "head metadata / JSON-LD" });
}

fs.mkdirSync(stringsDir, { recursive: true });
fs.writeFileSync(
  path.join(stringsDir, "_source.json"),
  JSON.stringify(entries, null, 2) + "\n",
  "utf8",
);

// Report coverage using the renderer's own loader, so entries the renderer
// rejects (unsafe markup) count as missing rather than translated.
const report: string[] = [];
let problems = 0;
for (const code of SUPPORTED_CODES) {
  if (code === DEFAULT_LOCALE) continue;
  const file = path.join(stringsDir, `${code}.json`);
  if (!fs.existsSync(file)) {
    report.push(`${code}: missing (${entries.length} untranslated)`);
    problems++;
    continue;
  }
  const raw = JSON.parse(fs.readFileSync(file, "utf8")) as Record<
    string,
    string
  >;
  const dict = loadDictionary(code); // renderer view: unsafe entries dropped
  const missing = entries.filter((e) => !dict[e.key]);
  const rejected = entries.filter((e) => raw[e.key] && !dict[e.key]);
  const stale = Object.keys(raw).filter((k) => !seen.has(k));
  if (missing.length || rejected.length) problems++;
  report.push(
    `${code}: ${entries.length - missing.length}/${entries.length} renderable` +
      (missing.length ? `, ${missing.length} missing` : "") +
      (rejected.length ? `, ${rejected.length} REJECTED as unsafe` : "") +
      (stale.length ? `, ${stale.length} stale` : ""),
  );
  for (const e of rejected) {
    report.push(`  ${code} rejected: ${e.key.slice(0, 100)}`);
  }
}

process.stdout.write(
  `${entries.length} source strings written to server/i18n/strings/_source.json\n` +
    report.join("\n") +
    "\n",
);
process.exitCode = problems > 0 ? 1 : 0;
