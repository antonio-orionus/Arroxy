import {createHash} from 'node:crypto'
import fs from 'node:fs/promises'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import {deflateRawSync} from 'node:zlib'
import {describe, expect, it} from 'vitest'
import {ZippedBinaryInstaller} from '@main/services/binary/ZippedBinaryInstaller.js'

interface ZipEntryFixture {
	name: string
	body: Buffer
	compress?: boolean
}

const CRC_TABLE = new Uint32Array(256).map((_, index) => {
	let value = index
	for (let bit = 0; bit < 8; bit++) {
		value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
	}
	return value >>> 0
})

function crc32(buffer: Buffer): number {
	let crc = 0xffffffff
	for (const byte of buffer) {
		crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)
	}
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

async function withServer(body: Buffer, run: (url: string) => Promise<void>): Promise<void> {
	const server = http.createServer((_req, res) => {
		res.writeHead(200, {'content-length': String(body.length)})
		res.end(body)
	})
	await new Promise<void>((resolve, reject) => {
		server.once('error', reject)
		server.listen(0, () => resolve())
	})
	try {
		const address = server.address()
		if (!address || typeof address === 'string') throw new Error('test server did not bind to a TCP port')
		await run(`http://127.0.0.1:${address.port}/deno.zip`)
	} finally {
		await new Promise<void>((resolve, reject) => {
			server.close(err => (err ? reject(err) : resolve()))
		})
	}
}

function sha256(buffer: Buffer): string {
	return createHash('sha256').update(buffer).digest('hex')
}

describe('ZippedBinaryInstaller', () => {
	it('streams the expected executable entry from a zip archive', async () => {
		const zip = buildStoredZip([{name: 'deno-x64/deno', body: Buffer.from('fake deno binary')}])
		const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'zipped-binary-installer-'))
		const destinationPath = path.join(dir, 'deno')

		await withServer(zip, async downloadUrl => {
			await new ZippedBinaryInstaller().ensure({name: 'deno', downloadUrl, archiveFileName: 'deno.zip', innerExecutableName: 'deno', destinationPath, expectedSha256: sha256(zip)})
		})

		await expect(fs.readFile(destinationPath, 'utf8')).resolves.toBe('fake deno binary')
		if (process.platform !== 'win32') {
			const stat = await fs.stat(destinationPath)
			expect(stat.mode & 0o111).not.toBe(0)
		}
		await fs.rm(dir, {recursive: true, force: true})
	})

	it('inflates a deflated executable entry from a zip archive', async () => {
		const zip = buildStoredZip([{name: 'deno', body: Buffer.from('fake deno binary '.repeat(128)), compress: true}])
		const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'zipped-binary-installer-'))
		const destinationPath = path.join(dir, 'deno')

		await withServer(zip, async downloadUrl => {
			await new ZippedBinaryInstaller().ensure({name: 'deno', downloadUrl, archiveFileName: 'deno.zip', innerExecutableName: 'deno', destinationPath, expectedSha256: sha256(zip)})
		})

		await expect(fs.readFile(destinationPath, 'utf8')).resolves.toBe('fake deno binary '.repeat(128))
		await fs.rm(dir, {recursive: true, force: true})
	})

	it('fails as an extract error when the executable entry is missing', async () => {
		const zip = buildStoredZip([{name: 'other-tool', body: Buffer.from('not deno')}])
		const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'zipped-binary-installer-'))
		const destinationPath = path.join(dir, 'deno')

		await withServer(zip, async downloadUrl => {
			await expect(new ZippedBinaryInstaller().ensure({name: 'deno', downloadUrl, archiveFileName: 'deno.zip', innerExecutableName: 'deno', destinationPath, expectedSha256: sha256(zip)})).rejects.toMatchObject({step: 'extract'})
		})

		await expect(fs.stat(destinationPath)).rejects.toThrow()
		await fs.rm(dir, {recursive: true, force: true})
	})
})
