import type {SupportedLang} from '../schemas.js'

export const RTL_LANGS: ReadonlySet<SupportedLang> = new Set(['ar', 'fa', 'ps', 'ur'])

export function isRtl(lang: SupportedLang): boolean {
	return RTL_LANGS.has(lang)
}
