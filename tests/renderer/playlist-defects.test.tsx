// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useAppStore } from '@renderer/store/useAppStore.js';
import { StepConfirm } from '@renderer/components/wizard/StepConfirm.js';
import { ok } from '../shared/fixtures.js';
import type { PlaylistEntry } from '@shared/types.js';

const PLAYLIST_ENTRIES: PlaylistEntry[] = [
  { id: 'p1', url: 'https://youtube.com/watch?v=p1', title: 'Vid 1', thumbnail: '', playlistIndex: 1, videoId: 'p1' },
  { id: 'p2', url: 'https://youtube.com/watch?v=p2', title: 'Vid 2', thumbnail: '', playlistIndex: 2, videoId: 'p2' },
  { id: 'p3', url: 'https://youtube.com/watch?v=p3', title: 'Vid 3', thumbnail: '', playlistIndex: 3, videoId: 'p3' }
];

function buildMockApi(settingsUpdateMock?: ReturnType<typeof vi.fn>) {
  return {
    app: {
      warmUp: vi.fn().mockResolvedValue(ok({ completed: true, failures: [] })),
      setLanguage: vi.fn().mockResolvedValue(undefined)
    },
    downloads: {
      start: vi.fn().mockResolvedValue(ok({ job: { id: 'job-1', url: '', outputDir: '/tmp', status: 'running', createdAt: '', updatedAt: '' } })),
      cancel: vi.fn().mockResolvedValue(ok({ cancelled: true })),
      probe: vi.fn(),
      pause: vi.fn().mockResolvedValue(ok({ paused: true })),
      resume: vi.fn().mockResolvedValue(ok({ resumed: true }))
    },
    settings: {
      get: vi.fn().mockResolvedValue(ok({ defaultOutputDir: '/tmp', rememberLastOutputDir: false })),
      update: settingsUpdateMock ?? vi.fn().mockResolvedValue(ok({ defaultOutputDir: '/tmp', rememberLastOutputDir: false }))
    },
    shell: { openFolder: vi.fn(), openExternal: vi.fn() },
    logs: { openDir: vi.fn() },
    dialog: { chooseFolder: vi.fn() },
    events: {
      onStatus: vi.fn().mockReturnValue(() => undefined),
      onProgress: vi.fn().mockReturnValue(() => undefined),
      onClipboardUrl: vi.fn().mockReturnValue(() => undefined)
    },
    queue: {
      cmd: {
        add: vi.fn().mockResolvedValue({ ok: true, data: { ids: [] } }),
        getSnapshot: vi.fn().mockResolvedValue({ ok: true, data: [] }),
        start: vi.fn().mockResolvedValue({ ok: true, data: undefined }),
        pause: vi.fn().mockResolvedValue({ ok: true, data: undefined }),
        resume: vi.fn().mockResolvedValue({ ok: true, data: undefined }),
        cancel: vi.fn().mockResolvedValue({ ok: true, data: undefined }),
        retry: vi.fn().mockResolvedValue({ ok: true, data: undefined }),
        clearCompleted: vi.fn().mockResolvedValue({ ok: true, data: undefined }),
        remove: vi.fn().mockResolvedValue({ ok: true, data: undefined })
      },
      events: {
        onSnapshot: vi.fn().mockReturnValue(() => undefined),
        onAdded: vi.fn().mockReturnValue(() => undefined),
        onUpdated: vi.fn().mockReturnValue(() => undefined),
        onRemoved: vi.fn().mockReturnValue(() => undefined)
      }
    },
    updater: {
      onUpdateAvailable: vi.fn().mockReturnValue(() => undefined),
      install: vi.fn()
    },
    analytics: { track: vi.fn() },
    diagnostics: { logWizardStep: vi.fn() },
    playlist: {
      scanFolder: vi.fn().mockResolvedValue({ ok: true, data: { matchedIds: [] } }),
      registerManifest: vi.fn().mockResolvedValue({ ok: true, data: undefined })
    }
  };
}

function resetStore() {
  useAppStore.setState({
    initialized: false,
    initializing: false,
    settings: { defaultOutputDir: '/tmp', rememberLastOutputDir: false },
    wizardStep: 'confirm',
    wizardExtractor: 'youtube',
    wizardMode: 'single',
    formatsLoading: false,
    wizardUrl: '',
    wizardTitle: '',
    wizardThumbnail: '',
    wizardDuration: 0,
    wizardFormats: [],
    selectedVideoFormatId: '',
    audioSelection: { kind: 'none' },
    activePreset: null,
    wizardOutputDir: '/tmp',
    wizardSubfolderEnabled: false,
    wizardSubfolderName: '',
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
    wizardEmbedChapters: false,
    wizardEmbedMetadata: false,
    wizardEmbedThumbnail: false,
    wizardWriteDescription: false,
    wizardWriteThumbnail: false,
    playlistItems: [],
    selectedPlaylistItemIds: [],
    playlistSelection: null,
    playlistTitle: '',
    queue: [],
    drawerOpen: true
  } as never);
}

beforeEach(() => {
  resetStore();
  vi.clearAllMocks();
});

describe('D1/D3 — StepConfirm playlist-mode rendering', () => {
  function setPlaylistConfirmState() {
    useAppStore.setState({
      wizardMode: 'playlist',
      wizardStep: 'confirm',
      wizardExtractor: 'youtube',
      playlistTitle: 'My Playlist',
      playlistItems: PLAYLIST_ENTRIES,
      selectedPlaylistItemIds: ['p1', 'p2'],
      playlistSelection: { kind: 'video', tier: '1080', codec: 'best' },
      wizardOutputDir: '/tmp/playlists'
    } as never);
  }

  it('renders playlist + preset + items + saveTo rows; omits video/audio/subtitles/size rows', () => {
    window.appApi = buildMockApi() as never;
    setPlaylistConfirmState();
    render(<StepConfirm />);

    expect(screen.getByTestId('confirm-playlist')).toHaveTextContent('My Playlist');
    expect(screen.getByTestId('confirm-preset')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-items')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-saveTo')).toBeInTheDocument();

    expect(screen.queryByTestId('confirm-video')).not.toBeInTheDocument();
    expect(screen.queryByTestId('confirm-audio')).not.toBeInTheDocument();
    expect(screen.queryByTestId('confirm-subtitles')).not.toBeInTheDocument();
    expect(screen.queryByTestId('confirm-size')).not.toBeInTheDocument();
  });

  it('items row shows selected/total count', () => {
    window.appApi = buildMockApi() as never;
    setPlaylistConfirmState();
    render(<StepConfirm />);
    const cell = screen.getByTestId('confirm-items');
    expect(cell.textContent).toMatch(/2/);
    expect(cell.textContent).toMatch(/3/);
  });

  it('disables AddToQueue when no preset selected (playlist mode has no Pull-it CTA)', () => {
    window.appApi = buildMockApi() as never;
    setPlaylistConfirmState();
    useAppStore.setState({ playlistSelection: null } as never);
    render(<StepConfirm />);
    expect(screen.queryByTestId('btn-download-now')).toBeNull();
    expect(screen.getByTestId('btn-add-to-queue')).toBeDisabled();
  });

  it('disables AddToQueue when no items selected', () => {
    window.appApi = buildMockApi() as never;
    setPlaylistConfirmState();
    useAppStore.setState({ selectedPlaylistItemIds: [] } as never);
    render(<StepConfirm />);
    expect(screen.queryByTestId('btn-download-now')).toBeNull();
    expect(screen.getByTestId('btn-add-to-queue')).toBeDisabled();
  });
});

describe('D2 — persistFormatPrefs mode-keyed', () => {
  it('playlist mode writes lastPlaylist* keys, NOT lastPreset/lastSubfolder', async () => {
    const update = vi.fn().mockResolvedValue(ok({ defaultOutputDir: '/tmp', rememberLastOutputDir: false }));
    window.appApi = buildMockApi(update) as never;

    useAppStore.setState({
      wizardMode: 'playlist',
      playlistTitle: 'PL',
      playlistItems: PLAYLIST_ENTRIES,
      selectedPlaylistItemIds: ['p1'],
      playlistSelection: { kind: 'audio', format: 'mp3', bitrateKbps: 192 },
      wizardSubfolderEnabled: true,
      wizardSubfolderName: 'PlaylistFolder',
      wizardOutputDir: '/tmp'
    } as never);

    await useAppStore.getState().addToQueue();

    expect(update).toHaveBeenCalledOnce();
    const patch = update.mock.calls[0][0];
    expect(patch.playlist).toEqual({ lastPlaylistSelection: { kind: 'audio', format: 'mp3', bitrateKbps: 192 } });
    expect(patch.common).toMatchObject({ lastSubfolderEnabled: true, lastSubfolder: 'PlaylistFolder' });
    expect(patch).not.toHaveProperty('single');
  });

  it('single mode writes lastPreset/lastSubfolder, NOT lastPlaylist* keys', async () => {
    const update = vi.fn().mockResolvedValue(ok({ defaultOutputDir: '/tmp', rememberLastOutputDir: false }));
    window.appApi = buildMockApi(update) as never;

    useAppStore.setState({
      wizardMode: 'single',
      wizardUrl: 'https://youtube.com/watch?v=x',
      wizardTitle: 'X',
      wizardFormats: [{ formatId: '22', label: '720p', ext: 'mp4', resolution: '720p', isVideoOnly: false, isAudioOnly: false }],
      selectedVideoFormatId: '22',
      audioSelection: { kind: 'none' },
      activePreset: 'best-quality',
      wizardSubfolderEnabled: true,
      wizardSubfolderName: 'SingleFolder',
      wizardOutputDir: '/tmp'
    } as never);

    await useAppStore.getState().addToQueue();

    expect(update).toHaveBeenCalledOnce();
    const patch = update.mock.calls[0][0];
    expect(patch.single).toMatchObject({ lastPreset: 'best-quality' });
    expect(patch.common).toMatchObject({ lastSubfolder: 'SingleFolder', lastSubfolderEnabled: true });
    expect(patch).not.toHaveProperty('playlist');
  });
});

describe('D4 — scanDownloadedInFolder scans the per-playlist subfolder', () => {
  it('auto subfolder: scans <outputDir>/<sanitized title>, not the bare outputDir', async () => {
    const api = buildMockApi();
    window.appApi = api as never;
    useAppStore.setState({
      wizardMode: 'playlist',
      wizardOutputDir: '/tmp/dl',
      wizardSubfolderEnabled: false,
      wizardSubfolderName: '',
      playlistTitle: 'My Playlist',
      playlistItems: PLAYLIST_ENTRIES,
      selectedPlaylistItemIds: ['p1', 'p2', 'p3']
    } as never);

    await useAppStore.getState().scanDownloadedInFolder();

    expect(api.playlist.scanFolder).toHaveBeenCalledWith(expect.objectContaining({ outputDir: '/tmp/dl/My Playlist' }));
  });

  it('explicit subfolder: scans <outputDir>/<subfolderName>', async () => {
    const api = buildMockApi();
    window.appApi = api as never;
    useAppStore.setState({
      wizardMode: 'playlist',
      wizardOutputDir: '/tmp/dl',
      wizardSubfolderEnabled: true,
      wizardSubfolderName: 'Custom',
      playlistTitle: 'My Playlist',
      playlistItems: PLAYLIST_ENTRIES,
      selectedPlaylistItemIds: ['p1']
    } as never);

    await useAppStore.getState().scanDownloadedInFolder();

    expect(api.playlist.scanFolder).toHaveBeenCalledWith(expect.objectContaining({ outputDir: '/tmp/dl/Custom' }));
  });
});
