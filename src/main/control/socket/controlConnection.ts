// One connection on the control socket: the handshake, then a Control API
// session. Until auth succeeds the connection takes one hello, then one auth,
// each at most HANDSHAKE_MAX_FRAME_BYTES, within HANDSHAKE_TIMEOUT_MS of
// connect, and writes nothing but the hello challenge and at most one closing
// error line: on Windows another user may hold a read-only end of the pipe.
// After auth every request envelope goes to the session, its responses go
// out in the order they complete, and the session's events go out as lines.
//
// Everything off the socket is unknown until arroxy-control's schemas parse
// it. A line that is not JSON or not a request envelope drops the connection.
// During the handshake any method but the expected one answers unauthorized;
// after it, an unknown method or bad params answers invalid_request.
//
// Each step re-checks the connection after every await before it changes
// anything, so a client that vanishes mid-handshake leaves no prompt and no
// half-issued client behind.

import {randomBytes, timingSafeEqual} from 'node:crypto'
import type net from 'node:net'
import {type ControlError, type ControlParams, type ControlRequest, type ControlResult, controlError, controlRequestEnvelopeSchema, HANDSHAKE_MAX_FRAME_BYTES, HANDSHAKE_TIMEOUT_MS, handshakeClientProof, handshakeServerProof, negotiateProtocolMajor, parseControlRequest, parseControlResult} from 'arroxy-control'
import type {ControlResponse, ControlService, ControlSession} from '../ControlService.js'
import type {ControlContext, ControlSink} from '../controlTypes.js'
import type {ConnectionSlots} from './connectionSlots.js'
import {errnoCode} from './errnoCode.js'
import {LineFrames} from './lineFrames.js'
import type {LocalClient, LocalClientApprovals} from './localClientApprovals.js'

// A frame's cap after the handshake's two lines. The largest v1 request is
// links.add: a URL of at most 4096 characters plus ids of at most 128, about
// 5 KiB even fully escaped. 64 KiB leaves room for additive fields within the
// major while bounding what one connection can make the app buffer.
export const SESSION_MAX_FRAME_BYTES = 64 * 1024
// hello, then auth.
const HANDSHAKE_LINES = 2
// Requests one connection may have unanswered; reading pauses at the cap.
export const CONTROL_IN_FLIGHT_MAX = 64

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
	readonly slots: Pick<ConnectionSlots<net.Socket>, 'promote'>
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

// What a valid proof asks for; nothing is changed until the connection is checked again.
type AuthClaim = {readonly kind: 'refused'; readonly error: ControlError} | {readonly kind: 'known'; readonly client: LocalClient} | {readonly kind: 'new'} | {readonly kind: 'collect'; readonly approvalId: string}

export function serveControlConnection(socket: net.Socket, deps: ControlConnectionDeps): void {
	new ControlConnection(socket, deps).start()
}

class ControlConnection {
	private stage: Stage = {kind: 'hello'}
	private readonly frames = new LineFrames(index => (index < HANDSHAKE_LINES ? HANDSHAKE_MAX_FRAME_BYTES : SESSION_MAX_FRAME_BYTES))
	// Lines are taken one after another; session requests are handed over in
	// order and answered as they complete.
	private queue: Promise<void> = Promise.resolve()
	private readonly timer: NodeJS.Timeout
	private inFlight = 0
	private slotFreed: (() => void) | null = null
	private writeBlocked = false
	private stopRevoked: (() => void) | null = null
	// Ends this connection's count on its client once the session closes.
	private disconnected: (() => void) | null = null

	constructor(
		private readonly socket: net.Socket,
		private readonly deps: ControlConnectionDeps
	) {
		this.timer = setTimeout(() => this.handshakeTimedOut(), deps.handshakeTimeoutMs ?? HANDSHAKE_TIMEOUT_MS)
	}

	start(): void {
		this.socket.on('data', (chunk: Buffer) => this.receive(chunk))
		this.socket.on('drain', () => {
			this.writeBlocked = false
			this.updateReading()
		})
		this.socket.on('error', error => this.deps.log.info('a control connection failed', {code: errnoCode(error)}))
		this.socket.on('close', () => this.end())
	}

	private receive(chunk: Buffer): void {
		if (this.stage.kind === 'closed') return
		const pushed = this.frames.push(chunk)
		if (!pushed.ok) return this.drop(`frame ${pushed.reason}`)
		for (const line of pushed.lines) {
			this.queue = this.queue
				.then(() => this.line(line))
				.catch((error: unknown) => {
					this.deps.log.error('a control connection failed inside', {error: error instanceof Error ? error.name : typeof error})
					this.drop('internal')
				})
		}
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
				return this.dispatch(request)
		}
	}

	// The request on a line, or null after the line was answered or closed the connection.
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
		const expected = this.stage.kind === 'hello' ? 'hello' : this.stage.kind === 'auth' ? 'auth' : null
		if (expected !== null && envelope.data.method !== expected) {
			this.closeWith(envelope.data.id, controlError('unauthorized', expected === 'hello' ? 'Send hello first.' : 'Send auth after hello.'))
			return null
		}
		const parsed = parseControlRequest(envelope.data)
		if (parsed.ok) return parsed.request
		if (this.stage.kind === 'open') this.respond(envelope.data.id, {ok: false, error: parsed.error})
		else this.closeWith(envelope.data.id, parsed.error)
		return null
	}

	private async hello(request: ControlRequest): Promise<void> {
		if (request.method !== 'hello') return
		const {protocol, client, clientNonce} = request.params
		const negotiated = negotiateProtocolMajor(protocol.majors)
		if (!negotiated.ok) return this.closeWith(request.id, negotiated.error)
		const serverNonce = randomBytes(32).toString('base64url')
		const result = parseControlResult('hello', {serverProof: await handshakeServerProof(this.deps.token, clientNonce), serverNonce})
		if (this.stage.kind !== 'hello') return
		if (!result.success) return this.closeWith(request.id, controlError('internal', 'Arroxy could not answer hello.'))
		this.stage = {kind: 'auth', hello: {major: negotiated.major, label: client.name, clientNonce, serverNonce}}
		this.respond(request.id, {ok: true, result: result.data})
	}

	private async auth(request: ControlRequest, hello: Hello): Promise<void> {
		if (request.method !== 'auth') return
		const claim = await this.verify(request.params, hello)
		// Gone, or timed out, while the proof was checked: change nothing.
		if (this.stage.kind !== 'auth') return
		switch (claim.kind) {
			case 'refused':
				return this.closeWith(request.id, claim.error)
			case 'new': {
				const approvalId = this.deps.approvals.request(hello.label)
				return this.closeWith(request.id, approvalPending(approvalId), () => this.deps.approvals.withdraw(approvalId))
			}
			case 'known':
				this.deps.approvals.proven(claim.client.clientId)
				return this.accept(request.id, hello, claim.client, null)
			case 'collect': {
				const collected = this.deps.approvals.claim(claim.approvalId)
				if (collected.status === 'pending') return this.closeWith(request.id, approvalPending(claim.approvalId))
				if (collected.status === 'refused') return this.closeWith(request.id, controlError('unauthorized', 'The request to allow this client was denied or has expired.'))
				return this.accept(request.id, hello, collected.client, claim.approvalId)
			}
		}
	}

	// Checks the proof; changes nothing.
	private async verify(params: ControlParams<'auth'>, hello: Hello): Promise<AuthClaim> {
		const refused: AuthClaim = {kind: 'refused', error: controlError('unauthorized', 'Arroxy does not allow this client.')}
		if (params.clientId !== undefined) {
			const client = this.deps.approvals.client(params.clientId)
			if (client === null || !(await this.proves(client.secret, params.proof, hello))) return refused
			return {kind: 'known', client}
		}
		if (!(await this.proves(this.deps.token, params.proof, hello))) return refused
		return params.approvalId === undefined ? {kind: 'new'} : {kind: 'collect', approvalId: params.approvalId}
	}

	private async proves(key: string, proof: string, hello: Hello): Promise<boolean> {
		const expected = Buffer.from(await handshakeClientProof(key, hello.serverNonce, hello.clientNonce))
		const received = Buffer.from(proof)
		return expected.length === received.length && timingSafeEqual(expected, received)
	}

	// `approvalId`: the approval this auth collects, confirmed only once the
	// answer carrying the secret was written, and released otherwise.
	private async accept(id: string, hello: Hello, client: LocalClient, approvalId: string | null): Promise<void> {
		const release = (): void => {
			if (approvalId !== null) this.deps.approvals.release(approvalId)
		}
		if (!this.deps.slots.promote(this.socket)) {
			release()
			return this.closeWith(id, controlError('limit_exceeded', 'Arroxy already serves as many local clients as it takes; close one and try again.', {retryable: true}))
		}
		const accepted: ControlResult<'auth'> = {protocol: hello.major, appVersion: this.deps.appVersion, bootId: this.deps.bootId, clientId: client.clientId, rules: [...client.rules]}
		if (approvalId !== null) accepted.clientSecret = client.secret
		const result = parseControlResult('auth', accepted)
		if (!result.success) {
			release()
			return this.closeWith(id, controlError('internal', 'Arroxy could not answer auth.'))
		}
		clearTimeout(this.timer)
		// Listening before the answer goes out: the client may read it, and be
		// removed, before the write completes (on a Windows pipe, it does).
		this.stopRevoked = this.deps.approvals.onRevoked(clientId => {
			if (clientId === client.clientId) this.drop('the client was removed')
		})
		const delivered = await this.writeAndWait(response(id, {ok: true, result: result.data}))
		if (approvalId !== null) {
			if (delivered) this.deps.approvals.confirm(approvalId)
			else release()
		}
		if (!delivered || this.stage.kind !== 'auth') return
		// Removed while the proof was checked, before anything listened.
		if (this.deps.approvals.client(client.clientId) === null) return this.drop('the client was removed')
		const context: ControlContext = {clientId: client.clientId, kind: 'localClient', label: client.label, rules: client.rules}
		this.stage = {kind: 'open', session: this.deps.service.openSession(context, this.sink())}
		this.disconnected = this.deps.approvals.connected(client.clientId)
		this.deps.log.info('a local client connected', {clientId: context.clientId})
	}

	// Waits for a free in-flight slot, keeping the order requests arrived in.
	private async dispatch(request: ControlRequest): Promise<void> {
		while (this.inFlight >= CONTROL_IN_FLIGHT_MAX) await new Promise<void>(resolve => (this.slotFreed = resolve))
		const stage = this.stage
		if (stage.kind !== 'open') return
		this.inFlight++
		this.updateReading()
		void this.serve(stage.session, request)
	}

	private async serve(session: ControlSession, request: ControlRequest): Promise<void> {
		let answer: ControlResponse
		try {
			answer = await session.handle(request)
		} catch (error) {
			// The name only: a message can carry paths.
			this.deps.log.error('a control request failed inside', {method: request.method, error: error instanceof Error ? error.name : typeof error})
			answer = {ok: false, error: controlError('internal', 'Arroxy could not do that.')}
		}
		this.inFlight--
		this.slotFreed?.()
		this.slotFreed = null
		if (this.stage.kind !== 'open') return
		this.updateReading()
		this.respond(request.id, answer)
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

	private respond(id: string, answer: ControlResponse): void {
		this.write(response(id, answer))
	}

	// False once the socket is full; reading pauses until it drains, so a
	// client that stops reading stops being served.
	private write(line: string): boolean {
		if (this.socket.destroyed || this.socket.writableEnded) return false
		const room = this.socket.write(`${line}\n`)
		if (!room) {
			this.writeBlocked = true
			this.updateReading()
		}
		return room
	}

	// Whether the line reached the OS.
	private writeAndWait(line: string): Promise<boolean> {
		if (this.socket.destroyed || this.socket.writableEnded) return Promise.resolve(false)
		return new Promise(resolve => this.socket.write(`${line}\n`, error => resolve(error === undefined || error === null)))
	}

	private updateReading(): void {
		if (this.socket.destroyed) return
		if (this.writeBlocked || this.inFlight >= CONTROL_IN_FLIGHT_MAX) this.socket.pause()
		else this.socket.resume()
	}

	private handshakeTimedOut(): void {
		if (this.stage.kind === 'hello' || this.stage.kind === 'auth') this.closeWith(null, controlError('handshake_timeout', 'The handshake took too long.'))
	}

	// The one closing error line, then the connection ends. `undelivered`
	// runs when the line did not reach the OS.
	private closeWith(id: string | null, error: ControlError, undelivered?: () => void): void {
		if (this.stage.kind === 'closed') return
		this.end()
		this.deps.log.info('a control connection was refused', {code: error.code})
		if (this.socket.destroyed) return undelivered?.()
		this.socket.write(`${response(id, {ok: false, error})}\n`, failure => {
			if (failure !== undefined && failure !== null) undelivered?.()
		})
		this.socket.end(() => this.socket.destroy())
	}

	private drop(reason: string): void {
		if (this.stage.kind === 'closed') return
		this.end()
		this.deps.log.info('a control connection was dropped', {reason})
		this.socket.destroy()
	}

	private end(): void {
		clearTimeout(this.timer)
		this.stopRevoked?.()
		this.stopRevoked = null
		if (this.stage.kind === 'open') this.stage.session.close()
		this.disconnected?.()
		this.disconnected = null
		this.stage = {kind: 'closed'}
	}
}

function response(id: string | null, answer: ControlResponse): string {
	return JSON.stringify(answer.ok ? {type: 'response', id, ok: true, result: answer.result} : {type: 'response', id, ok: false, error: answer.error})
}

function approvalPending(approvalId: string): ControlError {
	return controlError('approval_pending', 'Choose Allow in Arroxy to let this client in.', {details: {approvalId}})
}
