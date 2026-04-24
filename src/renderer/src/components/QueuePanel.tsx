import type { JSX } from 'react';
import { useAppStore } from '../store/useAppStore';
import { QueueItemCard } from './QueueItemCard';

export function QueuePanel(): JSX.Element {
  const queue = useAppStore((s) => s.queue);

  return (
    <section className="px-6 pb-6 pt-5" data-testid="queue-panel">
      <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">
        Download Queue
      </h2>
      {queue.length === 0 ? (
        <p className="text-sm text-zinc-600 text-center py-5" data-testid="queue-empty">
          No videos queued yet. Add one above.
        </p>
      ) : (
        <ul className="flex flex-col gap-2" data-testid="queue-list">
          {queue.map((item) => (
            <li key={item.id}>
              <QueueItemCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
