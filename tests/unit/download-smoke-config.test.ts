import {describe, expect, it} from 'vitest'
import {applyDownloadSmokeOverrides, readDownloadSmokeConfig, type DownloadSmokeConfig} from '@main/downloadSmokeConfig.js'
import {defaultAppSettings} from '@shared/constants.js'
import type {AppSettings} from '@shared/types.js'

const URL = 'https://www.youtube.com/watch?v=z1NNgSu8hTI'

describe('readDownloadSmokeConfig', () => {
	it('returns null unless ARROXY_SMOKE_KIND=download', () => {
		expect(readDownloadSmokeConfig({ARROXY_SMOKE_URL: URL})).toBeNull()
	})

	it('defaults every override to settings/production', () => {
		expect(readDownloadSmokeConfig({ARROXY_SMOKE_KIND: 'download', ARROXY_SMOKE_URL: URL})).toEqual({ok: true, config: {url: URL, cookies: {kind: 'settings'}, proxy: {kind: 'settings'}, profileId: null, youtubePlayerClients: null, timeoutMs: 180_000}})
	})

	it('parses every override', () => {
		const result = readDownloadSmokeConfig({ARROXY_SMOKE_KIND: 'download', ARROXY_SMOKE_URL: URL, ARROXY_SMOKE_COOKIES: 'browser:firefox', ARROXY_SMOKE_PROXY: 'http://127.0.0.1:10808', ARROXY_SMOKE_PROFILE: 'balanced', ARROXY_SMOKE_PLAYER_CLIENTS: 'default, web_embedded', ARROXY_SMOKE_TIMEOUT_MS: '60000'})
		expect(result).toEqual({ok: true, config: {url: URL, cookies: {kind: 'browser', browser: 'firefox'}, proxy: {kind: 'url', url: 'http://127.0.0.1:10808'}, profileId: 'balanced', youtubePlayerClients: ['default', 'web_embedded'], timeoutMs: 60_000}})
	})

	it('maps player clients "none" to an empty list and cookies file: to a path', () => {
		const result = readDownloadSmokeConfig({ARROXY_SMOKE_KIND: 'download', ARROXY_SMOKE_URL: URL, ARROXY_SMOKE_PLAYER_CLIENTS: 'none', ARROXY_SMOKE_COOKIES: 'file:C:\\cookies.txt', ARROXY_SMOKE_PROXY: 'off'})
		expect(result).toMatchObject({ok: true, config: {youtubePlayerClients: [], cookies: {kind: 'file', path: 'C:\\cookies.txt'}, proxy: {kind: 'off'}}})
	})

	it.each([
		[{}, /ARROXY_SMOKE_URL/],
		[{ARROXY_SMOKE_URL: 'https://vimeo.com/1'}, /YouTube/],
		[{ARROXY_SMOKE_URL: URL, ARROXY_SMOKE_COOKIES: 'browser:netscape'}, /ARROXY_SMOKE_COOKIES/],
		[{ARROXY_SMOKE_URL: URL, ARROXY_SMOKE_COOKIES: 'file:'}, /ARROXY_SMOKE_COOKIES/],
		[{ARROXY_SMOKE_URL: URL, ARROXY_SMOKE_PLAYER_CLIENTS: ' , '}, /ARROXY_SMOKE_PLAYER_CLIENTS/],
		[{ARROXY_SMOKE_URL: URL, ARROXY_SMOKE_TIMEOUT_MS: '-5'}, /ARROXY_SMOKE_TIMEOUT_MS/],
		[{ARROXY_SMOKE_URL: URL, ARROXY_SMOKE_TIMEOUT_MS: '2147483648'}, /ARROXY_SMOKE_TIMEOUT_MS/]
	])('rejects invalid input %#', (env, message) => {
		const result = readDownloadSmokeConfig({ARROXY_SMOKE_KIND: 'download', ...env})
		expect(result?.ok).toBe(false)
		if (result && !result.ok) expect(result.error).toMatch(message)
	})
})

describe('applyDownloadSmokeOverrides', () => {
	const defaults = defaultAppSettings('/downloads')
	const base: AppSettings = {...defaults, common: {...defaults.common, cookiesMode: 'file', cookiesPath: '/c.txt', cookiesBrowser: 'chrome', proxyUrl: 'http://p:1'}}
	const cfg = (patch: Partial<DownloadSmokeConfig>): DownloadSmokeConfig => ({url: URL, cookies: {kind: 'settings'}, proxy: {kind: 'settings'}, profileId: null, youtubePlayerClients: null, timeoutMs: 1, ...patch})

	it('leaves settings untouched when nothing is overridden', () => {
		expect(applyDownloadSmokeOverrides(base, cfg({}))).toEqual(base)
	})

	it('applies cookies and proxy overrides without mutating the input', () => {
		const out = applyDownloadSmokeOverrides(base, cfg({cookies: {kind: 'browser', browser: 'firefox'}, proxy: {kind: 'off'}}))
		expect(out.common).toMatchObject({cookiesMode: 'browser', cookiesBrowser: 'firefox', proxyUrl: ''})
		expect(base.common.cookiesMode).toBe('file')
	})

	it('maps cookies off and a cookies file', () => {
		expect(applyDownloadSmokeOverrides(base, cfg({cookies: {kind: 'off'}})).common.cookiesMode).toBe('off')
		expect(applyDownloadSmokeOverrides(base, cfg({cookies: {kind: 'file', path: '/other.txt'}, proxy: {kind: 'url', url: 'http://q:2'}})).common).toMatchObject({cookiesMode: 'file', cookiesPath: '/other.txt', proxyUrl: 'http://q:2'})
	})
})
