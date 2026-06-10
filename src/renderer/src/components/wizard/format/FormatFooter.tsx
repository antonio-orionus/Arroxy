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
						{t('wizard.formats.total')} <span className="text-[17px] font-bold text-[var(--brand)]">~{humanSize(view.selectedFilesize)}</span>
					</>
				) : view.mode === 'audio-only' ? (
					t('wizard.formats.audioOnly')
				) : (
					t('wizard.formats.sizeUnknown')
				)
			}
		>
			<Button variant="ghost" type="button" onClick={onBack} className="border-[1.5px] border-[var(--border-strong)] text-muted-foreground hover:text-foreground">
				{t('common.back')}
			</Button>
			<Button type="button" onClick={onContinue} disabled={!view.canContinue} className="shadow-[0_4px_14px_var(--brand-glow)]">
				{t('common.continue')}
			</Button>
			<Button type="button" onClick={onSkipToConfirm} title={t('wizard.formats.skipToConfirmTooltip')} className="shadow-[0_4px_14px_var(--brand-glow)]">
				{t('wizard.formats.skipToConfirm')}
			</Button>
		</WizardFooter>
	)
}
