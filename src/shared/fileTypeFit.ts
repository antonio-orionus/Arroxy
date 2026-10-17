// Which file types the picked streams can be copied into without re-encoding,
// and the short codec names the Format screen shows. MP4 and MKV hold every
// codec the supported sites serve; WebM holds only VP8, VP9 and AV1 video
// with Opus or Vorbis audio.

import type {VideoFileType} from './schemas.js'
import type {FormatOption} from './types.js'

const VIDEO_CODEC_NAMES: readonly (readonly [string, string])[] = [
	['av01', 'AV1'],
	['vp09', 'VP9'],
	['vp9', 'VP9'],
	['vp8', 'VP8'],
	['hev1', 'HEVC'],
	['hvc1', 'HEVC'],
	['h265', 'HEVC'],
	['avc1', 'H.264'],
	['h264', 'H.264']
]

export function videoCodecName(codec: string | undefined): string | null {
	const lower = codec?.toLowerCase() ?? ''
	if (lower === '' || lower === 'none') return null
	return VIDEO_CODEC_NAMES.find(([prefix]) => lower.startsWith(prefix))?.[1] ?? null
}

export function audioCodecName(codec: string | undefined): string | null {
	const lower = codec?.toLowerCase() ?? ''
	if (lower === '' || lower === 'none') return null
	if (lower === 'opus') return 'Opus'
	if (lower === 'vorbis') return 'Vorbis'
	if (lower.startsWith('mp4a')) return 'AAC'
	if (/^(?:e-?ac-?3|ec-3|ac-?3)$/.test(lower)) return 'Dolby'
	if (lower === 'mp3') return 'MP3'
	return null
}

const WEBM_VIDEO = new Set(['AV1', 'VP9', 'VP8'])
const WEBM_AUDIO = new Set(['Opus', 'Vorbis'])

// The first codec of the picked streams that WebM can't hold, or null when
// they all fit. A muxed stream (video with built-in audio) is checked for both.
export function webmBlocker(video: FormatOption | undefined, audio: FormatOption | undefined): string | null {
	const videoCodec = video ? videoCodecName(video.videoCodec) : null
	if (video && videoCodec && !WEBM_VIDEO.has(videoCodec)) return videoCodec
	const audioSource = audio ?? (video && !video.isVideoOnly ? video : undefined)
	const audioCodec = audioSource ? audioCodecName(audioSource.audioCodec) : null
	if (audioCodec && !WEBM_AUDIO.has(audioCodec)) return audioCodec
	return null
}

export function fileTypeFits(fileType: VideoFileType, video: FormatOption | undefined, audio: FormatOption | undefined): boolean {
	return fileType !== 'webm' || webmBlocker(video, audio) === null
}
