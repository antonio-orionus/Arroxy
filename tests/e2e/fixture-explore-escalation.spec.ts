import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import {expect, test, type ElectronApplication, type Page} from '@playwright/test'
import type {ExploreCookie} from '../../src/shared/sites/types.js'
import type {AppSettings, JobAuth, QueueItem} from '../../src/shared/types.js'
import {FIXTURE_VIDEO_IDS, type FixtureServer, type FixtureServerRequest} from './fixtureHarness.js'
import {COOKIE_LIMITED_VIDEO_ID, SIGN_IN_VIDEO_ID} from './fixtureMediaCatalog.js'
import {readPersistedQueue, restoredQueueItem, withFixtureProductApp} from './fixtureProductE2E.js'
import {clickContinue, openQueueTab, queueCardByTitle, startBulkFromClipboard} from './fixtureWorkflow.js'

// Explore escalation risk group: a download that needs an account must reach
// the user's Explore session, and only that download may. The failure modes
// are a sign-in-walled video that silently fails, an account leaking onto
// every download, a cookie for another site reaching yt-dlp, a cookie jar left
// on disk, and an escalated job quietly downgraded to an anonymous run.
//
// Fixtures: the Explore partition is seeded at startup as a signed-in YouTube
// session (LOGIN_INFO + SAPISID on .youtube.com) plus a fixture marker cookie
// the extractor reports back, and a Google SID that must never reach yt-dlp.
// The sign-in fixture video refuses any extraction without the marker. Every
// scenario runs in its own userData dir, so the seeded session never outlives
// it, and withFixtureProductApp fails it on any request to the deny proxy.

const MARKER = 'e2e'
const SIGN_IN_TITLE = 'Fixture Video 15'
const COOKIE_LIMITED_TITLE = 'Fixture Video 14'
const ORDINARY_VIDEO_ID = FIXTURE_VIDEO_IDS[9]
const ORDINARY_TITLE = 'Fixture Video 10'

function sessionCookie(name: string, value: string, domain: string): ExploreCookie {
	return {name, value, domain, hostOnly: false, path: '/', secure: true, httpOnly: true, session: false, expirationDate: Math.floor(Date.now() / 1000) + 365 * 24 * 3600}
}

const SIGNED_IN_EXPLORE_SESSION: readonly ExploreCookie[] = [sessionCookie('LOGIN_INFO', 'fixture-login-info', '.youtube.com'), sessionCookie('SAPISID', 'fixture-sapisid', '.youtube.com'), sessionCookie('ARROXY_FIXTURE_AUTH', MARKER, '.youtube.com'), sessionCookie('SID', 'fixture-google-sid', '.google.com')]

function exploreMode(settings: AppSettings): void {
	settings.common.cookiesMode = 'explore'
}

type ProbeStart = Extract<FixtureServerRequest, {kind: 'probe-start'}>

/** One entry per yt-dlp extraction of the video, refused ones included. */
function extractions(fixtureServer: FixtureServer, videoId: string): ProbeStart[] {
	return fixtureServer.telemetry().requests.filter((request): request is ProbeStart => request.kind === 'probe-start' && request.videoId === videoId)
}

function completedMediaFormats(fixtureServer: FixtureServer, videoId: string): string[] {
	return fixtureServer.telemetry().requests.flatMap(request => (request.kind === 'media' && request.videoId === videoId && request.status === 200 ? [request.formatId] : []))
}

const YOUTUBE_COOKIE_DOMAIN = /(^|\.)youtube\.com$/

// Non-vacuous: the signed-in runs did carry youtube.com cookies, and nothing else.
function expectOnlyYouTubeCookiesReachedYtDlp(fixtureServer: FixtureServer): void {
	const domains = fixtureServer.telemetry().requests.flatMap(request => (request.kind === 'probe-start' ? request.cookieDomains : []))
	expect(domains.some(domain => YOUTUBE_COOKIE_DOMAIN.test(domain))).toBe(true)
	expect(domains.filter(domain => !YOUTUBE_COOKIE_DOMAIN.test(domain))).toEqual([])
}

function expectNoCookieJarLeft(userDataDir: string): void {
	const jarDir = path.join(userDataDir, 'explore-jars')
	expect(fs.existsSync(jarDir) ? fs.readdirSync(jarDir) : []).toEqual([])
}

async function persistedAuthOnceDone(userDataDir: string, url: string): Promise<JobAuth | undefined> {
	const find = (): QueueItem | undefined => readPersistedQueue(userDataDir).find(item => item.url === url)
	await expect.poll(() => find()?.status, {timeout: 30_000}).toBe('done')
	return find()?.auth
}

async function expectRowDone(page: Page, title: string): Promise<void> {
	await openQueueTab(page)
	await expect(queueCardByTitle(page, title)).toHaveAttribute('data-status', 'done', {timeout: 120_000})
}

// Actions: paste both URLs through the OS clipboard into the bulk list, let
// metadata load, queue them with the default profile.
// Milestones: the sign-in video's title resolves in the list (its probe got
// through), and both rows reach done.
// Oracles: both files on disk; the sign-in video was tried anonymously first
// and every later run carried the marker; the ordinary video never saw the
// account; only youtube.com cookies reached yt-dlp; only the sign-in item is
// persisted as escalated; no cookie jar is left behind.
test('Explore escalation signs in only the download that needs an account', async () => {
	test.setTimeout(240_000)

	await withFixtureProductApp({settings: exploreMode, exploreCookies: SIGNED_IN_EXPLORE_SESSION, userDataPrefix: 'arroxy-fixture-explore-user-', outputPrefix: 'arroxy-fixture-explore-out-'}, async ({app, page, fixtureServer, userDataDir, urls, files}) => {
		await startBulkFromClipboard(page, app, [urls.video(SIGN_IN_VIDEO_ID), urls.video(ORDINARY_VIDEO_ID)].join('\n'))
		await expect(page.locator('[data-testid="bulk-url-valid-count"]')).toContainText('2')
		await page.locator('[data-testid="bulk-url-confirm"]').click()

		const rows = page.locator('[data-testid^="playlist-item-row-"]')
		await expect(page.locator('[data-testid="step-playlist-items"]')).toBeVisible({timeout: 60_000})
		await expect(rows.filter({hasText: SIGN_IN_TITLE})).toHaveCount(1, {timeout: 90_000})
		await expect(rows.filter({hasText: ORDINARY_TITLE})).toHaveCount(1, {timeout: 90_000})

		await clickContinue(page)
		await expect(page.locator('[data-testid="step-playlist-presets"]')).toBeVisible()
		await page.getByRole('button', {name: /skip to confirm/i}).click()
		await expect(page.locator('[data-testid="step-confirm"]')).toBeVisible()
		const queuedAt = Date.now()
		await page.locator('[data-testid="btn-add-to-queue"]').click()

		await expectRowDone(page, SIGN_IN_TITLE)
		await expectRowDone(page, ORDINARY_TITLE)
		files.expectMp4Count(2)
		expect(files.mediaFiles('.mp4').some(name => name.includes(`[${SIGN_IN_VIDEO_ID}]`))).toBe(true)

		// Escalation, not a preemptive sign-in: refused anonymously, then signed in.
		const signInRuns = extractions(fixtureServer, SIGN_IN_VIDEO_ID)
		const firstSignedIn = signInRuns.findIndex(run => run.marker === MARKER)
		expect(firstSignedIn).toBeGreaterThan(0)
		expect(signInRuns.slice(0, firstSignedIn).every(run => run.marker === null)).toBe(true)
		// Once escalated, the job never goes back to an anonymous run.
		expect(signInRuns.filter(run => run.at >= queuedAt).every(run => run.marker === MARKER)).toBe(true)
		// The ordinary video downloads anonymously from probe to file.
		const ordinaryRuns = extractions(fixtureServer, ORDINARY_VIDEO_ID)
		expect(ordinaryRuns.length).toBeGreaterThan(0)
		expect(ordinaryRuns.every(run => run.marker === null && !run.signedIn)).toBe(true)
		expectOnlyYouTubeCookiesReachedYtDlp(fixtureServer)

		expect(await persistedAuthOnceDone(userDataDir, urls.video(SIGN_IN_VIDEO_ID))).toBe('exploreSession')
		expect(await persistedAuthOnceDone(userDataDir, urls.video(ORDINARY_VIDEO_ID))).toBeUndefined()
		expectNoCookieJarLeft(userDataDir)
	})
})

// The download-time path: an anonymous item restored from a previous session
// hits the sign-in wall while downloading, with no probe in between.
// Fixtures: the sign-in video's extractions are delayed 3 s so the transient
// escalation status stays on screen long enough to observe.
// Milestones: the row shows the Explore sign-in status, then reaches done.
// Oracles: the file on disk; an anonymous run first, then the marker; the
// item persisted as escalated; no cookie jar left behind.
test('Explore escalation takes over a restored download that hits a sign-in wall', async () => {
	test.setTimeout(200_000)

	await withFixtureProductApp(
		{
			behavior: {metadataDelayMs: {[SIGN_IN_VIDEO_ID]: 3_000}},
			settings: exploreMode,
			exploreCookies: SIGNED_IN_EXPLORE_SESSION,
			restoredQueue: outputDir => [restoredQueueItem('restored-sign-in', SIGN_IN_VIDEO_ID, SIGN_IN_TITLE, outputDir)],
			userDataPrefix: 'arroxy-fixture-explore-download-user-',
			outputPrefix: 'arroxy-fixture-explore-download-out-'
		},
		async ({page, fixtureServer, userDataDir, urls, files}) => {
			await openQueueTab(page)
			await expect(queueCardByTitle(page, SIGN_IN_TITLE)).toContainText('Signing in with your Explore account', {timeout: 60_000})
			await expectRowDone(page, SIGN_IN_TITLE)
			files.expectMp4Count(1)

			expect(extractions(fixtureServer, SIGN_IN_VIDEO_ID).map(run => run.marker)).toEqual([null, MARKER])
			expectOnlyYouTubeCookiesReachedYtDlp(fixtureServer)
			expect(await persistedAuthOnceDone(userDataDir, urls.video(SIGN_IN_VIDEO_ID))).toBe('exploreSession')
			expectNoCookieJarLeft(userDataDir)
		}
	)
})

// D4: an escalated job never runs without cookies, even where the cookieless
// retry would win back quality. The cookie-limited fixture withholds 720p from
// any signed-in run, so an escalated item restored from a previous session
// must settle for 360p and say so rather than retry anonymously.
// Milestones: the row reaches done with the quality notice.
// Oracles: only the 360p format was fetched; every extraction carried the
// marker; the item stays persisted as escalated.
test('Explore escalated download keeps the session and reports the quality limit (D4)', async () => {
	test.setTimeout(200_000)

	await withFixtureProductApp(
		{settings: exploreMode, exploreCookies: SIGNED_IN_EXPLORE_SESSION, restoredQueue: outputDir => [restoredQueueItem('restored-escalated', COOKIE_LIMITED_VIDEO_ID, COOKIE_LIMITED_TITLE, outputDir, 'exploreSession')], userDataPrefix: 'arroxy-fixture-explore-d4-user-', outputPrefix: 'arroxy-fixture-explore-d4-out-'},
		async ({page, fixtureServer, userDataDir, urls, files}) => {
			await expectRowDone(page, COOKIE_LIMITED_TITLE)
			const notice = queueCardByTitle(page, COOKIE_LIMITED_TITLE).getByTestId('queue-quality-warning')
			await expect(notice).toBeVisible()
			await expect(notice).toContainText('360p')
			files.expectMp4Count(1)

			expect(completedMediaFormats(fixtureServer, COOKIE_LIMITED_VIDEO_ID)).toEqual(['18'])
			const runs = extractions(fixtureServer, COOKIE_LIMITED_VIDEO_ID)
			expect(runs.length).toBeGreaterThan(0)
			expect(runs.every(run => run.marker === MARKER)).toBe(true)
			// The anonymous token describes a signed-out visitor: never on a signed-in run.
			expect(runs.every(run => !run.extractorArgs.poToken && !run.extractorArgs.visitorData)).toBe(true)
			expectOnlyYouTubeCookiesReachedYtDlp(fixtureServer)
			expect(await persistedAuthOnceDone(userDataDir, urls.video(COOKIE_LIMITED_VIDEO_ID))).toBe('exploreSession')
			expectNoCookieJarLeft(userDataDir)
		}
	)
})

// A local page for the Explore view to open: the view never reaches the internet in tests.
async function withExploreHome(run: (homeUrl: string) => Promise<void>): Promise<void> {
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
	try {
		await run(`http://127.0.0.1:${address.port}/`)
	} finally {
		await new Promise<void>(resolve => server.close(() => resolve()))
	}
}

// The user signing in on the Explore page: the session the startup E2E hook
// would seed (ExploreSessionService.seedForE2e), written the same way into the
// live Explore partition. The view notices the auth cookies as a real sign-in.
async function signInToExplore(app: ElectronApplication, cookies: readonly ExploreCookie[]): Promise<void> {
	await app.evaluate(async ({session}, seed) => {
		const ses = session.fromPartition('persist:arroxy-explore')
		for (const c of seed) {
			await ses.cookies.set({url: `https://${c.domain.replace(/^\./, '')}${c.path}`, name: c.name, value: c.value, ...(c.hostOnly ? {} : {domain: c.domain}), path: c.path, secure: c.secure, httpOnly: c.httpOnly, ...(c.expirationDate === undefined ? {} : {expirationDate: c.expirationDate})})
		}
	}, cookies)
}

function exploreSeenCookiesOff(settings: AppSettings): void {
	settings.common.cookiesMode = 'off'
	settings.common.exploreNoticeSeen = true
}

// P2-R51 risk: with cookies off, a video that needs an account fails, and the
// guidance must take the user to a working download through Explore.
// Fixtures: cookies off, Explore never signed in; the sign-in video refuses any
// extraction without the session's marker.
// Actions: Quick Download the sign-in video from the URL tab; on its failed row
// press Sign in with Explore; sign in on the Explore page.
// Milestones: the failure toast and the row's offer; Explore opens with the
// mode switched; the row probes again by itself and reaches done.
// Oracles: the file on disk, the extraction after the sign-in carried the
// marker, the item persisted as escalated, only youtube.com cookies reached
// yt-dlp, no cookie jar left.
test('Sign in with Explore on a failed row retries it once Explore is signed in', async () => {
	test.setTimeout(240_000)

	await withExploreHome(async homeUrl => {
		await withFixtureProductApp({settings: exploreSeenCookiesOff, exploreHomeUrl: homeUrl, userDataPrefix: 'arroxy-fixture-explore-offer-user-', outputPrefix: 'arroxy-fixture-explore-offer-out-'}, async ({app, page, fixtureServer, userDataDir, urls, files}) => {
			const url = urls.video(SIGN_IN_VIDEO_ID)
			await page.locator('[data-testid="profiles-main-input"]').fill(url)
			await page.locator('[data-testid="profiles-quick-download"]').click()

			const failure = page.locator('[data-sonner-toast]', {hasText: "Couldn't prepare"})
			await expect(failure.getByRole('button', {name: 'Sign in with Explore'})).toBeVisible({timeout: 60_000})
			await openQueueTab(page)
			const row = page.locator('[data-testid^="queue-manager-row-"]').first()
			await expect(row).toHaveAttribute('data-status', 'error')
			const itemId = ((await row.getAttribute('data-testid')) ?? '').replace('queue-manager-row-', '')
			const guidance = page.getByTestId(`queue-attention-${itemId}`)
			await expect(guidance.getByTestId('cookies-error-alert')).toHaveAttribute('data-variant', 'explore-offer')
			expect(extractions(fixtureServer, SIGN_IN_VIDEO_ID).every(run => run.marker === null)).toBe(true)

			await guidance.getByRole('button', {name: 'Sign in with Explore'}).click()
			await expect(page.getByTestId('explore-tab')).toBeVisible()
			await expect(page.getByTestId('explore-address')).toHaveValue(homeUrl, {timeout: 30_000})
			const signedInAt = Date.now()
			await signInToExplore(app, SIGNED_IN_EXPLORE_SESSION)

			await expect(page.locator('[data-sonner-toast]', {hasText: 'Signed in with Explore — retrying 1 link'})).toBeVisible({timeout: 30_000})
			await expectRowDone(page, SIGN_IN_TITLE)
			files.expectMp4Count(1)
			// Exactly one retry: one probe, refused anonymously and then escalated once
			// (the download reuses that probe's extraction), nothing repeated.
			const afterSignIn = extractions(fixtureServer, SIGN_IN_VIDEO_ID).filter(run => run.at >= signedInAt)
			expect(afterSignIn.map(run => run.marker)).toEqual([null, MARKER])
			expect(afterSignIn.filter(run => run.marker === MARKER)).toHaveLength(1)
			expectOnlyYouTubeCookiesReachedYtDlp(fixtureServer)
			expect(await persistedAuthOnceDone(userDataDir, url)).toBe('exploreSession')
			expectNoCookieJarLeft(userDataDir)
		})
	})
})
