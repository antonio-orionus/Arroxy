import {IPC_CHANNELS} from '@shared/ipc.js'
import {updateSettingsSchema} from '@shared/schemas.js'
import {ok} from '@shared/result.js'
import type {SettingsStore} from '@main/stores/SettingsStore.js'
import type {ClipboardWatcher} from '@main/services/ClipboardWatcher.js'
import type {HotkeyService} from '@main/services/HotkeyService.js'
import type {QueueService} from '@main/services/QueueService.js'
import {DEFAULTS, NORMAL_LANE_CAP} from '@shared/constants.js'
import {setAnalyticsEnabled} from '@main/services/analytics.js'
import {buildCommonPaths, handle, handleRaw, toUnknownFailure} from './utils.js'

interface SettingsHandlerDeps {
	settingsStore: SettingsStore
	clipboardWatcher: ClipboardWatcher
	queueService: QueueService
	// Not for hotkey IPC (see hotkeyHandlers.ts) — only the settingsUpdate hook
	// that re-applies the chord whenever the enabled flag or accelerator lands.
	hotkeyService: HotkeyService
}

export function registerSettingsHandlers(deps: SettingsHandlerDeps): void {
	const {settingsStore, clipboardWatcher, queueService, hotkeyService} = deps

	handleRaw(IPC_CHANNELS.settingsGet, async () => {
		try {
			const settings = await settingsStore.get()
			return ok({...settings, common: {...settings.common, commonPaths: buildCommonPaths()}})
		} catch (error) {
			return toUnknownFailure(error)
		}
	})

	handle(IPC_CHANNELS.settingsUpdate, updateSettingsSchema, async data => {
		const updated = await settingsStore.update(data)
		clipboardWatcher.setEnabled(updated.common.clipboardWatchEnabled)
		if (data.common?.hotkeyEnabled !== undefined || data.common?.hotkeyAccelerator !== undefined) {
			hotkeyService.apply(updated.common.hotkeyEnabled, updated.common.hotkeyAccelerator ?? DEFAULTS.hotkeyAccelerator)
		}
		if (data.common?.analyticsEnabled !== undefined) {
			setAnalyticsEnabled(updated.common.analyticsEnabled ?? true)
		}
		if (data.common?.concurrentDownloads !== undefined) {
			queueService.setConcurrentDownloads(updated.common.concurrentDownloads ?? NORMAL_LANE_CAP)
		}
		if (data.common?.autoRetryAttempts !== undefined) {
			queueService.setAutoRetryAttempts(updated.common.autoRetryAttempts ?? 0)
		}
		return ok(updated)
	})
}
