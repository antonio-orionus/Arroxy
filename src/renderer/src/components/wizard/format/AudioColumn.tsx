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
import {cn} from '@renderer/lib/utils.js'
import {SectionLabel} from '../../shared/SectionLabel.js'
import {ProfileTag} from './ProfileTag.js'

interface AudioColumnProps {
	view: FormatSelectionView['audio']
	mode: FormatSelectionView['mode']
	audioSelection: AudioSelection
	audioExtFilter: string | null
	onAudioExtFilterChange: (value: string | null) => void
	onSelect: (sel: AudioSelection) => void
}

// About the row count at which a list outgrows the 240px (`max-h-60`) cap.
const LONG_LIST_ROWS = 6

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
	// Alone on the screen, the list takes the step's free height. A zero basis
	// keeps its rows out of the step's content size, so it grows into the space
	// the footer leaves instead of pushing the page into scrolling; the floor
	// holds in short windows. Beside the Video column a short list sizes to its
	// rows; one long enough to be cropped at the old 240px cap grows into the grid
	// row the Video list sets, so a tall window shows as many audio rows as video.
	const fill = mode === 'audio-only'
	const longList = view.nativeRows.length + view.convertTargets.length >= LONG_LIST_ROWS

	// The radio group speaks strings; these encode and decode the three selection kinds.
	const selectedValue = audioSelection.kind === 'none' ? 'none' : audioSelection.kind === 'native' ? `native:${audioSelection.formatId}` : `convert:${audioSelection.target}`
	// A disabled row never reads as chosen, even though the store keeps the selection.
	const selectedRowDisabled = audioSelection.kind === 'none' ? view.noAudioDisabled : subtitleOnly
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
		<div className={cn('flex flex-col gap-0', fill && 'min-h-72 grow basis-0')}>
			<div className="mb-1.5 flex shrink-0 items-center justify-between">
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

			<ScrollArea className={fill ? 'min-h-0 flex-1' : longList ? 'min-h-60 grow basis-0' : 'max-h-60'}>
				<RadioGroup value={selectedRowDisabled ? null : selectedValue} onValueChange={value => selectValue(String(value))} aria-label={t('wizard.formats.audio')} className="gap-1">
					{/* Muxed-video sources surface "Keep as-is" first because it's the
            zero-cost default — embedded audio stays in the file, no extraction
            step. Convert/no-audio rows still follow for users who explicitly
            want extraction or video-only output. */}
					{view.selectedVideoIsMuxed && <ChoiceRow id="audio-keep" value="none" disabled={view.noAudioDisabled} label={t('wizard.formats.keepAudio')} meta={t('wizard.formats.keepAudioMeta')} />}

					{view.nativeRows.map(row => {
						const badge = row.quality ? <QualityBadge quality={row.quality} label={t(QUALITY_LABEL_KEY[row.quality])} /> : null
						return <ChoiceRow key={row.formatId} id={`audio-native-${row.formatId}`} value={`native:${row.formatId}`} disabled={subtitleOnly} adornment={badge} label={row.title} tag={row.isProfilePick ? <ProfileTag /> : null} meta={row.meta} />
					})}

					{view.convertTargets.map(target => (
						<ChoiceRow key={`convert-${target}`} id={`audio-convert-${target}`} value={`convert:${target}`} disabled={subtitleOnly} label={target} meta={target === 'wav' ? t('wizard.formats.convert.uncompressed') : t('wizard.formats.convert.label')} />
					))}

					{!view.selectedVideoIsMuxed && <ChoiceRow id="audio-none" value="none" disabled={view.noAudioDisabled} label={t('wizard.formats.noAudio')} meta={t('wizard.formats.videoOnly')} />}
				</RadioGroup>
			</ScrollArea>

			{view.bitrateStrip.hidden ? null : bitrateTooltipMsg ? (
				<Tooltip>
					<TooltipTrigger render={props => <div {...props}>{bitrateStrip}</div>} />
					<TooltipContent>{bitrateTooltipMsg}</TooltipContent>
				</Tooltip>
			) : (
				bitrateStrip
			)}
		</div>
	)
}
