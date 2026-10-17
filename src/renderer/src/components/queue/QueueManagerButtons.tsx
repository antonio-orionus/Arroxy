import type {ComponentType, ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {Button} from '../ui/button.js'
import {Hint} from '../shared/Hint.js'
import {actionDisabledTooltip, type QueueActionDefinition} from './queueManagerActions.js'

export function TooltipIconButton({Icon, className, disabled, label, onClick, testId, hint}: {Icon: ComponentType<{size?: number; 'aria-hidden'?: boolean; 'data-icon'?: string}>; className?: string; disabled?: boolean; label: string; onClick: () => void; testId?: string; hint?: string}): ReactNode {
	return (
		<Hint label={hint ?? label}>
			<Button type="button" variant="ghost" size="icon-sm" className={className} aria-label={label} data-testid={testId} disabled={disabled} focusableWhenDisabled onClick={onClick}>
				<Icon size={13} aria-hidden />
			</Button>
		</Hint>
	)
}

export function QueueActionButton({action, disabled, onClick}: {action: QueueActionDefinition; disabled: boolean; onClick: () => void}): ReactNode {
	const {t} = useTranslation()
	const {Icon} = action
	const label = t(action.labelKey)
	return <TooltipIconButton Icon={Icon} label={label} hint={actionDisabledTooltip(action.id, disabled, t)} testId={`queue-action-${action.id}`} disabled={disabled} onClick={onClick} />
}
