import { useState, useEffect, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import mainImg from '../assets/Main.png';

interface Props {
  initialized: boolean;
  warmupFailures: string[];
}

const MIN_MS = 3000;

export function SplashScreen({ initialized, warmupFailures }: Props): JSX.Element | null {
  const { t } = useTranslation();
  const [minPassed, setMinPassed] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinPassed(true), MIN_MS);
    return () => clearTimeout(t);
  }, []);

  if (gone) return null;

  const fading = initialized && minPassed;

  return (
    <div
      className="splash-overlay"
      style={{ opacity: fading ? 0 : 1 }}
      onTransitionEnd={() => { if (fading) setGone(true); }}
      aria-hidden
    >
      <img src={mainImg} alt="" className="splash-mascot" />
      <div className="splash-text">
        <p className="splash-greeting">{t('splash.greeting')}</p>
        <p className="splash-name">{t('splash.warmup')}</p>
        {initialized && warmupFailures.length > 0 && (
          <p className="splash-warning">{t('splash.warning')}</p>
        )}
      </div>
    </div>
  );
}
