import {Fragment, useState, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import type {AudioBitrate, AudioConvertTarget} from '@shared/types.js'
import {AUDIO_BITRATES, type AudioTrackQuality} from '@shared/schemas.js'
import type {AudioSelection} from '../../../store/types.js'
import type {FormatSelectionView, NativeAudioRow} from '../../../store/formatSelectionView.js'
import {ToggleGroup, ToggleGroupItem} from '../../ui/toggle-group.js'
import {RadioGroup} from '../../ui/radio-group.js'
import {cn} from '@renderer/lib/utils.js'
import {SectionLabel} from '../../shared/SectionLabel.js'
import {FormatChip, FormatLine, FormatLineName} from './FormatLine.js'
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from '../../ui/select.js'
import {SettingSwitch} from '../../shared/SettingSwitch.js'

interface AudioColumnProps {
	view: FormatSelectionView['audio']
	mode: FormatSelectionView['mode']
	audioSelection: AudioSelection
	onSelect: (sel: AudioSelection) => void
}

const QUALITY_BAR_COUNT: Record<AudioTrackQuality, number> = {high: 3, medium: 2, low: 1}
const QUALITY_LABEL_KEY: Record<AudioTrackQuality, 'wizard.formats.quality.high' | 'wizard.formats.quality.medium' | 'wizard.formats.quality.low'> = {high: 'wizard.formats.quality.high', medium: 'wizard.formats.quality.medium', low: 'wizard.formats.quality.low'}

// The probe's quality grade as one to three bars, in the chip's own ink: colour
// here is not a status. The chip's hint and spoken name say it in words.
function QualityMeter({quality}: {quality: AudioTrackQuality}): ReactNode {
	const activeBars = QUALITY_BAR_COUNT[quality]
	return (
		<span aria-hidden data-testid={`audio-quality-${quality}`} className="flex h-[10px] shrink-0 items-end gap-[1px] opacity-70">
			{[1, 2, 3].map(index => (
				<span key={index} className={cn('w-[2px] rounded-full bg-current', index === 1 && 'h-[4px]', index === 2 && 'h-[7px]', index === 3 && 'h-[10px]', index > activeBars && 'opacity-20')} />
			))}
		</span>
	)
}

// Every fact about the stream, for its spoken name and hover hint.
function streamName(row: NativeAudioRow, extras: readonly (string | null)[]): string {
	return [row.track, row.codec, row.ext, row.bitrate, ...row.details, row.size, ...extras].flatMap(part => (part ? [part] : [])).join(' · ')
}

// The stream in `track` that stands in for `current`: same codec and DRC, nearest bitrate.
function counterpart(rows: readonly NativeAudioRow[], current: NativeAudioRow | undefined): NativeAudioRow | undefined {
	const sameCodec = current ? rows.filter(row => row.codec === current.codec) : []
	const pool = sameCodec.length > 0 ? sameCodec : rows
	return pool.toSorted((a, b) => Math.abs((a.kbps ?? 0) - (current?.kbps ?? 0)) - Math.abs((b.kbps ?? 0) - (current?.kbps ?? 0)))[0]
}

export function AudioColumn({view, mode, audioSelection, onSelect}: AudioColumnProps): ReactNode {
	const {t} = useTranslation()
	const subtitleOnly = mode === 'subtitle-only'
	const profileLabel = t('wizard.formats.profile.tag')
	// Which of each DRC pair the list shows; it opens on whatever the selection already is.
	const selectedNative = audioSelection.kind === 'native' ? view.nativeRows.find(row => row.formatId === audioSelection.formatId) : undefined
	const [drc, setDrc] = useState(selectedNative?.isDrc === true)
	// A video with several languages shows one at a time; it opens on the selection's.
	const [track, setTrack] = useState([selectedNative?.track, view.tracks[0]].find(name => name !== undefined && name !== '') ?? '')
	const shown = (row: NativeAudioRow): boolean => (row.twinId === null || row.isDrc === drc) && (view.tracks.length === 0 || row.track === track)
	const switchDrc = (next: boolean): void => {
		setDrc(next)
		// The chosen stream swaps for its twin, so the switch never leaves a hidden chip selected.
		if (selectedNative?.twinId && selectedNative.isDrc !== next) onSelect({kind: 'native', formatId: selectedNative.twinId})
	}
	const switchTrack = (next: string): void => {
		setTrack(next)
		// A language change keeps the choice: the same codec at the nearest bitrate, in the new language.
		if (!selectedNative) return
		const replacement = counterpart(
			view.nativeRows.filter(row => row.track === next && (row.twinId === null || row.isDrc === drc)),
			selectedNative
		)
		if (replacement) onSelect({kind: 'native', formatId: replacement.formatId})
	}

	// One column per codec, best bitrate first; row i holds each codec's i-th stream.
	const codecColumns = view.lines.map(line => ({line, rows: line.variants.filter(shown)})).filter(column => column.rows.length > 0)
	const depth = Math.max(0, ...codecColumns.map(column => column.rows.length))
	// Two or more codec columns only fit a narrow window with stacked chips.
	const narrowStack = codecColumns.length >= 2
	const drcTag = t('wizard.formats.drc.tag')

	// The radio group speaks strings; these encode and decode the three selection kinds.
	const selectedValue = audioSelection.kind === 'none' ? 'none' : audioSelection.kind === 'native' ? `native:${audioSelection.formatId}` : `convert:${audioSelection.target}`
	// A disabled chip never reads as chosen, even though the store keeps the selection.
	const selectedChipDisabled = audioSelection.kind === 'none' ? view.noAudioDisabled : subtitleOnly
	const selectValue = (value: string): void => {
		if (value === 'none') return onSelect({kind: 'none'})
		const native = view.nativeRows.find(row => `native:${row.formatId}` === value)
		if (native) return onSelect({kind: 'native', formatId: native.formatId})
		const target = view.convertTargets.find(candidate => `convert:${candidate}` === value)
		if (target) onSelect(pickConvert(target))
	}

	const pickConvert = (target: AudioConvertTarget): AudioSelection => (target === 'wav' ? {kind: 'convert-lossless', target: 'wav'} : {kind: 'convert-lossy', target, bitrateKbps: view.bitrateStrip.value})

	const bitrateStrip = (
		<div className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-2 pt-1.5" data-testid="audio-bitrate-strip">
			<FormatLineName name={t('wizard.formats.convert.bitrate')} />
			<span className="flex flex-wrap items-center gap-x-3 gap-y-1">
				<ToggleGroup
					size="sm"
					variant="outline"
					value={[String(view.bitrateStrip.value)]}
					onValueChange={vals => {
						if (audioSelection.kind !== 'convert-lossy') return
						const next = Number(vals[0]) as AudioBitrate
						if (!AUDIO_BITRATES.includes(next)) return
						onSelect({kind: 'convert-lossy', target: audioSelection.target, bitrateKbps: next})
					}}
					spacing={1}
					className="flex-wrap justify-start gap-1"
				>
					{AUDIO_BITRATES.map(rate => (
						<ToggleGroupItem key={rate} value={String(rate)} shape="chip">
							{rate}
						</ToggleGroupItem>
					))}
				</ToggleGroup>
				{/* Converting cannot add what the source never had. */}
				{view.sourceKbps ? <span className="text-caption text-subtle-foreground">{t('wizard.formats.convert.sourceKbps', {kbps: view.sourceKbps})}</span> : null}
			</span>
		</div>
	)

	// Keep as-is (a muxed video's own audio) or No audio: one chip that says what it means.
	const noneChip = view.selectedVideoIsMuxed ? (
		<FormatChip value="none" name={`${t('wizard.formats.keepAudio')} · ${t('wizard.formats.keepAudioMeta')}`} label={t('wizard.formats.keepAudio')} tags={[t('wizard.formats.keepAudioMeta')]} disabled={view.noAudioDisabled} />
	) : (
		<FormatChip value="none" name={`${t('wizard.formats.noAudio')} · ${t('wizard.formats.videoOnly')}`} label={t('wizard.formats.noAudio')} disabled={view.noAudioDisabled} />
	)

	const list = (
		<RadioGroup value={selectedChipDisabled ? null : selectedValue} onValueChange={value => selectValue(String(value))} aria-label={t('wizard.formats.audio')} className="block">
			{/* A muxed video's own audio comes first: it's the zero-cost default,
			    the embedded audio stays in the file with no extraction step. */}
			{view.selectedVideoIsMuxed ? <div className="mb-1.5 flex">{noneChip}</div> : null}

			{codecColumns.length > 0 ? (
				<div className="grid items-center justify-start gap-x-2 gap-y-1.5 pt-1 pe-1.5" style={{gridTemplateColumns: `repeat(${codecColumns.length}, auto)`}}>
					{codecColumns.map(({line}) => (
						<span key={line.name} aria-hidden className="px-3 text-caption text-subtle-foreground">
							{line.name}
						</span>
					))}
					{Array.from({length: depth}, (_, index) => (
						<Fragment key={index}>
							{codecColumns.map(({line, rows}) => {
								const row = rows[index]
								if (!row) return <span key={line.name} />
								const qualityLabel = row.quality ? t(QUALITY_LABEL_KEY[row.quality]) : null
								return (
									<FormatChip
										key={line.name}
										value={`native:${row.formatId}`}
										name={streamName(row, [qualityLabel, row.isProfilePick ? profileLabel : null])}
										label={row.chipLabel}
										tags={row.chipTags.map(tag => (tag === 'DRC' ? drcTag : tag))}
										size={row.size}
										adornment={row.quality ? <QualityMeter quality={row.quality} /> : null}
										profilePick={row.isProfilePick}
										disabled={subtitleOnly}
										narrowStack={narrowStack}
									/>
								)
							})}
						</Fragment>
					))}
				</div>
			) : null}

			{view.convertTargets.length > 0 ? (
				<FormatLine name={t('wizard.formats.convert.label')}>
					{view.convertTargets.map(target => (
						<FormatChip key={target} value={`convert:${target}`} name={target === 'wav' ? t('wizard.formats.convert.wavLabel') : `${t('wizard.formats.convert.label')} · ${target}`} label={target} disabled={subtitleOnly} />
					))}
				</FormatLine>
			) : null}

			{/* Audio mode cannot do without audio, so its No audio chip would only ever be disabled. */}
			{view.selectedVideoIsMuxed || view.noAudioDisabled ? null : <div className="mt-3 flex">{noneChip}</div>}
		</RadioGroup>
	)

	return (
		// As tall as its lines, in every mode: the step scrolls, never this list on its own.
		<div className="flex min-w-0 flex-col">
			<div className="mb-1.5 flex min-h-8 shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
				<SectionLabel>{t('wizard.formats.audio')}</SectionLabel>
				{view.tracks.length > 0 ? (
					<span className="flex max-w-full min-w-0 items-center gap-2">
						<span className="shrink-0 text-caption text-subtle-foreground">{t('wizard.formats.audioLanguageCount', {count: view.tracks.length})}</span>
						<Select value={track} onValueChange={value => value !== null && switchTrack(value)}>
							<SelectTrigger size="sm" className="max-w-64 min-w-40" aria-label={t('wizard.formats.audioLanguage')} data-testid="audio-language">
								<SelectValue>{() => track}</SelectValue>
							</SelectTrigger>
							<SelectContent align="end">
								<SelectGroup>
									{view.tracks.map(name => (
										<SelectItem key={name} value={name}>
											{name}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
					</span>
				) : null}
			</div>

			{/* As wide as the chips: the rows below match the grid instead of the whole column. */}
			<div className="flex w-fit max-w-full flex-col">
				{list}

				{/* Bitrate belongs to a lossy conversion, so it shows only once one is picked. */}
				{audioSelection.kind === 'convert-lossy' && !view.bitrateStrip.hidden ? bitrateStrip : null}

				{/* `w-0 min-w-full`: the switch's long description wraps to the grid's width instead of setting it. */}
				{view.hasDrcTwins ? (
					<div className="mt-3 w-0 min-w-full">
						<SettingSwitch id="audio-drc" label={t('wizard.formats.drc.label')} description={t('wizard.formats.drc.description')} checked={drc} onCheckedChange={switchDrc} disabled={subtitleOnly} testId="audio-drc-switch" />
					</div>
				) : null}
			</div>
		</div>
	)
}
