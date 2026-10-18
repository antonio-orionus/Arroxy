import type {BrowserWindow} from 'electron'
import log from 'electron-log/main.js'

interface Logger {
	info(message: string, meta?: unknown): void
	warn(message: string, meta?: unknown): void
}

interface Options {
	gpuFeatureStatus: () => unknown
	logger?: Logger
	now?: () => number
}

// A renderer hang otherwise leaves no trace in main.log: the process neither
// crashes nor logs. Record the hang with the GPU state, and how long it lasted
// if the window recovers.
export function registerResponsivenessDiagnostics(window: BrowserWindow, {gpuFeatureStatus, logger = log, now = Date.now}: Options): void {
	let unresponsiveSince: number | null = null

	window.on('unresponsive', () => {
		unresponsiveSince = now()
		logger.warn('Main window unresponsive', {gpuFeatureStatus: readGpuFeatureStatus(gpuFeatureStatus)})
	})

	window.on('responsive', () => {
		if (unresponsiveSince === null) return
		logger.info('Main window responsive again', {stalledMs: now() - unresponsiveSince})
		unresponsiveSince = null
	})
}

function readGpuFeatureStatus(read: () => unknown): unknown {
	try {
		return read()
	} catch (error) {
		return `unavailable: ${error instanceof Error ? error.message : String(error)}`
	}
}
