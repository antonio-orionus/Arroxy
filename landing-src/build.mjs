// Build the localized landing pages from template.html + strings.mjs.
//
//   docs/index.html              <- en (canonical, x-default)
//   docs/<dir>/index.html        <- one per non-en locale
//
// Usage: `node landing-src/build.mjs` (or `npm run build:landing`).

import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { LOCALES } from "./strings.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const DOCS = resolve(ROOT, "docs");
const TEMPLATE_PATH = resolve(HERE, "template.html");

const SITE_URL = "https://arroxy.orionus.dev/";
const OG_IMAGE = `${SITE_URL}assets/icon.png`;
const OG_IMAGE_WIDTH = "1003";
const OG_IMAGE_HEIGHT = "1123";
const REPO_URL = "https://github.com/antonio-orionus/Arroxy";
const RELEASES_URL = `${REPO_URL}/releases/latest`;

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function localeUrl(loc) {
  return loc.dir ? `${SITE_URL}${loc.dir}/` : SITE_URL;
}

// Validate string-key parity across all locales (catches drift early).
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

function buildHreflangLinks(locales) {
  const lines = locales.map(
    (l) => `    <link rel="alternate" hreflang="${l.code}" href="${localeUrl(l)}" />`,
  );
  // x-default points at the canonical (English) page.
  const en = locales.find((l) => l.code === "en");
  lines.push(
    `    <link rel="alternate" hreflang="x-default" href="${localeUrl(en)}" />`,
  );
  return lines.join("\n");
}

function buildOgLocaleAlt(currentLoc, locales) {
  return locales
    .filter((l) => l.code !== currentLoc.code)
    .map((l) => `    <meta property="og:locale:alternate" content="${l.ogLocale}" />`)
    .join("\n");
}

// Escape `</script` to prevent any payload from breaking out of the script tag.
function safeJson(data) {
  return JSON.stringify(data).replace(/<\/script/gi, "<\\/script");
}

function buildJsonLd(loc) {
  // SoftwareApplication + Person — SoftwareApplication gives Google rich
  // snippets (price, OS, license); Person disambiguates the author entity for
  // AI search. No aggregateRating until we have verifiable reviews.
  const softwareApp = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Arroxy",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Windows, macOS, Linux",
    description: loc.strings.description,
    inLanguage: loc.code,
    url: localeUrl(loc),
    image: OG_IMAGE,
    license: "https://opensource.org/licenses/MIT",
    downloadUrl: RELEASES_URL,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Person",
      "@id": "https://x.com/OrionusAI",
      name: "Antonio Orionus",
      url: "https://x.com/OrionusAI",
    },
  };
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://x.com/OrionusAI",
    name: "Antonio Orionus",
    url: "https://x.com/OrionusAI",
    sameAs: [
      "https://x.com/OrionusAI",
      "https://github.com/antonio-orionus",
    ],
  };
  return safeJson([softwareApp, person]);
}

function buildFaqJsonLd(loc) {
  // FAQPage schema. Per Google policy, the Q/A must also be visibly rendered
  // on the page — the landing template renders the same `faq_q*` / `faq_a*`
  // strings inside <section id="faq">.
  const mainEntity = [];
  for (let i = 1; i <= 9; i++) {
    const q = loc.strings[`faq_q${i}`];
    const a = loc.strings[`faq_a${i}`];
    if (!q || !a) continue;
    mainEntity.push({
      "@type": "Question",
      name: q,
      acceptedAnswer: {
        "@type": "Answer",
        text: a,
      },
    });
  }
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: loc.code,
    mainEntity,
  };
  return safeJson(data);
}

function buildSitemap(locales) {
  const xhtmlLinks = locales
    .map(
      (l) =>
        `    <xhtml:link rel="alternate" hreflang="${l.code}" href="${localeUrl(l)}" />`,
    )
    .join("\n");
  const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${localeUrl(locales.find((l) => l.code === "en"))}" />`;
  const today = new Date().toISOString().slice(0, 10);

  const urls = locales
    .map(
      (l) => `  <url>
    <loc>${localeUrl(l)}</loc>
    <lastmod>${today}</lastmod>
${xhtmlLinks}
${xDefault}
  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
}

function buildRobots() {
  // Explicit allowlist for AI search crawlers. The wildcard `User-agent: *`
  // already permits everything, but naming each bot is a positive signal that
  // discourages cautious crawlers from skipping the site.
  const aiBots = [
    "GPTBot",
    "ChatGPT-User",
    "OAI-SearchBot",
    "ClaudeBot",
    "anthropic-ai",
    "Claude-Web",
    "PerplexityBot",
    "Perplexity-User",
    "Google-Extended",
    "Applebot-Extended",
    "Bingbot",
    "CCBot",
  ];
  const aiBlocks = aiBots
    .map((bot) => `User-agent: ${bot}\nAllow: /\n`)
    .join("\n");
  return `User-agent: *
Allow: /

${aiBlocks}
Sitemap: ${SITE_URL}sitemap.xml
`;
}

function buildLangPicker(currentLoc, locales) {
  // Relative paths so the picker keeps working under any host / base path.
  const fromRoot = currentLoc.dir === "";
  return locales
    .map((l) => {
      const isCurrent = l.code === currentLoc.code;
      let href;
      if (isCurrent) {
        href = "#";
      } else if (fromRoot) {
        href = l.dir ? `${l.dir}/` : "./";
      } else {
        href = l.dir ? `../${l.dir}/` : "../";
      }
      const aria = isCurrent ? ` aria-current="page"` : "";
      return `          <a href="${href}" hreflang="${l.code}" lang="${l.code}"${aria}>${escapeHtml(l.name)}</a>`;
    })
    .join("\n");
}

function applyStrings(template, strings) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (!(key in strings)) return match; // leave non-string placeholders for later
    const val = strings[key];
    return key.endsWith("_html") ? val : escapeHtml(val);
  });
}

function applyMacros(html, macros) {
  for (const [key, val] of Object.entries(macros)) {
    html = html.replaceAll(`{{${key}}}`, val);
  }
  return html;
}

async function main() {
  assertParity(LOCALES);

  const template = await readFile(TEMPLATE_PATH, "utf8");
  const hreflangLinks = buildHreflangLinks(LOCALES);

  // Wipe previous generated locale dirs (keep docs/index.html, assets, my/).
  for (const loc of LOCALES) {
    if (!loc.dir) continue;
    const dir = resolve(DOCS, loc.dir);
    if (existsSync(dir)) await rm(dir, { recursive: true, force: true });
  }

  for (const loc of LOCALES) {
    const outDir = loc.dir ? resolve(DOCS, loc.dir) : DOCS;
    const outPath = resolve(outDir, "index.html");
    const base = loc.dir ? "../" : "";

    let html = applyStrings(template, loc.strings);
    html = applyMacros(html, {
      LANG: loc.code,
      BASE: base,
      CANONICAL: localeUrl(loc),
      OG_IMAGE,
      OG_IMAGE_WIDTH,
      OG_IMAGE_HEIGHT,
      OG_LOCALE: loc.ogLocale,
      OG_LOCALE_ALT: buildOgLocaleAlt(loc, LOCALES),
      HREFLANG_LINKS: hreflangLinks,
      LANG_PICKER: buildLangPicker(loc, LOCALES),
      JSON_LD: buildJsonLd(loc),
      FAQ_JSON_LD: buildFaqJsonLd(loc),
    });

    await mkdir(outDir, { recursive: true });
    await writeFile(outPath, html, "utf8");
    console.log(`  ✓ ${loc.code.padEnd(2)} → ${outPath.replace(ROOT + "/", "")}`);
  }

  await writeFile(resolve(DOCS, "sitemap.xml"), buildSitemap(LOCALES), "utf8");
  console.log(`  ✓ sitemap → docs/sitemap.xml`);
  await writeFile(resolve(DOCS, "robots.txt"), buildRobots(), "utf8");
  console.log(`  ✓ robots  → docs/robots.txt`);

  console.log(`\nBuilt ${LOCALES.length} pages + sitemap + robots.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
