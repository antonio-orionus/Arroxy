import type {BrowserWindow} from 'electron'
import {IPC_CHANNELS} from '@shared/ipc.js'
import type {ProgressEvent, StatusEvent} from '@shared/types.js'
import type {DownloadService} from './DownloadService.js'

const PROGRESS_THROTTLE_MS = 100

export class DownloadEventBridge {
	private readonly lastProgressAt = new Map<string, number>()
	private onStatus?: (event: StatusEvent) => void
	private onProgress?: (event: ProgressEvent) => void

	constructor(
		private readonly downloadService: DownloadService,
		private readonly window: BrowserWindow
	) {}

	attach(): void {
		if (this.onStatus) this.downloadService.off('status', this.onStatus)
		if (this.onProgress) this.downloadService.off('progress', this.onProgress)

		this.onStatus = (event: StatusEvent) => {
			if (event.stage === 'done' || event.stage === 'error') {
				this.lastProgressAt.delete(event.jobId)
			}
			if (this.window.isDestroyed()) return
			this.window.webContents.send(IPC_CHANNELS.eventsStatus, event)
		}

		this.onProgress = (event: ProgressEvent) => {
			if (this.window.isDestroyed()) return
			const now = Date.now()
			const last = this.lastProgressAt.get(event.jobId) ?? 0
			if (now - last < PROGRESS_THROTTLE_MS) return
			this.lastProgressAt.set(event.jobId, now)
			this.window.webContents.send(IPC_CHANNELS.eventsProgress, event)
		}

		this.downloadService.on('status', this.onStatus)
		this.downloadService.on('progress', this.onProgress)
	}

	detach(): void {
		if (this.onStatus) this.downloadService.off('status', this.onStatus)
		if (this.onProgress) this.downloadService.off('progress', this.onProgress)
		this.onStatus = undefined
		this.onProgress = undefined
		this.lastProgressAt.clear()
	}
}
