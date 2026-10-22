import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {afterEach, describe, expect, it, vi} from 'vite-plus/test'
import {claimFile, FileSecretStore, LockBusyError, type LockFiles, nodeLockFiles, SecretStoreError} from '../src/store'

const isWindows = process.platform === 'win32'
const roots: string[] = []

afterEach(async () => {
	vi.restoreAllMocks()
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
		const late: LockFiles = {...nodeLockFiles, create: async (file, token) => (file.includes('.takeover-') ? (await later(), nodeLockFiles.create(file, token)) : nodeLockFiles.create(file, token)), remove: async file => (file === lock ? (await later(), nodeLockFiles.remove(file)) : nodeLockFiles.remove(file))}

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
// being deleted: EPERM, EACCES or EBUSY instead of EEXIST. Only the lock file
// fails; the Windows write probe goes through.
function failingCreate(code: string, times: number): LockFiles & {readonly attempts: () => number} {
	let attempts = 0
	return {
		...nodeLockFiles,
		create: async (file, token) => {
			if (!file.endsWith('clients.json.lock')) return nodeLockFiles.create(file, token)
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

	it('keeps the outcome of the work, and logs, when releasing the lock fails', async () => {
		const dir = await configDir()
		const lock = path.join(dir, 'clients.json.lock')
		const logs: string[] = []
		const noClaims: LockFiles = {create: async (file, token) => (file.includes('.takeover-') ? Promise.reject(errnoError('ENOSPC')) : nodeLockFiles.create(file, token)), read: nodeLockFiles.read, remove: nodeLockFiles.remove}
		const store = new FileSecretStore(dir, process.platform, {log: line => logs.push(line), lockFiles: noClaims})

		expect(await store.transaction(async () => 'stored')).toBe('stored')
		expect(logs).toEqual([expect.stringContaining(lock)])
		await fs.rm(lock)
		await expect(
			store.transaction(async () => {
				throw new Error('work failed')
			})
		).rejects.toThrow('work failed')
		expect(logs).toHaveLength(2)
	})

	it('waits out a release claim Windows answers EPERM for, then removes the lock', async () => {
		const dir = await configDir()
		let claimAttempts = 0
		const busyClaim: LockFiles = {
			create: async (file, token) => {
				if (file.includes('.takeover-') && ++claimAttempts === 1) throw errnoError('EPERM')
				return nodeLockFiles.create(file, token)
			},
			read: nodeLockFiles.read,
			remove: nodeLockFiles.remove
		}

		expect(await new FileSecretStore(dir, process.platform, {lockFiles: busyClaim}).transaction(async () => 'ran')).toBe('ran')
		expect(claimAttempts).toBe(2)
		expect(await fs.readdir(dir)).toEqual([])
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
		const created: string[] = []
		const readOnly: LockFiles = {
			...nodeLockFiles,
			create: async file => {
				created.push(path.basename(file))
				throw errnoError('EPERM')
			}
		}

		const started = Date.now()
		const result = await new FileSecretStore(dir, 'win32', {lockFiles: readOnly}).transaction(async () => 'ran')

		expect(result).toBe('ran')
		expect(created).toEqual([expect.stringMatching(/^\.write-probe-/)])
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

	it('treats EPERM on the takeover claim as a busy claim, not an error', async () => {
		const dir = await configDir()
		await fs.mkdir(dir, {recursive: true})
		const lock = path.join(dir, 'clients.json.lock')
		await fs.writeFile(lock, 'crashed-process')
		const old = new Date(Date.now() - 60_000)
		await fs.utimes(lock, old, old)
		const claimBusy: LockFiles = {...nodeLockFiles, create: async (file, token) => (file.includes('.takeover-') ? Promise.reject(errnoError('EPERM')) : nodeLockFiles.create(file, token))}

		const pending = new FileSecretStore(dir, 'win32', {lockWaitMs: 50, lockFiles: claimBusy}).transaction(async () => 'ran')

		await expect(pending).rejects.toThrow(LockBusyError)
	})
})

// What simulated processes did to the lock files, in order. Each interleaving
// below is driven by waiting until the log shows a step, never by timers.
interface Step {
	readonly who: string
	readonly what: 'create' | 'remove' | 'paused' | 'resumed' | 'inside' | 'exit' | 'done'
	readonly file?: string
	readonly token?: string
	readonly created?: boolean
}

interface Steps {
	readonly log: readonly Step[]
	push(step: Step): void
	until(shows: (log: readonly Step[]) => boolean): Promise<void>
}

function steps(): Steps {
	const log: Step[] = []
	const waiting: {readonly shows: (log: readonly Step[]) => boolean; readonly resolve: () => void}[] = []
	return {
		log,
		push(step) {
			log.push(step)
			for (const waiter of waiting.splice(0)) {
				if (waiter.shows(log)) waiter.resolve()
				else waiting.push(waiter)
			}
		},
		until(shows) {
			if (shows(log)) return Promise.resolve()
			return new Promise(resolve => waiting.push({shows, resolve}))
		}
	}
}

const did = (log: readonly Step[], who: string, what: Step['what']): boolean => log.some(step => step.who === who && step.what === what)
const lockCreates = (log: readonly Step[], who: string, lock: string): Step[] => log.filter(step => step.who === who && step.what === 'create' && step.file === lock)
const createdToken = (log: readonly Step[], who: string, matches: (file: string) => boolean): string => {
	const token = log.find(step => step.who === who && step.what === 'create' && step.created === true && matches(step.file ?? ''))?.token
	if (token === undefined) throw new Error(`${who} created no such file`)
	return token
}

function mostInside(log: readonly Step[]): number {
	let inside = 0
	let most = 0
	for (const step of log) {
		if (step.what === 'inside') most = Math.max(most, ++inside)
		if (step.what === 'exit') inside--
	}
	return most
}

// One process's file operations: every create and remove is logged, and a
// file that `isStale` names reads as left long ago, so no test waits out
// LOCK_STALE_MS. A hook that returns a pending promise holds the process
// just before that operation.
function processFiles(who: string, s: Steps, isStale: (file: string, token: string) => boolean, hooks: {readonly beforeCreate?: (file: string) => Promise<void>; readonly beforeRead?: (file: string) => Promise<void>; readonly beforeRemove?: (file: string) => Promise<void>} = {}): LockFiles {
	return {
		create: async (file, token) => {
			await hooks.beforeCreate?.(file)
			const created = await nodeLockFiles.create(file, token)
			s.push({who, what: 'create', file, token, created})
			return created
		},
		read: async file => {
			await hooks.beforeRead?.(file)
			const held = await nodeLockFiles.read(file)
			return held !== null && isStale(file, held.token) ? {...held, ageMs: 60_000} : held
		},
		remove: async file => {
			await hooks.beforeRemove?.(file)
			s.push({who, what: 'remove', file})
			await nodeLockFiles.remove(file)
		}
	}
}

// A transaction whose work logs entering and leaving around `inside`.
function run(who: string, s: Steps, store: FileSecretStore, inside: () => Promise<void>): Promise<void> {
	return store
		.transaction(async () => {
			s.push({who, what: 'inside'})
			await inside()
			s.push({who, what: 'exit'})
		})
		.finally(() => s.push({who, what: 'done'}))
}

// Work that stays inside until `other` is inside too, has finished, or has
// tried the lock and failed since this one entered.
function untilOtherHadAGo(s: Steps, other: string, lock: string): () => Promise<void> {
	return () => {
		const entered = s.log.length
		return s.until(log => {
			const otherInside = log.filter(step => step.who === other && step.what === 'inside').length > log.filter(step => step.who === other && step.what === 'exit').length
			return otherInside || did(log, other, 'done') || lockCreates(log.slice(entered), other, lock).some(step => step.created === false)
		})
	}
}

describe('FileSecretStore lock with a paused or crashed process', () => {
	it('never lets a holder paused past LOCK_STALE_MS remove, on release, the lock its successor took over', async () => {
		const dir = await configDir()
		const lock = path.join(dir, 'clients.json.lock')
		const s = steps()
		let pausedToken: string | undefined
		const isStale = (file: string, token: string): boolean => file === lock && token === pausedToken
		// A has read its own token back on release and is paused before
		// removing the lock, until B, having found A's lock stale, tried the
		// lock again.
		const aFiles = processFiles('A', s, isStale, {
			beforeRemove: async file => {
				if (file !== lock || did(s.log, 'A', 'paused')) return
				s.push({who: 'A', what: 'paused'})
				await s.until(log => lockCreates(log, 'B', lock).length >= 2)
			}
		})
		const a = run('A', s, new FileSecretStore(dir, process.platform, {lockFiles: aFiles}), async () => undefined)
		await s.until(log => did(log, 'A', 'paused'))
		pausedToken = createdToken(s.log, 'A', file => file === lock)

		let lockOnceAReleased: string | null | undefined
		let c: Promise<void> | undefined
		const b = run('B', s, new FileSecretStore(dir, process.platform, {lockFiles: processFiles('B', s, isStale)}), async () => {
			await s.until(log => did(log, 'A', 'done'))
			lockOnceAReleased = await fs.readFile(lock, 'utf8').catch(() => null)
			// A third process arrives while B is inside; B leaves once it tried.
			c = run('C', s, new FileSecretStore(dir, process.platform, {lockFiles: processFiles('C', s, isStale)}), async () => undefined)
			await s.until(log => lockCreates(log, 'C', lock).length >= 1)
		})
		await Promise.all([a, b])
		await c

		expect(lockOnceAReleased).toBe(createdToken(s.log, 'B', file => file === lock))
		expect(mostInside(s.log)).toBe(1)
	})

	it('lets only one of two processes finish a takeover a crashed process left midway', async () => {
		const dir = await configDir()
		await fs.mkdir(dir, {recursive: true})
		const lock = path.join(dir, 'clients.json.lock')
		await fs.writeFile(lock, 'crashed-holder')
		const s = steps()
		let crashedTaker: string | undefined
		const isStale = (_file: string, token: string): boolean => token === 'crashed-holder' || token === crashedTaker
		// On Windows each process also creates and removes a write probe first.
		const isTakeover = (file: string): boolean => file.includes('.takeover')
		const t0Claimed = (log: readonly Step[]): boolean => log.some(step => step.who === 'T0' && step.what === 'create' && step.created === true && isTakeover(step.file ?? ''))
		// T0 dies right after claiming the takeover of the stale lock: it never
		// touches a file again.
		const t0Files = processFiles('T0', s, isStale, {beforeRead: async () => (t0Claimed(s.log) ? new Promise<never>(() => undefined) : undefined)})
		void run('T0', s, new FileSecretStore(dir, process.platform, {lockFiles: t0Files}), async () => undefined)
		await s.until(t0Claimed)
		crashedTaker = createdToken(s.log, 'T0', isTakeover)

		// T2 found what T0 left and is paused before removing it, until T1 has
		// had its go at the lock.
		const t2Files = processFiles('T2', s, isStale, {
			beforeRemove: async file => {
				if (!isTakeover(file) || did(s.log, 'T2', 'paused')) return
				s.push({who: 'T2', what: 'paused'})
				await s.until(log => did(log, 'T1', 'paused') || lockCreates(log, 'T1', lock).length >= 3)
				s.push({who: 'T2', what: 'resumed'})
			}
		})
		const t2 = run('T2', s, new FileSecretStore(dir, process.platform, {lockFiles: t2Files}), untilOtherHadAGo(s, 'T1', lock))
		await s.until(log => did(log, 'T2', 'paused'))
		// T1 is paused before removing the stale lock, until T2 has had its go.
		const t1Files = processFiles('T1', s, isStale, {
			beforeRemove: async file => {
				if (file !== lock || did(s.log, 'T1', 'paused')) return
				s.push({who: 'T1', what: 'paused'})
				await s.until(log => {
					const resumed = log.findIndex(step => step.who === 'T2' && step.what === 'resumed')
					return did(log, 'T2', 'inside') || (resumed >= 0 && lockCreates(log.slice(resumed), 'T2', lock).filter(step => step.created === false).length >= 2)
				})
			}
		})
		const t1 = run('T1', s, new FileSecretStore(dir, process.platform, {lockFiles: t1Files}), untilOtherHadAGo(s, 'T2', lock))
		await Promise.all([t1, t2])

		expect(mostInside(s.log)).toBe(1)
	})

	it('never lets a holder paused before claiming its release remove the lock its successor took over meanwhile', async () => {
		const dir = await configDir()
		const lock = path.join(dir, 'clients.json.lock')
		const s = steps()
		let pausedToken: string | undefined
		const isStale = (file: string, token: string): boolean => file === lock && token === pausedToken
		// A is paused before it claims its own lock for release, until B has
		// found that lock stale, taken it over and is inside.
		const aFiles = processFiles('A', s, isStale, {
			beforeCreate: async file => {
				if (!file.includes('.takeover-') || did(s.log, 'A', 'paused')) return
				s.push({who: 'A', what: 'paused'})
				await s.until(log => did(log, 'B', 'inside'))
			}
		})
		const a = run('A', s, new FileSecretStore(dir, process.platform, {lockFiles: aFiles}), async () => undefined)
		await s.until(log => did(log, 'A', 'paused'))
		pausedToken = createdToken(s.log, 'A', file => file === lock)

		let lockOnceAReleased: string | null | undefined
		let c: Promise<void> | undefined
		const b = run('B', s, new FileSecretStore(dir, process.platform, {lockFiles: processFiles('B', s, isStale)}), async () => {
			await s.until(log => did(log, 'A', 'done'))
			lockOnceAReleased = await fs.readFile(lock, 'utf8').catch(() => null)
			c = run('C', s, new FileSecretStore(dir, process.platform, {lockFiles: processFiles('C', s, isStale)}), async () => undefined)
			await s.until(log => lockCreates(log, 'C', lock).length >= 1)
		})
		await Promise.all([a, b])
		await c

		expect(lockOnceAReleased).toBe(createdToken(s.log, 'B', file => file === lock))
		expect(mostInside(s.log)).toBe(1)
	})

	it('never takes over a live lock on a read that paired its token with the age of the stale lock it replaced', async () => {
		const dir = await configDir()
		const lock = path.join(dir, 'clients.json.lock')
		const s = steps()
		let lockAsQLeaves: string | null | undefined
		// Q stays inside until P has acted on the torn read: P is inside too, or
		// has tried the lock again after it.
		const q = run('Q', s, new FileSecretStore(dir, process.platform, {lockFiles: processFiles('Q', s, () => false)}), async () => {
			await s.until(log => did(log, 'P', 'inside') || lockCreates(log, 'P', lock).length >= 2)
			lockAsQLeaves = await fs.readFile(lock, 'utf8').catch(() => null)
		})
		await s.until(log => did(log, 'Q', 'inside'))
		const qToken = createdToken(s.log, 'Q', file => file === lock)
		// P's first read of the lock is torn: Q's live token with the age of the
		// stale lock Q took over. Every later read is true.
		let tornReads = 0
		const tornOnce = (file: string, token: string): boolean => file === lock && token === qToken && tornReads++ === 0
		const p = run('P', s, new FileSecretStore(dir, process.platform, {lockFiles: processFiles('P', s, tornOnce)}), async () => undefined)
		await Promise.all([q, p])

		expect(lockAsQLeaves).toBe(qToken)
		expect(mostInside(s.log)).toBe(1)
	})

	// A stale lock and, on it, claims left by takers that died midway, each
	// claim on the one before.
	async function deadChain(dir: string, deadTakers: number): Promise<Set<string>> {
		await fs.mkdir(dir, {recursive: true})
		let file = path.join(dir, 'clients.json.lock')
		let token = 'dead-holder'
		const dead = new Set([token])
		await fs.writeFile(file, token)
		for (let taker = 1; taker <= deadTakers; taker++) {
			file = claimFile(file, token)
			token = `dead-taker-${taker}`
			dead.add(token)
			await fs.writeFile(file, token)
		}
		return dead
	}

	it('takes over a stale lock through the claims of two takers that died midway', async () => {
		const dir = await configDir()
		const dead = await deadChain(dir, 2)
		const s = steps()

		const result = await new FileSecretStore(dir, process.platform, {lockFiles: processFiles('P', s, (_file, token) => dead.has(token))}).transaction(async () => 'ran')

		expect(result).toBe('ran')
		expect(await fs.readdir(dir)).toEqual([])
	})

	it('gives up with LockBusyError, retrying at its pace, on dead claims one level deeper than it breaks', async () => {
		const dir = await configDir()
		const dead = await deadChain(dir, 3)
		const s = steps()
		let ran = false

		const pending = new FileSecretStore(dir, process.platform, {lockWaitMs: 100, lockFiles: processFiles('P', s, (_file, token) => dead.has(token))}).transaction(async () => {
			ran = true
		})

		await expect(pending).rejects.toThrow(LockBusyError)
		expect(ran).toBe(false)
		// Rounds 15 ms apart over a 100 ms wait, not a hot loop.
		expect(lockCreates(s.log, 'P', path.join(dir, 'clients.json.lock')).length).toBeLessThan(20)
	})
})

describe('FileSecretStore write probe on Windows', () => {
	const isProbe = (target: unknown): boolean => String(target).includes('.write-probe-')
	const lockHeld = (lock: string): Promise<boolean> =>
		fs.stat(lock).then(
			() => true,
			() => false
		)

	it('retries removing a write probe Windows still holds open, then runs the work locked, leaving no probe behind', async () => {
		const dir = await configDir()
		const lock = path.join(dir, 'clients.json.lock')
		const rm = fs.rm.bind(fs)
		let probeRemovals = 0
		vi.spyOn(fs, 'rm').mockImplementation(async (target, options) => {
			if (isProbe(target) && ++probeRemovals <= 2) throw errnoError('EBUSY')
			return rm(target, options)
		})

		const locked = await new FileSecretStore(dir, 'win32').transaction(() => lockHeld(lock))

		expect(locked).toBe(true)
		expect(await fs.readdir(dir)).toEqual([])
	})

	it('runs the work unlocked, at once, in a folder where the write probe can be created but never removed', async () => {
		const dir = await configDir()
		const lock = path.join(dir, 'clients.json.lock')
		const rm = fs.rm.bind(fs)
		let probeRemovals = 0
		vi.spyOn(fs, 'rm').mockImplementation(async (target, options) => {
			if (isProbe(target)) {
				probeRemovals++
				throw errnoError('EPERM')
			}
			return rm(target, options)
		})

		const logs: string[] = []

		const started = Date.now()
		const locked = await new FileSecretStore(dir, 'win32', {log: line => logs.push(line)}).transaction(() => lockHeld(lock))

		expect(locked).toBe(false)
		expect(probeRemovals).toBeGreaterThan(1)
		expect(Date.now() - started).toBeLessThan(1000)
		const [probe] = (await fs.readdir(dir)).filter(isProbe)
		expect(logs).toEqual([expect.stringContaining(path.join(dir, probe ?? '.write-probe-'))])
		expect(logs[0]).toContain('unlocked')
	})

	it('runs the real probe in a writable folder: the work runs locked and leaves no probe or claim behind', async () => {
		const dir = await configDir()
		const lock = path.join(dir, 'clients.json.lock')
		let during: string[] = []

		const locked = await new FileSecretStore(dir, 'win32').transaction(async () => {
			during = await fs.readdir(dir)
			return lockHeld(lock)
		})

		expect(locked).toBe(true)
		expect(during).toEqual(['clients.json.lock'])
		expect(await fs.readdir(dir)).toEqual([])
	})

	it.skipIf(isWindows)('runs the real probe in a folder it cannot write to: the work runs unlocked, at once', async () => {
		const dir = await configDir()
		await fs.mkdir(dir, {recursive: true})
		await fs.chmod(dir, 0o500)

		const started = Date.now()
		const result = await new FileSecretStore(dir, 'win32').transaction(async () => 'ran')

		expect(result).toBe('ran')
		expect(Date.now() - started).toBeLessThan(1000)
		await fs.chmod(dir, 0o700)
		expect(await fs.readdir(dir)).toEqual([])
	})
})
