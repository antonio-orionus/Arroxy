#!/usr/bin/env bun
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'
import {spawnSync} from 'node:child_process'
import {SUPPORTED_LANGS, type SupportedLang} from '../src/shared/schemas.js'
import {buildLocaleCatalog, buildSourceCatalog, compileCatalog, compileLocaleTree, flattenStringLeaves, normalizeCatalog, parseCatalog, type CatalogIssue, type StringLeaf, validateLocaleCatalog} from './i18n-catalog-core.js'

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

function write(path: string, content: Buffer | string): void {
	mkdirSync(join(path, '..'), {recursive: true})
	writeFileSync(path, content)
}

function writeSourceCatalog(leaves: readonly StringLeaf[]): void {
	write(POT_PATH, compileCatalog(buildSourceCatalog(leaves)))
}

function bootstrapLocales(leaves: readonly StringLeaf[]): void {
	for (const lang of NON_EN_LANGS) {
		const localePath = localeJsonPath(lang)
		const localeLeaves = existsSync(localePath) ? flattenStringLeaves(readJson(localePath)) : []
		write(localePoPath(lang), compileCatalog(buildLocaleCatalog(lang, leaves, localeLeaves)))
	}
}

function runMsgmerge(lang: SupportedLang): void {
	const poPath = localePoPath(lang)
	if (!existsSync(poPath)) {
		write(poPath, compileCatalog(buildLocaleCatalog(lang, sourceLeaves(), [])))
		return
	}

	const result = spawnSync('msgmerge', ['--update', '--backup=none', '--previous', '--no-location', poPath, POT_PATH], {encoding: 'utf8'})
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

function formatJson(value: JsonObject): string {
	return `${JSON.stringify(value, null, '\t')}\n`
}

function formatRuntimeLocaleJson(): void {
	const result = spawnSync(process.execPath, ['x', 'biome', 'format', '--write', ...NON_EN_LANGS.map(localeJsonPath)], {stdio: 'inherit'})
	if (result.error) throw new Error(`Failed to format runtime locale JSON. (${result.error.message})`)
	if (result.status !== 0) throw new Error(`Biome format failed for runtime locale JSON with status ${result.status ?? 'unknown'}.`)
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
	const leaves = sourceLeaves()
	const issues: CatalogIssue[] = []

	for (const lang of NON_EN_LANGS) {
		const poPath = localePoPath(lang)
		if (!existsSync(poPath)) {
			issues.push({kind: 'missing-entry', lang, key: '<catalog>'})
			continue
		}
		const catalog = parseCatalog(readFileSync(poPath))
		const localeIssues = validateLocaleCatalog(lang, leaves, catalog)
		issues.push(...localeIssues)
		if (localeIssues.length > 0) continue

		const compiled = compileLocaleTree(leaves, catalog)
		if (writeFiles) write(localeJsonPath(lang), formatJson(compiled))
	}

	return issues
}

function checkCatalogs(): number {
	const leaves = sourceLeaves()
	const expectedPot = compileCatalog(buildSourceCatalog(leaves)).toString('utf8')
	const existingPot = existsSync(POT_PATH) ? readFileSync(POT_PATH, 'utf8') : ''
	const issues: string[] = []

	if (existingPot !== expectedPot) issues.push(`POT is stale: run bun run i18n:sync`)

	const catalogIssues = compileRuntimeLocales({writeFiles: false})
	for (const issue of catalogIssues) issues.push(formatIssue(issue))

	if (catalogIssues.length === 0) {
		for (const lang of NON_EN_LANGS) {
			const compiled = compileLocaleTree(leaves, parseCatalog(readFileSync(localePoPath(lang))))
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
	console.error(`usage: bun scripts/i18n-catalog.ts <extract|bootstrap|sync|compile|check>`)
	process.exit(2)
}

const command = process.argv[2] ?? usage()

switch (command) {
	case 'extract': {
		writeSourceCatalog(sourceLeaves())
		break
	}
	case 'bootstrap': {
		const leaves = sourceLeaves()
		writeSourceCatalog(leaves)
		bootstrapLocales(leaves)
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
		formatRuntimeLocaleJson()
		break
	}
	case 'check': {
		process.exit(checkCatalogs())
	}
	default:
		usage()
}
