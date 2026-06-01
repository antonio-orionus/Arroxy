import { useState, useEffect, useMemo, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import mainImg from '../../assets/Main.png';
import type { DependencyDiagnostic, DependencyId, WarmupProgressEvent } from '@shared/types.js';
import { RepairPanel } from './RepairPanel.js';

interface Props {
  initialized: boolean;
  warmupBlocking: DependencyId[];
  warmupDiagnostics: Record<DependencyId, DependencyDiagnostic> | null;
  warmupProgress: Partial<Record<DependencyId, WarmupProgressEvent>> | null;
  showGreeting: boolean;
  onDismissed?: () => void;
}

const MIN_MS = 3000;

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SplashScreen({ initialized, warmupBlocking, warmupDiagnostics, warmupProgress, showGreeting, onDismissed }: Props): JSX.Element | null {
  const { t } = useTranslation();
  const [minPassed, setMinPassed] = useState(false);
  const [gone, setGone] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setMinPassed(true), MIN_MS);
    return () => clearTimeout(timer);
  }, []);

  const { activeEntry, totalDownloaded, totalBytes, percent } = useMemo(() => {
    const entries = Object.values(warmupProgress ?? {}).filter((e): e is WarmupProgressEvent => e !== undefined);
    const activeEntry = entries.find((e) => e.phase === 'downloading') ?? entries.find((e) => e.phase === 'extracting');
    const totalDownloaded = entries.reduce((sum, e) => sum + (e.bytesDownloaded ?? 0), 0);
    const totalBytes = entries.reduce((sum, e) => sum + (e.totalBytes ?? 0), 0);
    const percent = totalBytes > 0 ? Math.min(100, (totalDownloaded / totalBytes) * 100) : null;
    return { activeEntry, totalDownloaded, totalBytes, percent };
  }, [warmupProgress]);

  if (gone) return null;

  // Splash stays mounted as the repair container while any blocking dep is
  // not runnable. Without blocking failures we fade out as before.
  const blocked = warmupBlocking.length > 0;
  const fading = initialized && minPassed && !blocked;

  const showProgress = !blocked && (activeEntry != null || (percent !== null && percent < 100));

  return (
    <div
      className="splash-overlay"
      data-testid="splash-overlay"
      style={{ opacity: fading ? 0 : 1, pointerEvents: fading ? 'none' : 'auto' }}
      onTransitionEnd={(event) => {
        if (!fading || event.currentTarget !== event.target) return;
        setGone(true);
        onDismissed?.();
      }}
      aria-hidden={!blocked}
    >
      <img src={mainImg} alt="" className="splash-mascot" />
      <div className="splash-text">
        {showGreeting && (
          <p className="splash-greeting" data-testid="splash-greeting">
            {t('splash.greeting')}
          </p>
        )}
        {showProgress ? (
          <>
            <p className="splash-name">{activeEntry ? t('splash.downloading', { binary: activeEntry.binary }) : t('splash.warmup')}</p>
            {percent !== null && (
              <div className="splash-progress">
                <div className="splash-progress-bar" style={{ width: `${percent}%` }} />
              </div>
            )}
            {totalDownloaded > 0 && totalBytes > 0 && (
              <p className="splash-bytes">
                {formatBytes(totalDownloaded)} / {formatBytes(totalBytes)}
              </p>
            )}
          </>
        ) : (
          !blocked && <p className="splash-name">{t('splash.warmup')}</p>
        )}
        {blocked && warmupDiagnostics && <RepairPanel diagnostics={warmupDiagnostics} blocking={warmupBlocking} />}
        {blocked && !warmupDiagnostics && <p className="splash-name">{t('splash.warmupFailedNoDiag')}</p>}
      </div>
    </div>
  );
}
