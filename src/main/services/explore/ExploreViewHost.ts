import {WebContentsView, type BrowserWindow, type Cookie, type InputEvent, type Session, type WebContents} from 'electron'
import log from 'electron-log/main.js'
import {isExploreAdBlockOn} from '@shared/exploreAdBlock.js'
import {isExploreIdleUnloadOn} from '@shared/exploreIdleUnload.js'
import {hostMatches} from '@shared/sites/hostRules.js'
import {exploreAddressScope, isExploreAddress, type ExploreAddressScope} from '@shared/sites/exploreAddress.js'
import {siteById} from '@shared/sites/index.js'
import type {ExploreCookieScope} from '@shared/sites/exploreCookieScope.js'
import type {HostRule, SiteExplore, SiteId} from '@shared/sites/types.js'
import type {CommonSettings, ExploreNavigateCommand, ExploreViewBounds, ExploreViewState} from '@shared/types.js'
import type {ExploreAdBlockStatus, ExploreViewError} from '@shared/schemas.js'
import type {ExploreSessionService} from '../ExploreSessionService.js'
import type {ExploreAdBlocker} from './ExploreAdBlocker.js'
import {buildIdleUnloadSnapshot, idleUnloadKeepReason, type IdleUnloadRule, type IdleUnloadSnapshot} from './exploreIdleUnload.js'
import {LastPageRecorder, startPage, type LastPageScope} from './exploreLastPage.js'
import {decideNavigation} from './exploreNavigationPolicy.js'
import {answerProxyLogins, blankPage, dropBlankEntryBehind, pageLoadFailure} from './exploreWebContents.js'

const logger = log.scope('explore-view')

// The site Explore opens on, searches and reports the sign-in of; any other
// web page loads too.
const SITE_ID: SiteId = 'youtube'
const SITE_SCOPE: ExploreCookieScope = {kind: 'site', siteId: SITE_ID}
// Cookie churn (YouTube rotates several on every page) settles into one presence read.
const SIGNED_IN_DEBOUNCE_MS = 500
// How long after a click or key press a navigation still counts as the user's
// own. Electron's navigation events carry no gesture flag, so the view's input
// stands in for it; a link click navigates within milliseconds.
const USER_ACTIVATION_MS = 1_000
// What counts as the user's input: a popup loads only within one (routeWindowOpen).
const ACTIVATING_INPUT: ReadonlySet<InputEvent['type']> = new Set<InputEvent['type']>(['mouseDown', 'mouseUp', 'keyDown', 'rawKeyDown', 'gestureTap', 'touchEnd'])
// Sign-in pages (accounts.google.*, accounts.youtube.com) carry session material in their query and fragment.
const SIGN_IN_HOST = /^accounts\./
// The overlay snapshot's JPEG quality: text stays crisp, encoding stays fast.
const SNAPSHOT_JPEG_QUALITY = 85
// How long a new view's first page waits for the ad blocker to start (lists
// from the cache take a moment; a refresh over a slow network can take far
// longer). A blocker that starts later reloads the page instead.
const AD_BLOCK_START_WAIT_MS = 3_000
// How long the user is away from the tab before an eligible page is released
// (idle unload, when the user turned it on). Long enough for a round trip
// through the download wizard.
const IDLE_UNLOAD_DELAY_MS = 300_000

// The address the renderer may see: a sign-in page's query and fragment are dropped.
function displayUrl(raw: string): string {
	if (raw === '') return ''
	try {
		const url = new URL(raw)
		return SIGN_IN_HOST.test(url.hostname) ? `${url.origin}${url.pathname}` : raw
	} catch {
		return ''
	}
}

function hostOf(raw: string): string {
	try {
		return new URL(raw).hostname
	} catch {
		return ''
	}
}

const NO_PAGE: ExploreViewState = {url: '', title: '', canGoBack: false, canGoForward: false, loading: false, signedIn: false, error: null, adBlock: 'off'}

export interface ExploreViewHostDeps {
	window: BrowserWindow
	session: Pick<ExploreSessionService, 'getSession' | 'whenReady' | 'hasAuthCookies' | 'verifySignedIn' | 'signOut'>
	settings: () => CommonSettings
	// Stores (or, with undefined, forgets) the last page the view showed.
	saveLastPage: (url: string | undefined) => void
	adBlock: Pick<ExploreAdBlocker, 'apply' | 'getStatus' | 'onStatusChange'>
	// E2E only: opened instead of the site's home; its origin's pages are the ones kept and reopened.
	homeUrlOverride?: string
	isPackaged: boolean
	emit: (state: ExploreViewState) => void
	// The pointer just entered the view: the renderer may never see the toolbar's mouseleave.
	pointerEntered: () => void
	// A right-click in the page, with the link under the pointer ('' for none).
	linkMenu: (linkURL: string) => void
	// Overrides IDLE_UNLOAD_DELAY_MS (tests, and the E2E harness).
	idleUnloadDelayMs?: number
}

// Electron's navigation events, as far as the policy needs them.
interface NavigationEvent {
	url: string
	isMainFrame: boolean
	preventDefault(): void
}

function requireExplore(siteId: SiteId): SiteExplore {
	const explore = siteById(siteId).explore
	if (!explore) throw new Error(`site ${siteId} has no Explore capability`)
	return explore
}

function sameState(a: ExploreViewState, b: ExploreViewState): boolean {
	return a.url === b.url && a.title === b.title && a.canGoBack === b.canGoBack && a.canGoForward === b.canGoForward && a.loading === b.loading && a.signedIn === b.signedIn && a.error === b.error && a.adBlock === b.adBlock
}

// The Explore browser: one WebContentsView on the Explore partition, attached
// to the main window and created the first time it is shown. Every navigation
// goes through the navigation policy, and nothing loads until the session's
// proxy is in effect. The renderer only ever sees ExploreViewState.
export class ExploreViewHost {
	private readonly explore = requireExplore(SITE_ID)
	// Where an address typed in the bar may load (checked again in navigate()).
	readonly addressScope: ExploreAddressScope
	private readonly cookieHosts: readonly HostRule[]
	private readonly homeUrl: string
	private readonly overrideOrigin: string | undefined
	private readonly lastPageScope: LastPageScope
	private readonly lastPage: LastPageRecorder
	private readonly idleUnloadRule: IdleUnloadRule
	private view: WebContentsView | null = null
	private bounds: ExploreViewBounds | null = null
	private visible = false
	// The Explore tab is the active tab: only then may the page play sound.
	private active = false
	private windowClosed = false
	private error: ExploreViewError | null = null
	// The proxy setting was refused: the session still routes the old way, so
	// the page is blanked and nothing loads until a setting applies. The page it
	// was on comes back then.
	private proxyRefused = false
	// Bumped by every navigation: lets a delayed start load see it was overtaken.
	private navigationSeq = 0
	private resumeUrl: string | null = null
	private signedIn = false
	// A download's session check found the site signed out: cookie presence no
	// longer proves anything until the site itself says signed in again.
	private verifiedSignedOut = false
	private signedInRead = 0
	private cookieTimer: NodeJS.Timeout | undefined
	private detachCookies: (() => void) | null = null
	private lastActivationAt = Number.NEGATIVE_INFINITY
	private lastEmitted: ExploreViewState | null = null
	// Whether the pointer is over the view; the renderer hears only the transitions in.
	private pointerInView = false
	// Idle unload: the deadline armed by leaving the tab, whether the page plays
	// media, the view whose close the page has not answered yet, and the
	// history the next view comes back with. Main-process memory only.
	private idleTimer: NodeJS.Timeout | undefined
	private mediaPlaying = false
	private closing: WebContentsView | null = null
	private snapshot: IdleUnloadSnapshot | null = null

	constructor(private readonly deps: ExploreViewHostDeps) {
		this.cookieHosts = this.explore.cookieDomains.map(domain => ({kind: 'suffix', domain}))
		this.homeUrl = deps.homeUrlOverride ?? this.explore.homeUrl
		this.overrideOrigin = deps.homeUrlOverride === undefined ? undefined : new URL(deps.homeUrlOverride).origin
		this.addressScope = exploreAddressScope(this.explore)
		// The E2E override wins: under it, only its own origin's pages are kept or reopened.
		this.lastPageScope = this.overrideOrigin === undefined ? {kind: 'site', hosts: this.cookieHosts} : {kind: 'origin', origin: this.overrideOrigin}
		this.lastPage = new LastPageRecorder({scope: this.lastPageScope, read: () => deps.settings().exploreLastUrl, write: url => deps.saveLastPage(url)})
		this.idleUnloadRule = {scope: this.lastPageScope, paths: this.explore.idleUnloadPaths}
		deps.adBlock.onStatusChange(() => this.emitState())
		deps.window.on('closed', () => {
			this.windowClosed = true
			this.destroy()
		})
		// A reload of the main window's renderer (Cmd+R, the crash dialog's
		// Reload) runs no cleanup there: the view would stay painted over the
		// splash, with sound. The renderer that comes back shows it again.
		// Keyed on the commit, not the start: the main window cancels every
		// navigation its renderer starts, and those must leave the page alone.
		// did-navigate fires for main-frame, cross-document commits only.
		deps.window.webContents.on('did-navigate', () => {
			void this.setVisible(false)
			this.setActive(false)
		})
	}

	// Renderer CSS px; the main window's zoom factor (the default menu's
	// Cmd/Ctrl +/-/0) scales them to the DIP the view is placed in.
	setBounds(rect: ExploreViewBounds): void {
		const zoom = this.deps.window.webContents.getZoomFactor()
		const x = Math.round(rect.x * zoom)
		const y = Math.round(rect.y * zoom)
		this.bounds = {x, y, width: Math.max(0, Math.round((rect.x + rect.width) * zoom) - x), height: Math.max(0, Math.round((rect.y + rect.height) * zoom) - y)}
		this.view?.setBounds(this.bounds)
	}

	// Sound follows the tab, not visibility: a dialog over the page hides the
	// view but keeps a video playing aloud; leaving the tab mutes it. Leaving
	// also starts the idle unload deadline, and coming back cancels it.
	setActive(active: boolean): void {
		this.active = active
		const wc = this.view?.webContents
		if (wc && !wc.isDestroyed()) wc.setAudioMuted(!active)
		if (active) this.cancelIdleUnload()
		else this.armIdleUnload()
	}

	// Whether `wc` is this view's page (for the app-wide crash accounting).
	ownsWebContents(wc: WebContents): boolean {
		return this.view !== null && this.view.webContents === wc
	}

	// A changed proxy setting: the partition re-applies it now, so an open page
	// is not left on the old route until the next load, and a refused setting
	// shows the proxy error at once. Without a view, the next load applies it.
	async applyProxySetting(): Promise<void> {
		const view = this.view
		if (!view) return
		try {
			await this.deps.session.whenReady()
		} catch (err) {
			if (this.view !== view) return
			logger.warn('explore view proxy setting refused', {error: err instanceof Error ? err.message : String(err)})
			this.refuseProxy(view)
			return
		}
		if (this.view !== view) return
		// A blocker whose lists could not be fetched (the old proxy was down, or
		// refused) gets another try now, before the page comes back.
		if (isExploreAdBlockOn(this.deps.settings()) && this.deps.adBlock.getStatus() === 'unavailable') await this.startAdBlock(view)
		if (this.view === view && this.proxyRefused) await (this.resumeUrl === null ? this.openStart() : this.load(this.resumeUrl))
	}

	async setVisible(visible: boolean): Promise<void> {
		// A hidden view may never see the pointer leave: the next entry signals again.
		this.pointerInView = false
		if (!visible) {
			this.visible = false
			this.view?.setVisible(false)
			return
		}
		if (!this.isEnabled()) {
			this.destroy()
			return
		}
		if (this.windowClosed) return
		this.visible = true
		if (this.view) {
			this.view.setVisible(true)
			return
		}
		const view = this.createView()
		const seq = this.navigationSeq
		await this.startAdBlock(view)
		// A page the user navigated to during the ad block start wait stays.
		if (this.view !== view || this.navigationSeq !== seq) return
		await this.openStart()
	}

	// The idle unload setting changed: turned on while the user is away, the
	// full delay starts now; turned off, a running deadline is dropped.
	applyIdleUnloadSetting(): void {
		this.cancelIdleUnload()
		if (!this.active) this.armIdleUnload()
	}

	// A changed ad blocker setting. Without a view nothing starts: the next
	// view applies it before its first page.
	async applyAdBlockSetting(): Promise<void> {
		if (this.view) await this.syncAdBlock(this.view)
		else this.emitState()
	}

	async navigate(command: ExploreNavigateCommand): Promise<void> {
		if (!this.isEnabled()) {
			this.destroy()
			return
		}
		const view = this.view
		if (!view) return
		this.navigationSeq++
		switch (command.kind) {
			case 'home':
				return this.load(this.homeUrl)
			case 'reload':
				// A page blanked by a refused proxy comes back; with nothing loaded yet
				// (the proxy refused the first load), a retry opens the start page.
				if (this.proxyRefused || view.webContents.getURL() === '') return this.resumeUrl === null ? this.openStart() : this.load(this.resumeUrl)
				return this.whenProxyReady(view, wc => wc.reload())
			case 'back':
				return this.whenProxyReady(view, wc => wc.navigationHistory.goBack())
			case 'forward':
				return this.whenProxyReady(view, wc => wc.navigationHistory.goForward())
			case 'address':
				return this.loadTypedAddress(command.url)
		}
	}

	// Checked here as well as in IPC: any web page, never a sign-in or consent page.
	private loadTypedAddress(url: string): Promise<void> {
		if (!isExploreAddress(url, this.addressScope)) {
			logger.info('explore view refused a typed address', {host: hostOf(url) || '(none)'})
			return Promise.resolve()
		}
		// The parsed form, never the raw string: what loads is what was checked.
		return this.load(new URL(url).href)
	}

	getState(): ExploreViewState {
		const wc = this.view?.webContents
		// A blanked page is no page: nothing to show in the address bar or to download.
		const adBlock = this.adBlockStatus()
		if (!wc || wc.isDestroyed() || this.proxyRefused) return {...NO_PAGE, signedIn: this.signedIn, error: this.error, adBlock}
		return {url: displayUrl(wc.getURL()), title: wc.getTitle(), canGoBack: wc.navigationHistory.canGoBack(), canGoForward: wc.navigationHistory.canGoForward(), loading: wc.isLoading(), signedIn: this.signedIn, error: this.error, adBlock}
	}

	// P2-R35: the shown page as a JPEG data URL, for the renderer to put in the
	// view's place while an overlay hides it; null when no page is shown.
	// capturePage returns device pixels (the display's scale factor), kept as
	// they are so the picture is sharp on HiDPI. JPEG, not PNG: a full-size PNG
	// takes ~300 ms to encode, a quality-85 JPEG ~15 ms. Never logged.
	async capture(): Promise<string | null> {
		const wc = this.view?.webContents
		if (!wc || wc.isDestroyed() || !this.visible || this.error !== null) return null
		try {
			const image = await wc.capturePage()
			if (image.isEmpty()) return null
			return `data:image/jpeg;base64,${image.toJPEG(SNAPSHOT_JPEG_QUALITY).toString('base64')}`
		} catch {
			return null
		}
	}

	// A sign-in outlives the app, but the view (which watches it) is built only
	// at the first Explore open: until then this one presence read of the stored
	// cookies gives the renderer the flag. Loads no page. Done with the kill
	// switch on too: Settings' sign-out works without the tab and needs the flag.
	// Skipped only when Explore was never opened (nothing to be signed in to).
	readSignedIn(): void {
		if (this.view || this.deps.settings().exploreNoticeSeen !== true) return
		this.refreshSignedIn()
	}

	async signOut(): Promise<void> {
		try {
			await this.deps.session.signOut()
		} finally {
			// The account's pages go with it: the last page, and the one a refused
			// proxy would bring back. After the await, because the page keeps
			// committing navigations while the storage is cleared.
			this.lastPage.clear()
			this.resumeUrl = null
			this.snapshot = null
		}
		this.verifiedSignedOut = false
		this.setSignedIn(false)
		if (this.view) await this.load(this.homeUrl)
	}

	// Re-checked at once, so a mark that turns out wrong clears itself instead of
	// waiting for a page load. The download's own check has settled by now, so
	// this is one more hidden page load per verified sign-out (only a check
	// still in flight would be shared); it never repeats on its own.
	markSignedOutAfterVerify(): void {
		this.verifiedSignedOut = true
		this.setSignedIn(false)
		this.recheckVerifiedSignOut()
	}

	// Kill switch and window close. Idempotent; a later setVisible(true) builds
	// a fresh view unless the window is gone. An idle unload's history goes too.
	destroy(): void {
		this.cancelIdleUnload()
		this.closing = null
		this.snapshot = null
		this.unwatch()
		const view = this.view
		if (!view) return
		this.visible = false
		this.release(view)
		logger.info('explore view destroyed', {windowClosed: this.windowClosed})
		this.emitState()
	}

	// What a view watches outside itself: none of it outlives the view.
	private unwatch(): void {
		this.lastPage.flush()
		// Off the partition too: no request hooks or page script without the tab.
		void this.deps.adBlock.apply(false)
		clearTimeout(this.cookieTimer)
		this.cookieTimer = undefined
		this.detachCookies?.()
		this.detachCookies = null
	}

	private release(view: WebContentsView): void {
		this.view = null
		this.error = null
		this.proxyRefused = false
		this.resumeUrl = null
		this.mediaPlaying = false
		if (!this.deps.window.isDestroyed()) this.deps.window.contentView.removeChildView(view)
		if (!view.webContents.isDestroyed()) view.webContents.close()
	}

	// One deadline per leave: a repeated inactive notice does not push it back.
	private armIdleUnload(): void {
		if (!this.view || this.idleTimer !== undefined || !isExploreIdleUnloadOn(this.deps.settings())) return
		this.idleTimer = setTimeout(() => {
			this.idleTimer = undefined
			this.idleUnload()
		}, this.deps.idleUnloadDelayMs ?? IDLE_UNLOAD_DELAY_MS)
	}

	private cancelIdleUnload(): void {
		clearTimeout(this.idleTimer)
		this.idleTimer = undefined
	}

	// The user has been away long enough: an eligible page is asked to close.
	// It may refuse (beforeunload), and until it answers the view stays as it is.
	// An ineligible page stays until the user leaves the tab again.
	private idleUnload(): void {
		const view = this.view
		if (!view || this.active || this.closing !== null || !isExploreIdleUnloadOn(this.deps.settings())) return
		const wc = view.webContents
		if (wc.isDestroyed()) return
		const keep = idleUnloadKeepReason({url: wc.getURL(), loading: wc.isLoading(), error: this.error !== null, proxyRefused: this.proxyRefused, mediaPlaying: this.mediaPlaying}, this.idleUnloadRule)
		if (keep !== null) {
			logger.info('explore view kept while away', {reason: keep})
			return
		}
		const built = buildIdleUnloadSnapshot(wc.navigationHistory.getAllEntries(), wc.navigationHistory.getActiveIndex(), this.lastPageScope)
		if (built.kind === 'keep') {
			logger.info('explore view kept while away', {reason: built.reason})
			return
		}
		this.snapshot = built.snapshot
		this.closing = view
		logger.info('explore view unloading', {entries: built.snapshot.entries.length, dropped: built.dropped})
		wc.close({waitForBeforeUnload: true})
	}

	private watchClose(view: WebContentsView): void {
		const wc = view.webContents
		// Not prevented: the page's own beforeunload decides, and Electron honors it for a view.
		wc.on('will-prevent-unload', () => {
			if (this.closing !== view) return
			this.closing = null
			this.snapshot = null
			logger.info('explore view kept while away', {reason: 'beforeunload'})
		})
		wc.on('destroyed', () => this.idleUnloaded(view))
	}

	// The page let the close through. A user back meanwhile gets the view rebuilt at once.
	private idleUnloaded(view: WebContentsView): void {
		if (this.closing !== view) return
		this.closing = null
		if (this.view !== view) return
		this.unwatch()
		this.release(view)
		logger.info('explore view unloaded')
		this.emitState()
		if (this.visible) void this.setVisible(true)
	}

	// A new view's first page: the unloaded history when there is one, else the start page.
	private openStart(): Promise<void> {
		return this.snapshot === null ? this.load(this.startUrl()) : this.restore(this.snapshot)
	}

	// Restoring a history is a load started by the browser, so the navigation
	// guards never see it: every entry is checked again here. Failures come
	// through did-fail-load like any load's; restore()'s own rejection (a page
	// aborting its first load counts) says nothing more.
	private restore(snapshot: IdleUnloadSnapshot): Promise<void> {
		const view = this.view
		if (!view) return Promise.resolve()
		const built = buildIdleUnloadSnapshot(snapshot.entries, snapshot.index, this.lastPageScope)
		if (built.kind === 'keep') {
			this.snapshot = null
			return this.load(this.startUrl())
		}
		const seq = ++this.navigationSeq
		return this.whenProxyReady(view, wc => {
			if (this.navigationSeq !== seq) return
			this.snapshot = null
			wc.navigationHistory.restore(built.snapshot).catch(() => undefined)
		})
	}

	// Where a new view (or a retry with nothing loaded) opens.
	private startUrl(): string {
		return startPage(this.deps.settings().exploreLastUrl, this.lastPageScope, this.homeUrl)
	}

	private isEnabled(): boolean {
		return this.deps.settings().exploreEnabled !== false
	}

	// With a view, the blocker's own status. Without one the blocker is
	// unhooked, so the setting decides: off, or starting (it starts with the
	// next view, before its first page).
	private adBlockStatus(): ExploreAdBlockStatus {
		if (this.view) return this.deps.adBlock.getStatus()
		return isExploreAdBlockOn(this.deps.settings()) ? 'starting' : 'off'
	}

	// The first page waits for the blocker, within reason.
	private async startAdBlock(view: WebContentsView): Promise<void> {
		let timer: NodeJS.Timeout | undefined
		const waited = new Promise<void>(resolve => {
			timer = setTimeout(resolve, AD_BLOCK_START_WAIT_MS)
		})
		try {
			await Promise.race([this.syncAdBlock(view), waited])
		} finally {
			clearTimeout(timer)
		}
	}

	// Brings the blocker in line with the setting; a page already shown reloads
	// so the change takes effect. Never while a refused proxy blanks the page.
	private async syncAdBlock(view: WebContentsView): Promise<void> {
		const changed = await this.deps.adBlock.apply(isExploreAdBlockOn(this.deps.settings()))
		if (!changed || this.view !== view || this.proxyRefused || view.webContents.getURL() === '') return
		await this.whenProxyReady(view, wc => wc.reload())
	}

	private createView(): WebContentsView {
		const ses = this.deps.session.getSession()
		// No Arroxy preload: the page gets nothing beyond what a plain browser tab
		// has. The only script added is the ad blocker's cosmetic preload, set on
		// the session (not here) while the user has the blocker on.
		const view = new WebContentsView({webPreferences: {session: ses, sandbox: true, contextIsolation: true, nodeIntegration: false, devTools: !this.deps.isPackaged, backgroundThrottling: true}})
		this.view = view
		this.pointerInView = false
		this.wire(view.webContents)
		this.watchClose(view)
		view.webContents.setAudioMuted(!this.active)
		this.watchCookies(ses)
		this.deps.window.contentView.addChildView(view)
		if (this.bounds) view.setBounds(this.bounds)
		view.setVisible(this.visible)
		logger.info('explore view created')
		this.refreshSignedIn()
		this.emitState()
		return view
	}

	private wire(wc: WebContents): void {
		wc.setWindowOpenHandler(details => {
			this.routeWindowOpen(details.url)
			return {action: 'deny'}
		})
		wc.on('before-mouse-event', (_event, mouse) => {
			if (mouse.type === 'mouseLeave') {
				this.pointerInView = false
				return
			}
			// mouseEnter is always an entry, even when a leave went unseen.
			if (this.pointerInView && mouse.type !== 'mouseEnter') return
			this.pointerInView = true
			this.deps.pointerEntered()
		})
		wc.on('input-event', (_event, input) => {
			if (ACTIVATING_INPUT.has(input.type)) this.lastActivationAt = performance.now()
		})
		// Only the link's address crosses: the page's text and media stay out of it.
		wc.on('context-menu', (_event, params) => {
			if (!this.proxyRefused) this.deps.linkMenu(params.linkURL)
		})
		// will-frame-navigate fires first for a main frame; when it lets a
		// navigation through, will-navigate re-asks and gets the same answer.
		wc.on('will-frame-navigate', details => this.guard(details, 'navigation'))
		wc.on('will-navigate', details => this.guard(details, 'navigation'))
		wc.on('will-redirect', details => this.guard(details, 'redirect'))
		answerProxyLogins(wc, () => this.deps.settings().proxyUrl)
		wc.on('did-fail-load', (_event, code, description, _url, isMainFrame) => {
			const failure = pageLoadFailure(code, description, isMainFrame)
			if (failure === null) return
			logger.warn('explore view page failed to load', {code, failure})
			this.setPageError(failure)
		})
		wc.on('render-process-gone', (_event, details) => {
			logger.warn('explore view renderer gone', {reason: details.reason})
			this.setPageError('load')
		})
		wc.on('media-started-playing', () => {
			this.mediaPlaying = true
		})
		wc.on('media-paused', () => {
			this.mediaPlaying = false
		})
		wc.on('did-navigate', (_event, url) => {
			this.mediaPlaying = false
			dropBlankEntryBehind(wc)
			this.lastPage.record(url)
			// Only a proxy that applies clears a refusal (whenProxyReady).
			if (!this.proxyRefused) this.error = null
			this.refreshSignedIn({verify: this.isOnSite(url)})
			this.emitState()
		})
		wc.on('did-navigate-in-page', (_event, url, isMainFrame) => {
			if (!isMainFrame) return
			// YouTube is a single-page app: most of its page changes are in-page.
			this.lastPage.record(url)
			this.refreshSignedIn()
			this.emitState()
		})
		wc.on('did-start-loading', () => this.emitState())
		wc.on('did-stop-loading', () => this.emitState())
		wc.on('page-title-updated', () => this.emitState())
	}

	// Subframes are not filtered (spec: like subresources, they are not policed in v1),
	// so embedded sign-in widgets such as reCAPTCHA keep working.
	private guard(details: NavigationEvent, via: 'navigation' | 'redirect'): void {
		if (!details.isMainFrame) return
		// Fail closed: the session still routes the way the refused setting replaced.
		if (this.proxyRefused) {
			details.preventDefault()
			return
		}
		const decision = decideNavigation(details.url)
		if (decision.kind === 'allow') return
		details.preventDefault()
		// Logs the host only: a URL's path and query can carry session material.
		logger.info('explore view blocked a navigation', {host: decision.host || '(none)', via})
	}

	// The page never gets a window: a web target loads in this view, and only on
	// the user's click, so a script or a subframe cannot replace the page on its own.
	private routeWindowOpen(url: string): void {
		const decision = decideNavigation(url)
		if (decision.kind !== 'allow') {
			logger.info('explore view blocked a navigation', {host: decision.host || '(none)', via: 'window-open'})
			return
		}
		if (this.hasUserActivation()) {
			void this.load(url)
			return
		}
		logger.info('explore view blocked a popup without user input', {host: hostOf(url)})
	}

	private hasUserActivation(): boolean {
		return performance.now() - this.lastActivationAt <= USER_ACTIVATION_MS
	}

	// The site's own pages, not a sign-in or consent hop on the way back to it.
	private isOnSite(url: string): boolean {
		try {
			return hostMatches(new URL(url).hostname, this.cookieHosts)
		} catch {
			return false
		}
	}

	private load(url: string): Promise<void> {
		const view = this.view
		if (!view) return Promise.resolve()
		this.navigationSeq++
		// A page the user asked for replaces any unloaded history still waiting.
		this.snapshot = null
		// Failures (and YouTube's benign self-abort) arrive through did-fail-load.
		return this.whenProxyReady(view, wc => void wc.loadURL(url).catch(() => undefined))
	}

	// Fail closed: nothing reaches the network until the partition's proxy is in effect.
	private async whenProxyReady(view: WebContentsView, go: (wc: WebContents) => void): Promise<void> {
		let ready = true
		try {
			// The session replaces its readiness on every proxy change: a wait that
			// outlived its promise must not apply a route a newer setting refused.
			let awaited: Promise<void>
			do {
				awaited = this.deps.session.whenReady()
				await awaited
			} while (awaited !== this.deps.session.whenReady())
		} catch (err) {
			ready = false
			logger.warn('explore view loads nothing: proxy not ready', {error: err instanceof Error ? err.message : String(err)})
		}
		if (this.view !== view) return
		if (!ready) {
			this.refuseProxy(view)
			return
		}
		this.error = null
		this.proxyRefused = false
		this.resumeUrl = null
		go(view.webContents)
		this.emitState()
	}

	// A refused proxy's error stays until a setting applies (whenProxyReady):
	// the blanked page failing or crashing behind it says nothing new.
	private setPageError(error: ExploreViewError): void {
		if (this.proxyRefused) return
		this.error = error
		this.emitState()
	}

	// Fail closed on a proxy the session refused: the page it was on is stopped
	// and blanked (kept in memory only, to come back once a setting applies), and
	// the error stays until then.
	private refuseProxy(view: WebContentsView): void {
		const wc = view.webContents
		const url = wc.getURL()
		if (!this.proxyRefused && url !== '') {
			this.resumeUrl = url
			blankPage(wc)
		}
		this.proxyRefused = true
		this.error = 'proxy'
		this.emitState()
	}

	private watchCookies(ses: Session): void {
		// Only the cookie's domain is read: names and values never leave Electron here.
		const onChanged = (_event: unknown, cookie: Cookie): void => {
			if (!hostMatches((cookie.domain ?? '').replace(/^\./, ''), this.cookieHosts)) return
			clearTimeout(this.cookieTimer)
			this.cookieTimer = setTimeout(() => this.refreshSignedIn(), SIGNED_IN_DEBOUNCE_MS)
		}
		ses.cookies.on('changed', onChanged)
		this.detachCookies = () => ses.cookies.off('changed', onChanged)
	}

	// Presence of the auth cookies, unless a download verified the session
	// signed out: then only the site's own answer clears it — asked when the mark
	// is set and again on each full page load of the site itself.
	private refreshSignedIn(opts: {verify?: boolean} = {}): void {
		const read = ++this.signedInRead
		if (this.verifiedSignedOut) {
			if (opts.verify) this.recheckVerifiedSignOut()
			return
		}
		this.deps.session.hasAuthCookies(SITE_SCOPE).then(
			signedIn => {
				if (read === this.signedInRead && !this.verifiedSignedOut) this.setSignedIn(signedIn)
			},
			(err: unknown) => logger.warn('explore view could not read sign-in state', {error: err instanceof Error ? err.message : String(err)})
		)
	}

	private recheckVerifiedSignOut(): void {
		// verifySignedIn answers `unknown` rather than rejecting; the handler is only a guard.
		this.deps.session.verifySignedIn(SITE_SCOPE).then(
			state => {
				if (state !== 'signedIn' || !this.verifiedSignedOut) return
				this.verifiedSignedOut = false
				this.refreshSignedIn()
			},
			() => undefined
		)
	}

	private setSignedIn(signedIn: boolean): void {
		// Supersedes any presence read still in flight.
		this.signedInRead++
		this.signedIn = signedIn
		this.emitState()
	}

	private emitState(): void {
		if (this.windowClosed) return
		const state = this.getState()
		if (this.lastEmitted && sameState(this.lastEmitted, state)) return
		this.lastEmitted = state
		this.deps.emit({...state})
	}
}
