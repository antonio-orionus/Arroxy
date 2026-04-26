import { useState, type JSX } from 'react';
import { Copy, CopyCheck } from 'lucide-react';
import type { InstallChannel, UpdateAvailablePayload } from '@shared/types';

interface Props {
  info: UpdateAvailablePayload;
  installing: boolean;
  onInstall(): void;
  onDownload(): void;
  onDismiss(): void;
}

const RELEASES_URL = 'https://github.com/antonio-orionus/Arroxy/releases/latest';

export type Action =
  | { kind: 'install' }
  | { kind: 'download' }
  | { kind: 'command'; cmd: string };

export function resolveAction(channel: InstallChannel, platform: NodeJS.Platform): Action {
  if (channel === 'scoop') return { kind: 'command', cmd: 'scoop update arroxy' };
  if (channel === 'homebrew') return { kind: 'command', cmd: 'brew upgrade --cask arroxy' };
  if (channel === 'winget') return { kind: 'install' };
  return platform === 'darwin' ? { kind: 'download' } : { kind: 'install' };
}

export function UpdateBanner({ info, installing, onInstall, onDownload, onDismiss }: Props): JSX.Element {
  const action = resolveAction(info.installChannel, window.platform);
  const [copied, setCopied] = useState(false);

  async function handleCopy(cmd: string): Promise<void> {
    await navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2_000);
  }

  return (
    <div
      className="banner-slide-in shrink-0 flex items-center justify-between gap-3 px-4 h-9 border-b border-border"
      style={{ background: 'var(--brand-dim)' }}
      data-testid="update-banner"
    >
      <span className="text-[13px] text-foreground/80 truncate">
        <span className="font-semibold" style={{ color: 'var(--brand)' }}>Arroxy {info.version}</span>
        {' '}is available{' '}
        <span className="text-muted-foreground">— you have {info.currentVersion}</span>
      </span>

      <div className="flex items-center gap-2 shrink-0">
        {action.kind === 'install' && (
          <button
            type="button"
            onClick={onInstall}
            disabled={installing}
            className="flex items-center gap-1.5 text-[13px] font-medium px-2.5 py-1 rounded-md transition-colors disabled:opacity-60"
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
        )}

        {action.kind === 'download' && (
          <a
            href={RELEASES_URL}
            onClick={(e) => { e.preventDefault(); onDownload(); }}
            className="text-[13px] font-medium px-2.5 py-1 rounded-md transition-colors"
            style={{ background: 'var(--brand)', color: '#fff' }}
          >
            Download ↗
          </a>
        )}

        {action.kind === 'command' && (
          <>
            <code
              className="font-mono text-[12px] px-1.5 py-0.5 rounded bg-muted text-foreground"
              data-testid="update-command"
            >
              {action.cmd}
            </code>
            <button
              type="button"
              onClick={() => void handleCopy(action.cmd)}
              className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground/80 transition-colors"
              aria-label={copied ? 'Copied command to clipboard' : 'Copy command to clipboard'}
            >
              {copied ? <CopyCheck size={14} /> : <Copy size={14} />}
            </button>
          </>
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
