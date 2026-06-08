// @vitest-environment node

import {describe, it, expect, vi, afterEach} from 'vitest'
import {EventEmitter} from 'node:events'
import {DownloadEventBridge} from '@main/services/DownloadEventBridge.js'
import type {DownloadService} from '@main/services/DownloadService.js'
import {IPC_CHANNELS} from '@shared/ipc.js'
import type {StatusEvent, ProgressEvent} from '@shared/types.js'

function makeDs(): DownloadService {
	return new EventEmitter() as unknown as DownloadService
}

function makeWindow(destroyed = false) {
	return {webContents: {send: vi.fn()}, isDestroyed: vi.fn().mockReturnValue(destroyed)} as unknown as Electron.BrowserWindow
}

function doneStatus(jobId = 'job-1'): StatusEvent {
	return {jobId, stage: 'done', statusKey: 'complete', at: new Date().toISOString()}
}

function errorStatus(jobId = 'job-1'): StatusEvent {
	return {jobId, stage: 'error', statusKey: 'ytdlpProcessError', at: new Date().toISOString(), error: {kind: 'unknown', raw: 'test error'}}
}

function progressEvent(jobId = 'job-1', percent = 50): ProgressEvent {
	return {jobId, percent, line: '', at: new Date().toISOString()}
}

describe('DownloadEventBridge', () => {
	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('attach() listener safety', () => {
		it('preserves pre-existing listeners on downloadService', () => {
			const ds = makeDs()
			const win = makeWindow()
			const received: string[] = []
			;(ds as unknown as EventEmitter).on('status', () => received.push('survivor'))

			const bridge = new DownloadEventBridge(ds, win)
			bridge.attach()
			;(ds as unknown as EventEmitter).emit('status', doneStatus())

			expect(received).toContain('survivor')
		})

		it('double-attach fires webContents.send exactly once per status event', () => {
			const ds = makeDs()
			const win = makeWindow()
			const bridge = new DownloadEventBridge(ds, win)
			bridge.attach()
			bridge.attach()
			vi.mocked(win.webContents.send).mockClear()

			;(ds as unknown as EventEmitter).emit('status', doneStatus())

			const calls = vi.mocked(win.webContents.send).mock.calls.filter(([ch]) => ch === IPC_CHANNELS.eventsStatus)
			expect(calls).toHaveLength(1)
		})

		it('detach() stops forwarding status events', () => {
			const ds = makeDs()
			const win = makeWindow()
			const bridge = new DownloadEventBridge(ds, win)
			bridge.attach()
			bridge.detach()
			vi.mocked(win.webContents.send).mockClear()

			;(ds as unknown as EventEmitter).emit('status', doneStatus())

			expect(vi.mocked(win.webContents.send)).not.toHaveBeenCalled()
		})
	})

	describe('progress throttle', () => {
		it('drops progress events within 100ms window for the same jobId', () => {
			const ds = makeDs()
			const win = makeWindow()
			const bridge = new DownloadEventBridge(ds, win)
			bridge.attach()

			let now = 1_000_000
			vi.spyOn(Date, 'now').mockImplementation(() => now)

			;(ds as unknown as EventEmitter).emit('progress', progressEvent('j1', 10))
			now += 50
			;(ds as unknown as EventEmitter).emit('progress', progressEvent('j1', 20)) // dropped
			now += 60 // 110ms from first
			;(ds as unknown as EventEmitter).emit('progress', progressEvent('j1', 30))

			const sends = vi.mocked(win.webContents.send).mock.calls.filter(([ch]) => ch === IPC_CHANNELS.eventsProgress)
			expect(sends).toHaveLength(2)
		})

		it('maintains separate throttle windows per jobId', () => {
			const ds = makeDs()
			const win = makeWindow()
			const bridge = new DownloadEventBridge(ds, win)
			bridge.attach()

			let now = 1_000_000
			vi.spyOn(Date, 'now').mockImplementation(() => now)

			;(ds as unknown as EventEmitter).emit('progress', progressEvent('j1', 10))
			now += 50
			;(ds as unknown as EventEmitter).emit('progress', progressEvent('j2', 10)) // different jobId — not throttled

			const sends = vi.mocked(win.webContents.send).mock.calls.filter(([ch]) => ch === IPC_CHANNELS.eventsProgress)
			expect(sends).toHaveLength(2)
		})

		it('clears throttle entry on done status so next progress fires immediately', () => {
			const ds = makeDs()
			const win = makeWindow()
			const bridge = new DownloadEventBridge(ds, win)
			bridge.attach()

			let now = 1_000_000
			vi.spyOn(Date, 'now').mockImplementation(() => now)

			;(ds as unknown as EventEmitter).emit('progress', progressEvent('j1', 50))
			;(ds as unknown as EventEmitter).emit('status', doneStatus('j1')) // clears throttle
			now += 10 // still within 100ms, but throttle was reset
			;(ds as unknown as EventEmitter).emit('progress', progressEvent('j1', 60))

			const sends = vi.mocked(win.webContents.send).mock.calls.filter(([ch]) => ch === IPC_CHANNELS.eventsProgress)
			expect(sends).toHaveLength(2)
		})

		it('clears throttle entry on error status', () => {
			const ds = makeDs()
			const win = makeWindow()
			const bridge = new DownloadEventBridge(ds, win)
			bridge.attach()

			let now = 1_000_000
			vi.spyOn(Date, 'now').mockImplementation(() => now)

			;(ds as unknown as EventEmitter).emit('progress', progressEvent('j1', 50))
			;(ds as unknown as EventEmitter).emit('status', errorStatus('j1')) // clears throttle
			now += 10
			;(ds as unknown as EventEmitter).emit('progress', progressEvent('j1', 60))

			const sends = vi.mocked(win.webContents.send).mock.calls.filter(([ch]) => ch === IPC_CHANNELS.eventsProgress)
			expect(sends).toHaveLength(2)
		})
	})

	describe('destroyed window safety', () => {
		it('does not crash and does not send when window is destroyed on status event', () => {
			const ds = makeDs()
			const win = makeWindow(true)
			const bridge = new DownloadEventBridge(ds, win)
			bridge.attach()

			expect(() => {
				;(ds as unknown as EventEmitter).emit('status', doneStatus())
			}).not.toThrow()

			expect(vi.mocked(win.webContents.send)).not.toHaveBeenCalled()
		})

		it('does not crash and does not send when window is destroyed on progress event', () => {
			const ds = makeDs()
			const win = makeWindow(true)
			const bridge = new DownloadEventBridge(ds, win)
			bridge.attach()

			const now = 1_000_000
			vi.spyOn(Date, 'now').mockImplementation(() => now)

			expect(() => {
				;(ds as unknown as EventEmitter).emit('progress', progressEvent())
			}).not.toThrow()

			expect(vi.mocked(win.webContents.send)).not.toHaveBeenCalled()
		})
	})
})
