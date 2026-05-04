import { useEffect, useState, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@renderer/lib/utils';
import downloadingImg from '../../assets/Downloading.png';

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

export function QueueTipNudge({ visible, onDismiss }: Props): JSX.Element | null {
  const { t } = useTranslation();
  const [rendered, setRendered] = useState(visible);
  const cls = visible ? 'nudge-in' : 'nudge-out';

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onDismiss, 5_000);
    return () => clearTimeout(t);
  }, [visible, onDismiss]);

  if (visible && !rendered) setRendered(true);
  if (!rendered) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-1 pointer-events-none z-10 flex justify-center px-4">
      <div
        className={cn(cls, 'flex items-end gap-2 pointer-events-auto')}
        onAnimationEnd={() => {
          if (!visible) setRendered(false);
        }}
      >
        <img src={downloadingImg} alt="" aria-hidden draggable={false} className="w-9 h-9 object-contain shrink-0" />
        <div className="relative bg-secondary border border-border rounded-xl px-3 py-2 text-xs text-foreground/80 leading-relaxed whitespace-nowrap shadow-lg">
          {t('queue.tip')}
          <span
            aria-hidden
            className="absolute -bottom-[6px] left-6 w-0 h-0"
            style={{
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid var(--secondary)'
            }}
          />
        </div>
      </div>
    </div>
  );
}
