#!/usr/bin/env bun
// Reports en locale keys that are never referenced in the source tree.
//
// Strategy:
//   1. Flatten en.json to all dot-path leaf keys.
//   2. Grep every .ts/.tsx file under src/ for quoted string literals that look
//      like i18n keys (word chars + dots, no spaces).
//   3. Keys whose prefix matches a DYNAMIC_PREFIX are always considered "used" —
//      they are assembled at runtime from an enum/variable and can't be found
//      by static scan.
//   4. Remaining en keys not found in the static set are reported as unused.
//
// Default: list unused keys. --strict: exit 1 if any found.

import {readdirSync, readFileSync} from 'fs'
import {join} from 'path'
import {fileURLToPath} from 'node:url'
import en from '../src/shared/i18n/locales/en.json' with {type: 'json'}

// Keys under these prefixes are built at runtime (e.g. `errors.ytdlp.${kind}`)
// and cannot be detected by static string search. Treat all as used.
const DYNAMIC_PREFIXES = ['errors.ytdlp.', 'wizard.steps.', 'wizard.sponsorblock.cat.', 'wizard.url.networkPacing.presets.', 'wizard.url.networkPacing.tooltips.', 'wizard.url.networkPacing.fields.', 'wizard.url.networkPacing.units.', 'wizard.url.profile.builtinName.', 'playlistPresets.', 'presets.', 'status.']

// ── helpers ──────────────────────────────────────────────────────────────────

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

function* walkTs(dir: string): Generator<string> {
	for (const entry of readdirSync(dir, {withFileTypes: true})) {
		const full = join(dir, entry.name)
		if (entry.isDirectory()) {
			yield* walkTs(full)
		} else if (entry.isFile() && /\.(tsx?|mjs)$/.test(entry.name)) {
			yield full
		}
	}
}

// Collect every quoted string that looks like a dot-path key.
// Matches 'foo.bar.baz' and "foo.bar.baz" (non-template literals only — no ${).
const KEY_PATTERN = /(?<![`$])['"]([a-zA-Z][a-zA-Z0-9_]*(?:\.[a-zA-Z0-9_-]+){1,})['"]/g

function collectStaticKeys(root: string): Set<string> {
	const refs = new Set<string>()
	for (const file of walkTs(root)) {
		for (const m of readFileSync(file, 'utf8').matchAll(KEY_PATTERN)) refs.add(m[1])
	}
	return refs
}

// ── main ─────────────────────────────────────────────────────────────────────

const strict = process.argv.includes('--strict')
const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const srcRoot = join(repoRoot, 'src')

const enLeaves = flattenLeaves(en)
const staticRefs = collectStaticKeys(srcRoot)

// i18next plural suffix pattern: _zero _one _two _few _many _other
const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/

const unused: string[] = []
for (const {path} of enLeaves) {
	if (DYNAMIC_PREFIXES.some(p => path.startsWith(p))) continue
	if (staticRefs.has(path)) continue
	// Plural variant: check if the base key or a sibling accounts for it
	// eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
	const pluralMatch = path.match(PLURAL_SUFFIX)
	if (pluralMatch) {
		const base = path.slice(0, path.length - pluralMatch[0].length)
		if (staticRefs.has(base)) continue
		// sibling literal reference (e.g. t('key_other', { count }))
		const siblingReferenced = [...staticRefs].some(r => r !== path && r.replace(PLURAL_SUFFIX, '') === base)
		if (siblingReferenced) continue
	}
	unused.push(path)
}

if (unused.length === 0) {
	console.log('✓ No unused en keys found.')
	process.exit(0)
}

console.log(`⚠ ${unused.length} potentially unused en key${unused.length === 1 ? '' : 's'}:\n`)
for (const k of unused) {
	console.log(`  ${k}`)
}
console.log('\nNote: keys under dynamic prefixes are excluded from this check.', '\nVerify manually before deleting — some keys may be referenced indirectly.')

if (strict) {
	console.error('\nFAIL: --strict and unused keys present.')
	process.exit(1)
}
