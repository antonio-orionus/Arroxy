import type { YtdlpErrorKey } from '@shared/i18n/types';

export type StderrSignal = YtdlpErrorKey;
export type { YtdlpErrorKey };

// Adding a YtdlpErrorKey makes this Record fail to compile until the new key
// has a regex pattern — the link to the enum is enforced by the type system.
const ERROR_PATTERNS: Record<YtdlpErrorKey, RegExp> = {
  // yt-dlp's actual stderr uses U+2019 (right single quotation mark), not ASCII '.
  // Tolerate both so the regex matches real-world output.
  botBlock: /sign in to confirm you[’']re not a bot/i,
  ipBlock: /IP is likely being blocked/i,
  rateLimit: /HTTP Error 429|too many requests|this content isn't available.*try again later/i,
  ageRestricted: /this video is age.?restricted|sign in to confirm your age/i,
  unavailable: /private video|this video is unavailable|video has been removed/i,
  geoBlocked: /not available in your country|geo.?restricted/i,
  outOfDiskSpace: /no space left on device|there is not enough space on the disk|disk quota exceeded|not enough storage/i
};

// Iteration order is the declaration order of the keys above; in practice
// patterns don't overlap, but if they ever do, this order defines precedence.
const PATTERN_ENTRIES = Object.entries(ERROR_PATTERNS) as [YtdlpErrorKey, RegExp][];

export function extractLastError(stderr: string): string | null {
  const matches = stderr.match(/ERROR:.*$/gm);
  return matches ? matches[matches.length - 1].trim() : null;
}

export function classifyStderr(stderr: string): StderrSignal | null {
  for (const [key, pattern] of PATTERN_ENTRIES) {
    if (pattern.test(stderr)) return key;
  }
  return null;
}
