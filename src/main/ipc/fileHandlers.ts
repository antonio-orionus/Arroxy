import { app, dialog, shell, type BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '@shared/ipc';
import { ok } from '@shared/result';
import type { LogService } from '@main/services/LogService';
import { handleRaw, toIpcFailure, toUnknownFailure } from './utils';

interface FileHandlerDeps {
  mainWindow: BrowserWindow;
  logService: LogService;
}

export function registerFileHandlers(deps: FileHandlerDeps): void {
  const { mainWindow, logService } = deps;

  handleRaw(IPC_CHANNELS.chooseFolder, async () => {
    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
        defaultPath: app.getPath('downloads')
      });
      return ok({ path: result.canceled ? null : (result.filePaths[0] ?? null) });
    } catch (error) {
      return toUnknownFailure(error);
    }
  });

  handleRaw(IPC_CHANNELS.chooseFile, async () => {
    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
          { name: 'Cookies file', extensions: ['txt'] },
          { name: 'All files', extensions: ['*'] }
        ]
      });
      return ok({ path: result.canceled ? null : (result.filePaths[0] ?? null) });
    } catch (error) {
      return toUnknownFailure(error);
    }
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
}
