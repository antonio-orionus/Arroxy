// @vitest-environment node
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { EventEmitter } from 'node:events';
import type { SupportedLang } from '@shared/i18n/types';

const mockTrayInstance = {
  setToolTip: vi.fn(),
  setContextMenu: vi.fn(),
  on: vi.fn(),
  destroy: vi.fn(),
  isDestroyed: vi.fn().mockReturnValue(false)
};

vi.mock('electron', () => {
  class MockTray {
    setToolTip = mockTrayInstance.setToolTip;
    setContextMenu = mockTrayInstance.setContextMenu;
    on = mockTrayInstance.on;
    destroy = mockTrayInstance.destroy;
    isDestroyed = mockTrayInstance.isDestroyed;
  }
  const Menu = {
    buildFromTemplate: vi.fn().mockImplementation((items) => ({ _items: items }))
  };
  const nativeImage = {
    createFromPath: vi.fn().mockReturnValue({ isEmpty: vi.fn().mockReturnValue(false) })
  };
  return { Tray: MockTray, Menu, nativeImage };
});

import { Menu, nativeImage } from 'electron';
import { TrayManager } from '@main/services/TrayManager';

// A minimal DownloadService fake that supports the event emitter pattern
class FakeDownloadService extends EventEmitter {
  activeCount = 0;
  _jobPercents = new Map<string, number>();
}

function makeWindow(visible = true) {
  return {
    isDestroyed: vi.fn().mockReturnValue(false),
    isVisible: vi.fn().mockReturnValue(visible),
    show: vi.fn(),
    focus: vi.fn(),
    hide: vi.fn()
  };
}

function makeLanguageRef(lang: SupportedLang = 'en') {
  return { current: lang };
}

describe('TrayManager', () => {
  let ds: FakeDownloadService;
  let win: ReturnType<typeof makeWindow>;
  let tray: TrayManager;
  let onQuit: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    // Reset mock tray instance state
    mockTrayInstance.setToolTip.mockReset();
    mockTrayInstance.setContextMenu.mockReset();
    mockTrayInstance.on.mockReset();
    mockTrayInstance.destroy.mockReset();
    mockTrayInstance.isDestroyed.mockReturnValue(false);
    ds = new FakeDownloadService();
    win = makeWindow();
    onQuit = vi.fn();
    tray = new TrayManager(win as never, ds as never, makeLanguageRef(), onQuit as () => void);
    tray.start();
  });

  afterEach(() => {
    tray.destroy();
    vi.useRealTimers();
  });

  // --- status text ---

  it('initial menu shows Idle when no active downloads', () => {
    const calls = vi.mocked(Menu.buildFromTemplate).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const items = calls[calls.length - 1][0];
    const header = items[0];
    expect(header.label).toContain('Idle');
    expect(header.enabled).toBe(false);
  });

  it('menu header shows count and percent after progress events', () => {
    ds.activeCount = 1;
    ds.emit('progress', { jobId: 'j1', percent: 47, line: '', at: '' });

    // Progress is throttled — advance 1s
    vi.advanceTimersByTime(1100);

    const calls = vi.mocked(Menu.buildFromTemplate).mock.calls;
    const items = calls[calls.length - 1][0];
    const header = items[0];
    expect(header.label).toMatch(/47/);
    expect(header.enabled).toBe(false);
  });

  it('shows aggregate percent for multiple active jobs', () => {
    ds.activeCount = 2;
    ds.emit('progress', { jobId: 'j1', percent: 40, line: '', at: '' });
    ds.emit('progress', { jobId: 'j2', percent: 80, line: '', at: '' });

    vi.advanceTimersByTime(1100);

    const calls = vi.mocked(Menu.buildFromTemplate).mock.calls;
    const items = calls[calls.length - 1][0];
    expect(items[0].label).toMatch(/60/); // (40+80)/2
  });

  it('resets to Idle when status done event fires', () => {
    ds.activeCount = 1;
    ds.emit('progress', { jobId: 'j1', percent: 50, line: '', at: '' });
    vi.advanceTimersByTime(1100);

    // Job completes
    ds.activeCount = 0;
    ds.emit('status', { jobId: 'j1', stage: 'done', statusKey: 'complete', at: '' });

    const calls = vi.mocked(Menu.buildFromTemplate).mock.calls;
    const items = calls[calls.length - 1][0];
    expect(items[0].label).toContain('Idle');
  });

  it('rebuilds menu immediately on status event (no throttle)', () => {
    const beforeCount = vi.mocked(Menu.buildFromTemplate).mock.calls.length;
    ds.emit('status', { jobId: 'j1', stage: 'done', statusKey: 'complete', at: '' });
    const afterCount = vi.mocked(Menu.buildFromTemplate).mock.calls.length;
    expect(afterCount).toBeGreaterThan(beforeCount);
  });

  it('throttles progress events — does not rebuild menu more than once per second', () => {
    ds.activeCount = 1;
    const before = vi.mocked(Menu.buildFromTemplate).mock.calls.length;

    // Fire 20 rapid progress events
    for (let i = 0; i < 20; i++) {
      ds.emit('progress', { jobId: 'j1', percent: i * 5, line: '', at: '' });
    }

    // Before timeout: no new builds (only the one scheduled)
    const midCount = vi.mocked(Menu.buildFromTemplate).mock.calls.length;
    expect(midCount - before).toBe(0); // pending, not yet fired

    vi.advanceTimersByTime(1100);
    const afterCount = vi.mocked(Menu.buildFromTemplate).mock.calls.length;
    expect(afterCount - before).toBe(1); // exactly one rebuild
  });

  // --- window toggle ---

  it('toggleWindow hides window when visible', () => {
    win.isVisible.mockReturnValue(true);
    tray.toggleWindow();
    expect(win.hide).toHaveBeenCalledOnce();
    expect(win.show).not.toHaveBeenCalled();
  });

  it('toggleWindow shows and focuses when hidden', () => {
    win.isVisible.mockReturnValue(false);
    tray.toggleWindow();
    expect(win.show).toHaveBeenCalledOnce();
    expect(win.focus).toHaveBeenCalledOnce();
  });

  // --- destroy ---

  it('destroy removes all downloadService listeners', () => {
    const before = ds.listenerCount('progress') + ds.listenerCount('status');
    expect(before).toBeGreaterThan(0);
    tray.destroy();
    const after = ds.listenerCount('progress') + ds.listenerCount('status');
    expect(after).toBe(0);
  });

  it('destroy calls tray.destroy() on the Electron Tray', () => {
    tray.destroy();
    expect(mockTrayInstance.destroy).toHaveBeenCalledOnce();
  });

  it('destroy clears any pending throttle timer', () => {
    ds.activeCount = 1;
    ds.emit('progress', { jobId: 'j1', percent: 30, line: '', at: '' });
    tray.destroy();
    const countBefore = vi.mocked(Menu.buildFromTemplate).mock.calls.length;
    vi.advanceTimersByTime(2000); // pending timer should NOT fire
    const countAfter = vi.mocked(Menu.buildFromTemplate).mock.calls.length;
    expect(countAfter).toBe(countBefore);
  });

  // --- quit callback ---

  it('quit menu item invokes the onQuit callback', () => {
    const calls = vi.mocked(Menu.buildFromTemplate).mock.calls;
    const items = calls[calls.length - 1][0] as { label?: string; click?: () => void }[];
    const quitItem = items.find((i) => i.label?.includes('Quit'));
    expect(quitItem).toBeDefined();
    expect(quitItem!.click).toBeDefined();
    quitItem!.click!();
    expect(onQuit).toHaveBeenCalledOnce();
  });

  // --- tray icon creation ---

  it('creates Tray and sets tooltip', () => {
    expect(nativeImage.createFromPath).toHaveBeenCalled();
    expect(mockTrayInstance.setToolTip).toHaveBeenCalledWith(expect.any(String));
  });
});
