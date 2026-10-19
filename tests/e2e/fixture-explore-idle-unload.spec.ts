import http from 'node:http'
import {expect, test, type ElectronApplication, type Page} from '@playwright/test'
import type {ExploreCookie} from '../../src/shared/sites/types.js'
import {withFixtureProductApp} from './fixtureProductE2E.js'

// Explore idle unload risk group: a while after the user leaves the Explore
// tab, the page is released to free its memory, and coming back must bring it
// back where it was. The failure modes are a released page that comes back
// somewhere else (or without its Back/Forward history, or signed out of its
// session), a page released while a dialog only covers it, a page released
// that holds more than its URL (a watch page), and a sign-out that a released
// page's saved history quietly undoes.
//
// Fixtures: ARROXY_E2E_EXPLORE_HOME points the view at pages served here on
// 127.0.0.1, laid out like the site: home at /, search results at /results,
// a video at /watch. Every page sets a cookie and stamps a random marker per
// document, so a reload is told apart from the same page kept in memory.
// ARROXY_E2E_EXPLORE_IDLE_MS shortens the wait after leaving the tab.

const IDLE_MS = 1_500
const POLL = {timeout: 20_000}
// Off: a blocker that starts after the first page reloads it, which would read as a released page.
const SEEN = {exploreNoticeSeen: true, exploreAdBlock: false}

interface PageServer {
	origin: string
	requests: string[]
	close: () => Promise<void>
}

function fixturePage(title: string): string {
	return `<!doctype html><html><head><title>${title}</title><script>window.__marker = Math.random()</script></head><body><p>${title}</p><div style="height:3000px"></div></body></html>`
}

async function startSite(): Promise<PageServer> {
	const requests: string[] = []
	const server = http.createServer((req, res) => {
		const url = new URL(req.url ?? '/', 'http://127.0.0.1')
		if (url.pathname === '/favicon.ico') {
			res.writeHead(404)
			res.end()
			return
		}
		requests.push(`${url.pathname}${url.search}`)
		res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8', 'Set-Cookie': 'fixture_session=kept; Path=/; Max-Age=3600'})
		res.end(fixturePage(url.pathname === '/' ? 'Home' : `${url.pathname}${url.search}`))
	})
	await new Promise<void>((resolve, reject) => {
		server.once('error', reject)
		server.listen(0, '127.0.0.1', () => resolve())
	})
	const address = server.address()
	if (address === null || typeof address === 'string') throw new Error('fixture site did not bind to a TCP port')
	return {origin: `http://127.0.0.1:${address.port}`, requests, close: () => new Promise<void>(resolve => server.close(() => resolve()))}
}

async function withSite(run: (site: PageServer) => Promise<void>): Promise<void> {
	const site = await startSite()
	try {
		await run(site)
	} finally {
		await site.close()
	}
}

interface ViewFacts {
	views: number
	url: string | null
	loading: boolean | null
	marker: number | null
	cookie: string | null
}

// The main window's Explore view, as main sees it. The cookie is the fixture's own, never a site's.
function viewFacts(app: ElectronApplication): Promise<ViewFacts> {
	return app.evaluate(async ({BrowserWindow, WebContentsView}) => {
		const win = BrowserWindow.getAllWindows().find(w => w.webContents.getURL().startsWith('file:'))
		if (!win) throw new Error('main window not found')
		const views = win.contentView.children.filter(child => child instanceof WebContentsView)
		const view = views[0]
		if (!(view instanceof WebContentsView)) return {views: 0, url: null, loading: null, marker: null, cookie: null}
		const wc = view.webContents
		const loading = wc.isLoading()
		const read: unknown = loading ? null : await wc.executeJavaScript('({marker: window.__marker, cookie: document.cookie})').catch(() => null)
		const marker = typeof read === 'object' && read !== null && 'marker' in read && typeof read.marker === 'number' ? read.marker : null
		const cookie = typeof read === 'object' && read !== null && 'cookie' in read && typeof read.cookie === 'string' ? read.cookie : null
		return {views: views.length, url: wc.getURL(), loading, marker, cookie}
	})
}

async function settled(app: ElectronApplication, url: string): Promise<ViewFacts> {
	await expect.poll(async () => viewFacts(app), POLL).toMatchObject({views: 1, url, loading: false})
	await expect.poll(async () => (await viewFacts(app)).marker, POLL).not.toBeNull()
	return viewFacts(app)
}

async function typeAddress(page: Page, url: string): Promise<void> {
	const address = page.getByTestId('explore-address')
	await address.fill(url)
	await address.press('Enter')
}

function toolbarButton(page: Page, name: 'Back' | 'Forward') {
	return page.getByTestId('explore-toolbar').getByRole('button', {name, exact: true})
}

async function leaveExplore(page: Page): Promise<void> {
	await page.getByRole('tab', {name: 'Settings'}).click()
	await expect(page.getByTestId('explore-viewport')).toHaveCount(0)
}

async function openExplore(page: Page): Promise<void> {
	await page.locator('.explore-tab-trigger').click()
	await expect(page.getByTestId('explore-viewport')).toBeVisible()
}

// A negative milestone has no event to wait for: give the deadline three times over.
async function pastTheDeadline(page: Page): Promise<void> {
	await page.waitForTimeout(IDLE_MS * 3)
}

// Actions: open Explore; search twice from the address bar; Back; leave for
// Settings; come back; Forward; Back twice.
// Milestones: the view gone after the delay; a view again on return, settled.
// Oracles: the view comes back on the entry that was active, as a new
// document (a fresh marker; the HTTP cache may serve it) with the session's cookie;
// Forward and Back walk the same history it had.
test('Explore releases an idle search page and brings it back on the same history entry', async () => {
	test.setTimeout(120_000)

	await withSite(async site => {
		const home = `${site.origin}/`
		const searchA = `${site.origin}/results?search_query=a`
		const searchB = `${site.origin}/results?search_query=b`
		await withFixtureProductApp({exploreHomeUrl: home, exploreIdleUnloadMs: IDLE_MS, settings: s => Object.assign(s.common, SEEN), userDataPrefix: 'arroxy-fixture-explore-idle-user-', outputPrefix: 'arroxy-fixture-explore-idle-out-'}, async ({app, page}) => {
			await openExplore(page)
			await settled(app, home)
			await typeAddress(page, searchA)
			await settled(app, searchA)
			await typeAddress(page, searchB)
			await settled(app, searchB)
			await toolbarButton(page, 'Back').click()
			const before = await settled(app, searchA)
			expect(before.cookie).toContain('fixture_session=kept')

			await leaveExplore(page)
			await expect.poll(async () => (await viewFacts(app)).views, POLL).toBe(0)

			await openExplore(page)
			const after = await settled(app, searchA)
			expect(after.marker).not.toBe(before.marker)
			expect(after.cookie).toContain('fixture_session=kept')
			await expect(page.getByTestId('explore-address')).toHaveValue(searchA)

			await expect(toolbarButton(page, 'Forward')).toBeEnabled()
			await toolbarButton(page, 'Forward').click()
			await settled(app, searchB)
			await toolbarButton(page, 'Back').click()
			await settled(app, searchA)
			await toolbarButton(page, 'Back').click()
			await settled(app, home)
			await expect(toolbarButton(page, 'Back')).toBeDisabled()
		})
	})
})

// Actions: open Explore; hold the About dialog open past the delay; open a
// video page; leave for Settings past the delay; come back.
// Milestones: the dialog open, then closed; the watch page settled.
// Oracles: one view, the same document (same marker) all along: neither a
// dialog over the page nor leaving a page that is not home or search
// releases it.
test('Explore keeps the page under a dialog and keeps a watch page while away', async () => {
	test.setTimeout(120_000)

	await withSite(async site => {
		const home = `${site.origin}/`
		const watch = `${site.origin}/watch?v=fixture`
		await withFixtureProductApp({exploreHomeUrl: home, exploreIdleUnloadMs: IDLE_MS, settings: s => Object.assign(s.common, SEEN), userDataPrefix: 'arroxy-fixture-explore-idle-keep-user-', outputPrefix: 'arroxy-fixture-explore-idle-keep-out-'}, async ({app, page}) => {
			await openExplore(page)
			const opened = await settled(app, home)

			await page.getByTestId('btn-about').click()
			await expect(page.getByTestId('about-dialog')).toBeVisible()
			await pastTheDeadline(page)
			await page.keyboard.press('Escape')
			await expect(page.getByTestId('about-dialog')).toHaveCount(0)
			expect(await settled(app, home)).toMatchObject({marker: opened.marker})

			await typeAddress(page, watch)
			const watching = await settled(app, watch)
			await leaveExplore(page)
			await pastTheDeadline(page)
			expect((await viewFacts(app)).views).toBe(1)

			await openExplore(page)
			expect(await settled(app, watch)).toMatchObject({marker: watching.marker})
		})
	})
})

function sessionCookie(name: string, value: string): ExploreCookie {
	return {name, value, domain: '.youtube.com', hostOnly: false, path: '/', secure: true, httpOnly: true, session: false, expirationDate: Math.floor(Date.now() / 1000) + 365 * 24 * 3600}
}

const SIGNED_IN: readonly ExploreCookie[] = [sessionCookie('LOGIN_INFO', 'fixture-login-info'), sessionCookie('SAPISID', 'fixture-sapisid')]

// Actions: open Explore signed in; search; leave for Settings; once the page
// is released, sign out there; come back.
// Milestones: the view gone; the sign-out confirmed.
// Oracles: the released page's history does not come back: the view opens
// home, with nothing to go Back to.
test('Explore sign-out while the page is released forgets its history', async () => {
	test.setTimeout(120_000)

	await withSite(async site => {
		const home = `${site.origin}/`
		const search = `${site.origin}/results?search_query=account`
		await withFixtureProductApp({exploreHomeUrl: home, exploreIdleUnloadMs: IDLE_MS, exploreCookies: SIGNED_IN, settings: s => Object.assign(s.common, SEEN), userDataPrefix: 'arroxy-fixture-explore-idle-out-user-', outputPrefix: 'arroxy-fixture-explore-idle-out-out-'}, async ({app, page}) => {
			await openExplore(page)
			await settled(app, home)
			await typeAddress(page, search)
			await settled(app, search)

			await leaveExplore(page)
			await expect.poll(async () => (await viewFacts(app)).views, POLL).toBe(0)
			const signOut = page.getByTestId('explore-settings-sign-out')
			await expect(signOut).toBeEnabled(POLL)
			await signOut.click()
			await page.getByTestId('explore-sign-out-confirm').click()
			await expect(page.getByTestId('explore-sign-out-dialog')).toHaveCount(0)

			await openExplore(page)
			await settled(app, home)
			await expect(toolbarButton(page, 'Back')).toBeDisabled()
		})
	})
})
