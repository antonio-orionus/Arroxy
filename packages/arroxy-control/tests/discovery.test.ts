import {describe, expect, it} from 'vite-plus/test'
import {CONTROL_DISCOVERY_FILE_NAME, controlDiscoverySchema} from '../src/index'

const discovery = {socketPath: '/run/user/501/arroxy/control.sock', token: 'tok-1', version: '0.9.0', startedAt: 1760000000000}

describe('discovery file', () => {
	it('is named control.json', () => {
		expect(CONTROL_DISCOVERY_FILE_NAME).toBe('control.json')
	})

	it('names the socket, the token, the app version and when the app started', () => {
		expect(controlDiscoverySchema.parse(discovery)).toEqual(discovery)
		expect(controlDiscoverySchema.parse({...discovery, socketPath: '\\\\.\\pipe\\arroxy-control-501'}).socketPath).toBe('\\\\.\\pipe\\arroxy-control-501')
	})

	it('carries no pid, and drops unknown fields so a later app can add some', () => {
		const parsed = controlDiscoverySchema.parse({...discovery, pid: 2, addedLater: true})
		expect(parsed).toEqual(discovery)
		expect(parsed).not.toHaveProperty('pid')
	})

	it('refuses a missing or empty field and a start time that is not epoch milliseconds', () => {
		for (const key of ['socketPath', 'token', 'version', 'startedAt'] as const) {
			const {[key]: _dropped, ...rest} = discovery
			expect(controlDiscoverySchema.safeParse(rest).success).toBe(false)
		}
		expect(controlDiscoverySchema.safeParse({...discovery, token: ''}).success).toBe(false)
		expect(controlDiscoverySchema.safeParse({...discovery, socketPath: ''}).success).toBe(false)
		expect(controlDiscoverySchema.safeParse({...discovery, startedAt: -1}).success).toBe(false)
		expect(controlDiscoverySchema.safeParse({...discovery, startedAt: 1.5}).success).toBe(false)
	})
})
