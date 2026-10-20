import {useEffect, useState, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {useShallow} from 'zustand/react/shallow'
import {useAppStore} from '../../store/useAppStore.js'
import {useFormatSelectionView} from '../../store/formatSelectionView.js'
import {formatMode} from '../../store/wizard/formatMode.js'
import {VideoSummaryCard} from '../shared/VideoSummaryCard.js'
import {Spinner} from '../ui/spinner.js'
import {Button} from '../ui/button.js'
import downloadingImg from '../../assets/Downloading.png'
import {VideoColumn} from './format/VideoColumn.js'
import {BotWallNotice} from './format/BotWallNotice.js'
import {RateLimitNotice} from './format/RateLimitNotice.js'
import {AudioColumn} from './format/AudioColumn.js'
import {FormatFooter} from './format/FormatFooter.js'
import {WizardProfileLine} from './format/WizardProfileLine.js'
import {FitNotices} from './format/FitNotices.js'
import {FormatProfileCallout} from './format/FormatProfileCallout.js'
import {UrlStartOffer, VideoPartCallout, VideoPartPanel, VideoPartSwitch} from './format/VideoPartControls.js'
import {SubtitleFields} from './SubtitleFields.js'
import {SpeechBubble} from '../shared/SpeechBubble.js'

// Cancel waits this long for users: most probes finish well before it, and a
// button that flashes on every quick probe would be noise. Dev builds show it at once.
const CANCEL_DELAY_MS = 120_000

function useShownAfter(delayMs: number): boolean {
	const [shown, setShown] = useState(delayMs === 0)
	useEffect(() => {
		if (delayMs === 0) return
		const timer = window.setTimeout(() => setShown(true), delayMs)
		return () => window.clearTimeout(timer)
	}, [delayMs])
	return shown
}

function FormatsLoading({onCancel}: {onCancel: () => void}): ReactNode {
	const {t} = useTranslation()
	const cancelShown = useShownAfter(import.meta.env.DEV ? 0 : CANCEL_DELAY_MS)
	return (
		<div className="wizard-step flex flex-col items-center gap-4 py-8">
			<div className="rounded-2xl bg-primary/12 p-4 shadow-glow">
				<img src={downloadingImg} alt="" aria-hidden className="size-28 object-contain" />
			</div>
			<SpeechBubble tail="top" className="max-w-64 text-center text-sm text-muted-foreground">
				{t('wizard.formats.sniffing')}
			</SpeechBubble>
			<div className="flex items-center gap-2 text-xs text-subtle-foreground">
				<Spinner aria-label={t('wizard.formats.loadingAria')} />
				<span>{t('wizard.formats.loadingHint')}</span>
			</div>
			{cancelShown ? (
				<Button type="button" variant="outline" onClick={onCancel} data-testid="btn-cancel-probe">
					{t('common.cancel')}
				</Button>
			) : null}
		</div>
	)
}

// Single video, screen 1: what to download. Every option comes from the probe;
// the download profile only decides what starts selected.
export function StepFormatSelect(): ReactNode {
	const {formatsLoading, wizardTitle, wizardThumbnail, wizardDuration, wizardWebpageUrl, wizardMediaKind, chapterCount, selectedVideoFormatId, audioSelection, setSelectedVideoFormatId, setAudioSelection, back, openReview, cancelWizardProbe, silent} = useAppStore(
		useShallow(state => ({
			formatsLoading: state.formatsLoading,
			wizardTitle: state.wizardTitle,
			wizardThumbnail: state.wizardThumbnail,
			wizardDuration: state.wizardDuration,
			wizardWebpageUrl: state.wizardWebpageUrl,
			wizardMediaKind: state.wizardMediaKind,
			chapterCount: state.wizardChapters.length,
			selectedVideoFormatId: state.selectedVideoFormatId,
			audioSelection: state.audioSelection,
			setSelectedVideoFormatId: state.setSelectedVideoFormatId,
			setAudioSelection: state.setAudioSelection,
			back: state.back,
			openReview: state.openReview,
			cancelWizardProbe: state.cancelWizardProbe,
			silent: formatMode(state) === 'video-only'
		}))
	)
	const view = useFormatSelectionView()

	if (formatsLoading) return <FormatsLoading onCancel={cancelWizardProbe} />

	return (
		<div className="wizard-step wizard-step-column flex flex-col gap-3" data-testid="step-formats">
			{/* The step column caps this so a wide window keeps related controls (the mode switch, Whole video / Part) near what they act on. */}
			<div className="@container flex flex-col gap-3">
				<VideoSummaryCard thumbnail={wizardThumbnail} title={wizardTitle} duration={wizardDuration} resolution={view.currentResolutionLabel} webpageUrl={wizardWebpageUrl} chapterCount={chapterCount} action={<VideoPartSwitch />} />

				<VideoPartCallout />

				<UrlStartOffer />

				<VideoPartPanel />

				<FormatProfileCallout />

				<WizardProfileLine />

				<FitNotices />

				<BotWallNotice />

				<RateLimitNotice />

				{wizardMediaKind === 'subtitles' ? (
					<SubtitleFields withMedia={false} />
				) : wizardMediaKind === 'audio' ? (
					<AudioColumn view={view.audio} mode={view.mode} audioSelection={audioSelection} onSelect={setAudioSelection} />
				) : (
					// Stacked while the step is under 36rem wide (a zoomed minimum window), halves up to lg (`max-lg:` keeps the container query from overriding the next rule); from lg both lists sit at their own width, so a wide window adds no gap between them. The container is this wrapper, never a column: a size-contained column could not take its chips' width.
					<div className="grid grid-cols-1 gap-5 @xl:max-lg:grid-cols-[auto_minmax(0,1fr)] lg:grid-cols-[auto_minmax(0,auto)] lg:justify-start lg:gap-x-12">
						<VideoColumn view={view.video} selectedVideoFormatId={selectedVideoFormatId} onSelect={setSelectedVideoFormatId} />
						{silent ? null : <AudioColumn view={view.audio} mode={view.mode} audioSelection={audioSelection} onSelect={setAudioSelection} />}
					</div>
				)}
			</div>

			<FormatFooter view={view} onBack={back} onContinue={() => openReview(null)} />
		</div>
	)
}
