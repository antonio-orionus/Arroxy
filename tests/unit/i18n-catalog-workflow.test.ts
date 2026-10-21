import {describe, expect, it} from 'vite-plus/test'
import {SUPPORTED_LANGS} from '../../src/shared/schemas.js'
import {buildLocaleCatalog, buildSourceCatalog, canonicalLocaleJson, compileCatalog, compileLocaleTree, expandPluralLeaves, flattenStringLeaves, parseCatalog, placeholderDrift, pluralCategoriesFor, usesLatinScript, validateCatalogEntries, validateLocaleCatalog} from '../../scripts/i18n-catalog-core.js'

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
		expect(compileLocaleTree('uk', source, catalog)).toEqual(uk)
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

	describe('compiling a locale that is behind the English source', () => {
		const source = flattenStringLeaves({...en, common: {...en.common, retry: 'Retry'}})

		it('leaves out entries the locale has not translated yet, so they fall back to English', () => {
			const catalog = buildLocaleCatalog('uk', flattenStringLeaves(en), flattenStringLeaves(uk))

			expect(compileLocaleTree('uk', source, catalog)).toEqual(uk)
		})

		it('leaves out fuzzy and stale entries instead of shipping a translation of older English', () => {
			const catalog = buildLocaleCatalog('uk', flattenStringLeaves(en), flattenStringLeaves(uk))
			const entry = catalog.translations['common.cancel']?.Cancel
			if (!entry) throw new Error('fixture catalog missing common.cancel')
			entry.comments = {...entry.comments, flag: 'fuzzy'}
			const reworded = flattenStringLeaves({...en, progress: {done: '{{count}} file finished'}})

			expect(compileLocaleTree('uk', reworded, catalog)).toEqual({common: {start: 'Почати завантаження'}})
		})

		it('writes a plural group whole or not at all, so one message never mixes languages across counts', () => {
			const plural = flattenStringLeaves({files_one: '{{count}} file', files_other: '{{count}} files', title: 'Title'})
			const ruSource = expandPluralLeaves('ru', plural)
			const catalog = buildLocaleCatalog('ru', ruSource, flattenStringLeaves({files_one: '{{count}} файл', files_few: '{{count}} файла', files_other: '{{count}} файла', title: 'Заголовок'}))

			expect(compileLocaleTree('ru', ruSource, catalog)).toEqual({title: 'Заголовок'})
		})

		it('leaves out a translation whose placeholders no longer match its English', () => {
			const catalog = buildLocaleCatalog('uk', flattenStringLeaves(en), flattenStringLeaves({...uk, progress: {done: '{{total}} файл завершено'}}))

			expect(compileLocaleTree('uk', flattenStringLeaves(en), catalog)).toEqual({common: uk.common})
		})
	})

	describe('placeholders', () => {
		it('flags a translation that drops or invents an interpolation token', () => {
			const source = flattenStringLeaves({status: 'Downloading {{name}} to {{folder}}'})
			const catalog = buildLocaleCatalog('uk', source, flattenStringLeaves({status: 'Завантаження {{name}} до {{dir}}'}))

			expect(validateLocaleCatalog('uk', source, catalog)).toEqual([{kind: 'placeholder-mismatch', lang: 'uk', key: 'status', detail: 'expected {{folder}} {{name}}, found {{dir}} {{name}}'}])
		})

		it('lets a plural form leave out {{count}}, which i18next always supplies', () => {
			const source = expandPluralLeaves('ar', flattenStringLeaves({files_one: '{{count}} file', files_other: '{{count}} files'}))
			const catalog = buildLocaleCatalog('ar', source, flattenStringLeaves({files_zero: 'لا ملفات', files_one: 'ملف واحد', files_two: 'ملفان', files_few: '{{count}} ملفات', files_many: '{{count}} ملفًا', files_other: '{{count}} ملف'}))

			expect(validateLocaleCatalog('ar', source, catalog)).toEqual([])
		})

		it('reports runtime translations whose placeholders drifted from the current English', () => {
			const source = flattenStringLeaves({status: 'Downloading {{file}}', title: 'Title'})

			expect(placeholderDrift('uk', source, flattenStringLeaves({status: 'Завантаження {{name}}', title: 'Заголовок'}))).toEqual([{kind: 'placeholder-drift', lang: 'uk', key: 'status', detail: 'expected {{file}}, found {{name}}'}])
		})
	})

	describe('checking the translations a catalog already has', () => {
		it('accepts a catalog that is merely behind the English source', () => {
			const catalog = buildLocaleCatalog('uk', flattenStringLeaves(en), flattenStringLeaves({common: {start: 'Почати завантаження'}}))

			expect(validateCatalogEntries('uk', catalog)).toEqual([])
		})

		it('flags broken placeholders and English copied into a non-Latin-script locale', () => {
			const catalog = buildLocaleCatalog('uk', flattenStringLeaves(en), flattenStringLeaves({common: {start: 'Start download', cancel: 'Скасувати'}, progress: {done: '{{total}} файл завершено'}}))

			expect(validateCatalogEntries('uk', catalog)).toEqual([
				{kind: 'latin-only', lang: 'uk', key: 'common.start', detail: 'Start download'},
				{kind: 'placeholder-mismatch', lang: 'uk', key: 'progress.done', detail: 'expected {{count}}, found {{total}}'}
			])
		})

		it('skips fuzzy entries, which the next sync re-checks', () => {
			const catalog = buildLocaleCatalog('uk', flattenStringLeaves(en), flattenStringLeaves({...uk, progress: {done: '{{total}} файл завершено'}}))
			const entry = catalog.translations['progress.done']?.['{{count}} file complete']
			if (!entry) throw new Error('fixture catalog missing progress.done')
			entry.comments = {...entry.comments, flag: 'fuzzy'}

			expect(validateCatalogEntries('uk', catalog)).toEqual([])
		})
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
			expect(compileLocaleTree('ru', ruSource, catalog)).toEqual(ru)
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
			const catalog = parseCatalog(poFixture({...ru, 'progress.done': 'Скачано {{count}} файлов с YouTube'}))

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

	describe('canonical locale JSON', () => {
		it('sorts keys at every level and writes one key per line', () => {
			const packed = '{"wizard": {"title": "Wizard", "steps": {"url": "URL", "format": "Format"}}, "common": {"cancel": "Cancel", "back": "Back"}}'

			expect(canonicalLocaleJson(packed)).toBe('{\n\t"common": {\n\t\t"back": "Back",\n\t\t"cancel": "Cancel"\n\t},\n\t"wizard": {\n\t\t"steps": {\n\t\t\t"format": "Format",\n\t\t\t"url": "URL"\n\t\t},\n\t\t"title": "Wizard"\n\t}\n}\n')
		})

		it('keeps plural siblings together next to the keys that share their stem', () => {
			const tree = JSON.parse(canonicalLocaleJson('{"files_other": "{{count}} files", "filesLabel": "Files", "files_one": "{{count}} file", "filter": "Filter"}')) as Record<string, string>

			expect(Object.keys(tree)).toEqual(['filesLabel', 'files_one', 'files_other', 'filter'])
		})

		it('orders numeric keys by value, as JSON.parse returns them', () => {
			const tree = JSON.parse(canonicalLocaleJson('{"tier": {"label": "Tier", "1080": "1080p", "144": "144p", "720": "720p"}}')) as {tier: Record<string, string>}

			expect(Object.keys(tree.tier)).toEqual(['144', '720', '1080', 'label'])
		})

		it('is stable, so a canonical file passes through unchanged', () => {
			const canonical = canonicalLocaleJson('{"b": {"y": "Y", "x": "X"}, "a": "A"}')

			expect(canonicalLocaleJson(canonical)).toBe(canonical)
		})

		it('rejects a locale file that is not a JSON object', () => {
			expect(() => canonicalLocaleJson('["a"]')).toThrow(/JSON object/)
		})
	})
})
