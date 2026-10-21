import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {afterEach, describe, expect, it} from 'vite-plus/test'
import {FileSecretStore, LockBusyError, type LockFiles, nodeLockFiles} from '../src/store'

const isWindows = process.platform === 'win32'
const roots: string[] = []

afterEach(async () => {
	for (const root of roots.splice(0)) {
		// Tests lock folders and files down; open them up again so cleanup works.
		await fs.chmod(root, 0o700).catch(() => undefined)
		await fs.rm(root, {recursive: true, force: true})
	}
})

async function configDir(): Promise<string> {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), 'amcp-store-'))
	roots.push(root)
	return path.join(root, 'nested', 'arroxy-mcp')
}

describe('FileSecretStore', () => {
	it('keeps one entry per userData folder', async () => {
		const dir = await configDir()
		const store = new FileSecretStore(dir, process.platform)

		await store.set('/a', {approvalId: 'a1'})
		await store.set('/b', {clientId: 'c1', clientSecret: 's1'})

		expect(await store.get('/a')).toEqual({approvalId: 'a1'})
		expect(await store.get('/b')).toEqual({clientId: 'c1', clientSecret: 's1'})
		expect(await store.get('/c')).toBeNull()
	})

	it('deletes an entry only while it still equals the one the caller used', async () => {
		const dir = await configDir()
		const store = new FileSecretStore(dir, process.platform)
		await store.set('/a', {clientId: 'c1', clientSecret: 's1'})

		expect(await store.deleteIf('/a', {approvalId: 'a1'})).toBe(false)
		expect(await store.get('/a')).toEqual({clientId: 'c1', clientSecret: 's1'})
		expect(await store.deleteIf('/a', {clientId: 'c1', clientSecret: 's1'})).toBe(true)
		expect(await store.get('/a')).toBeNull()
	})

	it('treats a corrupt or foreign file as empty, says so once, and replaces it on the next write', async () => {
		const dir = await configDir()
		await fs.mkdir(dir, {recursive: true})
		const logs: string[] = []
		const store = new FileSecretStore(dir, process.platform, {log: line => logs.push(line)})

		await fs.writeFile(path.join(dir, 'clients.json'), '{not json')
		expect(await store.get('/a')).toBeNull()
		expect(logs).toHaveLength(1)
		expect(logs[0]).toContain(path.join(dir, 'clients.json'))
		await fs.writeFile(path.join(dir, 'clients.json'), JSON.stringify({'/a': {clientId: 7}}))
		expect(await store.get('/a')).toBeNull()

		await store.set('/b', {approvalId: 'a2'})
		expect(JSON.parse(await fs.readFile(path.join(dir, 'clients.json'), 'utf8'))).toEqual({'/b': {approvalId: 'a2'}})
	})

	it.skipIf(isWindows)('surfaces an unreadable file instead of treating it as empty, and never overwrites it', async () => {
		const dir = await configDir()
		const store = new FileSecretStore(dir, process.platform)
		await store.set('/a', {clientId: 'c1', clientSecret: 's1'})
		const file = path.join(dir, 'clients.json')
		await fs.chmod(file, 0o000)

		await expect(store.get('/a')).rejects.toThrow(file)
		await expect(store.set('/b', {approvalId: 'a2'})).rejects.toThrow(file)

		await fs.chmod(file, 0o600)
		expect(JSON.parse(await fs.readFile(file, 'utf8'))).toEqual({'/a': {clientId: 'c1', clientSecret: 's1'}})
	})

	it('leaves no temp or lock file behind', async () => {
		const dir = await configDir()
		const store = new FileSecretStore(dir, process.platform)
		await store.set('/a', {approvalId: 'a1'})
		expect(await fs.readdir(dir)).toEqual(['clients.json'])
	})

	it.skipIf(isWindows)('closes an existing config folder to other users', async () => {
		const dir = await configDir()
		await fs.mkdir(dir, {recursive: true})
		await fs.chmod(dir, 0o755)
		await new FileSecretStore(dir, process.platform).set('/a', {approvalId: 'a1'})
		expect((await fs.stat(dir)).mode & 0o777).toBe(0o700)
	})

	it('keeps every write when two stores (two processes) write at once', async () => {
		const dir = await configDir()
		const first = new FileSecretStore(dir, process.platform)
		const second = new FileSecretStore(dir, process.platform)

		await Promise.all(Array.from({length: 10}, (_, index) => (index % 2 === 0 ? first : second).set(`/${index}`, {approvalId: `a${index}`})))

		const clients: unknown = JSON.parse(await fs.readFile(path.join(dir, 'clients.json'), 'utf8'))
		expect(Object.keys(clients as Record<string, unknown>).sort()).toEqual(Array.from({length: 10}, (_, index) => `/${index}`).sort())
	})

	it('takes over a lock file left behind by a crashed process', async () => {
		const dir = await configDir()
		await fs.mkdir(dir, {recursive: true})
		const lock = path.join(dir, 'clients.json.lock')
		await fs.writeFile(lock, '')
		const old = new Date(Date.now() - 60_000)
		await fs.utimes(lock, old, old)

		await new FileSecretStore(dir, process.platform).set('/a', {approvalId: 'a1'})

		expect(await fs.readdir(dir)).toEqual(['clients.json'])
	})

	it('never lets a late takeover steal a lock another process has just taken over', async () => {
		const dir = await configDir()
		await fs.mkdir(dir, {recursive: true})
		const lock = path.join(dir, 'clients.json.lock')
		await fs.writeFile(lock, 'crashed-process')
		const old = new Date(Date.now() - 60_000)
		await fs.utimes(lock, old, old)
		let inside = 0
		let most = 0
		const hold = async (): Promise<void> => {
			inside++
			most = Math.max(most, inside)
			await new Promise(resolve => setTimeout(resolve, 60))
			inside--
		}
		// The late process saw the same stale lock, but acts on it (claims the
		// takeover, removes the lock) only after the first has already replaced it
		// with a fresh one.
		const later = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 30))
		const late: LockFiles = {...nodeLockFiles, create: async (file, token) => (file.endsWith('.takeover') ? (await later(), nodeLockFiles.create(file, token)) : nodeLockFiles.create(file, token)), remove: async file => (file === lock ? (await later(), nodeLockFiles.remove(file)) : nodeLockFiles.remove(file))}

		await Promise.all([new FileSecretStore(dir, process.platform).transaction(hold), new FileSecretStore(dir, process.platform, {lockFiles: late}).transaction(hold)])

		expect(most).toBe(1)
		expect(await fs.readdir(dir)).toEqual([])
	})

	it('lets only one of several processes take over a stale lock', async () => {
		for (let round = 0; round < 20; round++) {
			const dir = await configDir()
			await fs.mkdir(dir, {recursive: true})
			const lock = path.join(dir, 'clients.json.lock')
			await fs.writeFile(lock, 'crashed-process')
			const old = new Date(Date.now() - 60_000)
			await fs.utimes(lock, old, old)
			let inside = 0
			let most = 0
			const hold = async (): Promise<void> => {
				inside++
				most = Math.max(most, inside)
				await new Promise(resolve => setTimeout(resolve, 20))
				inside--
			}

			await Promise.all(Array.from({length: 4}, () => new FileSecretStore(dir, process.platform).transaction(hold)))

			expect(most, `round ${round}`).toBe(1)
			expect(await fs.readdir(dir)).toEqual([])
		}
	})

	it('removes the lock on release only while it still holds its own token', async () => {
		const dir = await configDir()
		const store = new FileSecretStore(dir, process.platform)
		const lock = path.join(dir, 'clients.json.lock')

		await store.transaction(async () => {
			// Another process took the lock over while this one held it.
			await fs.writeFile(lock, 'another-process')
		})

		expect(await fs.readFile(lock, 'utf8')).toBe('another-process')
	})

	it('gives up after the lock wait with an error saying another arroxy-mcp holds it', async () => {
		const dir = await configDir()
		await fs.mkdir(dir, {recursive: true})
		await fs.writeFile(path.join(dir, 'clients.json.lock'), 'another-process')

		await expect(new FileSecretStore(dir, process.platform, {lockWaitMs: 50}).set('/a', {approvalId: 'a1'})).rejects.toThrow(LockBusyError)
	})
})
