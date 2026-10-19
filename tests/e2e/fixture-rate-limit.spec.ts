import {expect, test, type Page} from '@playwright/test'
import {FIXTURE_VIDEO_IDS, type FixtureServer, type FixtureServerRequest} from './fixtureHarness.js'
import {restoredQueueItem, withFixtureProductApp} from './fixtureProductE2E.js'
import {openQueueTab, queueCardByTitle} from './fixtureWorkflow.js'

// Rate-limit risk group: a site answering HTTP 429, or YouTube's session rate
// limit. yt-dlp never retries a 429 and reads no Retry-After, so Arroxy owns the
// wait: a probe keeps a usable result without relaunching, and every new request
// to the site (probes, queued starts, automatic retries) waits out one shared
// cooldown, unless the user asks for one request through ("Try now"). The
// failure modes are an identical relaunch answering a rate limit, a burst of
// queued jobs each meeting the same limit, cookie advice that cannot help, and
// a "Try now" that does not actually launch.
//
// Fixtures: the extraction script replays yt-dlp's wording for the webpage
// request's HTTP 429, as the warning it is when the extraction still succeeds
// and as the error that ends it. The cooldown's first step is 60 s, longer than
// any wait below, so every check runs inside it.

const VIDEO_ID = FIXTURE_VIDEO_IDS[0]
const RATE_LIMIT_WARNING = 'Unable to download webpage: HTTP Error 429: Too Many Requests (caused by <HTTPError 429: Too Many Requests>)'
const RATE_LIMIT_ERROR = 'Unable to download webpage: HTTP Error 429: Too Many Requests'
// Long enough for a held start or probe to have launched if it were going to.
const HOLD_OBSERVATION_MS = 8_000

type ProbeStart = Extract<FixtureServerRequest, {kind: 'probe-start'}>

/** One entry per yt-dlp extraction of the video, refused ones included. */
function extractions(fixtureServer: FixtureServer, ids: readonly string[]): ProbeStart[] {
	return fixtureServer.telemetry().requests.filter((request): request is ProbeStart => request.kind === 'probe-start' && ids.includes(request.videoId))
}

async function openInteractive(page: Page, url: string): Promise<void> {
	await page.locator('[data-testid="profiles-main-input"]').fill(url)
	await page.locator('[data-testid="profiles-interactive-download"]').click()
}

// Actions: Interactive Download, then "Try now" on the Format screen.
// Milestones: the Format screen with the rate-limit notice; the formats again.
// Oracles: one extraction for the probe, no cookie advice, the notice offers
// "Try now"; exactly one more extraction for "Try now", whose clean answer
// clears the notice.
test('A probe that succeeds with a 429 warning keeps its formats, launches once, and "Try now" launches exactly once more', async () => {
	test.setTimeout(120_000)

	await withFixtureProductApp({behavior: {extractionScript: {[VIDEO_ID]: [{warnings: [RATE_LIMIT_WARNING]}]}}, userDataPrefix: 'arroxy-fixture-ratelimit-probe-user-', outputPrefix: 'arroxy-fixture-ratelimit-probe-out-'}, async ({page, fixtureServer, urls}) => {
		await openInteractive(page, urls.video(VIDEO_ID))
		await expect(page.locator('[data-testid="step-formats"]')).toBeVisible({timeout: 60_000})

		const notice = page.locator('[data-testid="rate-limit-notice"]')
		await expect(notice).toHaveAttribute('data-variant', 'degraded')
		await expect(notice).toContainText('YouTube is rate-limiting this connection')
		await expect(page.locator('[data-testid="bot-wall-notice"]')).toHaveCount(0)
		await expect(notice).not.toContainText(/cookie/i)
		await page.waitForTimeout(HOLD_OBSERVATION_MS)
		expect(extractions(fixtureServer, [VIDEO_ID])).toHaveLength(1)

		await page.locator('[data-testid="rate-limit-try-now"]').click()
		await expect(notice).toHaveCount(0, {timeout: 60_000})
		await expect(page.locator('[data-testid="step-formats"]')).toBeVisible()
		expect(extractions(fixtureServer, [VIDEO_ID])).toHaveLength(2)
	})
})

// Actions: Interactive Download; Start over and the same URL again; "Try now".
// Milestones: the error step with the rate-limit alert, twice; the Format screen.
// Oracles: one extraction for the fatal 429; none for the second probe, which
// waits out the cooldown; the alert offers "Try now" in place of Retry and no
// cookie advice; exactly one extraction for "Try now".
test('A fatal 429 holds the next probe without launching, and "Try now" launches exactly once', async () => {
	test.setTimeout(120_000)

	await withFixtureProductApp({behavior: {extractionScript: {[VIDEO_ID]: [{error: RATE_LIMIT_ERROR}]}}, userDataPrefix: 'arroxy-fixture-ratelimit-fatal-user-', outputPrefix: 'arroxy-fixture-ratelimit-fatal-out-'}, async ({page, fixtureServer, urls}) => {
		await openInteractive(page, urls.video(VIDEO_ID))
		const alert = page.locator('[data-testid="step-error"] [data-testid="rate-limit-notice"]')
		await expect(alert).toHaveAttribute('data-variant', 'failed', {timeout: 60_000})
		await expect(alert).toHaveAttribute('data-cooling', 'true')
		await expect(page.locator('[data-testid="btn-retry"]')).toHaveCount(0)
		await expect(page.locator('[data-testid="cookies-error-alert"]')).toHaveCount(0)
		await expect(page.locator('[data-testid="bot-wall-notice"]')).toHaveCount(0)
		expect(extractions(fixtureServer, [VIDEO_ID])).toHaveLength(1)

		await page.locator('[data-testid="btn-start-over"]').click()
		await openInteractive(page, urls.video(VIDEO_ID))
		await expect(alert).toBeVisible({timeout: 30_000})
		await page.waitForTimeout(HOLD_OBSERVATION_MS)
		expect(extractions(fixtureServer, [VIDEO_ID])).toHaveLength(1)

		await page.locator('[data-testid="rate-limit-try-now"]').click()
		await expect(page.locator('[data-testid="step-formats"]')).toBeVisible({timeout: 60_000})
		expect(extractions(fixtureServer, [VIDEO_ID])).toHaveLength(2)
	})
})

// Fixtures: four items left pending by a previous session, one at a time;
// each video's first extraction meets a fatal 429. Automatic retry is off.
// Milestones: the first row fails.
// Oracles: the other three stay pending and none of them launches an
// extraction while the cooldown runs.
test('A 429 burst across queued jobs: once the first meets the limit, the rest wait without launching', async () => {
	test.setTimeout(120_000)

	const videoIds = FIXTURE_VIDEO_IDS.slice(0, 4)
	const titles = videoIds.map((_, index) => `Rate-limited ${index + 1}`)
	await withFixtureProductApp(
		{
			behavior: {extractionScript: Object.fromEntries(videoIds.map(id => [id, [{error: RATE_LIMIT_ERROR}]]))},
			settings: settings => {
				settings.common.concurrentDownloads = 1
				settings.common.autoRetryAttempts = 0
			},
			restoredQueue: outputDir => videoIds.map((id, index) => restoredQueueItem(`restored-burst-${index + 1}`, id, titles[index], outputDir)),
			userDataPrefix: 'arroxy-fixture-ratelimit-burst-user-',
			outputPrefix: 'arroxy-fixture-ratelimit-burst-out-'
		},
		async ({page, fixtureServer, files}) => {
			await openQueueTab(page)
			await expect(queueCardByTitle(page, titles[0])).toHaveAttribute('data-status', 'error', {timeout: 60_000})
			const launched = extractions(fixtureServer, videoIds).length
			expect(launched).toBe(1)

			await page.waitForTimeout(HOLD_OBSERVATION_MS)
			expect(extractions(fixtureServer, videoIds)).toHaveLength(launched)
			for (const title of titles.slice(1)) await expect(queueCardByTitle(page, title)).toHaveAttribute('data-status', 'pending')
			files.expectMp4Count(0)
		}
	)
})
