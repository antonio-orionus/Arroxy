import {randomBytes} from 'node:crypto'
import fs from 'node:fs'
import net from 'node:net'
import path from 'node:path'
import {expect, type Page, test} from '@playwright/test'
import type {LocalClientsSnapshot} from '../../src/shared/localClients.js'
import {CONTROL_DISCOVERY_FILE_NAME, type ControlDiscovery, controlDiscoverySchema, controlResponseEnvelopeSchema, handshakeClientProof, handshakeServerProof, parseControlResult} from '../../packages/arroxy-control/src/index.js'
import {withFixtureProductApp} from './fixtureProductE2E.js'

// Risk: a program on this computer asks to use Arroxy, and only the user's
// Allow lets it in; removing it later shuts it out at once. The run does not
// allow clients on its own here: the spec answers through the window's own
// IPC (window.appApi.localClients), as the approval screen will.
//
// Fixture: no media; a raw client speaks the control socket's handshake.
// Oracles: the socket's answers (approval_pending, the issued secret, a
// working session, unauthorized after removal), the connection closing on
// removal, and the window's local-clients snapshots and change events.

declare global {
	interface Window {
		localClientChanges?: LocalClientsSnapshot[]
	}
}

const LABEL = 'e2e-approval-client'

// One connection; every line the app wrote, and whether it closed.
class LineClient {
	readonly lines: unknown[] = []
	readonly closed: Promise<void>
	private buffer = ''
	private wake: (() => void) | null = null

	private constructor(private readonly socket: net.Socket) {
		socket.setEncoding('utf8')
		socket.on('data', (chunk: string) => {
			this.buffer += chunk
			for (let newline = this.buffer.indexOf('\n'); newline !== -1; newline = this.buffer.indexOf('\n')) {
				this.lines.push(JSON.parse(this.buffer.slice(0, newline)))
				this.buffer = this.buffer.slice(newline + 1)
			}
			this.wake?.()
		})
		socket.on('error', () => undefined)
		this.closed = new Promise(resolve => socket.on('close', () => resolve()))
		void this.closed.then(() => this.wake?.())
	}

	static connect(socketPath: string): Promise<LineClient> {
		return new Promise((resolve, reject) => {
			const socket = net.createConnection(socketPath)
			socket.once('error', reject)
			socket.once('connect', () => {
				socket.off('error', reject)
				resolve(new LineClient(socket))
			})
		})
	}

	request(id: string, method: string, params?: unknown): void {
		this.socket.write(`${JSON.stringify({type: 'request', id, method, ...(params === undefined ? {} : {params})})}\n`)
	}

	// The answer to request `id`.
	async response(id: string) {
		for (;;) {
			for (const line of this.lines) {
				const envelope = controlResponseEnvelopeSchema.safeParse(line)
				if (envelope.success && envelope.data.id === id) return envelope.data
			}
			if (this.socket.destroyed) throw new Error(`closed before answering ${id}`)
			await new Promise<void>(resolve => (this.wake = resolve))
		}
	}

	end(): Promise<void> {
		this.socket.end()
		return this.closed
	}
}

type Credential = {readonly kind: 'ask'} | {readonly kind: 'collect'; readonly approvalId: string} | {readonly kind: 'known'; readonly clientId: string; readonly secret: string}

// hello, a check of the app's proof, then auth with the credential.
async function connect(discovery: ControlDiscovery, credential: Credential) {
	const client = await LineClient.connect(discovery.socketPath)
	const clientNonce = randomBytes(32).toString('base64url')
	client.request('hello', 'hello', {protocol: {majors: [1]}, client: {name: LABEL, version: '1.0.0'}, clientNonce})
	const hello = await client.response('hello')
	const challenge = hello.ok ? parseControlResult('hello', hello.result) : null
	if (!challenge?.success) throw new Error(`hello answered ${JSON.stringify(hello)}`)
	expect(challenge.data.serverProof).toBe(await handshakeServerProof(discovery.token, clientNonce))
	const key = credential.kind === 'known' ? credential.secret : discovery.token
	const proof = await handshakeClientProof(key, challenge.data.serverNonce, clientNonce)
	const params = credential.kind === 'ask' ? {proof} : credential.kind === 'collect' ? {proof, approvalId: credential.approvalId} : {proof, clientId: credential.clientId}
	client.request('auth', 'auth', params)
	return {client, auth: await client.response('auth')}
}

function localClients(page: Page): Promise<LocalClientsSnapshot> {
	return page.evaluate(async () => {
		const api = window.appApi.localClients
		if (!api) throw new Error('window.appApi.localClients is missing')
		const answer = await api.get()
		if (!answer.ok) throw new Error(answer.error.message)
		return answer.data
	})
}

test('a local client waits for Allow, works once allowed, and is shut out once removed', async () => {
	test.setTimeout(180_000)
	let socketDir: string | null = null
	try {
		await withFixtureProductApp({manualClientApproval: true, userDataPrefix: 'arroxy-fixture-approval-user-', outputPrefix: 'arroxy-fixture-approval-out-'}, async ({page, userDataDir}) => {
			const discoveryFile = path.join(userDataDir, CONTROL_DISCOVERY_FILE_NAME)
			await expect.poll(() => fs.existsSync(discoveryFile), {timeout: 30_000}).toBe(true)
			const discovery = controlDiscoverySchema.parse(JSON.parse(fs.readFileSync(discoveryFile, 'utf8')))
			if (process.platform !== 'win32') socketDir = path.dirname(discovery.socketPath)

			// The window hears every change from here on.
			await page.evaluate(() => {
				const api = window.appApi.localClients
				if (!api) throw new Error('window.appApi.localClients is missing')
				window.localClientChanges = []
				api.onChanged(snapshot => window.localClientChanges?.push(snapshot))
			})
			expect(await localClients(page)).toEqual({clients: [], pending: []})

			// First contact: the app asks the user and answers an approvalId.
			const asked = await connect(discovery, {kind: 'ask'})
			if (asked.auth.ok) throw new Error('a new client was let in without Allow')
			expect(asked.auth.error.code).toBe('approval_pending')
			const approvalId = asked.auth.error.details?.approvalId
			if (approvalId === undefined) throw new Error('approval_pending carried no approvalId')
			await asked.client.closed
			expect(await localClients(page)).toMatchObject({clients: [], pending: [{approvalId, label: LABEL, requestedAt: expect.any(Number), expiresAt: expect.any(Number)}]})
			await expect.poll(() => page.evaluate(() => window.localClientChanges?.some(change => change.pending.length > 0) ?? false)).toBe(true)

			// Still waiting: collecting before Allow answers approval_pending again.
			const early = await connect(discovery, {kind: 'collect', approvalId})
			expect(early.auth).toMatchObject({ok: false, error: {code: 'approval_pending'}})
			await early.client.closed

			// The user chooses Allow.
			expect(await page.evaluate(id => window.appApi.localClients?.allow({approvalId: id, pathsRead: false}), approvalId)).toEqual({ok: true})
			expect((await localClients(page)).pending).toEqual([])

			// The client comes back for its id and secret, issued once.
			const collected = await connect(discovery, {kind: 'collect', approvalId})
			const issued = collected.auth.ok ? parseControlResult('auth', collected.auth.result) : null
			if (!issued?.success || issued.data.clientSecret === undefined) throw new Error(`collecting answered ${JSON.stringify(collected.auth)}`)
			const {clientId, clientSecret: secret} = issued.data
			expect(issued.data.rules).toEqual(['trusted'])
			await expect.poll(async () => (await localClients(page)).clients).toEqual([expect.objectContaining({clientId, label: LABEL, pathsRead: false, connected: true})])
			await collected.client.end()
			await expect.poll(async () => (await localClients(page)).clients).toEqual([expect.objectContaining({clientId, connected: false})])

			// From then on its secret lets it in, and its session works.
			const known = await connect(discovery, {kind: 'known', clientId, secret})
			expect(known.auth).toMatchObject({ok: true, result: {clientId}})
			known.client.request('status-1', 'status')
			const status = await known.client.response('status-1')
			expect(status.ok && parseControlResult('status', status.result).success).toBe(true)
			await expect.poll(async () => (await localClients(page)).clients).toEqual([expect.objectContaining({clientId, connected: true})])

			// The user removes it: its open connection closes, and the list forgets it.
			expect(await page.evaluate(id => window.appApi.localClients?.remove({clientId: id}), clientId)).toEqual({ok: true})
			await known.client.closed
			expect(await localClients(page)).toEqual({clients: [], pending: []})
			await expect.poll(() => page.evaluate(() => window.localClientChanges?.at(-1))).toEqual({clients: [], pending: []})

			// The old secret no longer works.
			const shutOut = await connect(discovery, {kind: 'known', clientId, secret})
			expect(shutOut.auth).toMatchObject({ok: false, error: {code: 'unauthorized'}})
			await shutOut.client.closed
		})
	} finally {
		if (socketDir !== null) fs.rmSync(socketDir, {recursive: true, force: true})
	}
})
