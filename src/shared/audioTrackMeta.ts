import {AUDIO_TRACK_QUALITIES, type AudioTrackQuality} from './schemas.js'
import type {YtDlpFormat} from 'yt-dlp-bridge/info'

export function isAudioTrackQuality(value: string): value is AudioTrackQuality {
	return AUDIO_TRACK_QUALITIES.includes(value as AudioTrackQuality)
}

export function audioTrackQuality(format: YtDlpFormat): AudioTrackQuality | undefined {
	const noteParts = format.format_note?.split(',').flatMap(part => {
		const notePart = part.trim().toLowerCase()
		return notePart ? [notePart] : []
	})
	return noteParts?.find(isAudioTrackQuality)
}

// A track is a language: yt-dlp ranks and picks tracks by `language`, and
// `format_note` is free text ("DASH audio", "Audio, low"), naming a track only
// when the stream has a language (YouTube's "English original (default)").
export function audioTrackLabel(format: YtDlpFormat): string | undefined {
	const note = format.format_note?.trim()
	if (!format.language || !note) return format.language
	const first = note.split(',')[0]?.trim()
	if (first && isAudioTrackQuality(first.toLowerCase())) return format.language
	return first || format.language
}

export function isDefaultAudio(format: YtDlpFormat): boolean {
	return (format.language_preference ?? 0) > 0 || /\bdefault\b/i.test(format.format_note ?? '')
}

export function isOriginalAudio(format: YtDlpFormat): boolean {
	return /\boriginal\b/i.test(format.format_note ?? '')
}

// Channel layout and sample rate worth naming: stereo and the usual 44.1/48 kHz
// are the baseline and stay unsaid.
// Surround reads by its common name (5.1, 7.1), the reason anyone picks it.
const CHANNEL_NAMES: Readonly<Record<number, string>> = {1: 'Mono', 6: '5.1', 8: '7.1'}

export function channelLabel(channels: number | undefined): string | null {
	if (!channels || channels === 2) return null
	const count = Math.round(channels)
	return CHANNEL_NAMES[count] ?? `${count}ch`
}

export function sampleRateLabel(sampleRateHz: number | undefined): string | null {
	if (!sampleRateHz || sampleRateHz === 44_100 || sampleRateHz === 48_000) return null
	const khz = sampleRateHz / 1_000
	return `${Number.isInteger(khz) ? khz.toFixed(0) : khz.toFixed(2)} kHz`
}
