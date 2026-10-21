#!/usr/bin/env bun
import {existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join, relative} from 'node:path'
import {spawnSync, type SpawnSyncReturns} from 'node:child_process'
import {SUPPORTED_LANGS, type SupportedLang} from '../src/shared/schemas.js'
import type {GetTextTranslations} from 'gettext-parser'
import {readTranslatedFrom, untranslatedEnglishChanges} from '../readme-src/build.mjs'
import {LOCALES as README_LOCALES} from '../readme-src/strings.mjs'
import {
	buildLocaleCatalog,
	buildSourceCatalog,
	canonicalLocaleJson,
	compileCatalog,
	compileLocaleTree,
	expandPluralLeaves,
	flattenStringLeaves,
	isOpenIssue,
	normalizeCatalog,
	parseCatalog,
	placeholderDrift,
	serializeLocaleTree,
	type CatalogIssue,
	type CatalogIssueKind,
	type StringLeaf,
	validateCatalogEntries,
	validateLocaleCatalog
} from './i18n-catalog-core.js'

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

interface LocaleCatalog {
	lang: SupportedLang
	catalog: GetTextTranslations
}

interface LocaleCatalogs {
	catalogs: LocaleCatalog[]
	/** Locales with no PO file yet: adding a locale is translation-sync work. */
	missing: SupportedLang[]
	/** PO files that do not parse, which no gate tolerates. */
	unreadable: string[]
}

function readLocaleCatalogs(): LocaleCatalogs {
	const result: LocaleCatalogs = {catalogs: [], missing: [], unreadable: []}
	for (const lang of NON_EN_LANGS) {
		const poPath = localePoPath(lang)
		if (!existsSync(poPath)) {
			result.missing.push(lang)
			continue
		}
		try {
			result.catalogs.push({lang, catalog: parseCatalog(readFileSync(poPath))})
		} catch (error) {
			result.unreadable.push(`${relative(process.cwd(), poPath)} does not parse: ${error instanceof Error ? error.message : String(error)}`)
		}
	}
	return result
}

/** Writes every locale's runtime JSON from its PO catalog, leaving out what is not translated yet. */
function compileRuntimeLocales(): number {
	const {catalogs, missing, unreadable} = readLocaleCatalogs()
	for (const problem of unreadable) console.error(problem)
	if (unreadable.length > 0) return 1

	let leftOut = 0
	for (const {lang, catalog} of catalogs) {
		const leaves = localeSourceLeaves(lang)
		const compiled = compileLocaleTree(lang, leaves, catalog)
		write(localeJsonPath(lang), serializeLocaleTree(compiled))
		leftOut += leaves.length - flattenStringLeaves(compiled).length
	}
	for (const lang of missing) console.warn(`${lang}: no PO catalog, runtime JSON left as it is: run bun run i18n:sync`)
	if (leftOut > 0) console.warn(`${leftOut} entries are not translated yet and fall back to English: see bun run i18n:status`)
	return 0
}

/**
 * The gate for every PR (`complete: false`) checks only what an English change could break: the
 * locale files' canonical form, PO files that parse, and translations that are wrong on their own.
 * Entries a locale has not translated yet are reported, not failed. The release gate
 * (`complete: true`) also requires every locale to be fully translated and compiled.
 */
function checkCatalogs({complete}: {complete: boolean}): number {
	const errors = new Set<string>()
	const warnings: string[] = []
	for (const path of canonicalizeLocaleFiles({writeFiles: false})) errors.add(`${path}: keys must be sorted, one per line: run bun run i18n:format`)

	const {catalogs, missing, unreadable} = readLocaleCatalogs()
	for (const problem of unreadable) errors.add(problem)

	let open = 0
	const behind = new Set<string>()
	const staleRuntime: SupportedLang[] = []
	for (const {lang, catalog} of catalogs) {
		const leaves = localeSourceLeaves(lang)
		const runtime = readJson(localeJsonPath(lang))
		for (const issue of validateCatalogEntries(lang, catalog)) errors.add(formatIssue(issue))
		for (const issue of placeholderDrift(lang, leaves, flattenStringLeaves(runtime))) {
			if (complete) errors.add(formatIssue(issue))
			else warnings.push(formatIssue(issue))
		}
		const status = validateLocaleCatalog(lang, leaves, catalog)
		for (const issue of status) {
			if (complete || !isOpenIssue(issue)) errors.add(formatIssue(issue))
		}
		const openHere = status.filter(isOpenIssue).length
		open += openHere
		if (openHere > 0) behind.add(lang)
		if (!deepEqual(runtime, compileLocaleTree(lang, leaves, catalog))) staleRuntime.push(lang)
	}

	const expectedPot = compileCatalog(buildSourceCatalog(sourceLeaves())).toString('utf8')
	const potStale = (existsSync(POT_PATH) ? readFileSync(POT_PATH, 'utf8') : '') !== expectedPot
	if (complete) {
		if (potStale) errors.add('POT is stale: run bun run i18n:sync')
		for (const lang of staleRuntime) errors.add(`${lang}: runtime JSON is stale: run bun run i18n:compile`)
		for (const lang of missing) errors.add(`${lang}: no PO catalog: run bun run i18n:sync`)
	}

	if (warnings.length > 0) {
		console.warn(`⚠ ${warnings.length} translation${warnings.length === 1 ? '' : 's'} no longer match the placeholders of the current English. The release sync re-translates them; a meaning or placeholder change should get a new key instead:\n`)
		for (const warning of warnings) console.warn(`  ${warning}`)
		console.warn('')
	}

	if (errors.size > 0) {
		console.error(`FAIL: ${errors.size} i18n catalog issue${errors.size === 1 ? '' : 's'} found:\n`)
		for (const error of errors) console.error(`  ${error}`)
		if (complete) console.error('\nRun the translation sync (translate-arroxy-i18n skill) before releasing.')
		return 1
	}

	if (complete) console.log('✓ every locale is fully translated and compiled.')
	else if (open + missing.length === 0) console.log('✓ i18n catalogs are valid; every locale is translated.')
	else console.log(`✓ i18n catalogs are valid. ${open} entries in ${behind.size + missing.length} locales wait for the release translation sync and show in English until then (bun run i18n:status).`)
	if (!complete && (potStale || staleRuntime.length > 0)) {
		const behindFiles = [...(potStale ? ['the POT'] : []), ...(staleRuntime.length > 0 ? [`${staleRuntime.length} runtime locale file${staleRuntime.length === 1 ? '' : 's'}`] : [])]
		console.log(`  ${behindFiles.join(' and ')} lag the English too; the sync regenerates them.`)
	}
	return 0
}

const STATUS_COLUMNS = ['missing-entry', 'stale-source', 'untranslated', 'fuzzy', 'extra-entry'] as const satisfies readonly CatalogIssueKind[]
const STATUS_HEADINGS: Record<(typeof STATUS_COLUMNS)[number], string> = {'missing-entry': 'new', 'stale-source': 'changed', untranslated: 'untranslated', fuzzy: 'fuzzy', 'extra-entry': 'removed'}

/** Open entries per locale, in the PO catalog and the README, so a release knows what the sync has to do. */
function printStatus(): number {
	const {catalogs, missing, unreadable} = readLocaleCatalogs()
	for (const problem of unreadable) console.error(problem)
	const readmeEn = README_LOCALES.find(locale => locale.code === 'en')?.strings ?? {}
	const readmeEnKeys = Object.keys(readmeEn)
	// A reworded English README string is stale in every locale that has the key.
	const readmeChanged = untranslatedEnglishChanges(readmeEn, readTranslatedFrom()).changed
	const headings = ['locale', ...STATUS_COLUMNS.map(kind => STATUS_HEADINGS[kind]), 'README']
	const rows: string[][] = []
	for (const {lang, catalog} of catalogs) {
		const issues = validateLocaleCatalog(lang, localeSourceLeaves(lang), catalog)
		const readmeKeys = new Set(Object.keys(README_LOCALES.find(locale => locale.code === lang)?.strings ?? {}))
		const counts = [...STATUS_COLUMNS.map(kind => issues.filter(issue => issue.kind === kind).length), readmeEnKeys.filter(key => !readmeKeys.has(key) || readmeChanged.includes(key)).length]
		if (counts.some(count => count > 0)) rows.push([lang, ...counts.map(String)])
	}
	for (const lang of missing) rows.push([lang, 'no PO catalog', ...STATUS_COLUMNS.slice(1).map(() => ''), ''])

	if (rows.length === 0) {
		console.log('✓ every locale is fully translated.')
		return unreadable.length > 0 ? 1 : 0
	}
	const widths = headings.map((heading, column) => Math.max(heading.length, ...rows.map(row => (row[column] ?? '').length)))
	const line = (cells: readonly string[]): string => cells.map((cell, column) => (column === 0 ? cell.padEnd(widths[column] ?? 0) : cell.padStart(widths[column] ?? 0))).join('  ')
	console.log(line(headings))
	for (const row of rows) console.log(line(row))
	console.log(`\n${rows.length} of ${NON_EN_LANGS.length} locales have open entries. The release translation sync closes them (translate-arroxy-i18n skill).`)
	return unreadable.length > 0 ? 1 : 0
}

function formatIssue(issue: CatalogIssue): string {
	const detail = issue.detail ? ` (${issue.detail})` : ''
	return `${issue.lang}: ${issue.kind} at ${issue.key}${detail}`
}

function usage(): never {
	console.error(`usage: bun scripts/i18n-catalog.ts <extract|bootstrap|sync|compile|format|status|check [--complete]>`)
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
		process.exit(compileRuntimeLocales())
	}
	case 'format': {
		for (const path of canonicalizeLocaleFiles({writeFiles: true})) console.log(`formatted ${path}`)
		break
	}
	case 'status': {
		process.exit(printStatus())
	}
	case 'check': {
		process.exit(checkCatalogs({complete: process.argv.includes('--complete')}))
	}
	default:
		usage()
}
