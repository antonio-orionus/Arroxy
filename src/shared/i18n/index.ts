import i18next, { type i18n as I18nInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import om from './locales/om';
import de from './locales/de';
import en from './locales/en';
import es from './locales/es';
import fr from './locales/fr';
import sw from './locales/sw';
import uz from './locales/uz';
import am from './locales/am';
import ar from './locales/ar';
import ur from './locales/ur';
import ps from './locales/ps';
import bn from './locales/bn';
import hi from './locales/hi';
import my from './locales/my';
import el from './locales/el';
import ru from './locales/ru';
import sr from './locales/sr';
import uk from './locales/uk';
import zh from './locales/zh';
import ja from './locales/ja';
import { SUPPORTED_LANGS, type SupportedLang, type EnTranslation, type LocaleResource } from './types';

export { SUPPORTED_LANGS, LANGUAGE_NATIVE_NAMES } from './types';
export type { SupportedLang, YtdlpErrorKey, LocalizedError } from './types';
export { isRtl } from './rtl';

const RESOURCES: Record<SupportedLang, LocaleResource> = {
  om,
  de,
  en,
  es,
  fr,
  sw,
  uz,
  am,
  ar,
  ur,
  ps,
  bn,
  hi,
  my,
  el,
  ru,
  sr,
  uk,
  zh,
  ja
};

export function pickLanguage(raw: string | undefined | null): SupportedLang {
  if (!raw) return 'en';
  const lower = raw.toLowerCase();
  const exact = SUPPORTED_LANGS.find((l) => l === lower);
  if (exact) return exact;
  const prefix = lower.split(/[-_]/)[0];
  const partial = SUPPORTED_LANGS.find((l) => l === prefix);
  return partial ?? 'en';
}

let initialized = false;

export function initI18n(language: SupportedLang): I18nInstance {
  if (initialized) {
    if (i18next.language !== language) void i18next.changeLanguage(language);
    return i18next;
  }
  initialized = true;
  void i18next.use(initReactI18next).init({
    lng: language,
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGS,
    defaultNS: 'translation',
    ns: ['translation'],
    resources: Object.fromEntries((Object.keys(RESOURCES) as SupportedLang[]).map((k) => [k, { translation: RESOURCES[k] }])),
    interpolation: { escapeValue: false },
    returnNull: false
  });
  return i18next;
}

export { i18next };

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: EnTranslation };
  }
}
