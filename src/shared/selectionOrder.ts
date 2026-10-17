// The selection order: the ranked rules a download profile uses to pick one
// video and one audio stream, best first. It is built once from the profile
// (goal, tier, file type, native audio) and the global settings, and three
// things are derived from it instead of being written by hand:
//   - the yt-dlp `-S` sort a queued download passes (`formatSortFor`),
//   - the Interactive Download pick over a probe (`profileSelection.ts`),
//   - the "Why this one" explanation the UI shows (the ranks themselves).

import type {NativeAudioChoice, NativeAudioPreference, PlaylistVideoTier, VideoFileType, VideoGoal, VideoMediaIntent} from './schemas.js'

export type VideoRank =
	// Smart TV: H.264 before anything else, then streams already in MP4.
	| {kind: 'h264'}
	| {kind: 'mp4-streams'}
	// The tallest stream at or under the tier (any height for `best`).
	| {kind: 'resolution'; tier: PlaylistVideoTier}
	| {kind: 'fps'}
	| {kind: 'hdr'}
	// yt-dlp's own codec order: AV1, VP9, HEVC, H.264.
	| {kind: 'codec'}
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
	// Stereo or surround among native tracks, and where that choice comes from.
	// Also breaks ties inside the AAC and Opus ranks. Null for video-only.
	nativeAudio: EffectiveNativeAudio | null
	// `bestvideo` (a separate video stream) rather than `bestvideo*` (which may
	// be a stream with built-in audio). Smart TV and video-only take a separate
	// stream so the audio rank decides the audio.
	separateVideoStream: boolean
}

export interface EffectiveNativeAudio {
	preference: NativeAudioPreference
	source: NativeAudioSource
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

const BEST_PICTURE_VIDEO: readonly VideoRank[] = [{kind: 'fps'}, {kind: 'hdr'}, {kind: 'codec'}, {kind: 'size'}]

function videoRanks(goal: VideoGoal, tier: PlaylistVideoTier): VideoRank[] {
	if (goal === 'smart-tv') return [{kind: 'h264'}, {kind: 'mp4-streams'}, {kind: 'resolution', tier}, ...BEST_PICTURE_VIDEO]
	return [{kind: 'resolution', tier}, ...BEST_PICTURE_VIDEO]
}

function audioRank(goal: VideoGoal, fileType: VideoFileType): AudioRank {
	if (goal === 'smart-tv') return {kind: 'aac', because: 'smart-tv'}
	if (fileType === 'mp4') return {kind: 'aac', because: 'file-type'}
	if (fileType === 'webm') return {kind: 'opus'}
	return {kind: 'native'}
}

export function selectionOrder(intent: VideoMediaIntent, globalPreference: NativeAudioPreference): SelectionOrder {
	const fileType = effectiveFileType(intent.goal, intent.fileType)
	const withAudio = intent.kind === 'video-audio'
	return {
		goal: intent.goal,
		tier: intent.tier,
		fileType,
		video: videoRanks(intent.goal, intent.tier),
		audio: withAudio ? [audioRank(intent.goal, fileType)] : null,
		nativeAudio: withAudio ? effectiveNativeAudio(intent.audio.native, globalPreference) : null,
		separateVideoStream: intent.kind === 'video-only' || intent.goal === 'smart-tv'
	}
}

// yt-dlp puts `-S` fields before its own defaults (res, fps, hdr, vcodec, …),
// so only the ranks that differ from that default are spelled out. `fps` is
// restated after an explicit `res:N` to keep the frame rate ahead of the
// fields yt-dlp would otherwise compare next.
function videoSortToken(rank: VideoRank, tier: PlaylistVideoTier): string | undefined {
	switch (rank.kind) {
		case 'h264':
			return 'vcodec:h264'
		case 'mp4-streams':
			return 'ext:mp4'
		case 'resolution':
			return rank.tier === 'best' ? undefined : `res:${rank.tier}`
		case 'fps':
			return tier === 'best' ? undefined : 'fps'
		case 'hdr':
		case 'codec':
		case 'size':
			return undefined
	}
}

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
	const tokens = [...order.video.map(rank => videoSortToken(rank, order.tier)), ...(order.audio ?? []).map(audioSortToken)].filter((token): token is string => token !== undefined)
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
