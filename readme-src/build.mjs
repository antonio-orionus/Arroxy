// Build localized README files from template.md + strings.mjs.
//
//   README.md         <- en (canonical)
//   README.{code}.md  <- one per non-en locale
//
// Usage: `node readme-src/build.mjs` (or `npm run build:readme`).

import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { LOCALES } from "./strings.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const TEMPLATE_PATH = resolve(HERE, "template.md");

function assertParity(locales) {
  const en = locales.find((l) => l.code === "en");
  if (!en) throw new Error("English locale missing from registry");
  const enKeys = Object.keys(en.strings).sort();
  for (const loc of locales) {
    const keys = Object.keys(loc.strings).sort();
    const missing = enKeys.filter((k) => !keys.includes(k));
    const extra = keys.filter((k) => !enKeys.includes(k));
    if (missing.length || extra.length) {
      const parts = [];
      if (missing.length) parts.push(`missing: ${missing.join(", ")}`);
      if (extra.length) parts.push(`extra: ${extra.join(", ")}`);
      throw new Error(`Locale "${loc.code}" key drift — ${parts.join("; ")}`);
    }
  }
}

function buildLangNav(currentLoc, locales) {
  return locales
    .map((l) => {
      if (l.code === currentLoc.code) return `**${l.name}**`;
      return `[${l.name}](${l.filename})`;
    })
    .join(" · ");
}

function applyStrings(template, strings) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (!(key in strings)) return match;
    return strings[key];
  });
}

function applyMacros(text, macros) {
  for (const [key, val] of Object.entries(macros)) {
    text = text.replaceAll(`{{${key}}}`, val);
  }
  return text;
}

async function main() {
  assertParity(LOCALES);

  const template = await readFile(TEMPLATE_PATH, "utf8");

  for (const loc of LOCALES) {
    let md = applyStrings(template, loc.strings);
    md = applyMacros(md, {
      LANG_NAV: buildLangNav(loc, LOCALES),
    });

    const outPath = resolve(ROOT, loc.filename);
    await writeFile(outPath, md, "utf8");
    console.log(`  ✓ ${loc.code.padEnd(5)} → ${loc.filename}`);
  }

  console.log(`\nBuilt ${LOCALES.length} READMEs.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
