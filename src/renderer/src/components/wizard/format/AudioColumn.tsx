import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import type {AudioBitrate, AudioConvertTarget} from '@shared/types.js'
import {AUDIO_BITRATES} from '@shared/schemas.js'
import type {AudioSelection} from '../../../store/types.js'
import type {FormatSelectionView} from '../../../store/formatSelectionView.js'
import {ToggleGroup, ToggleGroupItem} from '../../ui/toggle-group.js'
import {Tooltip, TooltipTrigger, TooltipContent} from '../../ui/tooltip.js'
import {RadioOption} from '../../ui/radio-option.js'
import {ScrollArea} from '../../ui/scroll-area.js'
import {MascotBubble} from '../../shared/MascotBubble.js'
import {cn} from '@renderer/lib/utils.js'
import choosingImg from '../../../assets/Choosing.png'

interface AudioColumnProps {
	view: FormatSelectionView['audio']
	mode: FormatSelectionView['mode']
	audioSelection: AudioSelection
	audioExtFilter: string | null
	onAudioExtFilterChange: (value: string | null) => void
	onSelect: (sel: AudioSelection) => void
}

export function AudioColumn({view, mode, audioSelection, audioExtFilter, onAudioExtFilterChange, onSelect}: AudioColumnProps): ReactNode {
	const {t} = useTranslation()
	const subtitleOnly = mode === 'subtitle-only'

	const isNativeChecked = (formatId: string): boolean => audioSelection.kind === 'native' && audioSelection.formatId === formatId
	const isConvertChecked = (target: AudioConvertTarget): boolean => (audioSelection.kind === 'convert-lossless' || audioSelection.kind === 'convert-lossy') && audioSelection.target === target

	const pickConvert = (target: AudioConvertTarget): AudioSelection => (target === 'wav' ? {kind: 'convert-lossless', target: 'wav'} : {kind: 'convert-lossy', target, bitrateKbps: view.bitrateStrip.value})

	const bitrateStrip = (
		<div className={cn('flex items-center justify-between mt-2 px-1 transition-opacity', view.bitrateStrip.blocked && 'opacity-40 pointer-events-none')} data-testid="audio-bitrate-strip">
			<span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">{t('wizard.formats.convert.bitrate')}</span>
			<ToggleGroup
				value={[String(view.bitrateStrip.value)]}
				onValueChange={vals => {
					if (audioSelection.kind !== 'convert-lossy') return
					const next = Number(vals[0]) as AudioBitrate
					if (!AUDIO_BITRATES.includes(next)) return
					onSelect({kind: 'convert-lossy', target: audioSelection.target, bitrateKbps: next})
				}}
				spacing={1}
				className="gap-[3px]"
			>
				{AUDIO_BITRATES.map(rate => (
					<ToggleGroupItem key={rate} value={String(rate)} className="h-6 px-[10px] rounded-full text-[11px] font-semibold border aria-pressed:border-[var(--brand)] aria-pressed:bg-[var(--brand-dim)] aria-pressed:text-[var(--brand)] border-border text-[var(--text-subtle)] hover:border-muted-foreground">
						{rate}
					</ToggleGroupItem>
				))}
			</ToggleGroup>
		</div>
	)

	const bitrateTooltipMsg = view.bitrateStrip.tooltipKey ? t(view.bitrateStrip.tooltipKey) : null

	return (
		<div className="flex flex-col gap-0">
			<div className="flex items-center justify-between mb-[6px]">
				<p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">{t('wizard.formats.audio')}</p>
				{view.audioExtOptions.length > 1 && (
					<ToggleGroup value={audioExtFilter ? [audioExtFilter] : []} onValueChange={vals => onAudioExtFilterChange(vals[0] ?? null)} spacing={1} className="gap-[3px]">
						{view.audioExtOptions.map(ext => (
							<ToggleGroupItem key={ext} value={ext} className="h-5 px-[7px] rounded-full text-[11px] font-semibold border aria-pressed:border-[var(--brand)] aria-pressed:bg-[var(--brand-dim)] aria-pressed:text-[var(--brand)] border-border text-[var(--text-subtle)] hover:border-muted-foreground">
								{ext}
							</ToggleGroupItem>
						))}
					</ToggleGroup>
				)}
			</div>

			<ScrollArea className="max-h-[240px]">
				{/* Muxed-video sources surface "Keep as-is" first because it's the
            zero-cost default — embedded audio stays in the file, no extraction
            step. Convert/no-audio rows still follow for users who explicitly
            want extraction or video-only output. */}
				{view.selectedVideoIsMuxed && (
					<RadioOption checked={audioSelection.kind === 'none'} disabled={view.noAudioDisabled} onClick={() => onSelect({kind: 'none'})} label={t('wizard.formats.keepAudio')}>
						<span className="text-[11px] text-[var(--text-subtle)] ml-auto whitespace-nowrap">{t('wizard.formats.keepAudioMeta')}</span>
					</RadioOption>
				)}

				{view.nativeRows.map(row => {
					const isChecked = isNativeChecked(row.formatId)
					return [
						<RadioOption key={row.formatId} checked={isChecked} disabled={subtitleOnly} onClick={() => onSelect({kind: 'native', formatId: row.formatId})} label={row.ext}>
							<span className="text-[11px] ml-auto whitespace-nowrap" style={{color: isChecked ? 'hsla(220,100%,70%,0.7)' : 'var(--text-subtle)'}}>
								{row.label}
							</span>
						</RadioOption>
					]
				})}

				{view.convertTargets.flatMap(target => {
					const isChecked = isConvertChecked(target)
					const meta = target === 'wav' ? t('wizard.formats.convert.uncompressed') : t('wizard.formats.convert.label')
					const radio = (
						<RadioOption key={`convert-${target}`} checked={isChecked} disabled={subtitleOnly || view.convertDisabled} onClick={() => onSelect(pickConvert(target))} label={target}>
							<span className="text-[11px] ml-auto whitespace-nowrap" style={{color: isChecked ? 'hsla(220,100%,70%,0.7)' : 'var(--text-subtle)'}}>
								{meta}
							</span>
						</RadioOption>
					)
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

				{!view.selectedVideoIsMuxed && (
					<RadioOption checked={audioSelection.kind === 'none'} disabled={view.noAudioDisabled} onClick={() => onSelect({kind: 'none'})} label={t('wizard.formats.noAudio')}>
						<span className="text-[11px] text-[var(--text-subtle)] ml-auto whitespace-nowrap">{t('wizard.formats.videoOnly')}</span>
					</RadioOption>
				)}
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
