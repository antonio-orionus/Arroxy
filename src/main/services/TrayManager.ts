import path from 'node:path';
import { Tray, Menu, nativeImage, type BrowserWindow } from 'electron';
import { mainT, pluralKey } from '@main/i18n';
import type { DownloadService } from './DownloadService';
import type { SupportedLang } from '@shared/i18n/types';

function resolveTrayIconPath(): string {
  if (process.env.ELECTRON_RENDERER_URL || !process.resourcesPath) {
    return path.join(__dirname, '../../build/icon-tray.png');
  }
  return path.join(process.resourcesPath, 'icon-tray.png');
}

export class TrayManager {
  private tray: Tray | null = null;
  private throttleTimer: ReturnType<typeof setTimeout> | null = null;
  private jobPercents = new Map<string, number>();

  private readonly onProgress: (event: { jobId: string; percent?: number }) => void;
  private readonly onStatus: (event: { jobId: string; stage: string }) => void;

  constructor(
    private readonly mainWindow: BrowserWindow,
    private readonly downloadService: DownloadService,
    private readonly languageRef: { current: SupportedLang },
    private readonly onQuit: () => void = () => {}
  ) {
    this.onProgress = (event) => {
      if (event.percent !== undefined) {
        this.jobPercents.set(event.jobId, event.percent);
      }
      this.scheduleMenuRebuild();
    };

    this.onStatus = (event) => {
      if (event.stage === 'done' || event.stage === 'error') {
        this.jobPercents.delete(event.jobId);
      }
      this.rebuildMenu();
    };
  }

  start(): void {
    const icon = nativeImage.createFromPath(resolveTrayIconPath());
    this.tray = new Tray(icon);
    this.tray.setToolTip(mainT(this.languageRef.current, 'tray.tooltip'));
    this.tray.on('click', () => this.toggleWindow());

    this.downloadService.on('progress', this.onProgress);
    this.downloadService.on('status', this.onStatus);

    this.rebuildMenu();
  }

  toggleWindow(): void {
    if (this.mainWindow.isDestroyed()) return;
    if (this.mainWindow.isVisible()) {
      this.mainWindow.hide();
    } else {
      this.mainWindow.show();
      this.mainWindow.focus();
    }
  }

  destroy(): void {
    if (this.throttleTimer !== null) {
      clearTimeout(this.throttleTimer);
      this.throttleTimer = null;
    }
    this.downloadService.removeListener('progress', this.onProgress);
    this.downloadService.removeListener('status', this.onStatus);
    if (this.tray && !this.tray.isDestroyed()) {
      this.tray.destroy();
    }
    this.tray = null;
  }

  private scheduleMenuRebuild(): void {
    if (this.throttleTimer !== null) return;
    this.throttleTimer = setTimeout(() => {
      this.throttleTimer = null;
      this.rebuildMenu();
    }, 1000);
  }

  private rebuildMenu(): void {
    if (!this.tray || this.tray.isDestroyed()) return;
    const lang = this.languageRef.current;

    const activeCount = this.downloadService.activeCount;
    let statusLabel: string;
    if (activeCount === 0) {
      statusLabel = mainT(lang, 'tray.menu.statusIdle');
    } else {
      const percents = [...this.jobPercents.values()];
      const avg = percents.length > 0 ? Math.round(percents.reduce((s, p) => s + p, 0) / percents.length) : 0;
      statusLabel = mainT(lang, `tray.menu.${pluralKey('statusActive', activeCount)}`, {
        count: activeCount,
        percent: avg
      });
    }

    const menu = Menu.buildFromTemplate([{ label: statusLabel, enabled: false }, { type: 'separator' }, { label: mainT(lang, 'tray.menu.open'), click: () => this.toggleWindow() }, { type: 'separator' }, { label: mainT(lang, 'tray.menu.quit'), click: () => this.onQuit() }]);
    this.tray.setContextMenu(menu);
  }
}
