import {spawnSync} from 'node:child_process'
import fs from 'node:fs/promises'
import http from 'node:http'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'
import {afterEach, describe, expect, it} from 'vitest'

import {assertLauncherPortAvailable, computeDefaultRendererPort, createDoctorReport, createToolVersionMismatchMessage, resolveDevEnv, resolveDoctorDevEnv, resolveRuntimeDevEnv} from '../../scripts/dev-env.js'

const servers: net.Server[] = []
const tempDirs: string[] = []

afterEach(async () => {
	await Promise.all([
		...tempDirs.splice(0).map(dir => fs.rm(dir, {recursive: true, force: true})),
		...servers.splice(0).map(
			server =>
				new Promise<void>(resolve => {
					server.close(() => resolve())
				})
		)
	])
})

async function tempDir(): Promise<string> {
	const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'arroxy-dev-env-'))
	tempDirs.push(dir)
	return dir
}

async function listenOn(port: number): Promise<net.Server> {
	const server = net.createServer(socket => socket.destroy())
	await new Promise<void>((resolve, reject) => {
		server.once('error', reject)
		server.listen(port, '127.0.0.1', () => resolve())
	})
	servers.push(server)
	return server
}

async function occupyComputedPort(): Promise<{repoRoot: string; port: number}> {
	for (let index = 0; index < 50; index += 1) {
		const repoRoot = `/tmp/arroxy-port-test-${process.pid}-${index}`
		const port = computeDefaultRendererPort(repoRoot)
		try {
			await listenOn(port)
			return {repoRoot, port}
		} catch {
			// Try another deterministic repo root if the host already uses this port.
		}
	}

	throw new Error('could not reserve a computed renderer port for the test')
}

async function serveHttpOn(port: number): Promise<http.Server> {
	const server = http.createServer((_request, response) => {
		response.writeHead(200, {'content-type': 'text/plain'})
		response.end('ok')
	})
	await new Promise<void>((resolve, reject) => {
		server.once('error', reject)
		server.listen(port, '127.0.0.1', () => resolve())
	})
	servers.push(server)
	return server
}

async function occupyComputedPortAndServeFallback(): Promise<{fallbackPort: number; repoRoot: string}> {
	for (let index = 0; index < 50; index += 1) {
		const repoRoot = `/tmp/arroxy-doctor-port-test-${process.pid}-${index}`
		const port = computeDefaultRendererPort(repoRoot)
		try {
			await listenOn(port)
			await serveHttpOn(port + 1)
			return {repoRoot, fallbackPort: port + 1}
		} catch {
			await Promise.all(
				servers.splice(0).map(
					server =>
						new Promise<void>(resolve => {
							server.close(() => resolve())
						})
				)
			)
		}
	}

	throw new Error('could not reserve a computed renderer port plus fallback server for the test')
}

describe('dev-env pure helpers', () => {
	it('computes a stable renderer port for the same repo root', () => {
		const root = '/tmp/arroxy-alpha'
		expect(computeDefaultRendererPort(root)).toBe(computeDefaultRendererPort(root))
	})

	it('computes renderer ports in the high development range', () => {
		const port = computeDefaultRendererPort('/tmp/arroxy-alpha')
		expect(port).toBeGreaterThanOrEqual(20_000)
		expect(port).toBeLessThanOrEqual(39_999)
	})

	it('usually separates different repo roots', () => {
		expect(computeDefaultRendererPort('/tmp/arroxy-alpha')).not.toBe(computeDefaultRendererPort('/tmp/arroxy-beta'))
	})

	it('uses ARROXY_RENDERER_PORT when provided', () => {
		const env = resolveDevEnv({repoRoot: '/tmp/arroxy', env: {ARROXY_RENDERER_PORT: '23456'}})
		expect(env.rendererPort).toBe(23_456)
		expect(env.rendererPortSource).toBe('override')
	})

	it('rejects invalid ARROXY_RENDERER_PORT', () => {
		expect(() => resolveDevEnv({repoRoot: '/tmp/arroxy', env: {ARROXY_RENDERER_PORT: 'abc'}})).toThrow(/ARROXY_RENDERER_PORT/)
		expect(() => resolveDevEnv({repoRoot: '/tmp/arroxy', env: {ARROXY_RENDERER_PORT: '70000'}})).toThrow(/ARROXY_RENDERER_PORT/)
	})

	it('uses ELECTRON_USER_DATA when provided', () => {
		const env = resolveDevEnv({repoRoot: '/tmp/arroxy', env: {ELECTRON_USER_DATA: '/tmp/custom-user-data'}})
		expect(env.electronUserData).toBe('/tmp/custom-user-data')
		expect(env.electronUserDataSource).toBe('override')
	})

	it('defaults Electron user data inside the repo root', () => {
		const env = resolveDevEnv({repoRoot: '/tmp/arroxy', env: {}})
		expect(env.electronUserData).toBe('/tmp/arroxy/.electron-user-data/dev')
		expect(env.electronUserDataSource).toBe('computed')
	})

	it('uses ARROXY_DEV_TMP when provided', () => {
		const env = resolveDevEnv({repoRoot: '/tmp/arroxy', env: {ARROXY_DEV_TMP: '/tmp/custom-tmp'}})
		expect(env.tmpDir).toBe('/tmp/custom-tmp')
		expect(env.tmpDirSource).toBe('override')
	})

	it('treats blank path overrides as absent', () => {
		const env = resolveDevEnv({repoRoot: '/tmp/arroxy', env: {ELECTRON_USER_DATA: '   ', ARROXY_DEV_TMP: ''}})

		expect(env.electronUserData).toBe('/tmp/arroxy/.electron-user-data/dev')
		expect(env.electronUserDataSource).toBe('computed')
		expect(env.tmpDir).toBe('/tmp/arroxy/.tmp/dev')
		expect(env.tmpDirSource).toBe('computed')
	})

	it('defaults temp dir inside the repo root', () => {
		const env = resolveDevEnv({repoRoot: '/tmp/arroxy', env: {}})
		expect(env.tmpDir).toBe('/tmp/arroxy/.tmp/dev')
		expect(env.tmpDirSource).toBe('computed')
	})

	it('creates a serializable doctor report shape', () => {
		const env = resolveDevEnv({repoRoot: '/tmp/arroxy', env: {ARROXY_RENDERER_PORT: '23456'}})
		const report = createDoctorReport({repoRoot: '/tmp/arroxy', env, tools: {node: {name: 'node', expected: '24.16.0', actual: '24.16.0', ok: true}, bun: {name: 'bun', expected: '1.2.23', actual: '1.2.23', ok: true}}, checks: [{id: 'lockfile', label: 'bun.lock', ok: true, severity: 'required'}]})

		expect(report.ok).toBe(true)
		expect(JSON.parse(JSON.stringify(report))).toEqual(report)
	})

	it('recommends mise install when a mismatched tool has mise config and mise is available', () => {
		expect(createToolVersionMismatchMessage({name: 'bun', expected: '1.2.23', actual: '1.2.22', hasMiseConfig: true, miseAvailable: true})).toBe('expected 1.2.23, got 1.2.22. Recommended: run `mise install` from the repo root, ensure your shell activates mise, then rerun `bun run doctor`.')
	})

	it('recommends installing mise or manually activating the tool when mise config exists but mise is missing', () => {
		expect(createToolVersionMismatchMessage({name: 'bun', expected: '1.2.23', actual: null, hasMiseConfig: true, miseAvailable: false})).toBe('expected 1.2.23, but bun was not found. Recommended: install mise and run `mise install`, or manually activate bun 1.2.23, then rerun `bun run doctor`.')
	})

	it('gives generic activation guidance when no tool-manager config exists', () => {
		expect(createToolVersionMismatchMessage({name: 'node', expected: '24.16.0', actual: '24.15.0', hasMiseConfig: false, miseAvailable: false})).toBe('expected 24.16.0, got 24.15.0. Activate node 24.16.0, then rerun `bun run doctor`.')
	})

	it('uses the next available renderer port when the computed port is occupied', async () => {
		const {repoRoot, port} = await occupyComputedPort()

		const env = await resolveRuntimeDevEnv(repoRoot, {})

		expect(env.rendererPort).toBeGreaterThan(port)
		expect(env.rendererPortSource).toBe('computed')
	})

	it('doctor reports a running fallback renderer port instead of the next unused port', async () => {
		const {repoRoot, fallbackPort} = await occupyComputedPortAndServeFallback()

		const env = await resolveDoctorDevEnv(repoRoot, {})

		expect(env.rendererPort).toBe(fallbackPort)
		expect(env.rendererPortSource).toBe('computed')
	})

	it('allows browser tests to reuse an occupied override port', async () => {
		const port = 41_234
		await listenOn(port)
		const env = resolveDevEnv({repoRoot: '/tmp/arroxy', env: {ARROXY_RENDERER_PORT: String(port)}})

		await expect(assertLauncherPortAvailable(env, 'browser-test')).resolves.toBeUndefined()
		await expect(assertLauncherPortAvailable(env, 'mock')).rejects.toThrow()
	})

	it('doctor does not accept an Electron payload from a parent checkout', async () => {
		const parent = await tempDir()
		const parentElectron = path.join(parent, 'node_modules', 'electron')
		await fs.mkdir(path.join(parentElectron, 'dist'), {recursive: true})
		await fs.writeFile(path.join(parentElectron, 'package.json'), '{"name":"electron"}\n')
		await fs.writeFile(path.join(parentElectron, 'path.txt'), 'electron\n')
		await fs.writeFile(path.join(parentElectron, 'dist', 'electron'), '')
		await fs.chmod(path.join(parentElectron, 'dist', 'electron'), 0o755).catch(() => undefined)

		const child = path.join(parent, '.worktrees', 'child')
		await fs.mkdir(path.join(child, 'node_modules'), {recursive: true})
		await fs.writeFile(path.join(child, '.node-version'), '24.16.0\n')
		await fs.writeFile(path.join(child, 'bun.lock'), '')
		await fs.writeFile(path.join(child, 'package.json'), '{"packageManager":"bun@1.2.23"}\n')

		const result = spawnSync(process.platform === 'win32' ? 'bun.exe' : 'bun', [path.join(process.cwd(), 'scripts/dev-env.ts'), 'doctor', '--json'], {cwd: child, encoding: 'utf8'})
		const report = JSON.parse(result.stdout) as {checks: Array<{id: string; message?: string; ok: boolean}>}
		const electronPayload = report.checks.find(check => check.id === 'electron-payload')

		expect(result.status).toBe(1)
		expect(electronPayload).toMatchObject({ok: false})
		expect(electronPayload?.message).toContain(path.join(child, 'node_modules', 'electron'))
	})

	it('cleans forwarded signal handlers when spawning a command fails', async () => {
		const mod = (await import('../../scripts/dev-env.js')) as {spawnChecked?: (command: string, args: string[], options: {cwd: string; env: NodeJS.ProcessEnv}) => Promise<void>}
		const beforeSigint = process.listenerCount('SIGINT')
		const beforeSigterm = process.listenerCount('SIGTERM')
		const missingCommand = path.join(await tempDir(), process.platform === 'win32' ? 'missing-command.exe' : 'missing-command')

		expect(typeof mod.spawnChecked).toBe('function')
		await expect(mod.spawnChecked?.(missingCommand, [], {cwd: process.cwd(), env: process.env})).rejects.toThrow()

		expect(process.listenerCount('SIGINT')).toBe(beforeSigint)
		expect(process.listenerCount('SIGTERM')).toBe(beforeSigterm)
	})
})
