import type { JSX } from 'react';
import { ExternalLink, FolderOpen, Pause, Play, RotateCcw, X } from 'lucide-react';
import type { QueueItem } from '@shared/types';
import { useAppStore } from '../store/useAppStore';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { cn } from '@renderer/lib/utils';
import finishedImg from '../assets/Finished.png';

interface Props {
  item: QueueItem;
  compact?: boolean;
}

const STATUS_BORDER: Record<QueueItem['status'], string> = {
  pending: 'border-border',
  downloading: 'border-l-2 border-l-[var(--brand)] shadow-[inset_3px_0_12px_var(--brand-glow)]',
  paused: 'border-l-2 border-l-[var(--color-status-paused)] shadow-[inset_3px_0_12px_var(--color-status-paused-glow)]',
  done: 'border-l-2 border-l-[var(--color-status-done)] shadow-[inset_3px_0_12px_var(--color-status-done-glow)]',
  error: 'border-l-2 border-l-[var(--color-status-error)] shadow-[inset_3px_0_12px_var(--color-status-error-glow)]',
  cancelled: 'border-border',
};

export function QueueItemCard({ item, compact = false }: Props): JSX.Element {
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

  if (compact) {
    return (
      <li
        className={cn(
          'flex items-start gap-2.5 py-2 px-2 rounded-md border bg-card/60 transition-[border-color,box-shadow]',
          STATUS_BORDER[item.status]
        )}
        data-testid={`queue-card-${item.id}`}
        data-status={item.status}
      >
        {/* Thumbnail */}
        <div className="shrink-0 w-12 h-[27px] rounded overflow-hidden bg-secondary mt-0.5">
          {item.thumbnail ? (
            <img
              src={item.thumbnail}
              alt=""
              aria-hidden
              crossOrigin="anonymous"
              className="w-full h-full object-cover block"
            />
          ) : (
            <div className="thumb-shimmer w-full h-full" aria-hidden />
          )}
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <p className="text-[11px] font-medium text-foreground truncate leading-snug" data-testid="queue-title">
            {item.title}
          </p>
          <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1" data-testid="queue-meta">
            <Badge variant="secondary" className="text-[10px] font-normal">{item.formatLabel}</Badge>
            {isDone && item.finishedAt && (
              <span className="text-muted-foreground">· Done {new Date(item.finishedAt).toLocaleTimeString()}</span>
            )}
          </p>

          {(isDownloading || isPaused) && (
            <div className="flex flex-col gap-0.5 mt-0.5" data-testid="queue-progress">
              <div className={isPaused ? 'opacity-50' : 'progress-glow'}>
                <Progress value={item.progressPercent} className="[&_[data-slot=progress-track]]:h-[2px]" />
              </div>
              <span
                className={cn(
                  'font-mono text-[10px]',
                  isPaused ? 'text-[var(--color-status-paused)]' : 'text-[var(--brand)]'
                )}
                data-testid="queue-progress-label"
              >
                {item.progressPercent.toFixed(1)}%
                {isPaused ? ' · Paused' : item.progressDetail ? ` · ${item.progressDetail}` : ''}
              </span>
            </div>
          )}

          {isError && (
            <p className="text-[10px] text-[var(--color-status-error)] mt-0.5 truncate" data-testid="queue-error-msg">
              {item.errorMessage ?? 'Download failed'}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <Tooltip>
            <TooltipTrigger render={(props) => (
              <Button {...props} variant="ghost" size="icon" type="button" aria-label="Open in browser" data-testid="btn-open-url" className="w-7 h-7 text-muted-foreground hover:text-foreground/80" onClick={() => openItemUrl(item.id)}>
                <ExternalLink size={12} />
              </Button>
            )} />
            <TooltipContent>Open URL</TooltipContent>
          </Tooltip>

          {isPending && (
            <Button variant="ghost" size="icon" type="button"
              onClick={() => void startItemDownload(item.id)}
              data-testid="btn-start-download"
              className="w-7 h-7"
            >
              <Play size={12} />
            </Button>
          )}

          {isDownloading && (
            <Tooltip>
              <TooltipTrigger render={(props) => (
                <Button {...props} variant="ghost" size="icon" type="button" aria-label="Pause download" data-testid="btn-pause" className="w-7 h-7" onClick={() => void pauseItemDownload(item.id)}>
                  <Pause size={12} />
                </Button>
              )} />
              <TooltipContent>Pause</TooltipContent>
            </Tooltip>
          )}

          {isPaused && (
            <Tooltip>
              <TooltipTrigger render={(props) => (
                <Button {...props} variant="ghost" size="icon" type="button" aria-label="Resume download" data-testid="btn-resume" className="w-7 h-7" onClick={() => void resumeItemDownload(item.id)}>
                  <Play size={12} />
                </Button>
              )} />
              <TooltipContent>Resume</TooltipContent>
            </Tooltip>
          )}

          {isDone && (
            <Button variant="ghost" size="icon" type="button"
              onClick={() => void openItemFolder(item.id)}
              data-testid="btn-open-folder"
              className="w-7 h-7 text-[var(--color-status-done)]"
            >
              <FolderOpen size={12} />
            </Button>
          )}

          {(isError || isCancelled) && (
            <Button variant="ghost" size="icon" type="button"
              onClick={() => void retryQueueItem(item.id)}
              data-testid="btn-retry"
              className="w-7 h-7"
            >
              <RotateCcw size={12} />
            </Button>
          )}

          {(isDownloading || isPaused) && (
            <Tooltip>
              <TooltipTrigger render={(props) => (
                <Button {...props} variant="ghost" size="icon" type="button" aria-label="Cancel download" data-testid="btn-cancel" className="w-7 h-7 text-muted-foreground hover:text-[var(--color-status-error)]" onClick={() => void cancelItemDownload(item.id)}>
                  <X size={12} />
                </Button>
              )} />
              <TooltipContent>Cancel</TooltipContent>
            </Tooltip>
          )}

          {!(isDownloading || isPaused) && (
            <Tooltip>
              <TooltipTrigger render={(props) => (
                <Button {...props} variant="ghost" size="icon" type="button" aria-label="Remove from queue" data-testid="btn-remove" className="w-7 h-7 text-muted-foreground hover:text-[var(--color-status-error)]" onClick={() => removeQueueItem(item.id)}>
                  <X size={12} />
                </Button>
              )} />
              <TooltipContent>Remove</TooltipContent>
            </Tooltip>
          )}
        </div>
      </li>
    );
  }

  return (
    <div
      className={cn(
        'queue-card flex items-start gap-3 p-3 rounded-lg border border-border bg-card transition-[border-color,box-shadow]',
        STATUS_BORDER[item.status]
      )}
      data-testid={`queue-card-${item.id}`}
      data-status={item.status}
    >
      <div className="shrink-0 w-20 h-[45px] rounded overflow-hidden bg-secondary">
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
          className="text-xs font-medium text-foreground truncate"
          title={item.title}
          data-testid="queue-title"
        >
          {item.title}
        </p>
        <p className="text-[11px] text-muted-foreground flex items-center gap-1" data-testid="queue-meta">
          <Badge variant="secondary" className="text-[10px] font-normal">{item.formatLabel}</Badge>
          {isDone && item.finishedAt && (
            <span className="text-muted-foreground">· Done {new Date(item.finishedAt).toLocaleTimeString()}</span>
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
                isPaused ? 'text-[var(--color-status-paused)]' : 'text-[var(--brand)]'
              )}
              data-testid="queue-progress-label"
            >
              {item.progressPercent.toFixed(1)}%
              {isPaused ? ' · Paused' : item.progressDetail ? ` · ${item.progressDetail}` : ''}
            </span>
          </div>
        )}

        {isError && (
          <p className="text-[11px] text-[var(--color-status-error)] mt-1" data-testid="queue-error-msg">
            {item.errorMessage ?? 'Download failed'}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0" data-testid="queue-card-actions">
        <Tooltip>
          <TooltipTrigger render={(props) => (
            <Button {...props} variant="ghost" size="icon" type="button" aria-label="Open in browser" data-testid="btn-open-url" onClick={() => openItemUrl(item.id)}>
              <ExternalLink size={16} />
            </Button>
          )} />
          <TooltipContent>Open URL</TooltipContent>
        </Tooltip>

        {isPending && (
          <Button variant="secondary" size="sm" type="button" onClick={() => void startItemDownload(item.id)} data-testid="btn-start-download">
            Download
          </Button>
        )}

        {isDownloading && (
          <Tooltip>
            <TooltipTrigger render={(props) => (
              <Button {...props} variant="secondary" size="icon" type="button" aria-label="Pause download" data-testid="btn-pause" onClick={() => void pauseItemDownload(item.id)}>
                <Pause size={16} />
              </Button>
            )} />
            <TooltipContent>Pause</TooltipContent>
          </Tooltip>
        )}

        {isPaused && (
          <Tooltip>
            <TooltipTrigger render={(props) => (
              <Button {...props} variant="secondary" size="icon" type="button" aria-label="Resume download" data-testid="btn-resume" onClick={() => void resumeItemDownload(item.id)}>
                <Play size={16} />
              </Button>
            )} />
            <TooltipContent>Resume</TooltipContent>
          </Tooltip>
        )}

        {isDone && (
          <>
            <img src={finishedImg} alt="" aria-hidden className="w-8 h-8 object-contain shrink-0" />
            <Button variant="secondary" size="sm" type="button" onClick={() => void openItemFolder(item.id)} data-testid="btn-open-folder">
              Open folder
            </Button>
          </>
        )}

        {(isError || isCancelled) && (
          <Button variant="secondary" size="sm" type="button" onClick={() => void retryQueueItem(item.id)} data-testid="btn-retry">
            Retry
          </Button>
        )}

        {(isDownloading || isPaused) && (
          <Tooltip>
            <TooltipTrigger render={(props) => (
              <Button {...props} variant="ghost" size="icon" type="button" aria-label="Cancel download" data-testid="btn-cancel" className="text-muted-foreground hover:text-[var(--color-status-error)] hover:bg-[var(--color-status-error)]/10" onClick={() => void cancelItemDownload(item.id)}>
                <X size={16} />
              </Button>
            )} />
            <TooltipContent>Cancel</TooltipContent>
          </Tooltip>
        )}

        {!(isDownloading || isPaused) && (
          <Tooltip>
            <TooltipTrigger render={(props) => (
              <Button {...props} variant="ghost" size="icon" type="button" aria-label="Remove from queue" data-testid="btn-remove" className="text-muted-foreground hover:text-[var(--color-status-error)] hover:bg-[var(--color-status-error)]/10" onClick={() => removeQueueItem(item.id)}>
                <X size={16} />
              </Button>
            )} />
            <TooltipContent>Remove</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
