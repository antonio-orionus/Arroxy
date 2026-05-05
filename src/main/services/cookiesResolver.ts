import type { AppSettings } from '@shared/types';
import { nonEmpty } from '@shared/format';

export function resolveCookiesPath(settings: AppSettings): string | undefined {
  if (!settings.cookiesEnabled) return undefined;
  return nonEmpty(settings.cookiesPath?.trim());
}
