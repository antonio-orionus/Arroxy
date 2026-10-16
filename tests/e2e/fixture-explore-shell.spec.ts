import http from 'node:http'
import {expect, test, type ElectronApplication, type Page} from '@playwright/test'
import {exploreViewStateSchema} from '../../src/shared/schemas.js'
import {withFixtureProductApp} from './fixtureProductE2E.js'

// Explore shell risk group: the native browser view is the one part of the app
// that renders the open web, so its shell guarantees are checked in the real
// Electron app. The failure modes are a view (and a page load) that exists
// before the user opted in, a view sharing the app's default session or
// announcing Electron in its user agent, a view painting over a dialog, sign-in
// material reaching the renderer through the state API, a link that drags the
// view off the allowlist or opens the system browser without a click, and a kill
// switch that hides the tab but leaves the view alive.
//
// Fixtures: ARROXY_E2E_EXPLORE_HOME points the view at a static page served
// here on 127.0.0.1; its origin is the only one the harness adds to the view's
// allowlist. A second local server stands in for an off-allowlist site: it must
// never be asked for anything. The Explore partition does not route through
// the harness's deny proxy (that guards yt-dlp), so the no-internet guarantee
// here is different: every URL the view is given is a 127.0.0.1 one, and the
// outside server's empty request log proves the policy kept the view off it.

interface PageRequest {
	path: string
	userAgent: string
}

interface PageServer {
	origin: string
	requests: PageRequest[]
	close: () => Promise<void>
}

async function startPageServer(body: (path: string) => string): Promise<PageServer> {
	const requests: PageRequest[] = []
	const server = http.createServer((req, res) => {
		const path = new URL(req.url ?? '/', 'http://127.0.0.1').pathname
		requests.push({path, userAgent: req.headers['user-agent'] ?? ''})
		if (path === '/favicon.ico') {
			res.writeHead(404)
			res.end()
			return
		}
		res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
		res.end(body(path))
	})
	await new Promise<void>((resolve, reject) => {
		server.once('error', reject)
		server.listen(0, '127.0.0.1', () => resolve())
	})
	const address = server.address()
	if (address === null || typeof address === 'string') throw new Error('page server did not bind to a TCP port')
	return {origin: `http://127.0.0.1:${address.port}`, requests, close: () => new Promise<void>(resolve => server.close(() => resolve()))}
}

// The outside site's own page; served only if the policy failed.
function outsidePage(): string {
	return '<!doctype html><title>Outside</title><p>Off the allowlist</p>'
}

// Two tall links to the outside origin, one per kind of click, and one to a
// second page on the home origin.
function homePage(outsideOrigin: string): string {
	const link = 'display:block;height:96px;font:24px sans-serif'
	return `<!doctype html><html><head><title>Explore fixture home</title></head><body style="margin:0"><a id="clicked" style="${link}" href="${outsideOrigin}/clicked">Clicked by the user</a><a id="scripted" style="${link}" href="${outsideOrigin}/scripted">Clicked by a script</a><a id="next" style="${link}" href="/next">Next page</a></body></html>`
}

function nextPage(): string {
	return '<!doctype html><title>Explore fixture next</title><p>The second page</p>'
}

async function withExplorePages(run: (pages: {home: PageServer; outside: PageServer; homeUrl: string}) => Promise<void>): Promise<void> {
	const outside = await startPageServer(outsidePage)
	const home = await startPageServer(path => (path === '/next' ? nextPage() : homePage(outside.origin)))
	try {
		await run({home, outside, homeUrl: `${home.origin}/`})
	} finally {
		await Promise.all([home.close(), outside.close()])
	}
}

interface ViewFacts {
	children: number
	visible: boolean | null
	url: string | null
	loading: boolean | null
	userAgent: string | null
	defaultSession: boolean | null
	explorePartition: boolean | null
}

const POLL = {timeout: 15_000}

// One look at the main window's child views, from main. Booleans and strings
// only: nothing from the Explore session (cookies least of all) leaves Electron.
function viewFacts(app: ElectronApplication): Promise<ViewFacts> {
	return app.evaluate(({BrowserWindow, WebContentsView, session}) => {
		// The renderer window is the one on file://; hidden helper windows load the web.
		const win = BrowserWindow.getAllWindows().find(w => w.webContents.getURL().startsWith('file:'))
		if (!win) throw new Error('main window not found')
		const children = win.contentView.children
		const view = children.find(child => child instanceof WebContentsView)
		if (!(view instanceof WebContentsView)) return {children: children.length, visible: null, url: null, loading: null, userAgent: null, defaultSession: null, explorePartition: null}
		const wc = view.webContents
		return {children: children.length, visible: view.getVisible(), url: wc.getURL(), loading: wc.isLoading(), userAgent: wc.getUserAgent(), defaultSession: wc.session === session.defaultSession, explorePartition: wc.session === session.fromPartition('persist:arroxy-explore')}
	})
}

async function expectHomeLoaded(app: ElectronApplication, homeUrl: string): Promise<void> {
	await expect.poll(async () => viewFacts(app), {timeout: 30_000}).toMatchObject({children: 1, url: homeUrl, loading: false, visible: true})
}

// The stub's record, kept in the main process between evaluate calls.
declare global {
	var __arroxyE2eOpenExternalCalls: string[] | undefined
}

// The view hands user-clicked off-allowlist links to shell.openExternal; the
// test records them instead, so the user's real browser never opens.
async function stubOpenExternal(app: ElectronApplication): Promise<void> {
	await app.evaluate(({shell}) => {
		const calls: string[] = []
		globalThis.__arroxyE2eOpenExternalCalls = calls
		shell.openExternal = url => {
			calls.push(url)
			return Promise.resolve()
		}
	})
}

async function openExternalCalls(app: ElectronApplication): Promise<string[]> {
	const calls = await app.evaluate(() => globalThis.__arroxyE2eOpenExternalCalls)
	if (!calls) throw new Error('openExternal stub is not installed')
	return calls
}

// A round trip renderer → main → renderer over the app's own IPC: any
// explore:* call the renderer sent before it has been handled in main by the
// time it returns (one ipcRenderer, in order).
async function fenceRendererToMain(page: Page): Promise<void> {
	await page.evaluate(async () => {
		await window.appApi.explore.getState()
	})
}

// A round trip through the view's renderer and back to main: a navigation the
// page started before it (an element.click()) has reached main's navigation
// events by then, so it is decided before anything sent after the fence.
async function fenceViewToMain(app: ElectronApplication): Promise<void> {
	await app.evaluate(async ({BrowserWindow, WebContentsView}) => {
		const win = BrowserWindow.getAllWindows().find(w => w.webContents.getURL().startsWith('file:'))
		const view = win?.contentView.children.find(child => child instanceof WebContentsView)
		if (!(view instanceof WebContentsView)) throw new Error('no Explore view')
		await view.webContents.executeJavaScript('new Promise(resolve => setTimeout(resolve, 0))')
		await new Promise(resolve => setImmediate(resolve))
	})
}

// `input`: a real mouse click delivered to the view's renderer, as the OS
// would; `script`: the page's own element.click(), which is no user input.
async function clickLinkInView(app: ElectronApplication, id: string, how: 'input' | 'script'): Promise<void> {
	const clicked = await app.evaluate(
		async ({BrowserWindow, WebContentsView}, {id, how}) => {
			const win = BrowserWindow.getAllWindows().find(w => w.webContents.getURL().startsWith('file:'))
			const view = win?.contentView.children.find(child => child instanceof WebContentsView)
			if (!(view instanceof WebContentsView)) return false
			const wc = view.webContents
			const selector = JSON.stringify(`#${id}`)
			if (how === 'script') {
				const done: unknown = await wc.executeJavaScript(`(() => { const a = document.querySelector(${selector}); if (!a) return false; a.click(); return true })()`)
				return done === true
			}
			const point: unknown = await wc.executeJavaScript(`(() => { const a = document.querySelector(${selector}); if (!a) return null; const r = a.getBoundingClientRect(); return {x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2)} })()`)
			if (typeof point !== 'object' || point === null || !('x' in point) || !('y' in point) || typeof point.x !== 'number' || typeof point.y !== 'number') return false
			wc.sendInputEvent({type: 'mouseMove', x: point.x, y: point.y})
			wc.sendInputEvent({type: 'mouseDown', x: point.x, y: point.y, button: 'left', clickCount: 1})
			wc.sendInputEvent({type: 'mouseUp', x: point.x, y: point.y, button: 'left', clickCount: 1})
			return true
		},
		{id, how}
	)
	if (clicked !== true) throw new Error(`#${id} is not on the page in the Explore view: it left the home page`)
}

// Actions: launch with a fresh Explore partition; open the Explore tab; read
// the notice; Continue; open and close About; read the state API; turn the tab
// off in Settings.
// Milestones: the notice, then the home page loaded in the view; the About
// dialog open, then closed; the tab trigger gone.
// Oracles: no child view (and no page request) until Continue; one view after,
// on the Explore partition, not the default session, with a UA carrying
// Desktop/1.0 and no Electron/ — in the request the page server received too;
// hidden while About is open, shown after; the state API returns exactly the
// ExploreViewState keys, none cookie-like; the kill switch destroys the view.
test('Explore view is created only after the notice, isolated, hidden under dialogs, and removed by the kill switch', async () => {
	test.setTimeout(120_000)

	await withExplorePages(async ({home, outside, homeUrl}) => {
		await withFixtureProductApp({exploreHomeUrl: homeUrl, userDataPrefix: 'arroxy-fixture-explore-shell-user-', outputPrefix: 'arroxy-fixture-explore-shell-out-'}, async ({app, page}) => {
			expect((await viewFacts(app)).children).toBe(0)

			await page.locator('.explore-tab-trigger').click()
			await expect(page.getByTestId('explore-notice')).toBeVisible()
			expect((await viewFacts(app)).children).toBe(0)
			// Anything the notice screen sent to main has landed by now: still no view.
			await fenceRendererToMain(page)
			expect((await viewFacts(app)).children).toBe(0)
			expect(home.requests).toEqual([])

			await page.getByTestId('explore-notice-continue').click()
			await expect(page.getByTestId('explore-viewport')).toBeVisible()
			await expectHomeLoaded(app, homeUrl)

			const facts = await viewFacts(app)
			expect(facts.defaultSession).toBe(false)
			expect(facts.explorePartition).toBe(true)
			expect(facts.userAgent).toContain('Desktop/1.0')
			expect(facts.userAgent).not.toContain('Electron/')
			const homeLoads = home.requests.filter(request => request.path === '/')
			expect(homeLoads.length).toBeGreaterThan(0)
			for (const request of homeLoads) {
				expect(request.userAgent).toContain('Desktop/1.0')
				expect(request.userAgent).not.toContain('Electron/')
			}

			const result = await page.evaluate(() => window.appApi.explore.getState())
			expect(result.ok).toBe(true)
			if (!result.ok) throw new Error('getState failed')
			expect(Object.keys(result.data).sort()).toEqual(Object.keys(exploreViewStateSchema.shape).sort())
			expect(Object.keys(result.data).filter(key => /cookie/i.test(key))).toEqual([])
			expect(result.data.url).toBe(homeUrl)

			// The fixture home is no video, playlist or channel: the download controls stay off.
			for (const id of ['explore-download', 'explore-profile-trigger', 'explore-interactive']) await expect(page.getByTestId(id)).toBeDisabled()

			await page.getByTestId('btn-about').click()
			await expect(page.getByTestId('about-dialog')).toBeVisible()
			await expect.poll(async () => (await viewFacts(app)).visible, POLL).toBe(false)
			await page.keyboard.press('Escape')
			await expect(page.getByTestId('about-dialog')).toHaveCount(0)
			await expect.poll(async () => (await viewFacts(app)).visible, POLL).toBe(true)

			expect((await viewFacts(app)).children).toBe(1)
			await page.getByRole('tab', {name: 'Settings'}).click()
			const enabled = page.getByTestId('explore-settings-enabled')
			await expect(enabled).toBeChecked()
			await enabled.click()
			await expect(enabled).not.toBeChecked()
			await expect(page.locator('.explore-tab-trigger')).toHaveCount(0)
			await expect.poll(async () => (await viewFacts(app)).children, POLL).toBe(0)

			expect(outside.requests).toEqual([])
		})
	})
})

// Actions: open the Explore tab (notice already acknowledged); the page clicks
// an outside link by script; then the user clicks the other outside link.
// Milestones: the home page loaded; the user's click reaches the system-browser
// hand-off (P2-R11: input within 1 s makes it the user's own navigation).
// Oracles: the hand-off received exactly the user-clicked URL — the scripted
// click got nothing; the view never left the home page; the outside server was
// never asked for anything.
test('Explore view keeps off-allowlist links out of the view and hands only a user click to the system browser', async () => {
	test.setTimeout(120_000)

	await withExplorePages(async ({outside, homeUrl}) => {
		await withFixtureProductApp(
			{
				exploreHomeUrl: homeUrl,
				settings: settings => {
					settings.common.exploreNoticeSeen = true
				},
				userDataPrefix: 'arroxy-fixture-explore-nav-user-',
				outputPrefix: 'arroxy-fixture-explore-nav-out-'
			},
			async ({app, page}) => {
				await page.locator('.explore-tab-trigger').click()
				await expectHomeLoaded(app, homeUrl)
				await stubOpenExternal(app)

				await clickLinkInView(app, 'scripted', 'script')
				// The scripted navigation is decided before the user's click exists,
				// so the click's activation window cannot cover it.
				await fenceViewToMain(app)
				await clickLinkInView(app, 'clicked', 'input')
				// The user's click is decided after the scripted one, so one call settles both.
				await expect.poll(async () => openExternalCalls(app), POLL).toEqual([`${outside.origin}/clicked`])

				// Settled: no navigation of the view is still under way.
				await expect.poll(async () => (await viewFacts(app)).loading, POLL).toBe(false)
				const facts = await viewFacts(app)
				expect(facts.url).toBe(homeUrl)
				await expect(page.getByTestId('explore-address')).toHaveValue(homeUrl)
				expect(outside.requests).toEqual([])
			}
		)
	})
})

interface ZoomFacts {
	zoom: number
	view: {x: number; y: number; width: number; height: number} | null
	muted: boolean | null
}

function zoomFacts(app: ElectronApplication): Promise<ZoomFacts> {
	return app.evaluate(({BrowserWindow, WebContentsView}) => {
		const win = BrowserWindow.getAllWindows().find(w => w.webContents.getURL().startsWith('file:'))
		if (!win) throw new Error('main window not found')
		const view = win.contentView.children.find(child => child instanceof WebContentsView)
		if (!(view instanceof WebContentsView)) return {zoom: win.webContents.getZoomFactor(), view: null, muted: null}
		return {zoom: win.webContents.getZoomFactor(), view: view.getBounds(), muted: view.webContents.isAudioMuted()}
	})
}

async function setMainZoom(app: ElectronApplication, factor: number): Promise<void> {
	await app.evaluate(({BrowserWindow}, value) => {
		const win = BrowserWindow.getAllWindows().find(w => w.webContents.getURL().startsWith('file:'))
		if (!win) throw new Error('main window not found')
		win.webContents.setZoomFactor(value)
	}, factor)
}

// Actions: open the Explore tab (notice already acknowledged); zoom the main
// window to 125% as the View menu's Zoom In would; back to 100%; open the
// Settings tab.
// Milestones: the home page loaded; the zoom factor in effect in main.
// Oracles: the view's DIP bounds equal the placeholder's CSS rect times the
// main window's zoom factor, at 125% and back at 100% (P2-R29); the page is
// unmuted while Explore is the active tab and muted once another tab is
// (P2-R32).
test('Explore view follows the main window zoom and is muted off the Explore tab', async () => {
	test.setTimeout(120_000)

	await withExplorePages(async ({homeUrl}) => {
		await withFixtureProductApp(
			{
				exploreHomeUrl: homeUrl,
				settings: settings => {
					settings.common.exploreNoticeSeen = true
				},
				userDataPrefix: 'arroxy-fixture-explore-zoom-user-',
				outputPrefix: 'arroxy-fixture-explore-zoom-out-'
			},
			async ({app, page}) => {
				await page.locator('.explore-tab-trigger').click()
				await expectHomeLoaded(app, homeUrl)
				await expect.poll(async () => (await zoomFacts(app)).muted, POLL).toBe(false)

				for (const factor of [1.25, 1]) {
					await setMainZoom(app, factor)
					await expect
						.poll(async () => {
							const facts = await zoomFacts(app)
							const rect = await page.getByTestId('explore-viewport').evaluate(node => {
								const box = node.getBoundingClientRect()
								return {x: box.x, y: box.y, width: box.width, height: box.height}
							})
							if (!facts.view || facts.zoom !== factor) return null
							// Rounding to whole DIP on each edge: within 1 px.
							return [facts.view.x - rect.x * factor, facts.view.y - rect.y * factor, facts.view.width - rect.width * factor, facts.view.height - rect.height * factor].every(delta => Math.abs(delta) <= 1)
						}, POLL)
						.toBe(true)
				}

				await page.getByRole('tab', {name: 'Settings'}).click()
				await expect.poll(async () => (await zoomFacts(app)).muted, POLL).toBe(true)
			}
		)
	})
})

// Actions: open the Explore tab (notice already acknowledged); click the link
// to the home origin's second page; quit and relaunch the app on the same
// profile; open the Explore tab again.
// Milestones: the home page loaded; the second page committed in the view.
// Oracles (P2-R34): after the restart the view opens on the second page, not
// home — the view's URL, the address bar, and the page server, which is asked
// for the second page and never for home. The fixture origin stands in for
// the site (the E2E home override is the only origin kept under it).
test('Explore reopens the last page after an app restart', async () => {
	test.setTimeout(150_000)

	await withExplorePages(async ({home, homeUrl}) => {
		await withFixtureProductApp(
			{
				exploreHomeUrl: homeUrl,
				settings: settings => {
					settings.common.exploreNoticeSeen = true
				},
				userDataPrefix: 'arroxy-fixture-explore-restore-user-',
				outputPrefix: 'arroxy-fixture-explore-restore-out-'
			},
			async ({app, page, relaunch}) => {
				const nextUrl = `${home.origin}/next`
				await page.locator('.explore-tab-trigger').click()
				await expectHomeLoaded(app, homeUrl)

				await clickLinkInView(app, 'next', 'input')
				await expect.poll(async () => viewFacts(app), {timeout: 30_000}).toMatchObject({url: nextUrl, loading: false})
				await expect(page.getByTestId('explore-address')).toHaveValue(nextUrl)

				const before = home.requests.length
				const relaunched = await relaunch()
				await relaunched.page.locator('.explore-tab-trigger').click()
				await expect.poll(async () => viewFacts(relaunched.app), {timeout: 30_000}).toMatchObject({children: 1, url: nextUrl, loading: false, visible: true})
				await expect(relaunched.page.getByTestId('explore-address')).toHaveValue(nextUrl)

				const paths = home.requests.slice(before).map(request => request.path)
				expect(paths).toContain('/next')
				expect(paths).not.toContain('/')
			}
		)
	})
})

// Actions: open the Explore tab (notice already acknowledged); type the home
// origin's second page into the address bar and press Enter; then type a page
// on the outside origin and press Enter.
// Milestones: the home page loaded; the second page committed in the view.
// Oracles (P2-R45): a typed site address loads in the view — the view's URL,
// the address bar, and the page server's log. A typed address on another site
// loads nothing: the view stays on the second page, the hint shows with its
// Download offer, the system-browser hand-off is never called (typing is no
// page gesture), and the outside server is never asked. The fixture origin
// stands in for the site (the E2E home override's origin, as main treats it).
test('Explore address bar loads a typed site address and keeps another site out', async () => {
	test.setTimeout(120_000)

	await withExplorePages(async ({home, outside, homeUrl}) => {
		await withFixtureProductApp(
			{
				exploreHomeUrl: homeUrl,
				settings: settings => {
					settings.common.exploreNoticeSeen = true
				},
				userDataPrefix: 'arroxy-fixture-explore-address-user-',
				outputPrefix: 'arroxy-fixture-explore-address-out-'
			},
			async ({app, page}) => {
				const nextUrl = `${home.origin}/next`
				await page.locator('.explore-tab-trigger').click()
				await expectHomeLoaded(app, homeUrl)
				await stubOpenExternal(app)
				const address = page.getByTestId('explore-address')

				await address.click()
				await address.fill(nextUrl)
				await address.press('Enter')
				await expect.poll(async () => viewFacts(app), {timeout: 30_000}).toMatchObject({url: nextUrl, loading: false})
				await expect(address).toHaveValue(nextUrl)
				expect(home.requests.map(request => request.path)).toContain('/next')

				await address.click()
				await address.fill(`${outside.origin}/typed`)
				await address.press('Enter')
				await expect(page.getByTestId('explore-address-hint')).toBeVisible()
				await expect(page.getByTestId('explore-address-hint-download')).toBeVisible()
				// Main has answered the address by now; nothing is under way in the view.
				await fenceRendererToMain(page)
				await expect.poll(async () => (await viewFacts(app)).loading, POLL).toBe(false)
				expect((await viewFacts(app)).url).toBe(nextUrl)
				expect(await openExternalCalls(app)).toEqual([])
				expect(outside.requests).toEqual([])

				await address.press('Escape')
				await expect(page.getByTestId('explore-address-hint')).toHaveCount(0)
				await expect(address).toHaveValue(nextUrl)
			}
		)
	})
})
