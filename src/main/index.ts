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

function createMainWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 720,
    minHeight: 560,
    title: 'YT Download',
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

  void Promise.allSettled([
    binaryManager.ensureYtDlp(),
    binaryManager.ensureFFmpeg(),
    tokenService.warmUp()
  ]);

  const mainWindow = createMainWindow();

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

  registerIpcHandlers({
    mainWindow,
    downloadService,
    formatProbeService,
    settingsStore,
    logService
  });

  app.on('before-quit', () => {
    void downloadService.cancel();
    tokenService.dispose();
    logService.log('INFO', 'App shutting down');
  });
});

app.on('window-all-closed', () => {
  app.quit();
});
