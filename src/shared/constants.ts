import type { SubtitleMode, SubtitleFormat, SponsorBlockMode, SponsorBlockCategory, UiTheme } from './schemas';
import type { AppSettings } from './types';

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
} = {
  subtitleMode: 'sidecar',
  subtitleFormat: 'srt',
  sponsorBlockMode: 'off',
  sponsorBlockCategories: ['sponsor', 'selfpromo'],
  uiZoom: 1,
  uiTheme: 'system',
  embedChapters: true,
  embedMetadata: true,
  embedThumbnail: true,
  writeDescription: false,
  writeThumbnail: false
};

// Single factory for the AppSettings shape — main process, tests, and
// browserMock all build from here. Adding a new field to AppSettings forces
// every caller to supply or ignore it explicitly.
export function defaultAppSettings(downloadsDir: string): AppSettings {
  return {
    defaultOutputDir: downloadsDir,
    rememberLastOutputDir: true,
    clipboardWatchEnabled: true,
    analyticsEnabled: true
  };
}

export const WINDOW_MIN_WIDTH = 720;
export const WINDOW_MIN_HEIGHT = 680;
export const WINDOW_DEFAULT_WIDTH = 900;
export const WINDOW_DEFAULT_HEIGHT = 760;

// YouTube buckets `live_chat` into `subtitles` even though it isn't a caption
// track. Both probe-side filtering and renderer-side display filter it out.
export const LIVE_CHAT_LANG = 'live_chat';
