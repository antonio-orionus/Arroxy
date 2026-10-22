import {expect, test, type Page} from '@playwright/test'
import {FIXTURE_PLAYLIST_ID, FIXTURE_PLAYLIST_VIDEO_IDS, FIXTURE_VIDEO_IDS, fixtureUrl, type FixtureServer} from './fixtureHarness.js'
import {FIXTURE_MIX_ID, FIXTURE_MIX_VIDEO_IDS, FIXTURE_MUSIC_PLAYLIST_ID} from './fixtureMediaCatalog.js'
import {withFixtureProductApp} from './fixtureProductE2E.js'

// Link intake risk group: a YouTube link that names a video and a list
// (`watch?v=…&list=…`), Mix and YouTube Music playlists included. The URL tab's
// card splits: This video downloads the video at once, the list button names
// the list (Download playlist…, Download Mix…) and asks how to take it. Plain
// links and Bulk URLs behave as before.
//
// Fixtures: the fixture extractor serves the catalog's lists by id: a plain
// playlist (`PL…`), a Mix (`RD…`) and a YouTube Music playlist (`RDCLAK…`); the
// video extractor follows a link's list only on `--yes-playlist`, as yt-dlp's
// YouTube extractor does. Each list load is recorded with the fixture server
// under the list id (`probe-start`).
// Oracles: the card's and dialog's names, the rows in Downloads, files on
// disk, and which lists were loaded.

function rows(page: Page) {
	return page.locator('[data-testid^="queue-manager-row-"]')
}

function listLoads(fixtureServer: FixtureServer, listId: string): number {
	return fixtureServer.telemetry().requests.filter(request => request.kind === 'probe-start' && request.videoId === listId).length
}

function probeStarts(fixtureServer: FixtureServer): number {
	return fixtureServer.telemetry().requests.filter(request => request.kind === 'probe-start').length
}

async function paste(page: Page, url: string): Promise<void> {
	await page.locator('[data-testid="profiles-main-input"]').fill(url)
}

// The card on a link that names a video and a list: This video, then the list button.
async function expectSplitCard(page: Page, listLabel: string): Promise<void> {
	await expect(page.getByTestId('profiles-quick-download-video')).toHaveText('This video')
	await expect(page.getByTestId('profiles-quick-download')).toContainText(listLabel)
	await expect(page.getByTestId('profiles-interactive-download')).toContainText('Interactive Download…')
}

// The watcher's record, kept in the renderer between evaluate calls.
declare global {
	var __arroxyE2eNeedsChoiceRows: Set<string> | undefined
}

// Counts every row that ever shows the "how many?" question, however briefly.
async function watchForNeedsChoice(page: Page): Promise<() => Promise<number>> {
	await page.evaluate(() => {
		const seen = new Set<string>()
		const scan = (): void => {
			for (const row of document.querySelectorAll('[data-testid^="queue-manager-row-"][data-status="needs-choice"]')) seen.add(row.getAttribute('data-testid') ?? '')
		}
		new MutationObserver(scan).observe(document.body, {subtree: true, childList: true, attributes: true, attributeFilter: ['data-status']})
		globalThis.__arroxyE2eNeedsChoiceRows = seen
	})
	return () => page.evaluate(() => globalThis.__arroxyE2eNeedsChoiceRows?.size ?? -1)
}

// Actions: paste a video-in-a-playlist link, This video.
// Milestones: the split card; no dialog; one row done.
// Oracles: one mp4 on disk; the playlist was never loaded.
test('This video downloads the video in one move and never loads its playlist', async () => {
	test.setTimeout(150_000)
	const videoId = FIXTURE_PLAYLIST_VIDEO_IDS[0]
	if (!videoId) throw new Error('fixture playlist needs a first video')

	await withFixtureProductApp({userDataPrefix: 'arroxy-fixture-intake-this-video-user-', outputPrefix: 'arroxy-fixture-intake-this-video-out-'}, async ({page, fixtureServer, urls, files}) => {
		await paste(page, urls.videoInPlaylist(videoId))
		await expectSplitCard(page, 'Download playlist…')

		await page.getByTestId('profiles-quick-download-video').click()
		await expect(page.getByTestId('mixed-prompt-title')).toHaveCount(0)
		await expect(page.locator('[data-testid="profiles-main-input"]')).toHaveValue('')

		await page.locator('.downloads-tab-trigger').click()
		await expect(rows(page).first()).toHaveAttribute('data-status', 'done', {timeout: 120_000})
		await expect(rows(page)).toHaveCount(1)
		await expect.poll(() => files.mediaFiles('mp4').length, {timeout: 20_000}).toBe(1)
		files.expectMp4Count(1)
		expect(listLoads(fixtureServer, FIXTURE_PLAYLIST_ID)).toBe(0)
	})
})

// Users of the old dialog look for the video there, not beside the list button.
// Actions: paste a video-in-a-playlist link, the list button, Just this video.
// Milestones: the dialog; one row done.
// Oracles: one mp4 on disk; the playlist was never loaded.
test('Just this video in the list dialog downloads the video and never loads its playlist', async () => {
	test.setTimeout(150_000)
	const videoId = FIXTURE_PLAYLIST_VIDEO_IDS[0]
	if (!videoId) throw new Error('fixture playlist needs a first video')

	await withFixtureProductApp({userDataPrefix: 'arroxy-fixture-intake-dialog-video-user-', outputPrefix: 'arroxy-fixture-intake-dialog-video-out-'}, async ({page, fixtureServer, urls, files}) => {
		await paste(page, urls.videoInPlaylist(videoId))
		await page.getByTestId('profiles-quick-download').click()
		await expect(page.getByTestId('mixed-prompt-title')).toHaveText('Download from this playlist', {timeout: 10_000})
		await page.getByTestId('mixed-video-choice').click()
		await expect(page.getByTestId('mixed-prompt-title')).toHaveCount(0)

		await page.locator('.downloads-tab-trigger').click()
		await expect(rows(page).first()).toHaveAttribute('data-status', 'done', {timeout: 120_000})
		await expect(rows(page)).toHaveCount(1)
		await expect.poll(() => files.mediaFiles('mp4').length, {timeout: 20_000}).toBe(1)
		files.expectMp4Count(1)
		expect(listLoads(fixtureServer, FIXTURE_PLAYLIST_ID)).toBe(0)
	})
})

// Actions: paste a video-in-a-playlist link, Interactive Download…, Just this video.
// Milestones: Interactive's prompt; the format step opens.
// Oracles: the playlist was never loaded.
test("Interactive's Just this video sets up the video alone and never loads its playlist", async () => {
	test.setTimeout(120_000)
	const videoId = FIXTURE_PLAYLIST_VIDEO_IDS[0]
	if (!videoId) throw new Error('fixture playlist needs a first video')

	await withFixtureProductApp({userDataPrefix: 'arroxy-fixture-intake-pick-video-user-', outputPrefix: 'arroxy-fixture-intake-pick-video-out-'}, async ({page, fixtureServer, urls}) => {
		await paste(page, urls.videoInPlaylist(videoId))
		await page.getByTestId('profiles-interactive-download').click()
		await expect(page.getByTestId('mixed-prompt-title')).toHaveText('Pick from this playlist', {timeout: 10_000})
		await page.getByTestId('mixed-video-choice').click()
		await expect(page.getByTestId('mixed-prompt-title')).toHaveCount(0)

		await expect(page.getByTestId('step-formats')).toBeVisible({timeout: 60_000})
		expect(listLoads(fixtureServer, FIXTURE_PLAYLIST_ID)).toBe(0)
	})
})

// Actions: paste a Shorts link opened from a playlist (`/shorts/<id>?list=…`), This video.
// yt-dlp sends that address to its playlist extractor, which drops the video, so
// Arroxy reads it as its watch address first.
// Oracles: one video on disk; the playlist was never loaded.
test('This video on a Shorts link inside a playlist downloads the video, not the playlist', async () => {
	test.setTimeout(150_000)
	const videoId = FIXTURE_PLAYLIST_VIDEO_IDS[0]
	if (!videoId) throw new Error('fixture playlist needs a first video')

	await withFixtureProductApp({userDataPrefix: 'arroxy-fixture-intake-shorts-user-', outputPrefix: 'arroxy-fixture-intake-shorts-out-'}, async ({page, fixtureServer, files}) => {
		await paste(page, `https://www.youtube.com/shorts/${videoId}?list=${FIXTURE_PLAYLIST_ID}`)
		await expectSplitCard(page, 'Download playlist…')

		await page.getByTestId('profiles-quick-download-video').click()
		await expect(page.getByTestId('mixed-prompt-title')).toHaveCount(0)

		await page.locator('.downloads-tab-trigger').click()
		await expect(rows(page).first()).toHaveAttribute('data-status', 'done', {timeout: 120_000})
		await expect(rows(page)).toHaveCount(1)
		await expect.poll(() => files.mediaFiles('mp4').length, {timeout: 20_000}).toBe(1)
		expect(listLoads(fixtureServer, FIXTURE_PLAYLIST_ID)).toBe(0)
	})
})

// Actions: paste a video-in-a-playlist link with a load limit below the
// playlist's length, Download playlist…, Download the first N.
// Milestones: the dialog with the count in its answer; N rows; N rows done.
// Oracles: no row ever asks how many; exactly the first N videos on disk, the
// rest never fetched.
test('Download the first N from the list button queues N with no further question', async () => {
	test.setTimeout(200_000)
	const limit = 2
	const videoId = FIXTURE_PLAYLIST_VIDEO_IDS[0]
	if (!videoId || FIXTURE_PLAYLIST_VIDEO_IDS.length <= limit) throw new Error('fixture playlist needs more videos than the limit')

	await withFixtureProductApp(
		{
			userDataPrefix: 'arroxy-fixture-intake-first-n-user-',
			outputPrefix: 'arroxy-fixture-intake-first-n-out-',
			settings: settings => {
				settings.common.playlistProbeLimit = limit
			}
		},
		async ({page, fixtureServer, urls, files}) => {
			const needsChoiceRows = await watchForNeedsChoice(page)
			await paste(page, urls.videoInPlaylist(videoId))
			await page.getByTestId('profiles-quick-download').click()
			await expect(page.getByTestId('mixed-prompt-title')).toHaveText('Download from this playlist', {timeout: 10_000})
			await expect(page.getByTestId('mixed-list-choice')).toBeFocused()
			await expect(page.getByTestId('mixed-first-count')).toHaveText(String(limit))
			await page.getByTestId('mixed-first-choice').click()
			await expect(page.getByTestId('mixed-prompt-title')).toHaveCount(0)

			await page.locator('.downloads-tab-trigger').click()
			await expect(rows(page)).toHaveCount(limit, {timeout: 60_000})
			await expect(page.locator('[data-testid^="queue-manager-row-"][data-status="done"]')).toHaveCount(limit, {timeout: 150_000})

			await expect.poll(() => files.mediaFiles('mp4').length, {timeout: 20_000}).toBe(limit)
			files.expectMp4Count(limit)
			for (const skipped of FIXTURE_PLAYLIST_VIDEO_IDS.slice(limit)) files.expectNoMp4For(skipped)
			expect(await needsChoiceRows()).toBe(0)
			expect(listLoads(fixtureServer, FIXTURE_PLAYLIST_ID)).toBeGreaterThan(0)
		}
	)
})

// A Mix used to be forced to its video; now it is a list on offer.
// Actions: paste a video-in-a-Mix link, Download Mix…, Enter.
// Milestones: the dialog names the Mix and says it changes; every Mix video done.
// Oracles: the Mix was loaded; one mp4 per Mix video.
test('a video in a Mix offers the Mix, and Enter downloads it in the background', async () => {
	test.setTimeout(200_000)
	const videoId = FIXTURE_MIX_VIDEO_IDS[0]
	if (!videoId) throw new Error('fixture Mix needs a first video')
	const count = FIXTURE_MIX_VIDEO_IDS.length

	await withFixtureProductApp({userDataPrefix: 'arroxy-fixture-intake-mix-user-', outputPrefix: 'arroxy-fixture-intake-mix-out-'}, async ({page, fixtureServer, files}) => {
		await paste(page, `${fixtureUrl(videoId)}&list=${FIXTURE_MIX_ID}&start_radio=1`)
		await expectSplitCard(page, 'Download Mix…')

		await page.getByTestId('profiles-quick-download').click()
		await expect(page.getByTestId('mixed-prompt-title')).toHaveText('Download from this Mix', {timeout: 10_000})
		await expect(page.getByTestId('mixed-prompt-mix-note')).toHaveText('A Mix changes every time you open it.')
		await expect(page.getByTestId('mixed-list-choice')).toBeFocused()
		await page.keyboard.press('Enter')
		await expect(page.getByTestId('mixed-prompt-title')).toHaveCount(0)

		await page.locator('.downloads-tab-trigger').click()
		await expect(rows(page)).toHaveCount(count, {timeout: 60_000})
		await expect(page.locator('[data-testid^="queue-manager-row-"][data-status="done"]')).toHaveCount(count, {timeout: 150_000})
		await expect.poll(() => files.mediaFiles('mp4').length, {timeout: 20_000}).toBe(count)
		expect(listLoads(fixtureServer, FIXTURE_MIX_ID)).toBeGreaterThan(0)
	})
})

// Actions: paste a YouTube Music playlist link, then a start_radio link on a
// plain playlist (start_radio is not a tell: yt-dlp never reads it), then a
// plain video; open the list dialog on the first, Esc.
// Oracles: each reads as the spec names it; Esc loads nothing; nothing is
// loaded by reading a link.
test('the card names each list by its id: RDCLAK a playlist, start_radio on a PL id a playlist, a plain video no list', async () => {
	test.setTimeout(120_000)
	const videoId = FIXTURE_VIDEO_IDS[1]
	if (!videoId) throw new Error('fixture catalog needs a second video')

	await withFixtureProductApp({userDataPrefix: 'arroxy-fixture-intake-kinds-user-', outputPrefix: 'arroxy-fixture-intake-kinds-out-'}, async ({page, fixtureServer}) => {
		await paste(page, `${fixtureUrl(videoId)}&list=${FIXTURE_MUSIC_PLAYLIST_ID}`)
		await expectSplitCard(page, 'Download playlist…')
		await page.getByTestId('profiles-quick-download').click()
		await expect(page.getByTestId('mixed-prompt-title')).toHaveText('Download from this playlist', {timeout: 10_000})
		await expect(page.getByTestId('mixed-prompt-mix-note')).toHaveCount(0)
		// The first Esc dismisses the focused answer's hint when focus shows it.
		await page.keyboard.press('Escape')
		if ((await page.getByTestId('mixed-prompt-title').count()) > 0) await page.keyboard.press('Escape')
		await expect(page.getByTestId('mixed-prompt-title')).toHaveCount(0)

		await paste(page, `${fixtureUrl(videoId)}&list=${FIXTURE_PLAYLIST_ID}&start_radio=1`)
		await expectSplitCard(page, 'Download playlist…')

		await paste(page, fixtureUrl(videoId))
		await expect(page.getByTestId('profiles-quick-download-video')).toHaveCount(0)
		await expect(page.getByTestId('profiles-quick-download')).toHaveText('Quick Download')
		await expect(page.getByTestId('profiles-interactive-download')).toHaveText('Interactive Download')

		expect(probeStarts(fixtureServer)).toBe(0)
		await expect(rows(page)).toHaveCount(0)
	})
})

// Actions: paste a plain video, Quick Download.
// Oracles: no dialog; the video downloads as before.
test('a plain video link keeps one Quick Download that downloads at once', async () => {
	test.setTimeout(150_000)
	const videoId = FIXTURE_VIDEO_IDS[2]
	if (!videoId) throw new Error('fixture catalog needs a third video')

	await withFixtureProductApp({userDataPrefix: 'arroxy-fixture-intake-plain-user-', outputPrefix: 'arroxy-fixture-intake-plain-out-'}, async ({page, files}) => {
		await paste(page, fixtureUrl(videoId))
		await page.getByTestId('profiles-quick-download').click()
		await expect(page.getByTestId('mixed-prompt-title')).toHaveCount(0)

		await page.locator('.downloads-tab-trigger').click()
		await expect(rows(page).first()).toHaveAttribute('data-status', 'done', {timeout: 120_000})
		await expect.poll(() => files.mediaFiles('mp4').length, {timeout: 20_000}).toBe(1)
	})
})

// Bulk URLs is out of the video-or-list question: a Mix link there stays the
// video alone, as it always was.
// Actions: Bulk URLs with a plain video and a video-in-a-Mix link, Quick Download.
// Oracles: no list dialog, no Bulk review; two videos on disk; the Mix never loaded.
test('Bulk URLs keeps a video in a Mix one video', async () => {
	test.setTimeout(200_000)
	const [plain, inMix] = [FIXTURE_VIDEO_IDS[5], FIXTURE_MIX_VIDEO_IDS[1]]
	if (!plain || !inMix) throw new Error('fixture catalog needs a sixth video and a Mix of two')

	await withFixtureProductApp({userDataPrefix: 'arroxy-fixture-intake-bulk-user-', outputPrefix: 'arroxy-fixture-intake-bulk-out-'}, async ({page, fixtureServer, files}) => {
		await page.getByTestId('profiles-bulk-urls').click()
		await expect(page.getByTestId('bulk-url-dialog')).toBeVisible()
		await page.getByTestId('bulk-url-textarea').fill(`${fixtureUrl(plain)}\n${fixtureUrl(inMix)}&list=${FIXTURE_MIX_ID}&start_radio=1`)
		await page.getByTestId('bulk-quick-download').click()

		await expect(page.getByTestId('mixed-prompt-title')).toHaveCount(0)
		await expect(page.getByTestId('step-playlist-items')).toHaveCount(0)
		await page.locator('.downloads-tab-trigger').click()
		await expect(page.locator('[data-testid^="queue-manager-row-"][data-status="done"]')).toHaveCount(2, {timeout: 150_000})
		await expect.poll(() => files.mediaFiles('mp4').length, {timeout: 20_000}).toBe(2)
		expect(listLoads(fixtureServer, FIXTURE_MIX_ID)).toBe(0)
	})
})
