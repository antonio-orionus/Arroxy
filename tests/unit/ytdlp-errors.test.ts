import { describe, expect, it } from 'vitest';
import { extractLastError, classifyStderr } from '@main/utils/ytdlpErrors';

describe('extractLastError', () => {
  it('returns the ERROR: line from single-line stderr', () => {
    const stderr = 'ERROR: [youtube] abc: Sign in to confirm';
    expect(extractLastError(stderr)).toBe('ERROR: [youtube] abc: Sign in to confirm');
  });

  it('returns null when no ERROR: line present', () => {
    expect(extractLastError('WARNING: some warning\n[download] 50%')).toBeNull();
  });

  it('returns the last of multiple ERROR: lines', () => {
    const stderr = 'ERROR: first error\nsome output\nERROR: second error';
    expect(extractLastError(stderr)).toBe('ERROR: second error');
  });

  it('trims surrounding whitespace from the result', () => {
    const stderr = '  ERROR: trimmed error  ';
    expect(extractLastError(stderr)).toBe('ERROR: trimmed error');
  });

  it('returns null for empty string', () => {
    expect(extractLastError('')).toBeNull();
  });
});

describe('classifyStderr', () => {
  it('detects bot_block from standard YouTube message', () => {
    const stderr = "ERROR: [youtube] dQw4w9WgXcQ: Sign in to confirm you're not a bot. Use --cookies-from-browser...";
    expect(classifyStderr(stderr)).toBe('bot_block');
  });

  it('detects bot_block case-insensitively', () => {
    expect(classifyStderr("SIGN IN TO CONFIRM YOU'RE NOT A BOT")).toBe('bot_block');
  });

  it('detects ip_block', () => {
    const stderr = 'ERROR: [youtube] All player responses are invalid. Your IP is likely being blocked by Youtube';
    expect(classifyStderr(stderr)).toBe('ip_block');
  });

  it('detects rate_limit from HTTP 429', () => {
    expect(classifyStderr('WARNING: Unable to download webpage: HTTP Error 429: Too Many Requests')).toBe('rate_limit');
  });

  it('detects rate_limit from content-unavailable message', () => {
    expect(classifyStderr("This content isn't available, try again later")).toBe('rate_limit');
  });

  it('returns null for unrelated errors', () => {
    expect(classifyStderr('ERROR: [youtube] abc: Video unavailable')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(classifyStderr('')).toBeNull();
  });

  it('prioritises bot_block over ip_block when both appear', () => {
    const stderr = [
      "Sign in to confirm you're not a bot",
      'IP is likely being blocked by Youtube'
    ].join('\n');
    expect(classifyStderr(stderr)).toBe('bot_block');
  });

  it('detects rate_limit from too many requests (case-insensitive)', () => {
    expect(classifyStderr('too many requests')).toBe('rate_limit');
  });
});
