import { app, dialog, ipcMain, shell, type BrowserWindow } from 'electron';
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
import type { AppError } from '@shared/types';
import type { DownloadService } from '@main/services/DownloadService';
import type { FormatProbeService } from '@main/services/FormatProbeService';
import type { LogService } from '@main/services/LogService';
import type { SettingsStore } from '@main/stores/SettingsStore';

interface IpcDependencies {
  mainWindow: BrowserWindow;
  downloadService: DownloadService;
  formatProbeService: FormatProbeService;
  settingsStore: SettingsStore;
  logService: LogService;
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

export function registerIpcHandlers(deps: IpcDependencies): void {
  const { downloadService, formatProbeService, settingsStore, mainWindow, logService } = deps;

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

  ipcMain.handle(IPC_CHANNELS.downloadsGetFormats, async (_, payload: unknown) => {
    const parsed = getFormatsSchema.safeParse(payload);
    if (!parsed.success) {
      return fail(zodToError(parsed.error.issues[0]?.message ?? 'Invalid getFormats payload'));
    }
    return formatProbeService.getFormats(parsed.data.url);
  });

  ipcMain.handle(IPC_CHANNELS.downloadsStart, async (_, payload: unknown) => {
    const parsed = startDownloadSchema.safeParse(payload);
    if (!parsed.success) {
      return fail(zodToError(parsed.error.issues[0]?.message ?? 'Invalid start payload'));
    }

    try {
      const settings = await settingsStore.get();
      const outputDir = parsed.data.outputDir ?? settings.defaultOutputDir;
      return downloadService.start({ ...parsed.data, outputDir });
    } catch (error) {
      return toUnknownFailure(error);
    }
  });

  ipcMain.handle(IPC_CHANNELS.downloadsCancel, async (_, payload: unknown) => {
    const parsed = cancelDownloadSchema.safeParse(payload ?? {});
    if (!parsed.success) {
      return fail(zodToError(parsed.error.issues[0]?.message ?? 'Invalid cancel payload'));
    }
    return downloadService.cancel(parsed.data.jobId);
  });

  ipcMain.handle(IPC_CHANNELS.downloadsPause, async (_, payload: unknown) => {
    const parsed = pauseResumeSchema.safeParse(payload ?? {});
    if (!parsed.success) {
      return fail(zodToError(parsed.error.issues[0]?.message ?? 'Invalid pause payload'));
    }
    return downloadService.pause(parsed.data.jobId);
  });

  ipcMain.handle(IPC_CHANNELS.settingsGet, async () => {
    try {
      const settings = await settingsStore.get();
      return ok(settings);
    } catch (error) {
      return toUnknownFailure(error);
    }
  });

  ipcMain.handle(IPC_CHANNELS.settingsUpdate, async (_, payload: unknown) => {
    const parsed = updateSettingsSchema.safeParse(payload);
    if (!parsed.success) {
      return fail(zodToError(parsed.error.issues[0]?.message ?? 'Invalid settings payload'));
    }

    try {
      const updated = await settingsStore.update(parsed.data);
      return ok(updated);
    } catch (error) {
      return toUnknownFailure(error);
    }
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

  downloadService.on('status', (event) => {
    if (mainWindow.isDestroyed()) return;
    mainWindow.webContents.send(IPC_CHANNELS.eventsStatus, event);
  });

  downloadService.on('progress', (event) => {
    if (mainWindow.isDestroyed()) return;
    mainWindow.webContents.send(IPC_CHANNELS.eventsProgress, event);
  });
}
