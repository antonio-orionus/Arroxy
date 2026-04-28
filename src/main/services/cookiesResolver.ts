import type { AppSettings } from '@shared/types';

export function resolveCookiesPath(settings: AppSettings): string | undefined {
  if (!settings.cookiesEnabled) return undefined;
  const trimmed = settings.cookiesPath?.trim();
  return trimmed ? trimmed : undefined;
}
