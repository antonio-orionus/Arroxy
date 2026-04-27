import type { YtdlpErrorKey } from '@shared/i18n/types';

export type StderrSignal = YtdlpErrorKey;

export function extractLastError(stderr: string): string | null {
  const matches = stderr.match(/ERROR:.*$/gm);
  return matches ? matches[matches.length - 1].trim() : null;
}

export function classifyStderr(stderr: string): StderrSignal | null {
  if (/sign in to confirm you're not a bot/i.test(stderr)) return 'botBlock';
  if (/IP is likely being blocked/i.test(stderr)) return 'ipBlock';
  if (/HTTP Error 429|too many requests|this content isn't available.*try again later/i.test(stderr)) return 'rateLimit';
  if (/this video is age.?restricted|sign in to confirm your age/i.test(stderr)) return 'ageRestricted';
  if (/private video|this video is unavailable|video has been removed/i.test(stderr)) return 'unavailable';
  if (/not available in your country|geo.?restricted/i.test(stderr)) return 'geoBlocked';
  return null;
}

export function friendlyErrorKey(stderr: string): YtdlpErrorKey | null {
  return classifyStderr(stderr);
}
