import {createInstance, type ResourceKey} from 'i18next'
import {describe, expect, it} from 'vite-plus/test'
import en from '../../src/shared/i18n/locales/en.json' with {type: 'json'}
import {SUPPORTED_LANGS} from '../../src/shared/schemas.js'
import {flattenStringLeaves} from '../../scripts/i18n-catalog-core.js'

const PLURAL_SUFFIX = /_(?:zero|one|two|few|many|other)$/
const pluralBases = [...new Set(flattenStringLeaves(en).flatMap(l => (PLURAL_SUFFIX.test(l.path) ? [l.path.replace(PLURAL_SUFFIX, '')] : [])))]
const COUNTS = Array.from({length: 31}, (_, n) => n)

async function loadLocale(lang: string): Promise<ResourceKey> {
	return ((await import(`../../src/shared/i18n/locales/${lang}.json`, {with: {type: 'json'}})) as {default: ResourceKey}).default
}

describe('runtime plural resolution', () => {
	it('finds the plural keys in English', () => {
		expect(pluralBases.length).toBeGreaterThanOrEqual(30)
	})

	// No fallbackLng: i18next returns the bare key when the locale lacks the category, so
	// this fails exactly where production would silently show English.
	for (const lang of SUPPORTED_LANGS.filter(l => l !== 'en')) {
		it(`${lang} resolves every plural key for counts 0-30 without falling back to English`, async () => {
			const i18n = createInstance()
			await i18n.init({lng: lang, resources: {[lang]: {translation: await loadLocale(lang)}}, interpolation: {escapeValue: false}, returnNull: false})

			// i18next types its keys from the English tree; plural bases here are dynamic.
			const t = i18n.t.bind(i18n) as unknown as (key: string, options: {count: number}) => string
			const unresolved: string[] = []
			for (const base of pluralBases) {
				for (const count of COUNTS) {
					if (t(base, {count}) === base) unresolved.push(`${base}@${count}`)
				}
			}
			expect(unresolved).toEqual([])
		})
	}
})
