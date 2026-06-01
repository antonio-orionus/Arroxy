import type { AppSettings } from '@shared/types.js';

export function shouldShowSplashGreeting(settings: AppSettings | null): boolean {
  return (settings?.common?.launchCount ?? 0) > 1;
}
