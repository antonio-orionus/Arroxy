import {describe, expect, it} from 'vitest'
import {type StartupJourney, TIERS_UNDER_TEST, validateJourneySequence, validateTier} from '../../scripts/startup/journeys.js'

const CLEAN = {allowedWarnings: []} as const

function journey(id: string, profile: StartupJourney['profile']): StartupJourney {
	return {id, description: id, profile, env: {}, expect: 'main-screen', logPolicy: CLEAN, tiers: ['nightly']}
}

describe('tier preflight', () => {
	it('passes for every shipped tier', () => {
		for (const tier of TIERS_UNDER_TEST) expect(validateTier(tier)).toEqual([])
	})

	it('rejects a warm journey whose seeder is absent from the tier', () => {
		const problems = validateJourneySequence([journey('no-gpu', {kind: 'warm', from: 'fresh-cold'})], 'nightly')
		expect(problems).toHaveLength(1)
		expect(problems[0]).toContain('fresh-cold')
	})

	it('rejects a warm journey whose seeder runs after it', () => {
		const problems = validateJourneySequence([journey('no-gpu', {kind: 'warm', from: 'fresh-cold'}), journey('fresh-cold', {kind: 'empty'})], 'nightly')
		expect(problems).toHaveLength(1)
	})

	it('accepts a warm journey seeded by an earlier journey', () => {
		expect(validateJourneySequence([journey('fresh-cold', {kind: 'empty'}), journey('no-gpu', {kind: 'warm', from: 'fresh-cold'})], 'nightly')).toEqual([])
	})

	it('rejects a tier that selects nothing', () => {
		expect(validateJourneySequence([], 'nightly')).toEqual(['tier "nightly" selects no journeys'])
	})
})
