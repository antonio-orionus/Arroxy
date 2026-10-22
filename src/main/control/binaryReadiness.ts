// yt-dlp's and FFmpeg's state for the Control API's status, read from what
// BinaryManager last resolved. BinaryManager announces nothing, so while
// someone listens this looks again every second and tells them when the
// state changed: warm-up, a repair's "check again" and a binary that stopped
// running all pass through its last diagnostics.

import type {BinaryState} from 'arroxy-control'
import type {BinaryManager} from '@main/services/BinaryManager.js'
import type {DependencyDiagnostic} from '@shared/types.js'
import type {ControlBinaries} from './controlStatus.js'

const CHECK_INTERVAL_MS = 1000

// Worst first: FFmpeg is as ready as the worse of ffmpeg and ffprobe.
const SEVERITY: readonly BinaryState[] = ['failed', 'missing', 'installing', 'updating', 'ready']

// No diagnostic yet means warm-up has not resolved it (or a repair is
// checking it again).
export function binaryState(diagnostic: DependencyDiagnostic | null): BinaryState {
	switch (diagnostic?.state) {
		case 'runnable':
			return 'ready'
		case 'missing':
			return 'missing'
		case 'failed':
			return 'failed'
		case 'downloaded':
		case 'verified':
		case undefined:
			return 'installing'
	}
}

function worse(a: BinaryState, b: BinaryState): BinaryState {
	return SEVERITY.indexOf(a) <= SEVERITY.indexOf(b) ? a : b
}

export function binaryReadiness(binaries: Pick<BinaryManager, 'getLastDiagnostic'>, options: {readonly intervalMs?: number} = {}): ControlBinaries {
	const current = (): ReturnType<ControlBinaries['current']> => ({ytDlp: binaryState(binaries.getLastDiagnostic('yt-dlp')), ffmpeg: worse(binaryState(binaries.getLastDiagnostic('ffmpeg')), binaryState(binaries.getLastDiagnostic('ffprobe')))})
	const listeners = new Set<() => void>()
	let timer: NodeJS.Timeout | null = null
	let last = ''
	const check = (): void => {
		const now = JSON.stringify(current())
		if (now === last) return
		last = now
		for (const listener of [...listeners]) listener()
	}
	return {
		current,
		onChange: listener => {
			const entry = (): void => listener()
			listeners.add(entry)
			if (timer === null) {
				last = JSON.stringify(current())
				timer = setInterval(check, options.intervalMs ?? CHECK_INTERVAL_MS)
				timer.unref()
			}
			return () => {
				listeners.delete(entry)
				if (listeners.size > 0 || timer === null) return
				clearInterval(timer)
				timer = null
			}
		}
	}
}
