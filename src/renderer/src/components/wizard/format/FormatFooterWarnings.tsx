import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {TriangleAlert} from 'lucide-react'
import {useAppStore} from '../../../store/useAppStore.js'
import {buildDownloadReview, conflictLabelKey} from '../../../store/wizard/downloadReviewProjection.js'
import {mp4CaveatCodec} from '../../../store/wizard/resolveContainer.js'
import {createTranslationPort} from '../../../lib/translation.js'

// The MP4 caveat and the conflicts, one warning line each.
function SummaryWarnings(): ReactNode {
	const {t, i18n} = useTranslation()
	const state = useAppStore()
	const conflicts = buildDownloadReview(state, {t: createTranslationPort(t), language: i18n.language, commonPaths: state.commonPaths}).conflictWarnings
	const caveat = mp4CaveatCodec(state)
	return (
		<>
			{caveat ? (
				<p className="flex items-center gap-1.5 text-caption text-warning" data-testid="summary-mp4-caveat">
					<TriangleAlert className="size-3.5 shrink-0" aria-hidden />
					{t(caveat === 'VP9' ? 'fileType.mp4CaveatVp9' : 'fileType.mp4CaveatAv1')}
				</p>
			) : null}
			{conflicts.map(conflict => (
				<p key={conflict.code} className="flex items-center gap-1.5 text-caption text-warning" data-testid={`summary-conflict-${conflict.code}`}>
					<TriangleAlert className="size-3.5 shrink-0" aria-hidden />
					{t(conflictLabelKey(conflict.code))}
				</p>
			))}
		</>
	)
}

// The MP4 caveat and the conflicts under Format's footer: the Download beside
// Continue skips Review, where they also show.
export function FormatFooterWarnings(): ReactNode {
	return (
		<div className="flex flex-col gap-1 empty:hidden [&>p:first-child]:pt-2.5">
			<SummaryWarnings />
		</div>
	)
}
