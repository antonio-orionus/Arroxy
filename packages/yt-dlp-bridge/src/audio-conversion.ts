// Port of the copy-or-encode choice in yt-dlp's FFmpegExtractAudioPP.run
// (postprocessor/ffmpeg.py): a source whose codec already is the target (AAC
// into m4a too) is copied with `-acodec copy` and --audio-quality does not
// apply; any other source is re-encoded. WAV has no codec of its own to match.
// `best` keeps the source's codec wherever yt-dlp can.

import {AUDIO_FORMATS, type AudioFormat} from './schemas.js'

const AUDIO_FORMAT_SET: ReadonlySet<string> = new Set(AUDIO_FORMATS)

// Whether `target` is one of yt-dlp's single `--audio-format` values. This
// subpath is published and a workflow's `audio.convert.target` is any string,
// so a JavaScript caller can hand these helpers anything (a yt-dlp mapping
// such as `aac>m4a/mp3` too): each checks before a table lookup, so such a
// target is no format rather than a key found on Object.prototype.
export function isAudioFormat(target: string): target is AudioFormat {
	return AUDIO_FORMAT_SET.has(target)
}

// yt-dlp's `acodec` names each codec as ffprobe does, except AAC: `mp4a.40.<n>`
// for its object types (LC, HE, HEv2, LD, ELD, USAC), never `mp4a.40.34` (MP3)
// or `mp4a.6B` (MPEG audio).
const AAC_PATTERN = '^(?:aac|mp4a(?:\\.40\\.(?:[1-6]|23|29|39|42))?)$'
// `best` copies any codec yt-dlp has a container for, and WAV none: neither
// looks for one codec.
const TARGET_CODEC_PATTERNS: Readonly<Record<AudioFormat, string | undefined>> = {best: undefined, aac: AAC_PATTERN, m4a: AAC_PATTERN, opus: '^opus$', mp3: '^(?:mp3|mp4a\\.40\\.34)$', vorbis: '^vorbis$', flac: '^flac$', alac: '^alac$', wav: undefined}

// A copied stream keeps its bitrate: below this a stream is no better for
// being copied, and the best stream is re-encoded instead (YouTube's 48 kbps
// HE-AAC 139 where no 140 is offered, against a 130 kbps Opus 251).
export const AUDIO_CONVERSION_COPY_MIN_KBPS = 96

// ffprobe's name for the codecs yt-dlp's ACODECS table can copy, from
// yt-dlp's `acodec` (which names AAC by its object type, MP3 in an MP4
// `mp4a.40.34`).
const COPYABLE_CODECS = ['aac', 'opus', 'vorbis', 'mp3', 'flac', 'alac'] as const satisfies readonly AudioFormat[]
type CopyableCodec = (typeof COPYABLE_CODECS)[number]
function ffprobeCodec(acodec: string | undefined): CopyableCodec | undefined {
	if (acodec === undefined) return undefined
	if (new RegExp(AAC_PATTERN, 'i').test(acodec)) return 'aac'
	if (/^mp4a\.40\.34$/i.test(acodec)) return 'mp3'
	return COPYABLE_CODECS.find(codec => codec === acodec.toLowerCase())
}

// Each target's container (ACODECS in postprocessor/ffmpeg.py).
const TARGET_EXTENSIONS: Readonly<Record<Exclude<AudioFormat, 'best'>, string>> = {mp3: 'mp3', aac: 'm4a', m4a: 'm4a', opus: 'opus', vorbis: 'ogg', flac: 'flac', alac: 'm4a', wav: 'wav'}
// FFmpegExtractAudioPP.COMMON_AUDIO_EXTS: `best` leaves these files alone.
const COMMON_AUDIO_EXTENSIONS: ReadonlySet<string> = new Set(['aiff', 'alac', 'flac', 'm4a', 'mka', 'mp3', 'ogg', 'opus', 'wav', 'wma'])

// Whether converting a stream with this `acodec` to `target` copies it.
// `best` copies any codec yt-dlp has a container for.
export function audioConversionCopies(target: AudioFormat, acodec: string | undefined): boolean {
	const codec = ffprobeCodec(acodec)
	if (codec === undefined) return false
	if (target === 'best') return true
	return (codec === 'aac' && target === 'm4a') || codec === target
}

// What converting a stream to `target` gives: the file's extension, and
// whether the audio is kept as it is (copied, or left alone) rather than
// re-encoded. Undefined when yt-dlp's choice can't be told from the stream:
// an unknown target, or `best` for a stream whose codec isn't named.
export function audioConversionOutcome(target: AudioFormat, source: {ext: string | undefined; acodec: string | undefined}): {ext: string; copies: boolean} | undefined {
	if (target === 'best') {
		if (source.ext !== undefined && COMMON_AUDIO_EXTENSIONS.has(source.ext)) return {ext: source.ext, copies: true}
		if (source.acodec === undefined) return undefined
		const codec = ffprobeCodec(source.acodec)
		return codec === undefined ? {ext: TARGET_EXTENSIONS.mp3, copies: false} : {ext: TARGET_EXTENSIONS[codec], copies: true}
	}
	return isAudioFormat(target) ? {ext: TARGET_EXTENSIONS[target], copies: audioConversionCopies(target, source.acodec)} : undefined
}

// The `-f` filter for a stream worth copying when converting to `target`:
// in its codec, and not below the copy floor (a stream naming no bitrate passes).
export function audioConversionCopyFilter(target: AudioFormat): string | undefined {
	const pattern = isAudioFormat(target) ? TARGET_CODEC_PATTERNS[target] : undefined
	return pattern === undefined ? undefined : `[acodec~='(?i)${pattern}'][abr>=?${AUDIO_CONVERSION_COPY_MIN_KBPS}]`
}

// Port of FormatSorter's `acodec` order (utils/_utils.py): each pattern is
// matched at the start of the codec, first match wins; a codec matching none
// ranks at the empty entry, and an unknown one (no acodec) below it. Higher is
// preferred. On YouTube it is what puts Opus 251 ahead of AAC 140.
const ACODEC_ORDER: readonly (string | null)[] = ['[af]lac', 'wav|aiff', 'opus', 'vorbis|ogg', 'aac', 'mp?4a?', 'mp3', 'ac-?4', 'e-?a?c-?3', 'ac-?3', 'dts', '', null, 'none']

export function audioCodecPreference(acodec: string | undefined): number {
	const length = ACODEC_ORDER.length
	if (acodec === undefined) return length - ACODEC_ORDER.indexOf(null)
	const codec = acodec.toLowerCase()
	const index = ACODEC_ORDER.findIndex(pattern => pattern !== null && pattern !== '' && new RegExp(`^(?:${pattern})`).test(codec))
	return length - (index === -1 ? ACODEC_ORDER.indexOf('') : index)
}

const NON_DRC_AUDIO_FILTERS = "[format_id!~=?'(?i)(?:^|[-_\\s])drc(?:$|[-_\\s])'][format_note!~=?'(?i)\\bdrc\\b']"
// Dolby surround makes a poor conversion source: libopus refuses its 5.1(side)
// layout outright, and the other lossy targets downmix it. A stream with no
// codec named passes.
const NON_DOLBY_AUDIO_FILTER = "[acodec!~=?'^(?:e-?ac-?3|ec-3|ac-?3)$']"
// Strict: `~=?` would also take a stream with no note at all as the original.
const SOURCE_TRACK_AUDIO_FILTERS = ['[language_preference>0]', "[format_note~='(?i)\\boriginal\\b']", '']

// The stream to convert, most wanted first: the source's own track before any
// other; within it the non-DRC master before the DRC one, a stream that is
// copied as-is before one that is re-encoded, and every stereo stream (DRC
// ones too) before Dolby surround.
// The `-f` the planner gives a conversion that names no stream (a caller's
// stream goes ahead of it). Exported so a caller can run it through its own
// copy of yt-dlp's selection and know which stream converts. No `target`
// (a yt-dlp mapping such as `aac>m4a/mp3` names no one format): no codec to
// look for.
export function audioConversionSourceSelector(target: AudioFormat | undefined): string {
	// A stream already in the target codec is copied, not re-encoded a second time.
	const codecFilter = target === undefined ? undefined : audioConversionCopyFilter(target)
	const stereoFilters = [...(codecFilter ? [codecFilter] : []), NON_DOLBY_AUDIO_FILTER]
	const streamFilters = [...[NON_DRC_AUDIO_FILTERS, ''].flatMap(drcFilter => stereoFilters.map(filter => `${filter}${drcFilter}`)), NON_DRC_AUDIO_FILTERS, '']
	return [...SOURCE_TRACK_AUDIO_FILTERS.flatMap(trackFilter => streamFilters.map(filters => `bestaudio${trackFilter}${filters}`)), 'best'].join('/')
}
