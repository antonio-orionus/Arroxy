import {describe, expect, it} from 'vite-plus/test'
import {audioCodecPreference, audioConversionCopies, audioConversionCopyFilter, audioConversionOutcome, audioConversionSourceSelector, isAudioFormat} from '../src/audio-conversion.js'
import {AUDIO_FORMATS, type AudioFormat} from '../src/schemas.js'

// yt-dlp's own tables (postprocessor/ffmpeg.py, utils/_utils.py), the
// reference these helpers port: ACODECS gives each `--audio-format` its
// container; FFmpegExtractAudioPP.COMMON_AUDIO_EXTS is
// MEDIA_EXTENSIONS.common_audio plus wma.
const YT_DLP_ACODECS_EXT = {mp3: 'mp3', aac: 'm4a', m4a: 'm4a', opus: 'opus', vorbis: 'ogg', flac: 'flac', alac: 'm4a', wav: 'wav'} as const
const YT_DLP_COMMON_AUDIO_EXTS: readonly string[] = ['aiff', 'alac', 'flac', 'm4a', 'mka', 'mp3', 'ogg', 'opus', 'wav', 'wma']

function hasAcodecsEntry(codec: string): codec is keyof typeof YT_DLP_ACODECS_EXT {
	return Object.hasOwn(YT_DLP_ACODECS_EXT, codec)
}

// FFmpegExtractAudioPP.run on a file of this `ext` whose ffprobe codec_name
// is `filecodec`: the extension it ends in, and whether the audio is kept
// (left alone, or `-acodec copy`) rather than re-encoded.
function ytDlpExtractAudio(target: AudioFormat, ext: string, filecodec: string): {ext: string; copies: boolean} {
	if (target === 'best' && YT_DLP_COMMON_AUDIO_EXTS.includes(ext)) return {ext, copies: true}
	if (filecodec === 'aac' && (target === 'm4a' || target === 'best')) return {ext: YT_DLP_ACODECS_EXT.m4a, copies: true}
	if (target === 'best' || target === filecodec) return hasAcodecsEntry(filecodec) ? {ext: YT_DLP_ACODECS_EXT[filecodec], copies: true} : {ext: YT_DLP_ACODECS_EXT.mp3, copies: false}
	return {ext: YT_DLP_ACODECS_EXT[target], copies: false}
}

// Whether yt-dlp copies the stream, its file's extension aside (`best`
// leaves a file in a common audio container alone whatever its codec).
function ytDlpCopies(target: AudioFormat, filecodec: string): boolean {
	return ytDlpExtractAudio(target, 'mkv', filecodec).copies
}

// Streams as a yt-dlp format names them (`acodec`, `ext`), with the
// codec_name ffprobe reports for the downloaded file.
const STREAMS = [
	{acodec: 'mp4a.40.2', ffprobe: 'aac', ext: 'm4a'},
	{acodec: 'mp4a.40.5', ffprobe: 'aac', ext: 'mp4'},
	{acodec: 'MP4A.40.2', ffprobe: 'aac', ext: 'mp4'},
	{acodec: 'aac', ffprobe: 'aac', ext: 'mp4'},
	{acodec: 'mp4a.40.34', ffprobe: 'mp3', ext: 'mp4'},
	{acodec: 'mp3', ffprobe: 'mp3', ext: 'mp3'},
	{acodec: 'opus', ffprobe: 'opus', ext: 'webm'},
	{acodec: 'OPUS', ffprobe: 'opus', ext: 'webm'},
	{acodec: 'opusx', ffprobe: 'opusx', ext: 'webm'},
	{acodec: 'vorbis', ffprobe: 'vorbis', ext: 'webm'},
	{acodec: 'flac', ffprobe: 'flac', ext: 'mp4'},
	{acodec: 'flac', ffprobe: 'flac', ext: 'flac'},
	{acodec: 'alac', ffprobe: 'alac', ext: 'mp4'},
	{acodec: 'ec-3', ffprobe: 'eac3', ext: 'mp4'},
	{acodec: 'ac-3', ffprobe: 'ac3', ext: 'mp4'},
	{acodec: 'pcm_s16le', ffprobe: 'pcm_s16le', ext: 'wav'}
] as const

// yt-dlp's `~=` filter: re.search with the pattern's inline `(?i)`.
function codecFilterTakes(selector: string, acodec: string): boolean {
	const pattern = /\[acodec~='\(\?i\)(.*)'\]\[abr/.exec(selector)?.[1]
	if (pattern === undefined) throw new Error(`no acodec filter in ${selector}`)
	return new RegExp(pattern, 'i').test(acodec)
}

describe('AUDIO_FORMATS', () => {
	// FFmpegExtractAudioPP.FORMAT_RE: `best` and each ACODECS name.
	it("are yt-dlp's single --audio-format values", () => {
		expect(AUDIO_FORMATS.toSorted()).toEqual(['best', ...Object.keys(YT_DLP_ACODECS_EXT)].toSorted())
	})
})

// yt-dlp's FFmpegExtractAudioPP copies a source whose ffprobe codec equals the
// target (or AAC into m4a) and re-encodes the rest; WAV is always an encode.
describe('audioConversionCopies', () => {
	it.each<[AudioFormat, string]>([
		['best', 'mp4a.40.2'],
		['best', 'opus'],
		['best', 'flac'],
		['mp3', 'mp4a.40.34'],
		['m4a', 'mp4a.40.2'],
		['m4a', 'mp4a.40.5'],
		['m4a', 'aac'],
		['aac', 'mp4a.40.2'],
		['opus', 'opus'],
		['opus', 'OPUS'],
		['mp3', 'mp3'],
		['vorbis', 'vorbis'],
		['flac', 'flac'],
		['alac', 'alac']
	])('%s from %s is a copy', (target, acodec) => {
		expect(audioConversionCopies(target, acodec)).toBe(true)
	})

	it.each<[AudioFormat, string | undefined]>([
		['m4a', 'opus'],
		// mp4a.6B is MPEG audio and mp4a.40.34 MP3 in an MP4: not AAC.
		['m4a', 'mp4a.6B'],
		['m4a', 'mp4a.40.34'],
		['opus', 'mp4a.40.2'],
		['mp3', 'opus'],
		['m4a', 'ec-3'],
		['opus', 'opusx'],
		['wav', 'pcm_s16le'],
		['wav', 'opus'],
		['m4a', undefined],
		['best', 'ec-3'],
		['best', undefined]
	])('%s from %s is an encode', (target, acodec) => {
		expect(audioConversionCopies(target, acodec)).toBe(false)
	})

	it.each(AUDIO_FORMATS)('%s copies what yt-dlp copies', target => {
		for (const stream of STREAMS) expect(audioConversionCopies(target, stream.acodec), stream.acodec).toBe(ytDlpCopies(target, stream.ffprobe))
	})
})

// yt-dlp's FormatSorter `acodec` order: lossless first, then Opus, Vorbis,
// AAC, MP3, then Dolby and DTS; an unnamed codec last.
describe('audioCodecPreference', () => {
	it('ranks codecs in yt-dlp order', () => {
		const order = ['flac', 'alac', 'wav', 'opus', 'vorbis', 'aac', 'mp4a.40.2', 'mp3', 'ac-4', 'ec-3', 'ac-3', 'dts', 'unknown', undefined]
		const ranks = order.map(audioCodecPreference)
		expect(ranks).toEqual(ranks.toSorted((a, b) => b - a))
		expect(audioCodecPreference('opus')).toBeGreaterThan(audioCodecPreference('mp4a.40.2'))
		expect(audioCodecPreference('flac')).toBe(audioCodecPreference('alac'))
		// FormatSorter lowercases the codec before matching.
		expect(audioCodecPreference('OPUS')).toBe(audioCodecPreference('opus'))
	})
})

// `--audio-format best` keeps a file already in a common audio container,
// copies a codec yt-dlp knows into its own container, and re-encodes the
// rest to MP3. A named target always ends in that target's container.
describe('audioConversionOutcome', () => {
	it.each([
		[
			{ext: 'm4a', acodec: 'mp4a.40.2'},
			{ext: 'm4a', copies: true}
		],
		[
			{ext: 'mp4', acodec: 'mp4a.40.2'},
			{ext: 'm4a', copies: true}
		],
		[
			{ext: 'webm', acodec: 'opus'},
			{ext: 'opus', copies: true}
		],
		[
			{ext: 'webm', acodec: 'vorbis'},
			{ext: 'ogg', copies: true}
		],
		[
			{ext: 'mp3', acodec: 'mp3'},
			{ext: 'mp3', copies: true}
		],
		[
			{ext: 'mp4', acodec: 'ec-3'},
			{ext: 'mp3', copies: false}
		],
		[
			{ext: 'wav', acodec: undefined},
			{ext: 'wav', copies: true}
		],
		[{ext: 'mp4', acodec: undefined}, undefined]
	])('best from %o', (source, outcome) => {
		expect(audioConversionOutcome('best', source)).toEqual(outcome)
	})

	it.each<[AudioFormat, {ext: string; acodec: string}, {ext: string; copies: boolean}]>([
		['m4a', {ext: 'webm', acodec: 'opus'}, {ext: 'm4a', copies: false}],
		['m4a', {ext: 'm4a', acodec: 'mp4a.40.2'}, {ext: 'm4a', copies: true}],
		// `aac` is ACODECS' ADTS stream, still named .m4a.
		['aac', {ext: 'm4a', acodec: 'mp4a.40.2'}, {ext: 'm4a', copies: true}],
		['aac', {ext: 'webm', acodec: 'opus'}, {ext: 'm4a', copies: false}],
		['opus', {ext: 'webm', acodec: 'opus'}, {ext: 'opus', copies: true}],
		['vorbis', {ext: 'webm', acodec: 'opus'}, {ext: 'ogg', copies: false}],
		['flac', {ext: 'flac', acodec: 'flac'}, {ext: 'flac', copies: true}],
		['flac', {ext: 'webm', acodec: 'opus'}, {ext: 'flac', copies: false}],
		['alac', {ext: 'webm', acodec: 'opus'}, {ext: 'm4a', copies: false}],
		['wav', {ext: 'webm', acodec: 'opus'}, {ext: 'wav', copies: false}]
	])('%s from %o', (target, source, outcome) => {
		expect(audioConversionOutcome(target, source)).toEqual(outcome)
	})

	it.each(AUDIO_FORMATS)('%s names the file yt-dlp writes', target => {
		for (const stream of STREAMS) expect(audioConversionOutcome(target, stream), `${stream.acodec} in ${stream.ext}`).toEqual(ytDlpExtractAudio(target, stream.ext, stream.ffprobe))
	})
})

// The `-f` copy filter takes exactly the streams the copy rule copies: MP3 in
// an MP4 too, AAC by any of its object types.
describe('audioConversionCopyFilter', () => {
	it.each(AUDIO_FORMATS.filter(target => target !== 'best' && target !== 'wav'))('%s takes the streams yt-dlp copies to it, and no other', target => {
		const filter = audioConversionCopyFilter(target) ?? ''
		for (const stream of STREAMS) expect(codecFilterTakes(filter, stream.acodec), stream.acodec).toBe(ytDlpCopies(target, stream.ffprobe))
	})

	// WAV copies nothing; `best` copies every codec yt-dlp has a container
	// for. Neither looks for one codec.
	it.each<AudioFormat>(['wav', 'best'])('%s has none', target => {
		expect(audioConversionCopyFilter(target)).toBeUndefined()
	})
})

// The source chain tries a stream yt-dlp copies before one it re-encodes.
describe('audioConversionSourceSelector', () => {
	it.each(AUDIO_FORMATS)('%s tries a stream it copies first', target => {
		const alternatives = audioConversionSourceSelector(target).split('/')
		expect(alternatives.at(-1)).toBe('best')
		if (target === 'best' || target === 'wav') {
			expect(alternatives.filter(alternative => alternative.includes('acodec~='))).toEqual([])
			return
		}
		const first = alternatives[0] ?? ''
		for (const stream of STREAMS) expect(codecFilterTakes(first, stream.acodec), stream.acodec).toBe(ytDlpCopies(target, stream.ffprobe))
	})

	// A yt-dlp mapping (`aac>m4a/mp3`) names no one format, so no codec to look for.
	it('looks for no codec without a single format', () => {
		expect(audioConversionSourceSelector(undefined)).toBe(audioConversionSourceSelector('wav'))
	})
})

// The subpath is published and planWorkflow's input is a plain interface, so
// a JavaScript caller can pass any string, a yt-dlp mapping too. Such a
// target is no format: nothing is copied, nor looked up on Object.prototype.
describe('a target that is no audio format', () => {
	it.each(['aac>m4a/mp3', 'toString', 'constructor', '__proto__', 'MP3', ''])('%s', target => {
		expect(isAudioFormat(target)).toBe(false)
		// @ts-expect-error -- an untyped caller
		expect(audioConversionCopies(target, 'opus')).toBe(false)
		// @ts-expect-error -- an untyped caller
		expect(audioConversionOutcome(target, {ext: 'webm', acodec: 'opus'})).toBeUndefined()
		// @ts-expect-error -- an untyped caller
		expect(audioConversionCopyFilter(target)).toBeUndefined()
		// @ts-expect-error -- an untyped caller
		expect(audioConversionSourceSelector(target)).toBe(audioConversionSourceSelector(undefined))
	})

	it.each(AUDIO_FORMATS)('%s is one', target => {
		expect(isAudioFormat(target)).toBe(true)
	})
})
