import {describe, expect, it} from 'vitest'
import {sortFormatsByQuality} from '@shared/qualitySorter.js'
import type {FormatOption} from '@shared/types.js'

function video(formatId: string, resolution: string, fps?: number, filesize?: number): FormatOption {
	return {formatId, label: formatId, ext: 'mp4', resolution, fps, filesize, isVideoOnly: true, isAudioOnly: false}
}

function audio(formatId: string, abr?: number, audioCodec?: string): FormatOption {
	return {formatId, label: formatId, ext: 'm4a', resolution: 'audio only', abr, audioCodec, isVideoOnly: false, isAudioOnly: true}
}

describe('sortFormatsByQuality', () => {
	it('sorts video by resolution descending', () => {
		const sorted = sortFormatsByQuality([video('c', '360p'), video('a', '1080p'), video('b', '720p')])
		expect(sorted.map(f => f.resolution)).toEqual(['1080p', '720p', '360p'])
	})

	it('breaks resolution tie by fps descending', () => {
		const sorted = sortFormatsByQuality([video('a', '1080p', 30), video('b', '1080p', 60)])
		expect(sorted[0].formatId).toBe('b')
		expect(sorted[1].formatId).toBe('a')
	})

	it('breaks fps tie by filesize descending', () => {
		const sorted = sortFormatsByQuality([video('a', '1080p', 60, 100), video('b', '1080p', 60, 200)])
		expect(sorted[0].formatId).toBe('b')
		expect(sorted[1].formatId).toBe('a')
	})

	it('sorts audio by abr descending', () => {
		const sorted = sortFormatsByQuality([audio('low', 64), audio('high', 320), audio('mid', 128)])
		expect(sorted.map(f => f.abr)).toEqual([320, 128, 64])
	})

	it('keeps audio ordered by bitrate even when Dolby codecs are present', () => {
		const sorted = sortFormatsByQuality([audio('ec3', 384, 'ec-3'), audio('opus', 143, 'opus'), audio('aac', 130, 'mp4a.40.2'), audio('ac3', 384, 'ac-3'), audio('aac-low', 49, 'mp4a.40.5')])
		expect(sorted.map(f => f.formatId)).toEqual(['ec3', 'ac3', 'opus', 'aac', 'aac-low'])
	})

	it('places all video tracks before all audio tracks', () => {
		const sorted = sortFormatsByQuality([audio('a1', 320), video('v1', '360p'), audio('a2', 64), video('v2', '1080p')])
		const types = sorted.map(f => (f.isAudioOnly ? 'audio' : 'video'))
		expect(types).toEqual(['video', 'video', 'audio', 'audio'])
	})

	it('handles missing fps (treated as 0)', () => {
		const sorted = sortFormatsByQuality([video('nofps', '1080p'), video('fps', '1080p', 60)])
		expect(sorted[0].formatId).toBe('fps')
	})

	it('handles missing filesize (treated as 0)', () => {
		const sorted = sortFormatsByQuality([video('nosize', '1080p', 60), video('sized', '1080p', 60, 1000)])
		expect(sorted[0].formatId).toBe('sized')
	})

	it('handles missing abr (treated as 0)', () => {
		const sorted = sortFormatsByQuality([audio('noabr'), audio('withabr', 128)])
		expect(sorted[0].formatId).toBe('withabr')
	})

	it('returns empty array for empty input', () => {
		expect(sortFormatsByQuality([])).toEqual([])
	})

	it('returns single-element array unchanged', () => {
		const single = [video('only', '1080p')]
		expect(sortFormatsByQuality(single)).toHaveLength(1)
	})

	it('does not mutate the original array', () => {
		const original = [video('b', '720p'), video('a', '1080p')]
		const copy = [...original]
		sortFormatsByQuality(original)
		expect(original[0].formatId).toBe(copy[0].formatId)
		expect(original[1].formatId).toBe(copy[1].formatId)
	})
})
