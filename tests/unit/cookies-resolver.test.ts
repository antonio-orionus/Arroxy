import {describe, expect, it} from 'vitest'
import {resolveCookies} from '@main/services/cookiesResolver.js'
import {defaultAppSettings} from '@shared/constants.js'
import type {AppSettings} from '@shared/types.js'

function settings(common: Partial<AppSettings['common']>): AppSettings {
	const base = defaultAppSettings('/tmp')
	return {...base, common: {...base.common, rememberLastOutputDir: true, clipboardWatchEnabled: false, ...common}}
}

describe('resolveCookies', () => {
	it('returns null when mode is off', () => {
		expect(resolveCookies(settings({cookiesMode: 'off', cookiesPath: '/x.txt', cookiesBrowser: 'firefox'}))).toBeNull()
	})

	it('returns null when mode is undefined', () => {
		expect(resolveCookies(settings({cookiesPath: '/x.txt'}))).toBeNull()
	})

	it('returns file variant when mode=file and path is non-empty', () => {
		expect(resolveCookies(settings({cookiesMode: 'file', cookiesPath: '/x.txt'}))).toEqual({kind: 'file', path: '/x.txt'})
	})

	it('returns null when mode=file but path is empty', () => {
		expect(resolveCookies(settings({cookiesMode: 'file', cookiesPath: ''}))).toBeNull()
		expect(resolveCookies(settings({cookiesMode: 'file'}))).toBeNull()
	})

	it('returns browser variant when mode=browser and browser is set', () => {
		expect(resolveCookies(settings({cookiesMode: 'browser', cookiesBrowser: 'firefox'}))).toEqual({kind: 'browser', browser: 'firefox'})
	})

	it('returns null when mode=browser but browser is unset', () => {
		expect(resolveCookies(settings({cookiesMode: 'browser'}))).toBeNull()
	})

	it('ignores path when mode=browser', () => {
		expect(resolveCookies(settings({cookiesMode: 'browser', cookiesBrowser: 'chrome', cookiesPath: '/x.txt'}))).toEqual({kind: 'browser', browser: 'chrome'})
	})
})
