// Port of the copy-or-encode choice in yt-dlp's FFmpegExtractAudioPP.run
// (postprocessor/ffmpeg.py): a source whose codec already is the target (AAC
// into m4a too) is copied with `-acodec copy` and --audio-quality does not
// apply; any other source is re-encoded. WAV has no codec of its own to match.
// `best` keeps the source's codec wherever yt-dlp can.

// yt-dlp's `acodec` names each codec as ffprobe does, except AAC (`mp4a.40.*`).
const TARGET_CODEC_PATTERNS: Readonly<Record<string, string>> = {aac: '^(?:aac|mp4a)', m4a: '^(?:aac|mp4a)', opus: '^opus$', mp3: '^mp3$', vorbis: '^vorbis$', flac: '^flac$', alac: '^alac$'}

function targetCodecPattern(target: string): string | undefined {
	return Object.hasOwn(TARGET_CODEC_PATTERNS, target) ? TARGET_CODEC_PATTERNS[target] : undefined
}

// ffprobe's name for the codecs yt-dlp's ACODECS table can copy, from
// yt-dlp's `acodec` (which names AAC `mp4a.40.*`).
const COPYABLE_CODECS = ['opus', 'vorbis', 'mp3', 'flac', 'alac'] as const
function ffprobeCodec(acodec: string | undefined): string | undefined {
	if (acodec === undefined) return undefined
	if (/^(?:aac|mp4a)/i.test(acodec)) return 'aac'
	return COPYABLE_CODECS.find(codec => codec === acodec.toLowerCase())
}

// Each target's container (ACODECS in postprocessor/ffmpeg.py).
const TARGET_EXTENSIONS: Readonly<Record<string, string>> = {mp3: 'mp3', aac: 'm4a', m4a: 'm4a', opus: 'opus', vorbis: 'ogg', flac: 'flac', alac: 'm4a', wav: 'wav'}
// FFmpegExtractAudioPP.COMMON_AUDIO_EXTS: `best` leaves these files alone.
const COMMON_AUDIO_EXTENSIONS: ReadonlySet<string> = new Set(['aiff', 'alac', 'flac', 'm4a', 'mka', 'mp3', 'ogg', 'opus', 'wav', 'wma'])

// Whether converting a stream with this `acodec` to `target` copies it.
// `best` copies any codec yt-dlp has a container for.
export function audioConversionCopies(target: string, acodec: string | undefined): boolean {
	const codec = ffprobeCodec(acodec)
	if (codec === undefined) return false
	if (target === 'best') return true
	return (codec === 'aac' && target === 'm4a') || codec === target
}

// What converting a stream to `target` gives: the file's extension, and
// whether the audio is kept as it is (copied, or left alone) rather than
// re-encoded. Undefined when yt-dlp's choice can't be told from the stream:
// an unknown target, or `best` for a stream whose codec isn't named.
export function audioConversionOutcome(target: string, source: {ext: string | undefined; acodec: string | undefined}): {ext: string; copies: boolean} | undefined {
	if (target === 'best') {
		if (source.ext !== undefined && COMMON_AUDIO_EXTENSIONS.has(source.ext)) return {ext: source.ext, copies: true}
		if (source.acodec === undefined) return undefined
		const codec = ffprobeCodec(source.acodec)
		return codec === undefined ? {ext: 'mp3', copies: false} : {ext: TARGET_EXTENSIONS[codec] ?? codec, copies: true}
	}
	const ext = Object.hasOwn(TARGET_EXTENSIONS, target) ? TARGET_EXTENSIONS[target] : undefined
	return ext === undefined ? undefined : {ext, copies: audioConversionCopies(target, source.acodec)}
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
