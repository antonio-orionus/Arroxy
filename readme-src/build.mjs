// Build localized README files from template.md + strings.mjs.
//
//   README.md                     <- en (canonical)
//   docs/readme/README.{code}.md  <- one per non-en locale
//
// Usage: `node readme-src/build.mjs` (or `npm run build:readme`).

import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, posix, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { LOCALES } from "./strings.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const TEMPLATE_PATH = resolve(HERE, "template.md");

// The "Last updated" stamp is derived, never hand-written. Each README keeps the
// date of the last build that actually changed its content: the freshly rendered
// text carries STAMP_TOKEN where the date goes, and the file already on disk is
// normalized the same way before comparison. Equal content -> reuse the old date,
// so `bun run check` (which rebuilds every README) never churns the working tree.
const STAMP_TOKEN = "__ARROXY_LAST_UPDATED__";
const STAMP_SENTINEL = `_Last updated: ${STAMP_TOKEN}._`;
const STAMP_RE = /_Last updated: ([^_]*)\._/;

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

// Returns the date to stamp plus whether it moved, given the previous file (if any).
function resolveStamp(rendered, previous) {
  const prevDate = previous?.match(STAMP_RE)?.[1];
  if (previous && prevDate) {
    const prevNormalized = previous.replace(STAMP_RE, STAMP_SENTINEL);
    if (prevNormalized === rendered) return { date: prevDate, changed: false };
  }
  return { date: todayUtc(), changed: true };
}

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

// Each locale's `filename` is a repo-root-relative path. Links in the template
// are written as seen from the repo root, so a README generated into a subfolder
// gets them rewritten to climb back up to the root first.
function rootPrefix(filename) {
  return posix.relative(posix.dirname(filename), ".");
}

const RELATIVE_LINK_RE = /(\]\(|(?:src|href)=")(?![a-z][a-z0-9+.-]*:|#|\/)([^)"\s]+)/gi;

function rebaseRelativeLinks(text, filename) {
  const prefix = rootPrefix(filename);
  if (!prefix) return text;
  return text.replace(RELATIVE_LINK_RE, (_, lead, target) => lead + posix.join(prefix, target));
}

// Screenshots are taken in every UI language (`bun run screenshots:readme`) into
// build/screenshots/<locale>/. The template names the English shot; each README
// shows its own language's shot instead, and keeps the English one where that
// language has none, naming it in `missing`. `exists` takes a repo-root-relative path.
const SCREENSHOT_RE = /build\/screenshots\/en\/([^"'\s)]+)/g;

export function localizeScreenshots(text, code, exists) {
  if (code === "en") return { text, missing: [] };
  const missing = new Set();
  const localized = text.replace(SCREENSHOT_RE, (shot, file) => {
    const path = `build/screenshots/${code}/${file}`;
    if (exists(path)) return path;
    missing.add(file);
    return shot;
  });
  return { text: localized, missing: [...missing] };
}

function buildLangNav(currentLoc, locales) {
  const fromDir = posix.dirname(currentLoc.filename);
  return locales
    .map((l) => {
      if (l.code === currentLoc.code) return `**${l.name}**`;
      return `[${l.name}](${posix.relative(fromDir, l.filename)})`;
    })
    .join(" · ");
}

function buildLangNameList(locales) {
  return locales.map((l) => l.name).join(" · ");
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
  let shotGaps = 0;

  for (const loc of LOCALES) {
    let md = applyStrings(template, loc.strings, enStrings);
    const shots = localizeScreenshots(md, loc.code, (path) => existsSync(resolve(ROOT, path)));
    md = shots.text;
    if (shots.missing.length) {
      shotGaps++;
      console.warn(`  ⚠ Locale "${loc.code}" shows English screenshots — missing: ${shots.missing.join(", ")}`);
    }
    md = rebaseRelativeLinks(md, loc.filename);
    md = applyMacros(md, {
      LANG_NAV: buildLangNav(loc, LOCALES),
      LANG_COUNT: String(LOCALES.length),
      LANG_NAME_LIST: buildLangNameList(LOCALES),
      LAST_UPDATED: STAMP_TOKEN,
    });
    md = md.replace(/\n{3,}/g, "\n\n");

    const outPath = resolve(ROOT, loc.filename);
    const previous = await readFile(outPath, "utf8").catch(() => null);
    const { date, changed } = resolveStamp(md, previous);
    await writeFile(outPath, md.replace(STAMP_SENTINEL, `_Last updated: ${date}._`), "utf8");
    console.log(
      `  ✓ ${loc.code.padEnd(5)} → ${loc.filename.padEnd(30)} ${date}${changed ? " (updated)" : ""}`,
    );
  }

  // Like key drift: a warning while iterating, a failure under --strict (`bun run check`).
  if (shotGaps) {
    const msg = `${shotGaps} locale(s) lack screenshots and show English ones; retake them with \`bun run screenshots:readme\`.`;
    if (strict) throw new Error(msg);
    console.warn(`\n  ⚠ ${msg}`);
  }

  console.log(`\nBuilt ${LOCALES.length} READMEs.${strict ? " (strict)" : ""}`);
}

// Run only as a script, so tests can import `localizeScreenshots`.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
