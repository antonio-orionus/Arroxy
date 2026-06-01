// ProbeOrchestrator slice — owns the URL → probe → format-step pipeline,
// the wizard step graph, and playlist enumeration. Reads format / subtitle /
// output / dialog fields owned by other slices but is the entry point for
// every probe-driven mutation. `reset` lives here too — wizardStep is the
// canonical "where the wizard is" field.
//
// Cross-slice writes through `set()` are intentional: the probe pipeline
// updates format pools, subtitle pools, output prefs, and dialog flags in
// one transition so the UI never sees a half-updated wizard.

import { DEFAULTS } from '@shared/constants.js';
import type { AppSettings, PlaylistScope, PlaylistSelection, ProbePlaylistMode, ProbeResult, WizardTransition } from '@shared/types.js';
import { DEFAULT_PLAYLIST_SELECTION } from '@shared/schemas.js';
import { getIncompleteCookiesConfigIssue } from '@shared/cookiesConfig.js';
import { cleanUrl } from '@shared/cleanUrl.js';
import { resolvePlaylistProbeLimit } from '@shared/networkPacing.js';
import { resolvePlaylistDir } from './playlistDir.js';
import { isYouTubeExtractor } from '@shared/ytdlp/extractorPredicates.js';
import { applyPreset, restoreFormatSelection, restoreSubtitleSelection } from './formatPicker.js';
import { WizardCommands, RESET_WIZARD_STATE } from './commands.js';
import { persistFormatPrefs } from './persistFormatPrefs.js';
import { buildSingleQueueItemFromState, maybeShowQueueTip } from '../queueSlice.js';
import { formatProbeError } from '../helpers.js';
import type { AppState, GetState, SetState, ProbeOrchestratorSlice, WizardStep } from '../types.js';
import { type VisibleStep } from '../../components/wizard/stepNavigation.js';
import { nextStep, type NavContext } from '../../components/wizard/nextStep.js';

// Detect YouTube URLs that carry both `v=` (single video) and `list=` (playlist).
// yt-dlp's default for these routes Radio/Mix lists to playlist enumeration;
// users typically want the single video they clicked, so we surface a prompt.
export function isMixedYouTubeUrl(url: string): boolean {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    const isYouTube = host === 'youtube.com' || host.endsWith('.youtube.com') || host === 'youtu.be';
    if (!isYouTube) return false;
    // youtu.be/<videoId>?list=... — video ID is in the pathname, not ?v=
    const hasVideo = !!u.searchParams.get('v') || (host === 'youtu.be' && u.pathname.length > 1);
    return hasVideo && !!u.searchParams.get('list');
  } catch {
    return false;
  }
}

// YouTube channel-root URLs (`/@handle`, `/channel/UC…`, `/c/CustomName`,
// `/user/OldName`) hit the Featured tab in yt-dlp, which returns a meta
// playlist of nested playlists (Videos, Shorts, Streams) rather than actual
// videos. Users almost always want the Videos tab — append `/videos` so the
// probe returns a flat enumerable list. URLs that already have a tab path
// (`/videos`, `/shorts`, `/playlists`, `/about`, etc.) pass through.
const YT_CHANNEL_TAB_NAMES = new Set(['videos', 'shorts', 'streams', 'live', 'playlists', 'community', 'about', 'featured', 'channels', 'store', 'releases', 'podcasts']);

/**
 * Whole-channel / channel-batch download support entry point.
 *
 * Rewrites a YouTube channel-root URL to its `/videos` tab so the probe
 * pipeline can treat the channel as a playlist and enumerate up to the
 * configured playlist probe limit. The user can
 * then queue every entry or pick a subset from the wizard playlist picker.
 *
 * Accepted channel-root shapes (all rewritten to `<root>/videos`):
 *   - `youtube.com/@handle`
 *   - `youtube.com/channel/UC…` (24-char browse id)
 *   - `youtube.com/c/CustomName`
 *   - `youtube.com/user/OldName`
 *
 * Tab-suffixed URLs (`/videos`, `/shorts`, `/playlists`, …) pass through
 * unchanged so a deliberate Shorts-only or Playlists-only download stays
 * scoped to that tab.
 *
 * Keywords for code search: channel download, whole-channel, channel-batch,
 * channel URL, /@handle, /channel/UC, /c/, /user/, channel enumeration,
 * channel playlist, channel videos tab, batch channel.
 *
 * @see YtDlp.ts `buildArgs` — `--flat-playlist --playlist-end <limit + 1>`
 *   is what actually enumerates the channel entries server-side.
 * @see ../../components/wizard/StepPlaylistItems.tsx — UI that lets the
 *   user pick specific channel videos from the enumerated list.
 */
export function rewriteYouTubeChannelRoot(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    const isYouTube = host === 'youtube.com' || host.endsWith('.youtube.com');
    if (!isYouTube) return url;
    const segments = u.pathname.split('/').filter(Boolean);
    if (segments.length === 0) return url;
    const isChannelRoot = (segments[0].startsWith('@') && segments.length === 1) || ((segments[0] === 'channel' || segments[0] === 'c' || segments[0] === 'user') && segments.length === 2);
    if (!isChannelRoot) return url;
    // Don't rewrite if path already ends with an explicit tab name.
    const lastSegment = segments[segments.length - 1].toLowerCase();
    if (YT_CHANNEL_TAB_NAMES.has(lastSegment)) return url;
    u.pathname = `${u.pathname.replace(/\/$/, '')}/videos`;
    return u.toString();
  } catch {
    return url;
  }
}

function navCtx(state: AppState): NavContext {
  const hasSubtitles = Object.keys(state.wizardSubtitles).length > 0 || Object.keys(state.wizardAutomaticCaptions).length > 0;
  return {
    activePreset: state.activePreset,
    wizardMode: state.wizardMode,
    playlistSelection: state.playlistSelection,
    wizardExtractor: state.wizardExtractor,
    hasSubtitles,
    wizardSubtitleSkipped: state.wizardSubtitleSkipped
  };
}

function pickWizardSnapshot(state: AppState): Record<string, unknown> {
  return {
    url: state.wizardUrl,
    extractor: state.wizardExtractor,
    title: state.wizardTitle,
    duration: state.wizardDuration,
    formatsCount: state.wizardFormats.length,
    selectedVideoFormatId: state.selectedVideoFormatId,
    audioSelection: state.audioSelection,
    activePreset: state.activePreset,
    subtitleLanguages: state.wizardSubtitleLanguages,
    subtitleMode: state.wizardSubtitleMode,
    subtitleFormat: state.wizardSubtitleFormat,
    subtitleSkipped: state.wizardSubtitleSkipped,
    sponsorBlockMode: state.wizardSponsorBlockMode,
    sponsorBlockCategories: state.wizardSponsorBlockCategories,
    embedChapters: state.wizardEmbedChapters,
    embedMetadata: state.wizardEmbedMetadata,
    embedThumbnail: state.wizardEmbedThumbnail,
    writeDescription: state.wizardWriteDescription,
    writeThumbnail: state.wizardWriteThumbnail,
    writeM3u: state.wizardWriteM3u,
    outputDir: state.wizardOutputDir,
    subfolderEnabled: state.wizardSubfolderEnabled,
    subfolderName: state.wizardSubfolderName,
    playlistScope: state.playlistScope,
    playlistItemsCount: state.playlistItems.length,
    selectedPlaylistItemsCount: state.selectedPlaylistItemIds.length,
    playlistLikelyCapped: state.playlistLikelyCapped,
    playlistScopeReloading: state.playlistScopeReloading,
    playlistScopeError: state.playlistScopeError
  };
}

function logStep(transition: WizardTransition, fromStep: WizardStep, toStep: WizardStep, snapshot: Record<string, unknown>): void {
  window.appApi.diagnostics.logWizardStep({ transition, fromStep, toStep, snapshot });
}

function restoreCommonWizardPrefs(settings: AppSettings | null): Pick<AppState, 'wizardSponsorBlockMode' | 'wizardSponsorBlockCategories' | 'wizardEmbedChapters' | 'wizardEmbedMetadata' | 'wizardEmbedThumbnail' | 'wizardWriteDescription' | 'wizardWriteThumbnail' | 'wizardWriteM3u'> {
  return {
    wizardSponsorBlockMode: settings?.common?.lastSponsorBlockMode ?? DEFAULTS.sponsorBlockMode,
    wizardSponsorBlockCategories: settings?.common?.lastSponsorBlockCategories ?? [...DEFAULTS.sponsorBlockCategories],
    wizardEmbedChapters: settings?.common?.embedChapters ?? DEFAULTS.embedChapters,
    wizardEmbedMetadata: settings?.common?.embedMetadata ?? DEFAULTS.embedMetadata,
    wizardEmbedThumbnail: settings?.common?.embedThumbnail ?? DEFAULTS.embedThumbnail,
    wizardWriteDescription: settings?.common?.writeDescription ?? DEFAULTS.writeDescription,
    wizardWriteThumbnail: settings?.common?.writeThumbnail ?? DEFAULTS.writeThumbnail,
    wizardWriteM3u: settings?.common?.writeM3u ?? DEFAULTS.writeM3u
  };
}

function maybeBlockIncompleteCookiesConfig(url: string, set: SetState, get: GetState): boolean {
  const issue = getIncompleteCookiesConfigIssue(get().settings?.common);
  if (!issue) return false;
  set({
    wizardUrl: url,
    wizardStep: 'url',
    formatsLoading: false,
    playlistProbeLoading: false,
    wizardError: null,
    wizardErrorOrigin: null,
    cookiesConfigDialogIssue: issue
  });
  return true;
}

function videoProbeState(probe: Extract<ProbeResult, { kind: 'video' }>, state: AppState, firstProbe: boolean): Partial<AppState> {
  const settings = state.settings;
  const { formats, title, thumbnail, duration, subtitles, automaticCaptions, degraded } = probe;
  // Format/audio/subtitle/preset prefs are scoped to YouTube. Non-YT extractors
  // get fresh defaults so a YT formatId / 1080p resolution doesn't leak into a
  // Vimeo/PornHub/etc. probe. Subfolder + common prefs (embed flags, sponsorblock
  // mode, output dir) are global intent and apply to all extractors.
  const persistApplies = isYouTubeExtractor(probe.extractor);
  const scopedSettings = persistApplies ? settings : null;
  let { videoFormatId, audioSelection, preset } = restoreFormatSelection(formats, scopedSettings);
  const { languages: subtitleLanguages } = restoreSubtitleSelection(subtitles, automaticCaptions, scopedSettings);
  // Audio-only sources (Bandcamp, SoundCloud, QQMusic, etc.) — force the
  // audio-only preset on first paint so the wizard doesn't mislead users
  // with a video column for content that has no video. Non-music sources
  // unaffected; YT's persisted preset still wins for YT.
  if (probe.isAudioOnlySource) {
    const audioOnlyPick = applyPreset('audio-only', formats);
    videoFormatId = audioOnlyPick.videoFormatId;
    audioSelection = audioOnlyPick.audioSelection;
    preset = 'audio-only';
  }
  return {
    wizardMode: 'single',
    wizardFormats: formats,
    wizardFormatsDegraded: degraded ?? null,
    wizardExtractor: probe.extractor,
    wizardExtractorKey: probe.extractorKey,
    wizardWebpageUrl: probe.webpageUrl,
    wizardTitle: title,
    wizardThumbnail: thumbnail,
    wizardDuration: duration,
    selectedVideoFormatId: videoFormatId,
    audioSelection,
    activePreset: preset,
    wizardSubtitles: subtitles,
    wizardAutomaticCaptions: automaticCaptions,
    wizardSubtitleLanguages: subtitleLanguages,
    wizardSubtitleSkipped: false,
    ...(firstProbe
      ? {
          wizardSubtitleMode: scopedSettings?.single?.lastSubtitleMode ?? DEFAULTS.subtitleMode,
          wizardSubtitleFormat: scopedSettings?.single?.lastSubtitleFormat ?? DEFAULTS.subtitleFormat,
          ...restoreCommonWizardPrefs(settings),
          wizardSubfolderEnabled: settings?.common?.lastSubfolderEnabled ?? false,
          wizardSubfolderName: settings?.common?.lastSubfolder ?? ''
        }
      : {}),
    formatsLoading: false,
    playlistProbeLoading: false,
    playlistItems: [],
    selectedPlaylistItemIds: [],
    playlistTitle: '',
    playlistId: '',
    playlistIsMultiVideo: false
  };
}

function applyVideoProbeResult(probe: Extract<ProbeResult, { kind: 'video' }>, set: SetState, get: GetState, firstProbe: boolean): void {
  set({
    wizardStep: 'formats',
    ...videoProbeState(probe, get(), firstProbe)
  });
}

function playlistVisibleLimit(state: AppState): number {
  const scope = state.playlistScope;
  if (scope.items.kind === 'first') return scope.items.count;
  if (scope.items.kind === 'range') return scope.items.to - scope.items.from + 1;
  return resolvePlaylistProbeLimit(state.settings?.common);
}

function applyPlaylistProbeResult(probe: Extract<ProbeResult, { kind: 'playlist' }>, set: SetState, get: GetState, firstProbe: boolean): void {
  const state = get();
  const settings = state.settings;
  const playlistLimit = playlistVisibleLimit(state);
  const hasSentinel = probe.entries.length > playlistLimit;
  const playlistLikelyCapped = hasSentinel && state.playlistScope.items.kind === 'app-limit';
  const playlistItems = hasSentinel ? probe.entries.slice(0, playlistLimit) : probe.entries;
  // Audio-only sources skip the persisted video selection and default to
  // audio-best — the user came to a music host, video presets would fail.
  const persistedSelection: PlaylistSelection = settings?.playlist?.lastPlaylistSelection ?? DEFAULT_PLAYLIST_SELECTION;
  const computedSelection: PlaylistSelection = probe.isAudioOnlySource ? { kind: 'audio', format: 'best' } : persistedSelection;
  const playlistSelection = firstProbe ? computedSelection : (get().playlistSelection ?? computedSelection);
  set({
    wizardStep: 'playlistItems',
    wizardMode: 'playlist',
    wizardExtractor: probe.extractor,
    wizardExtractorKey: probe.extractorKey,
    wizardWebpageUrl: probe.webpageUrl,
    playlistItems,
    selectedPlaylistItemIds: playlistItems.map((e) => e.id),
    playlistTitle: probe.playlistTitle,
    playlistId: probe.playlistId,
    playlistIsMultiVideo: probe.isMultiVideo,
    playlistLikelyCapped,
    playlistScopeError: null,
    playlistProbeLoading: false,
    formatsLoading: false,
    wizardFormats: [],
    wizardFormatsDegraded: null,
    ...(firstProbe
      ? {
          ...restoreCommonWizardPrefs(settings),
          wizardSubfolderEnabled: settings?.common?.lastSubfolderEnabled ?? false,
          wizardSubfolderName: settings?.common?.lastSubfolder ?? ''
        }
      : {}),
    playlistSelection
  });
}

function playlistScopeReloadErrorMessage(error: Parameters<typeof formatProbeError>[0]): string {
  if (error?.kind === 'other' && error.message === 'Playlist returned no entries') {
    return 'No videos matched that playlist scope. Your previous list is still shown.';
  }
  return formatProbeError(error) || 'Could not reload that playlist scope. Your previous list is still shown.';
}

function unknownErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error.length > 0) return error;
  return 'Unknown error';
}

async function runProbe(url: string, playlistMode: ProbePlaylistMode, set: SetState, get: GetState, firstProbe = true): Promise<void> {
  void window.appApi.downloads.probeCancel();
  const fromStep = get().wizardStep;
  const initialStep: WizardStep = playlistMode === 'playlist' ? 'playlistItems' : 'formats';
  set({
    wizardUrl: url,
    wizardStep: initialStep,
    wizardMode: playlistMode === 'playlist' ? 'playlist' : 'single',
    formatsLoading: playlistMode !== 'playlist',
    playlistProbeLoading: playlistMode !== 'video',
    playlistScopeError: null,
    wizardError: null,
    cookiesConfigDialogIssue: null,
    wizardFormats: [],
    wizardFormatsDegraded: null,
    // Clear subtitle pools so stale tracks from a previous probe don't keep
    // the Subtitles step visible during the next probe's loading window. The
    // step's gating predicate reads `wizardSubtitles` / `wizardAutomaticCaptions`
    // — if they still reflect the prior video, the indicator misleadingly
    // shows Subtitles before the new probe has decided.
    wizardSubtitles: {},
    wizardAutomaticCaptions: {},
    wizardSubtitleLanguages: [],
    playlistItems: [],
    selectedPlaylistItemIds: [],
    playlistTitle: '',
    playlistId: '',
    playlistIsMultiVideo: false,
    playlistLikelyCapped: false,
    playlistScopeReloading: false,
    syncedDownloadedIds: [],
    syncScanState: 'idle',
    wizardExtractor: '',
    wizardExtractorKey: '',
    wizardWebpageUrl: ''
  });
  logStep('submitUrl', fromStep, initialStep, pickWizardSnapshot(get()));

  const playlistScope = get().playlistScope;
  const result = await window.appApi.downloads.probe({ url, playlistMode, ...(playlistMode === 'video' ? {} : { playlistScope }) });
  if (!result.ok) {
    set({
      wizardStep: 'error',
      formatsLoading: false,
      playlistProbeLoading: false,
      wizardError: result.error,
      wizardErrorOrigin: 'formats',
      wizardFormatsDegraded: null
    });
    return;
  }

  if (result.data.kind === 'playlist') {
    applyPlaylistProbeResult(result.data, set, get, firstProbe);
    // Background-scan the destination folder so the sync alert is ready by the
    // time the user looks at the list — no manual "Sync with folder" click.
    void get().scanDownloadedInFolder();
  } else {
    applyVideoProbeResult(result.data, set, get, firstProbe);
  }
}

async function reloadPlaylistWithScope(scope: PlaylistScope, set: SetState, get: GetState): Promise<void> {
  const state = get();
  const url = state.wizardUrl;
  if (!url || state.playlistScopeReloading) {
    logStep('playlistScopeReloadIgnored', state.wizardStep, state.wizardStep, {
      ...pickWizardSnapshot(state),
      requestedScope: scope,
      reason: !url ? 'missing-url' : 'already-reloading'
    });
    return;
  }
  const previousScope = state.playlistScope;
  const previousItemsCount = state.playlistItems.length;

  void window.appApi.downloads.probeCancel();
  logStep('playlistScopeReloadStart', state.wizardStep, state.wizardStep, {
    ...pickWizardSnapshot(state),
    requestedScope: scope,
    previousScope,
    previousItemsCount
  });
  set({
    playlistScope: scope,
    playlistScopeReloading: true,
    playlistScopeError: null,
    playlistLikelyCapped: false
  });

  let result: Awaited<ReturnType<typeof window.appApi.downloads.probe>>;
  try {
    result = await window.appApi.downloads.probe({ url, playlistMode: 'playlist', playlistScope: scope });
  } catch (error) {
    const message = `Could not reload that playlist scope: ${unknownErrorMessage(error)}. Your previous list is still shown.`;
    set({
      playlistScope: previousScope,
      playlistScopeReloading: false,
      playlistScopeError: message
    });
    logStep('playlistScopeReloadFailure', get().wizardStep, get().wizardStep, {
      ...pickWizardSnapshot(get()),
      requestedScope: scope,
      restoredScope: previousScope,
      previousItemsCount,
      errorKind: 'exception',
      message
    });
    return;
  }

  if (!result.ok) {
    const message = playlistScopeReloadErrorMessage(result.error);
    set({
      playlistScope: previousScope,
      playlistScopeReloading: false,
      playlistScopeError: message
    });
    logStep('playlistScopeReloadFailure', get().wizardStep, get().wizardStep, {
      ...pickWizardSnapshot(get()),
      requestedScope: scope,
      restoredScope: previousScope,
      previousItemsCount,
      errorKind: result.error.kind,
      message
    });
    return;
  }

  if (result.data.kind !== 'playlist') {
    const message = 'No videos matched that playlist scope. Your previous list is still shown.';
    set({
      playlistScope: previousScope,
      playlistScopeReloading: false,
      playlistScopeError: message
    });
    logStep('playlistScopeReloadFailure', get().wizardStep, get().wizardStep, {
      ...pickWizardSnapshot(get()),
      requestedScope: scope,
      restoredScope: previousScope,
      previousItemsCount,
      resultKind: result.data.kind,
      message
    });
    return;
  }

  const returnedEntryCount = result.data.entries.length;
  applyPlaylistProbeResult(result.data, set, get, false);
  set({ playlistScopeReloading: false, playlistScopeError: null });
  logStep('playlistScopeReloadSuccess', get().wizardStep, get().wizardStep, {
    ...pickWizardSnapshot(get()),
    requestedScope: scope,
    previousScope,
    previousItemsCount,
    returnedEntryCount,
    visibleItemsCount: get().playlistItems.length
  });
  void get().scanDownloadedInFolder();
}

export function createProbeOrchestratorSlice(set: SetState, get: GetState): ProbeOrchestratorSlice {
  return {
    wizardStep: RESET_WIZARD_STATE.wizardStep,
    wizardMode: RESET_WIZARD_STATE.wizardMode,
    wizardUrl: RESET_WIZARD_STATE.wizardUrl,
    wizardTitle: RESET_WIZARD_STATE.wizardTitle,
    wizardThumbnail: RESET_WIZARD_STATE.wizardThumbnail,
    wizardDuration: RESET_WIZARD_STATE.wizardDuration,
    wizardFormatsDegraded: RESET_WIZARD_STATE.wizardFormatsDegraded,
    wizardExtractor: RESET_WIZARD_STATE.wizardExtractor,
    wizardExtractorKey: RESET_WIZARD_STATE.wizardExtractorKey,
    wizardWebpageUrl: RESET_WIZARD_STATE.wizardWebpageUrl,
    formatsLoading: RESET_WIZARD_STATE.formatsLoading,
    wizardError: RESET_WIZARD_STATE.wizardError,
    wizardErrorOrigin: RESET_WIZARD_STATE.wizardErrorOrigin,
    playlistItems: RESET_WIZARD_STATE.playlistItems,
    selectedPlaylistItemIds: RESET_WIZARD_STATE.selectedPlaylistItemIds,
    playlistTitle: RESET_WIZARD_STATE.playlistTitle,
    playlistId: RESET_WIZARD_STATE.playlistId,
    playlistIsMultiVideo: RESET_WIZARD_STATE.playlistIsMultiVideo,
    playlistLikelyCapped: RESET_WIZARD_STATE.playlistLikelyCapped,
    playlistProbeLoading: RESET_WIZARD_STATE.playlistProbeLoading,
    playlistScopeReloading: RESET_WIZARD_STATE.playlistScopeReloading,
    playlistScopeError: RESET_WIZARD_STATE.playlistScopeError,
    playlistScope: RESET_WIZARD_STATE.playlistScope,
    playlistSelection: RESET_WIZARD_STATE.playlistSelection,
    quickDownloadStatus: RESET_WIZARD_STATE.quickDownloadStatus,
    quickDownloadError: RESET_WIZARD_STATE.quickDownloadError,
    syncedDownloadedIds: RESET_WIZARD_STATE.syncedDownloadedIds,
    syncScanState: RESET_WIZARD_STATE.syncScanState,

    setWizardUrl: (url) => set({ wizardUrl: url, quickDownloadStatus: 'idle', quickDownloadError: null }),

    submitUrl: async () => {
      const cleaned = rewriteYouTubeChannelRoot(cleanUrl(get().wizardUrl.trim()));
      if (!cleaned) return;
      // Mixed YouTube URLs (?v=X&list=Y) — disambiguate before probing so the
      // user picks intent rather than yt-dlp defaulting to playlist.
      if (isMixedYouTubeUrl(cleaned)) {
        set({ wizardUrl: cleaned, mixedUrlPromptOpen: true, mixedUrlPending: cleaned, wizardError: null, cookiesConfigDialogIssue: null });
        return;
      }
      if (maybeBlockIncompleteCookiesConfig(cleaned, set, get)) return;
      await runProbe(cleaned, 'auto', set, get);
    },

    quickDownload: async () => {
      if (get().quickDownloadStatus === 'preparing') return;
      const cleaned = rewriteYouTubeChannelRoot(cleanUrl(get().wizardUrl.trim()));
      if (!cleaned) return;
      if (maybeBlockIncompleteCookiesConfig(cleaned, set, get)) return;

      void window.appApi.downloads.probeCancel();
      set({ wizardUrl: cleaned, quickDownloadStatus: 'preparing', quickDownloadError: null, wizardError: null, cookiesConfigDialogIssue: null });

      try {
        const result = await window.appApi.downloads.probe({ url: cleaned, playlistMode: 'video' });
        if (!result.ok) {
          set({ quickDownloadStatus: 'error', quickDownloadError: formatProbeError(result.error) || 'wizard.url.quickProbeFailed' });
          return;
        }

        if (result.data.kind !== 'video') {
          set({ quickDownloadStatus: 'error', quickDownloadError: 'wizard.url.quickSingleOnly' });
          return;
        }

        const currentOutputDir = get().wizardOutputDir;
        const fallbackOutputDir = get().settings?.common?.defaultOutputDir ?? '';

        set({
          wizardUrl: cleaned,
          wizardOutputDir: currentOutputDir.trim() ? currentOutputDir : fallbackOutputDir,
          ...videoProbeState(result.data, get(), true)
        });

        const item = buildSingleQueueItemFromState(get, 'normal');
        if (!item) {
          set({ quickDownloadStatus: 'error', quickDownloadError: 'wizard.url.quickPrepareFailed' });
          return;
        }

        const addResult = await window.appApi.queue.cmd.add([item]);
        if (!addResult.ok) {
          set({ quickDownloadStatus: 'error', quickDownloadError: addResult.error.message });
          return;
        }

        maybeShowQueueTip(set);
        await persistFormatPrefs(set, get);
        WizardCommands.resetAll(set);
        set({ quickDownloadStatus: 'queued', quickDownloadError: null });
      } catch (err) {
        set({ quickDownloadStatus: 'error', quickDownloadError: err instanceof Error ? err.message : String(err) });
      }
    },

    dismissMixedPrompt: async (choice) => {
      const pending = get().mixedUrlPending;
      set({ mixedUrlPromptOpen: false, mixedUrlPending: null });
      if (!pending) return;
      if (choice === 'video') {
        if (maybeBlockIncompleteCookiesConfig(pending, set, get)) return;
        await runProbe(pending, 'video', set, get);
      } else {
        await runProbe(pending, 'playlist', set, get);
      }
    },

    setPlaylistItemSelected: (id, checked) =>
      set((state) => ({
        selectedPlaylistItemIds: checked ? (state.selectedPlaylistItemIds.includes(id) ? state.selectedPlaylistItemIds : [...state.selectedPlaylistItemIds, id]) : state.selectedPlaylistItemIds.filter((x) => x !== id)
      })),

    setPlaylistScope: (scope) => set({ playlistScope: scope }),

    reloadPlaylistWithScope: async (scope) => {
      await reloadPlaylistWithScope(scope, set, get);
    },

    selectAllPlaylistItems: () => set((state) => ({ selectedPlaylistItemIds: state.playlistItems.map((e) => e.id) })),

    selectNonePlaylistItems: () => set({ selectedPlaylistItemIds: [] }),

    selectPlaylistRange: (from, to) =>
      set((state) => {
        const lo = Math.min(from, to);
        const hi = Math.max(from, to);
        const ids = state.playlistItems.filter((e) => e.playlistIndex >= lo && e.playlistIndex <= hi).map((e) => e.id);
        return { selectedPlaylistItemIds: ids };
      }),

    confirmPlaylistSelection: () => {
      const { selectedPlaylistItemIds, wizardStep } = get();
      if (selectedPlaylistItemIds.length === 0) return;
      set({ wizardStep: 'playlistPresets', wizardError: null });
      logStep('advance', wizardStep, 'playlistPresets', pickWizardSnapshot(get()));
    },

    setPlaylistSelection: (s) => set({ playlistSelection: s, wizardSubtitleSkipped: false }),

    // Scan the destination folder for already-downloaded items. Populates
    // syncedDownloadedIds (drives the "already downloaded" badges + the sync
    // alert) but does NOT change the selection — that's applyFolderSync's job.
    // Runs automatically after a playlist probe and on every folder change.
    scanDownloadedInFolder: async () => {
      const state = get();
      const videoIds = state.playlistItems.map((e) => e.videoId).filter((v): v is string => v !== null);
      // Scan the resolved playlist dir (override or base+subfolder) — the exact
      // folder the files land in — via the shared resolver, so scan == download.
      const outputDir = resolvePlaylistDir(state);
      set({ syncScanState: 'scanning' });
      const res = await window.appApi.playlist.scanFolder({ outputDir, videoIds });
      if (!res.ok) {
        set({ syncedDownloadedIds: [], syncScanState: 'done' });
        return;
      }
      set({ syncedDownloadedIds: res.data.matchedIds, syncScanState: 'done' });
    },

    // Deselect every item already present in the folder, leaving only the ones
    // that still need downloading. Driven by the sync alert's "Apply" action.
    applyFolderSync: () =>
      set((state) => {
        const matched = new Set(state.syncedDownloadedIds);
        const selectedPlaylistItemIds = state.selectedPlaylistItemIds.filter((id) => {
          const entry = state.playlistItems.find((e) => e.id === id);
          return !entry?.videoId || !matched.has(entry.videoId);
        });
        return { selectedPlaylistItemIds };
      }),

    advance: () => {
      const state = get();
      const target = nextStep(state.wizardStep as VisibleStep, navCtx(state), 'forward');
      if (!target) return;
      set({ wizardStep: target });
      logStep('advance', state.wizardStep, target, pickWizardSnapshot(get()));
    },

    back: () => {
      const state = get();
      const target = nextStep(state.wizardStep as VisibleStep, navCtx(state), 'backward');
      if (!target) return;
      set({ wizardStep: target, ...(target === 'subtitles' && { wizardSubtitleSkipped: false }) });
      logStep('back', state.wizardStep, target, pickWizardSnapshot(get()));
    },

    skipSubtitles: () => {
      // Mark skipped first so nextStep treats `subtitles` as ineligible —
      // the rest of the routing reuses the same eligibility table as
      // advance(), so SponsorBlock + output skip rules can't drift.
      set({ wizardSubtitleSkipped: true });
      const state = get();
      const target = nextStep(state.wizardStep as VisibleStep, navCtx(state), 'forward');
      if (!target) return;
      set({ wizardStep: target });
      logStep('skipSubtitles', state.wizardStep, target, pickWizardSnapshot(get()));
    },

    skipToConfirm: () => {
      const fromStep = get().wizardStep;
      set({ wizardStep: 'confirm' });
      logStep('skipToConfirm', fromStep, 'confirm', pickWizardSnapshot(get()));
    },

    reset: () => {
      const fromStep = get().wizardStep;
      WizardCommands.resetAll(set);
      logStep('reset', fromStep, 'url', pickWizardSnapshot(get()));
    },

    retry: async () => {
      const { wizardErrorOrigin, wizardStep } = get();
      if (wizardErrorOrigin === 'formats') {
        set({ wizardStep: 'formats', formatsLoading: true, wizardError: null });
        logStep('retry', wizardStep, 'formats', pickWizardSnapshot(get()));
        await get().submitUrl();
      }
    },

    retryFormatProbe: async () => {
      const { wizardUrl } = get();
      if (!wizardUrl) return;
      set({ formatsLoading: true, wizardFormatsDegraded: null });
      const playlistMode: ProbePlaylistMode = get().wizardMode === 'playlist' ? 'playlist' : 'auto';
      await runProbe(wizardUrl, playlistMode, set, get, false);
    },

    retryProbeWithCookies: async () => {
      const settings = get().settings;
      const path = settings?.common.cookiesPath?.trim();
      const browser = settings?.common.cookiesBrowser;
      const targetMode: 'file' | 'browser' | null = path ? 'file' : browser ? 'browser' : null;
      if (!targetMode) return;
      await get().setCookiesMode(targetMode);
      await get().retryFormatProbe();
    },

    openCookiesSettings: () => {
      // Cancel any in-flight probe — leaving the formats step abandons it,
      // and a stalled YouTube fallback chain can otherwise keep the spinner
      // bound and emit results into a step the user already left.
      void window.appApi.downloads.probeCancel();
      set({ wizardStep: 'url', wizardError: null, wizardErrorOrigin: null, advancedAutoOpen: true, advancedAutoTarget: 'cookies', cookiesConfigDialogIssue: null });
    }
  };
}
