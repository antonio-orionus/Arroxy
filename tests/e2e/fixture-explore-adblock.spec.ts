import http from 'node:http'
import {expect, test, type ElectronApplication} from '@playwright/test'
import {withFixtureProductApp} from './fixtureProductE2E.js'

// Explore ad blocker (P2-R36, off until the user turns it on). The user-facing
// risks: a page filtered on a fresh install, a page that keeps loading ads after
// the shield is turned on, a toggle that does nothing until some later
// navigation, and an on choice that is lost on restart.
//
// Fixtures: the Explore view opens a local home page that loads two scripts
// from a second local origin — an "ad" the seeded filter list names, and plain
// content. ARROXY_E2E_EXPLORE_ADBLOCK_FILTERS builds the engine from that one
// line, so no list is ever fetched. The second origin's request log is the
// oracle: the ad is requested only while the shield is off, and the content
// script is requested on every load (its count marks each reload).

const AD_PATH = '/arroxy-fixture-ad.js'
const CONTENT_PATH = '/content.js'
// A network filter for the ad script, and a cosmetic one for the banner (it
// needs the library's preload and its IPC, in the sandboxed Explore page).
const FILTERS = `${AD_PATH}\n127.0.0.1##.fixture-ad-banner\n`

interface Server {
	origin: string
	paths: string[]
	close: () => Promise<void>
}

async function startServer(respond: (path: string) => {type: string; body: string}): Promise<Server> {
	const paths: string[] = []
	const server = http.createServer((req, res) => {
		const path = new URL(req.url ?? '/', 'http://127.0.0.1').pathname
		paths.push(path)
		const {type, body} = respond(path)
		res.writeHead(200, {'Content-Type': type, 'Cache-Control': 'no-store'})
		res.end(body)
	})
	await new Promise<void>((resolve, reject) => {
		server.once('error', reject)
		server.listen(0, '127.0.0.1', () => resolve())
	})
	const address = server.address()
	if (address === null || typeof address === 'string') throw new Error('server did not bind to a TCP port')
	return {origin: `http://127.0.0.1:${address.port}`, paths, close: () => new Promise<void>(resolve => server.close(() => resolve()))}
}

function count(server: Server, path: string): number {
	return server.paths.filter(requested => requested === path).length
}

// Whether the page's banner is hidden, read in the Explore view.
async function bannerHidden(app: ElectronApplication): Promise<boolean | null> {
	return app.evaluate(async ({BrowserWindow, WebContentsView}) => {
		const win = BrowserWindow.getAllWindows().find(w => w.webContents.getURL().startsWith('file:'))
		const view = win?.contentView.children.find(child => child instanceof WebContentsView)
		if (!(view instanceof WebContentsView)) return null
		const hidden: unknown = await view.webContents.executeJavaScript(`(() => { const b = document.getElementById('banner'); return b ? getComputedStyle(b).display === 'none' : null })()`)
		return typeof hidden === 'boolean' ? hidden : null
	})
}

async function viewUrl(app: ElectronApplication): Promise<string | null> {
	return app.evaluate(({BrowserWindow, WebContentsView}) => {
		const win = BrowserWindow.getAllWindows().find(w => w.webContents.getURL().startsWith('file:'))
		const view = win?.contentView.children.find(child => child instanceof WebContentsView)
		return view instanceof WebContentsView && !view.webContents.isLoading() ? view.webContents.getURL() : null
	})
}

const POLL = {timeout: 30_000}

// Actions: open the Explore tab with the setting never written; click the
// shield on; quit and relaunch, open the Explore tab; click it off again.
// Milestones: each load of the home page, marked by its content script
// reaching the second origin; the shield's state.
// Oracles: the ad is requested on the first load (the blocker is off by
// default), is not requested on the load after the shield goes on nor on the
// first load after a restart (the on choice persisted), and is requested
// again once the shield is back off; the content script loads every time; the
// banner is hidden exactly while the shield is on.
test('Explore ad blocker is off by default, turns on from the shield, and the on choice survives a restart', async () => {
	test.setTimeout(150_000)
	const ads = await startServer(path => ({type: 'text/javascript', body: `/* ${path} */`}))
	const home = await startServer(() => ({type: 'text/html; charset=utf-8', body: `<!doctype html><title>Ad fixture</title><p>Page</p><div class="fixture-ad-banner" id="banner">Banner</div><script src="${ads.origin}${AD_PATH}"></script><script src="${ads.origin}${CONTENT_PATH}"></script>`}))
	const homeUrl = `${home.origin}/`
	try {
		await withFixtureProductApp(
			{
				exploreHomeUrl: homeUrl,
				exploreAdBlockFilters: FILTERS,
				settings: settings => {
					settings.common.exploreNoticeSeen = true
					expect(settings.common.exploreAdBlock).toBeUndefined()
				},
				userDataPrefix: 'arroxy-fixture-explore-adblock-user-',
				outputPrefix: 'arroxy-fixture-explore-adblock-out-'
			},
			async ({app, page, relaunch}) => {
				await page.locator('.explore-tab-trigger').click()
				const shield = page.getByTestId('explore-adblock')
				await expect(shield).toHaveAttribute('data-adblock', 'off', POLL)
				await expect.poll(() => count(ads, CONTENT_PATH), POLL).toBe(1)
				await expect.poll(async () => viewUrl(app), POLL).toBe(homeUrl)
				await expect.poll(() => count(ads, AD_PATH), POLL).toBe(1)
				await expect.poll(async () => bannerHidden(app), POLL).toBe(false)

				await shield.click()
				await expect(shield).toHaveAttribute('data-adblock', 'on', POLL)
				// The toggle reloads the page itself.
				await expect.poll(() => count(ads, CONTENT_PATH), POLL).toBe(2)
				await expect.poll(async () => viewUrl(app), POLL).toBe(homeUrl)
				expect(count(ads, AD_PATH)).toBe(1)
				await expect.poll(async () => bannerHidden(app), POLL).toBe(true)

				const relaunched = await relaunch()
				await relaunched.page.locator('.explore-tab-trigger').click()
				const relaunchedShield = relaunched.page.getByTestId('explore-adblock')
				await expect(relaunchedShield).toHaveAttribute('data-adblock', 'on', POLL)
				await expect.poll(() => count(ads, CONTENT_PATH), POLL).toBe(3)
				await expect.poll(async () => viewUrl(relaunched.app), POLL).toBe(homeUrl)
				expect(count(ads, AD_PATH)).toBe(1)
				await expect.poll(async () => bannerHidden(relaunched.app), POLL).toBe(true)

				await relaunchedShield.click()
				await expect(relaunchedShield).toHaveAttribute('data-adblock', 'off')
				await expect.poll(() => count(ads, CONTENT_PATH), POLL).toBe(4)
				await expect.poll(() => count(ads, AD_PATH), POLL).toBe(2)
				await expect.poll(async () => bannerHidden(relaunched.app), POLL).toBe(false)
			}
		)
	} finally {
		await Promise.all([home.close(), ads.close()])
	}
})
