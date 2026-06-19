import type {ComponentType, ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {cn} from '@renderer/lib/utils.js'
import {Button} from '../ui/button.js'
import {Tooltip, TooltipContent, TooltipTrigger} from '../ui/tooltip.js'
import {actionDisabledTooltip, type QueueActionDefinition} from './queueManagerActions.js'

export function TooltipIconButton({Icon, className, disabled, label, onClick, testId, title}: {Icon: ComponentType<{size?: number; 'aria-hidden'?: boolean; 'data-icon'?: string}>; className?: string; disabled?: boolean; label: string; onClick: () => void; testId?: string; title?: string}): ReactNode {
	const tooltip = title ?? label
	return (
		<Tooltip>
			<TooltipTrigger
				render={props => {
					const {children, ...triggerProps} = props
					void children
					return (
						<span {...triggerProps} className="inline-flex" title={tooltip}>
							<Button type="button" variant="ghost" size="icon-sm" className={cn('h-7 w-7', className)} aria-label={label} title={tooltip} data-testid={testId} disabled={disabled} onClick={onClick}>
								<Icon size={13} aria-hidden />
							</Button>
						</span>
					)
				}}
			/>
			<TooltipContent>{tooltip}</TooltipContent>
		</Tooltip>
	)
}

export function QueueActionButton({action, disabled, onClick}: {action: QueueActionDefinition; disabled: boolean; onClick: () => void}): ReactNode {
	const {t} = useTranslation()
	const {Icon} = action
	const label = t(action.labelKey)
	return <TooltipIconButton Icon={Icon} label={label} title={actionDisabledTooltip(action.id, disabled, t)} testId={`queue-action-${action.id}`} disabled={disabled} onClick={onClick} />
}
