import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '@renderer/App';
import { useAppStore } from '@renderer/store/useAppStore';

function ok<T>(data: T) {
  return Promise.resolve({ ok: true as const, data });
}

const mockOpenExternal = vi.fn().mockResolvedValue(ok({ opened: true }));
const mockOpenLogsDir = vi.fn().mockResolvedValue(ok({ opened: true }));

const mockAppApi = {
  app: {
    warmUp: vi.fn().mockResolvedValue(ok({ completed: true, failures: [] }))
  },
  window: {
    minimize: vi.fn().mockResolvedValue(undefined),
    maximize: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    isMaximized: vi.fn().mockResolvedValue(false),
    onMaximizedChange: vi.fn().mockReturnValue(() => undefined)
  },
  downloads: {
    getFormats: vi.fn().mockResolvedValue(ok({ formats: [], title: '', thumbnail: '' })),
    start: vi.fn(),
    cancel: vi.fn().mockResolvedValue(ok({ cancelled: true })),
    pause: vi.fn().mockResolvedValue(ok({ paused: true }))
  },
  settings: {
    get: vi.fn().mockResolvedValue(ok({ defaultOutputDir: '/tmp', rememberLastOutputDir: true })),
    update: vi.fn()
  },
  shell: {
    openFolder: vi.fn().mockResolvedValue(ok({ opened: true })),
    openExternal: mockOpenExternal
  },
  logs: {
    openDir: mockOpenLogsDir
  },
  dialog: {
    chooseFolder: vi.fn().mockResolvedValue(ok({ path: '/tmp' }))
  },
  events: {
    onStatus: vi.fn().mockReturnValue(() => undefined),
    onProgress: vi.fn().mockReturnValue(() => undefined)
  }
};

function resetStore() {
  useAppStore.setState({
    initialized: false,
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
    queue: []
  });
}

describe('Footer feedback controls', () => {
  beforeEach(() => {
    resetStore();
    window.appApi = mockAppApi;
    window.platform = 'linux';
    Object.defineProperty(navigator, 'clipboard', {
      writable: true,
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) }
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders all three footer utility buttons', async () => {
    render(<App />);
    expect(await screen.findByText('Copy debug info')).toBeInTheDocument();
    expect(screen.getByText('Feedback')).toBeInTheDocument();
    expect(screen.getByTestId('btn-logs')).toBeInTheDocument();
  });

  it('Feedback button calls openExternal with the GitHub issues URL', async () => {
    render(<App />);
    fireEvent.click(await screen.findByText('Feedback'));
    expect(mockOpenExternal).toHaveBeenCalledWith(
      'https://github.com/antonio-orionus/Arroxy/issues/new/choose'
    );
  });

  it('Copy debug info writes platform, Electron, and Chrome fields to clipboard', async () => {
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      value: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Electron/33.2.0 Chrome/130.0.6723.191 Safari/537.36'
    });

    render(<App />);
    fireEvent.click(await screen.findByText('Copy debug info'));

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledOnce();
    });

    const written = (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(written).toContain('Platform: linux');
    expect(written).toContain('Electron: 33.2.0');
    expect(written).toContain('Chrome: 130.0.6723.191');
  });

  it('Copy debug info falls back to "unknown" when Electron is absent from userAgent', async () => {
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      value: 'Mozilla/5.0 (jsdom)'
    });

    render(<App />);
    fireEvent.click(await screen.findByText('Copy debug info'));

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledOnce();
    });

    const written = (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(written).toContain('Electron: unknown');
    expect(written).toContain('Chrome: unknown');
  });

  it('shows "Copied!" immediately after click then reverts after 1.5 s', async () => {
    render(<App />);

    // Wait for initialization, then switch to fake timers
    await act(async () => {});
    vi.useFakeTimers();

    await act(async () => {
      fireEvent.click(screen.getByText('Copy debug info'));
    });

    expect(screen.getByText('Copied!')).toBeInTheDocument();

    act(() => { vi.advanceTimersByTime(1600); });

    expect(screen.getByText('Copy debug info')).toBeInTheDocument();
  });

  it('Logs button opens the log directory', async () => {
    render(<App />);
    fireEvent.click(await screen.findByTestId('btn-logs'));
    await waitFor(() => {
      expect(mockOpenLogsDir).toHaveBeenCalledOnce();
    });
  });
});
