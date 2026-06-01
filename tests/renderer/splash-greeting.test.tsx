import { describe, expect, it } from 'vitest';
import { shouldShowSplashGreeting } from '@renderer/components/system/splashGreeting.js';
import { buildAppSettings } from '../shared/settingsFixtures.js';

describe('splash greeting gate', () => {
  it('hides the welcome-back greeting before settings load and on first launch', () => {
    expect(shouldShowSplashGreeting(null)).toBe(false);
    expect(shouldShowSplashGreeting(buildAppSettings({ launchCount: 1 }))).toBe(false);
  });

  it('shows the welcome-back greeting on every returning launch', () => {
    expect(shouldShowSplashGreeting(buildAppSettings({ launchCount: 2 }))).toBe(true);
    expect(shouldShowSplashGreeting(buildAppSettings({ launchCount: 7 }))).toBe(true);
  });
});
