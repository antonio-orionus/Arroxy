import {describe, expect, it, vi} from 'vitest'

import {applyChromiumSwitchesFromEnv, chromiumSwitchLogSummary, chromiumSwitchesForRuntime} from '@main/chromiumSwitches.js'

describe('applyChromiumSwitchesFromEnv', () => {
	it('applies whitespace-separated Chromium switches from the dev escape hatch', () => {
		const appendSwitch = vi.fn()

		applyChromiumSwitchesFromEnv({ARROXY_CHROMIUM_SWITCHES: 'disable-features=AudioServiceOutOfProcess,AutoplayIgnoreWebAudio no-pings'}, {appendSwitch})

		expect(appendSwitch).toHaveBeenNthCalledWith(1, 'disable-features', 'AudioServiceOutOfProcess,AutoplayIgnoreWebAudio')
		expect(appendSwitch).toHaveBeenNthCalledWith(2, 'no-pings', undefined)
		expect(appendSwitch).toHaveBeenCalledTimes(2)
	})

	it('ignores blank Chromium switch input', () => {
		const appendSwitch = vi.fn()

		applyChromiumSwitchesFromEnv({ARROXY_CHROMIUM_SWITCHES: '  '}, {appendSwitch})

		expect(appendSwitch).not.toHaveBeenCalled()
	})

	it('disables out-of-process Chromium audio service on macOS 26 and newer', () => {
		expect(chromiumSwitchesForRuntime({platform: 'darwin', release: '25.5.0'})).toEqual(['disable-features=AudioServiceOutOfProcess'])
		expect(chromiumSwitchesForRuntime({platform: 'darwin', release: '24.6.0'})).toEqual([])
		expect(chromiumSwitchesForRuntime({platform: 'linux', release: '6.8.0'})).toEqual([])
	})

	it('summarizes Chromium switches without leaking switch values', () => {
		expect(chromiumSwitchLogSummary(['proxy-server=https://token@internal.example', 'disable-features=AudioServiceOutOfProcess', 'no-pings'])).toEqual({switchNames: ['proxy-server', 'disable-features', 'no-pings'], count: 3})
	})
})
