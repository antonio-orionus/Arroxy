import type { BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '@shared/ipc';
import type { DownloadService } from './DownloadService';

const PROGRESS_THROTTLE_MS = 100;

export class DownloadEventBridge {
  private readonly lastProgressAt = new Map<string, number>();

  constructor(
    private readonly downloadService: DownloadService,
    private readonly window: BrowserWindow
  ) {}

  attach(): void {
    this.downloadService.removeAllListeners('status');
    this.downloadService.removeAllListeners('progress');

    this.downloadService.on('status', (event) => {
      if (event.stage === 'done' || event.stage === 'error') {
        this.lastProgressAt.delete(event.jobId);
      }
      if (this.window.isDestroyed()) return;
      this.window.webContents.send(IPC_CHANNELS.eventsStatus, event);
    });

    this.downloadService.on('progress', (event) => {
      if (this.window.isDestroyed()) return;
      const now = Date.now();
      const last = this.lastProgressAt.get(event.jobId) ?? 0;
      if (now - last < PROGRESS_THROTTLE_MS) return;
      this.lastProgressAt.set(event.jobId, now);
      this.window.webContents.send(IPC_CHANNELS.eventsProgress, event);
    });
  }

  detach(): void {
    this.downloadService.removeAllListeners('status');
    this.downloadService.removeAllListeners('progress');
    this.lastProgressAt.clear();
  }
}
