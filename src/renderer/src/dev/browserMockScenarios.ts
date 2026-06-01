import { defaultAppSettings, DEFAULT_PLAYLIST_PROBE_LIMIT } from '@shared/constants.js';
import { QUEUE_STATUS, STATUS_KEY, YT_DLP_ERROR_KINDS } from '@shared/schemas.js';
import type { AppSettings, DependencyDiagnostic, DependencyId, InstallChannel, PlaylistEntry, PlaylistScope, ProbeError, ProbePlaylistMode, ProbeResult, QueueItem, UpdateAvailablePayload, WarmUpOutput } from '@shared/types.js';
import type { YtDlpErrorKind } from '@shared/schemas.js';
import type { BrowserMockKnobs } from './browserMockKnobs.js';

export const BROWSER_MOCK_SCENARIO_IDS = ['default', 'single-normal', 'playlist-normal', 'playlist-scope-empty-reload', 'playlist-no-thumbnails', 'playlist-long-titles', 'probe-audio-only', 'probe-with-subtitles', 'probe-no-formats', 'probe-live-stream', 'dialog-mixed-url', 'dialog-cookies-issue', 'update-direct', 'update-homebrew', 'update-scoop', 'update-portable', 'update-darwin-dmg', 'update-winget', 'update-flatpak', 'update-none', 'queue-empty', 'queue-running', 'queue-paused-active', 'queue-paused-held', 'queue-cancelled', 'queue-error', 'queue-completed', 'queue-subtitles-failed', 'queue-multi', 'diagnostics-all-ok', 'diagnostics-ytdlp-missing', 'diagnostics-ffmpeg-broken', 'diagnostics-deno-missing', 'diagnostics-ffprobe-broken', 'diagnostics-all-missing', 'diagnostics-warmup-running'] as const;

export type BrowserMockScenarioId = (typeof BROWSER_MOCK_SCENARIO_IDS)[number];
export type BrowserMockScenarioGroup = 'General' | 'Playlist' | 'Probe Results' | 'Probe Errors' | 'Dialogs' | 'Updates' | 'Queue' | 'Diagnostics';
type ScenarioKind = 'default' | 'probe' | 'queue' | 'update' | 'diagnostics' | 'dialog';

const SINGLE_NORMAL_MOCK_STEPS = ['formats', 'subtitles', 'sponsorblock', 'output', 'folder', 'confirm'] as const;
const PLAYLIST_NORMAL_MOCK_STEPS = ['playlistItems', 'playlistPresets', 'sponsorblock', 'output', 'folder', 'confirm'] as const;
export const BROWSER_MOCK_STEPS = [...new Set([...SINGLE_NORMAL_MOCK_STEPS, ...PLAYLIST_NORMAL_MOCK_STEPS])] as const;
export type BrowserMockStep = (typeof BROWSER_MOCK_STEPS)[number];

export interface BrowserMockScenario {
  id: BrowserMockScenarioId;
  group: BrowserMockScenarioGroup;
  title: string;
  description: string;
  kind: ScenarioKind;
}

export interface BrowserMockState {
  scenario: BrowserMockScenario;
  settings: AppSettings;
  probeResult: ProbeResult | null;
  probeError: ProbeError | null;
  queueItems: QueueItem[];
  update: UpdateAvailablePayload | null;
  warmUp: WarmUpOutput;
}

export interface BrowserMockUrlParams {
  playlistCount: number | null;
  probeErrorKind: YtDlpErrorKind | null;
  mockStep: BrowserMockStep | null;
}

export function readUrlParams(location: Pick<Location, 'search'> | URL): BrowserMockUrlParams {
  const params = new URLSearchParams(location.search.replace(/^\?/, ''));
  const rawCount = params.get('playlist');
  const parsedCount = rawCount !== null ? parseInt(rawCount, 10) : NaN;
  const playlistCount = Number.isInteger(parsedCount) && parsedCount > 0 ? parsedCount : null;

  const rawKind = params.get('probeError');
  const probeErrorKind = rawKind !== null && (YT_DLP_ERROR_KINDS as readonly string[]).includes(rawKind) ? (rawKind as YtDlpErrorKind) : null;

  const rawStep = params.get('mockStep');
  const mockStep = rawStep !== null && (BROWSER_MOCK_STEPS as readonly string[]).includes(rawStep) ? (rawStep as BrowserMockStep) : null;

  return { playlistCount, probeErrorKind, mockStep };
}

const COMMON_PATHS = {
  downloads: '/home/user/Downloads',
  videos: '/home/user/Videos',
  desktop: '/home/user/Desktop',
  music: '/home/user/Music',
  documents: '/home/user/Documents',
  pictures: '/home/user/Pictures',
  home: '/home/user'
} as const;

const WIN_COMMON_PATHS = {
  downloads: 'C:\\Users\\User\\Downloads',
  videos: 'C:\\Users\\User\\Videos',
  desktop: 'C:\\Users\\User\\Desktop',
  music: 'C:\\Users\\User\\Music',
  documents: 'C:\\Users\\User\\Documents',
  pictures: 'C:\\Users\\User\\Pictures',
  home: 'C:\\Users\\User'
} as const;

export const BROWSER_MOCK_SCENARIOS: readonly BrowserMockScenario[] = [
  { id: 'default', group: 'General', title: 'Default app', description: 'Standard mock video flow and clean queue.', kind: 'default' },
  { id: 'single-normal', group: 'General', title: 'Single video normal', description: 'Happy-path YouTube video with formats, subtitles, and SponsorBlock steps.', kind: 'probe' },

  { id: 'playlist-normal', group: 'Playlist', title: 'Playlist normal', description: 'Happy-path playlist with thumbnails, durations, and default preset selection.', kind: 'probe' },
  { id: 'playlist-scope-empty-reload', group: 'Playlist', title: 'Scope reload empty', description: 'Playlist opens normally; applying any non-default scope reload returns no entries and should stay inline.', kind: 'probe' },
  { id: 'playlist-no-thumbnails', group: 'Playlist', title: 'No thumbnails', description: 'Playlist rows with no thumbnail column.', kind: 'probe' },
  { id: 'playlist-long-titles', group: 'Playlist', title: 'Long titles', description: 'Playlist rows with intentionally long titles.', kind: 'probe' },

  { id: 'probe-audio-only', group: 'Probe Results', title: 'Audio only source', description: 'isAudioOnlySource:true — wizard defaults to audio-only mode (Bandcamp/SoundCloud-like extractor).', kind: 'probe' },
  { id: 'probe-with-subtitles', group: 'Probe Results', title: 'With subtitles', description: 'Video with manual subtitle tracks and auto-caption pool.', kind: 'probe' },
  { id: 'probe-no-formats', group: 'Probe Results', title: 'No formats', description: 'Video probe returns empty formats array — tests graceful empty state in the format picker.', kind: 'probe' },
  { id: 'probe-live-stream', group: 'Probe Results', title: 'Live stream', description: 'isLive:true — live-stream indicator and format restrictions should show.', kind: 'probe' },

  { id: 'dialog-mixed-url', group: 'Dialogs', title: 'Mixed URL prompt', description: 'Opens the "You pasted multiple URLs" confirmation dialog at startup.', kind: 'dialog' },
  { id: 'dialog-cookies-issue', group: 'Dialogs', title: 'Cookies config issue', description: 'Triggers the cookies config issue dialog (file mode, missing path).', kind: 'dialog' },

  { id: 'update-direct', group: 'Updates', title: 'Direct update', description: 'Install & Restart action (Win/Linux direct install).', kind: 'update' },
  { id: 'update-darwin-dmg', group: 'Updates', title: 'Darwin DMG', description: 'Direct channel on macOS — shows Download link. Use platform=mac knob to activate darwin path.', kind: 'update' },
  { id: 'update-winget', group: 'Updates', title: 'Winget', description: 'Winget channel — Install & Restart action.', kind: 'update' },
  { id: 'update-homebrew', group: 'Updates', title: 'Homebrew update', description: 'Copy Homebrew upgrade command.', kind: 'update' },
  { id: 'update-scoop', group: 'Updates', title: 'Scoop update', description: 'Copy Scoop update command.', kind: 'update' },
  { id: 'update-portable', group: 'Updates', title: 'Portable update', description: 'Download link action.', kind: 'update' },
  { id: 'update-flatpak', group: 'Updates', title: 'Flatpak', description: 'Flatpak channel — copy update command.', kind: 'update' },
  { id: 'update-none', group: 'Updates', title: 'No update', description: 'No update available — banner is hidden.', kind: 'update' },

  { id: 'queue-empty', group: 'Queue', title: 'Empty queue', description: 'No queue items.', kind: 'queue' },
  { id: 'queue-running', group: 'Queue', title: 'Running item', description: 'Drawer with an active download.', kind: 'queue' },
  { id: 'queue-paused-active', group: 'Queue', title: 'Paused active', description: 'Drawer with a resumable active pause (had running job, was paused).', kind: 'queue' },
  { id: 'queue-paused-held', group: 'Queue', title: 'Paused held', description: 'Drawer with a paused-held item (queued but never started, resume → pending).', kind: 'queue' },
  { id: 'queue-cancelled', group: 'Queue', title: 'Cancelled', description: 'Drawer with a cancelled item.', kind: 'queue' },
  { id: 'queue-error', group: 'Queue', title: 'Failed item', description: 'Drawer with a failed item and error detail.', kind: 'queue' },
  { id: 'queue-completed', group: 'Queue', title: 'Completed item', description: 'Drawer with completed download controls.', kind: 'queue' },
  { id: 'queue-subtitles-failed', group: 'Queue', title: 'Subtitles failed', description: 'Done item where subtitle download soft-failed — video was saved, subtitles were not.', kind: 'queue' },
  { id: 'queue-multi', group: 'Queue', title: 'Multi-item queue', description: 'Mixed statuses (running, pending, paused-held, done, error, cancelled) — exercises scroll and multi-item controls.', kind: 'queue' },

  { id: 'diagnostics-all-ok', group: 'Diagnostics', title: 'All OK', description: 'Runnable dependency diagnostics.', kind: 'diagnostics' },
  { id: 'diagnostics-ytdlp-missing', group: 'Diagnostics', title: 'yt-dlp missing', description: 'Blocking yt-dlp setup failure.', kind: 'diagnostics' },
  { id: 'diagnostics-ffmpeg-broken', group: 'Diagnostics', title: 'ffmpeg broken', description: 'Blocking ffmpeg setup failure.', kind: 'diagnostics' },
  { id: 'diagnostics-deno-missing', group: 'Diagnostics', title: 'deno missing', description: 'Blocking deno download failure.', kind: 'diagnostics' },
  { id: 'diagnostics-ffprobe-broken', group: 'Diagnostics', title: 'ffprobe broken', description: 'Blocking ffprobe probe failure (bad exit code).', kind: 'diagnostics' },
  { id: 'diagnostics-all-missing', group: 'Diagnostics', title: 'All missing', description: 'Fresh-install state — all four binaries failed; all are blocking.', kind: 'diagnostics' },
  { id: 'diagnostics-warmup-running', group: 'Diagnostics', title: 'Non-blocking failure', description: 'Deno failed (download_failed) but not blocking — app proceeds, diagnostics panel shows soft warning.', kind: 'diagnostics' }
] as const;

const SCENARIOS_BY_ID = new Map<string, BrowserMockScenario>(BROWSER_MOCK_SCENARIOS.map((scenario) => [scenario.id, scenario]));

function isBrowserMockScenarioId(value: string | null): value is BrowserMockScenarioId {
  return value != null && (BROWSER_MOCK_SCENARIO_IDS as readonly string[]).includes(value);
}

export function readScenarioIdFromUrl(location: Pick<Location, 'search'> | URL): BrowserMockScenarioId | null {
  const value = new URLSearchParams(location.search.startsWith('?') ? location.search.slice(1) : location.search).get('scenario');
  return isBrowserMockScenarioId(value) ? value : null;
}

export function getScenario(id: string | null | undefined): BrowserMockScenario {
  if (!id) return BROWSER_MOCK_SCENARIOS[0];
  return SCENARIOS_BY_ID.get(id) ?? BROWSER_MOCK_SCENARIOS[0];
}

export function isHappyPathScenario(scenario: Pick<BrowserMockScenario, 'id'>): boolean {
  return scenario.id === 'single-normal' || scenario.id === 'playlist-normal' || scenario.id === 'playlist-scope-empty-reload';
}

export function mockStepForScenario(scenario: Pick<BrowserMockScenario, 'id'>, step: BrowserMockStep | null): BrowserMockStep | null {
  if (step === null) return null;
  if (scenario.id === 'single-normal' && (SINGLE_NORMAL_MOCK_STEPS as readonly string[]).includes(step)) return step;
  if ((scenario.id === 'playlist-normal' || scenario.id === 'playlist-scope-empty-reload') && (PLAYLIST_NORMAL_MOCK_STEPS as readonly string[]).includes(step)) return step;
  return null;
}

export function mockStepsForScenario(scenario: Pick<BrowserMockScenario, 'id'>): readonly BrowserMockStep[] {
  if (scenario.id === 'single-normal') return SINGLE_NORMAL_MOCK_STEPS;
  if (scenario.id === 'playlist-normal' || scenario.id === 'playlist-scope-empty-reload') return PLAYLIST_NORMAL_MOCK_STEPS;
  return [];
}

export function shouldMockEmptyPlaylistScopeReload(scenario: Pick<BrowserMockScenario, 'id'>, playlistMode: ProbePlaylistMode | undefined, playlistScope: PlaylistScope | undefined): boolean {
  return scenario.id === 'playlist-scope-empty-reload' && playlistMode === 'playlist' && playlistScope !== undefined && playlistScope.items.kind !== 'app-limit';
}

export function buildScenarioAppApiState(scenario: BrowserMockScenario, params?: BrowserMockUrlParams, knobs?: BrowserMockKnobs): BrowserMockState {
  const settings = buildSettings(scenario, knobs);
  return {
    scenario,
    settings,
    probeResult: buildProbeResult(scenario, params),
    probeError: buildProbeError(scenario, params),
    queueItems: buildQueueItems(scenario),
    update: buildUpdate(scenario),
    warmUp: buildWarmUp(scenario)
  };
}

function buildSettings(scenario: BrowserMockScenario, knobs?: BrowserMockKnobs): AppSettings {
  const base = defaultAppSettings('/home/user/Downloads');
  const queueOpen = scenario.group === 'Queue' && scenario.id !== 'queue-empty';
  const platform = knobs?.platform ?? null;
  const commonPaths = platform === 'win32' ? WIN_COMMON_PATHS : COMMON_PATHS;
  return {
    ...base,
    common: {
      ...base.common,
      language: knobs?.locale ?? 'en',
      cookiesPath: undefined,
      cookiesMode: 'off',
      embedChapters: true,
      embedMetadata: true,
      embedThumbnail: false,
      playlistProbeLimit: DEFAULT_PLAYLIST_PROBE_LIMIT,
      drawerOpen: queueOpen,
      commonPaths,
      ...(knobs?.theme !== null && knobs?.theme !== undefined ? { uiTheme: knobs.theme } : {})
    }
  };
}

function buildProbeResult(scenario: BrowserMockScenario, params?: BrowserMockUrlParams): ProbeResult | null {
  if (params?.playlistCount !== null && params?.playlistCount !== undefined) {
    return playlistProbe(params.playlistCount);
  }
  switch (scenario.id) {
    case 'single-normal':
      return normalVideoProbe();
    case 'playlist-normal':
    case 'playlist-scope-empty-reload':
      return playlistProbe(12, { fullThumbnails: true });
    case 'playlist-no-thumbnails':
      return playlistProbe(100, { thumbnails: false });
    case 'playlist-long-titles':
      return playlistProbe(100, { longTitles: true });
    case 'probe-audio-only':
      return audioOnlyProbe();
    case 'probe-with-subtitles':
      return videoWithSubtitlesProbe();
    case 'probe-no-formats':
      return noFormatsProbe();
    case 'probe-live-stream':
      return liveStreamProbe();
    default:
      return null;
  }
}

const PROBE_ERROR_RAW: Partial<Record<YtDlpErrorKind, string>> = {
  botBlock: "ERROR: [youtube] x: Sign in to confirm you're not a bot. Use --cookies-from-browser ...",
  ipBlock: 'ERROR: [youtube] x: Unable to download webpage: HTTP Error 429: Too Many Requests',
  rateLimit: 'ERROR: unable to download video data: HTTP Error 429: Too Many Requests',
  ageRestricted: 'ERROR: [youtube] dQw4w9WgXcQ: Sign in to confirm your age.',
  unavailable: 'ERROR: [youtube] dQw4w9WgXcQ: Video unavailable.',
  geoBlocked: 'ERROR: [youtube] dQw4w9WgXcQ: The uploader has not made this video available in your country.',
  drmProtected: 'ERROR: [youtube] dQw4w9WgXcQ: This video is DRM-protected.',
  loginRequired: 'ERROR: [youtube] dQw4w9WgXcQ: This video is only available to registered users.',
  outOfDiskSpace: 'ERROR: [Errno 28] No space left on device',
  chunkTransferFailure: 'ERROR: unable to download video data: <urlopen error [Errno 104] Connection reset by peer>',
  postprocessFailure: 'ERROR: ffmpeg exited with code 1',
  unsupportedUrl: 'ERROR: Unsupported URL: https://example.com/unsupported',
  parse: 'ERROR: Unable to extract video data',
  network: 'ERROR: unable to download video data: <urlopen error [Errno -2] Name or service not known>',
  unknown: 'ERROR: Something went wrong (unknown error)'
};

function buildProbeError(_scenario: BrowserMockScenario, params?: BrowserMockUrlParams): ProbeError | null {
  if (params?.probeErrorKind !== null && params?.probeErrorKind !== undefined) {
    const raw = PROBE_ERROR_RAW[params.probeErrorKind] ?? `ERROR: ${params.probeErrorKind} error (mock)`;
    return { kind: 'ytdlp', error: { kind: params.probeErrorKind, raw } };
  }
  return null;
}

const MOCK_FORMATS = [
  { formatId: '137', label: '1080p | mp4 | 30fps | 515.0 MB', ext: 'mp4', resolution: '1080p', fps: 30, filesize: 540_000_000, isVideoOnly: true, isAudioOnly: false },
  { formatId: '136', label: '720p | mp4 | 30fps | 209.8 MB', ext: 'mp4', resolution: '720p', fps: 30, filesize: 220_000_000, isVideoOnly: true, isAudioOnly: false },
  { formatId: '251', label: 'webm · Opus · 132 kbps · 5.0 MB', ext: 'webm', resolution: 'audio only', abr: 132, filesize: 5_200_000, isVideoOnly: false, isAudioOnly: true },
  { formatId: '140', label: 'm4a · AAC · 129 kbps · 4.8 MB', ext: 'm4a', resolution: 'audio only', abr: 129, filesize: 5_000_000, isVideoOnly: false, isAudioOnly: true }
] as const;

const NORMAL_VIDEO_FORMATS = [
  { formatId: '313', label: '2160p | webm | 30fps | 2.2 GB', ext: 'webm', resolution: '2160p', fps: 30, filesize: 2_400_000_000, isVideoOnly: true, isAudioOnly: false },
  { formatId: '271', label: '1440p | webm | 30fps | 906.2 MB', ext: 'webm', resolution: '1440p', fps: 30, filesize: 950_000_000, isVideoOnly: true, isAudioOnly: false },
  { formatId: '137', label: '1080p | mp4 | 30fps | 515.0 MB', ext: 'mp4', resolution: '1080p', fps: 30, filesize: 540_000_000, isVideoOnly: true, isAudioOnly: false },
  { formatId: '248', label: '1080p | webm | 30fps | 400.5 MB', ext: 'webm', resolution: '1080p', fps: 30, filesize: 420_000_000, isVideoOnly: true, isAudioOnly: false },
  { formatId: '136', label: '720p | mp4 | 30fps | 209.8 MB', ext: 'mp4', resolution: '720p', fps: 30, filesize: 220_000_000, isVideoOnly: true, isAudioOnly: false },
  { formatId: '247', label: '720p | webm | 30fps | 171.7 MB', ext: 'webm', resolution: '720p', fps: 30, filesize: 180_000_000, isVideoOnly: true, isAudioOnly: false },
  { formatId: '135', label: '480p | mp4 | 30fps | 104.9 MB', ext: 'mp4', resolution: '480p', fps: 30, filesize: 110_000_000, isVideoOnly: true, isAudioOnly: false },
  { formatId: '134', label: '360p | mp4 | 30fps | 62.0 MB', ext: 'mp4', resolution: '360p', fps: 30, filesize: 65_000_000, isVideoOnly: true, isAudioOnly: false },
  { formatId: '251', label: 'webm · Opus · 132 kbps · 5.0 MB', ext: 'webm', resolution: 'audio only', abr: 132, filesize: 5_200_000, isVideoOnly: false, isAudioOnly: true },
  { formatId: '140', label: 'm4a · AAC · 129 kbps · 4.8 MB', ext: 'm4a', resolution: 'audio only', abr: 129, filesize: 5_000_000, isVideoOnly: false, isAudioOnly: true },
  { formatId: '249', label: 'webm · Opus · 50 kbps · 2.0 MB', ext: 'webm', resolution: 'audio only', abr: 50, filesize: 2_000_000, isVideoOnly: false, isAudioOnly: true },
  { formatId: '139', label: 'm4a · AAC · 48 kbps · 1.8 MB', ext: 'm4a', resolution: 'audio only', abr: 48, filesize: 1_900_000, isVideoOnly: false, isAudioOnly: true }
] as const;

export function normalVideoProbe(options: { webpageUrl?: string; degraded?: Extract<ProbeResult, { kind: 'video' }>['degraded'] } = {}): ProbeResult {
  return {
    kind: 'video',
    extractor: 'youtube',
    extractorKey: 'Youtube',
    webpageUrl: options.webpageUrl ?? 'https://www.youtube.com/watch?v=mock-normal',
    isAudioOnlySource: false,
    isLive: false,
    hasDrm: false,
    duration: 60 * 60 * 24,
    title: 'Mock Video - Lo-fi Hip Hop Radio 24/7',
    thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg',
    ...(options.degraded ? { degraded: options.degraded } : {}),
    formats: [...NORMAL_VIDEO_FORMATS],
    subtitles: {
      en: [{ ext: 'vtt', name: 'English' }],
      es: [{ ext: 'vtt', name: 'Espanol' }]
    },
    automaticCaptions: {
      'en-orig': [{ ext: 'vtt', name: 'English (auto)' }]
    }
  };
}

function audioOnlyProbe(): ProbeResult {
  return {
    kind: 'video',
    extractor: 'soundcloud',
    extractorKey: 'SoundCloud',
    webpageUrl: 'https://soundcloud.com/mock/track',
    isAudioOnlySource: true,
    isLive: false,
    hasDrm: false,
    duration: 214,
    title: 'Mock SoundCloud Track — audio-only source',
    thumbnail: 'https://i1.sndcdn.com/artworks-mock.jpg',
    subtitles: {},
    automaticCaptions: {},
    formats: [
      { formatId: 'http_mp3-128', label: 'mp3 · 128 kbps · 3.4 MB', ext: 'mp3', resolution: 'audio only', abr: 128, filesize: 3_500_000, isVideoOnly: false, isAudioOnly: true },
      { formatId: 'http_opus-64', label: 'opus · 64 kbps · 1.7 MB', ext: 'opus', resolution: 'audio only', abr: 64, filesize: 1_700_000, isVideoOnly: false, isAudioOnly: true }
    ]
  };
}

function videoWithSubtitlesProbe(): ProbeResult {
  return {
    kind: 'video',
    extractor: 'youtube',
    extractorKey: 'Youtube',
    webpageUrl: 'https://www.youtube.com/watch?v=subtitles',
    isAudioOnlySource: false,
    isLive: false,
    hasDrm: false,
    duration: 1845,
    title: 'Mock Video — Multi-Language Subtitles',
    thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg',
    subtitles: {
      en: [{ ext: 'vtt', name: 'English' }],
      es: [{ ext: 'vtt', name: 'Español' }],
      fr: [{ ext: 'vtt', name: 'Français' }],
      de: [{ ext: 'vtt', name: 'Deutsch' }],
      ja: [{ ext: 'vtt', name: '日本語' }],
      zh: [{ ext: 'vtt', name: '中文' }],
      ar: [{ ext: 'vtt', name: 'العربية' }]
    },
    automaticCaptions: {
      'en-orig': [{ ext: 'vtt', name: 'English (auto)' }],
      'es-orig': [{ ext: 'vtt', name: 'Español (auto)' }]
    },
    formats: [...MOCK_FORMATS]
  };
}

function noFormatsProbe(): ProbeResult {
  return {
    kind: 'video',
    extractor: 'youtube',
    extractorKey: 'Youtube',
    webpageUrl: 'https://www.youtube.com/watch?v=noformats',
    isAudioOnlySource: false,
    isLive: false,
    hasDrm: false,
    duration: 300,
    title: 'Mock Video — No Formats Available',
    thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg',
    subtitles: {},
    automaticCaptions: {},
    formats: []
  };
}

function liveStreamProbe(): ProbeResult {
  return {
    kind: 'video',
    extractor: 'youtube',
    extractorKey: 'Youtube',
    webpageUrl: 'https://www.youtube.com/watch?v=livestream',
    isAudioOnlySource: false,
    isLive: true,
    hasDrm: false,
    title: 'Mock Live Stream — 24/7 Radio',
    thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg',
    subtitles: {},
    automaticCaptions: {},
    formats: [
      { formatId: '95', label: '1080p | mp4 | HLS', ext: 'mp4', resolution: '1080p', fps: 30, filesize: undefined, isVideoOnly: false, isAudioOnly: false },
      { formatId: '94', label: '720p | mp4 | HLS', ext: 'mp4', resolution: '720p', fps: 30, filesize: undefined, isVideoOnly: false, isAudioOnly: false },
      { formatId: '92', label: '480p | mp4 | HLS', ext: 'mp4', resolution: '480p', fps: 30, filesize: undefined, isVideoOnly: false, isAudioOnly: false }
    ]
  };
}

export function playlistProbe(count: number, options: { thumbnails?: boolean; fullThumbnails?: boolean; longTitles?: boolean; webpageUrl?: string } = {}): ProbeResult {
  const entries: PlaylistEntry[] = Array.from({ length: count }, (_, i) => {
    const number = i + 1;
    const title = options.longTitles ? `Mock playlist item ${number} - an intentionally long title with extra metadata, brackets, episode numbers, and enough words to pressure every row layout` : `Mock playlist item ${number} - ${i % 3 === 0 ? 'a longer title that should ellipsize gracefully when the row is narrow' : 'short title'}`;
    return {
      id: `mock${number}`,
      url: `https://www.youtube.com/watch?v=mock${number}`,
      title,
      thumbnail: options.thumbnails === false ? '' : options.fullThumbnails === true || i % 5 !== 0 ? 'https://i.ytimg.com/vi/jfKfPfyJRdk/mqdefault.jpg' : '',
      duration: 90 + i * 47,
      playlistIndex: number,
      videoId: `mockid${number}`
    };
  });

  return {
    kind: 'playlist',
    extractor: 'youtube:tab',
    extractorKey: 'YoutubeTab',
    webpageUrl: options.webpageUrl ?? 'https://example.com/mock-playlist',
    isAudioOnlySource: false,
    isMultiVideo: false,
    playlistId: 'PLmock_browser',
    playlistTitle: 'Mock Browser Playlist',
    entries
  };
}

function buildUpdate(scenario: BrowserMockScenario): UpdateAvailablePayload | null {
  const channelByScenario: Partial<Record<BrowserMockScenarioId, InstallChannel>> = {
    'update-direct': 'direct',
    'update-darwin-dmg': 'direct',
    'update-winget': 'winget',
    'update-homebrew': 'homebrew',
    'update-scoop': 'scoop',
    'update-portable': 'portable',
    'update-flatpak': 'flatpak'
  };
  if (scenario.id === 'update-none') return null;
  const installChannel = channelByScenario[scenario.id];
  return installChannel ? { version: '1.2.0', currentVersion: '0.0.1', installChannel } : null;
}

function buildWarmUp(scenario: BrowserMockScenario): WarmUpOutput {
  const dependencies = allRunnableDependencies();
  switch (scenario.id) {
    case 'diagnostics-ytdlp-missing':
      dependencies['yt-dlp'] = failedDependency('yt-dlp', 'download_failed', 'yt-dlp download failed');
      return { completed: false, dependencies, blockingFailures: ['yt-dlp'], cancelled: false };
    case 'diagnostics-ffmpeg-broken':
      dependencies.ffmpeg = failedDependency('ffmpeg', 'bad_exit_code', 'ffmpeg exited with code 1');
      return { completed: false, dependencies, blockingFailures: ['ffmpeg'], cancelled: false };
    case 'diagnostics-deno-missing':
      dependencies.deno = failedDependency('deno', 'download_failed', 'deno download failed');
      return { completed: false, dependencies, blockingFailures: ['deno'], cancelled: false };
    case 'diagnostics-ffprobe-broken':
      dependencies.ffprobe = failedDependency('ffprobe', 'bad_exit_code', 'ffprobe exited with code 1');
      return { completed: false, dependencies, blockingFailures: ['ffprobe'], cancelled: false };
    case 'diagnostics-all-missing': {
      const allFailed = {
        'yt-dlp': failedDependency('yt-dlp', 'download_failed', 'yt-dlp download failed'),
        ffmpeg: failedDependency('ffmpeg', 'download_failed', 'ffmpeg download failed'),
        ffprobe: failedDependency('ffprobe', 'download_failed', 'ffprobe download failed'),
        deno: failedDependency('deno', 'download_failed', 'deno download failed')
      };
      return { completed: false, dependencies: allFailed, blockingFailures: ['yt-dlp', 'ffmpeg', 'ffprobe', 'deno'], cancelled: false };
    }
    case 'diagnostics-warmup-running':
      dependencies.deno = failedDependency('deno', 'download_failed', 'deno download failed (non-blocking)');
      return { completed: false, dependencies, blockingFailures: [], cancelled: false };
    default:
      return { completed: true, dependencies, blockingFailures: [], cancelled: false };
  }
}

function allRunnableDependencies(): Record<DependencyId, DependencyDiagnostic> {
  return {
    'yt-dlp': { id: 'yt-dlp', state: 'runnable', source: { kind: 'managed', channel: 'nightly', url: 'mock' }, resolvedPath: '/mock/yt-dlp', attempts: [] },
    ffmpeg: { id: 'ffmpeg', state: 'runnable', source: { kind: 'managed', channel: 'default', url: 'mock' }, resolvedPath: '/mock/ffmpeg', attempts: [] },
    ffprobe: { id: 'ffprobe', state: 'runnable', source: { kind: 'managed', channel: 'default', url: 'mock' }, resolvedPath: '/mock/ffprobe', attempts: [] },
    deno: { id: 'deno', state: 'runnable', source: { kind: 'managed', channel: 'default', url: 'mock' }, resolvedPath: '/mock/deno', attempts: [] }
  };
}

function failedDependency(id: DependencyId, kind: NonNullable<DependencyDiagnostic['failure']>['kind'], message: string): DependencyDiagnostic {
  return {
    id,
    state: 'failed',
    source: { kind: 'managed', channel: id === 'yt-dlp' ? 'nightly' : 'default', url: 'mock' },
    resolvedPath: null,
    failure: { kind, message },
    attempts: []
  };
}

function buildQueueItems(scenario: BrowserMockScenario): QueueItem[] {
  switch (scenario.id) {
    case 'queue-running':
      return [queueItem({ status: QUEUE_STATUS.running, progressPercent: 42, progressDetail: 'Downloading 42%' })];
    case 'queue-paused-active':
      return [queueItem({ status: QUEUE_STATUS.pausedActive, progressPercent: 38, progressDetail: 'Paused at 38%', tempDir: '/tmp/arroxy-mock', lastJobId: 'mock-job-1' })];
    case 'queue-paused-held':
      return [queueItem({ status: QUEUE_STATUS.pausedHeld, progressPercent: 0, progressDetail: null })];
    case 'queue-cancelled':
      return [queueItem({ status: QUEUE_STATUS.cancelled, progressPercent: 23, progressDetail: null, finishedAt: '2026-05-31T12:00:00.000Z' })];
    case 'queue-error':
      return [queueItem({ status: QUEUE_STATUS.error, progressPercent: 17, progressDetail: null, error: { kind: 'botBlock', raw: "Sign in to confirm you're not a bot" }, finishedAt: '2026-05-31T12:00:00.000Z' })];
    case 'queue-completed':
      return [queueItem({ status: QUEUE_STATUS.done, progressPercent: 100, progressDetail: null, finishedAt: '2026-05-31T12:00:00.000Z' })];
    case 'queue-subtitles-failed':
      return [queueItem({ status: QUEUE_STATUS.done, progressPercent: 100, progressDetail: null, lastStatus: { key: STATUS_KEY.subtitlesFailed }, finishedAt: '2026-05-31T12:00:00.000Z' })];
    case 'queue-multi':
      return buildMultiQueueItems();
    default:
      return [];
  }
}

function buildMultiQueueItems(): QueueItem[] {
  return [queueItem({ id: 'mq-1', title: 'Running Download — Lo-fi Hip Hop Radio', status: QUEUE_STATUS.running, progressPercent: 61, progressDetail: 'Downloading 61%' }), queueItem({ id: 'mq-2', title: 'Pending Item — Waiting in Queue', status: QUEUE_STATUS.pending, progressPercent: 0, progressDetail: null }), queueItem({ id: 'mq-3', title: 'Paused Held — Never Started', status: QUEUE_STATUS.pausedHeld, progressPercent: 0, progressDetail: null }), queueItem({ id: 'mq-4', title: 'Completed Download — Archive Recording', status: QUEUE_STATUS.done, progressPercent: 100, progressDetail: null, finishedAt: '2026-05-31T11:00:00.000Z' }), queueItem({ id: 'mq-5', title: 'Failed Download — Bot Block', status: QUEUE_STATUS.error, progressPercent: 12, progressDetail: null, error: { kind: 'botBlock', raw: "Sign in to confirm you're not a bot" }, finishedAt: '2026-05-31T10:30:00.000Z' }), queueItem({ id: 'mq-6', title: 'Cancelled Item — User Cancelled', status: QUEUE_STATUS.cancelled, progressPercent: 45, progressDetail: null, finishedAt: '2026-05-31T10:00:00.000Z' })];
}

function queueItem(overrides: Partial<QueueItem> & { id?: string }): QueueItem {
  return {
    id: overrides.id ?? 'scenario-queue-item',
    url: 'https://www.youtube.com/watch?v=scenario',
    title: 'Scenario Queue Item - visual regression fixture',
    thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/mqdefault.jpg',
    outputDir: '/home/user/Downloads',
    formatLabel: '1080p | mp4 | 30fps',
    status: QUEUE_STATUS.pending,
    lane: 'normal',
    progressPercent: 0,
    progressDetail: null,
    lastStatus: { key: STATUS_KEY.startingYtdlp },
    error: null,
    finishedAt: null,
    writeM3u: true,
    job: { kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: '137+251', preset: 'custom', sponsorBlock: { mode: 'off' }, embed: { chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false } },
    ...overrides
  };
}
