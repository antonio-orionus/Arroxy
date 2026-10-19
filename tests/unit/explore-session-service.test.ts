// @vitest-environment node
import {chmodSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync} from 'node:fs'
import {dirname, join} from 'node:path'
import {afterAll, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import log from 'electron-log/main.js'
import type {ExploreCookieScope} from '@shared/sites/exploreCookieScope.js'
import type {ExploreCookie} from '@shared/sites/types.js'

const YOUTUBE: ExploreCookieScope = {kind: 'site', siteId: 'youtube'}
const VIMEO: ExploreCookieScope = {kind: 'web', host: 'vimeo.com'}

const {DEFAULT_UA, userData, fakeSession, partitions, windows, FakeBrowserWindow} = await vi.hoisted(async () => {
	const fs = await import('node:fs')
	const os = await import('node:os')
	const path = await import('node:path')
	const {EventEmitter} = await import('node:events')
	// A hidden window whose page the test drives: `script` decides what loadURL does.
	class FakeBrowserWindow {
		static script: (win: FakeBrowserWindow) => Promise<void> = () => Promise.resolve()
		readonly webContents = Object.assign(new EventEmitter(), {
			url: '',
			loadURL: vi.fn((url: string) => {
				this.webContents.url = url
				return FakeBrowserWindow.script(this)
			}),
			getURL: vi.fn(() => this.webContents.url),
			executeJavaScript: vi.fn((_code: string): Promise<unknown> => Promise.resolve(true)),
			setWindowOpenHandler: vi.fn(),
			setAudioMuted: vi.fn()
		})
		destroyed = false
		readonly destroy = vi.fn(() => {
			this.destroyed = true
		})
		readonly isDestroyed = (): boolean => this.destroyed
		constructor(readonly options: unknown) {
			windows.push(this)
		}
	}
	const windows: FakeBrowserWindow[] = []
	return {
		FakeBrowserWindow,
		windows,
		DEFAULT_UA: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Electron/43.7.7 Arroxy/0.4.25 Safari/537.36',
		userData: fs.mkdtempSync(path.join(os.tmpdir(), 'arroxy-explore-svc-')),
		partitions: [] as string[],
		fakeSession: {cookies: {get: vi.fn(), set: vi.fn()}, setUserAgent: vi.fn(), setProxy: vi.fn(), setPermissionRequestHandler: vi.fn(), setPermissionCheckHandler: vi.fn(), on: vi.fn(), clearStorageData: vi.fn(), closeAllConnections: vi.fn()}
	}
})

vi.mock('electron', () => ({
	BrowserWindow: FakeBrowserWindow,
	app: {getPath: () => userData, userAgentFallback: DEFAULT_UA, getName: () => 'Arroxy'},
	session: {
		fromPartition: vi.fn((partition: string) => {
			partitions.push(partition)
			return fakeSession
		})
	}
}))

vi.mock('node:fs/promises', async importOriginal => {
	const actual = await importOriginal<typeof import('node:fs/promises')>()
	return {...actual, rm: vi.fn(actual.rm), writeFile: vi.fn(actual.writeFile)}
})

import {rm, writeFile} from 'node:fs/promises'
import {app} from 'electron'
import {ExploreSessionService, EXPLORE_PARTITION, type ExploreSessionSettings} from '@main/services/ExploreSessionService.js'

const jarDir = join(userData, 'explore-jars')

function cookie(overrides: Partial<ExploreCookie> & Pick<ExploreCookie, 'name'>): ExploreCookie {
	return {value: 'v', domain: '.youtube.com', hostOnly: false, path: '/', secure: true, httpOnly: false, session: false, expirationDate: 2_000_000_000, ...overrides}
}

function makeService(settings: ExploreSessionSettings = {uaToken: undefined, proxyUrl: undefined}): ExploreSessionService {
	return new ExploreSessionService(() => settings)
}

function listenerFor(event: string): ((...args: unknown[]) => void) | undefined {
	return fakeSession.on.mock.calls.find(call => call[0] === event)?.[1]
}

beforeEach(async () => {
	vi.clearAllMocks()
	vi.mocked(rm).mockImplementation((await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises')).rm)
	vi.mocked(writeFile).mockImplementation((await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises')).writeFile)
	partitions.length = 0
	windows.length = 0
	FakeBrowserWindow.script = finishLoading
	rmSync(jarDir, {recursive: true, force: true})
	fakeSession.cookies.get.mockResolvedValue([])
	fakeSession.cookies.set.mockResolvedValue(undefined)
	fakeSession.setProxy.mockResolvedValue(undefined)
	fakeSession.clearStorageData.mockResolvedValue(undefined)
	fakeSession.closeAllConnections.mockResolvedValue(undefined)
})

afterAll(() => rmSync(userData, {recursive: true, force: true}))

type FakeWindow = InstanceType<typeof FakeBrowserWindow>

// A normal page load: the main frame finishes on the requested URL.
function finishLoading(win: FakeWindow): Promise<void> {
	queueMicrotask(() => win.webContents.emit('did-finish-load'))
	return Promise.resolve()
}

describe('ExploreSessionService session', () => {
	it('uses the persistent explore partition with the bland UA', () => {
		const service = makeService()
		service.getSession()
		expect(partitions).toEqual([EXPLORE_PARTITION])
		expect(EXPLORE_PARTITION).toBe('persist:arroxy-explore')
		const ua = fakeSession.setUserAgent.mock.calls[0][0] as string
		expect(ua).toContain('Desktop/1.0')
		expect(ua).not.toMatch(/Electron\/|Arroxy\//)
		expect(service.getUserAgent()).toBe(ua)
	})

	it('falls back to Desktop/1.0 when the configured token is invalid', () => {
		makeService({uaToken: 'Chrome/150', proxyUrl: undefined}).getSession()
		expect(fakeSession.setUserAgent.mock.calls[0][0]).toContain('Desktop/1.0')
	})

	it('uses a valid configured token', () => {
		makeService({uaToken: 'WebView/2', proxyUrl: undefined}).getSession()
		expect(fakeSession.setUserAgent.mock.calls[0][0]).toContain('WebView/2')
	})

	// Out-of-process frames (a cross-site iframe such as Cloudflare's challenge)
	// start from the app-wide default, not the session's UA: unless the two
	// match, the challenge passes under one UA and the page asks again under the other.
	it('makes the session UA the default every renderer starts with', () => {
		makeService().getSession()
		expect(app.userAgentFallback).toBe(fakeSession.setUserAgent.mock.calls[0][0])
	})

	it('derives each UA from Electron default, never from a bland one it set', () => {
		const settings: ExploreSessionSettings = {uaToken: 'WebView/2', proxyUrl: undefined}
		const service = makeService(settings)
		service.getSession()
		settings.uaToken = undefined
		service.getSession()
		const ua = fakeSession.setUserAgent.mock.calls[1][0] as string
		expect(ua).toBe(DEFAULT_UA.replace(' Electron/43.7.7 Arroxy/0.4.25 Safari/', ' Desktop/1.0 Safari/'))
		expect(app.userAgentFallback).toBe(ua)
	})

	it('configures the partition once', () => {
		const service = makeService()
		service.getSession()
		service.getSession()
		expect(fakeSession.setUserAgent).toHaveBeenCalledTimes(1)
	})

	it('denies every permission request and check by default', () => {
		makeService().getSession()
		const request = fakeSession.setPermissionRequestHandler.mock.calls[0][0] as (wc: unknown, permission: string, cb: (granted: boolean) => void) => void
		const callback = vi.fn()
		request({}, 'media', callback)
		expect(callback).toHaveBeenCalledWith(false)
		const check = fakeSession.setPermissionCheckHandler.mock.calls[0][0] as () => boolean
		expect(check()).toBe(false)
	})

	it('cancels downloads started inside the view', () => {
		makeService().getSession()
		const item = {cancel: vi.fn()}
		listenerFor('will-download')?.({}, item)
		expect(item.cancel).toHaveBeenCalled()
	})

	it('applies the configured proxy to the partition', async () => {
		makeService({uaToken: undefined, proxyUrl: 'http://10.0.0.1:3128'}).getSession()
		await vi.waitFor(() => expect(fakeSession.setProxy).toHaveBeenCalledWith({proxyRules: 'http://10.0.0.1:3128'}))
	})

	it('uses the system proxy when none is configured', async () => {
		makeService().getSession()
		await vi.waitFor(() => expect(fakeSession.setProxy).toHaveBeenCalledWith({mode: 'system'}))
	})

	it('signs out by clearing the partition storage', async () => {
		await makeService().signOut()
		expect(fakeSession.clearStorageData).toHaveBeenCalled()
	})
})

describe('ExploreSessionService cookies', () => {
	it('reports presence of auth cookies via the site rule', async () => {
		fakeSession.cookies.get.mockResolvedValue([cookie({name: 'LOGIN_INFO'}), cookie({name: 'SAPISID'})])
		expect(await makeService().hasAuthCookies(YOUTUBE)).toBe(true)
		fakeSession.cookies.get.mockResolvedValue([cookie({name: 'LOGIN_INFO', domain: '.google.com'}), cookie({name: 'SAPISID', domain: '.google.com'})])
		expect(await makeService().hasAuthCookies(YOUTUBE)).toBe(false)
	})

	it('reports another site signed in when the session holds a cookie it would be sent', async () => {
		fakeSession.cookies.get.mockResolvedValue([cookie({name: 'LOGIN_INFO'}), cookie({name: 'SAPISID'})])
		expect(await makeService().hasAuthCookies(VIMEO)).toBe(false)
		fakeSession.cookies.get.mockResolvedValue([cookie({name: 'vuid', domain: '.vimeo.com'})])
		expect(await makeService().hasAuthCookies(VIMEO)).toBe(true)
	})

	it('maps Electron cookies defensively and keeps only the site domains', async () => {
		fakeSession.cookies.get.mockResolvedValue([
			{name: 'a', value: '1', domain: '.youtube.com'},
			{name: 'b', value: '2', domain: 'accounts.google.com'},
			{name: 'c', value: '3'}
		])
		expect(await makeService().readCookies(YOUTUBE)).toEqual([{name: 'a', value: '1', domain: '.youtube.com', hostOnly: false, path: '/', secure: false, httpOnly: false, session: false}])
	})

	it('reads every cookie but the Google and YouTube account cookies for another site', async () => {
		fakeSession.cookies.get.mockResolvedValue([
			{name: 'a', value: '1', domain: '.youtube.com'},
			{name: 'b', value: '2', domain: 'accounts.google.com'},
			{name: 'c', value: '3', domain: '.vimeo.com'},
			{name: 'd', value: '4', domain: '.vimeocdn.com'}
		])
		expect((await makeService().readCookies(VIMEO)).map(c => c.name)).toEqual(['c', 'd'])
	})

	it('seeds fixture cookies into the partition', async () => {
		await makeService().seedForE2e([cookie({name: 'SAPISID', domain: '.youtube.com'}), cookie({name: 'host', domain: 'www.youtube.com', hostOnly: true, session: true, expirationDate: undefined})])
		expect(fakeSession.cookies.set).toHaveBeenNthCalledWith(1, expect.objectContaining({url: 'https://youtube.com/', name: 'SAPISID', domain: '.youtube.com', path: '/'}))
		const second = fakeSession.cookies.set.mock.calls[1][0] as Record<string, unknown>
		expect(second).toMatchObject({url: 'https://www.youtube.com/', name: 'host'})
		expect(second.domain).toBeUndefined()
		expect(second).not.toHaveProperty('expirationDate')
	})
})

describe('ExploreSessionService readiness', () => {
	it('whenReady resolves only after setProxy resolves', async () => {
		let release: () => void = () => undefined
		fakeSession.setProxy.mockImplementation(() => new Promise<void>(resolve => (release = resolve)))
		const service = makeService({uaToken: undefined, proxyUrl: 'http://10.0.0.1:3128'})
		let settled = false
		const ready = service.whenReady().then(() => (settled = true))
		await new Promise(resolve => setTimeout(resolve, 10))
		expect(settled).toBe(false)
		release()
		await ready
		expect(settled).toBe(true)
	})

	it('whenReady rejects when setProxy rejects (fail closed)', async () => {
		fakeSession.setProxy.mockRejectedValue(new Error('proxy broke'))
		await expect(makeService().whenReady()).rejects.toThrow('proxy broke')
	})

	it('fails closed on an invalid proxy setting: whenReady rejects and the proxy is never touched (R23)', async () => {
		const service = makeService({uaToken: undefined, proxyUrl: 'ftp://10.0.0.1:21'})
		await expect(service.whenReady()).rejects.toThrow(/proxy/i)
		await expect(service.whenReady()).rejects.toThrow(/proxy/i)
		expect(fakeSession.setProxy).not.toHaveBeenCalled()
	})

	it('recovers once an invalid proxy setting is fixed', async () => {
		const settings: ExploreSessionSettings = {uaToken: undefined, proxyUrl: 'ftp://10.0.0.1:21'}
		const service = makeService(settings)
		await expect(service.whenReady()).rejects.toThrow()
		settings.proxyUrl = 'http://10.0.0.1:3128'
		await expect(service.whenReady()).resolves.toBeUndefined()
		expect(fakeSession.setProxy).toHaveBeenCalledWith({proxyRules: 'http://10.0.0.1:3128'})
	})

	it('an empty or blank proxy setting still means the system proxy', async () => {
		await expect(makeService({uaToken: undefined, proxyUrl: '   '}).whenReady()).resolves.toBeUndefined()
		expect(fakeSession.setProxy).toHaveBeenCalledWith({mode: 'system'})
	})

	it('retries the proxy on the next request after a failure', async () => {
		fakeSession.setProxy.mockRejectedValueOnce(new Error('proxy broke'))
		const service = makeService()
		await expect(service.whenReady()).rejects.toThrow()
		await expect(service.whenReady()).resolves.toBeUndefined()
		expect(fakeSession.setProxy).toHaveBeenCalledTimes(2)
	})

	it('has the deny handlers installed before the UA or proxy are touched', async () => {
		const order: string[] = []
		fakeSession.setPermissionRequestHandler.mockImplementation(() => order.push('request'))
		fakeSession.setPermissionCheckHandler.mockImplementation(() => order.push('check'))
		fakeSession.on.mockImplementation(() => order.push('download'))
		fakeSession.setUserAgent.mockImplementation(() => order.push('ua'))
		fakeSession.setProxy.mockImplementation(async () => order.push('proxy'))
		await makeService().whenReady()
		expect(order.slice(0, 3).sort()).toEqual(['check', 'download', 'request'])
		expect(order.indexOf('ua')).toBeGreaterThanOrEqual(3)
		expect(order.indexOf('proxy')).toBeGreaterThanOrEqual(3)
	})
})

describe('ExploreSessionService live settings', () => {
	it('re-applies the UA when the token changes', () => {
		const settings: ExploreSessionSettings = {uaToken: undefined, proxyUrl: undefined}
		const service = makeService(settings)
		service.getSession()
		settings.uaToken = 'WebView/2'
		service.getSession()
		expect(fakeSession.setUserAgent).toHaveBeenCalledTimes(2)
		expect(fakeSession.setUserAgent.mock.calls[1][0]).toContain('WebView/2')
	})

	it('re-applies the proxy and drops pooled connections when the proxy changes', async () => {
		const settings: ExploreSessionSettings = {uaToken: undefined, proxyUrl: undefined}
		const service = makeService(settings)
		await service.whenReady()
		expect(fakeSession.closeAllConnections).not.toHaveBeenCalled()
		settings.proxyUrl = 'http://10.0.0.1:3128'
		await service.whenReady()
		expect(fakeSession.setProxy).toHaveBeenCalledTimes(2)
		expect(fakeSession.setProxy).toHaveBeenLastCalledWith({proxyRules: 'http://10.0.0.1:3128'})
		expect(fakeSession.closeAllConnections).toHaveBeenCalledTimes(1)
	})

	it('re-applies nothing when the settings are unchanged', async () => {
		const service = makeService({uaToken: 'WebView/2', proxyUrl: 'http://10.0.0.1:3128'})
		await service.whenReady()
		service.getSession()
		await service.whenReady()
		expect(fakeSession.setUserAgent).toHaveBeenCalledTimes(1)
		expect(fakeSession.setProxy).toHaveBeenCalledTimes(1)
		expect(fakeSession.closeAllConnections).not.toHaveBeenCalled()
		expect(fakeSession.setPermissionRequestHandler).toHaveBeenCalledTimes(1)
	})
})

describe('ExploreSessionService jars', () => {
	it.skipIf(process.platform === 'win32')('writes a 0600 youtube-only jar inside a 0700 dir and deletes it after fn resolves', async () => {
		fakeSession.cookies.get.mockResolvedValue([cookie({name: 'SAPISID'}), cookie({name: 'NID', domain: '.google.com'})])
		const seen: string[] = []
		await makeService().withJar(YOUTUBE, async path => {
			seen.push(readFileSync(path, 'utf8'))
			expect(statSync(path).mode & 0o777).toBe(0o600)
			expect(statSync(dirname(path)).mode & 0o777).toBe(0o700)
		})
		expect(seen[0]).toContain('SAPISID')
		expect(seen[0]).not.toContain('google.com')
		expect(readdirSync(jarDir)).toEqual([])
	})

	it.skipIf(process.platform === 'win32')('tightens a jar dir that already exists with a looser mode', async () => {
		mkdirSync(jarDir, {recursive: true})
		chmodSync(jarDir, 0o755)
		await makeService().withJar(YOUTUBE, async () => undefined)
		expect(statSync(jarDir).mode & 0o777).toBe(0o700)
	})

	it('returns what fn returns', async () => {
		await expect(makeService().withJar(YOUTUBE, async () => 42)).resolves.toBe(42)
	})

	it('deletes the jar when fn throws', async () => {
		await expect(
			makeService().withJar(YOUTUBE, async () => {
				throw new Error('boom')
			})
		).rejects.toThrow('boom')
		expect(readdirSync(jarDir)).toEqual([])
	})

	it('gives concurrent calls separate jars', async () => {
		const service = makeService()
		const paths: string[] = []
		// Neither call may finish before both are inside fn, or the first one's jar is already gone.
		let bothInside!: () => void
		const barrier = new Promise<void>(resolve => (bothInside = resolve))
		const enter = async (path: string): Promise<void> => {
			paths.push(path)
			if (paths.length === 2) bothInside()
			await barrier
		}
		await Promise.all([
			service.withJar(YOUTUBE, enter),
			service.withJar(YOUTUBE, async path => {
				await enter(path)
				expect(readdirSync(jarDir)).toHaveLength(2)
			})
		])
		expect(new Set(paths).size).toBe(2)
		expect(readdirSync(jarDir)).toEqual([])
	})

	// A2-7 / M4: a jar the first delete could not remove (a Windows lock) is retried once, and said so, without the path.
	describe('a jar the delete could not remove', () => {
		async function lockFirstDelete(): Promise<void> {
			const actualRm = (await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises')).rm
			vi.mocked(rm).mockImplementationOnce(async target => {
				throw Object.assign(new Error(`EBUSY: resource busy or locked, unlink '${String(target)}'`), {code: 'EBUSY'})
			})
			vi.mocked(rm).mockImplementation(actualRm)
		}

		function warned(): string {
			return JSON.stringify(vi.mocked(log.warn).mock.calls)
		}

		it('keeps what fn returned, logs the code and file name only, and deletes the jar on one delayed retry', async () => {
			await lockFirstDelete()
			vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout']})
			try {
				await expect(makeService().withJar(YOUTUBE, async () => 42)).resolves.toBe(42)
				expect(vi.mocked(log.warn)).toHaveBeenCalledWith('explore jar could not be deleted; retrying once', {code: 'EBUSY', jar: expect.stringMatching(/^[\w-]+\.txt$/)})
				expect(warned()).not.toContain(jarDir)
				expect(readdirSync(jarDir)).toHaveLength(1)

				await vi.advanceTimersByTimeAsync(5_000)
				await vi.waitFor(() => expect(readdirSync(jarDir)).toEqual([]))
			} finally {
				vi.useRealTimers()
			}
		})

		it('also covers a jar left half-written by a failed write, and still reports the write failure', async () => {
			await lockFirstDelete()
			vi.mocked(writeFile).mockImplementationOnce(async target => {
				if (typeof target !== 'string') throw new Error('expected a jar path')
				writeFileSync(target, '# partial')
				throw Object.assign(new Error('ENOSPC: no space left on device'), {code: 'ENOSPC'})
			})
			vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout']})
			try {
				await expect(makeService().withJar(YOUTUBE, async () => 42)).rejects.toThrow('ENOSPC')
				expect(vi.mocked(log.warn)).toHaveBeenCalledWith('explore jar could not be deleted; retrying once', expect.objectContaining({code: 'EBUSY'}))
				await vi.advanceTimersByTimeAsync(5_000)
				await vi.waitFor(() => expect(readdirSync(jarDir)).toEqual([]))
			} finally {
				vi.useRealTimers()
			}
		})
	})

	it("writes another site's jar without Google's or YouTube's account cookies", async () => {
		fakeSession.cookies.get.mockResolvedValue([cookie({name: 'SAPISID', domain: '.youtube.com'}), cookie({name: 'SID', domain: '.google.com'}), cookie({name: 'vuid', domain: '.vimeo.com'})])
		await makeService().withJar(VIMEO, async path => {
			const jar = readFileSync(path, 'utf8')
			expect(jar).toContain('\tvuid\t')
			expect(jar).not.toContain('SAPISID')
			expect(jar).not.toContain('\tSID\t')
		})
	})

	it('sweeps leftover jars at startup', async () => {
		mkdirSync(jarDir, {recursive: true})
		writeFileSync(join(jarDir, 'stale.txt'), 'x')
		await makeService().sweepJars()
		expect(readdirSync(jarDir)).toEqual([])
	})

	it('removes directory entries too', async () => {
		mkdirSync(join(jarDir, 'nested'), {recursive: true})
		writeFileSync(join(jarDir, 'nested', 'x.txt'), 'x')
		await makeService().sweepJars()
		expect(readdirSync(jarDir)).toEqual([])
	})

	it('never rejects when an entry cannot be removed, and still removes the others', async () => {
		mkdirSync(jarDir, {recursive: true})
		writeFileSync(join(jarDir, 'a-locked.txt'), 'x')
		writeFileSync(join(jarDir, 'b-stale.txt'), 'x')
		const actualRm = (await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises')).rm
		vi.mocked(rm).mockImplementation(async (target, options) => {
			if (String(target).endsWith('a-locked.txt')) throw Object.assign(new Error(`EPERM: operation not permitted, unlink '${String(target)}'`), {code: 'EPERM'})
			return actualRm(target, options)
		})
		await expect(makeService().sweepJars()).resolves.toBeUndefined()
		expect(readdirSync(jarDir)).toEqual(['a-locked.txt'])
		const logged = JSON.stringify([log.warn, log.error].flatMap(fn => vi.mocked(fn).mock.calls))
		expect(logged).toContain('EPERM')
		expect(logged).not.toContain(jarDir)
	})

	it('sweeps nothing when the jar dir does not exist', async () => {
		await expect(makeService().sweepJars()).resolves.toBeUndefined()
	})

	it('never logs cookie values', async () => {
		fakeSession.cookies.get.mockResolvedValue([cookie({name: 'LOGIN_INFO', value: 'SECRET'}), cookie({name: 'SAPISID', value: 'SECRET'})])
		const service = makeService()
		await service.withJar(YOUTUBE, async () => undefined)
		await service.hasAuthCookies(YOUTUBE)
		await service.seedForE2e([cookie({name: 'SAPISID', value: 'SECRET'})])
		const logged = [log.info, log.warn, log.error, log.debug].flatMap(fn => vi.mocked(fn).mock.calls)
		expect(logged.length).toBeGreaterThan(0)
		expect(JSON.stringify(logged)).not.toContain('SECRET')
		expect(JSON.stringify(logged)).not.toContain(jarDir)
	})
})

describe('ExploreSessionService.verifySignedIn', () => {
	it('loads the site home page in a hidden, sandboxed window on the Explore partition and reads LOGGED_IN', async () => {
		const service = makeService()
		expect(await service.verifySignedIn(YOUTUBE)).toBe('signedIn')

		expect(windows).toHaveLength(1)
		const [win] = windows
		expect(win.options).toMatchObject({show: false, webPreferences: {session: fakeSession, sandbox: true, contextIsolation: true, nodeIntegration: false}})
		expect((win.options as {webPreferences: Record<string, unknown>}).webPreferences).not.toHaveProperty('preload')
		expect(win.webContents.loadURL).toHaveBeenCalledWith('https://www.youtube.com/')
		expect(win.destroy).toHaveBeenCalledOnce()
	})

	it('reports signed out when LOGGED_IN is false', async () => {
		FakeBrowserWindow.script = win => {
			win.webContents.executeJavaScript.mockResolvedValue(false)
			return finishLoading(win)
		}
		expect(await makeService().verifySignedIn(YOUTUBE)).toBe('signedOut')
		expect(windows[0]?.destroy).toHaveBeenCalledOnce()
	})

	it('answers as soon as ytcfg is readable, without waiting for the whole page to load', async () => {
		FakeBrowserWindow.script = win => {
			// dom-ready only: did-finish-load never arrives (a slow page still pulling assets).
			queueMicrotask(() => win.webContents.emit('dom-ready'))
			return new Promise<void>(() => undefined)
		}
		expect(await makeService().verifySignedIn(YOUTUBE)).toBe('signedIn')
		expect(windows[0]?.destroy).toHaveBeenCalledOnce()
	})

	it('keeps polling after dom-ready until ytcfg says something', async () => {
		FakeBrowserWindow.script = win => {
			win.webContents.executeJavaScript.mockResolvedValueOnce(null).mockResolvedValueOnce(null).mockResolvedValue(true)
			queueMicrotask(() => win.webContents.emit('dom-ready'))
			return new Promise<void>(() => undefined)
		}
		expect(await makeService().verifySignedIn(YOUTUBE)).toBe('signedIn')
		expect(windows[0]?.webContents.executeJavaScript.mock.calls.length).toBeGreaterThanOrEqual(3)
	})

	it('awaits whenReady (the proxy) before loading any page', async () => {
		let applyProxy!: () => void
		fakeSession.setProxy.mockImplementation(() => new Promise<void>(resolve => (applyProxy = resolve)))
		const result = makeService().verifySignedIn(YOUTUBE)
		await new Promise(resolve => setTimeout(resolve, 0))
		expect(windows).toHaveLength(0)

		applyProxy()
		expect(await result).toBe('signedIn')
		expect(windows[0]?.webContents.loadURL).toHaveBeenCalledOnce()
	})

	it('cannot tell (unknown) without opening a window when the proxy cannot be applied', async () => {
		fakeSession.setProxy.mockRejectedValue(new Error('proxy broke'))
		expect(await makeService().verifySignedIn(YOUTUBE)).toBe('unknown')
		expect(windows).toHaveLength(0)
	})

	it('cannot tell (unknown) without opening a window when the proxy setting is invalid', async () => {
		expect(await makeService({uaToken: undefined, proxyUrl: 'ftp://10.0.0.1:21'}).verifySignedIn(YOUTUBE)).toBe('unknown')
		expect(windows).toHaveLength(0)
	})

	it('answers an authenticated proxy challenge with the configured credentials', async () => {
		FakeBrowserWindow.script = win => {
			const event = {preventDefault: vi.fn()}
			const callback = vi.fn()
			win.webContents.emit('login', event, {url: 'https://www.youtube.com/'}, {isProxy: true, scheme: 'basic', host: '10.0.0.1', port: 3128, realm: ''}, callback)
			expect(event.preventDefault).toHaveBeenCalledOnce()
			expect(callback).toHaveBeenCalledWith('user', 'p@ss')
			return finishLoading(win)
		}
		expect(await makeService({uaToken: undefined, proxyUrl: 'http://user:p%40ss@10.0.0.1:3128'}).verifySignedIn(YOUTUBE)).toBe('signedIn')
	})

	it('never answers a site (non-proxy) login challenge', async () => {
		FakeBrowserWindow.script = win => {
			const event = {preventDefault: vi.fn()}
			const callback = vi.fn()
			win.webContents.emit('login', event, {url: 'https://www.youtube.com/'}, {isProxy: false, scheme: 'basic', host: 'www.youtube.com', port: 443, realm: ''}, callback)
			expect(event.preventDefault).not.toHaveBeenCalled()
			expect(callback).not.toHaveBeenCalled()
			return finishLoading(win)
		}
		expect(await makeService({uaToken: undefined, proxyUrl: 'http://user:pass@10.0.0.1:3128'}).verifySignedIn(YOUTUBE)).toBe('signedIn')
	})

	it('treats the themeRefresh ERR_ABORTED first-load abort as normal', async () => {
		FakeBrowserWindow.script = win => {
			// YouTube re-navigates to ?themeRefresh=1, aborting the original request.
			queueMicrotask(() => {
				win.webContents.emit('did-fail-load', {}, -3, 'ERR_ABORTED', 'https://www.youtube.com/', true)
				win.webContents.url = 'https://www.youtube.com/?themeRefresh=1'
				win.webContents.emit('did-finish-load')
			})
			return Promise.reject(Object.assign(new Error("ERR_ABORTED (-3) loading 'https://www.youtube.com/'"), {code: 'ERR_ABORTED', errno: -3}))
		}
		expect(await makeService().verifySignedIn(YOUTUBE)).toBe('signedIn')
		expect(windows[0]?.destroy).toHaveBeenCalledOnce()
	})

	it('cannot tell (unknown) when the page fails to load', async () => {
		FakeBrowserWindow.script = win => {
			queueMicrotask(() => win.webContents.emit('did-fail-load', {}, -130, 'ERR_PROXY_CONNECTION_FAILED', 'https://www.youtube.com/', true))
			return Promise.reject(new Error('ERR_PROXY_CONNECTION_FAILED'))
		}
		expect(await makeService().verifySignedIn(YOUTUBE)).toBe('unknown')
		expect(windows[0]?.webContents.executeJavaScript).not.toHaveBeenCalled()
		expect(windows[0]?.destroy).toHaveBeenCalledOnce()
	})

	it('cannot tell (unknown) when the page settles off the site, e.g. a captive portal or accounts.google.com', async () => {
		FakeBrowserWindow.script = win => {
			win.webContents.url = 'https://accounts.google.com/ServiceLogin'
			// The evaluated script's own host check answers null off the site.
			win.webContents.executeJavaScript.mockResolvedValue(null)
			return finishLoading(win)
		}
		expect(await makeService().verifySignedIn(YOUTUBE)).toBe('unknown')
		expect(windows[0]?.destroy).toHaveBeenCalledOnce()
	})

	it('checks the host inside the evaluated script, so a navigation between check and read cannot slip through', async () => {
		await makeService().verifySignedIn(YOUTUBE)
		const script = String(windows[0]?.webContents.executeJavaScript.mock.calls[0]?.[0])
		const {runInNewContext} = await import('node:vm')
		const evaluate = (hostname: string, loggedIn: unknown): unknown => runInNewContext(script, {location: {hostname}, window: {ytcfg: {get: (key: string) => (key === 'LOGGED_IN' ? loggedIn : undefined)}}})
		expect(evaluate('www.youtube.com', true)).toBe(true)
		expect(evaluate('youtube.com', false)).toBe(false)
		expect(evaluate('m.youtube.com', undefined)).toBeNull()
		expect(evaluate('accounts.google.com', true)).toBeNull()
		expect(evaluate('youtube.com.evil.com', true)).toBeNull()
		expect(evaluate('evilyoutube.com', true)).toBeNull()
	})

	it('cannot tell (unknown) when reading the page throws', async () => {
		FakeBrowserWindow.script = win => {
			win.webContents.executeJavaScript.mockRejectedValue(new Error('Script failed to execute'))
			return finishLoading(win)
		}
		expect(await makeService().verifySignedIn(YOUTUBE)).toBe('unknown')
		expect(windows[0]?.destroy).toHaveBeenCalledOnce()
	})

	it('gives up after a bounded wait as unknown', async () => {
		vi.useFakeTimers()
		try {
			FakeBrowserWindow.script = () => new Promise<void>(() => undefined)
			const result = makeService().verifySignedIn(YOUTUBE)
			await vi.advanceTimersByTimeAsync(20_000)
			expect(await result).toBe('unknown')
			expect(windows[0]?.destroy).toHaveBeenCalledOnce()
		} finally {
			vi.useRealTimers()
		}
	})

	it('bounds the wait for the proxy too, and opens nothing once it gave up', async () => {
		vi.useFakeTimers()
		try {
			let applyProxy!: () => void
			fakeSession.setProxy.mockImplementation(() => new Promise<void>(resolve => (applyProxy = resolve)))
			const result = makeService().verifySignedIn(YOUTUBE)
			await vi.advanceTimersByTimeAsync(20_000)
			expect(await result).toBe('unknown')

			applyProxy()
			await vi.advanceTimersByTimeAsync(0)
			expect(windows).toHaveLength(0)
		} finally {
			vi.useRealTimers()
		}
	})

	it('shares one in-flight check between concurrent callers', async () => {
		const service = makeService()
		const [first, second] = await Promise.all([service.verifySignedIn(YOUTUBE), service.verifySignedIn(YOUTUBE)])
		expect([first, second]).toEqual(['signedIn', 'signedIn'])
		expect(windows).toHaveLength(1)

		// A later call checks again.
		expect(await service.verifySignedIn(YOUTUBE)).toBe('signedIn')
		expect(windows).toHaveLength(2)
	})

	it('cannot tell for another site, and opens nothing', async () => {
		expect(await makeService().verifySignedIn(VIMEO)).toBe('unknown')
		expect(windows).toHaveLength(0)
	})
})
