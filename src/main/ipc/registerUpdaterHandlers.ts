import { app, ipcMain, type BrowserWindow } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log/main';
import { IPC_CHANNELS } from '@shared/ipc';
import { detectInstallChannel } from '@main/installChannel';
import { trackMain } from '@main/services/analytics';
import type { InstallChannel, UpdateAvailablePayload, UpdateInstallResult } from '@shared/types';

// Channels where the in-app installer should not run — either because an
// external package manager owns updates (scoop/homebrew) or because the
// install layout can't accept an NSIS overwrite (portable). The renderer
// still gets a banner so the user can copy the upgrade command.
const NON_INSTALLABLE: ReadonlySet<InstallChannel> = new Set(['scoop', 'homebrew', 'portable']);

export function registerUpdaterHandlers(mainWindow: BrowserWindow): void {
  const installChannel = detectInstallChannel(app.getName());

  // Flatpak updates are managed by the Flatpak ecosystem (flatpak update /
  // GNOME Software). Running the in-app autoUpdater here would be wrong (it
  // can't install) and showing a banner without a real update check would be
  // misleading — the host package manager already notifies the user.
  if (installChannel === 'flatpak') return;

  // Portable and scoop targets ship a portable .exe that extracts to %TEMP% —
  // app-update.yml is absent from that extracted bundle, causing ENOENT when
  // electron-updater tries to read the feed. setFeedURL is authoritative and
  // overrides the missing file on all targets (no-op cost on NSIS/DMG/AppImage).
  autoUpdater.setFeedURL({ provider: 'github', owner: 'antonio-orionus', repo: 'Arroxy' });

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;

  autoUpdater.removeAllListeners('update-available');
  autoUpdater.removeAllListeners('update-downloaded');
  autoUpdater.removeAllListeners('error');

  // Track the install request so an `error` event can resolve the in-flight
  // IPC call instead of leaving the renderer spinner hanging forever.
  let pendingInstall: ((result: UpdateInstallResult) => void) | null = null;

  autoUpdater.on('update-available', (info) => {
    if (mainWindow.isDestroyed()) return;
    const payload: UpdateAvailablePayload = {
      version: info.version,
      currentVersion: app.getVersion(),
      installChannel
    };
    mainWindow.webContents.send(IPC_CHANNELS.updaterAvailable, payload);
    trackMain('update_available', { to_version: info.version, install_channel: installChannel });
  });

  autoUpdater.on('update-downloaded', () => {
    if (pendingInstall) {
      pendingInstall({ ok: true });
      pendingInstall = null;
    }
    autoUpdater.quitAndInstall(false, true);
  });

  autoUpdater.on('error', (err) => {
    log.error('[updater]', err.message);
    if (pendingInstall) {
      pendingInstall({ ok: false, error: err.message });
      pendingInstall = null;
    }
  });

  ipcMain.removeHandler(IPC_CHANNELS.updaterInstall);
  ipcMain.handle(IPC_CHANNELS.updaterInstall, async (): Promise<UpdateInstallResult> => {
    trackMain('update_install_clicked', { install_channel: installChannel });

    // Defense-in-depth: the renderer never exposes the install button on these
    // channels, but a stray invoke must not clobber the external install.
    if (NON_INSTALLABLE.has(installChannel)) {
      return { ok: false, error: `install not supported for channel: ${installChannel}` };
    }

    return new Promise<UpdateInstallResult>((resolve) => {
      pendingInstall = resolve;
      autoUpdater.downloadUpdate().catch((err: Error) => {
        if (pendingInstall) {
          pendingInstall({ ok: false, error: err.message });
          pendingInstall = null;
        }
      });
    });
  });

  setTimeout(() => {
    void autoUpdater.checkForUpdates();
  }, 5_000);
}
