import type en from './locales/en.js'
import {SUPPORTED_LANGS as LANGS, type SupportedLang as Lang, type YtDlpErrorKind as YtDlpErrorKindAlias} from '../schemas.js'

// Re-export so existing imports of `@shared/i18n/types` and `@shared/i18n`
// continue to work; canonical definitions live in shared/schemas.ts.
export type SupportedLang = Lang
export const SUPPORTED_LANGS = LANGS

export type YtDlpErrorKind = YtDlpErrorKindAlias

// Order = alphabetical by native endonym (Latin block first via Unicode collation,
// then non-Latin scripts in Unicode order). Drives the language picker UI.
export const LANGUAGE_NATIVE_NAMES: Record<SupportedLang, string> = {
	om: 'Afaan Oromoo',
	de: 'Deutsch',
	en: 'English',
	es: 'Español',
	fr: 'Français',
	sw: 'Kiswahili',
	uz: "O'zbekcha",
	vi: 'Tiếng Việt',
	am: 'አማርኛ',
	ar: 'العربية',
	ur: 'اردو',
	ps: 'پښتو',
	bn: 'বাংলা',
	hi: 'हिन्दी',
	my: 'မြန်မာဘာသာ',
	el: 'Ελληνικά',
	ru: 'Русский',
	sr: 'Српски',
	uk: 'Українська',
	zh: '中文',
	ja: '日本語'
}

// `kind` is always populated — `'unknown'` covers the unmatched-stderr fallback.
// `raw` is the verbatim stderr (or message) the renderer surfaces directly when
// the kind has no i18n template.
export interface LocalizedError {
	kind: YtDlpErrorKind
	raw: string
}

export type EnTranslation = typeof en

// Non-en locales are allowed to be partial — when a key is missing, i18next
// falls back to the en value at runtime. Parity is enforced for public-facing
// content (readme/landing build scripts), but UI strings are added en-first
// and translations fan out incrementally, so we don't enforce structural parity
// in TypeScript. Every leaf is widened to `string` so any translation is
// structurally valid; every nested key is optional.
type DeepPartialStringLeaves<T> = T extends string ? string : T extends readonly (infer U)[] ? readonly DeepPartialStringLeaves<U>[] : {readonly [K in keyof T]?: DeepPartialStringLeaves<T[K]>}

export type LocaleResource = DeepPartialStringLeaves<EnTranslation>
