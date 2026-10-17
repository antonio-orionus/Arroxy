import {useMemo} from 'react'
import {i18next} from '@shared/i18n/index.js'
import {humanSize} from '@shared/format.js'
import {AUDIO_CONVERT_TARGETS} from '@shared/audioTargets.js'
import {audioCodecName, videoCodecName} from '@shared/fileTypeFit.js'
import {channelLabel, sampleRateLabel} from '@shared/audioTrackMeta.js'
import type {AudioBitrate, AudioConvertTarget, FormatOption} from '@shared/types.js'
import type {AudioTrackQuality, WizardMediaKind} from '@shared/schemas.js'
import type {VideoPart} from '@shared/preparedJob.js'
import {scaleBytesToPart} from '@shared/videoPart.js'
import type {AudioSelection} from './types.js'
import {useAppStore} from './useAppStore.js'
import {resolutionLabel} from '@renderer/lib/resolutionLabel.js'
import {groupVideoFormats, resolveVideoResolution} from './helpers.js'
import {wizardVideoPart} from './wizard/videoPart.js'

// A stream with no HDR format: the probe leaves its dynamic range empty.
const SDR = 'SDR'

// One video stream: a chip on its resolution's line.
export interface VideoFormatRow {
	filesize: number | undefined
	formatId: string
	// The probe's own text ("3840x2160"); its line names it the way people say it.
	resolution: string
	ext: string
	codec: string | null
	fps: number | null
	dynamicRange: string | null
	size: string | null
	// What the chip says: the codec, or the file type when the codec is unknown.
	chipLabel: string
	// Said after the label: a frame rate other than the one most streams have.
	chipTags: string[]
	// The dynamic-range column the chip sits in: an HDR format, or SDR.
	range: string
	// The stream the download profile picked for this video.
	isProfilePick: boolean
}

// One resolution, with every stream that offers it, best first.
export interface VideoLine {
	resolution: string
	name: string
	alias: string | null
	variants: VideoFormatRow[]
}

// One audio stream: a chip on its codec's line. A video with several named tracks shows one track's lines at a time.
export interface NativeAudioRow {
	ext: string
	formatId: string
	label: string
	quality: AudioTrackQuality | null
	// The track's name or language; empty when the stream is not a named track.
	track: string
	codec: string | null
	kbps: number | null
	bitrate: string | null
	// What else sets the stream apart: DRC, a channel layout, an unusual sample rate.
	details: string[]
	size: string | null
	chipLabel: string
	chipTags: string[]
	isDrc: boolean
	// The same track without DRC (or with it): one switch picks which of the pair the list shows.
	twinId: string | null
	isProfilePick: boolean
}

export interface AudioLine {
	name: string
	variants: NativeAudioRow[]
}

export interface FormatSelectionView {
	mode: 'video+audio' | 'audio-only' | 'subtitle-only'
	// The media part of the selection is complete (Download may still wait on
	// subtitle languages in Subtitles mode or an invalid folder).
	canDownload: boolean
	currentResolutionLabel: string
	selectedFilesize: number | undefined
	// Sizes are linear estimates for the part of the video being downloaded.
	sizesScaledToPart: boolean
	// `profilePickIsFallback`: the video can't honour the profile's tier, so its
	// tagged row is the closest stream rather than an exact match.
	video: {
		disabled: boolean
		lines: VideoLine[]
		// Every stream of `lines`, in the same order.
		rows: VideoFormatRow[]
		// The columns of the Video grid: HDR formats first, then SDR.
		ranges: string[]
		profilePickIsFallback: boolean
	}
	audio: {
		lines: AudioLine[]
		// Every stream of `lines`, in the same order.
		nativeRows: NativeAudioRow[]
		// Some stream has a DRC twin, so the list offers the DRC switch.
		hasDrcTwins: boolean
		// The named tracks (languages) to pick from, in the probe's order; empty when there is at most one.
		tracks: string[]
		// The best native bitrate, which a lossy conversion cannot improve on.
		sourceKbps: number | null
		// Empty in Video mode: conversions belong to Audio mode.
		convertTargets: AudioConvertTarget[]
		noAudioDisabled: boolean
		// The "no audio" row's meaning depends on whether the selected video
		// format is muxed (audio + video in one stream) or video-only. For muxed
		// sources, picking it downloads the file as-is — the embedded audio is
		// kept. The renderer flips the row's label/meta accordingly so users
		// don't think they're throwing away audio.
		selectedVideoIsMuxed: boolean
		bitrateStrip: {hidden: boolean; value: AudioBitrate}
	}
}

// Sizes for the whole video, or estimates for the part (`~`, scaled linearly).
interface SizeScale {
	bytes: (bytes: number | undefined) => number | undefined
	text: (bytes: number) => string
	scaled: boolean
}

function sizeScale(videoPart: SelectViewInput['videoPart']): SizeScale {
	if (!videoPart) return {bytes: bytes => bytes, text: humanSize, scaled: false}
	return {bytes: bytes => scaleBytesToPart(bytes, videoPart.part, videoPart.durationSeconds), text: bytes => `~${humanSize(bytes)}`, scaled: true}
}

// Dolby Digital and Dolby Digital Plus share the Dolby column; the chip says which.
function dolbyVariant(codec: string | undefined): string | null {
	const lower = codec?.toLowerCase().replaceAll('-', '') ?? ''
	if (lower === 'ec3' || lower === 'eac3') return 'E-AC-3'
	if (lower === 'ac3') return 'AC-3'
	return null
}

function nativeAudioRow(format: FormatOption, profileAudioId: string | null, scale: SizeScale): BaseAudioRow {
	const scaledSize = format.filesize ? scale.bytes(format.filesize) : undefined
	const details = [dolbyVariant(format.audioCodec), format.isDrc ? 'DRC' : null, channelLabel(format.audioChannels), sampleRateLabel(format.sampleRateHz)].flatMap(part => (part ? [part] : []))
	return {
		ext: format.ext,
		formatId: format.formatId,
		label: format.label,
		quality: format.audioTrackQuality ?? null,
		track: format.audioTrackLabel ?? format.audioLanguage ?? '',
		codec: audioCodecName(format.audioCodec) ?? format.audioCodec ?? null,
		kbps: format.abr ?? null,
		bitrate: format.abr ? `${Math.round(format.abr)} kbps` : null,
		details,
		size: scaledSize === undefined ? null : scale.text(scaledSize),
		isDrc: format.isDrc === true,
		isProfilePick: format.formatId === profileAudioId
	}
}

// Consecutive-or-not, items sharing a key gather under its first appearance, so lines keep the quality order.
function groupBy<T>(items: readonly T[], key: (item: T) => string): [string, T[]][] {
	const groups = new Map<string, T[]>()
	for (const item of items) groups.set(key(item), [...(groups.get(key(item)) ?? []), item])
	return [...groups]
}

// The frame rate most streams share; a chip names its own only when it differs.
function usualFps(formats: readonly FormatOption[]): number | null {
	const counts = groupBy(
		formats.flatMap(format => (format.fps ? [format.fps] : [])),
		String
	)
	const top = counts.toSorted((a, b) => b[1].length - a[1].length)[0]
	return top ? Number(top[0]) : null
}

function compact(parts: readonly (string | null | undefined)[]): string[] {
	return parts.flatMap(part => (part ? [part] : []))
}

type BaseAudioRow = Omit<NativeAudioRow, 'chipLabel' | 'chipTags' | 'twinId'>

// YouTube offers most tracks twice, with and without DRC, at nearly the same
// bitrate (133 and 132 kbps). Each DRC stream pairs with the closest plain one of
// the same track, codec and file type, a few kbps apart at most.
const DRC_TWIN_KBPS = 3

function drcTwins(rows: readonly BaseAudioRow[]): Map<string, string> {
	const twins = new Map<string, string>()
	for (const drc of rows.filter(row => row.isDrc)) {
		const candidates = rows.filter(row => !row.isDrc && !twins.has(row.formatId) && row.track === drc.track && row.codec === drc.codec && row.ext === drc.ext && row.kbps !== null && drc.kbps !== null && Math.abs(row.kbps - drc.kbps) <= DRC_TWIN_KBPS)
		const plain = candidates.toSorted((a, b) => Math.abs((a.kbps ?? 0) - (drc.kbps ?? 0)) - Math.abs((b.kbps ?? 0) - (drc.kbps ?? 0)))[0]
		if (!plain) continue
		twins.set(drc.formatId, plain.formatId)
		twins.set(plain.formatId, drc.formatId)
	}
	return twins
}

// A line is a codec and its chips say the bitrate. Lines hold every track's
// streams; the list shows one track's at a time.
function audioLines(rows: readonly BaseAudioRow[]): AudioLine[] {
	const twins = drcTwins(rows)
	return groupBy(rows, row => row.codec ?? audioCodecName(row.ext) ?? row.ext.toUpperCase()).map(([name, variants]) => ({
		name,
		// Best bitrate first; at equal bitrate, Dolby Digital Plus before Dolby Digital.
		variants: variants
			.toSorted((a, b) => (b.kbps ?? 0) - (a.kbps ?? 0) || Number(b.details.includes('E-AC-3')) - Number(a.details.includes('E-AC-3')))
			.map(row => {
				const twinId = twins.get(row.formatId) ?? null
				// A paired stream's DRC is the switch's to say; a lone DRC stream keeps the tag.
				const chipTags = twinId ? row.details.filter(detail => detail !== 'DRC') : row.details
				return {...row, chipLabel: row.bitrate ?? row.ext, chipTags, twinId}
			})
	}))
}

export interface SelectViewInput {
	selectedVideoFormatId: string
	audioSelection: AudioSelection
	lastConvertBitrate: AudioBitrate
	mediaKind: WizardMediaKind
	wizardFormats: FormatOption[]
	// What the download profile picked, to tag those rows. Null outside single mode.
	profilePick?: {videoFormatId: string; audioSelection: AudioSelection} | null
	profileVideoFallback?: boolean
	// Part of video: sizes scale to the range. Null for the whole video.
	videoPart?: {part: VideoPart; durationSeconds: number} | null
}

function nameOf(resolution: string): {name: string; alias: string | null} {
	const {label, alias} = resolutionLabel(resolution)
	return {name: label, alias}
}

// Exported for unit-testing the gating logic (muxed-only sources, audio-only
// modes, etc.) without spinning up the zustand store.
export function selectView(state: SelectViewInput): FormatSelectionView {
	const {selectedVideoFormatId, audioSelection, lastConvertBitrate, mediaKind, wizardFormats} = state
	const scale = sizeScale(state.videoPart)
	const pickedVideo = state.profilePick?.videoFormatId
	const profileVideoId = pickedVideo !== undefined && pickedVideo !== '' ? pickedVideo : null
	const profileAudio = state.profilePick?.audioSelection
	const profileAudioId = profileAudio?.kind === 'native' ? profileAudio.formatId : null

	const isAudioOnly = mediaKind === 'audio'
	const isSubtitleOnly = mediaKind === 'subtitles'
	// Some extractors (PornHub, Twitch VODs, smaller hosts) return only muxed
	// formats — no separable audio streams. With separable audio, picking
	// convert-* alongside a video stream is invalid because yt-dlp's `-x` is
	// mutually exclusive with video+audio merging. With muxed-only sources,
	// there's no merging step — yt-dlp downloads the muxed stream and `-x`
	// extracts the audio track. The `setAudioSelection` reducer clears video on
	// convert-* anyway, so the operation reduces to audio-convert kind cleanly.
	const hasSeparableAudio = wizardFormats.some(f => f.isAudioOnly)

	const mode: FormatSelectionView['mode'] = isSubtitleOnly ? 'subtitle-only' : isAudioOnly ? 'audio-only' : 'video+audio'

	const canDownload = isSubtitleOnly || (isAudioOnly ? audioSelection.kind !== 'none' : selectedVideoFormatId !== '')

	const currentResolutionLabel = isSubtitleOnly ? i18next.t('wizard.formats.kind.subtitles') : isAudioOnly ? i18next.t('wizard.formats.audioOnly') : resolveVideoResolution(selectedVideoFormatId, wizardFormats, i18next.t('wizard.formats.audioOnly'))

	// Video plus its native audio track; a conversion's size isn't known ahead.
	const nativeAudioId = audioSelection.kind === 'native' ? audioSelection.formatId : null
	const sizes = [isAudioOnly ? null : selectedVideoFormatId, nativeAudioId].flatMap(id => (id ? [wizardFormats.find(f => f.formatId === id)?.filesize] : []))
	const selectedFilesize = isSubtitleOnly || sizes.length === 0 || sizes.some(size => size === undefined) ? undefined : scale.bytes(sizes.reduce<number>((total, size) => total + (size ?? 0), 0))

	// Conversions belong to Audio mode; with a video pick they'd be merged with
	// video, which yt-dlp's `-x` can't do. A muxed-only source keeps them, since
	// converting its stream is the only way to get audio from it.
	const convertDisabled = !isAudioOnly && hasSeparableAudio
	const lossyConvert = audioSelection.kind === 'convert-lossy' ? audioSelection : null
	const bitrateValue = lossyConvert?.bitrateKbps ?? lastConvertBitrate
	// "No audio" row makes no sense in audio-only mode when separable audio
	// exists — the user has affirmatively asked for audio. With muxed-only
	// sources, audio-only mode is reached via convert-*; "No audio" still
	// doesn't apply, so the existing behavior holds.
	const noAudioDisabled = isAudioOnly
	const selectedFormat = wizardFormats.find(f => f.formatId === selectedVideoFormatId)
	const selectedVideoIsMuxed = !!selectedFormat && !selectedFormat.isVideoOnly && !selectedFormat.isAudioOnly
	const groupedVideo = groupVideoFormats(wizardFormats, [selectedVideoFormatId, profileVideoId ?? ''])
	const formatById = new Map(wizardFormats.map(format => [format.formatId, format]))
	const commonFps = usualFps(groupedVideo.flatMap(group => formatById.get(group.formatId) ?? []))
	const videoRows = groupedVideo.map((group): VideoFormatRow => {
		const rawFormat = formatById.get(group.formatId)
		const filesize = scale.bytes(rawFormat?.filesize)
		const ext = rawFormat?.ext ?? ''
		const codec = videoCodecName(rawFormat?.videoCodec)
		const fps = rawFormat?.fps ?? null
		const dynamicRange = rawFormat?.dynamicRange ?? null
		return {
			filesize,
			formatId: group.formatId,
			resolution: group.resolution,
			ext,
			codec,
			fps,
			dynamicRange,
			size: filesize ? scale.text(filesize) : null,
			chipLabel: codec ?? ext,
			chipTags: compact([fps !== null && fps !== commonFps ? `${fps} fps` : null]),
			range: dynamicRange ?? SDR,
			isProfilePick: group.formatId === profileVideoId
		}
	})
	const ranges = [...new Set(videoRows.map(row => row.range))].toSorted((a, b) => Number(a === SDR) - Number(b === SDR))
	const videoLines = groupBy(videoRows, row => row.resolution).map(([resolution, variants]): VideoLine => ({resolution, ...nameOf(resolution), variants}))
	const audioRows = wizardFormats.flatMap(format => (format.isAudioOnly ? [nativeAudioRow(format, profileAudioId, scale)] : []))
	const lines = audioLines(audioRows)
	const namedTracks = [...new Set(audioRows.flatMap(row => (row.track ? [row.track] : [])))]
	const convertTargets = convertDisabled ? [] : AUDIO_CONVERT_TARGETS.map(spec => spec.target)

	return {
		mode,
		canDownload,
		currentResolutionLabel,
		selectedFilesize,
		sizesScaledToPart: scale.scaled,
		video: {disabled: isSubtitleOnly, lines: videoLines, rows: videoRows, ranges, profilePickIsFallback: state.profileVideoFallback === true},
		audio: {
			lines,
			nativeRows: lines.flatMap(line => line.variants),
			hasDrcTwins: lines.some(line => line.variants.some(row => row.twinId !== null)),
			tracks: namedTracks.length > 1 ? namedTracks : [],
			sourceKbps: audioRows.reduce<number | null>((best, row) => (row.kbps !== null && (best === null || row.kbps > best) ? Math.round(row.kbps) : best), null),
			convertTargets,
			noAudioDisabled,
			selectedVideoIsMuxed,
			bitrateStrip: {hidden: convertDisabled, value: bitrateValue}
		}
	}
}

export function useFormatSelectionView(): FormatSelectionView {
	const selectedVideoFormatId = useAppStore(s => s.selectedVideoFormatId)
	const audioSelection = useAppStore(s => s.audioSelection)
	const lastConvertBitrate = useAppStore(s => s.lastConvertBitrate)
	const mediaKind = useAppStore(s => s.wizardMediaKind)
	const wizardFormats = useAppStore(s => s.wizardFormats)
	const baseline = useAppStore(s => s.wizardProfileBaseline)
	const profileVideoFallback = useAppStore(s => s.wizardFitNotices.some(notice => notice.kind === 'video-tier-fallback'))
	const wizardPart = useAppStore(s => s.wizardPart)
	const wizardDuration = useAppStore(s => s.wizardDuration)

	return useMemo(() => {
		const part = wizardVideoPart({wizardPart, wizardDuration, wizardMediaKind: mediaKind})
		const videoPart = part && wizardDuration !== undefined ? {part, durationSeconds: wizardDuration} : null
		return selectView({selectedVideoFormatId, audioSelection, lastConvertBitrate, mediaKind, wizardFormats, profilePick: baseline, profileVideoFallback, videoPart})
	}, [selectedVideoFormatId, audioSelection, lastConvertBitrate, mediaKind, wizardFormats, baseline, profileVideoFallback, wizardPart, wizardDuration])
}
