import type {BrowserWindow} from 'electron'
import {IPC_CHANNELS} from '@shared/ipc.js'
import type {ProbeProgressEvent} from '@shared/types.js'
import type {ProbeService} from './ProbeService.js'

export class ProbeEventBridge {
	private onProgress?: (event: ProbeProgressEvent) => void

	constructor(
		private readonly probeService: ProbeService,
		private readonly window: BrowserWindow
	) {}

	attach(): void {
		if (this.onProgress) this.probeService.off('progress', this.onProgress)

		this.onProgress = event => {
			if (this.window.isDestroyed()) return
			this.window.webContents.send(IPC_CHANNELS.downloadsProbeProgress, event)
		}

		this.probeService.on('progress', this.onProgress)
	}

	detach(): void {
		if (this.onProgress) this.probeService.off('progress', this.onProgress)
		this.onProgress = undefined
	}
}
