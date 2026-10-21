// @vitest-environment node

import {describe, expect, it, vi} from 'vite-plus/test'
import {appStatusSchema, type AppStatus} from 'arroxy-control'
import {createControlStatus, type ControlBinaries} from '@main/control/controlStatus.js'
import type {SiteCooldown} from '@shared/types.js'

// The app's status for clients: binaries, the scheduler and the sites
// Arroxy is holding off, from the sources that own them.

function sources() {
	const listeners = {binaries: new Set<() => void>(), cooldowns: new Set<() => void>(), scheduler: new Set<() => void>()}
	const state = {binaries: {ytDlp: 'ready', ffmpeg: 'ready'} as AppStatus['binaries'], paused: false, cooldowns: [] as SiteCooldown[]}
	const binaries: ControlBinaries = {
		current: () => state.binaries,
		onChange: listener => {
			listeners.binaries.add(listener)
			return () => listeners.binaries.delete(listener)
		}
	}
	const status = createControlStatus({
		binaries,
		cooldowns: {
			snapshot: () => state.cooldowns,
			onChange: listener => {
				const wrapped = (): void => listener(state.cooldowns)
				listeners.cooldowns.add(wrapped)
				return () => listeners.cooldowns.delete(wrapped)
			}
		},
		scheduler: {
			paused: () => state.paused,
			onChange: listener => {
				listeners.scheduler.add(listener)
				return () => listeners.scheduler.delete(listener)
			}
		}
	})
	return {status, state, listeners}
}

describe('createControlStatus', () => {
	it('is ready only with both binaries ready', () => {
		const h = sources()
		expect(h.status.current()).toEqual({ready: true, binaries: {ytDlp: 'ready', ffmpeg: 'ready'}, scheduler: 'running', cooldowns: []})
		h.state.binaries = {ytDlp: 'ready', ffmpeg: 'installing'}
		expect(h.status.current().ready).toBe(false)
	})

	it('shows the scheduler and the running cooldowns, until as epoch milliseconds', () => {
		const h = sources()
		h.state.paused = true
		h.state.cooldowns = [{site: 'youtube', until: '2026-10-22T10:00:00.000Z', evidence: 'rateLimited'}]
		const status = h.status.current()
		expect(status.scheduler).toBe('paused')
		expect(status.cooldowns).toEqual([{site: 'youtube', until: Date.parse('2026-10-22T10:00:00.000Z')}])
		expect(appStatusSchema.safeParse(status).success).toBe(true)
	})

	it('tells a listener when any source changes, until it stops listening', () => {
		const h = sources()
		const listener = vi.fn()
		const stop = h.status.onChange(listener)
		for (const set of Object.values(h.listeners)) for (const notify of set) notify()
		expect(listener).toHaveBeenCalledTimes(3)
		stop()
		expect(Object.values(h.listeners).every(set => set.size === 0)).toBe(true)
	})
})
