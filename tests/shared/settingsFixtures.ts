import type { AppSettings } from '@shared/types.js';

const COMMON_KEYS = new Set(['defaultOutputDir', 'rememberLastOutputDir', 'uiZoom', 'uiTheme', 'language', 'commonPaths', 'cookiesPath', 'cookiesMode', 'cookiesBrowser', 'cookiesEnabled', 'proxyUrl', 'clipboardWatchEnabled', 'closeBehavior', 'embedChapters', 'embedMetadata', 'embedThumbnail', 'writeDescription', 'writeThumbnail', 'lastSponsorBlockMode', 'lastSponsorBlockCategories', 'analyticsEnabled', 'firstRunCompleted', 'drawerOpen', 'lastSubfolderEnabled', 'lastSubfolder', 'includeIdInSingleFilenames']);

const SINGLE_KEYS = new Set(['lastPreset', 'lastVideoResolution', 'lastSubtitleLanguages', 'lastSubtitleMode', 'lastSubtitleFormat']);

const PLAYLIST_KEYS = new Set(['lastPlaylistPreset']);

// Lets test files keep their flat-override style ({ lastSponsorBlockMode: 'mark', lastPreset: 'audio-only' })
// while the production shape is now nested. Maps each flat key to its mode slot.
export function buildAppSettings(flatOverrides: Record<string, unknown> = {}): AppSettings {
  const common: Record<string, unknown> = { defaultOutputDir: '/tmp', rememberLastOutputDir: false, clipboardWatchEnabled: false };
  const single: Record<string, unknown> = {};
  const playlist: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(flatOverrides)) {
    if (COMMON_KEYS.has(k)) common[k] = v;
    else if (SINGLE_KEYS.has(k)) single[k] = v;
    else if (PLAYLIST_KEYS.has(k)) playlist[k] = v;
  }
  return { common, single, playlist } as unknown as AppSettings;
}
