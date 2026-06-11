import fs from 'node:fs/promises'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import {describe, expect, it} from 'vitest'
import {DownloadStalledError, classifyDownloadError, downloadFile} from '@main/services/binary/BinaryDownloader.js'

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
})
