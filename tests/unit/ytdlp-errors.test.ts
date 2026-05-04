import { describe, expect, it } from 'vitest';
import { extractLastError, classifyStderr } from '@main/utils/ytdlpErrors';
import { YTDLP_ERROR_KEYS } from '@shared/schemas';

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
  it('detects botBlock from standard YouTube message (ASCII apostrophe)', () => {
    const stderr = "ERROR: [youtube] dQw4w9WgXcQ: Sign in to confirm you're not a bot. Use --cookies-from-browser...";
    expect(classifyStderr(stderr)).toBe('botBlock');
  });

  it('detects botBlock from real yt-dlp message (typographic U+2019 apostrophe)', () => {
    const stderr = 'ERROR: [youtube] dQw4w9WgXcQ: Sign in to confirm you’re not a bot. Use --cookies-from-browser...';
    expect(classifyStderr(stderr)).toBe('botBlock');
  });

  it('detects botBlock case-insensitively', () => {
    expect(classifyStderr("SIGN IN TO CONFIRM YOU'RE NOT A BOT")).toBe('botBlock');
  });

  it('detects ipBlock', () => {
    const stderr = 'ERROR: [youtube] All player responses are invalid. Your IP is likely being blocked by Youtube';
    expect(classifyStderr(stderr)).toBe('ipBlock');
  });

  it('detects rateLimit from HTTP 429', () => {
    expect(classifyStderr('WARNING: Unable to download webpage: HTTP Error 429: Too Many Requests')).toBe('rateLimit');
  });

  it('detects rateLimit from content-unavailable message', () => {
    expect(classifyStderr("This content isn't available, try again later")).toBe('rateLimit');
  });

  it('returns null for unrelated errors', () => {
    expect(classifyStderr('ERROR: [youtube] abc: Video unavailable')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(classifyStderr('')).toBeNull();
  });

  it('prioritises botBlock over ipBlock when both appear', () => {
    const stderr = ['Sign in to confirm you’re not a bot', 'IP is likely being blocked by Youtube'].join('\n');
    expect(classifyStderr(stderr)).toBe('botBlock');
  });

  it('detects rateLimit from too many requests (case-insensitive)', () => {
    expect(classifyStderr('too many requests')).toBe('rateLimit');
  });

  it('detects ageRestricted from explicit age-restriction text', () => {
    expect(classifyStderr('ERROR: This video is age-restricted')).toBe('ageRestricted');
  });

  it('detects ageRestricted from sign-in age prompt', () => {
    expect(classifyStderr('Sign in to confirm your age')).toBe('ageRestricted');
  });

  it('detects unavailable from "this video is unavailable"', () => {
    expect(classifyStderr('ERROR: This video is unavailable')).toBe('unavailable');
  });

  it('detects unavailable from "private video"', () => {
    expect(classifyStderr('ERROR: Private video — sign in if you have access')).toBe('unavailable');
  });

  it('detects geoBlocked from country availability message', () => {
    expect(classifyStderr('ERROR: This video is not available in your country')).toBe('geoBlocked');
  });

  it('detects geoBlocked from geo-restricted phrase', () => {
    expect(classifyStderr('Video is geo-restricted')).toBe('geoBlocked');
  });

  it('detects outOfDiskSpace from Linux errno message', () => {
    expect(classifyStderr('ERROR: No space left on device')).toBe('outOfDiskSpace');
  });

  it('detects outOfDiskSpace from Windows message', () => {
    expect(classifyStderr('ERROR: There is not enough space on the disk')).toBe('outOfDiskSpace');
  });

  it('detects outOfDiskSpace from disk quota message', () => {
    expect(classifyStderr('disk quota exceeded')).toBe('outOfDiskSpace');
  });
});

describe('YtdlpErrorKey ↔ classifyStderr contract', () => {
  // All enum values must be reachable by classifyStderr — guards against
  // adding a key without wiring its regex pattern.
  it('classifyStderr returns every YtdlpErrorKey for at least one input', () => {
    const fixtures: Record<string, string> = {
      botBlock: "Sign in to confirm you're not a bot",
      ipBlock: 'Your IP is likely being blocked by Youtube',
      rateLimit: 'HTTP Error 429: Too Many Requests',
      ageRestricted: 'This video is age-restricted',
      unavailable: 'This video is unavailable',
      geoBlocked: 'This video is not available in your country',
      outOfDiskSpace: 'No space left on device'
    };
    for (const key of YTDLP_ERROR_KEYS) {
      expect(fixtures[key], `no fixture for ${key}`).toBeDefined();
      expect(classifyStderr(fixtures[key])).toBe(key);
    }
  });
});
