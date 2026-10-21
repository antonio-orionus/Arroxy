import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {afterEach, describe, expect, it} from 'vite-plus/test'
import {FileSecretStore, LockBusyError, type LockFiles, nodeLockFiles, SecretStoreError} from '../src/store'

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

function errnoError(code: string): Error {
	return Object.assign(new Error(`${code}: lock file is busy`), {code})
}

// What Windows answers while the lock file of a finishing holder is still
// being deleted: EPERM, EACCES or EBUSY instead of EEXIST.
function failingCreate(code: string, times: number): LockFiles & {readonly attempts: () => number} {
	let attempts = 0
	return {
		...nodeLockFiles,
		create: async (file, token) => {
			attempts++
			if (attempts <= times) throw errnoError(code)
			return nodeLockFiles.create(file, token)
		},
		attempts: () => attempts
	}
}

describe('FileSecretStore lock on a busy lock file', () => {
	it('retries EPERM from create and runs the work only once it holds the lock, never alongside another holder', async () => {
		const dir = await configDir()
		const lock = path.join(dir, 'clients.json.lock')
		const flaky = failingCreate('EPERM', 2)
		let inside = 0
		let most = 0
		const lockedWork = async (): Promise<boolean> => {
			inside++
			most = Math.max(most, inside)
			const locked = await fs.stat(lock).then(
				() => true,
				() => false
			)
			await new Promise(resolve => setTimeout(resolve, 20))
			inside--
			return locked
		}

		const ran = await Promise.all([new FileSecretStore(dir, process.platform, {lockFiles: flaky}).transaction(lockedWork), new FileSecretStore(dir, process.platform).transaction(lockedWork)])

		expect(ran).toEqual([true, true])
		expect(most).toBe(1)
		expect(flaky.attempts()).toBeGreaterThanOrEqual(3)
	})

	for (const code of ['EPERM', 'EACCES', 'EBUSY']) {
		it(`gives up with LockBusyError when create keeps failing with ${code} until the deadline`, async () => {
			const dir = await configDir()
			let ran = false

			const pending = new FileSecretStore(dir, process.platform, {lockWaitMs: 50, lockFiles: failingCreate(code, Number.POSITIVE_INFINITY)}).transaction(async () => {
				ran = true
			})

			await expect(pending).rejects.toThrow(LockBusyError)
			expect(ran).toBe(false)
		})
	}

	it('surfaces any other create error as a store error naming the folder, without running the work', async () => {
		const dir = await configDir()
		let ran = false

		const pending = new FileSecretStore(dir, process.platform, {lockFiles: failingCreate('ENOSPC', Number.POSITIVE_INFINITY)}).transaction(async () => {
			ran = true
		})

		await expect(pending).rejects.toThrow(SecretStoreError)
		await expect(pending).rejects.toThrow(dir)
		expect(ran).toBe(false)
	})

	it.skipIf(isWindows)('still runs the work unlocked in a folder it cannot write to', async () => {
		const dir = await configDir()
		await fs.mkdir(dir, {recursive: true})
		await fs.chmod(dir, 0o500)

		const result = await new FileSecretStore(dir, process.platform).transaction(async () => 'ran')

		expect(result).toBe('ran')
		await fs.chmod(dir, 0o700)
		expect(await fs.readdir(dir)).toEqual([])
	})
})

// Windows ignores folder ACLs in fs.access and answers EPERM both for a
// read-only folder and for a lock file mid-delete; these run the win32 paths
// on any OS through the injected file operations.
describe('FileSecretStore lock on Windows', () => {
	it('runs the work unlocked, at once, in a folder the write probe cannot write to', async () => {
		const dir = await configDir()
		let creates = 0
		const readOnly: LockFiles = {
			...nodeLockFiles,
			probeWritable: async () => false,
			create: async () => {
				creates++
				throw errnoError('EPERM')
			}
		}

		const started = Date.now()
		const result = await new FileSecretStore(dir, 'win32', {lockFiles: readOnly}).transaction(async () => 'ran')

		expect(result).toBe('ran')
		expect(creates).toBe(0)
		expect(Date.now() - started).toBeLessThan(1000)
	})

	it('waits out a lock file mid-delete in a writable folder, then runs the work locked', async () => {
		const dir = await configDir()
		const lock = path.join(dir, 'clients.json.lock')
		const flaky = failingCreate('EPERM', 2)

		const locked = await new FileSecretStore(dir, 'win32', {lockFiles: flaky}).transaction(() =>
			fs.stat(lock).then(
				() => true,
				() => false
			)
		)

		expect(locked).toBe(true)
		expect(flaky.attempts()).toBe(3)
	})

	it('treats EPERM on the takeover guard as a busy guard, not an error', async () => {
		const dir = await configDir()
		await fs.mkdir(dir, {recursive: true})
		const lock = path.join(dir, 'clients.json.lock')
		await fs.writeFile(lock, 'crashed-process')
		const old = new Date(Date.now() - 60_000)
		await fs.utimes(lock, old, old)
		const guardBusy: LockFiles = {...nodeLockFiles, create: async (file, token) => (file.endsWith('.takeover') ? Promise.reject(errnoError('EPERM')) : nodeLockFiles.create(file, token))}

		const pending = new FileSecretStore(dir, 'win32', {lockWaitMs: 50, lockFiles: guardBusy}).transaction(async () => 'ran')

		await expect(pending).rejects.toThrow(LockBusyError)
	})
})
