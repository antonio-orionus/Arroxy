// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useAppStore } from '@renderer/store/useAppStore';
import type { GetFormatsOutput, StatusEvent } from '@shared/types';
import { ok } from '../shared/fixtures';
import { StepSubtitles } from '@renderer/components/StepSubtitles';
import { StepConfirm } from '@renderer/components/StepConfirm';
import { StepFormatSelect } from '@renderer/components/StepFormatSelect';

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
      save: vi.fn().mockResolvedValue({ ok: true, data: { saved: true } }),
      load: vi.fn().mockResolvedValue({ ok: true, data: [] }),
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
    wizardSubtitleMode: 'sidecar',
    wizardSubtitleFormat: 'srt',
    queue: [],
    drawerOpen: false,
  });
}

beforeEach(() => {
  resetStore();
  vi.clearAllMocks();
});

describe('Subtitle-only preset', () => {
  it('setPreset("subtitle-only") clears video and audio selections', async () => {
    window.appApi = buildMockApi() as never;
    await useAppStore.getState().initialize();
    useAppStore.getState().setWizardUrl(YOUTUBE_URL);
    await useAppStore.getState().submitUrl();

    useAppStore.getState().setPreset('subtitle-only');

    const state = useAppStore.getState();
    expect(state.activePreset).toBe('subtitle-only');
    expect(state.selectedVideoFormatId).toBe('');
    expect(state.selectedAudioFormatId).toBeNull();
  });

  it('subtitle-only preset produces undefined formatId in queue item', async () => {
    window.appApi = buildMockApi() as never;
    await useAppStore.getState().initialize();
    useAppStore.getState().setWizardUrl(YOUTUBE_URL);
    await useAppStore.getState().submitUrl();
    useAppStore.getState().setPreset('subtitle-only');
    useAppStore.getState().toggleSubtitleLanguage('en');

    await useAppStore.getState().addToQueue();

    const item = useAppStore.getState().queue[0];
    expect(item.formatId).toBeUndefined();
    expect(item.subtitleLanguages).toEqual(['en']);
  });

  it('downloads.start receives undefined formatId and the chosen subtitleLanguages', async () => {
    const api = buildMockApi() as never as ReturnType<typeof buildMockApi>;
    window.appApi = api as never;
    await useAppStore.getState().initialize();
    useAppStore.getState().setWizardUrl(YOUTUBE_URL);
    await useAppStore.getState().submitUrl();
    useAppStore.getState().setPreset('subtitle-only');
    useAppStore.getState().toggleSubtitleLanguage('en');

    await useAppStore.getState().addAndDownloadImmediately();

    expect(api.downloads.start).toHaveBeenCalledOnce();
    const call = api.downloads.start.mock.calls[0][0];
    expect(call.formatId).toBeUndefined();
    expect(call.subtitleLanguages).toEqual(['en']);
  });
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

  it('advance() from formats step goes to subtitles', async () => {
    window.appApi = buildMockApi() as never;
    await useAppStore.getState().initialize();

    useAppStore.setState({ wizardStep: 'formats' });
    useAppStore.getState().advance();

    expect(useAppStore.getState().wizardStep).toBe('subtitles');
  });

  it('advance() from subtitles step goes to folder', () => {
    useAppStore.setState({ wizardStep: 'subtitles' });
    useAppStore.getState().advance();
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

  it('wizardSubtitleMode defaults to sidecar and wizardSubtitleFormat to srt', () => {
    expect(useAppStore.getState().wizardSubtitleMode).toBe('sidecar');
    expect(useAppStore.getState().wizardSubtitleFormat).toBe('srt');
  });

  it('setSubtitleMode updates wizardSubtitleMode', () => {
    useAppStore.getState().setSubtitleMode('embed');
    expect(useAppStore.getState().wizardSubtitleMode).toBe('embed');
  });

  it('setSubtitleFormat updates wizardSubtitleFormat', () => {
    useAppStore.getState().setSubtitleFormat('vtt');
    expect(useAppStore.getState().wizardSubtitleFormat).toBe('vtt');
  });

  it('buildQueueItem includes subtitleMode and subtitleFormat', async () => {
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
      wizardSubtitleMode: 'subfolder',
      wizardSubtitleFormat: 'vtt',
      wizardStep: 'confirm'
    });

    await useAppStore.getState().addToQueue();

    const item = useAppStore.getState().queue[0];
    expect(item.subtitleMode).toBe('subfolder');
    expect(item.subtitleFormat).toBe('vtt');
  });

  it('startItemDownload forwards subtitleMode and subtitleFormat to downloads.start', async () => {
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
      wizardSubtitleMode: 'embed',
      wizardSubtitleFormat: 'ass',
      wizardStep: 'confirm'
    });

    await useAppStore.getState().addAndDownloadImmediately();

    const startCall = vi.mocked(window.appApi.downloads.start).mock.calls[0][0];
    expect(startCall.subtitleMode).toBe('embed');
    expect(startCall.subtitleFormat).toBe('ass');
  });

  it('persistFormatPrefs saves lastSubtitleMode and lastSubtitleFormat', async () => {
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
      wizardSubtitleLanguages: ['en'],
      wizardSubtitleMode: 'subfolder',
      wizardSubtitleFormat: 'vtt',
      wizardStep: 'confirm'
    });

    await useAppStore.getState().addToQueue();

    const updateCalls = updateMock.mock.calls;
    const subtitleCall = updateCalls.find((args: unknown[]) => {
      const patch = args[0] as Record<string, unknown>;
      return 'lastSubtitleLanguages' in patch;
    });
    expect(subtitleCall).toBeDefined();
    expect(subtitleCall![0]).toMatchObject({
      lastSubtitleMode: 'subfolder',
      lastSubtitleFormat: 'vtt'
    });
  });

  it('submitUrl restores lastSubtitleMode and lastSubtitleFormat from settings', async () => {
    window.appApi = buildMockApi({ lastSubtitleMode: 'embed', lastSubtitleFormat: 'ass' }) as never;
    await useAppStore.getState().initialize();

    useAppStore.getState().setWizardUrl(YOUTUBE_URL);
    await useAppStore.getState().submitUrl();

    expect(useAppStore.getState().wizardSubtitleMode).toBe('embed');
    expect(useAppStore.getState().wizardSubtitleFormat).toBe('ass');
  });

  it('reset() clears subtitle state and resets mode/format to defaults', () => {
    useAppStore.setState({
      wizardSubtitleLanguages: ['en'],
      wizardSubtitles: { en: [{ ext: 'vtt' }] },
      wizardAutomaticCaptions: { de: [{ ext: 'vtt' }] },
      wizardSubtitleMode: 'embed',
      wizardSubtitleFormat: 'vtt'
    });

    useAppStore.getState().reset();

    const state = useAppStore.getState();
    expect(state.wizardSubtitleLanguages).toEqual([]);
    expect(state.wizardSubtitles).toEqual({});
    expect(state.wizardAutomaticCaptions).toEqual({});
    expect(state.wizardSubtitleMode).toBe('sidecar');
    expect(state.wizardSubtitleFormat).toBe('srt');
  });
});

describe('StepSubtitles — save mode UI', () => {
  function renderStep(subtitleMode = 'sidecar') {
    useAppStore.setState({
      wizardStep: 'subtitles',
      wizardSubtitles: { en: [{ ext: 'vtt', name: 'English' }] },
      wizardAutomaticCaptions: {},
      wizardSubtitleLanguages: [],
      wizardSubtitleMode: subtitleMode as never,
      wizardSubtitleFormat: 'srt',
    });
    return render(<StepSubtitles />);
  }

  it('renders save-mode radio options', () => {
    renderStep();
    expect(screen.getByText('Next to video')).toBeInTheDocument();
    expect(screen.getByText('Embed into video')).toBeInTheDocument();
    expect(screen.getByText('subtitles/ subfolder')).toBeInTheDocument();
  });

  it('shows format toggle buttons when mode is sidecar', () => {
    renderStep('sidecar');
    expect(screen.getByRole('button', { name: 'SRT' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'VTT' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ASS' })).toBeInTheDocument();
  });

  it('hides format toggle buttons when mode is embed', () => {
    renderStep('embed');
    expect(screen.queryByRole('button', { name: 'SRT' })).not.toBeInTheDocument();
  });

  it('shows the embed-note hint only when mode is embed', () => {
    const { rerender } = renderStep('sidecar');
    expect(screen.queryByTestId('subtitle-embed-note')).not.toBeInTheDocument();

    useAppStore.setState({ wizardSubtitleMode: 'embed' });
    rerender(<StepSubtitles />);
    const note = screen.getByTestId('subtitle-embed-note');
    expect(note).toBeInTheDocument();
    expect(note.textContent).toMatch(/\.mkv/);
  });

  it('clicking embed mode calls setSubtitleMode', () => {
    const setSubtitleMode = vi.spyOn(useAppStore.getState(), 'setSubtitleMode');
    renderStep('sidecar');
    fireEvent.click(screen.getByText('Embed into video'));
    expect(setSubtitleMode).toHaveBeenCalledWith('embed');
  });

  it('shows the auto-caption ASS-fallback note only when an auto language is selected and format is ASS', () => {
    useAppStore.setState({
      wizardStep: 'subtitles',
      wizardSubtitles: {},
      wizardAutomaticCaptions: { en: [{ ext: 'vtt' }] },
      wizardSubtitleLanguages: ['en'],
      wizardSubtitleMode: 'sidecar',
      wizardSubtitleFormat: 'ass'
    });
    const { rerender } = render(<StepSubtitles />);
    expect(screen.getByTestId('subtitle-auto-ass-note')).toBeInTheDocument();

    // Switch format away from ASS — note should disappear
    useAppStore.setState({ wizardSubtitleFormat: 'srt' });
    rerender(<StepSubtitles />);
    expect(screen.queryByTestId('subtitle-auto-ass-note')).not.toBeInTheDocument();

    // ASS again, but only manual sub selected — also no note
    useAppStore.setState({
      wizardSubtitleFormat: 'ass',
      wizardSubtitles: { en: [{ ext: 'vtt' }] },
      wizardAutomaticCaptions: {},
      wizardSubtitleLanguages: ['en']
    });
    rerender(<StepSubtitles />);
    expect(screen.queryByTestId('subtitle-auto-ass-note')).not.toBeInTheDocument();
  });
});

describe('StepConfirm — subtitle summary', () => {
  function renderConfirm(opts: { mode: string; format: string; languages: string[] }) {
    window.appApi = buildMockApi() as never;
    useAppStore.setState({
      wizardStep: 'confirm',
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
      wizardSubtitleLanguages: opts.languages,
      wizardSubtitleMode: opts.mode as never,
      wizardSubtitleFormat: opts.format as never,
    });
    return render(<StepConfirm />);
  }

  it('shows language + format + mode for sidecar', () => {
    renderConfirm({ mode: 'sidecar', format: 'srt', languages: ['en'] });
    const cell = screen.getByTestId('confirm-subtitles');
    expect(cell.textContent).toContain('SRT');
    expect(cell.textContent).toContain('Next to video');
  });

  it('shows language + mode for embed (no format)', () => {
    renderConfirm({ mode: 'embed', format: 'srt', languages: ['en'] });
    const cell = screen.getByTestId('confirm-subtitles');
    expect(cell.textContent).toContain('Embed into video');
    expect(cell.textContent).not.toContain('SRT');
  });

  it('shows — when no languages selected', () => {
    renderConfirm({ mode: 'sidecar', format: 'srt', languages: [] });
    expect(screen.getByTestId('confirm-subtitles').textContent).toBe('—');
  });
});

describe('StepFormatSelect — subtitle-only preset disables format columns', () => {
  function renderFormats(preset: 'best-quality' | 'subtitle-only') {
    window.appApi = buildMockApi() as never;
    useAppStore.setState({
      wizardStep: 'formats',
      wizardUrl: YOUTUBE_URL,
      wizardTitle: 'Test',
      wizardThumbnail: '',
      wizardOutputDir: '/tmp',
      selectedVideoFormatId: preset === 'subtitle-only' ? '' : '22',
      selectedAudioFormatId: preset === 'subtitle-only' ? null : '140',
      activePreset: preset,
      wizardFormats: PROBE_RESULT.formats,
      wizardSubtitles: PROBE_RESULT.subtitles,
      wizardAutomaticCaptions: PROBE_RESULT.automaticCaptions,
      wizardSubtitleLanguages: [],
      wizardSubtitleMode: 'sidecar',
      wizardSubtitleFormat: 'srt',
    });
    return render(<StepFormatSelect />);
  }

  it('marks every video and audio radio as aria-disabled when subtitle-only preset is active', () => {
    renderFormats('subtitle-only');
    const radios = screen.getAllByRole('radio');
    expect(radios.length).toBeGreaterThan(0);
    for (const r of radios) {
      expect(r.getAttribute('aria-disabled')).toBe('true');
    }
  });

  it('does not disable radios for non-subtitle-only presets', () => {
    renderFormats('best-quality');
    const radios = screen.getAllByRole('radio');
    const disabledCount = radios.filter((r) => r.getAttribute('aria-disabled') === 'true').length;
    // Only the "No audio" radio is disabled when audio-only video is the choice;
    // for best-quality (with a video selected) nothing should be disabled.
    expect(disabledCount).toBe(0);
  });
});

describe('StepConfirm — subtitle-only safeguards', () => {
  function renderConfirmSubtitleOnly(languages: string[], skipped = false) {
    window.appApi = buildMockApi() as never;
    useAppStore.setState({
      wizardStep: 'confirm',
      wizardUrl: YOUTUBE_URL,
      wizardTitle: 'Test',
      wizardThumbnail: '',
      wizardOutputDir: '/tmp',
      selectedVideoFormatId: '',
      selectedAudioFormatId: null,
      activePreset: 'subtitle-only',
      wizardFormats: PROBE_RESULT.formats,
      wizardSubtitles: PROBE_RESULT.subtitles,
      wizardAutomaticCaptions: PROBE_RESULT.automaticCaptions,
      wizardSubtitleLanguages: languages,
      wizardSubtitleSkipped: skipped,
      wizardSubtitleMode: 'sidecar',
      wizardSubtitleFormat: 'srt',
    });
    return render(<StepConfirm />);
  }

  it('disables download buttons when nothing is selected (no media + no subs)', () => {
    renderConfirmSubtitleOnly([]);
    const download = screen.getByTestId('btn-download-now') as HTMLButtonElement;
    const queue = screen.getByTestId('btn-add-to-queue') as HTMLButtonElement;
    expect(download.disabled).toBe(true);
    expect(queue.disabled).toBe(true);
  });

  it('enables download buttons when subtitle-only with at least one language', () => {
    renderConfirmSubtitleOnly(['en']);
    const download = screen.getByTestId('btn-download-now') as HTMLButtonElement;
    const queue = screen.getByTestId('btn-add-to-queue') as HTMLButtonElement;
    expect(download.disabled).toBe(false);
    expect(queue.disabled).toBe(false);
  });

  it('disables download buttons when subtitle-only with languages but subtitles were skipped', () => {
    // skipSubtitles() sets wizardSubtitleSkipped=true without clearing wizardSubtitleLanguages.
    // The effective languages are [] so there is nothing to download.
    renderConfirmSubtitleOnly(['en'], true);
    const download = screen.getByTestId('btn-download-now') as HTMLButtonElement;
    const queue = screen.getByTestId('btn-add-to-queue') as HTMLButtonElement;
    expect(download.disabled).toBe(true);
    expect(queue.disabled).toBe(true);
  });

  it('shows — for subtitles row when languages were skipped', () => {
    renderConfirmSubtitleOnly(['en'], true);
    expect(screen.getByTestId('confirm-subtitles').textContent).toBe('—');
  });
});
