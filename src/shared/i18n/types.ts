import type en from './locales/en';
import {
  SUPPORTED_LANGS as LANGS,
  type SupportedLang as Lang,
  type YtdlpErrorKey as YtdlpErrorKeyAlias,
} from '../schemas';

// Re-export so existing imports of `@shared/i18n/types` and `@shared/i18n`
// continue to work; canonical definitions live in shared/schemas.ts.
export type SupportedLang = Lang;
export const SUPPORTED_LANGS = LANGS;

export type YtdlpErrorKey = YtdlpErrorKeyAlias;

export const LANGUAGE_NATIVE_NAMES: Record<SupportedLang, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  ru: 'Русский',
  uk: 'Українська',
  ja: '日本語',
  zh: '中文',
  hi: 'हिन्दी',
  bn: 'বাংলা',
  ar: 'العربية',
  uz: "O'zbekcha",
  my: 'မြန်မာဘာသာ',
  ps: 'پښتو',
  sw: 'Kiswahili',
  am: 'አማርኛ',
  om: 'Afaan Oromoo',
  el: 'Ελληνικά',
  sr: 'Српски'
};

export interface LocalizedError {
  key: YtdlpErrorKey | null;
  rawMessage?: string;
}

export type EnTranslation = typeof en;

type WidenStrings<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly WidenStrings<U>[]
    : { readonly [K in keyof T]: WidenStrings<T[K]> };

export type LocaleResource = WidenStrings<EnTranslation>;
