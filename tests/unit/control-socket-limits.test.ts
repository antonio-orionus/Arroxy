// @vitest-environment node

import net from 'node:net'
import {afterEach, describe, expect, it, vi} from 'vite-plus/test'
import {HANDSHAKE_MAX_FRAME_BYTES, handshakeClientProof} from 'arroxy-control'
import {CONTROL_IN_FLIGHT_MAX} from '@main/control/socket/controlConnection.js'
import {allowedClient, handshake, hello, nonce, RawClient, secretProof, silentLog, type SocketHarness, startHarness, tokenProof} from '../helpers/controlSocketHarness.js'

// The control socket under a client that misbehaves or vanishes: no side
// effect outlives a connection that went away, the handshake answers only
// unauthorized to the wrong method, slots and in-flight requests are capped,
// and a removed client's connections close.

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
type WriteCallback = (error?: Error | null) => void
const settle = (ms = 50): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

// hello, then auth sent and the connection dropped at once, while the server computes the proof.
async function authThenVanish(socketPath: string, credential: (serverNonce: string, clientNonce: string) => Promise<unknown>): Promise<void> {
	const client = await RawClient.connect(socketPath)
	const clientNonce = nonce()
	client.request('h1', 'hello', hello(clientNonce))
	const {result} = (await client.line(1)) as {result: {serverNonce: string}}
	client.request('h2', 'auth', await credential(result.serverNonce, clientNonce))
	client.socket.destroy()
	await client.closed
}

describe('a client that vanishes mid-handshake', () => {
	it('leaves an allowed approval collectable', async () => {
		const harness = await start()
		const {token} = await harness.discovery()
		const approvalId = harness.approvals.request('test-client')
		harness.approvals.allow(approvalId)
		for (let i = 0; i < 5; i++) await authThenVanish(harness.socket.socketPath, async (serverNonce, clientNonce) => ({approvalId, proof: await handshakeClientProof(token, serverNonce, clientNonce)}))
		await settle()
		const claim = harness.approvals.claim(approvalId)
		expect(claim.status).toBe('allowed')
		if (claim.status === 'allowed') expect(harness.approvals.client(claim.client.clientId)).toBeNull()
	})

	it('leaves no prompt behind', async () => {
		const harness = await start()
		const {token} = await harness.discovery()
		for (let i = 0; i < 5; i++) await authThenVanish(harness.socket.socketPath, async (serverNonce, clientNonce) => ({proof: await handshakeClientProof(token, serverNonce, clientNonce)}))
		await settle()
		expect(harness.approvals.pending()).toEqual([])
	})
})

describe('the handshake refuses the wrong method as unauthorized', () => {
	it('before hello: an unknown method, or a known one with bad params', async () => {
		const harness = await start()
		const unknown = await RawClient.connect(harness.socket.socketPath)
		unknown.request('r1', 'queue.explode')
		await unknown.closed
		expect(unknown.lines).toEqual([errorLine('r1', 'unauthorized')])
		const badParams = await RawClient.connect(harness.socket.socketPath)
		badParams.request('r1', 'queue.get', {itemId: 7})
		await badParams.closed
		expect(badParams.lines).toEqual([errorLine('r1', 'unauthorized')])
	})

	it('after hello: anything but auth', async () => {
		const harness = await start()
		const client = await RawClient.connect(harness.socket.socketPath)
		client.request('h1', 'hello', hello(nonce()))
		client.request('h2', 'hello', {})
		await client.closed
		expect(client.lines).toEqual([expect.objectContaining({ok: true}), errorLine('h2', 'unauthorized')])
	})
})

describe('control socket limits', () => {
	it('drops a connection whose session could not open', async () => {
		const harness = await start({failOpen: true})
		const {clientId, secret} = allowedClient(harness.approvals)
		const {client} = await handshake(harness.socket.socketPath, secretProof(clientId, secret))
		await client.closed
	})

	it('answers internal to a request that threw, and logs its method and error name only', async () => {
		const log = silentLog()
		const harness = await start({throwing: ['queue.list'], log})
		const {clientId, secret} = allowedClient(harness.approvals)
		const {client} = await handshake(harness.socket.socketPath, secretProof(clientId, secret))
		client.request('r1', 'queue.list', {})
		expect(await client.line(3)).toEqual(errorLine('r1', 'internal'))
		expect(log.error).toHaveBeenCalledWith('a control request failed inside', {method: 'queue.list', error: 'TypeError'})
	})

	it(`holds at most ${CONTROL_IN_FLIGHT_MAX} requests in flight per connection`, async () => {
		const harness = await start({held: ['queue.list']})
		const {clientId, secret} = allowedClient(harness.approvals)
		const {client} = await handshake(harness.socket.socketPath, secretProof(clientId, secret))
		const total = CONTROL_IN_FLIGHT_MAX + 6
		for (let i = 0; i < total; i++) client.request(`r${i}`, 'queue.list', {})
		await expect.poll(() => harness.service.handled.length).toBe(CONTROL_IN_FLIGHT_MAX)
		await settle()
		expect(harness.service.handled).toHaveLength(CONTROL_IN_FLIGHT_MAX)
		harness.service.release()
		await expect.poll(() => harness.service.handled.length).toBe(total)
		harness.service.release()
		await client.line(2 + total)
	})

	it('drops the oldest unauthenticated connection so an allowed client still gets in', async () => {
		const harness = await start({limits: {sessions: 4, handshakes: 2}})
		const squatters = [await RawClient.connect(harness.socket.socketPath), await RawClient.connect(harness.socket.socketPath)]
		const {clientId, secret} = allowedClient(harness.approvals)
		const {auth} = await handshake(harness.socket.socketPath, secretProof(clientId, secret))
		expect(auth).toMatchObject({ok: true})
		await squatters[0]?.closed
		expect(squatters[0]?.lines).toEqual([])
	})

	it('refuses a session past the cap without using up an approval', async () => {
		const harness = await start({limits: {sessions: 1, handshakes: 4}})
		const {token} = await harness.discovery()
		const first = allowedClient(harness.approvals)
		await handshake(harness.socket.socketPath, secretProof(first.clientId, first.secret))
		const approvalId = harness.approvals.request('second')
		harness.approvals.allow(approvalId)
		const {client, auth} = await handshake(harness.socket.socketPath, tokenProof(token, {approvalId}))
		expect(auth).toEqual(errorLine('h2', 'limit_exceeded'))
		await client.closed
		expect(harness.approvals.claim(approvalId).status).toBe('allowed')
	})

	it('serves a request larger than the handshake cap sent right behind auth', async () => {
		const harness = await start()
		const {clientId, secret} = allowedClient(harness.approvals)
		const client = await RawClient.connect(harness.socket.socketPath)
		const clientNonce = nonce()
		client.request('h1', 'hello', hello(clientNonce))
		const {result} = (await client.line(1)) as {result: {serverNonce: string}}
		const auth = {type: 'request', id: 'h2', method: 'auth', params: {clientId, proof: await handshakeClientProof(secret, result.serverNonce, clientNonce)}}
		const big = {type: 'request', id: 'r1', method: 'queue.list', params: {cursor: 'c'.repeat(HANDSHAKE_MAX_FRAME_BYTES * 2)}}
		client.socket.write(`${JSON.stringify(auth)}\n${JSON.stringify(big)}\n`)
		expect(await client.line(3)).toMatchObject({id: 'r1', ok: true})
	})

	it('closes a client removed while its auth answer is still being written', async () => {
		// The server's write callbacks fire late, as they can on a Windows pipe:
		// the client reads the answer and is removed before the write completes.
		const write = net.Socket.prototype.write
		const spy = vi.spyOn(net.Socket.prototype, 'write').mockImplementation(function (this: net.Socket, chunk: string | Uint8Array, encodingOrCallback?: BufferEncoding | WriteCallback, callback?: WriteCallback): boolean {
			if (typeof encodingOrCallback !== 'function') return write.call(this, chunk, encodingOrCallback, callback)
			return write.call(this, chunk, undefined, error => void setTimeout(() => encodingOrCallback(error), 100))
		})
		try {
			const harness = await start()
			const {clientId, secret} = allowedClient(harness.approvals)
			const {client, auth} = await handshake(harness.socket.socketPath, secretProof(clientId, secret))
			expect(auth).toMatchObject({ok: true})
			harness.approvals.remove(clientId)
			await client.closed
			await settle(150)
			expect(harness.service.sessions).toEqual([])
		} finally {
			spy.mockRestore()
		}
	})

	it('closes a removed client’s connections', async () => {
		const harness = await start()
		const {clientId, secret} = allowedClient(harness.approvals)
		const {client} = await handshake(harness.socket.socketPath, secretProof(clientId, secret))
		harness.approvals.remove(clientId)
		await client.closed
		expect(harness.service.sessions[0]?.close).toHaveBeenCalled()
	})
})
