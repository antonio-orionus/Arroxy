import type { JSX } from 'react';
import { useMemo } from 'react';
import { ChevronDown, Inbox, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore, formatStatus } from '../store/useAppStore';
import { QueueItemCard } from './QueueItemCard';
import { QueueTipNudge } from './QueueTipNudge';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

export function SmartDrawer(): JSX.Element {
  const { t } = useTranslation();
  const queue = useAppStore((s) => s.queue);
  const drawerOpen = useAppStore((s) => s.drawerOpen);
  const setDrawerOpen = useAppStore((s) => s.setDrawerOpen);
  const showQueueTip = useAppStore((s) => s.showQueueTip);
  const dismissQueueTip = useAppStore((s) => s.dismissQueueTip);
  const clearCompleted = useAppStore((s) => s.clearCompleted);

  const reversedQueue = useMemo(() => [...queue].reverse(), [queue]);
  const activeItems = queue.filter((i) => i.status === 'downloading');
  const activeCount = activeItems.length;
  const totalCount = queue.length;
  const hasCompleted = queue.some((i) => i.status === 'done' || i.status === 'cancelled');

  const aggregatePercent = activeCount > 0
    ? activeItems.reduce((sum, i) => sum + i.progressPercent, 0) / activeCount
    : 0;
  const headerProgress = activeCount === 1 ? activeItems[0].progressPercent : aggregatePercent;

  let headerSummary: string | null = null;
  if (activeCount === 1) {
    const item = activeItems[0];
    const detail = item.progressDetail ?? formatStatus(item.lastStatus);
    headerSummary = `${item.progressPercent.toFixed(0)}%${detail ? ` · ${detail}` : ''}`;
  } else if (activeCount >= 2) {
    headerSummary = t('queue.activeCount', {
      count: activeCount,
      percent: aggregatePercent.toFixed(0)
    });
  } else if (totalCount === 0) {
    headerSummary = t('queue.noDownloads');
  }

  return (
    <section className="relative shrink-0 border-t border-border bg-background" data-testid="smart-drawer">
      <QueueTipNudge visible={showQueueTip} onDismiss={dismissQueueTip} />
      <button
        type="button"
        onClick={() => setDrawerOpen(!drawerOpen)}
        className="relative overflow-hidden w-full flex items-center justify-between px-4 h-9 hover:bg-accent transition-colors"
        data-testid="drawer-toggle"
        title={t('queue.toggleTitle')}
      >
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground">
            {t('queue.header')}
            {totalCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-[9px] font-mono h-4 px-1">{totalCount}</Badge>
            )}
          </span>
          {headerSummary && (
            <span className={`text-[12px] font-mono ${activeCount > 0 ? 'text-[var(--brand)]' : 'text-muted-foreground'}`} data-testid="drawer-header-summary">
              {headerSummary}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {hasCompleted && (
            <button
              type="button"
              data-testid="btn-clear-completed"
              onClick={(e) => { e.stopPropagation(); clearCompleted(); }}
              className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5 rounded hover:bg-accent"
              title={t('queue.clearTitle')}
            >
              <Trash2 size={10} />
              {t('queue.clear')}
            </button>
          )}
          {totalCount > 0 && !drawerOpen && (
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] animate-pulse" aria-hidden />
          )}
          <span className={activeCount > 0 ? 'text-[var(--brand)]' : 'text-muted-foreground'}>
            <ChevronDown
              size={activeCount > 0 ? 14 : 12}
              strokeWidth={activeCount > 0 ? 2.5 : 2}
              className={`transition-all duration-300 ${drawerOpen ? '' : 'rotate-180'}`}
            />
          </span>
        </div>
        {activeCount > 0 && (
          <div
            aria-hidden
            data-testid="drawer-header-progress"
            className="absolute bottom-0 left-0 h-[2px] transition-[width] duration-500"
            style={{
              width: `${headerProgress}%`,
              background: 'linear-gradient(90deg, var(--brand), var(--brand-hover))',
              boxShadow: '0 0 8px var(--brand-glow)',
            }}
          />
        )}
      </button>

      <div
        className="drawer-body"
        style={{ maxHeight: drawerOpen ? '16rem' : '0px' }}
        data-testid="drawer-body"
      >
        <ScrollArea className="max-h-64">
          <ul className="px-3 pt-2 pb-3 flex flex-col gap-1.5">
            {queue.length === 0 ? (
              <li className="flex items-center gap-2 text-xs text-muted-foreground py-3">
                <Inbox size={16} className="shrink-0" />
                <span>{t('queue.empty')}</span>
              </li>
            ) : (
              reversedQueue.map((item) => (
                <QueueItemCard key={item.id} item={item} />
              ))
            )}
          </ul>
        </ScrollArea>
      </div>
    </section>
  );
}
