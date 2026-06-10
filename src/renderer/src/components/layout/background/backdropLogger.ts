import log from 'electron-log/renderer.js'
import type {BackdropSceneId} from './types.js'

const backdropLogger = log.scope('backdrop')

type ElectronLogWindow = Window & {__electronLog?: unknown}

function canWriteToElectronLog(): boolean {
	return typeof window !== 'undefined' && Boolean((window as ElectronLogWindow).__electronLog)
}

function backdropDebugEnabled(): boolean {
	if (typeof window === 'undefined') return false

	try {
		const params = new URLSearchParams(window.location.search)
		return params.get('backdropDebug') === '1' || window.localStorage.getItem('backdropDebug') === '1'
	} catch {
		return false
	}
}

export function logBackdrop(level: 'debug' | 'info' | 'warn', sceneId: BackdropSceneId, event: string, data: Record<string, unknown> = {}): void {
	if (!backdropDebugEnabled()) return

	const payload = {event, sceneId, ...data}
	if (canWriteToElectronLog()) {
		backdropLogger[level](payload)
		return
	}

	console[level]('[backdrop]', payload)
}
