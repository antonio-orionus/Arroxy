import {describe, expect, it} from 'vite-plus/test'
import {findPlayableFileName} from '@shared/playlistMedia.js'
import {downloadSection, formatPartTime, parsePartTime, scaleBytesToPart, urlStartSeconds, validateVideoPart, videoPartSuffix} from '@shared/videoPart.js'

describe('parsePartTime', () => {
	it.each([
		['0', 0],
		['42', 42],
		['754', 754],
		['3:40', 220],
		['03:40', 220],
		['1:02:03', 3723],
		['0:00:05', 5],
		[' 7:15 ', 435],
		['90:00', 5400]
	])('reads %j as %d seconds', (text, seconds) => {
		expect(parsePartTime(text)).toBe(seconds)
	})

	it.each(['', ' ', 'abc', '1:2:3:4', '3:60', '1:60:00', '-5', '1.5', '3:4x', ':30', '3:', '1::2'])('rejects %j', text => {
		expect(parsePartTime(text)).toBeNull()
	})
})

describe('formatPartTime', () => {
	it.each([
		[0, '0:00'],
		[5, '0:05'],
		[220, '3:40'],
		[3723, '1:02:03']
	])('writes %d seconds as %j', (seconds, text) => {
		expect(formatPartTime(seconds)).toBe(text)
		expect(parsePartTime(text)).toBe(seconds)
	})
})

describe('urlStartSeconds', () => {
	it.each([
		['https://www.youtube.com/watch?v=abc&t=754', 754],
		['https://youtu.be/abc?t=754s', 754],
		['https://www.youtube.com/watch?v=abc&t=12m34s', 754],
		['https://www.youtube.com/watch?v=abc&t=1h2m3s', 3723],
		['https://www.youtube.com/watch?v=abc&t=2m', 120],
		['https://www.youtube.com/watch?v=abc&t=1h', 3600]
	])('reads the start time of %s', (url, seconds) => {
		expect(urlStartSeconds(url)).toBe(seconds)
	})

	it.each(['https://www.youtube.com/watch?v=abc', 'https://www.youtube.com/watch?v=abc&t=0', 'https://www.youtube.com/watch?v=abc&t=', 'https://www.youtube.com/watch?v=abc&t=soon', 'https://www.youtube.com/watch?v=abc&t=5m1h', 'not a url'])('finds no start time in %s', url => {
		expect(urlStartSeconds(url)).toBeNull()
	})
})

describe('validateVideoPart', () => {
	it('accepts a range inside the video', () => {
		expect(validateVideoPart({start: '3:40', end: '7:15', exactCut: false}, 600)).toEqual({ok: true, part: {startSeconds: 220, endSeconds: 435, exactCut: false}})
	})

	it('accepts a range that ends at the very end', () => {
		expect(validateVideoPart({start: '0', end: '10:00', exactCut: true}, 600)).toEqual({ok: true, part: {startSeconds: 0, endSeconds: 600, exactCut: true}})
	})

	it.each([
		[{start: 'x', end: '1:00'}, 'startInvalid'],
		[{start: '0:10', end: ''}, 'endInvalid'],
		[{start: '1:00', end: '1:00'}, 'startNotBeforeEnd'],
		[{start: '2:00', end: '1:00'}, 'startNotBeforeEnd'],
		[{start: '0:10', end: '10:01'}, 'endBeyondDuration'],
		[{start: '10:00', end: '10:30'}, 'endBeyondDuration']
	] as const)('reports %j as %s', (fields, error) => {
		expect(validateVideoPart({...fields, exactCut: false}, 600)).toEqual({ok: false, error})
	})

	it('refuses a part of a video with no known length', () => {
		expect(validateVideoPart({start: '0', end: '10', exactCut: false}, undefined)).toEqual({ok: false, error: 'durationUnknown'})
	})
})

describe('videoPartSuffix', () => {
	it.each([
		[{startSeconds: 220, endSeconds: 435}, '[3m40s-7m15s]'],
		[{startSeconds: 0, endSeconds: 45}, '[0s-45s]'],
		[{startSeconds: 60, endSeconds: 120}, '[1m-2m]'],
		[{startSeconds: 3723, endSeconds: 7200}, '[1h2m3s-2h]']
	])('names %j as %s', (range, suffix) => {
		expect(videoPartSuffix({...range, exactCut: false})).toBe(suffix)
	})

	it('never lets playlist sync mistake a part for the whole video', () => {
		expect(findPlayableFileName(['Title [abc] [3m40s-7m15s].mp4'], 'abc')).toBeUndefined()
		expect(findPlayableFileName(['Title [abc] [3m40s-7m15s].mp4', 'Title [abc].mp4'], 'abc')).toBe('Title [abc].mp4')
	})
})

describe('downloadSection', () => {
	it('is a yt-dlp time-range section', () => {
		expect(downloadSection({startSeconds: 220, endSeconds: 435, exactCut: false})).toBe('*220-435')
	})
})

describe('scaleBytesToPart', () => {
	it('scales linearly to the part', () => {
		expect(scaleBytesToPart(1000, {startSeconds: 0, endSeconds: 25, exactCut: false}, 100)).toBe(250)
	})

	it('keeps the whole size without a part, and unknown stays unknown', () => {
		expect(scaleBytesToPart(1000, null, 100)).toBe(1000)
		expect(scaleBytesToPart(undefined, {startSeconds: 0, endSeconds: 25, exactCut: false}, 100)).toBeUndefined()
	})
})
