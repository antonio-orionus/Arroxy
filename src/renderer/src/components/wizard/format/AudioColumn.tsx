import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import type {AudioBitrate, AudioConvertTarget} from '@shared/types.js'
import {AUDIO_BITRATES, type AudioTrackQuality} from '@shared/schemas.js'
import type {AudioSelection} from '../../../store/types.js'
import type {FormatSelectionView} from '../../../store/formatSelectionView.js'
import {ToggleGroup, ToggleGroupItem} from '../../ui/toggle-group.js'
import {Tooltip, TooltipTrigger, TooltipContent} from '../../ui/tooltip.js'
import {RadioGroup} from '../../ui/radio-group.js'
import {ChoiceRow} from '../../shared/ChoiceRow.js'
import {ScrollArea} from '../../ui/scroll-area.js'
import {MascotBubble} from '../../shared/MascotBubble.js'
import {cn} from '@renderer/lib/utils.js'
import choosingImg from '../../../assets/Choosing.png'
import {SectionLabel} from '../../shared/SectionLabel.js'

interface AudioColumnProps {
	view: FormatSelectionView['audio']
	mode: FormatSelectionView['mode']
	audioSelection: AudioSelection
	audioExtFilter: string | null
	onAudioExtFilterChange: (value: string | null) => void
	onSelect: (sel: AudioSelection) => void
}

const QUALITY_ICON_CLASS: Record<AudioTrackQuality, string> = {high: 'text-success', medium: 'text-info', low: 'text-warning'}
const QUALITY_BAR_COUNT: Record<AudioTrackQuality, number> = {high: 3, medium: 2, low: 1}
const QUALITY_LABEL_KEY: Record<AudioTrackQuality, 'wizard.formats.quality.high' | 'wizard.formats.quality.medium' | 'wizard.formats.quality.low'> = {high: 'wizard.formats.quality.high', medium: 'wizard.formats.quality.medium', low: 'wizard.formats.quality.low'}

function QualityBadge({quality, label}: {quality: AudioTrackQuality; label: string}): ReactNode {
	const activeBars = QUALITY_BAR_COUNT[quality]
	return (
		<Tooltip>
			<TooltipTrigger
				render={props => (
					<span {...props} aria-label={label} data-testid={`audio-quality-${quality}`} className={cn('inline-flex size-4.5 shrink-0 items-center justify-center rounded-full border border-border-strong bg-background/40', QUALITY_ICON_CLASS[quality])}>
						<span aria-hidden className="flex h-[10px] items-end gap-[1px]">
							{[1, 2, 3].map(index => (
								<span key={index} className={cn('w-[2px] rounded-full bg-current transition-opacity', index === 1 && 'h-[4px]', index === 2 && 'h-[7px]', index === 3 && 'h-[10px]', index > activeBars && 'opacity-20')} />
							))}
						</span>
					</span>
				)}
			/>
			<TooltipContent>{label}</TooltipContent>
		</Tooltip>
	)
}

export function AudioColumn({view, mode, audioSelection, audioExtFilter, onAudioExtFilterChange, onSelect}: AudioColumnProps): ReactNode {
	const {t} = useTranslation()
	const subtitleOnly = mode === 'subtitle-only'

	// The radio group speaks strings; these encode and decode the three selection kinds.
	const selectedValue = audioSelection.kind === 'none' ? 'none' : audioSelection.kind === 'native' ? `native:${audioSelection.formatId}` : `convert:${audioSelection.target}`
	// A disabled row never reads as chosen, even though the store keeps the selection.
	const selectedRowDisabled = audioSelection.kind === 'none' ? view.noAudioDisabled : audioSelection.kind === 'native' ? subtitleOnly : subtitleOnly || view.convertDisabled
	const selectValue = (value: string): void => {
		if (value === 'none') return onSelect({kind: 'none'})
		const native = view.nativeRows.find(row => `native:${row.formatId}` === value)
		if (native) return onSelect({kind: 'native', formatId: native.formatId})
		const target = view.convertTargets.find(candidate => `convert:${candidate}` === value)
		if (target) onSelect(pickConvert(target))
	}

	const pickConvert = (target: AudioConvertTarget): AudioSelection => (target === 'wav' ? {kind: 'convert-lossless', target: 'wav'} : {kind: 'convert-lossy', target, bitrateKbps: view.bitrateStrip.value})

	const bitrateStrip = (
		<div className={cn('flex items-center justify-between mt-2 px-1 transition-opacity', view.bitrateStrip.blocked && 'opacity-40 pointer-events-none')} data-testid="audio-bitrate-strip">
			<SectionLabel render={<span />}>{t('wizard.formats.convert.bitrate')}</SectionLabel>
			<ToggleGroup
				size="xs"
				variant="outline"
				value={[String(view.bitrateStrip.value)]}
				onValueChange={vals => {
					if (audioSelection.kind !== 'convert-lossy') return
					const next = Number(vals[0]) as AudioBitrate
					if (!AUDIO_BITRATES.includes(next)) return
					onSelect({kind: 'convert-lossy', target: audioSelection.target, bitrateKbps: next})
				}}
				spacing={1}
				className="flex-wrap justify-end gap-1"
			>
				{AUDIO_BITRATES.map(rate => (
					<ToggleGroupItem key={rate} value={String(rate)} shape="chip">
						{rate}
					</ToggleGroupItem>
				))}
			</ToggleGroup>
		</div>
	)

	const bitrateTooltipMsg = view.bitrateStrip.tooltipKey ? t(view.bitrateStrip.tooltipKey) : null

	return (
		<div className="flex flex-col gap-0">
			<div className="mb-1.5 flex items-center justify-between">
				<SectionLabel>{t('wizard.formats.audio')}</SectionLabel>
				{view.audioExtOptions.length > 1 && (
					<ToggleGroup size="xs" variant="outline" value={audioExtFilter ? [audioExtFilter] : []} onValueChange={vals => onAudioExtFilterChange(vals[0] ?? null)} spacing={1} className="flex-wrap justify-end gap-1">
						{view.audioExtOptions.map(ext => (
							<ToggleGroupItem key={ext} value={ext} shape="chip">
								{ext}
							</ToggleGroupItem>
						))}
					</ToggleGroup>
				)}
			</div>

			<ScrollArea className="max-h-[240px]">
				<RadioGroup value={selectedRowDisabled ? null : selectedValue} onValueChange={value => selectValue(String(value))} aria-label={t('wizard.formats.audio')} className="gap-1">
					{/* Muxed-video sources surface "Keep as-is" first because it's the
            zero-cost default — embedded audio stays in the file, no extraction
            step. Convert/no-audio rows still follow for users who explicitly
            want extraction or video-only output. */}
					{view.selectedVideoIsMuxed && <ChoiceRow id="audio-keep" value="none" disabled={view.noAudioDisabled} label={t('wizard.formats.keepAudio')} meta={t('wizard.formats.keepAudioMeta')} />}

					{view.nativeRows.map(row => {
						const qualityLabel = row.quality ? t(QUALITY_LABEL_KEY[row.quality]) : null
						const label = row.quality ? (
							<span className="inline-flex min-w-0 items-center gap-1.5">
								{qualityLabel ? <QualityBadge quality={row.quality} label={qualityLabel} /> : null}
								{row.title ? <span className="truncate">{row.title}</span> : null}
							</span>
						) : (
							row.title
						)
						return <ChoiceRow key={row.formatId} id={`audio-native-${row.formatId}`} value={`native:${row.formatId}`} disabled={subtitleOnly} label={label} meta={row.meta} />
					})}

					{view.convertTargets.flatMap(target => {
						const meta = target === 'wav' ? t('wizard.formats.convert.uncompressed') : t('wizard.formats.convert.label')
						const radio = <ChoiceRow key={`convert-${target}`} id={`audio-convert-${target}`} value={`convert:${target}`} disabled={subtitleOnly || view.convertDisabled} label={target} meta={meta} />
						return [
							view.convertDisabled && !subtitleOnly ? (
								<Tooltip key={`convert-${target}`}>
									<TooltipTrigger render={props => <div {...props}>{radio}</div>} />
									<TooltipContent>{t('wizard.formats.convert.requiresAudioOnly')}</TooltipContent>
								</Tooltip>
							) : (
								radio
							)
						]
					})}

					{!view.selectedVideoIsMuxed && <ChoiceRow id="audio-none" value="none" disabled={view.noAudioDisabled} label={t('wizard.formats.noAudio')} meta={t('wizard.formats.videoOnly')} />}
				</RadioGroup>
			</ScrollArea>

			{bitrateTooltipMsg ? (
				<Tooltip>
					<TooltipTrigger render={props => <div {...props}>{bitrateStrip}</div>} />
					<TooltipContent>{bitrateTooltipMsg}</TooltipContent>
				</Tooltip>
			) : (
				bitrateStrip
			)}

			<MascotBubble image={choosingImg} message={t('wizard.formats.mascot')} side="right" className="mt-3" />
		</div>
	)
}
