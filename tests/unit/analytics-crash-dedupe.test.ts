import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@aptabase/electron/main', () => ({
  initialize: vi.fn().mockResolvedValue(undefined),
  trackEvent: vi.fn().mockResolvedValue(undefined)
}));

import { setAnalyticsEnabled, setupAnalytics, trackCrashDetectedOncePerSession } from '@main/services/analytics';
import { trackEvent } from '@aptabase/electron/main';

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.ARROXY_ANALYTICS_DEBUG;
});

describe('trackCrashDetectedOncePerSession', () => {
  it('emits a repeated identical child-process crash only once per session', () => {
    setupAnalytics('A-EU-test123456', false);
    setAnalyticsEnabled(true);

    trackCrashDetectedOncePerSession({
      kind: 'child',
      type: 'Utility',
      reason: 'crashed',
      name: 'Network Service'
    });
    trackCrashDetectedOncePerSession({
      kind: 'child',
      type: 'Utility',
      reason: 'crashed',
      name: 'Network Service'
    });

    expect(trackEvent).toHaveBeenCalledTimes(1);
    expect(trackEvent).toHaveBeenCalledWith('crash_detected', {
      type: 'Utility',
      reason: 'crashed'
    });
  });

  it('dedupes child-process crashes by type and reason even when names differ', () => {
    setupAnalytics('A-EU-test123456', false);
    setAnalyticsEnabled(true);

    trackCrashDetectedOncePerSession({
      kind: 'child',
      type: 'Utility',
      reason: 'crashed',
      name: 'Network Service'
    });
    trackCrashDetectedOncePerSession({
      kind: 'child',
      type: 'Utility',
      reason: 'crashed',
      name: 'Audio Service'
    });

    expect(trackEvent).toHaveBeenCalledTimes(1);
  });

  it('dedupes renderer crashes by reason even when window roles differ', () => {
    setupAnalytics('A-EU-test123456', false);
    setAnalyticsEnabled(true);

    trackCrashDetectedOncePerSession({
      kind: 'renderer',
      windowRole: 'main-window',
      reason: 'crashed'
    });
    trackCrashDetectedOncePerSession({
      kind: 'renderer',
      windowRole: 'main-window',
      reason: 'crashed'
    });
    trackCrashDetectedOncePerSession({
      kind: 'renderer',
      windowRole: 'auxiliary-window',
      reason: 'crashed'
    });

    expect(trackEvent).toHaveBeenCalledTimes(1);
    expect(trackEvent).toHaveBeenNthCalledWith(1, 'crash_detected', {
      type: 'renderer',
      reason: 'crashed'
    });
  });

  it('does not poison the dedupe set while analytics is disabled or not started', () => {
    setupAnalytics('A-EU-test123456', false);
    setAnalyticsEnabled(false);

    const childCrash = {
      kind: 'child',
      type: 'Utility',
      reason: 'crashed',
      name: 'Network Service'
    } as const;

    trackCrashDetectedOncePerSession(childCrash);
    expect(trackEvent).not.toHaveBeenCalled();

    setAnalyticsEnabled(true);
    trackCrashDetectedOncePerSession(childCrash);
    expect(trackEvent).toHaveBeenCalledTimes(1);

    vi.clearAllMocks();

    setupAnalytics(undefined, false);
    setAnalyticsEnabled(true);
    trackCrashDetectedOncePerSession(childCrash);
    expect(trackEvent).not.toHaveBeenCalled();

    setupAnalytics('A-EU-test123456', false);
    setAnalyticsEnabled(true);
    trackCrashDetectedOncePerSession(childCrash);
    expect(trackEvent).toHaveBeenCalledTimes(1);
  });

  it('clears the session dedupe state on fresh setupAnalytics()', () => {
    setupAnalytics('A-EU-test123456', false);
    setAnalyticsEnabled(true);

    const childCrash = {
      kind: 'child',
      type: 'Utility',
      reason: 'crashed',
      name: 'Network Service'
    } as const;

    trackCrashDetectedOncePerSession(childCrash);
    expect(trackEvent).toHaveBeenCalledTimes(1);

    setupAnalytics('A-EU-test123456', false);
    setAnalyticsEnabled(true);
    trackCrashDetectedOncePerSession(childCrash);

    expect(trackEvent).toHaveBeenCalledTimes(2);
  });
});
