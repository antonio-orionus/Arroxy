import fs from 'node:fs/promises'
import net from 'node:net'
import path from 'node:path'
import {CONTROL_DISCOVERY_FILE_NAME, controlError} from 'arroxy-control'
import {afterEach, describe, expect, it} from 'vite-plus/test'
import {ArroxyClient, type ArroxyClientOptions, type BridgeFailure, NOT_RUNNING_MESSAGE} from '../src/client'
import type {BridgeEnvironment} from '../src/environment'
import {FileSecretStore} from '../src/store'
import {createSandbox, FakeApp, type FakeAppOptions, type Sandbox} from './fakeApp'

const isWindows = process.platform === 'win32'
const cleanups: Array<() => Promise<void>> = []

afterEach(async () => {
	for (const cleanup of cleanups.splice(0).reverse()) await cleanup()
})

async function sandbox(): Promise<Sandbox> {
	const created = await createSandbox()
	cleanups.push(created.cleanup)
	return created
}

async function startApp(options: FakeAppOptions): Promise<FakeApp> {
	const app = new FakeApp(options)
	await app.start()
	cleanups.push(() => app.stop())
	return app
}

function environmentFor(box: Sandbox, overrides: Partial<BridgeEnvironment> = {}): BridgeEnvironment {
	return {platform: process.platform, homedir: path.join(box.root, 'home'), env: {ARROXY_USER_DATA: box.userDataDir, ARROXY_MCP_CONFIG_DIR: box.configDir}, ...overrides}
}

interface Harness {
	readonly client: ArroxyClient
	readonly store: FileSecretStore
	readonly logs: string[]
}

type ClientTuning = Omit<ArroxyClientOptions, 'environment' | 'log'>

function harness(box: Sandbox, tuning: ClientTuning = {}): Harness {
	const logs: string[] = []
	const environment = environmentFor(box)
	return {client: new ArroxyClient({...tuning, environment, log: line => logs.push(line)}), store: new FileSecretStore(box.configDir, environment.platform), logs}
}

function failureOf<T>(outcome: {ok: true; value: T} | {ok: false; failure: BridgeFailure}): BridgeFailure {
	if (outcome.ok) throw new Error(`expected a failure, got ${JSON.stringify(outcome.value)}`)
	return outcome.failure
}

// The first call asks Arroxy to allow the bridge; the user allows; the next call collects the secret.
async function approve(app: FakeApp, client: ArroxyClient): Promise<void> {
	const first = await client.call('profiles.list', {})
	expect(failureOf(first).kind).toBe('approvalPending')
	const [approvalId] = app.pendingApprovals()
	if (approvalId === undefined) throw new Error('no pending approval')
	app.allow(approvalId)
	const second = await client.call('profiles.list', {})
	expect(second.ok).toBe(true)
}

describe('handshake', () => {
	it('says hello, checks the server proof, authenticates and returns a parsed result', async () => {
		const box = await sandbox()
		const app = await startApp({userDataDir: box.userDataDir, socketPath: box.socketPath('a')})
		const {client} = harness(box)
		await approve(app, client)

		const outcome = await client.call('links.add', {requestId: 'r-1', url: 'https://www.youtube.com/watch?v=abc'})

		expect(outcome).toEqual({ok: true, value: {intakeId: 'i1', placeholderId: 'q1'}})
		expect(app.connections.at(-1)).toEqual(['hello', 'auth', 'links.add'])
		expect(app.requests.at(-1)).toEqual({method: 'links.add', params: {requestId: 'r-1', url: 'https://www.youtube.com/watch?v=abc'}})
	})

	it('sends nothing after hello when the server proof is forged', async () => {
		const box = await sandbox()
		const app = await startApp({userDataDir: box.userDataDir, socketPath: box.socketPath('a'), forgeServerProof: true})
		const {client} = harness(box)

		const failure = failureOf(await client.call('status', {}))

		expect(failure.kind).toBe('failed')
		expect(failure.message).toContain('could not prove it is Arroxy')
		// Give a stray auth frame time to arrive before asserting it never did.
		await new Promise(resolve => setTimeout(resolve, 50))
		expect(app.connections).toEqual([['hello']])
	})

	it('reports a malformed result instead of passing it on', async () => {
		const box = await sandbox()
		const app = await startApp({userDataDir: box.userDataDir, socketPath: box.socketPath('a'), handlers: {status: () => ({result: {ready: 'yes'}})}})
		const {client} = harness(box)
		await approve(app, client)

		const failure = failureOf(await client.call('status', {}))

		expect(failure.kind).toBe('failed')
		expect(failure.message).toContain('status')
	})
})

describe('approval', () => {
	it('stores the approvalId, then the issued secret, then authenticates with clientId and secret', async () => {
		const box = await sandbox()
		const app = await startApp({userDataDir: box.userDataDir, socketPath: box.socketPath('a')})
		const {client, store} = harness(box)

		const pending = failureOf(await client.call('status', {}))
		expect(pending).toMatchObject({kind: 'approvalPending', message: 'Arroxy is asking you to allow arroxy-mcp. Choose Allow in Arroxy, then try again.'})
		const [approvalId] = app.pendingApprovals()
		expect(await store.get(box.userDataDir)).toEqual({approvalId})

		// Still pending: the same approvalId is offered again, no second request.
		expect(failureOf(await client.call('status', {})).kind).toBe('approvalPending')
		expect(app.pendingApprovals()).toEqual([approvalId])

		app.allow(approvalId ?? '')
		expect((await client.call('status', {})).ok).toBe(true)
		const stored = await store.get(box.userDataDir)
		expect(stored).toEqual({clientId: 'c1', clientSecret: app.registry.secrets.get('c1')})

		expect((await client.call('status', {})).ok).toBe(true)
		expect(app.connections.length).toBe(4)
	})

	it.skipIf(isWindows)('writes the secret file owner-only', async () => {
		const box = await sandbox()
		const app = await startApp({userDataDir: box.userDataDir, socketPath: box.socketPath('a')})
		const {client} = harness(box)
		await approve(app, client)

		const fileStat = await fs.stat(path.join(box.configDir, 'clients.json'))
		const dirStat = await fs.stat(box.configDir)
		expect(fileStat.mode & 0o777).toBe(0o600)
		expect(dirStat.mode & 0o777).toBe(0o700)
	})

	it('clears the stored secret when Arroxy no longer knows the client, so the next call asks again', async () => {
		const box = await sandbox()
		const app = await startApp({userDataDir: box.userDataDir, socketPath: box.socketPath('a')})
		const {client, store} = harness(box)
		await approve(app, client)
		app.removeClient('c1')

		const failure = failureOf(await client.call('status', {}))

		expect(failure.kind).toBe('clientRemoved')
		expect(failure.next).toContain('ask Arroxy for access')
		expect(await store.get(box.userDataDir)).toBeNull()
		expect(failureOf(await client.call('status', {})).kind).toBe('approvalPending')
	})

	it('forgets an approvalId Arroxy refuses, so the next call asks again', async () => {
		const box = await sandbox()
		const app = await startApp({userDataDir: box.userDataDir, socketPath: box.socketPath('a')})
		const {client, store} = harness(box)
		await client.call('status', {})
		app.registry.approvals.clear()

		expect(failureOf(await client.call('status', {})).kind).toBe('denied')
		expect(await store.get(box.userDataDir)).toBeNull()
	})
})

describe('Control API errors', () => {
	it('carries the code, message and next step', async () => {
		const box = await sandbox()
		const app = await startApp({userDataDir: box.userDataDir, socketPath: box.socketPath('a'), handlers: {'queue.get': () => ({error: controlError('not_found', 'No queue item q9.')})}})
		const {client} = harness(box)
		await approve(app, client)

		const failure = failureOf(await client.call('queue.get', {itemId: 'q9'}))

		expect(failure).toMatchObject({kind: 'control', code: 'not_found', message: 'No queue item q9.'})
		expect(failure.next).toContain('queue.list')
	})
})

describe('not running', () => {
	it('when there is no discovery file', async () => {
		const box = await sandbox()
		const {client} = harness(box)
		expect(failureOf(await client.call('status', {}))).toMatchObject({kind: 'notRunning', message: NOT_RUNNING_MESSAGE})
	})

	it('when the discovery file is not valid', async () => {
		const box = await sandbox()
		await fs.mkdir(box.userDataDir, {recursive: true})
		await fs.writeFile(path.join(box.userDataDir, CONTROL_DISCOVERY_FILE_NAME), '{"socketPath": 3')
		const {client} = harness(box)
		expect(failureOf(await client.call('status', {})).kind).toBe('notRunning')
	})

	it('when the discovery file points at a socket nobody listens on', async () => {
		const box = await sandbox()
		const app = await startApp({userDataDir: box.userDataDir, socketPath: box.socketPath('a')})
		await app.stop()
		const {client} = harness(box)
		expect(failureOf(await client.call('status', {})).kind).toBe('notRunning')
	})
})

// A control.json exists, so Arroxy may well be running: say why it could not be
// reached instead of claiming it is closed.
describe('not running after a reboot', () => {
	it.skipIf(isWindows)('when the socket folder named in a leftover control.json is gone', async () => {
		const box = await sandbox()
		await fs.mkdir(box.userDataDir, {recursive: true})
		const socketPath = path.join(box.root, 'gone', 'control.sock')
		await fs.writeFile(path.join(box.userDataDir, CONTROL_DISCOVERY_FILE_NAME), JSON.stringify({socketPath, token: 't', version: '0.9.0', startedAt: 1}))
		const {client} = harness(box)

		expect(failureOf(await client.call('status', {}))).toMatchObject({kind: 'notRunning', message: NOT_RUNNING_MESSAGE})
	})

	it.skipIf(isWindows)('tries the next folder when the first one names a vanished socket folder', async () => {
		const box = await sandbox()
		const home = path.join(box.root, 'home')
		const nativeDir = path.join(home, '.config', 'arroxy')
		await fs.mkdir(nativeDir, {recursive: true})
		await fs.writeFile(path.join(nativeDir, CONTROL_DISCOVERY_FILE_NAME), JSON.stringify({socketPath: path.join(box.root, 'gone', 'control.sock'), token: 't', version: '0.9.0', startedAt: 1}))
		const app = await startApp({userDataDir: path.join(home, '.var', 'app', 'io.github.antonio_orionus.Arroxy', 'config', 'arroxy'), socketPath: box.socketPath('flatpak')})
		const client = new ArroxyClient({environment: {platform: 'linux', homedir: home, env: {ARROXY_MCP_CONFIG_DIR: box.configDir}}})

		expect(failureOf(await client.call('status', {})).kind).toBe('approvalPending')
		expect(app.connections).toEqual([['hello', 'auth']])
	})
})

describe('unreachable', () => {
	it.skipIf(isWindows)('names a socket folder open to other users, without connecting', async () => {
		const box = await sandbox()
		const app = await startApp({userDataDir: box.userDataDir, socketPath: box.socketPath('a')})
		await fs.chmod(box.socketDir, 0o755)
		const {client} = harness(box)

		const failure = failureOf(await client.call('status', {}))

		expect(failure.kind).toBe('failed')
		expect(failure.message).toContain(box.socketDir)
		expect(failure.message).toContain('open to other users')
		expect(failure.next).toBeTruthy()
		expect(app.connections).toEqual([])
	})

	it.skipIf(isWindows)('names a socket this user may not connect to', async () => {
		const box = await sandbox()
		const socketPath = box.socketPath('a')
		await startApp({userDataDir: box.userDataDir, socketPath})
		await fs.chmod(socketPath, 0o000)
		const {client} = harness(box)

		const failure = failureOf(await client.call('status', {}))

		expect(failure.kind).toBe('failed')
		expect(failure.message).toContain(socketPath)
		expect(failure.message).toMatch(/EACCES|EPERM/)
		expect(failure.next).toContain('same user')
	})
})

describe('discovery', () => {
	it('picks up an app restart with a new token and socket without a new client', async () => {
		const box = await sandbox()
		const first = await startApp({userDataDir: box.userDataDir, socketPath: box.socketPath('a')})
		const {client} = harness(box)
		await approve(first, client)
		await first.stop()

		const second = await startApp({userDataDir: box.userDataDir, socketPath: box.socketPath('b'), registry: first.registry})
		const outcome = await client.call('status', {})

		expect(outcome.ok).toBe(true)
		expect(second.token).not.toBe(first.token)
		expect(second.connections).toEqual([['hello', 'auth', 'status']])
	})

	it.skipIf(isWindows)('on Linux, checks both the native and the Flatpak folder and uses the one that answers', async () => {
		const box = await sandbox()
		const home = path.join(box.root, 'home')
		const nativeDir = path.join(home, '.config', 'arroxy')
		const flatpakDir = path.join(home, '.var', 'app', 'io.github.antonio_orionus.Arroxy', 'config', 'arroxy')
		const stale = await startApp({userDataDir: nativeDir, socketPath: box.socketPath('native')})
		await stale.stop()
		const app = await startApp({userDataDir: flatpakDir, socketPath: box.socketPath('flatpak')})
		const logs: string[] = []
		const client = new ArroxyClient({environment: {platform: 'linux', homedir: home, env: {ARROXY_MCP_CONFIG_DIR: box.configDir}}, log: line => logs.push(line)})

		expect(failureOf(await client.call('status', {})).kind).toBe('approvalPending')
		app.allow(app.pendingApprovals()[0] ?? '')

		expect((await client.call('status', {})).ok).toBe(true)
		expect(await new FileSecretStore(box.configDir, 'linux').get(flatpakDir)).toMatchObject({clientId: 'c1'})
	})

	// The candidate order itself is pinned in environment.test.ts; on a
	// case-insensitive disk (macOS) the two spellings are one folder, so this only
	// proves the capitalised folder is reachable.
	it.skipIf(isWindows)('on Linux, also finds an app under the capitalised Arroxy folder', async () => {
		const box = await sandbox()
		const home = path.join(box.root, 'home')
		const app = await startApp({userDataDir: path.join(home, '.config', 'Arroxy'), socketPath: box.socketPath('cap')})
		const client = new ArroxyClient({environment: {platform: 'linux', homedir: home, env: {ARROXY_MCP_CONFIG_DIR: box.configDir}}})

		expect(failureOf(await client.call('status', {})).kind).toBe('approvalPending')
		expect(app.connections).toEqual([['hello', 'auth']])
	})
})

describe('timeouts', () => {
	it('gives up on a socket that accepts but never answers hello', async () => {
		const box = await sandbox()
		const socketPath = box.socketPath('mute')
		const mute = net.createServer(socket => socket.resume())
		await new Promise<void>(resolve => mute.listen(socketPath, () => resolve()))
		cleanups.push(() => new Promise<void>(resolve => mute.close(() => resolve())))
		await fs.mkdir(box.userDataDir, {recursive: true})
		await fs.writeFile(path.join(box.userDataDir, CONTROL_DISCOVERY_FILE_NAME), JSON.stringify({socketPath, token: 't', version: '0.9.0', startedAt: 1}))
		const client = new ArroxyClient({environment: environmentFor(box), handshakeTimeoutMs: 100})

		const failure = failureOf(await client.call('status', {}))

		expect(failure.kind).toBe('failed')
		expect(failure.message).toContain('handshake')
	})
})

async function until(predicate: () => boolean, timeoutMs = 2000): Promise<void> {
	const deadline = Date.now() + timeoutMs
	while (!predicate()) {
		if (Date.now() > deadline) throw new Error('condition not reached in time')
		await new Promise(resolve => setTimeout(resolve, 10))
	}
}

const STATUS = {ready: true, binaries: {ytDlp: 'ready', ffmpeg: 'ready'}, scheduler: 'running', cooldowns: []}

describe('frames', () => {
	it('skips an event frame that arrives before the response', async () => {
		const box = await sandbox()
		const event = {type: 'event', event: 'app.status', seq: 1, bootId: 'b1', data: {status: STATUS}}
		const app = await startApp({userDataDir: box.userDataDir, socketPath: box.socketPath('a'), handlers: {status: (_params, id) => ({lines: [event, {type: 'response', id, ok: true, result: STATUS}]})}})
		const {client} = harness(box)
		await approve(app, client)

		expect(await client.call('status', {})).toEqual({ok: true, value: STATUS})
	})

	it("surfaces the app's closing handshake_timeout line, whose id is null", async () => {
		const box = await sandbox()
		await startApp({userDataDir: box.userDataDir, socketPath: box.socketPath('a'), handshakeTimeoutOnAuth: true})
		const {client} = harness(box)

		expect(failureOf(await client.call('status', {}))).toMatchObject({kind: 'control', code: 'handshake_timeout'})
	})
})

describe('request deadlines', () => {
	it('gives up on a request Arroxy never answers', async () => {
		const box = await sandbox()
		const app = await startApp({userDataDir: box.userDataDir, socketPath: box.socketPath('a'), handlers: {status: () => ({silent: true})}})
		const {client} = harness(box, {requestTimeoutMs: 50})
		await approve(app, client)

		const started = Date.now()
		const failure = failureOf(await client.call('status', {}))

		expect(failure.kind).toBe('failed')
		expect(failure.message).toContain('did not answer status within 50 ms')
		expect(Date.now() - started).toBeLessThan(1000)
		await until(() => app.openConnections() === 0)
	})

	it('lets wait run for its own timeoutMs plus a margin, not the plain request deadline', async () => {
		const box = await sandbox()
		const app = await startApp({userDataDir: box.userDataDir, socketPath: box.socketPath('a'), handlers: {wait: () => ({silent: true})}})
		const {client} = harness(box, {requestTimeoutMs: 20, waitTimeoutMarginMs: 100})
		await approve(app, client)

		const started = Date.now()
		const failure = failureOf(await client.call('wait', {itemId: 'q1', until: 'done', timeoutMs: 100}))

		expect(failure.message).toContain('did not answer wait within 200 ms')
		expect(Date.now() - started).toBeGreaterThanOrEqual(190)
	})
})

describe('cancellation', () => {
	it('closes the connection when the caller aborts', async () => {
		const box = await sandbox()
		const app = await startApp({userDataDir: box.userDataDir, socketPath: box.socketPath('a'), handlers: {wait: () => ({silent: true})}})
		const {client} = harness(box)
		await approve(app, client)
		const controller = new AbortController()

		const pending = client.call('wait', {itemId: 'q1', until: 'done', timeoutMs: 240_000}, {signal: controller.signal})
		await until(() => app.requests.some(request => request.method === 'wait'))
		controller.abort()
		const failure = failureOf(await pending)

		expect(failure.kind).toBe('failed')
		expect(failure.message).toContain('cancelled')
		await until(() => app.openConnections() === 0)
	})

	it('does not connect at all when the signal is already aborted', async () => {
		const box = await sandbox()
		const app = await startApp({userDataDir: box.userDataDir, socketPath: box.socketPath('a')})
		const {client} = harness(box)

		const failure = failureOf(await client.call('status', {}, {signal: AbortSignal.abort()}))

		expect(failure.message).toContain('cancelled')
		expect(app.connections).toEqual([])
	})
})

describe('concurrent calls', () => {
	it('two calls at once right after Allow both succeed, and the one-time secret survives', async () => {
		const box = await sandbox()
		const app = await startApp({userDataDir: box.userDataDir, socketPath: box.socketPath('a')})
		const {client, store} = harness(box)
		await client.call('status', {})
		app.allow(app.pendingApprovals()[0] ?? '')

		const outcomes = await Promise.all([client.call('status', {}), client.call('status', {})])

		expect(outcomes.map(outcome => outcome.ok)).toEqual([true, true])
		expect(app.registry.secrets.size).toBe(1)
		expect(await store.get(box.userDataDir)).toEqual({clientId: 'c1', clientSecret: app.registry.secrets.get('c1')})
	})

	it('two first-time calls at once raise one approval request', async () => {
		const box = await sandbox()
		const app = await startApp({userDataDir: box.userDataDir, socketPath: box.socketPath('a')})
		const {client} = harness(box)

		const outcomes = await Promise.all([client.call('status', {}), client.call('status', {})])

		expect(outcomes.map(outcome => failureOf(outcome).kind)).toEqual(['approvalPending', 'approvalPending'])
		expect(app.registry.approvals.size).toBe(1)
	})

	it('two processes at once after Allow: whichever loses the race uses the secret the other saved', async () => {
		const box = await sandbox()
		const app = await startApp({userDataDir: box.userDataDir, socketPath: box.socketPath('a')})
		const first = harness(box)
		const second = harness(box)
		await first.client.call('status', {})
		app.allow(app.pendingApprovals()[0] ?? '')

		const outcomes = await Promise.all([first.client.call('status', {}), second.client.call('status', {})])

		expect(outcomes.map(outcome => outcome.ok)).toEqual([true, true])
		expect(app.registry.secrets.size).toBe(1)
		expect(await first.store.get(box.userDataDir)).toMatchObject({clientId: 'c1'})
	})
})

describe('secret store failures', () => {
	// Arroxy allowed the bridge; the config folder then refuses the secret.
	async function allowedWithReadOnlyConfig(box: Sandbox, app: FakeApp, client: ArroxyClient): Promise<void> {
		await client.call('status', {})
		app.allow(app.pendingApprovals()[0] ?? '')
		await fs.chmod(box.configDir, 0o500)
		cleanups.push(() => fs.chmod(box.configDir, 0o700))
	}

	it.skipIf(isWindows)('keeps the result of the call that collected the secret, with a warning that it could not be saved', async () => {
		const box = await sandbox()
		const app = await startApp({userDataDir: box.userDataDir, socketPath: box.socketPath('a')})
		const {client} = harness(box)
		await allowedWithReadOnlyConfig(box, app, client)

		const outcome = await client.call('links.add', {requestId: 'r-1', url: 'https://example.com/v'})

		expect(app.requests.map(request => request.method)).toEqual(['links.add'])
		if (!outcome.ok) throw new Error(`expected the result, got ${outcome.failure.message}`)
		// The intake handle survives, so a caller never re-adds the link.
		expect(outcome.value).toEqual({intakeId: 'i1', placeholderId: 'q1'})
		expect(outcome.warning?.message).toContain(box.configDir)
		expect(outcome.warning?.next).toContain('remove arroxy-mcp in Arroxy')
	})

	it.skipIf(isWindows)('keeps the warning when the request itself fails', async () => {
		const box = await sandbox()
		const app = await startApp({userDataDir: box.userDataDir, socketPath: box.socketPath('a'), handlers: {'queue.get': () => ({error: controlError('not_found', 'No queue item q9.')})}})
		const {client} = harness(box)
		await allowedWithReadOnlyConfig(box, app, client)

		const outcome = await client.call('queue.get', {itemId: 'q9'})

		expect(failureOf(outcome)).toMatchObject({kind: 'control', code: 'not_found'})
		expect(outcome.warning?.message).toContain(box.configDir)
	})

	it.skipIf(isWindows)('reports an unreadable clients.json instead of starting over', async () => {
		const box = await sandbox()
		const app = await startApp({userDataDir: box.userDataDir, socketPath: box.socketPath('a')})
		const {client} = harness(box)
		await approve(app, client)
		const file = path.join(box.configDir, 'clients.json')
		await fs.chmod(file, 0o000)
		cleanups.push(() => fs.chmod(file, 0o600))

		const failure = failureOf(await client.call('status', {}))

		expect(failure.kind).toBe('failed')
		expect(failure.message).toContain(file)
		expect(app.pendingApprovals()).toEqual([])
	})
})

// Another arroxy-mcp process holding the store lock, by its lock file.
async function holdLock(box: Sandbox): Promise<string> {
	await fs.mkdir(box.configDir, {recursive: true})
	const lockFile = path.join(box.configDir, 'clients.json.lock')
	await fs.writeFile(lockFile, 'another-process')
	return lockFile
}

describe('waiting for the store lock', () => {
	it("waits before connecting, so the wait never eats into the app's handshake window", async () => {
		const box = await sandbox()
		await startApp({userDataDir: box.userDataDir, socketPath: box.socketPath('a'), handshakeWindowMs: 300})
		const lockFile = await holdLock(box)
		const released = new Promise<void>(resolve => setTimeout(() => void fs.rm(lockFile).then(() => resolve()), 600))
		const {client} = harness(box)

		const outcome = await client.call('status', {})
		await released

		expect(failureOf(outcome).kind).toBe('approvalPending')
	})

	it('says another arroxy-mcp is busy when the lock stays held', async () => {
		const box = await sandbox()
		const app = await startApp({userDataDir: box.userDataDir, socketPath: box.socketPath('a')})
		await holdLock(box)
		const {client} = harness(box, {lockWaitMs: 100})

		const failure = failureOf(await client.call('status', {}))

		expect(failure.kind).toBe('failed')
		expect(failure.message).toContain('Another arroxy-mcp')
		expect(failure.next).toContain('try again')
		expect(app.connections).toEqual([])
	})

	it('stops waiting promptly when the caller aborts', async () => {
		const box = await sandbox()
		await holdLock(box)
		const {client} = harness(box)
		const controller = new AbortController()
		setTimeout(() => controller.abort(), 50)

		const started = Date.now()
		const failure = failureOf(await client.call('status', {}, {signal: controller.signal}))

		expect(failure.message).toContain('cancelled')
		expect(Date.now() - started).toBeLessThan(1000)
	})
})
