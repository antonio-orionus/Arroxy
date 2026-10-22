// @vitest-environment node

import {afterEach, describe, expect, it, vi} from 'vite-plus/test'
import {HANDSHAKE_MAX_FRAME_BYTES, handshakeServerProof} from 'arroxy-control'
import {SESSION_MAX_FRAME_BYTES} from '@main/control/socket/controlConnection.js'
import {allowedClient, handshake, hello, nonce, RawClient, READY, secretProof, type SocketHarness, startHarness, tokenProof} from '../helpers/controlSocketHarness.js'

// The control socket's handshake against a real server on this OS: hello,
// the challenge, then auth for a known client, a new one, or one collecting
// its approval. Every refused path writes exactly one closing line.

const harnesses: SocketHarness[] = []

afterEach(async () => {
	for (const harness of harnesses.splice(0)) await harness.cleanup()
})

async function start(overrides: Parameters<typeof startHarness>[0] = {}): Promise<SocketHarness> {
	const harness = await startHarness(overrides)
	harnesses.push(harness)
	return harness
}

const errorLine = (id: string | null, code: string) => ({type: 'response', id, ok: false, error: expect.objectContaining({code})})

async function closedWith(client: RawClient, lines: unknown[]): Promise<void> {
	await client.closed
	expect(client.lines).toEqual(lines)
}

describe('control socket handshake', () => {
	it('lets a known client in and hands its requests to a session', async () => {
		const harness = await start()
		const {token} = await harness.discovery()
		const {clientId, secret} = allowedClient(harness.approvals, true)
		const client = await RawClient.connect(harness.socket.socketPath)
		const clientNonce = nonce()
		client.request('h1', 'hello', hello(clientNonce))
		const challenge = await client.line(1)
		expect(challenge).toEqual({type: 'response', id: 'h1', ok: true, result: {serverProof: await handshakeServerProof(token, clientNonce), serverNonce: expect.stringMatching(/^[A-Za-z0-9_-]{43}$/)}})
		client.socket.destroy()

		const {client: known, auth} = await handshake(harness.socket.socketPath, secretProof(clientId, secret))
		expect(auth).toEqual({type: 'response', id: 'h2', ok: true, result: {protocol: 1, appVersion: '9.9.9', bootId: 'boot-1', clientId, rules: ['trusted', 'paths.read']}})
		known.request('r1', 'status')
		expect(await known.line(3)).toEqual({type: 'response', id: 'r1', ok: true, result: READY})
		expect(harness.service.sessions.map(session => session.context)).toEqual([{clientId, kind: 'localClient', label: 'test-client', rules: ['trusted', 'paths.read']}])
	})

	it('asks the user to allow a new client, then issues its secret once', async () => {
		const harness = await start()
		const {token} = await harness.discovery()
		const first = await handshake(harness.socket.socketPath, tokenProof(token))
		expect(first.auth).toEqual(errorLine('h2', 'approval_pending'))
		await first.client.closed
		const [pending] = harness.approvals.snapshot().pending
		if (!pending) throw new Error('no pending approval')
		expect(pending.label).toBe('test-client')
		expect(first.auth).toMatchObject({error: {details: {approvalId: pending.approvalId}}})

		const early = await handshake(harness.socket.socketPath, tokenProof(token, {approvalId: pending.approvalId}))
		expect(early.auth).toMatchObject({ok: false, error: {code: 'approval_pending', details: {approvalId: pending.approvalId}}})

		harness.approvals.allow(pending.approvalId, {pathsRead: false})
		const collect = await handshake(harness.socket.socketPath, tokenProof(token, {approvalId: pending.approvalId}))
		expect(collect.auth).toMatchObject({ok: true, result: {protocol: 1, rules: ['trusted'], clientSecret: expect.any(String)}})
		const {clientId, clientSecret} = (collect.auth as {result: {clientId: string; clientSecret: string}}).result
		expect(collect.client.isClosed()).toBe(false)
		// The approval is used up once the answer's write completes, when the session opens.
		await harness.service.firstSession()

		const again = await handshake(harness.socket.socketPath, tokenProof(token, {approvalId: pending.approvalId}))
		expect(again.auth).toEqual(errorLine('h2', 'unauthorized'))
		const known = await handshake(harness.socket.socketPath, secretProof(clientId, clientSecret))
		expect(known.auth).toMatchObject({ok: true, result: {clientId}})
		expect(known.auth).not.toHaveProperty('result.clientSecret')
	})

	it('refuses a denied request and a removed client', async () => {
		const harness = await start()
		const {token} = await harness.discovery()
		const approvalId = harness.approvals.request('test-client')
		harness.approvals.deny(approvalId)
		const denied = await handshake(harness.socket.socketPath, tokenProof(token, {approvalId}))
		await closedWith(denied.client, [expect.anything(), errorLine('h2', 'unauthorized')])
		const {clientId, secret} = allowedClient(harness.approvals)
		harness.approvals.remove(clientId)
		const removed = await handshake(harness.socket.socketPath, secretProof(clientId, secret))
		await closedWith(removed.client, [expect.anything(), errorLine('h2', 'unauthorized')])
	})

	it('refuses a proof made with the wrong token, writing one closing line', async () => {
		const harness = await start()
		const {client} = await handshake(harness.socket.socketPath, tokenProof('not-the-token'))
		await closedWith(client, [expect.objectContaining({ok: true}), errorLine('h2', 'unauthorized')])
		expect(harness.approvals.snapshot().pending).toEqual([])
	})

	it('refuses a known client whose proof is not keyed by its secret', async () => {
		const harness = await start()
		const {token} = await harness.discovery()
		const {clientId} = allowedClient(harness.approvals)
		const {client} = await handshake(harness.socket.socketPath, secretProof(clientId, token))
		await closedWith(client, [expect.anything(), errorLine('h2', 'unauthorized')])
		expect(harness.service.sessions).toEqual([])
	})

	it('times out a silent connection with one handshake_timeout line', async () => {
		const harness = await start({handshakeTimeoutMs: 100})
		const silent = await RawClient.connect(harness.socket.socketPath)
		await closedWith(silent, [errorLine(null, 'handshake_timeout')])
		const stalled = await RawClient.connect(harness.socket.socketPath)
		stalled.request('h1', 'hello', hello(nonce()))
		await closedWith(stalled, [expect.objectContaining({id: 'h1', ok: true}), errorLine(null, 'handshake_timeout')])
	})

	it('drops an oversized first frame without writing anything', async () => {
		const harness = await start()
		const long = await RawClient.connect(harness.socket.socketPath)
		long.socket.write(`${JSON.stringify({type: 'request', id: 'h1', method: 'hello', params: {pad: 'x'.repeat(HANDSHAKE_MAX_FRAME_BYTES)}})}\n`)
		await closedWith(long, [])
		const endless = await RawClient.connect(harness.socket.socketPath)
		endless.socket.write('x'.repeat(HANDSHAKE_MAX_FRAME_BYTES + 1))
		await closedWith(endless, [])
	})

	it('drops a line that is not JSON or not an envelope without writing anything', async () => {
		const harness = await start()
		const garbage = await RawClient.connect(harness.socket.socketPath)
		garbage.socket.write('hello there\n')
		await closedWith(garbage, [])
		const extra = await RawClient.connect(harness.socket.socketPath)
		extra.send({type: 'request', id: 'h1', method: 'hello', params: hello(nonce()), extra: true})
		await closedWith(extra, [])
	})

	it('refuses a method before hello and a second hello', async () => {
		const harness = await start()
		const early = await RawClient.connect(harness.socket.socketPath)
		early.request('r1', 'status')
		await closedWith(early, [errorLine('r1', 'unauthorized')])
		const twice = await RawClient.connect(harness.socket.socketPath)
		twice.request('h1', 'hello', hello(nonce()))
		twice.request('h2', 'hello', hello(nonce()))
		await closedWith(twice, [expect.objectContaining({id: 'h1', ok: true}), errorLine('h2', 'unauthorized')])
	})

	it('refuses a hello with bad params or no shared major, naming both ranges', async () => {
		const harness = await start()
		const bad = await RawClient.connect(harness.socket.socketPath)
		bad.request('h1', 'hello', {clientNonce: 'short'})
		await closedWith(bad, [errorLine('h1', 'invalid_request')])
		const future = await RawClient.connect(harness.socket.socketPath)
		future.request('h1', 'hello', hello(nonce(), [2, 3]))
		await closedWith(future, [errorLine('h1', 'version_unsupported')])
		expect(future.lines[0]).toMatchObject({error: {details: {clientMajors: [2, 3], serverMajors: [1]}}})
	})
})

describe('control socket session', () => {
	async function signedIn(overrides: Parameters<typeof startHarness>[0] = {}) {
		const harness = await start(overrides)
		const {clientId, secret} = allowedClient(harness.approvals)
		const {client} = await handshake(harness.socket.socketPath, secretProof(clientId, secret))
		const session = await harness.service.firstSession()
		return {harness, client, session}
	}

	it('answers in the order requests complete, echoing their ids', async () => {
		const {client} = await signedIn({delays: {'queue.list': 80}})
		client.request('slow', 'queue.list', {})
		client.request('fast', 'status')
		await client.line(4)
		expect(client.lines.slice(2).map(line => (line as {id: string}).id)).toEqual(['fast', 'slow'])
	})

	it('answers an unknown method with invalid_request and stays open', async () => {
		const {client} = await signedIn()
		client.request('r1', 'queue.explode')
		expect(await client.line(3)).toEqual(errorLine('r1', 'invalid_request'))
		client.request('r2', 'status')
		expect(await client.line(4)).toMatchObject({id: 'r2', ok: true})
	})

	it('takes frames past the handshake cap after auth, up to the session cap', async () => {
		const {client} = await signedIn()
		client.request('r1', 'queue.list', {cursor: 'c'.repeat(HANDSHAKE_MAX_FRAME_BYTES * 2)})
		expect(await client.line(3)).toMatchObject({id: 'r1', ok: true})
		client.request('r2', 'queue.list', {cursor: 'c'.repeat(SESSION_MAX_FRAME_BYTES)})
		await client.closed
		expect(client.lines).toHaveLength(3)
	})

	it('closes on a line that is not an envelope, and closing closes the session', async () => {
		const {client, session} = await signedIn()
		client.socket.write('[]\n')
		await client.closed
		await expect.poll(() => session.close.mock.calls.length).toBe(1)
	})

	it('writes the session events as lines and reports backpressure', async () => {
		const {client, session} = await signedIn()
		const drained: string[] = []
		session.sink.onDrain(() => drained.push('drain'))
		expect(session.sink.write(JSON.stringify({type: 'event', event: 'status', seq: 0, bootId: 'boot-1', data: {}}))).toBe(true)
		expect(await client.line(3)).toMatchObject({type: 'event', seq: 0})
		client.socket.pause()
		const big = JSON.stringify({type: 'event', event: 'status', seq: 1, bootId: 'boot-1', data: {pad: 'x'.repeat(1 << 20)}})
		let writes = 0
		while (session.sink.write(big) && writes < 64) writes++
		expect(writes).toBeLessThan(64)
		client.socket.resume()
		await expect.poll(() => drained.length).toBeGreaterThan(0)
	})
})

describe('control socket and the local client registry', () => {
	// Counts each connection's release, which must come once per session.
	function countReleases(harness: SocketHarness) {
		const releases = vi.fn()
		const connected = harness.approvals.connected.bind(harness.approvals)
		vi.spyOn(harness.approvals, 'connected').mockImplementation(clientId => {
			const end = connected(clientId)
			return () => {
				releases(clientId)
				end()
			}
		})
		return releases
	}

	const connectedNow = (harness: SocketHarness, clientId: string): boolean | undefined => harness.approvals.snapshot().clients.find(client => client.clientId === clientId)?.connected

	it('keeps a collected client in the store, and a removed one out of it, closing its live connection', async () => {
		const harness = await start()
		const {token} = await harness.discovery()
		const approvalId = harness.approvals.request('test-client')
		harness.approvals.allow(approvalId, {pathsRead: false})
		const collect = await handshake(harness.socket.socketPath, tokenProof(token, {approvalId}))
		const {clientId, clientSecret} = (collect.auth as {result: {clientId: string; clientSecret: string}}).result
		await harness.service.firstSession()
		await harness.approvals.saved()
		expect(harness.store.records).toEqual([expect.objectContaining({clientId, label: 'test-client', secret: clientSecret})])

		harness.approvals.remove(clientId)
		await collect.client.closed
		await harness.approvals.saved()
		expect(harness.store.records).toEqual([])
		const again = await handshake(harness.socket.socketPath, secretProof(clientId, clientSecret))
		await closedWith(again.client, [expect.anything(), errorLine('h2', 'unauthorized')])
	})

	it('shows a client connected while a session is open, released once on every way it closes', async () => {
		const harness = await start()
		const releases = countReleases(harness)
		const {clientId, secret} = allowedClient(harness.approvals)
		expect(connectedNow(harness, clientId)).toBe(false)

		// The client hangs up.
		const first = await handshake(harness.socket.socketPath, secretProof(clientId, secret))
		await expect.poll(() => connectedNow(harness, clientId)).toBe(true)
		first.client.socket.destroy()
		await expect.poll(() => connectedNow(harness, clientId)).toBe(false)
		expect(releases).toHaveBeenCalledTimes(1)

		// The server drops it.
		const second = await handshake(harness.socket.socketPath, secretProof(clientId, secret))
		await expect.poll(() => connectedNow(harness, clientId)).toBe(true)
		second.client.socket.write('[]\n')
		await second.client.closed
		await expect.poll(() => releases.mock.calls.length).toBe(2)
		expect(connectedNow(harness, clientId)).toBe(false)

		// Two at once, then the socket stops.
		await handshake(harness.socket.socketPath, secretProof(clientId, secret))
		await handshake(harness.socket.socketPath, secretProof(clientId, secret))
		await expect.poll(() => harness.service.sessions.length).toBe(4)
		expect(connectedNow(harness, clientId)).toBe(true)
		await harness.socket.stop()
		await expect.poll(() => releases.mock.calls.length).toBe(4)
		expect(connectedNow(harness, clientId)).toBe(false)
	})

	it('counts no session for a connection that never opened one', async () => {
		const harness = await start({failOpen: true})
		const releases = countReleases(harness)
		const {clientId, secret} = allowedClient(harness.approvals)
		const {client} = await handshake(harness.socket.socketPath, secretProof(clientId, secret))
		await client.closed
		expect(harness.approvals.connected).not.toHaveBeenCalled()
		expect(releases).not.toHaveBeenCalled()
		expect(connectedNow(harness, clientId)).toBe(false)
	})
})
