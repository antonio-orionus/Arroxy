// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, act, fireEvent, screen } from '@testing-library/react';
import { useAppStore } from '@renderer/store/useAppStore.js';
import { StepUrlInput } from '@renderer/components/wizard/StepUrlInput.js';
import { buildMockAppApi } from '../shared/mockAppApi.js';
import type { AppApi } from '@shared/api.js';

let mockApi: AppApi;
let clipboardUnsub: () => void;
let clipboardListener: ((url: string) => void) | null;

function resetStore(overrides: Partial<ReturnType<typeof useAppStore.getState>> = {}): void {
  useAppStore.setState({
    initialized: true,
    initializing: false,
    splashDismissed: true,
    settings: {
      common: {
        defaultOutputDir: '/tmp',
        rememberLastOutputDir: false,
        clipboardWatchEnabled: true,
        cookiesMode: 'off',
        cookiesPath: ''
      },
      single: {},
      playlist: {}
    },
    wizardStep: 'url',
    wizardMode: 'single',
    formatsLoading: false,
    wizardUrl: '',
    wizardTitle: '',
    wizardThumbnail: '',
    wizardFormats: [],
    selectedVideoFormatId: '',
    audioSelection: { kind: 'none' },
    activePreset: null,
    wizardOutputDir: '',
    wizardError: null,
    wizardErrorOrigin: null,
    playlistItems: [],
    queue: [],
    drawerOpen: false,
    ...overrides
  });
}

beforeEach(() => {
  clipboardListener = null;
  clipboardUnsub = vi.fn();
  mockApi = buildMockAppApi();
  mockApi.events.onClipboardUrl = (cb): (() => void) => {
    clipboardListener = cb;
    return clipboardUnsub;
  };
  window.appApi = mockApi;
  window.platform = 'linux';
  resetStore();
});

const FRESH_URL = 'https://www.youtube.com/watch?v=fromClipboard';

describe('wizard clipboard confirm dialog', () => {
  it('opens the dialog when the watcher fires and the field is empty', () => {
    render(<StepUrlInput />);
    expect(screen.queryByTestId('clipboard-confirm-dialog')).not.toBeInTheDocument();

    act(() => {
      clipboardListener!(FRESH_URL);
    });

    expect(screen.getByTestId('clipboard-confirm-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('clipboard-confirm-url')).toHaveTextContent(FRESH_URL);
    // wizardUrl is NOT touched until the user confirms.
    expect(useAppStore.getState().wizardUrl).toBe('');
  });

  it('does not open the dialog if wizardUrl already has a value', () => {
    useAppStore.setState({ wizardUrl: 'already-here' });
    render(<StepUrlInput />);

    act(() => {
      clipboardListener!(FRESH_URL);
    });

    expect(screen.queryByTestId('clipboard-confirm-dialog')).not.toBeInTheDocument();
    expect(useAppStore.getState().wizardUrl).toBe('already-here');
  });

  it('does not open the dialog while a probe is in flight', () => {
    useAppStore.setState({ wizardUrl: '', formatsLoading: true });
    render(<StepUrlInput />);

    act(() => {
      clipboardListener!(FRESH_URL);
    });

    expect(screen.queryByTestId('clipboard-confirm-dialog')).not.toBeInTheDocument();
  });

  it('waits until the splash screen has finished dismissing before opening', () => {
    resetStore({ initialized: true, splashDismissed: false });
    render(<StepUrlInput />);

    act(() => {
      clipboardListener!(FRESH_URL);
    });

    expect(screen.queryByTestId('clipboard-confirm-dialog')).not.toBeInTheDocument();

    act(() => {
      useAppStore.getState().setSplashDismissed(true);
    });

    expect(screen.getByTestId('clipboard-confirm-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('clipboard-confirm-url')).toHaveTextContent(FRESH_URL);
  });

  it('"Use URL" applies the URL and closes the dialog', () => {
    render(<StepUrlInput />);
    act(() => {
      clipboardListener!(FRESH_URL);
    });

    fireEvent.click(screen.getByTestId('clipboard-confirm-use'));

    expect(useAppStore.getState().wizardUrl).toBe(FRESH_URL);
    expect(screen.queryByTestId('clipboard-confirm-dialog')).not.toBeInTheDocument();
  });

  it('"Fetch Formats" applies the URL, closes the dialog, and calls submitUrl', async () => {
    const submitSpy = vi.fn().mockResolvedValue(undefined);
    useAppStore.setState({ submitUrl: submitSpy } as Partial<ReturnType<typeof useAppStore.getState>>);

    render(<StepUrlInput />);
    act(() => {
      clipboardListener!(FRESH_URL);
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('clipboard-confirm-fetch'));
    });

    expect(useAppStore.getState().wizardUrl).toBe(FRESH_URL);
    expect(screen.queryByTestId('clipboard-confirm-dialog')).not.toBeInTheDocument();
    expect(submitSpy).toHaveBeenCalledTimes(1);
  });

  it('"Quick download" appears before fetch, applies the URL, closes the dialog, and calls quickDownload', async () => {
    const quickDownloadSpy = vi.fn().mockResolvedValue(undefined);
    useAppStore.setState({ quickDownload: quickDownloadSpy } as Partial<ReturnType<typeof useAppStore.getState>>);

    render(<StepUrlInput />);
    act(() => {
      clipboardListener!(FRESH_URL);
    });

    expect(screen.getByTestId('clipboard-confirm-dialog')).toHaveTextContent(/Quick download.*Fetch formats/s);

    await act(async () => {
      fireEvent.click(screen.getByTestId('clipboard-confirm-quick-download'));
    });

    expect(useAppStore.getState().wizardUrl).toBe(FRESH_URL);
    expect(screen.queryByTestId('clipboard-confirm-dialog')).not.toBeInTheDocument();
    expect(quickDownloadSpy).toHaveBeenCalledTimes(1);
  });

  it('"Cancel" closes without touching wizardUrl', () => {
    render(<StepUrlInput />);
    act(() => {
      clipboardListener!(FRESH_URL);
    });

    fireEvent.click(screen.getByTestId('clipboard-confirm-cancel'));

    expect(useAppStore.getState().wizardUrl).toBe('');
    expect(screen.queryByTestId('clipboard-confirm-dialog')).not.toBeInTheDocument();
  });

  it('"Disable" calls settings.update with clipboardWatchEnabled=false and closes', () => {
    const updateSpy = vi.spyOn(mockApi.settings, 'update');
    render(<StepUrlInput />);
    act(() => {
      clipboardListener!(FRESH_URL);
    });

    fireEvent.click(screen.getByTestId('clipboard-confirm-disable'));

    expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining({ common: expect.objectContaining({ clipboardWatchEnabled: false }) }));
    expect(useAppStore.getState().wizardUrl).toBe('');
    expect(screen.queryByTestId('clipboard-confirm-dialog')).not.toBeInTheDocument();
  });

  it('replaces the pending URL when a second clipboard event fires while dialog is open', () => {
    const second = 'https://www.youtube.com/watch?v=second';
    render(<StepUrlInput />);

    act(() => {
      clipboardListener!(FRESH_URL);
    });
    expect(screen.getByTestId('clipboard-confirm-url')).toHaveTextContent(FRESH_URL);

    act(() => {
      clipboardListener!(second);
    });
    expect(screen.getByTestId('clipboard-confirm-url')).toHaveTextContent(second);
  });

  it('offers bulk download when clipboard text contains multiple accepted URLs', () => {
    render(<StepUrlInput />);

    act(() => {
      clipboardListener!('Grab https://example.com/one, https://example.com/two');
    });

    expect(screen.getByTestId('clipboard-confirm-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('clipboard-confirm-bulk-count')).toHaveTextContent('2');
    expect(screen.getByTestId('clipboard-confirm-bulk-preview')).toHaveTextContent('https://example.com/one');
    expect(screen.queryByTestId('clipboard-confirm-use')).not.toBeInTheDocument();
    expect(screen.getByTestId('clipboard-confirm-bulk')).toBeInTheDocument();
  });

  it('"Bulk download" opens the full bulk URL dialog with clipboard text', () => {
    const clipboardText = 'https://example.com/one\nhttps://example.com/two';
    render(<StepUrlInput />);

    act(() => {
      clipboardListener!(clipboardText);
    });
    fireEvent.click(screen.getByTestId('clipboard-confirm-bulk'));

    expect(screen.queryByTestId('clipboard-confirm-dialog')).not.toBeInTheDocument();
    expect(screen.getByTestId('bulk-url-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('bulk-url-textarea')).toHaveValue(clipboardText);
    expect(screen.getByTestId('bulk-url-valid-count')).toHaveTextContent('2');
    expect(useAppStore.getState().wizardStep).toBe('url');
  });

  it('confirming the clipboard-opened bulk dialog enters the selectable rows flow', () => {
    render(<StepUrlInput />);

    act(() => {
      clipboardListener!('https://example.com/one\nhttps://example.com/two');
    });
    fireEvent.click(screen.getByTestId('clipboard-confirm-bulk'));
    fireEvent.click(screen.getByTestId('bulk-url-confirm'));

    const state = useAppStore.getState();
    expect(state.wizardUrl).toBe('');
    expect(state.wizardStep).toBe('playlistItems');
    expect(state.wizardMode).toBe('bulk');
    expect(state.playlistItems.map((item) => item.url)).toEqual(['https://example.com/one', 'https://example.com/two']);
    expect(screen.queryByTestId('bulk-url-dialog')).not.toBeInTheDocument();
  });

  it('"Cancel" closes a bulk clipboard prompt without entering bulk mode', () => {
    render(<StepUrlInput />);

    act(() => {
      clipboardListener!('https://example.com/one\nhttps://example.com/two');
    });
    fireEvent.click(screen.getByTestId('clipboard-confirm-cancel'));

    expect(useAppStore.getState().wizardStep).toBe('url');
    expect(useAppStore.getState().wizardMode).toBe('single');
    expect(screen.queryByTestId('clipboard-confirm-dialog')).not.toBeInTheDocument();
  });

  it('"Disable" works from a bulk clipboard prompt', () => {
    const updateSpy = vi.spyOn(mockApi.settings, 'update');
    render(<StepUrlInput />);

    act(() => {
      clipboardListener!('https://example.com/one\nhttps://example.com/two');
    });
    fireEvent.click(screen.getByTestId('clipboard-confirm-disable'));

    expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining({ common: expect.objectContaining({ clipboardWatchEnabled: false }) }));
    expect(useAppStore.getState().wizardStep).toBe('url');
    expect(screen.queryByTestId('clipboard-confirm-dialog')).not.toBeInTheDocument();
  });

  it('unsubscribes from clipboard events when StepUrlInput unmounts', () => {
    const { unmount } = render(<StepUrlInput />);
    expect(clipboardUnsub).not.toHaveBeenCalled();
    unmount();
    expect(clipboardUnsub).toHaveBeenCalledTimes(1);
  });

  it('ignores clipboard watcher events while the bulk URL dialog is open', () => {
    render(<StepUrlInput />);

    fireEvent.click(screen.getByTestId('btn-bulk-download'));
    expect(screen.getByTestId('bulk-url-dialog')).toBeInTheDocument();

    act(() => {
      clipboardListener!(FRESH_URL);
    });

    expect(screen.queryByTestId('clipboard-confirm-dialog')).not.toBeInTheDocument();
    expect(useAppStore.getState().wizardUrl).toBe('');
  });
});

describe('URL input clear icon', () => {
  it('is hidden when the field is empty', () => {
    render(<StepUrlInput />);
    expect(screen.queryByTestId('url-clear')).not.toBeInTheDocument();
  });

  it('appears when the field has a value and clears it on click', () => {
    useAppStore.setState({ wizardUrl: 'https://www.youtube.com/watch?v=abc' });
    render(<StepUrlInput />);

    const clearBtn = screen.getByTestId('url-clear');
    fireEvent.click(clearBtn);

    expect(useAppStore.getState().wizardUrl).toBe('');
  });

  it('treats whitespace-only values as empty (no clear icon)', () => {
    useAppStore.setState({ wizardUrl: '   ' });
    render(<StepUrlInput />);
    expect(screen.queryByTestId('url-clear')).not.toBeInTheDocument();
  });
});

describe('bulk URL dialog', () => {
  it('opens from the bulk button', () => {
    render(<StepUrlInput />);

    fireEvent.click(screen.getByTestId('btn-bulk-download'));

    expect(screen.getByTestId('bulk-url-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('bulk-url-textarea')).toBeInTheDocument();
  });

  it('updates the preview from pasted URLs', () => {
    render(<StepUrlInput />);
    fireEvent.click(screen.getByTestId('btn-bulk-download'));

    fireEvent.change(screen.getByTestId('bulk-url-textarea'), {
      target: { value: 'https://example.com/one, https://example.com/two' }
    });

    expect(screen.getByTestId('bulk-url-valid-count')).toHaveTextContent('2');
    expect(screen.getByText('https://example.com/one')).toBeInTheDocument();
    expect(screen.getByText('https://example.com/two')).toBeInTheDocument();
  });

  it('keeps confirm disabled for zero or one accepted URL', () => {
    render(<StepUrlInput />);
    fireEvent.click(screen.getByTestId('btn-bulk-download'));

    const confirm = screen.getByTestId('bulk-url-confirm');
    expect(confirm).toBeDisabled();

    fireEvent.change(screen.getByTestId('bulk-url-textarea'), {
      target: { value: 'https://example.com/one' }
    });

    expect(confirm).toBeDisabled();
  });

  it('confirm populates selectable bulk rows', () => {
    render(<StepUrlInput />);
    fireEvent.click(screen.getByTestId('btn-bulk-download'));
    fireEvent.change(screen.getByTestId('bulk-url-textarea'), {
      target: { value: 'https://example.com/one\nhttps://example.com/two' }
    });

    fireEvent.click(screen.getByTestId('bulk-url-confirm'));

    const state = useAppStore.getState();
    expect(state.wizardStep).toBe('playlistItems');
    expect(state.wizardMode).toBe('bulk');
    expect(state.playlistItems.map((item) => item.url)).toEqual(['https://example.com/one', 'https://example.com/two']);
  });
});
