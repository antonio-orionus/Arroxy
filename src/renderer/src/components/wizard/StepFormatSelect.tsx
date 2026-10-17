import {useMemo, useState, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {useShallow} from 'zustand/react/shallow'
import {useAppStore} from '../../store/useAppStore.js'
import {useFormatSelectionView, type FormatSelectionFilters} from '../../store/formatSelectionView.js'
import {VideoSummaryCard} from '../shared/VideoSummaryCard.js'
import {Spinner} from '../ui/spinner.js'
import downloadingImg from '../../assets/Downloading.png'
import {VideoColumn} from './format/VideoColumn.js'
import {BotWallNotice} from './format/BotWallNotice.js'
import {AudioColumn} from './format/AudioColumn.js'
import {FormatFooter} from './format/FormatFooter.js'
import {WizardProfileLine} from './format/WizardProfileLine.js'
import {FitNotices} from './format/FitNotices.js'
import {ProfileSummary} from './format/ProfileSummary.js'
import {UrlStartOffer, VideoPartPanel, VideoPartSwitch} from './format/VideoPartControls.js'
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
	const [videoExtFilter, setVideoExtFilter] = useState<string | null>(null)
	const [dynamicRangeFilter, setDynamicRangeFilter] = useState<string | null>(null)
	const [audioExtFilter, setAudioExtFilter] = useState<string | null>(null)
	const filters = useMemo<FormatSelectionFilters>(() => ({audioExt: audioExtFilter, dynamicRange: dynamicRangeFilter, videoExt: videoExtFilter}), [audioExtFilter, dynamicRangeFilter, videoExtFilter])
	const view = useFormatSelectionView(filters)

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
			<VideoSummaryCard thumbnail={wizardThumbnail} title={wizardTitle} duration={wizardDuration} resolution={view.currentResolutionLabel} webpageUrl={wizardWebpageUrl} chapterCount={chapterCount} action={<VideoPartSwitch />} />

			<UrlStartOffer />

			<VideoPartPanel />

			<WizardProfileLine />

			<FitNotices />

			<BotWallNotice />

			{wizardMediaKind === 'subtitles' ? (
				<SubtitleFields withMedia={false} />
			) : wizardMediaKind === 'audio' ? (
				<AudioColumn view={view.audio} mode={view.mode} audioSelection={audioSelection} audioExtFilter={audioExtFilter} onAudioExtFilterChange={setAudioExtFilter} onSelect={setAudioSelection} />
			) : (
				<div className="grid grid-cols-2 gap-[20px]">
					<VideoColumn view={view.video} selectedVideoFormatId={selectedVideoFormatId} videoExtFilter={videoExtFilter} dynamicRangeFilter={dynamicRangeFilter} onVideoExtFilterChange={setVideoExtFilter} onDynamicRangeFilterChange={setDynamicRangeFilter} onSelect={setSelectedVideoFormatId} />
					<AudioColumn view={view.audio} mode={view.mode} audioSelection={audioSelection} audioExtFilter={audioExtFilter} onAudioExtFilterChange={setAudioExtFilter} onSelect={setAudioSelection} />
				</div>
			)}

			<ProfileSummary />

			<FormatFooter view={view} onBack={back} onReview={() => openReview(null)} />
		</div>
	)
}
