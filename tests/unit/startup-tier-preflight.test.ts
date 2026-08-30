import {describe, expect, it} from 'vitest'
import {type StartupJourney, STARTUP_TIERS, validateJourneySequence, validateTier} from '../../scripts/startup/journeys.js'

const CLEAN = {allowedWarnings: [], allowedErrors: []} as const

function journey(id: string, profile: StartupJourney['profile'], expect: StartupJourney['expect'] = 'main-screen'): StartupJourney {
	return {id, description: id, profile, env: {}, expect, logPolicy: CLEAN, tiers: ['nightly']}
}

describe('tier preflight', () => {
	it('passes for every shipped tier', () => {
		for (const tier of STARTUP_TIERS) expect(validateTier(tier)).toEqual([])
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

	it('rejects a warm journey whose seeder never reaches the main screen', () => {
		const problems = validateJourneySequence([journey('blocked', {kind: 'empty'}, 'repair-panel'), journey('warm-after-blocked', {kind: 'warm', from: 'blocked'})], 'nightly')
		expect(problems).toHaveLength(1)
		expect(problems[0]).toContain('repair-panel')
	})

	it('rejects a tier that selects nothing', () => {
		expect(validateJourneySequence([], 'nightly')).toEqual(['tier "nightly" selects no journeys'])
	})
})
