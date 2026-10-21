import {randomBytes} from 'node:crypto'
import {constants as fsConstants} from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import {z} from 'zod'

// What the bridge remembers per Arroxy userData folder: the client id and
// secret Arroxy issued once, or the approvalId of a request still waiting for
// the user to choose Allow.
const storedClientSchema = z.union([z.object({clientId: z.string().min(1), clientSecret: z.string().min(1)}), z.object({approvalId: z.string().min(1)})])
export type StoredClient = z.infer<typeof storedClientSchema>

const clientsFileSchema = z.record(z.string(), storedClientSchema)
type ClientsFile = z.infer<typeof clientsFileSchema>

const CLIENTS_FILE_NAME = 'clients.json'
// A lock older than this was left by a process that died holding it; a
// handshake holds it for milliseconds, at most HANDSHAKE_TIMEOUT_MS.
const LOCK_STALE_MS = 10_000
const LOCK_WAIT_MS = 5_000
const LOCK_RETRY_MS = 15
const BUSY_LOCK_CODES = new Set(['EPERM', 'EACCES', 'EBUSY'])

// Another arroxy-mcp held the lock for the whole wait.
export class LockBusyError extends Error {
	constructor(lockFile: string, waitMs: number) {
		super(`Another arroxy-mcp held ${lockFile} for over ${waitMs} ms.`)
		this.name = 'LockBusyError'
	}
}

// The file operations the lock is built from; tests wrap them to force a race.
export interface LockFiles {
	// Creates `file` holding `token` (O_EXCL); false when it already exists.
	create(file: string, token: string): Promise<boolean>
	// The token in `file` and its age, or null when there is no such file.
	read(file: string): Promise<{readonly token: string; readonly ageMs: number} | null>
	remove(file: string): Promise<void>
}

export const nodeLockFiles: LockFiles = {
	async create(file, token) {
		try {
			await fs.writeFile(file, token, {flag: 'wx', mode: 0o600})
			return true
		} catch (error) {
			if (errorCode(error) === 'EEXIST') return false
			throw error
		}
	},
	async read(file) {
		try {
			const [token, stat] = await Promise.all([fs.readFile(file, 'utf8'), fs.stat(file)])
			return {token, ageMs: Date.now() - stat.mtimeMs}
		} catch {
			return null
		}
	},
	remove: file => fs.rm(file, {force: true})
}

export interface FileSecretStoreOptions {
	// Where a clients.json that does not parse is reported.
	readonly log?: (line: string) => void
	readonly lockWaitMs?: number
	readonly lockFiles?: LockFiles
}

// Reading or writing clients.json failed for a reason other than "no file yet".
export class SecretStoreError extends Error {
	constructor(
		message: string,
		readonly dir: string
	) {
		super(message)
		this.name = 'SecretStoreError'
	}
}

function errorCode(error: unknown): string | undefined {
	return error instanceof Error && 'code' in error && typeof error.code === 'string' ? error.code : undefined
}

function reasonOf(error: unknown): string {
	return error instanceof Error ? error.message : String(error)
}

function sameClient(a: StoredClient | null, b: StoredClient | null): boolean {
	return JSON.stringify(a) === JSON.stringify(b)
}

// The view of clients.json inside FileSecretStore.transaction.
export interface SecretStoreTransaction {
	// clients.json is read on first use, so a transaction that never needs it
	// (Arroxy turned out not to be running) never fails on it.
	get(userDataDir: string): Promise<StoredClient | null>
	// Applies `change` to the current entry and writes the file; null removes it.
	update(userDataDir: string, change: (current: StoredClient | null) => StoredClient | null): Promise<void>
	// Removes the entry only while it still equals `expected`, the one the caller used.
	deleteIf(userDataDir: string, expected: StoredClient): Promise<boolean>
}

// Resolves after `ms`, or at once when `signal` aborts.
function delay(ms: number, signal?: AbortSignal): Promise<void> {
	return new Promise(resolve => {
		const timer = setTimeout(done, ms)
		function done(): void {
			clearTimeout(timer)
			signal?.removeEventListener('abort', done)
			resolve()
		}
		signal?.addEventListener('abort', done, {once: true})
	})
}

// clients.json in the bridge's config folder. Every change is a
// read-modify-write under a lock file, so the CLI and an MCP server running at
// once never drop each other's entries.
export class FileSecretStore {
	private readonly file: string
	private readonly lockFile: string
	private readonly log: (line: string) => void
	private readonly lockWaitMs: number
	private readonly lockFiles: LockFiles

	constructor(
		private readonly dir: string,
		private readonly platform: NodeJS.Platform,
		options: FileSecretStoreOptions = {}
	) {
		this.file = path.join(dir, CLIENTS_FILE_NAME)
		this.lockFile = `${this.file}.lock`
		this.log = options.log ?? (() => undefined)
		this.lockWaitMs = options.lockWaitMs ?? LOCK_WAIT_MS
		this.lockFiles = options.lockFiles ?? nodeLockFiles
	}

	// A plain read needs no lock: writes replace the file by rename.
	async get(userDataDir: string): Promise<StoredClient | null> {
		return (await this.read())[userDataDir] ?? null
	}

	async set(userDataDir: string, client: StoredClient): Promise<void> {
		await this.transaction(async store => store.update(userDataDir, () => client))
	}

	async deleteIf(userDataDir: string, expected: StoredClient): Promise<boolean> {
		return this.transaction(store => store.deleteIf(userDataDir, expected))
	}

	// Runs `work` holding the lock, against the file as read once at its start.
	// The handshake runs inside one, so two processes never both authenticate
	// with the same approvalId: only one can collect the one-time secret.
	// Aborting `signal` stops the wait for the lock.
	async transaction<T>(work: (store: SecretStoreTransaction) => Promise<T>, signal?: AbortSignal): Promise<T> {
		return this.withLock(async () => {
			let loaded: ClientsFile | null = null
			const clients = async (): Promise<ClientsFile> => (loaded ??= await this.read())
			const update = async (userDataDir: string, change: (current: StoredClient | null) => StoredClient | null): Promise<void> => {
				const all = await clients()
				const current = all[userDataDir] ?? null
				const next = change(current)
				if (sameClient(current, next)) return
				if (next === null) delete all[userDataDir]
				else all[userDataDir] = next
				await this.write(all)
			}
			return work({
				get: async userDataDir => (await clients())[userDataDir] ?? null,
				update,
				deleteIf: async (userDataDir, expected) => {
					const deleted = sameClient((await clients())[userDataDir] ?? null, expected)
					if (deleted) await update(userDataDir, () => null)
					return deleted
				}
			})
		}, signal)
	}

	// Only a missing file, or one that is not ours to parse, reads as empty. Any
	// other read error surfaces, so the next write never wipes entries it could
	// not see.
	private async read(): Promise<ClientsFile> {
		let text: string
		try {
			text = await fs.readFile(this.file, 'utf8')
		} catch (error) {
			if (errorCode(error) === 'ENOENT') return {}
			throw new SecretStoreError(`Could not read ${this.file}: ${reasonOf(error)}`, this.dir)
		}
		let json: unknown
		try {
			json = JSON.parse(text)
		} catch {
			json = undefined
		}
		const parsed = clientsFileSchema.safeParse(json)
		if (parsed.success) return parsed.data
		this.log(`arroxy-mcp: ignoring ${this.file}: it is not a valid clients file; the next approval replaces it.`)
		return {}
	}

	// Temp file then rename, so a crash mid-write never leaves half a secret.
	private async write(clients: ClientsFile): Promise<void> {
		const temp = path.join(this.dir, `.${CLIENTS_FILE_NAME}.${randomBytes(6).toString('hex')}.tmp`)
		try {
			await fs.writeFile(temp, `${JSON.stringify(clients, null, '\t')}\n`, {mode: 0o600})
			// The umask can narrow the mode writeFile asked for, never widen it;
			// chmod makes it exact.
			if (this.platform !== 'win32') await fs.chmod(temp, 0o600)
			await fs.rename(temp, this.file)
		} catch (error) {
			await fs.rm(temp, {force: true})
			throw new SecretStoreError(`Could not write ${this.file}: ${reasonOf(error)}`, this.dir)
		}
	}

	// False when the folder cannot be created or written to.
	private async prepareDir(): Promise<boolean> {
		try {
			await fs.mkdir(this.dir, {recursive: true, mode: 0o700})
			if (this.platform === 'win32') return true
			// An existing folder may be open to others; close it without touching
			// the owner's own bits.
			const {mode} = await fs.stat(this.dir)
			if ((mode & 0o077) !== 0) await fs.chmod(this.dir, mode & 0o700)
			// Rejected here, a folder this user cannot write to is told apart from a
			// busy lock, which also answers EACCES on create.
			await fs.access(this.dir, fsConstants.W_OK | fsConstants.X_OK)
			return true
		} catch {
			return false
		}
	}

	// A lock file created with O_EXCL that holds this holder's random token. A
	// folder that cannot hold a lock file cannot hold a write either: the work
	// then runs unlocked, so a call that needs no write still goes through and
	// one that does reports why.
	private async withLock<T>(work: () => Promise<T>, signal?: AbortSignal): Promise<T> {
		if (!(await this.prepareDir())) return work()
		const token = randomBytes(16).toString('hex')
		const deadline = Date.now() + this.lockWaitMs
		for (;;) {
			signal?.throwIfAborted()
			if (await this.tryCreateLock(token)) break
			const held = await this.lockFiles.read(this.lockFile)
			if (held !== null && held.ageMs > LOCK_STALE_MS && (await this.takeOverStale(held.token, token))) continue
			if (Date.now() > deadline) throw new LockBusyError(this.lockFile, this.lockWaitMs)
			await delay(LOCK_RETRY_MS, signal)
		}
		try {
			return await work()
		} finally {
			// Only while it still holds this holder's token: a lock this holder
			// kept past LOCK_STALE_MS may already belong to someone else.
			const held = await this.lockFiles.read(this.lockFile)
			if (held?.token === token) await this.lockFiles.remove(this.lockFile)
		}
	}

	// True once this holder has the lock; false while someone else holds it. On
	// Windows a lock file another holder is still deleting answers EPERM, EACCES
	// or EBUSY instead of EEXIST: that is a busy lock too, retried until the
	// wait runs out, never a reason to run unlocked. Anything else is a real
	// failure of the folder.
	private async tryCreateLock(token: string): Promise<boolean> {
		try {
			return await this.lockFiles.create(this.lockFile, token)
		} catch (error) {
			if (BUSY_LOCK_CODES.has(errorCode(error) ?? '')) return false
			throw new SecretStoreError(`Could not create ${this.lockFile}: ${reasonOf(error)}`, this.dir)
		}
	}

	// Removes a lock left by a process that died holding it. Several processes
	// can see the same stale lock; removing it unguarded, a late one would
	// remove the fresh lock another has just created in its place. So only the
	// holder of a second lock, `.takeover`, may remove it, and only after reading
	// it again and finding the same stale token. True when the stale lock is gone.
	private async takeOverStale(staleToken: string, token: string): Promise<boolean> {
		const guard = `${this.lockFile}.takeover`
		if (!(await this.lockFiles.create(guard, token))) {
			// A takeover in progress holds the guard for milliseconds; one that
			// died midway left it behind.
			const stuck = await this.lockFiles.read(guard)
			if (stuck !== null && stuck.ageMs > LOCK_STALE_MS) await this.lockFiles.remove(guard)
			return false
		}
		try {
			const held = await this.lockFiles.read(this.lockFile)
			if (held === null) return true
			if (held.token !== staleToken || held.ageMs <= LOCK_STALE_MS) return false
			await this.lockFiles.remove(this.lockFile)
			return true
		} finally {
			await this.lockFiles.remove(guard)
		}
	}
}
