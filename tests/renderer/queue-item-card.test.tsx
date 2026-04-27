import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { QueueItemCard } from '@renderer/components/QueueItemCard';
import { useAppStore } from '@renderer/store/useAppStore';
import type { QueueItem, QueueItemStatus } from '@shared/types';

function makeItem(overrides: Partial<QueueItem> = {}): QueueItem {
  return {
    id: 'q1',
    url: 'https://www.youtube.com/watch?v=abc',
    title: 'Test Video',
    thumbnail: 'https://example.com/t.jpg',
    outputDir: '/tmp',
    formatId: '22',
    formatLabel: '720p · mp4',
    status: 'pending',
    progressPercent: 0,
    progressDetail: null,
    lastStatus: null,
    error: null,
    finishedAt: null,
    downloadJobId: null,
    ...overrides
  };
}

const actions = {
  startItemDownload: vi.fn(),
  cancelItemDownload: vi.fn(),
  pauseItemDownload: vi.fn(),
  resumeItemDownload: vi.fn(),
  removeQueueItem: vi.fn(),
  retryQueueItem: vi.fn(),
  openItemFolder: vi.fn(),
  openItemUrl: vi.fn()
};

beforeEach(() => {
  for (const fn of Object.values(actions)) fn.mockReset();
  useAppStore.setState(actions);
});

describe('QueueItemCard — base rendering', () => {
  it('renders title, format label, and thumbnail', () => {
    const { container } = render(<QueueItemCard item={makeItem({ title: 'Hello' })} />);
    expect(screen.getByTestId('queue-title')).toHaveTextContent('Hello');
    expect(screen.getByTestId('queue-meta')).toHaveTextContent('720p · mp4');
    expect(container.querySelector('img')).toHaveAttribute('src', 'https://example.com/t.jpg');
  });

  it('shows shimmer placeholder when no thumbnail', () => {
    const { container } = render(<QueueItemCard item={makeItem({ thumbnail: '' })} />);
    expect(container.querySelector('.thumb-shimmer')).toBeInTheDocument();
  });

  it.each<QueueItemStatus>([
    'pending', 'downloading', 'paused', 'done', 'error', 'cancelled'
  ])('sets data-status=%s on the wrapper', (status) => {
    render(<QueueItemCard item={makeItem({ status })} />);
    expect(screen.getByTestId('queue-card-q1')).toHaveAttribute('data-status', status);
  });
});

describe('QueueItemCard — progress display', () => {
  it('shows progress bar and percent when downloading', () => {
    render(<QueueItemCard item={makeItem({ status: 'downloading', progressPercent: 42.5, progressDetail: '1.2 MiB/s' })} />);
    expect(screen.getByTestId('queue-progress')).toBeInTheDocument();
    expect(screen.getByTestId('queue-progress-label')).toHaveTextContent('42.5%');
    expect(screen.getByTestId('queue-progress-label')).toHaveTextContent('1.2 MiB/s');
  });

  it('shows "Paused" suffix when paused', () => {
    render(<QueueItemCard item={makeItem({ status: 'paused', progressPercent: 50 })} />);
    expect(screen.getByTestId('queue-progress-label')).toHaveTextContent('Paused');
  });

  it('omits progress block when pending', () => {
    render(<QueueItemCard item={makeItem({ status: 'pending' })} />);
    expect(screen.queryByTestId('queue-progress')).not.toBeInTheDocument();
  });
});

describe('QueueItemCard — error state', () => {
  it('shows raw error message when status is error', () => {
    render(<QueueItemCard item={makeItem({ status: 'error', error: { key: null, rawMessage: 'oops' } })} />);
    expect(screen.getByTestId('queue-error-msg')).toHaveTextContent('oops');
  });

  it('falls back to "Download failed" when no error', () => {
    render(<QueueItemCard item={makeItem({ status: 'error', error: null })} />);
    expect(screen.getByTestId('queue-error-msg')).toHaveTextContent('Download failed');
  });
});

describe('QueueItemCard — done state', () => {
  it('shows finishedAt timestamp when status is done', () => {
    render(<QueueItemCard item={makeItem({ status: 'done', finishedAt: '2026-04-27T10:30:00Z' })} />);
    expect(screen.getByTestId('queue-meta')).toHaveTextContent(/Done/i);
  });
});

describe('QueueItemCard — action buttons', () => {
  it('open-url button always present and fires openItemUrl', () => {
    render(<QueueItemCard item={makeItem()} />);
    fireEvent.click(screen.getByTestId('btn-open-url'));
    expect(actions.openItemUrl).toHaveBeenCalledWith('q1');
  });

  it('pending → shows Download button which fires startItemDownload', () => {
    render(<QueueItemCard item={makeItem({ status: 'pending' })} />);
    fireEvent.click(screen.getByTestId('btn-start-download'));
    expect(actions.startItemDownload).toHaveBeenCalledWith('q1');
  });

  it('downloading → shows Pause + Cancel; pause fires pauseItemDownload', () => {
    render(<QueueItemCard item={makeItem({ status: 'downloading' })} />);
    fireEvent.click(screen.getByTestId('btn-pause'));
    expect(actions.pauseItemDownload).toHaveBeenCalledWith('q1');
    expect(screen.getByTestId('btn-cancel')).toBeInTheDocument();
  });

  it('paused → shows Resume; click fires resumeItemDownload', () => {
    render(<QueueItemCard item={makeItem({ status: 'paused' })} />);
    fireEvent.click(screen.getByTestId('btn-resume'));
    expect(actions.resumeItemDownload).toHaveBeenCalledWith('q1');
  });

  it('done → shows Open Folder; click fires openItemFolder', () => {
    render(<QueueItemCard item={makeItem({ status: 'done' })} />);
    fireEvent.click(screen.getByTestId('btn-open-folder'));
    expect(actions.openItemFolder).toHaveBeenCalledWith('q1');
  });

  it('error → shows Retry; click fires retryQueueItem', () => {
    render(<QueueItemCard item={makeItem({ status: 'error' })} />);
    fireEvent.click(screen.getByTestId('btn-retry'));
    expect(actions.retryQueueItem).toHaveBeenCalledWith('q1');
  });

  it('cancelled → shows Retry; click fires retryQueueItem', () => {
    render(<QueueItemCard item={makeItem({ status: 'cancelled' })} />);
    fireEvent.click(screen.getByTestId('btn-retry'));
    expect(actions.retryQueueItem).toHaveBeenCalledWith('q1');
  });

  it('non-active status → shows Remove (X); click fires removeQueueItem', () => {
    render(<QueueItemCard item={makeItem({ status: 'done' })} />);
    fireEvent.click(screen.getByTestId('btn-remove'));
    expect(actions.removeQueueItem).toHaveBeenCalledWith('q1');
  });

  it('downloading → Cancel button fires cancelItemDownload (not removeQueueItem)', () => {
    render(<QueueItemCard item={makeItem({ status: 'downloading' })} />);
    fireEvent.click(screen.getByTestId('btn-cancel'));
    expect(actions.cancelItemDownload).toHaveBeenCalledWith('q1');
    expect(actions.removeQueueItem).not.toHaveBeenCalled();
  });
});
