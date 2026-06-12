import fs from 'node:fs/promises'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import {createHash} from 'node:crypto'
import cacache from 'cacache'
import {describe, expect, it} from 'vitest'
import {DownloadIntegrityError, DownloadSizeMismatchError, DownloadStalledError, classifyDownloadError, copyCachedArtifactToFile, downloadArtifactToCache, downloadFile, sha256HexToSri} from '@main/services/binary/BinaryDownloader.js'

async function withServer(handler: http.RequestListener, run: (url: string) => Promise<void>): Promise<void> {
	const server = http.createServer(handler)
	await new Promise<void>((resolve, reject) => {
		server.once('error', reject)
		server.listen(0, () => resolve())
	})
	try {
		const address = server.address()
		if (!address || typeof address === 'string') throw new Error('test server did not bind to a TCP port')
		await run(`http://127.0.0.1:${address.port}`)
	} finally {
		await new Promise<void>((resolve, reject) => {
			server.close(err => (err ? reject(err) : resolve()))
		})
	}
}

function sha256(buffer: Buffer): string {
	return createHash('sha256').update(buffer).digest('hex')
}

async function cacheRoot(): Promise<string> {
	return fs.mkdtemp(path.join(os.tmpdir(), 'binary-cache-'))
}

describe('BinaryDownloader', () => {
	it('classifies no-progress download stalls as timeouts', () => {
		const err = new DownloadStalledError('No download progress for 60000ms')

		expect(classifyDownloadError(err)).toBe('timeout')
	})

	it('times out a slow stream even when bytes keep arriving', async () => {
		const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'binary-downloader-'))
		const destination = path.join(dir, 'slow.bin')

		try {
			await withServer(
				(_req, res) => {
					res.writeHead(200, {'content-length': '1048576'})
					const interval = setInterval(() => {
						res.write(Buffer.alloc(1))
					}, 10)
					res.on('close', () => clearInterval(interval))
				},
				async url => {
					await expect(downloadFile(url, destination, undefined, {maxDurationMs: 50, stallTimeoutMs: 1000})).rejects.toThrow(DownloadStalledError)
				}
			)

			await expect(fs.stat(destination)).rejects.toThrow()
		} finally {
			await fs.rm(dir, {recursive: true, force: true})
		}
	})

	it('resumes when a response ends before the advertised content length', async () => {
		const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'binary-downloader-'))
		const destination = path.join(dir, 'artifact.bin')
		const body = Buffer.from('a'.repeat(4096))
		const ranges: Array<string | undefined> = []

		try {
			await withServer(
				(req, res) => {
					ranges.push(req.headers.range)

					if (!req.headers.range) {
						res.writeHead(200, {'content-length': String(body.length)})
						res.write(body.subarray(0, 1024))
						setImmediate(() => res.destroy())
						return
					}

					expect(req.headers.range).toBe('bytes=1024-')
					res.writeHead(206, {'content-length': String(body.length - 1024), 'content-range': `bytes 1024-${body.length - 1}/${body.length}`})
					res.end(body.subarray(1024))
				},
				async url => {
					await downloadFile(url, destination, undefined, true)
				}
			)

			await expect(fs.readFile(destination)).resolves.toEqual(body)
			expect(ranges).toEqual([undefined, 'bytes=1024-'])
		} finally {
			await fs.rm(dir, {recursive: true, force: true})
		}
	})

	it('writes successful artifact downloads to cacache with manifest integrity', async () => {
		const body = Buffer.from('verified artifact')
		const cache = await cacheRoot()
		const destination = path.join(cache, 'artifact.bin')

		try {
			await withServer(
				(_req, res) => {
					res.writeHead(200, {'content-length': String(body.length)})
					res.end(body)
				},
				async url => {
					const result = await downloadArtifactToCache({urls: [url], cacheRoot: cache, key: 'artifact-key', sha256: sha256(body), size: body.length})

					expect(result.integrity).toBe(sha256HexToSri(sha256(body)))
					expect(result.size).toBe(body.length)
					const info = await cacache.get.info(cache, 'artifact-key')
					expect(info?.integrity).toContain(result.integrity)
					expect(info?.size).toBe(body.length)
					await copyCachedArtifactToFile(cache, 'artifact-key', destination, {integrity: result.integrity, size: body.length})
					await expect(fs.readFile(destination)).resolves.toEqual(body)
				}
			)
		} finally {
			await fs.rm(cache, {recursive: true, force: true})
		}
	})

	it('reuses an existing verified cache entry by manifest key without redownloading', async () => {
		const body = Buffer.from('cached artifact')
		const cache = await cacheRoot()
		let requests = 0

		try {
			await withServer(
				(_req, res) => {
					requests++
					res.writeHead(200, {'content-length': String(body.length)})
					res.end(body)
				},
				async url => {
					const first = await downloadArtifactToCache({urls: [url], cacheRoot: cache, key: 'artifact-key', sha256: sha256(body), size: body.length})
					const second = await downloadArtifactToCache({urls: [url], cacheRoot: cache, key: 'artifact-key', sha256: sha256(body), size: body.length})

					expect(second).toEqual(first)
					expect(requests).toBe(1)
				}
			)
		} finally {
			await fs.rm(cache, {recursive: true, force: true})
		}
	})

	it('rejects manifest size and checksum mismatches before publishing a cache entry', async () => {
		const body = Buffer.from('verified artifact')
		const cache = await cacheRoot()

		try {
			await withServer(
				(_req, res) => {
					res.writeHead(200, {'content-length': String(body.length)})
					res.end(body)
				},
				async url => {
					await expect(downloadArtifactToCache({urls: [url], cacheRoot: cache, key: 'bad-size', sha256: sha256(body), size: body.length + 1})).rejects.toBeInstanceOf(DownloadSizeMismatchError)
					await expect(downloadArtifactToCache({urls: [url], cacheRoot: cache, key: 'bad-sha', sha256: 'b'.repeat(64), size: body.length})).rejects.toBeInstanceOf(DownloadIntegrityError)
					await expect(cacache.get.info(cache, 'bad-size')).resolves.toBeNull()
					await expect(cacache.get.info(cache, 'bad-sha')).resolves.toBeNull()
				}
			)
		} finally {
			await fs.rm(cache, {recursive: true, force: true})
		}
	})

	it('tries later artifact URLs when an earlier transfer fails validation', async () => {
		const body = Buffer.from('verified mirror artifact')
		const wrong = Buffer.from('wrong')
		const cache = await cacheRoot()
		const requests: string[] = []

		try {
			await withServer(
				(req, res) => {
					requests.push(req.url ?? '')
					const response = req.url === '/bad' ? wrong : body
					res.writeHead(200, {'content-length': String(response.length)})
					res.end(response)
				},
				async url => {
					const result = await downloadArtifactToCache({urls: [`${url}/bad`, `${url}/good`], cacheRoot: cache, key: 'mirror-fallback', sha256: sha256(body), size: body.length})
					const copied = path.join(cache, 'mirror.bin')
					await copyCachedArtifactToFile(cache, 'mirror-fallback', copied, {integrity: result.integrity, size: body.length})

					expect(requests).toEqual(['/bad', '/good'])
					await expect(fs.readFile(copied)).resolves.toEqual(body)
				}
			)
		} finally {
			await fs.rm(cache, {recursive: true, force: true})
		}
	})

	it('resumes truncated artifact responses before inserting verified bytes into cacache', async () => {
		const body = Buffer.from('a'.repeat(4096))
		const cache = await cacheRoot()
		const ranges: Array<string | undefined> = []

		try {
			await withServer(
				(req, res) => {
					ranges.push(req.headers.range)

					if (!req.headers.range) {
						res.writeHead(200, {'content-length': String(body.length)})
						res.write(body.subarray(0, 1024))
						setImmediate(() => res.destroy())
						return
					}

					expect(req.headers.range).toBe('bytes=1024-')
					res.writeHead(206, {'content-length': String(body.length - 1024), 'content-range': `bytes 1024-${body.length - 1}/${body.length}`})
					res.end(body.subarray(1024))
				},
				async url => {
					const result = await downloadArtifactToCache({urls: [url], cacheRoot: cache, key: 'resumed', sha256: sha256(body), size: body.length})
					const copied = path.join(cache, 'copied.bin')
					await copyCachedArtifactToFile(cache, 'resumed', copied, {integrity: result.integrity, size: body.length})
					await expect(fs.readFile(copied)).resolves.toEqual(body)
				}
			)

			expect(ranges).toEqual([undefined, 'bytes=1024-'])
		} finally {
			await fs.rm(cache, {recursive: true, force: true})
		}
	})

	it('discards a stale partial when the server ignores Range and restarts from byte zero', async () => {
		const body = Buffer.from('b'.repeat(4096))
		const cache = await cacheRoot()
		const ranges: Array<string | undefined> = []

		try {
			await withServer(
				(req, res) => {
					ranges.push(req.headers.range)

					if (!req.headers.range) {
						res.writeHead(200, {'content-length': String(body.length)})
						res.write(body.subarray(0, 1024))
						setImmediate(() => res.destroy())
						return
					}

					res.writeHead(200, {'content-length': String(body.length)})
					res.end(body)
				},
				async url => {
					const result = await downloadArtifactToCache({urls: [url], cacheRoot: cache, key: 'fresh-restart', sha256: sha256(body), size: body.length})
					expect(result.size).toBe(body.length)
				}
			)

			expect(ranges).toEqual([undefined, 'bytes=1024-'])
		} finally {
			await fs.rm(cache, {recursive: true, force: true})
		}
	})

	it('stops retrying repeated partial stream failures at the configured cap', async () => {
		const body = Buffer.from('c'.repeat(4096))
		const cache = await cacheRoot()
		let requests = 0

		try {
			await withServer(
				(_req, res) => {
					requests++
					res.writeHead(200, {'content-length': String(body.length)})
					res.write(body.subarray(0, 1))
					setImmediate(() => res.destroy())
				},
				async url => {
					await expect(downloadArtifactToCache({urls: [url], cacheRoot: cache, key: 'retry-cap', sha256: sha256(body), size: body.length, partialRetryLimit: 2})).rejects.toThrow()
				}
			)

			expect(requests).toBe(3)
			await expect(cacache.get.info(cache, 'retry-cap')).resolves.toBeNull()
		} finally {
			await fs.rm(cache, {recursive: true, force: true})
		}
	})

	it('cancels artifact downloads without inserting a cache entry', async () => {
		const body = Buffer.from('d'.repeat(4096))
		const cache = await cacheRoot()
		const controller = new AbortController()

		try {
			await withServer(
				(_req, res) => {
					res.writeHead(200, {'content-length': String(body.length)})
					const interval = setInterval(() => {
						res.write(body.subarray(0, 64))
					}, 10)
					res.on('close', () => clearInterval(interval))
					setTimeout(() => controller.abort(new Error('test abort')), 25)
				},
				async url => {
					await expect(downloadArtifactToCache({urls: [url], cacheRoot: cache, key: 'cancelled', sha256: sha256(body), size: body.length, signal: controller.signal})).rejects.toThrow()
					await expect(cacache.get.info(cache, 'cancelled')).resolves.toBeNull()
				}
			)
		} finally {
			await fs.rm(cache, {recursive: true, force: true})
		}
	})
})
