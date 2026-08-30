#!/usr/bin/env bun
// Reports key drift + placeholder leakage between en and every renderer i18n locale.
//
// Non-en locales are partial by design (DeepPartialStringLeaves in
// src/shared/i18n/types.ts) — missing keys fall back to en at runtime.
// Placeholder = a non-en value byte-equal to en, signaling unfinished translation.
// Default: warn on all three (missing, extras, placeholders). --strict: fail on any.

import en from '../src/shared/i18n/locales/en.json' with {type: 'json'}
import {SUPPORTED_LANGS} from '../src/shared/schemas.js'
import {readdirSync, readFileSync, statSync} from 'node:fs'
import {join, relative} from 'node:path'
import {fileURLToPath} from 'node:url'

interface LeafEntry {
	path: string
	value: string
}

function flattenLeaves(obj: unknown, prefix = ''): LeafEntry[] {
	if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
		return prefix && typeof obj === 'string' ? [{path: prefix, value: obj}] : []
	}
	const out: LeafEntry[] = []
	for (const [k, v] of Object.entries(obj)) {
		const path = prefix ? `${prefix}.${k}` : k
		if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
			out.push(...flattenLeaves(v, path))
		} else if (typeof v === 'string') {
			out.push({path, value: v})
		}
	}
	return out
}

const PLACEHOLDER_MIN_WORDS = 3 // skip 1-2-word values (brand names, single-word labels) — too noisy

const enLeaves = flattenLeaves(en)
const enByPath = new Map(enLeaves.map(l => [l.path, l.value]))
const enKeys = new Set(enByPath.keys())
const strict = process.argv.includes('--strict')

const PREVIEW_LIMIT = 10
let hadExtras = false
let hadMissing = false
let hadPlaceholders = false

for (const lang of SUPPORTED_LANGS) {
	if (lang === 'en') continue
	const mod = (await import(`../src/shared/i18n/locales/${lang}.json`, {with: {type: 'json'}})) as {default: unknown}
	const localeLeaves = flattenLeaves(mod.default)
	const localeByPath = new Map(localeLeaves.map(l => [l.path, l.value]))
	const localeKeys = new Set(localeByPath.keys())

	const missing = [...enKeys].filter(k => !localeKeys.has(k))
	const extras = [...localeKeys].filter(k => !enKeys.has(k))
	const placeholders = [...enKeys].filter(k => {
		const lv = localeByPath.get(k)
		const ev = enByPath.get(k)
		if (lv === undefined || ev === undefined || lv !== ev) return false
		const words = lv
			.trim()
			.replace(/\{\{[^}]+\}\}/g, '')
			.trim()
			.split(/\s+/)
			.filter(w => /\w/.test(w)).length
		return words >= PLACEHOLDER_MIN_WORDS
	})

	if (!missing.length && !extras.length && !placeholders.length) {
		console.log(`  ✓ ${lang}`)
		continue
	}

	console.log(`  ⚠ ${lang}: ${missing.length} missing, ${extras.length} extra, ${placeholders.length} placeholder`)
	if (missing.length) {
		const preview = missing.slice(0, PREVIEW_LIMIT).join(', ')
		const tail = missing.length > PREVIEW_LIMIT ? ` …(+${missing.length - PREVIEW_LIMIT} more)` : ''
		console.log(`      missing:      ${preview}${tail}`)
	}
	if (extras.length) console.log(`      extras:       ${extras.join(', ')}`)
	if (placeholders.length) {
		const preview = placeholders.slice(0, PREVIEW_LIMIT).join(', ')
		const tail = placeholders.length > PREVIEW_LIMIT ? ` …(+${placeholders.length - PREVIEW_LIMIT} more)` : ''
		console.log(`      placeholders: ${preview}${tail}`)
	}
	if (extras.length) hadExtras = true
	if (missing.length) hadMissing = true
	if (placeholders.length) hadPlaceholders = true
}

if (strict && (hadExtras || hadMissing || hadPlaceholders)) {
	console.error('\nFAIL: --strict and drift/placeholders present.')
	process.exit(1)
}
if (hadExtras) {
	console.warn("\nExtras: keys in non-en that don't exist in en. Stale — clean up via translate skill or hand-edit.")
}
if (hadMissing) {
	console.warn('\nMissing: keys absent in non-en (fall back to en at runtime). Partial-by-design; run translate to localize.')
}
if (hadPlaceholders) {
	console.warn(`\nPlaceholders: non-en values byte-equal to en (≥${PLACEHOLDER_MIN_WORDS} words). Likely untranslated copies — run translate skill.`)
}

// JSX literal scan: hardcoded English in user-facing JSX attributes bypasses the
// i18n pipeline entirely, so locale drift checks above can never see it. Any
// literal found here fails the run regardless of --strict.
const RENDERER_ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '../src/renderer/src')
const SKIP_DIRS = new Set(['dev']) // ScenarioGallery is dev-only, not shipped UI
// aria-label is named explicitly: it is the highest-value prop this scan
// exists to catch, and it must not drop out of coverage if someone edits the
// bare-name alternation (a bare `label` still matches `aria-label` today only
// by the accident that `\b` treats `-` as a boundary).
const propPattern = /\b(aria-label|title|description|label|placeholder|heading|tooltip|message|text)="([^"]+)"/g
// Literals exempt from the scan: brand/product names, locale-neutral format examples
// ("en, uk, pt-br" placeholder shows locale-code syntax, not prose), and dev/test-only
// surfaces (the ?backdrop isolation stage renders in browser-mock/test builds only).
const LITERAL_ALLOWLIST = new Set(['Arroxy', 'GitHub', 'Discord', 'YouTube', 'Firefox', 'Chromium', 'Chrome', 'Brave', 'Edge', 'Safari', 'Vivaldi', 'FFmpeg', 'FFprobe', 'yt-dlp', 'SponsorBlock', 'SRT', 'VTT', 'ASS', 'WAV', 'MP3', 'M4A', 'Opus', 'AAC', 'Backdrop render path', 'en, uk, pt-br'])

function collectTsxFiles(dir: string): string[] {
	const out: string[] = []
	for (const entry of readdirSync(dir)) {
		if (SKIP_DIRS.has(entry)) continue
		const full = join(dir, entry)
		const stat = statSync(full)
		if (stat.isDirectory()) out.push(...collectTsxFiles(full))
		else if (entry.endsWith('.tsx')) out.push(full)
	}
	return out
}

interface LiteralHit {
	file: string
	line: number
	prop: string
	value: string
}

const literalHits: LiteralHit[] = []

for (const file of collectTsxFiles(RENDERER_ROOT)) {
	const content = readFileSync(file, 'utf8')
	const lines = content.split('\n')
	for (let i = 0; i < lines.length; i++) {
		for (const match of lines[i].matchAll(propPattern)) {
			const value = match[2]
			if (LITERAL_ALLOWLIST.has(value)) continue
			if (!/[A-Za-z]{2,}/.test(value)) continue // digits-only, symbols, single letters
			literalHits.push({file: relative(RENDERER_ROOT, file), line: i + 1, prop: match[1], value})
		}
	}
}

if (literalHits.length) {
	for (const hit of literalHits) {
		console.error(`  ✗ ${hit.file}:${hit.line} — ${hit.prop}="${hit.value}"`)
	}
	console.error(`\nFAIL: ${literalHits.length} hardcoded JSX literal(s) on user-facing props (aria-label/title/description/label/placeholder/...).\n` + 'Move the copy into en.json and render it via t(). Brand/product names pass if added to LITERAL_ALLOWLIST.')
	process.exit(1)
}
console.log('  ✓ no hardcoded JSX literals on user-facing props')
