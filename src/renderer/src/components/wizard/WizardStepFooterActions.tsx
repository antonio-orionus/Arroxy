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
	// Extra buttons rendered after the continue button (e.g. skip-to-confirm).
	children?: ReactNode
	info?: ReactNode
	extraAbove?: ReactNode
}

export function WizardStepFooterActions({onBack, onContinue, continueDisabled, continueLabel, children, info, extraAbove}: WizardStepFooterActionsProps): ReactNode {
	const {t} = useTranslation()
	return (
		<WizardFooter info={info} extraAbove={extraAbove}>
			<Button variant="ghost" type="button" onClick={onBack} className="border-[1.5px] border-[var(--border-strong)] text-muted-foreground hover:text-foreground">
				{t('common.back')}
			</Button>
			<Button type="button" disabled={continueDisabled} onClick={onContinue} className="shadow-[0_4px_14px_var(--brand-glow)]">
				{continueLabel ?? t('common.continue')}
			</Button>
			{children}
		</WizardFooter>
	)
}
