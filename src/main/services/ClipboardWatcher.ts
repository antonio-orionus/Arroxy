import {clipboard, type BrowserWindow} from 'electron'
import {IPC_CHANNELS} from '@shared/ipc.js'
import {classifyClipboardText} from '@shared/clipboardLinks.js'

export interface ClipboardReader {
	readText(): Promise<string>
}

export type WatcherEvent = 'focus' | 'blur' | 'show' | 'hide' | 'minimize' | 'restore'

export interface WatcherWindow {
	isFocused(): boolean
	isVisible(): boolean
	isDestroyed(): boolean
	on(event: WatcherEvent, cb: () => void): void
	off(event: WatcherEvent, cb: () => void): void
	send(channel: string, payload: unknown): void
}

const ATTENTION_EVENTS: readonly WatcherEvent[] = ['focus', 'blur', 'show', 'hide', 'minimize', 'restore']

// Bridges Electron's BrowserWindow to the slimmer WatcherWindow contract so the
// watcher itself stays Electron-free and trivially fakeable.
export function watcherWindowFromBrowserWindow(win: BrowserWindow): WatcherWindow {
	return {
		isFocused: () => win.isFocused(),
		isVisible: () => win.isVisible(),
		isDestroyed: () => win.isDestroyed(),
		on: (event, cb) => {
			// BrowserWindow's typed event union has overloads that confuse TS when
			// the event name comes from a runtime-narrowed string union; the runtime
			// accepts every name in WatcherEvent.
			;(win.on as (event: string, cb: () => void) => unknown)(event, cb)
		},
		off: (event, cb) => {
			;(win.off as (event: string, cb: () => void) => unknown)(event, cb)
		},
		send: (channel, payload) => {
			win.webContents.send(channel, payload)
		}
	}
}

export class ClipboardWatcher {
	private timer: NodeJS.Timeout | null = null
	private lastSeen = ''
	private enabled = false
	private listening = false
	// Clipboard reads are async. Each polling session gets a generation so a
	// read that settles after stop() (blur, hide, disable, dispose) is dropped
	// instead of acting on a window that is no longer watching.
	private generation = 0
	private reading = false
	private readonly attentionHandler = (): void => this.syncPolling()

	constructor(
		private readonly window: WatcherWindow,
		private readonly intervalMs = 800,
		private readonly reader: ClipboardReader = clipboard
	) {}

	setEnabled(enabled: boolean): void {
		if (enabled === this.enabled) return
		this.enabled = enabled
		if (enabled) {
			this.attachAttention()
			this.syncPolling()
		} else {
			this.stop()
			this.detachAttention()
		}
	}

	// An arroxy:// link the user just opened outranks whatever the clipboard
	// held before it. Bringing the window forward restarts polling, which would
	// otherwise offer that older copy and replace the opened link.
	async ignoreCurrentClipboard(): Promise<void> {
		// Drop a read already in flight: it may return the older copy.
		this.generation++
		this.reading = false
		try {
			this.lastSeen = await this.reader.readText()
		} catch {
			// Unreadable: the next poll decides as usual.
		}
	}

	dispose(): void {
		this.stop()
		this.detachAttention()
	}

	private syncPolling(): void {
		const shouldPoll = this.enabled && this.window.isFocused() && this.window.isVisible()
		if (shouldPoll) this.start()
		else this.stop()
	}

	private start(): void {
		if (this.timer) return
		this.timer = setInterval(() => void this.pollOnce(), this.intervalMs)
	}

	private stop(): void {
		if (!this.timer) return
		clearInterval(this.timer)
		this.timer = null
		this.generation++
		// A read still pending from the old session must not block the next one.
		this.reading = false
	}

	private async pollOnce(): Promise<void> {
		if (this.reading) return
		this.reading = true
		const generation = this.generation
		let text: string
		try {
			text = await this.reader.readText()
		} catch {
			text = ''
		}
		if (generation !== this.generation) return
		this.reading = false
		if (!text || text === this.lastSeen) return
		this.lastSeen = text
		if (classifyClipboardText(text).kind === 'none') return
		if (this.window.isDestroyed()) return
		this.window.send(IPC_CHANNELS.eventsClipboardUrl, text.trim())
	}

	private attachAttention(): void {
		if (this.listening) return
		this.listening = true
		for (const event of ATTENTION_EVENTS) {
			this.window.on(event, this.attentionHandler)
		}
	}

	private detachAttention(): void {
		if (!this.listening) return
		this.listening = false
		for (const event of ATTENTION_EVENTS) {
			this.window.off(event, this.attentionHandler)
		}
	}
}
