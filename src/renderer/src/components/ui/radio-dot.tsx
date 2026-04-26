import type { JSX } from 'react';
import { cn } from '@renderer/lib/utils';

export function RadioDot({ checked }: { checked: boolean }): JSX.Element {
  return (
    <div
      className={cn(
        'w-[13px] h-[13px] rounded-full border-2 flex-shrink-0 transition-colors',
        checked
          ? 'border-[var(--brand)] bg-[var(--brand)] shadow-[0_0_0_2px_var(--brand-dim)]'
          : 'border-[var(--border-strong)]'
      )}
    />
  );
}
