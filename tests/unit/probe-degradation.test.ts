import {describe, expect, it} from 'vite-plus/test'
import {degradationIsTransient} from '@main/services/probeDegradation.js'

describe('degradationIsTransient', () => {
	it('is false when every warning is a permanent HTTP error: a second probe gets the same answer', () => {
		const stderr = ['WARNING: [PornHub] 123: Unable to download webpage: HTTP Error 410: Gone', 'WARNING: [PornHub] 123: Failed to download m3u8 information: HTTP Error 403: Forbidden'].join('\n')
		expect(degradationIsTransient(stderr)).toBe(false)
	})

	it('is true while any warning could clear on a second probe', () => {
		expect(degradationIsTransient('WARNING: [youtube] abc: n challenge solving failed')).toBe(true)
		expect(degradationIsTransient('WARNING: Unable to download webpage: HTTP Error 410: Gone\nWARNING: Unable to download webpage: HTTP Error 503: Service Unavailable')).toBe(true)
	})

	it('does not count 429 as permanent', () => {
		expect(degradationIsTransient('WARNING: Unable to download webpage: HTTP Error 429: Too Many Requests')).toBe(true)
	})
})
