import en from '@shared/i18n/locales/en';
import es from '@shared/i18n/locales/es';
import fr from '@shared/i18n/locales/fr';
import de from '@shared/i18n/locales/de';
import ru from '@shared/i18n/locales/ru';
import uk from '@shared/i18n/locales/uk';
import ja from '@shared/i18n/locales/ja';
import zh from '@shared/i18n/locales/zh';
import hi from '@shared/i18n/locales/hi';
import type { SupportedLang } from '@shared/i18n/types';

const RESOURCES: Record<SupportedLang, unknown> = { en, es, fr, de, ru, uk, ja, zh, hi };

function lookup(tree: unknown, dottedKey: string): string | undefined {
  const parts = dottedKey.split('.');
  let cursor: unknown = tree;
  for (const part of parts) {
    if (cursor && typeof cursor === 'object' && part in (cursor as Record<string, unknown>)) {
      cursor = (cursor as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof cursor === 'string' ? cursor : undefined;
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{\{\s*([^}\s]+)\s*\}\}/g, (_, name: string) => {
    const v = params[name];
    return v === undefined ? `{{${name}}}` : String(v);
  });
}

export function mainT(
  lang: SupportedLang,
  dottedKey: string,
  params?: Record<string, string | number>
): string {
  const fromLang = lookup(RESOURCES[lang], dottedKey);
  if (fromLang) return interpolate(fromLang, params);
  const fromEn = lookup(RESOURCES.en, dottedKey);
  if (fromEn) return interpolate(fromEn, params);
  return dottedKey;
}

export function pluralKey(base: string, count: number): string {
  return count === 1 ? `${base}_one` : `${base}_other`;
}
