import type {AudioConvert, DownloadProfileMedia, MediaIntent, PlaylistSelection, PlaylistVideoTier} from './schemas.js'
import {DEFAULT_AUDIO_BITRATE} from './schemas.js'

export interface MediaIntentSpec {
	formatSelector?: string
	// -S sort string — never fails, picks closest match. Used for MP4 (H.264 preferred).
	formatSort?: string
	// --merge-output-format container override. Only set when formatSort targets a codec.
	mergeOutputFormat?: string
	audioConvert?: AudioConvert
	producesVideo: boolean
	producesAudio: boolean
}

const heights: Record<Exclude<PlaylistVideoTier, 'best'>, number> = {'2160': 2160, '1440': 1440, '1080': 1080, '720': 720, '480': 480, '360': 360}

type VideoMediaIntent = Extract<MediaIntent, {kind: 'video-audio' | 'video-only'}>

export function playlistSelectionToMediaIntent(selection: PlaylistSelection): MediaIntent {
	if (selection.kind === 'audio') {
		return {kind: 'audio-only', audio: {format: selection.format, bitrateKbps: selection.bitrateKbps}}
	}
	return {kind: 'video-audio', codec: selection.codec, tiers: [selection.tier], audio: {format: selection.codec === 'mp4' ? 'm4a' : 'best'}}
}

export function mediaIntentFromProfileMedia(media: DownloadProfileMedia): MediaIntent | null {
	if (media.kind === 'subtitles-only') return null
	return media
}

function primaryVideoTier(tiers: readonly PlaylistVideoTier[]): PlaylistVideoTier {
	return tiers[0] ?? 'best'
}

// Maps media intent to yt-dlp arguments per URL.
// Uses -S (sort) rather than hard codec filters for MP4 so no URL is skipped —
// yt-dlp degrades gracefully to the closest available format.
export function mediaIntentSpec(intent: MediaIntent): MediaIntentSpec {
	switch (intent.kind) {
		case 'audio-only':
			return audioOnlyIntentSpec(intent)
		case 'video-audio':
		case 'video-only':
			return videoIntentSpec(intent)
		default:
			return unreachableMediaIntent(intent)
	}
}

function audioOnlyIntentSpec(intent: Extract<MediaIntent, {kind: 'audio-only'}>): MediaIntentSpec {
	if (intent.audio.format === 'best') {
		return {formatSelector: 'bestaudio/best', producesVideo: false, producesAudio: true}
	}
	if (intent.audio.format === 'wav') {
		return {audioConvert: {target: 'wav'}, producesVideo: false, producesAudio: true}
	}
	const bitrateKbps = intent.audio.bitrateKbps ?? DEFAULT_AUDIO_BITRATE
	return {audioConvert: {target: intent.audio.format, bitrateKbps}, producesVideo: false, producesAudio: true}
}

function videoIntentSpec(intent: VideoMediaIntent): MediaIntentSpec {
	const tier = primaryVideoTier(intent.tiers)
	const withAudio = intent.kind === 'video-audio'
	const audioFormat = withAudio ? intent.audio.format : 'best'
	const preferM4aAudio = withAudio && audioFormat === 'm4a'

	if (tier === 'best') {
		if (!withAudio) return {formatSelector: 'bestvideo', producesVideo: true, producesAudio: false}
		if (intent.codec === 'mp4') {
			return {formatSelector: preferM4aAudio ? 'bestvideo*+bestaudio[ext=m4a]/bestvideo*+bestaudio/best' : 'bestvideo*+bestaudio/best', formatSort: preferM4aAudio ? 'vcodec:h264,acodec:m4a,ext:mp4' : 'vcodec:h264,ext:mp4', mergeOutputFormat: 'mp4', producesVideo: true, producesAudio: true}
		}
		return {formatSelector: preferM4aAudio ? 'bestvideo*+bestaudio[ext=m4a]/bestvideo*+bestaudio/best' : 'bestvideo*+bestaudio/best', formatSort: preferM4aAudio ? 'acodec:m4a' : undefined, producesVideo: true, producesAudio: true}
	}

	const h = heights[tier]

	if (intent.codec === 'mp4') {
		if (!withAudio) {
			return {formatSelector: `bestvideo[height<=${h}]/bestvideo`, formatSort: 'vcodec:h264,ext:mp4', mergeOutputFormat: 'mp4', producesVideo: true, producesAudio: false}
		}
		return {
			formatSelector: preferM4aAudio ? `bv*[height<=${h}]+ba[ext=m4a]/bv*[height<=${h}]+ba/b[height<=${h}]/bv*+ba/b` : `bv*[height<=${h}]+ba/b[height<=${h}]/bv*+ba/b`,
			formatSort: preferM4aAudio ? 'vcodec:h264,acodec:m4a,ext:mp4' : 'vcodec:h264,ext:mp4',
			mergeOutputFormat: 'mp4',
			producesVideo: true,
			producesAudio: true
		}
	}

	if (!withAudio) {
		return {formatSelector: `bestvideo[height<=${h}]/bestvideo`, producesVideo: true, producesAudio: false}
	}

	return {formatSelector: preferM4aAudio ? `bestvideo[height<=${h}]+bestaudio[ext=m4a]/bestvideo[height<=${h}]+bestaudio/best[height<=${h}]` : `bestvideo[height<=${h}]+bestaudio/best[height<=${h}]`, formatSort: preferM4aAudio ? 'acodec:m4a' : undefined, producesVideo: true, producesAudio: true}
}

function unreachableMediaIntent(intent: never): never {
	throw new Error(`Unhandled media intent: ${JSON.stringify(intent)}`)
}
