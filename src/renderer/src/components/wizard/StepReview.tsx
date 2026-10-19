import {useId, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {useShallow} from 'zustand/react/shallow'
import {ChevronDown, ChevronRight, TriangleAlert} from 'lucide-react'
import {FILENAME_TEMPLATE_MAX} from '@shared/schemas.js'
import {useAppStore} from '../../store/useAppStore.js'
import {selectWizardReviewState, type WizardReviewState} from '../../store/wizard/wizardReviewState.js'
import type {ReviewRow} from '../../store/wizard/profileApplication.js'
import {buildDownloadReview, conflictLabelKey, type DownloadReview} from '../../store/wizard/downloadReviewProjection.js'
import {buildSingleSettingsSummary, sponsorBlockApplies, type SingleSettingsSummary} from '../../store/wizard/singleSettingsSummary.js'
import {mp4CaveatCodec, resolveOutputContainer} from '../../store/wizard/resolveContainer.js'
import type {Mp4Caveat} from '@shared/fileTypeFit.js'
import {createTranslationPort} from '../../lib/translation.js'
import {cn} from '@renderer/lib/utils.js'
import {Alert, AlertDescription} from '../ui/alert.js'
import {Button} from '../ui/button.js'
import {Card} from '../ui/card.js'
import {Field, FieldDescription, FieldLabel} from '../ui/field.js'
import {Input} from '../ui/input.js'
import {SectionLabel} from '../shared/SectionLabel.js'
import {WizardFooter} from './WizardFooter.js'
import {SingleDownloadActions} from './SingleDownloadActions.js'
import {SubtitleFields} from './SubtitleFields.js'
import {SponsorBlockFields} from './StepSponsorBlock.js'
import {OutputFields} from './StepOutput.js'
import {FolderFields} from './StepFolderConfirm.js'
import {Hint} from '../shared/Hint.js'
import {ReviewPageCallout} from './ReviewPageCallout.js'
import {ProfileEditLine} from './ProfileEditLine.js'
import {wizardVideoPart} from '../../store/wizard/videoPart.js'
import {formatPartTime} from '@shared/videoPart.js'

const ROW_LABEL_KEYS = {subtitles: 'wizard.review.rows.subtitles', sponsorBlock: 'wizard.review.rows.sponsorBlock', extras: 'wizard.review.rows.extras', saveTo: 'wizard.review.rows.saveTo', fileName: 'wizard.review.rows.fileName'} as const satisfies Record<ReviewRow, string>

function FileNameFields(): ReactNode {
	const {t} = useTranslation()
	const id = useId()
	const template = useAppStore(state => state.wizardFilenameTemplate)
	const setTemplate = useAppStore(state => state.setWizardFilenameTemplate)
	return (
		<Field className="gap-1.5">
			<FieldLabel htmlFor={id}>{t('wizard.review.rows.fileName')}</FieldLabel>
			<Input id={id} type="text" value={template} maxLength={FILENAME_TEMPLATE_MAX} onChange={event => setTemplate(event.target.value)} aria-invalid={template.trim() === ''} className="font-mono" data-testid="review-filename-input" />
			<FieldDescription>{t('wizard.review.fileNameHint')}</FieldDescription>
		</Field>
	)
}

interface ReviewRowItemProps {
	row: ReviewRow
	value: string
	open: boolean
	onToggle: () => void
	children: ReactNode
}

// One Review row: label and current value; opens its editor in place.
function ReviewRowItem({row, value, open, onToggle, children}: ReviewRowItemProps): ReactNode {
	const {t} = useTranslation()
	const panelId = useId()
	const Chevron = open ? ChevronDown : ChevronRight
	return (
		<div className={cn('border-t border-border first:border-t-0', open && 'bg-primary/5')} data-testid={`review-row-${row}`}>
			<Button type="button" variant="ghost" className="h-auto w-full justify-start gap-3 rounded-none px-4 py-3 text-start" aria-expanded={open} aria-controls={panelId} onClick={onToggle} data-testid={`review-row-${row}-toggle`}>
				<span className="w-28 shrink-0 text-sm font-semibold text-foreground">{t(ROW_LABEL_KEYS[row])}</span>
				<Hint label={value} reveal>
					<span className="min-w-0 flex-1 truncate text-sm font-normal text-muted-foreground">{value}</span>
				</Hint>
				<Chevron className="shrink-0 text-subtle-foreground" aria-hidden />
			</Button>
			{open ? (
				<div id={panelId} className="flex flex-col gap-3 px-4 pt-1 pb-4">
					{children}
					<div className="flex justify-end">
						<Button type="button" variant="outline" size="sm" onClick={onToggle} data-testid={`review-row-${row}-done`}>
							{t('wizard.review.done')}
						</Button>
					</div>
				</div>
			) : null}
		</div>
	)
}

interface ReviewRowEntry {
	row: ReviewRow
	value: string
	fields: ReactNode
}

// The rows this run has: subtitles only when the video offers some or they are
// on, SponsorBlock only where it applies, extras only with media.
function reviewRowEntries(state: WizardReviewState, summary: SingleSettingsSummary): ReviewRowEntry[] {
	const kind = state.wizardMediaKind
	return [
		...(summary.subtitlesAvailable > 0 || summary.subtitlesOn ? [{row: 'subtitles' as const, value: summary.subtitles, fields: <SubtitleFields withMedia={kind !== 'subtitles'} />}] : []),
		...(sponsorBlockApplies(state) && summary.sponsorBlock !== null ? [{row: 'sponsorBlock' as const, value: summary.sponsorBlock, fields: <SponsorBlockFields />}] : []),
		...(kind === 'subtitles' ? [] : [{row: 'extras' as const, value: summary.extras, fields: <OutputFields />}]),
		{row: 'saveTo', value: summary.saveTo, fields: <FolderFields persist={false} />},
		{row: 'fileName', value: summary.fileName, fields: <FileNameFields />}
	]
}

// The chosen streams in one line: part, video, audio and the file type it saves as.
function ReviewFormatStrip({state, review, onChangeFormat}: {state: WizardReviewState; review: DownloadReview; onChangeFormat: () => void}): ReactNode {
	const {t} = useTranslation()
	const kind = state.wizardMediaKind
	const savesAs = kind === 'video' ? `${t('wizard.formats.savesAs.label')} .${resolveOutputContainer(state.selectedVideoFormatId, state.audioSelection, state.wizardSubtitleMode, state.wizardFormats, kind, state.wizardEmbedThumbnail, state.wizardFileType)}` : null
	const part = wizardVideoPart(state)
	const partLabel = part ? t('wizard.part.summary', {start: formatPartTime(part.startSeconds), end: formatPartTime(part.endSeconds)}) : null
	const formatLine = kind === 'subtitles' ? t('wizard.formats.kind.subtitles') : [partLabel, review.videoSummary, review.summaryRows.find(row => row.key === 'audio')?.value, savesAs].filter(Boolean).join(' · ')

	return (
		<Card className="flex-row items-center gap-3 px-3.5 py-2.5" data-testid="review-format-strip">
			{/* Wrapped: Card styles a first-child <img> as a cover image. */}
			{state.wizardThumbnail ? (
				<div className="h-9 w-16 shrink-0 overflow-hidden rounded-md">
					<img src={state.wizardThumbnail} alt="" aria-hidden referrerPolicy="no-referrer" className="size-full object-cover" />
				</div>
			) : null}
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-semibold text-foreground">{state.wizardTitle}</p>
				<p className="truncate text-caption text-subtle-foreground">{formatLine}</p>
			</div>
			<Button type="button" variant="link" size="inline" className="shrink-0" onClick={onChangeFormat} data-testid="review-change-format">
				{t('wizard.review.changeFormat')}
			</Button>
		</Card>
	)
}

function ReviewWarnings({caveat, conflicts}: {caveat: Mp4Caveat | null; conflicts: DownloadReview['conflictWarnings']}): ReactNode {
	const {t} = useTranslation()
	return (
		<Alert variant="warning">
			<TriangleAlert aria-hidden />
			<AlertDescription className="flex flex-col gap-1">
				{caveat ? <p data-testid="review-mp4-caveat">{t(caveat === 'VP9' ? 'fileType.mp4CaveatVp9' : 'fileType.mp4CaveatAv1')}</p> : null}
				{conflicts.map(conflict => (
					<p key={conflict.code} data-testid={`review-conflict-${conflict.code}`}>
						{t(conflictLabelKey(conflict.code))}
					</p>
				))}
			</AlertDescription>
		</Alert>
	)
}

// Single video, screen 2: everything besides the streams, as rows that open in
// place. The footer says what changed from the profile this run started from.
export function StepReview(): ReactNode {
	const {t, i18n} = useTranslation()
	const state = useAppStore(useShallow(selectWizardReviewState))
	const {wizardReviewRow, setWizardReviewRow, goToStep, dismissReviewCallout} = useAppStore(useShallow(s => ({wizardReviewRow: s.wizardReviewRow, setWizardReviewRow: s.setWizardReviewRow, goToStep: s.goToStep, dismissReviewCallout: s.dismissReviewCallout})))
	const reviewCalloutPending = state.settings?.common?.reviewCalloutDismissed !== true && (state.settings?.common?.successfulDownloadCount ?? 0) > 0

	function toggleRow(row: ReviewRow): void {
		setWizardReviewRow(wizardReviewRow === row ? null : row)
		if (reviewCalloutPending) void dismissReviewCallout()
	}
	const translate = createTranslationPort(t)
	const summary = buildSingleSettingsSummary(state, {t: translate, language: i18n.language})
	const review = buildDownloadReview(state, {t: translate, language: i18n.language, commonPaths: state.commonPaths})
	const rows = reviewRowEntries(state, summary)
	const caveat = mp4CaveatCodec(state)
	const size = review.summaryRows.find(row => row.key === 'size')?.value

	return (
		<div className="wizard-step flex flex-col gap-4" data-testid="step-review">
			<ReviewPageCallout />

			<ReviewFormatStrip state={state} review={review} onChangeFormat={() => goToStep('formats')} />

			<div className="flex flex-col gap-1.5">
				<SectionLabel>{t('wizard.review.rowsHeading')}</SectionLabel>
				<Card className="gap-0 overflow-hidden py-0">
					{rows.map(({row, value, fields}) => (
						<ReviewRowItem key={row} row={row} value={value} open={wizardReviewRow === row} onToggle={() => toggleRow(row)}>
							{fields}
						</ReviewRowItem>
					))}
				</Card>
			</div>

			{review.conflictWarnings.length > 0 || caveat !== null ? <ReviewWarnings caveat={caveat} conflicts={review.conflictWarnings} /> : null}

			<WizardFooter
				extraAbove={<ProfileEditLine />}
				info={
					size ? (
						<>
							{t('wizard.formats.total')} <span className="text-headline font-bold text-primary">{size}</span>
						</>
					) : undefined
				}
			>
				<Button variant="outline" type="button" onClick={() => goToStep('formats')} data-testid="btn-back">
					{t('common.back')}
				</Button>
				<SingleDownloadActions />
			</WizardFooter>
		</div>
	)
}
