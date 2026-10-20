import {describe, expect, it} from 'vite-plus/test'
import {audioCodecPreference, audioConversionCopies, audioConversionCopyFilter, audioConversionOutcome} from '../src/audio-conversion.js'

// yt-dlp's FFmpegExtractAudioPP copies a source whose ffprobe codec equals the
// target (or AAC into m4a) and re-encodes the rest; WAV is always an encode.
describe('audioConversionCopies', () => {
	it.each([
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

	it.each([
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
		['best', undefined],
		['aac>m4a/mp3', 'mp4a.40.2'],
		['toString', 'opus']
	])('%s from %s is an encode', (target, acodec) => {
		expect(audioConversionCopies(target, acodec)).toBe(false)
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

	it.each([
		['m4a', {ext: 'webm', acodec: 'opus'}, {ext: 'm4a', copies: false}],
		['m4a', {ext: 'm4a', acodec: 'mp4a.40.2'}, {ext: 'm4a', copies: true}],
		['opus', {ext: 'webm', acodec: 'opus'}, {ext: 'opus', copies: true}],
		['vorbis', {ext: 'webm', acodec: 'opus'}, {ext: 'ogg', copies: false}],
		['alac', {ext: 'webm', acodec: 'opus'}, {ext: 'm4a', copies: false}],
		['wav', {ext: 'webm', acodec: 'opus'}, {ext: 'wav', copies: false}]
	])('%s from %o', (target, source, outcome) => {
		expect(audioConversionOutcome(target, source)).toEqual(outcome)
	})
})

// The `-f` copy filter takes what the copy rule copies: MP3 in an MP4 too.
describe('audioConversionCopyFilter', () => {
	it.each(['mp3', 'MP3', 'mp4a.40.34'])('mp3 copies %s', acodec => {
		const pattern = /acodec~='\(\?i\)(.*)'\]\[abr/.exec(audioConversionCopyFilter('mp3') ?? '')?.[1] ?? ''
		expect(new RegExp(pattern, 'i').test(acodec)).toBe(true)
		expect(audioConversionCopies('mp3', acodec)).toBe(true)
	})
})
