// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, act, fireEvent, screen } from '@testing-library/react';
import { useAppStore } from '@renderer/store/useAppStore';
import { StepUrlInput } from '@renderer/components/wizard/StepUrlInput';
import { buildMockAppApi } from '../shared/mockAppApi';
import type { AppApi } from '@shared/api';

let mockApi: AppApi;
let clipboardUnsub: () => void;
let clipboardListener: ((url: string) => void) | null;

function resetStore(overrides: Partial<ReturnType<typeof useAppStore.getState>> = {}): void {
  useAppStore.setState({
    initialized: true,
    initializing: false,
    settings: {
      defaultOutputDir: '/tmp',
      rememberLastOutputDir: false,
      clipboardWatchEnabled: true,
      cookiesEnabled: false,
      cookiesPath: ''
    },
    wizardStep: 'url',
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

  it('"Use URL" applies the URL and closes the dialog', () => {
    render(<StepUrlInput />);
    act(() => {
      clipboardListener!(FRESH_URL);
    });

    fireEvent.click(screen.getByTestId('clipboard-confirm-use'));

    expect(useAppStore.getState().wizardUrl).toBe(FRESH_URL);
    expect(screen.queryByTestId('clipboard-confirm-dialog')).not.toBeInTheDocument();
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

    expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining({ clipboardWatchEnabled: false }));
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

  it('unsubscribes from clipboard events when StepUrlInput unmounts', () => {
    const { unmount } = render(<StepUrlInput />);
    expect(clipboardUnsub).not.toHaveBeenCalled();
    unmount();
    expect(clipboardUnsub).toHaveBeenCalledTimes(1);
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
