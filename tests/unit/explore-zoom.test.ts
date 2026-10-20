import {describe, expect, it} from 'vite-plus/test'
import {EXPLORE_ZOOM_MAX, EXPLORE_ZOOM_MIN, exploreZoomOf, parseExploreZoomPercent, stepExploreZoom} from '@shared/exploreZoom.js'

describe('exploreZoomOf', () => {
	it('is 100% until a zoom is set', () => {
		expect(exploreZoomOf({})).toBe(1)
	})

	it('keeps a stored zoom', () => {
		expect(exploreZoomOf({exploreZoom: 1.25})).toBe(1.25)
	})

	it('clamps a stored zoom into range and ignores a non-finite one', () => {
		expect(exploreZoomOf({exploreZoom: 99})).toBe(EXPLORE_ZOOM_MAX)
		expect(exploreZoomOf({exploreZoom: 0.01})).toBe(EXPLORE_ZOOM_MIN)
		expect(exploreZoomOf({exploreZoom: Number.NaN})).toBe(1)
	})
})

describe('stepExploreZoom', () => {
	it('moves to the next preset up and down', () => {
		expect(stepExploreZoom(1, 1)).toBe(1.1)
		expect(stepExploreZoom(1, -1)).toBe(0.9)
	})

	it('steps from a typed value between presets to the nearest preset in that direction', () => {
		expect(stepExploreZoom(1.13, 1)).toBe(1.25)
		expect(stepExploreZoom(1.13, -1)).toBe(1.1)
	})

	it('stops at the ends', () => {
		expect(stepExploreZoom(EXPLORE_ZOOM_MAX, 1)).toBe(EXPLORE_ZOOM_MAX)
		expect(stepExploreZoom(EXPLORE_ZOOM_MIN, -1)).toBe(EXPLORE_ZOOM_MIN)
	})
})

describe('parseExploreZoomPercent', () => {
	it('reads a whole percent, with or without the sign', () => {
		expect(parseExploreZoomPercent('150')).toBe(1.5)
		expect(parseExploreZoomPercent(' 80% ')).toBe(0.8)
	})

	it('clamps to the range', () => {
		expect(parseExploreZoomPercent('1000')).toBe(EXPLORE_ZOOM_MAX)
		expect(parseExploreZoomPercent('3')).toBe(EXPLORE_ZOOM_MIN)
	})

	it('rejects text that is not a number', () => {
		expect(parseExploreZoomPercent('')).toBeNull()
		expect(parseExploreZoomPercent('abc')).toBeNull()
		expect(parseExploreZoomPercent('12px')).toBeNull()
		expect(parseExploreZoomPercent('-5')).toBeNull()
	})
})
