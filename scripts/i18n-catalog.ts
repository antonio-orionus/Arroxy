#!/usr/bin/env bun
import {existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join, relative} from 'node:path'
import {spawnSync, type SpawnSyncReturns} from 'node:child_process'
import {SUPPORTED_LANGS, type SupportedLang} from '../src/shared/schemas.js'
import {buildLocaleCatalog, buildSourceCatalog, canonicalLocaleJson, compileCatalog, compileLocaleTree, expandPluralLeaves, flattenStringLeaves, normalizeCatalog, parseCatalog, serializeLocaleTree, type CatalogIssue, type StringLeaf, validateLocaleCatalog} from './i18n-catalog-core.js'

type JsonValue = string | {[key: string]: JsonValue}
interface JsonObject {
	[key: string]: JsonValue
}

const RUNTIME_DIR = join(process.cwd(), 'src/shared/i18n/locales')
const CATALOG_DIR = join(process.cwd(), 'i18n/locales')
const POT_PATH = join(process.cwd(), 'i18n/app.pot')
const NON_EN_LANGS = SUPPORTED_LANGS.filter(lang => lang !== 'en')

function readJson(path: string): JsonObject {
	return JSON.parse(readFileSync(path, 'utf8')) as JsonObject
}

function localeJsonPath(lang: SupportedLang): string {
	return join(RUNTIME_DIR, `${lang}.json`)
}

function localePoPath(lang: SupportedLang): string {
	return join(CATALOG_DIR, `${lang}.po`)
}

function sourceLeaves(): StringLeaf[] {
	return flattenStringLeaves(readJson(localeJsonPath('en')))
}

// English only has one/other; each locale's catalog is keyed by its own CLDR plural categories.
function localeSourceLeaves(lang: SupportedLang): StringLeaf[] {
	return expandPluralLeaves(lang, sourceLeaves())
}

function write(path: string, content: Buffer | string): void {
	mkdirSync(join(path, '..'), {recursive: true})
	writeFileSync(path, content)
}

function writeSourceCatalog(leaves: readonly StringLeaf[]): void {
	write(POT_PATH, compileCatalog(buildSourceCatalog(leaves)))
}

function bootstrapLocales(): void {
	for (const lang of NON_EN_LANGS) {
		const localePath = localeJsonPath(lang)
		const localeLeaves = existsSync(localePath) ? flattenStringLeaves(readJson(localePath)) : []
		write(localePoPath(lang), compileCatalog(buildLocaleCatalog(lang, localeSourceLeaves(lang), localeLeaves)))
	}
}

function runMsgmerge(lang: SupportedLang): void {
	const poPath = localePoPath(lang)
	if (!existsSync(poPath)) {
		write(poPath, compileCatalog(buildLocaleCatalog(lang, localeSourceLeaves(lang), [])))
		return
	}

	// msgmerge reads the template from a file; a per-locale one carries that locale's plural categories.
	const templateDir = mkdtempSync(join(tmpdir(), 'arroxy-pot-'))
	let result: SpawnSyncReturns<string>
	try {
		const templatePath = join(templateDir, `${lang}.pot`)
		write(templatePath, compileCatalog(buildSourceCatalog(localeSourceLeaves(lang))))
		result = spawnSync('msgmerge', ['--update', '--backup=none', '--previous', '--no-location', poPath, templatePath], {encoding: 'utf8'})
	} finally {
		rmSync(templateDir, {recursive: true, force: true})
	}
	if (result.error) {
		throw new Error(`msgmerge is required for i18n:sync. Install GNU gettext and retry. (${result.error.message})`)
	}
	if (result.status !== 0) {
		throw new Error(`msgmerge failed for ${lang}:\n${result.stderr || result.stdout}`)
	}

	const normalized = normalizeCatalog(parseCatalog(readFileSync(poPath)))
	write(poPath, compileCatalog(normalized))
}

function syncCatalogs(): void {
	const leaves = sourceLeaves()
	writeSourceCatalog(leaves)
	for (const lang of NON_EN_LANGS) runMsgmerge(lang)
}

/** Locale files whose text is not canonical; with `writeFiles`, rewrites them so they are. */
function canonicalizeLocaleFiles({writeFiles}: {writeFiles: boolean}): string[] {
	const stale: string[] = []
	for (const lang of SUPPORTED_LANGS) {
		const path = localeJsonPath(lang)
		const text = readFileSync(path, 'utf8')
		const canonical = canonicalLocaleJson(text)
		if (text === canonical) continue
		stale.push(relative(process.cwd(), path))
		if (writeFiles) write(path, canonical)
	}
	return stale
}

function deepEqual(a: unknown, b: unknown): boolean {
	if (typeof a !== typeof b) return false
	if (typeof a === 'string' || typeof a === 'number' || typeof a === 'boolean' || a === null || b === null) return a === b
	if (!isJsonObject(a) || !isJsonObject(b)) return false
	const aKeys = Object.keys(a).sort()
	const bKeys = Object.keys(b).sort()
	if (aKeys.length !== bKeys.length) return false
	for (let i = 0; i < aKeys.length; i += 1) {
		const key = aKeys[i]
		if (key !== bKeys[i]) return false
		if (!deepEqual(a[key], b[key])) return false
	}
	return true
}

function isJsonObject(value: unknown): value is JsonObject {
	return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function compileRuntimeLocales({writeFiles}: {writeFiles: boolean}): CatalogIssue[] {
	const issues: CatalogIssue[] = []

	for (const lang of NON_EN_LANGS) {
		const poPath = localePoPath(lang)
		if (!existsSync(poPath)) {
			issues.push({kind: 'missing-entry', lang, key: '<catalog>'})
			continue
		}
		const catalog = parseCatalog(readFileSync(poPath))
		const leaves = localeSourceLeaves(lang)
		const localeIssues = validateLocaleCatalog(lang, leaves, catalog)
		issues.push(...localeIssues)
		if (localeIssues.length > 0) continue

		const compiled = compileLocaleTree(leaves, catalog)
		if (writeFiles) write(localeJsonPath(lang), serializeLocaleTree(compiled))
	}

	return issues
}

function checkCatalogs(): number {
	const leaves = sourceLeaves()
	const expectedPot = compileCatalog(buildSourceCatalog(leaves)).toString('utf8')
	const existingPot = existsSync(POT_PATH) ? readFileSync(POT_PATH, 'utf8') : ''
	const issues: string[] = []

	if (existingPot !== expectedPot) issues.push(`POT is stale: run bun run i18n:sync`)
	for (const path of canonicalizeLocaleFiles({writeFiles: false})) issues.push(`${path}: keys must be sorted, one per line: run bun run i18n:format`)

	const catalogIssues = compileRuntimeLocales({writeFiles: false})
	for (const issue of catalogIssues) issues.push(formatIssue(issue))

	if (catalogIssues.length === 0) {
		for (const lang of NON_EN_LANGS) {
			const compiled = compileLocaleTree(localeSourceLeaves(lang), parseCatalog(readFileSync(localePoPath(lang))))
			const runtime = readJson(localeJsonPath(lang))
			if (!deepEqual(runtime, compiled)) issues.push(`${lang}: runtime JSON is stale, run bun run i18n:compile`)
		}
	}

	if (issues.length === 0) {
		console.log('✓ i18n PO catalogs are synchronized with runtime locale JSON.')
		return 0
	}

	console.error(`FAIL: ${issues.length} i18n catalog issue${issues.length === 1 ? '' : 's'} found:\n`)
	for (const issue of issues) console.error(`  ${issue}`)
	return 1
}

function formatIssue(issue: CatalogIssue): string {
	const detail = issue.detail ? ` (${issue.detail})` : ''
	return `${issue.lang}: ${issue.kind} at ${issue.key}${detail}`
}

function usage(): never {
	console.error(`usage: bun scripts/i18n-catalog.ts <extract|bootstrap|sync|compile|format|check>`)
	process.exit(2)
}

const command = process.argv[2] ?? usage()

switch (command) {
	case 'extract': {
		writeSourceCatalog(sourceLeaves())
		break
	}
	case 'bootstrap': {
		writeSourceCatalog(sourceLeaves())
		bootstrapLocales()
		break
	}
	case 'sync': {
		syncCatalogs()
		break
	}
	case 'compile': {
		const issues = compileRuntimeLocales({writeFiles: true})
		if (issues.length > 0) {
			for (const issue of issues) console.error(formatIssue(issue))
			process.exit(1)
		}
		break
	}
	case 'format': {
		for (const path of canonicalizeLocaleFiles({writeFiles: true})) console.log(`formatted ${path}`)
		break
	}
	case 'check': {
		process.exit(checkCatalogs())
	}
	default:
		usage()
}
