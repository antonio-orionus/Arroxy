import {describe, expect, it} from 'vite-plus/test'
import {isExploreAdBlockOn} from '@shared/exploreAdBlock.js'

// The ad blocker is off until the user turns it on (it breaks too many sites
// now that Explore browses the open web), so only an explicit true means on.
describe('isExploreAdBlockOn', () => {
	it.each([
		[undefined, false],
		[true, true],
		[false, false]
	] as const)('treats %s as %s', (exploreAdBlock, expected) => {
		expect(isExploreAdBlockOn({exploreAdBlock})).toBe(expected)
	})

	it('treats settings without the key as off', () => {
		expect(isExploreAdBlockOn({})).toBe(false)
	})
})
