// Download profile + probe → the concrete pre-selection of the single-video
// Format screen. The profile describes intent ("up to 720p, MP4"); the probe
// lists what this video has. The result names exact format ids so sizes and
// the review are exact, plus fit notices for every part of the profile this
// video can't honour. Walks the same selection order the queued download's
// yt-dlp sort is derived from (`selectionOrder.ts`), so Interactive and Quick
// Download pick the same streams.

import {DEFAULT_AUDIO_BITRATE} from './schemas.js'
import type {AudioBitrate, AudioSelection, DownloadProfile, DownloadProfileAudioFormat, NativeAudioPreference, PlaylistVideoTier, WizardMediaKind} from './schemas.js'
import type {FormatOption, SubtitleMap} from './types.js'
import {preferredNativeAudioId} from './nativeAudioPreference.js'
import type {GlobalHdr} from './hdrSetting.js'
import {selectionOrder, type AudioRank, type SelectionOrder, type VideoRank} from './selectionOrder.js'
import {matchesSubtitleLanguage} from './subtitleLanguages.js'
import {tierHeightOf} from './videoTier.js'

export interface ProfileSelectionInput {
	profile: DownloadProfile
	formats: readonly FormatOption[]
	subtitles: SubtitleMap
	automaticCaptions: SubtitleMap
	isAudioOnlySource: boolean
	nativeAudioPreference: NativeAudioPreference
	// The app-wide HDR choice; the profile may override it. Absent reads as the app default.
	hdrPreference?: GlobalHdr
}

export interface MediaSelection {
	kind: WizardMediaKind
	videoFormatId: string
	audioSelection: AudioSelection
}

export type FitNotice = {kind: 'video-tier-fallback'; wanted: Exclude<PlaylistVideoTier, 'best'>; picked: number} | {kind: 'mp4-unavailable'} | {kind: 'webm-unavailable'; blocker: string} | {kind: 'no-video'} | {kind: 'subtitle-languages-missing'; languages: string[]}

export interface ProfileSelection {
	media: MediaSelection
	subtitleLanguages: string[]
	notices: FitNotice[]
	// The order that made the pick, for the "Why this one" explanation. Null
	// when the profile has no video (audio or subtitles only).
	order: SelectionOrder | null
}

const AUTO_CAPTION_SUFFIX = '-orig'
const NO_AUDIO: AudioSelection = {kind: 'none'}

// The stream's tier (see videoTier.ts): the same height the Format screen names
// its row by, so a letterboxed 1280x640 is 720, never a 640 "fallback".
export function videoHeight(resolution: string): number {
	const dims = /(\d+)\s*x\s*(\d+)/.exec(resolution)
	if (dims) return tierHeightOf(Number(dims[1]), Number(dims[2])) ?? Math.min(Number(dims[1]), Number(dims[2]))
	const p = /(\d{3,4})p/.exec(resolution)
	if (p) return Number(p[1])
	const any = /(\d{3,4})/.exec(resolution)
	return any ? Number(any[1]) : 0
}

export function isH264(format: FormatOption): boolean {
	const codec = format.videoCodec?.toLowerCase() ?? ''
	return codec.startsWith('avc1') || codec.startsWith('h264')
}

function nativeAudio(audioFormats: readonly FormatOption[], preference: NativeAudioPreference): AudioSelection {
	const id = preferredNativeAudioId(audioFormats, preference)
	return id === null ? NO_AUDIO : {kind: 'native', formatId: id}
}

// yt-dlp's vcodec order (`FormatSorter.settings.vcodec`), best first: `vp9`
// and `vp09.00…` are one codec, HDR VP9 (`vp09.02…`) ranks above them. Codecs
// it doesn't name rank below every named one.
const VIDEO_CODEC_ORDER: readonly RegExp[] = [/^av0?1/, /^vp0?9\.0?2/, /^vp0?9/, /^(?:[hx]265|he?vc?)/, /^(?:[hx]264|avc)/, /^vp0?8/, /^(?:mp4v|h263)/, /^theora/]

function codecRank(format: FormatOption): number {
	const codec = format.videoCodec?.toLowerCase() ?? ''
	const index = VIDEO_CODEC_ORDER.findIndex(pattern => pattern.test(codec))
	return index < 0 ? VIDEO_CODEC_ORDER.length : index
}

// yt-dlp's value for a stream whose site sets no `source_preference`.
const DEFAULT_SOURCE_PREFERENCE = -1

// The ranks after resolution compare streams of one height, best first.
function compareByRank(rank: VideoRank, a: FormatOption, b: FormatOption, order: SelectionOrder): number {
	switch (rank.kind) {
		case 'fps':
			return (b.fps ?? 0) - (a.fps ?? 0)
		case 'hdr': {
			const hdrFirst = Number(b.dynamicRange !== undefined) - Number(a.dynamicRange !== undefined)
			return order.hdr.preference === 'hdr' ? hdrFirst : -hdrFirst
		}
		case 'source':
			return (b.sourcePreference ?? DEFAULT_SOURCE_PREFERENCE) - (a.sourcePreference ?? DEFAULT_SOURCE_PREFERENCE)
		case 'codec':
			return codecRank(a) - codecRank(b)
		case 'protocol':
			return (b.protocolPreference ?? 0) - (a.protocolPreference ?? 0)
		case 'size':
			return (b.filesize ?? 0) - (a.filesize ?? 0)
		case 'site-preference':
		case 'original':
		case 'h264':
		case 'mp4-streams':
		case 'resolution':
			return 0
	}
}

// The tallest stream at or below the tier (any height for "best"), else the
// shortest one above it.
function targetHeight(videos: readonly FormatOption[], tier: PlaylistVideoTier): number {
	const heights = videos.map(f => videoHeight(f.resolution))
	const fitting = tier === 'best' ? heights : heights.filter(height => height <= Number(tier))
	return fitting.length > 0 ? Math.max(...fitting) : Math.min(...heights)
}

// Narrows the pool rank by rank, the way the yt-dlp sort orders them: the
// ranks before resolution filter (H.264, then MP4 streams; a rank no stream
// meets is skipped), resolution fixes the height, the rest break ties.
// Smart TV and video-only take a separate video stream (`bestvideo`), falling
// back to a muxed one only when nothing else exists.
function pickVideo(videos: readonly FormatOption[], order: SelectionOrder, notices: FitNotice[]): FormatOption | undefined {
	let pool = videos
	const resolutionAt = order.video.findIndex(rank => rank.kind === 'resolution')
	for (const rank of order.video.slice(0, resolutionAt)) {
		const topPreference = rank.kind === 'site-preference' ? Math.max(...pool.map(f => f.preference ?? 0)) : 0
		const narrowed = pool.filter(f => (rank.kind === 'site-preference' ? (f.preference ?? 0) === topPreference : rank.kind === 'original' ? !f.markers?.includes('ai-upscaled') : rank.kind === 'h264' ? isH264(f) : rank.kind === 'mp4-streams' ? f.ext === 'mp4' : true))
		// Without H.264 the profile can't be honoured anyway: pick by resolution
		// across every codec so the notice can say what was chosen and why.
		if (narrowed.length === 0 && rank.kind === 'h264') {
			notices.push({kind: 'mp4-unavailable'})
			break
		}
		if (narrowed.length > 0) pool = narrowed
	}
	if (order.separateVideoStream) {
		const separate = pool.filter(f => f.isVideoOnly)
		if (separate.length > 0) pool = separate
	}
	const height = targetHeight(pool, order.tier)
	const tieBreakers = order.video.slice(resolutionAt + 1)
	return pool
		.filter(f => videoHeight(f.resolution) === height)
		.toSorted((a, b) => {
			// The site's own rating of copies at one height (part of its preference).
			const byQuality = (b.quality ?? 0) - (a.quality ?? 0)
			if (byQuality !== 0) return byQuality
			for (const rank of tieBreakers) {
				const result = compareByRank(rank, a, b, order)
				if (result !== 0) return result
			}
			return 0
		})[0]
}

function isOpus(format: FormatOption): boolean {
	return (format.audioCodec?.toLowerCase() ?? '').startsWith('opus') || format.ext === 'webm'
}

// AAC and Opus profiles pick inside their codec when the video has it: AAC
// selects `bestaudio[ext=m4a]` sorted by `acodec:m4a`, so Dolby (also .m4a) is
// never its pick whatever the native preference.
function videoAudioSelection(rank: AudioRank, audioFormats: readonly FormatOption[], preference: NativeAudioPreference): AudioSelection {
	if (rank.kind === 'aac') {
		const m4a = audioFormats.filter(f => f.ext === 'm4a')
		if (m4a.length > 0) return nativeAudio(m4a, 'compatible')
		return nativeAudio(audioFormats, preference)
	}
	if (rank.kind === 'opus') {
		const opus = audioFormats.filter(isOpus)
		return nativeAudio(opus.length > 0 ? opus : audioFormats, preference)
	}
	return nativeAudio(audioFormats, preference)
}

function audioOnlySelection(profileAudio: {format: DownloadProfileAudioFormat; bitrateKbps?: AudioBitrate}, audioFormats: readonly FormatOption[], preference: NativeAudioPreference): AudioSelection {
	if (profileAudio.format === 'wav') return {kind: 'convert-lossless', target: 'wav'}
	if (profileAudio.format !== 'best') return {kind: 'convert-lossy', target: profileAudio.format, bitrateKbps: profileAudio.bitrateKbps ?? DEFAULT_AUDIO_BITRATE}
	// A source with no separable audio track can only give audio by converting
	// its muxed stream; "native" would land on the disabled "No audio" row.
	if (audioFormats.length === 0) return {kind: 'convert-lossy', target: 'mp3', bitrateKbps: DEFAULT_AUDIO_BITRATE}
	return nativeAudio(audioFormats, preference)
}

// The order shown as "Why this one" drops the source and protocol ranks when
// no stream of this video carries one (any site but YouTube): every copy ties
// on it there.
function forThisVideo(order: SelectionOrder, videos: readonly FormatOption[]): SelectionOrder {
	const hasSource = videos.some(f => f.sourcePreference !== undefined)
	const hasProtocol = videos.some(f => f.protocolPreference !== undefined)
	return {...order, video: order.video.filter(rank => (rank.kind !== 'source' || hasSource) && (rank.kind !== 'protocol' || hasProtocol))}
}

function resolveMedia(input: ProfileSelectionInput, notices: FitNotice[]): {media: MediaSelection; order: SelectionOrder | null} {
	const {profile, formats, nativeAudioPreference} = input
	const media = profile.media
	const videos = formats.filter(f => !f.isAudioOnly)
	const audioFormats = formats.filter(f => f.isAudioOnly)

	if (media.kind === 'subtitles-only') return {media: {kind: 'subtitles', videoFormatId: '', audioSelection: NO_AUDIO}, order: null}
	if (media.kind === 'audio-only') return {media: {kind: 'audio', videoFormatId: '', audioSelection: audioOnlySelection(media.audio, audioFormats, nativeAudioPreference)}, order: null}

	const order = forThisVideo(selectionOrder(media, nativeAudioPreference, input.hdrPreference), videos)
	if (input.isAudioOnlySource || videos.length === 0) {
		notices.push({kind: 'no-video'})
		return {media: {kind: 'audio', videoFormatId: '', audioSelection: audioOnlySelection({format: 'best'}, audioFormats, nativeAudioPreference)}, order}
	}

	const picked = pickVideo(videos, order, notices)
	if (!picked) return {media: {kind: 'video', videoFormatId: '', audioSelection: NO_AUDIO}, order}
	const pickedHeight = videoHeight(picked.resolution)
	// A stream whose site gives no size (height 0) says nothing about the tier: no "goes up to 0p".
	if (order.tier !== 'best' && pickedHeight !== 0 && pickedHeight !== Number(order.tier)) notices.push({kind: 'video-tier-fallback', wanted: order.tier, picked: pickedHeight})

	const audioRank = order.audio?.[0]
	if (!audioRank || !picked.isVideoOnly) return {media: {kind: 'video', videoFormatId: picked.formatId, audioSelection: NO_AUDIO}, order}
	return {media: {kind: 'video', videoFormatId: picked.formatId, audioSelection: videoAudioSelection(audioRank, audioFormats, order.nativeAudio?.preference ?? nativeAudioPreference)}, order}
}

function baseLanguage(trackKey: string): string {
	return trackKey.endsWith(AUTO_CAPTION_SUFFIX) ? trackKey.slice(0, -AUTO_CAPTION_SUFFIX.length) : trackKey
}

function matchingKeys(code: string, map: SubtitleMap): string[] {
	return Object.keys(map).filter(key => matchesSubtitleLanguage(code, baseLanguage(key)))
}

function resolveSubtitles(input: ProfileSelectionInput, notices: FitNotice[]): string[] {
	const {profile, subtitles, automaticCaptions} = input
	const wanted = profile.media.kind === 'subtitles-only' || profile.subtitles.enabled ? profile.subtitles.languages : []
	const source = profile.subtitles.source
	const picked: string[] = []
	const missing: string[] = []
	for (const code of wanted) {
		const manual = source === 'auto-only' ? [] : matchingKeys(code, subtitles)
		// Manual tracks win per track, not per language: an auto-generated
		// regional variant the manual tracks lack is still picked, as yt-dlp does.
		const manualBases = new Set(manual.map(baseLanguage))
		const auto = source === 'manual-only' ? [] : matchingKeys(code, automaticCaptions).filter(key => !manualBases.has(baseLanguage(key)))
		const keys = [...manual, ...auto]
		if (keys.length === 0) missing.push(code)
		for (const key of keys) if (!picked.includes(key)) picked.push(key)
	}
	if (missing.length > 0) notices.push({kind: 'subtitle-languages-missing', languages: missing})
	return picked
}

export function resolveProfileSelection(input: ProfileSelectionInput): ProfileSelection {
	const notices: FitNotice[] = []
	const {media, order} = resolveMedia(input, notices)
	const subtitleLanguages = resolveSubtitles(input, notices)
	return {media, subtitleLanguages, notices, order}
}
