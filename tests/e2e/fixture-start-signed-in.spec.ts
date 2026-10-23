import {expect, test, type Page} from '@playwright/test'
import type {ExploreCookie} from '../../src/shared/sites/types.js'
import type {AppSettings, JobAuth, QueueItem} from '../../src/shared/types.js'
import {FIXTURE_VIDEO_IDS, type FixtureServer, type FixtureServerRequest} from './fixtureHarness.js'
import {readPersistedQueue, restoredQueueItem, withFixtureProductApp} from './fixtureProductE2E.js'
import {openQueueTab, queueCardByTitle} from './fixtureWorkflow.js'

// Sites that do better signed in start signed in (ADR 0022). The fixture
// YouTube stands in for Instagram and X: under ARROXY_E2E_SIGN_IN_FIRST its
// policy is `first` and its sign-in cookie is the marker the fixture extractor
// reports back, so every extraction says whether it ran signed in.
//
// The risks: a site-default job that silently runs anonymous, a sign-in the
// site refuses that keeps failing every download, a site-default row that is
// stored as signed in for good, and a suspect mark that a restart forgets.

const MARKER = 'e2e'
const FIRST_ID = FIXTURE_VIDEO_IDS[0]
const FIRST_TITLE = 'Fixture Video 1'
const SECOND_ID = FIXTURE_VIDEO_IDS[1]
const SECOND_TITLE = 'Fixture Video 2'
// An error no classifier knows: the sign-in may have caused it.
const UNKNOWN_FAILURE = 'Fixture page could not be read'

function sessionCookie(name: string, value: string): ExploreCookie {
	return {name, value, domain: '.youtube.com', hostOnly: false, path: '/', secure: true, httpOnly: true, session: false, expirationDate: Math.floor(Date.now() / 1000) + 365 * 24 * 3600}
}

const SIGNED_IN_EXPLORE_SESSION: readonly ExploreCookie[] = [sessionCookie('LOGIN_INFO', 'fixture-login-info'), sessionCookie('SAPISID', 'fixture-sapisid'), sessionCookie('ARROXY_FIXTURE_AUTH', MARKER)]

function exploreMode(settings: AppSettings): void {
	settings.common.cookiesMode = 'explore'
}

type ProbeStart = Extract<FixtureServerRequest, {kind: 'probe-start'}>

/** The marker each yt-dlp extraction of the video carried, in order: null ran anonymous. */
function markers(fixtureServer: FixtureServer, videoId: string): Array<string | null> {
	return fixtureServer
		.telemetry()
		.requests.filter((request): request is ProbeStart => request.kind === 'probe-start' && request.videoId === videoId)
		.map(run => run.marker)
}

async function persistedAuthOnceDone(userDataDir: string, url: string): Promise<JobAuth | undefined> {
	const find = (): QueueItem | undefined => readPersistedQueue(userDataDir).find(item => item.url === url)
	await expect.poll(() => find()?.status, {timeout: 60_000}).toBe('done')
	return find()?.auth
}

async function expectRowDone(page: Page, title: string): Promise<void> {
	await openQueueTab(page)
	await expect(queueCardByTitle(page, title)).toHaveAttribute('data-status', 'done', {timeout: 120_000})
}

function notWorkingRow(page: Page) {
	return page.getByTestId('cookies-not-working-sign-in-youtube')
}

// Actions: none; a row restored from a previous session starts by itself.
// Milestones: the row reaches done.
// Oracles: the file on disk; every extraction carried the marker; the row is
// not stored as signed in, so its site decides again at its next start.
test('a download on a site that starts signed in runs signed in from its first launch', async () => {
	test.setTimeout(200_000)

	await withFixtureProductApp(
		{settings: exploreMode, signInFirst: true, exploreCookies: SIGNED_IN_EXPLORE_SESSION, restoredQueue: outputDir => [restoredQueueItem('restored-first', FIRST_ID, FIRST_TITLE, outputDir)], userDataPrefix: 'arroxy-fixture-signin-first-user-', outputPrefix: 'arroxy-fixture-signin-first-out-'},
		async ({page, fixtureServer, userDataDir, urls, files}) => {
			await expectRowDone(page, FIRST_TITLE)
			files.expectMp4Count(1)

			const runs = markers(fixtureServer, FIRST_ID)
			expect(runs.length).toBeGreaterThan(0)
			expect(runs.every(marker => marker === MARKER)).toBe(true)
			expect(await persistedAuthOnceDone(userDataDir, urls.video(FIRST_ID))).toBeUndefined()
		}
	)
})

// Fixtures: the first extraction of each video fails with an error no
// classifier knows, as a refused sign-in can look; later ones succeed.
// Actions: let both restored rows finish; open Settings; restart the app;
// click "Use my sign-in again".
// Milestones: each row reaches done; Settings lists YouTube's sign-in as not
// working, before and after the restart; the row goes after the click.
// Oracles: each video ran signed in once, then anonymous once; both files on disk.
test('a sign-in that keeps failing gets one anonymous run per download, and is marked as not working until the user reuses it', async () => {
	test.setTimeout(300_000)

	await withFixtureProductApp(
		{
			behavior: {extractionScript: {[FIRST_ID]: [{error: UNKNOWN_FAILURE}], [SECOND_ID]: [{error: UNKNOWN_FAILURE}]}},
			settings: exploreMode,
			signInFirst: true,
			exploreCookies: SIGNED_IN_EXPLORE_SESSION,
			restoredQueue: outputDir => [restoredQueueItem('restored-a', FIRST_ID, FIRST_TITLE, outputDir), restoredQueueItem('restored-b', SECOND_ID, SECOND_TITLE, outputDir)],
			userDataPrefix: 'arroxy-fixture-signin-suspect-user-',
			outputPrefix: 'arroxy-fixture-signin-suspect-out-'
		},
		async ({page, fixtureServer, files, relaunch}) => {
			await expectRowDone(page, FIRST_TITLE)
			await expectRowDone(page, SECOND_TITLE)
			files.expectMp4Count(2)
			expect(markers(fixtureServer, FIRST_ID)).toEqual([MARKER, null])
			expect(markers(fixtureServer, SECOND_ID)).toEqual([MARKER, null])

			await page.getByRole('tab', {name: 'Settings'}).click()
			await expect(notWorkingRow(page)).toContainText('YouTube stopped working with your sign-in')

			const next = await relaunch()
			await next.page.getByRole('tab', {name: 'Settings'}).click()
			await expect(notWorkingRow(next.page)).toBeVisible({timeout: 30_000})
			await notWorkingRow(next.page).getByRole('button', {name: 'Use my sign-in again'}).click()
			await expect(notWorkingRow(next.page)).toHaveCount(0)
		}
	)
})
