import {clipboard as electronClipboard, globalShortcut, type BrowserWindow} from 'electron'
import {parseBulkUrls} from '@shared/bulkUrls.js'
import log from 'electron-log/main.js'
import type {HotkeyState, HotkeyTriggerPayload} from '@shared/schemas.js'

// Main-side global hotkey. Owns chord registration and clipboard
// pre-classification, then hands the press to the hotkey's intake, also in
// main, which takes the link in and routes its outcomes (HotkeyIntake). The
// window only shows the outcome toasts it is sent.
//
// All Electron seams are ports so tests drive fakes, mirroring
// ClipboardWatcher's design.

export interface ShortcutRegistry {
	register(accelerator: string, handler: () => void): boolean
	unregister(accelerator: string): void
	isRegistered(accelerator: string): boolean
}

export interface HotkeyClipboardReader {
	readText(): Promise<string>
}

// Where a classified press goes: the hotkey's intake.
export interface HotkeyTriggerIntake {
	take(trigger: HotkeyTriggerPayload): Promise<void>
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
// holds decides which outcome path the intake will take.
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
	private desiredEnabled = false
	private desiredAccelerator = ''
	private rendererReady: boolean

	constructor(
		private readonly window: HotkeyWindow,
		private readonly intake: HotkeyTriggerIntake,
		private readonly registry: ShortcutRegistry = electronShortcutRegistry(),
		private readonly reader: HotkeyClipboardReader = electronClipboard,
		options: {rendererReady?: boolean} = {}
	) {
		this.rendererReady = options.rendererReady ?? false
	}

	// Notified after any registration-state change (enable, disable, chord
	// swap, conflict) so UI surfaces like the tray stay honest.
	onStateChange(hook: (() => void) | null): void {
		this.stateChangeHook = hook
	}

	private notifyStateChange(): void {
		this.stateChangeHook?.()
	}

	apply(enabled: boolean, accelerator: string): void {
		this.desiredEnabled = enabled
		this.desiredAccelerator = accelerator
		this.reconcile()
	}

	// Keep the shortcut inactive until the renderer listens for outcome
	// toasts. A press during startup or a reload could otherwise be
	// acknowledged to nobody.
	setRendererReady(ready: boolean): void {
		if (this.rendererReady === ready) return
		this.rendererReady = ready
		this.reconcile()
	}

	// Outcome routing reads this: a renderer that is not listening cannot show
	// a toast, so a follow-up that lands mid-reload goes out as an OS notification.
	isRendererReady(): boolean {
		return this.rendererReady
	}

	private reconcile(): void {
		const before = this.getState()
		const enabled = this.desiredEnabled && this.rendererReady
		const accelerator = this.desiredAccelerator
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
				this.registry.register(accelerator, () => void this.handleTrigger())
				this.current = accelerator
			}
		}
		const after = this.getState()
		if (after.accelerator !== before.accelerator || after.registered !== before.registered) this.notifyStateChange()
	}

	getState(): HotkeyState {
		return {accelerator: this.current, registered: this.current !== null && this.registry.isRegistered(this.current)}
	}

	// Never rejects: callers fire it from the chord, the tray, and IPC.
	async handleTrigger(): Promise<void> {
		if (!this.isChordLive()) {
			log.warn('[hotkey] trigger ignored — chord not registered', {current: this.current})
			return
		}
		let text = ''
		try {
			text = await this.reader.readText()
		} catch (err) {
			log.warn('[hotkey] clipboard read failed', err)
			text = ''
		}
		// The read is async: the chord may have been disabled or the window
		// closed while it was pending.
		if (!this.isChordLive() || this.window.isDestroyed()) {
			log.warn('[hotkey] trigger dropped — chord or window gone during clipboard read', {current: this.current})
			return
		}
		const trigger = classifyHotkeyClipboard(text)
		log.info('[hotkey] trigger handed to intake', {kind: trigger.kind, chars: text.length})
		try {
			await this.intake.take(trigger)
		} catch (err) {
			log.error('[hotkey] intake failed', err)
		}
	}

	private isChordLive(): boolean {
		return this.current !== null && this.registry.isRegistered(this.current)
	}

	dispose(): void {
		if (this.current) {
			this.registry.unregister(this.current)
			this.current = null
		}
	}
}
