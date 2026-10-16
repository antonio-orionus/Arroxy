import {describe, expect, it} from 'vite-plus/test'
import {validateUaToken} from '@shared/exploreUserAgent.js'

describe('validateUaToken', () => {
	it.each(['Desktop/1.0', 'WebView/2', 'QtWebEngine/6.11.2'])('accepts %s', token => expect(validateUaToken(token)).toBe(token))
	it.each([
		'Mozilla/5.0 (Macintosh) Chrome/150 Safari/537.36',
		'Chrome/150.0',
		'Firefox/140',
		'Safari/605',
		'Edg/150',
		'OPR/120',
		'Brave/1',
		'Electron/43.7.7',
		'Arroxy/0.4.25',
		'Gecko/20100101',
		'AppleWebKit/537.36',
		'CriOS/120',
		'FxiOS/120',
		'Vivaldi/6',
		'HeadlessChrome/1',
		'Mobile/15E148',
		'Chromium/150',
		'Version/17',
		'Desktop',
		'',
		42,
		null
	])('rejects %s', raw => expect(validateUaToken(raw)).toBeNull())
	it('matches banned names case-insensitively and inside longer names', () => {
		expect(validateUaToken('mobilesafari/1')).toBeNull()
		expect(validateUaToken('MyChromeThing/1')).toBeNull()
	})
})
