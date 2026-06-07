// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StepUrlInput } from '@renderer/components/wizard/StepUrlInput.js';
import { MixedUrlPromptDialog } from '@renderer/components/wizard/MixedUrlPromptDialog.js';
import { TooltipProvider } from '@renderer/components/ui/tooltip.js';
import { useAppStore } from '@renderer/store/useAppStore.js';
import { buildMockAppApi } from '../shared/mockAppApi.js';
import { defaultAppSettings } from '@shared/constants.js';
import type { AppApi, SettingsPatch } from '@shared/api.js';
import type { AppSettings } from '@shared/types.js';
import { ok } from '../shared/fixtures.js';

const SINGLE_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

let mockApi: AppApi;

function buildSettings(common: Partial<AppSettings['common']> = {}): AppSettings {
  const base = defaultAppSettings('/tmp');
  return { ...base, common: { ...base.common, rememberLastOutputDir: false, clipboardWatchEnabled: false, cookiesMode: 'off', cookiesPath: '', ...common } };
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
  window.history.replaceState(null, '', '/');
  mockApi = buildMockAppApi();
  mockApi.settings.update = vi.fn(async (input: SettingsPatch) => {
    const current = useAppStore.getState().settings ?? buildSettings();
    const next: AppSettings = {
      common: { ...current.common, ...(input.common ?? {}) },
      single: { ...current.single, ...(input.single ?? {}) },
      playlist: { ...current.playlist, ...(input.playlist ?? {}) },
      profiles: { ...current.profiles, ...(input.profiles ?? {}) }
    };
    return ok(next);
  });
  window.appApi = mockApi;
  window.platform = 'linux';
  resetStore(buildSettings());
});

function openSettingsTab(): void {
  fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
}

function enterUrlAndStartInteractiveDownload(): void {
  fireEvent.change(screen.getByTestId('profiles-main-input'), { target: { value: SINGLE_URL } });
  fireEvent.click(screen.getByTestId('profiles-interactive-download'));
}

describe('advanced network settings', () => {
  it('renders network pacing settings without playlist scope controls', async () => {
    render(<StepUrlInput />);
    openSettingsTab();

    expect(screen.getByTestId('network-pacing-section')).toBeInTheDocument();
    expect(screen.queryByTestId('playlist-probe-limit-section')).not.toBeInTheDocument();
    expect(mockApi.settings.update).not.toHaveBeenCalled();
  });

  it('saves the single-filename id suffix switch', async () => {
    render(<StepUrlInput />);
    openSettingsTab();

    fireEvent.click(screen.getByTestId('single-filename-id-toggle'));

    await waitFor(() => {
      expect(mockApi.settings.update).toHaveBeenCalledWith({ common: { includeIdInSingleFilenames: false } });
    });
  });

  it('mixed URL dialog shows the current playlist cap and changes it inline', async () => {
    resetStore(buildSettings({ playlistProbeLimit: 250 }));
    useAppStore.setState({ mixedUrlPromptOpen: true, mixedUrlPending: SINGLE_URL });

    render(
      <TooltipProvider>
        <MixedUrlPromptDialog />
      </TooltipProvider>
    );

    expect(screen.getByTestId('mixed-playlist-cap')).toHaveTextContent('250');
    expect(screen.queryByTestId('mixed-open-advanced')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('mixed-playlist-probe-limit-trigger'));
    fireEvent.click(await screen.findByTestId('mixed-playlist-probe-limit-option-500'));

    await waitFor(() => {
      expect(mockApi.settings.update).toHaveBeenCalledWith({ common: { playlistProbeLimit: 500 } });
    });
    expect(useAppStore.getState().mixedUrlPromptOpen).toBe(true);
    expect(useAppStore.getState().advancedAutoOpen).toBe(false);
  });

  it('keeps the mixed URL dialog close button working after closing the custom limit dialog', async () => {
    resetStore(buildSettings({ playlistProbeLimit: 250 }));
    useAppStore.setState({ mixedUrlPromptOpen: true, mixedUrlPending: SINGLE_URL });

    render(
      <TooltipProvider>
        <MixedUrlPromptDialog />
      </TooltipProvider>
    );

    fireEvent.click(screen.getByTestId('mixed-playlist-probe-limit-trigger'));
    fireEvent.click(await screen.findByTestId('mixed-playlist-probe-limit-option-custom'));

    const customDialog = await screen.findByTestId('mixed-playlist-probe-limit-custom-dialog');
    fireEvent.click(within(customDialog).getByRole('button', { name: 'Close' }));

    await waitFor(() => {
      expect(screen.queryByTestId('mixed-playlist-probe-limit-custom-dialog')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    await waitFor(() => {
      expect(useAppStore.getState().mixedUrlPromptOpen).toBe(false);
      expect(useAppStore.getState().mixedUrlPending).toBeNull();
    });
  });
});

describe('incomplete cookies config guard', () => {
  it('keeps cookie export help links with the cookies source controls', () => {
    render(<StepUrlInput />);
    openSettingsTab();

    const cookiesSource = screen.getByTestId('cookies-source');
    expect(within(cookiesSource).getByTestId('cookies-help-link')).toBeInTheDocument();
    expect(within(cookiesSource).getByTestId('cookies-firefox-link')).toBeInTheDocument();
    expect(within(cookiesSource).getByTestId('cookies-chrome-link')).toBeInTheDocument();
  });

  it('blocks fetch and opens a modal when file mode has no path', async () => {
    resetStore(buildSettings({ cookiesMode: 'file', cookiesPath: '   ' }));
    render(<StepUrlInput />);

    enterUrlAndStartInteractiveDownload();

    expect(await screen.findByTestId('cookies-config-dialog')).toBeInTheDocument();
    expect(mockApi.downloads.probe).not.toHaveBeenCalled();
    expect(useAppStore.getState().wizardStep).toBe('url');
    expect(useAppStore.getState().cookiesConfigDialogIssue).toBe('file-missing-path');
  });

  it('blocks fetch and opens a modal when browser mode has no browser', async () => {
    resetStore(buildSettings({ cookiesMode: 'browser' }));
    render(<StepUrlInput />);

    enterUrlAndStartInteractiveDownload();

    expect(await screen.findByTestId('cookies-config-dialog')).toBeInTheDocument();
    expect(mockApi.downloads.probe).not.toHaveBeenCalled();
    expect(useAppStore.getState().cookiesConfigDialogIssue).toBe('browser-missing-selection');
  });

  it('opens the Advanced cookies section from the modal primary action', async () => {
    resetStore(buildSettings({ cookiesMode: 'file', cookiesPath: '' }));
    render(<StepUrlInput />);

    enterUrlAndStartInteractiveDownload();
    expect(screen.queryByTestId('profiles-settings-tab')).not.toBeInTheDocument();

    fireEvent.click(await screen.findByTestId('cookies-config-dialog-open-settings'));

    await waitFor(() => {
      expect(screen.getByTestId('profiles-settings-tab')).toBeInTheDocument();
    });
    expect(screen.getByTestId('cookies-source')).toBeInTheDocument();
    expect(screen.queryByTestId('cookies-config-dialog')).not.toBeInTheDocument();
  });

  it('clears the dialog issue when dismissed via Cancel and re-blocks submit until config is fixed', async () => {
    resetStore(buildSettings({ cookiesMode: 'file', cookiesPath: '' }));
    render(<StepUrlInput />);

    enterUrlAndStartInteractiveDownload();

    expect(await screen.findByTestId('cookies-config-dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('cookies-config-dialog-cancel'));

    await waitFor(() => {
      expect(screen.queryByTestId('cookies-config-dialog')).not.toBeInTheDocument();
    });
    expect(useAppStore.getState().cookiesConfigDialogIssue).toBeNull();
    expect(mockApi.downloads.probe).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('profiles-interactive-download'));

    expect(await screen.findByTestId('cookies-config-dialog')).toBeInTheDocument();
    expect(useAppStore.getState().cookiesConfigDialogIssue).toBe('file-missing-path');
    expect(useAppStore.getState().wizardStep).toBe('url');
    expect(mockApi.downloads.probe).not.toHaveBeenCalled();
  });

  it('clears the dialog issue when dismissed via ESC and keeps submit blocked', async () => {
    resetStore(buildSettings({ cookiesMode: 'browser' }));
    render(<StepUrlInput />);

    enterUrlAndStartInteractiveDownload();

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
