import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { app, BrowserWindow, dialog } from 'electron';
import log from 'electron-log/main.js';
import { IPC_CHANNELS } from '@shared/ipc.js';
import { TrayManager } from '@main/services/TrayManager.js';
import { mainT, pluralKey } from '@main/i18n.js';
import { pickLanguage } from '@shared/i18n/index.js';
import { registerIpcHandlers } from '@main/ipc/registerIpcHandlers.js';
import { registerUpdaterHandlers } from '@main/ipc/registerUpdaterHandlers.js';
import { setupAnalytics, setAnalyticsEnabled, trackCrashDetectedOncePerSession, trackMain } from '@main/services/analytics.js';
import { detectInstallChannel } from '@main/installChannel.js';
import { BinaryManager } from '@main/services/BinaryManager.js';
import { DownloadService } from '@main/services/DownloadService.js';
import { QueueService } from '@main/services/QueueService.js';
import { ProbeService } from '@main/services/ProbeService.js';
import { TokenService } from '@main/services/TokenService.js';
import { YtDlp } from '@main/services/YtDlp.js';
import { RecentJobsStore } from '@main/stores/RecentJobsStore.js';
import { SettingsStore } from '@main/stores/SettingsStore.js';
import { QueueStore } from '@main/stores/QueueStore.js';
import { PlaylistManifestStore } from '@main/stores/PlaylistManifestStore.js';
import { writePlaylistM3u } from '@main/services/playlistM3u.js';
import { ClipboardWatcher, watcherWindowFromBrowserWindow } from '@main/services/ClipboardWatcher.js';
import { HiddenWindowTokenProvider } from '@main/token/providers/HiddenWindowTokenProvider.js';
import { MockTokenProvider } from '@main/token/providers/MockTokenProvider.js';
import { defaultAppSettings, WINDOW_MIN_WIDTH, WINDOW_MIN_HEIGHT, WINDOW_DEFAULT_WIDTH, WINDOW_DEFAULT_HEIGHT } from '@shared/constants.js';
import { runSmokeMode, readSmokeUrl, exitWithCode } from '@main/smoke.js';
import { cancelQueueBeforeExit } from '@main/shutdown.js';
import { decideCloseAction, decideRendererCrashAction } from '@main/windowLifecycle.js';
import { registerPreloadDiagnostics, resolveMainWindowPreloadPath } from '@main/preloadDiagnostics.js';
import contextMenu from 'electron-context-menu';
import windowStateKeeper from 'electron-window-state';

log.initialize();

// Catch fatal main-process errors that would otherwise crash silently before
// any window appears — without these, pre-ready bugs leave no diagnostic trail.
process.on('uncaughtException', (err) => {
  log.error('uncaughtException', err);
});
process.on('unhandledRejection', (reason) => {
  log.error('unhandledRejection', reason);
});

// Log platform identity at top-level (NOT inside whenReady) so a pre-ready
// hang still produces a log line we can read in bug reports.
log.info('boot', {
  platform: process.platform,
  arch: process.arch,
  release: os.release(),
  electron: process.versions.electron,
  chrome: process.versions.chrome,
  node: process.versions.node,
  argv: process.argv.slice(1)
});

const isMockBackend = process.env.MOCK_BACKEND === '1';

if (process.env.ELECTRON_USER_DATA) {
  app.setPath('userData', process.env.ELECTRON_USER_DATA);
}

// Pre-flight runtime args. Lets users recover from GPU/driver hangs that prevent
// the window from ever appearing — they edit argv.json by hand, no UI needed.
// Mirrors VS Code's `argv.json` pattern.
try {
  const argvPath = path.join(app.getPath('userData'), 'argv.json');
  if (fs.existsSync(argvPath)) {
    const raw = fs.readFileSync(argvPath, 'utf8');
    const cfg = JSON.parse(raw) as { 'disable-hardware-acceleration'?: boolean };
    if (cfg['disable-hardware-acceleration']) {
      app.disableHardwareAcceleration();
      log.info('argv.json applied', { 'disable-hardware-acceleration': true });
    }
  }
} catch (err) {
  log.warn('argv.json read failed', err);
}

// Sandbox every BrowserWindow without per-window opt-in. Matches vscode +
// element-desktop. Must run before BrowserWindow construction; safe to call
// pre-`whenReady`. contextIsolation + nodeIntegration:false stay declared on
// each BrowserWindow because they're orthogonal guarantees that
// app.enableSandbox() does not subsume.
app.enableSandbox();

const hasSingleInstanceLock = app.requestSingleInstanceLock();

if (!hasSingleInstanceLock) {
  app.quit();
}

function createMainWindow(): BrowserWindow {
  const winState = windowStateKeeper({ defaultWidth: WINDOW_DEFAULT_WIDTH, defaultHeight: WINDOW_DEFAULT_HEIGHT });
  const preloadPath = resolveMainWindowPreloadPath(import.meta.dirname);

  const window = new BrowserWindow({
    x: winState.x,
    y: winState.y,
    width: winState.width,
    height: winState.height,
    minWidth: WINDOW_MIN_WIDTH,
    minHeight: WINDOW_MIN_HEIGHT,
    title: 'Arroxy',
    frame: false,
    titleBarStyle: 'hidden',
    autoHideMenuBar: true,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  registerPreloadDiagnostics(window, preloadPath);
  winState.manage(window);

  window.on('maximize', () => window.webContents.send(IPC_CHANNELS.windowMaximizedChange, true));
  window.on('unmaximize', () => window.webContents.send(IPC_CHANNELS.windowMaximizedChange, false));

  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', (event) => {
    event.preventDefault();
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    void window.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    void window.loadFile(path.join(import.meta.dirname, '../renderer/index.html'));
  }

  return window;
}

if (hasSingleInstanceLock) {
  void app.whenReady().then(async () => {
    const userDataPath = app.getPath('userData');
    log.transports.file.resolvePathFn = () => path.join(userDataPath, 'logs', 'main.log');
    log.info('Session started');
    log.info('gpu features', app.getGPUFeatureStatus());
    void app
      .getGPUInfo('basic')
      .then((info) => log.info('gpu info', info))
      .catch((err: unknown) => log.warn('gpu info failed', err));

    const settingsStore = new SettingsStore(userDataPath, defaultAppSettings(app.getPath('downloads')));
    const initialSettings = await settingsStore.get();
    // installId is stamped lazily by SettingsStore on first launch — guaranteed
    // present after `get()`. Empty string fallback keeps TS happy without
    // weakening the type elsewhere.
    const installId = initialSettings.common.installId ?? '';
    const isDev = !!process.env.ELECTRON_RENDERER_URL || isMockBackend || !!process.env.ARROXY_SMOKE_URL;
    const cpuModel = os.cpus()[0]?.model ?? 'unknown';
    const osLocale = app.getLocale();
    setupAnalytics(process.env.OPENPANEL_CLIENT_ID, process.env.OPENPANEL_CLIENT_SECRET, isDev, installId, {
      appVersion: app.getVersion(),
      platform: process.platform,
      architecture: process.arch,
      systemVersion: os.release(),
      modelName: cpuModel,
      osLocale,
      appLocale: initialSettings.common.language ?? osLocale
    });
    const languageRef: { current: ReturnType<typeof pickLanguage> } = {
      current: pickLanguage(initialSettings.common.language ?? app.getLocale())
    };
    const recentJobsStore = new RecentJobsStore(userDataPath);
    const queueStore = new QueueStore(userDataPath);
    const playlistManifestStore = new PlaylistManifestStore(userDataPath);
    const binaryManager = new BinaryManager(userDataPath, {
      overridesProvider: () => settingsStore.getSync().common.binaryOverrides
    });
    const tokenProvider = isMockBackend ? new MockTokenProvider() : new HiddenWindowTokenProvider();
    const tokenService = new TokenService(tokenProvider);
    const ytDlp = new YtDlp(binaryManager, tokenService, settingsStore);
    const downloadService = new DownloadService(ytDlp, recentJobsStore, isMockBackend);
    const probeService = new ProbeService(ytDlp, isMockBackend);
    const queueService = new QueueService(queueStore, downloadService, undefined, undefined, { manifestStore: playlistManifestStore, writeM3u: writePlaylistM3u });
    await queueService.init();

    // Headless smoke mode — exercises PoT scrape + 3-attempt ladder against
    // real YouTube using production services, then exits. No window created.
    const smokeUrl = readSmokeUrl();
    if (smokeUrl) {
      const code = await runSmokeMode({
        url: smokeUrl,
        binaryManager,
        tokenService,
        probeService
      });
      tokenService.dispose();
      exitWithCode(code);
      return;
    }

    // Enable analytics now that we know it's a real (non-smoke) session.
    setAnalyticsEnabled(initialSettings.common.analyticsEnabled ?? true);
    const isFirstRun = !initialSettings.common.firstRunCompleted;
    if (isFirstRun) {
      await settingsStore.update({ common: { firstRunCompleted: true } });
    }
    const arch: string = process.arch === 'arm64' ? 'arm64' : 'x64';
    trackMain('app_started', {
      install_channel: detectInstallChannel(app.getName()),
      platform_arch: `${process.platform}-${arch}`,
      is_first_run: isFirstRun
    });

    const mainWindow = createMainWindow();

    contextMenu({
      window: mainWindow.webContents,
      showSaveImageAs: true,
      showCopyImageAddress: true,
      showInspectElement: !app.isPackaged
    });

    app.on('second-instance', () => {
      if (mainWindow.isDestroyed()) return;
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    });

    // Declare tray before the close handler so the handler can reference it.
    let tray: TrayManager | null = null;

    async function warnActiveDownloadsThenQuit(): Promise<void> {
      if (downloadService.runningJobCount === 0) {
        app.quit();
        return;
      }
      const count = downloadService.runningJobCount;
      const lang = languageRef.current;
      const { response } = await dialog.showMessageBox(mainWindow, {
        type: 'warning',
        buttons: [mainT(lang, 'dialogs.quitWithActiveDownloads.pause'), mainT(lang, 'dialogs.quitWithActiveDownloads.confirm'), mainT(lang, 'dialogs.quitWithActiveDownloads.keep')],
        defaultId: 2,
        cancelId: 2,
        message: mainT(lang, `dialogs.quitWithActiveDownloads.${pluralKey('message', count)}`, { count }),
        detail: mainT(lang, 'dialogs.quitWithActiveDownloads.detail')
      });
      if (response === 0) {
        await queueService.pauseAll();
        app.quit();
      } else if (response === 1) {
        app.quit();
      }
      // response === 2: keep downloading — do nothing
    }

    mainWindow.on('close', (event) => {
      const hasTray = tray !== null;

      if (process.platform === 'darwin' || !hasTray) {
        // No tray: allow if idle, else intercept and warn
        if (downloadService.runningJobCount === 0) return;
        event.preventDefault();
        void warnActiveDownloadsThenQuit();
        return;
      }

      // Tray present: always intercept; read persisted behavior async
      event.preventDefault();
      void settingsStore.get().then(async (settings) => {
        const action = decideCloseAction({
          platform: process.platform,
          hasTray,
          closeBehavior: settings.common.closeBehavior ?? 'ask',
          runningCount: downloadService.runningJobCount
        });

        if (action === 'hide') {
          mainWindow.hide();
          return;
        }
        if (action === 'quit-direct') {
          app.quit();
          return;
        }
        if (action === 'warn-and-quit') {
          await warnActiveDownloadsThenQuit();
          return;
        }

        // 'ask-tray': active downloads present — offer the first-time tray dialog
        const lang = languageRef.current;
        const { response, checkboxChecked } = await dialog.showMessageBox(mainWindow, {
          type: 'question',
          buttons: [mainT(lang, 'dialogs.closeToTray.hide'), mainT(lang, 'dialogs.closeToTray.quit')],
          defaultId: 0,
          cancelId: 1,
          message: mainT(lang, 'dialogs.closeToTray.message'),
          detail: mainT(lang, 'dialogs.closeToTray.detail'),
          checkboxLabel: mainT(lang, 'dialogs.closeToTray.remember'),
          checkboxChecked: false
        });
        const choice = response === 0 ? 'tray' : 'quit';
        if (checkboxChecked) {
          await settingsStore.update({ common: { closeBehavior: choice } });
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
    clipboardWatcher.setEnabled(initialSettings.common.clipboardWatchEnabled);

    registerIpcHandlers({
      mainWindow,
      binaryManager,
      downloadService,
      probeService,
      settingsStore,
      queueService,
      tokenService,
      languageRef,
      clipboardWatcher,
      playlistManifestStore
    });

    registerUpdaterHandlers(mainWindow);

    app.on('render-process-gone', (_event, webContents, details) => {
      log.error(`Renderer process gone: reason=${details.reason} exitCode=${details.exitCode}`);
      if (details.reason === 'clean-exit') return;
      const isMainWindow = webContents === mainWindow.webContents;
      trackCrashDetectedOncePerSession({
        kind: 'renderer',
        windowRole: isMainWindow ? 'main-window' : 'auxiliary-window',
        reason: details.reason
      });
      if (!isMainWindow) return;
      const lang = languageRef.current;
      const opts = {
        type: 'error' as const,
        buttons: [mainT(lang, 'dialogs.rendererCrashed.reload'), mainT(lang, 'dialogs.rendererCrashed.quit')],
        defaultId: 0,
        cancelId: 1,
        message: mainT(lang, 'dialogs.rendererCrashed.message'),
        detail: mainT(lang, 'dialogs.rendererCrashed.detail', { reason: details.reason })
      };
      void (mainWindow.isDestroyed() ? dialog.showMessageBox(opts) : dialog.showMessageBox(mainWindow, opts)).then(({ response }) => {
        const action = decideRendererCrashAction({ reason: details.reason, isMainWindow: true, dialogResponse: response });
        if (action === 'reload' && !mainWindow.isDestroyed()) mainWindow.reload();
        else app.quit();
      });
    });

    app.on('child-process-gone', (_event, details) => {
      if (details.reason === 'clean-exit') return;
      log.warn(`Child process gone: type=${details.type} reason=${details.reason} exitCode=${details.exitCode} name=${details.name ?? 'unknown'} serviceName=${details.serviceName ?? 'unknown'}`);
      trackCrashDetectedOncePerSession({
        kind: 'child',
        type: details.type,
        reason: details.reason,
        name: details.name,
        serviceName: details.serviceName
      });
    });

    if (process.platform !== 'darwin') {
      try {
        tray = new TrayManager(mainWindow, queueService, languageRef, () => {
          void warnActiveDownloadsThenQuit();
        });
        tray.start();
      } catch (e) {
        log.warn(`Tray init failed — running without tray: ${String(e)}`);
        tray = null;
      }
    }

    app.on('before-quit', (event) => {
      tray?.destroy();
      tray = null;
      clipboardWatcher.dispose();
      if (downloadService.runningJobCount === 0) {
        tokenService.dispose();
        log.info('App shutting down');
        return;
      }
      event.preventDefault();
      void cancelQueueBeforeExit({
        queueService,
        tokenService,
        logInfo: (message, meta) => {
          if (meta) log.info(message, meta);
          else log.info(message);
        },
        exit: (code) => app.exit(code) // must use exit(), not quit() — quit() re-emits before-quit causing infinite loop
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
