// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { useAppStore } from '@renderer/store/useAppStore';
import type { GetFormatsOutput, StatusEvent } from '@shared/types';
import { ok } from '../shared/fixtures';
import { DEFAULTS } from '@shared/constants';

const YOUTUBE_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

const PROBE_RESULT: GetFormatsOutput = {
  formats: [
    { formatId: '22', label: '720p | mp4 | 30fps', ext: 'mp4', resolution: '720p', fps: 30, filesize: 400_000_000, isVideoOnly: false, isAudioOnly: false },
    { formatId: '140', label: 'opus 128kbps', ext: 'opus', resolution: 'audio only', abr: 128, isVideoOnly: false, isAudioOnly: true }
  ],
  title: 'Test Video',
  thumbnail: '',
  duration: 120,
  subtitles: {},
  automaticCaptions: {}
};

function buildMockApi(settingsOverrides: Record<string, unknown> = {}) {
  return {
    app: {
      warmUp: vi.fn().mockResolvedValue(ok({ completed: true, failures: [] })),
      setLanguage: vi.fn().mockResolvedValue(undefined)
    },
    downloads: {
      start: vi.fn().mockResolvedValue(ok({ job: { id: 'job-1', url: YOUTUBE_URL, outputDir: '/tmp', status: 'running', createdAt: '', updatedAt: '' } })),
      cancel: vi.fn().mockResolvedValue(ok({ cancelled: true })),
      getFormats: vi.fn().mockResolvedValue(ok(PROBE_RESULT)),
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
      onClipboardUrl: vi.fn().mockReturnValue(() => undefined),
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
    wizardSponsorBlockMode: DEFAULTS.sponsorBlockMode,
    wizardSponsorBlockCategories: [...DEFAULTS.sponsorBlockCategories],
    queue: [],
    drawerOpen: false,
  });
}

beforeEach(() => {
  resetStore();
  vi.clearAllMocks();
});

describe('SponsorBlock wizard slice — state', () => {
  it('has default mode off', () => {
    expect(useAppStore.getState().wizardSponsorBlockMode).toBe('off');
  });

  it('has default categories [sponsor, selfpromo]', () => {
    expect(useAppStore.getState().wizardSponsorBlockCategories).toEqual(['sponsor', 'selfpromo']);
  });

  it('setSponsorBlockMode changes the mode', () => {
    useAppStore.getState().setSponsorBlockMode('mark');
    expect(useAppStore.getState().wizardSponsorBlockMode).toBe('mark');

    useAppStore.getState().setSponsorBlockMode('remove');
    expect(useAppStore.getState().wizardSponsorBlockMode).toBe('remove');

    useAppStore.getState().setSponsorBlockMode('off');
    expect(useAppStore.getState().wizardSponsorBlockMode).toBe('off');
  });

  it('toggleSponsorBlockCategory adds a category when not present', () => {
    useAppStore.setState({ wizardSponsorBlockCategories: ['sponsor'] });
    useAppStore.getState().toggleSponsorBlockCategory('intro');
    expect(useAppStore.getState().wizardSponsorBlockCategories).toContain('intro');
    expect(useAppStore.getState().wizardSponsorBlockCategories).toContain('sponsor');
  });

  it('toggleSponsorBlockCategory removes a category when already present', () => {
    useAppStore.setState({ wizardSponsorBlockCategories: ['sponsor', 'intro'] });
    useAppStore.getState().toggleSponsorBlockCategory('sponsor');
    expect(useAppStore.getState().wizardSponsorBlockCategories).not.toContain('sponsor');
    expect(useAppStore.getState().wizardSponsorBlockCategories).toContain('intro');
  });

  it('reset() restores SponsorBlock to defaults', () => {
    useAppStore.setState({ wizardSponsorBlockMode: 'remove', wizardSponsorBlockCategories: ['filler'] });
    useAppStore.getState().reset();
    expect(useAppStore.getState().wizardSponsorBlockMode).toBe('off');
    expect(useAppStore.getState().wizardSponsorBlockCategories).toEqual(['sponsor', 'selfpromo']);
  });
});

describe('SponsorBlock wizard slice — settings restoration', () => {
  it('submitUrl restores lastSponsorBlockMode from settings', async () => {
    window.appApi = buildMockApi({ lastSponsorBlockMode: 'mark', lastSponsorBlockCategories: ['sponsor', 'intro'] }) as never;
    await useAppStore.getState().initialize();
    useAppStore.getState().setWizardUrl(YOUTUBE_URL);
    await useAppStore.getState().submitUrl();

    expect(useAppStore.getState().wizardSponsorBlockMode).toBe('mark');
  });

  it('submitUrl restores lastSponsorBlockCategories from settings', async () => {
    window.appApi = buildMockApi({ lastSponsorBlockMode: 'remove', lastSponsorBlockCategories: ['outro', 'filler'] }) as never;
    await useAppStore.getState().initialize();
    useAppStore.getState().setWizardUrl(YOUTUBE_URL);
    await useAppStore.getState().submitUrl();

    expect(useAppStore.getState().wizardSponsorBlockCategories).toEqual(['outro', 'filler']);
  });
});

describe('SponsorBlock wizard slice — queue serialization', () => {
  it('buildQueueItem includes sponsorBlockMode and sponsorBlockCategories', async () => {
    window.appApi = buildMockApi() as never;
    await useAppStore.getState().initialize();
    useAppStore.getState().setWizardUrl(YOUTUBE_URL);
    await useAppStore.getState().submitUrl();
    useAppStore.getState().setSponsorBlockMode('remove');
    useAppStore.setState({ wizardSponsorBlockCategories: ['sponsor', 'outro'] });
    useAppStore.setState({ wizardOutputDir: '/tmp' });

    await act(async () => {
      await useAppStore.getState().addToQueue();
    });

    const queue = useAppStore.getState().queue;
    expect(queue).toHaveLength(1);
    expect(queue[0].sponsorBlockMode).toBe('remove');
    expect(queue[0].sponsorBlockCategories).toEqual(['sponsor', 'outro']);
  });

  it('addToQueue persists lastSponsorBlockMode and lastSponsorBlockCategories to settings', async () => {
    const api = buildMockApi();
    window.appApi = api as never;
    await useAppStore.getState().initialize();
    useAppStore.getState().setWizardUrl(YOUTUBE_URL);
    await useAppStore.getState().submitUrl();
    useAppStore.getState().setSponsorBlockMode('mark');
    useAppStore.setState({ wizardSponsorBlockCategories: ['intro'], wizardOutputDir: '/tmp' });

    await act(async () => {
      await useAppStore.getState().addToQueue();
    });

    const updateCall = api.settings.update.mock.calls.at(-1)?.[0];
    expect(updateCall).toMatchObject({ lastSponsorBlockMode: 'mark', lastSponsorBlockCategories: ['intro'] });
  });
});

describe('SponsorBlock wizard slice — download invocation', () => {
  it('startItemDownload passes sponsorBlockMode and sponsorBlockCategories to downloads.start', async () => {
    const api = buildMockApi();
    window.appApi = api as never;
    await useAppStore.getState().initialize();
    useAppStore.getState().setWizardUrl(YOUTUBE_URL);
    await useAppStore.getState().submitUrl();
    useAppStore.getState().setSponsorBlockMode('remove');
    useAppStore.setState({ wizardSponsorBlockCategories: ['sponsor', 'selfpromo'], wizardOutputDir: '/tmp' });

    await act(async () => {
      await useAppStore.getState().addToQueue();
    });

    const startCall = api.downloads.start.mock.calls[0]?.[0];
    expect(startCall).toMatchObject({
      sponsorBlockMode: 'remove',
      sponsorBlockCategories: ['sponsor', 'selfpromo'],
    });
  });

  it('startItemDownload omits sponsorBlock fields when mode is off', async () => {
    const api = buildMockApi();
    window.appApi = api as never;
    await useAppStore.getState().initialize();
    useAppStore.getState().setWizardUrl(YOUTUBE_URL);
    await useAppStore.getState().submitUrl();
    // mode stays 'off' (default)
    useAppStore.setState({ wizardOutputDir: '/tmp' });

    await act(async () => {
      await useAppStore.getState().addToQueue();
    });

    const startCall = api.downloads.start.mock.calls[0]?.[0];
    expect(startCall.sponsorBlockMode).toBeUndefined();
    expect(startCall.sponsorBlockCategories).toBeUndefined();
  });
});

describe('SponsorBlock wizard slice — step navigation', () => {
  it('advance from subtitles goes to sponsorblock step for video presets', async () => {
    window.appApi = buildMockApi() as never;
    await useAppStore.getState().initialize();
    useAppStore.getState().setWizardUrl(YOUTUBE_URL);
    await useAppStore.getState().submitUrl();
    // formats step → advance to subtitles
    useAppStore.setState({ wizardStep: 'subtitles' });
    useAppStore.getState().advance();
    expect(useAppStore.getState().wizardStep).toBe('sponsorblock');
  });

  it('advance from subtitles skips sponsorblock step when preset is audio-only', async () => {
    window.appApi = buildMockApi() as never;
    await useAppStore.getState().initialize();
    useAppStore.getState().setWizardUrl(YOUTUBE_URL);
    await useAppStore.getState().submitUrl();
    useAppStore.getState().setPreset('audio-only');
    useAppStore.setState({ wizardStep: 'subtitles' });
    useAppStore.getState().advance();
    // audio-only skips sponsorblock but shows output (m4a supports embeds)
    expect(useAppStore.getState().wizardStep).toBe('output');
  });

  it('advance from subtitles skips sponsorblock AND output steps when preset is subtitle-only', async () => {
    window.appApi = buildMockApi() as never;
    await useAppStore.getState().initialize();
    useAppStore.getState().setWizardUrl(YOUTUBE_URL);
    await useAppStore.getState().submitUrl();
    useAppStore.getState().setPreset('subtitle-only');
    useAppStore.setState({ wizardStep: 'subtitles' });
    useAppStore.getState().advance();
    // subtitle-only skips both sponsorblock and output
    expect(useAppStore.getState().wizardStep).toBe('folder');
  });

  it('back from folder goes to output step for video presets', async () => {
    window.appApi = buildMockApi() as never;
    await useAppStore.getState().initialize();
    useAppStore.getState().setWizardUrl(YOUTUBE_URL);
    await useAppStore.getState().submitUrl();
    useAppStore.setState({ wizardStep: 'folder' });
    useAppStore.getState().back();
    // output is now the step before folder
    expect(useAppStore.getState().wizardStep).toBe('output');
  });

  it('back from folder goes to output step when preset is audio-only (output is shown for audio)', async () => {
    window.appApi = buildMockApi() as never;
    await useAppStore.getState().initialize();
    useAppStore.getState().setWizardUrl(YOUTUBE_URL);
    await useAppStore.getState().submitUrl();
    useAppStore.getState().setPreset('audio-only');
    useAppStore.setState({ wizardStep: 'folder' });
    useAppStore.getState().back();
    // audio-only skips sponsorblock but shows output
    expect(useAppStore.getState().wizardStep).toBe('output');
  });
});

describe('SponsorBlock — StepSponsorBlock UI', () => {
  // Dynamically import to avoid top-level render issues
  let StepSponsorBlock: React.FC;

  beforeEach(async () => {
    const mod = await import('@renderer/components/StepSponsorBlock');
    StepSponsorBlock = mod.StepSponsorBlock;
  });

  it('renders mode options: off, mark, remove', async () => {
    window.appApi = buildMockApi() as never;
    await useAppStore.getState().initialize();
    useAppStore.setState({ wizardStep: 'sponsorblock' });

    render(<StepSponsorBlock />);
    // The component should render mode radio options
    expect(screen.getByTestId('step-sponsorblock')).toBeTruthy();
  });

  it('shows category checkboxes when mode is mark', async () => {
    window.appApi = buildMockApi() as never;
    await useAppStore.getState().initialize();
    useAppStore.setState({ wizardStep: 'sponsorblock', wizardSponsorBlockMode: 'mark' });

    render(<StepSponsorBlock />);
    expect(screen.getByTestId('sb-categories')).toBeTruthy();
  });

  it('hides category checkboxes when mode is off', async () => {
    window.appApi = buildMockApi() as never;
    await useAppStore.getState().initialize();
    useAppStore.setState({ wizardStep: 'sponsorblock', wizardSponsorBlockMode: 'off' });

    render(<StepSponsorBlock />);
    expect(screen.queryByTestId('sb-categories')).toBeNull();
  });

  it('clicking a category toggle calls toggleSponsorBlockCategory', async () => {
    window.appApi = buildMockApi() as never;
    await useAppStore.getState().initialize();
    useAppStore.setState({
      wizardStep: 'sponsorblock',
      wizardSponsorBlockMode: 'mark',
      wizardSponsorBlockCategories: ['sponsor'],
    });

    render(<StepSponsorBlock />);
    expect(useAppStore.getState().wizardSponsorBlockCategories).not.toContain('intro');

    fireEvent.click(screen.getByTestId('sb-cat-intro'));
    expect(useAppStore.getState().wizardSponsorBlockCategories).toContain('intro');
  });
});
