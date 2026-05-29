import path from 'node:path';
import { app, dialog, shell, type BrowserWindow } from 'electron';
import log from 'electron-log/main.js';
import { IPC_CHANNELS } from '@shared/ipc.js';
import { ok } from '@shared/result.js';
import { DEPENDENCY_IDS, type DependencyId } from '@shared/types.js';
import type { BinaryManager } from '@main/services/BinaryManager.js';
import { handleRaw, toIpcFailure, toUnknownFailure } from './utils.js';

export function registerFileHandlers(mainWindow: BrowserWindow, binaryManager: BinaryManager): void {
  handleRaw(IPC_CHANNELS.chooseFolder, async (_, payload: unknown) => {
    try {
      // Open at the caller's current folder when provided, so "Change folder"
      // starts from where the files already are — not always ~/Downloads.
      const defaultPath = typeof payload === 'string' && payload.length > 0 ? payload : app.getPath('downloads');
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
        defaultPath
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
      const logPath = log.transports.file.getFile().path;
      if (process.platform === 'win32') {
        shell.showItemInFolder(logPath);
        return ok({ opened: true });
      }
      const logsDir = path.dirname(logPath);
      const response = await shell.openPath(logsDir);
      if (response) return toIpcFailure(response);
      return ok({ opened: true });
    } catch (error) {
      return toUnknownFailure(error);
    }
  });

  handleRaw(IPC_CHANNELS.dialogChooseExecutable, async (_, payload: unknown) => {
    try {
      if (!isDependencyId(payload)) return toIpcFailure('Invalid dependency id');
      const binary = payload;
      const filters =
        process.platform === 'win32'
          ? [
              { name: 'Executables', extensions: ['exe'] },
              { name: 'All files', extensions: ['*'] }
            ]
          : [{ name: 'All files', extensions: ['*'] }];
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters,
        title: `Select ${binary} executable`
      });
      return ok({ path: result.canceled ? null : (result.filePaths[0] ?? null) });
    } catch (error) {
      return toUnknownFailure(error);
    }
  });

  handleRaw(IPC_CHANNELS.shellOpenBinariesDir, async () => {
    try {
      const target = binaryManager.getRuntimeCacheDir();
      const response = await shell.openPath(target);
      if (response) return toIpcFailure(response);
      return ok({ opened: true });
    } catch (error) {
      return toUnknownFailure(error);
    }
  });
}

function isDependencyId(value: unknown): value is DependencyId {
  return typeof value === 'string' && (DEPENDENCY_IDS as readonly string[]).includes(value);
}
