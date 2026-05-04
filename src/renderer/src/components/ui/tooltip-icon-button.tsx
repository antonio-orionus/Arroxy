import type { JSX, ReactNode } from 'react';
import { Button } from './button';
import { Tooltip, TooltipTrigger, TooltipContent } from './tooltip';

interface TooltipIconButtonProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  variant?: 'ghost' | 'secondary' | 'outline';
  size?: 'icon';
  className?: string;
  'data-testid'?: string;
}

export function TooltipIconButton({ icon, label, onClick, variant = 'ghost', size = 'icon', className, 'data-testid': dataTestId }: TooltipIconButtonProps): JSX.Element {
  return (
    <Tooltip>
      <TooltipTrigger
        render={(props) => (
          <Button {...props} variant={variant} size={size} type="button" aria-label={label} data-testid={dataTestId} className={className} onClick={onClick}>
            {icon}
          </Button>
        )}
      />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
