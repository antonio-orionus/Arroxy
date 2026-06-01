// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppStore } from '@renderer/store/useAppStore.js';
import type { ProbeError, ProbeResult } from '@shared/types.js';
import { ok, fail, type Result } from '@shared/result.js';
import { defaultAppSettings } from '@shared/constants.js';
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

function playlistProbeWithEntries(count: number): Extract<ProbeResult, { kind: 'playlist' }> {
  return {
    ...PLAYLIST_PROBE,
    entries: Array.from({ length: count }, (_, index) => {
      const n = index + 1;
      return { id: `e${n}`, title: `Entry ${n}`, url: `https://youtu.be/e${n}`, thumbnail: '', duration: 60, playlistIndex: n, videoId: `e${n}` };
    })
  };
}

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

describe('quickDownload', () => {
  it('probes in forced single-video mode and queues a prepared item from saved prefs', async () => {
    const api = buildMockAppApi();
    vi.mocked(api.downloads.probe).mockResolvedValue(ok(VIDEO_PROBE));
    window.appApi = api;

    useAppStore.setState({
      wizardUrl: `${YOUTUBE_URL}&list=PLtest`,
      wizardOutputDir: '/tmp/downloads',
      settings: {
        common: { defaultOutputDir: '/tmp/downloads', rememberLastOutputDir: false, clipboardWatchEnabled: false, includeIdInSingleFilenames: true },
        single: { lastPreset: 'balanced' },
        playlist: {}
      }
    });

    await useAppStore.getState().quickDownload();

    expect(api.downloads.probe).toHaveBeenCalledWith({
      url: `${YOUTUBE_URL}&list=PLtest`,
      playlistMode: 'video'
    });
    const queued = vi.mocked(api.queue.cmd.add).mock.calls[0]?.[0]?.[0];
    expect(queued).toMatchObject({
      url: `${YOUTUBE_URL}&list=PLtest`,
      title: 'Test Video',
      outputDir: '/tmp/downloads',
      status: 'pending',
      lane: 'normal',
      job: expect.objectContaining({
        kind: 'single-format',
        extractor: 'youtube',
        extractorKey: 'Youtube',
        outputTemplate: '%(title).200B [%(id)s].%(ext)s'
      })
    });
    expect(useAppStore.getState().wizardUrl).toBe('');
    expect(useAppStore.getState().wizardStep).toBe('url');
    expect(useAppStore.getState().quickDownloadStatus).toBe('queued');
  });

  it('works on first launch with default settings and no saved single prefs', async () => {
    const api = buildMockAppApi();
    vi.mocked(api.downloads.probe).mockResolvedValue(ok(VIDEO_PROBE));
    window.appApi = api;

    useAppStore.setState({
      wizardUrl: YOUTUBE_URL,
      wizardOutputDir: '/tmp/first-launch-downloads',
      settings: defaultAppSettings('/tmp/first-launch-downloads')
    });

    await useAppStore.getState().quickDownload();

    const queued = vi.mocked(api.queue.cmd.add).mock.calls[0]?.[0]?.[0];
    expect(queued).toMatchObject({
      outputDir: '/tmp/first-launch-downloads',
      formatLabel: 'Best quality',
      job: expect.objectContaining({
        kind: 'single-format',
        preset: 'best-quality'
      })
    });
    expect(useAppStore.getState().quickDownloadStatus).toBe('queued');
    expect(useAppStore.getState().wizardUrl).toBe('');
    expect(useAppStore.getState().wizardStep).toBe('url');
  });

  it('resets quick-download feedback when the URL changes', () => {
    useAppStore.setState({
      quickDownloadStatus: 'error',
      quickDownloadError: 'Previous failure'
    });

    useAppStore.getState().setWizardUrl(YOUTUBE_URL);

    expect(useAppStore.getState().quickDownloadStatus).toBe('idle');
    expect(useAppStore.getState().quickDownloadError).toBeNull();
  });

  it('sets preparing while the probe is in flight', async () => {
    const api = buildMockAppApi();
    let resolveProbe!: (v: Result<ProbeResult, ProbeError>) => void;
    vi.mocked(api.downloads.probe).mockReturnValue(
      new Promise<Result<ProbeResult, ProbeError>>((res) => {
        resolveProbe = res;
      })
    );
    window.appApi = api;

    useAppStore.setState({ wizardUrl: YOUTUBE_URL, wizardOutputDir: '/tmp' });
    const promise = useAppStore.getState().quickDownload();

    expect(useAppStore.getState().quickDownloadStatus).toBe('preparing');

    resolveProbe(ok(VIDEO_PROBE));
    await promise;
    expect(useAppStore.getState().quickDownloadStatus).toBe('queued');
  });

  it('rejects playlist probe results without enqueueing', async () => {
    const api = buildMockAppApi();
    vi.mocked(api.downloads.probe).mockResolvedValue(ok(PLAYLIST_PROBE));
    window.appApi = api;

    useAppStore.setState({ wizardUrl: 'https://www.youtube.com/playlist?list=PLtest', wizardOutputDir: '/tmp' });
    await useAppStore.getState().quickDownload();

    expect(api.queue.cmd.add).not.toHaveBeenCalled();
    expect(useAppStore.getState().wizardUrl).toBe('https://www.youtube.com/playlist?list=PLtest');
    expect(useAppStore.getState().quickDownloadStatus).toBe('error');
    expect(useAppStore.getState().quickDownloadError).toBe('wizard.url.quickSingleOnly');
  });

  it('keeps the URL and shows an error when probing fails', async () => {
    const api = buildMockAppApi();
    vi.mocked(api.downloads.probe).mockResolvedValue(fail({ kind: 'other', message: 'Probe failed' }));
    window.appApi = api;

    useAppStore.setState({ wizardUrl: YOUTUBE_URL, wizardOutputDir: '/tmp' });
    await useAppStore.getState().quickDownload();

    expect(api.queue.cmd.add).not.toHaveBeenCalled();
    expect(useAppStore.getState().wizardUrl).toBe(YOUTUBE_URL);
    expect(useAppStore.getState().quickDownloadStatus).toBe('error');
    expect(useAppStore.getState().quickDownloadError).toBe('Probe failed');
  });

  it('keeps the URL and shows an error when queue add fails', async () => {
    const api = buildMockAppApi();
    vi.mocked(api.downloads.probe).mockResolvedValue(ok(VIDEO_PROBE));
    vi.mocked(api.queue.cmd.add).mockResolvedValue(fail({ code: 'validation', message: 'Queue failed' }));
    window.appApi = api;

    useAppStore.setState({ wizardUrl: YOUTUBE_URL, wizardOutputDir: '/tmp' });
    await useAppStore.getState().quickDownload();

    expect(useAppStore.getState().wizardUrl).toBe(YOUTUBE_URL);
    expect(useAppStore.getState().quickDownloadStatus).toBe('error');
    expect(useAppStore.getState().quickDownloadError).toBe('Queue failed');
  });

  it('opens the cookies config dialog without probing when cookies settings are incomplete', async () => {
    const api = buildMockAppApi();
    window.appApi = api;

    useAppStore.setState({
      wizardUrl: YOUTUBE_URL,
      wizardOutputDir: '/tmp',
      settings: {
        common: { defaultOutputDir: '/tmp', rememberLastOutputDir: false, clipboardWatchEnabled: false, cookiesMode: 'file', cookiesPath: '' },
        single: {},
        playlist: {}
      }
    });

    await useAppStore.getState().quickDownload();

    expect(api.downloads.probe).not.toHaveBeenCalled();
    expect(useAppStore.getState().cookiesConfigDialogIssue).toBe('file-missing-path');
    expect(useAppStore.getState().quickDownloadStatus).toBe('idle');
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

  it('threads playlist scope into playlist probes', async () => {
    const api = buildMockAppApi();
    vi.mocked(api.downloads.probe).mockResolvedValue(ok(PLAYLIST_PROBE));
    window.appApi = api;

    useAppStore.setState({
      wizardUrl: 'https://www.youtube.com/playlist?list=PLtest',
      playlistScope: { items: { kind: 'range', from: 10, to: 20 } }
    });
    await useAppStore.getState().submitUrl();

    expect(api.downloads.probe).toHaveBeenCalledWith({
      url: 'https://www.youtube.com/playlist?list=PLtest',
      playlistMode: 'auto',
      playlistScope: { items: { kind: 'range', from: 10, to: 20 } }
    });
  });

  it('keeps playlist-step range selection as selection-only', async () => {
    const api = buildMockAppApi();
    vi.mocked(api.downloads.probe).mockResolvedValue(ok(PLAYLIST_PROBE));
    window.appApi = api;

    useAppStore.setState({ wizardUrl: 'https://www.youtube.com/playlist?list=PLtest' });
    await useAppStore.getState().submitUrl();
    vi.mocked(api.downloads.probe).mockClear();

    useAppStore.getState().selectPlaylistRange(2, 2);

    expect(useAppStore.getState().selectedPlaylistItemIds).toEqual(['e2']);
    expect(api.downloads.probe).not.toHaveBeenCalled();
  });

  it('trims the sentinel entry and marks the playlist as likely capped', async () => {
    const api = buildMockAppApi();
    vi.mocked(api.downloads.probe).mockResolvedValue(ok(playlistProbeWithEntries(101)));
    window.appApi = api;

    useAppStore.setState({
      wizardUrl: 'https://www.youtube.com/playlist?list=PLtest',
      settings: {
        common: { defaultOutputDir: '/tmp', rememberLastOutputDir: false, clipboardWatchEnabled: false, playlistProbeLimit: 100 },
        single: {},
        playlist: {}
      }
    });
    await useAppStore.getState().submitUrl();

    const state = useAppStore.getState();
    expect(state.playlistItems).toHaveLength(100);
    expect(state.selectedPlaylistItemIds).toHaveLength(100);
    expect(state.playlistLikelyCapped).toBe(true);
  });

  it('does not mark an exact-limit playlist as capped without a sentinel entry', async () => {
    const api = buildMockAppApi();
    vi.mocked(api.downloads.probe).mockResolvedValue(ok(playlistProbeWithEntries(100)));
    window.appApi = api;

    useAppStore.setState({
      wizardUrl: 'https://www.youtube.com/playlist?list=PLtest',
      settings: {
        common: { defaultOutputDir: '/tmp', rememberLastOutputDir: false, clipboardWatchEnabled: false, playlistProbeLimit: 100 },
        single: {},
        playlist: {}
      }
    });
    await useAppStore.getState().submitUrl();

    const state = useAppStore.getState();
    expect(state.playlistItems).toHaveLength(100);
    expect(state.playlistLikelyCapped).toBe(false);
  });

  it('trims first-count scoped probes without showing the app-limit cap alert', async () => {
    const api = buildMockAppApi();
    vi.mocked(api.downloads.probe).mockResolvedValue(ok(playlistProbeWithEntries(51)));
    window.appApi = api;

    useAppStore.setState({
      wizardUrl: 'https://www.youtube.com/playlist?list=PLtest',
      playlistScope: { items: { kind: 'first', count: 50 } },
      settings: {
        common: { defaultOutputDir: '/tmp', rememberLastOutputDir: false, clipboardWatchEnabled: false, playlistProbeLimit: 100 },
        single: {},
        playlist: {}
      }
    });
    await useAppStore.getState().submitUrl();

    const state = useAppStore.getState();
    expect(state.playlistItems).toHaveLength(50);
    expect(state.playlistLikelyCapped).toBe(false);
  });

  it('trims range scoped probes to the requested inclusive count', async () => {
    const api = buildMockAppApi();
    vi.mocked(api.downloads.probe).mockResolvedValue(ok(playlistProbeWithEntries(102)));
    window.appApi = api;

    useAppStore.setState({
      wizardUrl: 'https://www.youtube.com/playlist?list=PLtest',
      playlistScope: { items: { kind: 'range', from: 500, to: 600 } },
      settings: {
        common: { defaultOutputDir: '/tmp', rememberLastOutputDir: false, clipboardWatchEnabled: false, playlistProbeLimit: 100 },
        single: {},
        playlist: {}
      }
    });
    await useAppStore.getState().submitUrl();

    const state = useAppStore.getState();
    expect(state.playlistItems).toHaveLength(101);
    expect(state.playlistLikelyCapped).toBe(false);
  });

  it('logs scoped playlist reload start and success diagnostics', async () => {
    const api = buildMockAppApi();
    vi.mocked(api.downloads.probe).mockResolvedValue(ok(playlistProbeWithEntries(51)));
    window.appApi = api;

    useAppStore.setState({
      wizardStep: 'playlistItems',
      wizardUrl: 'https://www.youtube.com/playlist?list=PLtest',
      playlistItems: PLAYLIST_PROBE.entries,
      selectedPlaylistItemIds: PLAYLIST_PROBE.entries.map((entry) => entry.id),
      playlistScope: { items: { kind: 'app-limit' } }
    });

    const requestedScope = { items: { kind: 'first' as const, count: 50 } };
    await useAppStore.getState().reloadPlaylistWithScope(requestedScope);

    expect(api.diagnostics.logWizardStep).toHaveBeenCalledWith(
      expect.objectContaining({
        transition: 'playlistScopeReloadStart',
        fromStep: 'playlistItems',
        toStep: 'playlistItems',
        snapshot: expect.objectContaining({
          requestedScope,
          previousScope: { items: { kind: 'app-limit' } },
          previousItemsCount: 2,
          playlistItemsCount: 2,
          selectedPlaylistItemsCount: 2
        })
      })
    );
    expect(api.diagnostics.logWizardStep).toHaveBeenCalledWith(
      expect.objectContaining({
        transition: 'playlistScopeReloadSuccess',
        fromStep: 'playlistItems',
        toStep: 'playlistItems',
        snapshot: expect.objectContaining({
          requestedScope,
          previousItemsCount: 2,
          returnedEntryCount: 51,
          visibleItemsCount: 50,
          playlistItemsCount: 50,
          selectedPlaylistItemsCount: 50
        })
      })
    );
  });

  it('logs scoped playlist reload failures with the restored scope', async () => {
    const api = buildMockAppApi();
    vi.mocked(api.downloads.probe).mockResolvedValue(fail({ kind: 'other', message: 'Playlist returned no entries' }));
    window.appApi = api;

    useAppStore.setState({
      wizardStep: 'playlistItems',
      wizardUrl: 'https://www.youtube.com/playlist?list=PLtest',
      playlistItems: PLAYLIST_PROBE.entries,
      selectedPlaylistItemIds: PLAYLIST_PROBE.entries.map((entry) => entry.id),
      playlistScope: { items: { kind: 'app-limit' } }
    });

    const requestedScope = { items: { kind: 'range' as const, from: 900, to: 950 } };
    await useAppStore.getState().reloadPlaylistWithScope(requestedScope);

    expect(api.diagnostics.logWizardStep).toHaveBeenCalledWith(
      expect.objectContaining({
        transition: 'playlistScopeReloadFailure',
        fromStep: 'playlistItems',
        toStep: 'playlistItems',
        snapshot: expect.objectContaining({
          requestedScope,
          restoredScope: { items: { kind: 'app-limit' } },
          previousItemsCount: 2,
          playlistItemsCount: 2,
          selectedPlaylistItemsCount: 2,
          errorKind: 'other',
          message: 'No videos matched that playlist scope. Your previous list is still shown.'
        })
      })
    );
  });

  it('restores playlist state and logs when scoped playlist reload throws', async () => {
    const api = buildMockAppApi();
    vi.mocked(api.downloads.probe).mockRejectedValue(new Error('IPC bridge crashed'));
    window.appApi = api;

    useAppStore.setState({
      wizardStep: 'playlistItems',
      wizardUrl: 'https://www.youtube.com/playlist?list=PLtest',
      playlistItems: PLAYLIST_PROBE.entries,
      selectedPlaylistItemIds: PLAYLIST_PROBE.entries.map((entry) => entry.id),
      playlistScope: { items: { kind: 'app-limit' } }
    });

    const requestedScope = { items: { kind: 'range' as const, from: 900, to: 950 } };
    await useAppStore.getState().reloadPlaylistWithScope(requestedScope);

    expect(useAppStore.getState().playlistScope).toEqual({ items: { kind: 'app-limit' } });
    expect(useAppStore.getState().playlistScopeReloading).toBe(false);
    expect(useAppStore.getState().playlistScopeError).toBe('Could not reload that playlist scope: IPC bridge crashed. Your previous list is still shown.');
    expect(api.diagnostics.logWizardStep).toHaveBeenCalledWith(
      expect.objectContaining({
        transition: 'playlistScopeReloadFailure',
        fromStep: 'playlistItems',
        toStep: 'playlistItems',
        snapshot: expect.objectContaining({
          requestedScope,
          restoredScope: { items: { kind: 'app-limit' } },
          previousItemsCount: 2,
          playlistItemsCount: 2,
          selectedPlaylistItemsCount: 2,
          errorKind: 'exception',
          message: 'Could not reload that playlist scope: IPC bridge crashed. Your previous list is still shown.'
        })
      })
    );
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
