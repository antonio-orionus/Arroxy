// @vitest-environment node

import {EventEmitter} from 'node:events'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {afterEach, describe, expect, it, vi} from 'vite-plus/test'
import {CONTROL_DISCOVERY_FILE_NAME} from 'arroxy-control'
import type {ControlService} from '@main/control/ControlService.js'
import type {ControlWiring} from '@main/control/createControlService.js'
import type {ControlSocket, ControlSocketOptions} from '@main/control/socket/startControlSocket.js'
import {type AgentControlDeps, startAgentControl, stopAgentControlOnQuit} from '@main/control/startAgentControl.js'
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

function deps(overrides: Partial<AgentControlDeps> = {}): AgentControlDeps {
	return {...wiring, userDataDir: '/user-data', appVersion: '9.9.9', platform: 'linux', env: {XDG_RUNTIME_DIR: '/run/user/1000'}, autoAllowClients: false, log: silentLog, ...overrides}
}

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

	it('allows clients at once only in an E2E run', async () => {
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

	it('is null when the socket cannot start', async () => {
		const control = await startAgentControl(deps({compose: fakeCompose().compose, startSocket: () => Promise.resolve(null)}))
		expect(control).toBeNull()
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
		stopAgentControlOnQuit(app, started)
		await started
		expect(app.quit().defaultPrevented).toBe(true)
		expect(stop).toHaveBeenCalledTimes(1)
		await vi.waitFor(() => expect(app.exit).toHaveBeenCalledWith(0))
	})

	it('lets the quit through when agent control is off', async () => {
		const app = new FakeApp()
		const started = Promise.resolve(null)
		stopAgentControlOnQuit(app, started)
		await started
		expect(app.quit().defaultPrevented).toBe(false)
		expect(app.exit).not.toHaveBeenCalled()
	})

	it('stops a socket that finishes starting after the quit began', async () => {
		const app = new FakeApp()
		const {socket, stop} = fakeSocket('/s')
		let finish: (control: {stop(): Promise<void>}) => void = () => undefined
		stopAgentControlOnQuit(app, new Promise(resolve => (finish = resolve)))
		expect(app.quit().defaultPrevented).toBe(false)
		finish({stop: () => socket.stop()})
		await vi.waitFor(() => expect(stop).toHaveBeenCalledTimes(1))
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
		const control = await startInRelease(deps({userDataDir, env: {XDG_RUNTIME_DIR: runtimeDir}, compose}))
		expect(control).toBeNull()
		expect(compose).not.toHaveBeenCalled()
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
