import type {AppSettings, DependencyDiagnostic, DependencyId, DownloadProfile, DownloadProfileRef, HotkeyRegistrationStatus, HotkeyState} from '@shared/types.js'
import type {SettingsPatch} from '@shared/api.js'
import {DEFAULTS} from '@shared/constants.js'
import {DEFAULT_DOWNLOAD_PROFILES_PREFS, moveDownloadProfile as moveProfileInPrefs, normalizeDownloadProfilesPrefs, removeDownloadProfileFromPrefs, saveDownloadProfileToPrefs, setDownloadProfileEnabled as setProfileEnabledInPrefs} from '@shared/downloadProfiles.js'
import {i18next, isRtl} from '@shared/i18n/index.js'
import {systemLanguage} from '../systemLanguage.js'
import type {GetState, SetState, SystemSlice} from './types.js'
import {bindQueueProjection, projectQueueSnapshot} from './queueProjection.js'
import {bindCopiedLinks, bindOpenedLinks} from './wizard/copiedLinkIntake.js'
import {bindIntakeEvents} from './quickDownload/quickDownloadPipeline.js'
import {quickDownloadToasts} from './quickDownload/quickDownloadToasts.js'
import {notify} from '../lib/notify.js'
import {EMPTY_WARMUP_DOWNLOADS, trackWarmupDownloads} from './warmupDownloads.js'
import {recordStartupPick, takeStartupPicks, watchStartupPicks} from './startupPicks.js'

let unbindWarmupProgress: (() => void) | null = null
let unbindQueueProjection: (() => void) | null = null
let unbindCopiedLinks: (() => void) | null = null
let unbindIntakeEvents: (() => void) | null = null
let unbindOpenedLinks: (() => void) | null = null
let unbindHotkeyOutcome: (() => void) | null = null
let unbindProbeProgress: (() => void) | null = null
let unbindExploreView: (() => void) | null = null
let unbindExplorePointer: (() => void) | null = null
let exploreViewBinding = 0
let hotkeyStatusRequest = 0

const SHARE_MILESTONES: readonly number[] = [3, 25, 100]
const SHARE_MILESTONE_SET = new Set(SHARE_MILESTONES)

function handleCompletedDownloadMilestones(doneIncrements: number, prevMilestoneCount: number, get: GetState, set: SetState): void {
	const nextCount = prevMilestoneCount + doneIncrements
	commonPatch(get, set, {successfulDownloadCount: nextCount})
	for (let c = prevMilestoneCount + 1; c <= nextCount; c++) {
		if (SHARE_MILESTONE_SET.has(c)) {
			set({shareDialogOpen: true})
			break
		}
	}
}

// Every settings write goes through one queue. Writes used to run concurrently
// and roll back on failure to a snapshot taken before the patch — which is only
// canonical while nothing else is in flight. Overlapping, a failure rolled back
// over a sibling's persisted value or over a newer patch to the same field, and
// the renderer disagreed with disk until the next initialize(). Serializing
// removes the class rather than guarding each symptom.
let settingsWriteQueue: Promise<void> = Promise.resolve()

function queueSettingsWrite<T>(run: () => Promise<T>): Promise<T> {
	const next = settingsWriteQueue.then(run)
	settingsWriteQueue = next.then(
		() => undefined,
		() => undefined
	)
	return next
}

// A saved dependency override must be verified by a forced warmup, but every
// warmup entry point returns early while another warmup holds warmupRunning.
// An override saved during any warmup — its own earlier repair, startup, a
// manual retry, Homebrew, or winget — records the request here instead, and
// whichever warmup finishes runs one forced repair against what landed.
let overrideRepairPending = false

async function repairAfterOverrideSave(get: GetState): Promise<void> {
	if (get().warmupRunning) {
		overrideRepairPending = true
		return
	}
	await get().repairWarmup()
}

function drainOverrideRepair(get: GetState): void {
	if (!overrideRepairPending) return
	overrideRepairPending = false
	void get().repairWarmup()
}

// Mirrors main's deepMerge one level down: each section named by the patch
// merges field by field over the current one, the rest are left alone.
function optimisticSettings(previous: AppSettings, patch: SettingsPatch): AppSettings {
	return {...previous, common: patch.common ? {...previous.common, ...patch.common} : previous.common, playlist: patch.playlist ? {...previous.playlist, ...patch.playlist} : previous.playlist, profiles: patch.profiles ? {...previous.profiles, ...patch.profiles} : previous.profiles}
}

// Rollback target after a failed write. Restoring a snapshot taken before the
// patch is what made overlapping writes unsound; main is the only thing that
// knows what actually landed. Optimistic patches still queued behind this one
// re-assert themselves when their own write returns.
async function restoreCanonicalSettings(set: SetState): Promise<void> {
	const canonical = await window.appApi.settings.get()
	if (canonical.ok) set({settings: canonical.data})
}

// The optimistic patch is applied by the caller, synchronously: the UI has to
// see it in the tick it acted, before this ever reaches the queue.
// Resolves true when main accepted the write, so a caller can gate follow-up
// work (e.g. a warmup repair) on it.
async function writeSettings(set: SetState, label: string, patch: SettingsPatch): Promise<boolean> {
	let error: unknown
	try {
		const result = await window.appApi.settings.update(patch)
		if (result.ok) {
			set({settings: result.data})
			return true
		}
		error = result.error
	} catch (err) {
		// main's handler turns thrown errors into a fail Result, so a rejection is
		// the IPC transport itself — still roll the optimistic patch back.
		error = err
	}
	try {
		await restoreCanonicalSettings(set)
	} catch {
		// Keep the write failure as the reported error.
	}
	notify.settingsSaveFailed(label, error)
	return false
}

function applyOptimistic(get: GetState, set: SetState, patch: SettingsPatch): void {
	const previous = get().settings
	if (previous) set({settings: optimisticSettings(previous, patch)})
}

function commonPatch(get: GetState, set: SetState, patch: Partial<AppSettings['common']>): void {
	void applyCommonPatchAsync(get, set, 'share', patch)
}

// Shared pattern for setCookiesPath/setProxyUrl/...
function applyCommonPatchAsync(get: GetState, set: SetState, label: string, patch: Partial<AppSettings['common']>): Promise<boolean> {
	applyOptimistic(get, set, {common: patch})
	return queueSettingsWrite(() => writeSettings(set, label, {common: patch}))
}

function hotkeyStatusFor(settings: AppSettings | null, state: HotkeyState): HotkeyRegistrationStatus {
	const common = settings?.common
	if (!common?.hotkeyEnabled) return 'off'
	const accelerator = common.hotkeyAccelerator ?? DEFAULTS.hotkeyAccelerator
	return state.registered && state.accelerator === accelerator ? 'registered' : 'conflict'
}

async function refreshHotkeyRegistration(get: GetState, set: SetState): Promise<void> {
	const request = ++hotkeyStatusRequest
	if (!get().settings?.common.hotkeyEnabled) {
		set({hotkeyRegistration: 'off'})
		return
	}
	set({hotkeyRegistration: 'pending'})
	try {
		const result = await window.appApi.hotkey.getState()
		if (request !== hotkeyStatusRequest) return
		set({hotkeyRegistration: result.ok ? hotkeyStatusFor(get().settings, result.data) : 'conflict'})
	} catch {
		if (request === hotkeyStatusRequest) set({hotkeyRegistration: 'conflict'})
	}
}

function applyHotkeyPatchAsync(get: GetState, set: SetState, label: string, patch: Partial<AppSettings['common']>): Promise<void> {
	const nextEnabled = patch.hotkeyEnabled ?? get().settings?.common.hotkeyEnabled ?? false
	// Invalidate any refresh started before this patch: its answer describes the
	// chord we are about to replace.
	++hotkeyStatusRequest
	applyOptimistic(get, set, {common: patch})
	set({hotkeyRegistration: nextEnabled ? 'pending' : 'off'})
	// Both outcomes end by re-deriving registration from whatever settings the
	// store ends up holding — canonical on success, re-read from main on
	// failure. A pre-patch snapshot would be stale for the same reason the
	// settings one was.
	return queueSettingsWrite(async () => {
		await writeSettings(set, label, {common: patch})
		await refreshHotkeyRegistration(get, set)
	})
}

function applyProfilesPatchAsync(get: GetState, set: SetState, label: string, profiles: AppSettings['profiles']): Promise<boolean> {
	applyOptimistic(get, set, {profiles})
	return queueSettingsWrite(() => writeSettings(set, label, {profiles}))
}

function currentProfiles(settings: AppSettings | null): AppSettings['profiles'] {
	return normalizeDownloadProfilesPrefs(settings?.profiles ?? DEFAULT_DOWNLOAD_PROFILES_PREFS)
}

const OVERRIDE_KEY: Record<DependencyId, 'ytDlp' | 'ffmpeg' | 'ffprobe'> = {'yt-dlp': 'ytDlp', ffmpeg: 'ffmpeg', ffprobe: 'ffprobe'}

function makeBinaryOverridePatch(id: DependencyId, path: string | undefined): {common: {binaryOverrides: Record<string, string | undefined>}} {
	return {common: {binaryOverrides: {[OVERRIDE_KEY[id]]: path}}}
}

export function createSystemSlice(set: SetState, get: GetState): SystemSlice {
	return {
		initialized: false,
		initializing: false,
		splashDismissed: false,
		warmupDiagnostics: null,
		warmupBlocking: [],
		warmupRunning: false,
		warmupCancellable: false,
		warmupProgress: null,
		warmupDownloads: EMPTY_WARMUP_DOWNLOADS,
		warmupStopped: false,
		packageInstall: null,
		copiedLink: null,
		settings: null,
		hotkeyRegistration: 'off',
		graphicsPolicy: null,
		// initialize() reassigns from settingsResult.common.language when one is saved.
		language: systemLanguage(),
		commonPaths: undefined,
		shareDialogOpen: false,
		exploreView: null,
		explorePointerEntries: 0,

		bindExploreView: () => {
			// The view lives in main; the renderer mirrors what main last reported.
			// A pushed state always wins over the initial read, which may answer late.
			unbindExploreView?.()
			const binding = ++exploreViewBinding
			let pushed = false
			unbindExploreView = window.appApi.explore.onStateChanged(state => {
				pushed = true
				set({exploreView: state})
			})
			unbindExplorePointer?.()
			unbindExplorePointer = window.appApi.explore.onPointerInView(() => set(state => ({explorePointerEntries: state.explorePointerEntries + 1})))
			// A failed read leaves the state unknown (null) until main pushes one.
			window.appApi.explore.getState().then(
				result => {
					if (!result.ok) {
						console.warn('[explore] initial state read failed', result.error)
						return
					}
					if (binding === exploreViewBinding && !pushed) set({exploreView: result.data})
				},
				(err: unknown) => console.warn('[explore] initial state read failed', err)
			)
		},

		initialize: async () => {
			if (get().initialized || get().initializing) return
			set({initializing: true, splashDismissed: false})

			// Detach prior queue projection binding (defense for a future re-init flow).
			unbindQueueProjection?.()
			unbindQueueProjection = bindQueueProjection({
				events: window.appApi.queue.events,
				get,
				set,
				schedule: callback => requestAnimationFrame(callback),
				readSuccessfulDownloadCount: () => get().settings?.common?.successfulDownloadCount ?? 0,
				onDoneIncrements: (doneIncrements, prevMilestoneCount) => handleCompletedDownloadMilestones(doneIncrements, prevMilestoneCount, get, set)
			})

			// The warmup-progress listener stays bound for the lifetime of the
			// process — repair flows trigger another warmup run without re-entering
			// initialize, so we can't unbind it here like the original did.
			unbindWarmupProgress?.()
			unbindWarmupProgress = window.appApi.events.onWarmupProgress(event => {
				set(state => {
					const warmupProgress = {...(state.warmupProgress ?? {}), [event.binary]: event}
					return {warmupProgress, warmupDownloads: trackWarmupDownloads(state.warmupDownloads, warmupProgress, Date.now())}
				})
			})

			// Hotkey outcome toasts: lifetime-bound like warmup progress. A press
			// runs in main, which decides each outcome and its channel: the toast
			// here only when this window is focused and listening, otherwise an
			// OS notification — exactly one channel per outcome.
			unbindHotkeyOutcome?.()
			unbindHotkeyOutcome = window.appApi.events.onHotkeyOutcome(event => {
				if (!event.toast) return
				notify.hotkeyOutcome(event.outcome)
			})
			// The toast listener is bound: main may register the chord.
			void window.appApi.hotkey.rendererReady()

			// Lifetime-bound: intake runs in main, and its outcomes come back here.
			unbindIntakeEvents?.()
			unbindIntakeEvents = bindIntakeEvents(() => quickDownloadToasts('downloads', get))

			// Lifetime-bound: a link copied on any step waits for the Download tab.
			unbindCopiedLinks?.()
			unbindCopiedLinks = bindCopiedLinks(set)
			unbindOpenedLinks?.()
			unbindOpenedLinks = bindOpenedLinks(set)

			get().bindExploreView()
			get().bindSiteCooldowns()

			unbindProbeProgress?.()
			unbindProbeProgress = window.appApi.events.onProbeProgress(event => {
				const state = get()
				const playlistProbeActive = state.playlistProbeLoading || state.playlistScopeReloading
				const quickDownloadProbeActive = state.quickDownloadStatus === 'preparing' && state.quickDownloadProgressPhase === 'probing'
				const matchesActiveUrl = state.wizardUrl === event.url || state.quickDownloadProgressCurrent === event.url
				if ((!playlistProbeActive && !quickDownloadProbeActive) || !matchesActiveUrl) return
				set({playlistProbeProgress: event})
			})

			set({warmupRunning: true, warmupCancellable: true})
			const settingsPromise = window.appApi.settings.get()
			const graphicsPolicyPromise = window.appApi.app.getGraphicsPolicy()
			const warmUpPromise = window.appApi.app.warmUp()
			const snapshotPromise = window.appApi.queue.cmd.getSnapshot()
			// The native menu works over the splash: a language, theme or style
			// picked during these reads is newer than what they return.
			watchStartupPicks()
			const [settingsResult, graphicsPolicyResult] = await Promise.all([settingsPromise, graphicsPolicyPromise])
			const picked = takeStartupPicks()

			if (settingsResult.ok) {
				const settings: AppSettings = {...settingsResult.data, common: {...settingsResult.data.common, ...picked}}
				const common = settings.common
				const zoom = common.uiZoom ?? DEFAULTS.uiZoom
				const theme = common.uiTheme ?? DEFAULTS.uiTheme
				const persistedLang = common.language
				const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
				document.documentElement.classList.toggle('dark', isDark)
				document.documentElement.classList.toggle('light', !isDark)
				const nextLanguage = persistedLang ?? get().language
				if (nextLanguage !== i18next.language) {
					void i18next.changeLanguage(nextLanguage)
				}
				document.documentElement.lang = nextLanguage
				document.documentElement.dir = isRtl(nextLanguage) ? 'rtl' : 'ltr'
				void window.appApi.app.setLanguage(nextLanguage)
				set({settings, hotkeyRegistration: common.hotkeyEnabled ? 'pending' : 'off', wizardOutputDir: common.defaultOutputDir, commonPaths: common.commonPaths, uiZoom: zoom, uiTheme: theme, uiStyle: common.uiStyle ?? DEFAULTS.uiStyle, language: nextLanguage})
				if (common.hotkeyEnabled) void refreshHotkeyRegistration(get, set)
				else ++hotkeyStatusRequest
			}

			if (graphicsPolicyResult.ok) {
				set({graphicsPolicy: graphicsPolicyResult.data})
			}

			const snapshotResult = await snapshotPromise
			if (snapshotResult.ok) {
				set(state => projectQueueSnapshot(state, snapshotResult.data))
			}
			// warmUp() itself turns its own failures into a `fail` Result rather than
			// rejecting, but the IPC transport in front of it is not this store's to
			// trust blindly. A rejection here has nowhere else to land: `initialized`
			// would never become true, and the startup splash — dismissed only by
			// `initialized` — would stay up with no error and no way out.
			let warmupDiagnostics: Record<DependencyId, DependencyDiagnostic> | null = null
			let warmupBlocking: DependencyId[] = []
			let warmupStopped = false
			try {
				const warmUpResult = await warmUpPromise
				warmupDiagnostics = warmUpResult.ok ? warmUpResult.data.dependencies : null
				warmupBlocking = warmUpResult.ok ? warmUpResult.data.blockingFailures : []
				warmupStopped = warmUpResult.ok && warmUpResult.data.cancelled
				if (!warmUpResult.ok) notify.warmupFailed('warm-up failed', warmUpResult.error)
			} catch (err) {
				notify.warmupFailed('warm-up threw', err)
			}

			set({initialized: true, initializing: false, warmupRunning: false, warmupCancellable: false, warmupDiagnostics, warmupBlocking, warmupStopped})
			drainOverrideRepair(get)
		},

		setSplashDismissed: dismissed => {
			set({splashDismissed: dismissed})
		},

		cancelWarmup: async () => {
			try {
				await window.appApi.app.cancelWarmup()
			} catch (err) {
				notify.warmupFailed('cancel threw', err)
			}
		},

		repairWarmup: async () => {
			if (get().warmupRunning) return
			set({warmupRunning: true, warmupCancellable: true})
			try {
				const result = await window.appApi.app.warmUp({force: true})
				if (result.ok) {
					set({warmupDiagnostics: result.data.dependencies, warmupBlocking: result.data.blockingFailures, warmupStopped: result.data.cancelled})
				} else {
					notify.warmupFailed('repair failed', result.error)
				}
			} catch (err) {
				notify.warmupFailed('repair threw', err)
			} finally {
				set({warmupRunning: false, warmupCancellable: false, packageInstall: null})
				drainOverrideRepair(get)
			}
		},

		repairYtDlpWithHomebrew: async () => {
			if (get().warmupRunning) return
			set({warmupRunning: true, warmupCancellable: false})
			try {
				set({packageInstall: 'homebrew'})
				const install = await window.appApi.app.installYtDlpWithHomebrew()
				set({packageInstall: null})
				if (!install.ok) {
					notify.warmupFailed('homebrew repair failed', install.error)
					return
				}
				set({warmupCancellable: true})
				const result = await window.appApi.app.warmUp({force: true})
				if (result.ok) {
					set({warmupDiagnostics: result.data.dependencies, warmupBlocking: result.data.blockingFailures, warmupStopped: result.data.cancelled})
				} else {
					notify.warmupFailed('post-homebrew repair failed', result.error)
				}
			} catch (err) {
				notify.warmupFailed('homebrew repair threw', err)
			} finally {
				set({warmupRunning: false, warmupCancellable: false, packageInstall: null})
				drainOverrideRepair(get)
			}
		},

		repairYtDlpWithWinget: async () => {
			if (get().warmupRunning) return
			set({warmupRunning: true, warmupCancellable: false})
			try {
				set({packageInstall: 'winget'})
				const install = await window.appApi.app.installYtDlpWithWinget()
				set({packageInstall: null})
				if (!install.ok) {
					notify.warmupFailed('winget repair failed', install.error)
					return
				}
				set({warmupCancellable: true})
				const result = await window.appApi.app.warmUp({force: true})
				if (result.ok) {
					set({warmupDiagnostics: result.data.dependencies, warmupBlocking: result.data.blockingFailures, warmupStopped: result.data.cancelled})
				} else {
					notify.warmupFailed('post-winget repair failed', result.error)
				}
			} catch (err) {
				notify.warmupFailed('winget repair threw', err)
			} finally {
				set({warmupRunning: false, warmupCancellable: false, packageInstall: null})
				drainOverrideRepair(get)
			}
		},

		// Installs FFmpeg with the machine's package manager, then points Arroxy at
		// that copy directly. A retry that went through the managed download first
		// would sit on an unreachable server for a minute before falling back to it.
		repairFfmpegWithPackageManager: async manager => {
			if (get().warmupRunning) return
			set({warmupRunning: true, warmupCancellable: false})
			try {
				set({packageInstall: manager})
				const install = manager === 'homebrew' ? await window.appApi.app.installFfmpegWithHomebrew() : await window.appApi.app.installFfmpegWithWinget()
				set({packageInstall: null})
				if (!install.ok) {
					notify.warmupFailed(`${manager} ffmpeg repair failed`, install.error)
					return
				}
				const saved = await queueSettingsWrite(() => writeSettings(set, 'binaryOverrides', {common: {binaryOverrides: {ffmpeg: install.data.ffmpegPath, ffprobe: install.data.ffprobePath}}}))
				if (!saved) return
				set({warmupCancellable: true})
				const result = await window.appApi.app.warmUp({force: true})
				if (result.ok) {
					set({warmupDiagnostics: result.data.dependencies, warmupBlocking: result.data.blockingFailures, warmupStopped: result.data.cancelled})
				} else {
					notify.warmupFailed(`post-${manager} ffmpeg repair failed`, result.error)
				}
			} catch (err) {
				notify.warmupFailed(`${manager} ffmpeg repair threw`, err)
			} finally {
				set({warmupRunning: false, warmupCancellable: false, packageInstall: null})
				drainOverrideRepair(get)
			}
		},

		setBinaryOverride: async (id, path) => {
			const saved = await queueSettingsWrite(() => writeSettings(set, 'binaryOverrides', makeBinaryOverridePatch(id, path)))
			if (!saved) return
			try {
				await repairAfterOverrideSave(get)
			} catch (err) {
				notify.warmupFailed('post-override repair threw', err)
			}
		},

		clearBinaryOverride: async id => {
			const saved = await queueSettingsWrite(() => writeSettings(set, 'binaryOverrides clear', makeBinaryOverridePatch(id, undefined)))
			if (!saved) return
			try {
				await repairAfterOverrideSave(get)
			} catch (err) {
				notify.warmupFailed('post-clear repair threw', err)
			}
		},

		openBinariesDir: async () => {
			try {
				const result = await window.appApi.shell.openBinariesDir()
				if (!result.ok) notify.shellActionFailed('shell.openBinariesDir', result.error)
			} catch (err) {
				notify.shellActionFailed('shell.openBinariesDir', err)
			}
		},

		openLogs: async () => {
			try {
				const result = await window.appApi.logs.openDir()
				if (!result.ok) notify.shellActionFailed('logs.openDir', result.error)
			} catch (err) {
				notify.shellActionFailed('logs.openDir', err)
			}
		},

		// Main writes the file and reveals it in the file manager, which is the
		// confirmation: the user's next step is dragging it into an issue.
		saveDiagnostics: async () => {
			try {
				const result = await window.appApi.logs.saveDiagnostics()
				if (!result.ok) notify.shellActionFailed('logs.saveDiagnostics', result.error)
			} catch (err) {
				notify.shellActionFailed('logs.saveDiagnostics', err)
			}
		},

		markReleaseNotesShown: async version => {
			await applyCommonPatchAsync(get, set, 'releaseNotes', {lastReleaseNotesVersionShown: version})
		},

		setLanguage: lang => {
			recordStartupPick({language: lang})
			set({language: lang})
			document.documentElement.lang = lang
			document.documentElement.dir = isRtl(lang) ? 'rtl' : 'ltr'
			void i18next.changeLanguage(lang)
			void applyCommonPatchAsync(get, set, 'language', {language: lang})
			void window.appApi.app.setLanguage(lang)
		},

		setCookiesPath: async path => {
			await applyCommonPatchAsync(get, set, 'cookiesPath', {cookiesPath: path})
		},

		setCookiesMode: async mode => {
			await applyCommonPatchAsync(get, set, 'cookiesMode', {cookiesMode: mode})
		},

		setCookiesBrowser: async browser => {
			await applyCommonPatchAsync(get, set, 'cookiesBrowser', {cookiesBrowser: browser})
		},

		setProxyUrl: async url => {
			await applyCommonPatchAsync(get, set, 'proxyUrl', {proxyUrl: url})
		},

		setExploreAdBlock: async enabled => {
			await applyCommonPatchAsync(get, set, 'exploreAdBlock', {exploreAdBlock: enabled})
		},

		setExploreIdleUnload: async enabled => {
			await applyCommonPatchAsync(get, set, 'exploreIdleUnload', {exploreIdleUnload: enabled})
		},

		setExploreSearchEngine: async engine => {
			await applyCommonPatchAsync(get, set, 'exploreSearchEngine', {exploreSearchEngine: engine})
		},

		setLimitRate: async value => {
			await applyCommonPatchAsync(get, set, 'limitRate', {limitRate: value ?? ''})
		},

		setPlaylistProbeLimit: async value => {
			await applyCommonPatchAsync(get, set, 'playlistProbeLimit', {playlistProbeLimit: value})
		},

		setNativeAudioPreference: async value => {
			await applyCommonPatchAsync(get, set, 'nativeAudioPreference', {nativeAudioPreference: value})
		},

		setHdrPreference: async value => {
			await applyCommonPatchAsync(get, set, 'hdrPreference', {hdrPreference: value})
		},

		setFilenameTemplate: async template => {
			await applyCommonPatchAsync(get, set, 'filenameTemplate', {filenameTemplate: template})
		},

		setNetworkPacingPreset: async value => {
			await applyCommonPatchAsync(get, set, 'networkPacingPreset', {networkPacingPreset: value})
		},

		setPacingSleepRequests: async value => {
			await applyCommonPatchAsync(get, set, 'pacingSleepRequests', {pacingSleepRequests: value})
		},

		setPacingSleepInterval: async value => {
			await applyCommonPatchAsync(get, set, 'pacingSleepInterval', {pacingSleepInterval: value})
		},

		setPacingMaxSleepInterval: async value => {
			await applyCommonPatchAsync(get, set, 'pacingMaxSleepInterval', {pacingMaxSleepInterval: value})
		},

		setPacingSleepSubtitles: async value => {
			await applyCommonPatchAsync(get, set, 'pacingSleepSubtitles', {pacingSleepSubtitles: value})
		},

		setDownloadConnections: async value => {
			await applyCommonPatchAsync(get, set, 'downloadConnections', {downloadConnections: value})
		},

		setConcurrentDownloads: async value => {
			await applyCommonPatchAsync(get, set, 'concurrentDownloads', {concurrentDownloads: value})
		},

		setAutoRetryAttempts: async value => {
			await applyCommonPatchAsync(get, set, 'autoRetryAttempts', {autoRetryAttempts: value})
		},

		setAutoRemoveCompleted: async enabled => {
			await applyCommonPatchAsync(get, set, 'autoRemoveCompleted', {autoRemoveCompleted: enabled})
		},

		setClipboardWatchEnabled: async enabled => {
			await applyCommonPatchAsync(get, set, 'clipboardWatchEnabled', {clipboardWatchEnabled: enabled})
		},

		setHotkeyEnabled: async enabled => {
			await applyHotkeyPatchAsync(get, set, 'hotkeyEnabled', {hotkeyEnabled: enabled})
		},

		setHotkeyAccelerator: async accelerator => {
			await applyHotkeyPatchAsync(get, set, 'hotkeyAccelerator', {hotkeyAccelerator: accelerator})
		},

		setCloseBehavior: async value => {
			await applyCommonPatchAsync(get, set, 'closeBehavior', {closeBehavior: value})
		},

		setAnalyticsEnabled: async enabled => {
			await applyCommonPatchAsync(get, set, 'analyticsEnabled', {analyticsEnabled: enabled})
		},

		setActiveDownloadProfile: (ref: DownloadProfileRef) => {
			const profiles = {...currentProfiles(get().settings), active: ref}
			return applyProfilesPatchAsync(get, set, 'downloadProfile.active', profiles)
		},

		saveDownloadProfile: async (profile: DownloadProfile, activate = true) => {
			const previous = currentProfiles(get().settings)
			const profiles = saveDownloadProfileToPrefs(previous, profile, activate)
			return applyProfilesPatchAsync(get, set, 'downloadProfile.save', profiles)
		},

		removeDownloadProfile: async (id: string) => {
			const profiles = removeDownloadProfileFromPrefs(currentProfiles(get().settings), id)
			await applyProfilesPatchAsync(get, set, 'downloadProfile.remove', profiles)
		},

		setDownloadProfileEnabled: async (id: string, enabled: boolean) => {
			const profiles = setProfileEnabledInPrefs(currentProfiles(get().settings), id, enabled)
			await applyProfilesPatchAsync(get, set, 'downloadProfile.enabled', profiles)
		},

		moveDownloadProfile: async (id: string, targetId: string) => {
			const profiles = moveProfileInPrefs(currentProfiles(get().settings), id, targetId)
			await applyProfilesPatchAsync(get, set, 'downloadProfile.order', profiles)
		},

		openShareDialog: () => {
			set({shareDialogOpen: true})
		},

		closeShareDialog: () => {
			set({shareDialogOpen: false})
		},

		setShareInlineCardDismissed: async () => {
			await applyCommonPatchAsync(get, set, 'shareInlineCardDismissed', {shareInlineCardDismissed: true})
		},

		setShareHighValueBannerDismissed: async () => {
			await applyCommonPatchAsync(get, set, 'shareHighValueBannerDismissed', {shareHighValueBannerDismissed: true})
		},

		dismissStyleHint: async () => {
			await applyCommonPatchAsync(get, set, 'styleHintDismissed', {styleHintDismissed: true})
		},

		dismissReviewCallout: async () => {
			await applyCommonPatchAsync(get, set, 'reviewCalloutDismissed', {reviewCalloutDismissed: true})
		},

		dismissVideoPartCallout: async () => {
			await applyCommonPatchAsync(get, set, 'videoPartCalloutDismissed', {videoPartCalloutDismissed: true})
		},

		dismissExploreLinkCallout: async () => {
			await applyCommonPatchAsync(get, set, 'exploreLinkCalloutDismissed', {exploreLinkCalloutDismissed: true})
		},

		dismissFormatProfileCallout: async () => {
			await applyCommonPatchAsync(get, set, 'formatProfileCalloutDismissed', {formatProfileCalloutDismissed: true})
		},

		acknowledgeExploreNotice: async () => {
			await applyCommonPatchAsync(get, set, 'exploreNoticeSeen', {exploreNoticeSeen: true})
		},

		setExploreCompactChrome: async compact => {
			await applyCommonPatchAsync(get, set, 'exploreCompactChrome', {exploreCompactChrome: compact})
		},

		setExploreZoom: async zoom => {
			await applyCommonPatchAsync(get, set, 'exploreZoom', {exploreZoom: zoom})
		},

		markExploreFirstOpen: async () => {
			// D6: only an `off` found at the first open is switched; `file`/`browser`
			// are never switched, and a later `off` is a deliberate choice.
			const switchToExplore = (get().settings?.common?.cookiesMode ?? 'off') === 'off'
			await applyCommonPatchAsync(get, set, 'exploreModeAutoSwitched', switchToExplore ? {cookiesMode: 'explore', exploreModeAutoSwitched: true} : {exploreModeAutoSwitched: true})
		},

		switchToExploreCookiesMode: () => applyCommonPatchAsync(get, set, 'cookiesMode', {cookiesMode: 'explore', exploreModeAutoSwitched: true}),

		dismissExploreModeNudge: async mode => {
			await applyCommonPatchAsync(get, set, 'exploreModeNudgeDismissedFor', {exploreModeNudgeDismissedFor: mode})
		},

		setExploreEnabled: async enabled => {
			await applyCommonPatchAsync(get, set, 'exploreEnabled', {exploreEnabled: enabled})
		},

		signOutOfExplore: async () => {
			// Main pushes the signed-out state; nothing to set here.
			try {
				const result = await window.appApi.explore.signOut()
				if (!result.ok) notify.exploreSignOutFailed(result.error)
			} catch (err) {
				notify.exploreSignOutFailed(err)
			}
		}
	}
}
