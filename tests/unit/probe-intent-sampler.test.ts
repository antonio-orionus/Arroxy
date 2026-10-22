import {describe, expect, it} from 'vite-plus/test'
import {parseSampleArgs, sampleId} from '../../scripts/probe-intent/sampleArgs.js'
import {RULES} from '../../scripts/probe-intent/rules.js'
import {probeSourceResult} from '@renderer/dev/probeSources/index.js'

describe('probe-intent:sample arguments', () => {
	it('keeps every URL, with or without --keep', () => {
		expect(parseSampleArgs(['https://a.test/1', 'https://a.test/2'])).toEqual({urls: ['https://a.test/1', 'https://a.test/2'], keepDir: null})
		expect(parseSampleArgs(['https://a.test/1'])).toEqual({urls: ['https://a.test/1'], keepDir: null})
		expect(parseSampleArgs(['--keep', '/tmp/kept', 'https://a.test/1'])).toEqual({urls: ['https://a.test/1'], keepDir: '/tmp/kept'})
		expect(parseSampleArgs(['https://a.test/1', '--keep', '/tmp/kept'])).toEqual({urls: ['https://a.test/1'], keepDir: '/tmp/kept'})
		expect(parseSampleArgs([])).toEqual({urls: [], keepDir: null})
	})

	it('refuses --keep without a directory', () => {
		expect(() => parseSampleArgs(['--keep'])).toThrow('--keep needs a directory')
	})
})

describe('a sampled video’s id', () => {
	it('is the YouTube video id for every link shape, and a safe file name otherwise', () => {
		expect(sampleId('https://www.youtube.com/watch?v=Rt9tW3cMLhI&t=3')).toBe('Rt9tW3cMLhI')
		expect(sampleId('https://www.youtube.com/shorts/zinYqcm70zk')).toBe('zinYqcm70zk')
		expect(sampleId('https://youtu.be/Rt9tW3cMLhI?si=x')).toBe('Rt9tW3cMLhI')
		expect(sampleId('https://www.youtube.com/live/Rt9tW3cMLhI')).toBe('Rt9tW3cMLhI')
		expect(sampleId('https://www.youtube.com/embed/Rt9tW3cMLhI')).toBe('Rt9tW3cMLhI')
		expect(sampleId('youtu.be/no-scheme')).toMatch(/^[\w-]+$/)
		expect(sampleId('https://www.youtube-nocookie.com/embed/ScsahA7OzVo')).toBe('ScsahA7OzVo')
		expect(sampleId('https://www.youtube.com/v/Rt9tW3cMLhI')).toBe('Rt9tW3cMLhI')
		expect(sampleId('https://www.youtube.com/watch?v=&list=PLx')).toMatch(/^[\w-]+$/)
		expect(sampleId('https://vimeo.com/76979871')).toMatch(/^[\w-]+$/)
	})
})

describe('the tier rule', () => {
	// The app takes a 2560x1080 ultra-wide stream as 1080p by its short side
	// (yt-dlp's `res`), though its 16:9 label is 1440p.
	it('accepts a pick that meets the tier by either measure, as the app does', () => {
		const probe = probeSourceResult('youtube-2014')
		const rule = RULES['a tiered profile picks its tier, or says what it picked instead']
		if (!rule) throw new Error('tier rule missing')
		const raw = probe.formats.filter(format => !format.isAudioOnly).map(format => ({format_id: format.formatId, vcodec: format.videoCodec ?? 'avc1', acodec: format.isVideoOnly ? 'none' : 'mp4a', width: 2560, height: 1080}))
		expect(rule(probe, raw).filter(line => line.startsWith('hd-1080 '))).toEqual([])
	})
})
