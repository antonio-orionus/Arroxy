// @vitest-environment jsdom
import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppStore } from '@renderer/store/useAppStore.js';
import { ok } from '../shared/fixtures.js';
import { buildAppSettings } from '../shared/settingsFixtures.js';
import type { PlaylistEntry, StatusEvent } from '@shared/types.js';

const PLAYLIST_ENTRIES: PlaylistEntry[] = [
  { id: 'p1', url: 'https://youtube.com/watch?v=p1', title: 'Vid 1', thumbnail: '', playlistIndex: 1, videoId: 'p1' },
  { id: 'p2', url: 'https://youtube.com/watch?v=p2', title: 'Vid 2', thumbnail: '', playlistIndex: 2, videoId: 'p2' },
  { id: 'p3', url: 'https://youtube.com/watch?v=p3', title: 'Vid 3', thumbnail: '', playlistIndex: 3, videoId: 'p3' }
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
    diagnostics: { logWizardStep: vi.fn() },
    playlist: {
      scanFolder: vi.fn().mockResolvedValue(ok({ matchedIds: [] as string[] })),
      registerManifest: vi.fn().mockResolvedValue(ok(undefined))
    }
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
    playlistSelection: null,
    wizardExtractor: '',
    wizardExtractorKey: '',
    wizardWebpageUrl: '',
    queue: [],
    drawerOpen: false,
    showQueueTip: false
  } as never);
});

describe('playlist regressions', () => {
  it('single outputTemplate includes the id suffix by default', async () => {
    window.appApi = buildMockApi() as never;

    useAppStore.setState({
      initialized: true,
      settings: buildAppSettings(),
      wizardMode: 'single',
      wizardUrl: 'https://youtube.com/watch?v=abc123',
      wizardTitle: 'Single Video',
      wizardThumbnail: '',
      wizardOutputDir: '/tmp/out',
      wizardExtractor: 'youtube',
      wizardExtractorKey: 'Youtube',
      wizardFormats: [{ formatId: '22', label: '720p', ext: 'mp4', resolution: '720p', isVideoOnly: false, isAudioOnly: false }],
      selectedVideoFormatId: '22',
      audioSelection: { kind: 'none' },
      activePreset: null
    } as never);

    await act(async () => {
      await useAppStore.getState().addToQueue();
    });

    const item = vi.mocked(window.appApi.queue.cmd.add).mock.calls[0]?.[0]?.[0];
    expect(item?.job.kind).toBe('single-format');
    if (item?.job.kind !== 'single-format') throw new Error('single-format job expected');
    expect(item.job.outputTemplate).toBe('%(title).200B [%(id)s].%(ext)s');
  });

  it('single outputTemplate can omit the id suffix when the advanced setting is off', async () => {
    window.appApi = buildMockApi({ includeIdInSingleFilenames: false }) as never;

    useAppStore.setState({
      initialized: true,
      settings: buildAppSettings({ includeIdInSingleFilenames: false }),
      wizardMode: 'single',
      wizardUrl: 'https://youtube.com/watch?v=abc123',
      wizardTitle: 'Single Video',
      wizardThumbnail: '',
      wizardOutputDir: '/tmp/out',
      wizardExtractor: 'youtube',
      wizardExtractorKey: 'Youtube',
      wizardFormats: [{ formatId: '22', label: '720p', ext: 'mp4', resolution: '720p', isVideoOnly: false, isAudioOnly: false }],
      selectedVideoFormatId: '22',
      audioSelection: { kind: 'none' },
      activePreset: null
    } as never);

    await act(async () => {
      await useAppStore.getState().addToQueue();
    });

    const item = vi.mocked(window.appApi.queue.cmd.add).mock.calls[0]?.[0]?.[0];
    expect(item?.job.kind).toBe('single-format');
    if (item?.job.kind !== 'single-format') throw new Error('single-format job expected');
    expect(item.job.outputTemplate).toBe('%(title).200B.%(ext)s');
  });

  it('playlist probe restores persisted common prefs before the first playlist save', async () => {
    const selAudioMp3 = { kind: 'audio' as const, format: 'mp3' as const, bitrateKbps: 192 as const };
    const api = buildMockApi({
      embedChapters: true,
      embedMetadata: true,
      embedThumbnail: true,
      writeDescription: true,
      writeThumbnail: true,
      lastSponsorBlockMode: 'mark',
      lastSponsorBlockCategories: ['intro'],
      lastPlaylistSelection: selAudioMp3,
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
    expect(useAppStore.getState().playlistSelection).toEqual(selAudioMp3);
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

  it('playlist format retry preserves a manually selected playlist selection', async () => {
    const selAudioMp3 = { kind: 'audio' as const, format: 'mp3' as const, bitrateKbps: 192 as const };
    const sel1080 = { kind: 'video' as const, tier: '1080' as const, codec: 'best' as const };
    window.appApi = buildMockApi({ lastPlaylistSelection: selAudioMp3 }) as never;

    await useAppStore.getState().initialize();
    useAppStore.getState().setWizardUrl('https://www.youtube.com/playlist?list=PL123');
    await useAppStore.getState().submitUrl();
    useAppStore.getState().setPlaylistSelection(sel1080);

    await act(async () => {
      await useAppStore.getState().retryFormatProbe();
    });

    expect(useAppStore.getState().playlistSelection).toEqual(sel1080);
  });

  it('playlist outputTemplate is position-independent with id-suffix and byte-safe title', async () => {
    window.appApi = buildMockApi() as never;

    useAppStore.setState({
      initialized: true,
      settings: buildAppSettings(),
      wizardMode: 'playlist',
      playlistTitle: 'Big Playlist',
      playlistItems: [
        { id: 'p9', url: 'https://youtube.com/watch?v=p9', title: 'Vid 9', thumbnail: '', playlistIndex: 9, videoId: 'p9' },
        { id: 'p10', url: 'https://youtube.com/watch?v=p10', title: 'Vid 10', thumbnail: '', playlistIndex: 10, videoId: 'p10' },
        { id: 'p100', url: 'https://youtube.com/watch?v=p100', title: 'Vid 100', thumbnail: '', playlistIndex: 100, videoId: 'p100' }
      ],
      selectedPlaylistItemIds: ['p9', 'p10', 'p100'],
      playlistSelection: { kind: 'video', tier: '1080', codec: 'best' },
      wizardOutputDir: '/tmp/out'
    } as never);

    await act(async () => {
      await useAppStore.getState().addToQueue();
    });

    const templates = (vi.mocked(window.appApi.queue.cmd.add).mock.calls[0]?.[0] ?? []).map((item) => (item.job.kind === 'playlist-preset' ? item.job.outputTemplate : null));

    expect(templates).toEqual(['%(title).200B [%(id)s].%(ext)s', '%(title).200B [%(id)s].%(ext)s', '%(title).200B [%(id)s].%(ext)s']);
  });

  it('built playlist items carry writeM3u from wizard state (opt-out propagates)', async () => {
    window.appApi = buildMockApi() as never;

    useAppStore.setState({
      initialized: true,
      settings: buildAppSettings(),
      wizardMode: 'playlist',
      playlistTitle: 'Big Playlist',
      playlistItems: [{ id: 'p1', url: 'https://youtube.com/watch?v=p1', title: 'Vid 1', thumbnail: '', playlistIndex: 1, videoId: 'p1' }],
      selectedPlaylistItemIds: ['p1'],
      playlistSelection: { kind: 'video', tier: '1080', codec: 'best' },
      wizardOutputDir: '/tmp/out',
      wizardWriteM3u: false
    } as never);

    await act(async () => {
      await useAppStore.getState().addToQueue();
    });

    const items = vi.mocked(window.appApi.queue.cmd.add).mock.calls[0]?.[0] ?? [];
    expect(items).toHaveLength(1);
    expect(items[0]?.writeM3u).toBe(false);
  });

  it('built playlist items default writeM3u to true (M3U on by default)', async () => {
    window.appApi = buildMockApi() as never;

    useAppStore.setState({
      initialized: true,
      settings: buildAppSettings(),
      wizardMode: 'playlist',
      playlistTitle: 'Big Playlist',
      playlistItems: [{ id: 'p1', url: 'https://youtube.com/watch?v=p1', title: 'Vid 1', thumbnail: '', playlistIndex: 1, videoId: 'p1' }],
      selectedPlaylistItemIds: ['p1'],
      playlistSelection: { kind: 'video', tier: '1080', codec: 'best' },
      wizardOutputDir: '/tmp/out',
      wizardWriteM3u: true
    } as never);

    await act(async () => {
      await useAppStore.getState().addToQueue();
    });

    const items = vi.mocked(window.appApi.queue.cmd.add).mock.calls[0]?.[0] ?? [];
    expect(items[0]?.writeM3u).toBe(true);
  });

  it('bulk queues one item per selected URL without registering a playlist manifest', async () => {
    window.appApi = buildMockApi() as never;

    useAppStore.setState({
      initialized: true,
      settings: buildAppSettings(),
      wizardMode: 'bulk',
      playlistTitle: 'Bulk URLs',
      playlistItems: [
        { id: 'bulk-1', url: 'https://vimeo.com/1', title: 'Bulk URL 1', thumbnail: '', playlistIndex: 1, videoId: null },
        { id: 'bulk-2', url: 'https://example.com/video/2', title: 'Bulk URL 2', thumbnail: '', playlistIndex: 2, videoId: null }
      ],
      selectedPlaylistItemIds: ['bulk-1', 'bulk-2'],
      playlistSelection: { kind: 'video', tier: '1080', codec: 'best' },
      wizardOutputDir: '/tmp/out',
      wizardWriteM3u: false
    } as never);

    await act(async () => {
      await useAppStore.getState().addToQueue();
    });

    const items = vi.mocked(window.appApi.queue.cmd.add).mock.calls[0]?.[0] ?? [];
    expect(items).toHaveLength(2);
    expect(items.map((item) => item.url)).toEqual(['https://vimeo.com/1', 'https://example.com/video/2']);
    expect(items.every((item) => item.job.kind === 'playlist-preset')).toBe(true);
    expect(items.every((item) => item.writeM3u === false)).toBe(true);
    expect(window.appApi.playlist.registerManifest).not.toHaveBeenCalled();
  });

  it('cancels resolving bulk metadata before queue submission can start downloads', async () => {
    window.appApi = buildMockApi() as never;

    useAppStore.setState({
      initialized: true,
      settings: buildAppSettings(),
      wizardMode: 'bulk',
      bulkMetadataStatus: 'resolving',
      bulkMetadataCompleted: 0,
      bulkMetadataTotal: 2,
      bulkMetadataById: { 'bulk-1': 'resolving', 'bulk-2': 'pending' },
      playlistTitle: 'Bulk URLs',
      playlistItems: [
        { id: 'bulk-1', url: 'https://vimeo.com/1', title: 'Bulk URL 1', thumbnail: '', playlistIndex: 1, videoId: null },
        { id: 'bulk-2', url: 'https://example.com/video/2', title: 'Bulk URL 2', thumbnail: '', playlistIndex: 2, videoId: null }
      ],
      selectedPlaylistItemIds: ['bulk-1', 'bulk-2'],
      playlistSelection: { kind: 'video', tier: '1080', codec: 'best' },
      wizardOutputDir: '/tmp/out',
      wizardWriteM3u: false
    } as never);

    await act(async () => {
      await useAppStore.getState().addToQueue();
    });

    expect(window.appApi.downloads.probeCancel).toHaveBeenCalled();
    expect(window.appApi.queue.cmd.add).toHaveBeenCalled();
    expect(vi.mocked(window.appApi.downloads.probeCancel).mock.invocationCallOrder[0]).toBeLessThan(vi.mocked(window.appApi.queue.cmd.add).mock.invocationCallOrder[0] ?? Infinity);
  });

  it('bulk persists the batch playlist preset preference', async () => {
    window.appApi = buildMockApi() as never;

    const selection = { kind: 'audio' as const, format: 'mp3' as const, bitrateKbps: 192 as const };
    useAppStore.setState({
      initialized: true,
      settings: buildAppSettings(),
      wizardMode: 'bulk',
      playlistTitle: 'Bulk URLs',
      playlistItems: [{ id: 'bulk-1', url: 'https://vimeo.com/1', title: 'Bulk URL 1', thumbnail: '', playlistIndex: 1, videoId: null }],
      selectedPlaylistItemIds: ['bulk-1'],
      playlistSelection: selection,
      wizardOutputDir: '/tmp/out',
      wizardWriteM3u: false
    } as never);

    await act(async () => {
      await useAppStore.getState().addToQueue();
    });

    expect(window.appApi.settings.update).toHaveBeenCalledWith(expect.objectContaining({ playlist: { lastPlaylistSelection: selection } }));
  });
});
