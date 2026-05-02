// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppStore } from '@renderer/store/useAppStore';
import type { QueueItem, StatusEvent } from '@shared/types';
import { makeItem, makeJob, ok } from '../shared/fixtures';

describe('Queue persistence — store behavior', () => {
  let saveMock: ReturnType<typeof vi.fn>;
  let loadMock: ReturnType<typeof vi.fn>;
  let startMock: ReturnType<typeof vi.fn>;
  let capturedOnStatus: ((event: StatusEvent) => void) | null = null;

  function buildMockApi(savedQueue: QueueItem[] = []) {
    saveMock = vi.fn().mockResolvedValue(ok({ saved: true }));
    loadMock = vi.fn().mockResolvedValue(ok(savedQueue));
    startMock = vi.fn().mockResolvedValue(ok({ job: makeJob('job-restored') }));

    return {
      app: {
        warmUp: vi.fn().mockResolvedValue(ok({ completed: true, failures: [] })),
        setLanguage: vi.fn().mockResolvedValue(undefined)
      },
      downloads: {
        start: startMock,
        cancel: vi.fn().mockResolvedValue(ok({ cancelled: true })),
        getFormats: vi.fn(),
        pause: vi.fn().mockResolvedValue(ok({ paused: true })),
        resume: vi.fn().mockResolvedValue(ok({ resumed: false })),
      },
      settings: {
        get: vi.fn().mockResolvedValue(ok({ defaultOutputDir: '/tmp', rememberLastOutputDir: false })),
        update: vi.fn().mockResolvedValue(ok({})),
      },
      shell: { openFolder: vi.fn(), openExternal: vi.fn() },
      logs: { openDir: vi.fn() },
      dialog: { chooseFolder: vi.fn() },
      events: {
        onStatus: vi.fn().mockImplementation((cb: (event: StatusEvent) => void) => {
          capturedOnStatus = cb;
          return () => undefined;
        }),
        onProgress: vi.fn().mockReturnValue(() => undefined),
        onClipboardUrl: vi.fn().mockReturnValue(() => undefined),
      },
      queue: { save: saveMock, load: loadMock },
    };
  }

  beforeEach(() => {
    capturedOnStatus = null;
    useAppStore.setState({
      initialized: false,
      initializing: false,
      settings: null,
      wizardStep: 'url',
      formatsLoading: false,
      wizardUrl: '',
      wizardTitle: '',
      wizardThumbnail: '',
      wizardFormats: [],
      selectedVideoFormatId: '',
      selectedAudioFormatId: null,
      activePreset: null,
      wizardOutputDir: '',
      wizardError: null,
      wizardErrorOrigin: null,
      queue: [],
      drawerOpen: false,
    });
    vi.clearAllMocks();
  });

  describe('initialize()', () => {
    it('loads persisted queue from IPC on startup', async () => {
      const saved = [makeItem({ id: 'v1', status: 'done', progressPercent: 100 })];
      window.appApi = buildMockApi(saved) as never;

      await useAppStore.getState().initialize();

      const queue = useAppStore.getState().queue;
      expect(queue).toHaveLength(1);
      expect(queue[0].id).toBe('v1');
      expect(queue[0].status).toBe('done');
    });

    it('opens the drawer when restored queue is non-empty', async () => {
      window.appApi = buildMockApi([makeItem({ id: 'x', status: 'pending' })]) as never;

      await useAppStore.getState().initialize();

      expect(useAppStore.getState().drawerOpen).toBe(true);
    });

    it('leaves drawer closed when restored queue is empty', async () => {
      window.appApi = buildMockApi([]) as never;

      await useAppStore.getState().initialize();

      expect(useAppStore.getState().drawerOpen).toBe(false);
    });

    it('auto-starts a pending item restored from disk', async () => {
      const saved = [makeItem({ id: 'pending-restored', status: 'pending' })];
      window.appApi = buildMockApi(saved) as never;

      await useAppStore.getState().initialize();
      // Allow the async startItemDownload to run
      await new Promise((r) => setTimeout(r, 20));

      expect(startMock).toHaveBeenCalledOnce();
      expect(startMock).toHaveBeenCalledWith(
        expect.objectContaining({ url: 'https://youtube.com/watch?v=pending-restored' }),
      );
    });

    it('does NOT auto-start when restored queue has only done items', async () => {
      const saved = [makeItem({ id: 'd', status: 'done', progressPercent: 100 })];
      window.appApi = buildMockApi(saved) as never;

      await useAppStore.getState().initialize();
      await new Promise((r) => setTimeout(r, 20));

      expect(startMock).not.toHaveBeenCalled();
    });

    it('does NOT auto-start a paused item restored from disk', async () => {
      const saved = [makeItem({ id: 'paused-restored', status: 'paused' })];
      window.appApi = buildMockApi(saved) as never;

      await useAppStore.getState().initialize();
      await new Promise((r) => setTimeout(r, 20));

      expect(startMock).not.toHaveBeenCalled();
      expect(useAppStore.getState().queue[0].status).toBe('paused');
    });
  });

  describe('queue.save() is called on state transitions', () => {
    beforeEach(() => {
      window.appApi = buildMockApi() as never;
      useAppStore.setState({ initialized: true });
    });

    it('calls save when addToQueue() adds an item', async () => {
      useAppStore.setState({
        wizardUrl: 'https://youtube.com/watch?v=new',
        wizardTitle: 'New Video',
        wizardFormats: [{ formatId: '22', label: '720p', ext: 'mp4', resolution: '720p', isVideoOnly: false, isAudioOnly: false }],
        selectedVideoFormatId: '22',
        selectedAudioFormatId: null,
        activePreset: null,
        wizardOutputDir: '/tmp',
        wizardStep: 'confirm',
        settings: { defaultOutputDir: '/tmp', rememberLastOutputDir: false, clipboardWatchEnabled: false },
      });

      await useAppStore.getState().addToQueue();

      expect(saveMock).toHaveBeenCalled();
    });

    it('calls save when removeQueueItem() removes a done item', () => {
      useAppStore.setState({
        queue: [makeItem({ id: 'rem', status: 'done', progressPercent: 100 })],
      });

      useAppStore.getState().removeQueueItem('rem');

      expect(saveMock).toHaveBeenCalled();
      expect(useAppStore.getState().queue).toHaveLength(0);
    });

    it('calls save when cancelItemDownload() cancels an active item', async () => {
      useAppStore.setState({
        queue: [makeItem({ id: 'can', status: 'downloading', downloadJobId: 'j1' })],
      });

      await useAppStore.getState().cancelItemDownload('can');

      expect(saveMock).toHaveBeenCalled();
      expect(useAppStore.getState().queue[0].status).toBe('cancelled');
    });

    it('calls save with paused status when pauseItemDownload() pauses an item', async () => {
      useAppStore.setState({
        queue: [makeItem({ id: 'pausing', status: 'downloading', downloadJobId: 'j-pause' })],
      });

      await useAppStore.getState().pauseItemDownload('pausing');

      expect(saveMock).toHaveBeenCalled();
      expect(useAppStore.getState().queue[0].status).toBe('paused');
    });

    it('calls save when retryQueueItem() resets a failed item', async () => {
      useAppStore.setState({
        queue: [makeItem({ id: 'err', status: 'error', error: { key: null, rawMessage: 'oops' } })],
      });

      await useAppStore.getState().retryQueueItem('err');

      expect(saveMock).toHaveBeenCalled();
      // Item was reset to pending and then auto-started (status will be downloading at this point)
      expect(useAppStore.getState().queue[0].error).toBeNull();
    });

    it('persists error status when downloads.start() fails', async () => {
      // Override the auto-resolved start mock with a failure for this case so a
      // restart would otherwise see the item as pending again.
      startMock.mockResolvedValueOnce({
        ok: false,
        error: { code: 'download', message: 'kaboom' }
      });

      useAppStore.setState({
        queue: [makeItem({ id: 'fail-start', status: 'pending' })],
      });

      await useAppStore.getState().startItemDownload('fail-start');

      expect(useAppStore.getState().queue[0].status).toBe('error');
      expect(useAppStore.getState().queue[0].error?.rawMessage).toBe('kaboom');
      expect(saveMock).toHaveBeenCalled();
      const lastSavedItems = saveMock.mock.calls.at(-1)?.[0] as Array<{ id: string; status: string }>;
      expect(lastSavedItems.find((i) => i.id === 'fail-start')?.status).toBe('error');
    });
  });

  describe('resumeItemDownload() — late-cancel guard', () => {
    beforeEach(() => {
      window.appApi = buildMockApi() as never;
      useAppStore.setState({ initialized: true });
    });

    it('does NOT call start() when item flips to cancelled while resume() is awaiting', async () => {
      // resume() resolves with `resumed: false`, simulating a main-process
      // cancel-before-binaries. While the await is in flight the renderer flips
      // the item to cancelled (e.g. user clicked cancel after resume).
      const resumeMock = vi.fn().mockImplementation(async () => {
        // While main is "thinking", flip the item to cancelled.
        useAppStore.setState((state) => ({
          queue: state.queue.map((i) =>
            i.id === 'racing' ? { ...i, status: 'cancelled' as const } : i
          )
        }));
        return ok({ resumed: false });
      });
      (window.appApi as unknown as { downloads: { resume: typeof resumeMock } }).downloads.resume = resumeMock;

      useAppStore.setState({
        queue: [makeItem({ id: 'racing', status: 'paused', downloadJobId: 'j-race' })],
      });

      await useAppStore.getState().resumeItemDownload('racing');

      expect(resumeMock).toHaveBeenCalledOnce();
      expect(startMock).not.toHaveBeenCalled();
      expect(useAppStore.getState().queue[0].status).toBe('cancelled');
    });

    it('falls back to start() when resume returns resumed:false and item is still downloading', async () => {
      // Standard cross-restart scenario: main has no record of the paused job,
      // renderer should re-start. (This test guards against an over-broad
      // late-cancel guard that would also skip the legitimate fallback path.)
      useAppStore.setState({
        queue: [makeItem({ id: 'cross-restart', status: 'paused', downloadJobId: 'j-old' })],
      });

      await useAppStore.getState().resumeItemDownload('cross-restart');

      expect(startMock).toHaveBeenCalledOnce();
    });
  });

  describe('save on status events', () => {
    it('calls save when a download completes (done)', async () => {
      window.appApi = buildMockApi() as never;
      await useAppStore.getState().initialize();

      useAppStore.setState({
        queue: [makeItem({ id: 'fin', status: 'downloading', downloadJobId: 'j-fin' })],
      });

      capturedOnStatus!({ jobId: 'j-fin', stage: 'done', statusKey: 'complete', at: new Date().toISOString() });
      await new Promise((r) => setTimeout(r, 20));

      expect(saveMock).toHaveBeenCalled();
      expect(useAppStore.getState().queue[0].status).toBe('done');
    });

    it('calls save when a download errors', async () => {
      window.appApi = buildMockApi() as never;
      await useAppStore.getState().initialize();

      useAppStore.setState({
        queue: [makeItem({ id: 'bad', status: 'downloading', downloadJobId: 'j-bad' })],
      });

      capturedOnStatus!({
        jobId: 'j-bad',
        stage: 'error',
        statusKey: 'ytdlpExitCode',
        params: { code: 1 },
        error: { key: 'botBlock', rawMessage: 'Sign in required' },
        at: new Date().toISOString()
      });
      await new Promise((r) => setTimeout(r, 20));

      expect(saveMock).toHaveBeenCalled();
      expect(useAppStore.getState().queue[0].status).toBe('error');
      expect(useAppStore.getState().queue[0].error?.key).toBe('botBlock');
    });
  });

  describe('clearCompleted()', () => {
    beforeEach(() => {
      window.appApi = buildMockApi() as never;
      useAppStore.setState({ initialized: true });
    });

    it('removes done and cancelled items, keeps pending and error', () => {
      useAppStore.setState({
        queue: [
          makeItem({ id: 'p', status: 'pending' }),
          makeItem({ id: 'd', status: 'done', progressPercent: 100 }),
          makeItem({ id: 'e', status: 'error', error: { key: null, rawMessage: 'oops' } }),
          makeItem({ id: 'c', status: 'cancelled' }),
        ],
      });

      useAppStore.getState().clearCompleted();

      const ids = useAppStore.getState().queue.map((i) => i.id);
      expect(ids).toContain('p');
      expect(ids).toContain('e');
      expect(ids).not.toContain('d');
      expect(ids).not.toContain('c');
    });

    it('calls queue.save after clearing', () => {
      useAppStore.setState({
        queue: [makeItem({ id: 'done-item', status: 'done', progressPercent: 100 })],
      });

      useAppStore.getState().clearCompleted();

      expect(saveMock).toHaveBeenCalled();
    });

    it('does nothing when no clearable items exist', () => {
      useAppStore.setState({
        queue: [makeItem({ id: 'p', status: 'pending' })],
      });

      useAppStore.getState().clearCompleted();

      expect(useAppStore.getState().queue).toHaveLength(1);
      expect(saveMock).toHaveBeenCalled(); // save is always called (idempotent)
    });
  });
});
