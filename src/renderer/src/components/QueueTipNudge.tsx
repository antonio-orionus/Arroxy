import { useEffect, useState, type JSX } from 'react';
import downloadingImg from '../assets/Downloading.png';

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

export function QueueTipNudge({ visible, onDismiss }: Props): JSX.Element | null {
  const [shown, setShown] = useState(false);
  const [cls, setCls] = useState('nudge-in');

  useEffect(() => {
    if (visible) {
      setCls('nudge-in');
      setShown(true);
      const t = setTimeout(onDismiss, 5_000);
      return () => clearTimeout(t);
    } else if (shown) {
      setCls('nudge-out');
      const t = setTimeout(() => setShown(false), 220);
      return () => clearTimeout(t);
    }
  // shown intentionally omitted — only re-run when visible flips
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!shown) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-1 pointer-events-none z-10 flex justify-center px-4">
      <div className={`${cls} flex items-end gap-2 pointer-events-auto`}>
        <img
          src={downloadingImg}
          alt=""
          aria-hidden
          draggable={false}
          className="w-9 h-9 object-contain shrink-0"
        />
        <div className="relative bg-secondary border border-border rounded-xl px-3 py-2 text-xs text-foreground/80 leading-relaxed whitespace-nowrap shadow-lg">
          Your download is queued below — open anytime to track progress.
          <span
            aria-hidden
            className="absolute -bottom-[6px] left-6 w-0 h-0"
            style={{
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid var(--secondary)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
