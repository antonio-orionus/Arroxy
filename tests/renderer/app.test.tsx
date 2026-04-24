import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '@renderer/App';
import { useAppStore } from '@renderer/store/useAppStore';

function ok<T>(data: T) {
  return Promise.resolve({ ok: true as const, data });
}

const mockAppApi = {
  window: {
    minimize: vi.fn().mockResolvedValue(undefined),
    maximize: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    isMaximized: vi.fn().mockResolvedValue(false),
    onMaximizedChange: vi.fn().mockReturnValue(() => undefined)
  },
  downloads: {
    getFormats: vi.fn().mockResolvedValue(ok({
      formats: [
        { formatId: '22', label: '720p | mp4', ext: 'mp4', resolution: '720p', fps: 30, isVideoOnly: false }
      ],
      title: 'Test Video',
      thumbnail: ''
    })),
    start: vi.fn().mockResolvedValue(ok({
      job: { id: 'job-1', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', outputDir: '/tmp', status: 'running', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    })),
    cancel: vi.fn().mockResolvedValue(ok({ cancelled: true })),
    pause: vi.fn().mockResolvedValue(ok({ paused: true }))
  },
  settings: {
    get: vi.fn().mockResolvedValue(ok({ defaultOutputDir: '/tmp', rememberLastOutputDir: true })),
    update: vi.fn().mockResolvedValue(ok({ defaultOutputDir: '/tmp', rememberLastOutputDir: true }))
  },
  shell: {
    openFolder: vi.fn().mockResolvedValue(ok({ opened: true })),
    openExternal: vi.fn().mockResolvedValue(ok({ opened: true }))
  },
  logs: {
    openDir: vi.fn().mockResolvedValue(ok({ opened: true }))
  },
  dialog: {
    chooseFolder: vi.fn().mockResolvedValue(ok({ path: '/tmp' }))
  },
  events: {
    onStatus: vi.fn().mockReturnValue(() => undefined),
    onProgress: vi.fn().mockReturnValue(() => undefined)
  }
};

describe('App renderer', () => {
  beforeEach(() => {
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

    window.appApi = mockAppApi;
    window.platform = 'linux';

    vi.clearAllMocks();
  });

  it('renders the app heading and URL input', async () => {
    render(<App />);
    expect(await screen.findByTestId('title-bar')).toHaveTextContent('YT Download');
    expect(await screen.findByPlaceholderText(/youtube\.com/i)).toBeInTheDocument();
  });

  it('advances to format step after submitting URL', async () => {
    render(<App />);

    const input = await screen.findByPlaceholderText(/youtube\.com/i);
    fireEvent.change(input, { target: { value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' } });

    fireEvent.click(screen.getByRole('button', { name: 'Find Formats' }));

    await waitFor(() => {
      expect(mockAppApi.downloads.getFormats).toHaveBeenCalledWith(
        expect.objectContaining({ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' })
      );
    });
  });

  it('shows queue panel below wizard', async () => {
    render(<App />);
    expect(await screen.findByText('Download Queue')).toBeInTheDocument();
    expect(await screen.findByText(/no videos queued/i)).toBeInTheDocument();
  });
});
