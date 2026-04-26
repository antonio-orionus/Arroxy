import type { JSX } from 'react';
import { ChevronDown } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { QueueItemCard } from './QueueItemCard';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

export function SmartDrawer(): JSX.Element {
  const queue = useAppStore((s) => s.queue);
  const drawerOpen = useAppStore((s) => s.drawerOpen);
  const setDrawerOpen = useAppStore((s) => s.setDrawerOpen);

  const activeItem = queue.find((i) => i.status === 'downloading');
  const totalCount = queue.length;

  const headerSummary = activeItem
    ? `${activeItem.progressPercent.toFixed(0)}%${activeItem.progressDetail ? ` · ${activeItem.progressDetail}` : ''}`
    : totalCount === 0
      ? 'No downloads yet.'
      : null;

  return (
    <section className="shrink-0 border-t border-border bg-background" data-testid="smart-drawer">
      <button
        type="button"
        onClick={() => setDrawerOpen(!drawerOpen)}
        className="w-full flex items-center justify-between px-4 h-9 hover:bg-accent transition-colors"
        data-testid="drawer-toggle"
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
        <span className={activeItem ? 'text-[var(--brand)]' : 'text-muted-foreground'}>
          <ChevronDown
            size={activeItem ? 14 : 12}
            strokeWidth={activeItem ? 2.5 : 2}
            className={`transition-all duration-300 ${drawerOpen ? '' : 'rotate-180'}`}
          />
        </span>
      </button>

      <div
        className="drawer-body"
        style={{ maxHeight: drawerOpen ? '16rem' : '0px' }}
        data-testid="drawer-body"
      >
        <ScrollArea className="max-h-64">
          <ul className="px-3 pb-3 flex flex-col gap-1.5">
            {queue.length === 0 ? (
              <li className="text-xs text-muted-foreground py-2">No downloads yet.</li>
            ) : (
              queue.map((item) => (
                <QueueItemCard key={item.id} item={item} compact />
              ))
            )}
          </ul>
        </ScrollArea>
      </div>
    </section>
  );
}
