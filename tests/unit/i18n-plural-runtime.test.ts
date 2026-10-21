import {createInstance, type ResourceKey} from 'i18next'
import {describe, expect, it} from 'vite-plus/test'
import {SUPPORTED_LANGS} from '../../src/shared/schemas.js'
import {flattenStringLeaves} from '../../scripts/i18n-catalog-core.js'

const PLURAL_SUFFIX = /_(?:zero|one|two|few|many|other)$/
const COUNTS = Array.from({length: 31}, (_, n) => n)

async function loadLocale(lang: string): Promise<ResourceKey> {
	return ((await import(`../../src/shared/i18n/locales/${lang}.json`, {with: {type: 'json'}})) as {default: ResourceKey}).default
}

// A locale may lack a plural message until the release translation sync, and then
// shows English for it. Every message it does have must cover all its counts:
// `i18n:compile` writes a plural group whole or not at all. The release gate
// checks that every locale has every message (tests/i18n-complete).
describe('runtime plural resolution of the messages a locale has', () => {
	for (const lang of SUPPORTED_LANGS.filter(l => l !== 'en')) {
		it(`${lang} resolves each of its plural messages for counts 0-30 without falling back to English`, async () => {
			const resources = await loadLocale(lang)
			const bases = [...new Set(flattenStringLeaves(resources).flatMap(l => (PLURAL_SUFFIX.test(l.path) ? [l.path.replace(PLURAL_SUFFIX, '')] : [])))]
			const i18n = createInstance()
			await i18n.init({lng: lang, resources: {[lang]: {translation: resources}}, interpolation: {escapeValue: false}, returnNull: false})

			// i18next types its keys from the English tree; plural bases here are dynamic.
			const t = i18n.t.bind(i18n) as unknown as (key: string, options: {count: number}) => string
			const unresolved: string[] = []
			for (const base of bases) {
				for (const count of COUNTS) {
					if (t(base, {count}) === base) unresolved.push(`${base}@${count}`)
				}
			}
			expect(unresolved).toEqual([])
		})
	}
})
