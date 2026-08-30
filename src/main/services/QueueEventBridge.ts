import type {BrowserWindow} from 'electron'
import {IPC_CHANNELS} from '@shared/ipc.js'
import type {QueueItem, QueueSnapshotPayload} from '@shared/types.js'
import type {QueueService} from './QueueService.js'

export class QueueEventBridge {
	private onAdded?: (e: {items: QueueItem[]; atIdx: number}) => void
	private onUpdated?: (e: {item: QueueItem}) => void
	private onRemoved?: (e: {itemId: string}) => void
	private onScheduler?: (e: {paused: boolean}) => void

	constructor(
		private readonly queueService: QueueService,
		private readonly window: BrowserWindow
	) {}

	attach(): void {
		// off() instead of removeAllListeners() — preserves any external listeners.
		if (this.onAdded) this.queueService.off('added', this.onAdded)
		if (this.onUpdated) this.queueService.off('updated', this.onUpdated)
		if (this.onRemoved) this.queueService.off('removed', this.onRemoved)
		if (this.onScheduler) this.queueService.off('scheduler', this.onScheduler)

		this.send(IPC_CHANNELS.queueEventSnapshot, {items: this.queueService.snapshot(), schedulerPaused: this.queueService.schedulerIsPaused()} satisfies QueueSnapshotPayload)

		this.onAdded = e => this.send(IPC_CHANNELS.queueEventAdded, e)
		this.onUpdated = e => this.send(IPC_CHANNELS.queueEventUpdated, e)
		this.onRemoved = e => this.send(IPC_CHANNELS.queueEventRemoved, e)
		this.onScheduler = e => this.send(IPC_CHANNELS.queueEventScheduler, e)

		this.queueService.on('added', this.onAdded)
		this.queueService.on('updated', this.onUpdated)
		this.queueService.on('removed', this.onRemoved)
		this.queueService.on('scheduler', this.onScheduler)
	}

	detach(): void {
		if (this.onAdded) this.queueService.off('added', this.onAdded)
		if (this.onUpdated) this.queueService.off('updated', this.onUpdated)
		if (this.onRemoved) this.queueService.off('removed', this.onRemoved)
		if (this.onScheduler) this.queueService.off('scheduler', this.onScheduler)
		this.onAdded = undefined
		this.onUpdated = undefined
		this.onRemoved = undefined
		this.onScheduler = undefined
	}

	private send(channel: string, payload: unknown): void {
		if (this.window.isDestroyed()) return
		this.window.webContents.send(channel, payload)
	}
}
