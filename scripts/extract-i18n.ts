/**
 * Development helper: inventories every translatable string in the landing
 * page so the English dictionary is generated from the real markup rather
 * than transcribed by hand.
 *
 * Usage: npx tsx scripts/extract-i18n.ts [--json]
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { extractStrings } from "../server/i18n/localize";

const templatePath = path.resolve(
  process.cwd(),
  "server",
  "templates",
  "desktop-landing.html",
);
const html = fs.readFileSync(templatePath, "utf8");
const found = extractStrings(html);

if (process.argv.includes("--json")) {
  process.stdout.write(JSON.stringify(found, null, 2));
} else {
  found.forEach((item, index) => {
    process.stdout.write(
      `${index + 1}. [${item.kind}] (${item.context})\n${item.value}\n\n`,
    );
  });
  process.stderr.write(`\n${found.length} unique strings\n`);
}
