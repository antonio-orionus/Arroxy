// @vitest-environment node

import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {afterEach, describe, expect, it, vi} from 'vite-plus/test'
import {FileLocalClientStore, LOCAL_CLIENTS_FILE_NAME, type LocalClientRecord, MemoryLocalClientStore} from '@main/control/clients/localClientStore.js'
import type {SecretCipher} from '@main/control/clients/secretCipher.js'

// The allowed local clients on disk: local-clients.json in userData, owner-
// only, each secret encrypted by the cipher. A file that cannot be read never
// stops the app, and a secret is never written in the clear.

const isWindows = process.platform === 'win32'
const dirs: string[] = []

afterEach(async () => {
	for (const dir of dirs.splice(0)) await fs.rm(dir, {recursive: true, force: true})
})

async function tempDir(): Promise<string> {
	const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'lcs-'))
	dirs.push(dir)
	return dir
}

// Reversible, and visibly not the plaintext: each byte flipped.
function fakeCipher(options: {available?: boolean; undecryptable?: string[]} = {}) {
	const state = {available: options.available ?? true}
	const flip = (data: Buffer): Buffer => Buffer.from(data.map(byte => byte ^ 0xff))
	const cipher: SecretCipher = {
		available: () => state.available,
		encrypt: plain => flip(Buffer.from(plain, 'utf8')),
		decrypt: data => {
			const plain = flip(data).toString('utf8')
			if (options.undecryptable?.includes(plain)) throw new Error('cannot decrypt')
			return plain
		}
	}
	return {cipher, state}
}

const log = () => ({info: vi.fn(), warn: vi.fn(), error: vi.fn()})

const record = (overrides: Partial<LocalClientRecord> = {}): LocalClientRecord => ({clientId: 'client-1', label: 'Claude Code', pathsRead: false, firstSeenAt: 1000, lastSeenAt: 2000, secret: 'the-plain-secret-value', ...overrides})

async function storeIn(dir: string, cipher: SecretCipher, logger = log()) {
	const filePath = path.join(dir, LOCAL_CLIENTS_FILE_NAME)
	return {store: new FileLocalClientStore({filePath, cipher, log: logger}), filePath, log: logger}
}

// The row for `clientId` in a parsed local-clients.json.
function rowOf(file: unknown, clientId: string): unknown {
	const clients = (file as {clients: Array<{clientId: string}>}).clients
	return clients.find(row => row.clientId === clientId)
}

describe('FileLocalClientStore', () => {
	it('loads nothing when there is no file', async () => {
		const {store} = await storeIn(await tempDir(), fakeCipher().cipher)
		expect(await store.load()).toEqual([])
	})

	it('keeps records across a save and a load, with every secret encrypted', async () => {
		const dir = await tempDir()
		const {cipher} = fakeCipher()
		const {store, filePath} = await storeIn(dir, cipher)
		const records = [record(), record({clientId: 'client-2', label: 'arroxy-mcp', pathsRead: true, secret: 'another-plain-secret'})]
		await store.save(records)
		const text = await fs.readFile(filePath, 'utf8')
		expect(text).not.toContain('the-plain-secret-value')
		expect(text).not.toContain('another-plain-secret')
		expect(JSON.parse(text)).toEqual({version: 1, clients: records.map(row => ({...row, secret: cipher.encrypt(row.secret).toString('base64')}))})
		expect(await (await storeIn(dir, cipher)).store.load()).toEqual(records)
		expect(await fs.readdir(dir)).toEqual([LOCAL_CLIENTS_FILE_NAME])
	})

	it.skipIf(isWindows)('writes the file owner-only', async () => {
		const {store, filePath} = await storeIn(await tempDir(), fakeCipher().cipher)
		await store.save([record()])
		expect((await fs.stat(filePath)).mode & 0o777).toBe(0o600)
	})

	it('writes one save at a time, so the last one wins', async () => {
		const {cipher} = fakeCipher()
		const dir = await tempDir()
		const {store} = await storeIn(dir, cipher)
		await Promise.all([store.save([record({label: 'first'})]), store.save([record({label: 'second'})]), store.save([record({label: 'third'})])])
		expect(await (await storeIn(dir, cipher)).store.load()).toEqual([record({label: 'third'})])
	})

	it.each([
		['not JSON', '{"version": 1, "clients": ['],
		['not the schema', JSON.stringify({version: 1, clients: [{clientId: 7}]})],
		['another version', JSON.stringify({version: 2, clients: []})]
	])('moves aside a file that is %s and starts empty', async (_case, body) => {
		const dir = await tempDir()
		const {store, filePath, log: logger} = await storeIn(dir, fakeCipher().cipher)
		await fs.writeFile(filePath, body)
		expect(await store.load()).toEqual([])
		expect(await fs.readFile(`${filePath}.corrupt`, 'utf8')).toBe(body)
		expect(await fs.readdir(dir)).toEqual([`${LOCAL_CLIENTS_FILE_NAME}.corrupt`])
		expect(logger.warn).toHaveBeenCalledTimes(1)
		// No path or content in the log.
		expect(JSON.stringify(logger.warn.mock.calls)).not.toContain(dir)
		await store.save([record()])
		expect(await store.load()).toEqual([record()])
	})

	it('keeps a row whose secret does not decrypt in the file, unread, naming its clientId', async () => {
		const dir = await tempDir()
		const writer = await storeIn(dir, fakeCipher().cipher)
		await writer.store.save([record({clientId: 'broken', secret: 'lost-secret'}), record({clientId: 'fine'})])
		const brokenRow = rowOf(JSON.parse(await fs.readFile(writer.filePath, 'utf8')), 'broken')
		const reader = await storeIn(dir, fakeCipher({undecryptable: ['lost-secret']}).cipher)
		expect(await reader.store.load()).toEqual([record({clientId: 'fine'})])
		expect(reader.log.warn).toHaveBeenCalledWith(expect.any(String), {clientId: 'broken'})
		// A save rewrites the file with the unread row exactly as it was.
		await reader.store.save([record({clientId: 'fine', lastSeenAt: 3000}), record({clientId: 'new'})])
		expect(rowOf(JSON.parse(await fs.readFile(writer.filePath, 'utf8')), 'broken')).toEqual(brokenRow)
		// Once it decrypts again, it is back.
		expect(await (await storeIn(dir, fakeCipher().cipher)).store.load()).toEqual([record({clientId: 'fine', lastSeenAt: 3000}), record({clientId: 'new'}), record({clientId: 'broken', secret: 'lost-secret'})])
	})

	it('keeps a row whose secret decrypts to nothing, as it was', async () => {
		const dir = await tempDir()
		const writer = await storeIn(dir, fakeCipher().cipher)
		await writer.store.save([record({clientId: 'empty', secret: 'x'})])
		const before = await fs.readFile(writer.filePath, 'utf8')
		const emptying: SecretCipher = {available: () => true, encrypt: plain => Buffer.from(plain), decrypt: () => ''}
		const reader = await storeIn(dir, emptying)
		expect(await reader.store.load()).toEqual([])
		await reader.store.save([])
		expect(await fs.readFile(writer.filePath, 'utf8')).toBe(before)
	})

	it('lets a removed client go: only rows that did not decrypt are kept', async () => {
		const dir = await tempDir()
		const writer = await storeIn(dir, fakeCipher().cipher)
		await writer.store.save([record({clientId: 'broken', secret: 'lost-secret'}), record({clientId: 'removed'})])
		const reader = await storeIn(dir, fakeCipher({undecryptable: ['lost-secret']}).cipher)
		expect(await reader.store.load()).toEqual([record({clientId: 'removed'})])
		await reader.store.save([])
		const clients = (JSON.parse(await fs.readFile(writer.filePath, 'utf8')) as {clients: Array<{clientId: string}>}).clients
		expect(clients.map(row => row.clientId)).toEqual(['broken'])
		expect(await (await storeIn(dir, fakeCipher().cipher)).store.load()).toEqual([record({clientId: 'broken', secret: 'lost-secret'})])
	})

	it('reads no client while secrets cannot be decrypted, and leaves the file as it is', async () => {
		const dir = await tempDir()
		const {cipher, state} = fakeCipher()
		const {store, filePath} = await storeIn(dir, cipher)
		await store.save([record()])
		const before = await fs.readFile(filePath, 'utf8')
		state.available = false
		const locked = await storeIn(dir, cipher)
		expect(await locked.store.load()).toEqual([])
		expect(await fs.readFile(filePath, 'utf8')).toBe(before)
		// Not even once secrets are storable again: the rows it could not read would be lost.
		state.available = true
		await expect(locked.store.save([record({clientId: 'new'})])).rejects.toMatchObject({name: 'LocalClientStoreRefusal', code: 'store_unread'})
		expect(await fs.readFile(filePath, 'utf8')).toBe(before)
	})

	it('never writes a secret while it cannot be encrypted', async () => {
		const dir = await tempDir()
		const {store, filePath} = await storeIn(dir, fakeCipher({available: false}).cipher)
		expect(await store.load()).toEqual([])
		await expect(store.save([record()])).rejects.toMatchObject({name: 'LocalClientStoreRefusal', code: 'cipher_unavailable'})
		await expect(fs.readFile(filePath)).rejects.toThrow()
		expect(await fs.readdir(dir)).toEqual([])
	})

	it('writes nothing when encrypting throws', async () => {
		const dir = await tempDir()
		const cipher: SecretCipher = {
			available: () => true,
			encrypt: () => {
				throw new Error('keychain said no')
			},
			decrypt: () => ''
		}
		const {store} = await storeIn(dir, cipher)
		await expect(store.save([record()])).rejects.toMatchObject({name: 'LocalClientStoreRefusal', code: 'encrypt_failed'})
		expect(await fs.readdir(dir)).toEqual([])
	})
})

describe('MemoryLocalClientStore', () => {
	it('loads what it was given and keeps what was saved', async () => {
		const store = new MemoryLocalClientStore([record()])
		expect(await store.load()).toEqual([record()])
		await store.save([record({clientId: 'other'})])
		expect(store.records).toEqual([record({clientId: 'other'})])
		expect(await store.load()).toEqual([record({clientId: 'other'})])
	})
})
