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

// Reports drift per non-en locale. In strict mode any drift throws; otherwise
// missing/extra keys for non-en locales are warnings — the build falls back
// to en for missing keys and ignores extras. The en locale is always
// validated as the source of truth (never tolerated to drift).
function checkParity(locales, { strict }) {
  const en = locales.find((l) => l.code === "en");
  if (!en) throw new Error("English locale missing from registry");
  const enKeys = Object.keys(en.strings).sort();
  const enKeySet = new Set(enKeys);
  let driftCount = 0;
  for (const loc of locales) {
    if (loc.code === "en") continue;
    const keys = Object.keys(loc.strings).sort();
    const keySet = new Set(keys);
    const missing = enKeys.filter((k) => !keySet.has(k));
    const extra = keys.filter((k) => !enKeySet.has(k));
    if (!missing.length && !extra.length) continue;
    driftCount++;
    const parts = [];
    if (missing.length) parts.push(`missing: ${missing.join(", ")}`);
    if (extra.length) parts.push(`extra: ${extra.join(", ")}`);
    const msg = `Locale "${loc.code}" key drift — ${parts.join("; ")}`;
    if (strict) throw new Error(msg);
    console.warn(`  ⚠ ${msg}`);
  }
  if (driftCount && !strict) {
    console.warn(
      `\n  ⚠ ${driftCount} locale(s) drift from en. Build continued with en fallback for missing keys; extras ignored.`,
    );
    console.warn(
      `  Run \`bun run check:readme\` (or \`bun readme-src/build.mjs --strict\`) before pushing to fail on drift.\n`,
    );
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

function applyStrings(template, strings, fallback = {}) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (key in strings) return strings[key];
    if (key in fallback) return fallback[key];
    return match;
  });
}

function applyMacros(text, macros) {
  for (const [key, val] of Object.entries(macros)) {
    text = text.replaceAll(`{{${key}}}`, val);
  }
  return text;
}

async function main() {
  const strict = process.argv.includes("--strict");
  checkParity(LOCALES, { strict });

  const template = await readFile(TEMPLATE_PATH, "utf8");
  const en = LOCALES.find((l) => l.code === "en");
  const enStrings = en?.strings ?? {};

  for (const loc of LOCALES) {
    let md = applyStrings(template, loc.strings, enStrings);
    md = applyMacros(md, {
      LANG_NAV: buildLangNav(loc, LOCALES),
    });
    md = md.replace(/\n{3,}/g, "\n\n");

    const outPath = resolve(ROOT, loc.filename);
    await writeFile(outPath, md, "utf8");
    console.log(`  ✓ ${loc.code.padEnd(5)} → ${loc.filename}`);
  }

  console.log(`\nBuilt ${LOCALES.length} READMEs.${strict ? " (strict)" : ""}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
