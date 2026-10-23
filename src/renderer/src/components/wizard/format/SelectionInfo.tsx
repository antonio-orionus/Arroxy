import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {humanSize} from '@shared/format.js'
import type {FormatSelectionView} from '../../../store/formatSelectionView.js'
import {SavesAsControl} from './SavesAsControl.js'

interface SelectionInfoProps {
	view: Pick<FormatSelectionView, 'mode' | 'selectedFilesize' | 'sizesScaledToPart'>
}

// "Total ~12.6 MiB · Saves as .webm · AV1 · Opus": the footer line Format and
// Review share, so the size and file type stay in view up to Download.
export function SelectionInfo({view}: SelectionInfoProps): ReactNode {
	const {t, i18n} = useTranslation()
	const total =
		view.mode === 'subtitle-only' ? (
			t('wizard.formats.kind.subtitles')
		) : view.selectedFilesize ? (
			<>
				{t(view.sizesScaledToPart ? 'wizard.part.totalEstimate' : 'wizard.formats.total')} <span className="text-title font-semibold text-foreground tabular-nums">~{humanSize(view.selectedFilesize, i18n.language)}</span>
			</>
		) : view.mode === 'audio-only' ? (
			t('wizard.formats.kind.audio')
		) : (
			t('wizard.formats.sizeUnknown')
		)
	return (
		<span className="flex flex-wrap items-center gap-x-4 gap-y-1.5 max-lg:flex-nowrap max-lg:gap-x-3">
			<span>{total}</span>
			<SavesAsControl />
		</span>
	)
}
