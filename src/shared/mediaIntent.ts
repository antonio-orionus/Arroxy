import type {AudioConvert, DownloadProfileMedia, MediaIntent, NativeAudioPreference, PlaylistSelection, PlaylistVideoTier} from './schemas.js'
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

type VideoMediaIntent = Extract<MediaIntent, {kind: 'video-audio' | 'video-only'}>

const VIDEO_WITH_AUDIO_SELECTOR = 'bestvideo*+bestaudio/best'
const VIDEO_WITH_M4A_AUDIO_SELECTOR = 'bestvideo*+bestaudio[ext=m4a]/bestvideo*+bestaudio/best'
const MP4_WITH_AUDIO_SELECTOR = 'bestvideo+bestaudio/best[ext=mp4]/best'
const MP4_WITH_M4A_AUDIO_SELECTOR = 'bestvideo+bestaudio[ext=m4a]/bestvideo+bestaudio/best[ext=mp4]/best'
const NON_DRC_AUDIO_FILTERS = "[format_id!~=?'(?i)(?:^|[-_\\s])drc(?:$|[-_\\s])'][format_note!~=?'(?i)\\bdrc\\b']"
const COMPATIBLE_AUDIO_SELECTOR = `bestaudio[acodec!~=?'^(?:e-?ac-?3|ec-3|ac-?3)$']${NON_DRC_AUDIO_FILTERS}/bestaudio`
const SURROUND_AUDIO_SELECTOR = `bestaudio[acodec~=?'^(?:e-?ac-?3|ec-3)$']${NON_DRC_AUDIO_FILTERS}/bestaudio[acodec~=?'^(?:ac-?3)$']${NON_DRC_AUDIO_FILTERS}/${COMPATIBLE_AUDIO_SELECTOR}`

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
// Uses -S (sort) for resolution, codec, and container preferences so yt-dlp can
// degrade gracefully to the closest available format.
export function mediaIntentSpec(intent: MediaIntent, nativeAudioPreference: NativeAudioPreference = 'compatible'): MediaIntentSpec {
	switch (intent.kind) {
		case 'audio-only':
			return audioOnlyIntentSpec(intent, nativeAudioPreference)
		case 'video-audio':
		case 'video-only':
			return videoIntentSpec(intent, nativeAudioPreference)
		default:
			return unreachableMediaIntent(intent)
	}
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
		return {formatSelector: `${bestNativeAudioSelector(nativeAudioPreference)}/best`, producesVideo: false, producesAudio: true}
	}
	if (intent.audio.format === 'wav') {
		return {audioConvert: {target: 'wav'}, producesVideo: false, producesAudio: true}
	}
	const bitrateKbps = intent.audio.bitrateKbps ?? DEFAULT_AUDIO_BITRATE
	return {audioConvert: {target: intent.audio.format, bitrateKbps}, producesVideo: false, producesAudio: true}
}

function formatSort(...parts: (string | undefined)[]): string | undefined {
	const value = parts.filter((part): part is string => !!part).join(',')
	return value || undefined
}

function resolutionSort(tier: PlaylistVideoTier): string | undefined {
	return tier === 'best' ? undefined : `res:${tier},fps`
}

function videoIntentSpec(intent: VideoMediaIntent, nativeAudioPreference: NativeAudioPreference): MediaIntentSpec {
	const tier = primaryVideoTier(intent.tiers)
	const withAudio = intent.kind === 'video-audio'
	const audioFormat = withAudio ? intent.audio.format : 'best'
	const preferM4aAudio = withAudio && audioFormat === 'm4a'
	const resSort = resolutionSort(tier)

	if (intent.codec === 'mp4') {
		if (!withAudio) {
			return {formatSelector: 'bestvideo', formatSort: formatSort('vcodec:h264', 'ext:mp4', resSort), mergeOutputFormat: 'mp4', producesVideo: true, producesAudio: false}
		}
		return {
			formatSelector: preferM4aAudio ? MP4_WITH_M4A_AUDIO_SELECTOR : pairWithBestNativeAudio('bestvideo', nativeAudioPreference, MP4_WITH_AUDIO_SELECTOR),
			formatSort: formatSort('vcodec:h264', 'ext:mp4', resSort, preferM4aAudio ? 'acodec:m4a' : undefined),
			mergeOutputFormat: 'mp4',
			producesVideo: true,
			producesAudio: true
		}
	}

	if (!withAudio) {
		return {formatSelector: 'bestvideo', formatSort: resSort, producesVideo: true, producesAudio: false}
	}

	return {formatSelector: preferM4aAudio ? VIDEO_WITH_M4A_AUDIO_SELECTOR : pairWithBestNativeAudio('bestvideo*', nativeAudioPreference, VIDEO_WITH_AUDIO_SELECTOR), formatSort: formatSort(resSort, preferM4aAudio ? 'acodec:m4a' : undefined), producesVideo: true, producesAudio: true}
}

function unreachableMediaIntent(intent: never): never {
	throw new Error(`Unhandled media intent: ${JSON.stringify(intent)}`)
}
