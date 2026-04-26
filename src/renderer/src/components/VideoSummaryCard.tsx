import type { JSX } from 'react';

interface Props {
  thumbnail: string;
  title: string;
  duration?: number;
  resolution?: string;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function VideoSummaryCard({ thumbnail, title, duration, resolution }: Props): JSX.Element {
  const meta = [
    'youtube.com',
    duration !== undefined ? formatDuration(duration) : null,
    resolution ?? null,
  ].filter(Boolean).join(' · ');

  return (
    <div className="flex items-center gap-[10px] px-[12px] py-[9px] rounded-lg border border-border bg-secondary shrink-0">
      <div className="w-[66px] h-[42px] rounded-[5px] overflow-hidden border border-border flex-shrink-0 bg-accent">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt=""
            aria-hidden
            crossOrigin="anonymous"
            className="w-full h-full object-cover block"
          />
        ) : (
          <div className="thumb-shimmer w-full h-full" aria-hidden />
        )}
      </div>
      <div className="flex flex-col gap-[2px] flex-1 min-w-0">
        <p className="text-[12px] font-bold text-foreground leading-snug truncate">
          {title || 'Loading…'}
        </p>
        <p className="text-[10px] text-[var(--text-subtle)]">{meta}</p>
      </div>
    </div>
  );
}
