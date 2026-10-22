import type {AudioConvert, DownloadProfileMedia, HdrPreference, MediaIntent, NativeAudioPreference, PlaylistSelection, PlaylistSubtitleSelection, VideoFileType, VideoMediaIntent} from './schemas.js'
import {DEFAULT_HDR_PREFERENCE} from './hdrSetting.js'
import {DEFAULT_AUDIO_BITRATE} from './schemas.js'
import type {SubtitleOptions} from './preparedJob.js'
import {containerArgsFor, formatSortFor, selectionOrder, type AudioRank, type SelectionOrder} from './selectionOrder.js'
import {canHoldEmbeddedThumbnail} from './thumbnailEmbed.js'
import {tierCeiling} from './videoTier.js'

export interface MediaIntentSpec {
	formatSelector?: string
	// -S sort string — never fails, picks closest match. Used for MP4 (H.264 preferred).
	formatSort?: string
	// Container flags from the file type (and Smart TV's MP4 merge).
	mergeOutputFormat?: string
	remuxVideo?: string
	fileType?: VideoFileType
	audioConvert?: AudioConvert
	producesVideo: boolean
	producesAudio: boolean
}

const VIDEO_WITH_AUDIO_SELECTOR = 'bestvideo*+bestaudio/best'
const VIDEO_WITH_M4A_AUDIO_SELECTOR = 'bestvideo*+bestaudio[ext=m4a]/bestvideo*+bestaudio/best'
const MP4_WITH_AUDIO_SELECTOR = 'bestvideo+bestaudio/best[ext=mp4]/best'
const MP4_WITH_M4A_AUDIO_SELECTOR = 'bestvideo+bestaudio[ext=m4a]/bestvideo+bestaudio/best[ext=mp4]/best'
// A trailing `?` in a yt-dlp filter also matches a stream whose field is
// missing. Filters that leave something out keep it (a stream with no codec
// named is not Dolby); filters that ask for something must not, or they take
// a stream that says nothing (YouTube's HLS audio) as Dolby or as original.
const NON_DRC_AUDIO_FILTERS = "[format_id!~=?'(?i)(?:^|[-_\\s])drc(?:$|[-_\\s])'][format_note!~=?'(?i)\\bdrc\\b']"
const COMPATIBLE_AUDIO_CODEC_FILTER = "[acodec!~=?'^(?:e-?ac-?3|ec-3|ac-?3)$']"
const EC3_AUDIO_CODEC_FILTER = "[acodec~='^(?:e-?ac-?3|ec-3)$']"
const AC3_AUDIO_CODEC_FILTER = "[acodec~='^(?:ac-?3)$']"
const SOURCE_DEFAULT_AUDIO_FILTER = '[language_preference>0]'
const SOURCE_ORIGINAL_AUDIO_FILTER = "[format_note~='(?i)\\boriginal\\b']"
const SOURCE_PREFERRED_AUDIO_FILTERS = [SOURCE_DEFAULT_AUDIO_FILTER, SOURCE_ORIGINAL_AUDIO_FILTER]

function bestAudioWith(...filters: string[]): string {
	return `bestaudio${filters.join('')}`
}

function sourcePreferredAudioWith(...filters: string[]): string[] {
	return SOURCE_PREFERRED_AUDIO_FILTERS.map(sourceFilter => bestAudioWith(sourceFilter, ...filters))
}

const COMPATIBLE_AUDIO_SELECTOR = [
	...sourcePreferredAudioWith(COMPATIBLE_AUDIO_CODEC_FILTER, NON_DRC_AUDIO_FILTERS),
	...sourcePreferredAudioWith(COMPATIBLE_AUDIO_CODEC_FILTER),
	...sourcePreferredAudioWith(NON_DRC_AUDIO_FILTERS),
	...sourcePreferredAudioWith(),
	bestAudioWith(COMPATIBLE_AUDIO_CODEC_FILTER, NON_DRC_AUDIO_FILTERS),
	bestAudioWith(COMPATIBLE_AUDIO_CODEC_FILTER),
	bestAudioWith(NON_DRC_AUDIO_FILTERS),
	'bestaudio'
].join('/')
const SURROUND_AUDIO_SELECTOR = [
	...sourcePreferredAudioWith(EC3_AUDIO_CODEC_FILTER, NON_DRC_AUDIO_FILTERS),
	...sourcePreferredAudioWith(AC3_AUDIO_CODEC_FILTER, NON_DRC_AUDIO_FILTERS),
	bestAudioWith(EC3_AUDIO_CODEC_FILTER, NON_DRC_AUDIO_FILTERS),
	bestAudioWith(AC3_AUDIO_CODEC_FILTER, NON_DRC_AUDIO_FILTERS),
	COMPATIBLE_AUDIO_SELECTOR
].join('/')

// A subtitles-only batch downloads no media, so it has no media intent.
export function playlistSelectionToMediaIntent(selection: PlaylistSelection): MediaIntent | null {
	if (selection.kind === 'subtitles') return null
	if (selection.kind === 'audio') {
		return {kind: 'audio-only', audio: {format: selection.format, bitrateKbps: selection.bitrateKbps}}
	}
	return {kind: 'video-audio', goal: selection.codec === 'mp4' ? 'smart-tv' : 'best-picture', tier: selection.tier, fileType: 'auto', audio: {native: {kind: 'default'}}}
}

export function playlistSelectionProducesVideo(selection: PlaylistSelection): boolean {
	const intent = playlistSelectionToMediaIntent(selection)
	return intent !== null && mediaIntentSpec(intent).producesVideo
}

export function playlistSubtitleOptions(selection: PlaylistSubtitleSelection): SubtitleOptions {
	return {request: {kind: 'languages', languages: [...selection.languages], source: selection.source}, mode: selection.mode, format: selection.format}
}

export function mediaIntentFromProfileMedia(media: DownloadProfileMedia): MediaIntent | null {
	if (media.kind === 'subtitles-only') return null
	return media
}

// Maps media intent to yt-dlp arguments per URL.
// Uses -S (sort) for resolution, codec, and container preferences so yt-dlp can
// degrade gracefully to the closest available format.
export function mediaIntentSpec(intent: MediaIntent, nativeAudioPreference: NativeAudioPreference = 'compatible', hdrPreference: HdrPreference = DEFAULT_HDR_PREFERENCE): MediaIntentSpec {
	switch (intent.kind) {
		case 'audio-only':
			return audioOnlyIntentSpec(intent, nativeAudioPreference)
		case 'video-audio':
		case 'video-only':
			return videoIntentSpec(intent, nativeAudioPreference, hdrPreference)
		default:
			return unreachableMediaIntent(intent)
	}
}

// Cover art goes in by the container the download ends in (yt-dlp's list, in
// thumbnailEmbed). Converted audio ends in its target, `best` in whatever the
// stream is (WAV, AIFF and WMA hold none). A chosen file type is the container,
// WebM included: it stays WebM whenever the streams fit. On Auto, a merge ends
// in MP4 or MKV, as yt-dlp writes a WebM merge as MKV to hold the cover; video
// without audio is a lone stream, not merged, so it ends in whatever the site
// serves, often WebM. Video with audio is taken as merged, though a site with
// no separate streams gives one lone file (`best`) that may be WebM too.
export function canEmbedThumbnail(spec: MediaIntentSpec): boolean {
	if (spec.audioConvert) return spec.audioConvert.target !== 'best' && canHoldEmbeddedThumbnail(spec.audioConvert.target)
	if (spec.fileType === undefined || spec.fileType === 'auto') return spec.producesVideo && spec.producesAudio
	return canHoldEmbeddedThumbnail(spec.fileType)
}

function bestNativeAudioSelector(preference: NativeAudioPreference): string {
	return preference === 'surround' ? SURROUND_AUDIO_SELECTOR : COMPATIBLE_AUDIO_SELECTOR
}

function pairWithBestNativeAudio(videoSelector: string, preference: NativeAudioPreference, fallback: string): string {
	return bestNativeAudioSelector(preference)
		.split('/')
		.map(audioSelector => `${videoSelector}+${audioSelector}`)
		.concat(fallback)
		.join('/')
}

function audioOnlyIntentSpec(intent: Extract<MediaIntent, {kind: 'audio-only'}>, nativeAudioPreference: NativeAudioPreference): MediaIntentSpec {
	if (intent.audio.format === 'best') {
		// `-x`: an audio file even when the pick is a combined file (`best`).
		return {formatSelector: `${bestNativeAudioSelector(nativeAudioPreference)}/best`, audioConvert: {target: 'best'}, producesVideo: false, producesAudio: true}
	}
	if (intent.audio.format === 'wav') {
		return {audioConvert: {target: 'wav'}, producesVideo: false, producesAudio: true}
	}
	const bitrateKbps = intent.audio.bitrateKbps ?? DEFAULT_AUDIO_BITRATE
	return {audioConvert: {target: intent.audio.format, bitrateKbps}, producesVideo: false, producesAudio: true}
}

// Video without audio takes a video-only stream, else (TikTok, Twitch clips,
// Archive: sites with no such stream) one with sound, whose audio the download
// then drops (DropAudioPhase). A site with sound only (SoundCloud, Bandcamp)
// gives its sound, as the Format screen offers it there.
function videoSelector(order: SelectionOrder, audio: AudioRank | undefined): string {
	if (!audio) return 'bestvideo/bestvideo*/best'
	if (audio.kind === 'aac') return order.separateVideoStream ? MP4_WITH_M4A_AUDIO_SELECTOR : VIDEO_WITH_M4A_AUDIO_SELECTOR
	const preference = order.nativeAudio?.preference ?? 'compatible'
	return order.separateVideoStream ? pairWithBestNativeAudio('bestvideo', preference, MP4_WITH_AUDIO_SELECTOR) : pairWithBestNativeAudio('bestvideo*', preference, VIDEO_WITH_AUDIO_SELECTOR)
}

// YouTube names its AI-upscaled streams "<id>-sr". The filtered selector comes
// first, the plain one after it, so a video offered only upscaled still downloads.
const NOT_AI_UPSCALED = '[format_id!$=-sr]'

function withoutAiUpscaled(selector: string): string {
	return `${selector.replaceAll(/bestvideo(\*?)/g, `bestvideo$1${NOT_AI_UPSCALED}`)}/${selector}`
}

// Smart TV's H.264 first, then a stream already in MP4. `-S vcodec:h264,ext:mp4`
// can't say it: under the `vcodec:h264` limit yt-dlp ranks the codecs it orders
// below H.264, and a stream that names no codec, above AV1, VP9 and HEVC, and
// both fields come before `res`, so on a site without H.264 a codec-less or an
// MP4 stream won at any height. Each alternative is tried with H.264 in MP4,
// then H.264, then as it is, where yt-dlp's own order ranks the rest: the
// resolution first, then a known codec over none.
//
// The site's preference still has to come first, and a filter can't read it:
// yt-dlp's numeric filters take no negative value, and a stream with none
// ranks as -1, the ordinary mark. So the H.264 tiers leave out the copies the
// extractors name as marked down: YouTube's DAMAGED (truncated, -10) and
// TikTok's watermarked (-2). One marked down without such a note can still
// win there over a stream of another codec.
const NOT_MARKED_DOWN = "[format_note!~=?'(?i)\\b(?:damaged|watermarked)\\b']"
const H264_VIDEO = `[vcodec~='(?i)^(?:[hx]264|avc)']${NOT_MARKED_DOWN}`
const MP4_VIDEO = '[ext=mp4]'

function preferredFirst(selector: string, order: SelectionOrder): string {
	const filters = [...(order.video.some(rank => rank.kind === 'h264') ? [H264_VIDEO] : []), ...(order.video.some(rank => rank.kind === 'mp4-streams') ? [MP4_VIDEO] : [])]
	const tiers = filters.map((_, i) => filters.slice(0, filters.length - i).join(''))
	return selector
		.split('/')
		.flatMap(alternative => {
			const filtered = tiers.map(tier => alternative.replace(/^best(?:video)?\*?/, atom => `${atom}${alternative.includes(MP4_VIDEO) ? tier.replace(MP4_VIDEO, '') : tier}`))
			return [...new Set([...filtered, alternative])]
		})
		.join('/')
}

// A tiered profile takes what its tier names on the Format screen (videoTier).
// `-S res:` caps the short side at the tier's ceiling (selectionOrder), and
// each alternative is tried in three layers: on streams whose long side keeps
// them at or under the tier, then on any stream of known size, then as it is.
// The first keeps out a widescreen stream the rows put in the next tier
// (1280x640 is 720p) and lets in one that names its height alone; the second
// keeps out a file with no size, which passes any `res` limit and would win
// over sized streams above the tier (Facebook's `hd`). Layering each
// alternative, not the whole selector, keeps Smart TV's H.264 ahead of the tier.
// Both layers leave out the copies the site marks down, as the H.264 tiers do,
// so a damaged copy at the tier never wins over a healthy stream above it.
const VIDEO_ATOM = /^best(?:video)?\*?/

function withinTier(selector: string, order: SelectionOrder): string {
	const ceiling = order.tier === 'best' ? null : tierCeiling(Number(order.tier))
	if (!ceiling) return selector
	const filtered = (alternative: string, filter: string): string => alternative.replace(VIDEO_ATOM, atom => `${atom}${filter}`)
	return selector
		.split('/')
		.flatMap(alternative => [filtered(alternative, `[width<=?${ceiling.longSide}][height<=${ceiling.longSide}]${NOT_MARKED_DOWN}`), filtered(alternative, '[height>0]'), alternative])
		.join('/')
}

function videoIntentSpec(intent: VideoMediaIntent, nativeAudioPreference: NativeAudioPreference, hdrPreference: HdrPreference): MediaIntentSpec {
	const order = selectionOrder(intent, nativeAudioPreference, hdrPreference)
	const audio = order.audio?.[0]
	const container = containerArgsFor(order)
	const selector = withinTier(preferredFirst(videoSelector(order, audio), order), order)
	return {formatSelector: order.skipAiUpscaled ? withoutAiUpscaled(selector) : selector, formatSort: formatSortFor(order), ...container, fileType: order.fileType, producesVideo: true, producesAudio: audio !== undefined}
}

function unreachableMediaIntent(intent: never): never {
	throw new Error(`Unhandled media intent: ${JSON.stringify(intent)}`)
}
