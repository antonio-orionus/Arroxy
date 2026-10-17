// @vitest-environment jsdom
import {afterEach, describe, expect, it, vi} from 'vite-plus/test'
import {resolveAppHdr} from '@renderer/lib/displayHdr.js'

function stubDisplay(matches: (query: string) => boolean): void {
	vi.stubGlobal('matchMedia', (query: string) => ({matches: matches(query), media: query}))
}

afterEach(() => {
	vi.unstubAllGlobals()
})

describe('resolveAppHdr', () => {
	it('Auto is HDR first on a screen whose dynamic range is high', () => {
		const asked: string[] = []
		stubDisplay(query => {
			asked.push(query)
			return query === '(dynamic-range: high)'
		})

		expect(resolveAppHdr('auto')).toEqual({preference: 'hdr', source: 'display'})
		expect(asked).toEqual(['(dynamic-range: high)'])
	})

	it('Auto is SDR first on a screen that is not HDR', () => {
		stubDisplay(() => false)

		expect(resolveAppHdr('auto')).toEqual({preference: 'sdr', source: 'display'})
	})

	it('does not look at the screen for an explicit choice', () => {
		stubDisplay(() => {
			throw new Error('the screen must not be asked')
		})

		expect(resolveAppHdr('sdr')).toEqual({preference: 'sdr', source: 'settings'})
		expect(resolveAppHdr('hdr')).toEqual({preference: 'hdr', source: 'settings'})
	})

	it('reads as SDR when the window cannot answer', () => {
		vi.stubGlobal('matchMedia', undefined)

		expect(resolveAppHdr('auto')).toEqual({preference: 'sdr', source: 'display'})
	})

	it('treats a missing setting as the default, Auto', () => {
		stubDisplay(() => true)

		expect(resolveAppHdr(undefined)).toEqual({preference: 'hdr', source: 'display'})
	})
})
