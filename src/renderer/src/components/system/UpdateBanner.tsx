import { useState, type JSX } from 'react';
import { Copy, CopyCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { UpdateAvailablePayload } from '@shared/types';
import { resolveAction } from './updateBannerAction';

interface Props {
  info: UpdateAvailablePayload;
  installing: boolean;
  installError: string | null;
  onInstall(): void;
  onDownload(): void;
  onDismiss(): void;
}

const RELEASES_URL = 'https://github.com/antonio-orionus/Arroxy/releases/latest';

export function UpdateBanner({ info, installing, installError, onInstall, onDownload, onDismiss }: Props): JSX.Element {
  const { t } = useTranslation();
  const action = resolveAction(info.installChannel, window.platform);
  const [copied, setCopied] = useState(false);

  async function handleCopy(cmd: string): Promise<void> {
    await navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2_000);
  }

  return (
    <div className="banner-slide-in shrink-0 flex items-center justify-between gap-3 px-4 h-9 border-b border-border" style={{ background: 'var(--brand-dim)' }} data-testid="update-banner">
      <span className="text-[13px] text-foreground/80 truncate" data-testid="update-banner-message">
        {installError ? (
          <span className="text-destructive font-medium">
            {t('update.installFailed')}: {installError}
          </span>
        ) : (
          <>
            <span className="font-semibold" style={{ color: 'var(--brand)' }}>
              {t('update.appVersion', { version: info.version })}
            </span>{' '}
            {t('update.isAvailable')} <span className="text-muted-foreground">{t('update.youHave', { currentVersion: info.currentVersion })}</span>
          </>
        )}
      </span>

      <div className="flex items-center gap-2 shrink-0">
        {action.kind === 'install' && (
          <button type="button" onClick={onInstall} disabled={installing} className="flex items-center gap-1.5 text-[13px] font-medium px-2.5 py-1 rounded-md transition-colors disabled:opacity-60" style={{ background: 'var(--brand)', color: '#fff' }}>
            {installing && <span className="inline-block w-3 h-3 rounded-full border border-white/30 border-t-white animate-spin" aria-hidden />}
            {installing ? t('update.downloading') : installError ? t('update.retry') : t('update.install')}
          </button>
        )}

        {action.kind === 'download' && (
          <a
            href={RELEASES_URL}
            onClick={(e) => {
              e.preventDefault();
              onDownload();
            }}
            className="text-[13px] font-medium px-2.5 py-1 rounded-md transition-colors"
            style={{ background: 'var(--brand)', color: '#fff' }}
          >
            {t('update.download')}
          </a>
        )}

        {action.kind === 'command' && (
          <>
            <code className="font-mono text-[12px] px-1.5 py-0.5 rounded bg-muted text-foreground" data-testid="update-command">
              {action.cmd}
            </code>
            <button type="button" onClick={() => void handleCopy(action.cmd)} className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground/80 transition-colors" aria-label={copied ? t('update.copied') : t('update.copy')}>
              {copied ? <CopyCheck size={14} /> : <Copy size={14} />}
            </button>
          </>
        )}

        <button type="button" onClick={onDismiss} className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground/80 transition-colors text-base leading-none" aria-label={t('update.dismiss')}>
          ×
        </button>
      </div>
    </div>
  );
}
