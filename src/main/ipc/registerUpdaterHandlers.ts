import { app, ipcMain, type BrowserWindow } from 'electron';
import { autoUpdater } from 'electron-updater';
import { IPC_CHANNELS } from '@shared/ipc';

export function registerUpdaterHandlers(mainWindow: BrowserWindow): void {
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;

  autoUpdater.on('update-available', (info) => {
    if (mainWindow.isDestroyed()) return;
    mainWindow.webContents.send(IPC_CHANNELS.updaterAvailable, {
      version: info.version,
      currentVersion: app.getVersion(),
      canAutoInstall: process.platform !== 'darwin' && !process.env.PORTABLE_EXECUTABLE_DIR,
    });
  });

  autoUpdater.on('update-downloaded', () => {
    autoUpdater.quitAndInstall(false, true);
  });

  autoUpdater.on('error', (err) => {
    console.error('[updater]', err.message);
  });

  ipcMain.handle(IPC_CHANNELS.updaterInstall, async () => {
    await autoUpdater.downloadUpdate();
  });

  setTimeout(() => { void autoUpdater.checkForUpdates(); }, 5_000);
}
