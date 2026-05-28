// @vitest-environment jsdom
import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppStore } from '@renderer/store/useAppStore.js';
import { ok } from '../shared/fixtures.js';
import { buildAppSettings } from '../shared/settingsFixtures.js';
import type { PlaylistEntry, StatusEvent } from '@shared/types.js';

const PLAYLIST_ENTRIES: PlaylistEntry[] = [
  { id: 'p1', url: 'https://youtube.com/watch?v=p1', title: 'Vid 1', thumbnail: '', playlistIndex: 1 },
  { id: 'p2', url: 'https://youtube.com/watch?v=p2', title: 'Vid 2', thumbnail: '', playlistIndex: 2 },
  { id: 'p3', url: 'https://youtube.com/watch?v=p3', title: 'Vid 3', thumbnail: '', playlistIndex: 3 }
];

function buildMockApi(settingsOverrides: Record<string, unknown> = {}) {
  return {
    app: {
      warmUp: vi.fn().mockResolvedValue(ok({ completed: true, failures: [] })),
      setLanguage: vi.fn().mockResolvedValue(undefined)
    },
    downloads: {
      probeCancel: vi.fn().mockResolvedValue(undefined),
      start: vi.fn().mockResolvedValue(ok({ job: { id: 'job-1', url: '', outputDir: '/tmp', status: 'running', createdAt: '', updatedAt: '' } })),
      cancel: vi.fn().mockResolvedValue(ok({ cancelled: true })),
      probe: vi.fn().mockResolvedValue(
        ok({
          kind: 'playlist' as const,
          extractor: 'youtube:tab',
          extractorKey: 'YoutubeTab',
          webpageUrl: 'https://www.youtube.com/playlist?list=PL123',
          isMultiVideo: false,
          playlistId: 'PL123',
          playlistTitle: 'Playlist',
          entries: PLAYLIST_ENTRIES
        })
      ),
      pause: vi.fn().mockResolvedValue(ok({ paused: true })),
      resume: vi.fn().mockResolvedValue(ok({ resumed: true }))
    },
    settings: {
      get: vi.fn().mockResolvedValue(ok(buildAppSettings(settingsOverrides))),
      update: vi.fn().mockImplementation(async (patch) => ok({ ...buildAppSettings(settingsOverrides), ...patch }))
    },
    shell: { openFolder: vi.fn(), openExternal: vi.fn() },
    logs: { openDir: vi.fn() },
    dialog: { chooseFolder: vi.fn() },
    events: {
      onStatus: vi.fn().mockImplementation((_cb: (event: StatusEvent) => void) => () => undefined),
      onProgress: vi.fn().mockReturnValue(() => undefined),
      onClipboardUrl: vi.fn().mockReturnValue(() => undefined),
      onWarmupProgress: vi.fn().mockReturnValue(() => undefined)
    },
    queue: {
      cmd: {
        add: vi.fn().mockResolvedValue(ok({ ids: [] })),
        getSnapshot: vi.fn().mockResolvedValue(ok([])),
        start: vi.fn().mockResolvedValue(ok(undefined)),
        pause: vi.fn().mockResolvedValue(ok(undefined)),
        resume: vi.fn().mockResolvedValue(ok(undefined)),
        cancel: vi.fn().mockResolvedValue(ok(undefined)),
        retry: vi.fn().mockResolvedValue(ok(undefined)),
        clearCompleted: vi.fn().mockResolvedValue(ok(undefined)),
        remove: vi.fn().mockResolvedValue(ok(undefined))
      },
      events: {
        onSnapshot: vi.fn().mockReturnValue(() => undefined),
        onAdded: vi.fn().mockReturnValue(() => undefined),
        onUpdated: vi.fn().mockReturnValue(() => undefined),
        onRemoved: vi.fn().mockReturnValue(() => undefined)
      }
    },
    diagnostics: { logWizardStep: vi.fn() }
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  useAppStore.setState({
    initialized: false,
    initializing: false,
    settings: null,
    wizardStep: 'url',
    wizardMode: 'single',
    wizardUrl: '',
    wizardTitle: '',
    wizardThumbnail: '',
    wizardDuration: undefined,
    wizardFormats: [],
    formatsLoading: false,
    selectedVideoFormatId: '',
    audioSelection: { kind: 'none' },
    lastConvertBitrate: 192,
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
    wizardEmbedChapters: false,
    wizardEmbedMetadata: false,
    wizardEmbedThumbnail: false,
    wizardWriteDescription: false,
    wizardWriteThumbnail: false,
    wizardSubfolderEnabled: false,
    wizardSubfolderName: '',
    playlistItems: [],
    selectedPlaylistItemIds: [],
    playlistTitle: '',
    playlistId: '',
    playlistProbeLoading: false,
    playlistIsMultiVideo: false,
    selectedPlaylistPreset: null,
    wizardExtractor: '',
    wizardExtractorKey: '',
    wizardWebpageUrl: '',
    queue: [],
    drawerOpen: false,
    showQueueTip: false
  } as never);
});

describe('playlist regressions', () => {
  it('playlist probe restores persisted common prefs before the first playlist save', async () => {
    const api = buildMockApi({
      embedChapters: true,
      embedMetadata: true,
      embedThumbnail: true,
      writeDescription: true,
      writeThumbnail: true,
      lastSponsorBlockMode: 'mark',
      lastSponsorBlockCategories: ['intro'],
      lastPlaylistPreset: 'audio-mp3',
      lastSubfolderEnabled: true,
      lastSubfolder: 'Saved Folder'
    });
    window.appApi = api as never;

    await useAppStore.getState().initialize();
    useAppStore.getState().setWizardUrl('https://www.youtube.com/playlist?list=PL123');
    await useAppStore.getState().submitUrl();

    expect(useAppStore.getState().wizardEmbedChapters).toBe(true);
    expect(useAppStore.getState().wizardEmbedMetadata).toBe(true);
    expect(useAppStore.getState().wizardEmbedThumbnail).toBe(true);
    expect(useAppStore.getState().wizardWriteDescription).toBe(true);
    expect(useAppStore.getState().wizardWriteThumbnail).toBe(true);
    expect(useAppStore.getState().wizardSponsorBlockMode).toBe('mark');
    expect(useAppStore.getState().wizardSponsorBlockCategories).toEqual(['intro']);
    expect(useAppStore.getState().selectedPlaylistPreset).toBe('audio-mp3');
    expect(useAppStore.getState().wizardSubfolderEnabled).toBe(true);
    expect(useAppStore.getState().wizardSubfolderName).toBe('Saved Folder');

    useAppStore.setState({ wizardOutputDir: '/tmp/out' } as never);

    await act(async () => {
      await useAppStore.getState().addToQueue();
    });

    const patch = api.settings.update.mock.calls.at(-1)?.[0];
    expect(patch.common).toMatchObject({
      embedChapters: true,
      embedMetadata: true,
      embedThumbnail: true,
      writeDescription: true,
      writeThumbnail: true,
      lastSponsorBlockMode: 'mark',
      lastSponsorBlockCategories: ['intro']
    });
  });

  it('playlist format retry preserves a manually selected playlist preset', async () => {
    window.appApi = buildMockApi({ lastPlaylistPreset: 'audio-mp3' }) as never;

    await useAppStore.getState().initialize();
    useAppStore.getState().setWizardUrl('https://www.youtube.com/playlist?list=PL123');
    await useAppStore.getState().submitUrl();
    useAppStore.getState().setPlaylistPreset('video-1080p');

    await act(async () => {
      await useAppStore.getState().retryFormatProbe();
    });

    expect(useAppStore.getState().selectedPlaylistPreset).toBe('video-1080p');
  });

  it('playlist outputTemplate padding scales with playlist length', async () => {
    window.appApi = buildMockApi() as never;

    useAppStore.setState({
      initialized: true,
      settings: buildAppSettings(),
      wizardMode: 'playlist',
      playlistTitle: 'Big Playlist',
      playlistItems: [
        { id: 'p9', url: 'https://youtube.com/watch?v=p9', title: 'Vid 9', thumbnail: '', playlistIndex: 9 },
        { id: 'p10', url: 'https://youtube.com/watch?v=p10', title: 'Vid 10', thumbnail: '', playlistIndex: 10 },
        { id: 'p100', url: 'https://youtube.com/watch?v=p100', title: 'Vid 100', thumbnail: '', playlistIndex: 100 }
      ],
      selectedPlaylistItemIds: ['p9', 'p10', 'p100'],
      selectedPlaylistPreset: 'video-1080p',
      wizardOutputDir: '/tmp/out'
    } as never);

    await act(async () => {
      await useAppStore.getState().addToQueue();
    });

    const templates = (vi.mocked(window.appApi.queue.cmd.add).mock.calls[0]?.[0] ?? []).map((item) => (item.job.kind === 'playlist-preset' ? item.job.outputTemplate : null));

    expect(templates).toEqual(['009 - %(title)s.%(ext)s', '010 - %(title)s.%(ext)s', '100 - %(title)s.%(ext)s']);
  });
});
