import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@aptabase/electron/main', () => ({
  initialize: vi.fn().mockResolvedValue(undefined),
  trackEvent: vi.fn().mockResolvedValue(undefined)
}));

import { setupAnalytics, setAnalyticsEnabled, trackMain, probeDurationBucket, downloadDurationBucket, sizeBucket } from '@main/services/analytics';
import { initialize as aptabaseInit, trackEvent } from '@aptabase/electron/main';

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.ARROXY_ANALYTICS_DEBUG;
});

describe('allowlist validation', () => {
  it('(a) throws for unknown event names in dev mode', () => {
    setupAnalytics(undefined, true);
    expect(() => trackMain('not_a_real_event')).toThrow('[analytics] unknown event: "not_a_real_event"');
  });

  it('throws for disallowed prop key in dev mode', () => {
    setupAnalytics(undefined, true);
    expect(() => trackMain('app_started', { install_channel: 'direct', url: 'http://evil.com' } as any)).toThrow(/prop "url" not allowed/);
  });

  it('(b) throws for overlong prop string values in dev mode', () => {
    setupAnalytics(undefined, true);
    expect(() => trackMain('app_started', { install_channel: 'x'.repeat(33) })).toThrow(/too long/);
  });

  it('silently drops unknown event names in prod mode (no app key)', () => {
    setupAnalytics(undefined, false);
    expect(() => trackMain('totally_fake_event')).not.toThrow();
  });

  it('silently drops disallowed prop key in prod mode', () => {
    setupAnalytics(undefined, false);
    expect(() => trackMain('app_started', { install_channel: 'direct', secret_url: 'http://evil.com' } as any)).not.toThrow();
  });
});

describe('(c) analyticsEnabled=false short-circuits', () => {
  it('does not call trackEvent when disabled', async () => {
    setupAnalytics('A-EU-test123456', false);
    setAnalyticsEnabled(false);
    trackMain('app_started', {
      install_channel: 'direct',
      platform_arch: 'linux-x64',
      is_first_run: false
    });
    expect(trackEvent).not.toHaveBeenCalled();
  });

  it('does not call trackEvent when no app key (not started)', () => {
    setupAnalytics(undefined, false);
    setAnalyticsEnabled(true);
    trackMain('app_started', {
      install_channel: 'direct',
      platform_arch: 'linux-x64',
      is_first_run: false
    });
    expect(trackEvent).not.toHaveBeenCalled();
  });
});

describe('dev-mode debug opt-in', () => {
  it('does NOT initialize aptabase in dev by default', () => {
    setupAnalytics('A-EU-test123456', true);
    expect(aptabaseInit).not.toHaveBeenCalled();
  });

  it('initializes aptabase in dev when ARROXY_ANALYTICS_DEBUG=1', () => {
    process.env.ARROXY_ANALYTICS_DEBUG = '1';
    setupAnalytics('A-EU-test123456', true);
    expect(aptabaseInit).toHaveBeenCalledWith('A-EU-test123456');
  });

  it('still skips when no app key, even with debug flag', () => {
    process.env.ARROXY_ANALYTICS_DEBUG = '1';
    setupAnalytics(undefined, true);
    expect(aptabaseInit).not.toHaveBeenCalled();
  });
});

describe('bucketing helpers', () => {
  it('probeDurationBucket', () => {
    expect(probeDurationBucket(500)).toBe('<2s');
    expect(probeDurationBucket(2_500)).toBe('2-5s');
    expect(probeDurationBucket(7_000)).toBe('5-15s');
    expect(probeDurationBucket(20_000)).toBe('>15s');
  });

  it('downloadDurationBucket', () => {
    expect(downloadDurationBucket(10_000)).toBe('<30s');
    expect(downloadDurationBucket(60_000)).toBe('30s-2m');
    expect(downloadDurationBucket(300_000)).toBe('2-10m');
    expect(downloadDurationBucket(900_000)).toBe('10-30m');
    expect(downloadDurationBucket(2_000_000)).toBe('>30m');
  });

  it('sizeBucket', () => {
    const MB = 1_048_576;
    expect(sizeBucket(10 * MB)).toBe('<50MB');
    expect(sizeBucket(100 * MB)).toBe('50-500MB');
    expect(sizeBucket(1_000 * MB)).toBe('500MB-2GB');
    expect(sizeBucket(3_000 * MB)).toBe('>2GB');
  });
});
