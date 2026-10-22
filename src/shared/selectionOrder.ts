// The selection order: the ranked rules a download profile uses to pick one
// video and one audio stream, best first. It is built once from the profile
// (goal, tier, file type, native audio) and the global settings, and three
// things are derived from it instead of being written by hand:
//   - the yt-dlp `-f` and `-S` a queued download passes (`mediaIntentSpec`,
//     `formatSortFor`),
//   - the Interactive Download pick over a probe (`profileSelection.ts`),
//   - the "Why this one" explanation the UI shows (the ranks themselves).

import {asResolvedHdr, DEFAULT_HDR_PREFERENCE, type GlobalHdr, type HdrSource} from './hdrSetting.js'
import {tierCeiling} from './videoTier.js'
import type {HdrChoice, HdrPreference, NativeAudioChoice, NativeAudioPreference, PlaylistVideoTier, VideoCodecPreference, VideoFileType, VideoGoal, VideoMediaIntent} from './schemas.js'

export type VideoRank =
	// Streams the site doesn't mark down (yt-dlp's `preference`: damaged,
	// watermarked, fallback copies). yt-dlp itself ranks this above everything.
	| {kind: 'site-preference'}
	// The source's own streams before ones it upscaled with AI (`AiUpscaled`).
	| {kind: 'original'}
	// Smart TV: H.264 before anything else, then streams already in MP4.
	| {kind: 'h264'}
	| {kind: 'mp4-streams'}
	// The tallest stream at or under the tier (any height for `best`).
	| {kind: 'resolution'; tier: PlaylistVideoTier}
	| {kind: 'fps'}
	| {kind: 'hdr'}
	// Copies the site rates higher by where they come from (yt-dlp's
	// `source_preference`: YouTube's Premium streams, ones not missing a PO
	// token), where the extractor's own sort ranks it here (YouTube's).
	| {kind: 'source'}
	// yt-dlp's own codec order (AV1, VP9, HEVC, H.264), or the profile's
	// preferred codec first (`SelectionOrder.videoCodec`).
	| {kind: 'codec'}
	// A direct download before its HLS copy, where the extractor's own sort
	// ranks the protocol before the size (YouTube's).
	| {kind: 'protocol'}
	| {kind: 'size'}

export type NativeAudioSource = 'settings' | 'profile'

export type AudioRank =
	// AAC (.m4a): Smart TV always, and any MP4 file so it plays in more places.
	| {kind: 'aac'; because: 'smart-tv' | 'file-type'}
	// Opus: what a WebM file can hold.
	| {kind: 'opus'}
	// The source's default or original track, no DRC, then stereo or surround
	// (`SelectionOrder.nativeAudio`).
	| {kind: 'native'}

export interface SelectionOrder {
	goal: VideoGoal
	tier: PlaylistVideoTier
	// After `effectiveFileType`: never a combination that needs re-encoding.
	fileType: VideoFileType
	video: readonly VideoRank[]
	// Null for a video-only download.
	audio: readonly AudioRank[] | null
	// SDR or HDR first when a height offers both, and where that choice comes from.
	hdr: EffectiveHdr
	// The codec taken first among streams of one height; null keeps yt-dlp's order.
	videoCodec: VideoCodecPreference | null
	// Stereo or surround among native tracks, and where that choice comes from.
	// Also breaks ties inside the AAC and Opus ranks. Null for video-only.
	nativeAudio: EffectiveNativeAudio | null
	// `bestvideo` (a separate video stream) rather than `bestvideo*` (which may
	// be a stream with built-in audio). Smart TV and video-only take a separate
	// stream so the audio rank decides the audio.
	separateVideoStream: boolean
	// Leave out AI-upscaled streams unless nothing else is offered.
	skipAiUpscaled: boolean
}

export interface EffectiveNativeAudio {
	preference: NativeAudioPreference
	source: NativeAudioSource
}

export interface EffectiveHdr {
	preference: HdrPreference
	source: HdrSource
}

function effectiveHdr(choice: HdrChoice | undefined, global: GlobalHdr): EffectiveHdr {
	return choice?.kind === 'custom' ? {preference: choice.preference, source: 'profile'} : asResolvedHdr(global)
}

export function effectiveNativeAudio(choice: NativeAudioChoice, globalPreference: NativeAudioPreference): EffectiveNativeAudio {
	return choice.kind === 'custom' ? {preference: choice.preference, source: 'profile'} : {preference: globalPreference, source: 'settings'}
}

// WebM can't hold H.264 or AAC, so Smart TV never saves as WebM.
export function fileTypeAllowed(goal: VideoGoal, fileType: VideoFileType): boolean {
	return !(goal === 'smart-tv' && fileType === 'webm')
}

export function effectiveFileType(goal: VideoGoal, fileType: VideoFileType): VideoFileType {
	return fileTypeAllowed(goal, fileType) ? fileType : 'auto'
}

// Smart TV already takes H.264 before anything else, and WebM can't hold H.264.
export function videoCodecAllowed(goal: VideoGoal, fileType: VideoFileType, videoCodec: VideoCodecPreference): boolean {
	return goal !== 'smart-tv' && !(videoCodec === 'h264' && fileType === 'webm')
}

export function effectiveVideoCodec(goal: VideoGoal, fileType: VideoFileType, videoCodec: VideoCodecPreference | undefined): VideoCodecPreference | null {
	return videoCodec !== undefined && videoCodecAllowed(goal, fileType, videoCodec) ? videoCodec : null
}

const BEST_PICTURE_VIDEO: readonly VideoRank[] = [{kind: 'fps'}, {kind: 'hdr'}, {kind: 'source'}, {kind: 'codec'}, {kind: 'protocol'}, {kind: 'size'}]
// A preferred codec is named in `-S`, and every `-S` field comes before the
// extractor's own sort, so it outranks the site's source rank (YouTube's Premium copies).
const PREFERRED_CODEC_VIDEO: readonly VideoRank[] = [{kind: 'fps'}, {kind: 'hdr'}, {kind: 'codec'}, {kind: 'source'}, {kind: 'protocol'}, {kind: 'size'}]

function videoRanks(goal: VideoGoal, tier: PlaylistVideoTier, skipAiUpscaled: boolean, videoCodec: VideoCodecPreference | null): VideoRank[] {
	const original: VideoRank[] = [{kind: 'site-preference'}, ...(skipAiUpscaled ? [{kind: 'original'} as const] : [])]
	if (goal === 'smart-tv') return [...original, {kind: 'h264'}, {kind: 'mp4-streams'}, {kind: 'resolution', tier}, ...BEST_PICTURE_VIDEO]
	return [...original, {kind: 'resolution', tier}, ...(videoCodec === null ? BEST_PICTURE_VIDEO : PREFERRED_CODEC_VIDEO)]
}

function audioRank(goal: VideoGoal, fileType: VideoFileType): AudioRank {
	if (goal === 'smart-tv') return {kind: 'aac', because: 'smart-tv'}
	if (fileType === 'mp4') return {kind: 'aac', because: 'file-type'}
	if (fileType === 'webm') return {kind: 'opus'}
	return {kind: 'native'}
}

export function selectionOrder(intent: VideoMediaIntent, globalPreference: NativeAudioPreference, globalHdr: GlobalHdr = DEFAULT_HDR_PREFERENCE): SelectionOrder {
	const fileType = effectiveFileType(intent.goal, intent.fileType)
	const withAudio = intent.kind === 'video-audio'
	const skipAiUpscaled = intent.aiUpscaled !== 'allow'
	const videoCodec = effectiveVideoCodec(intent.goal, fileType, intent.videoCodec)
	return {
		goal: intent.goal,
		tier: intent.tier,
		fileType,
		video: videoRanks(intent.goal, intent.tier, skipAiUpscaled, videoCodec),
		hdr: effectiveHdr(intent.hdr, globalHdr),
		videoCodec,
		audio: withAudio ? [audioRank(intent.goal, fileType)] : null,
		nativeAudio: withAudio ? effectiveNativeAudio(intent.audio.native, globalPreference) : null,
		separateVideoStream: intent.kind === 'video-only' || intent.goal === 'smart-tv',
		skipAiUpscaled
	}
}

// yt-dlp puts `-S` fields before its own defaults (res, fps, hdr, vcodec, …),
// so only the ranks that differ from that default are spelled out; its default
// already takes HDR first. `fps` is restated after an explicit `res:N` to keep
// the frame rate ahead of the fields yt-dlp would otherwise compare next.
// SDR first is `hdr:sdr`, and a field named in `-S` outranks every default, so
// it needs `res` and `fps` named before it or it would pick a lower height to
// avoid HDR. A height only offered as HDR is still taken (checked with yt-dlp).
// An audio token (MP4's `acodec:m4a`) or a preferred codec (`vcodec:<limit>`)
// outranks the defaults too, so `res`, `fps` and `hdr` come before it as well.
function videoSortToken(rank: VideoRank, order: SelectionOrder): string | undefined {
	const sdrFirst = order.hdr.preference === 'sdr'
	const audioToken = (order.audio ?? []).some(audio => audioSortToken(audio) !== undefined)
	const spellOut = sdrFirst || audioToken || order.videoCodec !== null
	switch (rank.kind) {
		// yt-dlp always sorts by the site's preference first; nothing to spell out.
		case 'site-preference':
			return undefined
		// `-S` can't leave streams out: the format selector filters them (mediaIntent).
		case 'original':
			return undefined
		// The format selector takes these first (mediaIntent): `vcodec:h264` would
		// also rank a stream that names no codec above AV1, VP9 and HEVC, and
		// both would come before the resolution where there is no H.264.
		case 'h264':
		case 'mp4-streams':
			return undefined
		// A tier caps the short side, yt-dlp's `res`, at the tier's ceiling, so
		// a 960x540 stream the rows call 480p is under a 480p limit; the
		// selector keeps out what the rows put in the next tier (mediaIntent).
		case 'resolution':
			if (rank.tier !== 'best') return `res:${tierCeiling(Number(rank.tier))?.shortSide ?? rank.tier}`
			return spellOut ? 'res' : undefined
		case 'fps':
			return order.tier === 'best' && !spellOut ? undefined : 'fps'
		case 'hdr':
			// `hdr:12` is yt-dlp's own default for HDR first.
			return sdrFirst ? 'hdr:sdr' : spellOut ? 'hdr:12' : undefined
		case 'codec':
			return order.videoCodec === null ? undefined : `vcodec:${VIDEO_CODEC_SORT_LIMIT[order.videoCodec]}`
		// The site's own sort order (`_format_sort_fields`) already names it.
		case 'source':
		case 'protocol':
		case 'size':
			return undefined
	}
}

// yt-dlp's `vcodec:<limit>` takes the limit, then the codecs it ranks below it,
// then the ones above it, worst first. `vp9.2` is the limit yt-dlp itself uses
// to prefer VP9 (`FormatSorter._prefer_vp9_sort`), so HDR VP9 stays in.
const VIDEO_CODEC_SORT_LIMIT = {vp9: 'vp9.2', h264: 'h264'} as const satisfies Record<VideoCodecPreference, string>

function audioSortToken(rank: AudioRank): string | undefined {
	switch (rank.kind) {
		case 'aac':
			return 'acodec:m4a'
		case 'opus':
			return 'acodec:opus'
		case 'native':
			return undefined
	}
}

export function formatSortFor(order: SelectionOrder): string | undefined {
	const tokens = [...order.video.map(rank => videoSortToken(rank, order)), ...(order.audio ?? []).map(audioSortToken)].filter((token): token is string => token !== undefined)
	return tokens.length > 0 ? tokens.join(',') : undefined
}

export interface ContainerArgs {
	mergeOutputFormat?: string
	remuxVideo?: string
}

// The yt-dlp container flags for a file type. Always a remux (stream copy),
// never `--recode-video`. WebM falls back to MKV when the picked streams
// don't fit it, so a download never fails on the container.
export function fileTypeContainerArgs(fileType: Exclude<VideoFileType, 'auto'>): ContainerArgs {
	if (fileType === 'webm') return {mergeOutputFormat: 'webm/mkv', remuxVideo: 'webm>webm/mkv'}
	return {mergeOutputFormat: fileType, remuxVideo: fileType}
}

export function containerArgsFor(order: Pick<SelectionOrder, 'goal' | 'fileType'>): ContainerArgs {
	if (order.fileType !== 'auto') return fileTypeContainerArgs(order.fileType)
	// Smart TV merges into MP4 as it always has; a lone muxed stream is already
	// whatever the site serves.
	return order.goal === 'smart-tv' ? {mergeOutputFormat: 'mp4'} : {}
}
