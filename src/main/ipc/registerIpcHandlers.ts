import { app, dialog, ipcMain, shell, type BrowserWindow } from 'electron';
import type { ZodType } from 'zod';
import { createAppError, unknownToMessage } from '@main/utils/errorFactory';
import { fail, ok, type Result } from '@shared/result';
import { IPC_CHANNELS } from '@shared/ipc';
import {
  cancelDownloadSchema,
  getFormatsSchema,
  pauseResumeSchema,
  queueArraySchema,
  resumeSchema,
  startDownloadSchema,
  supportedLangSchema,
  updateSettingsSchema
} from '@shared/schemas';
import type { AppError, WarmUpOutput } from '@shared/types';
import type { SupportedLang } from '@shared/i18n/types';
import type { DownloadService } from '@main/services/DownloadService';
import type { FormatProbeService } from '@main/services/FormatProbeService';
import type { LogService } from '@main/services/LogService';
import type { BinaryManager } from '@main/services/BinaryManager';
import type { TokenService } from '@main/services/TokenService';
import type { SettingsStore } from '@main/stores/SettingsStore';
import type { QueueStore } from '@main/stores/QueueStore';

interface IpcDependencies {
  mainWindow: BrowserWindow;
  downloadService: DownloadService;
  formatProbeService: FormatProbeService;
  settingsStore: SettingsStore;
  queueStore: QueueStore;
  logService: LogService;
  binaryManager: BinaryManager;
  tokenService: TokenService;
  languageRef: { current: SupportedLang };
}

function zodToError(errorMessage: string): AppError {
  return createAppError('validation', errorMessage);
}

function toIpcFailure(message: string): Result<never> {
  return fail(createAppError('ipc', message));
}

function toUnknownFailure(error: unknown): Result<never> {
  return fail(createAppError('unknown', unknownToMessage(error)));
}

function handle<T, R>(
  channel: string,
  schema: ZodType<T>,
  fn: (data: T) => Promise<Result<R>>
): void {
  ipcMain.removeHandler(channel);
  ipcMain.handle(channel, async (_, payload: unknown) => {
    const parsed = schema.safeParse(payload ?? {});
    if (!parsed.success) {
      return fail(zodToError(parsed.error.issues[0]?.message ?? `Invalid ${channel} payload`));
    }
    try {
      return await fn(parsed.data);
    } catch (error) {
      return toUnknownFailure(error);
    }
  });
}

function handleRaw(channel: string, listener: Parameters<typeof ipcMain.handle>[1]): void {
  ipcMain.removeHandler(channel);
  ipcMain.handle(channel, listener);
}

export function registerIpcHandlers(deps: IpcDependencies): void {
  const {
    binaryManager,
    downloadService,
    formatProbeService,
    settingsStore,
    queueStore,
    mainWindow,
    logService,
    tokenService,
    languageRef
  } = deps;
  let warmUpPromise: Promise<Result<WarmUpOutput>> | null = null;

  handleRaw(IPC_CHANNELS.appWarmUp, () => {
    warmUpPromise ??= Promise.allSettled([
      binaryManager.ensureYtDlp(),
      binaryManager.ensureFFmpeg(),
      tokenService.warmUp()
    ]).then((results) => {
      const failures = results.flatMap((result) => {
        if (result.status === 'fulfilled') return [];
        return result.reason instanceof Error ? [result.reason.message] : [String(result.reason)];
      });

      if (failures.length > 0) {
        logService.log('WARN', 'Warmup completed with failures', { failures });
      } else {
        logService.log('INFO', 'Warmup completed');
      }

      return ok({ completed: true, failures });
    });

    return warmUpPromise;
  });

  handleRaw(IPC_CHANNELS.appSetLanguage, (_, payload: unknown) => {
    const parsed = supportedLangSchema.safeParse(payload);
    if (parsed.success) {
      languageRef.current = parsed.data;
    } else {
      logService.log('WARN', 'app:setLanguage rejected — invalid language', { payload });
    }
  });

  handleRaw(IPC_CHANNELS.windowMinimize, () => { mainWindow.minimize(); });
  handleRaw(IPC_CHANNELS.windowMaximize, () => {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  });
  handleRaw(IPC_CHANNELS.windowClose, () => { mainWindow.close(); });
  handleRaw(IPC_CHANNELS.windowIsMaximized, () => mainWindow.isMaximized());

  handleRaw(IPC_CHANNELS.chooseFolder, async () => {
    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
        defaultPath: app.getPath('downloads')
      });
      return ok({ path: result.canceled ? null : result.filePaths[0] ?? null });
    } catch (error) {
      return toUnknownFailure(error);
    }
  });

  handle(IPC_CHANNELS.downloadsGetFormats, getFormatsSchema, ({ url }) =>
    formatProbeService.getFormats(url)
  );

  handle(IPC_CHANNELS.downloadsStart, startDownloadSchema, async (data) => {
    const settings = await settingsStore.get();
    const outputDir = data.outputDir ?? settings.defaultOutputDir;
    return downloadService.start({ ...data, outputDir });
  });

  handle(IPC_CHANNELS.downloadsCancel, cancelDownloadSchema, ({ jobId }) => {
    logService.log('INFO', '[cancel IPC] received', { jobId: jobId ?? '(undefined)' });
    return downloadService.cancel(jobId);
  });

  handle(IPC_CHANNELS.downloadsPause, pauseResumeSchema, ({ jobId }) => downloadService.pause(jobId));

  handle(IPC_CHANNELS.downloadsResume, resumeSchema, ({ jobId }) => downloadService.resume(jobId));

  handleRaw(IPC_CHANNELS.settingsGet, async () => {
    try {
      const settings = await settingsStore.get();
      return ok({
        ...settings,
        commonPaths: {
          downloads: app.getPath('downloads'),
          videos: app.getPath('videos'),
          desktop: app.getPath('desktop'),
        }
      });
    } catch (error) {
      return toUnknownFailure(error);
    }
  });

  handle(IPC_CHANNELS.settingsUpdate, updateSettingsSchema, async (data) => {
    const updated = await settingsStore.update(data);
    return ok(updated);
  });

  handleRaw(IPC_CHANNELS.shellOpenFolder, async (_, payload: unknown) => {
    try {
      const requestedPath = typeof payload === 'string' && payload.length > 0 ? payload : null;
      const target = requestedPath ?? app.getPath('downloads');
      const response = await shell.openPath(target);
      if (response) return toIpcFailure(response);
      return ok({ opened: true });
    } catch (error) {
      return toUnknownFailure(error);
    }
  });

  handleRaw(IPC_CHANNELS.shellOpenExternal, async (_, payload: unknown) => {
    try {
      if (typeof payload !== 'string' || !payload.startsWith('http')) {
        return toIpcFailure('Invalid URL for openExternal');
      }
      await shell.openExternal(payload);
      return ok({ opened: true });
    } catch (error) {
      return toUnknownFailure(error);
    }
  });

  handleRaw(IPC_CHANNELS.logsOpenDir, async () => {
    try {
      const response = await shell.openPath(logService.getLogsDir());
      if (response) return toIpcFailure(response);
      return ok({ opened: true });
    } catch (error) {
      return toUnknownFailure(error);
    }
  });

  handleRaw(IPC_CHANNELS.queueLoad, async () => {
    try {
      const result = await queueStore.load();
      if (!result.ok) {
        logService.log('ERROR', 'queue:load failed', { error: result.error.message });
      }
      return result;
    } catch (error) {
      return toUnknownFailure(error);
    }
  });

  handle(IPC_CHANNELS.queueSave, queueArraySchema, async (items) => {
    try {
      await queueStore.save(items);
      return ok({ saved: true });
    } catch (error) {
      logService.log('ERROR', 'queue:save failed', { error: unknownToMessage(error) });
      return toUnknownFailure(error);
    }
  });

  // Remove any prior bridges before re-binding so re-running `registerIpcHandlers`
  // (e.g. on window recreate) does not stack duplicate webContents.send calls.
  downloadService.removeAllListeners('status');
  downloadService.removeAllListeners('progress');

  // Coalesce progress events to ≤10 Hz per job. yt-dlp emits multiple lines
  // per second and the renderer rebuilds the whole queue array per event.
  // 'done' status arrives via the status channel and sets percent=100 there,
  // so dropping a sub-100ms tail here is harmless.
  const lastProgressAt = new Map<string, number>();
  const PROGRESS_THROTTLE_MS = 100;

  downloadService.on('status', (event) => {
    if (event.stage === 'done' || event.stage === 'error') {
      lastProgressAt.delete(event.jobId);
    }
    if (mainWindow.isDestroyed()) return;
    mainWindow.webContents.send(IPC_CHANNELS.eventsStatus, event);
  });

  downloadService.on('progress', (event) => {
    if (mainWindow.isDestroyed()) return;
    const now = Date.now();
    const last = lastProgressAt.get(event.jobId) ?? 0;
    if (now - last < PROGRESS_THROTTLE_MS) return;
    lastProgressAt.set(event.jobId, now);
    mainWindow.webContents.send(IPC_CHANNELS.eventsProgress, event);
  });
}
