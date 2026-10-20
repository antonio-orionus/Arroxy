// Port of the copy-or-encode choice in yt-dlp's FFmpegExtractAudioPP.run
// (postprocessor/ffmpeg.py): a source whose codec already is the target (AAC
// into m4a too) is copied with `-acodec copy` and --audio-quality does not
// apply; any other source is re-encoded. WAV has no codec of its own to match.

// yt-dlp's `acodec` names each codec as ffprobe does, except AAC (`mp4a.40.*`).
const TARGET_CODEC_PATTERNS: Readonly<Record<string, string>> = {aac: '^(?:aac|mp4a)', m4a: '^(?:aac|mp4a)', opus: '^opus$', mp3: '^mp3$', vorbis: '^vorbis$', flac: '^flac$', alac: '^alac$'}

function targetCodecPattern(target: string): string | undefined {
	return Object.hasOwn(TARGET_CODEC_PATTERNS, target) ? TARGET_CODEC_PATTERNS[target] : undefined
}

// Whether converting a stream with this `acodec` to `target` copies it.
export function audioConversionCopies(target: string, acodec: string | undefined): boolean {
	const pattern = targetCodecPattern(target)
	return pattern !== undefined && acodec !== undefined && new RegExp(pattern, 'i').test(acodec)
}

// The `-f` filter for a stream that converting to `target` copies.
export function audioConversionCopyFilter(target: string): string | undefined {
	const pattern = targetCodecPattern(target)
	return pattern === undefined ? undefined : `[acodec~='(?i)${pattern}']`
}

// Port of FormatSorter's `acodec` order (utils/_utils.py): each pattern is
// matched at the start of the codec, first match wins; a codec matching none
// ranks at the empty entry, and an unknown one (no acodec) below it. Higher is
// preferred. On YouTube it is what puts Opus 251 ahead of AAC 140.
const ACODEC_ORDER: readonly (string | null)[] = ['[af]lac', 'wav|aiff', 'opus', 'vorbis|ogg', 'aac', 'mp?4a?', 'mp3', 'ac-?4', 'e-?a?c-?3', 'ac-?3', 'dts', '', null, 'none']

export function audioCodecPreference(acodec: string | undefined): number {
	const length = ACODEC_ORDER.length
	if (acodec === undefined) return length - ACODEC_ORDER.indexOf(null)
	const index = ACODEC_ORDER.findIndex(pattern => pattern !== null && pattern !== '' && new RegExp(`^(?:${pattern})`).test(acodec))
	return length - (index === -1 ? ACODEC_ORDER.indexOf('') : index)
}
