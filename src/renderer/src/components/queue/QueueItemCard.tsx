import { memo, type JSX, type ReactNode } from 'react';
import { AlertTriangle, Ban, Captions, CheckCircle2, Clock, Download, ExternalLink, FastForward, Film, FolderInput, FolderOpen, Hourglass, Layers, Loader2, Music, Pause, PauseCircle, Play, RotateCcw, Shield, ShieldAlert, Tags, X, XCircle, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { QueueItem, QueueItemStatus, StatusKey } from '@shared/types.js';
import { useAppStore, formatStatus, formatLocalizedError } from '../../store/useAppStore.js';
import { Button } from '../ui/button.js';
import { Badge } from '../ui/badge.js';
import { Progress } from '../ui/progress.js';
import { TooltipIconButton } from '../ui/tooltip-icon-button.js';
import { cn } from '@renderer/lib/utils.js';

const PHASE_ICON: Partial<Record<StatusKey, ReactNode>> = {
  downloadingMedia: <Download size={11} />,
  mergingFormats: <Layers size={11} />,
  extractingAudio: <Music size={11} className="animate-pulse" />,
  convertingVideo: <Film size={11} className="animate-pulse" />,
  embeddingMetadata: <Tags size={11} className="animate-pulse" />,
  movingFiles: <FolderInput size={11} className="animate-pulse" />,
  fetchingSubtitles: <Captions size={11} />,
  sleepingBetweenRequests: <Hourglass size={11} className="animate-pulse" />,
  subtitlesFailed: <AlertTriangle size={11} />,
  fetchingSponsorBlock: <Shield size={11} className="animate-pulse" />,
  retryingSponsorBlock: <ShieldAlert size={11} />
};

interface Props {
  item: QueueItem;
}

const STATUS_BORDER: Record<QueueItemStatus, string> = {
  pending: 'border-border',
  running: 'border-s-2 border-s-[var(--brand)] shadow-[inset_3px_0_12px_var(--brand-glow)] rtl:shadow-[inset_-3px_0_12px_var(--brand-glow)]',
  'paused-held': 'border-border',
  'paused-active': 'border-s-2 border-s-[var(--color-status-paused)] shadow-[inset_3px_0_12px_var(--color-status-paused-glow)] rtl:shadow-[inset_-3px_0_12px_var(--color-status-paused-glow)]',
  done: 'border-s-2 border-s-[var(--color-status-done)] shadow-[inset_3px_0_12px_var(--color-status-done-glow)] rtl:shadow-[inset_-3px_0_12px_var(--color-status-done-glow)]',
  error: 'border-s-2 border-s-[var(--color-status-error)] shadow-[inset_3px_0_12px_var(--color-status-error-glow)] rtl:shadow-[inset_-3px_0_12px_var(--color-status-error-glow)]',
  cancelled: 'border-border'
};

// Yellow/orange tint for completed-with-subtitle-warning. Reuses existing paused tokens
// since both convey "completed but not perfect".
const SUBS_FAILED_BORDER = 'border-s-2 border-s-[var(--color-status-paused)] shadow-[inset_3px_0_12px_var(--color-status-paused-glow)] rtl:shadow-[inset_-3px_0_12px_var(--color-status-paused-glow)]';

// Status pill — small badge on the meta row that names the queue state. The
// progress bar already implies "running"; everything else gets an explicit
// label so the user never has to infer state from icon-only affordances.
const STATUS_PILL: Record<QueueItemStatus, { icon: ReactNode; i18nKey: 'queue.item.statusPending' | 'queue.item.statusRunning' | 'queue.item.statusHeld' | 'queue.item.statusPaused' | 'queue.item.statusDone' | 'queue.item.statusError' | 'queue.item.statusCancelled'; tone: string } | null> = {
  pending: { icon: <Clock size={10} />, i18nKey: 'queue.item.statusPending', tone: 'text-muted-foreground' },
  running: { icon: <Loader2 size={10} className="animate-spin" />, i18nKey: 'queue.item.statusRunning', tone: 'text-[var(--brand)]' },
  'paused-held': { icon: <PauseCircle size={10} />, i18nKey: 'queue.item.statusHeld', tone: 'text-[var(--color-status-paused)]' },
  'paused-active': { icon: <Pause size={10} />, i18nKey: 'queue.item.statusPaused', tone: 'text-[var(--color-status-paused)]' },
  done: { icon: <CheckCircle2 size={10} />, i18nKey: 'queue.item.statusDone', tone: 'text-[var(--color-status-done)]' },
  error: { icon: <XCircle size={10} />, i18nKey: 'queue.item.statusError', tone: 'text-[var(--color-status-error)]' },
  cancelled: { icon: <Ban size={10} />, i18nKey: 'queue.item.statusCancelled', tone: 'text-muted-foreground' }
};

function QueueItemCardImpl({ item }: Props): JSX.Element {
  const { t, i18n } = useTranslation();
  const cancelItemDownload = useAppStore((s) => s.cancelItemDownload);
  const pauseItemDownload = useAppStore((s) => s.pauseItemDownload);
  const resumeItemDownload = useAppStore((s) => s.resumeItemDownload);
  const removeQueueItem = useAppStore((s) => s.removeQueueItem);
  const retryQueueItem = useAppStore((s) => s.retryQueueItem);
  const openItemFolder = useAppStore((s) => s.openItemFolder);
  const openItemUrl = useAppStore((s) => s.openItemUrl);
  const setItemLane = useAppStore((s) => s.setItemLane);

  const { status } = item;
  const held = status === 'paused-held';
  // Held items (paused-from-pending) never spawned a job → no progress bar,
  // no Cancel button. They behave like queue-only entries.
  const isActive = status === 'running' || status === 'paused-active';
  const subsFailed = status === 'done' && item.lastStatus?.key === 'subtitlesFailed';

  const phaseStatusKey = item.lastStatus?.key;
  const phaseIcon = phaseStatusKey ? PHASE_ICON[phaseStatusKey] : null;
  const isSleeping = phaseStatusKey === 'sleepingBetweenRequests';
  // Postprocess phases emit no progress lines — bar would freeze at 100 with
  // no motion. Pulse the wrapper so the user sees the job is still working.
  const isPostProcessing = phaseStatusKey === 'extractingAudio' || phaseStatusKey === 'convertingVideo' || phaseStatusKey === 'embeddingMetadata' || phaseStatusKey === 'movingFiles';

  const detailText = item.progressDetail ?? formatStatus(item.lastStatus);
  const errorText = formatLocalizedError(item.error) || t('queue.item.defaultError');

  return (
    <div className={cn('flex items-start gap-2.5 py-2 px-2 rounded-md border bg-card/60 transition-[border-color,box-shadow]', subsFailed ? SUBS_FAILED_BORDER : STATUS_BORDER[status])} data-testid={`queue-card-${item.id}`} data-status={status}>
      <div className="shrink-0 w-12 h-[27px] rounded overflow-hidden bg-secondary mt-0.5">{item.thumbnail ? <img src={item.thumbnail} alt="" aria-hidden referrerPolicy="no-referrer" className="w-full h-full object-cover block" /> : <div className="thumb-shimmer w-full h-full" aria-hidden />}</div>

      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <p className="text-[13px] font-medium text-foreground truncate leading-snug" data-testid="queue-title">
          {item.title}
        </p>
        <p className="text-[12px] text-muted-foreground truncate flex items-center gap-1" data-testid="queue-meta">
          <Badge variant="secondary" className="text-[12px] font-normal">
            {item.formatLabel}
          </Badge>
          {(() => {
            const pill = STATUS_PILL[status];
            if (!pill) return null;
            return (
              <Badge variant="secondary" data-testid="queue-status-badge" className={cn('text-[10px] font-semibold uppercase tracking-wider gap-1', pill.tone)}>
                {pill.icon}
                {t(pill.i18nKey)}
              </Badge>
            );
          })()}
          {item.lane === 'priority' && (status === 'running' || status === 'pending') && (
            <Badge variant="secondary" data-testid="queue-priority-badge" className="text-[10px] font-semibold uppercase tracking-wider gap-1 text-[var(--brand)]">
              <Zap size={10} />
              {t('queue.item.priorityBadge')}
            </Badge>
          )}
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
            <div className={cn(status === 'paused-active' ? 'opacity-50' : isSleeping ? '' : 'progress-glow', isPostProcessing && 'animate-pulse')}>
              <Progress value={item.progressPercent} className="[&_[data-slot=progress-track]]:h-[2px]" />
            </div>
            <span className={cn('inline-flex items-center gap-1 font-mono text-[12px]', status === 'paused-active' || isSleeping ? 'text-[var(--color-status-paused)]' : 'text-[var(--brand)]')} data-testid="queue-progress-label">
              {phaseIcon && <span className="inline-flex shrink-0">{phaseIcon}</span>}
              <span>
                {item.progressPercent.toFixed(1)}%{status === 'paused-active' ? ` · ${t('queue.item.paused')}` : detailText ? ` · ${detailText}` : ''}
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
          // Single-line truncate to keep row height fixed for virtualization.
          // Full text still readable via tooltip (title attribute) and the
          // expanded item view.
          <p className="text-[12px] text-[var(--color-status-error)] mt-0.5 leading-snug truncate" title={errorText} data-testid="queue-error-msg">
            {errorText}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <TooltipIconButton icon={<ExternalLink size={12} />} label={t('queue.item.openUrl')} data-testid="btn-open-url" className="w-7 h-7 text-muted-foreground hover:text-foreground/80" onClick={() => openItemUrl(item.id)} />

        {status === 'pending' && item.lane === 'normal' && <TooltipIconButton icon={<FastForward size={12} />} label={t('queue.item.pullNow')} data-testid="btn-pull-now" className="w-7 h-7 text-[var(--brand)] hover:text-[var(--brand-hover)]" onClick={() => void setItemLane(item.id, 'priority')} />}

        {status === 'pending' && <TooltipIconButton icon={<Pause size={12} />} label={t('queue.item.hold')} data-testid="btn-hold" className="w-7 h-7" onClick={() => void pauseItemDownload(item.id)} />}

        {status === 'running' && <TooltipIconButton icon={<Pause size={12} />} label={t('queue.item.pause')} data-testid="btn-pause" className="w-7 h-7" onClick={() => void pauseItemDownload(item.id)} />}

        {(status === 'paused-active' || held) && <TooltipIconButton icon={<Play size={12} />} label={t('queue.item.resume')} data-testid="btn-resume" className="w-7 h-7" onClick={() => void resumeItemDownload(item.id)} />}

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

        {isActive && <TooltipIconButton icon={<X size={12} />} label={t('queue.item.cancel')} data-testid="btn-cancel" className="w-7 h-7 text-muted-foreground hover:text-[var(--color-status-error)]" onClick={() => void cancelItemDownload(item.id)} />}

        {!isActive && <TooltipIconButton icon={<X size={12} />} label={t('queue.item.remove')} data-testid="btn-remove" className="w-7 h-7 text-muted-foreground hover:text-[var(--color-status-error)]" onClick={() => void removeQueueItem(item.id)} />}
      </div>
    </div>
  );
}

// Memoized: parent re-renders every queue update (raf-batched progress ticks),
// but flushQueueUpdates preserves item refs for unchanged items, so memo skips
// cards whose item didn't change. Combined with per-action selectors above,
// each card only renders when its own data changes.
export const QueueItemCard = memo(QueueItemCardImpl);
