import {EventEmitter} from 'node:events'
import {vi} from 'vitest'

export interface TranscriptProcess extends EventEmitter {
	stdout: EventEmitter
	stderr: EventEmitter
	kill: ReturnType<typeof vi.fn<() => boolean>>
}

export type TranscriptStep = {stream: 'stdout' | 'stderr'; data: string | Buffer} | {close: number | null} | {error: Error}

interface TranscriptOptions {
	delayMs?: number
	beforeStart?: () => void
}

interface HangingProcessOptions {
	onKill?: () => void
	closeOnKill?: number | null
	closeDelayMs?: number
}

export function createTranscriptProcess(steps: readonly TranscriptStep[], options: TranscriptOptions = {}): TranscriptProcess {
	const proc = baseProcess()
	let started = false
	const start = (): void => {
		if (started) return
		started = true
		options.beforeStart?.()
		setTimeout(() => {
			for (const step of steps) {
				if ('stream' in step) {
					proc[step.stream].emit('data', Buffer.isBuffer(step.data) ? step.data : Buffer.from(step.data))
				} else if ('error' in step) {
					proc.emit('error', step.error)
				} else {
					proc.emit('close', step.close)
				}
			}
		}, options.delayMs ?? 10)
	}

	const terminalEvents = new Set(steps.map(step => ('close' in step ? 'close' : 'error' in step ? 'error' : null)).filter((event): event is 'close' | 'error' => event !== null))
	proc.on('newListener', (event: string | symbol): void => {
		if (!isTranscriptTerminalEvent(event) || !terminalEvents.has(event)) return
		start()
	})

	if (terminalEvents.size === 0) {
		setTimeout(start, 0)
	}

	return proc
}

function isTranscriptTerminalEvent(event: string | symbol): event is 'close' | 'error' {
	return event === 'close' || event === 'error'
}

export function createHangingProcess(options: HangingProcessOptions = {}): TranscriptProcess {
	const proc = baseProcess()
	proc.kill = vi.fn(() => {
		options.onKill?.()
		setTimeout(() => proc.emit('close', options.closeOnKill ?? null), options.closeDelayMs ?? 5)
		return true
	})
	return proc
}

function baseProcess(): TranscriptProcess {
	return Object.assign(new EventEmitter(), {stdout: new EventEmitter(), stderr: new EventEmitter(), kill: vi.fn(() => true)})
}
