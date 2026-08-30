import {describe, expect, it} from 'vitest'
import {JOURNEYS, journeysForTier} from '../../scripts/startup/journeys.js'

describe('journey catalog', () => {
	it('gives every journey a unique id', () => {
		const ids = JOURNEYS.map(journey => journey.id)
		expect(new Set(ids).size).toBe(ids.length)
	})

	it('never enables the E2E harness, which would mock the branches under test', () => {
		for (const journey of JOURNEYS) {
			expect(journey.env.ARROXY_E2E).toBeUndefined()
		}
	})

	it('puts a fast fresh-start journey in the PR tier', () => {
		expect(journeysForTier('pr').map(journey => journey.id)).toContain('fresh-cold')
	})

	it('gates the update-over-previous-version journey on release', () => {
		const release = journeysForTier('release')
		expect(release.map(journey => journey.id)).toContain('inherited-update')
		expect(release.find(journey => journey.id === 'inherited-update')?.profile).toEqual({kind: 'inherited'})
	})

	it('keeps degraded journeys out of the blocking tiers', () => {
		const degraded = JOURNEYS.filter(journey => journey.network === 'offline' || journey.pathContamination)
		for (const journey of degraded) {
			expect(journey.tiers).not.toContain('release')
			expect(journey.tiers).not.toContain('pr')
		}
	})
})
