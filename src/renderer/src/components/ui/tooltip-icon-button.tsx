import type {MouseEventHandler, ReactNode} from 'react'
import {Button} from './button.js'
import {Tooltip, TooltipTrigger, TooltipContent} from './tooltip.js'

interface TooltipIconButtonProps {
	icon: ReactNode
	label: string
	onClick?: MouseEventHandler<HTMLButtonElement>
	variant?: 'ghost' | 'secondary' | 'outline'
	size?: 'icon'
	className?: string
	disabled?: boolean
	'data-testid'?: string
}

export function TooltipIconButton({icon, label, onClick, variant = 'ghost', size = 'icon', className, disabled, 'data-testid': dataTestId}: TooltipIconButtonProps): ReactNode {
	return (
		<Tooltip>
			<TooltipTrigger
				render={props => (
					<Button {...props} variant={variant} size={size} type="button" aria-label={label} data-testid={dataTestId} className={className} disabled={disabled} focusableWhenDisabled={disabled} onClick={onClick}>
						{icon}
					</Button>
				)}
			/>
			<TooltipContent>{label}</TooltipContent>
		</Tooltip>
	)
}
