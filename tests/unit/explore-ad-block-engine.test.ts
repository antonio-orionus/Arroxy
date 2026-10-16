// @vitest-environment node
import {mkdtempSync, rmSync} from 'node:fs'
import {mkdir, readFile, stat, utimes, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {dirname, join} from 'node:path'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import type {Session} from 'electron'
import log from 'electron-log/main.js'
import {ElectronBlocker} from '@ghostery/adblocker-electron'
import {loadFilterListEngine, loadPrebuiltEngine, refreshPrebuiltEngine} from '@main/services/explore/exploreAdBlockEngine.js'

vi.mock('electron', () => ({ipcMain: {handle: vi.fn(), removeHandler: vi.fn()}}))

// P2-R36: the prebuilt ads + tracking engine is fetched through the Explore
// session (so its proxy applies), cached in userData and refreshed about
// weekly. No lists and no cache means no engine: the blocker is unavailable.

const DAY_MS = 24 * 60 * 60 * 1000
const LIST = '||ads.example^'

let dir = ''
let cachePath = ''

function fakeSession(answer: (url: string) => Promise<Response>) {
	const fetch = vi.fn(answer)
	const whenReady = vi.fn((): Promise<void> => Promise.resolve())
	const ses = {fetch} as unknown as Session
	return {fetch, whenReady, session: {getSession: () => ses, whenReady}}
}

const lists = (url: string): Promise<Response> => Promise.resolve(new Response(url.endsWith('resources.json') ? '{}' : LIST))
const offline = (): Promise<Response> => Promise.reject(new Error('net::ERR_INTERNET_DISCONNECTED'))

async function writeCache(ageDays: number): Promise<void> {
	await mkdir(dirname(cachePath), {recursive: true})
	await writeFile(cachePath, ElectronBlocker.parse(LIST).serialize())
	const when = new Date(Date.now() - ageDays * DAY_MS)
	await utimes(cachePath, when, when)
}

function blocks(engine: ElectronBlocker | null): boolean {
	if (!engine) return false
	let answer: unknown
	engine.onBeforeRequest({id: 1, url: 'https://ads.example/x.js', resourceType: 'script', referrer: 'https://www.youtube.com/'} as Parameters<ElectronBlocker['onBeforeRequest']>[0], response => (answer = response))
	return JSON.stringify(answer) === JSON.stringify({cancel: true})
}

beforeEach(() => {
	dir = mkdtempSync(join(tmpdir(), 'arroxy-adblock-'))
	cachePath = join(dir, 'explore-adblock', 'engine.bin')
	vi.mocked(log.warn).mockClear()
})

afterEach(() => {
	rmSync(dir, {recursive: true, force: true})
	vi.unstubAllGlobals()
})

describe('loadPrebuiltEngine', () => {
	it('fetches the lists through the Explore session once its proxy is ready, never with the global fetch, and caches the engine', async () => {
		const globalFetch = vi.fn()
		vi.stubGlobal('fetch', globalFetch)
		const s = fakeSession(lists)

		const engine = await loadPrebuiltEngine({session: s.session, cachePath})

		expect(blocks(engine)).toBe(true)
		expect(s.whenReady).toHaveBeenCalled()
		expect(s.fetch).toHaveBeenCalledWith(expect.stringContaining('easyprivacy'), expect.anything())
		expect(globalFetch).not.toHaveBeenCalled()
		expect((await readFile(cachePath)).length).toBeGreaterThan(0)
	})

	it('uses a cache younger than a week without touching the network', async () => {
		await writeCache(2)
		const s = fakeSession(lists)

		const engine = await loadPrebuiltEngine({session: s.session, cachePath})

		expect(blocks(engine)).toBe(true)
		expect(s.fetch).not.toHaveBeenCalled()
		expect(s.whenReady).not.toHaveBeenCalled()
	})

	it('refreshes a cache older than a week', async () => {
		await writeCache(8)
		const before = (await stat(cachePath)).mtimeMs
		const s = fakeSession(lists)

		const engine = await loadPrebuiltEngine({session: s.session, cachePath})

		expect(blocks(engine)).toBe(true)
		expect(s.fetch).toHaveBeenCalled()
		expect((await stat(cachePath)).mtimeMs).toBeGreaterThan(before)
	})

	it('keeps using a stale cache when the refresh fails', async () => {
		await writeCache(30)
		const s = fakeSession(offline)

		expect(blocks(await loadPrebuiltEngine({session: s.session, cachePath}))).toBe(true)
	})

	it('a cache that does not deserialize is fetched again', async () => {
		await writeCache(1)
		await writeFile(cachePath, 'not an engine')
		const s = fakeSession(lists)

		expect(blocks(await loadPrebuiltEngine({session: s.session, cachePath}))).toBe(true)
		expect(s.fetch).toHaveBeenCalled()
	})

	it('with no lists and no cache there is no engine, and one warning says so', async () => {
		const s = fakeSession(offline)

		expect(await loadPrebuiltEngine({session: s.session, cachePath})).toBeNull()

		const warnings = vi.mocked(log.warn).mock.calls.filter(call => String(call[0]).includes('ad blocker'))
		expect(warnings).toHaveLength(1)
	})

	it('treats an HTTP error page as a failed fetch, not as a filter list', async () => {
		const s = fakeSession(() => Promise.resolve(new Response('<html>rate limited</html>', {status: 429})))

		expect(await loadPrebuiltEngine({session: s.session, cachePath})).toBeNull()
	})

	it('fetches nothing while the proxy setting is refused', async () => {
		const s = fakeSession(lists)
		s.whenReady.mockRejectedValue(new Error('Explore proxy setting is not a usable proxy URL'))

		expect(await loadPrebuiltEngine({session: s.session, cachePath})).toBeNull()
		expect(s.fetch).not.toHaveBeenCalled()
	})
})

// A long-running session: the blocker asks daily whether the lists are due.
describe('refreshPrebuiltEngine', () => {
	it('has nothing new while the cache is younger than a week, and fetches nothing', async () => {
		await writeCache(3)
		const s = fakeSession(lists)
		expect(await refreshPrebuiltEngine({session: s.session, cachePath})).toBeNull()
		expect(s.fetch).not.toHaveBeenCalled()
	})

	it('fetches fresh lists once the cache is over a week old, and caches them', async () => {
		await writeCache(8)
		const before = (await stat(cachePath)).mtimeMs
		const s = fakeSession(lists)

		expect(blocks(await refreshPrebuiltEngine({session: s.session, cachePath}))).toBe(true)
		expect(s.fetch).toHaveBeenCalled()
		expect((await stat(cachePath)).mtimeMs).toBeGreaterThan(before)
	})

	it('a failed refresh has nothing new (the engine in use stays)', async () => {
		await writeCache(8)
		expect(await refreshPrebuiltEngine({session: fakeSession(offline).session, cachePath})).toBeNull()
	})

	it('with no cache at all, fetches', async () => {
		const s = fakeSession(lists)
		expect(blocks(await refreshPrebuiltEngine({session: s.session, cachePath}))).toBe(true)
	})
})

describe('loadFilterListEngine', () => {
	it('builds an engine from a filter list text, with no network', async () => {
		expect(blocks(await loadFilterListEngine(LIST))).toBe(true)
	})
})
