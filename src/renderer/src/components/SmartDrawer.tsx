import type { JSX } from 'react';
import { CaretDown } from '@phosphor-icons/react';
import { useAppStore } from '../store/useAppStore';
import { QueueItemCard } from './QueueItemCard';

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
    <section className="shrink-0 border-t border-zinc-800 bg-zinc-950" data-testid="smart-drawer">
      <button
        type="button"
        onClick={() => setDrawerOpen(!drawerOpen)}
        className="w-full flex items-center justify-between px-4 h-9 hover:bg-zinc-900/50 transition-colors"
        data-testid="drawer-toggle"
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Download Queue
            {totalCount > 0 && (
              <span className="ml-1 text-zinc-600">({totalCount})</span>
            )}
          </span>
          {headerSummary && (
            <span className={`text-[10px] font-mono ${activeItem ? 'text-[var(--color-accent)]' : 'text-zinc-600'}`}>
              {headerSummary}
            </span>
          )}
        </div>
        <span className={activeItem ? 'text-[var(--color-accent)]' : 'text-zinc-600'}>
          <CaretDown
            size={activeItem ? 14 : 12}
            weight={activeItem ? 'bold' : 'regular'}
            className={`transition-all duration-300 ${drawerOpen ? '' : 'rotate-180'}`}
          />
        </span>
      </button>

      <div
        className="drawer-body"
        style={{ maxHeight: drawerOpen ? '16rem' : '0px' }}
        data-testid="drawer-body"
      >
        <ul className="px-3 pb-3 flex flex-col gap-1.5 max-h-64 overflow-y-auto">
          {queue.length === 0 ? (
            <li className="text-xs text-zinc-600 py-2">No downloads yet.</li>
          ) : (
            queue.map((item) => (
              <QueueItemCard key={item.id} item={item} compact />
            ))
          )}
        </ul>
      </div>
    </section>
  );
}
