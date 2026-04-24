import type { JSX } from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { cn } from '@renderer/lib/utils';

interface Props {
  image: string;
  message: string;
  side?: 'left' | 'right';
  className?: string;
}

export function MascotBubble({ image, message, side = 'left', className }: Props): JSX.Element {
  const isRight = side === 'right';

  return (
    <div className={cn('flex items-center gap-2', isRight && 'flex-row-reverse', className)}>
      <img
        src={image}
        alt=""
        aria-hidden
        className="w-16 h-16 object-contain shrink-0"
      />
      {isRight
        ? <CaretRight className="shrink-0 text-zinc-600" size={18} />
        : <CaretLeft className="shrink-0 text-zinc-600" size={18} />}
      <div className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-400 leading-relaxed">
        {message}
      </div>
    </div>
  );
}
