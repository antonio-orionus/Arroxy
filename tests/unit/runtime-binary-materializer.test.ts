import {createHash} from 'node:crypto'
import fs from 'node:fs/promises'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import {deflateRawSync} from 'node:zlib'
import {describe, expect, it} from 'vitest'
import {ArtifactMaterializeError, RuntimeBinaryMaterializer} from '@main/services/binary/RuntimeBinaryMaterializer.js'
import type {RuntimeBinaryManifestEntry} from '@shared/types.js'
import {runtimeBinaryCacheKey} from '@shared/runtimeBinaryManifest.js'

interface ZipEntryFixture {
	name: string
	body: Buffer
	compress?: boolean
}

const CRC_TABLE = new Uint32Array(256).map((_, index) => {
	let value = index
	for (let bit = 0; bit < 8; bit++) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
	return value >>> 0
})

function crc32(buffer: Buffer): number {
	let crc = 0xffffffff
	for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)
	return (crc ^ 0xffffffff) >>> 0
}

function buildStoredZip(entries: ZipEntryFixture[]): Buffer {
	const localParts: Buffer[] = []
	const centralParts: Buffer[] = []
	let offset = 0

	for (const entry of entries) {
		const name = Buffer.from(entry.name)
		const payload = entry.compress ? deflateRawSync(entry.body) : entry.body
		const compressionMethod = entry.compress ? 8 : 0
		const checksum = crc32(entry.body)
		const local = Buffer.alloc(30 + name.length)
		local.writeUInt32LE(0x04034b50, 0)
		local.writeUInt16LE(20, 4)
		local.writeUInt16LE(0x0800, 6)
		local.writeUInt16LE(compressionMethod, 8)
		local.writeUInt16LE(0, 10)
		local.writeUInt16LE(0, 12)
		local.writeUInt32LE(checksum, 14)
		local.writeUInt32LE(payload.length, 18)
		local.writeUInt32LE(entry.body.length, 22)
		local.writeUInt16LE(name.length, 26)
		local.writeUInt16LE(0, 28)
		name.copy(local, 30)
		localParts.push(local, payload)

		const central = Buffer.alloc(46 + name.length)
		central.writeUInt32LE(0x02014b50, 0)
		central.writeUInt16LE(0x0314, 4)
		central.writeUInt16LE(20, 6)
		central.writeUInt16LE(0x0800, 8)
		central.writeUInt16LE(compressionMethod, 10)
		central.writeUInt16LE(0, 12)
		central.writeUInt16LE(0, 14)
		central.writeUInt32LE(checksum, 16)
		central.writeUInt32LE(payload.length, 20)
		central.writeUInt32LE(entry.body.length, 24)
		central.writeUInt16LE(name.length, 28)
		central.writeUInt16LE(0, 30)
		central.writeUInt16LE(0, 32)
		central.writeUInt16LE(0, 34)
		central.writeUInt16LE(0, 36)
		central.writeUInt32LE((0o100755 << 16) >>> 0, 38)
		central.writeUInt32LE(offset, 42)
		name.copy(central, 46)
		centralParts.push(central)

		offset += local.length + payload.length
	}

	const centralDirectory = Buffer.concat(centralParts)
	const end = Buffer.alloc(22)
	end.writeUInt32LE(0x06054b50, 0)
	end.writeUInt16LE(0, 4)
	end.writeUInt16LE(0, 6)
	end.writeUInt16LE(entries.length, 8)
	end.writeUInt16LE(entries.length, 10)
	end.writeUInt32LE(centralDirectory.length, 12)
	end.writeUInt32LE(offset, 16)
	end.writeUInt16LE(0, 20)
	return Buffer.concat([...localParts, centralDirectory, end])
}

async function withServer(body: Buffer, run: (url: string) => Promise<void>, onRequest?: () => void): Promise<void> {
	const server = http.createServer((_req, res) => {
		onRequest?.()
		res.writeHead(200, {'content-length': String(body.length)})
		res.end(body)
	})
	await new Promise<void>((resolve, reject) => {
		server.once('error', reject)
		server.listen(0, () => resolve())
	})
	try {
		const address = server.address()
		if (!address || typeof address === 'string') throw new Error('test server did not bind')
		await run(`http://127.0.0.1:${address.port}/artifact`)
	} finally {
		await new Promise<void>((resolve, reject) => {
			server.close(err => (err ? reject(err) : resolve()))
		})
	}
}

function sha256(buffer: Buffer): string {
	return createHash('sha256').update(buffer).digest('hex')
}

function entryFor(body: Buffer, patch: Partial<RuntimeBinaryManifestEntry> = {}): RuntimeBinaryManifestEntry {
	return {id: 'yt-dlp', channel: 'nightly', provider: 'github', version: '2026.06.12', platform: 'linux', arch: 'x64', url: 'http://127.0.0.1/placeholder', mirrors: [], size: body.length, sha256: sha256(body), format: 'raw', executablePath: 'yt-dlp', ...patch}
}

function materializerCacheKey(entry: RuntimeBinaryManifestEntry): string {
	return createHash('sha256').update(runtimeBinaryCacheKey(entry)).digest('hex')
}

async function cacheRoot(): Promise<string> {
	return fs.mkdtemp(path.join(os.tmpdir(), 'runtime-materializer-'))
}

describe('RuntimeBinaryMaterializer', () => {
	it('materializes a raw executable into an immutable cache directory', async () => {
		const body = Buffer.from('fake ytdlp')
		await withServer(body, async url => {
			const root = await cacheRoot()
			const result = await new RuntimeBinaryMaterializer().materialize(entryFor(body, {url}), {cacheRoot: root})

			await expect(fs.readFile(result.executablePath, 'utf8')).resolves.toBe('fake ytdlp')
			await expect(fs.readFile(result.metadataPath, 'utf8')).resolves.toContain('"cacheKey"')
			await expect(fs.readFile(result.metadataPath, 'utf8')).resolves.toContain('"executableSha256"')
			if (process.platform !== 'win32') expect((await fs.stat(result.executablePath)).mode & 0o111).not.toBe(0)
			await fs.rm(root, {recursive: true, force: true})
		})
	})

	it('rejects size and checksum mismatches before install', async () => {
		const body = Buffer.from('fake ytdlp')
		await withServer(body, async url => {
			const root = await cacheRoot()
			await expect(new RuntimeBinaryMaterializer().materialize(entryFor(body, {url, size: body.length + 1}), {cacheRoot: root})).rejects.toMatchObject({code: 'SIZE_MISMATCH'})
			await expect(new RuntimeBinaryMaterializer().materialize(entryFor(body, {url, sha256: 'b'.repeat(64)}), {cacheRoot: root})).rejects.toMatchObject({code: 'CHECKSUM'})
			await fs.rm(root, {recursive: true, force: true})
		})
	})

	it('revalidates existing install content before reuse', async () => {
		const body = Buffer.from('fake ytdlp')
		await withServer(body, async url => {
			const root = await cacheRoot()
			const materializer = new RuntimeBinaryMaterializer()
			const entry = entryFor(body, {url})
			const first = await materializer.materialize(entry, {cacheRoot: root})
			await fs.writeFile(first.executablePath, 'tampered')

			const second = await materializer.materialize(entry, {cacheRoot: root})

			expect(second.executablePath).toBe(first.executablePath)
			await expect(fs.readFile(second.executablePath, 'utf8')).resolves.toBe('fake ytdlp')
			await fs.rm(root, {recursive: true, force: true})
		})
	})

	it('extracts the requested executable from a verified zip archive', async () => {
		const zip = buildStoredZip([{name: 'bin/yt-dlp', body: Buffer.from('fake zipped ytdlp'), compress: true}])
		await withServer(zip, async url => {
			const root = await cacheRoot()
			const entry = entryFor(zip, {url, format: 'zip', executablePath: 'bin/yt-dlp'})
			const result = await new RuntimeBinaryMaterializer().materialize(entry, {cacheRoot: root})

			await expect(fs.readFile(result.executablePath, 'utf8')).resolves.toBe('fake zipped ytdlp')
			await fs.rm(root, {recursive: true, force: true})
		})
	})

	it('reuses existing zip installs using extracted executable metadata', async () => {
		const zip = buildStoredZip([{name: 'bin/yt-dlp', body: Buffer.from('fake zipped ytdlp'), compress: true}])
		let requests = 0
		await withServer(
			zip,
			async url => {
				const root = await cacheRoot()
				const materializer = new RuntimeBinaryMaterializer()
				const entry = entryFor(zip, {url, format: 'zip', executablePath: 'bin/yt-dlp'})

				const first = await materializer.materialize(entry, {cacheRoot: root})
				const second = await materializer.materialize(entry, {cacheRoot: root})

				expect(second.executablePath).toBe(first.executablePath)
				expect(requests).toBe(1)
				await fs.rm(root, {recursive: true, force: true})
			},
			() => {
				requests++
			}
		)
	})

	it('reports extraction before staging a verified artifact', async () => {
		const zip = buildStoredZip([{name: 'bin/yt-dlp', body: Buffer.from('fake zipped ytdlp'), compress: true}])
		await withServer(zip, async url => {
			const root = await cacheRoot()
			const phases: string[] = []
			const entry = entryFor(zip, {url, format: 'zip', executablePath: 'bin/yt-dlp'})

			await new RuntimeBinaryMaterializer().materialize(entry, {cacheRoot: root, onExtracting: () => phases.push('extracting')})

			expect(phases).toEqual(['extracting'])
			await fs.rm(root, {recursive: true, force: true})
		})
	})

	it('removes stale locks left by interrupted materialization runs', async () => {
		const body = Buffer.from('fake ytdlp')
		await withServer(body, async url => {
			const root = await cacheRoot()
			const entry = entryFor(body, {url})
			const staleLockDir = path.join(root, 'locks', materializerCacheKey(entry))
			await fs.mkdir(staleLockDir, {recursive: true})
			await fs.writeFile(path.join(staleLockDir, 'owner.json'), JSON.stringify({pid: 999_999, createdAt: new Date(Date.now() - 60_000).toISOString()}))

			const result = await new RuntimeBinaryMaterializer().materialize(entry, {cacheRoot: root, lockTimeoutMs: 50})

			await expect(fs.readFile(result.executablePath, 'utf8')).resolves.toBe('fake ytdlp')
			await expect(fs.readdir(path.join(root, 'locks'))).resolves.toEqual([])
			await fs.rm(root, {recursive: true, force: true})
		})
	})

	it('rejects unsafe zip entry names', async () => {
		const zip = buildStoredZip([{name: '../yt-dlp', body: Buffer.from('fake ytdlp')}])
		await withServer(zip, async url => {
			const root = await cacheRoot()
			const entry = entryFor(zip, {url, format: 'zip', executablePath: 'yt-dlp'})
			await expect(new RuntimeBinaryMaterializer().materialize(entry, {cacheRoot: root})).rejects.toBeInstanceOf(ArtifactMaterializeError)
			await expect(fs.readdir(path.join(root, 'artifacts'))).rejects.toThrow()
			await fs.rm(root, {recursive: true, force: true})
		})
	})
})
