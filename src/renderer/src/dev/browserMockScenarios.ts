import {defaultAppSettings, DEFAULT_PLAYLIST_PROBE_LIMIT} from '@shared/constants.js'
import {YT_DLP_ERROR_KINDS} from '@shared/schemas.js'
import type {AppSettings, DownloadProfileRef, ExploreViewState, ProbeResult, QueueItem, UpdateAvailablePayload, WarmUpOutput} from '@shared/types.js'
import type {YtDlpErrorKind} from '@shared/schemas.js'
import type {BrowserMockKnobs} from './browserMockKnobs.js'
import type {AppState} from '../store/types.js'
import {bulkStressFixture, bulkStressState} from './scenarios/bulkScenarios.js'
import {bilibiliHydrationVideo, buildProbeResult, normalVideoProbe, playlistProbe, shouldMockEmptyPlaylistScopeReload} from './scenarios/probeScenarios.js'
import {ATTENTION_SCENARIO_FAILED_URL, ATTENTION_SCENARIO_ROWS, buildQueueItems, QUICK_DOWNLOAD_SCENARIO_ROWS} from './scenarios/queueScenarios.js'
import {buildUpdate} from './scenarios/updateScenarios.js'
import {buildWarmUp} from './scenarios/diagnosticScenarios.js'
import {buildExploreView, exploreProfilesPatch, exploreSettingsPatch} from './scenarios/exploreScenarios.js'
import {replaceHash} from '@renderer/lib/navigation.js'
import {BUILTIN_DOWNLOAD_PROFILES} from '@shared/downloadProfiles.js'
import {PROBE_SOURCES} from './probeSources/sources.js'
import {profilePatch} from '../store/wizard/wizardProfileState.js'
import {notify} from '@renderer/lib/notify.js'

export const BROWSER_MOCK_LAUNCH_MODES = ['ready', 'cold-loading', 'cold-error'] as const
export type BrowserMockLaunchMode = (typeof BROWSER_MOCK_LAUNCH_MODES)[number]

export const BROWSER_MOCK_SCENARIO_IDS = [
	'default',
	'single-normal',
	'single-review-subtitles',
	'single-review-returning',
	'single-subtitles-kind',
	'single-profile-misfit',
	'single-codec-mix',
	'single-part',
	'playlist-normal',
	'playlist-loading',
	'playlist-multi-profile',
	'playlist-multi-profile-scale',
	'playlist-scope-empty-reload',
	'playlist-no-thumbnails',
	'playlist-long-titles',
	'playlist-nested',
	'playlist-hydration',
	'bulk-stress',
	'profiles-home-empty',
	'hotkey-hint',
	'hotkey-conflict',
	'profiles-home-clipboard-single',
	'profiles-home-clipboard-bulk',
	'profiles-split-menu',
	'profiles-editor',
	'profiles-bulk',
	'profiles-bulk-huge-input',
	'profiles-playlist-cap',
	'probe-audio-only',
	'probe-audio-multilingual',
	'probe-audio-surround',
	'probe-audio-stereo',
	'probe-with-subtitles',
	'probe-no-formats',
	'probe-rate-limited',
	'probe-live-stream',
	...PROBE_SOURCES.map(source => `source-${source.id}` as const),
	'dialog-mixed-url',
	'dialog-cookies-issue',
	'update-direct',
	'update-homebrew',
	'update-scoop',
	'update-portable',
	'update-darwin-dmg',
	'update-darwin-dmg-homebrew',
	'update-winget',
	'update-flatpak',
	'update-whats-new',
	'update-whats-new-catchup',
	'update-none',
	'queue-tab-tip',
	'queue-active',
	'queue-parallel',
	'queue-pending',
	'queue-scheduler-paused',
	'queue-mixed-selection',
	'queue-artifacts',
	'queue-errors',
	'queue-notices',
	'queue-columns',
	'queue-large',
	'queue-quick-download',
	'queue-attention',
	'diagnostics-all-ok',
	'diagnostics-ytdlp-missing',
	'diagnostics-ffmpeg-broken',
	'diagnostics-ffprobe-broken',
	'diagnostics-all-missing',
	'diagnostics-warmup-running',
	'setup-first-run',
	'setup-media-update',
	'setup-unpacking',
	'repair-offline',
	'repair-mixed',
	'explore-notice',
	'explore-browsing',
	'explore-long-profile',
	'explore-nudge',
	'explore-proxy-error',
	'explore-adblock-on',
	'explore-adblock-unavailable',
	'explore-address-refused'
] as const

export type BrowserMockScenarioId = (typeof BROWSER_MOCK_SCENARIO_IDS)[number]

// The single-video screens that need more than a probe to show.
function applySingleScenario(id: string, store: ScenarioWorkbenchStore): void {
	if (id === 'single-review-subtitles') store.openReview('subtitles')
	if (id === 'single-review-returning') {
		store.setState({wizardWriteThumbnail: true, wizardSponsorBlockMode: 'remove'})
		store.openReview('extras')
	}
	if (id === 'single-subtitles-kind') store.setWizardMediaKind('subtitles')
	if (id === 'single-part') store.setState({wizardPart: {start: '1:35', end: '5:52', exactCut: false}})
	if (id === 'single-codec-mix') {
		const fullHd = BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'hd-1080')
		if (fullHd) store.setState(profilePatch(fullHd, store.getState()))
	}
	if (id === 'single-profile-misfit') {
		const fullHd = BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'hd-1080')
		if (fullHd) store.setState(profilePatch({...fullHd, name: 'Full HD + English subs', subtitles: {...fullHd.subtitles, enabled: true, languages: ['en']}}, store.getState()))
	}
}
export type BrowserMockScenarioGroup = 'General' | 'Playlist' | 'Profiles' | 'Probe Results' | 'Real sites' | 'Probe Errors' | 'Dialogs' | 'Updates' | 'Queue' | 'Diagnostics' | 'Explore'
type ScenarioKind = 'default' | 'probe' | 'bulk' | 'profile' | 'queue' | 'update' | 'diagnostics' | 'dialog' | 'state' | 'explore'
const PROBE_ERROR_TARGETS = ['wizard', 'quick-download'] as const
export type ProbeErrorTarget = (typeof PROBE_ERROR_TARGETS)[number]

const SINGLE_NORMAL_MOCK_STEPS = ['formats', 'confirm'] as const
const PLAYLIST_NORMAL_MOCK_STEPS = ['playlistItems', 'playlistPresets', 'sponsorblock', 'output', 'folder', 'confirm'] as const
const BROWSER_MOCK_STEPS = [...new Set([...SINGLE_NORMAL_MOCK_STEPS, ...PLAYLIST_NORMAL_MOCK_STEPS])] as const
export type BrowserMockStep = (typeof BROWSER_MOCK_STEPS)[number]

export interface BrowserMockScenario {
	id: BrowserMockScenarioId
	group: BrowserMockScenarioGroup
	title: string
	description: string
	kind: ScenarioKind
}

export interface BrowserMockState {
	scenario: BrowserMockScenario
	settings: AppSettings
	// null = derive registration from the settings; false = the chord is taken.
	hotkeyRegistered: boolean | null
	probeResult: ProbeResult | null
	queueItems: QueueItem[]
	schedulerPaused: boolean
	update: UpdateAvailablePayload | null
	warmUp: WarmUpOutput
	explore: ExploreViewState
	appVersion: string
}

export interface BrowserMockUrlParams {
	playlistCount: number | null
	probeErrorKind: YtDlpErrorKind | null
	probeErrorTarget: ProbeErrorTarget
	mockStep: BrowserMockStep | null
}

export interface ScenarioWorkbenchStore {
	reset: AppState['reset']
	setWizardUrl: AppState['setWizardUrl']
	submitUrl: AppState['submitUrl']
	quickDownload: AppState['quickDownload']
	showQueueItem: AppState['showQueueItem']
	retryQuickDownloadRow: AppState['retryQuickDownloadRow']
	openExploreSignIn: AppState['openExploreSignIn']
	openReview: AppState['openReview']
	setWizardMediaKind: AppState['setWizardMediaKind']
	getState: () => AppState
	// Scenarios only ever merge plain patches into the store.
	setState: (patch: Partial<AppState>) => void
}

export {bilibiliHydrationVideo, bulkStressFixture, normalVideoProbe, playlistProbe, shouldMockEmptyPlaylistScopeReload}

export function readUrlParams(location: Pick<Location, 'search'> | URL): BrowserMockUrlParams {
	const params = new URLSearchParams(location.search.replace(/^\?/, ''))
	const rawCount = params.get('playlist')
	const parsedCount = rawCount !== null ? parseInt(rawCount, 10) : NaN
	const playlistCount = Number.isInteger(parsedCount) && parsedCount > 0 ? parsedCount : null

	const rawKind = params.get('probeError')
	const probeErrorKind = rawKind !== null && (YT_DLP_ERROR_KINDS as readonly string[]).includes(rawKind) ? (rawKind as YtDlpErrorKind) : null
	const rawProbeTarget = params.get('probeErrorTarget')
	const probeErrorTarget: ProbeErrorTarget = rawProbeTarget === 'quick-download' ? 'quick-download' : 'wizard'

	const rawStep = params.get('mockStep')
	const mockStep = rawStep !== null && (BROWSER_MOCK_STEPS as readonly string[]).includes(rawStep) ? (rawStep as BrowserMockStep) : null

	return {playlistCount, probeErrorKind, probeErrorTarget, mockStep}
}

const COMMON_PATHS = {downloads: '/home/user/Downloads', videos: '/home/user/Videos', desktop: '/home/user/Desktop', music: '/home/user/Music', documents: '/home/user/Documents', pictures: '/home/user/Pictures', home: '/home/user'} as const

const WIN_COMMON_PATHS = {downloads: 'C:\\Users\\User\\Downloads', videos: 'C:\\Users\\User\\Videos', desktop: 'C:\\Users\\User\\Desktop', music: 'C:\\Users\\User\\Music', documents: 'C:\\Users\\User\\Documents', pictures: 'C:\\Users\\User\\Pictures', home: 'C:\\Users\\User'} as const

export const BROWSER_MOCK_SCENARIOS: readonly BrowserMockScenario[] = [
	{id: 'default', group: 'General', title: 'Default app', description: 'Standard mock video flow and clean queue.', kind: 'default'},
	{id: 'single-normal', group: 'General', title: 'Single video normal', description: 'A YouTube video on the Format screen, pre-selected from the active profile; mockStep=confirm opens the Review.', kind: 'probe'},
	{id: 'single-review-returning', group: 'General', title: 'Review: returning user, edited', description: 'Review for someone who downloaded before: the one-page callout on top, Extras unfolded, and two edits (Save thumbnail, SponsorBlock remove) so the bar offers Update profile or Save as new.', kind: 'probe'},
	{id: 'single-review-subtitles', group: 'General', title: 'Review: subtitles row open', description: 'Review screen with the Subtitles row open in place: search, uploaded and auto-generated languages.', kind: 'probe'},
	{id: 'single-subtitles-kind', group: 'General', title: 'Subtitles only', description: 'Format screen switched to Subtitles: the language picker replaces the stream lists.', kind: 'probe'},
	{id: 'single-codec-mix', group: 'General', title: 'Codecs and file type', description: 'A 4K HDR video offered as AV1, VP9 and H.264: the codec in each row, the Why this one tip on the Profile badge, and the Saves as menu following the picked streams.', kind: 'probe'},
	{id: 'single-profile-misfit', group: 'General', title: 'Profile does not fit', description: 'A Full HD profile with English subtitles on a 480p video without subtitles: the fit notices and "Closest to profile" pick.', kind: 'probe'},
	{id: 'single-part', group: 'General', title: 'Part of video', description: 'A chaptered talk opened from a link with t=3:52: the Part panel with range bar, chapter marks and chips, Start/End, exact cut, and the offered link start.', kind: 'probe'},
	{id: 'playlist-normal', group: 'Playlist', title: 'Playlist normal', description: 'Screen preset for a playlist with thumbnails, durations, and default preset selection.', kind: 'probe'},
	{id: 'playlist-loading', group: 'Playlist', title: 'Playlist loading scaffold', description: 'Playlist loading state with the final controls and full-width row skeletons visible.', kind: 'state'},
	{id: 'playlist-multi-profile', group: 'Playlist', title: 'Playlist multi-profile', description: 'Playlist profiles step landing directly, with 17 items already split across the baseline, audio-only, and Full HD 1080p profiles.', kind: 'state'},
	{id: 'playlist-multi-profile-scale', group: 'Playlist', title: 'Playlist multi-profile at scale', description: 'Playlist profiles step with 500 mixed-assignment items for scroll and virtualization review.', kind: 'state'},
	{id: 'playlist-scope-empty-reload', group: 'Playlist', title: 'Scope reload empty', description: 'Playlist opens normally; applying any non-default scope reload returns no entries and should stay inline.', kind: 'probe'},
	{id: 'playlist-no-thumbnails', group: 'Playlist', title: 'No thumbnails', description: 'Playlist rows with no thumbnail column.', kind: 'probe'},
	{id: 'playlist-long-titles', group: 'Playlist', title: 'Long titles', description: 'Playlist rows with intentionally long titles.', kind: 'probe'},
	{id: 'playlist-nested', group: 'Playlist', title: 'Nested playlists', description: 'Rows that are themselves playlists/albums/channels: badged, disabled, and explained.', kind: 'probe'},
	{id: 'playlist-hydration', group: 'Playlist', title: 'Hydrating series', description: 'Bilibili-style series: placeholder rows resolve titles, thumbnails, and upload dates in the background (p5 fails, p7 stays dateless, dates are shuffled so the upload sort visibly reorders).', kind: 'probe'},
	{id: 'bulk-stress', group: 'Playlist', title: 'Bulk stress', description: 'Visual fixture for 50 bulk URL rows with long duplicate titles, missing thumbnails, and mixed metadata states.', kind: 'bulk'},
	{id: 'profiles-home-empty', group: 'Profiles', title: 'Profiles home', description: 'Redesigned main screen with active built-in profile and no dialog open.', kind: 'profile'},
	{id: 'hotkey-hint', group: 'Profiles', title: 'Quick Download hotkey hint', description: 'Quick Download card with the configured global hotkey enabled and registered.', kind: 'profile'},
	{id: 'hotkey-conflict', group: 'Profiles', title: 'Global hotkey conflict', description: 'Hotkey settings with the configured shortcut unavailable because another app owns it.', kind: 'profile'},
	{id: 'profiles-home-clipboard-single', group: 'Profiles', title: 'Clipboard single', description: 'Profile home with one clipboard-detected link prefilled.', kind: 'profile'},
	{id: 'profiles-home-clipboard-bulk', group: 'Profiles', title: 'Clipboard bulk', description: 'Profile home after several clipboard links were detected; the first link is prefilled.', kind: 'profile'},
	{id: 'profiles-split-menu', group: 'Profiles', title: 'Profile menu', description: 'Quick Download profile picker opened.', kind: 'profile'},
	{id: 'profiles-editor', group: 'Profiles', title: 'Profile editor', description: 'New profile form opened in a dialog.', kind: 'profile'},
	{id: 'profiles-bulk', group: 'Profiles', title: 'Bulk URLs dialog', description: 'Bulk URLs dialog opened from the redesigned main screen.', kind: 'profile'},
	{id: 'profiles-bulk-huge-input', group: 'Profiles', title: 'Bulk URLs huge input', description: 'Bulk URLs dialog seeded with a giant pasted log so textarea scrolling and dialog chrome stay visible.', kind: 'profile'},
	{id: 'profiles-playlist-cap', group: 'Profiles', title: 'Playlist cap dialog', description: 'Quick Download playlist probe limit confirmation.', kind: 'profile'},
	{id: 'probe-audio-only', group: 'Probe Results', title: 'Audio only source', description: 'isAudioOnlySource:true - wizard defaults to audio-only mode (Bandcamp/SoundCloud-like extractor).', kind: 'probe'},
	{id: 'probe-audio-multilingual', group: 'Probe Results', title: 'Audio multilingual', description: 'YouTube-like audio list with multiple spoken-language tracks, quality badges, and DRC variants.', kind: 'probe'},
	{id: 'probe-audio-surround', group: 'Probe Results', title: 'Audio surround', description: 'Audio list with high-quality 6ch Dolby tracks plus stereo fallbacks.', kind: 'probe'},
	{id: 'probe-audio-stereo', group: 'Probe Results', title: 'Audio stereo only', description: 'Audio list with no alternate language or surround tracks.', kind: 'probe'},
	{id: 'probe-with-subtitles', group: 'Probe Results', title: 'With subtitles', description: 'Video with manual subtitle tracks and auto-caption pool.', kind: 'probe'},
	{id: 'probe-rate-limited', group: 'Probe Results', title: 'Rate-limited probe', description: 'The site rate-limited part of the probe: the formats stay, with the rate-limit notice, when Arroxy asks the site again, and Try now (which lets the next probe through).', kind: 'probe'},
	{id: 'probe-no-formats', group: 'Probe Results', title: 'No formats', description: 'Video probe returns empty formats array - tests graceful empty state in the format picker.', kind: 'probe'},
	{id: 'probe-live-stream', group: 'Probe Results', title: 'Live stream', description: 'isLive:true - live-stream indicator and format restrictions should show.', kind: 'probe'},
	// Real probes kept as fixtures (`bun run probe-sources:capture`), mapped the way the app maps them.
	...PROBE_SOURCES.map((source): BrowserMockScenario => ({id: `source-${source.id}`, group: 'Real sites', title: source.id, description: source.shows, kind: 'probe'})),
	{id: 'dialog-mixed-url', group: 'Dialogs', title: 'Mixed URL prompt', description: 'Opens the "You pasted multiple URLs" confirmation dialog at startup.', kind: 'dialog'},
	{id: 'dialog-cookies-issue', group: 'Dialogs', title: 'Cookies config issue', description: 'Triggers the cookies config issue dialog (file mode, missing path).', kind: 'dialog'},
	{id: 'update-direct', group: 'Updates', title: 'Direct update', description: 'Install & Restart action (Win/Linux direct install).', kind: 'update'},
	{id: 'update-darwin-dmg', group: 'Updates', title: 'Darwin DMG', description: 'Direct channel on macOS - shows Download link. Use platform=mac knob to activate darwin path.', kind: 'update'},
	{id: 'update-darwin-dmg-homebrew', group: 'Updates', title: 'Darwin DMG + Homebrew', description: 'Direct channel on macOS with brew on the Mac - Download link plus the force-install command with Run. Use platform=darwin knob to activate darwin path.', kind: 'update'},
	{id: 'update-winget', group: 'Updates', title: 'Winget', description: 'Winget channel - Install & Restart action.', kind: 'update'},
	{id: 'update-homebrew', group: 'Updates', title: 'Homebrew update', description: 'Copy Homebrew upgrade command.', kind: 'update'},
	{id: 'update-scoop', group: 'Updates', title: 'Scoop update', description: 'Copy Scoop upgrade command.', kind: 'update'},
	{id: 'update-portable', group: 'Updates', title: 'Portable update', description: 'Download link action.', kind: 'update'},
	{id: 'update-flatpak', group: 'Updates', title: 'Flatpak', description: 'Flatpak channel - copy update command.', kind: 'update'},
	{id: 'update-whats-new', group: 'Updates', title: "What's New popup", description: 'First launch after an app version bump - opens the release-notes popup.', kind: 'update'},
	{id: 'update-whats-new-catchup', group: 'Updates', title: "What's New catch-up", description: 'User skipped several versions - the popup stacks every release they missed.', kind: 'update'},
	{id: 'update-none', group: 'Updates', title: 'No update', description: 'No update available - banner is hidden.', kind: 'update'},
	{id: 'queue-tab-tip', group: 'Queue', title: 'Downloads tab first-run tip', description: 'Mascot cue that points users to the new Downloads tab after their first queued item.', kind: 'queue'},
	{id: 'queue-active', group: 'Queue', title: 'Queue active', description: 'Running work, progress, and Downloads tab activity animation.', kind: 'queue'},
	{id: 'queue-parallel', group: 'Queue', title: 'Queue parallel', description: 'Three downloads in flight at different progress, one waiting, two finished.', kind: 'queue'},
	{id: 'queue-pending', group: 'Queue', title: 'Queue pending', description: 'Pending-only rows where Set location is enabled.', kind: 'queue'},
	{id: 'queue-scheduler-paused', group: 'Queue', title: 'Queue scheduler paused', description: 'Globally paused scheduler: pending rows wait behind the paused banner; Resume queue starts the mock queue.', kind: 'queue'},
	{id: 'queue-mixed-selection', group: 'Queue', title: 'Queue mixed selection', description: 'Mixed statuses for selected-action availability and disabled hints.', kind: 'queue'},
	{id: 'queue-artifacts', group: 'Queue', title: 'Queue artifacts', description: 'Visible user artifacts plus hidden internal artifacts.', kind: 'queue'},
	{id: 'queue-errors', group: 'Queue', title: 'Queue errors', description: 'Failed and cancelled rows for retry/remove states.', kind: 'queue'},
	{id: 'queue-notices', group: 'Queue', title: 'Queue completion notices', description: 'Finished rows carrying a quality-limit, subtitle, or combined notice.', kind: 'queue'},
	{id: 'queue-columns', group: 'Queue', title: 'Queue columns', description: 'Rows with varied timestamps for sorting and column visibility review.', kind: 'queue'},
	{id: 'queue-quick-download', group: 'Queue', title: 'Queue quick download', description: 'Quick download rows: probing with Cancel, a failed probe with its guidance, a capped playlist and a link to review waiting for a choice, and the toasts with actions.', kind: 'queue'},
	{id: 'queue-attention', group: 'Queue', title: 'Queue needs attention', description: 'Background quick downloads: one preparing, a private video that offers Sign in in Explore, a capped playlist waiting for a choice, the attention badge on the Downloads tab, and a failure toast with View and Retry.', kind: 'queue'},
	{id: 'queue-large', group: 'Queue', title: 'Queue large', description: '5,000 queued rows for virtualization and scroll performance review.', kind: 'queue'},
	{id: 'diagnostics-all-ok', group: 'Diagnostics', title: 'All OK', description: 'Runnable dependency diagnostics.', kind: 'diagnostics'},
	{id: 'diagnostics-ytdlp-missing', group: 'Diagnostics', title: 'yt-dlp missing', description: 'Blocking yt-dlp setup failure.', kind: 'diagnostics'},
	{id: 'diagnostics-ffmpeg-broken', group: 'Diagnostics', title: 'ffmpeg broken', description: 'Blocking ffmpeg setup failure.', kind: 'diagnostics'},
	{id: 'diagnostics-ffprobe-broken', group: 'Diagnostics', title: 'ffprobe broken', description: 'Blocking ffprobe probe failure (bad exit code).', kind: 'diagnostics'},
	{id: 'diagnostics-all-missing', group: 'Diagnostics', title: 'All missing', description: 'Fresh-install state - all setup dependencies failed; all are blocking.', kind: 'diagnostics'},
	{id: 'diagnostics-warmup-running', group: 'Diagnostics', title: 'Warmup running', description: 'Setup is still running without blocking failures.', kind: 'diagnostics'},
	{id: 'setup-first-run', group: 'Diagnostics', title: 'Setup: first launch', description: 'First launch downloads the download engine and the media tools package side by side; one bar, bytes and time left, one-time note.', kind: 'diagnostics'},
	{id: 'setup-media-update', group: 'Diagnostics', title: 'Setup: media tools update', description: 'A returning user downloads only the FFmpeg package, e.g. the first launch after the update that stopped bundling it.', kind: 'diagnostics'},
	{id: 'setup-unpacking', group: 'Diagnostics', title: 'Setup: unpacking', description: 'Downloads are done and the media tools package is being unpacked.', kind: 'diagnostics'},
	{id: 'repair-offline', group: 'Diagnostics', title: 'Repair: offline', description: 'Every tool failed to download for the same reason: one message, Try again first, manual setup collapsed.', kind: 'diagnostics'},
	{id: 'repair-mixed', group: 'Diagnostics', title: 'Repair: mixed causes', description: 'Antivirus blocked the download engine while the media tools failed to download: one line per cause.', kind: 'diagnostics'},
	{id: 'explore-notice', group: 'Explore', title: 'Explore first-run notice', description: 'First open of the Explore tab: an illustrated preview of Explore (toolbar with the Download split over an abstract video page) and the ban-risk notice show before any view exists.', kind: 'explore'},
	{id: 'explore-browsing', group: 'Explore', title: 'Explore browsing', description: 'Notice acknowledged and signed in: toolbar plus a loaded page (a neutral placeholder stands in for the native view).', kind: 'explore'},
	{id: 'explore-long-profile', group: 'Explore', title: 'Explore long profile name', description: 'A custom profile with a long name is active: the Download split truncates the name and keeps it whole in the native tooltip.', kind: 'explore'},
	{id: 'explore-nudge', group: 'Explore', title: 'Explore mode nudge', description: 'Cookies mode is not Explore, so the mode nudge sits above the toolbar.', kind: 'explore'},
	{id: 'explore-proxy-error', group: 'Explore', title: 'Explore proxy error', description: 'The view refuses to load because the proxy setting is invalid: the error surface replaces the page.', kind: 'explore'},
	{id: 'explore-adblock-on', group: 'Explore', title: 'Explore ad blocker on', description: 'The user turned the ad blocker on: the shield in the toolbar is pressed and Explore pages load filtered.', kind: 'explore'},
	{id: 'explore-adblock-unavailable', group: 'Explore', title: 'Explore ad blocker unavailable', description: "The ad blocker is on but its filter lists couldn't be downloaded: the shield warns and nothing is blocked.", kind: 'explore'},
	{id: 'explore-address-refused', group: 'Explore', title: 'Explore refused address', description: 'An address Explore does not load (another scheme, or a sign-in page) was typed in the address bar: the hint under the toolbar says so.', kind: 'explore'}
] as const

const SCENARIOS_BY_ID = new Map<string, BrowserMockScenario>(BROWSER_MOCK_SCENARIOS.map(scenario => [scenario.id, scenario]))

function isBrowserMockScenarioId(value: string | null): value is BrowserMockScenarioId {
	return value != null && (BROWSER_MOCK_SCENARIO_IDS as readonly string[]).includes(value)
}

export function readScenarioIdFromUrl(location: Pick<Location, 'search'> | URL): BrowserMockScenarioId | null {
	const value = new URLSearchParams(location.search.startsWith('?') ? location.search.slice(1) : location.search).get('scenario')
	return isBrowserMockScenarioId(value) ? value : null
}

export function getScenario(id: string | null | undefined): BrowserMockScenario {
	if (!id) return BROWSER_MOCK_SCENARIOS[0]
	return SCENARIOS_BY_ID.get(id) ?? BROWSER_MOCK_SCENARIOS[0]
}

export function shouldShowBrowserMockStartupSplash(input: {launchMode: BrowserMockLaunchMode; warmUp: Pick<WarmUpOutput, 'completed' | 'blockingFailures'>}): boolean {
	return input.launchMode !== 'ready' || !input.warmUp.completed || input.warmUp.blockingFailures.length > 0
}

export function isScreenPresetScenario(scenario: Pick<BrowserMockScenario, 'id'>): boolean {
	return scenario.id === 'single-normal' || scenario.id === 'playlist-normal' || scenario.id === 'playlist-scope-empty-reload'
}

export function mockStepForScenario(scenario: Pick<BrowserMockScenario, 'id'>, step: BrowserMockStep | null): BrowserMockStep | null {
	if (step === null) return null
	if (scenario.id === 'single-normal' && (SINGLE_NORMAL_MOCK_STEPS as readonly string[]).includes(step)) return step
	if ((scenario.id === 'playlist-normal' || scenario.id === 'playlist-scope-empty-reload') && (PLAYLIST_NORMAL_MOCK_STEPS as readonly string[]).includes(step)) return step
	return null
}

export function mockStepsForScenario(scenario: Pick<BrowserMockScenario, 'id'>): readonly BrowserMockStep[] {
	if (scenario.id === 'single-normal') return SINGLE_NORMAL_MOCK_STEPS
	if (scenario.id === 'playlist-normal' || scenario.id === 'playlist-scope-empty-reload') return PLAYLIST_NORMAL_MOCK_STEPS
	return []
}

export function buildScenarioAppApiState(scenario: BrowserMockScenario, params?: BrowserMockUrlParams, knobs?: BrowserMockKnobs): BrowserMockState {
	const settings = buildSettings(scenario, knobs)
	const hotkeyRegistered = scenario.id === 'hotkey-conflict' ? false : null
	return {
		scenario,
		settings,
		hotkeyRegistered,
		probeResult: buildProbeResult(scenario, params),
		queueItems: buildQueueItems(scenario),
		schedulerPaused: scenario.id === 'queue-scheduler-paused',
		update: buildUpdate(scenario),
		warmUp: buildWarmUp(scenario),
		explore: buildExploreView(scenario),
		appVersion: buildAppVersion(scenario)
	}
}

function buildAppVersion(scenario: BrowserMockScenario): string {
	if (scenario.id === 'update-whats-new') return '0.4.0-beta.5'
	if (scenario.id === 'update-whats-new-catchup') return '0.4.5'
	return '0.0.0-dev'
}

const PROFILE_SINGLE_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
const PROFILE_BULK_URLS = ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://www.youtube.com/watch?v=jNQXAC9IVRw', 'https://www.youtube.com/watch?v=oHg5SJYRHA0'] as const

function withMockProbeError(url: string, kind: YtDlpErrorKind): string {
	const next = new URL(url)
	next.searchParams.set('mockProbeError', kind)
	return next.toString()
}

function profileScenarioPatch(scenario: BrowserMockScenario): Partial<AppState> {
	if (scenario.id === 'hotkey-conflict') return {wizardStep: 'url', wizardUrl: '', advancedAutoOpen: true, advancedAutoTarget: 'hotkey'}
	if (scenario.id === 'profiles-home-clipboard-single') return {wizardStep: 'url', wizardUrl: PROFILE_SINGLE_URL}
	if (scenario.id === 'profiles-home-clipboard-bulk') return {wizardStep: 'url', wizardUrl: PROFILE_BULK_URLS[0]}
	if (scenario.id === 'profiles-split-menu') return {wizardStep: 'url', wizardUrl: PROFILE_SINGLE_URL}
	if (scenario.id === 'profiles-playlist-cap') {
		const playlist = playlistProbe(DEFAULT_PLAYLIST_PROBE_LIMIT, {webpageUrl: 'https://www.youtube.com/playlist?list=PLbrowsermock&items=100'})
		if (playlist.kind !== 'playlist') return {wizardStep: 'url', wizardUrl: ''}
		return {
			wizardStep: 'url',
			wizardMode: 'playlist',
			wizardUrl: playlist.webpageUrl,
			wizardExtractor: playlist.extractor,
			wizardExtractorKey: playlist.extractorKey,
			playlistItems: playlist.entries,
			selectedPlaylistItemIds: playlist.entries.map(entry => entry.id),
			playlistTitle: playlist.playlistTitle,
			playlistId: playlist.playlistId,
			playlistIsMultiVideo: true,
			playlistLikelyCapped: true,
			quickPlaylistCapDialogOpen: true
		}
	}
	return {wizardStep: 'url', wizardUrl: ''}
}

function playlistLoadingState(): Partial<AppState> {
	const url = 'https://example.com/mock-loading-playlist'
	return {
		wizardStep: 'playlistItems',
		wizardMode: 'playlist',
		wizardUrl: url,
		wizardExtractor: 'youtube:tab',
		wizardExtractorKey: 'YoutubeTab',
		playlistItems: [],
		selectedPlaylistItemIds: [],
		playlistTitle: '',
		playlistId: 'PLmock_loading',
		playlistIsMultiVideo: true,
		playlistLikelyCapped: false,
		playlistProbeLoading: true,
		playlistProbeProgress: {url, playlistMode: 'playlist', phase: 'pages', loaded: 33, at: new Date(0).toISOString()}
	}
}

// Runs `then` once `selector` is in the document (checked each frame, for up to ~5 s).
function whenRendered(selector: string, then: () => void): Promise<void> {
	return new Promise(resolve => {
		let frames = 0
		const check = (): void => {
			if (document.querySelector(selector) !== null || ++frames > 300) {
				then()
				resolve()
				return
			}
			requestAnimationFrame(check)
		}
		requestAnimationFrame(check)
	})
}

// The link the off-site address scenario typed (no request is ever made for it).

const MULTI_PROFILE_AUDIO_ONLY_REF: DownloadProfileRef = {kind: 'builtin', id: 'audio-only'}
const MULTI_PROFILE_HD_1080_REF: DownloadProfileRef = {kind: 'builtin', id: 'hd-1080'}
// Deviations only — a playlist item with no entry here implicitly uses the
// baseline (active) profile. See playlistProfileAssignments.ts.
const PLAYLIST_MULTI_PROFILE_AUDIO_IDS = ['mock2', 'mock5', 'mock8', 'mock11', 'mock14'] as const
const PLAYLIST_MULTI_PROFILE_HD_IDS = ['mock4', 'mock10', 'mock16'] as const

function playlistProfileAssignmentsState(playlist: ProbeResult, assignments: Record<string, DownloadProfileRef>): Partial<AppState> {
	if (playlist.kind !== 'playlist') return {wizardStep: 'url', wizardUrl: ''}
	return {
		wizardStep: 'playlistProfiles',
		wizardMode: 'playlist',
		wizardUrl: playlist.webpageUrl,
		wizardExtractor: playlist.extractor,
		wizardExtractorKey: playlist.extractorKey,
		playlistItems: playlist.entries,
		selectedPlaylistItemIds: playlist.entries.map(entry => entry.id),
		playlistTitle: playlist.playlistTitle,
		playlistId: playlist.playlistId,
		playlistIsMultiVideo: true,
		playlistLikelyCapped: false,
		multiProfileMode: true,
		playlistProfileAssignments: assignments
	}
}

function playlistMultiProfileState(): Partial<AppState> {
	const playlist = playlistProbe(17, {webpageUrl: 'https://www.youtube.com/playlist?list=PLmock_multiprofile'})
	const assignments: Record<string, DownloadProfileRef> = {}
	for (const id of PLAYLIST_MULTI_PROFILE_AUDIO_IDS) assignments[id] = MULTI_PROFILE_AUDIO_ONLY_REF
	for (const id of PLAYLIST_MULTI_PROFILE_HD_IDS) assignments[id] = MULTI_PROFILE_HD_1080_REF
	return playlistProfileAssignmentsState(playlist, assignments)
}

function playlistMultiProfileScaleState(): Partial<AppState> {
	const playlist = playlistProbe(500, {webpageUrl: 'https://www.youtube.com/playlist?list=PLmock_multiprofile_scale'})
	const assignments: Record<string, DownloadProfileRef> = {}
	if (playlist.kind === 'playlist') {
		for (const entry of playlist.entries) {
			if (entry.playlistIndex % 5 === 0) assignments[entry.id] = MULTI_PROFILE_AUDIO_ONLY_REF
			else if (entry.playlistIndex % 8 === 0) assignments[entry.id] = MULTI_PROFILE_HD_1080_REF
		}
	}
	return playlistProfileAssignmentsState(playlist, assignments)
}

export async function applyScenarioWorkbenchState(input: {scenario: BrowserMockScenario; params: BrowserMockUrlParams; store: ScenarioWorkbenchStore}): Promise<void> {
	const {scenario, params, store} = input
	if (params.probeErrorKind !== null) {
		store.reset()
		if (params.probeErrorTarget === 'quick-download') {
			// The failure lands on the row in Downloads, with its guidance.
			await store.quickDownload({url: withMockProbeError(PROFILE_SINGLE_URL, params.probeErrorKind), entry: 'url-tab'})
			return
		}
		store.setWizardUrl(withMockProbeError(`https://example.com/${scenario.id}`, params.probeErrorKind))
		await store.submitUrl()
		return
	}
	if (scenario.kind === 'probe' || params.playlistCount !== null) {
		store.reset()
		// The Part scenario's link carries a start time, which the Format screen offers.
		store.setWizardUrl(`https://example.com/${scenario.id}${scenario.id === 'single-part' ? '?t=232' : ''}`)
		await store.submitUrl()
		const targetStep = mockStepForScenario(scenario, params.mockStep)
		if (targetStep !== null) store.setState({wizardStep: targetStep})
		applySingleScenario(scenario.id, store)
		return
	}
	if (scenario.kind === 'bulk') {
		store.reset()
		store.setState(bulkStressState())
		return
	}
	if (scenario.kind === 'profile') {
		store.reset()
		store.setState(profileScenarioPatch(scenario))
		return
	}
	if (scenario.kind === 'state') {
		store.reset()
		if (scenario.id === 'playlist-loading') store.setState(playlistLoadingState())
		else if (scenario.id === 'playlist-multi-profile') store.setState(playlistMultiProfileState())
		else if (scenario.id === 'playlist-multi-profile-scale') store.setState(playlistMultiProfileScaleState())
		return
	}
	if (scenario.kind === 'explore') {
		store.reset()
		replaceHash('explore')
		// Leaving the Explore tab clears the hint, and StrictMode's mount-unmount-mount
		// in dev would too: the hint lands once the tab has mounted.
		if (scenario.id === 'explore-address-refused') await whenRendered('[data-testid="explore-toolbar"]', () => store.setState({exploreAddressHint: {kind: 'refused'}}))
		return
	}
	if (scenario.id === 'queue-quick-download') {
		announceQuickDownloadScenario(store)
		return
	}
	if (scenario.id === 'queue-attention') {
		// Signed out of Explore at home: the toast for an account-only failure offers the sign-in, as in the app.
		const {failed} = ATTENTION_SCENARIO_ROWS
		notify.quickDownloadFailed(failed, ATTENTION_SCENARIO_FAILED_URL, {kind: 'sign-in', run: () => store.openExploreSignIn({kind: 'youtube'})}, () => store.showQueueItem(failed))
		return
	}
	if (scenario.kind === 'dialog') {
		if (scenario.id === 'dialog-mixed-url') {
			store.setState({mixedUrlPromptOpen: true, mixedUrlPending: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ\nhttps://www.youtube.com/watch?v=jNQXAC9IVRw'})
		} else if (scenario.id === 'dialog-cookies-issue') {
			store.setState({cookiesConfigDialogIssue: 'file-missing-path'})
		}
	}
}

// The toasts a quick download raises, with their actions, over the rows they name.
function announceQuickDownloadScenario(store: ScenarioWorkbenchStore): void {
	const {probing, failed} = QUICK_DOWNLOAD_SCENARIO_ROWS
	notify.quickDownloadAdded('https://www.youtube.com/watch?v=jNQXAC9IVRw', () => store.showQueueItem(probing))
	notify.quickDownloadFailed(failed, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', {kind: 'retry', run: () => void store.retryQuickDownloadRow(failed)}, () => store.showQueueItem(failed))
}

function buildSettings(scenario: BrowserMockScenario, knobs?: BrowserMockKnobs): AppSettings {
	const base = defaultAppSettings('/home/user/Downloads')
	const platform = knobs?.platform ?? null
	const commonPaths = platform === 'win32' ? WIN_COMMON_PATHS : COMMON_PATHS
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
			commonPaths,
			...(scenario.id === 'hotkey-hint' || scenario.id === 'hotkey-conflict' ? {hotkeyEnabled: true, hotkeyAccelerator: 'CommandOrControl+Shift+D'} : {}),
			...(scenario.id === 'single-review-returning' ? {successfulDownloadCount: 12} : {}),
			...(scenario.id === 'update-whats-new' ? {launchCount: 3, lastReleaseNotesVersionShown: '0.4.0-beta.3'} : {}),
			...(scenario.id === 'update-whats-new-catchup' ? {launchCount: 9, lastReleaseNotesVersionShown: '0.4.2'} : {}),
			...(scenario.id === 'setup-media-update' ? {launchCount: 6} : {}),
			...exploreSettingsPatch(scenario),
			// Explore is set up but signed out, so the private video's row offers Sign in in Explore.
			...(scenario.id === 'queue-attention' ? {exploreEnabled: true, exploreNoticeSeen: true, cookiesMode: 'explore', exploreModeAutoSwitched: true} : {}),
			...(knobs?.theme !== null && knobs?.theme !== undefined ? {uiTheme: knobs.theme} : {}),
			...(knobs?.style ? {uiStyle: knobs.style} : {})
		},
		profiles: {...base.profiles, ...exploreProfilesPatch(scenario)}
	}
}
