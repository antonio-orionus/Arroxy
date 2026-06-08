import i18next, {type i18n as I18nInstance} from 'i18next'
import {initReactI18next} from 'react-i18next'
import om from './locales/om.js'
import de from './locales/de.js'
import en from './locales/en.js'
import es from './locales/es.js'
import fr from './locales/fr.js'
import sw from './locales/sw.js'
import uz from './locales/uz.js'
import am from './locales/am.js'
import ar from './locales/ar.js'
import ur from './locales/ur.js'
import ps from './locales/ps.js'
import bn from './locales/bn.js'
import hi from './locales/hi.js'
import my from './locales/my.js'
import el from './locales/el.js'
import ru from './locales/ru.js'
import sr from './locales/sr.js'
import uk from './locales/uk.js'
import zh from './locales/zh.js'
import ja from './locales/ja.js'
import vi from './locales/vi.js'
import {SUPPORTED_LANGS, type SupportedLang, type EnTranslation, type LocaleResource} from './types.js'

export {SUPPORTED_LANGS, LANGUAGE_NATIVE_NAMES} from './types.js'
export type {SupportedLang, YtDlpErrorKind, LocalizedError} from './types.js'
export {isRtl} from './rtl.js'

const RESOURCES: Record<SupportedLang, LocaleResource> = {om, de, en, es, fr, sw, uz, vi, am, ar, ur, ps, bn, hi, my, el, ru, sr, uk, zh, ja}

export function pickLanguage(raw: string | undefined | null): SupportedLang {
	if (!raw) return 'en'
	const lower = raw.toLowerCase()
	const exact = SUPPORTED_LANGS.find(l => l === lower)
	if (exact) return exact
	const prefix = lower.split(/[-_]/)[0]
	const partial = SUPPORTED_LANGS.find(l => l === prefix)
	return partial ?? 'en'
}

let initialized = false

export function initI18n(language: SupportedLang): I18nInstance {
	if (initialized) {
		if (i18next.language !== language) void i18next.changeLanguage(language)
		return i18next
	}
	initialized = true
	void i18next
		.use(initReactI18next)
		.init({lng: language, fallbackLng: 'en', supportedLngs: SUPPORTED_LANGS, defaultNS: 'translation', ns: ['translation'], resources: Object.fromEntries((Object.keys(RESOURCES) as SupportedLang[]).map(k => [k, {translation: RESOURCES[k]}])), interpolation: {escapeValue: false}, returnNull: false})
	return i18next
}

export {i18next}

declare module 'i18next' {
	interface CustomTypeOptions {
		defaultNS: 'translation'
		resources: {translation: EnTranslation}
	}
}
