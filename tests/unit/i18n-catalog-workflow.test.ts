import {describe, expect, it} from 'vite-plus/test'
import {SUPPORTED_LANGS} from '../../src/shared/schemas.js'
import {buildLocaleCatalog, buildSourceCatalog, compileCatalog, compileLocaleTree, expandPluralLeaves, flattenStringLeaves, parseCatalog, pluralCategoriesFor, usesLatinScript, validateLocaleCatalog} from '../../scripts/i18n-catalog-core.js'

describe('i18n catalog workflow', () => {
	const en = {common: {start: 'Start download', cancel: 'Cancel'}, progress: {done: '{{count}} file complete'}}
	const uk = {common: {start: 'Почати завантаження', cancel: 'Скасувати'}, progress: {done: '{{count}} файл завершено'}}

	it('builds stable PO catalogs from nested i18next resources', () => {
		const source = flattenStringLeaves(en)
		const pot = compileCatalog(buildSourceCatalog(source)).toString('utf8')
		const po = compileCatalog(buildLocaleCatalog('uk', source, flattenStringLeaves(uk))).toString('utf8')

		expect(pot).toContain('msgctxt "common.start"')
		expect(pot).toContain('msgid "Start download"')
		expect(po).toContain('msgstr "Почати завантаження"')
		expect(pot).not.toContain('POT-Creation-Date')
	})

	it('compiles a complete locale PO back into the i18next JSON tree', () => {
		const source = flattenStringLeaves(en)
		const catalog = buildLocaleCatalog('uk', source, flattenStringLeaves(uk))

		expect(validateLocaleCatalog('uk', source, catalog)).toEqual([])
		expect(compileLocaleTree(source, catalog)).toEqual(uk)
	})

	it('flags stale translations when the English source changes under an existing key', () => {
		const oldSource = flattenStringLeaves(en)
		const catalog = buildLocaleCatalog('uk', oldSource, flattenStringLeaves(uk))
		const newSource = flattenStringLeaves({...en, common: {...en.common, start: 'Start downloading'}})

		expect(validateLocaleCatalog('uk', newSource, catalog)).toContainEqual({kind: 'stale-source', lang: 'uk', key: 'common.start', detail: 'Start download'})
	})

	it('blocks fuzzy entries from generated runtime JSON', () => {
		const source = flattenStringLeaves(en)
		const catalog = buildLocaleCatalog('uk', source, flattenStringLeaves(uk))
		const entry = catalog.translations['common.start']?.['Start download']
		if (!entry) throw new Error('fixture catalog missing common.start')
		entry.comments = {...entry.comments, flag: 'fuzzy'}

		expect(validateLocaleCatalog('uk', source, catalog)).toContainEqual({kind: 'fuzzy', lang: 'uk', key: 'common.start'})
	})

	describe('plural categories', () => {
		const enPlural = {a: {count_one: '{{count}} video', count_other: '{{count}} videos'}, title: 'Title'}
		const source = flattenStringLeaves(enPlural)

		it("reads each locale's CLDR categories from Intl.PluralRules", () => {
			expect(pluralCategoriesFor('en')).toEqual(['one', 'other'])
			expect(pluralCategoriesFor('ru')).toEqual(['one', 'few', 'many', 'other'])
			expect(pluralCategoriesFor('ar')).toEqual(['zero', 'one', 'two', 'few', 'many', 'other'])
			expect(pluralCategoriesFor('ja')).toEqual(['other'])
		})

		it('expands an English one/other pair into the categories the locale needs', () => {
			const ru = expandPluralLeaves('ru', source)
			expect(ru.map(l => l.path)).toEqual(['a.count_one', 'a.count_few', 'a.count_many', 'a.count_other', 'title'])
			// English has no few/many form, so the translator starts from the English "other" copy.
			expect(ru.find(l => l.path === 'a.count_few')?.value).toBe('{{count}} videos')
			expect(ru.find(l => l.path === 'a.count_one')?.value).toBe('{{count}} video')
		})

		it('drops categories the locale never uses', () => {
			expect(expandPluralLeaves('ja', source).map(l => l.path)).toEqual(['a.count_other', 'title'])
		})

		it('leaves English untouched', () => {
			expect(expandPluralLeaves('en', source)).toEqual(source)
		})

		it('tells translators which counts a category covers', () => {
			const few = expandPluralLeaves('ru', source).find(l => l.path === 'a.count_few')
			expect(few?.note).toMatch(/few/)
			expect(few?.note).toMatch(/2, 3, 4/)
		})

		it('puts the category note in the translation template so msgmerge carries it into the PO', () => {
			const pot = compileCatalog(buildSourceCatalog(expandPluralLeaves('ru', source))).toString('utf8')
			expect(pot).toMatch(/#\. Plural form "few" for ru/)
		})

		it('round-trips locale-specific plural entries through the PO catalog', () => {
			const ruSource = expandPluralLeaves('ru', source)
			const ru = {a: {count_one: '{{count}} видео', count_few: '{{count}} видео', count_many: '{{count}} видео', count_other: '{{count}} видео'}, title: 'Заголовок'}
			const catalog = buildLocaleCatalog('ru', ruSource, flattenStringLeaves(ru))

			expect(validateLocaleCatalog('ru', ruSource, catalog)).toEqual([])
			expect(compileLocaleTree(ruSource, catalog)).toEqual(ru)
			expect(compileCatalog(catalog).toString('utf8')).toContain('#. ')
		})

		it('flags a plural category the locale does not use as an extra entry', () => {
			const jaSource = expandPluralLeaves('ja', source)
			const catalog = buildLocaleCatalog('ja', expandPluralLeaves('ru', source), [])

			expect(
				validateLocaleCatalog('ja', jaSource, catalog)
					.filter(i => i.kind === 'extra-entry')
					.map(i => i.key)
			).toEqual(['a.count_one', 'a.count_few', 'a.count_many'])
		})
	})
	describe('Latin-only translations in non-Latin-script locales', () => {
		const source = flattenStringLeaves({...en, repair: {deps: {ytDlp: 'yt-dlp'}}, format: {tag: 'H.264 · 4K'}})
		const poFixture = (msgstrs: Record<string, string>): string => ['msgid ""', 'msgstr ""', '"Content-Type: text/plain; charset=UTF-8\\n"', ...source.map(leaf => ['', `msgctxt "${leaf.path}"`, `msgid "${leaf.value}"`, `msgstr "${msgstrs[leaf.path] ?? ''}"`].join('\n'))].join('\n')
		const ru = {'common.start': 'Начать загрузку', 'common.cancel': 'Отмена', 'progress.done': '{{count}} файл завершён', 'repair.deps.ytDlp': 'yt-dlp', 'format.tag': 'H.264 · 4K'}

		it('flags an entry whose translation is the English source copied over, but not allowlisted names or codec tokens', () => {
			const catalog = parseCatalog(poFixture({...ru, 'common.start': 'Start download'}))

			expect(validateLocaleCatalog('ru', source, catalog)).toEqual([{kind: 'latin-only', lang: 'ru', key: 'common.start', detail: 'Start download'}])
		})

		it('accepts native text around placeholders and Latin names', () => {
			const catalog = parseCatalog(poFixture({...ru, 'common.start': 'Скачать {{name}} с YouTube'}))

			expect(validateLocaleCatalog('ru', source, catalog)).toEqual([])
		})

		it('flags Serbian written in Latin script instead of Cyrillic', () => {
			const catalog = parseCatalog(poFixture({...ru, 'common.cancel': 'Otkaži'}))

			expect(validateLocaleCatalog('sr', source, catalog)).toContainEqual({kind: 'latin-only', lang: 'sr', key: 'common.cancel', detail: 'Otkaži'})
		})

		it('leaves Latin-script locales alone, where an English-looking word can be the translation', () => {
			const catalog = parseCatalog(poFixture({'common.start': 'Start download', 'common.cancel': 'Abbrechen', 'progress.done': '{{count}} Datei fertig', 'repair.deps.ytDlp': 'yt-dlp', 'format.tag': 'H.264 · 4K'}))

			expect(validateLocaleCatalog('de', source, catalog)).toEqual([])
		})

		it('reads the script of each supported locale from CLDR', () => {
			expect(SUPPORTED_LANGS.filter(lang => !usesLatinScript(lang)).sort()).toEqual(['am', 'ar', 'bg', 'bn', 'el', 'fa', 'he', 'hi', 'ja', 'km', 'ko', 'my', 'ps', 'ru', 'sr', 'th', 'uk', 'ur', 'zh', 'zh-Hant'])
		})
	})
})
