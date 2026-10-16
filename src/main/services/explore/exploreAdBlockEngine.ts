import {mkdir, readFile, stat, writeFile} from 'node:fs/promises'
import {dirname} from 'node:path'
import type {ElectronBlocker} from '@ghostery/adblocker-electron'
import log from 'electron-log/main.js'
import type {ExploreSessionService} from '../ExploreSessionService.js'

const logger = log.scope('explore-adblock')

// The prebuilt lists move about weekly; an older cache is fetched again.
const REFRESH_AFTER_MS = 7 * 24 * 60 * 60 * 1000
const FETCH_TIMEOUT_MS = 30_000
const SECURITY_WARNINGS_FLAG = 'ELECTRON_DISABLE_SECURITY_WARNINGS'

type Blocker = typeof ElectronBlocker
type ListFetch = NonNullable<Parameters<Blocker['fromPrebuiltAdsAndTracking']>[0]>
type Caching = NonNullable<Parameters<Blocker['fromPrebuiltAdsAndTracking']>[1]>

// Loaded on first use only, so a user who never turns the blocker on never
// runs it. The library's module sets ELECTRON_DISABLE_SECURITY_WARNINGS in
// process.env when it loads (which yt-dlp spawns would inherit); it is put back.
async function importBlocker(): Promise<Blocker> {
	const before = process.env[SECURITY_WARNINGS_FLAG]
	try {
		return (await import('@ghostery/adblocker-electron')).ElectronBlocker
	} finally {
		if (before === undefined) Reflect.deleteProperty(process.env, SECURITY_WARNINGS_FLAG)
		else process.env[SECURITY_WARNINGS_FLAG] = before
	}
}

export interface PrebuiltEngineDeps {
	session: Pick<ExploreSessionService, 'getSession' | 'whenReady'>
	cachePath: string
}

// Through the Explore session, never Node's fetch: the user's proxy applies,
// and nothing goes out until it is in effect (a refused setting fetches
// nothing). An error status is a failure, not a filter list.
function sessionFetch(session: PrebuiltEngineDeps['session']): ListFetch {
	return async url => {
		await session.whenReady()
		const response = await session.getSession().fetch(url, {signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)})
		if (!response.ok) throw new Error(`filter list request answered HTTP ${response.status}`)
		return response
	}
}

// Whether the cached lists are over a week old (or missing).
async function isDue(path: string): Promise<boolean> {
	try {
		return Date.now() - (await stat(path)).mtimeMs > REFRESH_AFTER_MS
	} catch {
		return true
	}
}

// The library's cache option, made to expire: a cache older than a week reads
// as missing, so the library fetches and writes a fresh one. A failed write
// keeps the engine just built.
function weeklyCache(path: string): Caching {
	return {
		path,
		read: async file => {
			if (await isDue(file)) throw new Error('cached engine is over a week old')
			return readFile(file)
		},
		write: async (file, engine) => {
			try {
				await mkdir(dirname(file), {recursive: true})
				await writeFile(file, engine)
			} catch (err) {
				logger.warn('explore ad blocker could not cache its engine', {error: err instanceof Error ? err.name : 'unknown'})
			}
		}
	}
}

async function readStale(blocker: Blocker, path: string): Promise<ElectronBlocker | null> {
	try {
		return blocker.deserialize(await readFile(path))
	} catch {
		return null
	}
}

// The prebuilt ads + tracking engine: from a cache younger than a week, else
// fetched. A failed fetch falls back to an older cache; with none, there is no
// engine (null) and nothing is blocked.
export async function loadPrebuiltEngine(deps: PrebuiltEngineDeps): Promise<ElectronBlocker | null> {
	const blocker = await importBlocker()
	try {
		return await blocker.fromPrebuiltAdsAndTracking(sessionFetch(deps.session), weeklyCache(deps.cachePath))
	} catch (err) {
		const stale = await readStale(blocker, deps.cachePath)
		const error = err instanceof Error ? err.message : String(err)
		if (stale) logger.warn('explore ad blocker could not refresh its filter lists; using the cached ones', {error})
		else logger.warn('explore ad blocker unavailable: its filter lists could not be fetched and none are cached', {error})
		return stale
	}
}

// A long-running session's refresh: a fresh engine once the cached lists are
// over a week old, else null. A failed fetch is null too: the engine in use stays.
export async function refreshPrebuiltEngine(deps: PrebuiltEngineDeps): Promise<ElectronBlocker | null> {
	if (!(await isDue(deps.cachePath))) return null
	const blocker = await importBlocker()
	const cache = weeklyCache(deps.cachePath)
	try {
		// Due by now, so the cache read is skipped: fetch, then write.
		return await blocker.fromPrebuiltAdsAndTracking(sessionFetch(deps.session), {...cache, read: () => Promise.reject(new Error('refreshing'))})
	} catch (err) {
		logger.warn('explore ad blocker could not refresh its filter lists; keeping the ones in use', {error: err instanceof Error ? err.message : String(err)})
		return null
	}
}

// An engine from a filter list's text, with no network: the E2E harness's seed.
export async function loadFilterListEngine(filters: string): Promise<ElectronBlocker> {
	return (await importBlocker()).parse(filters)
}
