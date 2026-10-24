// Render the shared README and website banners from this repo's locale strings and screenshots.
import {createHash} from 'node:crypto';
import {existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync} from 'node:fs';
import {mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {chromium} from '@playwright/test';
import {z} from 'zod';
import {LOCALES} from './strings.mjs';
import notoSans from '@fontsource/noto-sans/metadata.json' with {type: 'json'};
import notoArabic from '@fontsource/noto-sans-arabic/metadata.json' with {type: 'json'};
import notoNaskh from '@fontsource/noto-naskh-arabic/metadata.json' with {type: 'json'};
import notoHebrew from '@fontsource/noto-sans-hebrew/metadata.json' with {type: 'json'};
import notoBengali from '@fontsource/noto-sans-bengali/metadata.json' with {type: 'json'};
import notoThai from '@fontsource/noto-sans-thai/metadata.json' with {type: 'json'};
import notoMyanmar from '@fontsource/noto-sans-myanmar/metadata.json' with {type: 'json'};
import notoEthiopic from '@fontsource/noto-sans-ethiopic/metadata.json' with {type: 'json'};
import notoChinese from '@fontsource/noto-sans-sc/metadata.json' with {type: 'json'};
import notoTraditionalChinese from '@fontsource/noto-sans-tc/metadata.json' with {type: 'json'};
import notoJapanese from '@fontsource/noto-sans-jp/metadata.json' with {type: 'json'};
import notoKorean from '@fontsource/noto-sans-kr/metadata.json' with {type: 'json'};
import notoKhmer from '@fontsource/noto-sans-khmer/metadata.json' with {type: 'json'};
const FONT_FAMILIES = Object.fromEntries([notoSans, notoArabic, notoNaskh, notoHebrew, notoBengali, notoThai, notoMyanmar, notoEthiopic, notoChinese, notoTraditionalChinese, notoJapanese, notoKorean, notoKhmer].map(font => { const parsed = z.object({id: z.string(), family: z.string()}).parse(font); return [parsed.id, parsed.family]; }));

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'build/banners');
const template = readFileSync(path.join(ROOT, 'readme-src/banner.html'), 'utf8');
const sha = data => createHash('sha256').update(data).digest('hex');
const url = file => pathToFileURL(path.join(ROOT, file)).href;
const escapeHtml = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const SCRIPT_FONTS = {
  am: 'noto-sans-ethiopic', ar: 'noto-sans-arabic', ur: 'noto-naskh-arabic',
  fa: 'noto-sans-arabic', ps: 'noto-naskh-arabic', he: 'noto-sans-hebrew',
  bn: 'noto-sans-bengali', hi: 'poppins', th: 'noto-sans-thai',
  my: 'noto-sans-myanmar', km: 'noto-sans-khmer', zh: 'noto-sans-sc',
  'zh-Hant': 'noto-sans-tc', ja: 'noto-sans-jp', ko: 'noto-sans-kr',
  ru: 'noto-sans', uk: 'noto-sans', bg: 'noto-sans', sr: 'noto-sans',
};
const RTL = new Set(['ar', 'ur', 'fa', 'ps', 'he']);

// A fast gate for checked-in assets: no browser and no OS font dependency.
if (process.argv.includes('--check')) {
  const digest = z.string().regex(/^[a-f0-9]{64}$/);
  const cards = z.record(z.string(), z.object({
    image: z.string().regex(/^build\/banners\/[a-zA-Z-]+-[a-f0-9]{10}\.jpg$/),
    slogan: z.string(), sha256: digest, sources: z.record(z.string(), digest),
  })).parse(JSON.parse(readFileSync(path.join(OUT, 'manifest.json'), 'utf8')));
  const hashes = new Map();
  for (const {code, strings} of LOCALES) {
    const card = cards[code];
    if (!card || !card.image.startsWith(`build/banners/${code}-`) || card.slogan !== `${strings.hero_banner_line1}<br>${strings.hero_banner_line2}`) throw new Error(`${code}: stale banner headline`);
    for (const [file, expected] of Object.entries({...card.sources, [card.image]: card.sha256})) {
      if (!hashes.has(file)) hashes.set(file, sha(readFileSync(path.join(ROOT, file))));
      if (hashes.get(file) !== expected) throw new Error(`${code}: banner source changed: ${file}; run bun run build:readme:banners`);
    }
  }
  console.log(`Verified ${LOCALES.length} localized banners and their source digests.`);
  process.exit(0);
}

function fontsFor(code, sources) {
  return [...new Set(['poppins', SCRIPT_FONTS[code] ?? 'noto-sans'])].map(font => {
    return [600, 700].map(weight => {
      const cssPath = `node_modules/@fontsource/${font}/${weight}.css`;
      sources.add(cssPath);
      if (font !== 'poppins') sources.add(`node_modules/@fontsource/${font}/metadata.json`);
      return readFileSync(path.join(ROOT, cssPath), 'utf8').replace(/url\(['"]?(\.\/files\/[^)'"\s]+)['"]?\)/g, (_, rel) => {
        const file = `node_modules/@fontsource/${font}/${rel.slice(2)}`;
        sources.add(file);
        return `url("${url(file)}")`;
      });
    }).join('\n');
  }).join('\n');
}

mkdirSync(OUT, {recursive: true});
const work = await mkdtemp(path.join(tmpdir(), 'arroxy-banners-'));
const manifest = {};
const browser = await chromium.launch();
try {
  const context = await browser.newContext({viewport: {width: 1200, height: 630}, deviceScaleFactor: 1});
  const page = await context.newPage();
  for (const {code, strings} of LOCALES) {
    const sources = new Set(['readme-src/banner.html', 'readme-src/banners.mjs', 'src/renderer/src/assets/App-icon-HQ.png']);
    for (const name of ['Main', 'Explore-browsing']) {
      const file = `build/screenshots/${code}/${name}-screenshot.webp`;
      if (!existsSync(path.join(ROOT, file))) throw new Error(`${code}: missing ${file}; run screenshots:readme`);
      sources.add(file);
    }
    sources.add(`build/screenshots/${code}/Download-row.webp`);
    const font = SCRIPT_FONTS[code] ?? 'noto-sans';
    const family = font === 'poppins' ? 'Poppins' : FONT_FAMILIES[font];
    if (!family) throw new Error(`${code}: missing font family`);
    const first = strings.hero_banner_line1;
    const second = strings.hero_banner_line2;
    if (!first || !second) throw new Error(`${code}: missing translated banner headline`);
    const html = template.replaceAll('{{LANG}}', code).replaceAll('{{DIR}}', RTL.has(code) ? 'rtl' : 'ltr')
      .replace('{{FONT_CSS}}', fontsFor(code, sources)).replace('{{FAMILY}}', `${SCRIPT_FONTS[code] ? `"${family}", Poppins` : `Poppins, "${family}"`}, sans-serif`)
      .replace('{{MASCOT}}', url('src/renderer/src/assets/App-icon-HQ.png'))
      .replace('{{HEAD}}', `${escapeHtml(first)}<br><em>${escapeHtml(second)}</em>`)
      .replace('{{URL_SHOT}}', url(`build/screenshots/${code}/Main-screenshot.webp`))
      .replace('{{EXPLORE_SHOT}}', url(`build/screenshots/${code}/Explore-browsing-screenshot.webp`))
      .replace('{{ROW_SHOT}}', url(`build/screenshots/${code}/Download-row.webp`));
    const file = path.join(work, `${code}.html`);
    writeFileSync(file, html);
    await page.goto(pathToFileURL(file).href);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForLoadState('networkidle');
    const issues = await page.evaluate(() => {
      window.fitHeadline();
      const errors = [];
      for (const img of document.images) if (!img.complete || img.naturalWidth === 0) errors.push(`broken image: ${img.src}`);
      const head = document.querySelector('.head');
      const copy = document.querySelector('.copy').getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(head);
      const text = range.getBoundingClientRect();
      if (head.scrollWidth > head.clientWidth + 1 || text.left < copy.left - 1 || text.right > copy.right + 1 || text.top < 20 || text.bottom > 610) errors.push('clipped headline');
      for (const shot of document.querySelectorAll('.win, .row, .ghost')) {
        const box = shot.getBoundingClientRect();
        if (box.left < copy.right && box.right > copy.left) errors.push('headline overlaps screenshot');
      }
      return errors;
    });
    if (issues.length) throw new Error(`${code}: ${issues.join(', ')}`);
    const jpg = await page.locator('.frame').screenshot({type: 'jpeg', quality: 88});
    const name = `${code}-${sha(jpg).slice(0, 10)}.jpg`;
    writeFileSync(path.join(OUT, name), jpg);
    manifest[code] = {image: `build/banners/${name}`, slogan: `${first}<br>${second}`, sha256: sha(jpg), sources: Object.fromEntries([...sources].sort().map(source => [source, sha(readFileSync(path.join(ROOT, source)))]))};
    console.log(`${code}: ${name} (${Math.round(jpg.length / 1024)} KB)`);
  }
  writeFileSync(path.join(OUT, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  const keep = new Set(Object.values(manifest).map(card => path.basename(card.image)));
  for (const file of readdirSync(OUT)) if (file.endsWith('.jpg') && !keep.has(file)) rmSync(path.join(OUT, file));
} finally {
  await browser.close();
  await rm(work, {recursive: true, force: true});
}
