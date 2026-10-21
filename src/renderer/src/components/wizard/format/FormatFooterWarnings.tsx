import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {TriangleAlert} from 'lucide-react'
import {useShallow} from 'zustand/react/shallow'
import {useAppStore} from '../../../store/useAppStore.js'
import {conflictLabelKey, singleConflictWarnings} from '../../../store/wizard/downloadReviewProjection.js'
import {mp4CaveatCodec} from '../../../store/wizard/resolveContainer.js'
import {useQuickTimeHost} from '../../../lib/quickTimeHost.js'

// The MP4 caveat and the conflicts under Format's footer, one warning line each:
// the Download beside Continue skips Review, where they also show. No wrapper,
// so the footer band spaces them and stays empty when there are none.
export function FormatFooterWarnings(): ReactNode {
	const {t} = useTranslation()
	// Only what the lines say: the footer stays still while downloads tick the store.
	const host = useQuickTimeHost()
	const caveat = useAppStore(state => mp4CaveatCodec(state, host))
	const conflicts = useAppStore(useShallow(state => singleConflictWarnings(state).map(conflict => conflict.code)))
	return (
		<>
			{caveat ? (
				<p className="flex items-center gap-1.5 text-caption text-warning" data-testid="summary-mp4-caveat">
					<TriangleAlert className="size-3.5 shrink-0" aria-hidden />
					{t(caveat === 'VP9' ? 'fileType.mp4CaveatVp9' : 'fileType.mp4CaveatAv1')}
				</p>
			) : null}
			{conflicts.map(code => (
				<p key={code} className="flex items-center gap-1.5 text-caption text-warning" data-testid={`summary-conflict-${code}`}>
					<TriangleAlert className="size-3.5 shrink-0" aria-hidden />
					{t(conflictLabelKey(code))}
				</p>
			))}
		</>
	)
}
