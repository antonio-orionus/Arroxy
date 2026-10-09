import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {Button} from '../ui/button.js'
import {WizardFooter} from './WizardFooter.js'

interface WizardStepFooterActionsProps {
	onBack: () => void
	onContinue: () => void
	continueDisabled?: boolean
	// Override the default 'Continue' label.
	continueLabel?: ReactNode
	// Secondary buttons (e.g. skip-to-confirm), rendered before Continue: the primary action always sits last.
	children?: ReactNode
	info?: ReactNode
	extraAbove?: ReactNode
}

export function WizardStepFooterActions({onBack, onContinue, continueDisabled, continueLabel, children, info, extraAbove}: WizardStepFooterActionsProps): ReactNode {
	const {t} = useTranslation()
	return (
		<WizardFooter info={info} extraAbove={extraAbove}>
			<Button variant="outline" type="button" onClick={onBack}>
				{t('common.back')}
			</Button>
			{children}
			<Button variant="glow" type="button" disabled={continueDisabled} onClick={onContinue}>
				{continueLabel ?? t('common.continue')}
			</Button>
		</WizardFooter>
	)
}
