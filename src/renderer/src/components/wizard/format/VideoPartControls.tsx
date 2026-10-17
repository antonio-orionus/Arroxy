import {useId, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {Clock, Info} from 'lucide-react'
import {useShallow} from 'zustand/react/shallow'
import {formatPartTime, parsePartTime, type VideoPartError} from '@shared/videoPart.js'
import {useAppStore} from '../../../store/useAppStore.js'
import {partUnavailableReason, wizardPartValidation, type PartUnavailableReason} from '../../../store/wizard/videoPart.js'
import {Button} from '../../ui/button.js'
import {Card} from '../../ui/card.js'
import {Field, FieldDescription, FieldError, FieldLabel} from '../../ui/field.js'
import {Input} from '../../ui/input.js'
import {Slider} from '../../ui/slider.js'
import {ToggleGroup, ToggleGroupItem} from '../../ui/toggle-group.js'
import {CheckRow} from '../../shared/CheckRow.js'
import {Hint} from '../../shared/Hint.js'
import {SectionLabel} from '../../shared/SectionLabel.js'

const UNAVAILABLE_KEYS = {subtitles: 'wizard.part.unavailableSubtitles', noDuration: 'wizard.part.unavailableDuration'} as const satisfies Record<PartUnavailableReason, string>

const ERROR_KEYS = {durationUnknown: 'wizard.part.unavailableDuration', startInvalid: 'wizard.part.error.startInvalid', endInvalid: 'wizard.part.error.endInvalid', startNotBeforeEnd: 'wizard.part.error.startNotBeforeEnd', endBeyondDuration: 'wizard.part.error.endBeyondDuration'} as const satisfies Record<
	VideoPartError,
	string
>

type PartScope = 'whole' | 'part'

// The video card's Whole video / Part switch. Disabled, with the reason as a
// hint, where a part can't apply (Subtitles mode, no known length).
export function VideoPartSwitch(): ReactNode {
	const {t} = useTranslation()
	const {partOn, unavailable, setEnabled} = useAppStore(useShallow(state => ({partOn: state.wizardPart !== null, unavailable: partUnavailableReason(state), setEnabled: state.setWizardPartEnabled})))
	const scope: PartScope = partOn && unavailable === null ? 'part' : 'whole'
	return (
		<Hint label={unavailable ? t(UNAVAILABLE_KEYS[unavailable]) : undefined}>
			<ToggleGroup
				size="sm"
				variant="outline"
				spacing={1}
				value={[scope]}
				onValueChange={values => {
					if (values[0] === 'whole' || values[0] === 'part') setEnabled(values[0] === 'part')
				}}
				disabled={unavailable !== null}
				aria-label={t('wizard.part.switchLabel')}
				className="shrink-0"
				data-testid="video-part-switch"
			>
				<ToggleGroupItem value="whole" data-testid="video-part-whole">
					{t('wizard.part.whole')}
				</ToggleGroupItem>
				<ToggleGroupItem value="part" data-testid="video-part-part">
					{t('wizard.part.part')}
				</ToggleGroupItem>
			</ToggleGroup>
		</Hint>
	)
}

// "Your link starts at 3:52 · Use as start": a `t` in a link is offered, never
// applied, because shared links often carry it only as a resume point.
export function UrlStartOffer(): ReactNode {
	const {t} = useTranslation()
	const {start, duration, partStart, available, useUrlStart} = useAppStore(
		useShallow(state => ({start: state.wizardUrlStartSeconds, duration: state.wizardDuration, partStart: state.wizardPart === null ? null : parsePartTime(state.wizardPart.start), available: partUnavailableReason(state) === null, useUrlStart: state.useUrlStartForPart}))
	)
	if (start === null || !available || duration === undefined || start >= duration || partStart === start) return null
	return (
		<p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-muted-foreground" data-testid="video-part-url-start">
			<Clock className="size-3.5 shrink-0" aria-hidden />
			{t('wizard.part.urlStart', {time: formatPartTime(start)})}
			<span aria-hidden>·</span>
			<Button type="button" variant="link" size="inline" onClick={useUrlStart} data-testid="video-part-use-url-start">
				{t('wizard.part.useUrlStart')}
			</Button>
		</p>
	)
}

// The range itself: a bar with chapter marks, Start and End fields, chapter
// chips that set both ends, and the exact-cut choice.
export function VideoPartPanel(): ReactNode {
	const {t} = useTranslation()
	const startId = useId()
	const endId = useId()
	const exactId = useId()
	const state = useAppStore(useShallow(s => ({part: s.wizardPart, duration: s.wizardDuration, mediaKind: s.wizardMediaKind, chapters: s.wizardChapters, setStart: s.setWizardPartStart, setEnd: s.setWizardPartEnd, setRange: s.setWizardPartRange, setExactCut: s.setWizardPartExactCut})))
	const {part, duration, chapters} = state
	if (part === null || duration === undefined || partUnavailableReason({wizardDuration: duration, wizardMediaKind: state.mediaKind}) !== null) return null

	const validation = wizardPartValidation({wizardPart: part, wizardDuration: duration, wizardMediaKind: state.mediaKind})
	const error = validation?.ok === false ? validation.error : null
	const startSeconds = Math.min(parsePartTime(part.start) ?? 0, duration)
	const endSeconds = Math.min(parsePartTime(part.end) ?? duration, duration)
	const sliderValue = startSeconds < endSeconds ? [startSeconds, endSeconds] : [0, duration]
	const marks = chapters.flatMap(chapter => (chapter.startSeconds > 0 && chapter.startSeconds < duration ? [(chapter.startSeconds / duration) * 100] : []))
	const selectedChapter = chapters.findIndex(chapter => chapter.startSeconds === startSeconds && chapter.endSeconds === endSeconds)
	const startInvalid = error === 'startInvalid' || error === 'startNotBeforeEnd'
	const endInvalid = error === 'endInvalid' || error === 'endBeyondDuration'

	return (
		<Card size="sm" className="gap-3 px-3.5 py-3" data-testid="video-part-panel">
			<Slider
				min={0}
				max={duration}
				step={1}
				minStepsBetweenValues={1}
				value={sliderValue}
				marks={marks}
				thumbLabels={[t('wizard.part.start'), t('wizard.part.end')]}
				aria-label={t('wizard.part.rangeLabel')}
				onValueChange={(value: number | readonly number[]) => {
					if (typeof value === 'number') return
					const [start, end] = value
					if (start !== undefined && end !== undefined) state.setRange(start, end)
				}}
				data-testid="video-part-range"
			/>

			<div className="flex flex-wrap items-start gap-3">
				<Field className="w-32 gap-1">
					<FieldLabel htmlFor={startId}>{t('wizard.part.start')}</FieldLabel>
					<Input id={startId} type="text" inputMode="numeric" value={part.start} onChange={event => state.setStart(event.target.value)} aria-invalid={startInvalid} className="font-mono" data-testid="video-part-start" />
				</Field>
				<Field className="w-32 gap-1">
					<FieldLabel htmlFor={endId}>{t('wizard.part.end')}</FieldLabel>
					<Input id={endId} type="text" inputMode="numeric" value={part.end} onChange={event => state.setEnd(event.target.value)} aria-invalid={endInvalid} className="font-mono" data-testid="video-part-end" />
				</Field>
				<div className="flex min-w-0 flex-1 flex-col gap-1 self-end pb-1.5 text-caption text-subtle-foreground">
					{error ? <FieldError data-testid="video-part-error">{t(ERROR_KEYS[error], {duration: formatPartTime(duration)})}</FieldError> : <span data-testid="video-part-length">{t('wizard.part.length', {length: formatPartTime(endSeconds - startSeconds), duration: formatPartTime(duration)})}</span>}
					<span>{t('wizard.part.timeHint')}</span>
				</div>
			</div>

			{chapters.length > 0 ? (
				<div className="flex flex-col gap-1.5">
					<SectionLabel>{t('wizard.part.chapters')}</SectionLabel>
					<ToggleGroup
						size="xs"
						variant="outline"
						spacing={1}
						value={selectedChapter >= 0 ? [String(selectedChapter)] : []}
						onValueChange={values => {
							const chapter = chapters[Number(values[0])]
							if (values[0] !== undefined && chapter) state.setRange(chapter.startSeconds, Math.min(chapter.endSeconds, duration))
						}}
						aria-label={t('wizard.part.chapters')}
						className="flex-wrap gap-1"
						data-testid="video-part-chapters"
					>
						{chapters.map((chapter, index) => (
							<ToggleGroupItem key={`${chapter.startSeconds}-${chapter.endSeconds}`} value={String(index)} shape="chip" data-testid={`video-part-chapter-${index}`}>
								{chapter.title || t('wizard.part.chapterUntitled', {number: index + 1})} · {formatPartTime(chapter.startSeconds)}
							</ToggleGroupItem>
						))}
					</ToggleGroup>
				</div>
			) : null}

			<div className="flex flex-col gap-0.5">
				<CheckRow id={exactId} label={t('wizard.part.exactCut.label')} checked={part.exactCut} onCheckedChange={state.setExactCut} testId="video-part-exact-cut" />
				<FieldDescription className="ps-8">{t('wizard.part.exactCut.hint')}</FieldDescription>
			</div>

			<p className="flex items-start gap-1.5 text-caption text-subtle-foreground" data-testid="video-part-connections-note">
				<Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
				{t('wizard.part.connectionsNote')}
			</p>
		</Card>
	)
}
