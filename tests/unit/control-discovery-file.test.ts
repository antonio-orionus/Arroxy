// @vitest-environment node

import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {afterEach, describe, expect, it} from 'vite-plus/test'
import {CONTROL_DISCOVERY_FILE_NAME, type ControlDiscovery} from 'arroxy-control'
import {deleteDiscoveryFile, readDiscoveryFile, removeStaleSocketDir, writeDiscoveryFile} from '@main/control/socket/discoveryFile.js'

// control.json in userData, and the start-up cleanup of the socket folder an
// earlier launch left behind.

const isWindows = process.platform === 'win32'
const roots: string[] = []

afterEach(async () => {
	for (const root of roots.splice(0)) await fs.rm(root, {recursive: true, force: true})
})

// Under /tmp, not os.tmpdir(): the socket folders below mimic real ones.
async function tempRoot(base = isWindows ? os.tmpdir() : '/tmp'): Promise<string> {
	const root = await fs.mkdtemp(path.join(base, 'adf-'))
	roots.push(root)
	return root
}

const DISCOVERY: ControlDiscovery = {socketPath: '/tmp/arroxy-Ab12Cd/control.sock', token: 'tok', version: '1.2.3', startedAt: 1_700_000_000_000}

describe('discovery file', () => {
	it('writes control.json that reads back, with nothing else left in the folder', async () => {
		const userData = await tempRoot(os.tmpdir())
		await writeDiscoveryFile(userData, DISCOVERY)
		expect(await readDiscoveryFile(userData)).toEqual(DISCOVERY)
		expect(await fs.readdir(userData)).toEqual([CONTROL_DISCOVERY_FILE_NAME])
		expect(JSON.parse(await fs.readFile(path.join(userData, CONTROL_DISCOVERY_FILE_NAME), 'utf8'))).not.toHaveProperty('pid')
	})

	it.skipIf(isWindows)('writes it owner-only, replacing an older one', async () => {
		const userData = await tempRoot(os.tmpdir())
		const file = path.join(userData, CONTROL_DISCOVERY_FILE_NAME)
		await fs.writeFile(file, 'old', {mode: 0o644})
		await writeDiscoveryFile(userData, DISCOVERY)
		expect((await fs.stat(file)).mode & 0o777).toBe(0o600)
		expect(await readDiscoveryFile(userData)).toEqual(DISCOVERY)
	})

	it('reads nothing from a missing, broken or foreign-shaped file', async () => {
		const userData = await tempRoot(os.tmpdir())
		expect(await readDiscoveryFile(userData)).toBeNull()
		await fs.writeFile(path.join(userData, CONTROL_DISCOVERY_FILE_NAME), '{not json')
		expect(await readDiscoveryFile(userData)).toBeNull()
		await fs.writeFile(path.join(userData, CONTROL_DISCOVERY_FILE_NAME), JSON.stringify({socketPath: 3}))
		expect(await readDiscoveryFile(userData)).toBeNull()
	})

	it('deletes the file only while it still names this launch socket', async () => {
		const userData = await tempRoot(os.tmpdir())
		await writeDiscoveryFile(userData, DISCOVERY)
		await deleteDiscoveryFile(userData, '/tmp/arroxy-Zz99Yy/control.sock')
		expect(await readDiscoveryFile(userData)).toEqual(DISCOVERY)
		await deleteDiscoveryFile(userData, DISCOVERY.socketPath)
		expect(await readDiscoveryFile(userData)).toBeNull()
		await expect(deleteDiscoveryFile(userData, DISCOVERY.socketPath)).resolves.toBeUndefined()
	})
})

describe.skipIf(isWindows)('removeStaleSocketDir', () => {
	const uid = process.getuid?.() ?? 0

	async function staleDir(base: string): Promise<string> {
		const dir = await fs.mkdtemp(path.join(base, 'arroxy-'))
		await fs.writeFile(path.join(dir, 'control.sock'), '')
		return dir
	}

	it('removes an earlier launch folder under the base', async () => {
		const base = await tempRoot()
		const dir = await staleDir(base)
		expect(await removeStaleSocketDir(path.join(dir, 'control.sock'), base, uid)).toEqual({status: 'removed'})
		await expect(fs.lstat(dir)).rejects.toThrow()
	})

	it('reports a folder that is already gone', async () => {
		const base = await tempRoot()
		expect(await removeStaleSocketDir(path.join(base, 'arroxy-Ab12Cd', 'control.sock'), base, uid)).toEqual({status: 'gone'})
	})

	it('refuses a folder outside the base or with another name', async () => {
		const base = await tempRoot()
		const other = await tempRoot()
		const elsewhere = await staleDir(other)
		expect((await removeStaleSocketDir(path.join(elsewhere, 'control.sock'), base, uid)).status).toBe('refused')
		const named = path.join(base, 'mine-Ab12Cd')
		await fs.mkdir(named)
		expect((await removeStaleSocketDir(path.join(named, 'control.sock'), base, uid)).status).toBe('refused')
		await expect(fs.lstat(elsewhere)).resolves.toBeDefined()
		await expect(fs.lstat(named)).resolves.toBeDefined()
	})

	it('never follows a symlink named like a launch folder', async () => {
		const base = await tempRoot()
		const target = await tempRoot()
		await fs.writeFile(path.join(target, 'keep'), 'x')
		const link = path.join(base, 'arroxy-Ab12Cd')
		await fs.symlink(target, link)
		expect((await removeStaleSocketDir(path.join(link, 'control.sock'), base, uid)).status).toBe('refused')
		expect(await fs.readFile(path.join(target, 'keep'), 'utf8')).toBe('x')
	})

	it('refuses a folder owned by another user', async () => {
		const base = await tempRoot()
		const dir = await staleDir(base)
		expect((await removeStaleSocketDir(path.join(dir, 'control.sock'), base, uid + 1)).status).toBe('refused')
		await expect(fs.lstat(dir)).resolves.toBeDefined()
	})
})
