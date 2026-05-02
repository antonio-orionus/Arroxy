// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppStore } from '@renderer/store/useAppStore';
import type { QueueItem, StatusEvent, StatusKey } from '@shared/types';
import { makeItem, ok } from '../shared/fixtures';

describe('Queue store — phase status transitions', () => {
  let capturedOnStatus: ((event: StatusEvent) => void) | null = null;

  function buildMockApi(savedQueue: QueueItem[] = []) {
    return {
      app: {
        warmUp: vi.fn().mockResolvedValue(ok({ completed: true, failures: [] })),
        setLanguage: vi.fn().mockResolvedValue(undefined)
      },
      downloads: {
        start: vi.fn(),
        cancel: vi.fn().mockResolvedValue(ok({ cancelled: true })),
        getFormats: vi.fn(),
        pause: vi.fn().mockResolvedValue(ok({ paused: true })),
      },
      settings: {
        get: vi.fn().mockResolvedValue(ok({ defaultOutputDir: '/tmp', rememberLastOutputDir: false })),
        update: vi.fn().mockResolvedValue(ok({})),
      },
      shell: { openFolder: vi.fn(), openExternal: vi.fn() },
      logs: { openDir: vi.fn() },
      dialog: { chooseFolder: vi.fn() },
      events: {
        onStatus: vi.fn().mockImplementation((cb: (event: StatusEvent) => void) => {
          capturedOnStatus = cb;
          return () => undefined;
        }),
        onProgress: vi.fn().mockReturnValue(() => undefined),
        onClipboardUrl: vi.fn().mockReturnValue(() => undefined),
      },
      queue: {
        save: vi.fn().mockResolvedValue({ ok: true, data: { saved: true } }),
        load: vi.fn().mockResolvedValue({ ok: true, data: savedQueue })
      },
      updater: {
        onUpdateAvailable: vi.fn().mockReturnValue(() => undefined),
        install: vi.fn()
      }
    };
  }

  function statusEvent(key: StatusKey, stage: StatusEvent['stage'], jobId: string, params?: Record<string, string | number>): StatusEvent {
    return { jobId, stage, statusKey: key, params, at: new Date().toISOString() };
  }

  beforeEach(async () => {
    capturedOnStatus = null;
    useAppStore.setState({
      initialized: false, initializing: false, settings: null,
      wizardStep: 'url', formatsLoading: false, wizardUrl: '', wizardTitle: '', wizardThumbnail: '',
      wizardFormats: [], selectedVideoFormatId: '', selectedAudioFormatId: null, activePreset: null,
      wizardOutputDir: '', wizardError: null, wizardErrorOrigin: null,
      wizardSubtitles: {}, wizardAutomaticCaptions: {}, wizardSubtitleLanguages: [],
      queue: [], drawerOpen: false,
    });
    vi.clearAllMocks();

    // Seed a downloading item so status events can target it
    const item = makeItem({
      id: 'item-1',
      status: 'downloading',
      progressPercent: 100,
      progressDetail: '5.2 MB/s ETA 00:34',
      downloadJobId: 'job-1'
    });
    window.appApi = buildMockApi([item]) as never;
    await useAppStore.getState().initialize();
  });

  it('mergingFormats event clears stale progressDetail', () => {
    capturedOnStatus!(statusEvent('mergingFormats', 'download', 'job-1'));

    const item = useAppStore.getState().queue.find((i) => i.id === 'item-1')!;
    expect(item.progressDetail).toBeNull();
    expect(item.lastStatus?.key).toBe('mergingFormats');
  });

  it('fetchingSubtitles event clears stale progressDetail', () => {
    capturedOnStatus!(statusEvent('fetchingSubtitles', 'download', 'job-1'));

    const item = useAppStore.getState().queue.find((i) => i.id === 'item-1')!;
    expect(item.progressDetail).toBeNull();
    expect(item.lastStatus?.key).toBe('fetchingSubtitles');
  });

  it('sleepingBetweenRequests event clears stale progressDetail and preserves seconds param', () => {
    capturedOnStatus!(statusEvent('sleepingBetweenRequests', 'download', 'job-1', { seconds: 5 }));

    const item = useAppStore.getState().queue.find((i) => i.id === 'item-1')!;
    expect(item.progressDetail).toBeNull();
    expect(item.lastStatus?.key).toBe('sleepingBetweenRequests');
    expect(item.lastStatus?.params).toEqual({ seconds: 5 });
  });

  it('downloadingMedia event does NOT clear progressDetail (kept around if still relevant)', () => {
    capturedOnStatus!(statusEvent('downloadingMedia', 'download', 'job-1'));

    const item = useAppStore.getState().queue.find((i) => i.id === 'item-1')!;
    expect(item.progressDetail).toBe('5.2 MB/s ETA 00:34');
    expect(item.lastStatus?.key).toBe('downloadingMedia');
  });

  it('downloadingMedia event resets progressPercent to 0 (per-file phase)', () => {
    capturedOnStatus!(statusEvent('downloadingMedia', 'download', 'job-1'));

    const item = useAppStore.getState().queue.find((i) => i.id === 'item-1')!;
    expect(item.progressPercent).toBe(0);
  });

  it('fetchingSubtitles event resets progressPercent to 0', () => {
    capturedOnStatus!(statusEvent('fetchingSubtitles', 'download', 'job-1'));

    const item = useAppStore.getState().queue.find((i) => i.id === 'item-1')!;
    expect(item.progressPercent).toBe(0);
  });

  it('mergingFormats event preserves progressPercent (download is done, just muxing)', () => {
    capturedOnStatus!(statusEvent('mergingFormats', 'download', 'job-1'));

    const item = useAppStore.getState().queue.find((i) => i.id === 'item-1')!;
    expect(item.progressPercent).toBe(100);
  });

  it('subtitlesFailed event with stage=done marks item as done and preserves the warning key', () => {
    capturedOnStatus!(statusEvent('subtitlesFailed', 'done', 'job-1'));

    const item = useAppStore.getState().queue.find((i) => i.id === 'item-1')!;
    expect(item.status).toBe('done');
    expect(item.progressPercent).toBe(100);
    expect(item.lastStatus?.key).toBe('subtitlesFailed');
    expect(item.finishedAt).not.toBeNull();
  });

  it('ignores follow-up status events after a terminal event (downloadJobId is nulled)', () => {
    capturedOnStatus!(statusEvent('subtitlesFailed', 'done', 'job-1'));
    // Second event for same jobId — should be ignored because downloadJobId is now null
    capturedOnStatus!(statusEvent('complete', 'done', 'job-1'));

    const item = useAppStore.getState().queue.find((i) => i.id === 'item-1')!;
    expect(item.lastStatus?.key).toBe('subtitlesFailed');
    expect(item.downloadJobId).toBeNull();
  });
});
