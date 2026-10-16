// @vitest-environment node
import {describe, expect, it, vi} from 'vite-plus/test'
import {defaultAppSettings} from '@shared/constants.js'
import type {AppSettings, CommonSettings} from '@shared/types.js'
import {createExploreGate, identityFor} from '@main/services/exploreGate.js'

function settingsWith(common: Partial<CommonSettings>): AppSettings {
	const base = defaultAppSettings('/downloads')
	return {...base, common: {...base.common, ...common}}
}

function gateFor(common: Partial<CommonSettings>, signedIn = true) {
	const hasAuthCookies = vi.fn().mockResolvedValue(signedIn)
	const gate = createExploreGate({settings: {get: async () => settingsWith(common)}, session: {hasAuthCookies}})
	return {gate, hasAuthCookies}
}

describe('createExploreGate', () => {
	it('allows escalation in explore mode, with Explore enabled, a site that supports it, and a signed-in session', async () => {
		const {gate, hasAuthCookies} = gateFor({cookiesMode: 'explore'})
		await expect(gate.canEscalate('youtube')).resolves.toBe(true)
		expect(hasAuthCookies).toHaveBeenCalledWith('youtube')
	})

	it('allows escalation when exploreEnabled is explicitly true', async () => {
		await expect(gateFor({cookiesMode: 'explore', exploreEnabled: true}).gate.canEscalate('youtube')).resolves.toBe(true)
	})

	it.each(['off', 'file', 'browser'] as const)('refuses outside explore mode (%s)', async cookiesMode => {
		const {gate, hasAuthCookies} = gateFor({cookiesMode})
		await expect(gate.canEscalate('youtube')).resolves.toBe(false)
		expect(hasAuthCookies).not.toHaveBeenCalled()
	})

	it('refuses when no cookie mode is set', async () => {
		await expect(gateFor({}).gate.canEscalate('youtube')).resolves.toBe(false)
	})

	it('refuses when the Explore kill switch is off', async () => {
		const {gate, hasAuthCookies} = gateFor({cookiesMode: 'explore', exploreEnabled: false})
		await expect(gate.canEscalate('youtube')).resolves.toBe(false)
		expect(hasAuthCookies).not.toHaveBeenCalled()
	})

	it('refuses a site without the Explore capability', async () => {
		const {gate, hasAuthCookies} = gateFor({cookiesMode: 'explore'})
		await expect(gate.canEscalate('generic')).resolves.toBe(false)
		expect(hasAuthCookies).not.toHaveBeenCalled()
	})

	it('refuses when the session is signed out', async () => {
		await expect(gateFor({cookiesMode: 'explore'}, false).gate.canEscalate('youtube')).resolves.toBe(false)
	})

	it('reads settings live on every call', async () => {
		let common: Partial<CommonSettings> = {cookiesMode: 'explore'}
		const gate = createExploreGate({settings: {get: async () => settingsWith(common)}, session: {hasAuthCookies: async () => true}})
		await expect(gate.canEscalate('youtube')).resolves.toBe(true)
		common = {cookiesMode: 'off'}
		await expect(gate.canEscalate('youtube')).resolves.toBe(false)
	})
})

describe('identityFor', () => {
	it('maps a signed-in job to the Explore session and anything else to the configured identity', () => {
		expect(identityFor('exploreSession')).toBe('exploreSession')
		expect(identityFor('anonymous')).toBe('configured')
		expect(identityFor(undefined)).toBe('configured')
	})
})
