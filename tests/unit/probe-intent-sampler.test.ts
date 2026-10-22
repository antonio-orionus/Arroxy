import {describe, expect, it} from 'vite-plus/test'
import {parseSampleArgs, sampleId} from '../../scripts/probe-intent/sampleArgs.js'
import {RULES} from '../../scripts/probe-intent/rules.js'
import {probeResultFromFixture, probeSourceResult} from '@renderer/dev/probeSources/index.js'

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
	// An ultra-wide 2560x1080 sits in the 1440p row, though yt-dlp's `res`
	// counts it as 1080, so a 1080p profile that takes it must say so.
	it('judges a pick by the row that names it', () => {
		const probe = probeSourceResult('youtube-2014')
		const rule = RULES['a tiered profile picks its tier, or says what it picked instead']
		if (!rule) throw new Error('tier rule missing')
		const raw = probe.formats.filter(format => !format.isAudioOnly).map(format => ({format_id: format.formatId, vcodec: format.videoCodec ?? 'avc1', acodec: format.isVideoOnly ? 'none' : 'mp4a', width: 2560, height: 1080}))
		expect(rule(probe, raw)).toContain('hd-1080 picks 1440p and says nothing')
	})
	// A notice is a claim about the video, so the rule checks it too.
	it('flags a notice that says the video has no stream at the tier when it has one', () => {
		const probe = probeSourceResult('youtube-2014')
		const rule = RULES['a tiered profile picks its tier, or says what it picked instead']
		if (!rule) throw new Error('tier rule missing')
		const raw = [...probe.formats.filter(format => !format.isAudioOnly).map(format => ({format_id: format.formatId, vcodec: 'avc1', acodec: format.isVideoOnly ? 'none' : 'mp4a', width: 640, height: 360})), {format_id: 'extra-480', vcodec: 'vp9', acodec: 'none', width: 854, height: 480}]
		expect(rule(probe, raw).some(line => line.startsWith('small-file ') && line.includes('480p'))).toBe(true)
	})
	// A copy the site marks down is no stream a profile can take at its tier.
	it('does not count a damaged copy at the tier as one the profile can take', () => {
		const formats = [
			{format_id: 'damaged', ext: 'mp4', width: 854, height: 480, vcodec: 'avc1.4d401e', acodec: 'none', preference: -10, format_note: '480p, DAMAGED', protocol: 'https'},
			{format_id: 'healthy', ext: 'mp4', width: 1280, height: 720, vcodec: 'avc1.4d401f', acodec: 'none', protocol: 'https'},
			{format_id: 'audio', ext: 'm4a', vcodec: 'none', acodec: 'mp4a.40.2', abr: 128, protocol: 'https'}
		]
		const info = {_type: 'video', id: 'damaged', title: 'Damaged', extractor: 'generic', extractor_key: 'Generic', webpage_url: 'https://example.test/v', formats}
		const rule = RULES['a tiered profile picks its tier, or says what it picked instead']
		if (!rule) throw new Error('tier rule missing')
		expect(rule(probeResultFromFixture({info}, 'damaged'), formats).filter(line => line.startsWith('small-file '))).toEqual([])
	})
})
