import {afterEach, describe, expect, it} from 'vite-plus/test'
import {packagedLaunchEnv} from '../../scripts/startup/launchEnv.js'

const LEAKY_VARS = ['ELECTRON_RUN_AS_NODE', 'ARROXY_E2E', 'MOCK_BACKEND', 'ARROXY_HEARTBEAT_URL'] as const
const saved = Object.fromEntries(LEAKY_VARS.map(name => [name, process.env[name]]))

afterEach(() => {
	for (const name of LEAKY_VARS) {
		const value = saved[name]
		if (value === undefined) delete process.env[name]
		else process.env[name] = value
	}
})

describe('packagedLaunchEnv', () => {
	it('points the app at the given profile', () => {
		expect(packagedLaunchEnv('/tmp/profile').ELECTRON_USER_DATA).toBe('/tmp/profile')
	})

	// These launches run real release builds on CI runners and test VMs; a
	// heartbeat from one is counted as a new install on the production dashboard.
	it('turns the heartbeat off, even when the caller names a collector', () => {
		expect(packagedLaunchEnv('/tmp/profile').ARROXY_HEARTBEAT_URL).toBe('off')
		process.env.ARROXY_HEARTBEAT_URL = 'https://stats.example.test/collect'
		expect(packagedLaunchEnv('/tmp/profile').ARROXY_HEARTBEAT_URL).toBe('off')
	})

	it('never leaks ELECTRON_RUN_AS_NODE, ARROXY_E2E or MOCK_BACKEND into the app', () => {
		process.env.ELECTRON_RUN_AS_NODE = '1'
		process.env.ARROXY_E2E = '1'
		process.env.MOCK_BACKEND = '1'
		const env = packagedLaunchEnv('/tmp/profile')
		expect(env.ELECTRON_RUN_AS_NODE).toBeUndefined()
		expect(env.ARROXY_E2E).toBeUndefined()
		expect(env.MOCK_BACKEND).toBeUndefined()
	})

	it('applies overrides, but never over the profile', () => {
		const env = packagedLaunchEnv('/tmp/profile', {ARROXY_GPU_MODE: 'software', ELECTRON_USER_DATA: '/elsewhere'})
		expect(env.ARROXY_GPU_MODE).toBe('software')
		expect(env.ELECTRON_USER_DATA).toBe('/tmp/profile')
	})
})
