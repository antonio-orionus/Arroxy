import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {afterEach, describe, expect, it, vi} from 'vitest'

const tempDirs: string[] = []

afterEach(async () => {
	vi.unstubAllGlobals()
	await Promise.all(tempDirs.splice(0).map(dir => fs.rm(dir, {recursive: true, force: true})))
})

async function tempDir(): Promise<string> {
	const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'arroxy-fetch-embedded-host-'))
	tempDirs.push(dir)
	return dir
}

describe('fetch embedded host network helpers', () => {
	it('passes a timeout signal when fetching text', async () => {
		const mod = (await import('../../scripts/build/fetchEmbeddedHost.js')) as {fetchText?: (url: string) => Promise<string>}
		const fetchMock = vi.fn<typeof fetch>(async () => new Response('ok'))
		vi.stubGlobal('fetch', fetchMock)

		expect(typeof mod.fetchText).toBe('function')
		await expect(mod.fetchText?.('https://example.invalid/checksums.sha256')).resolves.toBe('ok')
		expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({signal: expect.any(AbortSignal)})
	})

	it('passes a timeout signal when downloading an archive', async () => {
		const mod = (await import('../../scripts/build/fetchEmbeddedHost.js')) as {downloadFile?: (url: string, destination: string) => Promise<void>}
		const fetchMock = vi.fn<typeof fetch>(async () => new Response('archive'))
		vi.stubGlobal('fetch', fetchMock)
		const dir = await tempDir()
		const destination = path.join(dir, 'archive.zip')

		expect(typeof mod.downloadFile).toBe('function')
		await expect(mod.downloadFile?.('https://example.invalid/archive.zip', destination)).resolves.toBeUndefined()
		expect(await fs.readFile(destination, 'utf8')).toBe('archive')
		expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({signal: expect.any(AbortSignal)})
	})
})
