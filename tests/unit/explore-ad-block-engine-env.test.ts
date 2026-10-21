// @vitest-environment node
import {afterEach, describe, expect, it, vi} from 'vite-plus/test'

const FLAG = 'ELECTRON_DISABLE_SECURITY_WARNINGS'

// The library's module sets ELECTRON_DISABLE_SECURITY_WARNINGS in process.env
// when it is evaluated. Stubbed here so the side effect happens exactly when
// the loader imports it — never earlier, from this file's own imports.
vi.mock('@ghostery/adblocker-electron', () => {
	process.env[FLAG] = 'true'
	return {ElectronBlocker: {parse: (filters: string) => ({filters})}}
})

const before = process.env[FLAG]

afterEach(() => {
	if (before === undefined) Reflect.deleteProperty(process.env, FLAG)
	else process.env[FLAG] = before
})

describe('loading the ad blocker library', () => {
	it('puts back the environment flag its module sets when it loads', async () => {
		Reflect.deleteProperty(process.env, FLAG)
		const {loadFilterListEngine} = await import('@main/services/explore/exploreAdBlockEngine.js')

		await loadFilterListEngine('||ads.example^', [])

		expect(process.env[FLAG]).toBeUndefined()
	})
})
