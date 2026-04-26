import type { JSX } from 'react';
import { ChevronDown, Inbox, Trash2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { QueueItemCard } from './QueueItemCard';
import { QueueTipNudge } from './QueueTipNudge';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

export function SmartDrawer(): JSX.Element {
  const queue = useAppStore((s) => s.queue);
  const drawerOpen = useAppStore((s) => s.drawerOpen);
  const setDrawerOpen = useAppStore((s) => s.setDrawerOpen);
  const showQueueTip = useAppStore((s) => s.showQueueTip);
  const dismissQueueTip = useAppStore((s) => s.dismissQueueTip);
  const clearCompleted = useAppStore((s) => s.clearCompleted);

  const activeItem = queue.find((i) => i.status === 'downloading');
  const totalCount = queue.length;
  const hasCompleted = queue.some((i) => i.status === 'done' || i.status === 'cancelled');

  const headerSummary = activeItem
    ? `${activeItem.progressPercent.toFixed(0)}%${activeItem.progressDetail ? ` · ${activeItem.progressDetail}` : ''}`
    : totalCount === 0
      ? 'No downloads yet.'
      : null;

  return (
    <section className="relative shrink-0 border-t border-border bg-background" data-testid="smart-drawer">
      <QueueTipNudge visible={showQueueTip} onDismiss={dismissQueueTip} />
      <button
        type="button"
        onClick={() => setDrawerOpen(!drawerOpen)}
        className="relative overflow-hidden w-full flex items-center justify-between px-4 h-9 hover:bg-accent transition-colors"
        data-testid="drawer-toggle"
        title="Toggle download queue"
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Download Queue
            {totalCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-[9px] font-mono h-4 px-1">{totalCount}</Badge>
            )}
          </span>
          {headerSummary && (
            <span className={`text-[10px] font-mono ${activeItem ? 'text-[var(--brand)]' : 'text-muted-foreground'}`}>
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
              className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5 rounded hover:bg-accent"
              title="Clear completed downloads"
            >
              <Trash2 size={10} />
              Clear
            </button>
          )}
          {totalCount > 0 && !drawerOpen && (
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] animate-pulse" aria-hidden />
          )}
          <span className={activeItem ? 'text-[var(--brand)]' : 'text-muted-foreground'}>
            <ChevronDown
              size={activeItem ? 14 : 12}
              strokeWidth={activeItem ? 2.5 : 2}
              className={`transition-all duration-300 ${drawerOpen ? '' : 'rotate-180'}`}
            />
          </span>
        </div>
        {activeItem && (
          <div
            aria-hidden
            className="absolute bottom-0 left-0 h-[2px] transition-[width] duration-500"
            style={{
              width: `${activeItem.progressPercent}%`,
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
                <span>Downloads you queue will appear here</span>
              </li>
            ) : (
              [...queue].reverse().map((item) => (
                <QueueItemCard key={item.id} item={item} compact />
              ))
            )}
          </ul>
        </ScrollArea>
      </div>
    </section>
  );
}
