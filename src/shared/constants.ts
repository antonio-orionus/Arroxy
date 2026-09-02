import type {SubtitleMode, SubtitleFormat, SponsorBlockMode, SponsorBlockCategory, UiTheme, BackdropRenderMode, NetworkPacingPreset, NativeAudioPreference, HotkeyAccelerator} from './schemas.js'
import type {AppSettings} from './types.js'
import {DEFAULT_FILENAME_TEMPLATE} from './filenameTemplate.js'

export const DISCORD_URL = 'https://discord.gg/ueGvXwQH8y'

// Windows AppUserModelID. Must stay identical to `appId` in electron-builder.json5:
// the NSIS installer stamps that value onto the Start Menu shortcut, and Windows
// only renders a toast whose declared AUMID matches a registered shortcut. A
// mismatch drops every notification silently. Pinned by a test in
// tests/unit/release-asset-names.test.ts.
export const WINDOWS_APP_USER_MODEL_ID = 'com.arroxy.app'

// Defaults — single source. Anywhere that needs a fallback for a missing field
// (initial state, persistence migration, test fixtures, IPC fallback) must
// import from here so changes propagate everywhere.
export const DEFAULTS: {
	subtitleMode: SubtitleMode
	subtitleFormat: SubtitleFormat
	sponsorBlockMode: SponsorBlockMode
	sponsorBlockCategories: SponsorBlockCategory[]
	uiZoom: number
	uiTheme: UiTheme
	backdropRenderMode: BackdropRenderMode
	nativeAudioPreference: NativeAudioPreference
	hotkeyEnabled: boolean
	hotkeyAccelerator: HotkeyAccelerator
	embedChapters: boolean
	embedMetadata: boolean
	embedThumbnail: boolean
	writeDescription: boolean
	writeThumbnail: boolean
	writeM3u: boolean
	filenameTemplate: string
} = {
	subtitleMode: 'sidecar',
	subtitleFormat: 'srt',
	sponsorBlockMode: 'off',
	sponsorBlockCategories: ['sponsor', 'selfpromo'],
	uiZoom: 1,
	uiTheme: 'system',
	backdropRenderMode: 'gpu',
	nativeAudioPreference: 'compatible',
	embedChapters: true,
	embedMetadata: true,
	embedThumbnail: false,
	writeDescription: false,
	writeThumbnail: false,
	writeM3u: true,
	hotkeyEnabled: false,
	filenameTemplate: DEFAULT_FILENAME_TEMPLATE,
	hotkeyAccelerator: 'CommandOrControl+Shift+D'
}

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
			hotkeyEnabled: DEFAULTS.hotkeyEnabled,
			hotkeyAccelerator: DEFAULTS.hotkeyAccelerator,
			analyticsEnabled: true,
			filenameTemplate: DEFAULTS.filenameTemplate,
			backdropRenderMode: DEFAULTS.backdropRenderMode,
			nativeAudioPreference: DEFAULTS.nativeAudioPreference
		},
		single: {},
		playlist: {},
		profiles: {active: {kind: 'builtin', id: 'balanced'}, custom: [], overrides: []}
	}
}

export const WINDOW_MIN_WIDTH = 720
export const WINDOW_MIN_HEIGHT = 760
export const WINDOW_DEFAULT_WIDTH = 1024
export const WINDOW_DEFAULT_HEIGHT = 860

// YouTube buckets `live_chat` into `subtitles` even though it isn't a caption
// track. Both probe-side filtering and renderer-side display filter it out.
export const LIVE_CHAT_LANG = 'live_chat'

// Queue concurrency policy. `NORMAL_LANE_CAP` is the steady-state cap for
// non-priority items — one at a time, with INTER_JOB_SLEEP_MS between jobs
// so the next process does not spawn in the same burst. `MAX_CONCURRENT_DOWNLOADS`
// is the hard ceiling that even priority-lane spawns honor; protects the
// machine from resource storms and bot-detection escalation.
export const NORMAL_LANE_CAP = 1
export const MAX_CONCURRENT_DOWNLOADS = 4
export const INTER_JOB_SLEEP_MS = 500

// How many spawn slots stay reserved above the normal-lane cap so a "pull now"
// priority item can still start while the normal lane is saturated. Derived
// from the historical fixed pair (cap 1, ceiling 4) so the default behaves
// exactly as before, and scales with a user-raised cap instead of squeezing
// the priority lane out.
export const PRIORITY_LANE_HEADROOM = MAX_CONCURRENT_DOWNLOADS - NORMAL_LANE_CAP

export const DEFAULT_PLAYLIST_PROBE_LIMIT = 100
export const PLAYLIST_PROBE_LIMIT_PRESETS = [50, 100, 250, 500, 1000] as const

export interface NetworkPacingArgs {
	sleepRequests?: number
	sleepInterval?: number
	maxSleepInterval?: number
	sleepSubtitles?: number
	concurrentFragments?: number
}

// Recommended value surfaced as the input placeholder. Not a default — the
// setting ships off, so behavior is unchanged until a user opts in.
export const RECOMMENDED_DOWNLOAD_CONNECTIONS = 4

// Placeholder shown in the auto-retry field. Like the connections
// recommendation, this is a suggestion the user opts into — the setting
// itself ships at 0 (off).
export const RECOMMENDED_AUTO_RETRY_ATTEMPTS = 3

// Pacing presets cover the sleep knobs only. Connection count is a throughput
// choice, not a politeness choice, so it lives in its own setting and applies
// under every preset.
export const NETWORK_PACING_PRESET_VALUES: Record<Exclude<NetworkPacingPreset, 'custom'>, NetworkPacingArgs> = {
	off: {sleepInterval: 1, maxSleepInterval: 3},
	balanced: {sleepRequests: 1, sleepInterval: 5, maxSleepInterval: 10, sleepSubtitles: 3},
	careful: {sleepRequests: 2, sleepInterval: 15, maxSleepInterval: 45, sleepSubtitles: 5}
}
