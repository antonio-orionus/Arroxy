import {describe, expect, it} from 'vite-plus/test'
import {audioCodecName, fileTypeFits, mp4Caveat, videoCodecName, webmBlocker, type QuickTimeHost} from '@shared/fileTypeFit.js'
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
	const oldMac: QuickTimeHost = {mac: true, av1Hardware: false}
	const newMac: QuickTimeHost = {mac: true, av1Hardware: true}
	const notMac: QuickTimeHost = {mac: false, av1Hardware: false}

	it('names the video codec QuickTime cannot play inside an MP4', () => {
		expect(mp4Caveat(video('vp9'), oldMac)).toBe('VP9')
		expect(mp4Caveat(video('vp09.00.40.08'), oldMac)).toBe('VP9')
		expect(mp4Caveat(video('av01.0.08M.08'), oldMac)).toBe('AV1')
	})

	it('drops AV1 on a Mac that decodes it in hardware, but never VP9', () => {
		expect(mp4Caveat(video('av01.0.08M.08'), newMac)).toBeNull()
		expect(mp4Caveat(video('vp09.00.40.08'), newMac)).toBe('VP9')
	})

	it('says nothing off a Mac, where there is no QuickTime', () => {
		expect(mp4Caveat(video('av01.0.08M.08'), notMac)).toBeNull()
		expect(mp4Caveat(video('vp09.00.40.08'), notMac)).toBeNull()
	})

	it('says nothing for H.264 or HEVC, which QuickTime plays', () => {
		expect(mp4Caveat(video('avc1.640028'), oldMac)).toBeNull()
		expect(mp4Caveat(video('hev1.1.6.L93.B0'), oldMac)).toBeNull()
	})

	it('does not blame the audio: Opus in an MP4 played in QuickTime', () => {
		expect(mp4Caveat(video('avc1.640028', {isVideoOnly: false, audioCodec: 'opus'}), oldMac)).toBeNull()
	})

	it('has no opinion while no video is picked or its codec is unknown', () => {
		expect(mp4Caveat(undefined, oldMac)).toBeNull()
		expect(mp4Caveat(video('weird'), oldMac)).toBeNull()
	})
})
