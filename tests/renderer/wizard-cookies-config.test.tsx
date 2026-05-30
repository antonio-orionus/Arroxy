// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StepUrlInput } from '@renderer/components/wizard/StepUrlInput.js';
import { MixedUrlPromptDialog } from '@renderer/components/wizard/MixedUrlPromptDialog.js';
import { TooltipProvider } from '@renderer/components/ui/tooltip.js';
import { useAppStore } from '@renderer/store/useAppStore.js';
import { buildMockAppApi } from '../shared/mockAppApi.js';
import type { AppApi, SettingsPatch } from '@shared/api.js';
import type { AppSettings } from '@shared/types.js';
import { ok } from '../shared/fixtures.js';

const SINGLE_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

let mockApi: AppApi;

function buildSettings(common: Partial<AppSettings['common']> = {}): AppSettings {
  return {
    common: {
      defaultOutputDir: '/tmp',
      rememberLastOutputDir: false,
      clipboardWatchEnabled: false,
      cookiesMode: 'off',
      cookiesPath: '',
      ...common
    },
    single: {},
    playlist: {}
  };
}

function resetStore(settings: AppSettings): void {
  useAppStore.setState({
    initialized: true,
    initializing: false,
    settings,
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
    advancedAutoOpen: false,
    advancedAutoTarget: 'cookies',
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
    wizardSubfolderEnabled: false,
    wizardSubfolderName: '',
    wizardSponsorBlockMode: 'off',
    wizardSponsorBlockCategories: ['sponsor', 'selfpromo'],
    wizardEmbedChapters: true,
    wizardEmbedMetadata: true,
    wizardEmbedThumbnail: false,
    wizardWriteDescription: false,
    wizardWriteThumbnail: false,
    playlistItems: [],
    selectedPlaylistItemIds: [],
    playlistTitle: '',
    playlistId: '',
    playlistIsMultiVideo: false,
    cookiesConfigDialogIssue: null,
    playlistSelection: null,
    queue: [],
    drawerOpen: false
  });
}

beforeEach(() => {
  mockApi = buildMockAppApi();
  mockApi.settings.update = vi.fn(async (input: SettingsPatch) => {
    const current = useAppStore.getState().settings ?? buildSettings();
    const next: AppSettings = {
      common: { ...current.common, ...(input.common ?? {}) },
      single: { ...current.single, ...(input.single ?? {}) },
      playlist: { ...current.playlist, ...(input.playlist ?? {}) }
    };
    return ok(next);
  });
  window.appApi = mockApi;
  window.platform = 'linux';
  resetStore(buildSettings());
});

describe('advanced network settings', () => {
  it('renders playlist probe limit controls and saves a preset', async () => {
    render(<StepUrlInput />);

    const advanced = screen.getByTestId('advanced-section');
    if (advanced instanceof HTMLDetailsElement) advanced.open = true;

    expect(screen.getByTestId('network-pacing-section')).toBeInTheDocument();
    const playlistSection = screen.getByTestId('playlist-probe-limit-section');
    fireEvent.click(within(playlistSection).getByText('250'));

    await waitFor(() => {
      expect(mockApi.settings.update).toHaveBeenCalledWith({ common: { playlistProbeLimit: 250 } });
    });
  });

  it('saves the single-filename id suffix switch', async () => {
    render(<StepUrlInput />);

    const advanced = screen.getByTestId('advanced-section');
    if (advanced instanceof HTMLDetailsElement) advanced.open = true;

    fireEvent.click(screen.getByTestId('single-filename-id-toggle'));

    await waitFor(() => {
      expect(mockApi.settings.update).toHaveBeenCalledWith({ common: { includeIdInSingleFilenames: false } });
    });
  });

  it('mixed URL dialog shows the current playlist cap and opens Advanced at network settings', async () => {
    resetStore(buildSettings({ playlistProbeLimit: 250 }));
    useAppStore.setState({ mixedUrlPromptOpen: true, mixedUrlPending: SINGLE_URL });

    render(
      <TooltipProvider>
        <MixedUrlPromptDialog />
      </TooltipProvider>
    );

    expect(screen.getByTestId('mixed-playlist-cap')).toHaveTextContent('250');
    fireEvent.click(screen.getByTestId('mixed-open-advanced'));

    expect(useAppStore.getState().mixedUrlPromptOpen).toBe(false);
    expect(useAppStore.getState().advancedAutoOpen).toBe(true);
    expect(useAppStore.getState().advancedAutoTarget).toBe('network');
  });
});

describe('incomplete cookies config guard', () => {
  it('blocks fetch and opens a modal when file mode has no path', async () => {
    resetStore(buildSettings({ cookiesMode: 'file', cookiesPath: '   ' }));
    render(<StepUrlInput />);

    fireEvent.change(screen.getByTestId('url-input'), { target: { value: SINGLE_URL } });
    fireEvent.click(screen.getByTestId('btn-find-formats'));

    expect(await screen.findByTestId('cookies-config-dialog')).toBeInTheDocument();
    expect(mockApi.downloads.probe).not.toHaveBeenCalled();
    expect(useAppStore.getState().wizardStep).toBe('url');
    expect(useAppStore.getState().cookiesConfigDialogIssue).toBe('file-missing-path');
  });

  it('blocks fetch and opens a modal when browser mode has no browser', async () => {
    resetStore(buildSettings({ cookiesMode: 'browser' }));
    render(<StepUrlInput />);

    fireEvent.change(screen.getByTestId('url-input'), { target: { value: SINGLE_URL } });
    fireEvent.click(screen.getByTestId('btn-find-formats'));

    expect(await screen.findByTestId('cookies-config-dialog')).toBeInTheDocument();
    expect(mockApi.downloads.probe).not.toHaveBeenCalled();
    expect(useAppStore.getState().cookiesConfigDialogIssue).toBe('browser-missing-selection');
  });

  it('opens the Advanced cookies section from the modal primary action', async () => {
    resetStore(buildSettings({ cookiesMode: 'file', cookiesPath: '' }));
    render(<StepUrlInput />);

    fireEvent.change(screen.getByTestId('url-input'), { target: { value: SINGLE_URL } });
    fireEvent.click(screen.getByTestId('btn-find-formats'));

    const advanced = screen.getByTestId('advanced-section');
    if (!(advanced instanceof HTMLDetailsElement)) {
      throw new Error('advanced section should render as <details>');
    }
    expect(advanced.open).toBe(false);

    fireEvent.click(await screen.findByTestId('cookies-config-dialog-open-settings'));

    await waitFor(() => {
      expect(advanced.open).toBe(true);
    });
    expect(screen.queryByTestId('cookies-config-dialog')).not.toBeInTheDocument();
  });

  it('clears the dialog issue when dismissed via Cancel and re-blocks submit until config is fixed', async () => {
    resetStore(buildSettings({ cookiesMode: 'file', cookiesPath: '' }));
    render(<StepUrlInput />);

    fireEvent.change(screen.getByTestId('url-input'), { target: { value: SINGLE_URL } });
    fireEvent.click(screen.getByTestId('btn-find-formats'));

    expect(await screen.findByTestId('cookies-config-dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('cookies-config-dialog-cancel'));

    await waitFor(() => {
      expect(screen.queryByTestId('cookies-config-dialog')).not.toBeInTheDocument();
    });
    expect(useAppStore.getState().cookiesConfigDialogIssue).toBeNull();
    expect(mockApi.downloads.probe).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('btn-find-formats'));

    expect(await screen.findByTestId('cookies-config-dialog')).toBeInTheDocument();
    expect(useAppStore.getState().cookiesConfigDialogIssue).toBe('file-missing-path');
    expect(useAppStore.getState().wizardStep).toBe('url');
    expect(mockApi.downloads.probe).not.toHaveBeenCalled();
  });

  it('clears the dialog issue when dismissed via ESC and keeps submit blocked', async () => {
    resetStore(buildSettings({ cookiesMode: 'browser' }));
    render(<StepUrlInput />);

    fireEvent.change(screen.getByTestId('url-input'), { target: { value: SINGLE_URL } });
    fireEvent.click(screen.getByTestId('btn-find-formats'));

    const dialog = await screen.findByTestId('cookies-config-dialog');
    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByTestId('cookies-config-dialog')).not.toBeInTheDocument();
    });
    expect(useAppStore.getState().cookiesConfigDialogIssue).toBeNull();
    expect(useAppStore.getState().wizardStep).toBe('url');
    expect(mockApi.downloads.probe).not.toHaveBeenCalled();
  });
});
