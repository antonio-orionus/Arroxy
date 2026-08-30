import {describe, expect, it} from 'vitest'
import {assetNameFor, previousStableTag} from '../../scripts/startup/fetchPreviousRelease.js'

describe('previousStableTag', () => {
	const tags = ['v0.4.3', 'v0.4.4', 'v0.4.5', 'v0.4.6', 'v0.4.7', 'v0.4.8-beta.1']

	it('picks the highest stable tag below the current version', () => {
		expect(previousStableTag(tags, 'v0.4.8')).toBe('v0.4.7')
	})

	it('ignores pre-release tags when choosing the predecessor', () => {
		expect(previousStableTag(tags, 'v0.4.8-beta.2')).toBe('v0.4.7')
	})

	it('returns null when there is no earlier stable release', () => {
		expect(previousStableTag(['v0.1.0'], 'v0.1.0')).toBeNull()
	})
})

describe('assetNameFor', () => {
	it('uses the portable form per platform so no installer is required', () => {
		expect(assetNameFor('linux', 'x64')).toMatch(/AppImage$/)
		expect(assetNameFor('darwin', 'arm64')).toMatch(/\.dmg$/)
		expect(assetNameFor('win32', 'x64')).toMatch(/Portable\.exe$/)
	})
})
