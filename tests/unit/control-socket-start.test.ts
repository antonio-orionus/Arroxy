// @vitest-environment node

import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {afterEach, describe, expect, it} from 'vite-plus/test'
import {CONTROL_DISCOVERY_FILE_NAME} from 'arroxy-control'
import {readDiscoveryFile, writeDiscoveryFile} from '@main/control/socket/discoveryFile.js'
import {startControlSocket} from '@main/control/socket/startControlSocket.js'
import {fakeService, handshake, memoryRegistry, RawClient, silentLog, type SocketHarness, startHarness, tokenProof} from '../helpers/controlSocketHarness.js'

// Starting and stopping the control socket: the launch folder, the socket,
// control.json, and what an earlier crashed launch left behind.

const isWindows = process.platform === 'win32'
const cleanups: Array<() => Promise<void>> = []

afterEach(async () => {
	for (const cleanup of cleanups.splice(0).reverse()) await cleanup()
})

async function start(): Promise<SocketHarness> {
	const harness = await startHarness({now: () => 1_700_000_000_000})
	cleanups.push(() => harness.cleanup())
	return harness
}

async function tempDir(base = os.tmpdir()): Promise<string> {
	const dir = await fs.mkdtemp(path.join(base, 'acs-'))
	cleanups.push(() => fs.rm(dir, {recursive: true, force: true}))
	return dir
}

const exists = (target: string): Promise<boolean> =>
	fs.lstat(target).then(
		() => true,
		() => false
	)

describe('startControlSocket', () => {
	it('writes control.json naming a socket that answers, with a fresh token', async () => {
		const harness = await start()
		const discovery = await harness.discovery()
		expect(discovery).toEqual({socketPath: harness.socket.socketPath, token: expect.stringMatching(/^[A-Za-z0-9_-]{43}$/), version: '9.9.9', startedAt: 1_700_000_000_000})
		const {auth} = await handshake(discovery.socketPath, tokenProof(discovery.token))
		expect(auth).toMatchObject({ok: false, error: {code: 'approval_pending'}})
	})

	it.runIf(isWindows)('listens on a random named pipe', async () => {
		const harness = await start()
		expect(harness.socket.socketPath).toMatch(/^\\\\\.\\pipe\\arroxy-control-[0-9a-f]{16}$/)
	})

	it.skipIf(isWindows)('listens in a fresh owner-only folder under /tmp, the socket 0600', async () => {
		const harness = await start()
		const {socketPath} = harness.socket
		expect(socketPath).toMatch(/^\/tmp\/arroxy-[A-Za-z0-9]{6}\/control\.sock$/)
		expect((await fs.stat(path.dirname(socketPath))).mode & 0o777).toBe(0o700)
		expect((await fs.lstat(socketPath)).mode & 0o777).toBe(0o600)
		expect((await fs.stat(path.join(harness.userDataDir, CONTROL_DISCOVERY_FILE_NAME))).mode & 0o777).toBe(0o600)
	})

	it('stops: closes connections, removes the folder and control.json', async () => {
		const harness = await start()
		const {socketPath} = harness.socket
		const client = await RawClient.connect(socketPath)
		await harness.socket.stop()
		await client.closed
		expect(await readDiscoveryFile(harness.userDataDir)).toBeNull()
		if (!isWindows) expect(await exists(path.dirname(socketPath))).toBe(false)
		await expect(RawClient.connect(socketPath)).rejects.toThrow()
		await expect(harness.socket.stop()).resolves.toBeUndefined()
	})

	it.skipIf(isWindows)('removes the folder a crashed launch left, then starts afresh', async () => {
		const userDataDir = await tempDir()
		const staleDir = await fs.mkdtemp('/tmp/arroxy-')
		cleanups.push(() => fs.rm(staleDir, {recursive: true, force: true}))
		await fs.writeFile(path.join(staleDir, 'control.sock'), '')
		await writeDiscoveryFile(userDataDir, {socketPath: path.join(staleDir, 'control.sock'), token: 'old', version: '1.0.0', startedAt: 1})
		const socket = await startControlSocket({userDataDir, appVersion: '9.9.9', platform: process.platform, env: {}, service: fakeService(), approvals: await memoryRegistry(), bootId: 'b', log: silentLog()})
		if (socket === null) throw new Error('did not start')
		cleanups.push(() => socket.stop())
		expect(await exists(staleDir)).toBe(false)
		expect((await readDiscoveryFile(userDataDir))?.token).not.toBe('old')
	})

	it.skipIf(isWindows)('leaves a stale socket folder that is not its own', async () => {
		const userDataDir = await tempDir()
		const foreign = await tempDir('/tmp')
		await writeDiscoveryFile(userDataDir, {socketPath: path.join(foreign, 'control.sock'), token: 'old', version: '1.0.0', startedAt: 1})
		const log = silentLog()
		const socket = await startControlSocket({userDataDir, appVersion: '9.9.9', platform: process.platform, env: {}, service: fakeService(), approvals: await memoryRegistry(), bootId: 'b', log})
		cleanups.push(async () => socket?.stop())
		expect(await exists(foreign)).toBe(true)
		expect(log.warn).toHaveBeenCalledWith('an earlier control socket folder was left in place', expect.anything())
	})

	it.skipIf(isWindows)('refuses to start when the socket path would pass 100 bytes', async () => {
		const userDataDir = await tempDir()
		const longBase = await tempDir()
		const runtimeDir = path.join(longBase, 'r'.repeat(Math.max(1, 90 - longBase.length)))
		await fs.mkdir(runtimeDir)
		const log = silentLog()
		const socket = await startControlSocket({userDataDir, appVersion: '9.9.9', platform: 'linux', env: {XDG_RUNTIME_DIR: runtimeDir}, service: fakeService(), approvals: await memoryRegistry(), bootId: 'b', log})
		expect(socket).toBeNull()
		expect(log.error).toHaveBeenCalledWith('the control socket is off: its path is too long', expect.anything())
		expect(await fs.readdir(runtimeDir)).toEqual([])
		expect(await readDiscoveryFile(userDataDir)).toBeNull()
	})

	it('refuses to start where no socket can be reached, writing nothing', async () => {
		const userDataDir = await tempDir()
		const socket = await startControlSocket({userDataDir, appVersion: '9.9.9', platform: 'linux', env: {FLATPAK_ID: 'io.github.antonio_orionus.Arroxy'}, service: fakeService(), approvals: await memoryRegistry(), bootId: 'b', log: silentLog()})
		expect(socket).toBeNull()
		expect(await fs.readdir(userDataDir)).toEqual([])
	})
})
