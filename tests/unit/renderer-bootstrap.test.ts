import {describe, expect, it, vi} from 'vitest'

import {BridgeUnavailableError, ensureAppBridge} from '@renderer/bootstrapBridge.js'
import {parseBrowserMockLaunchMode} from '@renderer/browserMock.js'

describe('renderer app bridge bootstrap', () => {
	it('uses the existing preload bridge without installing the browser mock', async () => {
		const installBrowserMock = vi.fn()

		await expect(ensureAppBridge({mode: 'production', userAgent: 'Mozilla/5.0 Electron/42.0.0', hasAppApi: () => true, installBrowserMock})).resolves.toBe('preload')

		expect(installBrowserMock).not.toHaveBeenCalled()
	})

	it('installs the browser mock in explicit browser-mock mode', async () => {
		let appApiInstalled = false
		const installBrowserMock = vi.fn(() => {
			appApiInstalled = true
		})

		await expect(ensureAppBridge({mode: 'browser-mock', userAgent: 'Mozilla/5.0 Chrome/148.0.0.0', hasAppApi: () => appApiInstalled, installBrowserMock})).resolves.toBe('browser-mock')

		expect(installBrowserMock).toHaveBeenCalledOnce()
	})

	it('still installs the browser mock in explicit browser-mock mode inside an Electron shell', async () => {
		let appApiInstalled = false
		const installBrowserMock = vi.fn(() => {
			appApiInstalled = true
		})

		await expect(ensureAppBridge({mode: 'browser-mock', userAgent: 'Mozilla/5.0 Arroxy/0.3.2 Electron/42.0.0', hasAppApi: () => appApiInstalled, installBrowserMock})).resolves.toBe('browser-mock')

		expect(installBrowserMock).toHaveBeenCalledOnce()
	})

	it('does not install the browser mock in normal Electron mode when the preload bridge is missing', async () => {
		const installBrowserMock = vi.fn()

		await expect(ensureAppBridge({mode: 'development', userAgent: 'Mozilla/5.0 Arroxy/0.3.2 Electron/42.0.0', hasAppApi: () => false, installBrowserMock})).rejects.toBeInstanceOf(BridgeUnavailableError)

		expect(installBrowserMock).not.toHaveBeenCalled()
	})
})

describe('browser mock launch mode', () => {
	it('defaults to ready so standalone browser tests boot into the app', () => {
		expect(parseBrowserMockLaunchMode('', null)).toBe('ready')
	})

	it('lets query params choose cold loading or cold error states', () => {
		expect(parseBrowserMockLaunchMode('?mockLaunch=cold-loading', null)).toBe('cold-loading')
		expect(parseBrowserMockLaunchMode('?mockLaunch=cold-error', null)).toBe('cold-error')
	})

	it('falls back to localStorage when no query override is present', () => {
		expect(parseBrowserMockLaunchMode('', 'cold-error')).toBe('cold-error')
	})
})
