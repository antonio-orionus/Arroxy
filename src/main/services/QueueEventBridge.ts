import type {BrowserWindow} from 'electron'
import {IPC_CHANNELS} from '@shared/ipc.js'
import type {QueueItem} from '@shared/types.js'
import type {QueueService} from './QueueService.js'

export class QueueEventBridge {
	private onAdded?: (e: {items: QueueItem[]; atIdx: number}) => void
	private onUpdated?: (e: {item: QueueItem}) => void
	private onRemoved?: (e: {itemId: string}) => void

	constructor(
		private readonly queueService: QueueService,
		private readonly window: BrowserWindow
	) {}

	attach(): void {
		// off() instead of removeAllListeners() — preserves any external listeners.
		if (this.onAdded) this.queueService.off('added', this.onAdded)
		if (this.onUpdated) this.queueService.off('updated', this.onUpdated)
		if (this.onRemoved) this.queueService.off('removed', this.onRemoved)

		this.send(IPC_CHANNELS.queueEventSnapshot, this.queueService.snapshot())

		this.onAdded = e => this.send(IPC_CHANNELS.queueEventAdded, e)
		this.onUpdated = e => this.send(IPC_CHANNELS.queueEventUpdated, e)
		this.onRemoved = e => this.send(IPC_CHANNELS.queueEventRemoved, e)

		this.queueService.on('added', this.onAdded)
		this.queueService.on('updated', this.onUpdated)
		this.queueService.on('removed', this.onRemoved)
	}

	detach(): void {
		if (this.onAdded) this.queueService.off('added', this.onAdded)
		if (this.onUpdated) this.queueService.off('updated', this.onUpdated)
		if (this.onRemoved) this.queueService.off('removed', this.onRemoved)
		this.onAdded = undefined
		this.onUpdated = undefined
		this.onRemoved = undefined
	}

	private send(channel: string, payload: unknown): void {
		if (this.window.isDestroyed()) return
		this.window.webContents.send(channel, payload)
	}
}
