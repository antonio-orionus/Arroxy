// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppStore } from '@renderer/store/useAppStore.js';
import { buildMockAppApi } from '../shared/mockAppApi.js';
import { ok } from '../shared/fixtures.js';
import { buildAppSettings } from '../shared/settingsFixtures.js';
import type { ProbeResult } from '@shared/types.js';

// Probe payloads used to drive the audio-only-source detection through the
// real wizard pipeline. Two extractor families:
//   - bandcamp: known audio-only host → preset must default to audio-only
//   - youtube:  generic video host → preset must respect persisted state

function buildVideoProbe(extractor: string, isAudioOnlySource: boolean): ProbeResult {
  return {
    kind: 'video',
    extractor,
    extractorKey: extractor,
    webpageUrl: 'https://example.com/x',
    isAudioOnlySource,
    formats: [
      { formatId: 'mp3-128', label: 'mp3 128', ext: 'mp3', resolution: 'audio only', abr: 128, isVideoOnly: false, isAudioOnly: true },
      { formatId: 'mp4-720', label: '720p mp4', ext: 'mp4', resolution: '720p', isVideoOnly: true, isAudioOnly: false }
    ],
    title: 'Track',
    thumbnail: '',
    duration: 200,
    subtitles: {},
    automaticCaptions: {},
    isLive: false,
    hasDrm: false
  };
}

function buildPlaylistProbe(extractor: string, isAudioOnlySource: boolean): ProbeResult {
  return {
    kind: 'playlist',
    extractor,
    extractorKey: extractor,
    webpageUrl: 'https://example.com/p',
    isAudioOnlySource,
    isMultiVideo: false,
    playlistId: 'p1',
    playlistTitle: 'Playlist',
    entries: [{ id: 'e1', url: 'https://example.com/e1', title: 'Entry 1', thumbnail: '', playlistIndex: 1, videoId: 'e1' }]
  };
}

function resetStore(): void {
  useAppStore.setState({
    initialized: false,
    initializing: false,
    settings: null,
    wizardStep: 'url',
    wizardMode: 'single',
    formatsLoading: false,
    playlistProbeLoading: false,
    wizardUrl: '',
    wizardTitle: '',
    wizardThumbnail: '',
    wizardDuration: undefined,
    wizardFormats: [],
    wizardFormatsDegraded: null,
    wizardExtractor: '',
    wizardExtractorKey: '',
    wizardWebpageUrl: '',
    selectedVideoFormatId: '',
    audioSelection: { kind: 'none' },
    activePreset: null,
    wizardOutputDir: '',
    wizardError: null,
    wizardErrorOrigin: null,
    wizardSubtitles: {},
    wizardAutomaticCaptions: {},
    wizardSubtitleLanguages: [],
    wizardSubtitleSkipped: false,
    wizardSubtitleMode: 'sidecar',
    wizardSubtitleFormat: 'srt',
    wizardSponsorBlockMode: 'off',
    wizardSponsorBlockCategories: ['sponsor', 'selfpromo'],
    playlistItems: [],
    selectedPlaylistItemIds: [],
    playlistTitle: '',
    playlistId: '',
    playlistIsMultiVideo: false,
    cookiesConfigDialogIssue: null,
    selectedPlaylistPreset: null,
    queue: [],
    drawerOpen: false
  });
}

beforeEach(() => {
  resetStore();
  vi.clearAllMocks();
});

describe('audio-only source UI propagation — single video', () => {
  it('forces preset=audio-only when extractor isAudioOnlySource:true (bandcamp)', async () => {
    const api = buildMockAppApi({ settings: buildAppSettings({ lastPreset: 'best-quality' }) });
    api.downloads.probe = vi.fn().mockResolvedValue(ok(buildVideoProbe('bandcamp', true)));
    window.appApi = api;

    await useAppStore.getState().initialize();
    useAppStore.getState().setWizardUrl('https://artist.bandcamp.com/track/x');
    await useAppStore.getState().submitUrl();

    const state = useAppStore.getState();
    expect(state.activePreset).toBe('audio-only');
    expect(state.selectedVideoFormatId).toBe('');
    expect(state.audioSelection.kind).toBe('native');
  });

  it('respects persisted preset when isAudioOnlySource:false (youtube)', async () => {
    const api = buildMockAppApi({ settings: buildAppSettings({ lastPreset: 'best-quality' }) });
    api.downloads.probe = vi.fn().mockResolvedValue(ok(buildVideoProbe('youtube', false)));
    window.appApi = api;

    await useAppStore.getState().initialize();
    useAppStore.getState().setWizardUrl('https://www.youtube.com/watch?v=x');
    await useAppStore.getState().submitUrl();

    const state = useAppStore.getState();
    expect(state.activePreset).toBe('best-quality');
    expect(state.selectedVideoFormatId).toBe('mp4-720');
  });
});

describe('audio-only source UI propagation — playlist', () => {
  it('forces playlist preset=audio-best when isAudioOnlySource:true (qqmusic)', async () => {
    const api = buildMockAppApi({ settings: buildAppSettings({ lastPlaylistPreset: 'video-1080p' }) });
    api.downloads.probe = vi.fn().mockResolvedValue(ok(buildPlaylistProbe('qqmusic:playlist', true)));
    window.appApi = api;

    await useAppStore.getState().initialize();
    useAppStore.getState().setWizardUrl('https://y.qq.com/n/ryqq/playlist/x');
    await useAppStore.getState().submitUrl();

    const state = useAppStore.getState();
    expect(state.selectedPlaylistPreset).toBe('audio-best');
  });

  it('respects persisted playlist preset when isAudioOnlySource:false (youtube playlist)', async () => {
    const api = buildMockAppApi({ settings: buildAppSettings({ lastPlaylistPreset: 'video-1080p' }) });
    api.downloads.probe = vi.fn().mockResolvedValue(ok(buildPlaylistProbe('youtube:tab', false)));
    window.appApi = api;

    await useAppStore.getState().initialize();
    useAppStore.getState().setWizardUrl('https://www.youtube.com/playlist?list=x');
    await useAppStore.getState().submitUrl();

    const state = useAppStore.getState();
    expect(state.selectedPlaylistPreset).toBe('video-1080p');
  });
});
