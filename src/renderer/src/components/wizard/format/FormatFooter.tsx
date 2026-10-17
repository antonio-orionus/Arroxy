import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {humanSize} from '@shared/format.js'
import type {FormatSelectionView} from '../../../store/formatSelectionView.js'
import {Button} from '../../ui/button.js'
import {WizardFooter} from '../WizardFooter.js'
import {SingleDownloadActions} from '../SingleDownloadActions.js'
import {SavesAsControl} from './SavesAsControl.js'

interface FormatFooterProps {
	view: Pick<FormatSelectionView, 'mode' | 'selectedFilesize'>
	onBack: () => void
	onReview: () => void
}

export function FormatFooter({view, onBack, onReview}: FormatFooterProps): ReactNode {
	const {t} = useTranslation()
	const total =
		view.mode === 'subtitle-only' ? (
			t('wizard.formats.kind.subtitles')
		) : view.selectedFilesize ? (
			<>
				{t('wizard.formats.total')} <span className="text-headline font-bold text-primary">~{humanSize(view.selectedFilesize)}</span>
			</>
		) : view.mode === 'audio-only' ? (
			t('wizard.formats.audioOnly')
		) : (
			t('wizard.formats.sizeUnknown')
		)
	return (
		<WizardFooter
			info={
				<span className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
					<span>{total}</span>
					<SavesAsControl />
				</span>
			}
		>
			<Button variant="outline" type="button" onClick={onBack} data-testid="btn-back">
				{t('common.back')}
			</Button>
			<Button variant="outline" type="button" onClick={onReview} data-testid="btn-review-options">
				{t('wizard.formats.footer.reviewOptions')}
			</Button>
			<SingleDownloadActions />
		</WizardFooter>
	)
}
