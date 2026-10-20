import type {FormatOption} from '../types.js'
import type {FormatSelectionSource, YtDlpSelectableFormat} from './selectableFormat.js'

function heightAndWidth(resolution: string): {width?: number; height?: number} {
	const dims = /(\d+)\s*x\s*(\d+)/.exec(resolution)
	if (dims) return {width: Number(dims[1]), height: Number(dims[2])}
	const p = /(\d{3,4})p/.exec(resolution)
	return p ? {height: Number(p[1])} : {}
}

// For a result built without a probe (the mock backend, scenarios, tests): its
// options read back as yt-dlp formats, in their listed order. A real probe
// always carries yt-dlp's own (`VideoProbeResult.formatSelection`).
export function selectionSourceFromOptions(options: readonly FormatOption[], durationSeconds?: number): FormatSelectionSource {
	const formats = options.map((option): YtDlpSelectableFormat => {
		const notes = [option.isOriginalAudio ? 'original' : null, option.isDrc ? 'DRC' : null].filter(Boolean).join(', ')
		return {
			format_id: option.formatId,
			ext: option.ext,
			vcodec: option.isAudioOnly ? 'none' : option.videoCodec,
			acodec: option.isVideoOnly ? 'none' : option.audioCodec,
			...(option.isAudioOnly ? {} : heightAndWidth(option.resolution)),
			fps: option.fps,
			dynamic_range: option.isAudioOnly ? undefined : (option.dynamicRange ?? 'SDR'),
			tbr: option.tbr,
			abr: option.abr,
			asr: option.sampleRateHz,
			audio_channels: option.audioChannels,
			filesize: option.filesize,
			quality: option.quality,
			preference: option.preference,
			language_preference: option.audioLanguagePreference ?? (option.isDefaultAudio ? 10 : undefined),
			language: option.audioLanguage,
			format_note: notes === '' ? undefined : notes
		}
	})
	return {formats, sortFields: [], ...(durationSeconds === undefined ? {} : {durationSeconds})}
}
