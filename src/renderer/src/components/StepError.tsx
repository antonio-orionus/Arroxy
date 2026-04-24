import type { JSX } from 'react';
import { formatError, useAppStore } from '../store/useAppStore';
import { Button } from './ui/button';

export function StepError(): JSX.Element {
  const { wizardError, retryWizard, resetWizard } = useAppStore();

  return (
    <div className="wizard-step flex flex-col items-center gap-4 py-4 text-center" data-testid="step-error">
      <div
        className="w-10 h-10 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center text-base font-bold error-icon-pulse"
        aria-hidden
        data-testid="error-icon"
      >
        ✕
      </div>
      <p className="text-sm text-zinc-300 max-w-sm" data-testid="error-message">
        {formatError(wizardError)}
      </p>
      <div className="flex gap-2">
        <Button variant="ghost" type="button" onClick={resetWizard} data-testid="btn-start-over">
          Start over
        </Button>
        <Button type="button" onClick={() => void retryWizard()} data-testid="btn-retry">
          Retry
        </Button>
      </div>
    </div>
  );
}
