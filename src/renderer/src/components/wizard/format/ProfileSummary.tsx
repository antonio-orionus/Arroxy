import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {TriangleAlert} from 'lucide-react'
import {useAppStore} from '../../../store/useAppStore.js'
import {buildDownloadReview, conflictLabelKey} from '../../../store/wizard/downloadReviewProjection.js'
import {mp4CaveatCodec} from '../../../store/wizard/resolveContainer.js'
import {buildSingleSettingsSummary, type SingleSettingsSummary} from '../../../store/wizard/singleSettingsSummary.js'
import {Button} from '../../ui/button.js'
import {createTranslationPort} from '../../../lib/translation.js'

// The subtitles part of the summary line, with a shortcut to add the ones the
// video offers when none are picked.
function SummarySubtitles({summary, onAdd}: {summary: SingleSettingsSummary; onAdd: () => void}): ReactNode {
	const {t} = useTranslation()
	return (
		<>
			{summary.subtitlesOn ? summary.subtitles : t('wizard.formats.summary.subtitlesOff')}
			{!summary.subtitlesOn && summary.subtitlesAvailable > 0 ? (
				<>
					{' ('}
					<Button type="button" variant="link" size="inline" onClick={onAdd} data-testid="summary-add-subtitles">
						{t('wizard.formats.summary.subtitlesAdd', {count: summary.subtitlesAvailable})}
					</Button>
					{')'}
				</>
			) : null}
			{' · '}
		</>
	)
}

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

// Everything the Review screen holds, in one line of the sticky footer, so
// Download from the Format screen never hides what will happen. The line cuts
// with an ellipsis and its hint holds the rest. Conflicts show here too:
// Download can skip Review.
export function ProfileSummary(): ReactNode {
	const {t, i18n} = useTranslation()
	const state = useAppStore()
	const {openReview} = state
	const translate = createTranslationPort(t)
	const summary = buildSingleSettingsSummary(state, {t: translate, language: i18n.language})
	const profileName = state.wizardProfile?.name ?? ''
	const showSubtitles = state.wizardMediaKind !== 'subtitles'

	return (
		<div className="flex flex-col gap-1 pt-2.5 text-sm text-muted-foreground" data-testid="profile-summary">
			<div className="flex items-center gap-3">
				<p className="min-w-0 flex-1 truncate">
					<span className="font-semibold text-foreground">{t('wizard.formats.summary.lead', {profile: profileName})}</span> {/* The folder first: when the line runs out of room, it is the last thing to lose. */}
					<span className="text-foreground">{summary.saveTo}</span>
					{showSubtitles || summary.sponsorBlock ? ' · ' : null}
					{showSubtitles ? <SummarySubtitles summary={summary} onAdd={() => openReview('subtitles')} /> : null}
					{summary.sponsorBlock ? `${t('wizard.review.rows.sponsorBlock')}: ${summary.sponsorBlock}` : null}
					{summary.sponsorBlock && state.wizardMediaKind !== 'subtitles' ? ' · ' : null}
					{state.wizardMediaKind === 'subtitles' ? null : summary.extras}
				</p>
				<Button type="button" variant="link" size="inline" className="shrink-0" onClick={() => openReview(null)} data-testid="summary-review-all">
					{t('wizard.formats.summary.reviewAll')}
				</Button>
			</div>
			<SummaryWarnings />
		</div>
	)
}
