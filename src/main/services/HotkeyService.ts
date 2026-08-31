import {clipboard as electronClipboard, globalShortcut, type BrowserWindow} from 'electron'
import {IPC_CHANNELS} from '@shared/ipc.js'
import {parseBulkUrls} from '@shared/bulkUrls.js'
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
	isDestroyed(): boolean
	send(channel: string, payload: unknown): void
}

export function electronShortcutRegistry(): ShortcutRegistry {
	return {register: (accelerator, handler) => globalShortcut.register(accelerator, handler), unregister: accelerator => globalShortcut.unregister(accelerator), isRegistered: accelerator => globalShortcut.isRegistered(accelerator)}
}

export function hotkeyWindowFromBrowserWindow(win: BrowserWindow): HotkeyWindow {
	return {isVisible: () => win.isVisible(), isFocused: () => win.isFocused(), isDestroyed: () => win.isDestroyed(), send: (channel, payload) => win.webContents.send(channel, payload)}
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

	constructor(
		private readonly window: HotkeyWindow,
		private readonly registry: ShortcutRegistry = electronShortcutRegistry(),
		private readonly reader: HotkeyClipboardReader = electronClipboard
	) {}

	// Applies the desired state from settings. A chord swap unregisters the
	// previous one first; register() returning false means another app owns
	// the chord — surfaced via getState(), never fatal.
	apply(enabled: boolean, accelerator: string): void {
		if (this.current && this.current !== accelerator) {
			this.registry.unregister(this.current)
			this.current = null
		}
		if (!enabled) {
			if (this.current) {
				this.registry.unregister(this.current)
				this.current = null
			}
			return
		}
		if (this.current === accelerator && this.registry.isRegistered(accelerator)) return
		if (this.registry.register(accelerator, () => this.handleTrigger())) {
			this.current = accelerator
			return
		}
		this.current = accelerator
	}

	getState(): HotkeyState {
		return {accelerator: this.current, registered: this.current !== null && this.registry.isRegistered(this.current)}
	}

	handleTrigger(): void {
		if (!this.current || !this.registry.isRegistered(this.current)) return
		let text = ''
		try {
			text = this.reader.readText()
		} catch {
			text = ''
		}
		// The renderer stays alive while hidden (only occluded/blur throttling
		// applies), so the trigger flows identically in both cases.
		this.window.send(IPC_CHANNELS.eventsHotkeyTrigger, classifyHotkeyClipboard(text))
	}

	dispose(): void {
		if (this.current) {
			this.registry.unregister(this.current)
			this.current = null
		}
	}
}
