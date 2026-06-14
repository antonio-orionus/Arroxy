import type {AppSettings, DependencyId, DownloadProfile, DownloadProfileRef} from '@shared/types.js'
import {DEFAULTS} from '@shared/constants.js'
import {DEFAULT_DOWNLOAD_PROFILES_PREFS, normalizeDownloadProfilesPrefs, removeDownloadProfileFromPrefs, saveDownloadProfileToPrefs} from '@shared/downloadProfiles.js'
import {i18next, pickLanguage, isRtl} from '@shared/i18n/index.js'
import type {GetState, SetState, ShareTrigger, SystemSlice} from './types.js'
import {bindQueueProjection, projectQueueSnapshot} from './queueProjection.js'
import {notify} from '../lib/notify.js'
import {track} from '../lib/analytics.js'

let unbindWarmupProgress: (() => void) | null = null
let unbindQueueProjection: (() => void) | null = null
let unbindProbeProgress: (() => void) | null = null

const SHARE_MILESTONES: readonly number[] = [3, 25, 100]
const SHARE_MILESTONE_SET = new Set(SHARE_MILESTONES)

function handleCompletedDownloadMilestones(doneIncrements: number, prevMilestoneCount: number, get: GetState, set: SetState): void {
	const nextCount = prevMilestoneCount + doneIncrements
	commonPatch(get, set, {successfulDownloadCount: nextCount})
	for (let c = prevMilestoneCount + 1; c <= nextCount; c++) {
		if (SHARE_MILESTONE_SET.has(c)) {
			openShareDialogInternal(set, 'milestone')
			break
		}
	}
}

function commonPatch(get: GetState, set: SetState, patch: Partial<AppSettings['common']>): void {
	const previous = get().settings
	if (previous) {
		set({settings: {...previous, common: {...previous.common, ...patch}}})
	}
	void window.appApi.settings.update({common: patch}).then(result => {
		if (!result.ok) {
			// Revert optimistic update — UI was showing patched value, but the
			// canonical state on disk never changed. Without rollback, renderer
			// and main process diverge until next initialize().
			if (previous) set({settings: previous})
			notify.settingsSaveFailed('share', result.error)
			return
		}
		set({settings: result.data})
	})
}

// Shared pattern for setCookiesPath/setProxyUrl/...: optimistic update, IPC
// patch, on failure revert to the value captured before the patch.
async function applyCommonPatchAsync(get: GetState, set: SetState, label: string, patch: Partial<AppSettings['common']>): Promise<void> {
	const previous = get().settings
	if (previous) set({settings: {...previous, common: {...previous.common, ...patch}}})
	const result = await window.appApi.settings.update({common: patch})
	if (!result.ok) {
		if (previous) set({settings: previous})
		notify.settingsSaveFailed(label, result.error)
		return
	}
	set({settings: result.data})
}

async function applyProfilesPatchAsync(get: GetState, set: SetState, label: string, profiles: AppSettings['profiles']): Promise<void> {
	const previous = get().settings
	if (previous) set({settings: {...previous, profiles}})
	const result = await window.appApi.settings.update({profiles})
	if (!result.ok) {
		if (previous) set({settings: previous})
		notify.settingsSaveFailed(label, result.error)
		return
	}
	set({settings: result.data})
}

function currentProfiles(settings: AppSettings | null): AppSettings['profiles'] {
	return normalizeDownloadProfilesPrefs(settings?.profiles ?? DEFAULT_DOWNLOAD_PROFILES_PREFS)
}

function openShareDialogInternal(set: SetState, trigger: ShareTrigger): void {
	set({shareDialogOpen: true, shareDialogTrigger: trigger})
	track('share_dialog_opened', {via: trigger})
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
		settings: null,
		graphicsPolicy: null,
		// Guard `navigator` so vitest's node-env tests (e.g. format-selection-view)
		// can construct the store at module-load time without DOM globals.
		// initialize() reassigns from settingsResult.common.language anyway.
		language: typeof navigator !== 'undefined' ? pickLanguage(navigator.language) : pickLanguage('en'),
		commonPaths: undefined,
		shareDialogOpen: false,
		shareDialogTrigger: null,

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
				set(state => ({warmupProgress: {...(state.warmupProgress ?? {}), [event.binary]: event}}))
			})

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
			const [settingsResult, graphicsPolicyResult] = await Promise.all([settingsPromise, graphicsPolicyPromise])

			if (settingsResult.ok) {
				const common = settingsResult.data.common ?? ({} as AppSettings['common'])
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
				set({settings: settingsResult.data, wizardOutputDir: common.defaultOutputDir, commonPaths: common.commonPaths, uiZoom: zoom, uiTheme: theme, language: nextLanguage, drawerOpen: settingsResult.data.common?.drawerOpen ?? false})
			}

			if (graphicsPolicyResult.ok) {
				set({graphicsPolicy: graphicsPolicyResult.data})
			}

			const snapshotResult = await snapshotPromise
			if (snapshotResult.ok) {
				set(state => ({...(snapshotResult.data.length > 0 ? {drawerOpen: true} : {}), ...projectQueueSnapshot(state, snapshotResult.data)}))
			}

			const warmUpResult = await warmUpPromise
			const warmupDiagnostics = warmUpResult.ok ? warmUpResult.data.dependencies : null
			const warmupBlocking = warmUpResult.ok ? warmUpResult.data.blockingFailures : []

			set({initialized: true, initializing: false, warmupRunning: false, warmupCancellable: false, warmupDiagnostics, warmupBlocking})
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
					set({warmupDiagnostics: result.data.dependencies, warmupBlocking: result.data.blockingFailures})
				} else {
					notify.warmupFailed('repair failed', result.error)
				}
			} catch (err) {
				notify.warmupFailed('repair threw', err)
			} finally {
				set({warmupRunning: false, warmupCancellable: false})
			}
		},

		repairYtDlpWithHomebrew: async () => {
			if (get().warmupRunning) return
			set({warmupRunning: true, warmupCancellable: false})
			try {
				const install = await window.appApi.app.installYtDlpWithHomebrew()
				if (!install.ok) {
					notify.warmupFailed('homebrew repair failed', install.error)
					return
				}
				set({warmupCancellable: true})
				const result = await window.appApi.app.warmUp({force: true})
				if (result.ok) {
					set({warmupDiagnostics: result.data.dependencies, warmupBlocking: result.data.blockingFailures})
				} else {
					notify.warmupFailed('post-homebrew repair failed', result.error)
				}
			} catch (err) {
				notify.warmupFailed('homebrew repair threw', err)
			} finally {
				set({warmupRunning: false, warmupCancellable: false})
			}
		},

		repairYtDlpWithWinget: async () => {
			if (get().warmupRunning) return
			set({warmupRunning: true, warmupCancellable: false})
			try {
				const install = await window.appApi.app.installYtDlpWithWinget()
				if (!install.ok) {
					notify.warmupFailed('winget repair failed', install.error)
					return
				}
				set({warmupCancellable: true})
				const result = await window.appApi.app.warmUp({force: true})
				if (result.ok) {
					set({warmupDiagnostics: result.data.dependencies, warmupBlocking: result.data.blockingFailures})
				} else {
					notify.warmupFailed('post-winget repair failed', result.error)
				}
			} catch (err) {
				notify.warmupFailed('winget repair threw', err)
			} finally {
				set({warmupRunning: false, warmupCancellable: false})
			}
		},

		setBinaryOverride: async (id, path) => {
			const patch = makeBinaryOverridePatch(id, path)
			const result = await window.appApi.settings.update(patch)
			if (!result.ok) {
				notify.settingsSaveFailed('binaryOverrides', result.error)
				return
			}
			set({settings: result.data})
			try {
				await get().repairWarmup()
			} catch (err) {
				notify.warmupFailed('post-override repair threw', err)
			}
		},

		clearBinaryOverride: async id => {
			const patch = makeBinaryOverridePatch(id, undefined)
			const result = await window.appApi.settings.update(patch)
			if (!result.ok) {
				notify.settingsSaveFailed('binaryOverrides clear', result.error)
				return
			}
			set({settings: result.data})
			try {
				await get().repairWarmup()
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

		markReleaseNotesShown: async version => {
			await applyCommonPatchAsync(get, set, 'releaseNotes', {lastReleaseNotesVersionShown: version})
		},

		setLanguage: lang => {
			set({language: lang})
			document.documentElement.lang = lang
			document.documentElement.dir = isRtl(lang) ? 'rtl' : 'ltr'
			void i18next.changeLanguage(lang)
			void window.appApi.settings.update({common: {language: lang}}).then(result => {
				if (!result.ok) notify.settingsSaveFailed('language', result.error)
			})
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

		setLimitRate: async value => {
			await applyCommonPatchAsync(get, set, 'limitRate', {limitRate: value ?? ''})
		},

		setPlaylistProbeLimit: async value => {
			await applyCommonPatchAsync(get, set, 'playlistProbeLimit', {playlistProbeLimit: value})
		},

		setBackdropRenderMode: async value => {
			await applyCommonPatchAsync(get, set, 'backdropRenderMode', {backdropRenderMode: value})
		},

		setNativeAudioPreference: async value => {
			await applyCommonPatchAsync(get, set, 'nativeAudioPreference', {nativeAudioPreference: value})
		},

		setIncludeIdInSingleFilenames: async enabled => {
			await applyCommonPatchAsync(get, set, 'includeIdInSingleFilenames', {includeIdInSingleFilenames: enabled})
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

		setPacingConcurrentFragments: async value => {
			await applyCommonPatchAsync(get, set, 'pacingConcurrentFragments', {pacingConcurrentFragments: value})
		},

		setClipboardWatchEnabled: async enabled => {
			await applyCommonPatchAsync(get, set, 'clipboardWatchEnabled', {clipboardWatchEnabled: enabled})
		},

		setCloseBehavior: async value => {
			await applyCommonPatchAsync(get, set, 'closeBehavior', {closeBehavior: value})
		},

		setAnalyticsEnabled: async enabled => {
			await applyCommonPatchAsync(get, set, 'analyticsEnabled', {analyticsEnabled: enabled})
		},

		setActiveDownloadProfile: async (ref: DownloadProfileRef) => {
			const profiles = {...currentProfiles(get().settings), active: ref}
			await applyProfilesPatchAsync(get, set, 'downloadProfile.active', profiles)
		},

		saveDownloadProfile: async (profile: DownloadProfile, activate = true) => {
			const previous = currentProfiles(get().settings)
			const profiles = saveDownloadProfileToPrefs(previous, profile, activate)
			await applyProfilesPatchAsync(get, set, 'downloadProfile.save', profiles)
		},

		removeDownloadProfile: async (id: string) => {
			const profiles = removeDownloadProfileFromPrefs(currentProfiles(get().settings), id)
			await applyProfilesPatchAsync(get, set, 'downloadProfile.remove', profiles)
		},

		openShareDialog: trigger => {
			openShareDialogInternal(set, trigger)
		},

		closeShareDialog: () => {
			set({shareDialogOpen: false, shareDialogTrigger: null})
		},

		setShareInlineCardDismissed: async () => {
			track('share_inline_card_dismissed')
			await applyCommonPatchAsync(get, set, 'shareInlineCardDismissed', {shareInlineCardDismissed: true})
		},

		setShareHighValueBannerDismissed: async () => {
			track('share_prompt_dismissed', {via: 'high-value-inline'})
			await applyCommonPatchAsync(get, set, 'shareHighValueBannerDismissed', {shareHighValueBannerDismissed: true})
		}
	}
}
