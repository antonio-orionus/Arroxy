import {describe, expect, it} from 'vitest'
import {buildLocaleCatalog, buildSourceCatalog, compileCatalog, compileLocaleTree, flattenStringLeaves, validateLocaleCatalog} from '../../scripts/i18n-catalog-core.js'

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
})
