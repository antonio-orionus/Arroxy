import {describe, expect, it} from 'vite-plus/test'
import {applyStrings, missingTemplateKeys, readmeOpenKeys, resolveStamp, STAMP_TOKEN, untranslatedEnglishChanges} from '../../readme-src/build.mjs'

const TEMPLATE = '# {{title}}\n{{intro}}\n{{LANG_NAV}}'

describe('README strings', () => {
	it('fills a key a locale has not translated yet with the English string', () => {
		expect(applyStrings(TEMPLATE, {title: 'Arroxy auf Deutsch'}, {title: 'Arroxy', intro: 'Download anything.'})).toBe('# Arroxy auf Deutsch\nDownload anything.\n{{LANG_NAV}}')
	})

	it('names the template keys English does not define, since nothing can fall back for them', () => {
		expect(missingTemplateKeys(TEMPLATE, {title: 'Arroxy'}, ['LANG_NAV'])).toEqual(['intro'])
		expect(missingTemplateKeys(TEMPLATE, {title: 'Arroxy', intro: 'Download anything.'}, ['LANG_NAV'])).toEqual([])
	})

	it('names English strings that changed, appeared or went away since the locales were translated', () => {
		const translatedFrom = {title: 'Arroxy', intro: 'Download anything.', gone: 'Old line'}
		const en = {title: 'Arroxy', intro: 'Download almost anything.', added: 'New line'}

		expect(untranslatedEnglishChanges(en, translatedFrom)).toEqual({changed: ['intro'], added: ['added'], removed: ['gone']})
		expect(untranslatedEnglishChanges(translatedFrom, translatedFrom)).toEqual({changed: [], added: [], removed: []})
	})

	it('counts every README key the sync has to handle in a locale, removed ones included', () => {
		const translatedFrom = {title: 'Arroxy', intro: 'Download anything.', gone: 'Old line'}
		const en = {title: 'Arroxy', intro: 'Download almost anything.', added: 'New line'}
		const de = {title: 'Arroxy', intro: 'Lade alles herunter.', gone: 'Alte Zeile'}

		expect(readmeOpenKeys(en, de, translatedFrom)).toEqual(['added', 'gone', 'intro'])
		expect(readmeOpenKeys(en, {title: 'Arroxy', intro: 'Lade fast alles herunter.', added: 'Neue Zeile'}, en)).toEqual([])
		// Translated everywhere but not recorded yet: the sync still has to run --record-translated.
		expect(readmeOpenKeys(en, {title: 'Arroxy', intro: 'Lade fast alles herunter.', added: 'Neue Zeile'}, {title: 'Arroxy', intro: 'Download almost anything.'})).toEqual(['added'])
	})

	it("keeps a README's stamp date while its content is unchanged, whatever language the label is in", () => {
		const rendered = `# Arroxy\n> _Zuletzt aktualisiert: ${STAMP_TOKEN}._\n`
		const previous = '# Arroxy\n> _Zuletzt aktualisiert: 2026-05-14._\n'

		expect(resolveStamp(rendered, previous, '2026-10-21')).toEqual({date: '2026-05-14', changed: false})
		expect(resolveStamp(rendered.replace('Arroxy', 'Arroxy 2'), previous, '2026-10-21')).toEqual({date: '2026-10-21', changed: true})
		expect(resolveStamp(rendered, null, '2026-10-21')).toEqual({date: '2026-10-21', changed: true})
	})

	it('dates a README anew when its stamp label is translated', () => {
		const rendered = `> _Zuletzt aktualisiert: ${STAMP_TOKEN}._\n`

		expect(resolveStamp(rendered, '> _Last updated: 2026-05-14._\n', '2026-10-21')).toEqual({date: '2026-10-21', changed: true})
	})
})
