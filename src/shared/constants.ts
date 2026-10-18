import type {SubtitleMode, SubtitleFormat, SponsorBlockMode, SponsorBlockCategory, UiTheme, UiStyle, NetworkPacingPreset, NativeAudioPreference, HdrSetting, HotkeyAccelerator} from './schemas.js'
import type {AppSettings} from './types.js'
import {DEFAULT_FILENAME_TEMPLATE} from './filenameTemplate.js'

export const DISCORD_URL = 'https://discord.gg/ueGvXwQH8y'

// Public landing site. The old host (arroxy.orionus.dev) 301s here, so links in
// earlier releases keep working.
export const WEBSITE_URL = 'https://orionus.dev/arroxy/'

// GitHub Releases; one release's page is `${RELEASES_URL}/tag/v<version>`.
export const RELEASES_URL = 'https://github.com/antonio-orionus/Arroxy/releases'

// Donation addresses. DONATE.md is the canonical source and
// scripts/check-donation-addresses.mjs pins them in CI: a changed character
// silently redirects real money, so edit all three together or not at all.
export const DONATION_ADDRESSES = [
	{id: 'btc', label: 'Bitcoin', network: 'Bitcoin mainnet', address: 'bc1qe9yt5tfxam76duht6zu4nlurhhrpt0u5gfxglu'},
	{id: 'usdt-trc20', label: 'USDT / TRX', network: 'Tron (TRC-20)', address: 'TCigPD799TZmGuvZx5p1DcifGDL4ML7XKA'},
	{id: 'eth', label: 'Ethereum', network: 'Ethereum mainnet', address: '0x3bDD7Cbf171AF6600c35Fb75Ce4f06B28b094387'}
] as const

// The cask lives in Arroxy's own tap, not in Homebrew's official one. The fully
// qualified name lets `brew install` tap it on the fly; the short name `arroxy`
// only resolves once the tap is already added.
export const HOMEBREW_CASK = 'antonio-orionus/arroxy/arroxy'

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
	uiStyle: UiStyle
	nativeAudioPreference: NativeAudioPreference
	hdrPreference: HdrSetting
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
	uiStyle: 'aurora',
	nativeAudioPreference: 'compatible',
	hdrPreference: 'auto',
	embedChapters: true,
	embedMetadata: true,
	embedThumbnail: false,
	writeDescription: false,
	writeThumbnail: false,
	writeM3u: true,
	hotkeyEnabled: true,
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
			uiStyle: DEFAULTS.uiStyle,
			nativeAudioPreference: DEFAULTS.nativeAudioPreference,
			hdrPreference: DEFAULTS.hdrPreference
		},
		playlist: {},
		profiles: {active: {kind: 'builtin', id: 'balanced'}, custom: [], overrides: [], enabledOverrides: {}}
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

// How long a finished download stays in the list before "remove completed
// downloads automatically" takes it out: long enough to see it succeed and reach
// for Open folder, short enough that the list stays clear.
export const AUTO_REMOVE_COMPLETED_DELAY_MS = 5_000

// Per-probe wall-clock budget for metadata probes (--dump-json), shared by the
// interactive wizard probe, renderer-side bulk/playlist hydration, and the
// main-process queue title backfill. Probes should never legitimately take this
// long; without a cap a stalled yt-dlp run (extractor giving up but not
// exiting) freezes the caller indefinitely. 180s because throttled links
// measured ~110s per item and ~50s for flat probes, so a tighter budget would
// kill exactly the probes these layers exist for.
export const PROBE_TIMEOUT_MS = 180_000

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
