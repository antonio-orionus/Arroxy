import {defaultAppSettings, DEFAULT_PLAYLIST_PROBE_LIMIT} from '@shared/constants.js'
import {YT_DLP_ERROR_KINDS} from '@shared/schemas.js'
import type {AppSettings, ProbeError, ProbeResult, QueueItem, UpdateAvailablePayload, WarmUpOutput} from '@shared/types.js'
import type {YtDlpErrorKind} from '@shared/schemas.js'
import type {BrowserMockKnobs} from './browserMockKnobs.js'
import type {AppState, SetState} from '../store/types.js'
import {bulkStressFixture, bulkStressState, type BulkStressFixture} from './scenarios/bulkScenarios.js'
import {buildProbeError, buildProbeResult, normalVideoProbe, playlistProbe, shouldMockEmptyPlaylistScopeReload} from './scenarios/probeScenarios.js'
import {buildQueueItems} from './scenarios/queueScenarios.js'
import {buildUpdate} from './scenarios/updateScenarios.js'
import {buildWarmUp} from './scenarios/diagnosticScenarios.js'

export const BROWSER_MOCK_LAUNCH_MODES = ['ready', 'cold-loading', 'cold-error'] as const
export type BrowserMockLaunchMode = (typeof BROWSER_MOCK_LAUNCH_MODES)[number]

export const BROWSER_MOCK_SCENARIO_IDS = [
	'default',
	'single-normal',
	'playlist-normal',
	'playlist-scope-empty-reload',
	'playlist-no-thumbnails',
	'playlist-long-titles',
	'bulk-stress',
	'profiles-home-empty',
	'profiles-home-clipboard-single',
	'profiles-home-clipboard-bulk',
	'profiles-split-menu',
	'profiles-editor',
	'profiles-bulk',
	'profiles-playlist-cap',
	'probe-audio-only',
	'probe-with-subtitles',
	'probe-no-formats',
	'probe-live-stream',
	'dialog-mixed-url',
	'dialog-cookies-issue',
	'update-direct',
	'update-homebrew',
	'update-scoop',
	'update-portable',
	'update-darwin-dmg',
	'update-winget',
	'update-flatpak',
	'update-none',
	'queue-empty',
	'queue-running',
	'queue-paused-active',
	'queue-paused-held',
	'queue-cancelled',
	'queue-error',
	'queue-completed',
	'queue-subtitles-failed',
	'queue-multi',
	'diagnostics-all-ok',
	'diagnostics-ytdlp-missing',
	'diagnostics-ffmpeg-broken',
	'diagnostics-deno-missing',
	'diagnostics-ffprobe-broken',
	'diagnostics-all-missing',
	'diagnostics-warmup-running'
] as const

export type BrowserMockScenarioId = (typeof BROWSER_MOCK_SCENARIO_IDS)[number]
export type BrowserMockScenarioGroup = 'General' | 'Playlist' | 'Profiles' | 'Probe Results' | 'Probe Errors' | 'Dialogs' | 'Updates' | 'Queue' | 'Diagnostics'
type ScenarioKind = 'default' | 'probe' | 'bulk' | 'profile' | 'queue' | 'update' | 'diagnostics' | 'dialog'

const SINGLE_NORMAL_MOCK_STEPS = ['formats', 'subtitles', 'sponsorblock', 'output', 'folder', 'confirm'] as const
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
	probeResult: ProbeResult | null
	probeError: ProbeError | null
	queueItems: QueueItem[]
	update: UpdateAvailablePayload | null
	warmUp: WarmUpOutput
}

export interface BrowserMockUrlParams {
	playlistCount: number | null
	probeErrorKind: YtDlpErrorKind | null
	mockStep: BrowserMockStep | null
}

export interface ScenarioWorkbenchStore {
	reset: AppState['reset']
	setWizardUrl: AppState['setWizardUrl']
	submitUrl: AppState['submitUrl']
	setState: SetState
}

export {bulkStressFixture, normalVideoProbe, playlistProbe, shouldMockEmptyPlaylistScopeReload}
export type {BulkStressFixture}

export function readUrlParams(location: Pick<Location, 'search'> | URL): BrowserMockUrlParams {
	const params = new URLSearchParams(location.search.replace(/^\?/, ''))
	const rawCount = params.get('playlist')
	const parsedCount = rawCount !== null ? parseInt(rawCount, 10) : NaN
	const playlistCount = Number.isInteger(parsedCount) && parsedCount > 0 ? parsedCount : null

	const rawKind = params.get('probeError')
	const probeErrorKind = rawKind !== null && (YT_DLP_ERROR_KINDS as readonly string[]).includes(rawKind) ? (rawKind as YtDlpErrorKind) : null

	const rawStep = params.get('mockStep')
	const mockStep = rawStep !== null && (BROWSER_MOCK_STEPS as readonly string[]).includes(rawStep) ? (rawStep as BrowserMockStep) : null

	return {playlistCount, probeErrorKind, mockStep}
}

const COMMON_PATHS = {downloads: '/home/user/Downloads', videos: '/home/user/Videos', desktop: '/home/user/Desktop', music: '/home/user/Music', documents: '/home/user/Documents', pictures: '/home/user/Pictures', home: '/home/user'} as const

const WIN_COMMON_PATHS = {downloads: 'C:\\Users\\User\\Downloads', videos: 'C:\\Users\\User\\Videos', desktop: 'C:\\Users\\User\\Desktop', music: 'C:\\Users\\User\\Music', documents: 'C:\\Users\\User\\Documents', pictures: 'C:\\Users\\User\\Pictures', home: 'C:\\Users\\User'} as const

export const BROWSER_MOCK_SCENARIOS: readonly BrowserMockScenario[] = [
	{id: 'default', group: 'General', title: 'Default app', description: 'Standard mock video flow and clean queue.', kind: 'default'},
	{id: 'single-normal', group: 'General', title: 'Single video normal', description: 'Screen preset for a YouTube video with formats, subtitles, and SponsorBlock steps.', kind: 'probe'},
	{id: 'playlist-normal', group: 'Playlist', title: 'Playlist normal', description: 'Screen preset for a playlist with thumbnails, durations, and default preset selection.', kind: 'probe'},
	{id: 'playlist-scope-empty-reload', group: 'Playlist', title: 'Scope reload empty', description: 'Playlist opens normally; applying any non-default scope reload returns no entries and should stay inline.', kind: 'probe'},
	{id: 'playlist-no-thumbnails', group: 'Playlist', title: 'No thumbnails', description: 'Playlist rows with no thumbnail column.', kind: 'probe'},
	{id: 'playlist-long-titles', group: 'Playlist', title: 'Long titles', description: 'Playlist rows with intentionally long titles.', kind: 'probe'},
	{id: 'bulk-stress', group: 'Playlist', title: 'Bulk stress', description: 'Visual fixture for 50 bulk URL rows with long duplicate titles, missing thumbnails, and mixed metadata states.', kind: 'bulk'},
	{id: 'profiles-home-empty', group: 'Profiles', title: 'Profiles home', description: 'Redesigned main screen with active built-in profile and no dialog open.', kind: 'profile'},
	{id: 'profiles-home-clipboard-single', group: 'Profiles', title: 'Clipboard single', description: 'Profile home with one clipboard-detected link prefilled.', kind: 'profile'},
	{id: 'profiles-home-clipboard-bulk', group: 'Profiles', title: 'Clipboard bulk', description: 'Profile home after several clipboard links were detected; the first link is prefilled.', kind: 'profile'},
	{id: 'profiles-split-menu', group: 'Profiles', title: 'Profile menu', description: 'Quick Download profile picker opened.', kind: 'profile'},
	{id: 'profiles-editor', group: 'Profiles', title: 'Profile editor', description: 'New profile form opened in a dialog.', kind: 'profile'},
	{id: 'profiles-bulk', group: 'Profiles', title: 'Bulk URLs dialog', description: 'Bulk URLs dialog opened from the redesigned main screen.', kind: 'profile'},
	{id: 'profiles-playlist-cap', group: 'Profiles', title: 'Playlist cap dialog', description: 'Quick Download playlist probe limit confirmation.', kind: 'profile'},
	{id: 'probe-audio-only', group: 'Probe Results', title: 'Audio only source', description: 'isAudioOnlySource:true - wizard defaults to audio-only mode (Bandcamp/SoundCloud-like extractor).', kind: 'probe'},
	{id: 'probe-with-subtitles', group: 'Probe Results', title: 'With subtitles', description: 'Video with manual subtitle tracks and auto-caption pool.', kind: 'probe'},
	{id: 'probe-no-formats', group: 'Probe Results', title: 'No formats', description: 'Video probe returns empty formats array - tests graceful empty state in the format picker.', kind: 'probe'},
	{id: 'probe-live-stream', group: 'Probe Results', title: 'Live stream', description: 'isLive:true - live-stream indicator and format restrictions should show.', kind: 'probe'},
	{id: 'dialog-mixed-url', group: 'Dialogs', title: 'Mixed URL prompt', description: 'Opens the "You pasted multiple URLs" confirmation dialog at startup.', kind: 'dialog'},
	{id: 'dialog-cookies-issue', group: 'Dialogs', title: 'Cookies config issue', description: 'Triggers the cookies config issue dialog (file mode, missing path).', kind: 'dialog'},
	{id: 'update-direct', group: 'Updates', title: 'Direct update', description: 'Install & Restart action (Win/Linux direct install).', kind: 'update'},
	{id: 'update-darwin-dmg', group: 'Updates', title: 'Darwin DMG', description: 'Direct channel on macOS - shows Download link. Use platform=mac knob to activate darwin path.', kind: 'update'},
	{id: 'update-winget', group: 'Updates', title: 'Winget', description: 'Winget channel - Install & Restart action.', kind: 'update'},
	{id: 'update-homebrew', group: 'Updates', title: 'Homebrew update', description: 'Copy Homebrew upgrade command.', kind: 'update'},
	{id: 'update-scoop', group: 'Updates', title: 'Scoop update', description: 'Copy Scoop upgrade command.', kind: 'update'},
	{id: 'update-portable', group: 'Updates', title: 'Portable update', description: 'Download link action.', kind: 'update'},
	{id: 'update-flatpak', group: 'Updates', title: 'Flatpak', description: 'Flatpak channel - copy update command.', kind: 'update'},
	{id: 'update-none', group: 'Updates', title: 'No update', description: 'No update available - banner is hidden.', kind: 'update'},
	{id: 'queue-empty', group: 'Queue', title: 'Empty queue', description: 'No queue items.', kind: 'queue'},
	{id: 'queue-running', group: 'Queue', title: 'Running item', description: 'Drawer with an active download.', kind: 'queue'},
	{id: 'queue-paused-active', group: 'Queue', title: 'Paused active', description: 'Drawer with a resumable active pause (had running job, was paused).', kind: 'queue'},
	{id: 'queue-paused-held', group: 'Queue', title: 'Paused held', description: 'Drawer with a paused-held item (queued but never started, resume -> pending).', kind: 'queue'},
	{id: 'queue-cancelled', group: 'Queue', title: 'Cancelled', description: 'Drawer with a cancelled item.', kind: 'queue'},
	{id: 'queue-error', group: 'Queue', title: 'Failed item', description: 'Drawer with a failed item and error detail.', kind: 'queue'},
	{id: 'queue-completed', group: 'Queue', title: 'Completed item', description: 'Drawer with completed download controls.', kind: 'queue'},
	{id: 'queue-subtitles-failed', group: 'Queue', title: 'Subtitles failed', description: 'Done item where subtitle download soft-failed - video was saved, subtitles were not.', kind: 'queue'},
	{id: 'queue-multi', group: 'Queue', title: 'Multi-item queue', description: 'Mixed statuses (running, pending, paused-held, done, error, cancelled) - exercises scroll and multi-item controls.', kind: 'queue'},
	{id: 'diagnostics-all-ok', group: 'Diagnostics', title: 'All OK', description: 'Runnable dependency diagnostics.', kind: 'diagnostics'},
	{id: 'diagnostics-ytdlp-missing', group: 'Diagnostics', title: 'yt-dlp missing', description: 'Blocking yt-dlp setup failure.', kind: 'diagnostics'},
	{id: 'diagnostics-ffmpeg-broken', group: 'Diagnostics', title: 'ffmpeg broken', description: 'Blocking ffmpeg setup failure.', kind: 'diagnostics'},
	{id: 'diagnostics-deno-missing', group: 'Diagnostics', title: 'deno missing', description: 'Blocking deno download failure.', kind: 'diagnostics'},
	{id: 'diagnostics-ffprobe-broken', group: 'Diagnostics', title: 'ffprobe broken', description: 'Blocking ffprobe probe failure (bad exit code).', kind: 'diagnostics'},
	{id: 'diagnostics-all-missing', group: 'Diagnostics', title: 'All missing', description: 'Fresh-install state - all four binaries failed; all are blocking.', kind: 'diagnostics'},
	{id: 'diagnostics-warmup-running', group: 'Diagnostics', title: 'Non-blocking failure', description: 'Deno failed (download_failed) but not blocking - app proceeds, diagnostics panel shows soft warning.', kind: 'diagnostics'}
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
	return {scenario, settings, probeResult: buildProbeResult(scenario, params), probeError: buildProbeError(scenario, params), queueItems: buildQueueItems(scenario), update: buildUpdate(scenario), warmUp: buildWarmUp(scenario)}
}

const PROFILE_SINGLE_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
const PROFILE_BULK_URLS = ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://www.youtube.com/watch?v=jNQXAC9IVRw', 'https://www.youtube.com/watch?v=oHg5SJYRHA0'] as const

function profileScenarioPatch(scenario: BrowserMockScenario): Partial<AppState> {
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

export async function applyScenarioWorkbenchState(input: {scenario: BrowserMockScenario; params: BrowserMockUrlParams; store: ScenarioWorkbenchStore}): Promise<void> {
	const {scenario, params, store} = input
	if (scenario.kind === 'probe' || params.playlistCount !== null || params.probeErrorKind !== null) {
		store.reset()
		store.setWizardUrl(`https://example.com/${scenario.id}`)
		await store.submitUrl()
		const targetStep = mockStepForScenario(scenario, params.mockStep)
		if (targetStep !== null) store.setState({wizardStep: targetStep})
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
	if (scenario.kind === 'dialog') {
		if (scenario.id === 'dialog-mixed-url') {
			store.setState({mixedUrlPromptOpen: true, mixedUrlPending: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ\nhttps://www.youtube.com/watch?v=jNQXAC9IVRw'})
		} else if (scenario.id === 'dialog-cookies-issue') {
			store.setState({cookiesConfigDialogIssue: 'file-missing-path'})
		}
	}
}

function buildSettings(scenario: BrowserMockScenario, knobs?: BrowserMockKnobs): AppSettings {
	const base = defaultAppSettings('/home/user/Downloads')
	const queueOpen = scenario.group === 'Queue' && scenario.id !== 'queue-empty'
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
			drawerOpen: queueOpen,
			commonPaths,
			...(knobs?.theme !== null && knobs?.theme !== undefined ? {uiTheme: knobs.theme} : {})
		}
	}
}
