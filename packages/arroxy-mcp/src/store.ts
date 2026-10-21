import {randomBytes} from 'node:crypto'
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
	get(userDataDir: string): StoredClient | null
	// Applies `change` to the current entry and writes the file; null removes it.
	update(userDataDir: string, change: (current: StoredClient | null) => StoredClient | null): Promise<void>
	// Removes the entry only while it still equals `expected`, the one the caller used.
	deleteIf(userDataDir: string, expected: StoredClient): Promise<boolean>
}

function delay(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms))
}

// clients.json in the bridge's config folder. Every change is a
// read-modify-write under a lock file, so the CLI and an MCP server running at
// once never drop each other's entries.
export class FileSecretStore {
	private readonly file: string
	private readonly lockFile: string

	constructor(
		private readonly dir: string,
		private readonly platform: NodeJS.Platform,
		private readonly log: (line: string) => void = () => undefined
	) {
		this.file = path.join(dir, CLIENTS_FILE_NAME)
		this.lockFile = `${this.file}.lock`
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
	async transaction<T>(work: (store: SecretStoreTransaction) => Promise<T>): Promise<T> {
		return this.withLock(async () => {
			const clients = await this.read()
			const update = async (userDataDir: string, change: (current: StoredClient | null) => StoredClient | null): Promise<void> => {
				const current = clients[userDataDir] ?? null
				const next = change(current)
				if (sameClient(current, next)) return
				if (next === null) delete clients[userDataDir]
				else clients[userDataDir] = next
				await this.write(clients)
			}
			return work({
				get: userDataDir => clients[userDataDir] ?? null,
				update,
				deleteIf: async (userDataDir, expected) => {
					const deleted = sameClient(clients[userDataDir] ?? null, expected)
					if (deleted) await update(userDataDir, () => null)
					return deleted
				}
			})
		})
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
			return true
		} catch {
			return false
		}
	}

	// A lock file created with O_EXCL. One left by a crashed process is taken
	// over once it is older than LOCK_STALE_MS. A folder that cannot hold a lock
	// file cannot hold a write either: the work then runs unlocked, so a call
	// that needs no write still goes through and one that does reports why.
	private async withLock<T>(work: () => Promise<T>): Promise<T> {
		if (!(await this.prepareDir())) return work()
		const deadline = Date.now() + LOCK_WAIT_MS
		for (;;) {
			try {
				await (await fs.open(this.lockFile, 'wx', 0o600)).close()
				break
			} catch (error) {
				if (errorCode(error) !== 'EEXIST') return work()
			}
			const stale = await fs.stat(this.lockFile).then(
				stat => Date.now() - stat.mtimeMs > LOCK_STALE_MS,
				() => false
			)
			if (stale) {
				await fs.rm(this.lockFile, {force: true})
				continue
			}
			if (Date.now() > deadline) throw new SecretStoreError(`${this.lockFile} has been held for over ${LOCK_WAIT_MS / 1000} s by another arroxy-mcp.`, this.dir)
			await delay(LOCK_RETRY_MS)
		}
		try {
			return await work()
		} finally {
			await fs.rm(this.lockFile, {force: true})
		}
	}
}
