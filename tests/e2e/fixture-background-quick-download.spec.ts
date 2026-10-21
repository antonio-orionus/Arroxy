import http from 'node:http'
import {expect, test, type ElectronApplication, type Page} from '@playwright/test'
import {toastItemName} from '../../src/renderer/src/lib/toastItemName.js'
import type {AppSettings, ExploreLinkAction, ExploreViewState} from '../../src/shared/types.js'
import {FIXTURE_PLAYLIST_VIDEO_IDS, FIXTURE_VIDEO_IDS} from './fixtureHarness.js'
import {readPersistedQueue, withFixtureProductApp} from './fixtureProductE2E.js'

// Background quick download risk group (P2-R37/R38). A single link's Quick
// Download — the URL tab's card and Explore's Download — must never block the
// window: the link becomes a probing row in Downloads at once, a toast says so
// with View, and the probe runs in the background. Whatever the probe ends in
// is resolved from the Downloads tab: a failure from the row's Retry, a
// playlist over the load limit from the row's First N.
//
// Fixtures: the fixture extractor and media server; `metadataDelayMs` holds
// each probe open long enough to see the placeholder; `metadataFailureIds`
// fails a probe until the test lifts it. Explore's view opens a local page;
// the page it reports is set to a fixture video, as if the user had browsed
// there (the view never reaches the internet in tests).
// Oracles: no dialog while preparing, the toast and its View, the row's
// status and actions, files on disk, and the harness's deny-proxy log.

const PROBE_DELAY_MS = 6_000

function rows(page: Page) {
	return page.locator('[data-testid^="queue-manager-row-"]')
}

function toast(page: Page, text: string) {
	return page.locator('[data-sonner-toast]', {hasText: text})
}

async function quickDownloadFromUrlTab(page: Page, url: string): Promise<void> {
	await page.locator('[data-testid="profiles-main-input"]').fill(url)
	await page.locator('[data-testid="profiles-quick-download"]').click()
}

// A quick download places a row and never opens a modal.
async function expectNoModal(page: Page): Promise<void> {
	await expect(page.getByTestId('quick-download-progress-dialog')).toHaveCount(0)
	await expect(page.locator('[data-slot="dialog-overlay"]')).toHaveCount(0)
}

async function viewFromToast(page: Page, text: string): Promise<void> {
	await toast(page, text).getByRole('button', {name: 'View'}).click()
	await expect(page.getByTestId('queue-manager-tab')).toBeVisible()
}

// Actions: paste a fixture video, Quick Download, View on the toast.
// Milestones: the toast, the field cleared, the highlighted probing row, then done.
// Oracles: no modal at any point, one mp4 on disk.
test('Quick Download from the URL tab places a probing row at once and finishes in the background', async () => {
	test.setTimeout(150_000)
	const videoId = FIXTURE_VIDEO_IDS[2]
	if (!videoId) throw new Error('fixture catalog needs a third video')

	await withFixtureProductApp({behavior: {metadataDelayMs: PROBE_DELAY_MS}, userDataPrefix: 'arroxy-fixture-bg-quick-url-user-', outputPrefix: 'arroxy-fixture-bg-quick-url-out-'}, async ({page, urls, files}) => {
		const url = urls.video(videoId)
		await quickDownloadFromUrlTab(page, url)

		await expect(toast(page, `Added: ${toastItemName(url)}`)).toBeVisible({timeout: 10_000})
		await expectNoModal(page)
		await expect(page.locator('[data-testid="profiles-main-input"]')).toHaveValue('')

		await viewFromToast(page, `Added: ${toastItemName(url)}`)
		const row = rows(page).first()
		await expect(row).toHaveAttribute('data-highlighted', 'true')
		await expect(row).toHaveAttribute('data-status', 'probing')
		await expect(row).toContainText(url)

		await expect(row).toHaveAttribute('data-status', 'done', {timeout: 120_000})
		await expect(rows(page)).toHaveCount(1)
		await expect.poll(() => files.mediaFiles('mp4').length, {timeout: 20_000}).toBe(1)
	})
})

// Risk: the wizard's own cancel (a new interactive run, Back) used to abort
// every probe in main, failing each quick download still preparing.
// Actions: Quick Download one video, then start an interactive run on another
// and go Back while the first still prepares.
// Oracles: the first row finishes, never errors; one mp4 on disk.
test('starting and leaving an interactive run never fails a quick download still preparing', async () => {
	test.setTimeout(150_000)
	const [first, second] = [FIXTURE_VIDEO_IDS[5], FIXTURE_VIDEO_IDS[6]]
	if (!first || !second) throw new Error('fixture catalog needs seven videos')

	await withFixtureProductApp({behavior: {metadataDelayMs: PROBE_DELAY_MS}, userDataPrefix: 'arroxy-fixture-bg-quick-wizard-user-', outputPrefix: 'arroxy-fixture-bg-quick-wizard-out-'}, async ({page, urls, files}) => {
		await quickDownloadFromUrlTab(page, urls.video(first))
		await expect(toast(page, `Added: ${toastItemName(urls.video(first))}`)).toBeVisible({timeout: 10_000})

		await page.locator('[data-testid="profiles-main-input"]').fill(urls.video(second))
		await page.locator('[data-testid="profiles-interactive-download"]').click()
		await expect(page.getByTestId('step-formats')).toBeVisible({timeout: 10_000})
		await page.getByTestId('step-formats').getByRole('button', {name: 'Back', exact: true}).click()
		await expect(page.getByTestId('download-profiles-home')).toBeVisible()

		await page.locator('.downloads-tab-trigger').click()
		const row = rows(page).first()
		await expect(row).toHaveAttribute('data-status', 'done', {timeout: 120_000})
		await expect(page.locator('[data-testid^="queue-manager-row-"][data-status="error"]')).toHaveCount(0)
		await expect.poll(() => files.mediaFiles('mp4').length, {timeout: 20_000}).toBe(1)
	})
})

interface ExplorePage {
	url: string
	close: () => Promise<void>
}

async function startExploreHome(): Promise<ExplorePage> {
	const server = http.createServer((_req, res) => {
		res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
		res.end('<!doctype html><title>Explore fixture home</title><p>Home</p>')
	})
	await new Promise<void>((resolve, reject) => {
		server.once('error', reject)
		server.listen(0, '127.0.0.1', () => resolve())
	})
	const address = server.address()
	if (address === null || typeof address === 'string') throw new Error('explore home server did not bind to a TCP port')
	return {url: `http://127.0.0.1:${address.port}/`, close: () => new Promise<void>(resolve => server.close(() => resolve()))}
}

function exploreReady(settings: AppSettings): void {
	settings.common.exploreNoticeSeen = true
	settings.common.exploreModeAutoSwitched = true
}

// The view reports the page it shows; this stands in for the user browsing to a
// video. The real view keeps reporting the local page it shows (its load ending,
// its title, the sign-in read), and any late report would replace this one, so
// Download would grab the local page. From here on only this report reaches the
// renderer.
async function reportExplorePage(app: ElectronApplication, state: ExploreViewState): Promise<void> {
	await app.evaluate(({BrowserWindow}, next) => {
		const win = BrowserWindow.getAllWindows().find(candidate => candidate.webContents.getURL().startsWith('file:'))
		if (!win) throw new Error('main window not found')
		const send = win.webContents.send.bind(win.webContents)
		win.webContents.send = (channel: string, ...args: unknown[]) => {
			if (channel !== 'explore:stateChanged') send(channel, ...args)
		}
		send('explore:stateChanged', next)
	}, state)
}

// Actions: open Explore, on a video page press Download, View on the toast.
// Milestones: the page's title on the toast and the probing row, then done.
// Oracles: Explore stays the tab while preparing, no modal, one mp4 on disk.
test('Download from Explore places a probing row at once and finishes in the background', async () => {
	test.setTimeout(150_000)
	const videoId = FIXTURE_VIDEO_IDS[3]
	if (!videoId) throw new Error('fixture catalog needs a fourth video')
	const home = await startExploreHome()
	try {
		await withFixtureProductApp({behavior: {metadataDelayMs: PROBE_DELAY_MS}, exploreHomeUrl: home.url, settings: exploreReady, userDataPrefix: 'arroxy-fixture-bg-quick-explore-user-', outputPrefix: 'arroxy-fixture-bg-quick-explore-out-'}, async ({app, page, urls, files}) => {
			await page.locator('.explore-tab-trigger').click()
			await expect(page.getByTestId('explore-address')).toHaveValue(home.url, {timeout: 30_000})
			const pageTitle = 'Fixture video page - YouTube'
			await reportExplorePage(app, {url: urls.video(videoId), title: pageTitle, canGoBack: false, canGoForward: false, loading: false, signedIn: false, error: null, adBlock: 'off'})
			await expect(page.getByTestId('explore-address')).toHaveValue(urls.video(videoId))

			const download = page.getByTestId('explore-download')
			await expect(download).toBeEnabled()
			await download.click()

			await expect(toast(page, `Added: ${pageTitle}`)).toBeVisible({timeout: 10_000})
			await expectNoModal(page)
			await expect(page.getByTestId('explore-tab')).toBeVisible()
			await expect(download).toBeEnabled()

			await viewFromToast(page, `Added: ${pageTitle}`)
			const row = rows(page).first()
			await expect(row).toHaveAttribute('data-status', 'probing')
			await expect(row).toContainText(pageTitle)
			await expect(row).toHaveAttribute('data-status', 'done', {timeout: 120_000})
			await expect.poll(() => files.mediaFiles('mp4').length, {timeout: 20_000}).toBe(1)
		})
	} finally {
		await home.close()
	}
})

// A pick in the page's native link menu, as main sends it once the user right-
// clicked a link and chose; the native menu itself cannot be driven from a test.
async function pickFromLinkMenu(app: ElectronApplication, action: ExploreLinkAction): Promise<void> {
	await app.evaluate(({BrowserWindow}, next) => {
		const win = BrowserWindow.getAllWindows().find(candidate => candidate.webContents.getURL().startsWith('file:'))
		if (!win) throw new Error('main window not found')
		win.webContents.send('explore:linkAction', next)
	}, action)
}

// Actions: on the home feed (the bar has nothing to grab), right-click a video
// and pick another profile in Download with.
// Milestones: the picked profile becomes the active one; the toast; done.
// Oracles: Explore stays the tab, no modal, one mp4 on disk.
test('a link menu profile pick on the home feed makes it the active profile and downloads the link in the background', async () => {
	test.setTimeout(150_000)
	const videoId = FIXTURE_VIDEO_IDS[7]
	if (!videoId) throw new Error('fixture catalog needs an eighth video')
	const home = await startExploreHome()
	try {
		await withFixtureProductApp({exploreHomeUrl: home.url, settings: exploreReady, userDataPrefix: 'arroxy-fixture-bg-quick-link-menu-user-', outputPrefix: 'arroxy-fixture-bg-quick-link-menu-out-'}, async ({app, page, urls, files}) => {
			await page.locator('.explore-tab-trigger').click()
			await expect(page.getByTestId('explore-address')).toHaveValue(home.url, {timeout: 30_000})
			// The stand-in home is another site's page, which the bar can grab; that
			// YouTube's own home feed names nothing is covered in explore-grab.test.ts.
			const download = page.getByTestId('explore-download')

			const url = urls.video(videoId)
			await pickFromLinkMenu(app, {kind: 'download', url, profile: {kind: 'builtin', id: 'best-quality'}})

			await expect(download).toHaveText('Download · Best available', {timeout: 10_000})
			await expect(toast(page, `Added: ${toastItemName(url)}`)).toBeVisible({timeout: 10_000})
			await expectNoModal(page)
			await expect(page.getByTestId('explore-tab')).toBeVisible()

			await viewFromToast(page, `Added: ${toastItemName(url)}`)
			const row = rows(page).first()
			await expect(row).toHaveAttribute('data-status', 'done', {timeout: 120_000})
			await expect(rows(page)).toHaveCount(1)
			await expect.poll(() => files.mediaFiles('mp4').length, {timeout: 20_000}).toBe(1)
		})
	} finally {
		await home.close()
	}
})

// Actions: Quick Download a video whose probe fails, then Retry on its row
// once the failure is lifted.
// Milestones: the failure toast; the error row with its guidance; probing
// again after Retry; done.
// Oracles: the row is the same row throughout; one mp4 on disk.
test('a failed probe becomes an error row, and Retry from the row succeeds once the failure is lifted', async () => {
	test.setTimeout(150_000)
	const videoId = FIXTURE_VIDEO_IDS[4]
	if (!videoId) throw new Error('fixture catalog needs a fifth video')

	await withFixtureProductApp({behavior: {metadataFailureIds: [videoId]}, userDataPrefix: 'arroxy-fixture-bg-quick-retry-user-', outputPrefix: 'arroxy-fixture-bg-quick-retry-out-'}, async ({page, fixtureServer, urls, files}) => {
		const url = urls.video(videoId)
		await quickDownloadFromUrlTab(page, url)

		const failure = toast(page, `Couldn't prepare ${toastItemName(url)}`)
		await expect(failure).toBeVisible({timeout: 60_000})
		await expect(failure.getByRole('button', {name: 'Retry'})).toBeVisible()
		await viewFromToast(page, `Couldn't prepare ${toastItemName(url)}`)

		const row = rows(page).first()
		await expect(row).toHaveAttribute('data-status', 'error')
		const rowTestId = await row.getAttribute('data-testid')
		const itemId = rowTestId?.replace('queue-manager-row-', '') ?? ''
		const guidance = page.getByTestId(`queue-attention-${itemId}`)
		await expect(guidance).toBeVisible()

		fixtureServer.setBehavior({metadataDelayMs: PROBE_DELAY_MS})
		await guidance.getByRole('button', {name: 'Retry'}).click()
		await expect(page.getByTestId(rowTestId ?? '')).toHaveAttribute('data-status', 'probing', {timeout: 10_000})
		await expect(page.getByTestId(rowTestId ?? '')).toHaveAttribute('data-status', 'done', {timeout: 120_000})
		await expect(rows(page)).toHaveCount(1)
		await expect.poll(() => files.mediaFiles('mp4').length, {timeout: 20_000}).toBe(1)
	})
})

// Risk: the profile a row was placed with lived only in the window, so a
// reload (or anything else that dropped it) made the row's Retry prepare with
// whatever profile was active by then: another format, another folder.
// Actions: Quick Download a video whose probe fails under Balanced 720p,
// switch the active profile to Audio only, reload the window, then Retry on
// the row once the failure is lifted.
// Milestones: the error row before the reload, and again after it; probing
// again after Retry; done.
// Oracles: the row is labelled Balanced 720p in Downloads and in queue.json,
// and the file on disk is an mp4 in Balanced's folder, not audio.
test('a row keeps the profile it was placed with across a window reload', async () => {
	test.setTimeout(180_000)
	const videoId = FIXTURE_VIDEO_IDS[1]
	if (!videoId) throw new Error('fixture catalog needs a second video')

	await withFixtureProductApp({behavior: {metadataFailureIds: [videoId]}, userDataPrefix: 'arroxy-fixture-bg-quick-pinned-user-', outputPrefix: 'arroxy-fixture-bg-quick-pinned-out-'}, async ({page, fixtureServer, userDataDir, urls, files}) => {
		const url = urls.video(videoId)
		await quickDownloadFromUrlTab(page, url)
		await viewFromToast(page, `Couldn't prepare ${toastItemName(url)}`)
		const rowTestId = (await rows(page).first().getAttribute('data-testid')) ?? ''
		await expect(page.getByTestId(rowTestId)).toHaveAttribute('data-status', 'error')
		await expect(page.getByTestId(rowTestId)).toContainText('Balanced 720p')

		const switched = await page.evaluate(async () => (await window.appApi.settings.update({profiles: {active: {kind: 'builtin', id: 'audio-only'}}})).ok)
		expect(switched).toBe(true)
		await page.reload()
		await page.locator('.downloads-tab-trigger').click()
		await expect(page.getByTestId(rowTestId)).toHaveAttribute('data-status', 'error', {timeout: 30_000})

		fixtureServer.setBehavior({metadataDelayMs: PROBE_DELAY_MS})
		const itemId = rowTestId.replace('queue-manager-row-', '')
		await page.getByTestId(`queue-attention-${itemId}`).getByRole('button', {name: 'Retry'}).click()
		await expect(page.getByTestId(rowTestId)).toHaveAttribute('data-status', 'done', {timeout: 120_000})

		await expect(page.getByTestId(rowTestId)).toContainText('Balanced 720p')
		const persisted = readPersistedQueue(userDataDir)
		expect(persisted).toHaveLength(1)
		expect(persisted[0]?.formatLabel).toContain('Balanced 720p')
		await expect.poll(() => files.mediaFiles('mp4').length, {timeout: 20_000}).toBe(1)
		expect(files.mediaFiles('mp4')[0]).toContain('Balanced 720p')
	})
})

// Actions: Quick Download the fixture playlist with a load limit below its
// length, then First N on the needs-choice row.
// Milestones: the "choose how many" toast; the needs-choice row; N rows done.
// Oracles: exactly the first N videos on disk, the rest never fetched.
test('a playlist over the load limit waits for a choice on its row, and First N queues N videos', async () => {
	test.setTimeout(200_000)
	const limit = 2
	if (FIXTURE_PLAYLIST_VIDEO_IDS.length <= limit) throw new Error('fixture playlist needs more videos than the limit')

	await withFixtureProductApp(
		{
			userDataPrefix: 'arroxy-fixture-bg-quick-choice-user-',
			outputPrefix: 'arroxy-fixture-bg-quick-choice-out-',
			settings: settings => {
				settings.common.playlistProbeLimit = limit
			}
		},
		async ({page, urls, files}) => {
			await quickDownloadFromUrlTab(page, urls.playlist())

			await expect(toast(page, `${limit}+ videos — choose how many`)).toBeVisible({timeout: 60_000})
			await viewFromToast(page, `${limit}+ videos — choose how many`)
			const row = rows(page).first()
			await expect(row).toHaveAttribute('data-status', 'needs-choice')
			await expect(row).toContainText('Needs your choice')
			const choice = page.getByTestId('queue-choice')
			await expect(choice).toContainText(`More than ${limit} videos`)

			await choice.getByRole('button', {name: `First ${limit}`}).click()
			await expect(rows(page)).toHaveCount(limit, {timeout: 20_000})
			await expect(page.locator('[data-testid^="queue-manager-row-"][data-status="done"]')).toHaveCount(limit, {timeout: 150_000})

			await expect.poll(() => files.mediaFiles('mp4').length, {timeout: 20_000}).toBe(limit)
			files.expectMp4Count(limit)
			for (const videoId of FIXTURE_PLAYLIST_VIDEO_IDS.slice(limit)) files.expectNoMp4For(videoId)
		}
	)
})
