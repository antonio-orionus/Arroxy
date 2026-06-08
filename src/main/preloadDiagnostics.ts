import fs from 'node:fs'
import path from 'node:path'
import type {BrowserWindow} from 'electron'
import log from 'electron-log/main.js'

interface Logger {
	info(message: string, meta?: unknown): void
	warn(message: string, meta?: unknown): void
	error(message: string, meta?: unknown): void
}

interface Options {
	fileExists?: (filePath: string) => boolean
}

interface SerializedError {
	name: string
	message: string
	stack?: string
	code?: unknown
	cause?: unknown
}

interface BridgeProbe {
	hasAppApi: boolean
	hasPlatform: boolean
	appVersion: string | null
	appApiKeys: string[]
}

const BRIDGE_PROBE_SCRIPT = `
(() => {
  const appApi = window.appApi;
  return {
    hasAppApi: typeof appApi === 'object' && appApi !== null,
    hasPlatform: typeof window.platform === 'string',
    appVersion: typeof window.appVersion === 'string' ? window.appVersion : null,
    appApiKeys: typeof appApi === 'object' && appApi !== null ? Object.keys(appApi).sort() : []
  };
})()
`

export function resolveMainWindowPreloadPath(mainDir: string): string {
	return path.join(mainDir, '../preload/index.cjs')
}

export function registerPreloadDiagnostics(window: BrowserWindow, preloadPath: string, logger: Logger = log, options: Options = {}): void {
	const fileExists = options.fileExists ?? fs.existsSync
	const exists = fileExists(preloadPath)
	logger.info('Preload path resolved', {preloadPath, exists})
	if (!exists) {
		logger.error('Preload script is missing', {preloadPath})
	}

	window.webContents.on('preload-error', (_event, failedPath: string, error: Error) => {
		logger.error('Preload script failed', {preloadPath: failedPath, error: serializeError(error)})
	})

	window.webContents.on('did-fail-load', (_event, errorCode: number, errorDescription: string, validatedURL: string, isMainFrame: boolean, frameProcessId: number, frameRoutingId: number) => {
		logger.error('Renderer failed to load', {errorCode, errorDescription, validatedURL, isMainFrame, frameProcessId, frameRoutingId})
	})

	const onConsoleMessage = (_event: unknown, level: number, message: string, line: number, sourceId: string): void => {
		if (level === 2) {
			logger.warn('Renderer startup console warning', {level, message, line, sourceId})
		} else if (level >= 3) {
			logger.error('Renderer startup console error', {level, message, line, sourceId})
		}
	}
	window.webContents.on('console-message', onConsoleMessage)

	const stopConsoleForwarding = (): void => {
		window.webContents.removeListener('console-message', onConsoleMessage)
	}
	const consoleForwardingTimeout = setTimeout(stopConsoleForwarding, 10_000)
	const stopStartupConsoleForwarding = (): void => {
		clearTimeout(consoleForwardingTimeout)
		stopConsoleForwarding()
	}

	window.webContents.once('did-finish-load', () => {
		void verifyPreloadBridge(window, preloadPath, logger).finally(stopStartupConsoleForwarding)
	})
}

async function verifyPreloadBridge(window: BrowserWindow, preloadPath: string, logger: Logger = log): Promise<boolean> {
	try {
		const bridge = normalizeBridgeProbe((await window.webContents.executeJavaScript(BRIDGE_PROBE_SCRIPT)) as unknown)
		if (!bridge.hasAppApi) {
			logger.error('Preload bridge missing after renderer load', {preloadPath, bridge})
			return false
		}
		if (!bridge.hasPlatform || bridge.appVersion === null) {
			logger.error('Preload bridge incomplete after renderer load', {preloadPath, bridge})
			return false
		}
		logger.info('Preload bridge verified', {preloadPath, bridge})
		return true
	} catch (error) {
		logger.error('Preload bridge verification failed', {preloadPath, error: serializeError(error)})
		return false
	}
}

function normalizeBridgeProbe(value: unknown): BridgeProbe {
	if (!isRecord(value)) {
		return {hasAppApi: false, hasPlatform: false, appVersion: null, appApiKeys: []}
	}

	return {hasAppApi: value.hasAppApi === true, hasPlatform: value.hasPlatform === true, appVersion: typeof value.appVersion === 'string' ? value.appVersion : null, appApiKeys: Array.isArray(value.appApiKeys) ? value.appApiKeys.filter((key): key is string => typeof key === 'string') : []}
}

function serializeError(error: unknown, depth = 0): SerializedError {
	if (error instanceof Error) {
		const withCode = error as Error & {code?: unknown; cause?: unknown}
		return {name: error.name, message: error.message, stack: error.stack, ...(withCode.code !== undefined ? {code: withCode.code} : {}), ...(withCode.cause !== undefined && depth < 2 ? {cause: serializeError(withCode.cause, depth + 1)} : {})}
	}

	return {name: typeof error, message: String(error)}
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null
}
