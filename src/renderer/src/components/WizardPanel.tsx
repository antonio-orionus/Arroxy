import { useEffect, useRef, type JSX } from 'react';
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

  const prevIndexRef = useRef(activeIndex);
  const isBackward = activeIndex >= 0 && prevIndexRef.current >= 0 && activeIndex < prevIndexRef.current;

  useEffect(() => {
    prevIndexRef.current = activeIndex;
  }, [activeIndex]);

  return (
    <section
      className={cn('px-6 py-3', isBackward ? 'wizard-backward' : 'wizard-forward')}
      data-testid="wizard-panel"
    >
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
                      'rounded-full flex items-center justify-center text-[10px] font-bold border transition-all duration-300',
                      isActive && 'w-7 h-7 border-[var(--brand)] bg-[var(--brand-dim)] text-[var(--brand)]',
                      isDone && 'w-6 h-6 border-transparent bg-[var(--brand)] text-white',
                      !isActive && !isDone && 'w-6 h-6 border-[var(--border-strong)] bg-transparent text-[var(--text-subtle)]'
                    )}
                    style={
                      isActive
                        ? { boxShadow: '0 0 0 3px var(--brand-dim), 0 0 12px var(--brand-glow)' }
                        : isDone
                          ? { boxShadow: '0 0 6px var(--brand-glow)' }
                          : undefined
                    }
                  >
                    {isDone ? '✓' : i + 1}
                  </div>
                  <span
                    className={cn(
                      'text-[9px] font-semibold uppercase tracking-[0.07em]',
                      isActive && 'text-[var(--brand)]',
                      (isDone || (!isActive && !isDone)) && 'text-[var(--text-subtle)]'
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'h-[2px] flex-1 mb-4 mx-1 transition-all duration-500 rounded-full',
                      isDone ? 'bg-[var(--brand)]' : 'bg-accent'
                    )}
                    style={isDone ? { boxShadow: '0 0 4px var(--brand-glow)' } : undefined}
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
