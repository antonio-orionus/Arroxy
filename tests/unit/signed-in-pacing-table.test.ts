// @vitest-environment node
import {describe, expect, it} from 'vite-plus/test'
import {signedInPacingFor} from '@shared/sites/signedInPacing.js'

const MINUTE = 60_000

describe('signedInPacingFor: the site table', () => {
	it('gives a site with no row of its own the generous defaults', () => {
		expect(signedInPacingFor('vimeo.com', 'balanced')).toEqual({atOnce: 2, spacingMs: 5000, jitterMs: 2000, windowMs: 60 * MINUTE, perWindow: 120, entriesPerLaunch: 50})
		expect(signedInPacingFor('youtube', 'balanced')).toEqual(signedInPacingFor('vimeo.com', 'balanced'))
	})

	it('paces Instagram and X by their own windows', () => {
		expect(signedInPacingFor('instagram', 'balanced')).toMatchObject({atOnce: 2, spacingMs: 8000, windowMs: 11 * MINUTE, perWindow: 11, entriesPerLaunch: 12})
		expect(signedInPacingFor('x', 'balanced')).toMatchObject({atOnce: 2, spacingMs: 5000, windowMs: 15 * MINUTE, perWindow: 30, entriesPerLaunch: 20})
	})
})

describe('signedInPacingFor: the Pacing preset', () => {
	it('keeps the site defaults under Off, which never removes the account protection', () => {
		expect(signedInPacingFor('instagram', 'off')).toEqual(signedInPacingFor('instagram', 'balanced'))
	})

	it('halves the launches per window and doubles the spacing under Careful', () => {
		expect(signedInPacingFor('instagram', 'careful')).toMatchObject({spacingMs: 16_000, jitterMs: 4000, windowMs: 11 * MINUTE, perWindow: 6})
		expect(signedInPacingFor('x', 'careful')).toMatchObject({spacingMs: 10_000, perWindow: 15})
	})

	it('scales by the signed-in pace under Custom, 100 % when unset', () => {
		expect(signedInPacingFor('x', 'custom')).toEqual(signedInPacingFor('x', 'balanced'))
		expect(signedInPacingFor('x', 'custom', 50)).toEqual(signedInPacingFor('x', 'careful'))
		expect(signedInPacingFor('x', 'custom', 200)).toMatchObject({spacingMs: 2500, perWindow: 60})
	})

	it('always allows at least one launch per window', () => {
		expect(signedInPacingFor('instagram', 'custom', 1).perWindow).toBe(1)
	})
})
