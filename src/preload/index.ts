import { contextBridge, ipcRenderer } from 'electron';

declare const __APP_VERSION__: string;
import { IPC_CHANNELS } from '@shared/ipc';
import type { AppApi } from '@shared/api';
import type { ProgressEvent, QueueItem, StatusEvent, UpdateAvailablePayload } from '@shared/types';

const api: AppApi = {
  app: {
    warmUp: () => ipcRenderer.invoke(IPC_CHANNELS.appWarmUp),
    setLanguage: (language) => ipcRenderer.invoke(IPC_CHANNELS.appSetLanguage, language)
  },
  window: {
    minimize: () => ipcRenderer.invoke(IPC_CHANNELS.windowMinimize),
    maximize: () => ipcRenderer.invoke(IPC_CHANNELS.windowMaximize),
    close: () => ipcRenderer.invoke(IPC_CHANNELS.windowClose),
    isMaximized: () => ipcRenderer.invoke(IPC_CHANNELS.windowIsMaximized),
    onMaximizedChange: (listener) => {
      const wrapped = (_: Electron.IpcRendererEvent, isMax: boolean): void => listener(isMax);
      ipcRenderer.on(IPC_CHANNELS.windowMaximizedChange, wrapped);
      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.windowMaximizedChange, wrapped);
      };
    }
  },
  downloads: {
    getFormats: (input) => ipcRenderer.invoke(IPC_CHANNELS.downloadsGetFormats, input),
    start: (input) => ipcRenderer.invoke(IPC_CHANNELS.downloadsStart, input),
    cancel: (input = {}) => ipcRenderer.invoke(IPC_CHANNELS.downloadsCancel, input),
    pause: (input = {}) => ipcRenderer.invoke(IPC_CHANNELS.downloadsPause, input),
    resume: (input) => ipcRenderer.invoke(IPC_CHANNELS.downloadsResume, input)
  },
  settings: {
    get: () => ipcRenderer.invoke(IPC_CHANNELS.settingsGet),
    update: (input) => ipcRenderer.invoke(IPC_CHANNELS.settingsUpdate, input)
  },
  shell: {
    openFolder: (targetPath) => ipcRenderer.invoke(IPC_CHANNELS.shellOpenFolder, targetPath),
    openExternal: (url) => ipcRenderer.invoke(IPC_CHANNELS.shellOpenExternal, url)
  },
  logs: {
    openDir: () => ipcRenderer.invoke(IPC_CHANNELS.logsOpenDir)
  },
  dialog: {
    chooseFolder: () => ipcRenderer.invoke(IPC_CHANNELS.chooseFolder),
    chooseFile: () => ipcRenderer.invoke(IPC_CHANNELS.chooseFile)
  },
  events: {
    onStatus: (listener) => {
      const wrapped = (_: Electron.IpcRendererEvent, event: StatusEvent): void => listener(event);
      ipcRenderer.on(IPC_CHANNELS.eventsStatus, wrapped);
      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.eventsStatus, wrapped);
      };
    },
    onProgress: (listener) => {
      const wrapped = (_: Electron.IpcRendererEvent, event: ProgressEvent): void => listener(event);
      ipcRenderer.on(IPC_CHANNELS.eventsProgress, wrapped);
      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.eventsProgress, wrapped);
      };
    },
    onClipboardUrl: (listener) => {
      const wrapped = (_: Electron.IpcRendererEvent, url: string): void => listener(url);
      ipcRenderer.on(IPC_CHANNELS.eventsClipboardUrl, wrapped);
      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.eventsClipboardUrl, wrapped);
      };
    }
  },
  queue: {
    save: (items: QueueItem[]) => ipcRenderer.invoke(IPC_CHANNELS.queueSave, items),
    load: () => ipcRenderer.invoke(IPC_CHANNELS.queueLoad)
  },
  updater: {
    onUpdateAvailable: (listener) => {
      const wrapped = (_: Electron.IpcRendererEvent, payload: UpdateAvailablePayload): void => listener(payload);
      ipcRenderer.on(IPC_CHANNELS.updaterAvailable, wrapped);
      return () => ipcRenderer.removeListener(IPC_CHANNELS.updaterAvailable, wrapped);
    },
    install: () => ipcRenderer.invoke(IPC_CHANNELS.updaterInstall)
  },
  analytics: {
    track: (name, props) => ipcRenderer.send(IPC_CHANNELS.analyticsTrack, { name, props })
  }
};

contextBridge.exposeInMainWorld('appApi', api);
contextBridge.exposeInMainWorld('platform', process.platform);
contextBridge.exposeInMainWorld('appVersion', __APP_VERSION__);
