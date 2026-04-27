import { app, dialog, ipcMain, shell, type BrowserWindow } from 'electron';
import type { ZodType } from 'zod';
import { createAppError, unknownToMessage } from '@main/utils/errorFactory';
import { fail, ok, type Result } from '@shared/result';
import { IPC_CHANNELS } from '@shared/ipc';
import {
  cancelDownloadSchema,
  getFormatsSchema,
  pauseResumeSchema,
  startDownloadSchema,
  updateSettingsSchema
} from '@shared/schemas';
import type { AppError, WarmUpOutput } from '@shared/types';
import type { SupportedLang } from '@shared/i18n/types';
import { SUPPORTED_LANGS } from '@shared/i18n';
import type { DownloadService } from '@main/services/DownloadService';
import type { FormatProbeService } from '@main/services/FormatProbeService';
import type { LogService } from '@main/services/LogService';
import type { BinaryManager } from '@main/services/BinaryManager';
import type { TokenService } from '@main/services/TokenService';
import type { SettingsStore } from '@main/stores/SettingsStore';
import type { QueueStore } from '@main/stores/QueueStore';
import type { QueueItem } from '@shared/types';

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

  ipcMain.handle(IPC_CHANNELS.appWarmUp, () => {
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

  ipcMain.handle(IPC_CHANNELS.appSetLanguage, (_, payload: unknown) => {
    if (typeof payload === 'string' && (SUPPORTED_LANGS as readonly string[]).includes(payload)) {
      languageRef.current = payload as SupportedLang;
    }
  });

  ipcMain.handle(IPC_CHANNELS.windowMinimize, () => { mainWindow.minimize(); });
  ipcMain.handle(IPC_CHANNELS.windowMaximize, () => {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  });
  ipcMain.handle(IPC_CHANNELS.windowClose, () => { mainWindow.close(); });
  ipcMain.handle(IPC_CHANNELS.windowIsMaximized, () => mainWindow.isMaximized());

  ipcMain.handle(IPC_CHANNELS.chooseFolder, async () => {
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

  ipcMain.handle(IPC_CHANNELS.settingsGet, async () => {
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

  ipcMain.handle(IPC_CHANNELS.shellOpenFolder, async (_, payload: unknown) => {
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

  ipcMain.handle(IPC_CHANNELS.shellOpenExternal, async (_, payload: unknown) => {
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

  ipcMain.handle(IPC_CHANNELS.logsOpenDir, async () => {
    try {
      const response = await shell.openPath(logService.getLogsDir());
      if (response) return toIpcFailure(response);
      return ok({ opened: true });
    } catch (error) {
      return toUnknownFailure(error);
    }
  });

  ipcMain.handle(IPC_CHANNELS.queueLoad, async () => {
    return queueStore.load();
  });

  ipcMain.handle(IPC_CHANNELS.queueSave, async (_, payload: unknown) => {
    if (!Array.isArray(payload)) return;
    await queueStore.save(payload as QueueItem[]);
  });

  downloadService.on('status', (event) => {
    if (mainWindow.isDestroyed()) return;
    mainWindow.webContents.send(IPC_CHANNELS.eventsStatus, event);
  });

  downloadService.on('progress', (event) => {
    if (mainWindow.isDestroyed()) return;
    mainWindow.webContents.send(IPC_CHANNELS.eventsProgress, event);
  });
}
