// @vitest-environment jsdom
import {afterEach, describe, expect, it, vi} from 'vite-plus/test'
import {systemLanguage} from '@renderer/systemLanguage.js'

describe('systemLanguage', () => {
	const realRuntime = window.runtimeInfo

	afterEach(() => {
		window.runtimeInfo = realRuntime
		vi.restoreAllMocks()
	})

	it('uses the language main picked over the browser language', () => {
		vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US')
		window.runtimeInfo = {...realRuntime, systemLanguage: 'km'}
		expect(systemLanguage()).toBe('km')
	})

	it('falls back to en for a value main never sends', () => {
		vi.spyOn(navigator, 'language', 'get').mockReturnValue('de-DE')
		window.runtimeInfo = {...realRuntime, systemLanguage: 'tlh'}
		expect(systemLanguage()).toBe('en')
	})

	it('reads the browser language only when main passed none (browser-mock)', () => {
		vi.spyOn(navigator, 'language', 'get').mockReturnValue('de-DE')
		window.runtimeInfo = {...realRuntime, systemLanguage: null}
		expect(systemLanguage()).toBe('de')
	})
})
