export type StderrSignal = 'bot_block' | 'ip_block' | 'rate_limit';

export function extractLastError(stderr: string): string | null {
  const matches = stderr.match(/ERROR:.*$/gm);
  return matches ? matches[matches.length - 1].trim() : null;
}

export function classifyStderr(stderr: string): StderrSignal | null {
  if (/sign in to confirm you're not a bot/i.test(stderr)) return 'bot_block';
  if (/IP is likely being blocked/i.test(stderr)) return 'ip_block';
  if (/HTTP Error 429|too many requests|this content isn't available.*try again later/i.test(stderr)) return 'rate_limit';
  return null;
}
