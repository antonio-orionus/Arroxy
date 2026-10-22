// @vitest-environment node

import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'

const handlers = new Map<string, (event: unknown, payload: unknown) => Promise<unknown>>()

vi.mock('electron', () => ({
	app: {getPath: vi.fn().mockReturnValue('/tmp')},
	ipcMain: {
		handle: vi.fn((channel: string, fn: (event: unknown, payload: unknown) => Promise<unknown>) => {
			handlers.set(channel, fn)
		}),
		removeHandler: vi.fn((channel: string) => {
			handlers.delete(channel)
		})
	}
}))

import {LocalClientRegistry} from '@main/control/clients/LocalClientRegistry.js'
import {MemoryLocalClientStore} from '@main/control/clients/localClientStore.js'
import {registerLocalClientHandlers} from '@main/ipc/localClientHandlers.js'
import {IPC_CHANNELS} from '@shared/ipc.js'
import {allowedClient, silentLog} from '../helpers/controlSocketHarness.js'
import {importWithReleaseFlagsOff} from '../helpers/releaseFlags.js'

// The window's IPC over the local clients: registered at start-up, it answers
// not_running until agent control sets the loaded clients and again once it
// clears them; while set, each request reaches the registry once its payload
// parses, a refusal keeps its reason, and every change goes to the window as
// a fresh snapshot.

const CHANNELS = [IPC_CHANNELS.localClientsGet, IPC_CHANNELS.localClientsAllow, IPC_CHANNELS.localClientsDeny, IPC_CHANNELS.localClientsRemove]

interface Answer {
	readonly ok: boolean
	readonly data?: unknown
	readonly error?: {readonly code: string; readonly message: string}
}

async function invoke(channel: string, payload?: unknown): Promise<Answer> {
	const fn = handlers.get(channel)
	if (!fn) throw new Error(`no handler for ${channel}`)
	return (await fn({}, payload)) as Answer
}

function fakeWindow() {
	const send = vi.fn()
	let destroyed = false
	return {window: {isDestroyed: () => destroyed, webContents: {send}}, send, destroy: () => (destroyed = true)}
}

let registry: LocalClientRegistry
let secretsStorable = true

beforeEach(async () => {
	handlers.clear()
	secretsStorable = true
	registry = await LocalClientRegistry.load({store: new MemoryLocalClientStore(), secretsStorable: () => secretsStorable, log: silentLog()})
})

afterEach(async () => {
	await registry.close()
	vi.unstubAllEnvs()
	vi.resetModules()
})

// The handlers, answering from `registry`.
function exposed(window = fakeWindow().window) {
	const holder = registerLocalClientHandlers(window)
	holder.set(registry)
	return holder
}

// A valid request on every channel.
const REQUESTS: Array<[string, unknown]> = [
	[IPC_CHANNELS.localClientsGet, undefined],
	[IPC_CHANNELS.localClientsAllow, {approvalId: 'a1', pathsRead: false}],
	[IPC_CHANNELS.localClientsDeny, {approvalId: 'a1'}],
	[IPC_CHANNELS.localClientsRemove, {clientId: 'c1'}]
]

describe('registerLocalClientHandlers', () => {
	it('answers get with the snapshot, never a secret', async () => {
		exposed()
		const {clientId, secret} = allowedClient(registry)
		const approvalId = registry.request('script')
		const answer = await invoke(IPC_CHANNELS.localClientsGet)
		expect(answer).toEqual({ok: true, data: registry.snapshot()})
		expect(answer.data).toMatchObject({clients: [{clientId, label: 'test-client'}], pending: [{approvalId, label: 'script'}]})
		expect(JSON.stringify(answer)).not.toContain(secret)
	})

	it.each([
		['no payload', undefined],
		['no pathsRead', {approvalId: 'a1'}],
		['a pathsRead that is not a boolean', {approvalId: 'a1', pathsRead: 'yes'}],
		['an empty approvalId', {approvalId: '', pathsRead: false}],
		['an approvalId too long', {approvalId: 'a'.repeat(129), pathsRead: false}],
		['an unknown key', {approvalId: 'a1', pathsRead: false, rules: ['trusted']}]
	])('refuses allow with %s', async (_name, payload) => {
		exposed()
		const allow = vi.spyOn(registry, 'allow')
		const answer = await invoke(IPC_CHANNELS.localClientsAllow, payload)
		expect(answer).toMatchObject({ok: false, error: {code: 'validation'}})
		expect(allow).not.toHaveBeenCalled()
	})

	it.each([
		[IPC_CHANNELS.localClientsDeny, {approvalId: 7}],
		[IPC_CHANNELS.localClientsDeny, {approvalId: 'a1', extra: true}],
		[IPC_CHANNELS.localClientsRemove, {}],
		[IPC_CHANNELS.localClientsRemove, {clientId: ''}]
	])('refuses %s with a bad payload', async (channel, payload) => {
		exposed()
		const deny = vi.spyOn(registry, 'deny')
		const remove = vi.spyOn(registry, 'remove')
		expect(await invoke(channel, payload)).toMatchObject({ok: false, error: {code: 'validation'}})
		expect(deny).not.toHaveBeenCalled()
		expect(remove).not.toHaveBeenCalled()
	})

	it('allows a pending client with the grant it was given', async () => {
		exposed()
		const approvalId = registry.request('Claude Code')
		expect(await invoke(IPC_CHANNELS.localClientsAllow, {approvalId, pathsRead: true})).toEqual({ok: true, data: undefined})
		const claim = registry.claim(approvalId)
		expect(claim).toMatchObject({status: 'allowed', client: {label: 'Claude Code', rules: ['trusted', 'paths.read']}})
		expect(registry.snapshot().pending).toEqual([])
	})

	it('refuses to allow a request that is no longer pending', async () => {
		exposed()
		expect(await invoke(IPC_CHANNELS.localClientsAllow, {approvalId: 'gone', pathsRead: false})).toMatchObject({ok: false, error: {code: 'not_pending'}})
	})

	it('refuses to allow without secure storage, and the request stays pending', async () => {
		exposed()
		const approvalId = registry.request('script')
		secretsStorable = false
		expect(await invoke(IPC_CHANNELS.localClientsAllow, {approvalId, pathsRead: false})).toMatchObject({ok: false, error: {code: 'secure_storage_unavailable'}})
		expect(registry.snapshot().pending).toMatchObject([{approvalId}])
	})

	it('denies a pending request, and refuses one no longer pending', async () => {
		exposed()
		const approvalId = registry.request('script')
		expect(await invoke(IPC_CHANNELS.localClientsDeny, {approvalId})).toEqual({ok: true, data: undefined})
		expect(registry.snapshot().pending).toEqual([])
		expect(registry.claim(approvalId)).toEqual({status: 'refused'})
		expect(await invoke(IPC_CHANNELS.localClientsDeny, {approvalId})).toMatchObject({ok: false, error: {code: 'not_pending'}})
	})

	it('removes a known client, closing its connections, and refuses an unknown one', async () => {
		exposed()
		const {clientId} = allowedClient(registry)
		const revoked = vi.fn()
		registry.onRevoked(revoked)
		expect(await invoke(IPC_CHANNELS.localClientsRemove, {clientId})).toEqual({ok: true, data: undefined})
		expect(revoked).toHaveBeenCalledExactlyOnceWith(clientId)
		expect(registry.client(clientId)).toBeNull()
		expect(await invoke(IPC_CHANNELS.localClientsRemove, {clientId})).toMatchObject({ok: false, error: {code: 'unknown_client'}})
	})

	it('sends the window a fresh snapshot on every change', () => {
		const {window, send} = fakeWindow()
		exposed(window)
		const approvalId = registry.request('script')
		expect(send).toHaveBeenLastCalledWith(IPC_CHANNELS.localClientsChanged, {clients: [], pending: [expect.objectContaining({approvalId})]})
		registry.deny(approvalId)
		expect(send).toHaveBeenLastCalledWith(IPC_CHANNELS.localClientsChanged, {clients: [], pending: []})
		expect(send).toHaveBeenCalledTimes(2)
	})

	it('sends nothing to a closed window', () => {
		const {window, send, destroy} = fakeWindow()
		exposed(window)
		destroy()
		registry.request('script')
		expect(send).not.toHaveBeenCalled()
	})

	it.each(REQUESTS)('answers %s with not_running before the clients are set', async (channel, payload) => {
		registerLocalClientHandlers(fakeWindow().window)
		expect(await invoke(channel, payload)).toMatchObject({ok: false, error: {code: 'not_running', message: expect.any(String)}})
	})

	it('still checks the payload before the clients are set', async () => {
		registerLocalClientHandlers(fakeWindow().window)
		expect(await invoke(IPC_CHANNELS.localClientsAllow, {approvalId: ''})).toMatchObject({ok: false, error: {code: 'validation'}})
	})

	it('answers not_running again once the clients are cleared, and stops pushing their changes', async () => {
		const {window, send} = fakeWindow()
		const holder = exposed(window)
		const approvalId = registry.request('script')
		expect(send).toHaveBeenCalledTimes(1)
		holder.clear()
		holder.clear()
		for (const [channel, payload] of REQUESTS) expect(await invoke(channel, payload)).toMatchObject({ok: false, error: {code: 'not_running'}})
		registry.deny(approvalId)
		expect(send).toHaveBeenCalledTimes(1)
		// The handlers stay registered: nothing rejects with "no handler".
		expect(CHANNELS.every(channel => handlers.has(channel))).toBe(true)
	})

	it('pushes the changes of the clients set last, and only theirs', async () => {
		const {window, send} = fakeWindow()
		const holder = exposed(window)
		const next = await LocalClientRegistry.load({store: new MemoryLocalClientStore(), secretsStorable: () => true, log: silentLog()})
		try {
			holder.set(next)
			registry.request('old')
			expect(send).not.toHaveBeenCalled()
			const approvalId = next.request('new')
			expect(send).toHaveBeenCalledExactlyOnceWith(IPC_CHANNELS.localClientsChanged, {clients: [], pending: [expect.objectContaining({approvalId, label: 'new'})]})
			expect(await invoke(IPC_CHANNELS.localClientsGet)).toEqual({ok: true, data: next.snapshot()})
		} finally {
			await next.close()
		}
	})
})

describe('registerLocalClientHandlers in a release build', () => {
	it('registers no handler and never listens to the clients', async () => {
		const {registerLocalClientHandlers: registerInRelease} = await importWithReleaseFlagsOff(() => import('@main/ipc/localClientHandlers.js'))
		const {window, send} = fakeWindow()
		const onChange = vi.spyOn(registry, 'onChange')
		const holder = registerInRelease(window)
		holder.set(registry)
		registry.request('script')
		holder.clear()
		expect([...handlers.keys()]).toEqual([])
		expect(onChange).not.toHaveBeenCalled()
		expect(send).not.toHaveBeenCalled()
	})
})
