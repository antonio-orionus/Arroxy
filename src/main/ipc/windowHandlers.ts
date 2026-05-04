import type { BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '@shared/ipc';
import { handleRaw } from './utils';

export function registerWindowHandlers(mainWindow: BrowserWindow): void {
  handleRaw(IPC_CHANNELS.windowMinimize, () => {
    mainWindow.minimize();
  });
  handleRaw(IPC_CHANNELS.windowMaximize, () => {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  });
  handleRaw(IPC_CHANNELS.windowClose, () => {
    mainWindow.close();
  });
  handleRaw(IPC_CHANNELS.windowIsMaximized, () => mainWindow.isMaximized());
}
