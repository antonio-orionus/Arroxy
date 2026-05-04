import i18next, { type i18n as I18nInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en';
import es from './locales/es';
import fr from './locales/fr';
import de from './locales/de';
import ru from './locales/ru';
import uk from './locales/uk';
import ja from './locales/ja';
import zh from './locales/zh';
import hi from './locales/hi';
import bn from './locales/bn';
import ar from './locales/ar';
import uz from './locales/uz';
import my from './locales/my';
import ps from './locales/ps';
import sw from './locales/sw';
import am from './locales/am';
import om from './locales/om';
import el from './locales/el';
import sr from './locales/sr';
import { SUPPORTED_LANGS, type SupportedLang, type EnTranslation, type LocaleResource } from './types';

export { SUPPORTED_LANGS, LANGUAGE_NATIVE_NAMES } from './types';
export type { SupportedLang, YtdlpErrorKey, LocalizedError } from './types';
export { isRtl } from './rtl';

const RESOURCES: Record<SupportedLang, LocaleResource> = {
  en,
  es,
  fr,
  de,
  ru,
  uk,
  ja,
  zh,
  hi,
  bn,
  ar,
  uz,
  my,
  ps,
  sw,
  am,
  om,
  el,
  sr
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
    supportedLngs: SUPPORTED_LANGS as unknown as string[],
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
