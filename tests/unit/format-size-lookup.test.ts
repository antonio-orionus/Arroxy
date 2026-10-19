import {describe, expect, it, vi} from 'vite-plus/test'
import type {YtDlpFormat} from 'yt-dlp-bridge/info'
import {lookUpMissingSizes, needsSizeLookup, SIZE_LOOKUP_MAX, type HeadLength} from '@main/services/formatSizeLookup.js'

function plain(id: string, extra: Partial<YtDlpFormat> = {}): YtDlpFormat {
	return {format_id: id, url: `https://cdn.example/${id}.mp4`, protocol: 'https', ext: 'mp4', ...extra}
}

const NEVER: AbortSignal = new AbortController().signal

describe('needsSizeLookup', () => {
	it('asks only for a plain web file with no size of any kind', () => {
		expect(needsSizeLookup(plain('sd'))).toBe(true)
		expect(needsSizeLookup(plain('sd', {protocol: 'http'}))).toBe(true)
		expect(needsSizeLookup(plain('sd', {filesize: 10}))).toBe(false)
		expect(needsSizeLookup(plain('sd', {filesize_approx: 10}))).toBe(false)
		// A manifest's own length says nothing about the media.
		expect(needsSizeLookup(plain('hls', {protocol: 'm3u8_native'}))).toBe(false)
		expect(needsSizeLookup(plain('dash', {protocol: 'http_dash_segments'}))).toBe(false)
		expect(needsSizeLookup(plain('x', {url: undefined}))).toBe(false)
	})
})

describe('lookUpMissingSizes', () => {
	it('fills each missing size from its server, with the format’s own headers', async () => {
		const headLength = vi.fn<HeadLength>(async url => (url.endsWith('/hd.mp4') ? 16_344_300 : 3_576_134))
		const formats = [plain('sd', {http_headers: {Referer: 'https://www.facebook.com/'}}), plain('hd'), plain('dash-v', {filesize: 9})]
		const sized = await lookUpMissingSizes(formats, headLength, NEVER)
		expect(sized.map(f => [f.format_id, f.filesize])).toEqual([
			['sd', 3_576_134],
			['hd', 16_344_300],
			['dash-v', 9]
		])
		expect(headLength).toHaveBeenCalledTimes(2)
		expect(headLength).toHaveBeenCalledWith('https://cdn.example/sd.mp4', {Referer: 'https://www.facebook.com/'}, expect.any(AbortSignal))
	})

	it('leaves a format without a size when its server does not say or fails', async () => {
		const headLength = vi.fn<HeadLength>(async url => {
			if (url.endsWith('/a.mp4')) return null
			throw new Error('ECONNRESET')
		})
		const sized = await lookUpMissingSizes([plain('a'), plain('b')], headLength, NEVER)
		expect(sized.map(f => f.filesize)).toEqual([undefined, undefined])
	})

	it(`asks about ${SIZE_LOOKUP_MAX} files at most`, async () => {
		const headLength = vi.fn<HeadLength>(async () => 1)
		await lookUpMissingSizes(
			Array.from({length: SIZE_LOOKUP_MAX + 3}, (_, i) => plain(`f${i}`)),
			headLength,
			NEVER
		)
		expect(headLength).toHaveBeenCalledTimes(SIZE_LOOKUP_MAX)
	})

	it('gives up on a slow server within the budget, keeping what arrived', async () => {
		const headLength = vi.fn<HeadLength>((url, _headers, signal) =>
			url.endsWith('/fast.mp4')
				? Promise.resolve(5)
				: new Promise((_resolve, reject) => {
						signal.addEventListener('abort', () => reject(signal.reason), {once: true})
					})
		)
		const started = Date.now()
		const sized = await lookUpMissingSizes([plain('fast'), plain('slow')], headLength, NEVER, 50)
		expect(Date.now() - started).toBeLessThan(2_000)
		expect(sized.map(f => f.filesize)).toEqual([5, undefined])
	})

	it('asks nothing once the probe is cancelled', async () => {
		const headLength = vi.fn<HeadLength>(async () => 1)
		const cancelled = new AbortController()
		cancelled.abort()
		const sized = await lookUpMissingSizes([plain('a')], headLength, cancelled.signal)
		expect(headLength).not.toHaveBeenCalled()
		expect(sized[0]?.filesize).toBeUndefined()
	})
})
