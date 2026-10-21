import {randomBytes} from 'node:crypto'
import fs from 'node:fs/promises'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'
import {vi} from 'vite-plus/test'
import {type AppStatus, CONTROL_DISCOVERY_FILE_NAME, type ControlDiscovery, controlDiscoverySchema, controlResponseEnvelopeSchema, handshakeClientProof, parseControlResult} from 'arroxy-control'
import type {ControlResponse, ControlSession} from '@main/control/ControlService.js'
import type {ControlContext, ControlSink} from '@main/control/controlTypes.js'
import type {ControlSocketLog} from '@main/control/socket/controlConnection.js'
import {MemoryLocalClientApprovals} from '@main/control/socket/localClientApprovals.js'
import {type ControlSocket, type ControlSocketOptions, startControlSocket} from '@main/control/socket/startControlSocket.js'

// A real control socket on this OS (a /tmp launch folder, or a pipe on
// Windows) over a fake ControlService, and a raw line client to drive it.

export const READY: AppStatus = {ready: true, binaries: {ytDlp: 'ready', ffmpeg: 'ready'}, scheduler: 'running', cooldowns: []}

export interface OpenedSession {
	readonly context: ControlContext
	readonly sink: ControlSink
	readonly close: ReturnType<typeof vi.fn>
}

// Answers status at once and anything else after `delays[method]` ms with an
// empty result, so tests can see responses leave in completion order.
export function fakeService(delays: Readonly<Record<string, number>> = {}) {
	const sessions: OpenedSession[] = []
	const openSession = (context: ControlContext, sink: ControlSink): ControlSession => {
		const close = vi.fn()
		sessions.push({context, sink, close})
		return {
			close,
			handle: async (request): Promise<ControlResponse> => {
				const delay = delays[request.method]
				if (delay !== undefined) await new Promise(resolve => setTimeout(resolve, delay))
				if (request.method === 'status') return {ok: true, result: READY}
				return {ok: true, result: {}}
			}
		}
	}
	return {sessions, openSession}
}

export const silentLog = (): ControlSocketLog => ({info: vi.fn(), warn: vi.fn(), error: vi.fn()})

export interface SocketHarness {
	readonly socket: ControlSocket
	readonly userDataDir: string
	readonly approvals: MemoryLocalClientApprovals
	readonly service: ReturnType<typeof fakeService>
	discovery(): Promise<ControlDiscovery>
	cleanup(): Promise<void>
}

export async function startHarness(overrides: Partial<ControlSocketOptions> & {delays?: Record<string, number>} = {}): Promise<SocketHarness> {
	const userDataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'acs-'))
	const approvals = new MemoryLocalClientApprovals()
	const service = fakeService(overrides.delays)
	const socket = await startControlSocket({userDataDir, appVersion: '9.9.9', platform: process.platform, env: {}, service, approvals, bootId: 'boot-1', log: silentLog(), ...overrides})
	if (socket === null) throw new Error('the control socket did not start')
	return {
		socket,
		userDataDir,
		approvals,
		service,
		discovery: async () => controlDiscoverySchema.parse(JSON.parse(await fs.readFile(path.join(userDataDir, CONTROL_DISCOVERY_FILE_NAME), 'utf8'))),
		cleanup: async () => {
			await socket.stop()
			await fs.rm(userDataDir, {recursive: true, force: true})
		}
	}
}

// Every line the server wrote, and whether it closed.
export class RawClient {
	readonly lines: unknown[] = []
	readonly closed: Promise<void>
	private buffer = ''
	private waiters: Array<() => void> = []

	private constructor(readonly socket: net.Socket) {
		socket.setEncoding('utf8')
		socket.on('data', (chunk: string) => {
			this.buffer += chunk
			let newline = this.buffer.indexOf('\n')
			while (newline !== -1) {
				this.lines.push(JSON.parse(this.buffer.slice(0, newline)))
				this.buffer = this.buffer.slice(newline + 1)
				newline = this.buffer.indexOf('\n')
			}
			for (const wake of this.waiters.splice(0)) wake()
		})
		socket.on('error', () => undefined)
		this.closed = new Promise(resolve => socket.on('close', () => resolve()))
		void this.closed.then(() => {
			for (const wake of this.waiters.splice(0)) wake()
		})
	}

	static connect(socketPath: string): Promise<RawClient> {
		return new Promise((resolve, reject) => {
			const socket = net.createConnection(socketPath)
			socket.once('error', reject)
			socket.once('connect', () => {
				socket.off('error', reject)
				resolve(new RawClient(socket))
			})
		})
	}

	send(message: unknown): void {
		this.socket.write(`${JSON.stringify(message)}\n`)
	}

	request(id: string, method: string, params?: unknown): void {
		this.send(params === undefined ? {type: 'request', id, method} : {type: 'request', id, method, params})
	}

	// Waits for the `count`th line, or rejects if the socket closes first.
	async line(count = this.lines.length + 1): Promise<unknown> {
		while (this.lines.length < count) {
			if (this.socket.destroyed) throw new Error(`closed after ${this.lines.length} lines`)
			await new Promise<void>(resolve => this.waiters.push(resolve))
		}
		return this.lines[count - 1]
	}

	isClosed(): boolean {
		return this.socket.destroyed
	}
}

export const nonce = (): string => randomBytes(32).toString('base64url')

export const hello = (clientNonce: string, majors: number[] = [1]) => ({protocol: {majors}, client: {name: 'test-client', version: '1.0.0'}, clientNonce})

export interface Challenge {
	readonly serverProof: string
	readonly serverNonce: string
}

function challengeOf(line: unknown): Challenge {
	const envelope = controlResponseEnvelopeSchema.parse(line)
	const result = envelope.ok ? parseControlResult('hello', envelope.result) : null
	if (!result?.success) throw new Error(`no hello result in ${JSON.stringify(line)}`)
	return result.data
}

// hello then auth on a fresh connection; answers the client and the auth line.
export async function handshake(socketPath: string, credential: (challenge: Challenge, clientNonce: string) => Promise<unknown>): Promise<{client: RawClient; auth: unknown}> {
	const client = await RawClient.connect(socketPath)
	const clientNonce = nonce()
	client.request('h1', 'hello', hello(clientNonce))
	const challenge = challengeOf(await client.line(1))
	client.request('h2', 'auth', await credential(challenge, clientNonce))
	return {client, auth: await client.line(2)}
}

export const tokenProof =
	(token: string, extra: Record<string, string> = {}) =>
	async (challenge: Challenge, clientNonce: string): Promise<unknown> => ({...extra, proof: await handshakeClientProof(token, challenge.serverNonce, clientNonce)})

export const secretProof =
	(clientId: string, secret: string) =>
	async (challenge: Challenge, clientNonce: string): Promise<unknown> => ({clientId, proof: await handshakeClientProof(secret, challenge.serverNonce, clientNonce)})

// A client the user has already allowed.
export function allowedClient(approvals: MemoryLocalClientApprovals, pathsRead = false): {clientId: string; secret: string} {
	const approvalId = approvals.request('test-client')
	approvals.allow(approvalId, {pathsRead})
	const collected = approvals.collect(approvalId)
	if (collected.status !== 'allowed') throw new Error('expected allowed')
	return {clientId: collected.clientId, secret: collected.clientSecret}
}
