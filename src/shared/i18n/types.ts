import type en from './locales/en';
import { SUPPORTED_LANGS as LANGS, type SupportedLang as Lang, type YtdlpErrorKey as YtdlpErrorKeyAlias } from '../schemas';

// Re-export so existing imports of `@shared/i18n/types` and `@shared/i18n`
// continue to work; canonical definitions live in shared/schemas.ts.
export type SupportedLang = Lang;
export const SUPPORTED_LANGS = LANGS;

export type YtdlpErrorKey = YtdlpErrorKeyAlias;

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
};

export interface LocalizedError {
  key: YtdlpErrorKey | null;
  rawMessage?: string;
}

export type EnTranslation = typeof en;

type WidenStrings<T> = T extends string ? string : T extends readonly (infer U)[] ? readonly WidenStrings<U>[] : { readonly [K in keyof T]: WidenStrings<T[K]> };

export type LocaleResource = WidenStrings<EnTranslation>;
