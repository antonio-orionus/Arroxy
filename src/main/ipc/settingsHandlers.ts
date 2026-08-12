import {IPC_CHANNELS} from '@shared/ipc.js'
import {updateSettingsSchema} from '@shared/schemas.js'
import {ok} from '@shared/result.js'
import type {SettingsStore} from '@main/stores/SettingsStore.js'
import type {ClipboardWatcher} from '@main/services/ClipboardWatcher.js'
import type {QueueService} from '@main/services/QueueService.js'
import {NORMAL_LANE_CAP} from '@shared/constants.js'
import {setAnalyticsEnabled} from '@main/services/analytics.js'
import {buildCommonPaths, handle, handleRaw, toUnknownFailure} from './utils.js'

interface SettingsHandlerDeps {
	settingsStore: SettingsStore
	clipboardWatcher: ClipboardWatcher
	queueService: QueueService
}

export function registerSettingsHandlers(deps: SettingsHandlerDeps): void {
	const {settingsStore, clipboardWatcher, queueService} = deps

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
