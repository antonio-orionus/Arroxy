import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {useShallow} from 'zustand/react/shallow'
import {Captions, FileText, Folder, Layers, Scissors, TriangleAlert, type LucideIcon} from 'lucide-react'
import {validateFilenameTemplate} from '@shared/filenameTemplate.js'
import {useAppStore} from '../../store/useAppStore.js'
import {selectWizardReviewState, type WizardReviewState} from '../../store/wizard/wizardReviewState.js'
import type {ReviewRow} from '../../store/wizard/profileApplication.js'
import {buildDownloadReview, conflictLabelKey, type DownloadReview} from '../../store/wizard/downloadReviewProjection.js'
import {buildSingleSettingsSummary, sponsorBlockApplies, type SingleSettingsSummary} from '../../store/wizard/singleSettingsSummary.js'
import {mp4CaveatCodec, resolveOutputContainer} from '../../store/wizard/resolveContainer.js'
import type {Mp4Caveat} from '@shared/fileTypeFit.js'
import {createTranslationPort} from '../../lib/translation.js'
import {useQuickTimeHost} from '../../lib/quickTimeHost.js'
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from '../ui/accordion.js'
import {Alert, AlertDescription} from '../ui/alert.js'
import {Button} from '../ui/button.js'
import {Card} from '../ui/card.js'
import {SectionLabel} from '../shared/SectionLabel.js'
import {FilenameTemplateField} from '../shared/FilenameTemplateField.js'
import {WizardFooter} from './WizardFooter.js'
import {SingleDownloadActions} from './SingleDownloadActions.js'
import {SubtitleFields} from './SubtitleFields.js'
import {SponsorBlockFields} from './StepSponsorBlock.js'
import {OutputFields} from './StepOutput.js'
import {FolderFields} from './StepFolderConfirm.js'
import {Hint} from '../shared/Hint.js'
import {ReviewPageCallout} from './ReviewPageCallout.js'
import {ProfileEditLine} from './ProfileEditLine.js'
import {wizardChangedAreas} from '../../store/wizard/wizardProfileState.js'
import {cn} from '../../lib/utils.js'
import {wizardVideoPart} from '../../store/wizard/videoPart.js'
import {formatPartTime} from '@shared/videoPart.js'
import {useProfileDisplayName} from '@renderer/lib/profileName.js'

const ROW_LABEL_KEYS = {subtitles: 'wizard.review.rows.subtitles', sponsorBlock: 'wizard.review.rows.sponsorBlock', extras: 'wizard.review.rows.extras', saveTo: 'wizard.review.rows.saveTo', fileName: 'wizard.review.rows.fileName'} as const satisfies Record<ReviewRow, string>

const ROW_ICONS = {subtitles: Captions, sponsorBlock: Scissors, extras: Layers, saveTo: Folder, fileName: FileText} as const satisfies Record<ReviewRow, LucideIcon>

function FileNameFields(): ReactNode {
	const {t} = useTranslation()
	const template = useAppStore(state => state.wizardFilenameTemplate)
	const setTemplate = useAppStore(state => state.setWizardFilenameTemplate)
	const validation = validateFilenameTemplate(template)
	return <FilenameTemplateField value={template} onChange={setTemplate} error={validation.ok ? null : validation} label={t('wizard.review.rows.fileName')} description={t('filenameTemplate.description')} testId="review-filename-input" singleVideo />
}

interface ReviewRowItemProps {
	row: ReviewRow
	value: string
	off: boolean
	changedFrom: string | null
	children: ReactNode
}

// One Review row: label and current value; opens its editor in place. A value
// that is on reads brighter than one that is off, and a dot marks a row this
// run changed from its profile. Rows share the accordion's columns (subgrid),
// so the label column fits the longest label and labels never wrap.
function ReviewRowItem({row, value, off, changedFrom, children}: ReviewRowItemProps): ReactNode {
	const {t} = useTranslation()
	const Icon = ROW_ICONS[row]
	return (
		<AccordionItem value={row} className="col-span-full grid grid-cols-subgrid transition-colors data-open:bg-primary/5" data-testid={`review-row-${row}`}>
			<AccordionTrigger headerClassName="col-span-full grid grid-cols-subgrid" className="col-span-full grid grid-cols-subgrid items-center gap-x-3 rounded-none px-4 py-3.5 hover:bg-muted/60 hover:no-underline focus-visible:ring-inset" data-testid={`review-row-${row}-toggle`}>
				<Icon aria-hidden className="size-4 shrink-0 text-subtle-foreground transition-colors group-hover/accordion-trigger:text-muted-foreground group-aria-expanded/accordion-trigger:text-primary" />
				<span className="flex min-w-28 items-center gap-1.5 font-semibold whitespace-nowrap text-foreground">
					{changedFrom ? <span className="sr-only">{changedFrom}</span> : null}
					<span>{t(ROW_LABEL_KEYS[row])}</span>
					{changedFrom ? <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-primary" data-testid={`review-row-${row}-changed`} /> : null}
				</span>
				<Hint label={value} reveal>
					<span className={cn('min-w-0 flex-1 truncate font-normal', off ? 'text-muted-foreground' : 'text-foreground', row === 'fileName' && 'font-mono')} data-value-state={off ? 'off' : 'on'} data-testid={`review-row-${row}-value`}>
						{value}
					</span>
				</Hint>
			</AccordionTrigger>
			<AccordionContent className="flex flex-col gap-3 px-4 pt-1 pb-4">{children}</AccordionContent>
		</AccordionItem>
	)
}

interface ReviewRowEntry {
	row: ReviewRow
	value: string
	off: boolean
	fields: ReactNode
}

// The rows this run has: subtitles only when the video offers some or they are
// on, SponsorBlock only where it applies, extras only with media.
function reviewRowEntries(state: WizardReviewState, summary: SingleSettingsSummary): ReviewRowEntry[] {
	const kind = state.wizardMediaKind
	return [
		...(summary.subtitlesAvailable > 0 || summary.subtitlesOn ? [{row: 'subtitles' as const, value: summary.subtitles, off: !summary.subtitlesOn, fields: <SubtitleFields withMedia={kind !== 'subtitles'} />}] : []),
		...(sponsorBlockApplies(state) && summary.sponsorBlock !== null ? [{row: 'sponsorBlock' as const, value: summary.sponsorBlock, off: state.wizardSponsorBlockMode === 'off', fields: <SponsorBlockFields />}] : []),
		...(kind === 'subtitles' ? [] : [{row: 'extras' as const, value: summary.extras, off: !summary.extrasOn, fields: <OutputFields />}]),
		{row: 'saveTo', value: summary.saveTo, off: false, fields: <FolderFields persist={false} />},
		{row: 'fileName', value: summary.fileName, off: false, fields: <FileNameFields />}
	]
}

// The chosen streams in one line: part, video, audio and the file type it saves as.
function ReviewFormatStrip({state, review, onChangeFormat}: {state: WizardReviewState; review: DownloadReview; onChangeFormat: () => void}): ReactNode {
	const {t} = useTranslation()
	const kind = state.wizardMediaKind
	const savesAs = kind === 'video' ? t('wizard.formats.savesAs.value', {ext: resolveOutputContainer(state.selectedVideoFormatId, state.audioSelection, state.wizardSubtitleMode, state.wizardFormats, kind, state.wizardEmbedThumbnail, state.wizardFileType)}) : null
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
	const nameOf = useProfileDisplayName()
	const state = useAppStore(useShallow(selectWizardReviewState))
	const {wizardReviewRow, setWizardReviewRow, goToStep, dismissReviewCallout} = useAppStore(useShallow(s => ({wizardReviewRow: s.wizardReviewRow, setWizardReviewRow: s.setWizardReviewRow, goToStep: s.goToStep, dismissReviewCallout: s.dismissReviewCallout})))
	const quickTimeHost = useQuickTimeHost()
	const reviewCalloutPending = state.settings?.common?.reviewCalloutDismissed !== true && (state.settings?.common?.successfulDownloadCount ?? 0) > 0

	function openRow(row: ReviewRow | null): void {
		setWizardReviewRow(row)
		if (reviewCalloutPending) void dismissReviewCallout()
	}
	const translate = createTranslationPort(t)
	const summary = buildSingleSettingsSummary(state, {t: translate, language: i18n.language})
	const review = buildDownloadReview(state, {t: translate, language: i18n.language, commonPaths: state.commonPaths})
	const rows = reviewRowEntries(state, summary)
	const changed = wizardChangedAreas(state)
	const changedFrom = t('wizard.review.changedFrom', {profile: state.wizardProfile ? nameOf(state.wizardProfile) : ''})
	const caveat = mp4CaveatCodec(state, quickTimeHost)
	const size = review.summaryRows.find(row => row.key === 'size')?.value

	return (
		<div className="wizard-step wizard-step-column flex flex-col gap-4" data-testid="step-review">
			<ReviewPageCallout />

			<ReviewFormatStrip state={state} review={review} onChangeFormat={() => goToStep('formats')} />

			<div className="flex flex-col gap-1.5">
				<SectionLabel>{t('wizard.review.rowsHeading')}</SectionLabel>
				<Card className="gap-0 overflow-hidden py-0">
					<Accordion<ReviewRow> className="grid grid-cols-[auto_max-content_minmax(0,1fr)_auto]" value={wizardReviewRow ? [wizardReviewRow] : []} onValueChange={next => openRow(next[0] ?? null)}>
						{rows.map(({row, value, off, fields}) => (
							<ReviewRowItem key={row} row={row} value={value} off={off} changedFrom={changed.includes(row) ? changedFrom : null}>
								{fields}
							</ReviewRowItem>
						))}
					</Accordion>
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
