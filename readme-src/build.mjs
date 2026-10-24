// Build localized README files from template.md + strings.mjs.
//
//   README.md                     <- en (canonical)
//   docs/readme/README.{code}.md  <- one per non-en locale
//
// Usage: `node readme-src/build.mjs` (or `npm run build:readme`).

import { existsSync, readFileSync, realpathSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, posix, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { LOCALES } from "./strings.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const TEMPLATE_PATH = resolve(HERE, "template.md");

// The "Last updated" stamp is derived, never hand-written. Each README keeps the
// date of the last build that actually changed its content: the freshly rendered
// text carries STAMP_TOKEN where the date goes, and the file already on disk
// matches it when it reads the same around a date in that spot. Equal content ->
// reuse the old date, so `bun run check` (which rebuilds every README) never
// churns the working tree. The stamp's wording is a localized string, so only
// the date's position is fixed.
export const STAMP_TOKEN = "__ARROXY_LAST_UPDATED__";
const STAMP_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

// Returns the date to stamp plus whether it moved, given the previous file (if any).
// Throws when the render does not carry the stamp exactly once: a translation of
// `last_updated` that lost its {{LAST_UPDATED}} would otherwise ship without a date.
export function resolveStamp(rendered, previous, today = todayUtc()) {
  const parts = rendered.split(STAMP_TOKEN);
  if (parts.length !== 2) {
    throw new Error(`the README must show {{LAST_UPDATED}} exactly once (found ${parts.length - 1}); check its last_updated string`);
  }
  const [before, after] = parts;
  if (previous && previous.startsWith(before) && previous.endsWith(after)) {
    const prevDate = previous.slice(before.length, previous.length - after.length);
    if (STAMP_DATE_RE.test(prevDate)) return { date: prevDate, changed: false };
  }
  return { date: today, changed: true };
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
      `  The release translation sync closes the gap; \`bun run check:readme\` (or \`bun readme-src/build.mjs --strict\`) fails on it.\n`,
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
const NOT_RELATIVE_RE = /^(?:[a-z][a-z0-9+.-]*:|#|\/)/i;

// A srcset is a list of candidates, each a URL plus optional descriptors
// ("a.png 1x, a@2x.png 2x"). As in the HTML spec, a URL runs to the next
// whitespace and only its trailing commas separate candidates, so a comma
// inside a URL (a data: URI) stays part of it.
const SRCSET_RE = /(srcset=")([^"]*)/gi;
const SRCSET_URL_RE = /(^|,)(\s*)(\S+?)(?=,*(?:\s|$))/g;

function rebaseSrcset(list, prefix) {
  return list.replace(SRCSET_URL_RE, (match, sep, space, url) =>
    NOT_RELATIVE_RE.test(url) ? match : sep + space + posix.join(prefix, url),
  );
}

export function rebaseRelativeLinks(text, filename) {
  const prefix = rootPrefix(filename);
  if (!prefix) return text;
  return text
    .replace(RELATIVE_LINK_RE, (_, lead, target) => lead + posix.join(prefix, target))
    .replace(SRCSET_RE, (_, lead, list) => lead + rebaseSrcset(list, prefix));
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

// A locale's missing key renders the English string: a PR changes English only,
// and the release translation sync fills the other locales (ADR 0017).
export function applyStrings(template, strings, fallback = {}) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (key in strings) return strings[key];
    if (key in fallback) return fallback[key];
    return match;
  });
}

// Template keys English itself lacks, which would reach every README as a raw
// `{{key}}`. `macros` are the keys the build fills in itself.
export function missingTemplateKeys(template, strings, macros) {
  const keys = new Set([...template.matchAll(/\{\{(\w+)\}\}/g)].map((match) => match[1]));
  return [...keys].filter((key) => !(key in strings) && !macros.includes(key));
}

function applyMacros(text, macros) {
  for (const [key, val] of Object.entries(macros)) {
    text = text.replaceAll(`{{${key}}}`, val);
  }
  return text;
}

export function heroImageMarkup(code) {
  return code === "en"
    ? '<img src="build/social-preview.jpg" alt="{{hero_image_alt}}" width="1200" />'
    : '<img src="src/renderer/src/assets/App-icon-HQ.png" alt="{{icon_alt}}" width="180" />';
}

const BUILD_MACROS = ["LANG_NAV", "LANG_COUNT", "LANG_NAME_LIST", "LAST_UPDATED", "HERO_IMAGE"];

// The English strings the other locales were last translated from, written by
// the release translation sync (`--record-translated`). Key parity alone cannot
// see a reworded English string; comparing against this record can.
export const TRANSLATED_FROM_PATH = resolve(HERE, "translated-from.json");

export function readTranslatedFrom() {
  return existsSync(TRANSLATED_FROM_PATH) ? JSON.parse(readFileSync(TRANSLATED_FROM_PATH, "utf8")) : {};
}

// English keys whose text changed, that were added, or that went away since
// the locales were translated from `translatedFrom`.
export function untranslatedEnglishChanges(enStrings, translatedFrom) {
  const keys = Object.keys(enStrings);
  return {
    changed: keys.filter((key) => key in translatedFrom && translatedFrom[key] !== enStrings[key]),
    added: keys.filter((key) => !(key in translatedFrom)),
    removed: Object.keys(translatedFrom).filter((key) => !(key in enStrings)),
  };
}

// The README keys the release sync still has to handle for one locale: keys it
// lacks, keys whose English changed or was never recorded, and keys it or the
// record keep that English dropped. `--strict` fails on each of these.
export function readmeOpenKeys(enStrings, localeStrings, translatedFrom) {
  const { changed, added, removed } = untranslatedEnglishChanges(enStrings, translatedFrom);
  const missing = Object.keys(enStrings).filter((key) => !(key in localeStrings));
  const extra = Object.keys(localeStrings).filter((key) => !(key in enStrings));
  return [...new Set([...missing, ...changed, ...added, ...extra, ...removed])].sort();
}

function checkTranslatedFrom(enStrings, { strict }) {
  const { changed, added, removed } = untranslatedEnglishChanges(enStrings, readTranslatedFrom());
  if (!changed.length && !added.length && !removed.length) return;
  const parts = [];
  if (changed.length) parts.push(`changed: ${changed.join(", ")}`);
  if (added.length) parts.push(`added: ${added.join(", ")}`);
  if (removed.length) parts.push(`removed: ${removed.join(", ")}`);
  const msg = `English README strings differ from the ones the locales were translated from (${parts.join("; ")}). The release translation sync translates them in every locale, then runs \`bun readme-src/build.mjs --record-translated\`.`;
  if (strict) throw new Error(msg);
  console.warn(`  ⚠ ${msg}`);
}

async function main() {
  const record = process.argv.includes("--record-translated");
  const strict = record || process.argv.includes("--strict");
  checkParity(LOCALES, { strict });
  const enLocale = LOCALES.find((l) => l.code === "en");
  if (record) {
    const sorted = Object.fromEntries(Object.entries(enLocale?.strings ?? {}).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
    await writeFile(TRANSLATED_FROM_PATH, `${JSON.stringify(sorted, null, 2)}\n`, "utf8");
    console.log(`  ✓ recorded the English the locales are translated from → readme-src/translated-from.json`);
  }
  checkTranslatedFrom(enLocale?.strings ?? {}, { strict });

  const template = await readFile(TEMPLATE_PATH, "utf8");
  const en = LOCALES.find((l) => l.code === "en");
  const enStrings = en?.strings ?? {};
  const undefinedKeys = missingTemplateKeys(template, enStrings, BUILD_MACROS);
  if (undefinedKeys.length) {
    throw new Error(`readme-src/template.md uses keys readme-src/locales/en.mjs does not define: ${undefinedKeys.join(", ")}`);
  }
  let shotGaps = 0;

  for (const loc of LOCALES) {
    const localeTemplate = template.replace("{{HERO_IMAGE}}", heroImageMarkup(loc.code));
    let md = applyStrings(localeTemplate, loc.strings, enStrings);
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
    let stamp;
    try {
      stamp = resolveStamp(md, previous);
    } catch (error) {
      throw new Error(`Locale "${loc.code}": ${error instanceof Error ? error.message : String(error)}`);
    }
    const { date, changed } = stamp;
    await writeFile(outPath, md.replace(STAMP_TOKEN, date), "utf8");
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

// Run only as a script, so tests can import its helpers. Both sides
// are realpaths: a module URL resolves symlinks, argv[1] does not, and a
// mismatch would skip the build without a word.
export function isScriptEntry(argv1, moduleUrl) {
  if (!argv1) return false;
  return realpathSync(argv1) === realpathSync(fileURLToPath(moduleUrl));
}

if (isScriptEntry(process.argv[1], import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
