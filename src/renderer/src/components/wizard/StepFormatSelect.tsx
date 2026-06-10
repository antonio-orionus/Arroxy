import {useMemo, useState, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {useShallow} from 'zustand/react/shallow'
import {useAppStore} from '../../store/useAppStore.js'
import {useFormatSelectionView, type FormatSelectionFilters} from '../../store/formatSelectionView.js'
import {VideoSummaryCard} from '../shared/VideoSummaryCard.js'
import {Spinner} from '../ui/spinner.js'
import downloadingImg from '../../assets/Downloading.png'
import {PresetStrip} from './format/PresetStrip.js'
import {VideoColumn} from './format/VideoColumn.js'
import {BotWallNotice} from './format/BotWallNotice.js'
import {AudioColumn} from './format/AudioColumn.js'
import {FormatFooter} from './format/FormatFooter.js'

export function StepFormatSelect(): ReactNode {
	const {t} = useTranslation()
	const {formatsLoading, wizardTitle, wizardThumbnail, wizardDuration, wizardWebpageUrl, selectedVideoFormatId, audioSelection, activePreset, setSelectedVideoFormatId, setAudioSelection, setPreset, advance, back, skipToConfirm} = useAppStore(
		useShallow(state => ({
			formatsLoading: state.formatsLoading,
			wizardTitle: state.wizardTitle,
			wizardThumbnail: state.wizardThumbnail,
			wizardDuration: state.wizardDuration,
			wizardWebpageUrl: state.wizardWebpageUrl,
			selectedVideoFormatId: state.selectedVideoFormatId,
			audioSelection: state.audioSelection,
			activePreset: state.activePreset,
			setSelectedVideoFormatId: state.setSelectedVideoFormatId,
			setAudioSelection: state.setAudioSelection,
			setPreset: state.setPreset,
			advance: state.advance,
			back: state.back,
			skipToConfirm: state.skipToConfirm
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
				<div className="rounded-2xl bg-[var(--brand-dim)] p-4 shadow-[0_0_28px_var(--brand-glow)]">
					<img src={downloadingImg} alt="" aria-hidden className="size-28 object-contain" />
				</div>
				<div className="relative rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-muted-foreground leading-relaxed shadow-sm text-center max-w-[260px]">
					<span aria-hidden className="absolute -top-[7px] left-1/2 -translate-x-1/2 w-0 h-0" style={{borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '7px solid var(--border)'}} />
					<span aria-hidden className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-0 h-0" style={{borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '7px solid var(--secondary)'}} />
					{t('wizard.formats.sniffing')}
				</div>
				<div className="flex items-center gap-2 text-xs text-[var(--text-subtle)]">
					<Spinner aria-label={t('wizard.formats.loadingAria')} />
					<span>{t('wizard.formats.loadingHint')}</span>
				</div>
			</div>
		)
	}

	return (
		<div className="wizard-step flex flex-col gap-3" data-testid="step-formats">
			<VideoSummaryCard thumbnail={wizardThumbnail} title={wizardTitle} duration={wizardDuration} resolution={view.currentResolutionLabel} webpageUrl={wizardWebpageUrl} />

			<PresetStrip activePreset={activePreset} onSelect={setPreset} />

			<BotWallNotice />

			<div className="grid grid-cols-2 gap-[20px]">
				<VideoColumn view={view.video} selectedVideoFormatId={selectedVideoFormatId} videoExtFilter={videoExtFilter} dynamicRangeFilter={dynamicRangeFilter} onVideoExtFilterChange={setVideoExtFilter} onDynamicRangeFilterChange={setDynamicRangeFilter} onSelect={setSelectedVideoFormatId} />
				<AudioColumn view={view.audio} mode={view.mode} audioSelection={audioSelection} audioExtFilter={audioExtFilter} onAudioExtFilterChange={setAudioExtFilter} onSelect={setAudioSelection} />
			</div>

			<FormatFooter view={view} onBack={back} onContinue={advance} onSkipToConfirm={skipToConfirm} />
		</div>
	)
}
