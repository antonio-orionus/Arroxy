// @vitest-environment node

import {describe, expect, it} from 'vite-plus/test'
import {toNetscapeJar} from '@main/services/netscapeCookieJar.js'
import type {ExploreCookie} from '@shared/sites/types.js'

const base: ExploreCookie = {name: 'n', value: 'v', domain: '.youtube.com', hostOnly: false, path: '/', secure: true, httpOnly: false, session: false, expirationDate: 1893456000.7}

describe('toNetscapeJar', () => {
	it('starts with the Netscape header and writes tab-separated fields', () => {
		expect(toNetscapeJar([base], ['youtube.com'])).toBe('# Netscape HTTP Cookie File\n.youtube.com\tTRUE\t/\tTRUE\t1893456000\tn\tv\n')
	})

	it('writes host-only cookies without a leading dot and include-subdomains FALSE', () => {
		const line = toNetscapeJar([{...base, domain: 'www.youtube.com', hostOnly: true}], ['youtube.com']).split('\n')[1]
		expect(line.startsWith('www.youtube.com\tFALSE\t')).toBe(true)
	})

	it('prefixes HttpOnly cookies the way yt-dlp reads them', () => {
		expect(
			toNetscapeJar([{...base, httpOnly: true}], ['youtube.com'])
				.split('\n')[1]
				.startsWith('#HttpOnly_.youtube.com\t')
		).toBe(true)
	})

	it('writes session cookies with expiry 0', () => {
		expect(
			toNetscapeJar([{...base, session: true, expirationDate: undefined}], ['youtube.com'])
				.split('\n')[1]
				.split('\t')[4]
		).toBe('0')
	})

	it('keeps __Secure- and __Host- names verbatim', () => {
		const jar = toNetscapeJar(
			[
				{...base, name: '__Secure-3PSID'},
				{...base, name: '__Host-X', domain: 'www.youtube.com', hostOnly: true}
			],
			['youtube.com']
		)
		expect(jar).toContain('\t__Secure-3PSID\t')
		expect(jar).toContain('\t__Host-X\t')
	})

	it('drops cookies outside the allowed domains, including google.com session cookies', () => {
		const jar = toNetscapeJar([base, {...base, domain: '.google.com', name: 'SID'}, {...base, domain: 'accounts.google.com', hostOnly: true, name: 'LSID'}, {...base, domain: '.notyoutube.com', name: 'X'}], ['youtube.com'])
		expect(jar.split('\n').filter(Boolean)).toHaveLength(2)
		expect(jar).not.toContain('google.com')
		expect(jar).not.toContain('notyoutube')
	})

	it('drops a look-alike domain that merely starts with the allowed one', () => {
		const jar = toNetscapeJar([base, {...base, domain: '.youtube.com.evil.com', name: 'SAPISID'}, {...base, domain: 'youtube.com.evil.com', hostOnly: true, name: 'LOGIN_INFO'}], ['youtube.com'])
		expect(jar.split('\n').filter(Boolean)).toHaveLength(2)
		expect(jar).not.toContain('evil')
	})

	it('drops a cookie whose domain carries a control character, even one ending in the allowed domain', () => {
		const jar = toNetscapeJar([base, {...base, domain: 'x\n.youtube.com', name: 'SAPISID'}, {...base, domain: 'x\t.youtube.com', name: 'SID'}], ['youtube.com'])
		expect(jar.split('\n').filter(Boolean)).toHaveLength(2)
		expect(jar).not.toContain('SAPISID')
		expect(jar).not.toContain('\tSID\t')
	})
})

describe('toNetscapeJar control characters and non-finite expiry', () => {
	const fields = (jar: string): string[][] =>
		jar
			.split('\n')
			.filter(line => line && !line.startsWith('#'))
			.map(line => line.split('\t'))

	it('omits a cookie whose value contains a newline (forged-line risk) and keeps a normal cookie in the same call', () => {
		const forged = {...base, name: 'bad', value: 'x\n.youtube.com\tTRUE\t/\tFALSE\t0\tfake\ty'}
		const jar = toNetscapeJar([forged, {...base, name: 'good', value: 'ok'}], ['youtube.com'])
		expect(fields(jar)).toEqual([['.youtube.com', 'TRUE', '/', 'TRUE', '1893456000', 'good', 'ok']])
		expect(jar).not.toContain('fake')
	})

	it('omits a cookie whose name contains a tab and keeps a normal cookie in the same call', () => {
		const jar = toNetscapeJar(
			[
				{...base, name: 'a\tb'},
				{...base, name: 'good', value: 'ok'}
			],
			['youtube.com']
		)
		expect(fields(jar).map(f => f[5])).toEqual(['good'])
		expect(jar).not.toContain('a\tb')
	})

	it('omits a cookie whose path contains a carriage return', () => {
		const jar = toNetscapeJar(
			[
				{...base, path: '/x\rinjected'},
				{...base, name: 'good'}
			],
			['youtube.com']
		)
		expect(fields(jar).map(f => f[5])).toEqual(['good'])
		expect(jar).not.toContain('injected')
	})

	it('writes a NaN expirationDate as expiry 0', () => {
		expect(fields(toNetscapeJar([{...base, expirationDate: Number.NaN}], ['youtube.com']))[0][4]).toBe('0')
	})

	it('writes an Infinity expirationDate as expiry 0', () => {
		expect(fields(toNetscapeJar([{...base, expirationDate: Number.POSITIVE_INFINITY}], ['youtube.com']))[0][4]).toBe('0')
	})
})
