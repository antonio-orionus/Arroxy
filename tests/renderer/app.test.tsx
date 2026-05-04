import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '@renderer/App';
import { useAppStore } from '@renderer/store/useAppStore';
import { buildMockAppApi } from '../shared/mockAppApi';

const mockAppApi = buildMockAppApi();

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
      selectedAudioFormatId: null,
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
    expect(await screen.findByTestId('title-bar')).toHaveTextContent('Arroxy');
    expect(await screen.findByPlaceholderText(/youtube\.com/i)).toBeInTheDocument();
  });

  it('advances to format step after submitting URL', async () => {
    render(<App />);

    const input = await screen.findByPlaceholderText(/youtube\.com/i);
    fireEvent.change(input, { target: { value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' } });

    fireEvent.click(screen.getByTestId('btn-find-formats'));

    await waitFor(() => {
      expect(mockAppApi.downloads.getFormats).toHaveBeenCalledWith(expect.objectContaining({ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }));
    });
  });

  it('shows queue panel below wizard', async () => {
    render(<App />);
    expect(await screen.findByText('Download Queue')).toBeInTheDocument();
    expect(await screen.findAllByText(/no downloads yet/i)).not.toHaveLength(0);
  });
});
