import {pickLanguage, type SupportedLang} from '@shared/i18n/index.js'

// The first-launch language. Main picks it from the OS's preferred languages and
// passes it through the preload; `navigator.language` is Chromium's clamped
// locale (en-US for every language Chromium ships none for), so it is read only
// when main passed nothing — the browser-mock renderer, which has no main.
export function systemLanguage(): SupportedLang {
	const fromMain = typeof window === 'undefined' ? null : window.runtimeInfo?.systemLanguage
	if (fromMain) return pickLanguage(fromMain)
	return typeof navigator === 'undefined' ? 'en' : pickLanguage(navigator.language)
}
