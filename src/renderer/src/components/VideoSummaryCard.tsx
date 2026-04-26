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
    <div className="flex items-start gap-3 p-2 rounded-xl border border-border bg-card/60 shrink-0">
      <div className="w-[88px] h-[50px] rounded-md overflow-hidden border border-border shrink-0 bg-secondary">
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
      <div className="flex flex-col gap-1 flex-1 min-w-0 py-0.5">
        <p className="text-sm font-semibold text-foreground leading-snug truncate">
          {title || 'Loading…'}
        </p>
        <p className="text-[11px] text-muted-foreground">{meta}</p>
      </div>
    </div>
  );
}
