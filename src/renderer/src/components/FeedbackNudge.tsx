import { useEffect, useState, type JSX } from 'react';
import loveImg from '../assets/Love.png';

interface Props {
  visible: boolean;
  message: string;
}

export function FeedbackNudge({ visible, message }: Props): JSX.Element | null {
  const [shown, setShown] = useState(false);
  const [cls, setCls] = useState('nudge-in');

  useEffect(() => {
    if (visible) {
      setCls('nudge-in');
      setShown(true);
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
    <div
      className="absolute bottom-full right-0 mb-1.5 pointer-events-none"
      data-testid="feedback-nudge"
    >
      <div className={`${cls} flex items-end gap-2 pointer-events-auto`}>
        {/* Mascot */}
        <img
          src={loveImg}
          alt=""
          aria-hidden
          draggable={false}
          className="w-9 h-9 object-contain shrink-0"
        />
        {/* Speech bubble */}
        <div className="relative bg-secondary border border-border rounded-xl px-3 py-2 text-xs text-foreground/80 leading-relaxed whitespace-nowrap shadow-lg">
          {message}
          {/* Downward caret pointing toward the Feedback button */}
          <span
            aria-hidden
            className="absolute -bottom-[7px] right-3 w-0 h-0"
            style={{
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '7px solid var(--border)',
            }}
          />
          <span
            aria-hidden
            className="absolute -bottom-[5px] right-3 w-0 h-0"
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
