// @vitest-environment node

import {describe, expect, it, vi} from 'vitest'
import {EventEmitter} from 'node:events'

vi.mock('electron', () => ({app: {getVersion: vi.fn().mockReturnValue('1.0.0'), getName: vi.fn().mockReturnValue('arroxy')}, ipcMain: {handle: vi.fn(), removeHandler: vi.fn()}}))

import {QueueEventBridge} from '@main/services/QueueEventBridge.js'
import type {QueueService} from '@main/services/QueueService.js'
import {IPC_CHANNELS} from '@shared/ipc.js'
import type {QueueItem} from '@shared/types.js'

function makeService(): QueueService {
	// QueueService has no interface and its constructor has heavy deps — cast a
	// minimal EventEmitter stub rather than constructing the real class.
	return Object.assign(new EventEmitter(), {snapshot: vi.fn().mockReturnValue([])}) as unknown as QueueService
}

function makeWindow() {
	// BrowserWindow constructor requires Electron internals — cast a plain object
	// that implements the surface the bridge actually calls.
	return {webContents: {send: vi.fn()}, isDestroyed: () => false} as unknown as Electron.BrowserWindow
}

describe('QueueEventBridge', () => {
	describe('attach() does not wipe external listeners added before attach', () => {
		it('external listener on "added" still fires after bridge attach()', () => {
			const service = makeService()
			const window = makeWindow()
			const bridge = new QueueEventBridge(service, window)

			let externalCount = 0
			service.on('added', () => {
				externalCount++
			})

			bridge.attach()

			service.emit('added', {items: [] as QueueItem[], atIdx: 0})

			expect(externalCount).toBe(1)
		})
	})

	describe('attach() called twice does not fire bridge listener twice per event', () => {
		it('webContents.send is called exactly once for queueEventAdded after double-attach', () => {
			const service = makeService()
			const window = makeWindow()
			const bridge = new QueueEventBridge(service, window)

			bridge.attach()
			bridge.attach()

			// Clear the send mock — attach() sends a snapshot each time, we only care
			// about the forwarded event.
			vi.mocked(window.webContents.send).mockClear()

			service.emit('added', {items: [] as QueueItem[], atIdx: 0})

			const addedCalls = vi.mocked(window.webContents.send).mock.calls.filter(([ch]) => ch === IPC_CHANNELS.queueEventAdded)
			expect(addedCalls).toHaveLength(1)
		})
	})
})
