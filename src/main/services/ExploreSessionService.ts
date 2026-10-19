import {app, BrowserWindow, session, type Cookie, type Session} from 'electron'
import {chmod, mkdir, readdir, rm, writeFile} from 'node:fs/promises'
import {basename, join} from 'node:path'
import {randomUUID} from 'node:crypto'
import log from 'electron-log/main.js'
import {BLAND_UA_TOKEN, blandUserAgent} from '@main/utils/blandUserAgent.js'
import {parseProxySetting} from '@main/utils/proxyUrl.js'
import {electronDefaultUserAgent, setRendererDefaultUserAgent} from '@main/utils/rendererUserAgent.js'
import {validateUaToken} from '@shared/exploreUserAgent.js'
import {exploreScopeSignedIn, inExploreCookieScope, type ExploreCookieScope} from '@shared/sites/exploreCookieScope.js'
import {siteById} from '@shared/sites/index.js'
import type {ExploreCookie, SiteExplore, SiteId} from '@shared/sites/types.js'
import type {ExploreSignInState} from '@shared/schemas.js'
import {answerProxyLogins, pageLoadFailure} from './explore/exploreWebContents.js'
import {toNetscapeJar} from './netscapeCookieJar.js'
import type {SessionCookieJarPort} from './sessionCookieJarPort.js'

const logger = log.scope('explore')
export const EXPLORE_PARTITION = 'persist:arroxy-explore'

const VERIFY_TIMEOUT_MS = 20_000
// How long a jar the first delete could not remove waits before the one retry.
const JAR_DELETE_RETRY_MS = 5_000
// How often ytcfg is re-read between dom-ready and an answer.
const YTCFG_POLL_MS = 250

// Read-only, wrapped, and answers only on the site itself: the host is checked
// by the script, so a navigation between any outside check and the read cannot
// slip a foreign page through. true / false once ytcfg says; null otherwise.
function signInScript(domains: readonly string[]): string {
	return `(function(){try{var h=String(location.hostname).toLowerCase();var d=${JSON.stringify(domains)};var on=false;for(var i=0;i<d.length;i++){if(h===d[i]||h.slice(-(d[i].length+1))==='.'+d[i])on=true}if(!on)return null;var c=window.ytcfg;var v=c&&typeof c.get==='function'?c.get('LOGGED_IN'):undefined;return v===true||v===false?v:null}catch(e){return null}})()`
}

export interface ExploreSessionSettings {
	uaToken: unknown
	proxyUrl: string | undefined
}

// Electron types most Cookie fields as optional; default them the way a
// session cookie with no explicit scope behaves.
function toExploreCookie(c: Cookie): ExploreCookie {
	return {name: c.name, value: c.value, domain: c.domain ?? '', hostOnly: c.hostOnly ?? false, path: c.path ?? '/', secure: c.secure ?? false, httpOnly: c.httpOnly ?? false, session: c.session ?? false, ...(c.expirationDate === undefined ? {} : {expirationDate: c.expirationDate})}
}

function errorCode(err: unknown): string {
	return typeof err === 'object' && err !== null && 'code' in err && typeof err.code === 'string' ? err.code : 'unknown'
}

// Owns the app's persistent Explore partition and hands yt-dlp a throwaway
// cookie jar per spawn. Cookie values never reach a log line.
export class ExploreSessionService implements SessionCookieJarPort {
	private readonly jarDir = join(app.getPath('userData'), 'explore-jars')
	private permissionsLocked = false
	private appliedUserAgent: string | null = null
	// Key of the proxy last requested (applied or in flight); null after a failure so the next request retries.
	private requestedProxyKey: string | null = null
	private proxyEverApplied = false
	// Settles when every setting requested so far has been applied; rejects if the proxy could not be (or is invalid).
	private ready: Promise<void> = Promise.resolve()
	private readonly signInChecks = new Map<SiteId, Promise<ExploreSignInState>>()

	// Settings are read on every use, never snapshotted.
	constructor(private readonly readSettings: () => ExploreSessionSettings) {}

	// The partition with the current UA and proxy settings requested. The proxy
	// applies asynchronously: await whenReady() before any navigation.
	getSession(): Session {
		const ses = session.fromPartition(EXPLORE_PARTITION)
		this.lockPermissions(ses)
		this.syncUserAgent(ses)
		this.syncProxy(ses)
		return ses
	}

	// Resolves once the UA, permission handlers and proxy are in effect; rejects
	// if the proxy could not be applied or the setting is not a usable proxy
	// (fail closed: never browse unproxied). A later call retries a failed proxy.
	whenReady(): Promise<void> {
		this.getSession()
		return this.ready
	}

	getUserAgent(): string {
		return blandUserAgent(electronDefaultUserAgent(), app.getName(), validateUaToken(this.readSettings().uaToken) ?? BLAND_UA_TOKEN)
	}

	// Installed first so nothing later can leave the partition on Electron's grant-all default.
	private lockPermissions(ses: Session): void {
		if (this.permissionsLocked) return
		ses.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false))
		ses.setPermissionCheckHandler(() => false)
		ses.on('will-download', (_event, item) => item.cancel())
		this.permissionsLocked = true
	}

	private syncUserAgent(ses: Session): void {
		const userAgent = this.getUserAgent()
		if (userAgent === this.appliedUserAgent) return
		ses.setUserAgent(userAgent)
		// Out-of-process frames ignore the session UA and start from this default.
		setRendererDefaultUserAgent(userAgent)
		this.appliedUserAgent = userAgent
	}

	private syncProxy(ses: Session): void {
		const proxy = parseProxySetting(this.readSettings().proxyUrl)
		const key = proxy.kind === 'proxy' ? proxy.chromiumRules : proxy.kind
		if (key === this.requestedProxyKey) return
		this.requestedProxyKey = key
		if (proxy.kind === 'invalid') {
			// Fail closed: a setting the user meant as a proxy is never silently
			// replaced by the system route. Nothing loads until it is fixed.
			logger.warn('explore proxy setting is not a usable proxy URL; Explore stays offline until it is fixed')
			const refused = Promise.reject(new Error('Explore proxy setting is not a usable proxy URL'))
			refused.catch(() => undefined)
			this.ready = refused
			return
		}
		const previous = this.ready.catch(() => undefined)
		const applied = previous.then(async () => {
			await ses.setProxy(proxy.kind === 'proxy' ? {proxyRules: proxy.chromiumRules} : {mode: 'system'})
			// Pooled connections were opened through the previous route.
			if (this.proxyEverApplied) await ses.closeAllConnections()
			this.proxyEverApplied = true
		})
		this.ready = applied
		// Bookkeeping only: the rejection itself reaches whenReady() callers through `ready`.
		applied.catch(err => {
			logger.warn('explore proxy could not be applied', {error: err instanceof Error ? err.message : String(err)})
			if (this.requestedProxyKey === key) this.requestedProxyKey = null
		})
	}

	async readCookies(scope: ExploreCookieScope): Promise<ExploreCookie[]> {
		const all = (await this.getSession().cookies.get({})).map(toExploreCookie)
		return all.filter(c => inExploreCookieScope(c, scope))
	}

	async hasAuthCookies(scope: ExploreCookieScope): Promise<boolean> {
		return exploreScopeSignedIn(await this.readCookies(scope), scope)
	}

	async withJar<T>(scope: ExploreCookieScope, fn: (jarPath: string) => Promise<T>): Promise<T> {
		await mkdir(this.jarDir, {recursive: true, mode: 0o700})
		// mkdir leaves an existing directory (and is subject to umask) as it was.
		if (process.platform !== 'win32') await chmod(this.jarDir, 0o700)
		const jarPath = join(this.jarDir, `${randomUUID()}.txt`)
		try {
			await writeFile(jarPath, toNetscapeJar(await this.readCookies(scope), scope), {mode: 0o600})
			logger.info('explore jar written', {scope: scope.kind})
			return await fn(jarPath)
		} finally {
			await rm(jarPath, {force: true}).catch((err: unknown) => this.retryJarDelete(jarPath, err))
		}
	}

	// The jar outlived its spawn (a Windows lock from an AV scanner or the
	// indexer), or a failed write left part of one: plaintext cookies are still
	// on disk. Say so — by code and file name only, the error text embeds the
	// full path — and try once more shortly; the startup sweep is the last
	// resort. Never changes what withJar returns or throws.
	private retryJarDelete(jarPath: string, err: unknown): void {
		const jar = basename(jarPath)
		logger.warn('explore jar could not be deleted; retrying once', {code: errorCode(err), jar})
		setTimeout(() => {
			rm(jarPath, {force: true}).then(
				() => logger.info('explore jar deleted on retry', {jar}),
				(retryErr: unknown) => logger.warn('explore jar still could not be deleted; the startup sweep will remove it', {code: errorCode(retryErr), jar})
			)
		}, JAR_DELETE_RETRY_MS).unref()
	}

	// Never rejects: a jar that cannot be removed (EPERM, EBUSY) is logged and the rest are still swept.
	async sweepJars(): Promise<void> {
		const entries = await readdir(this.jarDir).catch(() => [])
		let swept = 0
		await Promise.all(
			entries.map(async name => {
				try {
					await rm(join(this.jarDir, name), {recursive: true, force: true})
					swept += 1
				} catch (err) {
					// Code only: the message embeds the path.
					logger.warn('explore jar could not be swept', {code: errorCode(err)})
				}
			})
		)
		if (swept > 0) logger.info('swept orphaned explore jars', {count: swept})
	}

	// Whether the session is still signed in, by the site itself: loads the home
	// page in a hidden window on the partition and reads YouTube's own LOGGED_IN
	// flag. A check that cannot tell (proxy not ready, timeout, load failure, a
	// page off the site) answers `unknown`, never `signedOut`. Concurrent callers
	// share one check. Another site has no such check: it always answers `unknown`.
	verifySignedIn(scope: ExploreCookieScope): Promise<ExploreSignInState> {
		if (scope.kind === 'web') return Promise.resolve('unknown')
		const {siteId} = scope
		const inFlight = this.signInChecks.get(siteId)
		if (inFlight) return inFlight
		const check = this.checkSignedIn(siteId).finally(() => this.signInChecks.delete(siteId))
		this.signInChecks.set(siteId, check)
		return check
	}

	private async checkSignedIn(siteId: SiteId): Promise<ExploreSignInState> {
		const explore = siteById(siteId).explore
		if (!explore) return 'signedOut'
		let win: BrowserWindow | undefined
		let timer: NodeJS.Timeout | undefined
		// Aborted once this check has settled: a proxy that becomes ready later
		// opens nothing, and a page still loading stops being read.
		const settled = new AbortController()
		const check = async (): Promise<ExploreSignInState> => {
			// Fail closed: nothing loads until the proxy is in effect.
			try {
				await this.whenReady()
			} catch (err) {
				logger.warn('explore sign-in check skipped: proxy not ready', {siteId, error: err instanceof Error ? err.message : String(err)})
				return 'unknown'
			}
			if (settled.signal.aborted) return 'unknown'
			win = new BrowserWindow({show: false, webPreferences: {session: this.getSession(), sandbox: true, contextIsolation: true, nodeIntegration: false}})
			return this.readSignInState(win, explore, settled.signal)
		}
		try {
			// The bound covers the proxy wait as well as the page.
			const timedOut = new Promise<ExploreSignInState>(resolve => {
				timer = setTimeout(() => {
					logger.warn('explore sign-in check timed out', {siteId})
					resolve('unknown')
				}, VERIFY_TIMEOUT_MS)
			})
			const state = await Promise.race([check(), timedOut])
			logger.info('explore sign-in verified', {siteId, state})
			return state
		} catch (err) {
			logger.warn('explore sign-in check failed', {siteId, error: err instanceof Error ? err.message : String(err)})
			return 'unknown'
		} finally {
			settled.abort()
			clearTimeout(timer)
			if (win && !win.isDestroyed()) win.destroy()
		}
	}

	// Answers as soon as ytcfg is readable (from dom-ready, polled), not after
	// the whole page has loaded; the finished load is the last chance to read it.
	private readSignInState(win: BrowserWindow, explore: SiteExplore, stop: AbortSignal): Promise<ExploreSignInState> {
		const wc = win.webContents
		wc.setWindowOpenHandler(() => ({action: 'deny'}))
		wc.setAudioMuted(true)
		answerProxyLogins(wc, () => this.readSettings().proxyUrl)
		const script = signInScript(explore.cookieDomains)
		return new Promise<ExploreSignInState>(resolve => {
			let poll: NodeJS.Timeout | undefined
			let done = false
			const finish = (state: ExploreSignInState): void => {
				if (done) return
				done = true
				clearInterval(poll)
				resolve(state)
			}
			stop.addEventListener('abort', () => finish('unknown'), {once: true})
			const read = async (final: boolean): Promise<void> => {
				if (done) return
				const answer: unknown = await wc.executeJavaScript(script).catch(() => null)
				if (answer === true) finish('signedIn')
				else if (answer === false) finish('signedOut')
				else if (final) finish('unknown')
			}
			wc.on('dom-ready', () => {
				void read(false)
				poll ??= setInterval(() => void read(false), YTCFG_POLL_MS)
			})
			wc.on('did-finish-load', () => void read(true))
			wc.on('did-fail-load', (_event, code, description, _url, isMainFrame) => {
				if (pageLoadFailure(code, description, isMainFrame) === null) return
				logger.warn('explore sign-in page failed to load', {code, description})
				finish('unknown')
			})
			// Failures arrive through did-fail-load, where the benign abort is told apart.
			wc.loadURL(explore.homeUrl).catch(() => undefined)
		})
	}

	async signOut(): Promise<void> {
		await this.getSession().clearStorageData()
	}

	// ARROXY_E2E only: seeds fixture cookies so the fixture E2E can exercise escalation without a real sign-in.
	async seedForE2e(cookies: readonly ExploreCookie[]): Promise<void> {
		const ses = this.getSession()
		for (const c of cookies) {
			await ses.cookies.set({url: `https://${c.domain.replace(/^\./, '')}${c.path}`, name: c.name, value: c.value, ...(c.hostOnly ? {} : {domain: c.domain}), path: c.path, secure: c.secure, httpOnly: c.httpOnly, ...(c.expirationDate === undefined ? {} : {expirationDate: c.expirationDate})})
		}
	}
}
