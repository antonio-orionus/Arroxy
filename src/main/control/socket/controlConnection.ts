// One connection on the control socket: the handshake, then a Control API
// session. Until auth succeeds the connection takes one hello, then one auth,
// each at most HANDSHAKE_MAX_FRAME_BYTES, within HANDSHAKE_TIMEOUT_MS of
// connect, and writes nothing but the hello challenge and at most one closing
// error line: on Windows another user may hold a read-only end of the pipe.
// After auth every request envelope goes to the session, its responses go
// out in the order they complete, and the session's events go out as lines.
//
// Everything off the socket is unknown until arroxy-control's schemas parse
// it. A line that is not JSON or not a request envelope drops the connection;
// a well-formed envelope with an unknown method or bad params answers
// invalid_request (and, during the handshake, closes).

import {randomBytes, timingSafeEqual} from 'node:crypto'
import type net from 'node:net'
import {type ControlError, type ControlParams, type ControlRequest, type ControlResult, controlError, controlRequestEnvelopeSchema, HANDSHAKE_MAX_FRAME_BYTES, HANDSHAKE_TIMEOUT_MS, handshakeClientProof, handshakeServerProof, negotiateProtocolMajor, parseControlRequest, parseControlResult} from 'arroxy-control'
import type {ControlResponse, ControlService, ControlSession} from '../ControlService.js'
import type {ControlContext, ControlSink} from '../controlTypes.js'
import {errnoCode} from './errnoCode.js'
import {LineFrames} from './lineFrames.js'
import type {LocalClientApprovals} from './localClientApprovals.js'

// A frame's cap once auth succeeds. The largest v1 request is links.add: a URL
// of at most 4096 characters plus ids of at most 128, about 5 KiB even fully
// escaped. 64 KiB leaves room for additive fields within the major while
// bounding what one connection can make the app buffer.
export const SESSION_MAX_FRAME_BYTES = 64 * 1024

export interface ControlSocketLog {
	info(message: string, ...details: unknown[]): void
	warn(message: string, ...details: unknown[]): void
	error(message: string, ...details: unknown[]): void
}

export interface ControlConnectionDeps {
	// This launch's discovery token.
	readonly token: string
	readonly appVersion: string
	readonly bootId: string
	readonly approvals: LocalClientApprovals
	readonly service: Pick<ControlService, 'openSession'>
	readonly log: ControlSocketLog
	// Tests shorten it; the protocol fixes it at HANDSHAKE_TIMEOUT_MS.
	readonly handshakeTimeoutMs?: number
}

interface Hello {
	readonly major: number
	readonly label: string
	readonly clientNonce: string
	readonly serverNonce: string
}

type Stage = {readonly kind: 'hello'} | {readonly kind: 'auth'; readonly hello: Hello} | {readonly kind: 'open'; readonly session: ControlSession} | {readonly kind: 'closed'}

type AuthOutcome = {readonly ok: true; readonly context: ControlContext; readonly clientSecret?: string} | {readonly ok: false; readonly error: ControlError}

export function serveControlConnection(socket: net.Socket, deps: ControlConnectionDeps): void {
	new ControlConnection(socket, deps).start()
}

class ControlConnection {
	private stage: Stage = {kind: 'hello'}
	private readonly frames = new LineFrames(HANDSHAKE_MAX_FRAME_BYTES)
	// Handshake lines are handled one after another; session requests are
	// handed over in order and answered as they complete.
	private queue: Promise<void> = Promise.resolve()
	private readonly timer: NodeJS.Timeout

	constructor(
		private readonly socket: net.Socket,
		private readonly deps: ControlConnectionDeps
	) {
		this.timer = setTimeout(() => this.handshakeTimedOut(), deps.handshakeTimeoutMs ?? HANDSHAKE_TIMEOUT_MS)
	}

	start(): void {
		this.socket.on('data', (chunk: Buffer) => this.receive(chunk))
		this.socket.on('drain', () => this.socket.resume())
		this.socket.on('error', error => this.deps.log.info('a control connection failed', {code: errnoCode(error)}))
		this.socket.on('close', () => this.closed())
	}

	private receive(chunk: Buffer): void {
		if (this.stage.kind === 'closed') return
		const pushed = this.frames.push(chunk)
		if (!pushed.ok) return this.drop(`frame ${pushed.reason}`)
		for (const line of pushed.lines) this.queue = this.queue.then(() => this.line(line))
	}

	private async line(line: string): Promise<void> {
		const stage = this.stage
		if (stage.kind === 'closed') return
		const request = this.parse(line)
		if (request === null) return
		switch (stage.kind) {
			case 'hello':
				return this.hello(request)
			case 'auth':
				return this.auth(request, stage.hello)
			case 'open':
				return void this.serve(stage.session, request)
		}
	}

	// The request on a line, or null after the line closed the connection.
	private parse(line: string): ControlRequest | null {
		let raw: unknown
		try {
			raw = JSON.parse(line)
		} catch {
			this.drop('a line that is not JSON')
			return null
		}
		const envelope = controlRequestEnvelopeSchema.safeParse(raw)
		if (!envelope.success) {
			this.drop('a line that is not a request envelope')
			return null
		}
		const parsed = parseControlRequest(envelope.data)
		if (parsed.ok) return parsed.request
		if (this.stage.kind === 'open') this.respond(envelope.data.id, {ok: false, error: parsed.error})
		else this.closeWith(envelope.data.id, parsed.error)
		return null
	}

	private async hello(request: ControlRequest): Promise<void> {
		if (request.method !== 'hello') return this.closeWith(request.id, controlError('unauthorized', 'Send hello first.'))
		const {protocol, client, clientNonce} = request.params
		const negotiated = negotiateProtocolMajor(protocol.majors)
		if (!negotiated.ok) return this.closeWith(request.id, negotiated.error)
		const serverNonce = randomBytes(32).toString('base64url')
		const result = parseControlResult('hello', {serverProof: await handshakeServerProof(this.deps.token, clientNonce), serverNonce})
		if (!result.success) return this.closeWith(request.id, controlError('internal', 'Arroxy could not answer hello.'))
		if (this.stage.kind !== 'hello') return
		this.stage = {kind: 'auth', hello: {major: negotiated.major, label: client.name, clientNonce, serverNonce}}
		this.respond(request.id, {ok: true, result: result.data})
	}

	private async auth(request: ControlRequest, hello: Hello): Promise<void> {
		if (request.method !== 'auth') return this.closeWith(request.id, controlError('unauthorized', 'Send auth after hello.'))
		const outcome = await this.authenticate(request.params, hello)
		if (this.stage.kind !== 'auth') return
		if (!outcome.ok) return this.closeWith(request.id, outcome.error)
		const {context} = outcome
		const accepted: ControlResult<'auth'> = {protocol: hello.major, appVersion: this.deps.appVersion, bootId: this.deps.bootId, clientId: context.clientId, rules: [...context.rules]}
		if (outcome.clientSecret !== undefined) accepted.clientSecret = outcome.clientSecret
		const result = parseControlResult('auth', accepted)
		if (!result.success) return this.closeWith(request.id, controlError('internal', 'Arroxy could not answer auth.'))
		clearTimeout(this.timer)
		this.frames.raiseMaxBytes(SESSION_MAX_FRAME_BYTES)
		// The auth answer goes out before anything the session writes.
		this.respond(request.id, {ok: true, result: result.data})
		this.stage = {kind: 'open', session: this.deps.service.openSession(context, this.sink())}
		this.deps.log.info('a local client connected', {clientId: context.clientId})
	}

	private async authenticate(params: ControlParams<'auth'>, hello: Hello): Promise<AuthOutcome> {
		const {proof} = params
		const refused: AuthOutcome = {ok: false, error: controlError('unauthorized', 'Arroxy does not allow this client.')}
		if (params.clientId !== undefined) {
			const client = this.deps.approvals.client(params.clientId)
			if (client === null || !(await this.proves(client.secret, proof, hello))) return refused
			return {ok: true, context: {clientId: client.clientId, kind: 'localClient', label: client.label, rules: client.rules}}
		}
		if (!(await this.proves(this.deps.token, proof, hello))) return refused
		if (params.approvalId === undefined) return pending(this.deps.approvals.request(hello.label))
		const collected = this.deps.approvals.collect(params.approvalId)
		switch (collected.status) {
			case 'pending':
				return pending(params.approvalId)
			case 'refused':
				return {ok: false, error: controlError('unauthorized', 'The request to allow this client was denied or has expired.')}
			case 'allowed': {
				const client = this.deps.approvals.client(collected.clientId)
				if (client === null) return refused
				return {ok: true, context: {clientId: client.clientId, kind: 'localClient', label: client.label, rules: client.rules}, clientSecret: collected.clientSecret}
			}
		}
	}

	private async proves(key: string, proof: string, hello: Hello): Promise<boolean> {
		const expected = Buffer.from(await handshakeClientProof(key, hello.serverNonce, hello.clientNonce))
		const received = Buffer.from(proof)
		return expected.length === received.length && timingSafeEqual(expected, received)
	}

	private async serve(session: ControlSession, request: ControlRequest): Promise<void> {
		let response: ControlResponse
		try {
			response = await session.handle(request)
		} catch {
			response = {ok: false, error: controlError('internal', 'Arroxy could not do that.')}
		}
		if (this.stage.kind === 'open') this.respond(request.id, response)
	}

	private sink(): ControlSink {
		return {
			write: line => this.write(line),
			onDrain: listener => {
				this.socket.on('drain', listener)
				return () => this.socket.off('drain', listener)
			}
		}
	}

	private respond(id: string, response: ControlResponse): void {
		this.write(JSON.stringify(response.ok ? {type: 'response', id, ok: true, result: response.result} : {type: 'response', id, ok: false, error: response.error}))
	}

	// False once the socket is full; reading pauses until it drains, so a
	// client that stops reading stops being served.
	private write(line: string): boolean {
		if (this.socket.destroyed || this.socket.writableEnded) return false
		const room = this.socket.write(`${line}\n`)
		if (!room) this.socket.pause()
		return room
	}

	private handshakeTimedOut(): void {
		if (this.stage.kind === 'hello' || this.stage.kind === 'auth') this.closeWith(null, controlError('handshake_timeout', 'The handshake took too long.'))
	}

	// The one closing error line, then the connection ends.
	private closeWith(id: string | null, error: ControlError): void {
		if (this.stage.kind === 'closed') return
		this.end()
		this.deps.log.info('a control connection was refused', {code: error.code})
		this.socket.end(`${JSON.stringify({type: 'response', id, ok: false, error})}\n`, () => this.socket.destroy())
	}

	private drop(reason: string): void {
		if (this.stage.kind === 'closed') return
		this.end()
		this.deps.log.info('a control connection was dropped', {reason})
		this.socket.destroy()
	}

	private closed(): void {
		this.end()
	}

	private end(): void {
		clearTimeout(this.timer)
		if (this.stage.kind === 'open') this.stage.session.close()
		this.stage = {kind: 'closed'}
	}
}

function pending(approvalId: string): AuthOutcome {
	return {ok: false, error: controlError('approval_pending', 'Choose Allow in Arroxy to let this client in.', {details: {approvalId}})}
}
