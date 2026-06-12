import {po as gettextPo, type GetTextTranslation, type GetTextTranslations} from 'gettext-parser'

export interface StringLeaf {
	path: string
	value: string
}

export type CatalogIssueKind = 'missing-entry' | 'stale-source' | 'untranslated' | 'fuzzy' | 'extra-entry'

export interface CatalogIssue {
	kind: CatalogIssueKind
	lang: string
	key: string
	detail?: string
}

interface JsonObject {
	[key: string]: string | JsonObject
}

const BASE_HEADERS: Record<string, string> = {'project-id-version': 'Arroxy', 'report-msgid-bugs-to': 'https://github.com/antonio-orionus/Arroxy/issues', 'mime-version': '1.0', 'content-type': 'text/plain; charset=UTF-8', 'content-transfer-encoding': '8bit'}

function isRecord(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function flattenStringLeaves(value: unknown, prefix = ''): StringLeaf[] {
	if (typeof value === 'string') return prefix === '' ? [] : [{path: prefix, value}]
	if (!isRecord(value)) return []

	const leaves: StringLeaf[] = []
	for (const [key, child] of Object.entries(value)) {
		const path = prefix === '' ? key : `${prefix}.${key}`
		leaves.push(...flattenStringLeaves(child, path))
	}
	return leaves
}

function leafMap(leaves: readonly StringLeaf[]): Map<string, string> {
	return new Map(leaves.map(leaf => [leaf.path, leaf.value]))
}

function catalogHeaders(language = ''): Record<string, string> {
	return language === '' ? {...BASE_HEADERS} : {...BASE_HEADERS, language}
}

function emptyCatalog(language = ''): GetTextTranslations {
	return {charset: 'UTF-8', headers: catalogHeaders(language), translations: {}}
}

function addEntry(catalog: GetTextTranslations, entry: GetTextTranslation): void {
	const context = entry.msgctxt ?? ''
	catalog.translations[context] ??= {}
	catalog.translations[context][entry.msgid] = entry
}

export function buildSourceCatalog(sourceLeaves: readonly StringLeaf[]): GetTextTranslations {
	const catalog = emptyCatalog()
	for (const leaf of sourceLeaves) addEntry(catalog, {msgctxt: leaf.path, msgid: leaf.value, msgstr: ['']})
	return catalog
}

export function buildLocaleCatalog(lang: string, sourceLeaves: readonly StringLeaf[], localeLeaves: readonly StringLeaf[]): GetTextTranslations {
	const localeByPath = leafMap(localeLeaves)
	const catalog = emptyCatalog(lang)
	for (const leaf of sourceLeaves) addEntry(catalog, {msgctxt: leaf.path, msgid: leaf.value, msgstr: [localeByPath.get(leaf.path) ?? '']})
	return catalog
}

function compareCatalogEntries(a: GetTextTranslation, b: GetTextTranslation): number {
	const context = (a.msgctxt ?? '').localeCompare(b.msgctxt ?? '')
	if (context !== 0) return context
	return a.msgid.localeCompare(b.msgid)
}

export function compileCatalog(catalog: GetTextTranslations): Buffer {
	return gettextPo.compile(catalog, {foldLength: 0, sort: compareCatalogEntries})
}

export function parseCatalog(input: Buffer | string): GetTextTranslations {
	return gettextPo.parse(input, {defaultCharset: 'UTF-8', validation: true})
}

function isFuzzy(entry: GetTextTranslation): boolean {
	return /\bfuzzy\b/.test(entry.comments?.flag ?? '')
}

function translated(entry: GetTextTranslation): boolean {
	return (entry.msgstr[0] ?? '').trim().length > 0
}

function matchingEntry(catalog: GetTextTranslations, key: string, source: string): GetTextTranslation | undefined {
	return catalog.translations[key]?.[source]
}

export function validateLocaleCatalog(lang: string, sourceLeaves: readonly StringLeaf[], catalog: GetTextTranslations): CatalogIssue[] {
	const issues: CatalogIssue[] = []
	const sourceByPath = leafMap(sourceLeaves)

	for (const leaf of sourceLeaves) {
		const context = catalog.translations[leaf.path]
		if (!context) {
			issues.push({kind: 'missing-entry', lang, key: leaf.path})
			continue
		}

		const entry = context[leaf.value]
		if (!entry) {
			issues.push({kind: 'stale-source', lang, key: leaf.path, detail: Object.keys(context).join(', ')})
			continue
		}

		if (isFuzzy(entry)) issues.push({kind: 'fuzzy', lang, key: leaf.path})
		if (!translated(entry)) issues.push({kind: 'untranslated', lang, key: leaf.path})
	}

	for (const key of Object.keys(catalog.translations)) {
		if (key === '') continue
		if (!sourceByPath.has(key)) issues.push({kind: 'extra-entry', lang, key})
	}

	return issues
}

function setPath(root: JsonObject, path: string, value: string): void {
	const parts = path.split('.')
	let cursor: JsonObject = root
	for (const part of parts.slice(0, -1)) {
		const next = cursor[part]
		if (isRecord(next)) {
			cursor = next
			continue
		}
		const child: JsonObject = {}
		cursor[part] = child
		cursor = child
	}
	cursor[parts[parts.length - 1] ?? path] = value
}

export function compileLocaleTree(sourceLeaves: readonly StringLeaf[], catalog: GetTextTranslations): JsonObject {
	const root: JsonObject = {}
	for (const leaf of sourceLeaves) {
		const entry = matchingEntry(catalog, leaf.path, leaf.value)
		setPath(root, leaf.path, entry?.msgstr[0] ?? '')
	}
	return root
}

export function normalizeCatalog(catalog: GetTextTranslations): GetTextTranslations {
	const activeCatalog: GetTextTranslations = {...catalog}
	delete activeCatalog.obsolete
	return parseCatalog(compileCatalog(activeCatalog))
}
