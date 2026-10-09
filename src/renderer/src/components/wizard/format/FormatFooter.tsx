import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {humanSize} from '@shared/format.js'
import type {FormatSelectionView} from '../../../store/formatSelectionView.js'
import {Button} from '../../ui/button.js'
import {WizardFooter} from '../WizardFooter.js'

interface FormatFooterProps {
	view: Pick<FormatSelectionView, 'mode' | 'selectedFilesize' | 'canContinue'>
	onBack: () => void
	onContinue: () => void
	onSkipToConfirm: () => void
}

export function FormatFooter({view, onBack, onContinue, onSkipToConfirm}: FormatFooterProps): ReactNode {
	const {t} = useTranslation()
	return (
		<WizardFooter
			info={
				view.mode === 'subtitle-only' ? (
					t('presets.subtitle-only.label')
				) : view.selectedFilesize ? (
					<>
						{t('wizard.formats.total')} <span className="text-headline font-bold text-primary">~{humanSize(view.selectedFilesize)}</span>
					</>
				) : view.mode === 'audio-only' ? (
					t('wizard.formats.audioOnly')
				) : (
					t('wizard.formats.sizeUnknown')
				)
			}
		>
			<Button variant="outline" type="button" onClick={onBack}>
				{t('common.back')}
			</Button>
			<Button variant="outline" type="button" onClick={onSkipToConfirm} title={t('wizard.formats.skipToConfirmTooltip')}>
				{t('wizard.formats.skipToConfirm')}
			</Button>
			<Button variant="glow" type="button" onClick={onContinue} disabled={!view.canContinue}>
				{t('common.continue')}
			</Button>
		</WizardFooter>
	)
}
