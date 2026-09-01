import {IPC_CHANNELS} from '@shared/ipc.js'
import {hotkeyOutcomePayloadSchema, updateSettingsSchema} from '@shared/schemas.js'
import type {SupportedLang} from '@shared/schemas.js'
import {ok} from '@shared/result.js'
import type {SettingsStore} from '@main/stores/SettingsStore.js'
import type {ClipboardWatcher} from '@main/services/ClipboardWatcher.js'
import type {HotkeyService} from '@main/services/HotkeyService.js'
import {routeHotkeyOutcome} from '@main/services/hotkeyFeedback.js'
import type {HotkeyOsNotifier} from '@main/services/hotkeyFeedback.js'
import type {QueueService} from '@main/services/QueueService.js'
import {NORMAL_LANE_CAP} from '@shared/constants.js'
import {setAnalyticsEnabled} from '@main/services/analytics.js'
import {buildCommonPaths, handle, handleRaw, toUnknownFailure} from './utils.js'

interface SettingsHandlerDeps {
	settingsStore: SettingsStore
	clipboardWatcher: ClipboardWatcher
	queueService: QueueService
	hotkeyService: HotkeyService
	osNotifier: HotkeyOsNotifier | null
	languageRef: {current: SupportedLang}
}

export function registerSettingsHandlers(deps: SettingsHandlerDeps): void {
	const {settingsStore, clipboardWatcher, queueService, hotkeyService, osNotifier, languageRef} = deps

	handleRaw(IPC_CHANNELS.hotkeyReportOutcome, async (_payload: unknown, raw: unknown) => {
		const parsed = hotkeyOutcomePayloadSchema.safeParse(raw)
		if (!parsed.success) return Promise.resolve(toUnknownFailure(new Error('hotkey:reportOutcome payload failed validation')))
		routeHotkeyOutcome(parsed.data, {lang: languageRef.current, window: hotkeyService.getWindow(), osNotifier: osNotifier})
		return Promise.resolve(ok(undefined))
	})

	handleRaw(IPC_CHANNELS.hotkeyGetState, async () => Promise.resolve(ok(hotkeyService.getState())))

	// Settings "Test" button: fires the exact trigger pipeline the real chord
	// runs (clipboard read → pre-classify → renderer ack), so the button proves
	// the registered chord works end to end.
	handleRaw(IPC_CHANNELS.hotkeyTestPress, async () => {
		hotkeyService.handleTrigger()
		return Promise.resolve(ok(undefined))
	})

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
			hotkeyService.apply(updated.common.hotkeyEnabled, updated.common.hotkeyAccelerator ?? 'CommandOrControl+Shift+D')
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
