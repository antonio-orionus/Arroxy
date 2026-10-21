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
import {FileSecretStore, SecretStoreError, type SecretStoreTransaction, type StoredClient} from './store'
import {ARROXY_MCP_VERSION} from './version'

export const NOT_RUNNING_MESSAGE = 'Arroxy is not running. Open Arroxy and try again.'
const APPROVAL_PENDING_MESSAGE = 'Arroxy is asking you to allow arroxy-mcp. Choose Allow in Arroxy, then try again.'
const ASK_AGAIN = 'Run the command again to ask Arroxy for access, then choose Allow in Arroxy.'

const CLIENT_NAME = 'arroxy-mcp'
// Plain requests answer at once; this only catches an app that hangs.
const DEFAULT_REQUEST_TIMEOUT_MS = 30_000
// `wait` holds the request for up to its own timeoutMs; allow for the answer to travel.
const DEFAULT_WAIT_TIMEOUT_MARGIN_MS = 15_000
// Connection errors that mean nobody listens any more: a socket file left by a
// crash, or a pipe that is gone. Anything else means Arroxy may be running but
// could not be reached.
const GONE_CODES = new Set(['ENOENT', 'ECONNREFUSED'])

// `notRunning`: no live app was found. `approvalPending`: the user still has to
// choose Allow. `clientRemoved`: the user removed this client in Arroxy.
// `denied`: the user denied the request to allow it, or it expired. `control`:
// the Control API answered with an error. `failed`: anything else, including
// an app that exists but could not be reached.
export type BridgeFailureKind = 'notRunning' | 'approvalPending' | 'clientRemoved' | 'denied' | 'control' | 'failed'

export interface BridgeFailure {
	readonly kind: BridgeFailureKind
	readonly message: string
	// One line telling the caller what to do next.
	readonly next?: string
	readonly code?: ControlErrorCode
}

export type CallOutcome<T> = {readonly ok: true; readonly value: T} | {readonly ok: false; readonly failure: BridgeFailure}

export interface CallOptions {
	// Aborting closes the connection, which ends a pending wait on the app side.
	readonly signal?: AbortSignal
}

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
class CancelledError extends Error {}

function fail(kind: BridgeFailureKind, message: string, next?: string): BridgeFailureError {
	return new BridgeFailureError(next === undefined ? {kind, message} : {kind, message, next})
}

function controlFailure(error: ControlError): BridgeFailureError {
	return new BridgeFailureError({kind: 'control', code: error.code, message: error.message, next: error.next})
}

const CANCELLED: BridgeFailure = {kind: 'failed', message: 'The request was cancelled.'}

function sameProof(expected: string, received: string): boolean {
	const a = Buffer.from(expected)
	const b = Buffer.from(received)
	return a.length === b.length && timingSafeEqual(a, b)
}

function errorCode(error: unknown): string | undefined {
	return error instanceof Error && 'code' in error && typeof error.code === 'string' ? error.code : undefined
}

function reasonOf(error: unknown): string {
	return error instanceof Error ? error.message : String(error)
}

function duration(ms: number): string {
	return ms < 1000 ? `${ms} ms` : `${Math.round(ms / 1000)} s`
}

const waitTimeoutSchema = z.object({timeoutMs: z.number()})

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
	readonly waitTimeoutMarginMs?: number
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
	private readonly configDir: string
	private readonly handshakeTimeoutMs: number
	private readonly requestTimeoutMs: number
	private readonly waitTimeoutMarginMs: number

	constructor(private readonly options: ArroxyClientOptions) {
		this.configDir = bridgeConfigDir(options.environment)
		this.store = new FileSecretStore(this.configDir, options.environment.platform, options.log)
		this.handshakeTimeoutMs = options.handshakeTimeoutMs ?? HANDSHAKE_TIMEOUT_MS
		this.requestTimeoutMs = options.requestTimeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS
		this.waitTimeoutMarginMs = options.waitTimeoutMarginMs ?? DEFAULT_WAIT_TIMEOUT_MARGIN_MS
	}

	call<M extends ControlMethod>(method: M, params: ControlParams<M>, options: CallOptions = {}): Promise<CallOutcome<ControlResult<M>>> {
		return this.session(session => session.request(method, params), options)
	}

	// For callers whose method is only known at run time (the CLI). The result
	// is still validated against the method's result schema.
	callUnchecked(method: ControlMethod, params: unknown, options: CallOptions = {}): Promise<CallOutcome<unknown>> {
		return this.withConnection(async exchange => {
			const raw = await exchange(method, params)
			parseResult(method, raw)
			return raw
		}, options)
	}

	// Several requests on one connection, such as status and profiles.list.
	session<T>(work: (session: ControlSession) => Promise<T>, options: CallOptions = {}): Promise<CallOutcome<T>> {
		return this.withConnection(exchange => work({request: async (method, params) => parseResult(method, await exchange(method, params))}), options)
	}

	private async withConnection<T>(work: (exchange: Exchange) => Promise<T>, {signal}: CallOptions): Promise<CallOutcome<T>> {
		if (signal?.aborted) return {ok: false, failure: CANCELLED}
		let opened: OpenedConnection | undefined
		const onAbort = (): void => opened?.connection.close(new CancelledError())
		signal?.addEventListener('abort', onAbort)
		try {
			const current = await this.open()
			opened = current
			if (signal?.aborted) throw new CancelledError()
			// Handshakes take turns, across processes too, under the store's lock,
			// and read the stored credential inside it: concurrent calls never race
			// for the one-time secret or raise two approval requests.
			const secretNotSaved = await this.store.transaction(store => this.handshake(current, store))
			const connection = current.connection
			let counter = 0
			const value = await work((method, params) => this.exchange(connection, `r${++counter}`, method, params))
			// The request went through; now say the secret is lost.
			return secretNotSaved === null ? {ok: true, value} : {ok: false, failure: secretNotSaved}
		} catch (error) {
			return {ok: false, failure: this.toFailure(error)}
		} finally {
			signal?.removeEventListener('abort', onAbort)
			opened?.connection.close()
		}
	}

	private toFailure(error: unknown): BridgeFailure {
		if (error instanceof BridgeFailureError) return error.failure
		if (error instanceof CancelledError) return CANCELLED
		if (error instanceof SecretStoreError) return {kind: 'failed', message: error.message, next: `Make sure ${error.dir} belongs to you and is readable and writable, or point ARROXY_MCP_CONFIG_DIR at another folder.`}
		return {kind: 'failed', message: reasonOf(error)}
	}

	// The first candidate folder whose control.json names a socket that accepts
	// a connection. With no control.json anywhere, or only sockets that are gone,
	// Arroxy is not running; a socket that exists but could not be used is
	// reported as such.
	private async open(): Promise<OpenedConnection> {
		let unreachable: BridgeFailureError | null = null
		for (const userDataDir of userDataCandidates(this.options.environment)) {
			const discovery = await readDiscovery(userDataDir)
			if (discovery === null) continue
			const {socketPath} = discovery
			const reason = await untrustedSocketDirReason(socketPath, this.options.environment.platform)
			if (reason !== null) {
				unreachable ??= fail('failed', `arroxy-mcp did not connect to Arroxy's control socket ${socketPath}: ${reason}.`, 'Make that folder yours and closed to other users (chmod 700), or quit and reopen Arroxy.')
				continue
			}
			try {
				const connection = await LineConnection.open(socketPath, this.handshakeTimeoutMs)
				return {connection, discovery, userDataDir}
			} catch (error) {
				const code = errorCode(error)
				if (code !== undefined && GONE_CODES.has(code)) continue
				const next = code === 'EACCES' || code === 'EPERM' ? 'Run arroxy-mcp as the same user as Arroxy, and check the permissions of that socket.' : 'Quit and reopen Arroxy, then try again.'
				unreachable ??= fail('failed', `Could not connect to Arroxy's control socket ${socketPath}: ${reasonOf(error)}`, next)
			}
		}
		throw unreachable ?? fail('notRunning', NOT_RUNNING_MESSAGE)
	}

	// Returns a failure to report after the call when Arroxy issued a secret
	// that could not be saved.
	private async handshake({connection, discovery, userDataDir}: OpenedConnection, store: SecretStoreTransaction): Promise<BridgeFailure | null> {
		const deadline = setTimeout(() => connection.close(new TimeoutError()), this.handshakeTimeoutMs)
		try {
			return await this.authenticate(connection, discovery, userDataDir, store)
		} catch (error) {
			if (error instanceof TimeoutError) throw fail('failed', `Arroxy did not finish the handshake within ${duration(this.handshakeTimeoutMs)}.`, 'Try again; if it keeps happening, restart Arroxy.')
			throw error
		} finally {
			clearTimeout(deadline)
		}
	}

	private async authenticate(connection: LineConnection, discovery: ControlDiscovery, userDataDir: string, store: SecretStoreTransaction): Promise<BridgeFailure | null> {
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

		const stored = store.get(userDataDir)
		const credential = await this.authParams(stored, discovery.token, serverNonce, clientNonce)
		connection.send({type: 'request', id: 'h2', method: 'auth', params: credential.params})
		const auth = await this.response(connection, 'h2')
		if (!auth.ok) return this.authFailed(auth.error, credential.kind, stored, userDataDir, store)
		const accepted = parseControlResult('auth', auth.result)
		if (!accepted.success) throw fail('failed', 'Arroxy answered auth with a result this bridge does not understand.', 'Update arroxy-mcp and Arroxy to their latest versions.')
		const {clientId, clientSecret} = accepted.data
		// Issued exactly once, on the auth that collects an approval.
		if (clientSecret === undefined) return null
		try {
			await store.update(userDataDir, () => ({clientId, clientSecret}))
			return null
		} catch (error) {
			return {
				kind: 'failed',
				message: `Arroxy allowed arroxy-mcp, but the client secret it issued could not be saved in ${this.configDir}: ${reasonOf(error)}. This request still went through.`,
				next: 'Fix that folder (or set ARROXY_MCP_CONFIG_DIR), then remove arroxy-mcp in Arroxy and allow it again: Arroxy issues the secret only once.'
			}
		}
	}

	private async authParams(stored: StoredClient | null, token: string, serverNonce: string, clientNonce: string): Promise<{readonly kind: 'secret' | 'approval' | 'token'; readonly params: unknown}> {
		if (stored !== null && 'clientSecret' in stored) return {kind: 'secret', params: {clientId: stored.clientId, proof: await handshakeClientProof(stored.clientSecret, serverNonce, clientNonce)}}
		const proof = await handshakeClientProof(token, serverNonce, clientNonce)
		if (stored !== null) return {kind: 'approval', params: {approvalId: stored.approvalId, proof}}
		return {kind: 'token', params: {proof}}
	}

	private async authFailed(error: ControlError, credential: 'secret' | 'approval' | 'token', stored: StoredClient | null, userDataDir: string, store: SecretStoreTransaction): Promise<never> {
		if (error.code === 'approval_pending') {
			const approvalId = error.details?.approvalId ?? (stored !== null && 'approvalId' in stored ? stored.approvalId : undefined)
			if (approvalId !== undefined) await store.update(userDataDir, () => ({approvalId}))
			throw fail('approvalPending', APPROVAL_PENDING_MESSAGE)
		}
		if (error.code === 'unauthorized' && stored !== null && credential !== 'token') {
			// Forget exactly the credential Arroxy refused, so the next call asks again.
			await store.deleteIf(userDataDir, stored)
			if (credential === 'secret') throw fail('clientRemoved', 'Arroxy no longer allows arroxy-mcp: it was removed in Arroxy.', ASK_AGAIN)
			throw fail('denied', 'Arroxy did not allow arroxy-mcp: the request was denied or has expired.', ASK_AGAIN)
		}
		throw controlFailure(error)
	}

	private async exchange(connection: LineConnection, id: string, method: ControlMethod, params: unknown): Promise<unknown> {
		const timeoutMs = this.timeoutFor(method, params)
		const timer = setTimeout(() => connection.close(new TimeoutError()), timeoutMs)
		try {
			connection.send({type: 'request', id, method, params})
			const response = await this.response(connection, id)
			if (!response.ok) throw controlFailure(response.error)
			return response.result
		} catch (error) {
			if (error instanceof TimeoutError) throw fail('failed', `Arroxy did not answer ${method} within ${duration(timeoutMs)}.`, "Try again; if it keeps happening, check Arroxy's log.")
			throw error
		} finally {
			clearTimeout(timer)
		}
	}

	private timeoutFor(method: ControlMethod, params: unknown): number {
		if (method !== 'wait') return this.requestTimeoutMs
		const parsed = waitTimeoutSchema.safeParse(params)
		return parsed.success ? parsed.data.timeoutMs + this.waitTimeoutMarginMs : this.requestTimeoutMs
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
