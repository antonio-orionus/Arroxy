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

		const engine = await loadPrebuiltEngine({session: s.session, cachePath, scriptletFreeDomains: []})

		expect(blocks(engine)).toBe(true)
		expect(s.whenReady).toHaveBeenCalled()
		expect(s.fetch).toHaveBeenCalledWith(expect.stringContaining('easyprivacy'), expect.anything())
		expect(globalFetch).not.toHaveBeenCalled()
		expect((await readFile(cachePath)).length).toBeGreaterThan(0)
	})

	it('uses a cache younger than a week without touching the network', async () => {
		await writeCache(2)
		const s = fakeSession(lists)

		const engine = await loadPrebuiltEngine({session: s.session, cachePath, scriptletFreeDomains: []})

		expect(blocks(engine)).toBe(true)
		expect(s.fetch).not.toHaveBeenCalled()
		expect(s.whenReady).not.toHaveBeenCalled()
	})

	it('refreshes a cache older than a week', async () => {
		await writeCache(8)
		const before = (await stat(cachePath)).mtimeMs
		const s = fakeSession(lists)

		const engine = await loadPrebuiltEngine({session: s.session, cachePath, scriptletFreeDomains: []})

		expect(blocks(engine)).toBe(true)
		expect(s.fetch).toHaveBeenCalled()
		expect((await stat(cachePath)).mtimeMs).toBeGreaterThan(before)
	})

	it('keeps using a stale cache when the refresh fails', async () => {
		await writeCache(30)
		const s = fakeSession(offline)

		expect(blocks(await loadPrebuiltEngine({session: s.session, cachePath, scriptletFreeDomains: []}))).toBe(true)
	})

	it('a cache that does not deserialize is fetched again', async () => {
		await writeCache(1)
		await writeFile(cachePath, 'not an engine')
		const s = fakeSession(lists)

		expect(blocks(await loadPrebuiltEngine({session: s.session, cachePath, scriptletFreeDomains: []}))).toBe(true)
		expect(s.fetch).toHaveBeenCalled()
	})

	it('with no lists and no cache there is no engine, and one warning says so', async () => {
		const s = fakeSession(offline)

		expect(await loadPrebuiltEngine({session: s.session, cachePath, scriptletFreeDomains: []})).toBeNull()

		const warnings = vi.mocked(log.warn).mock.calls.filter(call => String(call[0]).includes('ad blocker'))
		expect(warnings).toHaveLength(1)
	})

	it('treats an HTTP error page as a failed fetch, not as a filter list', async () => {
		const s = fakeSession(() => Promise.resolve(new Response('<html>rate limited</html>', {status: 429})))

		expect(await loadPrebuiltEngine({session: s.session, cachePath, scriptletFreeDomains: []})).toBeNull()
	})

	it('fetches nothing while the proxy setting is refused', async () => {
		const s = fakeSession(lists)
		s.whenReady.mockRejectedValue(new Error('Explore proxy setting is not a usable proxy URL'))

		expect(await loadPrebuiltEngine({session: s.session, cachePath, scriptletFreeDomains: []})).toBeNull()
		expect(s.fetch).not.toHaveBeenCalled()
	})
})

// A long-running session: the blocker asks daily whether the lists are due.
describe('refreshPrebuiltEngine', () => {
	it('has nothing new while the cache is younger than a week, and fetches nothing', async () => {
		await writeCache(3)
		const s = fakeSession(lists)
		expect(await refreshPrebuiltEngine({session: s.session, cachePath, scriptletFreeDomains: []})).toBeNull()
		expect(s.fetch).not.toHaveBeenCalled()
	})

	it('fetches fresh lists once the cache is over a week old, and caches them', async () => {
		await writeCache(8)
		const before = (await stat(cachePath)).mtimeMs
		const s = fakeSession(lists)

		expect(blocks(await refreshPrebuiltEngine({session: s.session, cachePath, scriptletFreeDomains: []}))).toBe(true)
		expect(s.fetch).toHaveBeenCalled()
		expect((await stat(cachePath)).mtimeMs).toBeGreaterThan(before)
	})

	it('a failed refresh has nothing new (the engine in use stays)', async () => {
		await writeCache(8)
		expect(await refreshPrebuiltEngine({session: fakeSession(offline).session, cachePath, scriptletFreeDomains: []})).toBeNull()
	})

	it('with no cache at all, fetches', async () => {
		const s = fakeSession(lists)
		expect(blocks(await refreshPrebuiltEngine({session: s.session, cachePath, scriptletFreeDomains: []}))).toBe(true)
	})
})

describe('loadFilterListEngine', () => {
	it('builds an engine from a filter list text, with no network', async () => {
		expect(blocks(await loadFilterListEngine(LIST, []))).toBe(true)
	})
})

// YouTube drops the view count and upload date from every result and grid
// once its page has run the lists' YouTube scriptlets (seen in Explore,
// 2026-10: after one watch page, search results show only title, channel and
// badges). Its domains run no scriptlet; their cosmetic and network filters stay.
describe('scriptlet-free domains', () => {
	const SCRIPTLET_LIST = ['||ads.example^', 'youtube.com,example.com##+js(noop)', 'youtube.com##.ad-slot'].join('\n')
	const RESOURCES = JSON.stringify({scriptlets: [{name: 'noop.js', aliases: ['noop'], body: 'function noop() {}', dependencies: []}], redirects: []})
	const withScriptlets = (url: string): Promise<Response> => Promise.resolve(new Response(url.endsWith('resources.json') ? RESOURCES : SCRIPTLET_LIST))

	function cosmetics(engine: ElectronBlocker | null, hostname: string) {
		if (!engine) throw new Error('no engine')
		const domain = hostname.split('.').slice(-2).join('.')
		const {scripts, styles} = engine.getCosmeticsFilters({url: `https://${hostname}/results?search_query=x`, hostname, domain})
		return {scripts: scripts.length, hidesAdSlot: styles.includes('.ad-slot')}
	}

	async function prebuiltEngines(): Promise<Array<[string, ElectronBlocker | null]>> {
		const deps = (session: ReturnType<typeof fakeSession>['session']) => ({session, cachePath, scriptletFreeDomains: ['youtube.com']})
		const fetched = await loadPrebuiltEngine(deps(fakeSession(withScriptlets).session))
		const cached = await loadPrebuiltEngine(deps(fakeSession(offline).session))
		const old = new Date(Date.now() - 30 * DAY_MS)
		await utimes(cachePath, old, old)
		const stale = await loadPrebuiltEngine(deps(fakeSession(offline).session))
		const refreshed = await refreshPrebuiltEngine(deps(fakeSession(withScriptlets).session))
		return [
			['fetched', fetched],
			['cached', cached],
			['stale', stale],
			['refreshed', refreshed]
		]
	}

	// A list text brings no scriptlet resources; the test gives it the same ones.
	async function filterListEngine(scriptletFreeDomains: readonly string[]): Promise<ElectronBlocker> {
		const engine = await loadFilterListEngine(SCRIPTLET_LIST, scriptletFreeDomains)
		engine.updateResources(RESOURCES, 'test')
		return engine
	}

	it('runs no scriptlet on a scriptlet-free domain or its subdomains, whichever way the engine was had', async () => {
		const engines: Array<[string, ElectronBlocker | null]> = [...(await prebuiltEngines()), ['filter list', await filterListEngine(['youtube.com'])]]
		for (const [how, engine] of engines) {
			for (const host of ['www.youtube.com', 'm.youtube.com', 'youtube.com']) expect({how, host, ...cosmetics(engine, host)}).toEqual({how, host, scripts: 0, hidesAdSlot: true})
			expect({how, runsScriptlets: cosmetics(engine, 'www.example.com').scripts > 0}).toEqual({how, runsScriptlets: true})
			expect({how, blocks: blocks(engine)}).toEqual({how, blocks: true})
		}
	})

	it('leaves every domain its scriptlets when none is scriptlet-free', async () => {
		expect(cosmetics(await filterListEngine([]), 'www.youtube.com').scripts).toBe(1)
	})
})
