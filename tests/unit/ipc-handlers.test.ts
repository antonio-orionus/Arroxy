import { describe, expect, it, vi, beforeEach } from 'vitest';
import { EventEmitter } from 'node:events';

// Capture every ipcMain.handle / removeHandler call so tests can introspect.
const handleCalls: { channel: string; fn: (e: unknown, payload: unknown) => unknown }[] = [];
const removeHandlerCalls: string[] = [];

vi.mock('electron', () => ({
  app: {
    getName: vi.fn().mockReturnValue('arroxy'),
    getVersion: vi.fn().mockReturnValue('1.0.0'),
    getPath: vi.fn().mockReturnValue('/tmp')
  },
  dialog: { showOpenDialog: vi.fn() },
  shell: { openPath: vi.fn(), openExternal: vi.fn() },
  ipcMain: {
    handle: vi.fn().mockImplementation((channel: string, fn: (e: unknown, payload: unknown) => unknown) => {
      handleCalls.push({ channel, fn });
    }),
    removeHandler: vi.fn().mockImplementation((channel: string) => {
      removeHandlerCalls.push(channel);
    })
  }
}));

import { registerIpcHandlers } from '@main/ipc/registerIpcHandlers';
import { IPC_CHANNELS } from '@shared/ipc';

class FakeDownloadService extends EventEmitter {
  start = vi.fn();
  cancel = vi.fn();
  pause = vi.fn();
  resume = vi.fn();
}

function makeDeps() {
  const downloadService = new FakeDownloadService();
  const mainWindow = {
    isDestroyed: vi.fn().mockReturnValue(false),
    webContents: { send: vi.fn() },
    minimize: vi.fn(),
    maximize: vi.fn(),
    unmaximize: vi.fn(),
    close: vi.fn(),
    isMaximized: vi.fn().mockReturnValue(false)
  };
  const queueStore = { save: vi.fn().mockResolvedValue(undefined), load: vi.fn().mockResolvedValue({ ok: true, data: [] }) };
  const logService = { log: vi.fn(), getLogsDir: vi.fn().mockReturnValue('/tmp/logs') };
  const settingsStore = { get: vi.fn().mockResolvedValue({ defaultOutputDir: '/tmp', rememberLastOutputDir: true, clipboardWatchEnabled: false }), update: vi.fn() };
  const languageRef: { current: string } = { current: 'en' };
  const clipboardWatcher = { setEnabled: vi.fn(), dispose: vi.fn() };
  return {
    mainWindow: mainWindow as never,
    downloadService: downloadService as never,
    formatProbeService: { probe: vi.fn() } as never,
    settingsStore: settingsStore as never,
    queueStore: queueStore as never,
    logService: logService as never,
    binaryManager: { ensureYtDlp: vi.fn(), ensureFFmpeg: vi.fn(), ensureDeno: vi.fn() } as never,
    tokenService: { warmUp: vi.fn() } as never,
    languageRef: languageRef as never,
    clipboardWatcher: clipboardWatcher as never,
    _raw: { downloadService, mainWindow, queueStore, logService, languageRef, clipboardWatcher }
  };
}

function findCall(channel: string) {
  for (let i = handleCalls.length - 1; i >= 0; i--) {
    if (handleCalls[i].channel === channel) return handleCalls[i];
  }
  return undefined;
}

describe('registerIpcHandlers', () => {
  beforeEach(() => {
    handleCalls.length = 0;
    removeHandlerCalls.length = 0;
    vi.clearAllMocks();
  });

  describe('re-registration safety', () => {
    it('removes prior handler before re-binding so re-registering does not stack', () => {
      const deps = makeDeps();
      registerIpcHandlers(deps);
      registerIpcHandlers(deps);

      // Every channel that registerIpcHandlers binds should have removeHandler
      // called at least twice (once per registration).
      const startRemovals = removeHandlerCalls.filter((c) => c === IPC_CHANNELS.downloadsStart).length;
      expect(startRemovals).toBeGreaterThanOrEqual(2);
    });

    it('does not stack DownloadService listeners across re-registration', () => {
      const deps = makeDeps();
      const ds = deps._raw.downloadService;

      registerIpcHandlers(deps);
      expect(ds.listenerCount('status')).toBe(1);
      expect(ds.listenerCount('progress')).toBe(1);

      registerIpcHandlers(deps);
      // Second register must drop prior bridge before adding the new one.
      expect(ds.listenerCount('status')).toBe(1);
      expect(ds.listenerCount('progress')).toBe(1);
    });
  });

  describe('progress throttle', () => {
    it('drops progress events that arrive within 100ms of the prior event for the same job', () => {
      const deps = makeDeps();
      registerIpcHandlers(deps);
      const send = deps._raw.mainWindow.webContents.send as ReturnType<typeof vi.fn>;
      const ds = deps._raw.downloadService;

      let now = 1_000_000;
      vi.spyOn(Date, 'now').mockImplementation(() => now);

      ds.emit('progress', { jobId: 'j1', percent: 10, line: '' });
      now += 50;
      ds.emit('progress', { jobId: 'j1', percent: 20, line: '' });
      now += 60; // total 110 ms past first
      ds.emit('progress', { jobId: 'j1', percent: 30, line: '' });

      const progressSends = send.mock.calls.filter((c) => c[0] === IPC_CHANNELS.eventsProgress);
      expect(progressSends).toHaveLength(2);
      vi.restoreAllMocks();
    });

    it('keeps separate throttle windows per jobId', () => {
      const deps = makeDeps();
      registerIpcHandlers(deps);
      const send = deps._raw.mainWindow.webContents.send as ReturnType<typeof vi.fn>;
      const ds = deps._raw.downloadService;

      vi.spyOn(Date, 'now').mockReturnValue(1_000_000);

      ds.emit('progress', { jobId: 'a', percent: 10, line: '' });
      ds.emit('progress', { jobId: 'b', percent: 10, line: '' });

      const progressSends = send.mock.calls.filter((c) => c[0] === IPC_CHANNELS.eventsProgress);
      expect(progressSends).toHaveLength(2);
      vi.restoreAllMocks();
    });

    it('clears the throttle entry on done so a same-jobId restart is not throttled', () => {
      const deps = makeDeps();
      registerIpcHandlers(deps);
      const send = deps._raw.mainWindow.webContents.send as ReturnType<typeof vi.fn>;
      const ds = deps._raw.downloadService;

      let now = 1_000_000;
      vi.spyOn(Date, 'now').mockImplementation(() => now);

      ds.emit('progress', { jobId: 'reused', percent: 50, line: '' });
      ds.emit('status', { jobId: 'reused', stage: 'done', statusKey: 'complete', at: '' });

      // 10ms later, a new progress for the same jobId should not be throttled
      // because the cleanup deleted the entry.
      now += 10;
      ds.emit('progress', { jobId: 'reused', percent: 5, line: '' });

      const progressSends = send.mock.calls.filter((c) => c[0] === IPC_CHANNELS.eventsProgress);
      expect(progressSends).toHaveLength(2);
      vi.restoreAllMocks();
    });

    it('clears the throttle entry on error stage as well', () => {
      const deps = makeDeps();
      registerIpcHandlers(deps);
      const ds = deps._raw.downloadService;

      vi.spyOn(Date, 'now').mockReturnValue(1_000_000);
      ds.emit('progress', { jobId: 'erred', percent: 50, line: '' });
      ds.emit('status', { jobId: 'erred', stage: 'error', statusKey: 'ytdlpExitCode', at: '' });

      // Inspect the internal map via re-emit: another progress same tick
      // should now pass.
      ds.emit('progress', { jobId: 'erred', percent: 60, line: '' });
      const send = deps._raw.mainWindow.webContents.send as ReturnType<typeof vi.fn>;
      const progressSends = send.mock.calls.filter((c) => c[0] === IPC_CHANNELS.eventsProgress);
      expect(progressSends).toHaveLength(2);
      vi.restoreAllMocks();
    });
  });

  describe('payload validation', () => {
    it('app:setLanguage rejects invalid language codes silently and does not mutate languageRef', async () => {
      const deps = makeDeps();
      registerIpcHandlers(deps);

      const handler = findCall(IPC_CHANNELS.appSetLanguage)!.fn;
      await handler(null, 'klingon');

      expect(deps._raw.languageRef.current).toBe('en');
      expect(deps._raw.logService.log).toHaveBeenCalledWith(
        'WARN',
        'app:setLanguage rejected — invalid language',
        expect.any(Object)
      );
    });

    it('app:setLanguage accepts a valid SupportedLang', async () => {
      const deps = makeDeps();
      registerIpcHandlers(deps);

      const handler = findCall(IPC_CHANNELS.appSetLanguage)!.fn;
      await handler(null, 'fr');

      expect(deps._raw.languageRef.current).toBe('fr');
    });

    it('queue:save rejects non-array payloads with a Result failure', async () => {
      const deps = makeDeps();
      registerIpcHandlers(deps);

      const handler = findCall(IPC_CHANNELS.queueSave)!.fn;
      const result = await handler(null, 'not an array') as { ok: boolean; error?: { code: string } };
      expect(result.ok).toBe(false);
      expect(deps._raw.queueStore.save).not.toHaveBeenCalled();
    });

    it('queue:save accepts a valid queue array and writes it', async () => {
      const deps = makeDeps();
      registerIpcHandlers(deps);

      const handler = findCall(IPC_CHANNELS.queueSave)!.fn;
      const validItem = {
        id: 'a', url: 'u', title: 't', thumbnail: '',
        outputDir: '/tmp', formatLabel: 'Best', status: 'done',
        progressPercent: 100, progressDetail: null, lastStatus: null,
        error: null, finishedAt: null, downloadJobId: null,
        subtitleLanguages: [], writeAutoSubs: false,
        subtitleMode: 'sidecar', subtitleFormat: 'srt',
        sponsorBlockMode: 'off', sponsorBlockCategories: [],
        embedChapters: true, embedMetadata: true, embedThumbnail: true,
        writeDescription: false, writeThumbnail: false
      };
      const result = await handler(null, [validItem]) as { ok: boolean };
      expect(result.ok).toBe(true);
      expect(deps._raw.queueStore.save).toHaveBeenCalledOnce();
    });
  });
});
