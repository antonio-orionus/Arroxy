import {describe, expect, it} from 'vite-plus/test'
import {audioCodecPreference, audioConversionCopies} from '../src/audio-conversion.js'

// yt-dlp's FFmpegExtractAudioPP copies a source whose ffprobe codec equals the
// target (or AAC into m4a) and re-encodes the rest; WAV is always an encode.
describe('audioConversionCopies', () => {
	it.each([
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
