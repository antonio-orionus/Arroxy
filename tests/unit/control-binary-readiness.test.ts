// @vitest-environment node

import {afterEach, describe, expect, it, vi} from 'vite-plus/test'
import {binaryReadiness, binaryState} from '@main/control/binaryReadiness.js'
import type {DependencyDiagnostic, DependencyId, DependencyState} from '@shared/types.js'

// yt-dlp's and FFmpeg's state for the Control API's status, from what
// BinaryManager last resolved.

afterEach(() => {
	vi.useRealTimers()
})

function diagnostic(id: DependencyId, state: DependencyState): DependencyDiagnostic {
	return {id, state, source: null, resolvedPath: state === 'runnable' ? `/bin/${id}` : null, attempts: []}
}

function fakeBinaries(states: Partial<Record<DependencyId, DependencyState>>) {
	const current = {...states}
	return {
		set: (id: DependencyId, state: DependencyState) => {
			current[id] = state
		},
		getLastDiagnostic: (id: DependencyId): DependencyDiagnostic | null => {
			const state = current[id]
			return state === undefined ? null : diagnostic(id, state)
		}
	}
}

describe('binaryState', () => {
	it('maps a diagnostic to the state a client sees', () => {
		expect(binaryState(null)).toBe('installing')
		expect(binaryState(diagnostic('yt-dlp', 'runnable'))).toBe('ready')
		expect(binaryState(diagnostic('yt-dlp', 'downloaded'))).toBe('installing')
		expect(binaryState(diagnostic('yt-dlp', 'verified'))).toBe('installing')
		expect(binaryState(diagnostic('yt-dlp', 'missing'))).toBe('missing')
		expect(binaryState(diagnostic('yt-dlp', 'failed'))).toBe('failed')
	})
})

describe('binaryReadiness', () => {
	it('is ready once yt-dlp, ffmpeg and ffprobe all run', () => {
		const readiness = binaryReadiness(fakeBinaries({'yt-dlp': 'runnable', ffmpeg: 'runnable', ffprobe: 'runnable'}))
		expect(readiness.current()).toEqual({ytDlp: 'ready', ffmpeg: 'ready'})
	})

	it('reports FFmpeg by the worse of ffmpeg and ffprobe', () => {
		expect(binaryReadiness(fakeBinaries({'yt-dlp': 'runnable', ffmpeg: 'runnable', ffprobe: 'failed'})).current()).toEqual({ytDlp: 'ready', ffmpeg: 'failed'})
		expect(binaryReadiness(fakeBinaries({'yt-dlp': 'runnable', ffmpeg: 'missing'})).current()).toEqual({ytDlp: 'ready', ffmpeg: 'missing'})
		expect(binaryReadiness(fakeBinaries({})).current()).toEqual({ytDlp: 'installing', ffmpeg: 'installing'})
	})

	it('tells listeners when the state changes, and only then', async () => {
		vi.useFakeTimers()
		const binaries = fakeBinaries({})
		const readiness = binaryReadiness(binaries, {intervalMs: 100})
		const listener = vi.fn()
		const stop = readiness.onChange(listener)
		await vi.advanceTimersByTimeAsync(300)
		expect(listener).not.toHaveBeenCalled()
		binaries.set('yt-dlp', 'runnable')
		await vi.advanceTimersByTimeAsync(100)
		expect(listener).toHaveBeenCalledTimes(1)
		await vi.advanceTimersByTimeAsync(300)
		expect(listener).toHaveBeenCalledTimes(1)
		stop()
		binaries.set('ffmpeg', 'runnable')
		binaries.set('ffprobe', 'runnable')
		await vi.advanceTimersByTimeAsync(300)
		expect(listener).toHaveBeenCalledTimes(1)
	})

	it('checks only while someone listens', () => {
		vi.useFakeTimers()
		const readiness = binaryReadiness(fakeBinaries({}), {intervalMs: 100})
		expect(vi.getTimerCount()).toBe(0)
		const stopFirst = readiness.onChange(() => undefined)
		const stopSecond = readiness.onChange(() => undefined)
		expect(vi.getTimerCount()).toBe(1)
		stopFirst()
		expect(vi.getTimerCount()).toBe(1)
		stopSecond()
		expect(vi.getTimerCount()).toBe(0)
	})
})
