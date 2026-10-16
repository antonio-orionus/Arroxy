import {describe, expect, it} from 'vite-plus/test'
import {isExploreAdBlockOn} from '@shared/exploreAdBlock.js'

// P2-R53: the ad blocker is on until the user turns it off, so a setting never
// written means on and only an explicit false means off.
describe('isExploreAdBlockOn', () => {
	it.each([
		[undefined, true],
		[true, true],
		[false, false]
	] as const)('treats %s as %s', (exploreAdBlock, expected) => {
		expect(isExploreAdBlockOn({exploreAdBlock})).toBe(expected)
	})

	it('treats settings without the key as on', () => {
		expect(isExploreAdBlockOn({})).toBe(true)
	})
})
