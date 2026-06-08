import {EventEmitter} from 'node:events'
import {describe, expect, it, vi} from 'vitest'

import {registerPreloadDiagnostics} from '@main/preloadDiagnostics.js'

class FakeWebContents extends EventEmitter {
	executeJavaScript = vi.fn()
}

function makeLogger() {
	return {info: vi.fn(), warn: vi.fn(), error: vi.fn()}
}

describe('preload diagnostics', () => {
	it('logs serialized preload-error events', () => {
		const webContents = new FakeWebContents()
		const logger = makeLogger()
		const preloadPath = '/app/out/preload/index.cjs'
		const fileExists = vi.fn().mockReturnValue(true)

		registerPreloadDiagnostics({webContents} as never, preloadPath, logger, {fileExists})
		const error = new Error('preload exploded')
		Object.assign(error, {code: 'MODULE_NOT_FOUND'})
		webContents.emit('preload-error', {}, preloadPath, error)

		expect(fileExists).toHaveBeenCalledWith(preloadPath)
		expect(logger.info).toHaveBeenCalledWith('Preload path resolved', {preloadPath, exists: true})
		expect(logger.error).toHaveBeenCalledWith('Preload script failed', {preloadPath, error: expect.objectContaining({name: 'Error', message: 'preload exploded', stack: expect.stringContaining('preload exploded'), code: 'MODULE_NOT_FOUND'})})
	})

	it('logs renderer load failures', () => {
		const webContents = new FakeWebContents()
		const logger = makeLogger()
		const preloadPath = '/app/out/preload/index.cjs'

		registerPreloadDiagnostics({webContents} as never, preloadPath, logger, {fileExists: () => true})
		webContents.emit('did-fail-load', {}, -6, 'ERR_FILE_NOT_FOUND', 'file:///app/out/renderer/index.html', true, 12, 34)

		expect(logger.error).toHaveBeenCalledWith('Renderer failed to load', {errorCode: -6, errorDescription: 'ERR_FILE_NOT_FOUND', validatedURL: 'file:///app/out/renderer/index.html', isMainFrame: true, frameProcessId: 12, frameRoutingId: 34})
	})

	it('forwards startup console warnings and errors', () => {
		const webContents = new FakeWebContents()
		webContents.executeJavaScript.mockResolvedValue({hasAppApi: true, hasPlatform: true, appVersion: '0.3.2', appApiKeys: ['settings']})
		const logger = makeLogger()
		const preloadPath = '/app/out/preload/index.cjs'

		registerPreloadDiagnostics({webContents} as never, preloadPath, logger, {fileExists: () => true})
		webContents.emit('console-message', {}, 2, 'renderer warning', 10, 'file:///renderer.js')
		webContents.emit('console-message', {}, 3, 'renderer error', 11, 'file:///renderer.js')

		expect(logger.warn).toHaveBeenCalledWith('Renderer startup console warning', {level: 2, message: 'renderer warning', line: 10, sourceId: 'file:///renderer.js'})
		expect(logger.error).toHaveBeenCalledWith('Renderer startup console error', {level: 3, message: 'renderer error', line: 11, sourceId: 'file:///renderer.js'})
	})

	it('logs successful bridge probe details', async () => {
		const webContents = new FakeWebContents()
		webContents.executeJavaScript.mockResolvedValue({hasAppApi: true, hasPlatform: true, appVersion: '0.3.2', appApiKeys: ['settings', 'window']})
		const logger = makeLogger()
		const preloadPath = '/app/out/preload/index.cjs'

		registerPreloadDiagnostics({webContents} as never, preloadPath, logger, {fileExists: () => true})
		webContents.emit('did-finish-load')
		await Promise.resolve()

		expect(webContents.executeJavaScript).toHaveBeenCalledWith(expect.stringContaining('appApiKeys'))
		expect(logger.info).toHaveBeenCalledWith('Preload bridge verified', {preloadPath, bridge: {hasAppApi: true, hasPlatform: true, appVersion: '0.3.2', appApiKeys: ['settings', 'window']}})
	})

	it('logs when the renderer finishes loading without window.appApi', async () => {
		const webContents = new FakeWebContents()
		webContents.executeJavaScript.mockResolvedValue({hasAppApi: false, hasPlatform: false, appVersion: null, appApiKeys: []})
		const logger = makeLogger()
		const preloadPath = '/app/out/preload/index.cjs'

		registerPreloadDiagnostics({webContents} as never, preloadPath, logger, {fileExists: () => true})
		webContents.emit('did-finish-load')
		await Promise.resolve()

		expect(webContents.executeJavaScript).toHaveBeenCalledWith(expect.stringContaining('appApiKeys'))
		expect(logger.error).toHaveBeenCalledWith('Preload bridge missing after renderer load', {preloadPath, bridge: {hasAppApi: false, hasPlatform: false, appVersion: null, appApiKeys: []}})
	})
})
