import path from 'node:path'
import {describe, expect, it} from 'vitest'
import type {StartupJourney} from '../../scripts/startup/journeys.js'
import {buildJourneyEnv} from '../../scripts/startup/runJourney.js'

const BASE: StartupJourney = {id: 'test', description: 'test', profile: {kind: 'empty'}, env: {}, expect: 'main-screen', logPolicy: {allowedWarnings: [], allowedErrors: []}, tiers: ['nightly']}

const CTX = {packagedExe: '/app/Arroxy', baseDir: '/tmp/base'}

describe('buildJourneyEnv', () => {
	it('points the app at the provisioned profile', () => {
		expect(buildJourneyEnv(BASE, CTX, '/tmp/profile').ELECTRON_USER_DATA).toBe('/tmp/profile')
	})

	it('never leaks ELECTRON_RUN_AS_NODE into the app env', () => {
		const previous = process.env.ELECTRON_RUN_AS_NODE
		process.env.ELECTRON_RUN_AS_NODE = '1'
		try {
			expect(buildJourneyEnv(BASE, {...CTX}, '/tmp/profile').ELECTRON_RUN_AS_NODE).toBeUndefined()
		} finally {
			if (previous === undefined) delete process.env.ELECTRON_RUN_AS_NODE
			else process.env.ELECTRON_RUN_AS_NODE = previous
		}
	})

	it('never leaks MOCK_BACKEND into the app env', () => {
		const previous = process.env.MOCK_BACKEND
		process.env.MOCK_BACKEND = '1'
		try {
			expect(buildJourneyEnv(BASE, {...CTX}, '/tmp/profile').MOCK_BACKEND).toBeUndefined()
		} finally {
			if (previous === undefined) delete process.env.MOCK_BACKEND
			else process.env.MOCK_BACKEND = previous
		}
	})

	it('applies journey env overrides', () => {
		const journey = {...BASE, env: {ARROXY_GPU_MODE: 'software'}}
		expect(buildJourneyEnv(journey, CTX, '/tmp/profile').ARROXY_GPU_MODE).toBe('software')
	})

	it('prepends fake tools to the child PATH only when contamination is requested', () => {
		const journey = {...BASE, pathContamination: true}
		const env = buildJourneyEnv(journey, {...CTX, fakeToolsDir: '/tmp/fake'}, '/tmp/profile')
		expect(env.PATH?.startsWith(`/tmp/fake${path.delimiter}`)).toBe(true)
		expect(buildJourneyEnv(BASE, {...CTX, fakeToolsDir: '/tmp/fake'}, '/tmp/profile').PATH?.startsWith('/tmp/fake')).toBe(false)
	})
})
