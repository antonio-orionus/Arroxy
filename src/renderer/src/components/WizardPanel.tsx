import type { JSX } from 'react';
import { useAppStore } from '../store/useAppStore';
import { StepUrlInput } from './StepUrlInput';
import { StepFormatSelect } from './StepFormatSelect';
import { StepFolderConfirm } from './StepFolderConfirm';
import { StepConfirm } from './StepConfirm';
import { StepError } from './StepError';
import { cn } from '@renderer/lib/utils';

const STEPS = [
  { key: 'url', label: 'URL' },
  { key: 'formats', label: 'Format' },
  { key: 'folder', label: 'Save' },
  { key: 'confirm', label: 'Confirm' },
] as const;

const STEP_ORDER = STEPS.map((s) => s.key);

export function WizardPanel(): JSX.Element {
  const wizardStep = useAppStore((s) => s.wizardStep);
  const activeIndex = STEP_ORDER.indexOf(wizardStep as (typeof STEP_ORDER)[number]);

  return (
    <section className="px-6 py-3" data-testid="wizard-panel">
      {wizardStep !== 'error' && (
        <div className="flex items-center mb-4" aria-hidden data-testid="step-indicator">
          {STEPS.map((step, i) => {
            const isDone = i < activeIndex;
            const isActive = i === activeIndex;
            return (
              <div key={step.key} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold border transition-all',
                      isActive && 'border-[var(--color-accent)] bg-[var(--color-accent-dim)] text-[var(--color-accent)]',
                      isDone && 'border-transparent bg-[var(--color-accent)] text-zinc-950',
                      !isActive && !isDone && 'border-zinc-700 bg-zinc-800 text-zinc-500'
                    )}
                  >
                    {isDone ? '✓' : i + 1}
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-medium',
                      isActive && 'text-[var(--color-accent)]',
                      isDone && 'text-zinc-400',
                      !isActive && !isDone && 'text-zinc-600'
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'h-px flex-1 mb-4 mx-2 transition-colors',
                      isDone ? 'bg-[var(--color-accent)]/40' : 'bg-zinc-800'
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {wizardStep === 'url' && <StepUrlInput />}
      {wizardStep === 'formats' && <StepFormatSelect />}
      {wizardStep === 'folder' && <StepFolderConfirm />}
      {wizardStep === 'confirm' && <StepConfirm />}
      {wizardStep === 'error' && <StepError />}
    </section>
  );
}
