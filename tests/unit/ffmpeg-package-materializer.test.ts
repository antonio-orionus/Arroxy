import {createHash} from 'node:crypto'
import fs from 'node:fs/promises'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import {brotliCompressSync, constants as zlibConstants} from 'node:zlib'
import tarStream from 'tar-stream'
import {describe, expect, it} from 'vite-plus/test'
import {ArtifactMaterializeError} from '@main/services/binary/ArtifactInstall.js'
import {FfmpegPackageMaterializer} from '@main/services/binary/FfmpegPackageMaterializer.js'
import type {FfmpegPackageEntry} from '@shared/types.js'

interface TarFixture {
	name: string
	body?: Buffer
	type?: 'file' | 'symlink' | 'directory'
	linkname?: string
}

const posixOnly = process.platform === 'win32' ? it.skip : it

async function buildPackage(entries: TarFixture[]): Promise<Buffer> {
	const pack = tarStream.pack()
	const chunks: Buffer[] = []
	pack.on('data', (chunk: unknown) => {
		if (Buffer.isBuffer(chunk)) chunks.push(chunk)
	})
	const done = new Promise<void>((resolve, reject) => {
		pack.on('end', resolve)
		pack.on('error', reject)
	})
	for (const entry of entries) {
		if (entry.type === 'symlink' || entry.type === 'directory') pack.entry({name: entry.name, type: entry.type, linkname: entry.linkname})
		else pack.entry({name: entry.name, mode: 0o755}, entry.body ?? Buffer.alloc(0))
	}
	pack.finalize()
	await done
	return brotliCompressSync(Buffer.concat(chunks), {params: {[zlibConstants.BROTLI_PARAM_LARGE_WINDOW]: 1, [zlibConstants.BROTLI_PARAM_LGWIN]: 26}})
}

const FFMPEG = Buffer.from('#!/bin/sh\necho ffmpeg\n')
const FFPROBE = Buffer.from('#!/bin/sh\necho ffprobe\n')
const LIB = Buffer.from('library bytes')

function goodFixtures(): TarFixture[] {
	return [
		{name: 'ffmpeg', body: FFMPEG},
		{name: 'ffprobe', body: FFPROBE},
		{name: 'libavcodec.so.63.8.101', body: LIB},
		{name: 'libavcodec.so.63', type: 'symlink', linkname: 'libavcodec.so.63.8.101'}
	]
}

function sha256(buffer: Buffer): string {
	return createHash('sha256').update(buffer).digest('hex')
}

function entryFor(archive: Buffer, url: string, patch: Partial<FfmpegPackageEntry> = {}): FfmpegPackageEntry {
	return {
		id: 'ffmpeg',
		version: 'N-1',
		platform: 'linux',
		arch: 'x64',
		url,
		mirrors: [],
		size: archive.length,
		sha256: sha256(archive),
		format: 'tar.br',
		ffmpegPath: 'ffmpeg',
		ffprobePath: 'ffprobe',
		files: [
			{path: 'ffmpeg', size: FFMPEG.length},
			{path: 'ffprobe', size: FFPROBE.length},
			{path: 'libavcodec.so.63.8.101', size: LIB.length}
		],
		links: [{path: 'libavcodec.so.63', target: 'libavcodec.so.63.8.101'}],
		...patch
	}
}

async function withServer(bodies: Record<string, Buffer>, run: (baseUrl: string, requests: () => number) => Promise<void>): Promise<void> {
	let count = 0
	const server = http.createServer((req, res) => {
		count++
		const body = bodies[req.url ?? '']
		if (!body) {
			res.writeHead(404)
			res.end()
			return
		}
		res.writeHead(200, {'content-length': String(body.length)})
		res.end(body)
	})
	await new Promise<void>(resolve => server.listen(0, resolve))
	try {
		const address = server.address()
		if (!address || typeof address === 'string') throw new Error('test server did not bind')
		await run(`http://127.0.0.1:${address.port}`, () => count)
	} finally {
		await new Promise<void>(resolve => server.close(() => resolve()))
	}
}

async function cacheRoot(): Promise<string> {
	return fs.mkdtemp(path.join(os.tmpdir(), 'ffmpeg-package-'))
}

async function expectInstallError(promise: Promise<unknown>, code: ArtifactMaterializeError['code']): Promise<void> {
	const err = await promise.then(
		() => null,
		(error: unknown) => error
	)
	expect(err).toBeInstanceOf(ArtifactMaterializeError)
	expect(err instanceof ArtifactMaterializeError ? err.code : null).toBe(code)
}

describe('FfmpegPackageMaterializer', () => {
	posixOnly('installs ffmpeg, ffprobe and their libraries together in one versioned directory', async () => {
		const archive = await buildPackage(goodFixtures())
		await withServer({'/pkg': archive}, async base => {
			const root = await cacheRoot()
			const install = await new FfmpegPackageMaterializer().materialize(entryFor(archive, `${base}/pkg`), {cacheRoot: root})

			expect(path.dirname(install.ffmpegPath)).toBe(install.rootDir)
			expect(path.dirname(install.ffprobePath)).toBe(install.rootDir)
			await expect(fs.readFile(install.ffmpegPath)).resolves.toEqual(FFMPEG)
			await expect(fs.readFile(path.join(install.rootDir, 'libavcodec.so.63'))).resolves.toEqual(LIB)
			await expect(fs.readlink(path.join(install.rootDir, 'libavcodec.so.63'))).resolves.toBe('libavcodec.so.63.8.101')
			expect((await fs.stat(install.ffprobePath)).mode & 0o111).not.toBe(0)
		})
	})

	posixOnly('reuses a valid install without touching the network', async () => {
		const archive = await buildPackage(goodFixtures())
		await withServer({'/pkg': archive}, async (base, requests) => {
			const root = await cacheRoot()
			const materializer = new FfmpegPackageMaterializer()
			const entry = entryFor(archive, `${base}/pkg`)
			const first = await materializer.materialize(entry, {cacheRoot: root})
			const before = requests()
			const second = await materializer.materialize({...entry, url: 'http://127.0.0.1:1/unreachable'}, {cacheRoot: root})
			expect(second.rootDir).toBe(first.rootDir)
			expect(requests()).toBe(before)
		})
	})

	posixOnly('announces a download only when it has to download', async () => {
		const archive = await buildPackage(goodFixtures())
		await withServer({'/pkg': archive}, async base => {
			const root = await cacheRoot()
			const materializer = new FfmpegPackageMaterializer()
			const entry = entryFor(archive, `${base}/pkg`)
			const starts: string[] = []
			const onDownloadStart = (): void => {
				starts.push('start')
			}

			await materializer.materialize(entry, {cacheRoot: root, onDownloadStart})
			await materializer.materialize(entry, {cacheRoot: root, onDownloadStart})

			expect(starts).toEqual(['start'])
		})
	})

	// A package installed from an index that has since moved on is listed in no
	// index any more, but it still works offline.
	posixOnly('lists the packages installed on disk with their approved entries', async () => {
		const archive = await buildPackage(goodFixtures())
		await withServer({'/pkg': archive}, async base => {
			const root = await cacheRoot()
			const materializer = new FfmpegPackageMaterializer()
			const n1 = entryFor(archive, `${base}/pkg`, {version: 'N-1'})
			const n2 = entryFor(archive, `${base}/pkg`, {version: 'N-2'})
			await materializer.materialize(n1, {cacheRoot: root})
			const second = await materializer.materialize(n2, {cacheRoot: root})
			await fs.mkdir(path.join(root, 'packages', 'not-a-package'))
			// Metadata copied into another version's directory must not vouch for it.
			await fs.copyFile(path.join(second.rootDir, '.arroxy-package.json'), path.join(root, 'packages', 'not-a-package', '.arroxy-package.json'))

			const installed = await materializer.installed({cacheRoot: root})

			expect(installed.map(entry => entry.version).sort()).toEqual(['N-1', 'N-2'])
			expect(installed.find(entry => entry.version === 'N-2')).toEqual(n2)
		})
	})

	it('lists nothing before any package is installed', async () => {
		await expect(new FfmpegPackageMaterializer().installed({cacheRoot: await cacheRoot()})).resolves.toEqual([])
	})

	posixOnly('reinstalls when a library in the cached install is damaged', async () => {
		const archive = await buildPackage(goodFixtures())
		await withServer({'/pkg': archive}, async base => {
			const root = await cacheRoot()
			const materializer = new FfmpegPackageMaterializer()
			const entry = entryFor(archive, `${base}/pkg`)
			const first = await materializer.materialize(entry, {cacheRoot: root})
			await fs.writeFile(path.join(first.rootDir, 'libavcodec.so.63.8.101'), 'truncated')
			const second = await materializer.materialize(entry, {cacheRoot: root})
			await expect(fs.readFile(path.join(second.rootDir, 'libavcodec.so.63.8.101'))).resolves.toEqual(LIB)
		})
	})

	it('rejects an archive whose checksum does not match the approved package', async () => {
		const archive = await buildPackage(goodFixtures())
		await withServer({'/pkg': archive}, async base => {
			await expectInstallError(new FfmpegPackageMaterializer().materialize(entryFor(archive, `${base}/pkg`, {sha256: 'f'.repeat(64)}), {cacheRoot: await cacheRoot()}), 'CHECKSUM')
		})
	})

	it('rejects entries the package manifest does not list', async () => {
		const archive = await buildPackage([...goodFixtures(), {name: 'extra.so', body: LIB}])
		await withServer({'/pkg': archive}, async base => {
			await expectInstallError(new FfmpegPackageMaterializer().materialize(entryFor(archive, `${base}/pkg`), {cacheRoot: await cacheRoot()}), 'ARCHIVE_SECURITY')
		})
	})

	it('rejects entries that would land outside the install directory', async () => {
		const archive = await buildPackage([...goodFixtures(), {name: '../escape', body: LIB}])
		await withServer({'/pkg': archive}, async base => {
			await expectInstallError(new FfmpegPackageMaterializer().materialize(entryFor(archive, `${base}/pkg`), {cacheRoot: await cacheRoot()}), 'ARCHIVE_SECURITY')
		})
	})

	it('rejects a link whose target differs from the approved one', async () => {
		const fixtures = goodFixtures().map(fixture => (fixture.type === 'symlink' ? {...fixture, linkname: '/etc/passwd'} : fixture))
		const archive = await buildPackage(fixtures)
		await withServer({'/pkg': archive}, async base => {
			await expectInstallError(new FfmpegPackageMaterializer().materialize(entryFor(archive, `${base}/pkg`), {cacheRoot: await cacheRoot()}), 'ARCHIVE_SECURITY')
		})
	})

	it('rejects directory and other non-file entries', async () => {
		const archive = await buildPackage([...goodFixtures(), {name: 'subdir', type: 'directory'}])
		await withServer({'/pkg': archive}, async base => {
			await expectInstallError(new FfmpegPackageMaterializer().materialize(entryFor(archive, `${base}/pkg`), {cacheRoot: await cacheRoot()}), 'ARCHIVE_SECURITY')
		})
	})

	it('rejects a package that is missing a listed file', async () => {
		const archive = await buildPackage(goodFixtures().filter(fixture => fixture.name !== 'ffprobe'))
		await withServer({'/pkg': archive}, async base => {
			await expectInstallError(new FfmpegPackageMaterializer().materialize(entryFor(archive, `${base}/pkg`), {cacheRoot: await cacheRoot()}), 'EXECUTABLE_MISSING')
		})
	})

	it('rejects a file whose size differs from the manifest', async () => {
		const archive = await buildPackage(goodFixtures().map(fixture => (fixture.name === 'ffprobe' ? {...fixture, body: Buffer.from('different length')} : fixture)))
		await withServer({'/pkg': archive}, async base => {
			await expectInstallError(new FfmpegPackageMaterializer().materialize(entryFor(archive, `${base}/pkg`), {cacheRoot: await cacheRoot()}), 'EXTRACTION')
		})
	})

	posixOnly('leaves the working version in place when installing another one fails', async () => {
		const good = await buildPackage(goodFixtures())
		const bad = await buildPackage([...goodFixtures(), {name: 'extra.so', body: LIB}])
		await withServer({'/good': good, '/bad': bad}, async base => {
			const root = await cacheRoot()
			const materializer = new FfmpegPackageMaterializer()
			const working = await materializer.materialize(entryFor(good, `${base}/good`), {cacheRoot: root})
			await expectInstallError(materializer.materialize(entryFor(bad, `${base}/bad`, {version: 'N-2'}), {cacheRoot: root}), 'ARCHIVE_SECURITY')
			await expect(fs.readFile(working.ffmpegPath)).resolves.toEqual(FFMPEG)
			expect((await fs.readdir(root)).filter(name => name.startsWith('stage-'))).toEqual([])
		})
	})

	posixOnly('downloads once when two callers install the same package concurrently', async () => {
		const archive = await buildPackage(goodFixtures())
		await withServer({'/pkg': archive}, async (base, requests) => {
			const root = await cacheRoot()
			const entry = entryFor(archive, `${base}/pkg`)
			const [a, b] = await Promise.all([new FfmpegPackageMaterializer().materialize(entry, {cacheRoot: root}), new FfmpegPackageMaterializer().materialize(entry, {cacheRoot: root})])
			expect(a.rootDir).toBe(b.rootDir)
			expect(requests()).toBe(1)
		})
	})

	posixOnly('prunes all but the active version and the newest previous one', async () => {
		const archive = await buildPackage(goodFixtures())
		await withServer({'/pkg': archive}, async base => {
			const root = await cacheRoot()
			const materializer = new FfmpegPackageMaterializer()
			const v1 = await materializer.materialize(entryFor(archive, `${base}/pkg`, {version: 'N-1'}), {cacheRoot: root})
			const v2 = await materializer.materialize(entryFor(archive, `${base}/pkg`, {version: 'N-2'}), {cacheRoot: root})
			const v3Entry = entryFor(archive, `${base}/pkg`, {version: 'N-3'})
			const v3 = await materializer.materialize(v3Entry, {cacheRoot: root})

			const removed = await materializer.prune(v3Entry, {cacheRoot: root})

			expect(removed).toEqual([v1.rootDir])
			await expect(fs.stat(v1.rootDir)).rejects.toThrow()
			await expect(fs.stat(v2.rootDir)).resolves.toBeTruthy()
			await expect(fs.stat(v3.rootDir)).resolves.toBeTruthy()
		})
	})
})
