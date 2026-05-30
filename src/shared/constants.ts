import type { SubtitleMode, SubtitleFormat, SponsorBlockMode, SponsorBlockCategory, UiTheme, NetworkPacingPreset } from './schemas.js';
import type { AppSettings } from './types.js';

// Defaults — single source. Anywhere that needs a fallback for a missing field
// (initial state, persistence migration, test fixtures, IPC fallback) must
// import from here so changes propagate everywhere.
export const DEFAULTS: {
  subtitleMode: SubtitleMode;
  subtitleFormat: SubtitleFormat;
  sponsorBlockMode: SponsorBlockMode;
  sponsorBlockCategories: SponsorBlockCategory[];
  uiZoom: number;
  uiTheme: UiTheme;
  embedChapters: boolean;
  embedMetadata: boolean;
  embedThumbnail: boolean;
  writeDescription: boolean;
  writeThumbnail: boolean;
  writeM3u: boolean;
  includeIdInSingleFilenames: boolean;
} = {
  subtitleMode: 'sidecar',
  subtitleFormat: 'srt',
  sponsorBlockMode: 'off',
  sponsorBlockCategories: ['sponsor', 'selfpromo'],
  uiZoom: 1,
  uiTheme: 'system',
  embedChapters: true,
  embedMetadata: true,
  embedThumbnail: false,
  writeDescription: false,
  writeThumbnail: false,
  writeM3u: true,
  includeIdInSingleFilenames: true
};

// Single factory for the AppSettings shape — main process, tests, and
// browserMock all build from here. Adding a new field to AppSettings forces
// every caller to supply or ignore it explicitly.
//
// `installId` is intentionally omitted — it's stamped lazily by SettingsStore
// on first launch (Node-only, depends on `node:crypto`). Keeping it out of
// this factory avoids pulling Node modules into renderer/test bundles that
// import the defaults helper.
export function defaultAppSettings(downloadsDir: string): AppSettings {
  return {
    common: {
      defaultOutputDir: downloadsDir,
      rememberLastOutputDir: true,
      networkPacingPreset: 'balanced',
      clipboardWatchEnabled: true,
      analyticsEnabled: true,
      includeIdInSingleFilenames: DEFAULTS.includeIdInSingleFilenames
    },
    single: {},
    playlist: {}
  };
}

export const WINDOW_MIN_WIDTH = 720;
export const WINDOW_MIN_HEIGHT = 680;
export const WINDOW_DEFAULT_WIDTH = 900;
export const WINDOW_DEFAULT_HEIGHT = 760;

// YouTube buckets `live_chat` into `subtitles` even though it isn't a caption
// track. Both probe-side filtering and renderer-side display filter it out.
export const LIVE_CHAT_LANG = 'live_chat';

// Queue concurrency policy. `NORMAL_LANE_CAP` is the steady-state cap for
// non-priority items — one at a time, with INTER_JOB_SLEEP_MS between jobs
// so the next process does not spawn in the same burst. `MAX_CONCURRENT_DOWNLOADS`
// is the hard ceiling that even priority-lane spawns honor; protects the
// machine from resource storms and bot-detection escalation.
export const NORMAL_LANE_CAP = 1;
export const MAX_CONCURRENT_DOWNLOADS = 4;
export const INTER_JOB_SLEEP_MS = 500;

export const DEFAULT_PLAYLIST_PROBE_LIMIT = 100;
export const PLAYLIST_PROBE_LIMIT_PRESETS = [50, 100, 250, 500, 1000] as const;

export interface NetworkPacingArgs {
  sleepRequests?: number;
  sleepInterval?: number;
  maxSleepInterval?: number;
  sleepSubtitles?: number;
  concurrentFragments?: number;
}

export const NETWORK_PACING_PRESET_VALUES: Record<Exclude<NetworkPacingPreset, 'custom'>, NetworkPacingArgs> = {
  off: {
    sleepInterval: 1,
    maxSleepInterval: 3
  },
  balanced: {
    sleepRequests: 1,
    sleepInterval: 5,
    maxSleepInterval: 10,
    sleepSubtitles: 3,
    concurrentFragments: 1
  },
  careful: {
    sleepRequests: 2,
    sleepInterval: 15,
    maxSleepInterval: 45,
    sleepSubtitles: 5,
    concurrentFragments: 1
  }
};
