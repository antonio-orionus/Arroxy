// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppStore } from '@renderer/store/useAppStore.js';
import type { ProbeError, ProbeResult } from '@shared/types.js';
import { ok, fail, type Result } from '@shared/result.js';
import { RESET_WIZARD_STATE } from '@renderer/store/wizard/commands.js';
import { buildMockAppApi } from '../shared/mockAppApi.js';

const YOUTUBE_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

const VIDEO_PROBE: Extract<ProbeResult, { kind: 'video' }> = {
  kind: 'video',
  extractor: 'youtube',
  extractorKey: 'Youtube',
  webpageUrl: YOUTUBE_URL,
  isAudioOnlySource: false,
  formats: [
    { formatId: '137', label: '1080p', ext: 'mp4', resolution: '1080p', fps: 30, isVideoOnly: true, isAudioOnly: false },
    { formatId: '251', label: 'opus', ext: 'webm', resolution: 'audio only', isVideoOnly: false, isAudioOnly: true, abr: 160 }
  ],
  title: 'Test Video',
  thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg',
  duration: 212,
  subtitles: { en: [{ ext: 'vtt' }] },
  automaticCaptions: {},
  isLive: false,
  hasDrm: false
};

const PLAYLIST_PROBE: Extract<ProbeResult, { kind: 'playlist' }> = {
  kind: 'playlist',
  extractor: 'youtube:playlist',
  extractorKey: 'YoutubePlaylist',
  webpageUrl: 'https://www.youtube.com/playlist?list=PLtest',
  isAudioOnlySource: false,
  playlistTitle: 'My Playlist',
  playlistId: 'PLtest',
  isMultiVideo: false,
  entries: [
    { id: 'e1', title: 'Entry 1', url: 'https://youtu.be/e1', thumbnail: '', duration: 60, playlistIndex: 1, videoId: 'e1' },
    { id: 'e2', title: 'Entry 2', url: 'https://youtu.be/e2', thumbnail: '', duration: 120, playlistIndex: 2, videoId: 'e2' }
  ]
};

function resetStore() {
  useAppStore.setState({
    ...RESET_WIZARD_STATE,
    initialized: false,
    initializing: false,
    settings: null,
    wizardOutputDir: '',
    queue: [],
    drawerOpen: false
  });
}

beforeEach(() => {
  resetStore();
  vi.clearAllMocks();
});

describe('submitUrl — video probe', () => {
  it('sets wizardStep=formats and populates formats on successful video probe', async () => {
    const api = buildMockAppApi();
    vi.mocked(api.downloads.probe).mockResolvedValue(ok(VIDEO_PROBE));
    window.appApi = api;

    useAppStore.setState({ wizardUrl: YOUTUBE_URL });
    await useAppStore.getState().submitUrl();

    const state = useAppStore.getState();
    expect(state.wizardStep).toBe('formats');
    expect(state.wizardFormats).toHaveLength(2);
    expect(state.wizardTitle).toBe('Test Video');
    expect(state.wizardExtractor).toBe('youtube');
    expect(state.formatsLoading).toBe(false);
  });

  it('populates subtitle pool from probe result', async () => {
    const api = buildMockAppApi();
    vi.mocked(api.downloads.probe).mockResolvedValue(ok(VIDEO_PROBE));
    window.appApi = api;

    useAppStore.setState({ wizardUrl: YOUTUBE_URL });
    await useAppStore.getState().submitUrl();

    const state = useAppStore.getState();
    expect(state.wizardSubtitles).toEqual({ en: [{ ext: 'vtt' }] });
  });

  it('sets wizardStep=error on probe failure', async () => {
    const api = buildMockAppApi();
    vi.mocked(api.downloads.probe).mockResolvedValue(fail({ kind: 'other', message: 'Bot block' }));
    window.appApi = api;

    useAppStore.setState({ wizardUrl: YOUTUBE_URL });
    await useAppStore.getState().submitUrl();

    const state = useAppStore.getState();
    expect(state.wizardStep).toBe('error');
    expect(state.wizardError).not.toBeNull();
    expect(state.formatsLoading).toBe(false);
  });

  it('sets formatsLoading=true during probe and false after', async () => {
    const api = buildMockAppApi();
    let resolveProbe!: (v: Result<ProbeResult, ProbeError>) => void;
    vi.mocked(api.downloads.probe).mockReturnValue(
      new Promise<Result<ProbeResult, ProbeError>>((res) => {
        resolveProbe = res;
      })
    );
    window.appApi = api;

    useAppStore.setState({ wizardUrl: YOUTUBE_URL });
    const probePromise = useAppStore.getState().submitUrl();

    expect(useAppStore.getState().formatsLoading).toBe(true);

    resolveProbe(ok(VIDEO_PROBE));
    await probePromise;

    expect(useAppStore.getState().formatsLoading).toBe(false);
  });
});

describe('submitUrl — playlist probe', () => {
  it('sets wizardStep=playlistItems and populates entries', async () => {
    const api = buildMockAppApi();
    vi.mocked(api.downloads.probe).mockResolvedValue(ok(PLAYLIST_PROBE));
    window.appApi = api;

    useAppStore.setState({ wizardUrl: 'https://www.youtube.com/playlist?list=PLtest' });
    await useAppStore.getState().submitUrl();

    const state = useAppStore.getState();
    expect(state.wizardStep).toBe('playlistItems');
    expect(state.wizardMode).toBe('playlist');
    expect(state.playlistItems).toHaveLength(2);
    expect(state.playlistTitle).toBe('My Playlist');
    expect(state.formatsLoading).toBe(false);
  });

  it('auto-selects all playlist entries', async () => {
    const api = buildMockAppApi();
    vi.mocked(api.downloads.probe).mockResolvedValue(ok(PLAYLIST_PROBE));
    window.appApi = api;

    useAppStore.setState({ wizardUrl: 'https://www.youtube.com/playlist?list=PLtest' });
    await useAppStore.getState().submitUrl();

    const { selectedPlaylistItemIds, playlistItems } = useAppStore.getState();
    expect(selectedPlaylistItemIds).toEqual(playlistItems.map((e) => e.id));
  });
});

describe('reset', () => {
  it('clears all wizard state back to url step', async () => {
    const api = buildMockAppApi();
    vi.mocked(api.downloads.probe).mockResolvedValue(ok(VIDEO_PROBE));
    window.appApi = api;

    useAppStore.setState({ wizardUrl: YOUTUBE_URL });
    await useAppStore.getState().submitUrl();

    expect(useAppStore.getState().wizardStep).toBe('formats');

    useAppStore.getState().reset();

    const state = useAppStore.getState();
    expect(state.wizardStep).toBe('url');
    expect(state.wizardUrl).toBe('');
    expect(state.wizardFormats).toEqual([]);
    expect(state.wizardTitle).toBe('');
    expect(state.wizardError).toBeNull();
    expect(state.formatsLoading).toBe(false);
  });
});

describe('skipSubtitles', () => {
  it('marks subtitles skipped and advances past subtitles step', async () => {
    const api = buildMockAppApi();
    vi.mocked(api.downloads.probe).mockResolvedValue(ok(VIDEO_PROBE));
    window.appApi = api;

    useAppStore.setState({ wizardUrl: YOUTUBE_URL });
    await useAppStore.getState().submitUrl();

    // Navigate to subtitles step manually
    useAppStore.setState({ wizardStep: 'subtitles', wizardSubtitleSkipped: false });

    useAppStore.getState().skipSubtitles();

    const state = useAppStore.getState();
    expect(state.wizardSubtitleSkipped).toBe(true);
    expect(state.wizardStep).not.toBe('subtitles');
  });
});
