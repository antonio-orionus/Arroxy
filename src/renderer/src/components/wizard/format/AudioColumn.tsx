import {useState, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import type {AudioBitrate, AudioConvertTarget} from '@shared/types.js'
import {AUDIO_BITRATES, type AudioTrackQuality} from '@shared/schemas.js'
import type {AudioSelection} from '../../../store/types.js'
import type {AudioLine, FormatSelectionView, NativeAudioRow} from '../../../store/formatSelectionView.js'
import {ToggleGroup, ToggleGroupItem} from '../../ui/toggle-group.js'
import {RadioGroup} from '../../ui/radio-group.js'
import {cn} from '@renderer/lib/utils.js'
import {SectionLabel} from '../../shared/SectionLabel.js'
import {FormatChip, FormatLine, FormatLineName} from './FormatLine.js'
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from '../../ui/select.js'
import {SettingSwitch} from '../../shared/SettingSwitch.js'
import {conversionSource, selectedConversionSource} from '@shared/audioConversionSource.js'

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

// Every fact about the stream, for its spoken name.
function streamName(row: NativeAudioRow, extras: readonly (string | null)[]): string {
	return [row.track, row.codec, row.ext, row.bitrate, ...row.details, ...row.markers.map(view => view.label), row.size, ...extras].flatMap(part => (part ? [part] : [])).join(' · ')
}

// The stream in `track` that stands in for `current`: same codec and DRC, nearest bitrate.
function counterpart(rows: readonly NativeAudioRow[], current: NativeAudioRow | undefined): NativeAudioRow | undefined {
	const sameCodec = current ? rows.filter(row => row.codec === current.codec) : []
	const pool = sameCodec.length > 0 ? sameCodec : rows
	return pool.toSorted((a, b) => Math.abs((a.kbps ?? 0) - (current?.kbps ?? 0)) - Math.abs((b.kbps ?? 0) - (current?.kbps ?? 0)))[0]
}

type AudioView = FormatSelectionView['audio']
type LossyConversion = Extract<AudioSelection, {kind: 'convert-lossy'}>

interface AudioStreamFilter {
	drc: boolean
	track: string
	shown: (row: NativeAudioRow) => boolean
	switchDrc: (next: boolean) => void
	switchTrack: (next: string) => void
	// The stream a conversion to a target starts from, when the video has
	// several languages: the shown language's own stream in that codec (copied,
	// not re-encoded), else its best; undefined lets yt-dlp take the default track.
	convertSourceFor: (target: AudioConvertTarget) => string | undefined
}

function isConversion(selection: AudioSelection): selection is Extract<AudioSelection, {kind: 'convert-lossy' | 'convert-lossless'}> {
	return selection.kind === 'convert-lossy' || selection.kind === 'convert-lossless'
}

// The native stream behind the selection: the pick itself, or a conversion's source.
function selectedStreamId(selection: AudioSelection): string | undefined {
	if (selection.kind === 'native') return selection.formatId
	return isConversion(selection) ? selection.sourceFormatId : undefined
}

// Which streams the list shows: one of each DRC pair, and one language at a time.
function useAudioStreamFilter(view: AudioView, audioSelection: AudioSelection, onSelect: (sel: AudioSelection) => void): AudioStreamFilter {
	// Which of each DRC pair the list shows; it opens on whatever the selection already is.
	const selectedId = selectedStreamId(audioSelection)
	const selectedNative = selectedId === undefined ? undefined : view.nativeRows.find(row => row.formatId === selectedId)
	const [drc, setDrc] = useState(selectedNative?.isDrc === true)
	// A video with several languages shows one at a time; it opens on the selection's, else the source's default.
	const [track, setTrack] = useState([selectedNative?.track, view.defaultTrack, view.tracks[0]].find(name => name !== undefined && name !== null && name !== '') ?? '')
	// When something else changes the selection (a profile switch, Undo), the
	// language and DRC follow it, so the chosen chip is never filtered out.
	const [followed, setFollowed] = useState(selectedNative?.formatId)
	if (selectedNative && selectedNative.formatId !== followed) {
		setFollowed(selectedNative.formatId)
		if (selectedNative.track && selectedNative.track !== track) setTrack(selectedNative.track)
		if (selectedNative.twinId !== null && selectedNative.isDrc !== drc) setDrc(selectedNative.isDrc)
	}
	const inView = (row: NativeAudioRow, inTrack: string, withDrc: boolean): boolean => (row.twinId === null || row.isDrc === withDrc) && (view.tracks.length === 0 || row.track === inTrack)
	const shown = (row: NativeAudioRow): boolean => inView(row, track, drc)
	// The shown language's streams, as yt-dlp ranks them; the DRC switch picks which master comes first.
	const sourceIn = (inTrack: string, withDrc: boolean, target: AudioConvertTarget): string | undefined => {
		if (view.tracks.length === 0) return undefined
		const shownIds = new Set(view.nativeRows.filter(row => inView(row, inTrack, withDrc)).map(row => row.formatId))
		return conversionSource(
			view.conversionCandidates.filter(candidate => shownIds.has(candidate.formatId)),
			target,
			{preferDrc: withDrc}
		)?.formatId
	}
	const switchDrc = (next: boolean): void => {
		setDrc(next)
		if (isConversion(audioSelection)) {
			if (audioSelection.sourceFormatId) onSelect({...audioSelection, sourceFormatId: sourceIn(track, next, audioSelection.target)})
			return
		}
		// The chosen stream swaps for its twin, so the switch never leaves a hidden chip selected.
		if (selectedNative?.twinId && selectedNative.isDrc !== next) onSelect({kind: 'native', formatId: selectedNative.twinId})
	}
	const switchTrack = (next: string): void => {
		setTrack(next)
		// A conversion follows the language: it converts that language's stream.
		if (isConversion(audioSelection)) {
			onSelect({...audioSelection, sourceFormatId: sourceIn(next, drc, audioSelection.target)})
			return
		}
		// A language change keeps the choice: the same codec at the nearest bitrate, in the new language.
		if (!selectedNative) return
		const replacement = counterpart(
			view.nativeRows.filter(row => row.track === next && (row.twinId === null || row.isDrc === drc)),
			selectedNative
		)
		if (replacement) onSelect({kind: 'native', formatId: replacement.formatId})
	}
	return {drc, track, shown, switchDrc, switchTrack, convertSourceFor: target => sourceIn(track, drc, target)}
}

// The radio group speaks strings; these encode and decode the three selection kinds.
function selectionValue(selection: AudioSelection): string {
	if (selection.kind === 'none') return 'none'
	if (selection.kind === 'extract') return 'extract'
	return selection.kind === 'native' ? `native:${selection.formatId}` : `convert:${selection.target}`
}

function convertSelection(target: AudioConvertTarget, bitrateKbps: AudioBitrate, sourceFormatId: string | undefined): AudioSelection {
	const source = sourceFormatId ? {sourceFormatId} : {}
	return target === 'wav' ? {kind: 'convert-lossless', target: 'wav', ...source} : {kind: 'convert-lossy', target, bitrateKbps, ...source}
}

function selectionFromValue(value: string, view: AudioView, convertSourceFor: (target: AudioConvertTarget) => string | undefined): AudioSelection | null {
	if (value === 'none') return {kind: 'none'}
	if (value === 'extract') return {kind: 'extract'}
	const native = view.nativeRows.find(row => `native:${row.formatId}` === value)
	if (native) return {kind: 'native', formatId: native.formatId}
	const target = view.convertTargets.find(candidate => `convert:${candidate}` === value)
	return target ? convertSelection(target, view.bitrateStrip.value, convertSourceFor(target)) : null
}

function AudioLanguageSelect({tracks, trackTags, track, onChange}: {tracks: readonly string[]; trackTags: Readonly<Record<string, readonly string[]>>; track: string; onChange: (next: string) => void}): ReactNode {
	const {t} = useTranslation()
	return (
		<span className="flex max-w-full min-w-0 items-center gap-2">
			<span className="shrink-0 text-caption text-subtle-foreground">{t('wizard.formats.audioLanguageCount', {count: tracks.length})}</span>
			<Select value={track} onValueChange={value => value !== null && onChange(value)}>
				<SelectTrigger size="sm" className="max-w-64 min-w-40" aria-label={t('wizard.formats.audioLanguage')} data-testid="audio-language">
					<SelectValue>{() => [track, ...(trackTags[track] ?? [])].join(' · ')}</SelectValue>
				</SelectTrigger>
				<SelectContent align="end">
					<SelectGroup>
						{tracks.map(name => (
							<SelectItem key={name} value={name}>
								{name}
								{(trackTags[name] ?? []).map(tag => (
									<span key={tag} className="text-caption text-subtle-foreground">
										{tag}
									</span>
								))}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
		</span>
	)
}

function BitrateStrip({view, selection, onSelect}: {view: AudioView; selection: LossyConversion; onSelect: (sel: AudioSelection) => void}): ReactNode {
	const {t} = useTranslation()
	return (
		<div className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-2 pt-1.5" data-testid="audio-bitrate-strip">
			<FormatLineName name={t('wizard.formats.convert.bitrate')} />
			<span className="flex flex-wrap items-center gap-x-3 gap-y-1">
				<ToggleGroup
					size="sm"
					variant="outline"
					value={[String(view.bitrateStrip.value)]}
					onValueChange={vals => {
						const next = Number(vals[0]) as AudioBitrate
						if (!AUDIO_BITRATES.includes(next)) return
						onSelect({...selection, bitrateKbps: next})
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
}

// In place of the bitrate strip when the stream is already in the target
// codec: yt-dlp copies it, so it keeps the source's bitrate.
function CopyNote({target, kbps}: {target: AudioConvertTarget; kbps: number | undefined}): ReactNode {
	const {t} = useTranslation()
	const rounded = kbps === undefined ? undefined : Math.round(kbps)
	return (
		<div className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-2 pt-1.5" data-testid="audio-copy-note">
			<FormatLineName name={t('wizard.formats.convert.bitrate')} />
			<span className="text-caption text-subtle-foreground">{rounded === undefined ? t('wizard.formats.convert.copyNoteNoBitrate', {target: target.toUpperCase()}) : t('wizard.formats.convert.copyNote', {target: target.toUpperCase(), kbps: rounded})}</span>
		</div>
	)
}

// Audio mode on a site with only combined files: keep as-is extracts their
// audio as it is (`--audio-format best`), the same file Quick Download gives.
function ExtractChip(): ReactNode {
	const {t} = useTranslation()
	return <FormatChip value="extract" name={`${t('wizard.formats.keepAudio')} · ${t('wizard.formats.keepAudioMeta')}`} label={t('wizard.formats.keepAudio')} tags={[t('wizard.formats.keepAudioMeta')]} />
}

// Keep as-is: a stream with its own audio keeps it. Silence is the switch's
// Video, no audio, so this column never offers No audio.
function NoAudioChip({view}: {view: AudioView}): ReactNode {
	const {t} = useTranslation()
	return <FormatChip value="none" name={`${t('wizard.formats.keepAudio')} · ${t('wizard.formats.keepAudioMeta')}`} label={t('wizard.formats.keepAudio')} tags={[t('wizard.formats.keepAudioMeta')]} disabled={view.noAudioDisabled} />
}

function NativeStreamChip({row, disabled, narrowStack}: {row: NativeAudioRow; disabled: boolean; narrowStack: boolean}): ReactNode {
	const {t} = useTranslation()
	const qualityLabel = row.quality ? t(QUALITY_LABEL_KEY[row.quality]) : null
	const drcTag = t('wizard.formats.drc.tag')
	return (
		<FormatChip
			value={`native:${row.formatId}`}
			name={streamName(row, [qualityLabel, row.isProfilePick ? t('wizard.formats.profile.tag') : null])}
			// The chip shows its bitrate, details and size; the quality meter has no words.
			hint={[row.chipLabel === row.ext ? null : row.ext, qualityLabel].flatMap(part => (part ? [part] : [])).join(' · ')}
			label={row.chipLabel}
			tags={row.chipTags.map(tag => (tag === 'DRC' ? drcTag : tag))}
			markers={row.markers}
			size={row.size}
			adornment={row.quality ? <QualityMeter quality={row.quality} /> : null}
			profilePick={row.isProfilePick}
			disabled={disabled}
			narrowStack={narrowStack}
		/>
	)
}

interface CodecColumn {
	line: AudioLine
	rows: NativeAudioRow[]
}

interface AudioStreamListProps {
	view: AudioView
	codecColumns: readonly CodecColumn[]
	subtitleOnly: boolean
	audioSelection: AudioSelection
	onSelect: (sel: AudioSelection) => void
	convertSourceFor: (target: AudioConvertTarget) => string | undefined
}

function AudioStreamList({view, codecColumns, subtitleOnly, audioSelection, onSelect, convertSourceFor}: AudioStreamListProps): ReactNode {
	const {t} = useTranslation()
	// Two or more codec columns only fit a narrow window with stacked chips.
	const narrowStack = codecColumns.length >= 2
	// A disabled chip never reads as chosen, even though the store keeps the selection.
	const selectedChipDisabled = audioSelection.kind === 'none' ? view.noAudioDisabled : subtitleOnly
	const selectValue = (value: string): void => {
		const next = selectionFromValue(value, view, convertSourceFor)
		if (next) onSelect(next)
	}

	return (
		<RadioGroup value={selectedChipDisabled ? null : selectionValue(audioSelection)} onValueChange={value => selectValue(String(value))} aria-label={t('wizard.formats.audio')} className="block">
			{/* A muxed video's own audio comes first: it's the zero-cost default,
			    the embedded audio stays in the file with no extraction step. */}
			{view.selectedVideoIsMuxed ? (
				<div className="mb-1.5 flex">
					<NoAudioChip view={view} />
				</div>
			) : null}
			{view.extractOffered ? (
				<div className="mb-1.5 flex">
					<ExtractChip />
				</div>
			) : null}

			{codecColumns.length > 0 ? (
				// One block per codec, wrapping onto the next line when the column is too narrow for them side by side.
				<div className="flex flex-wrap items-start justify-start gap-x-2 gap-y-3 pt-1 pe-1.5">
					{codecColumns.map(({line, rows}) => (
						<div key={line.name} className="flex flex-col items-start gap-y-1.5">
							<span aria-hidden className="px-3 text-caption text-subtle-foreground">
								{line.name}
							</span>
							{rows.map(row => (
								<NativeStreamChip key={row.formatId} row={row} disabled={subtitleOnly} narrowStack={narrowStack} />
							))}
						</div>
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
		</RadioGroup>
	)
}

export function AudioColumn({view, mode, audioSelection, onSelect}: AudioColumnProps): ReactNode {
	const {t} = useTranslation()
	const subtitleOnly = mode === 'subtitle-only'
	const {drc, track, shown, switchDrc, switchTrack, convertSourceFor} = useAudioStreamFilter(view, audioSelection, onSelect)
	// A source already in the target codec is copied as-is, so no bitrate applies to it.
	const copySource = audioSelection.kind === 'convert-lossy' ? selectedConversionSource(view.conversionCandidates, audioSelection.target, audioSelection.sourceFormatId) : undefined

	// One column per codec, best bitrate first.
	const codecColumns = view.lines.map(line => ({line, rows: line.variants.filter(shown)})).filter(column => column.rows.length > 0)

	return (
		// As tall as its lines, in every mode: the step scrolls, never this list on its own.
		<div className="flex min-w-0 flex-col">
			<div className="mb-1.5 flex min-h-8 shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
				<SectionLabel>{t('wizard.formats.audio')}</SectionLabel>
				{view.tracks.length > 0 ? <AudioLanguageSelect tracks={view.tracks} trackTags={view.trackTags} track={track} onChange={switchTrack} /> : null}
			</div>

			{/* As wide as the chips: the rows below match the grid instead of the whole column. */}
			<div className="flex w-fit max-w-full flex-col">
				<AudioStreamList view={view} codecColumns={codecColumns} subtitleOnly={subtitleOnly} audioSelection={audioSelection} onSelect={onSelect} convertSourceFor={convertSourceFor} />

				{/* Bitrate belongs to a lossy conversion, so it shows only once one is picked. */}
				{audioSelection.kind === 'convert-lossy' && !view.bitrateStrip.hidden ? copySource?.copies ? <CopyNote target={audioSelection.target} kbps={copySource.kbps} /> : <BitrateStrip view={view} selection={audioSelection} onSelect={onSelect} /> : null}

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
