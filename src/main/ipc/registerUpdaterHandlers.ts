import { app, ipcMain, type BrowserWindow } from 'electron';
import { autoUpdater } from 'electron-updater';
import { IPC_CHANNELS } from '@shared/ipc';
import { detectInstallChannel } from '@main/installChannel';

export function registerUpdaterHandlers(mainWindow: BrowserWindow): void {
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;
  const installChannel = detectInstallChannel(app.getName());

  // Remove prior bindings so re-registering (HMR, window recreate) doesn't
  // stack listeners that would each call quitAndInstall on a single update.
  autoUpdater.removeAllListeners('update-available');
  autoUpdater.removeAllListeners('update-downloaded');
  autoUpdater.removeAllListeners('error');

  autoUpdater.on('update-available', (info) => {
    if (mainWindow.isDestroyed()) return;
    mainWindow.webContents.send(IPC_CHANNELS.updaterAvailable, {
      version: info.version,
      currentVersion: app.getVersion(),
      installChannel,
    });
  });

  autoUpdater.on('update-downloaded', () => {
    autoUpdater.quitAndInstall(false, true);
  });

  autoUpdater.on('error', (err) => {
    console.error('[updater]', err.message);
  });

  ipcMain.removeHandler(IPC_CHANNELS.updaterInstall);
  ipcMain.handle(IPC_CHANNELS.updaterInstall, async () => {
    await autoUpdater.downloadUpdate();
  });

  setTimeout(() => { void autoUpdater.checkForUpdates(); }, 5_000);
}
