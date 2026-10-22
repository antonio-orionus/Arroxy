import {createHash, randomBytes} from 'node:crypto'
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
// How many claims deep a takeover breaks claims left by dead processes.
const CLAIM_DEPTH = 2
// Windows can answer a busy code for a file for a moment (an antivirus or the
// indexer scanning it, a delete still pending); removing the write probe and
// claiming the lock for release are retried meanwhile.
const BUSY_RETRY_ATTEMPTS = 5
const BUSY_RETRY_MS = 25

// Another arroxy-mcp held the lock for the whole wait.
export class LockBusyError extends Error {
	constructor(lockFile: string, waitMs: number) {
		super(`Another arroxy-mcp held ${lockFile} for over ${waitMs} ms.`)
		this.name = 'LockBusyError'
	}
}

// The file operations the lock and the Windows write probe are built from;
// tests wrap them to force a race or to stand in for Windows.
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
	// Token and age come from one handle, so they describe the same file even
	// while another process replaces it.
	async read(file) {
		try {
			const handle = await fs.open(file, 'r')
			try {
				const stat = await handle.stat()
				return {token: await handle.readFile('utf8'), ageMs: Date.now() - stat.mtimeMs}
			} finally {
				await handle.close()
			}
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

// The claim that lets its holder remove `file` while it holds `token`. Named
// from a hash: the token is read from disk and need not be a safe file name.
export function claimFile(file: string, token: string): string {
	return `${file}.takeover-${createHash('sha256').update(token).digest('hex').slice(0, 16)}`
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

// Runs `operation`, again while it fails with a busy code, at most
// BUSY_RETRY_ATTEMPTS times; the last failure is thrown.
async function retryBusy<T>(operation: () => Promise<T>): Promise<T> {
	for (let attempt = 1; ; attempt++) {
		try {
			return await operation()
		} catch (error) {
			if (attempt >= BUSY_RETRY_ATTEMPTS || !BUSY_LOCK_CODES.has(errorCode(error) ?? '')) throw error
			await delay(BUSY_RETRY_MS * attempt)
		}
	}
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

	// False when the folder cannot be created or written to. Rejected here, a
	// folder this user cannot write to is told apart from a busy lock, which
	// also answers EPERM or EACCES on create.
	private async prepareDir(): Promise<boolean> {
		try {
			await fs.mkdir(this.dir, {recursive: true, mode: 0o700})
			// fs.access ignores folder ACLs on Windows; only a real write tells.
			if (this.platform === 'win32') return await this.probeWritable()
			// An existing folder may be open to others; close it without touching
			// the owner's own bits.
			const {mode} = await fs.stat(this.dir)
			if ((mode & 0o077) !== 0) await fs.chmod(this.dir, mode & 0o700)
			await fs.access(this.dir, fsConstants.W_OK | fsConstants.X_OK)
			return true
		} catch {
			return false
		}
	}

	// Whether this user can create and remove a file in the folder, found by
	// doing it. A probe that cannot be removed fails it too: a lock file there
	// could never be released. Only in that case is a probe left behind, and
	// said so.
	private async probeWritable(): Promise<boolean> {
		const probe = path.join(this.dir, `.write-probe-${randomBytes(6).toString('hex')}`)
		try {
			if (!(await this.lockFiles.create(probe, ''))) return false
		} catch {
			return false
		}
		try {
			await retryBusy(() => this.lockFiles.remove(probe))
			return true
		} catch (error) {
			this.log(`arroxy-mcp: could not remove ${probe}: ${reasonOf(error)}; the work runs unlocked, as a lock there could not be released.`)
			return false
		}
	}

	// A lock file created with O_EXCL that holds this holder's random token. A
	// file holding token T is removed only under the claim on it,
	// `<file>.takeover-<hash of T>`, also created with O_EXCL, and only after
	// reading T back (for a takeover, still stale): tokens never recur, so
	// neither a holder releasing late nor a taker arriving late can remove a
	// successor's lock. The one gap left is a process paused for over
	// LOCK_STALE_MS while it holds a claim.
	// A folder that cannot hold a lock file cannot hold a write either: the work
	// then runs unlocked, so a call that needs no write still goes through and
	// one that does reports why.
	private async withLock<T>(work: () => Promise<T>, signal?: AbortSignal): Promise<T> {
		if (!(await this.prepareDir())) return work()
		const token = randomBytes(16).toString('hex')
		const deadline = Date.now() + this.lockWaitMs
		for (;;) {
			signal?.throwIfAborted()
			if (await this.tryCreate(this.lockFile, token)) break
			const held = await this.lockFiles.read(this.lockFile)
			if (held !== null && held.ageMs > LOCK_STALE_MS && (await this.takeOverStale(this.lockFile, held.token, token))) continue
			if (Date.now() > deadline) throw new LockBusyError(this.lockFile, this.lockWaitMs)
			await delay(LOCK_RETRY_MS, signal)
		}
		try {
			return await work()
		} finally {
			await this.release(token)
		}
	}

	// A lock this holder kept past LOCK_STALE_MS may already belong to someone
	// else; while a taker holds the claim on it, it is theirs to remove. Never
	// throws, so a failed release never replaces the outcome of the work: the
	// lock left behind goes stale and is taken over.
	private async release(token: string): Promise<void> {
		try {
			await this.removeUnderClaim(this.lockFile, token, claim => retryBusy(() => this.lockFiles.create(claim, token)))
		} catch (error) {
			this.log(`arroxy-mcp: could not release ${this.lockFile}: ${reasonOf(error)}; it is taken over once stale.`)
		}
	}

	// Creates the lock (or a claim): true once this holder has it, false while
	// someone else does. On Windows a lock file another holder is still
	// deleting answers EPERM, EACCES or EBUSY instead of EEXIST: that is busy
	// too, retried until the wait runs out, never a reason to run unlocked
	// (prepareDir has already ruled out a folder this user cannot write to).
	// Anything else is a real failure of the folder.
	private async tryCreate(file: string, token: string): Promise<boolean> {
		try {
			return await this.lockFiles.create(file, token)
		} catch (error) {
			if (BUSY_LOCK_CODES.has(errorCode(error) ?? '')) return false
			throw new SecretStoreError(`Could not create ${file}: ${reasonOf(error)}`, this.dir)
		}
	}

	// Removes a stale `file`, the lock or a claim, left by a process that died
	// holding it. Several processes can see the same stale file; only the one
	// holding its claim acts on it. A claim is held for milliseconds, so one
	// older than LOCK_STALE_MS was left by a claimer that died midway: it is
	// broken the same way, one level down, at most CLAIM_DEPTH levels. Under the
	// claim the file must read stale again: a read racing a replacement can pair
	// a live token with the age of the file it replaced. True when this process
	// held the claim.
	private async takeOverStale(file: string, staleToken: string, token: string, depth = 0): Promise<boolean> {
		if (await this.removeUnderClaim(file, staleToken, claim => this.tryCreate(claim, token), LOCK_STALE_MS)) return true
		const claim = claimFile(file, staleToken)
		const stuck = await this.lockFiles.read(claim)
		if (stuck !== null && stuck.ageMs > LOCK_STALE_MS && depth < CLAIM_DEPTH) await this.takeOverStale(claim, stuck.token, token, depth + 1)
		return false
	}

	// Removes `file` if it still holds `heldToken` (and is older than
	// `minAgeMs`, when given), under the claim on that token, which `claim`
	// creates. False, removing nothing, while someone else holds the claim.
	private async removeUnderClaim(file: string, heldToken: string, claim: (claimFile: string) => Promise<boolean>, minAgeMs?: number): Promise<boolean> {
		const claimed = claimFile(file, heldToken)
		if (!(await claim(claimed))) return false
		try {
			const held = await this.lockFiles.read(file)
			if (held?.token === heldToken && (minAgeMs === undefined || held.ageMs > minAgeMs)) await this.lockFiles.remove(file)
		} finally {
			await this.lockFiles.remove(claimed)
		}
		return true
	}
}
