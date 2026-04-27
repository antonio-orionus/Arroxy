// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppStore } from '@renderer/store/useAppStore';
import type { GetFormatsOutput, StatusEvent } from '@shared/types';
import { ok } from '../shared/fixtures';

const YOUTUBE_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

const PROBE_RESULT: GetFormatsOutput = {
  formats: [
    { formatId: '22', label: '720p | mp4 | 30fps', ext: 'mp4', resolution: '720p', fps: 30, filesize: 400_000_000, isVideoOnly: false, isAudioOnly: false },
    { formatId: '140', label: 'opus 128kbps', ext: 'opus', resolution: 'audio only', abr: 128, isVideoOnly: false, isAudioOnly: true }
  ],
  title: 'Test Video',
  thumbnail: '',
  duration: 120,
  subtitles: { en: [{ ext: 'vtt', name: 'English' }], es: [{ ext: 'vtt' }] },
  automaticCaptions: { 'de-orig': [{ ext: 'vtt' }], 'ja-orig': [{ ext: 'vtt' }] }
};

function buildMockApi(settingsOverrides: Record<string, unknown> = {}, getFormatsResult: GetFormatsOutput = PROBE_RESULT) {
  return {
    app: {
      warmUp: vi.fn().mockResolvedValue(ok({ completed: true, failures: [] })),
      setLanguage: vi.fn().mockResolvedValue(undefined)
    },
    downloads: {
      start: vi.fn().mockResolvedValue(ok({ job: { id: 'job-1', url: YOUTUBE_URL, outputDir: '/tmp', status: 'running', createdAt: '', updatedAt: '' } })),
      cancel: vi.fn().mockResolvedValue(ok({ cancelled: true })),
      getFormats: vi.fn().mockResolvedValue(ok(getFormatsResult)),
      pause: vi.fn().mockResolvedValue(ok({ paused: true })),
    },
    settings: {
      get: vi.fn().mockResolvedValue(ok({ defaultOutputDir: '/tmp', rememberLastOutputDir: false, ...settingsOverrides })),
      update: vi.fn().mockResolvedValue(ok({ defaultOutputDir: '/tmp', rememberLastOutputDir: false, ...settingsOverrides })),
    },
    shell: { openFolder: vi.fn(), openExternal: vi.fn() },
    logs: { openDir: vi.fn() },
    dialog: { chooseFolder: vi.fn() },
    events: {
      onStatus: vi.fn().mockImplementation((_cb: (event: StatusEvent) => void) => () => undefined),
      onProgress: vi.fn().mockReturnValue(() => undefined),
    },
    queue: {
      save: vi.fn().mockResolvedValue(undefined),
      load: vi.fn().mockResolvedValue([]),
    },
    updater: {
      onUpdateAvailable: vi.fn().mockReturnValue(() => undefined),
      install: vi.fn()
    },
  };
}

function resetStore() {
  useAppStore.setState({
    initialized: false,
    initializing: false,
    settings: null,
    wizardStep: 'url',
    formatsLoading: false,
    wizardUrl: '',
    wizardTitle: '',
    wizardThumbnail: '',
    wizardFormats: [],
    selectedVideoFormatId: '',
    selectedAudioFormatId: null,
    activePreset: null,
    wizardOutputDir: '',
    wizardError: null,
    wizardErrorOrigin: null,
    wizardSubtitles: {},
    wizardAutomaticCaptions: {},
    wizardSubtitleLanguages: [],
    queue: [],
    drawerOpen: false,
  });
}

beforeEach(() => {
  resetStore();
  vi.clearAllMocks();
});

describe('Wizard subtitle step — store behavior', () => {
  it('populates subtitles + automaticCaptions from probe on submitUrl', async () => {
    window.appApi = buildMockApi() as never;
    await useAppStore.getState().initialize();

    useAppStore.getState().setWizardUrl(YOUTUBE_URL);
    await useAppStore.getState().submitUrl();

    const state = useAppStore.getState();
    expect(state.wizardSubtitles).toEqual(PROBE_RESULT.subtitles);
    expect(state.wizardAutomaticCaptions).toEqual(PROBE_RESULT.automaticCaptions);
    expect(state.wizardSubtitleLanguages).toEqual([]);
  });

  it('restores last-used subtitle languages from settings on submitUrl', async () => {
    window.appApi = buildMockApi({ lastSubtitleLanguages: ['en', 'es'] }) as never;
    await useAppStore.getState().initialize();

    useAppStore.getState().setWizardUrl(YOUTUBE_URL);
    await useAppStore.getState().submitUrl();

    const state = useAppStore.getState();
    expect(state.wizardSubtitleLanguages).toEqual(['en', 'es']);
  });

  it('drops restored languages not available in either subtitle pool', async () => {
    // 'fr' is not in subtitles or automaticCaptions — should be dropped
    window.appApi = buildMockApi({ lastSubtitleLanguages: ['en', 'fr'] }) as never;
    await useAppStore.getState().initialize();

    useAppStore.getState().setWizardUrl(YOUTUBE_URL);
    await useAppStore.getState().submitUrl();

    expect(useAppStore.getState().wizardSubtitleLanguages).toEqual(['en']);
  });

  it('restores auto-caption-only language from automaticCaptions pool', async () => {
    // 'de-orig' is only in automaticCaptions — now individually selectable, should be restored
    window.appApi = buildMockApi({ lastSubtitleLanguages: ['de-orig'] }) as never;
    await useAppStore.getState().initialize();

    useAppStore.getState().setWizardUrl(YOUTUBE_URL);
    await useAppStore.getState().submitUrl();

    expect(useAppStore.getState().wizardSubtitleLanguages).toEqual(['de-orig']);
  });

  it('drops languages absent from both subtitle pools', async () => {
    // 'zh' and 'ko' are in neither pool
    window.appApi = buildMockApi({ lastSubtitleLanguages: ['zh', 'ko'] }) as never;
    await useAppStore.getState().initialize();

    useAppStore.getState().setWizardUrl(YOUTUBE_URL);
    await useAppStore.getState().submitUrl();

    expect(useAppStore.getState().wizardSubtitleLanguages).toEqual([]);
  });

  it('confirmFormats advances to subtitles step', async () => {
    window.appApi = buildMockApi() as never;
    await useAppStore.getState().initialize();

    useAppStore.setState({ wizardStep: 'formats' });
    useAppStore.getState().confirmFormats();

    expect(useAppStore.getState().wizardStep).toBe('subtitles');
  });

  it('confirmSubtitles advances to folder step', () => {
    useAppStore.setState({ wizardStep: 'subtitles' });
    useAppStore.getState().confirmSubtitles();
    expect(useAppStore.getState().wizardStep).toBe('folder');
  });

  it('toggleSubtitleLanguage adds and removes a language', () => {
    useAppStore.setState({ wizardSubtitleLanguages: [] });
    useAppStore.getState().toggleSubtitleLanguage('en');
    expect(useAppStore.getState().wizardSubtitleLanguages).toEqual(['en']);

    useAppStore.getState().toggleSubtitleLanguage('en');
    expect(useAppStore.getState().wizardSubtitleLanguages).toEqual([]);
  });

  it('buildQueueItem derives writeAutoSubs: false when all selected langs are in manual pool', async () => {
    window.appApi = buildMockApi() as never;
    await useAppStore.getState().initialize();

    useAppStore.setState({
      wizardUrl: YOUTUBE_URL,
      wizardTitle: 'Test',
      wizardThumbnail: '',
      wizardOutputDir: '/tmp',
      selectedVideoFormatId: '22',
      selectedAudioFormatId: '140',
      activePreset: null,
      wizardFormats: PROBE_RESULT.formats,
      wizardSubtitles: PROBE_RESULT.subtitles,
      wizardAutomaticCaptions: PROBE_RESULT.automaticCaptions,
      wizardSubtitleLanguages: ['en', 'es'],
      wizardStep: 'confirm'
    });

    await useAppStore.getState().addToQueue();

    const queue = useAppStore.getState().queue;
    expect(queue).toHaveLength(1);
    expect(queue[0].subtitleLanguages).toEqual(['en', 'es']);
    expect(queue[0].writeAutoSubs).toBe(false);
  });

  it('buildQueueItem derives writeAutoSubs: true when a selected lang is auto-only', async () => {
    window.appApi = buildMockApi() as never;
    await useAppStore.getState().initialize();

    useAppStore.setState({
      wizardUrl: YOUTUBE_URL,
      wizardTitle: 'Test',
      wizardThumbnail: '',
      wizardOutputDir: '/tmp',
      selectedVideoFormatId: '22',
      selectedAudioFormatId: '140',
      activePreset: null,
      wizardFormats: PROBE_RESULT.formats,
      wizardSubtitles: PROBE_RESULT.subtitles,
      wizardAutomaticCaptions: PROBE_RESULT.automaticCaptions,
      wizardSubtitleLanguages: ['de-orig'],  // auto-only lang
      wizardStep: 'confirm'
    });

    await useAppStore.getState().addToQueue();

    const queue = useAppStore.getState().queue;
    expect(queue[0].writeAutoSubs).toBe(true);
  });

  it('startItemDownload forwards subtitle fields to downloads.start', async () => {
    window.appApi = buildMockApi() as never;
    await useAppStore.getState().initialize();

    useAppStore.setState({
      wizardUrl: YOUTUBE_URL,
      wizardTitle: 'Test',
      wizardThumbnail: '',
      wizardOutputDir: '/tmp',
      selectedVideoFormatId: '22',
      selectedAudioFormatId: '140',
      activePreset: null,
      wizardFormats: PROBE_RESULT.formats,
      wizardSubtitles: PROBE_RESULT.subtitles,
      wizardAutomaticCaptions: PROBE_RESULT.automaticCaptions,
      wizardSubtitleLanguages: ['en'],
      wizardStep: 'confirm'
    });

    await useAppStore.getState().addAndDownloadImmediately();

    const startCall = vi.mocked(window.appApi.downloads.start).mock.calls[0][0];
    expect(startCall.subtitleLanguages).toEqual(['en']);
    expect(startCall.writeAutoSubs).toBe(false);
  });

  it('persistFormatPrefs saves subtitle language prefs to settings', async () => {
    const updateMock = vi.fn().mockResolvedValue(ok({ defaultOutputDir: '/tmp', rememberLastOutputDir: false }));
    window.appApi = {
      ...buildMockApi(),
      settings: {
        get: vi.fn().mockResolvedValue(ok({ defaultOutputDir: '/tmp', rememberLastOutputDir: false })),
        update: updateMock
      }
    } as never;
    await useAppStore.getState().initialize();

    useAppStore.setState({
      wizardUrl: YOUTUBE_URL,
      wizardTitle: 'Test',
      wizardThumbnail: '',
      wizardOutputDir: '/tmp',
      selectedVideoFormatId: '22',
      selectedAudioFormatId: '140',
      activePreset: null,
      wizardFormats: PROBE_RESULT.formats,
      wizardSubtitles: PROBE_RESULT.subtitles,
      wizardAutomaticCaptions: PROBE_RESULT.automaticCaptions,
      wizardSubtitleLanguages: ['en', 'es'],
      wizardStep: 'confirm'
    });

    await useAppStore.getState().addToQueue();

    const updateCalls = updateMock.mock.calls;
    const subtitleUpdateCall = updateCalls.find((args: unknown[]) => {
      const patch = args[0] as Record<string, unknown>;
      return 'lastSubtitleLanguages' in patch;
    });
    expect(subtitleUpdateCall).toBeDefined();
    expect(subtitleUpdateCall![0]).toMatchObject({
      lastSubtitleLanguages: ['en', 'es']
    });
    expect(subtitleUpdateCall![0]).not.toHaveProperty('lastWriteAutoSubs');
  });

  it('resetWizard clears subtitle state', () => {
    useAppStore.setState({
      wizardSubtitleLanguages: ['en'],
      wizardSubtitles: { en: [{ ext: 'vtt' }] },
      wizardAutomaticCaptions: { de: [{ ext: 'vtt' }] }
    });

    useAppStore.getState().resetWizard();

    const state = useAppStore.getState();
    expect(state.wizardSubtitleLanguages).toEqual([]);
    expect(state.wizardSubtitles).toEqual({});
    expect(state.wizardAutomaticCaptions).toEqual({});
  });
});
