import path from 'node:path';
import { app, BrowserWindow, dialog } from 'electron';
import { IPC_CHANNELS } from '@shared/ipc';
import { TrayManager } from '@main/services/TrayManager';
import { mainT, pluralKey } from '@main/i18n';
import { pickLanguage } from '@shared/i18n';
import { registerIpcHandlers } from '@main/ipc/registerIpcHandlers';
import { registerUpdaterHandlers } from '@main/ipc/registerUpdaterHandlers';
import { setupAnalytics, setAnalyticsEnabled, trackMain } from '@main/services/analytics';
import { detectInstallChannel } from '@main/installChannel';
import { BinaryManager } from '@main/services/BinaryManager';
import { DownloadService } from '@main/services/DownloadService';
import { FormatProbeService } from '@main/services/FormatProbeService';
import { LogService } from '@main/services/LogService';
import { TokenService } from '@main/services/TokenService';
import { YtDlp } from '@main/services/YtDlp';
import { RecentJobsStore } from '@main/stores/RecentJobsStore';
import { SettingsStore } from '@main/stores/SettingsStore';
import { QueueStore } from '@main/stores/QueueStore';
import { ClipboardWatcher, watcherWindowFromBrowserWindow } from '@main/services/ClipboardWatcher';
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
  // Must be called before app.isReady() so aptabase registers its custom protocol scheme.
  setupAnalytics(
    process.env.APTABASE_KEY,
    !!(process.env.ELECTRON_RENDERER_URL) || isMockBackend || !!process.env.ARROXY_SMOKE_URL
  );

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
    const ytDlp = new YtDlp(binaryManager, tokenService, settingsStore);
    const downloadService = new DownloadService(ytDlp, recentJobsStore, logService, isMockBackend);
    const formatProbeService = new FormatProbeService(ytDlp, logService, isMockBackend);

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

    // Enable analytics now that we know it's a real (non-smoke) session.
    setAnalyticsEnabled(initialSettings.analyticsEnabled ?? true);
    const isFirstRun = !initialSettings.firstRunCompleted;
    if (isFirstRun) {
      await settingsStore.update({ firstRunCompleted: true });
    }
    const arch: string = process.arch === 'arm64' ? 'arm64' : 'x64';
    trackMain('app_started', {
      install_channel: detectInstallChannel(app.getName()),
      platform_arch: `${process.platform}-${arch}`,
      is_first_run: isFirstRun,
    });

    const mainWindow = createMainWindow();

    app.on('second-instance', () => {
      if (mainWindow.isDestroyed()) return;
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    });

    // Declare tray before the close handler so the handler can reference it.
    let tray: TrayManager | null = null;

    async function warnActiveDownloadsThenQuit(): Promise<void> {
      if (downloadService.pendingCancelCount === 0) {
        app.quit();
        return;
      }
      const count = downloadService.pendingCancelCount;
      const lang = languageRef.current;
      const { response } = await dialog.showMessageBox(mainWindow, {
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
      if (response === 0) app.quit();
    }

    mainWindow.on('close', (event) => {
      if (process.platform === 'darwin' || tray === null) {
        // Original behavior: warn if downloads active, then let the close proceed → app.quit()
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
        return;
      }

      // Tray mode: intercept every close; decide async based on persisted behavior
      event.preventDefault();
      void settingsStore.get().then(async (settings) => {
        const closeBehavior = settings.closeBehavior ?? 'ask';

        if (closeBehavior === 'tray') {
          mainWindow.hide();
          return;
        }

        if (closeBehavior === 'quit') {
          await warnActiveDownloadsThenQuit();
          return;
        }

        // 'ask': no active downloads → nothing to keep alive, just quit
        if (downloadService.pendingCancelCount === 0) {
          app.quit();
          return;
        }

        // 'ask': active downloads present — offer the first-time tray dialog
        const lang = languageRef.current;
        const { response, checkboxChecked } = await dialog.showMessageBox(mainWindow, {
          type: 'question',
          buttons: [
            mainT(lang, 'dialogs.closeToTray.hide'),
            mainT(lang, 'dialogs.closeToTray.quit')
          ],
          defaultId: 0,
          cancelId: 1,
          message: mainT(lang, 'dialogs.closeToTray.message'),
          detail: mainT(lang, 'dialogs.closeToTray.detail'),
          checkboxLabel: mainT(lang, 'dialogs.closeToTray.remember'),
          checkboxChecked: false
        });
        const choice = response === 0 ? 'tray' : 'quit';
        if (checkboxChecked) {
          await settingsStore.update({ closeBehavior: choice });
        }
        trackMain('tray_close_chosen', { choice, remember: checkboxChecked });
        if (choice === 'tray') {
          mainWindow.hide();
        } else {
          await warnActiveDownloadsThenQuit();
        }
      });
    });

    const clipboardWatcher = new ClipboardWatcher(watcherWindowFromBrowserWindow(mainWindow));
    clipboardWatcher.setEnabled(initialSettings.clipboardWatchEnabled);

    registerIpcHandlers({
      mainWindow,
      binaryManager,
      downloadService,
      formatProbeService,
      settingsStore,
      queueStore,
      logService,
      tokenService,
      languageRef,
      clipboardWatcher
    });

    registerUpdaterHandlers(mainWindow);

    if (process.platform !== 'darwin') {
      try {
        tray = new TrayManager(mainWindow, downloadService, languageRef, () => {
          void warnActiveDownloadsThenQuit();
        });
        tray.start();
      } catch (e) {
        logService.log('WARN', `Tray init failed — running without tray: ${String(e)}`);
        tray = null;
      }
    }

    app.on('before-quit', (event) => {
      tray?.destroy();
      tray = null;
      clipboardWatcher.dispose();
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
