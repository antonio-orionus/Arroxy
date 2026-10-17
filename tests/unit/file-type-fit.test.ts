import {describe, expect, it} from 'vite-plus/test'
import {audioCodecName, fileTypeFits, mp4Caveat, videoCodecName, webmBlocker} from '@shared/fileTypeFit.js'
import type {FormatOption} from '@shared/types.js'

function video(videoCodec: string, extra: Partial<FormatOption> = {}): FormatOption {
	return {formatId: 'v', label: 'v', ext: 'mp4', resolution: '1920x1080', videoCodec, isVideoOnly: true, isAudioOnly: false, ...extra}
}

function audio(audioCodec: string): FormatOption {
	return {formatId: 'a', label: 'a', ext: 'webm', resolution: 'audio only', audioCodec, isVideoOnly: false, isAudioOnly: true}
}

describe('codec names', () => {
	it('names the codecs the Format screen shows', () => {
		expect(videoCodecName('av01.0.12M.08')).toBe('AV1')
		expect(videoCodecName('vp09.00.40.08')).toBe('VP9')
		expect(videoCodecName('vp9')).toBe('VP9')
		expect(videoCodecName('avc1.640028')).toBe('H.264')
		expect(videoCodecName('hev1.1.6.L93.B0')).toBe('HEVC')
		expect(audioCodecName('opus')).toBe('Opus')
		expect(audioCodecName('mp4a.40.2')).toBe('AAC')
		expect(audioCodecName('ec-3')).toBe('Dolby')
		expect(audioCodecName('ac-3')).toBe('Dolby')
	})

	it('says nothing for unknown, empty or "none" codecs', () => {
		expect(videoCodecName(undefined)).toBeNull()
		expect(videoCodecName('none')).toBeNull()
		expect(videoCodecName('weird')).toBeNull()
		expect(audioCodecName('none')).toBeNull()
		expect(audioCodecName(undefined)).toBeNull()
	})
})

describe('WebM fit', () => {
	it('holds VP9 or AV1 video with Opus audio', () => {
		expect(webmBlocker(video('vp9'), audio('opus'))).toBeNull()
		expect(webmBlocker(video('av01.0.08M.08'), audio('opus'))).toBeNull()
		expect(fileTypeFits('webm', video('vp9'), audio('opus'))).toBe(true)
	})

	it('names the first codec WebM cannot hold', () => {
		expect(webmBlocker(video('avc1.640028'), audio('opus'))).toBe('H.264')
		expect(webmBlocker(video('vp9'), audio('mp4a.40.2'))).toBe('AAC')
		expect(webmBlocker(video('vp9'), audio('ec-3'))).toBe('Dolby')
		expect(fileTypeFits('webm', video('avc1.640028'), audio('opus'))).toBe(false)
	})

	it('checks the built-in audio of a muxed stream', () => {
		const muxed = video('vp9', {isVideoOnly: false, audioCodec: 'mp4a.40.2'})
		expect(webmBlocker(muxed, undefined)).toBe('AAC')
	})

	it('lets MP4 and MKV hold anything', () => {
		expect(fileTypeFits('mp4', video('avc1.640028'), audio('mp4a.40.2'))).toBe(true)
		expect(fileTypeFits('mkv', video('vp9'), audio('ec-3'))).toBe(true)
		expect(fileTypeFits('auto', video('avc1.640028'), audio('opus'))).toBe(true)
	})

	it('has no objection while nothing is picked', () => {
		expect(webmBlocker(undefined, undefined)).toBeNull()
	})
})

describe('MP4 playback caveat', () => {
	it('names the codecs QuickTime, editors and TVs often cannot open inside an MP4', () => {
		expect(mp4Caveat(video('vp9'), audio('mp4a.40.2'))).toEqual(['VP9'])
		expect(mp4Caveat(video('av01.0.08M.08'), audio('opus'))).toEqual(['AV1', 'Opus'])
		expect(mp4Caveat(video('avc1.640028'), audio('opus'))).toEqual(['Opus'])
	})

	it('is empty for H.264 video with AAC audio, the safe pair', () => {
		expect(mp4Caveat(video('avc1.640028'), audio('mp4a.40.2'))).toEqual([])
		expect(mp4Caveat(video('hev1.1.6.L93.B0'), audio('mp4a.40.2'))).toEqual([])
	})

	it('reads the built-in audio of a muxed stream', () => {
		expect(mp4Caveat(video('avc1.640028', {isVideoOnly: false, audioCodec: 'opus'}), undefined)).toEqual(['Opus'])
	})
})
