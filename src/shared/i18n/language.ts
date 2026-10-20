import {SUPPORTED_LANGS, type SupportedLang} from './types.js'

// The supported app language a locale tag names, or null when it names none.
function matchLanguage(raw: string): SupportedLang | null {
	// POSIX names carry a codeset and modifier (zh_TW.UTF-8, sr_RS@latin).
	const lower = raw.toLowerCase().replace(/[.@].*$/, '')
	if (/^zh(?:[-_](?:hant|tw|hk|mo))(?:[-_]|$)/.test(lower)) return 'zh-Hant'
	const exact = SUPPORTED_LANGS.find(l => l.toLowerCase() === lower)
	if (exact) return exact
	const prefix = lower.split(/[-_]/)[0]
	return SUPPORTED_LANGS.find(l => l === prefix) ?? null
}

// Maps an OS/browser locale tag onto the closest supported app language.
export function pickLanguage(raw: string | undefined | null): SupportedLang {
	return (raw ? matchLanguage(raw) : null) ?? 'en'
}

// The first of the OS's preferred languages (most preferred first) that the app
// supports, else en. Reads the OS list rather than Chromium's application locale,
// which falls back to en-US for every language Chromium ships no locale for (km,
// my, uz, ps, om among the app's own), so those users would never be matched.
export function pickSystemLanguage(preferred: readonly string[]): SupportedLang {
	for (const tag of preferred) {
		const lang = matchLanguage(tag)
		if (lang) return lang
	}
	return 'en'
}
