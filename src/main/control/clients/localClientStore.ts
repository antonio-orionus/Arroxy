// Where the allowed local clients are kept between launches.
//
// The file is local-clients.json in userData, written owner-only through a
// temp file and a rename, each secret encrypted by the cipher. A file that
// cannot be read never stops the app: a corrupt one is moved aside and the
// list starts empty. One that is unreadable for now (no keyring, a read
// error) is left as it is and never overwritten this launch, so its clients
// come back once it can be read. A secret is never written in the clear.

import {randomBytes} from 'node:crypto'
import fs from 'node:fs/promises'
import {z} from 'zod'
import type {ControlSocketLog} from '../socket/controlConnection.js'
import {errnoCode} from '../socket/errnoCode.js'
import type {SecretCipher} from './secretCipher.js'

export const LOCAL_CLIENTS_FILE_NAME = 'local-clients.json'

// A client the user allowed, as kept between launches.
export interface LocalClientRecord {
	readonly clientId: string
	// The name the client gave in hello.
	readonly label: string
	readonly pathsRead: boolean
	readonly firstSeenAt: number
	readonly lastSeenAt: number
	readonly secret: string
}

export interface LocalClientStore {
	// Never throws: what cannot be read is left out.
	load(): Promise<LocalClientRecord[]>
	save(records: readonly LocalClientRecord[]): Promise<void>
}

const storedClientSchema = z.object({
	clientId: z.string().min(1),
	label: z.string(),
	pathsRead: z.boolean(),
	firstSeenAt: z.number().int().nonnegative(),
	lastSeenAt: z.number().int().nonnegative(),
	// base64 of the cipher's output.
	secret: z.base64().min(1)
})

const storedFileSchema = z.object({version: z.literal(1), clients: z.array(storedClientSchema)})

type StoredFile = z.infer<typeof storedFileSchema>

// For tests and anything that keeps clients for one launch.
export class MemoryLocalClientStore implements LocalClientStore {
	records: readonly LocalClientRecord[]

	constructor(records: readonly LocalClientRecord[] = []) {
		this.records = records
	}

	load(): Promise<LocalClientRecord[]> {
		return Promise.resolve([...this.records])
	}

	save(records: readonly LocalClientRecord[]): Promise<void> {
		this.records = [...records]
		return Promise.resolve()
	}
}

export interface FileLocalClientStoreOptions {
	readonly filePath: string
	readonly cipher: SecretCipher
	readonly log: ControlSocketLog
}

export class FileLocalClientStore implements LocalClientStore {
	// Set when load left rows unread; saving then would lose them.
	private unread = false
	private writing: Promise<void> = Promise.resolve()

	constructor(private readonly options: FileLocalClientStoreOptions) {}

	async load(): Promise<LocalClientRecord[]> {
		const {filePath, cipher, log} = this.options
		let text: string
		try {
			text = await fs.readFile(filePath, 'utf8')
		} catch (error) {
			const code = errnoCode(error)
			if (code === 'ENOENT') return []
			log.warn('the local clients could not be read', {code: code ?? 'unknown'})
			this.unread = true
			return []
		}
		const stored = parseStoredFile(text)
		if (!stored.ok) {
			log.warn('the local clients file is corrupt; starting with none', {reason: stored.reason})
			await this.moveAside()
			return []
		}
		if (stored.file.clients.length === 0) return []
		if (!cipher.available()) {
			log.warn('the local clients cannot be read without secure storage', {clients: stored.file.clients.length})
			this.unread = true
			return []
		}
		return stored.file.clients.flatMap(row => {
			try {
				const secret = cipher.decrypt(Buffer.from(row.secret, 'base64'))
				if (secret.length > 0) return [{...row, secret}]
			} catch {
				// Logged below.
			}
			log.warn('a local client was dropped: its secret could not be decrypted', {clientId: row.clientId})
			return []
		})
	}

	// One write at a time, in the order asked, so the last one wins.
	save(records: readonly LocalClientRecord[]): Promise<void> {
		const write = this.writing.then(() => this.write(records))
		this.writing = write.catch(() => undefined)
		return write
	}

	private async write(records: readonly LocalClientRecord[]): Promise<void> {
		const {filePath, cipher} = this.options
		if (this.unread) throw new Error('the local clients file was not read; it is left as it is')
		if (!cipher.available()) throw new Error('secrets cannot be encrypted here')
		// Every secret is encrypted before anything touches the disk.
		const file: StoredFile = {version: 1, clients: records.map(record => ({...record, secret: cipher.encrypt(record.secret).toString('base64')}))}
		const temp = `${filePath}.${randomBytes(6).toString('hex')}.tmp`
		try {
			// `wx`: a file already at the temp name (a planted symlink) fails rather than being followed.
			await fs.writeFile(temp, JSON.stringify(file), {mode: 0o600, flag: 'wx'})
			if (process.platform !== 'win32') await fs.chmod(temp, 0o600)
			await fs.rename(temp, filePath)
		} catch (error) {
			await fs.rm(temp, {force: true})
			throw error
		}
	}

	private async moveAside(): Promise<void> {
		const {filePath, log} = this.options
		try {
			await fs.rename(filePath, `${filePath}.corrupt`)
		} catch (error) {
			log.warn('the corrupt local clients file could not be moved aside', {code: errnoCode(error) ?? 'unknown'})
			this.unread = true
		}
	}
}

function parseStoredFile(text: string): {readonly ok: true; readonly file: StoredFile} | {readonly ok: false; readonly reason: 'json' | 'schema'} {
	let raw: unknown
	try {
		raw = JSON.parse(text)
	} catch {
		return {ok: false, reason: 'json'}
	}
	const parsed = storedFileSchema.safeParse(raw)
	return parsed.success ? {ok: true, file: parsed.data} : {ok: false, reason: 'schema'}
}
