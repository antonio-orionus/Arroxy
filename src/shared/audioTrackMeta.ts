import {AUDIO_TRACK_QUALITIES, type AudioTrackQuality} from './schemas.js'
import type {YtDlpFormat} from './ytdlp/infoDict.js'

export function isAudioTrackQuality(value: string): value is AudioTrackQuality {
	return AUDIO_TRACK_QUALITIES.includes(value as AudioTrackQuality)
}

export function audioTrackQuality(format: YtDlpFormat): AudioTrackQuality | undefined {
	const noteParts = format.format_note
		?.split(',')
		.map(part => part.trim().toLowerCase())
		.filter(Boolean)
	return noteParts?.find(isAudioTrackQuality)
}

export function audioTrackLabel(format: YtDlpFormat): string | undefined {
	const note = format.format_note?.trim()
	if (!note) return format.language
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
