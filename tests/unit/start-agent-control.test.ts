// @vitest-environment node

import {EventEmitter} from 'node:events'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {afterEach, describe, expect, it, vi} from 'vite-plus/test'
import {CONTROL_DISCOVERY_FILE_NAME} from 'arroxy-control'
import {LocalClientRegistry} from '@main/control/clients/LocalClientRegistry.js'
import {type LocalClientRecord, type LocalClientStore, MemoryLocalClientStore} from '@main/control/clients/localClientStore.js'
import {e2eTestSecretCipher, type SecretCipher} from '@main/control/clients/secretCipher.js'
import type {ControlService} from '@main/control/ControlService.js'
import type {ControlWiring} from '@main/control/createControlService.js'
import type {ControlSocket, ControlSocketOptions} from '@main/control/socket/startControlSocket.js'
import {type AgentControlDeps, autoAllowsClients, type LocalClientsHolder, E2E_MANUAL_CLIENT_APPROVAL_VAR, localClientCipher, startAgentControl, stopAgentControlOnQuit} from '@main/control/startAgentControl.js'
import {importWithReleaseFlagsOff} from '../helpers/releaseFlags.js'

vi.mock('electron-log/main.js', () => {
	const logger = {debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn()}
	return {default: {...logger, scope: () => logger}}
})

// The Control API's start-up: behind the agentControl release flag it
// composes the service, starts the local socket and stops it on quit; off,
// it touches nothing.

const isWindows = process.platform === 'win32'
const cleanups: Array<() => Promise<void>> = []

afterEach(async () => {
	vi.unstubAllEnvs()
	vi.resetModules()
	for (const cleanup of cleanups.splice(0).reverse()) await cleanup()
})

async function tempDir(): Promise<string> {
	const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'sac-'))
	cleanups.push(() => fs.rm(dir, {recursive: true, force: true}))
	return dir
}

const silentLog = {info: vi.fn(), warn: vi.fn(), error: vi.fn()}

// What createControlService needs, unused when compose is faked.
const wiring = {} as Omit<ControlWiring, 'clientLabel' | 'createFeed'>

function fakeCompose() {
	const service: Pick<ControlService, 'openSession'> = {openSession: vi.fn<ControlService['openSession']>()}
	const compose = vi.fn((_wiring: ControlWiring) => ({service, registry: {bootId: 'boot-1'}}))
	return {service, compose}
}

function fakeSocket(socketPath: string) {
	const stop = vi.fn(() => Promise.resolve())
	const socket: ControlSocket = {socketPath, stop}
	return {socket, stop}
}

// The window's local-clients IPC, recording what agent control sets and clears.
function fakeHolder(events: string[] = []) {
	const set = vi.fn((_clients: LocalClientRegistry) => void events.push('set'))
	const clear = vi.fn(() => void events.push('cleared'))
	const holder: LocalClientsHolder = {set, clear}
	return {holder, set, clear}
}

function deps(overrides: Partial<AgentControlDeps> = {}): AgentControlDeps {
	return {...wiring, userDataDir: '/user-data', appVersion: '9.9.9', platform: 'linux', env: {XDG_RUNTIME_DIR: '/run/user/1000'}, autoAllowClients: false, clientStore: new MemoryLocalClientStore(), secretsStorable: () => true, localClients: fakeHolder().holder, log: silentLog, ...overrides}
}

const knownRecord: LocalClientRecord = {clientId: 'known-1', label: 'Claude Code', pathsRead: false, firstSeenAt: 1, lastSeenAt: 2, secret: 'known-secret'}

describe('startAgentControl', () => {
	it('composes the service and starts the socket with it', async () => {
		const {service, compose} = fakeCompose()
		const {socket} = fakeSocket('/run/user/1000/arroxy-abcdef/control.sock')
		const startSocket = vi.fn((_options: ControlSocketOptions) => Promise.resolve(socket))
		const control = await startAgentControl(deps({compose, startSocket}))
		expect(control).not.toBeNull()
		expect(startSocket).toHaveBeenCalledWith(expect.objectContaining({userDataDir: '/user-data', appVersion: '9.9.9', platform: 'linux', env: {XDG_RUNTIME_DIR: '/run/user/1000'}, service, bootId: 'boot-1', log: silentLog}))
		await control?.stop()
	})

	it("labels a client by the name it gave, from the socket's approvals", async () => {
		const {compose} = fakeCompose()
		const {socket} = fakeSocket('/s')
		const startSocket = vi.fn((_options: ControlSocketOptions) => Promise.resolve(socket))
		const control = await startAgentControl(deps({compose, startSocket, autoAllowClients: true}))
		const approvals = startSocket.mock.calls[0]?.[0].approvals
		const clientLabel = compose.mock.calls[0]?.[0].clientLabel
		if (!approvals || !clientLabel) throw new Error('not started')
		const approvalId = approvals.request('Claude Code')
		const claim = approvals.claim(approvalId)
		if (claim.status !== 'allowed') throw new Error('not allowed')
		approvals.confirm(approvalId)
		expect(clientLabel(claim.client.clientId)).toBe('Claude Code')
		expect(clientLabel('someone-else')).toBeNull()
		await control?.stop()
	})

	it('passes autoAllowClients through to the approvals', async () => {
		const claims = async (autoAllowClients: boolean): Promise<string> => {
			const startSocket = vi.fn((_options: ControlSocketOptions) => Promise.resolve(fakeSocket('/s').socket))
			await startAgentControl(deps({compose: fakeCompose().compose, startSocket, autoAllowClients}))
			const approvals = startSocket.mock.calls[0]?.[0].approvals
			if (!approvals) throw new Error('not started')
			return approvals.claim(approvals.request('agent')).status
		}
		expect(await claims(true)).toBe('allowed')
		expect(await claims(false)).toBe('pending')
	})

	it('loads the known clients before the socket listens', async () => {
		let finishLoading: (records: LocalClientRecord[]) => void = () => undefined
		const clientStore: LocalClientStore = {load: () => new Promise(resolve => (finishLoading = resolve)), save: () => Promise.resolve()}
		const startSocket = vi.fn((options: ControlSocketOptions) => {
			expect(options.approvals.client('known-1')).toMatchObject({clientId: 'known-1', secret: 'known-secret'})
			return Promise.resolve(fakeSocket('/s').socket)
		})
		const starting = startAgentControl(deps({compose: fakeCompose().compose, startSocket, clientStore}))
		await new Promise(resolve => setTimeout(resolve, 20))
		expect(startSocket).not.toHaveBeenCalled()
		finishLoading([knownRecord])
		const control = await starting
		expect(startSocket).toHaveBeenCalledTimes(1)
		await control?.stop()
	})

	it('waits on stop for the last save of the local clients', async () => {
		let finishSaving: () => void = () => undefined
		const save = vi.fn(() => new Promise<void>(resolve => (finishSaving = resolve)))
		const startSocket = vi.fn((_options: ControlSocketOptions) => Promise.resolve(fakeSocket('/s').socket))
		const control = await startAgentControl(deps({compose: fakeCompose().compose, startSocket, autoAllowClients: true, clientStore: {load: () => Promise.resolve([]), save}}))
		const approvals = startSocket.mock.calls[0]?.[0].approvals
		if (!approvals) throw new Error('not started')
		const approvalId = approvals.request('agent')
		approvals.claim(approvalId)
		approvals.confirm(approvalId)
		expect(save).toHaveBeenCalledTimes(1)
		let stopped = false
		const stopping = control?.stop().then(() => (stopped = true))
		await new Promise(resolve => setTimeout(resolve, 20))
		expect(stopped).toBe(false)
		finishSaving()
		await stopping
		expect(stopped).toBe(true)
	})

	it('is null when the socket cannot start', async () => {
		const control = await startAgentControl(deps({compose: fakeCompose().compose, startSocket: () => Promise.resolve(null)}))
		expect(control).toBeNull()
	})

	it('sets the registry the socket uses for the window, from before it listens until stop', async () => {
		const events: string[] = []
		const {holder, set} = fakeHolder(events)
		const {socket, stop} = fakeSocket('/s')
		stop.mockImplementation(() => {
			events.push('socket stopped')
			return Promise.resolve()
		})
		const startSocket = vi.fn((_options: ControlSocketOptions) => {
			events.push('listening')
			return Promise.resolve(socket)
		})
		const control = await startAgentControl(deps({compose: fakeCompose().compose, startSocket, localClients: holder}))
		expect(set).toHaveBeenCalledExactlyOnceWith(startSocket.mock.calls[0]?.[0].approvals)
		await control?.stop()
		await control?.stop()
		expect(events).toEqual(['set', 'listening', 'socket stopped', 'cleared'])
	})

	it('clears the registry from the window when the socket cannot start', async () => {
		const events: string[] = []
		const control = await startAgentControl(deps({compose: fakeCompose().compose, startSocket: () => Promise.resolve(null), localClients: fakeHolder(events).holder}))
		expect(control).toBeNull()
		expect(events).toEqual(['set', 'cleared'])
	})

	it('clears the registry from the window and closes it when the socket throws', async () => {
		const events: string[] = []
		const close = vi.spyOn(LocalClientRegistry.prototype, 'close')
		cleanups.push(() => Promise.resolve(close.mockRestore()))
		const failure = new Error('listen failed')
		await expect(startAgentControl(deps({compose: fakeCompose().compose, startSocket: () => Promise.reject(failure), localClients: fakeHolder(events).holder}))).rejects.toBe(failure)
		expect(events).toEqual(['set', 'cleared'])
		expect(close).toHaveBeenCalledTimes(1)
	})

	it('closes the registry, never setting it for the window, when composing throws', async () => {
		const {holder, set} = fakeHolder()
		const close = vi.spyOn(LocalClientRegistry.prototype, 'close')
		cleanups.push(() => Promise.resolve(close.mockRestore()))
		const failure = new Error('compose failed')
		const compose = vi.fn((): never => {
			throw failure
		})
		await expect(startAgentControl(deps({compose, localClients: holder}))).rejects.toBe(failure)
		expect(set).not.toHaveBeenCalled()
		expect(close).toHaveBeenCalledTimes(1)
	})

	it('never sets a registry for the window when the clients fail to load', async () => {
		const {holder, set} = fakeHolder()
		const failure = new Error('load failed')
		const clientStore: LocalClientStore = {load: () => Promise.reject(failure), save: () => Promise.resolve()}
		await expect(startAgentControl(deps({compose: fakeCompose().compose, clientStore, localClients: holder}))).rejects.toBe(failure)
		expect(set).not.toHaveBeenCalled()
	})

	it('stops the socket once', async () => {
		const {socket, stop} = fakeSocket('/s')
		const control = await startAgentControl(deps({compose: fakeCompose().compose, startSocket: () => Promise.resolve(socket)}))
		await Promise.all([control?.stop(), control?.stop()])
		expect(stop).toHaveBeenCalledTimes(1)
	})

	it.skipIf(isWindows)('listens afresh when its socket disappears from /tmp', async () => {
		const dir = await tempDir()
		const first = fakeSocket(path.join(dir, 'first.sock'))
		const second = fakeSocket(path.join(dir, 'second.sock'))
		await fs.writeFile(first.socket.socketPath, '')
		await fs.writeFile(second.socket.socketPath, '')
		const startSocket = vi.fn<(options: ControlSocketOptions) => Promise<ControlSocket | null>>().mockResolvedValueOnce(first.socket).mockResolvedValueOnce(second.socket)
		const control = await startAgentControl(deps({platform: 'darwin', compose: fakeCompose().compose, startSocket, socketCheckIntervalMs: 10}))
		await new Promise(resolve => setTimeout(resolve, 40))
		expect(startSocket).toHaveBeenCalledTimes(1)
		await fs.rm(first.socket.socketPath)
		await vi.waitFor(() => expect(startSocket).toHaveBeenCalledTimes(2))
		expect(first.stop).toHaveBeenCalledTimes(1)
		await control?.stop()
		expect(second.stop).toHaveBeenCalledTimes(1)
	})

	it.skipIf(isWindows)('waits on stop for a re-listen under way, and stops the socket it made', async () => {
		const dir = await tempDir()
		const first = fakeSocket(path.join(dir, 'first.sock'))
		const second = fakeSocket(path.join(dir, 'second.sock'))
		await fs.writeFile(first.socket.socketPath, '')
		let finishListening: (socket: ControlSocket) => void = () => undefined
		const startSocket = vi
			.fn<(options: ControlSocketOptions) => Promise<ControlSocket | null>>()
			.mockResolvedValueOnce(first.socket)
			.mockReturnValueOnce(new Promise(resolve => (finishListening = resolve)))
		const control = await startAgentControl(deps({platform: 'darwin', compose: fakeCompose().compose, startSocket, socketCheckIntervalMs: 10}))
		await fs.rm(first.socket.socketPath)
		await vi.waitFor(() => expect(startSocket).toHaveBeenCalledTimes(2))
		let stopped = false
		const stopping = control?.stop().then(() => (stopped = true))
		await new Promise(resolve => setTimeout(resolve, 30))
		expect(stopped).toBe(false)
		finishListening(second.socket)
		await stopping
		expect(second.stop).toHaveBeenCalledTimes(1)
		expect(startSocket).toHaveBeenCalledTimes(2)
	})

	it.skipIf(isWindows)('logs a re-listen that threw by its error name', async () => {
		const dir = await tempDir()
		const first = fakeSocket(path.join(dir, 'first.sock'))
		await fs.writeFile(first.socket.socketPath, '')
		const log = {info: vi.fn(), warn: vi.fn(), error: vi.fn()}
		const startSocket = vi.fn<(options: ControlSocketOptions) => Promise<ControlSocket | null>>().mockResolvedValueOnce(first.socket).mockRejectedValue(new TypeError('/private/path'))
		const control = await startAgentControl(deps({platform: 'darwin', compose: fakeCompose().compose, startSocket, socketCheckIntervalMs: 10, log}))
		await fs.rm(first.socket.socketPath)
		await vi.waitFor(() => expect(log.error).toHaveBeenCalledWith('the control socket could not listen again', {code: 'TypeError'}))
		await control?.stop()
	})

	it.skipIf(isWindows)('tries again on the next check when listening afresh failed', async () => {
		const dir = await tempDir()
		const first = fakeSocket(path.join(dir, 'first.sock'))
		const third = fakeSocket(path.join(dir, 'third.sock'))
		await fs.writeFile(first.socket.socketPath, '')
		await fs.writeFile(third.socket.socketPath, '')
		const startSocket = vi.fn<(options: ControlSocketOptions) => Promise<ControlSocket | null>>().mockResolvedValueOnce(first.socket).mockResolvedValueOnce(null).mockResolvedValueOnce(third.socket)
		const control = await startAgentControl(deps({platform: 'darwin', compose: fakeCompose().compose, startSocket, socketCheckIntervalMs: 10}))
		await fs.rm(first.socket.socketPath)
		await vi.waitFor(() => expect(startSocket).toHaveBeenCalledTimes(3))
		await new Promise(resolve => setTimeout(resolve, 40))
		expect(startSocket).toHaveBeenCalledTimes(3)
		await control?.stop()
		expect(third.stop).toHaveBeenCalledTimes(1)
	})

	it('never checks a named pipe', async () => {
		const startSocket = vi.fn((_options: ControlSocketOptions) => Promise.resolve(fakeSocket('\\\\.\\pipe\\arroxy-control-0123456789abcdef').socket))
		const control = await startAgentControl(deps({platform: 'win32', compose: fakeCompose().compose, startSocket, socketCheckIntervalMs: 10}))
		await new Promise(resolve => setTimeout(resolve, 50))
		expect(startSocket).toHaveBeenCalledTimes(1)
		await control?.stop()
	})
})

describe('stopAgentControlOnQuit', () => {
	class FakeApp extends EventEmitter {
		readonly exit = vi.fn()
		quit(): {defaultPrevented: boolean} {
			const result = {defaultPrevented: false}
			const event = {preventDefault: () => (result.defaultPrevented = true)}
			this.emit('before-quit', event)
			this.emit('will-quit', event)
			return result
		}
	}

	it('holds the quit until the socket is stopped, then exits', async () => {
		const app = new FakeApp()
		const {socket, stop} = fakeSocket('/s')
		const started = Promise.resolve({stop: () => socket.stop()})
		stopAgentControlOnQuit(app, started, silentLog)
		await started
		expect(app.quit().defaultPrevented).toBe(true)
		expect(stop).toHaveBeenCalledTimes(1)
		await vi.waitFor(() => expect(app.exit).toHaveBeenCalledWith(0))
	})

	it('lets the quit through when agent control is off', async () => {
		const app = new FakeApp()
		const started = Promise.resolve(null)
		stopAgentControlOnQuit(app, started, silentLog)
		await started
		expect(app.quit().defaultPrevented).toBe(false)
		expect(app.exit).not.toHaveBeenCalled()
	})

	it('logs a start that failed by its error name when it has no errno code', async () => {
		const app = new FakeApp()
		const log = {info: vi.fn(), warn: vi.fn(), error: vi.fn()}
		stopAgentControlOnQuit(app, Promise.reject(new TypeError('/private/path')), log)
		await vi.waitFor(() => expect(log.error).toHaveBeenCalledWith('agent control could not start', {code: 'TypeError'}))
	})

	it('warns when stopping failed, and still exits', async () => {
		const app = new FakeApp()
		const log = {info: vi.fn(), warn: vi.fn(), error: vi.fn()}
		const started = Promise.resolve({stop: () => Promise.reject(Object.assign(new Error('x'), {code: 'EPERM'}))})
		stopAgentControlOnQuit(app, started, log)
		await started
		app.quit()
		await vi.waitFor(() => expect(app.exit).toHaveBeenCalledWith(0))
		expect(log.warn).toHaveBeenCalledWith('agent control did not stop cleanly', {code: 'EPERM'})
	})

	it('warns when stopping outlasts its budget, and exits anyway', async () => {
		vi.useFakeTimers()
		try {
			const app = new FakeApp()
			const log = {info: vi.fn(), warn: vi.fn(), error: vi.fn()}
			const started = Promise.resolve({stop: () => new Promise<void>(() => undefined)})
			stopAgentControlOnQuit(app, started, log)
			await started
			app.quit()
			await vi.advanceTimersByTimeAsync(2000)
			expect(app.exit).toHaveBeenCalledWith(0)
			expect(log.warn).toHaveBeenCalledWith('agent control took too long to stop; quitting anyway', {budgetMs: 2000})
		} finally {
			vi.useRealTimers()
		}
	})

	it('logs a start that failed, and lets the quit through', async () => {
		const app = new FakeApp()
		const log = {info: vi.fn(), warn: vi.fn(), error: vi.fn()}
		const failure = Object.assign(new Error('secret detail'), {code: 'EACCES'})
		stopAgentControlOnQuit(app, Promise.reject(failure), log)
		await vi.waitFor(() => expect(log.error).toHaveBeenCalledWith('agent control could not start', {code: 'EACCES'}))
		expect(app.quit().defaultPrevented).toBe(false)
	})

	it('stops a socket that finishes starting after the quit began', async () => {
		const app = new FakeApp()
		const {socket, stop} = fakeSocket('/s')
		let finish: (control: {stop(): Promise<void>}) => void = () => undefined
		stopAgentControlOnQuit(app, new Promise(resolve => (finish = resolve)), silentLog)
		expect(app.quit().defaultPrevented).toBe(false)
		finish({stop: () => socket.stop()})
		await vi.waitFor(() => expect(stop).toHaveBeenCalledTimes(1))
	})
})

describe('autoAllowsClients', () => {
	it('allows clients at once only in an unpackaged E2E run', () => {
		expect(autoAllowsClients({e2eHarness: true, isPackaged: false}, {})).toBe(true)
		expect(autoAllowsClients({e2eHarness: true, isPackaged: true}, {})).toBe(false)
		expect(autoAllowsClients({e2eHarness: false, isPackaged: false}, {})).toBe(false)
		expect(autoAllowsClients({e2eHarness: false, isPackaged: true}, {})).toBe(false)
	})

	it('leaves Allow to the run that asks for it, and reads that only in an unpackaged E2E run', () => {
		const manual = {[E2E_MANUAL_CLIENT_APPROVAL_VAR]: '1'}
		expect(autoAllowsClients({e2eHarness: true, isPackaged: false}, manual)).toBe(false)
		expect(autoAllowsClients({e2eHarness: true, isPackaged: false}, {[E2E_MANUAL_CLIENT_APPROVAL_VAR]: '0'})).toBe(true)
		const read = vi.fn(() => '1')
		const watched = new Proxy<Record<string, string | undefined>>({}, {get: read})
		expect(autoAllowsClients({e2eHarness: false, isPackaged: false}, watched)).toBe(false)
		expect(autoAllowsClients({e2eHarness: true, isPackaged: true}, watched)).toBe(false)
		expect(read).not.toHaveBeenCalled()
	})
})

describe('localClientCipher', () => {
	it('keeps secrets with the marked test cipher only in an unpackaged E2E run', () => {
		const platform: SecretCipher = {available: () => true, encrypt: plain => Buffer.from(plain), decrypt: data => data.toString()}
		const platformCipher = vi.fn(() => platform)
		expect(localClientCipher({e2eHarness: true, isPackaged: false}, platformCipher)).toBe(e2eTestSecretCipher)
		expect(platformCipher).not.toHaveBeenCalled()
		expect(localClientCipher({e2eHarness: true, isPackaged: true}, platformCipher)).toBe(platform)
		expect(localClientCipher({e2eHarness: false, isPackaged: false}, platformCipher)).toBe(platform)
		expect(localClientCipher({e2eHarness: false, isPackaged: true}, platformCipher)).toBe(platform)
	})
})

describe('startAgentControl in a release build', () => {
	// A release build must not reach the socket at all: no launch folder, no
	// socket, no control.json, and no clean-up of an earlier launch's.
	it('starts nothing and touches no file', async () => {
		const {startAgentControl: startInRelease} = await importWithReleaseFlagsOff(() => import('@main/control/startAgentControl.js'))
		const runtimeDir = await tempDir()
		const userDataDir = await tempDir()
		const stale = JSON.stringify({socketPath: path.posix.join(runtimeDir, 'arroxy-abcdef', 'control.sock'), token: 't', version: '1', startedAt: 1})
		await fs.writeFile(path.join(userDataDir, CONTROL_DISCOVERY_FILE_NAME), stale)
		const {compose} = fakeCompose()
		const clientStore = {load: vi.fn<LocalClientStore['load']>(), save: vi.fn<LocalClientStore['save']>()}
		const secretsStorable = vi.fn(() => true)
		// The window's local-clients IPC: never given a registry.
		const {holder, set, clear} = fakeHolder()
		const control = await startInRelease(deps({userDataDir, env: {XDG_RUNTIME_DIR: runtimeDir}, compose, clientStore, secretsStorable, localClients: holder}))
		expect(control).toBeNull()
		expect(compose).not.toHaveBeenCalled()
		expect(clientStore.load).not.toHaveBeenCalled()
		expect(clientStore.save).not.toHaveBeenCalled()
		expect(secretsStorable).not.toHaveBeenCalled()
		expect(set).not.toHaveBeenCalled()
		expect(clear).not.toHaveBeenCalled()
		expect(await fs.readdir(runtimeDir)).toEqual([])
		expect(await fs.readFile(path.join(userDataDir, CONTROL_DISCOVERY_FILE_NAME), 'utf8')).toBe(stale)
	})

	// The same call with the flag on does listen, so the test above can see a socket.
	it.skipIf(isWindows)('listens with the flag on', async () => {
		const runtimeDir = await tempDir()
		const userDataDir = await tempDir()
		const control = await startAgentControl(deps({userDataDir, env: {XDG_RUNTIME_DIR: runtimeDir}, compose: fakeCompose().compose}))
		expect(control).not.toBeNull()
		expect(await fs.readdir(runtimeDir)).toEqual([expect.stringMatching(/^arroxy-/)])
		expect(await fs.readdir(userDataDir)).toEqual([CONTROL_DISCOVERY_FILE_NAME])
		await control?.stop()
		expect(await fs.readdir(runtimeDir)).toEqual([])
	})
})
