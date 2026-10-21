import {randomBytes, timingSafeEqual} from 'node:crypto'
import {
	CONTROL_METHODS,
	CONTROL_PROTOCOL_MAJORS,
	type ControlDiscovery,
	type ControlError,
	type ControlErrorCode,
	type ControlMethod,
	type ControlParams,
	type ControlResponseEnvelope,
	type ControlResult,
	controlEventEnvelopeSchema,
	controlResponseEnvelopeSchema,
	HANDSHAKE_TIMEOUT_MS,
	handshakeClientProof,
	handshakeServerProof,
	parseControlResult
} from 'arroxy-control'
import {z} from 'zod'
import {ConnectionClosedError, LineConnection} from './connection'
import {readDiscovery, untrustedSocketDirReason} from './discovery'
import {type BridgeEnvironment, bridgeConfigDir, userDataCandidates} from './environment'
import {FileSecretStore, type StoredClient} from './store'
import {ARROXY_MCP_VERSION} from './version'

export const NOT_RUNNING_MESSAGE = 'Arroxy is not running. Open Arroxy and try again.'
const APPROVAL_PENDING_MESSAGE = 'Arroxy is asking you to allow arroxy-mcp. Choose Allow in Arroxy, then try again.'

const CLIENT_NAME = 'arroxy-mcp'
// Plain requests answer at once; this only catches an app that hangs.
const DEFAULT_REQUEST_TIMEOUT_MS = 30_000
// `wait` holds the request for up to its own timeoutMs; allow for the answer to travel.
const WAIT_TIMEOUT_MARGIN_MS = 15_000

// `notRunning`: no live app was found. `approvalPending`: the user still has to
// choose Allow. `clientRemoved`: the user removed this client in Arroxy.
// `denied`: the user denied the request to allow it, or it expired. `control`:
// the Control API answered with an error. `failed`: anything else.
export type BridgeFailureKind = 'notRunning' | 'approvalPending' | 'clientRemoved' | 'denied' | 'control' | 'failed'

export interface BridgeFailure {
	readonly kind: BridgeFailureKind
	readonly message: string
	// One line telling the caller what to do next.
	readonly next?: string
	readonly code?: ControlErrorCode
}

export type CallOutcome<T> = {readonly ok: true; readonly value: T} | {readonly ok: false; readonly failure: BridgeFailure}

export function formatFailure(failure: BridgeFailure): string {
	return failure.next === undefined ? failure.message : `${failure.message}\n${failure.next}`
}

class BridgeFailureError extends Error {
	constructor(readonly failure: BridgeFailure) {
		super(failure.message)
		this.name = 'BridgeFailureError'
	}
}

class TimeoutError extends Error {}

function fail(kind: BridgeFailureKind, message: string, next?: string): BridgeFailureError {
	return new BridgeFailureError(next === undefined ? {kind, message} : {kind, message, next})
}

function controlFailure(error: ControlError): BridgeFailureError {
	return new BridgeFailureError({kind: 'control', code: error.code, message: error.message, next: error.next})
}

function sameProof(expected: string, received: string): boolean {
	const a = Buffer.from(expected)
	const b = Buffer.from(received)
	return a.length === b.length && timingSafeEqual(a, b)
}

const waitTimeoutSchema = z.object({timeoutMs: z.number()})

function requestTimeoutMs(method: ControlMethod, params: unknown, fallback: number): number {
	if (method !== 'wait') return fallback
	const parsed = waitTimeoutSchema.safeParse(params)
	return parsed.success ? parsed.data.timeoutMs + WAIT_TIMEOUT_MARGIN_MS : fallback
}

type Exchange = (method: ControlMethod, params: unknown) => Promise<unknown>

function parseResult<M extends ControlMethod>(method: M, raw: unknown): ControlResult<M> {
	const parsed = parseControlResult(method, raw)
	if (!parsed.success) throw fail('failed', `Arroxy answered ${method} with a result this bridge does not understand: ${z.prettifyError(parsed.error)}`, 'Update arroxy-mcp and Arroxy to their latest versions.')
	return parsed.data
}

// One authenticated connection; requests on it run one after another.
export interface ControlSession {
	request<M extends ControlMethod>(method: M, params: ControlParams<M>): Promise<ControlResult<M>>
}

export interface ArroxyClientOptions {
	readonly environment: BridgeEnvironment
	// Where diagnostics go. Never stdout: in serve mode that carries MCP.
	readonly log?: (line: string) => void
	readonly handshakeTimeoutMs?: number
	readonly requestTimeoutMs?: number
}

interface OpenedConnection {
	readonly connection: LineConnection
	readonly discovery: ControlDiscovery
	readonly userDataDir: string
}

// Talks to the running Arroxy app over its control socket. Each call opens a
// fresh connection, reads the discovery file again and runs the handshake, so
// an app restart is picked up without restarting the bridge.
export class ArroxyClient {
	private readonly store: FileSecretStore
	private readonly log: (line: string) => void
	private readonly handshakeTimeoutMs: number
	private readonly requestTimeoutMs: number

	constructor(private readonly options: ArroxyClientOptions) {
		this.store = new FileSecretStore(bridgeConfigDir(options.environment), options.environment.platform)
		this.log = options.log ?? (() => undefined)
		this.handshakeTimeoutMs = options.handshakeTimeoutMs ?? HANDSHAKE_TIMEOUT_MS
		this.requestTimeoutMs = options.requestTimeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS
	}

	call<M extends ControlMethod>(method: M, params: ControlParams<M>): Promise<CallOutcome<ControlResult<M>>> {
		return this.session(session => session.request(method, params))
	}

	// For callers whose method is only known at run time (the CLI). The result
	// is still validated against the method's result schema.
	callUnchecked(method: ControlMethod, params: unknown): Promise<CallOutcome<unknown>> {
		return this.withConnection(async exchange => {
			const raw = await exchange(method, params)
			parseResult(method, raw)
			return raw
		})
	}

	// Several requests on one connection, such as status and profiles.list.
	session<T>(work: (session: ControlSession) => Promise<T>): Promise<CallOutcome<T>> {
		return this.withConnection(exchange => work({request: async (method, params) => parseResult(method, await exchange(method, params))}))
	}

	private async withConnection<T>(work: (exchange: Exchange) => Promise<T>): Promise<CallOutcome<T>> {
		let opened: OpenedConnection | undefined
		try {
			opened = await this.open()
			await this.handshake(opened)
			const connection = opened.connection
			let counter = 0
			return {ok: true, value: await work((method, params) => this.exchange(connection, `r${++counter}`, method, params))}
		} catch (error) {
			if (error instanceof BridgeFailureError) return {ok: false, failure: error.failure}
			return {ok: false, failure: {kind: 'failed', message: error instanceof Error ? error.message : String(error)}}
		} finally {
			opened?.connection.close()
		}
	}

	// The first candidate folder whose control.json names a socket that accepts
	// a connection. A dead socket left by a crash simply fails to connect.
	private async open(): Promise<OpenedConnection> {
		for (const userDataDir of userDataCandidates(this.options.environment)) {
			const discovery = await readDiscovery(userDataDir)
			if (discovery === null) continue
			const reason = await untrustedSocketDirReason(discovery.socketPath, this.options.environment.platform)
			if (reason !== null) {
				this.log(`arroxy-mcp: not connecting to ${discovery.socketPath}: ${reason}.`)
				continue
			}
			try {
				const connection = await LineConnection.open(discovery.socketPath, this.handshakeTimeoutMs)
				return {connection, discovery, userDataDir}
			} catch {
				continue
			}
		}
		throw fail('notRunning', NOT_RUNNING_MESSAGE)
	}

	private async handshake({connection, discovery, userDataDir}: OpenedConnection): Promise<void> {
		const deadline = setTimeout(() => connection.close(new TimeoutError()), this.handshakeTimeoutMs)
		try {
			await this.authenticate(connection, discovery, userDataDir)
		} catch (error) {
			if (error instanceof TimeoutError) throw fail('failed', `Arroxy did not finish the handshake within ${this.handshakeTimeoutMs} ms.`, 'Try again; if it keeps happening, restart Arroxy.')
			throw error
		} finally {
			clearTimeout(deadline)
		}
	}

	private async authenticate(connection: LineConnection, discovery: ControlDiscovery, userDataDir: string): Promise<void> {
		// The first frame carries no secret: whoever holds the socket must prove
		// it knows the token before this side proves anything.
		const clientNonce = randomBytes(32).toString('base64url')
		connection.send({type: 'request', id: 'h1', method: 'hello', params: {protocol: {majors: [...CONTROL_PROTOCOL_MAJORS]}, client: {name: CLIENT_NAME, version: ARROXY_MCP_VERSION}, clientNonce}})
		const hello = await this.response(connection, 'h1')
		if (!hello.ok) throw controlFailure(hello.error)
		const challenge = parseControlResult('hello', hello.result)
		if (!challenge.success || !sameProof(await handshakeServerProof(discovery.token, clientNonce), challenge.data.serverProof)) {
			connection.close()
			throw fail('failed', "The program on Arroxy's control socket could not prove it is Arroxy, so arroxy-mcp sent it nothing.", 'Quit and reopen Arroxy, then try again.')
		}
		const {serverNonce} = challenge.data

		const stored = await this.store.get(userDataDir)
		const credential = await this.authParams(stored, discovery.token, serverNonce, clientNonce)
		connection.send({type: 'request', id: 'h2', method: 'auth', params: credential.params})
		const auth = await this.response(connection, 'h2')
		if (!auth.ok) return this.authFailed(auth.error, credential.kind, stored, userDataDir)
		const accepted = parseControlResult('auth', auth.result)
		if (!accepted.success) throw fail('failed', 'Arroxy answered auth with a result this bridge does not understand.', 'Update arroxy-mcp and Arroxy to their latest versions.')
		// Issued exactly once, on the auth that collects an approval.
		if (accepted.data.clientSecret !== undefined) await this.store.set(userDataDir, {clientId: accepted.data.clientId, clientSecret: accepted.data.clientSecret})
	}

	private async authParams(stored: StoredClient | null, token: string, serverNonce: string, clientNonce: string): Promise<{readonly kind: 'secret' | 'approval' | 'token'; readonly params: unknown}> {
		if (stored !== null && 'clientSecret' in stored) return {kind: 'secret', params: {clientId: stored.clientId, proof: await handshakeClientProof(stored.clientSecret, serverNonce, clientNonce)}}
		const proof = await handshakeClientProof(token, serverNonce, clientNonce)
		if (stored !== null) return {kind: 'approval', params: {approvalId: stored.approvalId, proof}}
		return {kind: 'token', params: {proof}}
	}

	private async authFailed(error: ControlError, credential: 'secret' | 'approval' | 'token', stored: StoredClient | null, userDataDir: string): Promise<never> {
		if (error.code === 'approval_pending') {
			const approvalId = error.details?.approvalId ?? (stored !== null && 'approvalId' in stored ? stored.approvalId : undefined)
			if (approvalId !== undefined) await this.store.set(userDataDir, {approvalId})
			throw fail('approvalPending', APPROVAL_PENDING_MESSAGE)
		}
		if (error.code === 'unauthorized' && credential === 'secret') {
			await this.store.delete(userDataDir)
			throw fail('clientRemoved', 'Arroxy no longer allows arroxy-mcp: it was removed in Arroxy.', 'Run the command again to ask Arroxy for access, then choose Allow in Arroxy.')
		}
		if (error.code === 'unauthorized' && credential === 'approval') {
			await this.store.delete(userDataDir)
			throw fail('denied', 'Arroxy did not allow arroxy-mcp: the request was denied or has expired.', 'Run the command again to ask Arroxy for access, then choose Allow in Arroxy.')
		}
		throw controlFailure(error)
	}

	private async exchange(connection: LineConnection, id: string, method: ControlMethod, params: unknown): Promise<unknown> {
		const timeoutMs = requestTimeoutMs(method, params, this.requestTimeoutMs)
		const timer = setTimeout(() => connection.close(new TimeoutError()), timeoutMs)
		try {
			connection.send({type: 'request', id, method, params})
			const response = await this.response(connection, id)
			if (!response.ok) throw controlFailure(response.error)
			return response.result
		} catch (error) {
			if (error instanceof TimeoutError) throw fail('failed', `Arroxy did not answer ${method} within ${Math.round(timeoutMs / 1000)} s.`, "Try again; if it keeps happening, check Arroxy's log.")
			throw error
		} finally {
			clearTimeout(timer)
		}
	}

	// The response to `id`, skipping event frames. A failure with a null id is
	// the app's closing line (handshake_timeout) and answers whatever was pending.
	private async response(connection: LineConnection, id: string): Promise<ControlResponseEnvelope> {
		for (;;) {
			let message: unknown
			try {
				message = await connection.next()
			} catch (error) {
				if (error instanceof ConnectionClosedError) throw fail('failed', `${error.message} No answer arrived.`, 'Try again; if it keeps happening, restart Arroxy.')
				throw error
			}
			if (controlEventEnvelopeSchema.safeParse(message).success) continue
			const parsed = controlResponseEnvelopeSchema.safeParse(message)
			if (!parsed.success) throw fail('failed', 'Arroxy sent a message this bridge does not understand.', 'Update arroxy-mcp and Arroxy to their latest versions.')
			if (parsed.data.id === id || parsed.data.id === null) return parsed.data
		}
	}
}

// Validates params against the method's schema before anything is sent.
export function checkParams(method: ControlMethod, params: unknown): {readonly ok: true; readonly params: unknown} | {readonly ok: false; readonly message: string} {
	const parsed = CONTROL_METHODS[method].params.safeParse(params)
	return parsed.success ? {ok: true, params: parsed.data} : {ok: false, message: `Invalid input for ${method}: ${z.prettifyError(parsed.error)}`}
}
