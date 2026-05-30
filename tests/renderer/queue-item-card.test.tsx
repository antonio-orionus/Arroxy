import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { QueueItemCard } from '@renderer/components/queue/QueueItemCard.js';
import { useAppStore } from '@renderer/store/useAppStore.js';
import type { QueueItem, QueueItemStatus } from '@shared/types.js';
import type { PreparedJob } from '@shared/preparedJob.js';

const DEFAULT_JOB: PreparedJob = {
  kind: 'single-format',
  extractor: 'youtube',
  extractorKey: 'Youtube',
  formatId: '22',
  preset: 'custom',
  sponsorBlock: { mode: 'off' },
  embed: { chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false }
};

function makeItem(overrides: Partial<QueueItem> = {}): QueueItem {
  return {
    id: 'q1',
    url: 'https://www.youtube.com/watch?v=abc',
    title: 'Test Video',
    thumbnail: 'https://example.com/t.jpg',
    outputDir: '/tmp',
    formatLabel: '720p · mp4',
    status: 'pending',
    lane: 'normal',
    progressPercent: 0,
    progressDetail: null,
    lastStatus: null,
    error: null,
    finishedAt: null,
    writeM3u: true,
    job: DEFAULT_JOB,
    ...overrides
  };
}

const actions = {
  cancelItemDownload: vi.fn(),
  pauseItemDownload: vi.fn(),
  resumeItemDownload: vi.fn(),
  removeQueueItem: vi.fn(),
  retryQueueItem: vi.fn(),
  openItemFolder: vi.fn(),
  openItemUrl: vi.fn(),
  setItemLane: vi.fn()
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

  it.each<QueueItemStatus>(['pending', 'running', 'paused-held', 'paused-active', 'done', 'error', 'cancelled'])('sets data-status=%s on the wrapper', (status) => {
    render(<QueueItemCard item={makeItem({ status })} />);
    expect(screen.getByTestId('queue-card-q1')).toHaveAttribute('data-status', status);
  });
});

describe('QueueItemCard — progress display', () => {
  it('shows progress bar and percent when running', () => {
    render(
      <QueueItemCard
        item={makeItem({
          status: 'running',
          lastJobId: 'job-1',
          progressPercent: 42.5,
          progressDetail: '1.2 MiB/s'
        })}
      />
    );
    expect(screen.getByTestId('queue-progress')).toBeInTheDocument();
    expect(screen.getByTestId('queue-progress-label')).toHaveTextContent('42.5%');
    expect(screen.getByTestId('queue-progress-label')).toHaveTextContent('1.2 MiB/s');
  });

  it('shows "Paused" suffix when paused-active', () => {
    render(<QueueItemCard item={makeItem({ status: 'paused-active', progressPercent: 50, lastJobId: 'job-1', tempDir: '/tmp/x' })} />);
    expect(screen.getByTestId('queue-progress-label')).toHaveTextContent('Paused');
  });

  it('omits progress block for paused-held (never spawned)', () => {
    render(<QueueItemCard item={makeItem({ status: 'paused-held', progressPercent: 0 })} />);
    expect(screen.queryByTestId('queue-progress')).not.toBeInTheDocument();
  });

  it('omits progress block when pending', () => {
    render(<QueueItemCard item={makeItem({ status: 'pending' })} />);
    expect(screen.queryByTestId('queue-progress')).not.toBeInTheDocument();
  });
});

describe('QueueItemCard — error state', () => {
  it('shows raw error message when status is error', () => {
    render(<QueueItemCard item={makeItem({ status: 'error', error: { kind: 'unknown', raw: 'oops' } })} />);
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

  it('pending → shows Hold button which fires pauseItemDownload', () => {
    render(<QueueItemCard item={makeItem({ status: 'pending' })} />);
    fireEvent.click(screen.getByTestId('btn-hold'));
    expect(actions.pauseItemDownload).toHaveBeenCalledWith('q1');
  });

  it('running → shows Pause + Cancel; pause fires pauseItemDownload', () => {
    render(<QueueItemCard item={makeItem({ status: 'running', lastJobId: 'job-1' })} />);
    fireEvent.click(screen.getByTestId('btn-pause'));
    expect(actions.pauseItemDownload).toHaveBeenCalledWith('q1');
    expect(screen.getByTestId('btn-cancel')).toBeInTheDocument();
  });

  it('paused-active → shows Resume; click fires resumeItemDownload', () => {
    render(<QueueItemCard item={makeItem({ status: 'paused-active', lastJobId: 'job-1' })} />);
    fireEvent.click(screen.getByTestId('btn-resume'));
    expect(actions.resumeItemDownload).toHaveBeenCalledWith('q1');
  });

  it('paused-held → shows Resume; click fires resumeItemDownload', () => {
    render(<QueueItemCard item={makeItem({ status: 'paused-held' })} />);
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

  it('running → Cancel button fires cancelItemDownload (not removeQueueItem)', () => {
    render(<QueueItemCard item={makeItem({ status: 'running', lastJobId: 'job-1' })} />);
    fireEvent.click(screen.getByTestId('btn-cancel'));
    expect(actions.cancelItemDownload).toHaveBeenCalledWith('q1');
    expect(actions.removeQueueItem).not.toHaveBeenCalled();
  });
});

describe('QueueItemCard — phase indicators', () => {
  it.each([
    ['downloadingMedia', 'lucide-download'],
    ['mergingFormats', 'lucide-layers'],
    ['fetchingSubtitles', 'lucide-captions'],
    ['sleepingBetweenRequests', 'lucide-hourglass']
  ])('renders phase icon for %s status', (statusKey, iconClass) => {
    const { container } = render(
      <QueueItemCard
        item={makeItem({
          status: 'running',
          lastJobId: 'job-1',
          progressPercent: 5,
          lastStatus: { key: statusKey as never, params: {} }
        })}
      />
    );
    expect(container.querySelector(`svg.${iconClass}`)).toBeInTheDocument();
  });

  it('uses paused color class on the progress label when sleeping', () => {
    render(
      <QueueItemCard
        item={makeItem({
          status: 'running',
          lastJobId: 'job-1',
          progressPercent: 50,
          lastStatus: { key: 'sleepingBetweenRequests', params: { seconds: 5 } }
        })}
      />
    );
    const label = screen.getByTestId('queue-progress-label');
    expect(label.className).toContain('color-status-paused');
  });

  it('uses brand color (no paused) when actively downloading', () => {
    render(
      <QueueItemCard
        item={makeItem({
          status: 'running',
          lastJobId: 'job-1',
          progressPercent: 50,
          lastStatus: { key: 'downloadingMedia', params: {} }
        })}
      />
    );
    const label = screen.getByTestId('queue-progress-label');
    expect(label.className).not.toContain('color-status-paused');
    expect(label.className).toContain('brand');
  });
});

describe('QueueItemCard — subtitlesFailed warning', () => {
  it('shows the warning row when status=done and lastStatus=subtitlesFailed', () => {
    render(
      <QueueItemCard
        item={makeItem({
          status: 'done',
          finishedAt: '2026-04-27T10:30:00Z',
          lastStatus: { key: 'subtitlesFailed', params: {} }
        })}
      />
    );
    expect(screen.getByTestId('queue-subs-warning')).toBeInTheDocument();
    expect(screen.getByTestId('queue-subs-warning')).toHaveTextContent(/subtitles/i);
  });

  it('does NOT show warning row when status=done and lastStatus=complete', () => {
    render(
      <QueueItemCard
        item={makeItem({
          status: 'done',
          finishedAt: '2026-04-27T10:30:00Z',
          lastStatus: { key: 'complete', params: {} }
        })}
      />
    );
    expect(screen.queryByTestId('queue-subs-warning')).not.toBeInTheDocument();
  });

  it('does NOT show warning row when status=running and lastStatus=subtitlesFailed', () => {
    render(
      <QueueItemCard
        item={makeItem({
          status: 'running',
          lastJobId: 'job-1',
          lastStatus: { key: 'subtitlesFailed', params: {} }
        })}
      />
    );
    expect(screen.queryByTestId('queue-subs-warning')).not.toBeInTheDocument();
  });
});
