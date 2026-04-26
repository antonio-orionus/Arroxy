import path from 'node:path';
import { app, BrowserWindow, dialog } from 'electron';
import { IPC_CHANNELS } from '@shared/ipc';
import { registerIpcHandlers } from '@main/ipc/registerIpcHandlers';
import { BinaryManager } from '@main/services/BinaryManager';
import { DownloadService } from '@main/services/DownloadService';
import { FormatProbeService } from '@main/services/FormatProbeService';
import { LogService } from '@main/services/LogService';
import { TokenService } from '@main/services/TokenService';
import { RecentJobsStore } from '@main/stores/RecentJobsStore';
import { SettingsStore } from '@main/stores/SettingsStore';
import { HiddenWindowTokenProvider } from '@main/token/providers/HiddenWindowTokenProvider';
import { MockTokenProvider } from '@main/token/providers/MockTokenProvider';
import type { AppSettings } from '@shared/types';

const isMockBackend = process.env.MOCK_BACKEND === '1';

if (process.env.ELECTRON_USER_DATA) {
  app.setPath('userData', process.env.ELECTRON_USER_DATA);
}

const hasSingleInstanceLock = app.requestSingleInstanceLock();

if (!hasSingleInstanceLock) {
  app.quit();
}

function createMainWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 900,
    height: 760,
    minWidth: 720,
    minHeight: 460,
    title: 'Arroxy',
    frame: false,
    titleBarStyle: 'hidden',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  window.on('maximize', () => window.webContents.send(IPC_CHANNELS.windowMaximizedChange, true));
  window.on('unmaximize', () => window.webContents.send(IPC_CHANNELS.windowMaximizedChange, false));

  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', (event) => {
    event.preventDefault();
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    void window.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    void window.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  return window;
}

if (hasSingleInstanceLock) {
  void app.whenReady().then(() => {
    const userDataPath = app.getPath('userData');
    const logService = new LogService(userDataPath);

    const defaultSettings: AppSettings = {
      defaultOutputDir: app.getPath('downloads'),
      rememberLastOutputDir: true
    };

    const settingsStore = new SettingsStore(userDataPath, defaultSettings);
    const recentJobsStore = new RecentJobsStore(userDataPath);
    const binaryManager = new BinaryManager(userDataPath, logService);
    const tokenProvider = isMockBackend ? new MockTokenProvider() : new HiddenWindowTokenProvider();
    const tokenService = new TokenService(tokenProvider, logService);
    const downloadService = new DownloadService(
      binaryManager,
      tokenService,
      recentJobsStore,
      logService,
      isMockBackend
    );
    const formatProbeService = new FormatProbeService(
      binaryManager,
      tokenService,
      logService,
      isMockBackend
    );

    const mainWindow = createMainWindow();

    app.on('second-instance', () => {
      if (mainWindow.isDestroyed()) return;
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    });

    mainWindow.on('close', (event) => {
      if (downloadService.activeCount === 0) return;
      const choice = dialog.showMessageBoxSync(mainWindow, {
        type: 'warning',
        buttons: ['Cancel Downloads & Quit', 'Keep Downloading'],
        defaultId: 1,
        cancelId: 1,
        message: `${downloadService.activeCount} download${downloadService.activeCount > 1 ? 's' : ''} in progress`,
        detail: 'Closing will cancel all active downloads.'
      });
      if (choice === 1) event.preventDefault();
    });

    mainWindow.on('closed', () => {
      app.quit();
    });

    registerIpcHandlers({
      mainWindow,
      binaryManager,
      downloadService,
      formatProbeService,
      settingsStore,
      logService,
      tokenService
    });

    app.on('before-quit', (event) => {
      if (downloadService.activeCount === 0) {
        tokenService.dispose();
        logService.log('INFO', 'App shutting down');
        return;
      }
      event.preventDefault();
      void downloadService.cancel().finally(() => {
        tokenService.dispose();
        logService.log('INFO', 'App shutting down');
        app.exit(0); // must use exit(), not quit() — quit() re-emits before-quit causing infinite loop
      });
    });
  });
}

app.on('window-all-closed', () => {
  app.quit();
});
