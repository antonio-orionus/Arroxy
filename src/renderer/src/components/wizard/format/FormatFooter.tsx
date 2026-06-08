import type {JSX} from 'react'
import {useTranslation} from 'react-i18next'
import {humanSize} from '@shared/format.js'
import {useFormatSelectionView} from '../../../store/formatSelectionView.js'
import {Button} from '../../ui/button.js'
import {WizardFooter} from '../WizardFooter.js'

interface FormatFooterProps {
	onBack: () => void
	onContinue: () => void
	onSkipToConfirm: () => void
}

export function FormatFooter({onBack, onContinue, onSkipToConfirm}: FormatFooterProps): JSX.Element {
	const {t} = useTranslation()
	const {mode, selectedFilesize, canContinue} = useFormatSelectionView()
	return (
		<WizardFooter
			info={
				mode === 'subtitle-only' ? (
					t('presets.subtitle-only.label')
				) : selectedFilesize ? (
					<>
						{t('wizard.formats.total')} <span className="text-[17px] font-bold text-[var(--brand)]">~{humanSize(selectedFilesize)}</span>
					</>
				) : mode === 'audio-only' ? (
					t('wizard.formats.audioOnly')
				) : (
					t('wizard.formats.sizeUnknown')
				)
			}
		>
			<Button variant="ghost" type="button" onClick={onBack} className="border-[1.5px] border-[var(--border-strong)] text-muted-foreground hover:text-foreground">
				{t('common.back')}
			</Button>
			<Button type="button" onClick={onContinue} disabled={!canContinue} className="shadow-[0_4px_14px_var(--brand-glow)]">
				{t('common.continue')}
			</Button>
			<Button type="button" onClick={onSkipToConfirm} title={t('wizard.formats.skipToConfirmTooltip')} className="shadow-[0_4px_14px_var(--brand-glow)]">
				{t('wizard.formats.skipToConfirm')}
			</Button>
		</WizardFooter>
	)
}
