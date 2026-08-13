import {describe, expect, it} from 'vitest'
import {defaultAppSettings, NETWORK_PACING_PRESET_VALUES} from '@shared/constants.js'
import {resolveNetworkPacing} from '@shared/networkPacing.js'
import type {CommonSettings} from '@shared/types.js'

function common(overrides: Partial<CommonSettings> = {}): CommonSettings {
	return {...defaultAppSettings('/tmp').common, ...overrides}
}

describe('resolveNetworkPacing', () => {
	it('applies download connections under every preset, not just custom', () => {
		for (const preset of ['off', 'balanced', 'careful', 'custom'] as const) {
			const resolved = resolveNetworkPacing(common({networkPacingPreset: preset, downloadConnections: 8}))
			expect(resolved.concurrentFragments, `preset ${preset}`).toBe(8)
		}
	})

	it('leaves connections unset when the setting is off, under every preset', () => {
		for (const preset of ['off', 'balanced', 'careful', 'custom'] as const) {
			const unset = resolveNetworkPacing(common({networkPacingPreset: preset}))
			expect(unset.concurrentFragments, `preset ${preset} unset`).toBeUndefined()
			const zero = resolveNetworkPacing(common({networkPacingPreset: preset, downloadConnections: 0}))
			expect(zero.concurrentFragments, `preset ${preset} zero`).toBe(0)
		}
	})

	it('keeps preset sleep values intact while connections vary', () => {
		const resolved = resolveNetworkPacing(common({networkPacingPreset: 'careful', downloadConnections: 4}))
		const {sleepRequests, sleepInterval, maxSleepInterval, sleepSubtitles} = NETWORK_PACING_PRESET_VALUES.careful
		expect(resolved).toMatchObject({sleepRequests, sleepInterval, maxSleepInterval, sleepSubtitles})
	})

	it('reads custom sleep fields only when the preset is custom', () => {
		const custom = resolveNetworkPacing(common({networkPacingPreset: 'custom', pacingSleepRequests: 7}))
		expect(custom.sleepRequests).toBe(7)
		const balanced = resolveNetworkPacing(common({networkPacingPreset: 'balanced', pacingSleepRequests: 7}))
		expect(balanced.sleepRequests).toBe(NETWORK_PACING_PRESET_VALUES.balanced.sleepRequests)
	})

	it('falls back to the balanced preset when settings are absent', () => {
		expect(resolveNetworkPacing(undefined)).toMatchObject(NETWORK_PACING_PRESET_VALUES.balanced)
		expect(resolveNetworkPacing(null).concurrentFragments).toBeUndefined()
	})

	it('drops connections from the preset tables entirely', () => {
		for (const preset of ['off', 'balanced', 'careful'] as const) {
			expect(NETWORK_PACING_PRESET_VALUES[preset]).not.toHaveProperty('concurrentFragments')
		}
	})
})
