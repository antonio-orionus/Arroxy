import {describe, expect, it} from 'vite-plus/test'
import {applyStrings, missingTemplateKeys} from '../../readme-src/build.mjs'

const TEMPLATE = '# {{title}}\n{{intro}}\n{{LANG_NAV}}'

describe('README strings', () => {
	it('fills a key a locale has not translated yet with the English string', () => {
		expect(applyStrings(TEMPLATE, {title: 'Arroxy auf Deutsch'}, {title: 'Arroxy', intro: 'Download anything.'})).toBe('# Arroxy auf Deutsch\nDownload anything.\n{{LANG_NAV}}')
	})

	it('names the template keys English does not define, since nothing can fall back for them', () => {
		expect(missingTemplateKeys(TEMPLATE, {title: 'Arroxy'}, ['LANG_NAV'])).toEqual(['intro'])
		expect(missingTemplateKeys(TEMPLATE, {title: 'Arroxy', intro: 'Download anything.'}, ['LANG_NAV'])).toEqual([])
	})
})
