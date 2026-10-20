import type {FormatMarker, FormatOption} from '@shared/types.js'
import type {Site} from '@shared/sites/types.js'
import type {YtDlpFormat} from 'yt-dlp-bridge/info'
import {sortFormatsByQuality} from '@shared/qualitySorter.js'
import {humanSize} from '@shared/format.js'
import {audioTrackLabel, audioTrackQuality, channelLabel, isDefaultAudio, isOriginalAudio, sampleRateLabel} from '@shared/audioTrackMeta.js'

// yt-dlp formats → the labelled, quality-sorted options the format picker shows.

function friendlyCodec(acodec: string): string {
	if (acodec === 'opus') return 'Opus'
	if (acodec.startsWith('mp4a')) return 'AAC'
	return acodec
}

function isDrcAudio(format: YtDlpFormat): boolean {
	return /(?:^|[-_\s])drc(?:$|[-_\s])/i.test(format.format_id ?? '') || /\bdrc\b/i.test(format.format_note ?? '')
}

// No video track: yt-dlp says so (`vcodec: none`), or some clients leave the
// video codec out entirely, and then a stream with audio and no picture size is audio.
function isAudioOnlyFormat(format: YtDlpFormat): boolean {
	if (format.vcodec === 'none') return true
	return format.vcodec === undefined && !format.width && !format.height && format.acodec !== undefined && format.acodec !== 'none'
}

// HLS and DASH streams often carry no size; their bitrate over the video's
// length is a fair estimate, like the one yt-dlp itself makes when it can.
function estimatedFilesize(format: YtDlpFormat, durationSeconds: number | undefined): number | undefined {
	const kbps = format.tbr ?? (format.vbr !== undefined || format.abr !== undefined ? (format.vbr ?? 0) + (format.abr ?? 0) : undefined)
	if (!kbps || !durationSeconds) return undefined
	return Math.round((kbps * 1000 * durationSeconds) / 8)
}

// yt-dlp's notes and ids for streams that are not what they seem. YouTube
// marks most in `format_note` (its extractor builds them); an AI dub is noted
// only on its HLS copies, so the language carries it to the others.
const MARKER_TESTS: readonly (readonly [FormatMarker, (format: YtDlpFormat, note: string) => boolean])[] = [
	['ai-upscaled', (format, note) => (format.format_id ?? '').endsWith('-sr') || /\bAI-upscaled\b/i.test(note)],
	['audio-description', (format, note) => /(?:^|-)desc$/i.test(format.language ?? '') || /\bdescriptive\b/i.test(note)],
	['spatial-audio', (_format, note) => /\b(?:ambisonics?\w*|spatial)\b/i.test(note)],
	['vr', (_format, note) => /\b(?:equi\w*|mesh)\b/i.test(note)],
	['enhanced-bitrate', (_format, note) => /\bPremium\b/.test(note)],
	['damaged', (_format, note) => /\bDAMAGED\b/.test(note)],
	['watermarked', (_format, note) => /\bwatermark/i.test(note)]
]

// Markers that hold for every copy though only some copies are noted: an AI
// dub (per language) and a 360° / VR projection (the whole video).
interface VideoWideMarkers {
	aiDubbedLanguages: ReadonlySet<string>
	vr: boolean
}

function videoWideMarkers(formats: readonly YtDlpFormat[]): VideoWideMarkers {
	return {aiDubbedLanguages: new Set(formats.flatMap(format => (format.language && /\bdubbed-auto\b/i.test(format.format_note ?? '') ? [format.language] : []))), vr: formats.some(format => format.vcodec !== 'none' && MARKER_TESTS.some(([marker, test]) => marker === 'vr' && test(format, format.format_note ?? '')))}
}

function formatMarkers(format: YtDlpFormat, wide: VideoWideMarkers): FormatMarker[] {
	const note = format.format_note ?? ''
	const markers = MARKER_TESTS.flatMap(([marker, test]) => (marker !== 'vr' && test(format, note) ? [marker] : []))
	const isVideo = format.vcodec !== undefined && format.vcodec !== 'none'
	return [...markers, ...(format.language && wide.aiDubbedLanguages.has(format.language) ? (['ai-dubbed'] as const) : []), ...(wide.vr && isVideo ? (['vr'] as const) : [])]
}

export interface MapFormatsOptions {
	site: Pick<Site, 'sortsSourceBeforeCodec' | 'sortsProtocolBeforeSize'>
	durationSeconds?: number
}

// yt-dlp's protocol order (`FormatSorter.settings.proto`), best first; an
// unknown or missing protocol takes the place of its '' entry.
const PROTOCOL_ORDER: readonly (RegExp | null)[] = [/^(ht|f)tps/, /^(ht|f)tp$/, /^m3u8/, /^.*dash/, /^websocket_frag/, /^rtmpe?/, null, /^(ws|websocket)/, /^f4/]

function protocolPreference(protocol: string | undefined): number {
	const lower = protocol?.toLowerCase()
	const index = lower === undefined ? -1 : PROTOCOL_ORDER.findIndex(pattern => pattern !== null && pattern.test(lower))
	return PROTOCOL_ORDER.length - (index < 0 ? PROTOCOL_ORDER.indexOf(null) : index)
}

// `source_preference` is not in the bridge's typed format schema; it passes
// through its loose fields, so it is checked here. Kept only where yt-dlp
// ranks it before the codec (`Site.sortsSourceBeforeCodec`).
function streamFlags(format: YtDlpFormat, wide: VideoWideMarkers, site: MapFormatsOptions['site']): Pick<FormatOption, 'markers' | 'preference' | 'quality' | 'sourcePreference' | 'protocolPreference'> {
	const markers = formatMarkers(format, wide)
	const sourcePreference = site.sortsSourceBeforeCodec ? format.source_preference : undefined
	return {
		...(markers.length > 0 ? {markers} : {}),
		...(typeof format.preference === 'number' ? {preference: format.preference} : {}),
		...(typeof format.quality === 'number' ? {quality: format.quality} : {}),
		...(typeof sourcePreference === 'number' ? {sourcePreference} : {}),
		...(site.sortsProtocolBeforeSize ? {protocolPreference: protocolPreference(format.protocol)} : {})
	}
}

export function mapFormats(formats: readonly YtDlpFormat[], {site, durationSeconds}: MapFormatsOptions): FormatOption[] {
	const wide = videoWideMarkers(formats)
	const mapped = formats.flatMap((item): FormatOption[] => {
		// A DRM-protected stream can't be downloaded (yt-dlp refuses it), so it is no choice.
		if (!item.format_id || item.ext === 'mhtml' || item.has_drm === true || (item.vcodec === 'none' && (!item.acodec || item.acodec === 'none'))) return []
		const isAudioOnly = isAudioOnlyFormat(item)
		const ext = item.ext ?? 'unknown'
		const filesize = item.filesize ?? item.filesize_approx ?? estimatedFilesize(item, durationSeconds)
		const formatId = item.format_id ?? ''

		if (isAudioOnly) {
			const abr = item.abr
			const audioCodec = item.acodec
			const isDrc = isDrcAudio(item)
			const codec = friendlyCodec(item.acodec ?? '')
			const trackLabel = audioTrackLabel(item)
			const trackQuality = audioTrackQuality(item)
			const defaultAudio = isDefaultAudio(item)
			const originalAudio = isOriginalAudio(item)
			const details = [trackLabel, ext, codec, channelLabel(item.audio_channels), isDrc ? 'DRC' : null, sampleRateLabel(item.asr), abr ? `${Math.round(abr)} kbps` : null, filesize ? humanSize(filesize) : null].filter(Boolean).join(' · ')
			return [
				{
					formatId,
					label: details,
					ext,
					resolution: 'audio only',
					abr,
					audioCodec,
					...(item.audio_channels ? {audioChannels: Math.round(item.audio_channels)} : {}),
					...(item.asr ? {sampleRateHz: item.asr} : {}),
					isDrc,
					...(item.language ? {audioLanguage: item.language} : {}),
					...(typeof item.language_preference === 'number' ? {audioLanguagePreference: item.language_preference} : {}),
					...(trackLabel ? {audioTrackLabel: trackLabel} : {}),
					...(trackQuality ? {audioTrackQuality: trackQuality} : {}),
					isDefaultAudio: defaultAudio,
					isOriginalAudio: originalAudio,
					filesize,
					isVideoOnly: false,
					isAudioOnly: true,
					dynamicRange: undefined,
					...streamFlags(item, wide, site)
				} satisfies FormatOption
			]
		}

		// yt-dlp says "unknown" when the site gives no size; that is no name to
		// show, and neither is a note like TikTok's "watermarked".
		const resolution = item.resolution && item.resolution !== 'unknown' ? item.resolution : item.width && item.height ? `${item.width}x${item.height}` : ''
		const fps = item.fps
		const isVideoOnly = item.acodec === 'none'
		const dynamicRange = item.dynamic_range && item.dynamic_range !== 'SDR' ? item.dynamic_range : undefined
		const details = [resolution, ext, fps ? `${fps}fps` : null, dynamicRange ?? null, filesize ? humanSize(filesize) : null].filter(Boolean).join(' | ')
		const tbr = item.tbr ?? item.vbr

		return [{formatId, label: details, ext, resolution, fps, ...(item.vcodec ? {videoCodec: item.vcodec} : {}), ...(tbr ? {tbr} : {}), filesize, isVideoOnly, isAudioOnly: false, dynamicRange, ...streamFlags(item, wide, site)} satisfies FormatOption]
	})

	return sortFormatsByQuality(mapped)
}
