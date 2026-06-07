// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StepPlaylistItems } from '@renderer/components/wizard/StepPlaylistItems.js';
import { useAppStore } from '@renderer/store/useAppStore.js';
import { buildMockAppApi } from '../shared/mockAppApi.js';
import { ok } from '../shared/fixtures.js';
import { defaultAppSettings } from '@shared/constants.js';
import type { AppApi, SettingsPatch } from '@shared/api.js';
import type { AppSettings, PlaylistEntry, ProbeResult } from '@shared/types.js';

const PLAYLIST_URL = 'https://www.youtube.com/playlist?list=PLcap';

function entries(count: number): PlaylistEntry[] {
  return Array.from({ length: count }, (_, index) => {
    const n = index + 1;
    return {
      id: `p${n}`,
      url: `https://youtube.com/watch?v=p${n}`,
      title: `Video ${n}`,
      thumbnail: '',
      playlistIndex: n,
      videoId: `p${n}`
    };
  });
}

function settings(limit: number): AppSettings {
  const base = defaultAppSettings('/tmp');
  return { ...base, common: { ...base.common, rememberLastOutputDir: false, clipboardWatchEnabled: false, playlistProbeLimit: limit } };
}

function playlistProbe(count: number): Extract<ProbeResult, { kind: 'playlist' }> {
  return {
    kind: 'playlist',
    extractor: 'youtube:playlist',
    extractorKey: 'YoutubePlaylist',
    webpageUrl: PLAYLIST_URL,
    isAudioOnlySource: false,
    playlistTitle: 'Capped Playlist',
    playlistId: 'PLcap',
    isMultiVideo: false,
    entries: entries(count)
  };
}

function resetStore(limit: number, itemCount: number, playlistLikelyCapped = false): void {
  useAppStore.setState({
    initialized: true,
    initializing: false,
    settings: settings(limit),
    wizardStep: 'playlistItems',
    wizardMode: 'playlist',
    wizardUrl: PLAYLIST_URL,
    wizardExtractor: 'youtube:playlist',
    wizardExtractorKey: 'YoutubePlaylist',
    wizardWebpageUrl: PLAYLIST_URL,
    formatsLoading: false,
    playlistProbeLoading: false,
    wizardError: null,
    wizardErrorOrigin: null,
    playlistItems: entries(itemCount),
    selectedPlaylistItemIds: entries(itemCount).map((entry) => entry.id),
    playlistTitle: 'Capped Playlist',
    playlistId: 'PLcap',
    playlistIsMultiVideo: false,
    playlistLikelyCapped,
    playlistSelection: { kind: 'video', tier: 'best', codec: 'best' },
    syncedDownloadedIds: [],
    syncScanState: 'idle',
    queue: [],
    drawerOpen: false
  } as never);
}

function installApi(): AppApi {
  const api = buildMockAppApi();
  api.settings.update = vi.fn(async (input: SettingsPatch) => {
    const current = useAppStore.getState().settings ?? settings(50);
    return ok({
      common: { ...current.common, ...(input.common ?? {}) },
      single: { ...current.single, ...(input.single ?? {}) },
      playlist: { ...current.playlist, ...(input.playlist ?? {}) },
      profiles: { ...current.profiles, ...(input.profiles ?? {}) }
    });
  });
  vi.mocked(api.downloads.probe).mockResolvedValue(ok(playlistProbe(2)));
  window.appApi = api;
  return api;
}

beforeEach(() => {
  vi.clearAllMocks();
  window.platform = 'linux';
});

describe('playlist probe limit selector alert', () => {
  it('appears when the probe result was trimmed by the sentinel item', () => {
    installApi();
    resetStore(50, 50, true);

    render(<StepPlaylistItems />);

    expect(screen.getByTestId('playlist-probe-limit-alert')).toBeInTheDocument();
  });

  it('stays hidden when the probed playlist item count exactly matches the current probe limit without a sentinel', () => {
    installApi();
    resetStore(50, 50);

    render(<StepPlaylistItems />);

    expect(screen.queryByTestId('playlist-probe-limit-alert')).not.toBeInTheDocument();
  });

  it('stays hidden when the probed playlist item count is below the current probe limit', () => {
    installApi();
    resetStore(50, 49);

    render(<StepPlaylistItems />);

    expect(screen.queryByTestId('playlist-probe-limit-alert')).not.toBeInTheDocument();
  });

  it('saves a new limit from the playlist alert and reruns the playlist probe', async () => {
    const api = installApi();
    resetStore(50, 50, true);

    render(<StepPlaylistItems />);

    fireEvent.click(screen.getByTestId('playlist-alert-probe-limit-trigger'));
    fireEvent.click(await screen.findByTestId('playlist-alert-probe-limit-option-100'));

    await waitFor(() => {
      expect(api.settings.update).toHaveBeenCalledWith({ common: { playlistProbeLimit: 100 } });
      expect(api.downloads.probe).toHaveBeenCalledWith({ url: PLAYLIST_URL, playlistMode: 'playlist', playlistScope: { items: { kind: 'app-limit' } } });
    });
  });

  it('does not save or rerun when a custom limit is invalid', async () => {
    const api = installApi();
    resetStore(50, 50, true);

    render(<StepPlaylistItems />);

    fireEvent.click(screen.getByTestId('playlist-alert-probe-limit-trigger'));
    fireEvent.click(await screen.findByTestId('playlist-alert-probe-limit-option-custom'));
    fireEvent.change(await screen.findByTestId('playlist-alert-probe-limit-custom-input'), { target: { value: '5001' } });

    expect(screen.getByTestId('playlist-alert-probe-limit-custom-save')).toBeDisabled();
    expect(api.settings.update).not.toHaveBeenCalled();
    expect(api.downloads.probe).not.toHaveBeenCalled();
  });
});

describe('bulk playlist item metadata state', () => {
  it('shows raw URLs and metadata progress while bulk details resolve', () => {
    installApi();
    useAppStore.setState({
      initialized: true,
      initializing: false,
      settings: settings(50),
      wizardStep: 'playlistItems',
      wizardMode: 'bulk',
      wizardUrl: '',
      wizardExtractor: '',
      wizardExtractorKey: '',
      wizardWebpageUrl: '',
      formatsLoading: false,
      playlistProbeLoading: false,
      wizardError: null,
      wizardErrorOrigin: null,
      playlistItems: [
        { id: 'bulk-1', url: 'https://example.com/one', title: 'Bulk URL 1', thumbnail: '', playlistIndex: 1, videoId: null },
        { id: 'bulk-2', url: 'https://example.com/two', title: 'Bulk URL 2', thumbnail: '', playlistIndex: 2, videoId: null }
      ],
      selectedPlaylistItemIds: ['bulk-1', 'bulk-2'],
      playlistTitle: 'Bulk URLs',
      playlistId: 'bulk',
      playlistIsMultiVideo: false,
      playlistLikelyCapped: false,
      playlistSelection: { kind: 'video', tier: 'best', codec: 'best' },
      bulkMetadataStatus: 'resolving',
      bulkMetadataCompleted: 0,
      bulkMetadataTotal: 2,
      bulkMetadataById: { 'bulk-1': 'resolving', 'bulk-2': 'pending' },
      syncedDownloadedIds: [],
      syncScanState: 'idle',
      queue: [],
      drawerOpen: false
    } as never);

    render(<StepPlaylistItems />);

    expect(screen.getByTestId('bulk-metadata-status')).toHaveTextContent('0/2');
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled();
  });

  it('allows bulk continue after metadata probing has settled', () => {
    installApi();
    useAppStore.setState({
      initialized: true,
      initializing: false,
      settings: settings(50),
      wizardStep: 'playlistItems',
      wizardMode: 'bulk',
      wizardUrl: '',
      wizardExtractor: '',
      wizardExtractorKey: '',
      wizardWebpageUrl: '',
      formatsLoading: false,
      playlistProbeLoading: false,
      wizardError: null,
      wizardErrorOrigin: null,
      playlistItems: [{ id: 'bulk-1', url: 'https://example.com/one', title: 'Resolved One', thumbnail: '', playlistIndex: 1, videoId: 'one-id' }],
      selectedPlaylistItemIds: ['bulk-1'],
      playlistTitle: 'Bulk URLs',
      playlistId: 'bulk',
      playlistIsMultiVideo: false,
      playlistLikelyCapped: false,
      playlistSelection: { kind: 'video', tier: 'best', codec: 'best' },
      bulkMetadataStatus: 'done',
      bulkMetadataCompleted: 1,
      bulkMetadataTotal: 1,
      bulkMetadataById: { 'bulk-1': 'done' },
      syncedDownloadedIds: [],
      syncScanState: 'idle',
      queue: [],
      drawerOpen: false
    } as never);

    render(<StepPlaylistItems />);

    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled();
  });
});
