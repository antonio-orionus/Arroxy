import {createInstance, type i18n as I18nInstance} from 'i18next'
import {initReactI18next} from 'react-i18next'
import en from '@shared/i18n/locales/en.json' with {type: 'json'}

// A pseudo-locale that brackets each catalog string makes hardcoded English
// stand out: once the bracketed text, key caps and the user's own data (profile
// name, folder) are removed, no word may be left.

function bracketLeaves(node: unknown): unknown {
	if (typeof node === 'string') return `⟦${node}⟧`
	if (node === null || typeof node !== 'object' || Array.isArray(node)) return node
	return Object.fromEntries(Object.entries(node).map(([key, value]) => [key, bracketLeaves(value)]))
}

export async function pseudoI18n(): Promise<I18nInstance> {
	const instance = createInstance()
	await instance.use(initReactI18next).init({lng: 'en', fallbackLng: 'en', resources: {en: {translation: bracketLeaves(en) as Record<string, unknown>}}, interpolation: {escapeValue: false}, returnNull: false})
	return instance
}

export function untranslatedWords(element: HTMLElement, userData: readonly string[]): string[] {
	const copy = element.cloneNode(true)
	if (!(copy instanceof HTMLElement)) throw new Error('expected an element')
	for (const keyCap of copy.querySelectorAll('kbd')) keyCap.remove()
	// Innermost first: a translated value interpolated into another nests its brackets.
	let text = copy.textContent ?? ''
	for (let previous = ''; previous !== text;) {
		previous = text
		text = text.replace(/⟦[^⟦⟧]*⟧/g, ' ')
	}
	// Longest first, so a folder is removed before the profile name inside it.
	for (const value of [...userData].sort((a, b) => b.length - a.length)) text = text.split(value).join(' ')
	return text.match(/[A-Za-z]{2,}/g) ?? []
}
