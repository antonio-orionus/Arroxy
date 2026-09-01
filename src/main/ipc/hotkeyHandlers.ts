import {IPC_CHANNELS} from '@shared/ipc.js'
import {hotkeyOutcomePayloadSchema} from '@shared/schemas.js'
import {ok} from '@shared/result.js'
import type {SupportedLang} from '@shared/schemas.js'
import type {HotkeyService} from '@main/services/HotkeyService.js'
import {routeHotkeyOutcome} from '@main/services/hotkeyFeedback.js'
import type {HotkeyOsNotifier} from '@main/services/hotkeyFeedback.js'
import {handle, handleRaw} from './utils.js'

interface HotkeyHandlerDeps {
	hotkeyService: HotkeyService
	osNotifier: HotkeyOsNotifier | null
	languageRef: {current: SupportedLang}
}

// Hotkey-domain commands. `reportOutcome` carries the renderer-derived outcome
// back to main so it can route feedback (toast verdict + OS notification on
// hidden windows); `getState`/`testPress` back the settings UI.
export function registerHotkeyHandlers(deps: HotkeyHandlerDeps): void {
	const {hotkeyService, osNotifier, languageRef} = deps

	handle(IPC_CHANNELS.hotkeyReportOutcome, hotkeyOutcomePayloadSchema, event => {
		routeHotkeyOutcome(event, {lang: languageRef.current, window: hotkeyService.getWindow(), osNotifier})
		return Promise.resolve(ok(undefined))
	})

	handleRaw(IPC_CHANNELS.hotkeyGetState, async () => Promise.resolve(ok(hotkeyService.getState())))
	handleRaw(IPC_CHANNELS.hotkeyRendererReady, async () => {
		hotkeyService.setRendererReady(true)
		return Promise.resolve(ok(undefined))
	})

	// Settings "Test" button: fires the exact trigger pipeline the real chord
	// runs (clipboard read → pre-classify → renderer ack), so the button proves
	// the registered chord works end to end.
	handleRaw(IPC_CHANNELS.hotkeyTestPress, async () => {
		hotkeyService.handleTrigger()
		return Promise.resolve(ok(undefined))
	})
}
