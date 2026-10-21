import {IPC_CHANNELS} from '@shared/ipc.js'
import {ok} from '@shared/result.js'
import type {HotkeyService} from '@main/services/HotkeyService.js'
import {handleRaw} from './utils.js'

// Hotkey-domain commands backing the settings UI and the renderer handshake.
// A press runs entirely in main (HotkeyService → HotkeyIntake); the renderer
// only hears outcome toasts.
export function registerHotkeyHandlers(deps: {hotkeyService: HotkeyService}): void {
	const {hotkeyService} = deps

	handleRaw(IPC_CHANNELS.hotkeyGetState, async () => Promise.resolve(ok(hotkeyService.getState())))
	// The renderer listens for outcome toasts: main may register the chord.
	handleRaw(IPC_CHANNELS.hotkeyRendererReady, async () => {
		hotkeyService.setRendererReady(true)
		return Promise.resolve(ok(undefined))
	})

	// Settings "Test" button: fires the exact trigger pipeline the real chord
	// runs (clipboard read → pre-classify → intake → ack), so the button proves
	// the registered chord works end to end.
	handleRaw(IPC_CHANNELS.hotkeyTestPress, async () => {
		await hotkeyService.handleTrigger()
		return ok(undefined)
	})
}
