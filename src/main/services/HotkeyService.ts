import {clipboard as electronClipboard, globalShortcut, type BrowserWindow} from 'electron'
import {IPC_CHANNELS} from '@shared/ipc.js'
import {parseBulkUrls} from '@shared/bulkUrls.js'
import log from 'electron-log/main.js'
import type {HotkeyState, HotkeyTriggerPayload} from '@shared/schemas.js'

// Main-side global hotkey. Owns chord registration and clipboard
// pre-classification — the renderer cannot read the clipboard while hidden,
// so the trigger event carries the payload. Outcome feedback flows the other
// way via the reportOutcome IPC handler.
//
// All Electron seams are ports so tests drive fakes, mirroring
// ClipboardWatcher's design.

export interface ShortcutRegistry {
	register(accelerator: string, handler: () => void): boolean
	unregister(accelerator: string): void
	isRegistered(accelerator: string): boolean
}

export interface HotkeyClipboardReader {
	readText(): string
}

export interface HotkeyWindow {
	isVisible(): boolean
	isFocused(): boolean
	isMinimized(): boolean
	isDestroyed(): boolean
	send(channel: string, payload: unknown): void
}

export function electronShortcutRegistry(): ShortcutRegistry {
	return {register: (accelerator, handler) => globalShortcut.register(accelerator, handler), unregister: accelerator => globalShortcut.unregister(accelerator), isRegistered: accelerator => globalShortcut.isRegistered(accelerator)}
}

export function hotkeyWindowFromBrowserWindow(win: BrowserWindow): HotkeyWindow {
	return {isVisible: () => win.isVisible(), isFocused: () => win.isFocused(), isMinimized: () => win.isMinimized(), isDestroyed: () => win.isDestroyed(), send: (channel, payload) => win.webContents.send(channel, payload)}
}

// Pre-classification shared with the settings Test button: what the clipboard
// holds decides which outcome path the renderer will take.
export function classifyHotkeyClipboard(text: string): HotkeyTriggerPayload {
	const trimmed = text.trim()
	if (!trimmed) return {kind: 'empty'}
	const parsed = parseBulkUrls(trimmed)
	if (parsed.accepted.length > 1) return {kind: 'multiple'}
	const url = parsed.accepted[0]?.url
	if (!url) return {kind: 'empty'}
	return {kind: 'single', url}
}

export class HotkeyService {
	private current: string | null = null
	private stateChangeHook: (() => void) | null = null

	constructor(
		private readonly window: HotkeyWindow,
		private readonly registry: ShortcutRegistry = electronShortcutRegistry(),
		private readonly reader: HotkeyClipboardReader = electronClipboard
	) {}

	// Notified after any registration-state change (enable, disable, chord
	// swap, conflict) so UI surfaces like the tray stay honest.
	onStateChange(hook: (() => void) | null): void {
		this.stateChangeHook = hook
	}

	private notifyStateChange(): void {
		this.stateChangeHook?.()
	}

	// Applies the desired state from settings: the chord that should be
	// registered, if any. Diff-and-reconcile — unregister whatever is stale,
	// register what is wanted (retrying heals a chord another app released or
	// the OS dropped), then notify once if the externally visible state moved.
	// register() returning false means another app owns the chord — surfaced
	// via getState(), never fatal.
	apply(enabled: boolean, accelerator: string): void {
		const before = this.getState()
		if (!enabled) {
			if (this.current !== null) {
				this.registry.unregister(this.current)
				this.current = null
			}
		} else {
			if (this.current !== null && this.current !== accelerator) {
				this.registry.unregister(this.current)
				this.current = null
			}
			if (this.current === null || !this.registry.isRegistered(accelerator)) {
				this.registry.register(accelerator, () => this.handleTrigger())
				this.current = accelerator
			}
		}
		const after = this.getState()
		if (after.accelerator !== before.accelerator || after.registered !== before.registered) this.notifyStateChange()
	}

	getWindow(): HotkeyWindow {
		return this.window
	}

	getState(): HotkeyState {
		return {accelerator: this.current, registered: this.current !== null && this.registry.isRegistered(this.current)}
	}

	handleTrigger(): void {
		if (!this.current || !this.registry.isRegistered(this.current)) {
			log.warn('[hotkey] trigger ignored — chord not registered', {current: this.current})
			return
		}
		let text = ''
		try {
			text = this.reader.readText()
		} catch (err) {
			log.warn('[hotkey] clipboard read failed', err)
			text = ''
		}
		const trigger = classifyHotkeyClipboard(text)
		log.info('[hotkey] trigger dispatched to renderer', {kind: trigger.kind, chars: text.length})
		// The renderer stays alive while hidden (only occluded/blur throttling
		// applies), so the trigger flows identically in both cases.
		this.window.send(IPC_CHANNELS.eventsHotkeyTrigger, trigger)
	}

	dispose(): void {
		if (this.current) {
			this.registry.unregister(this.current)
			this.current = null
		}
	}
}
