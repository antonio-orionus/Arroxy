// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppStore } from '@renderer/store/useAppStore.js';
import { defaultAppSettings } from '@shared/constants.js';
import { BUILTIN_DOWNLOAD_PROFILES } from '@shared/downloadProfiles.js';
import { ok } from '@shared/result.js';
import type { AppSettings, DownloadProfile } from '@shared/types.js';
import { buildMockAppApi } from '../shared/mockAppApi.js';

function resetStore(): void {
  useAppStore.setState({
    initialized: false,
    initializing: false,
    settings: null,
    queue: [],
    drawerOpen: false
  });
}

function customProfile(): DownloadProfile {
  return {
    ...BUILTIN_DOWNLOAD_PROFILES.find((profile) => profile.id === 'balanced')!,
    id: 'study-captions',
    name: 'Study Captions',
    icon: 'captions',
    createdAt: '2026-06-07T00:00:00.000Z',
    updatedAt: '2026-06-07T00:00:00.000Z'
  };
}

function installSettingsApi(initial: AppSettings): ReturnType<typeof buildMockAppApi> {
  let settings = initial;
  const api = buildMockAppApi({ settings });
  vi.mocked(api.settings.get).mockImplementation(async () => ok(settings));
  vi.mocked(api.settings.update).mockImplementation(async (patch) => {
    settings = {
      ...settings,
      common: { ...settings.common, ...(patch.common ?? {}) },
      single: { ...settings.single, ...(patch.single ?? {}) },
      playlist: { ...settings.playlist, ...(patch.playlist ?? {}) },
      profiles: { ...settings.profiles, ...(patch.profiles ?? {}) }
    };
    return ok(settings);
  });
  window.appApi = api;
  return api;
}

beforeEach(() => {
  resetStore();
  vi.clearAllMocks();
});

describe('download profile store actions', () => {
  it('sets the active profile through the profiles settings bucket', async () => {
    const settings = defaultAppSettings('/tmp');
    const api = installSettingsApi(settings);
    useAppStore.setState({ settings });

    await useAppStore.getState().setActiveDownloadProfile({ kind: 'builtin', id: 'audio-only' });

    expect(api.settings.update).toHaveBeenCalledWith({ profiles: { active: { kind: 'builtin', id: 'audio-only' }, custom: [], overrides: [] } });
    expect(useAppStore.getState().settings?.profiles.active).toEqual({ kind: 'builtin', id: 'audio-only' });
  });

  it('saves a custom profile and makes it active by default', async () => {
    const settings = defaultAppSettings('/tmp');
    installSettingsApi(settings);
    useAppStore.setState({ settings });

    const profile = customProfile();
    await useAppStore.getState().saveDownloadProfile(profile);

    const profiles = useAppStore.getState().settings?.profiles;
    expect(profiles?.active).toEqual({ kind: 'custom', id: profile.id });
    expect(profiles?.custom).toEqual([profile]);
  });

  it('saves a built-in profile edit as an override and keeps the active ref builtin', async () => {
    const settings = defaultAppSettings('/tmp');
    installSettingsApi(settings);
    useAppStore.setState({ settings });

    const override = { ...BUILTIN_DOWNLOAD_PROFILES.find((profile) => profile.id === 'balanced')!, name: 'Balanced for lectures', icon: 'classes' as const };
    await useAppStore.getState().saveDownloadProfile(override);

    const profiles = useAppStore.getState().settings?.profiles;
    expect(profiles?.active).toEqual({ kind: 'builtin', id: 'balanced' });
    expect(profiles?.custom).toEqual([]);
    expect(profiles?.overrides).toEqual([override]);
  });

  it('removes an active custom profile and falls back to the default built-in', async () => {
    const profile = customProfile();
    const settings = {
      ...defaultAppSettings('/tmp'),
      profiles: { active: { kind: 'custom' as const, id: profile.id }, custom: [profile], overrides: [] }
    };
    installSettingsApi(settings);
    useAppStore.setState({ settings });

    await useAppStore.getState().removeDownloadProfile(profile.id);

    expect(useAppStore.getState().settings?.profiles).toEqual({ active: { kind: 'builtin', id: 'balanced' }, custom: [], overrides: [] });
  });
});
