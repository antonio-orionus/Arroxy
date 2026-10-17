// @vitest-environment node

import {describe, expect, it, vi} from 'vite-plus/test'
import {createPreloadApi, type PreloadIpcRenderer} from '@preload/createPreloadApi.js'
import {IPC_CHANNELS} from '@shared/ipc.js'

function subscribe() {
	const on = vi.fn()
	const removeListener = vi.fn()
	const ipcRenderer = {invoke: vi.fn(), on, removeListener, send: vi.fn()} as unknown as PreloadIpcRenderer
	const listener = vi.fn()
	const unsubscribe = createPreloadApi(ipcRenderer).events.onMenuAction(listener)
	const wrapped = on.mock.calls[0]?.[1] as (event: unknown, payload: unknown) => void
	return {on, removeListener, listener, unsubscribe, deliver: (payload: unknown) => wrapped({}, payload)}
}

describe('events.onMenuAction', () => {
	it('listens on the menu action channel and unsubscribes the same handler', () => {
		const {on, removeListener, unsubscribe} = subscribe()
		expect(on).toHaveBeenCalledWith(IPC_CHANNELS.eventsMenuAction, expect.any(Function))
		unsubscribe()
		expect(removeListener).toHaveBeenCalledWith(IPC_CHANNELS.eventsMenuAction, on.mock.calls[0]?.[1])
	})

	it('forwards a well-formed action', () => {
		const {listener, deliver} = subscribe()
		deliver({kind: 'speedLimit', limitRate: '500K'})
		expect(listener).toHaveBeenCalledWith({kind: 'speedLimit', limitRate: '500K'})
	})

	it.each([[null], ['about'], [{kind: 'unknown'}], [{kind: 'style', style: 'neon'}], [{kind: 'speedLimit', limitRate: 'fast'}]])('drops a malformed payload: %j', payload => {
		const {listener, deliver} = subscribe()
		deliver(payload)
		expect(listener).not.toHaveBeenCalled()
	})
})
