import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {expect, test, type Page} from '@playwright/test'
import {FIXTURE_VIDEO_IDS, type FixtureParsedExtractorArgs, type FixtureServer, type FixtureServerRequest} from './fixtureHarness.js'
import {FIXTURE_PLAYLIST_ID} from './fixtureMediaCatalog.js'
import {restoredQueueItem, withFixtureProductApp} from './fixtureProductE2E.js'
import {openQueueTab, queueCardByTitle} from './fixtureWorkflow.js'

// Extractor-args risk group: what yt-dlp actually parses from Arroxy's
// --extractor-args, not what the argv appears to say. yt-dlp keeps only the
// last block per extractor, so a token in one block and the player clients in
// a later one silently drops the token; an argv check passes regardless. The
// failure modes are an anonymous YouTube run that loses its token or visitor
// data, a token reaching a run that carries cookies or enumerates a playlist,
// and recovery attempts that relaunch an identical configuration.
//
// Fixtures: the fixture extractor reads the youtube extractor args the way the
// real one does (`_configuration_arg`) and reports, per extraction, whether a
// token and visitor data were parsed and which clients. The token comes from
// the E2E mock provider. A scenario's extraction script replays YouTube's
// warnings and refusals in yt-dlp's own wording.

const VIDEO_ID = FIXTURE_VIDEO_IDS[2]
const VIDEO_TITLE = 'Fixture Video 3'
const PRODUCTION_CLIENTS = ['default', 'web_embedded']

const ANONYMOUS_WITH_TOKEN: FixtureParsedExtractorArgs = {poToken: true, visitorData: true, playerClient: PRODUCTION_CLIENTS}
const ANONYMOUS_WITHOUT_TOKEN: FixtureParsedExtractorArgs = {poToken: false, visitorData: false, playerClient: PRODUCTION_CLIENTS}

// yt-dlp's wording: the webpage request's HTTP 429 (common.py, as a warning),
// and the bot check YouTube returns, with the hint yt-dlp appends.
const RATE_LIMIT_WARNING = 'Unable to download webpage: HTTP Error 429: Too Many Requests (caused by <HTTPError 429: Too Many Requests>)'
const BOT_CHECK_ERROR = 'Sign in to confirm you’re not a bot. Use --cookies-from-browser or --cookies for the authentication.'

type ProbeStart = Extract<FixtureServerRequest, {kind: 'probe-start'}>

/** One entry per yt-dlp extraction of the item, refused ones included. */
function extractions(fixtureServer: FixtureServer, id: string): ProbeStart[] {
	return fixtureServer.telemetry().requests.filter((request): request is ProbeStart => request.kind === 'probe-start' && request.videoId === id)
}

async function expectRowStatus(page: Page, title: string, status: 'done' | 'error'): Promise<void> {
	await openQueueTab(page)
	await expect(queueCardByTitle(page, title)).toHaveAttribute('data-status', status, {timeout: 120_000})
}

// Actions: none; an item left pending by a previous session downloads at startup.
// Milestones: the row reaches done.
// Oracles: the file on disk; every extraction parsed the token, the visitor
// data and the production clients together.
test('An anonymous YouTube download hands yt-dlp its token, visitor data and clients together', async () => {
	test.setTimeout(180_000)

	await withFixtureProductApp({restoredQueue: outputDir => [restoredQueueItem('restored-anonymous', VIDEO_ID, VIDEO_TITLE, outputDir)], userDataPrefix: 'arroxy-fixture-xargs-media-user-', outputPrefix: 'arroxy-fixture-xargs-media-out-'}, async ({page, fixtureServer, files}) => {
		await expectRowStatus(page, VIDEO_TITLE, 'done')
		files.expectMp4Count(1)

		const runs = extractions(fixtureServer, VIDEO_ID)
		expect(runs.length).toBeGreaterThan(0)
		expect(runs.map(run => run.extractorArgs)).toEqual(runs.map(() => ANONYMOUS_WITH_TOKEN))
	})
})

// Baseline for the recovery policy: today the probe relaunches a degraded
// success once with an unchanged configuration, so a rate limit is answered by
// an identical request. This pins the current count; the recovery policy is
// meant to bring it down to one.
// Fixtures: the first extraction succeeds with yt-dlp's HTTP 429 warning.
// Actions: Interactive Download of the video from the URL tab.
// Milestones: the format step opens.
// Oracles: two extractions, both carrying the token, the visitor data and the
// production clients.
test('A single-video probe that succeeds with a rate-limit warning is relaunched once, unchanged', async () => {
	test.setTimeout(120_000)

	await withFixtureProductApp({behavior: {extractionScript: {[VIDEO_ID]: [{warnings: [RATE_LIMIT_WARNING]}]}}, userDataPrefix: 'arroxy-fixture-xargs-probe-user-', outputPrefix: 'arroxy-fixture-xargs-probe-out-'}, async ({page, fixtureServer, urls}) => {
		await page.locator('[data-testid="profiles-main-input"]').fill(urls.video(VIDEO_ID))
		await page.locator('[data-testid="profiles-interactive-download"]').click()
		await expect(page.locator('[data-testid="step-formats"]')).toBeVisible({timeout: 60_000})

		expect(extractions(fixtureServer, VIDEO_ID).map(run => run.extractorArgs)).toEqual([ANONYMOUS_WITH_TOKEN, ANONYMOUS_WITH_TOKEN])
	})
})

// The token ladder on a bot wall: a token, a freshly minted token, then a run
// without one. Each step must reach yt-dlp as a different configuration;
// otherwise the ladder relaunches the same request three times.
// Fixtures: every anonymous extraction of the video meets YouTube's bot check;
// cookies are off, so no account can take over.
// Milestones: the row fails.
// Oracles: exactly three extractions: two with the token and visitor data,
// the last with neither, all with the production clients.
test('A bot-walled anonymous download tries the token, a fresh token, then no token', async () => {
	test.setTimeout(180_000)

	const botChecks = Array.from({length: 6}, () => ({error: BOT_CHECK_ERROR}))
	await withFixtureProductApp(
		{behavior: {extractionScript: {[VIDEO_ID]: botChecks}}, restoredQueue: outputDir => [restoredQueueItem('restored-bot-walled', VIDEO_ID, VIDEO_TITLE, outputDir)], userDataPrefix: 'arroxy-fixture-xargs-ladder-user-', outputPrefix: 'arroxy-fixture-xargs-ladder-out-'},
		async ({page, fixtureServer, files}) => {
			await expectRowStatus(page, VIDEO_TITLE, 'error')
			files.expectMp4Count(0)

			expect(extractions(fixtureServer, VIDEO_ID).map(run => run.extractorArgs)).toEqual([ANONYMOUS_WITH_TOKEN, ANONYMOUS_WITH_TOKEN, ANONYMOUS_WITHOUT_TOKEN])
		}
	)
})

// Supplied visitor data overrides the per-page visitor yt-dlp refreshes while
// paginating a tab, which stops a playlist at its first page; so a collection
// probe never carries the anonymous token context.
// Actions: Interactive Download of the fixture playlist.
// Milestones: the playlist's item list opens and lists its videos (the step
// opens while the probe is still running, so its rows mark the probe's end).
// Oracles: the playlist extraction parsed neither a token nor visitor data.
test('A playlist probe hands yt-dlp no token or visitor data', async () => {
	test.setTimeout(120_000)

	await withFixtureProductApp({userDataPrefix: 'arroxy-fixture-xargs-playlist-user-', outputPrefix: 'arroxy-fixture-xargs-playlist-out-'}, async ({page, fixtureServer, urls}) => {
		await page.locator('[data-testid="profiles-main-input"]').fill(urls.playlist())
		await page.locator('[data-testid="profiles-interactive-download"]').click()
		await expect(page.locator('[data-testid="step-playlist-items"]')).toBeVisible({timeout: 60_000})
		await expect(page.locator('[data-testid^="playlist-item-row-"]').first()).toBeVisible({timeout: 60_000})

		await expect.poll(() => extractions(fixtureServer, FIXTURE_PLAYLIST_ID).length, {timeout: 30_000}).toBeGreaterThan(0)
		const runs = extractions(fixtureServer, FIXTURE_PLAYLIST_ID)
		expect(runs.every(run => !run.extractorArgs.poToken && !run.extractorArgs.visitorData)).toBe(true)
	})
})

// The anonymous token and visitor data describe a signed-out visitor; yt-dlp
// documents visitor data as for use without cookies. A run that carries the
// user's cookies file must not pair them with it.
// Fixtures: cookies mode `file`, pointing at a Netscape cookies file.
// Milestones: the restored row reaches done.
// Oracles: every extraction carried cookies and parsed neither a token nor
// visitor data.
test('A download with a cookies file hands yt-dlp no anonymous token', async () => {
	test.setTimeout(180_000)

	const cookiesDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arroxy-fixture-xargs-cookies-'))
	const cookiesPath = path.join(cookiesDir, 'cookies.txt')
	fs.writeFileSync(cookiesPath, '# Netscape HTTP Cookie File\n.youtube.com\tTRUE\t/\tTRUE\t2147483647\tPREF\tf6=8\n', 'utf8')
	try {
		await withFixtureProductApp(
			{
				settings: settings => {
					settings.common.cookiesMode = 'file'
					settings.common.cookiesPath = cookiesPath
				},
				restoredQueue: outputDir => [restoredQueueItem('restored-cookies-file', VIDEO_ID, VIDEO_TITLE, outputDir)],
				userDataPrefix: 'arroxy-fixture-xargs-file-user-',
				outputPrefix: 'arroxy-fixture-xargs-file-out-'
			},
			async ({page, fixtureServer, files}) => {
				await expectRowStatus(page, VIDEO_TITLE, 'done')
				files.expectMp4Count(1)

				const runs = extractions(fixtureServer, VIDEO_ID)
				expect(runs.length).toBeGreaterThan(0)
				expect(runs.every(run => run.signedIn)).toBe(true)
				expect(runs.every(run => !run.extractorArgs.poToken && !run.extractorArgs.visitorData)).toBe(true)
			}
		)
	} finally {
		fs.rmSync(cookiesDir, {recursive: true, force: true})
	}
})
