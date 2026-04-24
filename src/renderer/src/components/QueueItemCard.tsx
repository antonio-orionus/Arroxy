import type { JSX } from 'react';
import type { QueueItem } from '@shared/types';
import { useAppStore } from '../store/useAppStore';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { cn } from '@renderer/lib/utils';

interface Props {
  item: QueueItem;
}

const STATUS_BORDER: Record<QueueItem['status'], string> = {
  pending: 'border-zinc-800',
  downloading: 'border-l-2 border-l-[var(--color-accent)] shadow-[inset_3px_0_12px_rgba(0,232,200,0.05)]',
  paused: 'border-l-2 border-l-yellow-500 shadow-[inset_3px_0_12px_rgba(234,179,8,0.05)]',
  done: 'border-l-2 border-l-green-500 shadow-[inset_3px_0_12px_rgba(34,197,94,0.05)]',
  error: 'border-l-2 border-l-red-500 shadow-[inset_3px_0_12px_rgba(239,68,68,0.05)]',
  cancelled: 'border-zinc-800',
};

export function QueueItemCard({ item }: Props): JSX.Element {
  const {
    startItemDownload,
    cancelItemDownload,
    pauseItemDownload,
    resumeItemDownload,
    removeQueueItem,
    retryQueueItem,
    openItemFolder,
    openItemUrl
  } = useAppStore();

  const isDownloading = item.status === 'downloading';
  const isPaused = item.status === 'paused';
  const isDone = item.status === 'done';
  const isError = item.status === 'error';
  const isCancelled = item.status === 'cancelled';
  const isPending = item.status === 'pending';

  return (
    <div
      className={cn(
        'queue-card flex items-start gap-3 p-3 rounded-lg border border-zinc-800 bg-zinc-900 transition-[border-color,box-shadow]',
        STATUS_BORDER[item.status]
      )}
      data-testid={`queue-card-${item.id}`}
      data-status={item.status}
    >
      <div className="shrink-0 w-20 h-[45px] rounded overflow-hidden bg-zinc-800">
        {item.thumbnail ? (
          <img
            src={item.thumbnail}
            alt=""
            aria-hidden
            crossOrigin="anonymous"
            className="w-full h-full object-cover block"
            data-testid="queue-thumb"
          />
        ) : (
          <div className="thumb-shimmer w-full h-full" aria-hidden data-testid="queue-thumb-placeholder" />
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-1" data-testid="queue-card-body">
        <p
          className="text-xs font-medium text-zinc-100 truncate"
          title={item.title}
          data-testid="queue-title"
        >
          {item.title}
        </p>
        <p className="text-[11px] text-zinc-500" data-testid="queue-meta">
          {item.formatLabel}
          {isDone && item.finishedAt && (
            <span className="text-zinc-600"> · Done {new Date(item.finishedAt).toLocaleTimeString()}</span>
          )}
        </p>

        {(isDownloading || isPaused) && (
          <div className="flex flex-col gap-1 mt-1" data-testid="queue-progress">
            <div className={isPaused ? 'opacity-50' : 'progress-glow'}>
              <Progress value={item.progressPercent} />
            </div>
            <span
              className={cn(
                'font-mono text-[11px]',
                isPaused ? 'text-yellow-500' : 'text-[var(--color-accent)]'
              )}
              data-testid="queue-progress-label"
            >
              {item.progressPercent.toFixed(1)}%
              {isPaused ? ' · Paused' : item.progressDetail ? ` · ${item.progressDetail}` : ''}
            </span>
          </div>
        )}

        {isError && (
          <p className="text-[11px] text-red-400 mt-1" data-testid="queue-error-msg">
            {item.errorMessage ?? 'Download failed'}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0" data-testid="queue-card-actions">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          title="Open URL"
          onClick={() => openItemUrl(item.id)}
          aria-label="Open in browser"
          data-testid="btn-open-url"
          className="text-base"
        >
          ↗
        </Button>

        {isPending && (
          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={() => void startItemDownload(item.id)}
            data-testid="btn-start-download"
          >
            Download
          </Button>
        )}

        {isDownloading && (
          <Button
            variant="secondary"
            size="icon"
            type="button"
            title="Pause"
            onClick={() => void pauseItemDownload(item.id)}
            aria-label="Pause download"
            data-testid="btn-pause"
            className="text-base"
          >
            ⏸
          </Button>
        )}

        {isPaused && (
          <Button
            variant="secondary"
            size="icon"
            type="button"
            title="Resume"
            onClick={() => void resumeItemDownload(item.id)}
            aria-label="Resume download"
            data-testid="btn-resume"
            className="text-base"
          >
            ▶
          </Button>
        )}

        {isDone && (
          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={() => void openItemFolder(item.id)}
            data-testid="btn-open-folder"
          >
            Open folder
          </Button>
        )}

        {(isError || isCancelled) && (
          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={() => void retryQueueItem(item.id)}
            data-testid="btn-retry"
          >
            Retry
          </Button>
        )}

        {(isDownloading || isPaused) && (
          <Button
            variant="ghost"
            size="icon"
            type="button"
            title="Cancel download"
            onClick={() => void cancelItemDownload(item.id)}
            aria-label="Cancel download"
            data-testid="btn-cancel"
            className="text-base text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
          >
            ✕
          </Button>
        )}

        {!(isDownloading || isPaused) && (
          <Button
            variant="ghost"
            size="icon"
            type="button"
            title="Remove from queue"
            onClick={() => removeQueueItem(item.id)}
            aria-label="Remove from queue"
            data-testid="btn-remove"
            className="text-base text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
          >
            ✕
          </Button>
        )}
      </div>
    </div>
  );
}
