import type {FormatOption} from './types.js'

function resolutionHeight(resolution: string): number {
	const m = /(\d{3,4})/.exec(resolution)
	return m ? Number.parseInt(m[1], 10) : 0
}

export function sortFormatsByQuality(formats: FormatOption[]): FormatOption[] {
	const video = formats.filter(f => !f.isAudioOnly)
	const audio = formats.filter(f => f.isAudioOnly)

	const sortedVideo = video.toSorted((a, b) => {
		const byResolution = resolutionHeight(b.resolution) - resolutionHeight(a.resolution)
		if (byResolution !== 0) return byResolution
		const byFps = (b.fps ?? 0) - (a.fps ?? 0)
		if (byFps !== 0) return byFps
		return (b.filesize ?? 0) - (a.filesize ?? 0)
	})

	const sortedAudio = audio.toSorted((a, b) => (b.abr ?? 0) - (a.abr ?? 0))

	return [...sortedVideo, ...sortedAudio]
}
