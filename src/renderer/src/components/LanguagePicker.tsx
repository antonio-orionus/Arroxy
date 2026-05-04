import type { JSX } from 'react';
import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { SUPPORTED_LANGS, LANGUAGE_NATIVE_NAMES, type SupportedLang } from '@shared/i18n';

export function LanguagePicker(): JSX.Element {
  const { t } = useTranslation();
  const { language, setLanguage } = useAppStore();

  return (
    <label className="flex items-center gap-1 text-muted-foreground" title={t('language.label')}>
      <Languages size={12} aria-hidden />
      <span className="sr-only">{t('language.label')}</span>
      <select value={language} onChange={(e) => setLanguage(e.target.value as SupportedLang)} aria-label={t('language.label')} className="bg-transparent border-none text-[12px] text-muted-foreground hover:text-foreground/80 focus:outline-none cursor-pointer pr-1">
        {SUPPORTED_LANGS.map((code) => (
          <option key={code} value={code} className="bg-background text-foreground">
            {LANGUAGE_NATIVE_NAMES[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
