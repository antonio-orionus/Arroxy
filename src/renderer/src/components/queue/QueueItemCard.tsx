import type { JSX, ReactNode } from 'react';
import { AlertTriangle, Captions, Download, ExternalLink, FolderOpen, Hourglass, Layers, Pause, Play, RotateCcw, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { QueueItem, QueueItemStatus, StatusKey } from '@shared/types';
import { useAppStore, formatStatus, formatLocalizedError } from '../../store/useAppStore';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { TooltipIconButton } from '../ui/tooltip-icon-button';
import { cn } from '@renderer/lib/utils';

const PHASE_ICON: Partial<Record<StatusKey, ReactNode>> = {
  downloadingMedia: <Download size={11} />,
  mergingFormats: <Layers size={11} />,
  fetchingSubtitles: <Captions size={11} />,
  sleepingBetweenRequests: <Hourglass size={11} className="animate-pulse" />,
  subtitlesFailed: <AlertTriangle size={11} />
};

interface Props {
  item: QueueItem;
}

const STATUS_BORDER: Record<QueueItemStatus, string> = {
  pending: 'border-border',
  downloading: 'border-l-2 border-l-[var(--brand)] shadow-[inset_3px_0_12px_var(--brand-glow)]',
  paused: 'border-l-2 border-l-[var(--color-status-paused)] shadow-[inset_3px_0_12px_var(--color-status-paused-glow)]',
  done: 'border-l-2 border-l-[var(--color-status-done)] shadow-[inset_3px_0_12px_var(--color-status-done-glow)]',
  error: 'border-l-2 border-l-[var(--color-status-error)] shadow-[inset_3px_0_12px_var(--color-status-error-glow)]',
  cancelled: 'border-border'
};

// Yellow/orange tint for completed-with-subtitle-warning. Reuses existing paused tokens
// since both convey "completed but not perfect".
const SUBS_FAILED_BORDER = 'border-l-2 border-l-[var(--color-status-paused)] shadow-[inset_3px_0_12px_var(--color-status-paused-glow)]';

export function QueueItemCard({ item }: Props): JSX.Element {
  const { t, i18n } = useTranslation();
  const { startItemDownload, cancelItemDownload, pauseItemDownload, resumeItemDownload, removeQueueItem, retryQueueItem, openItemFolder, openItemUrl } = useAppStore();

  const { status } = item;
  const isActive = status === 'downloading' || status === 'paused';
  const subsFailed = status === 'done' && item.lastStatus?.key === 'subtitlesFailed';

  const phaseStatusKey = item.lastStatus?.key;
  const phaseIcon = phaseStatusKey ? PHASE_ICON[phaseStatusKey] : null;
  const isSleeping = phaseStatusKey === 'sleepingBetweenRequests';

  const detailText = item.progressDetail ?? formatStatus(item.lastStatus);
  const errorText = formatLocalizedError(item.error) || t('queue.item.defaultError');

  return (
    <li className={cn('flex items-start gap-2.5 py-2 px-2 rounded-md border bg-card/60 transition-[border-color,box-shadow]', subsFailed ? SUBS_FAILED_BORDER : STATUS_BORDER[status])} data-testid={`queue-card-${item.id}`} data-status={status}>
      <div className="shrink-0 w-12 h-[27px] rounded overflow-hidden bg-secondary mt-0.5">{item.thumbnail ? <img src={item.thumbnail} alt="" aria-hidden crossOrigin="anonymous" className="w-full h-full object-cover block" /> : <div className="thumb-shimmer w-full h-full" aria-hidden />}</div>

      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <p className="text-[13px] font-medium text-foreground truncate leading-snug" data-testid="queue-title">
          {item.title}
        </p>
        <p className="text-[12px] text-muted-foreground truncate flex items-center gap-1" data-testid="queue-meta">
          <Badge variant="secondary" className="text-[12px] font-normal">
            {item.formatLabel}
          </Badge>
          {status === 'done' && item.finishedAt && (
            <span className="text-muted-foreground">
              ·{' '}
              {t('queue.item.doneAt', {
                time: new Date(item.finishedAt).toLocaleTimeString(i18n.language)
              })}
            </span>
          )}
        </p>

        {isActive && (
          <div className="flex flex-col gap-0.5 mt-0.5" data-testid="queue-progress">
            <div className={status === 'paused' ? 'opacity-50' : isSleeping ? '' : 'progress-glow'}>
              <Progress value={item.progressPercent} className="[&_[data-slot=progress-track]]:h-[2px]" />
            </div>
            <span className={cn('inline-flex items-center gap-1 font-mono text-[12px]', status === 'paused' || isSleeping ? 'text-[var(--color-status-paused)]' : 'text-[var(--brand)]')} data-testid="queue-progress-label">
              {phaseIcon && <span className="inline-flex shrink-0">{phaseIcon}</span>}
              <span>
                {item.progressPercent.toFixed(1)}%{status === 'paused' ? ` · ${t('queue.item.paused')}` : detailText ? ` · ${detailText}` : ''}
              </span>
            </span>
          </div>
        )}

        {subsFailed && (
          <p className="text-[12px] text-[var(--color-status-paused)] mt-0.5 truncate inline-flex items-center gap-1" data-testid="queue-subs-warning">
            <AlertTriangle size={11} className="shrink-0" />
            {formatStatus(item.lastStatus)}
          </p>
        )}

        {status === 'error' && (
          <p className="text-[12px] text-[var(--color-status-error)] mt-0.5 leading-snug" data-testid="queue-error-msg">
            {errorText}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <TooltipIconButton icon={<ExternalLink size={12} />} label={t('queue.item.openUrl')} data-testid="btn-open-url" className="w-7 h-7 text-muted-foreground hover:text-foreground/80" onClick={() => openItemUrl(item.id)} />

        {status === 'pending' && (
          <Button variant="ghost" size="icon" type="button" onClick={() => void startItemDownload(item.id)} data-testid="btn-start-download" className="w-7 h-7">
            <Play size={12} />
          </Button>
        )}

        {status === 'downloading' && <TooltipIconButton icon={<Pause size={12} />} label={t('queue.item.pause')} data-testid="btn-pause" className="w-7 h-7" onClick={() => void pauseItemDownload(item.id)} />}

        {status === 'paused' && <TooltipIconButton icon={<Play size={12} />} label={t('queue.item.resume')} data-testid="btn-resume" className="w-7 h-7" onClick={() => void resumeItemDownload(item.id)} />}

        {status === 'done' && (
          <Button variant="ghost" size="icon" type="button" onClick={() => void openItemFolder(item.id)} data-testid="btn-open-folder" className="w-7 h-7 text-[var(--color-status-done)]">
            <FolderOpen size={12} />
          </Button>
        )}

        {(status === 'error' || status === 'cancelled') && (
          <Button variant="ghost" size="icon" type="button" onClick={() => void retryQueueItem(item.id)} data-testid="btn-retry" className="w-7 h-7">
            <RotateCcw size={12} />
          </Button>
        )}

        {isActive ? <TooltipIconButton icon={<X size={12} />} label={t('queue.item.cancel')} data-testid="btn-cancel" className="w-7 h-7 text-muted-foreground hover:text-[var(--color-status-error)]" onClick={() => void cancelItemDownload(item.id)} /> : <TooltipIconButton icon={<X size={12} />} label={t('queue.item.remove')} data-testid="btn-remove" className="w-7 h-7 text-muted-foreground hover:text-[var(--color-status-error)]" onClick={() => removeQueueItem(item.id)} />}
      </div>
    </li>
  );
}
