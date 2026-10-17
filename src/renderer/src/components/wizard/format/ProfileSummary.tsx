import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {TriangleAlert} from 'lucide-react'
import {useAppStore} from '../../../store/useAppStore.js'
import {buildDownloadReview, conflictLabelKey} from '../../../store/wizard/downloadReviewProjection.js'
import {mp4CaveatCodec} from '../../../store/wizard/resolveContainer.js'
import {buildSingleSettingsSummary} from '../../../store/wizard/singleSettingsSummary.js'
import {Button} from '../../ui/button.js'
import {createTranslationPort} from '../../../lib/translation.js'

// Everything the Review screen holds, in one line, so Download from the Format
// screen never hides what will happen. Conflicts show here too: Download can
// skip Review.
export function ProfileSummary(): ReactNode {
	const {t, i18n} = useTranslation()
	const state = useAppStore()
	const {openReview} = state
	const translate = createTranslationPort(t)
	const summary = buildSingleSettingsSummary(state, {t: translate, language: i18n.language})
	const conflicts = buildDownloadReview(state, {t: translate, language: i18n.language, commonPaths: state.commonPaths}).conflictWarnings
	const caveat = mp4CaveatCodec(state)
	const profileName = state.wizardProfile?.name ?? ''
	const showSubtitles = state.wizardMediaKind !== 'subtitles'

	return (
		<div className="flex flex-col gap-2 rounded-lg border border-border bg-card/60 px-3.5 py-2.5 text-sm text-muted-foreground" data-testid="profile-summary">
			<div className="flex items-start gap-3">
				<p className="min-w-0 flex-1 leading-relaxed">
					<span className="font-semibold text-foreground">{t('wizard.formats.summary.lead', {profile: profileName})}</span>{' '}
					{showSubtitles ? (
						<>
							{summary.subtitlesOn ? summary.subtitles : t('wizard.formats.summary.subtitlesOff')}
							{!summary.subtitlesOn && summary.subtitlesAvailable > 0 ? (
								<>
									{' ('}
									<Button type="button" variant="link" size="inline" onClick={() => openReview('subtitles')} data-testid="summary-add-subtitles">
										{t('wizard.formats.summary.subtitlesAdd', {count: summary.subtitlesAvailable})}
									</Button>
									{')'}
								</>
							) : null}
							{' · '}
						</>
					) : null}
					{summary.sponsorBlock ? `${t('wizard.review.rows.sponsorBlock')}: ${summary.sponsorBlock} · ` : null}
					{state.wizardMediaKind === 'subtitles' ? null : `${summary.extras} · `}
					<span className="text-foreground">{summary.saveTo}</span>
				</p>
				<Button type="button" variant="link" size="inline" className="shrink-0" onClick={() => openReview(null)} data-testid="summary-review-all">
					{t('wizard.formats.summary.reviewAll')}
				</Button>
			</div>
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
		</div>
	)
}
