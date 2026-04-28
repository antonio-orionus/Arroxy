import path from 'node:path';
import { app, BrowserWindow, dialog } from 'electron';
import { IPC_CHANNELS } from '@shared/ipc';
import { mainT, pluralKey } from '@main/i18n';
import { pickLanguage } from '@shared/i18n';
import { registerIpcHandlers } from '@main/ipc/registerIpcHandlers';
import { registerUpdaterHandlers } from '@main/ipc/registerUpdaterHandlers';
import { BinaryManager } from '@main/services/BinaryManager';
import { DownloadService } from '@main/services/DownloadService';
import { FormatProbeService } from '@main/services/FormatProbeService';
import { LogService } from '@main/services/LogService';
import { TokenService } from '@main/services/TokenService';
import { RecentJobsStore } from '@main/stores/RecentJobsStore';
import { SettingsStore } from '@main/stores/SettingsStore';
import { QueueStore } from '@main/stores/QueueStore';
import { HiddenWindowTokenProvider } from '@main/token/providers/HiddenWindowTokenProvider';
import { MockTokenProvider } from '@main/token/providers/MockTokenProvider';
import { defaultAppSettings } from '@shared/constants';
import { runSmokeMode, readSmokeUrl, exitWithCode } from '@main/smoke';

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
  void app.whenReady().then(async () => {
    const userDataPath = app.getPath('userData');
    const logService = new LogService(userDataPath);

    const settingsStore = new SettingsStore(userDataPath, defaultAppSettings(app.getPath('downloads')));
    const initialSettings = await settingsStore.get();
    const languageRef: { current: ReturnType<typeof pickLanguage> } = {
      current: pickLanguage(initialSettings.language ?? app.getLocale())
    };
    const recentJobsStore = new RecentJobsStore(userDataPath);
    const queueStore = new QueueStore(userDataPath);
    const binaryManager = new BinaryManager(userDataPath, logService);
    const tokenProvider = isMockBackend ? new MockTokenProvider() : new HiddenWindowTokenProvider(logService);
    const tokenService = new TokenService(tokenProvider, logService);
    const downloadService = new DownloadService(
      binaryManager,
      tokenService,
      recentJobsStore,
      logService,
      settingsStore,
      isMockBackend
    );
    const formatProbeService = new FormatProbeService(
      binaryManager,
      tokenService,
      logService,
      settingsStore,
      isMockBackend
    );

    // Headless smoke mode — exercises PoT scrape + 3-attempt ladder against
    // real YouTube using production services, then exits. No window created.
    const smokeUrl = readSmokeUrl();
    if (smokeUrl) {
      const code = await runSmokeMode({
        url: smokeUrl,
        binaryManager,
        tokenService,
        formatProbeService
      });
      tokenService.dispose();
      exitWithCode(code);
      return;
    }

    const mainWindow = createMainWindow();

    app.on('second-instance', () => {
      if (mainWindow.isDestroyed()) return;
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    });

    mainWindow.on('close', (event) => {
      if (downloadService.pendingCancelCount === 0) return;
      const count = downloadService.pendingCancelCount;
      const lang = languageRef.current;
      const choice = dialog.showMessageBoxSync(mainWindow, {
        type: 'warning',
        buttons: [
          mainT(lang, 'dialogs.quitWithActiveDownloads.confirm'),
          mainT(lang, 'dialogs.quitWithActiveDownloads.keep')
        ],
        defaultId: 1,
        cancelId: 1,
        message: mainT(lang, `dialogs.quitWithActiveDownloads.${pluralKey('message', count)}`, { count }),
        detail: mainT(lang, 'dialogs.quitWithActiveDownloads.detail')
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
      queueStore,
      logService,
      tokenService,
      languageRef
    });

    registerUpdaterHandlers(mainWindow);

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
  // In smoke mode, the hidden token window is created/destroyed transiently
  // and we don't want that to trigger a quit mid-probe. The smoke runner
  // calls app.exit() itself when its async work finishes.
  if (process.env.ARROXY_SMOKE_URL) return;
  app.quit();
});
