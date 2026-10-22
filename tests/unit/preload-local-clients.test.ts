// @vitest-environment node

import {afterEach, describe, expect, it, vi} from 'vite-plus/test'
import {createPreloadApi, type PreloadIpcRenderer} from '@preload/createPreloadApi.js'
import {IPC_CHANNELS} from '@shared/ipc.js'
import type {LocalClientsSnapshot} from '@shared/localClients.js'
import {importWithReleaseFlagsOff} from '../helpers/releaseFlags.js'

// The window's way to the local clients: present only behind the agentControl
// release flag, each method on its own channel.

afterEach(() => {
	vi.unstubAllEnvs()
	vi.resetModules()
})

function makeIpcRenderer() {
	const invoke = vi.fn().mockResolvedValue(undefined)
	const on = vi.fn()
	const removeListener = vi.fn()
	const ipcRenderer: PreloadIpcRenderer = {invoke: invoke as PreloadIpcRenderer['invoke'], on: on as PreloadIpcRenderer['on'], removeListener: removeListener as PreloadIpcRenderer['removeListener'], send: vi.fn()}
	return {ipcRenderer, invoke, on, removeListener}
}

function localClientsApi(ipcRenderer: PreloadIpcRenderer) {
	const api = createPreloadApi(ipcRenderer).localClients
	if (!api) throw new Error('localClients is missing with the flag on')
	return api
}

const SNAPSHOT: LocalClientsSnapshot = {clients: [{clientId: 'c1', label: 'Claude Code', pathsRead: false, firstSeenAt: 1, lastSeenAt: 2, connected: true}], pending: [{approvalId: 'a1', label: 'script', requestedAt: 3, expiresAt: 4}]}

describe('preload localClients', () => {
	it('routes each method to its channel', () => {
		const ipc = makeIpcRenderer()
		const api = localClientsApi(ipc.ipcRenderer)
		void api.get()
		void api.allow({approvalId: 'a1', pathsRead: true})
		void api.deny({approvalId: 'a2'})
		void api.remove({clientId: 'c1'})
		expect(ipc.invoke.mock.calls).toEqual([[IPC_CHANNELS.localClientsGet], [IPC_CHANNELS.localClientsAllow, {approvalId: 'a1', pathsRead: true}], [IPC_CHANNELS.localClientsDeny, {approvalId: 'a2'}], [IPC_CHANNELS.localClientsRemove, {clientId: 'c1'}]])
	})

	it('hands onChanged the snapshot alone and unsubscribes the same listener', () => {
		const ipc = makeIpcRenderer()
		const listener = vi.fn()
		const unsubscribe = localClientsApi(ipc.ipcRenderer).onChanged(listener)
		expect(ipc.on).toHaveBeenCalledWith(IPC_CHANNELS.localClientsChanged, expect.any(Function))
		const [, wrapped] = ipc.on.mock.calls[0] as [string, (event: unknown, snapshot: unknown) => void]
		wrapped({sender: {}}, SNAPSHOT)
		expect(listener).toHaveBeenCalledExactlyOnceWith(SNAPSHOT)
		unsubscribe()
		expect(ipc.removeListener).toHaveBeenCalledWith(IPC_CHANNELS.localClientsChanged, wrapped)
	})

	it('is absent in a release build', async () => {
		const {createPreloadApi: createInRelease} = await importWithReleaseFlagsOff(() => import('@preload/createPreloadApi.js'))
		const api = createInRelease(makeIpcRenderer().ipcRenderer)
		expect('localClients' in api).toBe(false)
	})
})
