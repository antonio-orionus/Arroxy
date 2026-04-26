import type { JSX } from 'react';
import type { UpdateAvailablePayload } from '@shared/types';

interface Props {
  info: UpdateAvailablePayload;
  installing: boolean;
  onInstall(): void;
  onDownload(): void;
  onDismiss(): void;
}

const RELEASES_URL = 'https://github.com/antonio-orionus/Arroxy/releases/latest';

export function UpdateBanner({ info, installing, onInstall, onDownload, onDismiss }: Props): JSX.Element {
  return (
    <div
      className="banner-slide-in shrink-0 flex items-center justify-between gap-3 px-4 h-9 border-b border-border"
      style={{ background: 'var(--brand-dim)' }}
      data-testid="update-banner"
    >
      <span className="text-[11px] text-foreground/80 truncate">
        <span className="font-semibold" style={{ color: 'var(--brand)' }}>Arroxy {info.version}</span>
        {' '}is available{' '}
        <span className="text-muted-foreground">— you have {info.currentVersion}</span>
      </span>

      <div className="flex items-center gap-2 shrink-0">
        {info.canAutoInstall ? (
          <button
            type="button"
            onClick={onInstall}
            disabled={installing}
            className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors disabled:opacity-60"
            style={{ background: 'var(--brand)', color: '#fff' }}
          >
            {installing && (
              <span
                className="inline-block w-3 h-3 rounded-full border border-white/30 border-t-white animate-spin"
                aria-hidden
              />
            )}
            {installing ? 'Downloading…' : 'Install & Restart'}
          </button>
        ) : (
          <a
            href={RELEASES_URL}
            onClick={(e) => { e.preventDefault(); onDownload(); }}
            className="text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors"
            style={{ background: 'var(--brand)', color: '#fff' }}
          >
            Download ↗
          </a>
        )}

        <button
          type="button"
          onClick={onDismiss}
          className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground/80 transition-colors text-base leading-none"
          aria-label="Dismiss update banner"
        >
          ×
        </button>
      </div>
    </div>
  );
}
