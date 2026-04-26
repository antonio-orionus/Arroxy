// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppStore } from '@renderer/store/useAppStore';
import type { QueueItem, StatusEvent } from '@shared/types';

function ok<T>(data: T) {
  return { ok: true as const, data };
}

function makeItem(overrides: Partial<QueueItem> & Pick<QueueItem, 'id' | 'status'>): QueueItem {
  return {
    url: `https://youtube.com/watch?v=${overrides.id}`,
    title: overrides.id,
    thumbnail: '',
    outputDir: '/tmp',
    formatId: undefined,
    formatLabel: 'Best',
    progressPercent: 0,
    progressDetail: null,
    errorMessage: null,
    finishedAt: null,
    downloadJobId: null,
    ...overrides,
  };
}

function makeJob(id: string) {
  return { id, url: '', outputDir: '/tmp', status: 'running' as const, createdAt: '', updatedAt: '' };
}

describe('Queue persistence — store behavior', () => {
  let saveMock: ReturnType<typeof vi.fn>;
  let loadMock: ReturnType<typeof vi.fn>;
  let startMock: ReturnType<typeof vi.fn>;
  let capturedOnStatus: ((event: StatusEvent) => void) | null = null;

  function buildMockApi(savedQueue: QueueItem[] = []) {
    saveMock = vi.fn().mockResolvedValue(undefined);
    loadMock = vi.fn().mockResolvedValue(savedQueue);
    startMock = vi.fn().mockResolvedValue(ok({ job: makeJob('job-restored') }));

    return {
      app: { warmUp: vi.fn().mockResolvedValue(ok({ completed: true, failures: [] })) },
      downloads: {
        start: startMock,
        cancel: vi.fn().mockResolvedValue(ok({ cancelled: true })),
        getFormats: vi.fn(),
        pause: vi.fn().mockResolvedValue(ok({ paused: true })),
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
      },
      queue: { save: saveMock, load: loadMock },
    };
  }

  beforeEach(() => {
    capturedOnStatus = null;
    useAppStore.setState({
      initialized: false,
      initializing: false,
      _unbindStatus: null,
      _unbindProgress: null,
      settings: null,
      wizardStep: 'url',
      formatsLoading: false,
      wizardUrl: '',
      wizardTitle: '',
      wizardThumbnail: '',
      wizardFormats: [],
      selectedVideoFormatId: '',
      selectedAudioQuality: 'best',
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
        wizardFormats: [{ formatId: '22', label: '720p', ext: 'mp4', resolution: '720p', isVideoOnly: false }],
        selectedVideoFormatId: '22',
        selectedAudioQuality: 'best',
        activePreset: null,
        wizardOutputDir: '/tmp',
        wizardStep: 'confirm',
        settings: { defaultOutputDir: '/tmp', rememberLastOutputDir: false },
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
        queue: [makeItem({ id: 'err', status: 'error', errorMessage: 'oops' })],
      });

      await useAppStore.getState().retryQueueItem('err');

      expect(saveMock).toHaveBeenCalled();
      // Item was reset to pending and then auto-started (status will be downloading at this point)
      expect(useAppStore.getState().queue[0].errorMessage).toBeNull();
    });
  });

  describe('save on status events', () => {
    it('calls save when a download completes (done)', async () => {
      window.appApi = buildMockApi() as never;
      await useAppStore.getState().initialize();

      useAppStore.setState({
        queue: [makeItem({ id: 'fin', status: 'downloading', downloadJobId: 'j-fin' })],
      });

      capturedOnStatus!({ jobId: 'j-fin', stage: 'done', message: 'done', at: new Date().toISOString() });
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

      capturedOnStatus!({ jobId: 'j-bad', stage: 'error', message: 'Sign in required', at: new Date().toISOString() });
      await new Promise((r) => setTimeout(r, 20));

      expect(saveMock).toHaveBeenCalled();
      expect(useAppStore.getState().queue[0].status).toBe('error');
      expect(useAppStore.getState().queue[0].errorMessage).toBe('Sign in required');
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
          makeItem({ id: 'e', status: 'error', errorMessage: 'oops' }),
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
