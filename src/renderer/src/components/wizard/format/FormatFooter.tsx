import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {humanSize} from '@shared/format.js'
import type {FormatSelectionView} from '../../../store/formatSelectionView.js'
import {Button} from '../../ui/button.js'
import {WizardFooter} from '../WizardFooter.js'
import {SingleDownloadActions} from '../SingleDownloadActions.js'
import {SavesAsControl} from './SavesAsControl.js'
import {ProfileSummary} from './ProfileSummary.js'

interface FormatFooterProps {
	view: Pick<FormatSelectionView, 'mode' | 'selectedFilesize' | 'sizesScaledToPart'>
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
				{t(view.sizesScaledToPart ? 'wizard.part.totalEstimate' : 'wizard.formats.total')} <span className="text-title font-semibold text-foreground tabular-nums">~{humanSize(view.selectedFilesize)}</span>
			</>
		) : view.mode === 'audio-only' ? (
			t('wizard.formats.audioOnly')
		) : (
			t('wizard.formats.sizeUnknown')
		)
	return (
		<WizardFooter
			extraAbove={<ProfileSummary />}
			contentClassName="max-w-6xl"
			info={
				<span className="flex flex-wrap items-center gap-x-4 gap-y-1.5 max-lg:flex-nowrap max-lg:gap-x-3">
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
