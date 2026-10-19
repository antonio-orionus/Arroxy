import {ipcMain, type IpcMainInvokeEvent, type OnBeforeRequestListenerDetails, type OnHeadersReceivedListenerDetails, type Session, type WebContents} from 'electron'
import type {ElectronBlocker} from '@ghostery/adblocker-electron'
import log from 'electron-log/main.js'
import {z} from 'zod'
import type {ExploreAdBlockStatus} from '@shared/schemas.js'
import {hostMatches} from '@shared/sites/hostRules.js'
import type {HostRule} from '@shared/sites/types.js'

const logger = log.scope('explore-adblock')

type DomFeatures = NonNullable<Parameters<ElectronBlocker['onInjectCosmeticFilters']>[2]>

// What the engine's cosmetic handler reads off the IPC event: the frame, and
// the page's insertCSS and executeJavaScript. The upstream tripwire test checks
// the library reads nothing else, so Arroxy can hand it a contained event.
export interface CosmeticEvent {
	frameId: number
	processId: number
	sender: Pick<WebContents, 'insertCSS' | 'executeJavaScript'>
}

// What the Explore session calls on the engine: the library's own request,
// header and cosmetic handlers. Arroxy wires them itself (see hook()). The
// cosmetic handler is a method so the library's (which names the whole
// IpcMainInvokeEvent) fits it; it reads only the CosmeticEvent part.
export interface AdBlockEngine extends Pick<ElectronBlocker, 'onBeforeRequest' | 'onHeadersReceived' | 'onIsMutationObserverEnabled'> {
	onInjectCosmeticFilters(event: CosmeticEvent, url: string, msg?: DomFeatures): Promise<void>
}

// The cosmetic preload's two channels, fixed by @ghostery/adblocker-electron-preload.
export const INJECT_COSMETICS_CHANNEL = '@ghostery/adblocker/inject-cosmetic-filters'
export const MUTATION_OBSERVER_CHANNEL = '@ghostery/adblocker/is-mutation-observer-enabled'

// The preload's DOM report, from a web page's renderer: untrusted. Bounded so
// a page cannot make main match an unbounded list.
const FEATURES_MAX = 10_000
const featureListSchema = z.array(z.string().max(2048)).max(FEATURES_MAX)
// The lifecycle only labels the engine's match events; a value a newer
// preload sends is read as a DOM update rather than dropping the report.
const KNOWN_LIFECYCLE = z.enum(['start', 'dom-update'])
const domFeaturesSchema = z.object({classes: featureListSchema, hrefs: featureListSchema, ids: featureListSchema, lifecycle: z.unknown().optional()})

export interface ExploreAdBlockerDeps {
	session: () => Session
	// Resolves to the engine, or null when no filter lists could be had. Called
	// only when blocking is turned on, never at startup.
	loadEngine: () => Promise<AdBlockEngine | null>
	// The library's cosmetic preload, as shipped next to the main bundle.
	preloadPath: string
	// Sign-in and account hosts: never blocked, never filtered.
	signInHosts: readonly HostRule[]
	// Asked daily while blocking is on: a newer engine, or null to keep the
	// one in use. Absent: no refresh (a fixed filter list).
	refreshEngine?: () => Promise<AdBlockEngine | null>
}

// How often a long-running session asks whether the lists are due (they are
// refreshed after a week; see exploreAdBlockEngine).
const REFRESH_CHECK_MS = 24 * 60 * 60 * 1000

interface Hooked {
	session: Session
	engine: AdBlockEngine
	preloadId: string
}

// The Explore ad blocker (P2-R36, off until the user turns it on), and only
// ever on the Explore session. It is the only owner of that session's
// webRequest listeners (Electron keeps one listener per event per session):
// turning it off clears exactly the listeners it set. The library's own
// BlockingContext is not used: its preload path is resolved from node_modules
// (absent in a packaged app), its IPC handlers answer any renderer, and it
// cannot spare sign-in pages.
export class ExploreAdBlocker {
	private status: ExploreAdBlockStatus = 'off'
	private wanted = false
	private hooked: Hooked | null = null
	// The engine once loaded; a load that found nothing is retried at the next turn-on.
	private engine: Promise<AdBlockEngine | null> | null = null
	private ipcRegistered = false
	private unknownLifecycleLogged = false
	// The page each Explore page last logged a cosmetic failure for: one line per page.
	private readonly cosmeticFailureLogged = new WeakMap<WebContents, string>()
	private refreshTimer: NodeJS.Timeout | undefined
	private refreshing = false
	private readonly listeners = new Set<(status: ExploreAdBlockStatus) => void>()

	constructor(private readonly deps: ExploreAdBlockerDeps) {}

	getStatus(): ExploreAdBlockStatus {
		return this.status
	}

	onStatusChange(listener: (status: ExploreAdBlockStatus) => void): () => void {
		this.listeners.add(listener)
		return () => this.listeners.delete(listener)
	}

	// Brings the session in line with the setting. Resolves true when blocking
	// was switched on or off, so a page already shown can be reloaded under it.
	async apply(enabled: boolean): Promise<boolean> {
		this.wanted = enabled
		if (!enabled) {
			const changed = this.unhook()
			this.setStatus('off')
			return changed
		}
		if (this.hooked) {
			this.setStatus('on')
			return false
		}
		this.setStatus('starting')
		const engine = await this.load()
		// Turned off (or on by a concurrent call) while the lists loaded.
		if (!this.wanted || this.hooked) return false
		if (!engine) {
			this.setStatus('unavailable')
			return false
		}
		this.hook(engine)
		this.setStatus('on')
		return true
	}

	private load(): Promise<AdBlockEngine | null> {
		if (this.engine) return this.engine
		const loading = this.deps.loadEngine().catch((err: unknown) => {
			logger.warn('explore ad blocker could not load its engine', {error: err instanceof Error ? err.message : String(err)})
			return null
		})
		this.engine = loading
		void loading.then(engine => {
			if (engine === null && this.engine === loading) this.engine = null
		})
		return loading
	}

	private hook(engine: AdBlockEngine): void {
		const ses = this.deps.session()
		this.registerIpc()
		// Per session: the cosmetic preload runs in Explore pages only, never in
		// the main window or the token window (other sessions).
		const preloadId = ses.registerPreloadScript({type: 'frame', filePath: this.deps.preloadPath})
		// The engine is read per request: a refresh swaps it in place.
		ses.webRequest.onBeforeRequest({urls: ['<all_urls>']}, (details, callback) => {
			const current = this.hooked?.engine
			if (!current || this.onSignInHost(details)) callback({})
			else current.onBeforeRequest(details, callback)
		})
		ses.webRequest.onHeadersReceived({urls: ['<all_urls>']}, (details, callback) => {
			const current = this.hooked?.engine
			if (!current || this.onSignInHost(details)) callback({})
			else current.onHeadersReceived(details, callback)
		})
		this.hooked = {session: ses, engine, preloadId}
		this.scheduleRefresh()
		logger.info('explore ad blocker on')
	}

	// Off the request path: requests keep using the engine in use meanwhile,
	// and a check that finds nothing newer changes nothing.
	private scheduleRefresh(): void {
		const refresh = this.deps.refreshEngine
		if (!refresh || this.refreshTimer) return
		this.refreshTimer = setInterval(() => {
			if (this.refreshing || !this.hooked) return
			this.refreshing = true
			refresh()
				.then(fresh => {
					if (!fresh) return
					// Kept even when the blocker went off meanwhile: the refresh has
					// already rewritten the cache, so the next turn-on starts from it.
					this.engine = Promise.resolve(fresh)
					if (this.hooked) this.hooked.engine = fresh
					logger.info('explore ad blocker filter lists refreshed')
				})
				.catch((err: unknown) => logger.warn('explore ad blocker refresh failed', {error: err instanceof Error ? err.message : String(err)}))
				.finally(() => {
					this.refreshing = false
				})
		}, REFRESH_CHECK_MS)
		this.refreshTimer.unref()
	}

	private unhook(): boolean {
		const hooked = this.hooked
		if (!hooked) return false
		this.hooked = null
		clearInterval(this.refreshTimer)
		this.refreshTimer = undefined
		hooked.session.webRequest.onBeforeRequest(null)
		hooked.session.webRequest.onHeadersReceived(null)
		hooked.session.unregisterPreloadScript(hooked.preloadId)
		logger.info('explore ad blocker off')
		return true
	}

	// Registered once and left in place: a page loaded before the blocker went
	// off still calls them, and gets nothing.
	private registerIpc(): void {
		if (this.ipcRegistered) return
		this.ipcRegistered = true
		ipcMain.removeHandler(INJECT_COSMETICS_CHANNEL)
		ipcMain.handle(INJECT_COSMETICS_CHANNEL, (event, url: unknown, features: unknown) => this.injectCosmetics(event, url, features))
		ipcMain.removeHandler(MUTATION_OBSERVER_CHANNEL)
		ipcMain.handle(MUTATION_OBSERVER_CHANNEL, event => {
			const hooked = this.explorePage(event)
			return hooked ? hooked.engine.onIsMutationObserverEnabled(event) : false
		})
	}

	private async injectCosmetics(event: IpcMainInvokeEvent, url: unknown, features: unknown): Promise<void> {
		const hooked = this.explorePage(event)
		if (!hooked || typeof url !== 'string') return
		// The frame's own URL decides, not only the one the page reported. No frame
		// (gone since the report) or one whose URL cannot be read: nothing to trust.
		const frameUrl = this.senderFrameUrl(event)
		if (frameUrl === null || this.isSignInUrl(url) || this.isSignInUrl(frameUrl)) return
		let parsed: DomFeatures | undefined
		if (features !== undefined) {
			const result = domFeaturesSchema.safeParse(features)
			if (!result.success) return
			const {lifecycle, ...dom} = result.data
			parsed = {...dom, lifecycle: this.lifecycle(lifecycle)}
		}
		await hooked.engine.onInjectCosmeticFilters(this.contained(event, url), url, parsed)
	}

	private senderFrameUrl(event: IpcMainInvokeEvent): string | null {
		try {
			return event.senderFrame?.url ?? null
		} catch {
			// A detached frame throws on read.
			return null
		}
	}

	// Fails closed: a page gone, or whose main frame is now on a sign-in host
	// (the report came from the document it just left), takes no injection.
	private canInject(page: WebContents): boolean {
		try {
			return !page.isDestroyed() && !this.isSignInUrl(page.getURL())
		} catch {
			return false
		}
	}

	// The library calls the page's executeJavaScript and insertCSS without
	// awaiting them (2.18.2): a scriptlet that throws in the page, or a frame
	// gone meanwhile, would reject with nobody listening. The engine gets an
	// event whose sender's two calls settle on their own. Nothing is installed
	// process-wide.
	private contained(event: IpcMainInvokeEvent, pageUrl: string): CosmeticEvent {
		const page = event.sender
		const report = (err: unknown): undefined => this.reportCosmeticFailure(page, pageUrl, err)
		const settle = (run: () => Promise<unknown>): Promise<unknown> => {
			// Checked at each call: the engine injects after the report was vetted.
			if (!this.canInject(page)) return Promise.resolve(undefined)
			try {
				return run().catch(report)
			} catch (err) {
				return Promise.resolve(report(err))
			}
		}
		return {frameId: event.frameId, processId: event.processId, sender: {executeJavaScript: (code, userGesture) => settle(() => page.executeJavaScript(code, userGesture)), insertCSS: (css, options) => settle(() => page.insertCSS(css, options)).then(key => (typeof key === 'string' ? key : ''))}}
	}

	// Debug level, once per page, host only: a scriptlet failing is the page's
	// business, and the full URL can carry what the user watches.
	private reportCosmeticFailure(page: WebContents, pageUrl: string, err: unknown): undefined {
		if (this.cosmeticFailureLogged.get(page) === pageUrl) return undefined
		this.cosmeticFailureLogged.set(page, pageUrl)
		let host = ''
		try {
			host = new URL(pageUrl).hostname
		} catch {
			// An unparsable report logs no host.
		}
		logger.debug('explore ad blocker cosmetic filter failed in the page', {host, error: err instanceof Error ? err.message.slice(0, 80) : typeof err})
		return undefined
	}

	private lifecycle(value: unknown): DomFeatures['lifecycle'] {
		const known = KNOWN_LIFECYCLE.safeParse(value)
		if (known.success) return known.data
		if (value !== undefined && !this.unknownLifecycleLogged) {
			this.unknownLifecycleLogged = true
			logger.warn('explore ad blocker got a DOM report with an unknown lifecycle; filtering it as a DOM update', {lifecycle: typeof value === 'string' ? value.slice(0, 32) : typeof value})
		}
		return 'dom-update'
	}

	// Only an Explore page, while blocking is on, is answered.
	private explorePage(event: IpcMainInvokeEvent): Hooked | null {
		const hooked = this.hooked
		return hooked && event.sender.session === hooked.session ? hooked : null
	}

	// A request to a sign-in host, or one made by a sign-in page or frame (an
	// embedded sign-in widget included).
	private onSignInHost(details: OnBeforeRequestListenerDetails | OnHeadersReceivedListenerDetails): boolean {
		if (this.isSignInUrl(details.url)) return true
		const page = details.webContents
		if (page !== undefined && !page.isDestroyed() && this.isSignInUrl(page.getURL())) return true
		try {
			return this.isSignInUrl(details.frame?.url ?? '')
		} catch {
			// A frame already gone has no URL to read.
			return false
		}
	}

	private isSignInUrl(raw: string): boolean {
		try {
			return hostMatches(new URL(raw).hostname, this.deps.signInHosts)
		} catch {
			return false
		}
	}

	private setStatus(status: ExploreAdBlockStatus): void {
		if (status === this.status) return
		this.status = status
		for (const listener of this.listeners) listener(status)
	}
}
