import {extractSelection} from '@shared/audioConversionSource.js'
import {selectionSourceFromOptions} from '@shared/ytdlp/optionSelectionSource.js'
import type {FormatSelectionSource} from '@shared/ytdlp/selectableFormat.js'
import {useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {i18next} from '@shared/i18n/index.js'
import {humanBitrate, humanSize} from '@shared/format.js'
import {AUDIO_CONVERT_TARGETS} from '@shared/audioTargets.js'
import {audioCodecName, VIDEO_CODEC_ORDER, videoCodecName} from '@shared/fileTypeFit.js'
import {channelLabel, sampleRateLabel} from '@shared/audioTrackMeta.js'
import type {FormatMarker} from '@shared/types.js'
import type {AudioBitrate, AudioConvertTarget, FormatOption} from '@shared/types.js'
import type {AudioTrackQuality, WizardMediaKind} from '@shared/schemas.js'
import type {VideoPart} from '@shared/preparedJob.js'
import {scaleBytesToPart} from '@shared/videoPart.js'
import type {AudioSelection} from './types.js'
import {useAppStore} from './useAppStore.js'
import {resolutionLabel} from '@renderer/lib/resolutionLabel.js'
import {groupVideoFormats, resolveVideoResolution} from './helpers.js'
import {wizardVideoPart} from './wizard/videoPart.js'
import {formatMode} from './wizard/formatMode.js'

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
	bitrate: string | null
	// The hover hint: only what the chip and its row and column leave out; null when that is nothing.
	hint: string | null
	// What the chip says: the codec, or the file type when the codec is unknown.
	chipLabel: string
	// Said after the label: a frame rate other than the one most streams have.
	chipTags: string[]
	// The dynamic-range column the chip sits in: an HDR format, or SDR.
	range: string
	// The stream the download profile picked for this video.
	isProfilePick: boolean
	// Audio and video in one stream: picking it offers Keep as-is.
	hasAudio: boolean
	// What yt-dlp's notes say about the stream (AI upscaled, damaged...): an icon each on the chip.
	markers: StreamMarkerView[]
}

// A stream marker and its name, for the chip's icon and its hint.
export interface StreamMarkerView {
	marker: StreamMarker
	label: string
}

// One resolution, with every stream that offers it, best first.
export interface VideoLine {
	// Unique per line: a resolution's name, or a size-only file's own id.
	id: string
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
	// What sets the whole track apart (AI dubbed, audio description), for the language picker.
	trackTags: string[]
	markers: StreamMarkerView[]
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
		// Inside each range, one column per codec in yt-dlp's order, so a codec
		// sits in the same column on every line; streams whose codec the site
		// doesn't name (null) share one last column, labelled by file type.
		columns: {range: string; codec: string | null}[]
		profilePickIsFallback: boolean
		// Some streams carry their own audio and some don't (YouTube's 360p MP4):
		// only then is "with audio" worth saying on a chip.
		mixedAudio: boolean
	}
	audio: {
		lines: AudioLine[]
		// Every stream of `lines`, in the same order.
		nativeRows: NativeAudioRow[]
		// Some stream has a DRC twin, so the list offers the DRC switch.
		hasDrcTwins: boolean
		// The named tracks (languages) to pick from, in the probe's order; empty when there is at most one.
		tracks: string[]
		// Per track, what sets it apart (AI dubbed, audio description).
		trackTags: Record<string, string[]>
		// The source's own default (or original) language, where the list opens
		// when no stream is picked yet: never an AI dub just because it is listed first.
		defaultTrack: string | null
		// Audio mode on a site with only combined files: "Keep as-is" extracts their audio.
		extractOffered: boolean
		// The combined file it extracts: the one yt-dlp would pick.
		extractFormatId: string | null
		// The best native bitrate, which a lossy conversion cannot improve on.
		sourceKbps: number | null
		// The probe's own yt-dlp formats, which say which stream a conversion starts from.
		conversionSelection: FormatSelectionSource
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

function sizeScale(videoPart: SelectViewInput['videoPart'], language: string | undefined): SizeScale {
	if (!videoPart) return {bytes: bytes => bytes, text: bytes => humanSize(bytes, language), scaled: false}
	return {bytes: bytes => scaleBytesToPart(bytes, videoPart.part, videoPart.durationSeconds), text: bytes => `~${humanSize(bytes, language)}`, scaled: true}
}

// Dolby Digital and Dolby Digital Plus share the Dolby column; the chip says which.
function dolbyVariant(codec: string | undefined): string | null {
	const lower = codec?.toLowerCase().replaceAll('-', '') ?? ''
	if (lower === 'ec3' || lower === 'eac3') return 'E-AC-3'
	if (lower === 'ac3') return 'AC-3'
	return null
}

const MARKER_LABEL_KEYS = {
	'ai-upscaled': 'wizard.formats.marker.aiUpscaled',
	'ai-dubbed': 'wizard.formats.marker.aiDubbed',
	'audio-description': 'wizard.formats.marker.audioDescription',
	'spatial-audio': 'wizard.formats.marker.spatialAudio',
	vr: 'wizard.formats.marker.vr',
	'enhanced-bitrate': 'wizard.formats.marker.enhancedBitrate',
	damaged: 'wizard.formats.marker.damaged',
	watermarked: 'wizard.formats.marker.watermarked'
} as const satisfies Record<FormatMarker, string>

// AI dubs and audio description are a whole track's, so the language picker
// says them; 360° / VR is the whole video's, so the video card says it; the
// rest belong to the stream, on its chip.
const TRACK_MARKERS: readonly FormatMarker[] = ['ai-dubbed', 'audio-description']
const VIDEO_MARKERS: readonly FormatMarker[] = ['vr']
const STREAM_MARKERS = ['ai-upscaled', 'enhanced-bitrate', 'damaged', 'watermarked', 'spatial-audio'] as const satisfies readonly FormatMarker[]
export type StreamMarker = (typeof STREAM_MARKERS)[number]

function isStreamMarker(marker: FormatMarker): marker is StreamMarker {
	return (STREAM_MARKERS as readonly FormatMarker[]).includes(marker)
}

function markerViews(markers: readonly FormatMarker[] | undefined): StreamMarkerView[] {
	return (markers ?? []).filter(isStreamMarker).map(marker => ({marker, label: i18next.t(MARKER_LABEL_KEYS[marker])}))
}

function markerTags(markers: readonly FormatMarker[] | undefined, shown: readonly FormatMarker[]): string[] {
	return (markers ?? []).filter(marker => shown.includes(marker)).map(marker => i18next.t(MARKER_LABEL_KEYS[marker]))
}

function defaultTrackOf(formats: readonly FormatOption[], rows: readonly BaseAudioRow[], tracks: readonly string[]): string {
	const source = formats.find(f => f.isAudioOnly && f.isDefaultAudio === true) ?? formats.find(f => f.isAudioOnly && f.isOriginalAudio === true)
	return rows.find(row => row.formatId === source?.formatId)?.track ?? tracks[0]
}

// YouTube lists an HLS copy of each audio track with no codec named. The audio
// column shows it only where its language has no track with a named codec, or
// when it is the pick: every stream stays pickable, but no track is listed twice.
export function listedAudioFormats(formats: readonly FormatOption[], keepIds: readonly (string | null)[]): FormatOption[] {
	const audio = formats.filter(format => format.isAudioOnly)
	const namedLanguages = new Set(audio.filter(format => format.audioCodec !== undefined).map(format => format.audioLanguage))
	return audio.filter(format => format.audioCodec !== undefined || !namedLanguages.has(format.audioLanguage) || keepIds.includes(format.formatId))
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
		trackTags: markerTags(format.markers, TRACK_MARKERS),
		markers: markerViews(format.markers),
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
	// The same formats as yt-dlp sees them; read back from the options without one.
	formatSelection?: FormatSelectionSource
	// What the download profile picked, to tag those rows. Null outside single mode.
	profilePick?: {videoFormatId: string; audioSelection: AudioSelection} | null
	profileVideoFallback?: boolean
	// Part of video: sizes scale to the range. Null for the whole video.
	videoPart?: {part: VideoPart; durationSeconds: number} | null
	// Video, no audio: only streams without audio of their own are listed.
	silentVideo?: boolean
	// UI language for sizes; without one the digits stay plain en-US.
	language?: string
}

// "1080p" → 1080; names that are not a tier sort last.
function tierHeight(name: string): number {
	const match = /^(\d+)p/.exec(name)
	return match ? Number(match[1]) : 0
}

// A stream the site gives no size for still needs a line name.
function nameOf(resolution: string): {name: string; alias: string | null} {
	const {label, alias} = resolutionLabel(resolution)
	return {name: label === '' ? i18next.t('wizard.formats.resolutionUnknown') : label, alias}
}

// Facebook names its two combined files sd and hd, and nothing else about them.
const SITE_QUALITY_ID = /^(?:sd|hd)$/i

// A resolution's line holds its codecs side by side. A file with no resolution
// and no codec that its size told apart (groupVideoFormats) gets a line of its
// own, named the site's way when the site names it.
function lineOf(row: VideoFormatRow): {id: string; name: string; alias: string | null} {
	const named = nameOf(row.resolution)
	if (resolutionLabel(row.resolution).label !== '' || row.codec !== null || row.filesize === undefined) return {id: named.name, ...named}
	return {id: `file:${row.formatId}`, name: SITE_QUALITY_ID.test(row.formatId) ? row.formatId.toUpperCase() : named.name, alias: null}
}

// Exported for unit-testing the gating logic (muxed-only sources, audio-only
// modes, etc.) without spinning up the zustand store.
export function selectView(state: SelectViewInput): FormatSelectionView {
	const {selectedVideoFormatId, audioSelection, lastConvertBitrate, mediaKind, wizardFormats} = state
	const scale = sizeScale(state.videoPart, state.language)
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

	const resolutionLabelText = isSubtitleOnly ? i18next.t('wizard.formats.kind.subtitles') : isAudioOnly ? i18next.t('wizard.formats.audioOnly') : resolveVideoResolution(selectedVideoFormatId, wizardFormats, i18next.t('wizard.formats.audioOnly'))
	const videoWide = markerTags(wizardFormats.find(f => f.formatId === selectedVideoFormatId)?.markers, VIDEO_MARKERS)
	const currentResolutionLabel = [resolutionLabelText, ...videoWide].join(' · ')

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
	const groupedVideo = groupVideoFormats(state.silentVideo ? wizardFormats.filter(f => f.isVideoOnly || f.isAudioOnly) : wizardFormats, [selectedVideoFormatId, profileVideoId ?? ''])
	const formatById = new Map(wizardFormats.map(format => [format.formatId, format]))
	const commonFps = usualFps(groupedVideo.flatMap(group => formatById.get(group.formatId) ?? []))
	const videoRows = groupedVideo.map((group): VideoFormatRow => {
		const rawFormat = formatById.get(group.formatId)
		const filesize = scale.bytes(rawFormat?.filesize)
		const ext = rawFormat?.ext ?? ''
		const codec = videoCodecName(rawFormat?.videoCodec)
		const fps = rawFormat?.fps ?? null
		const dynamicRange = rawFormat?.dynamicRange ?? null
		const fpsTag = fps !== null && fps !== commonFps ? `${fps} fps` : null
		const bitrate = rawFormat?.tbr ? i18next.t('wizard.formats.bitrateValue', {bitrate: humanBitrate(rawFormat.tbr, state.language)}) : null
		const hint = compact([codec ? ext : null, fps !== null && !fpsTag ? `${fps} fps` : null, bitrate]).join(' · ')
		return {
			filesize,
			formatId: group.formatId,
			resolution: group.resolution,
			ext,
			codec,
			fps,
			dynamicRange,
			size: filesize ? scale.text(filesize) : null,
			bitrate,
			hint: hint === '' ? null : hint,
			chipLabel: codec ?? ext,
			chipTags: compact([fpsTag]),
			range: dynamicRange ?? SDR,
			isProfilePick: group.formatId === profileVideoId,
			hasAudio: rawFormat !== undefined && !rawFormat.isVideoOnly,
			markers: markerViews(rawFormat?.markers)
		}
	})
	const ranges = [...new Set(videoRows.map(row => row.range))].toSorted((a, b) => Number(a === SDR) - Number(b === SDR))
	// One line per tier name, tallest first: sites list streams in their own order.
	const codecRank = (row: VideoFormatRow): number => (row.codec === null ? VIDEO_CODEC_ORDER.length : VIDEO_CODEC_ORDER.indexOf(row.codec))
	const byCodec = (a: VideoFormatRow, b: VideoFormatRow): number => codecRank(a) - codecRank(b)
	const videoColumns = ranges.flatMap(range =>
		[
			...new Set(
				videoRows
					.filter(row => row.range === range)
					.toSorted(byCodec)
					.map(row => row.codec)
			)
		].map(codec => ({range, codec}))
	)
	const videoLines = groupBy(videoRows, row => lineOf(row).id)
		.map(([, variants]): VideoLine => ({resolution: variants[0].resolution, ...lineOf(variants[0]), variants: variants.toSorted(byCodec)}))
		// Size-only files (no tier of their own) follow the tiers, the biggest first.
		.toSorted((a, b) => tierHeight(b.name) - tierHeight(a.name) || (b.variants[0]?.filesize ?? 0) - (a.variants[0]?.filesize ?? 0))
	const audioRows = listedAudioFormats(wizardFormats, [nativeAudioId, profileAudioId]).map(format => nativeAudioRow(format, profileAudioId, scale))
	const lines = audioLines(audioRows)
	const namedTracks = [...new Set(audioRows.flatMap(row => (row.track ? [row.track] : [])))]
	const convertTargets = convertDisabled ? [] : AUDIO_CONVERT_TARGETS.map(spec => spec.target)
	const conversionSelection = state.formatSelection ?? selectionSourceFromOptions(wizardFormats)
	const extractOffered = isAudioOnly && !hasSeparableAudio && wizardFormats.some(f => !f.isVideoOnly)

	return {
		mode,
		canDownload,
		currentResolutionLabel,
		selectedFilesize,
		sizesScaledToPart: scale.scaled,
		video: {disabled: isSubtitleOnly, lines: videoLines, rows: videoLines.flatMap(line => line.variants), ranges, columns: videoColumns, profilePickIsFallback: state.profileVideoFallback === true, mixedAudio: videoRows.some(row => row.hasAudio) && videoRows.some(row => !row.hasAudio)},
		audio: {
			lines,
			nativeRows: lines.flatMap(line => line.variants),
			hasDrcTwins: lines.some(line => line.variants.some(row => row.twinId !== null)),
			tracks: namedTracks.length > 1 ? namedTracks : [],
			defaultTrack: namedTracks.length > 1 ? defaultTrackOf(wizardFormats, audioRows, namedTracks) : null,
			trackTags: Object.fromEntries(namedTracks.map(name => [name, [...new Set(audioRows.filter(row => row.track === name).flatMap(row => row.trackTags))]])),
			sourceKbps: audioRows.reduce<number | null>((best, row) => (row.kbps !== null && (best === null || row.kbps > best) ? Math.round(row.kbps) : best), null),
			extractOffered,
			extractFormatId: extractOffered ? (extractSelection(conversionSelection).formatId ?? null) : null,
			conversionSelection,
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
	const formatSelection = useAppStore(s => s.wizardFormatSelection)
	const baseline = useAppStore(s => s.wizardProfileBaseline)
	const profileVideoFallback = useAppStore(s => s.wizardFitNotices.some(notice => notice.kind === 'video-tier-fallback'))
	const wizardPart = useAppStore(s => s.wizardPart)
	const wizardDuration = useAppStore(s => s.wizardDuration)
	const silentVideo = useAppStore(s => formatMode(s) === 'video-only')
	// Re-renders on a language change, so sizes and labels follow it.
	const {i18n} = useTranslation()
	const language = i18n.language

	return useMemo(() => {
		const part = wizardVideoPart({wizardPart, wizardDuration, wizardMediaKind: mediaKind})
		const videoPart = part && wizardDuration !== undefined ? {part, durationSeconds: wizardDuration} : null
		return selectView({selectedVideoFormatId, audioSelection, lastConvertBitrate, mediaKind, wizardFormats, formatSelection, profilePick: baseline, profileVideoFallback, videoPart, silentVideo, language})
	}, [selectedVideoFormatId, audioSelection, lastConvertBitrate, mediaKind, wizardFormats, formatSelection, baseline, profileVideoFallback, wizardPart, wizardDuration, silentVideo, language])
}
