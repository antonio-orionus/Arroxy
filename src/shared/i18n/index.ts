import i18next, {type i18n as I18nInstance} from 'i18next'
import {initReactI18next} from 'react-i18next'
import {I18NEXT_OPTIONS} from './resources.js'
import type {SupportedLang, EnTranslation} from './types.js'

export {SUPPORTED_LANGS, LANGUAGE_NATIVE_NAMES} from './types.js'
export type {SupportedLang} from './types.js'
export {isRtl} from './rtl.js'
export {pickLanguage} from './language.js'

let initialized = false

export function initI18n(language: SupportedLang): I18nInstance {
	if (initialized) {
		if (i18next.language !== language) void i18next.changeLanguage(language)
		return i18next
	}
	initialized = true
	void i18next.use(initReactI18next).init({...I18NEXT_OPTIONS, lng: language})
	return i18next
}

export {i18next}

declare module 'i18next' {
	interface CustomTypeOptions {
		defaultNS: 'translation'
		resources: {translation: EnTranslation}
	}
}
