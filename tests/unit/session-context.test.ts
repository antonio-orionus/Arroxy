import {describe, expect, it} from 'vitest'
import {describeSessionContext} from '@main/utils/sessionContext.js'
import {defaultAppSettings} from '@shared/constants.js'

const runtime = {appVersion: '0.4.14', electronVersion: '43.4.0', platform: 'win32', arch: 'x64'}

// Everything a log reader needs to interpret the lines that follow it, written
// at session start and again at the top of every rotated file.
describe('describeSessionContext', () => {
	it('carries runtime facts, network settings and the last token warm-up', () => {
		const base = defaultAppSettings('/downloads')
		const settings = {...base, common: {...base.common, cookiesMode: 'browser' as const, cookiesBrowser: 'firefox' as const, proxyUrl: 'http://user:secret@127.0.0.1:10808'}}

		expect(describeSessionContext(runtime, settings, {ready: false, reason: 'YouTube failed to load: ERR_ADDRESS_INVALID (-108)', at: '2026-09-14T01:00:00.000Z'})).toEqual({
			...runtime,
			cookiesMode: 'browser',
			cookiesBrowser: 'firefox',
			proxy: 'http://***:***@127.0.0.1:10808',
			activeProfile: base.profiles.active,
			tokenWarmUp: {ready: false, reason: 'YouTube failed to load: ERR_ADDRESS_INVALID (-108)', at: '2026-09-14T01:00:00.000Z'}
		})
	})

	it('says plainly when settings or the warm-up are not available yet', () => {
		expect(describeSessionContext(runtime, null, null)).toEqual({...runtime, settings: 'not-loaded', tokenWarmUp: 'not-run'})
	})
})
