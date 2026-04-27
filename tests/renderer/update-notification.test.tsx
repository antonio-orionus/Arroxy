import { render, screen, fireEvent, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '@renderer/App';
import { useAppStore } from '@renderer/store/useAppStore';
import type { AppApi } from '@shared/api';
import type { UpdateAvailablePayload } from '@shared/types';
import { ok } from '../shared/fixtures';

type UpdateListener = (info: UpdateAvailablePayload) => void;

function makeApi(overrides: {
  onUpdateAvailable?: (listener: UpdateListener) => () => void;
  install?: () => Promise<void>;
  openExternal?: (url: string) => Promise<unknown>;
} = {}) {
  return {
    app: {
      warmUp: vi.fn().mockResolvedValue(ok({ completed: true, failures: [] })),
      setLanguage: vi.fn().mockResolvedValue(undefined)
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
      openExternal: overrides.openExternal ?? vi.fn().mockResolvedValue(ok({ opened: true }))
    },
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
      onUpdateAvailable: overrides.onUpdateAvailable ?? (() => () => undefined),
      install: overrides.install ?? (vi.fn().mockResolvedValue(undefined) as () => Promise<void>)
    }
  } as unknown as AppApi;
}

function resetStore() {
  useAppStore.setState({
    initialized: false, settings: null, wizardStep: 'url',
    formatsLoading: false, wizardUrl: '', wizardTitle: '',
    wizardThumbnail: '', wizardFormats: [], selectedVideoFormatId: '',
    selectedAudioFormatId: null, activePreset: null,
    wizardOutputDir: '', wizardError: null, wizardErrorOrigin: null, queue: []
  });
}

describe('UpdateBanner integration in App', () => {
  beforeEach(() => {
    resetStore();
    window.platform = 'linux';
    Object.defineProperty(navigator, 'clipboard', {
      writable: true, configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('banner is not shown on initial render', async () => {
    window.appApi = makeApi();
    render(<App />);
    await act(async () => {});
    expect(screen.queryByTestId('update-banner')).not.toBeInTheDocument();
  });

  it('banner appears when onUpdateAvailable fires', async () => {
    let capturedListener: UpdateListener | null = null;
    const onUpdateAvailable = (listener: UpdateListener) => {
      capturedListener = listener;
      return () => undefined;
    };
    window.appApi = makeApi({ onUpdateAvailable });

    render(<App />);
    await act(async () => {});

    expect(screen.queryByTestId('update-banner')).not.toBeInTheDocument();

    act(() => {
      capturedListener!({ version: '2.0.0', currentVersion: '1.0.0', installChannel: 'direct' });
    });

    expect(screen.getByTestId('update-banner')).toBeInTheDocument();
  });

  it('shows correct version numbers from the IPC payload', async () => {
    let capturedListener: UpdateListener | null = null;
    const onUpdateAvailable = (listener: UpdateListener) => {
      capturedListener = listener;
      return () => undefined;
    };
    window.appApi = makeApi({ onUpdateAvailable });

    render(<App />);
    await act(async () => {});

    act(() => {
      capturedListener!({ version: '3.1.0', currentVersion: '2.5.1', installChannel: 'direct' });
    });

    expect(screen.getByText('Arroxy 3.1.0')).toBeInTheDocument();
    expect(screen.getByText(/you have 2\.5\.1/)).toBeInTheDocument();
  });

  it('dismiss button hides the banner', async () => {
    let capturedListener: UpdateListener | null = null;
    const onUpdateAvailable = (listener: UpdateListener) => {
      capturedListener = listener;
      return () => undefined;
    };
    window.appApi = makeApi({ onUpdateAvailable });

    render(<App />);
    await act(async () => {});

    act(() => {
      capturedListener!({ version: '2.0.0', currentVersion: '1.0.0', installChannel: 'direct' });
    });
    expect(screen.getByTestId('update-banner')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Dismiss update banner' }));
    });
    expect(screen.queryByTestId('update-banner')).not.toBeInTheDocument();
  });

  it('Install & Restart calls updater.install()', async () => {
    let capturedListener: UpdateListener | null = null;
    const onUpdateAvailable = (listener: UpdateListener) => {
      capturedListener = listener;
      return () => undefined;
    };
    const installMock = vi.fn().mockResolvedValue(undefined) as () => Promise<void>;
    window.appApi = makeApi({ onUpdateAvailable, install: installMock });

    render(<App />);
    await act(async () => {});

    act(() => {
      capturedListener!({ version: '2.0.0', currentVersion: '1.0.0', installChannel: 'direct' });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Install & Restart' }));
    });

    expect(installMock).toHaveBeenCalledOnce();
  });

  it('Download ↗ calls shell.openExternal with GitHub releases URL', async () => {
    let capturedListener: UpdateListener | null = null;
    const onUpdateAvailable = (listener: UpdateListener) => {
      capturedListener = listener;
      return () => undefined;
    };
    const openExternal = vi.fn().mockResolvedValue(ok({ opened: true }));
    window.appApi = makeApi({ onUpdateAvailable, openExternal });
    window.platform = 'darwin';

    render(<App />);
    await act(async () => {});

    act(() => {
      capturedListener!({ version: '2.0.0', currentVersion: '1.0.0', installChannel: 'direct' });
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Download ↗'));
    });

    expect(openExternal).toHaveBeenCalledWith(
      'https://github.com/antonio-orionus/Arroxy/releases/latest'
    );
  });

  it('Download ↗ dismisses the banner after clicking', async () => {
    let capturedListener: UpdateListener | null = null;
    const onUpdateAvailable = (listener: UpdateListener) => {
      capturedListener = listener;
      return () => undefined;
    };
    window.appApi = makeApi({ onUpdateAvailable });
    window.platform = 'darwin';

    render(<App />);
    await act(async () => {});

    act(() => {
      capturedListener!({ version: '2.0.0', currentVersion: '1.0.0', installChannel: 'direct' });
    });
    expect(screen.getByTestId('update-banner')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByText('Download ↗'));
    });
    expect(screen.queryByTestId('update-banner')).not.toBeInTheDocument();
  });

  it('shows Download ↗ (not Install & Restart) on macOS', async () => {
    let capturedListener: UpdateListener | null = null;
    const onUpdateAvailable = (listener: UpdateListener) => {
      capturedListener = listener;
      return () => undefined;
    };
    window.appApi = makeApi({ onUpdateAvailable });
    window.platform = 'darwin';

    render(<App />);
    await act(async () => {});

    act(() => {
      capturedListener!({ version: '2.0.0', currentVersion: '1.0.0', installChannel: 'direct' });
    });

    expect(screen.getByText('Download ↗')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Install/i })).not.toBeInTheDocument();
  });

  it('registers and unregisters the listener on mount/unmount', async () => {
    const unsubscribe = vi.fn();
    const onUpdateAvailable = vi.fn().mockReturnValue(unsubscribe);
    window.appApi = makeApi({ onUpdateAvailable });

    const { unmount } = render(<App />);
    await act(async () => {});

    expect(onUpdateAvailable).toHaveBeenCalledOnce();

    unmount();
    expect(unsubscribe).toHaveBeenCalledOnce();
  });
});
