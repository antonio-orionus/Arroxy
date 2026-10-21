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

export class FileSecretStore {
	private readonly file: string

	constructor(
		private readonly dir: string,
		private readonly platform: NodeJS.Platform
	) {
		this.file = path.join(dir, CLIENTS_FILE_NAME)
	}

	async get(userDataDir: string): Promise<StoredClient | null> {
		return (await this.read())[userDataDir] ?? null
	}

	async set(userDataDir: string, client: StoredClient): Promise<void> {
		const clients = await this.read()
		clients[userDataDir] = client
		await this.write(clients)
	}

	async delete(userDataDir: string): Promise<void> {
		const clients = await this.read()
		if (!(userDataDir in clients)) return
		delete clients[userDataDir]
		await this.write(clients)
	}

	// A missing, unreadable or corrupt file reads as empty: the worst case is
	// one more approval prompt, never a crash.
	private async read(): Promise<ClientsFile> {
		let text: string
		try {
			text = await fs.readFile(this.file, 'utf8')
		} catch {
			return {}
		}
		try {
			const parsed = clientsFileSchema.safeParse(JSON.parse(text))
			return parsed.success ? parsed.data : {}
		} catch {
			return {}
		}
	}

	// Temp file then rename, so a crash mid-write never leaves half a secret.
	private async write(clients: ClientsFile): Promise<void> {
		await fs.mkdir(this.dir, {recursive: true, mode: 0o700})
		const temp = path.join(this.dir, `.${CLIENTS_FILE_NAME}.${randomBytes(6).toString('hex')}.tmp`)
		try {
			await fs.writeFile(temp, `${JSON.stringify(clients, null, '\t')}\n`, {mode: 0o600})
			// The umask can narrow the mode writeFile asked for, never widen it;
			// chmod makes it exact.
			if (this.platform !== 'win32') await fs.chmod(temp, 0o600)
			await fs.rename(temp, this.file)
		} catch (error) {
			await fs.rm(temp, {force: true})
			throw error
		}
	}
}
