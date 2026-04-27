import type en from './locales/en';

export type SupportedLang = 'en' | 'es' | 'fr' | 'de' | 'ru' | 'uk' | 'ja' | 'zh' | 'hi';

export const SUPPORTED_LANGS: readonly SupportedLang[] = ['en', 'es', 'fr', 'de', 'ru', 'uk', 'ja', 'zh', 'hi'] as const;

export const LANGUAGE_NATIVE_NAMES: Record<SupportedLang, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  ru: 'Русский',
  uk: 'Українська',
  ja: '日本語',
  zh: '中文',
  hi: 'हिन्दी'
};

export type StatusKey =
  | 'preparingBinaries'
  | 'mintingToken'
  | 'remintingToken'
  | 'startingYtdlp'
  | 'cancelled'
  | 'complete'
  | 'ytdlpProcessError'
  | 'ytdlpExitCode'
  | 'downloadingBinary'
  | 'unknownStartupFailure';

export type YtdlpErrorKey =
  | 'botBlock'
  | 'ipBlock'
  | 'rateLimit'
  | 'ageRestricted'
  | 'unavailable'
  | 'geoBlocked';

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
