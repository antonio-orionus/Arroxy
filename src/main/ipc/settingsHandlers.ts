import {IPC_CHANNELS} from '@shared/ipc.js'
import {updateSettingsSchema, type DownloadProfile, type DownloadProfilesPrefs, type UiTheme} from '@shared/schemas.js'
import type {SettingsPatch} from '@shared/api.js'
import {downloadProfileFilenameFailure} from '@shared/downloadProfiles.js'
import {fail, ok} from '@shared/result.js'
import {createAppError} from '@main/utils/errorFactory.js'
import type {SettingsStore} from '@main/stores/SettingsStore.js'
import type {ClipboardWatcher} from '@main/services/ClipboardWatcher.js'
import type {HotkeyService} from '@main/services/HotkeyService.js'
import type {QueueService} from '@main/services/QueueService.js'
import type {ExploreViewHost} from '@main/services/explore/ExploreViewHost.js'
import {DEFAULTS, NORMAL_LANE_CAP} from '@shared/constants.js'
import {buildCommonPaths, handle, handleRaw, toUnknownFailure} from './utils.js'

// A profile saved with a filename template that does not validate would fail
// every download it starts. Checked here rather than in schemas.ts, whose
// exports the template parser imports, and against what is stored: a profile
// keeps its own template saved before this check, so one old typo can't refuse
// every later save of the profile list, but no other profile takes it on. The
// Profiles tab shows it as an error to fix.
function newUnusableFilename(patch: SettingsPatch['profiles'], stored: DownloadProfilesPrefs): DownloadProfile | null {
	const storedTemplates = new Map([...stored.custom, ...stored.overrides].flatMap(profile => (profile.filename.kind === 'custom' ? [[profile.id, profile.filename.template] as const] : [])))
	const written = [...(patch?.custom ?? []), ...(patch?.overrides ?? [])]
	return written.find(profile => profile.filename.kind === 'custom' && storedTemplates.get(profile.id) !== profile.filename.template && downloadProfileFilenameFailure(profile)) ?? null
}

interface SettingsHandlerDeps {
	settingsStore: SettingsStore
	clipboardWatcher: ClipboardWatcher
	queueService: QueueService
	// Not for hotkey IPC (see hotkeyHandlers.ts) — only the settingsUpdate hook
	// that re-applies the chord whenever the enabled flag or accelerator lands.
	hotkeyService: HotkeyService
	// The kill switch: turning Explore off tears the native view down. A new
	// proxy setting, or a toggled ad blocker, is applied to an open view at once.
	exploreView: Pick<ExploreViewHost, 'destroy' | 'applyProxySetting' | 'applyAdBlockSetting' | 'applyIdleUnloadSetting' | 'applyZoomSetting'>
	// Rate-limit cooldowns are kept per network route, so a new proxy setting
	// changes which ones hold requests.
	onProxyChanged?: () => void
	// The native menu mirrors the style, theme, and speed limit; macOS only, so absent elsewhere.
	onMenuStateChanged?: () => void
	// Keeps Chromium's colour scheme (and so the Explore page) in step with the app theme.
	onThemeChanged?: (theme: UiTheme) => void
}

export function registerSettingsHandlers(deps: SettingsHandlerDeps): void {
	const {settingsStore, clipboardWatcher, queueService, hotkeyService, exploreView, onProxyChanged, onMenuStateChanged, onThemeChanged} = deps

	handleRaw(IPC_CHANNELS.settingsGet, async () => {
		try {
			const settings = await settingsStore.get()
			return ok({...settings, common: {...settings.common, commonPaths: buildCommonPaths()}})
		} catch (error) {
			return toUnknownFailure(error)
		}
	})

	handle(IPC_CHANNELS.settingsUpdate, updateSettingsSchema, async data => {
		const unusable = data.profiles ? newUnusableFilename(data.profiles, (await settingsStore.get()).profiles) : null
		if (unusable) return fail(createAppError('validation', `Download profile "${unusable.name}" has an unusable filename template`))
		const updated = await settingsStore.update(data)
		clipboardWatcher.setEnabled(updated.common.clipboardWatchEnabled)
		if (data.common?.hotkeyEnabled !== undefined || data.common?.hotkeyAccelerator !== undefined) {
			hotkeyService.apply(updated.common.hotkeyEnabled, updated.common.hotkeyAccelerator ?? DEFAULTS.hotkeyAccelerator)
		}
		if (data.common?.concurrentDownloads !== undefined) {
			queueService.setConcurrentDownloads(updated.common.concurrentDownloads ?? NORMAL_LANE_CAP)
		}
		if (data.common?.autoRetryAttempts !== undefined) {
			queueService.setAutoRetryAttempts(updated.common.autoRetryAttempts ?? 0)
		}
		if (data.common?.autoRemoveCompleted !== undefined) {
			queueService.setAutoRemoveCompleted(updated.common.autoRemoveCompleted ?? false)
		}
		if (data.common?.exploreEnabled !== undefined && updated.common.exploreEnabled === false) {
			exploreView.destroy()
		}
		if (data.common?.proxyUrl !== undefined) {
			// Not awaited: a refused setting shows on the view, not on this save.
			void exploreView.applyProxySetting()
			onProxyChanged?.()
		}
		if (data.common?.exploreAdBlock !== undefined) {
			// Not awaited: the blocker's status reaches the toolbar through the view state.
			void exploreView.applyAdBlockSetting()
		}
		if (data.common?.exploreIdleUnload !== undefined) {
			exploreView.applyIdleUnloadSetting()
		}
		if (data.common?.exploreZoom !== undefined) {
			exploreView.applyZoomSetting()
		}
		if (data.common?.uiTheme !== undefined) {
			onThemeChanged?.(data.common.uiTheme)
		}
		if (data.common?.uiStyle !== undefined || data.common?.uiTheme !== undefined || data.common?.limitRate !== undefined) {
			onMenuStateChanged?.()
		}
		return ok(updated)
	})
}
