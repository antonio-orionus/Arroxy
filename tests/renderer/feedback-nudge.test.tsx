import { render, screen, act } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { App } from '@renderer/App';
import { useAppStore } from '@renderer/store/useAppStore';

function ok<T>(data: T) {
  return Promise.resolve({ ok: true as const, data });
}

const mockOpenExternal = vi.fn().mockResolvedValue(ok({ opened: true }));

const mockAppApi = {
  app: { warmUp: vi.fn().mockResolvedValue(ok({ completed: true, failures: [] })) },
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
  shell: { openFolder: vi.fn().mockResolvedValue(ok({ opened: true })), openExternal: mockOpenExternal },
  logs: { openDir: vi.fn().mockResolvedValue(ok({ opened: true })) },
  dialog: { chooseFolder: vi.fn().mockResolvedValue(ok({ path: '/tmp' })) },
  events: {
    onStatus: vi.fn().mockReturnValue(() => undefined),
    onProgress: vi.fn().mockReturnValue(() => undefined)
  },
  queue: {
    save: vi.fn().mockResolvedValue(undefined),
    load: vi.fn().mockResolvedValue([])
  },
  updater: {
    onUpdateAvailable: vi.fn().mockReturnValue(() => undefined),
    install: vi.fn().mockResolvedValue(undefined)
  }
};

function resetStore() {
  useAppStore.setState({
    initialized: false, settings: null, wizardStep: 'url',
    formatsLoading: false, wizardUrl: '', wizardTitle: '',
    wizardThumbnail: '', wizardFormats: [], selectedVideoFormatId: '',
    selectedAudioFormatId: null, activePreset: null,
    wizardOutputDir: '', wizardError: null, wizardErrorOrigin: null, queue: []
  });
}

describe('Feedback nudge', () => {
  beforeEach(() => {
    resetStore();
    window.appApi = mockAppApi;
    window.platform = 'linux';
    // Override the 45s delay to 500ms so timers are fast in tests
    (window as unknown as Record<string, unknown>).__NUDGE_DELAY_MS = 500;
    Object.defineProperty(navigator, 'clipboard', {
      writable: true, configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) }
    });
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    delete (window as unknown as Record<string, unknown>).__NUDGE_DELAY_MS;
  });

  it('nudge is NOT visible on initial render', async () => {
    render(<App />);
    await act(async () => {});
    expect(screen.queryByTestId('feedback-nudge')).not.toBeInTheDocument();
  });

  it('nudge appears after the configured delay', async () => {
    render(<App />);
    await act(async () => {});

    act(() => { vi.advanceTimersByTime(501); });

    expect(screen.getByTestId('feedback-nudge')).toBeInTheDocument();
    expect(screen.getByText('Enjoying Arroxy? I\'d love to hear from you! 💬')).toBeInTheDocument();
  });

  it('nudge auto-dismisses after 8 seconds', async () => {
    render(<App />);
    await act(async () => {});

    // Trigger nudge
    act(() => { vi.advanceTimersByTime(501); });
    expect(screen.getByTestId('feedback-nudge')).toBeInTheDocument();

    // Auto-dismiss fires after 8s — advance in two steps so React re-renders
    // between the dismiss trigger and the exit-animation timer
    act(() => { vi.advanceTimersByTime(8_001); });
    // FeedbackNudge now has visible=false, registers its 220ms exit timer
    act(() => { vi.advanceTimersByTime(250); });
    expect(screen.queryByTestId('feedback-nudge')).not.toBeInTheDocument();
  });

  it('clicking Feedback while nudge is visible dismisses it and opens URL', async () => {
    render(<App />);
    await act(async () => {});

    act(() => { vi.advanceTimersByTime(501); });
    expect(screen.getByTestId('feedback-nudge')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-feedback'));
    });

    expect(mockOpenExternal).toHaveBeenCalledWith(
      'https://github.com/antonio-orionus/Arroxy/issues/new/choose'
    );

    // After exit animation completes
    act(() => { vi.advanceTimersByTime(250); });
    expect(screen.queryByTestId('feedback-nudge')).not.toBeInTheDocument();
  });

  it('Feedback button has nudging class only while nudge is shown', async () => {
    render(<App />);
    await act(async () => {});

    const btn = screen.getByTestId('btn-feedback');
    expect(btn.className).not.toContain('feedback-btn-nudging');

    act(() => { vi.advanceTimersByTime(501); });
    expect(screen.getByTestId('btn-feedback').className).toContain('feedback-btn-nudging');

    // After auto-dismiss + animation (two steps so React re-renders between them)
    act(() => { vi.advanceTimersByTime(8_001); });
    act(() => { vi.advanceTimersByTime(250); });
    expect(screen.getByTestId('btn-feedback').className).not.toContain('feedback-btn-nudging');
  });
});
