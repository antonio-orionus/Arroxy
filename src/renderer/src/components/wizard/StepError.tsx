import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { formatError, useAppStore } from '../../store/useAppStore';
import { Button } from '../ui/button';

export function StepError(): JSX.Element {
  const { t } = useTranslation();
  const { wizardError, retry, reset } = useAppStore();

  return (
    <div className="wizard-step flex flex-col items-center gap-4 py-4 text-center" data-testid="step-error">
      <div className="w-10 h-10 rounded-full bg-[var(--color-status-error)]/10 text-[var(--color-status-error)] flex items-center justify-center text-base font-bold error-icon-pulse" aria-hidden data-testid="error-icon">
        ✕
      </div>
      <p className="text-sm text-foreground/80 max-w-sm" data-testid="error-message">
        {formatError(wizardError)}
      </p>
      <div className="flex gap-2">
        <Button variant="ghost" type="button" onClick={reset} data-testid="btn-start-over">
          {t('common.startOver')}
        </Button>
        <Button type="button" onClick={() => void retry()} data-testid="btn-retry">
          {t('common.retry')}
        </Button>
      </div>
    </div>
  );
}
