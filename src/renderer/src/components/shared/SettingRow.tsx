import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {cn} from '@renderer/lib/utils.js'
import {Field, FieldContent, FieldDescription, FieldTitle} from '../ui/field.js'
import {HelpTip} from './HelpTip.js'

export interface SettingRowProps {
	// Labels the control: pass the same id to the control's `aria-labelledby`.
	id: string
	label: string
	description?: ReactNode
	// Longer explanation behind an (i) tip, for rows where a description would crowd the layout.
	help?: ReactNode
	testId?: string
	className?: string
}

// One setting: label (+ optional description or help tip) on the start side, the
// control on the end side. Every settings surface uses this row so labels,
// descriptions, and controls line up identically across screens.
export function SettingRow({id, label, description, help, testId, className, children}: SettingRowProps & {children: ReactNode}): ReactNode {
	const {t} = useTranslation()
	return (
		<Field orientation="horizontal" className={cn('items-center justify-between gap-3', className)} data-testid={testId}>
			<FieldContent className="min-w-0 gap-0.5">
				<FieldTitle id={id} className="gap-1">
					{label}
					{help ? <HelpTip label={t('wizard.profileSwitchRow.helpAria', {label})}>{help}</HelpTip> : null}
				</FieldTitle>
				{description ? <FieldDescription>{description}</FieldDescription> : null}
			</FieldContent>
			{children}
		</Field>
	)
}
