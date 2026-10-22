// @vitest-environment node

import {afterEach, describe, expect, it, vi} from 'vite-plus/test'
import {ALLOWED_APPROVAL_TTL_MS, LocalClientRegistry, type LocalClientRegistryOptions, PENDING_APPROVAL_TTL_MS, PENDING_APPROVALS_MAX} from '@main/control/clients/LocalClientRegistry.js'
import {type LocalClientRecord, type LocalClientStore, LocalClientStoreRefusal, MemoryLocalClientStore} from '@main/control/clients/localClientStore.js'
import type {ApprovalClaim, LocalClient} from '@main/control/socket/localClientApprovals.js'

// Who may use the Control API over the local socket: requests waiting for the
// user, clients collecting their secret once, and the clients the user
// allowed, kept in the store between launches.

const registries: LocalClientRegistry[] = []

afterEach(async () => {
	for (const registry of registries.splice(0)) await registry.close()
	vi.useRealTimers()
})

async function load(options: Partial<LocalClientRegistryOptions> = {}) {
	const store = options.store instanceof MemoryLocalClientStore ? options.store : new MemoryLocalClientStore()
	const log = {info: vi.fn(), warn: vi.fn(), error: vi.fn()}
	const registry = await LocalClientRegistry.load({store, secretsStorable: () => true, log, ...options})
	registries.push(registry)
	const changes = vi.fn()
	registry.onChange(changes)
	return {registry, store, log, changes}
}

function claimed(claim: ApprovalClaim): LocalClient {
	if (claim.status !== 'allowed') throw new Error(`expected allowed, got ${claim.status}`)
	return claim.client
}

function allowed(registry: LocalClientRegistry, label = 'arroxy-mcp', pathsRead = false): LocalClient {
	const approvalId = registry.request(label)
	expect(registry.allow(approvalId, {pathsRead})).toEqual({ok: true})
	const client = claimed(registry.claim(approvalId))
	registry.confirm(approvalId)
	return client
}

const record = (overrides: Partial<LocalClientRecord> = {}): LocalClientRecord => ({clientId: 'known-1', label: 'Claude Code', pathsRead: true, firstSeenAt: 100, lastSeenAt: 200, secret: 'known-secret', ...overrides})

describe('LocalClientRegistry approvals', () => {
	it('keeps a request pending until the user chooses, and says when it expires', async () => {
		vi.useFakeTimers({now: 5000})
		const {registry, changes} = await load()
		const approvalId = registry.request('arroxy-mcp')
		expect(registry.snapshot()).toEqual({clients: [], pending: [{approvalId, label: 'arroxy-mcp', requestedAt: 5000, expiresAt: 5000 + PENDING_APPROVAL_TTL_MS}]})
		expect(registry.claim(approvalId)).toEqual({status: 'pending'})
		expect(changes).toHaveBeenCalledTimes(1)
	})

	it('issues a client once its answer was delivered, and keeps it in the store', async () => {
		vi.useFakeTimers({now: 1000})
		const {registry, store, changes} = await load()
		const approvalId = registry.request('arroxy-mcp')
		expect(registry.allow(approvalId, {pathsRead: false})).toEqual({ok: true})
		expect(registry.snapshot().pending).toEqual([])
		const client = claimed(registry.claim(approvalId))
		expect(client).toEqual({clientId: expect.any(String), label: 'arroxy-mcp', secret: expect.stringMatching(/^[A-Za-z0-9_-]{43}$/), rules: ['trusted']})
		// Known while its secret is being written, so a quick reconnect works.
		expect(registry.client(client.clientId)).toEqual(client)
		expect(store.records).toEqual([])
		vi.setSystemTime(3000)
		registry.confirm(approvalId)
		expect(registry.client(client.clientId)).toEqual(client)
		expect(registry.label(client.clientId)).toBe('arroxy-mcp')
		expect(registry.claim(approvalId)).toEqual({status: 'refused'})
		expect(registry.snapshot()).toEqual({clients: [{clientId: client.clientId, label: 'arroxy-mcp', pathsRead: false, firstSeenAt: 3000, lastSeenAt: 3000, connected: false}], pending: []})
		await registry.saved()
		expect(store.records).toEqual([{clientId: client.clientId, label: 'arroxy-mcp', pathsRead: false, firstSeenAt: 3000, lastSeenAt: 3000, secret: client.secret}])
		// request, allow, confirm.
		expect(changes).toHaveBeenCalledTimes(3)
	})

	it('never shows a secret in the snapshot', async () => {
		const {registry} = await load({store: new MemoryLocalClientStore([record()])})
		const client = allowed(registry)
		expect(JSON.stringify(registry.snapshot())).not.toContain(client.secret)
		expect(JSON.stringify(registry.snapshot())).not.toContain('known-secret')
	})

	it('holds a claimed approval for one connection, and frees it when the answer is lost', async () => {
		const {registry} = await load()
		const approvalId = registry.request('arroxy-mcp')
		registry.allow(approvalId, {pathsRead: false})
		const first = claimed(registry.claim(approvalId))
		expect(registry.claim(approvalId)).toEqual({status: 'pending'})
		registry.release(approvalId)
		expect(registry.client(first.clientId)).toBeNull()
		expect(claimed(registry.claim(approvalId))).toEqual(first)
	})

	it('confirms a claimed approval once its secret is proven, so a later release changes nothing', async () => {
		const {registry, store} = await load()
		const approvalId = registry.request('arroxy-mcp')
		registry.allow(approvalId, {pathsRead: false})
		const client = claimed(registry.claim(approvalId))
		registry.proven(client.clientId)
		registry.release(approvalId)
		expect(registry.client(client.clientId)).toEqual(client)
		expect(registry.claim(approvalId)).toEqual({status: 'refused'})
		await registry.saved()
		expect(store.records.map(row => row.clientId)).toEqual([client.clientId])
	})

	it('grants paths.read only when the user allows it', async () => {
		const {registry} = await load()
		const approvalId = registry.request('Claude Code')
		registry.allow(approvalId, {pathsRead: true})
		expect(claimed(registry.claim(approvalId)).rules).toEqual(['trusted', 'paths.read'])
	})

	it('refuses to allow while secrets cannot be stored, keeping the request pending', async () => {
		const storable = {now: false}
		const {registry, store} = await load({secretsStorable: () => storable.now})
		const approvalId = registry.request('arroxy-mcp')
		expect(registry.allow(approvalId, {pathsRead: false})).toEqual({ok: false, code: 'secure_storage_unavailable'})
		expect(registry.claim(approvalId)).toEqual({status: 'pending'})
		expect(registry.snapshot().pending).toHaveLength(1)
		await registry.saved()
		expect(store.records).toEqual([])
		storable.now = true
		expect(registry.allow(approvalId, {pathsRead: false})).toEqual({ok: true})
	})

	it('refuses a denied, withdrawn or unknown request, recording nothing', async () => {
		const {registry, store, changes} = await load()
		const denied = registry.request('x')
		expect(registry.deny(denied)).toBe(true)
		expect(registry.claim(denied)).toEqual({status: 'refused'})
		expect(registry.deny(denied)).toBe(false)
		const withdrawn = registry.request('y')
		registry.withdraw(withdrawn)
		expect(registry.snapshot()).toEqual({clients: [], pending: []})
		expect(registry.claim(withdrawn)).toEqual({status: 'refused'})
		expect(registry.claim('nope')).toEqual({status: 'refused'})
		expect(registry.allow('nope', {pathsRead: false})).toEqual({ok: false, code: 'not_pending'})
		expect(registry.allow(denied, {pathsRead: false})).toEqual({ok: false, code: 'not_pending'})
		await registry.saved()
		expect(store.records).toEqual([])
		// Two requests, a deny, a withdraw.
		expect(changes).toHaveBeenCalledTimes(4)
	})

	it('drops the oldest pending request past the cap', async () => {
		const {registry} = await load()
		const first = registry.request('first')
		for (let i = 0; i < PENDING_APPROVALS_MAX; i++) registry.request(`n${i}`)
		expect(registry.snapshot().pending).toHaveLength(PENDING_APPROVALS_MAX)
		expect(registry.snapshot().pending[0]?.label).toBe('n0')
		expect(registry.claim(first)).toEqual({status: 'refused'})
	})

	it('allows at once when built to auto-allow (E2E runs only)', async () => {
		const {registry} = await load({autoAllow: true})
		const approvalId = registry.request('arroxy-mcp')
		expect(registry.snapshot().pending).toEqual([])
		expect(registry.claim(approvalId).status).toBe('allowed')
	})
})

describe('LocalClientRegistry expiry', () => {
	it('expires a pending request on its own, and says so', async () => {
		vi.useFakeTimers({now: 0})
		const {registry, changes} = await load()
		const approvalId = registry.request('x')
		changes.mockClear()
		await vi.advanceTimersByTimeAsync(PENDING_APPROVAL_TTL_MS)
		expect(registry.snapshot().pending).toHaveLength(1)
		expect(changes).not.toHaveBeenCalled()
		await vi.advanceTimersByTimeAsync(1)
		expect(registry.snapshot().pending).toEqual([])
		expect(changes).toHaveBeenCalledTimes(1)
		expect(registry.claim(approvalId)).toEqual({status: 'refused'})
	})

	it('expires an allowed approval nobody collected, but not one being collected', async () => {
		vi.useFakeTimers({now: 0})
		const {registry, changes} = await load()
		const collecting = registry.request('collecting')
		const idle = registry.request('idle')
		await vi.advanceTimersByTimeAsync(5000)
		registry.allow(collecting, {pathsRead: false})
		registry.allow(idle, {pathsRead: false})
		const collectingClient = claimed(registry.claim(collecting))
		changes.mockClear()
		await vi.advanceTimersByTimeAsync(ALLOWED_APPROVAL_TTL_MS + 1)
		expect(changes).toHaveBeenCalledTimes(1)
		expect(registry.claim(idle)).toEqual({status: 'refused'})
		// Claimed: mid-write, kept until confirmed or released.
		expect(registry.client(collectingClient.clientId)).toEqual(collectingClient)
		registry.release(collecting)
		expect(registry.claim(collecting)).toEqual({status: 'refused'})
	})

	it('stops expiring once closed', async () => {
		vi.useFakeTimers({now: 0})
		const {registry, changes} = await load()
		registry.request('x')
		await registry.close()
		changes.mockClear()
		await vi.advanceTimersByTimeAsync(PENDING_APPROVAL_TTL_MS + 1)
		expect(changes).not.toHaveBeenCalled()
		expect(vi.getTimerCount()).toBe(0)
	})
})

describe('LocalClientRegistry known clients', () => {
	it('lets in the clients the store kept', async () => {
		const {registry} = await load({store: new MemoryLocalClientStore([record()])})
		expect(registry.client('known-1')).toEqual({clientId: 'known-1', label: 'Claude Code', secret: 'known-secret', rules: ['trusted', 'paths.read']})
		expect(registry.label('known-1')).toBe('Claude Code')
		expect(registry.snapshot().clients).toEqual([{clientId: 'known-1', label: 'Claude Code', pathsRead: true, firstSeenAt: 100, lastSeenAt: 200, connected: false}])
	})

	it('removes a client from the store and tells listeners, so its connections close', async () => {
		const {registry, store, changes} = await load({store: new MemoryLocalClientStore([record()])})
		const revoked: string[] = []
		const stop = registry.onRevoked(clientId => revoked.push(clientId))
		expect(registry.remove('known-1')).toBe(true)
		expect(registry.client('known-1')).toBeNull()
		expect(revoked).toEqual(['known-1'])
		expect(changes).toHaveBeenCalledTimes(1)
		await registry.saved()
		expect(store.records).toEqual([])
		stop()
		expect(registry.remove('known-1')).toBe(false)
		expect(revoked).toHaveLength(1)
	})

	it('logs a save that failed, and the client still works for this launch', async () => {
		const failing: LocalClientStore = {load: () => Promise.resolve([]), save: () => Promise.reject(new TypeError('/private/path'))}
		const log = {info: vi.fn(), warn: vi.fn(), error: vi.fn()}
		const registry = await LocalClientRegistry.load({store: failing, secretsStorable: () => true, log})
		registries.push(registry)
		const client = allowed(registry)
		await registry.saved()
		expect(log.warn).toHaveBeenCalledWith('the local clients could not be saved', {code: 'TypeError'})
		expect(JSON.stringify(log.warn.mock.calls)).not.toContain('/private/path')
		expect(registry.client(client.clientId)).toEqual(client)
	})

	it.each([
		['the errno code of a write that failed', Object.assign(new Error('ENOSPC: no space left, open /private/path'), {code: 'ENOSPC'}), 'ENOSPC'],
		["the store's own refusal", new LocalClientStoreRefusal('store_unread'), 'store_unread']
	])('logs a failed save by %s, never its message', async (_case, failure, code) => {
		const failing: LocalClientStore = {load: () => Promise.resolve([]), save: () => Promise.reject(failure)}
		const log = {info: vi.fn(), warn: vi.fn(), error: vi.fn()}
		const registry = await LocalClientRegistry.load({store: failing, secretsStorable: () => true, log})
		registries.push(registry)
		const client = allowed(registry)
		await registry.saved()
		expect(log.warn).toHaveBeenCalledExactlyOnceWith('the local clients could not be saved', {code})
		expect(JSON.stringify(log.warn.mock.calls)).not.toContain('/private/path')
		expect(JSON.stringify(log.warn.mock.calls)).not.toContain(client.secret)
	})

	it('saves the latest state once a save under way finishes', async () => {
		const saves: LocalClientRecord[][] = []
		let finish: () => void = () => undefined
		const slow: LocalClientStore = {
			load: () => Promise.resolve([]),
			save: records => {
				saves.push([...records])
				return saves.length === 1 ? new Promise(resolve => (finish = resolve)) : Promise.resolve()
			}
		}
		const log = {info: vi.fn(), warn: vi.fn(), error: vi.fn()}
		const registry = await LocalClientRegistry.load({store: slow, secretsStorable: () => true, log})
		registries.push(registry)
		const first = allowed(registry, 'first')
		const second = allowed(registry, 'second')
		const third = allowed(registry, 'third')
		finish()
		await registry.saved()
		expect(saves.map(rows => rows.map(row => row.clientId))).toEqual([[first.clientId], [first.clientId, second.clientId, third.clientId]])
	})

	it('saves a change made just as a save finishes', async () => {
		const saves: string[][] = []
		let finish: () => void = () => undefined
		const slow: LocalClientStore = {
			load: () => Promise.resolve([]),
			save: records => {
				saves.push(records.map(row => row.clientId))
				return saves.length === 1 ? new Promise(resolve => (finish = resolve)) : Promise.resolve()
			}
		}
		const registry = await LocalClientRegistry.load({store: slow, secretsStorable: () => true, log: {info: vi.fn(), warn: vi.fn(), error: vi.fn()}})
		registries.push(registry)
		const client = allowed(registry)
		finish()
		// Runs after the save's last check for changes, before it counts as done.
		queueMicrotask(() => registry.remove(client.clientId))
		await new Promise(resolve => setTimeout(resolve, 0))
		await registry.saved()
		expect(saves).toEqual([[client.clientId], []])
	})
})

describe('LocalClientRegistry connections', () => {
	it('counts connections per client and updates lastSeenAt as they open and close', async () => {
		vi.useFakeTimers({now: 1000})
		const {registry, store, changes} = await load({store: new MemoryLocalClientStore([record()])})
		const connectedNow = () => registry.snapshot().clients.map(({connected, lastSeenAt}) => ({connected, lastSeenAt}))
		vi.setSystemTime(2000)
		const endFirst = registry.connected('known-1')
		expect(connectedNow()).toEqual([{connected: true, lastSeenAt: 2000}])
		vi.setSystemTime(3000)
		const endSecond = registry.connected('known-1')
		vi.setSystemTime(4000)
		endFirst()
		expect(connectedNow()).toEqual([{connected: true, lastSeenAt: 4000}])
		// Once only.
		endFirst()
		expect(connectedNow()).toEqual([{connected: true, lastSeenAt: 4000}])
		vi.setSystemTime(5000)
		endSecond()
		expect(connectedNow()).toEqual([{connected: false, lastSeenAt: 5000}])
		expect(changes).toHaveBeenCalledTimes(4)
		await registry.saved()
		expect(store.records).toEqual([record({lastSeenAt: 5000})])
	})

	it('forgets the connections of a removed client', async () => {
		const {registry, store} = await load({store: new MemoryLocalClientStore([record()])})
		const end = registry.connected('known-1')
		registry.remove('known-1')
		end()
		await registry.saved()
		expect(registry.snapshot().clients).toEqual([])
		expect(store.records).toEqual([])
	})

	it('ignores a connection for a client it does not know', async () => {
		const {registry, changes} = await load()
		registry.connected('nobody')()
		expect(changes).not.toHaveBeenCalled()
		expect(registry.snapshot().clients).toEqual([])
	})
})
