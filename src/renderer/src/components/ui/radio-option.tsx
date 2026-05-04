import type { JSX, ReactNode, KeyboardEvent } from 'react';
import { cn } from '@renderer/lib/utils';
import { RadioDot } from './radio-dot';

interface Props {
  label: ReactNode;
  checked: boolean;
  onClick: () => void;
  disabled?: boolean;
  adornment?: ReactNode;
  meta?: ReactNode;
  className?: string;
  labelClassName?: string;
}

export function RadioOption({ label, checked, onClick, disabled, adornment, meta, className, labelClassName }: Props): JSX.Element {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') onClick();
  };

  const effectiveChecked = checked && !disabled;

  return (
    <div role="radio" aria-checked={effectiveChecked} aria-disabled={disabled || undefined} tabIndex={disabled ? -1 : 0} onClick={disabled ? undefined : onClick} onKeyDown={handleKeyDown} className={cn('flex items-center gap-[7px] py-[5px] px-[8px] rounded-[6px] transition-colors', disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer', effectiveChecked ? 'bg-[var(--brand-dim)]' : !disabled && 'hover:bg-accent', className)}>
      <RadioDot checked={effectiveChecked} />
      {adornment}
      <span className={cn('text-[13px]', effectiveChecked ? 'font-semibold text-[var(--brand)]' : 'font-medium text-muted-foreground', labelClassName)}>{label}</span>
      {meta}
    </div>
  );
}
