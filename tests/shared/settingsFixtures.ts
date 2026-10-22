import type {AppSettings} from '@shared/types.js'

const COMMON_KEYS = new Set([
	'defaultOutputDir',
	'rememberLastOutputDir',
	'uiZoom',
	'uiTheme',
	'videoCodecFilter',
	'language',
	'commonPaths',
	'cookiesPath',
	'cookiesMode',
	'cookiesBrowser',
	'cookiesEnabled',
	'proxyUrl',
	'clipboardWatchEnabled',
	'closeBehavior',
	'embedChapters',
	'embedMetadata',
	'embedThumbnail',
	'writeDescription',
	'writeThumbnail',
	'lastSponsorBlockMode',
	'lastSponsorBlockCategories',
	'analyticsEnabled',
	'firstRunCompleted',
	'launchCount',
	'lastReleaseNotesVersionShown',
	'lastSubfolderEnabled',
	'lastSubfolder',
	'filenameTemplate'
])

const PLAYLIST_KEYS = new Set(['lastPlaylistSelection'])

// Lets test files keep their flat-override style ({ lastSponsorBlockMode: 'mark' })
// while the production shape is nested. Maps each flat key to its section;
// `profiles` passes through as the whole download-profiles section.
export function buildAppSettings(flatOverrides: Record<string, unknown> = {}): AppSettings {
	const common: Record<string, unknown> = {defaultOutputDir: '/tmp', rememberLastOutputDir: false, clipboardWatchEnabled: false}
	const playlist: Record<string, unknown> = {}
	for (const [k, v] of Object.entries(flatOverrides)) {
		if (COMMON_KEYS.has(k)) common[k] = v
		else if (PLAYLIST_KEYS.has(k)) playlist[k] = v
	}
	return {common, playlist, ...('profiles' in flatOverrides ? {profiles: flatOverrides.profiles} : {})} as unknown as AppSettings
}
