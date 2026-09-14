import {describe, expect, it} from 'vitest'
import {parseProxySetting, proxyForLog} from '@main/utils/proxyUrl.js'

describe('proxyForLog', () => {
	it('gives no proxy as null, an unusable one as a marker, and a proxy without credentials', () => {
		expect(proxyForLog(parseProxySetting(''))).toBeNull()
		expect(proxyForLog(parseProxySetting('ftp://proxy.example:21'))).toBe('<invalid>')
		expect(proxyForLog(parseProxySetting('http://user:secret@10.0.0.1:3128'))).toBe('http://***:***@10.0.0.1:3128')
	})
})

describe('parseProxySetting', () => {
	it('treats a missing or blank value as no proxy', () => {
		expect(parseProxySetting(undefined)).toEqual({kind: 'none'})
		expect(parseProxySetting('   ')).toEqual({kind: 'none'})
	})

	// yt-dlp prefixes a scheme-less proxy with http:// (utils/networking.py
	// clean_proxies), so a value that works for downloads must work here too.
	it('reads a scheme-less host:port as an http proxy', () => {
		expect(parseProxySetting('127.0.0.1:10808')).toEqual({kind: 'proxy', url: 'http://127.0.0.1:10808', chromiumRules: 'http://127.0.0.1:10808', credentials: null, redacted: 'http://127.0.0.1:10808'})
	})

	it('keeps credentials out of the Chromium rules and the log form', () => {
		expect(parseProxySetting(' http://us%40er:p%3Ass@proxy.example:3128 ')).toEqual({kind: 'proxy', url: 'http://us%40er:p%3Ass@proxy.example:3128', chromiumRules: 'http://proxy.example:3128', credentials: {username: 'us@er', password: 'p:ss'}, redacted: 'http://***:***@proxy.example:3128'})
	})

	it('keeps socks5 and maps socks5h to the scheme Chromium understands', () => {
		expect(parseProxySetting('socks5://127.0.0.1:1080')).toMatchObject({kind: 'proxy', url: 'socks5://127.0.0.1:1080', chromiumRules: 'socks5://127.0.0.1:1080'})
		expect(parseProxySetting('socks5h://127.0.0.1:1080')).toMatchObject({kind: 'proxy', url: 'socks5h://127.0.0.1:1080', chromiumRules: 'socks5://127.0.0.1:1080'})
	})

	// URL keeps a stray `%` in userinfo as-is, but decoding it throws. That has to
	// read as an unusable setting, not escape into the token window or yt-dlp run.
	it('rejects credentials with malformed percent escapes instead of throwing', () => {
		expect(parseProxySetting('http://user%:secret@127.0.0.1:8080')).toEqual({kind: 'invalid'})
		expect(parseProxySetting('http://user:pass%zz@127.0.0.1:8080')).toEqual({kind: 'invalid'})
	})

	it('rejects values that are not a usable proxy', () => {
		expect(parseProxySetting('ftp://proxy.example:21')).toEqual({kind: 'invalid'})
		expect(parseProxySetting('http://')).toEqual({kind: 'invalid'})
		expect(parseProxySetting('not a proxy')).toEqual({kind: 'invalid'})
	})
})
