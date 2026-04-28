import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

// Must mock electron and electron-updater before importing the module under test
vi.mock('electron', () => ({
  app: {
    getVersion: vi.fn().mockReturnValue('1.0.0'),
    getName: vi.fn().mockReturnValue('arroxy')
  },
  ipcMain: { handle: vi.fn(), removeHandler: vi.fn() }
}));

vi.mock('electron-updater', () => ({
  autoUpdater: {
    autoDownload: true,
    autoInstallOnAppQuit: true,
    on: vi.fn(),
    removeAllListeners: vi.fn(),
    checkForUpdates: vi.fn().mockResolvedValue(undefined),
    downloadUpdate: vi.fn().mockResolvedValue(undefined),
    quitAndInstall: vi.fn()
  }
}));

vi.mock('@main/installChannel', () => ({ detectInstallChannel: vi.fn().mockReturnValue('direct') }));

import { app, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import { registerUpdaterHandlers } from '@main/ipc/registerUpdaterHandlers';
import { IPC_CHANNELS } from '@shared/ipc';

type EventName = 'update-available' | 'update-downloaded' | 'error';
type HandlerMap = Partial<Record<EventName, (...args: unknown[]) => void>>;

function makeWindow(isDestroyed = false) {
  return {
    isDestroyed: vi.fn().mockReturnValue(isDestroyed),
    webContents: { send: vi.fn() }
  } as unknown as Electron.BrowserWindow;
}

function captureUpdaterHandlers(): HandlerMap {
  const handlers: HandlerMap = {};
  vi.mocked(autoUpdater.on).mockImplementation((event: string, fn: any) => {
    handlers[event as EventName] = fn;
    return autoUpdater;
  });
  return handlers;
}

describe('registerUpdaterHandlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('disables autoDownload and autoInstallOnAppQuit', () => {
    captureUpdaterHandlers();
    registerUpdaterHandlers(makeWindow());
    expect(autoUpdater.autoDownload).toBe(false);
    expect(autoUpdater.autoInstallOnAppQuit).toBe(false);
  });

  it('registers handlers for update-available, update-downloaded, and error', () => {
    registerUpdaterHandlers(makeWindow());
    const registeredEvents = vi.mocked(autoUpdater.on).mock.calls.map((c) => c[0]);
    expect(registeredEvents).toContain('update-available');
    expect(registeredEvents).toContain('update-downloaded');
    expect(registeredEvents).toContain('error');
  });

  it('sends updater:available IPC with correct payload on update-available', () => {
    const handlers = captureUpdaterHandlers();
    const win = makeWindow();
    registerUpdaterHandlers(win);

    handlers['update-available']!({ version: '2.0.0' });

    expect(win.webContents.send).toHaveBeenCalledWith(
      IPC_CHANNELS.updaterAvailable,
      expect.objectContaining({
        version: '2.0.0',
        currentVersion: '1.0.0',
        installChannel: expect.any(String)
      })
    );
  });

  it('forwards installChannel from runtime detection', async () => {
    vi.resetModules();
    vi.doMock('@main/installChannel', () => ({ detectInstallChannel: vi.fn().mockReturnValue('scoop') }));
    vi.doMock('electron', () => ({
      app: { getVersion: vi.fn().mockReturnValue('1.0.0'), getName: vi.fn().mockReturnValue('arroxy') },
      ipcMain: { handle: vi.fn(), removeHandler: vi.fn() }
    }));
    vi.doMock('electron-updater', () => ({
      autoUpdater: {
        autoDownload: true,
        autoInstallOnAppQuit: true,
        on: vi.fn(),
        removeAllListeners: vi.fn(),
        checkForUpdates: vi.fn().mockResolvedValue(undefined),
        downloadUpdate: vi.fn().mockResolvedValue(undefined),
        quitAndInstall: vi.fn()
      }
    }));
    const { registerUpdaterHandlers: registerWithScoop } = await import('@main/ipc/registerUpdaterHandlers');
    const { autoUpdater: scopedAutoUpdater } = await import('electron-updater');

    const handlers: HandlerMap = {};
    vi.mocked(scopedAutoUpdater.on).mockImplementation((event: string, fn: any) => {
      handlers[event as EventName] = fn;
      return scopedAutoUpdater;
    });
    const win = makeWindow();
    registerWithScoop(win);
    handlers['update-available']!({ version: '2.0.0' });

    expect(win.webContents.send).toHaveBeenCalledWith(
      IPC_CHANNELS.updaterAvailable,
      expect.objectContaining({ installChannel: 'scoop' })
    );

    vi.doUnmock('@main/installChannel');
    vi.doUnmock('electron');
    vi.doUnmock('electron-updater');
    vi.resetModules();
  });

  it('skips autoUpdater entirely when running under Flatpak', async () => {
    vi.resetModules();
    vi.doMock('@main/installChannel', () => ({ detectInstallChannel: vi.fn().mockReturnValue('flatpak') }));
    vi.doMock('electron', () => ({
      app: { getVersion: vi.fn().mockReturnValue('1.0.0'), getName: vi.fn().mockReturnValue('arroxy') },
      ipcMain: { handle: vi.fn(), removeHandler: vi.fn() }
    }));
    vi.doMock('electron-updater', () => ({
      autoUpdater: {
        autoDownload: true,
        autoInstallOnAppQuit: true,
        on: vi.fn(),
        removeAllListeners: vi.fn(),
        checkForUpdates: vi.fn().mockResolvedValue(undefined),
        downloadUpdate: vi.fn().mockResolvedValue(undefined),
        quitAndInstall: vi.fn()
      }
    }));
    const { registerUpdaterHandlers: registerWithFlatpak } = await import('@main/ipc/registerUpdaterHandlers');
    const { autoUpdater: scopedAutoUpdater } = await import('electron-updater');

    registerWithFlatpak(makeWindow());
    vi.runAllTimers();

    expect(scopedAutoUpdater.on).not.toHaveBeenCalled();
    expect(scopedAutoUpdater.checkForUpdates).not.toHaveBeenCalled();
    expect(scopedAutoUpdater.removeAllListeners).not.toHaveBeenCalled();

    vi.doUnmock('@main/installChannel');
    vi.doUnmock('electron');
    vi.doUnmock('electron-updater');
    vi.resetModules();
  });

  it('does not send IPC if window is destroyed', () => {
    const handlers = captureUpdaterHandlers();
    const win = makeWindow(true);
    registerUpdaterHandlers(win);

    handlers['update-available']!({ version: '2.0.0' });

    expect(win.webContents.send).not.toHaveBeenCalled();
  });

  it('calls quitAndInstall when update-downloaded fires', () => {
    const handlers = captureUpdaterHandlers();
    registerUpdaterHandlers(makeWindow());

    handlers['update-downloaded']!();

    expect(autoUpdater.quitAndInstall).toHaveBeenCalledWith(false, true);
  });

  it('logs errors silently when error fires', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const handlers = captureUpdaterHandlers();
    registerUpdaterHandlers(makeWindow());

    const err = new Error('network failure');
    handlers['error']!(err);

    expect(consoleSpy).toHaveBeenCalledWith('[updater]', 'network failure');
    consoleSpy.mockRestore();
  });

  it('registers updater:install IPC handler', () => {
    const ipcHandlerNames: string[] = [];
    vi.mocked(ipcMain.handle).mockImplementation((name: string, _fn: any) => {
      ipcHandlerNames.push(name);
    });
    registerUpdaterHandlers(makeWindow());
    expect(ipcHandlerNames).toContain(IPC_CHANNELS.updaterInstall);
  });

  it('updater:install handler calls downloadUpdate()', async () => {
    let installHandler: (() => Promise<void>) | null = null;
    vi.mocked(ipcMain.handle).mockImplementation((name: string, fn: any) => {
      if (name === IPC_CHANNELS.updaterInstall) installHandler = fn;
    });
    registerUpdaterHandlers(makeWindow());

    expect(installHandler).not.toBeNull();
    await installHandler!();
    expect(autoUpdater.downloadUpdate).toHaveBeenCalledOnce();
  });

  it('calls checkForUpdates after 5 second delay', () => {
    captureUpdaterHandlers();
    registerUpdaterHandlers(makeWindow());

    expect(autoUpdater.checkForUpdates).not.toHaveBeenCalled();
    vi.advanceTimersByTime(5_001);
    expect(autoUpdater.checkForUpdates).toHaveBeenCalledOnce();
  });

  it('does not call checkForUpdates before 5 seconds', () => {
    captureUpdaterHandlers();
    registerUpdaterHandlers(makeWindow());

    vi.advanceTimersByTime(4_999);
    expect(autoUpdater.checkForUpdates).not.toHaveBeenCalled();
  });

  it('includes currentVersion from app.getVersion()', () => {
    vi.mocked(app.getVersion).mockReturnValue('0.5.3');
    const handlers = captureUpdaterHandlers();
    const win = makeWindow();
    registerUpdaterHandlers(win);

    handlers['update-available']!({ version: '1.0.0' });

    expect(win.webContents.send).toHaveBeenCalledWith(
      IPC_CHANNELS.updaterAvailable,
      expect.objectContaining({ currentVersion: '0.5.3' })
    );
  });
});
