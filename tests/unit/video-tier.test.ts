import {describe, expect, it} from 'vite-plus/test'
import {tierCeiling, tierHeightOf} from '@shared/videoTier.js'

describe('tierCeiling', () => {
	it('is the largest short and long side a stream can have and still sit at or under the tier', () => {
		expect(tierCeiling(480)).toEqual({shortSide: 698, longSide: 1241})
		expect(tierCeiling(1080)).toEqual({shortSide: 1396, longSide: 2483})
		expect(tierCeiling(4320)).toBeNull()
	})

	it('agrees with the tier the rows name', () => {
		for (const tier of [144, 240, 360, 480, 720, 1080, 1440, 2160]) {
			const ceiling = tierCeiling(tier)
			if (!ceiling) throw new Error(`no ceiling for ${tier}`)
			expect(tierHeightOf(ceiling.longSide, ceiling.shortSide)).toBeLessThanOrEqual(tier)
			expect(tierHeightOf(ceiling.longSide + 1, Math.min(ceiling.shortSide, ceiling.longSide + 1))).toBeGreaterThan(tier)
			expect(tierHeightOf(ceiling.shortSide + 1, ceiling.shortSide + 1)).toBeGreaterThan(tier)
		}
	})
})
