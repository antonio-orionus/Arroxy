export type StderrSignal = 'bot_block' | 'ip_block' | 'rate_limit' | 'age_restricted' | 'unavailable' | 'geo_blocked';

export function extractLastError(stderr: string): string | null {
  const matches = stderr.match(/ERROR:.*$/gm);
  return matches ? matches[matches.length - 1].trim() : null;
}

export function classifyStderr(stderr: string): StderrSignal | null {
  if (/sign in to confirm you're not a bot/i.test(stderr)) return 'bot_block';
  if (/IP is likely being blocked/i.test(stderr)) return 'ip_block';
  if (/HTTP Error 429|too many requests|this content isn't available.*try again later/i.test(stderr)) return 'rate_limit';
  if (/this video is age.?restricted|sign in to confirm your age/i.test(stderr)) return 'age_restricted';
  if (/private video|this video is unavailable|video has been removed/i.test(stderr)) return 'unavailable';
  if (/not available in your country|geo.?restricted/i.test(stderr)) return 'geo_blocked';
  return null;
}

export function friendlyMessage(signal: StderrSignal): string {
  switch (signal) {
    case 'bot_block':
      return 'YouTube flagged this request as a bot. Try again in a moment.';
    case 'ip_block':
      return 'Your IP address appears to be blocked by YouTube. Try again later or use a VPN.';
    case 'rate_limit':
      return 'YouTube is rate-limiting requests. Wait a minute then retry.';
    case 'age_restricted':
      return 'This video is age-restricted and cannot be downloaded without a signed-in account.';
    case 'unavailable':
      return 'This video is unavailable — it may be private, deleted, or region-locked.';
    case 'geo_blocked':
      return 'This video is not available in your region.';
  }
}
