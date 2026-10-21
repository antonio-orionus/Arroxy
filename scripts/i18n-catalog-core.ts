import {po as gettextPo, type GetTextTranslation, type GetTextTranslations} from 'gettext-parser'

export interface StringLeaf {
	path: string
	value: string
	/** Translator-facing context, written to the PO as an extracted comment. */
	note?: string
}

export type CatalogIssueKind = 'missing-entry' | 'stale-source' | 'untranslated' | 'fuzzy' | 'latin-only' | 'placeholder-mismatch' | 'placeholder-drift' | 'extra-entry'

/**
 * Issues that only mean a locale is behind the English source. A PR that changes English leaves
 * them behind on purpose; the translation sync at release closes them.
 */
const OPEN_ISSUE_KINDS: ReadonlySet<CatalogIssueKind> = new Set(['missing-entry', 'stale-source', 'untranslated', 'fuzzy', 'extra-entry'])

export function isOpenIssue(issue: CatalogIssue): boolean {
	return OPEN_ISSUE_KINDS.has(issue.kind)
}

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

const PLURAL_CATEGORIES = ['zero', 'one', 'two', 'few', 'many', 'other'] as const
type PluralCategory = (typeof PLURAL_CATEGORIES)[number]
const PLURAL_KEY = /^(.+)_(zero|one|two|few|many|other)$/
const NOTE_EXAMPLE_LIMIT = 6

function isPluralCategory(value: string): value is PluralCategory {
	return PLURAL_CATEGORIES.some(category => category === value)
}

/** The CLDR plural categories i18next resolves for `lang`, in canonical order. */
export function pluralCategoriesFor(lang: string): PluralCategory[] {
	const used = new Set(new Intl.PluralRules(lang).resolvedOptions().pluralCategories)
	return PLURAL_CATEGORIES.filter(category => used.has(category))
}

function pluralNote(lang: string, category: PluralCategory): string {
	const rules = new Intl.PluralRules(lang)
	const examples: number[] = []
	for (let n = 0; n <= 200 && examples.length < NOTE_EXAMPLE_LIMIT; n += 1) if (rules.select(n) === category) examples.push(n)
	// Some locales only use a category for fractions (Russian `other`), which the integer scan never hits.
	if (examples.length === 0) return `Plural form "${category}" for ${lang}: used for fractional counts and other values not covered by the other forms.`
	return `Plural form "${category}" for ${lang}: used for counts like ${examples.join(', ')}.`
}

/**
 * English only carries the `one`/`other` plural forms. A locale needs one entry per
 * category in its own CLDR plural rule set, so this rewrites each English plural group
 * into the locale's categories. A category English lacks starts from the English
 * `other` copy, which the translator replaces.
 */
export function expandPluralLeaves(lang: string, sourceLeaves: readonly StringLeaf[]): StringLeaf[] {
	if (lang === 'en') return [...sourceLeaves]
	const groups = new Map<string, Map<PluralCategory, string>>()
	for (const leaf of sourceLeaves) {
		const match = PLURAL_KEY.exec(leaf.path)
		const base = match?.[1]
		const category = match?.[2]
		if (base === undefined || category === undefined || !isPluralCategory(category)) continue
		const forms = groups.get(base) ?? new Map<PluralCategory, string>()
		forms.set(category, leaf.value)
		groups.set(base, forms)
	}

	const categories = pluralCategoriesFor(lang)
	const expanded: StringLeaf[] = []
	const emitted = new Set<string>()
	for (const leaf of sourceLeaves) {
		const match = PLURAL_KEY.exec(leaf.path)
		const base = match?.[1]
		const forms = base === undefined ? undefined : groups.get(base)
		if (base === undefined || forms === undefined || !forms.has('other')) {
			expanded.push(leaf)
			continue
		}
		if (emitted.has(base)) continue
		emitted.add(base)
		for (const category of categories) expanded.push({path: `${base}_${category}`, value: forms.get(category) ?? forms.get('other') ?? '', note: pluralNote(lang, category)})
	}
	return expanded
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

function noteComments(leaf: StringLeaf): Pick<GetTextTranslation, 'comments'> {
	return leaf.note === undefined ? {} : {comments: {extracted: leaf.note}}
}

function addEntry(catalog: GetTextTranslations, entry: GetTextTranslation): void {
	const context = entry.msgctxt ?? ''
	catalog.translations[context] ??= {}
	catalog.translations[context][entry.msgid] = entry
}

export function buildSourceCatalog(sourceLeaves: readonly StringLeaf[]): GetTextTranslations {
	const catalog = emptyCatalog()
	for (const leaf of sourceLeaves) addEntry(catalog, {msgctxt: leaf.path, msgid: leaf.value, msgstr: [''], ...noteComments(leaf)})
	return catalog
}

export function buildLocaleCatalog(lang: string, sourceLeaves: readonly StringLeaf[], localeLeaves: readonly StringLeaf[]): GetTextTranslations {
	const localeByPath = leafMap(localeLeaves)
	const catalog = emptyCatalog(lang)
	for (const leaf of sourceLeaves) addEntry(catalog, {msgctxt: leaf.path, msgid: leaf.value, msgstr: [localeByPath.get(leaf.path) ?? ''], ...noteComments(leaf)})
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

/**
 * Keys whose translation may be Latin-only text in a non-Latin-script locale: product, file-format
 * and codec names, URL placeholders. Every other key there must contain the locale's own script.
 */
/**
 * Standard format names a locale may keep exactly as English writes them ("4K UHD 2160p", "Full HD
 * 1080p", "Smart TV 720p"): in Latin script in a non-Latin locale, and identical to the English.
 */
export const KEPT_AS_WRITTEN_KEYS: ReadonlySet<string> = new Set([
	'wizard.url.profile.builtinName.best-1440',
	'wizard.url.profile.builtinName.best-2160',
	'wizard.url.profile.builtinName.hd-1080',
	'wizard.url.profile.builtinName.mp4-1080',
	'wizard.url.profile.builtinName.mp4-720',
	'wizard.url.profile.builtinName.mp4-480'
])

const LATIN_ONLY_ALLOWED_KEYS: ReadonlySet<string> = new Set([
	'about.githubLink',
	'fileType.mkv',
	'fileType.mp4',
	'fileType.webm',
	'hdrPreference.hdr',
	'hdrPreference.sdr',
	'playlistPresets.audioFormat.mp3',
	'playlistPresets.audioFormat.opus',
	'repair.deps.ffmpeg',
	'repair.deps.ffprobe',
	'repair.deps.ytDlp',
	'tray.tooltip',
	'wizard.bulk.textareaPlaceholder',
	'wizard.formats.convert.lossyLabel',
	'wizard.formats.marker.vr',
	'wizard.profileEditor.audioFormat.wav',
	'wizard.profileEditor.goal.bestPicture.tag',
	'wizard.profileEditor.goal.smartTv.tag',
	'wizard.profileEditor.icon.podcast',
	'wizard.profileEditor.panel.sponsorBlock.title',
	'wizard.profileEditor.subtitleFormat.ass',
	'wizard.profileEditor.subtitleFormat.srt',
	'wizard.profileEditor.subtitleFormat.vtt',
	'wizard.review.areas.sponsorBlock',
	'wizard.review.rows.sponsorBlock',
	'wizard.steps.sponsorblock',
	'wizard.steps.url',
	'wizard.url.cookies.extensionChrome',
	'wizard.url.cookies.extensionFirefox',
	'wizard.url.features.youtube.heading',
	'wizard.url.features.youtube.podcast',
	'wizard.url.features.youtube.short',
	'wizard.url.placeholder',
	...KEPT_AS_WRITTEN_KEYS,
	'wizard.url.proxy.placeholder',
	'wizard.url.style.aurora.label'
])
const PLACEHOLDER = /\{\{[^}]*\}\}/g
const LATIN_WORD = /\p{Script=Latin}{2,}/u
const NON_LATIN_LETTER = /[^\P{L}\p{Script=Latin}]/u

/** Whether `lang` is written in Latin script, by its CLDR likely-subtags script. */
export function usesLatinScript(lang: string): boolean {
	return new Intl.Locale(lang).maximize().script === 'Latn'
}

/** Latin words and no letter of any other script: English copied over, or Serbian in Latin script. */
function isLatinOnly(text: string): boolean {
	const prose = text.replace(PLACEHOLDER, '')
	return LATIN_WORD.test(prose) && !NON_LATIN_LETTER.test(prose)
}

function matchingEntry(catalog: GetTextTranslations, key: string, source: string): GetTextTranslation | undefined {
	return catalog.translations[key]?.[source]
}

const LINE_TERMINATOR = /[\n\r\u2028\u2029]/

// `value, number`: i18next splits off the formatter and trims each part.
function canonicalName(name: string): string {
	return name
		.split(',')
		.map(part => part.trim())
		.join(', ')
}

/**
 * A placeholder as i18next reads it: `{{-name}}` (unescaped) or `{{name}}`, with the name and any
 * `, formatter` trimmed, so `{{ name }}` and `{{name}}` are one variable. A token across lines is
 * not interpolated at all, and `{{ -name }}` names a variable "-name": both keep their own form.
 */
function canonicalPlaceholder(token: string): string {
	if (LINE_TERMINATOR.test(token)) return token
	const inner = token.slice(2, -2)
	if (inner.startsWith('-')) return `{{-${canonicalName(inner.slice(1))}}}`
	const name = canonicalName(inner)
	return name.startsWith('-') ? `{{ ${name} }}` : `{{${name}}}`
}

function placeholders(text: string): string[] {
	return [...new Set((text.match(PLACEHOLDER) ?? []).map(canonicalPlaceholder))].sort()
}

function describePlaceholders(tokens: readonly string[]): string {
	return tokens.length === 0 ? 'none' : tokens.join(' ')
}

/**
 * Why `translation` cannot stand in for `source`, or undefined when its interpolation tokens match.
 * A plural form may drop or add `{{count}}`: i18next always supplies it, and many languages spell
 * out "one file" instead of "1 file".
 */
function placeholderMismatch(key: string, source: string, translation: string): string | undefined {
	const ignoresCount = PLURAL_KEY.test(key)
	const comparable = (tokens: string[]): string => tokens.filter(token => !ignoresCount || token !== '{{count}}').join(' ')
	const expected = placeholders(source)
	const found = placeholders(translation)
	if (comparable(expected) === comparable(found)) return undefined
	return `expected ${describePlaceholders(expected)}, found ${describePlaceholders(found)}`
}

function entryIssues(lang: string, key: string, entry: GetTextTranslation): CatalogIssue[] {
	const translation = entry.msgstr[0] ?? ''
	const issues: CatalogIssue[] = []
	if (!usesLatinScript(lang) && !LATIN_ONLY_ALLOWED_KEYS.has(key) && isLatinOnly(translation)) issues.push({kind: 'latin-only', lang, key, detail: translation})
	const mismatch = placeholderMismatch(key, entry.msgid, translation)
	if (mismatch !== undefined) issues.push({kind: 'placeholder-mismatch', lang, key, detail: mismatch})
	return issues
}

/**
 * Problems with the translations a catalog already has, whatever the current English says: a
 * translation that breaks its own source's placeholders, or English copied into a non-Latin-script
 * locale. Untranslated and fuzzy entries are skipped; they are open work, not wrong translations.
 */
export function validateCatalogEntries(lang: string, catalog: GetTextTranslations): CatalogIssue[] {
	const issues: CatalogIssue[] = []
	for (const [key, entries] of Object.entries(catalog.translations)) {
		if (key === '') continue
		for (const entry of Object.values(entries)) {
			if (isFuzzy(entry) || !translated(entry)) continue
			issues.push(...entryIssues(lang, key, entry))
		}
	}
	return issues
}

/** Runtime translations whose interpolation tokens no longer match the current English source. */
export function placeholderDrift(lang: string, sourceLeaves: readonly StringLeaf[], localeLeaves: readonly StringLeaf[]): CatalogIssue[] {
	const localeByPath = leafMap(localeLeaves)
	const issues: CatalogIssue[] = []
	for (const leaf of sourceLeaves) {
		const translation = localeByPath.get(leaf.path)
		if (translation === undefined) continue
		const mismatch = placeholderMismatch(leaf.path, leaf.value, translation)
		if (mismatch !== undefined) issues.push({kind: 'placeholder-drift', lang, key: leaf.path, detail: mismatch})
	}
	return issues
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

		// A fuzzy translation is of older English: the sync re-translates it, so only its state counts.
		if (isFuzzy(entry)) issues.push({kind: 'fuzzy', lang, key: leaf.path})
		else if (!translated(entry)) issues.push({kind: 'untranslated', lang, key: leaf.path})
		else issues.push(...entryIssues(lang, leaf.path, entry))
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

/**
 * The runtime tree for `lang`: every entry translated for the current English, and nothing else.
 * An entry that is missing, untranslated, fuzzy, stale or wrong is left out, so the app shows
 * English there (`fallbackLng`) until the release sync translates it. A plural group is written
 * whole or not at all, so one message never switches language between counts.
 */
export function compileLocaleTree(lang: string, sourceLeaves: readonly StringLeaf[], catalog: GetTextTranslations): JsonObject {
	const blocked = new Set(
		validateLocaleCatalog(lang, sourceLeaves, catalog)
			.filter(issue => issue.kind !== 'extra-entry')
			.map(issue => issue.key)
	)
	const blockedPluralBases = new Set([...blocked].flatMap(key => PLURAL_KEY.exec(key)?.[1] ?? []))
	const root: JsonObject = {}
	for (const leaf of sourceLeaves) {
		const pluralBase = PLURAL_KEY.exec(leaf.path)?.[1]
		if (blocked.has(leaf.path) || (pluralBase !== undefined && blockedPluralBases.has(pluralBase))) continue
		const entry = matchingEntry(catalog, leaf.path, leaf.value)
		if (entry !== undefined) setPath(root, leaf.path, entry.msgstr[0] ?? '')
	}
	return root
}

// JSON.parse puts integer-like keys first, in numeric order, whatever the file says; sorting them
// the same way keeps the canonical text identical to what a parse-and-stringify round trip gives.
const INTEGER_KEY = /^(?:0|[1-9]\d*)$/

function compareLocaleKeys(a: string, b: string): number {
	const aInteger = INTEGER_KEY.test(a)
	const bInteger = INTEGER_KEY.test(b)
	if (aInteger && bInteger) return Number(a) - Number(b)
	if (aInteger !== bInteger) return aInteger ? -1 : 1
	if (a === b) return 0
	return a < b ? -1 : 1
}

function sortLocaleTree(value: unknown): unknown {
	if (!isRecord(value)) return value
	const sorted: Record<string, unknown> = {}
	for (const key of Object.keys(value).sort(compareLocaleKeys)) sorted[key] = sortLocaleTree(value[key])
	return sorted
}

/**
 * Writes a locale tree in the one text form every locale JSON file is kept in: keys sorted by code unit at every level
 * (plural `_one`/`_other` siblings stay together), one key per line, tab-indented. Two changes then
 * conflict only when they touch the same or adjacent keys.
 */
export function serializeLocaleTree(tree: Readonly<Record<string, unknown>>): string {
	return `${JSON.stringify(sortLocaleTree(tree), null, '\t')}\n`
}

/** `text` rewritten in the canonical form of {@link serializeLocaleTree}. */
export function canonicalLocaleJson(text: string): string {
	const value: unknown = JSON.parse(text)
	if (!isRecord(value)) throw new Error('A locale file must hold a JSON object.')
	return serializeLocaleTree(value)
}

export function normalizeCatalog(catalog: GetTextTranslations): GetTextTranslations {
	const activeCatalog: GetTextTranslations = {...catalog}
	delete activeCatalog.obsolete
	return parseCatalog(compileCatalog(activeCatalog))
}
