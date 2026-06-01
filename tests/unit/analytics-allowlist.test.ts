import { describe, it, expect, vi, beforeEach } from 'vitest';

const { ctorMock, trackMock, identifyMock, setGlobalPropertiesMock, addHeaderMock } = vi.hoisted(() => {
  const trackMock = vi.fn().mockResolvedValue(undefined);
  const identifyMock = vi.fn().mockResolvedValue(undefined);
  const setGlobalPropertiesMock = vi.fn();
  const addHeaderMock = vi.fn();
  const ctorMock = vi.fn().mockImplementation(function () {
    return { track: trackMock, identify: identifyMock, setGlobalProperties: setGlobalPropertiesMock, api: { addHeader: addHeaderMock } };
  });
  return { ctorMock, trackMock, identifyMock, setGlobalPropertiesMock, addHeaderMock };
});

vi.mock('@openpanel/sdk', () => ({ OpenPanel: ctorMock }));

import { setupAnalytics, setAnalyticsEnabled, trackMain, probeDurationBucket, downloadDurationBucket, sizeBucket } from '@main/services/analytics.js';

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.ARROXY_ANALYTICS_DEBUG;
});

describe('allowlist validation', () => {
  it('throws for unknown event names in dev mode', () => {
    setupAnalytics(undefined, undefined, true, 'install-id-test');
    expect(() => trackMain('not_a_real_event')).toThrow('[analytics] unknown event: "not_a_real_event"');
  });

  it('throws for disallowed prop key in dev mode', () => {
    setupAnalytics(undefined, undefined, true, 'install-id-test');
    expect(() => trackMain('app_started', { install_channel: 'direct', url: 'http://evil.com' } as any)).toThrow(/prop "url" not allowed/);
  });

  it('throws for overlong prop string values in dev mode', () => {
    setupAnalytics(undefined, undefined, true, 'install-id-test');
    expect(() => trackMain('app_started', { install_channel: 'x'.repeat(33) })).toThrow(/too long/);
  });

  it('silently drops unknown event names in prod mode (no app key)', () => {
    setupAnalytics(undefined, undefined, false, 'install-id-test');
    expect(() => trackMain('totally_fake_event')).not.toThrow();
  });

  it('silently drops disallowed prop key in prod mode', () => {
    setupAnalytics(undefined, undefined, false, 'install-id-test');
    expect(() => trackMain('app_started', { install_channel: 'direct', secret_url: 'http://evil.com' } as any)).not.toThrow();
  });

  it('accepts stable failure code on binary_setup_failed', () => {
    setupAnalytics(undefined, undefined, true, 'install-id-test');
    expect(() => trackMain('binary_setup_failed', { binary: 'ffmpeg', phase: 'download_failed', code: 'ARX-001', operation: 'managed-download', setup_step: 'download', source_kind: 'managed', source_channel: 'nightly', elapsed_ms: 123 })).not.toThrow();
  });
});

describe('OpenPanel track delegation', () => {
  it('emits a single op.track call per event (no companion error events)', () => {
    setupAnalytics('client-id', 'client-secret', false, 'install-id-test');
    setAnalyticsEnabled(true);
    trackMain('binary_setup_failed', { binary: 'ytdlp', phase: 'download_failed', code: 'ARX-001' });
    expect(trackMock).toHaveBeenCalledTimes(1);
    expect(trackMock).toHaveBeenCalledWith('binary_setup_failed', { binary: 'ytdlp', phase: 'download_failed', code: 'ARX-001' });
  });

  it('emits download_finished for successful downloads', () => {
    setupAnalytics('client-id', 'client-secret', false, 'install-id-test');
    setAnalyticsEnabled(true);
    trackMain('download_finished', { duration_bucket: '<30s', size_bucket: '<50MB' });
    expect(trackMock).toHaveBeenCalledTimes(1);
    expect(trackMock).toHaveBeenCalledWith('download_finished', { duration_bucket: '<30s', size_bucket: '<50MB' });
  });

  it('emits download_cancelled for user-cancelled downloads', () => {
    setupAnalytics('client-id', 'client-secret', false, 'install-id-test');
    setAnalyticsEnabled(true);
    trackMain('download_cancelled', { duration_bucket: '30s-2m' });
    expect(trackMock).toHaveBeenCalledTimes(1);
    expect(trackMock).toHaveBeenCalledWith('download_cancelled', { duration_bucket: '30s-2m' });
  });

  it('emits download_failed for failed downloads with error_category', () => {
    setupAnalytics('client-id', 'client-secret', false, 'install-id-test');
    setAnalyticsEnabled(true);
    trackMain('download_failed', { duration_bucket: '<30s', size_bucket: '50-500MB', error_category: 'disk_full' });
    expect(trackMock).toHaveBeenCalledTimes(1);
    expect(trackMock).toHaveBeenCalledWith('download_failed', { duration_bucket: '<30s', size_bucket: '50-500MB', error_category: 'disk_full' });
  });

  it('emits probe_failed for probe errors with error_category', () => {
    setupAnalytics('client-id', 'client-secret', false, 'install-id-test');
    setAnalyticsEnabled(true);
    trackMain('probe_failed', { duration_bucket: '<2s', error_category: 'bot_detected', cookies_mode: 'off' });
    expect(trackMock).toHaveBeenCalledTimes(1);
    expect(trackMock).toHaveBeenCalledWith('probe_failed', { duration_bucket: '<2s', error_category: 'bot_detected', cookies_mode: 'off' });
  });

  it('rejects error_category on format_probed in dev mode', () => {
    setupAnalytics(undefined, undefined, true, 'install-id-test');
    expect(() => trackMain('format_probed', { error_category: 'bot_detected' } as any)).toThrow(/prop "error_category" not allowed/);
  });

  it('rejects outcome on download_finished in dev mode', () => {
    setupAnalytics(undefined, undefined, true, 'install-id-test');
    expect(() => trackMain('download_finished', { outcome: 'success' } as any)).toThrow(/prop "outcome" not allowed/);
  });

  it('emits app_started normally', () => {
    setupAnalytics('client-id', 'client-secret', false, 'install-id-test');
    setAnalyticsEnabled(true);
    trackMain('app_started', { install_channel: 'direct', platform_arch: 'linux-x64', is_first_run: false });
    expect(trackMock).toHaveBeenCalledTimes(1);
  });
});

describe('identify + global properties', () => {
  it('calls identify with profileId=installId and global properties when deviceInfo is provided', () => {
    setupAnalytics('client-id', 'client-secret', false, 'install-id-test', {
      appVersion: '1.2.3',
      platform: 'linux',
      architecture: 'x64',
      systemVersion: '6.8.0-111-generic',
      modelName: 'Intel(R) Core(TM) i7-12700H',
      osLocale: 'en-US',
      appLocale: 'es'
    });
    expect(identifyMock).toHaveBeenCalledTimes(1);
    expect(identifyMock).toHaveBeenCalledWith({
      profileId: 'install-id-test',
      properties: expect.objectContaining({
        app_version: '1.2.3',
        build_number: '1.2.3',
        platform: 'linux',
        operating_system: 'Linux',
        system_version: '6.8.0-111-generic',
        major_system_version: '6',
        major_minor_system_version: '6.8',
        architecture: 'x64',
        model_name: 'Intel(R) Core(TM) i7-12700H',
        os_locale: 'en-US',
        app_locale: 'es',
        sdk_client_version: 'arroxy/1.2.3'
      })
    });
    expect(setGlobalPropertiesMock).toHaveBeenCalledTimes(1);
  });

  it('truncates model_name to 64 chars', () => {
    setupAnalytics('client-id', 'client-secret', false, 'install-id-test', {
      appVersion: '1.0.0',
      platform: 'darwin',
      architecture: 'arm64',
      systemVersion: '23.5.0',
      modelName: 'X'.repeat(120),
      osLocale: 'en-US',
      appLocale: 'en-US'
    });
    const props = setGlobalPropertiesMock.mock.calls[0][0];
    expect(props.model_name.length).toBe(64);
  });

  it('uses deviceInfo Darwin version in the browser-like User-Agent', () => {
    setupAnalytics('client-id', 'client-secret', false, 'install-id-test', {
      appVersion: '1.0.0',
      platform: 'darwin',
      architecture: 'x64',
      systemVersion: '24.1.0',
      modelName: 'Intel Mac',
      osLocale: 'en-US',
      appLocale: 'en-US'
    });

    expect(addHeaderMock).toHaveBeenCalledWith('user-agent', expect.stringContaining('Mac OS X 15_1_0'));
  });

  it('still calls identify (no properties) when deviceInfo is omitted', () => {
    setupAnalytics('client-id', 'client-secret', false, 'install-id-test');
    expect(identifyMock).toHaveBeenCalledWith({ profileId: 'install-id-test' });
    expect(setGlobalPropertiesMock).not.toHaveBeenCalled();
  });
});

describe('analyticsEnabled=false short-circuits', () => {
  it('does not call track when disabled', () => {
    setupAnalytics('client-id', 'client-secret', false, 'install-id-test');
    setAnalyticsEnabled(false);
    trackMain('app_started', {
      install_channel: 'direct',
      platform_arch: 'linux-x64',
      is_first_run: false
    });
    expect(trackMock).not.toHaveBeenCalled();
  });

  it('does not call track when no credentials (not started)', () => {
    setupAnalytics(undefined, undefined, false, 'install-id-test');
    setAnalyticsEnabled(true);
    trackMain('app_started', {
      install_channel: 'direct',
      platform_arch: 'linux-x64',
      is_first_run: false
    });
    expect(trackMock).not.toHaveBeenCalled();
  });

  it('does not call track when only clientId is provided (missing secret)', () => {
    setupAnalytics('client-id', undefined, false, 'install-id-test');
    setAnalyticsEnabled(true);
    trackMain('app_started', { install_channel: 'direct', platform_arch: 'linux-x64', is_first_run: false });
    expect(ctorMock).not.toHaveBeenCalled();
    expect(trackMock).not.toHaveBeenCalled();
  });
});

describe('dev-mode debug opt-in', () => {
  it('does NOT initialize OpenPanel in dev by default', () => {
    setupAnalytics('client-id', 'client-secret', true, 'install-id-test');
    expect(ctorMock).not.toHaveBeenCalled();
  });

  it('initializes OpenPanel in dev when ARROXY_ANALYTICS_DEBUG=1', () => {
    process.env.ARROXY_ANALYTICS_DEBUG = '1';
    setupAnalytics('client-id', 'client-secret', true, 'install-id-test');
    expect(ctorMock).toHaveBeenCalledTimes(1);
    const opts = ctorMock.mock.calls[0][0];
    expect(opts).toMatchObject({ clientId: 'client-id', clientSecret: 'client-secret' });
    expect(typeof opts.filter).toBe('function');
  });

  it('still skips when no credentials, even with debug flag', () => {
    process.env.ARROXY_ANALYTICS_DEBUG = '1';
    setupAnalytics(undefined, undefined, true, 'install-id-test');
    expect(ctorMock).not.toHaveBeenCalled();
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
