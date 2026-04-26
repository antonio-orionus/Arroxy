import type { JSX } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
        ? <ChevronRight className="shrink-0 text-muted-foreground" size={18} />
        : <ChevronLeft className="shrink-0 text-muted-foreground" size={18} />}
      <div className="rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-muted-foreground leading-relaxed">
        {message}
      </div>
    </div>
  );
}
