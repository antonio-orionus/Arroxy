import type {FormatOption} from '@shared/types.js'
import type {YtDlpFormat} from '@shared/ytdlp/infoDict.js'
import {sortFormatsByQuality} from '@shared/qualitySorter.js'
import {humanSize} from '@shared/format.js'
import {audioTrackLabel, audioTrackQuality, isDefaultAudio, isOriginalAudio} from '@shared/audioTrackMeta.js'

// yt-dlp formats → the labelled, quality-sorted options the format picker shows.

function friendlyCodec(acodec: string): string {
	if (acodec === 'opus') return 'Opus'
	if (acodec.startsWith('mp4a')) return 'AAC'
	return acodec
}

function isDrcAudio(format: YtDlpFormat): boolean {
	return /(?:^|[-_\s])drc(?:$|[-_\s])/i.test(format.format_id ?? '') || /\bdrc\b/i.test(format.format_note ?? '')
}

function channelLabel(channels: number | undefined): string | null {
	if (!channels || channels === 2) return null
	return `${Math.round(channels)}ch`
}

function sampleRateLabel(sampleRateHz: number | undefined): string | null {
	if (!sampleRateHz || sampleRateHz === 44_100 || sampleRateHz === 48_000) return null
	const khz = sampleRateHz / 1_000
	return `${Number.isInteger(khz) ? khz.toFixed(0) : khz.toFixed(2)} kHz`
}

export function mapFormats(formats: readonly YtDlpFormat[]): FormatOption[] {
	const mapped = formats.flatMap((item): FormatOption[] => {
		if (!item.format_id || item.ext === 'mhtml' || (item.vcodec === 'none' && (!item.acodec || item.acodec === 'none'))) return []
		const isAudioOnly = item.vcodec === 'none'
		const ext = item.ext ?? 'unknown'
		const filesize = item.filesize ?? item.filesize_approx
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
					dynamicRange: undefined
				} satisfies FormatOption
			]
		}

		const resolution = item.resolution ?? item.format_note ?? 'unknown'
		const fps = item.fps
		const isVideoOnly = item.acodec === 'none'
		const dynamicRange = item.dynamic_range && item.dynamic_range !== 'SDR' ? item.dynamic_range : undefined
		const details = [resolution, ext, fps ? `${fps}fps` : null, dynamicRange ?? null, filesize ? humanSize(filesize) : null].filter(Boolean).join(' | ')

		return [{formatId, label: details, ext, resolution, fps, filesize, isVideoOnly, isAudioOnly: false, dynamicRange} satisfies FormatOption]
	})

	return sortFormatsByQuality(mapped)
}
