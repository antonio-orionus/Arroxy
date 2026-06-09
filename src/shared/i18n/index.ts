import i18next, {type i18n as I18nInstance} from 'i18next'
import {initReactI18next} from 'react-i18next'
import om from './locales/om.json' with {type: 'json'}
import de from './locales/de.json' with {type: 'json'}
import en from './locales/en.json' with {type: 'json'}
import es from './locales/es.json' with {type: 'json'}
import fr from './locales/fr.json' with {type: 'json'}
import sw from './locales/sw.json' with {type: 'json'}
import uz from './locales/uz.json' with {type: 'json'}
import am from './locales/am.json' with {type: 'json'}
import ar from './locales/ar.json' with {type: 'json'}
import ur from './locales/ur.json' with {type: 'json'}
import ps from './locales/ps.json' with {type: 'json'}
import bn from './locales/bn.json' with {type: 'json'}
import hi from './locales/hi.json' with {type: 'json'}
import my from './locales/my.json' with {type: 'json'}
import el from './locales/el.json' with {type: 'json'}
import ru from './locales/ru.json' with {type: 'json'}
import sr from './locales/sr.json' with {type: 'json'}
import uk from './locales/uk.json' with {type: 'json'}
import zh from './locales/zh.json' with {type: 'json'}
import ja from './locales/ja.json' with {type: 'json'}
import vi from './locales/vi.json' with {type: 'json'}
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
