import {SUPPORTED_LANGS, type SupportedLang} from './types.js'

// Maps an OS/browser locale tag onto the closest supported app language.
export function pickLanguage(raw: string | undefined | null): SupportedLang {
	if (!raw) return 'en'
	const lower = raw.toLowerCase()
	if (/^zh(?:[-_](?:hant|tw|hk|mo))(?:[-_]|$)/.test(lower)) return 'zh-Hant'
	const exact = SUPPORTED_LANGS.find(l => l.toLowerCase() === lower)
	if (exact) return exact
	const prefix = lower.split(/[-_]/)[0]
	const partial = SUPPORTED_LANGS.find(l => l === prefix)
	return partial ?? 'en'
}
