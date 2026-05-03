import type { SupportedLang } from '../schemas';

export const RTL_LANGS: ReadonlySet<SupportedLang> = new Set(['ar', 'ps']);

export function isRtl(lang: SupportedLang): boolean {
  return RTL_LANGS.has(lang);
}
