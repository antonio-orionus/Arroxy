import {readFileSync} from 'node:fs'
import {describe, expect, it, vi} from 'vitest'
import * as ts from 'typescript'

import {BridgeUnavailableError, ensureAppBridge} from '@renderer/bootstrapBridge.js'
import {parseBrowserMockLaunchMode} from '@renderer/browserMock.js'

function hasPreMountSettingsRead(sourceText: string): boolean {
	const sourceFile = ts.createSourceFile('main.tsx', sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
	let firstRenderStart = Number.POSITIVE_INFINITY
	let found = false

	const isWindowSettingsGet = (node: ts.CallExpression): boolean => {
		if (!ts.isPropertyAccessExpression(node.expression) || node.expression.name.text !== 'get') return false
		const owner = node.expression.expression
		const appApi = ts.isPropertyAccessExpression(owner) && owner.name.text === 'settings' ? owner.expression : null
		return Boolean(appApi && ts.isPropertyAccessExpression(appApi) && appApi.name.text === 'appApi' && ts.isIdentifier(appApi.expression) && appApi.expression.text === 'window')
	}

	const findFirstRender = (node: ts.Node): void => {
		if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === 'render') {
			firstRenderStart = Math.min(firstRenderStart, node.getStart(sourceFile))
		}
		ts.forEachChild(node, findFirstRender)
	}

	const visitSettingsReads = (node: ts.Node): void => {
		if (found) return
		if (ts.isCallExpression(node) && isWindowSettingsGet(node)) {
			found = node.getStart(sourceFile) < firstRenderStart
			if (found) return
		}
		ts.forEachChild(node, visitSettingsReads)
	}

	findFirstRender(sourceFile)
	visitSettingsReads(sourceFile)
	return found
}

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

	it('does not block React mounting on settings reads', () => {
		const entrypoint = readFileSync(new URL('../../src/renderer/src/main.tsx', import.meta.url), 'utf8')

		expect(hasPreMountSettingsRead(entrypoint)).toBe(false)
	})

	it('only flags settings reads before the first render call', () => {
		expect(
			hasPreMountSettingsRead(`
				const root = createRoot(element)
				root.render(<App />)
				void window.appApi.settings.get()
			`)
		).toBe(false)
		expect(
			hasPreMountSettingsRead(`
				await window.appApi.settings.get()
				const root = createRoot(element)
				root.render(<App />)
			`)
		).toBe(true)
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
