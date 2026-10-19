import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {useShallow} from 'zustand/react/shallow'
import {useAppStore} from '../../store/useAppStore.js'
import {useFormatSelectionView} from '../../store/formatSelectionView.js'
import {VideoSummaryCard} from '../shared/VideoSummaryCard.js'
import {Spinner} from '../ui/spinner.js'
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

// Single video, screen 1: what to download. Every option comes from the probe;
// the download profile only decides what starts selected.
export function StepFormatSelect(): ReactNode {
	const {t} = useTranslation()
	const {formatsLoading, wizardTitle, wizardThumbnail, wizardDuration, wizardWebpageUrl, wizardMediaKind, chapterCount, selectedVideoFormatId, audioSelection, setSelectedVideoFormatId, setAudioSelection, back, openReview} = useAppStore(
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
			openReview: state.openReview
		}))
	)
	const view = useFormatSelectionView()

	if (formatsLoading) {
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
			</div>
		)
	}

	return (
		<div className="wizard-step flex flex-col gap-3" data-testid="step-formats">
			{/* Capped so a wide window keeps related controls (the mode switch, Whole video / Part) near what they act on. */}
			<div className="@container flex w-full max-w-6xl flex-col gap-3">
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
					<div className="grid grid-cols-1 gap-5 @xl:max-lg:grid-cols-2 lg:grid-cols-[auto_minmax(0,auto)] lg:justify-start lg:gap-x-12">
						<VideoColumn view={view.video} selectedVideoFormatId={selectedVideoFormatId} onSelect={setSelectedVideoFormatId} />
						<AudioColumn view={view.audio} mode={view.mode} audioSelection={audioSelection} onSelect={setAudioSelection} />
					</div>
				)}
			</div>

			<FormatFooter view={view} onBack={back} onReview={() => openReview(null)} />
		</div>
	)
}
