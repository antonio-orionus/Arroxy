import {randomBytes} from 'node:crypto'
import fs from 'node:fs/promises'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'
import {CONTROL_DISCOVERY_FILE_NAME, CONTROL_METHODS, type ControlError, controlError, controlRequestEnvelopeSchema, handshakeClientProof, handshakeServerProof, parseControlRequest} from 'arroxy-control'

// An in-process stand-in for the Arroxy app's control socket: it writes the
// discovery file, runs the handshake with arroxy-control's helpers and answers
// a handful of methods. Every test runs against it, never a real Arroxy.

export type FakeAnswer = {readonly result: unknown} | {readonly error: ControlError}
// `lines`: written verbatim, for frames a normal answer never sends (an event
// first, a closing line with a null id). `silent`: never answers.
type FakeReply = FakeAnswer | {readonly lines: readonly unknown[]} | {readonly silent: true}
type FakeHandler = (params: unknown, id: string) => FakeReply

// Survives an app restart, like the real app's list of allowed clients.
export interface FakeClientRegistry {
	readonly secrets: Map<string, string>
	readonly approvals: Map<string, 'pending' | 'allowed'>
}

function newRegistry(): FakeClientRegistry {
	return {secrets: new Map(), approvals: new Map()}
}

export interface FakeAppOptions {
	readonly userDataDir: string
	readonly socketPath: string
	readonly token?: string
	readonly forgeServerProof?: boolean
	readonly registry?: FakeClientRegistry
	readonly handlers?: Readonly<Record<string, FakeHandler>>
	// Answer auth with the app's closing handshake_timeout line (id null) and close.
	readonly handshakeTimeoutOnAuth?: boolean
	// Like the real app: a connection still unauthenticated this long after
	// connect gets the closing handshake_timeout line and is closed.
	readonly handshakeWindowMs?: number
}

// Every method each connection received, in order.
export type FakeConnectionLog = string[]

const QUEUE_ITEM = {id: 'q1', title: 'A video', site: 'youtube', status: 'pending', progress: null, lane: 'normal', origin: {kind: 'localClient', clientId: 'c1', label: 'arroxy-mcp'}, intakeId: 'i1', error: null}
const INTAKE = {intakeId: 'i1', placeholderId: 'q1', state: {state: 'probing'}, updatedAt: 1760000000000}

const DEFAULT_HANDLERS: Readonly<Record<string, FakeHandler>> = {
	status: () => ({result: {ready: true, binaries: {ytDlp: 'ready', ffmpeg: 'ready'}, scheduler: 'running', cooldowns: []}}),
	'profiles.list': () => ({result: {profiles: [{ref: {kind: 'builtin', id: 'best'}, label: 'Best quality', kind: 'videoAudio'}], active: {kind: 'builtin', id: 'best'}}}),
	'links.add': () => ({result: {intakeId: 'i1', placeholderId: 'q1'}}),
	'queue.list': () => ({result: {items: [QUEUE_ITEM], nextCursor: null}}),
	'queue.get': () => ({result: {item: QUEUE_ITEM}}),
	'intake.get': () => ({result: {intake: INTAKE}}),
	wait: () => ({result: {reached: true, target: {kind: 'intake', intake: INTAKE}}}),
	'queue.pause': () => ({result: {item: {...QUEUE_ITEM, status: 'paused'}}}),
	'queue.remove': () => ({result: {itemId: 'q1'}}),
	'queue.pauseAll': () => ({result: {scheduler: 'paused', done: ['q1'], failed: []}}),
	'intake.choose': () => ({result: {intake: {...INTAKE, state: {state: 'queued', itemIds: ['q2']}}}})
}

function nonce(): string {
	return randomBytes(32).toString('base64url')
}

export class FakeApp {
	readonly token: string
	readonly registry: FakeClientRegistry
	readonly connections: FakeConnectionLog[] = []
	readonly requests: Array<{readonly method: string; readonly params: unknown}> = []
	private readonly server = net.createServer(socket => this.accept(socket))
	private readonly sockets = new Set<net.Socket>()

	constructor(private readonly options: FakeAppOptions) {
		this.token = options.token ?? nonce()
		this.registry = options.registry ?? newRegistry()
	}

	async start(): Promise<void> {
		await new Promise<void>((resolve, reject) => {
			this.server.once('error', reject)
			this.server.listen(this.options.socketPath, () => resolve())
		})
		await fs.mkdir(this.options.userDataDir, {recursive: true})
		const discovery = {socketPath: this.options.socketPath, token: this.token, version: '0.9.0', startedAt: Date.now()}
		await fs.writeFile(path.join(this.options.userDataDir, CONTROL_DISCOVERY_FILE_NAME), JSON.stringify(discovery))
	}

	// Stops listening but leaves control.json behind, as a crash would.
	async stop(): Promise<void> {
		for (const socket of this.sockets) socket.destroy()
		await new Promise<void>(resolve => this.server.close(() => resolve()))
	}

	pendingApprovals(): string[] {
		return [...this.registry.approvals].filter(([, state]) => state === 'pending').map(([approvalId]) => approvalId)
	}

	allow(approvalId: string): void {
		this.registry.approvals.set(approvalId, 'allowed')
	}

	removeClient(clientId: string): void {
		this.registry.secrets.delete(clientId)
	}

	openConnections(): number {
		return this.sockets.size
	}

	private accept(socket: net.Socket): void {
		this.sockets.add(socket)
		socket.on('close', () => this.sockets.delete(socket))
		socket.on('error', () => undefined)
		const log: FakeConnectionLog = []
		this.connections.push(log)
		let stage: 'hello' | 'auth' | 'ready' = 'hello'
		let clientNonce = ''
		let serverNonce = ''
		let buffer = ''
		let chain = Promise.resolve()
		const write = (value: unknown): void => {
			if (!socket.destroyed) socket.write(`${JSON.stringify(value)}\n`)
		}
		const fail = (id: string | null, error: ControlError): void => {
			write({type: 'response', id, ok: false, error})
		}
		if (this.options.handshakeWindowMs !== undefined) {
			const window = setTimeout(() => {
				if (stage !== 'ready') {
					fail(null, controlError('handshake_timeout', 'The handshake took too long.'))
					socket.end()
				}
			}, this.options.handshakeWindowMs)
			socket.on('close', () => clearTimeout(window))
		}
		const handle = async (line: string): Promise<void> => {
			const envelope = controlRequestEnvelopeSchema.safeParse(JSON.parse(line))
			if (!envelope.success) return void socket.destroy()
			const {id, method} = envelope.data
			log.push(method)
			const parsed = parseControlRequest(envelope.data)
			if (!parsed.ok) return fail(id, parsed.error)
			const request = parsed.request
			if (stage === 'hello') {
				if (request.method !== 'hello') return void (fail(id, controlError('unauthorized', 'Say hello first.')), socket.end())
				clientNonce = request.params.clientNonce
				serverNonce = nonce()
				const serverProof = await handshakeServerProof(this.options.forgeServerProof ? 'not-the-token' : this.token, clientNonce)
				stage = 'auth'
				return write({type: 'response', id, ok: true, result: {serverProof, serverNonce}})
			}
			if (stage === 'auth') {
				if (request.method !== 'auth') return void (fail(id, controlError('unauthorized', 'Send auth.')), socket.end())
				if (this.options.handshakeTimeoutOnAuth) return void (fail(null, controlError('handshake_timeout', 'The handshake took too long.')), socket.end())
				const answer = await this.authenticate(request.params, serverNonce, clientNonce)
				if ('error' in answer) return void (fail(id, answer.error), socket.end())
				stage = 'ready'
				return write({type: 'response', id, ok: true, result: answer.result})
			}
			this.requests.push({method, params: request.params})
			const handler = this.options.handlers?.[method] ?? DEFAULT_HANDLERS[method]
			const answer = handler ? handler(request.params, id) : {error: controlError('internal', `The fake app does not answer ${method}.`)}
			if ('silent' in answer) return
			if ('lines' in answer) return void answer.lines.forEach(write)
			if ('error' in answer) return fail(id, answer.error)
			write({type: 'response', id, ok: true, result: answer.result})
		}
		socket.setEncoding('utf8')
		socket.on('data', (chunk: string) => {
			buffer += chunk
			let newline = buffer.indexOf('\n')
			while (newline !== -1) {
				const line = buffer.slice(0, newline)
				buffer = buffer.slice(newline + 1)
				chain = chain.then(() => handle(line))
				newline = buffer.indexOf('\n')
			}
		})
	}

	private async authenticate(params: unknown, serverNonce: string, clientNonce: string): Promise<FakeAnswer> {
		const parsed = CONTROL_METHODS.auth.params.safeParse(params)
		if (!parsed.success) return {error: controlError('invalid_request', 'Bad auth.')}
		const auth = parsed.data
		const accepted = {protocol: 1, appVersion: '0.9.0', bootId: 'b1', rules: ['trusted']}
		if (auth.clientId !== undefined) {
			const secret = this.registry.secrets.get(auth.clientId)
			if (secret === undefined || auth.proof !== (await handshakeClientProof(secret, serverNonce, clientNonce))) return {error: controlError('unauthorized', 'Unknown client.')}
			return {result: {...accepted, clientId: auth.clientId}}
		}
		if (auth.proof !== (await handshakeClientProof(this.token, serverNonce, clientNonce))) return {error: controlError('unauthorized', 'Bad proof.')}
		if (auth.approvalId !== undefined) {
			const state = this.registry.approvals.get(auth.approvalId)
			if (state === undefined) return {error: controlError('unauthorized', 'The request to allow this client was denied or has expired.')}
			if (state === 'pending') return {error: controlError('approval_pending', 'Waiting for the user to choose Allow.', {details: {approvalId: auth.approvalId}})}
			this.registry.approvals.delete(auth.approvalId)
			const clientId = `c${this.registry.secrets.size + 1}`
			const clientSecret = nonce()
			this.registry.secrets.set(clientId, clientSecret)
			return {result: {...accepted, clientId, clientSecret}}
		}
		const approvalId = `a${this.registry.approvals.size + 1}`
		this.registry.approvals.set(approvalId, 'pending')
		return {error: controlError('approval_pending', 'Waiting for the user to choose Allow.', {details: {approvalId}})}
	}
}

// A temp tree for one test: a 0700 socket dir, a userData dir and the bridge's
// config dir. Unix socket paths are capped near 104 bytes, so names stay short.
export interface Sandbox {
	readonly root: string
	readonly socketDir: string
	readonly userDataDir: string
	readonly configDir: string
	socketPath(name: string): string
	cleanup(): Promise<void>
}

export async function createSandbox(): Promise<Sandbox> {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), 'amcp-'))
	const socketDir = path.join(root, 's')
	await fs.mkdir(socketDir, {mode: 0o700})
	await fs.chmod(socketDir, 0o700)
	const userDataDir = path.join(root, 'u')
	const configDir = path.join(root, 'c')
	return {root, socketDir, userDataDir, configDir, socketPath: name => (process.platform === 'win32' ? `\\\\.\\pipe\\amcp-${path.basename(root)}-${name}` : path.join(socketDir, `${name}.sock`)), cleanup: () => fs.rm(root, {recursive: true, force: true})}
}
