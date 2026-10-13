import {describe, expect, it} from 'vitest'
import {BLAND_UA_TOKEN, blandUserAgent} from '@main/utils/blandUserAgent.js'

// Electron's default UA on each platform: real OS, real Chromium, plus the
// app-name and Electron tokens that give the embedder away.
const MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Arroxy/0.4.25 Chrome/150.0.7871.250 Electron/43.7.7 Safari/537.36'
const WIN = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Arroxy/0.4.25 Chrome/150.0.7871.250 Electron/43.7.7 Safari/537.36'
const LINUX = 'Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 (KHTML, like Gecko) Arroxy/0.4.25 Chrome/150.0.7871.250 Electron/43.7.7 Safari/537.36'

describe('blandUserAgent', () => {
	it('swaps the app-name and Electron tokens for the bland token on every platform', () => {
		expect(blandUserAgent(MAC, 'Arroxy')).toBe('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.7871.250 Desktop/1.0 Safari/537.36')
		expect(blandUserAgent(WIN, 'Arroxy')).toBe('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.7871.250 Desktop/1.0 Safari/537.36')
		expect(blandUserAgent(LINUX, 'Arroxy')).toBe('Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.7871.250 Desktop/1.0 Safari/537.36')
	})

	it('defaults to the Desktop/1.0 token', () => {
		expect(BLAND_UA_TOKEN).toBe('Desktop/1.0')
	})

	it('matches the app name case-insensitively, as Electron reports it in dev and packaged builds', () => {
		expect(blandUserAgent(MAC.replace('Arroxy/', 'arroxy/'), 'Arroxy')).not.toMatch(/arroxy\//i)
	})

	it('treats regex characters in the app name literally', () => {
		const ua = MAC.replace('Arroxy/0.4.25', 'My.App+/1.0')
		expect(blandUserAgent(ua, 'My.App+')).not.toContain('My.App+/')
		expect(blandUserAgent(MAC, 'A.r')).toContain('Arroxy/0.4.25')
	})

	it('removes the Electron token even when the app is still named Electron (unpackaged dev runs)', () => {
		const dev = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.7871.250 Electron/43.7.7 Safari/537.36'
		expect(blandUserAgent(dev, 'Electron')).toBe('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.7871.250 Desktop/1.0 Safari/537.36')
	})

	it('appends the token when there is no Safari token to insert it before', () => {
		expect(blandUserAgent('Mozilla/5.0 Chrome/150.0.0.0 Electron/43.7.7', 'Arroxy', 'Desktop/1.0')).toBe('Mozilla/5.0 Chrome/150.0.0.0 Desktop/1.0')
	})
})
