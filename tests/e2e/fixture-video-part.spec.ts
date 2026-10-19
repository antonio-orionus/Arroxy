// Fixture Product E2E — Part of video.
//
// 1. User-facing risk: a part of a video downloads the whole video, keeps the
//    whole video's name (so playlist sync later mistakes it for the full
//    download), loses its range on Retry, or embeds chapters that no longer
//    match the cut. Only real yt-dlp sections through ffmpeg on a real file
//    prove it.
//
// 2. Fixtures: the chaptered fixture video (8 s, chapters Opening 0-3,
//    Middle 3-6, Ending 6-8) served as a real muxed MP4. The first media
//    request fails with 503; the server recovers before Retry. The profile is
//    Small file 480p with chapters and metadata embedded.
//
// 3. Real user actions: paste the URL, Interactive Download, switch to Part,
//    click the "Middle" chapter chip, Download; after the failure, Retry.
//
// 4. Milestones: the Format screen shows the chapter count and the Part panel
//    with the chip's range in Start/End; the row reaches `error`, then `done`.
//
// 5. Oracles: the only MP4 is `… [id] [3s-6s].mp4`; it lasts about three
//    seconds, so Retry cut the range once (replaying the failed attempt's
//    post-cut info-json used to cut it twice); it embeds no chapters, since
//    yt-dlp would carry the whole video's chapters over unshifted; the
//    persisted job still holds the range; the deny proxy saw no external
//    request.
import path from 'node:path'
import {expect, test} from '@playwright/test'
import {BUILTIN_DOWNLOAD_PROFILES} from '../../src/shared/downloadProfiles.js'
import type {AppSettings} from '../../src/shared/types.js'
import {CHAPTERED_VIDEO_ID} from './fixtureMediaCatalog.js'
import {probeContainer} from './ffprobe.js'
import {readPersistedQueue, withFixtureProductApp} from './fixtureProductE2E.js'

function smallFileWithChapters(settings: AppSettings): void {
	const smallFile = BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'small-file')
	if (!smallFile) throw new Error('small-file built-in profile missing')
	settings.profiles.active = {kind: 'builtin', id: 'small-file'}
	settings.profiles.overrides = [{...smallFile, embed: {chapters: true, metadata: true, thumbnail: false, description: false, thumbnailSidecar: false}, sponsorBlock: {mode: 'off', categories: []}}]
}

test('Electron downloads one chapter of a video as a suffixed part, and Retry keeps the range', async () => {
	test.setTimeout(180_000)
	const videoId = CHAPTERED_VIDEO_ID
	const title = 'Fixture Video 16'

	await withFixtureProductApp({behavior: {mediaFailureIds: [videoId]}, userDataPrefix: 'arroxy-fixture-part-user-', outputPrefix: 'arroxy-fixture-part-out-', settings: smallFileWithChapters}, async ({page, userDataDir, outputDir, fixtureServer, urls, queue, files}) => {
		await page.locator('[data-testid="profiles-main-input"]').fill(urls.video(videoId))
		await page.locator('[data-testid="profiles-interactive-download"]').click()
		await expect(page.locator('[data-testid="step-formats"]')).toBeVisible({timeout: 60_000})
		await expect(page.locator('[data-slot="video-summary-card"]')).toContainText('3 chapters')

		await page.locator('[data-testid="video-part-part"]').click()
		await expect(page.locator('[data-testid="video-part-panel"]')).toBeVisible()
		await page.locator('[data-testid="video-part-chapter-1"]').click()
		await expect(page.locator('[data-testid="video-part-start"]')).toHaveValue('0:03')
		await expect(page.locator('[data-testid="video-part-end"]')).toHaveValue('0:06')

		await page.locator('[data-testid="btn-format-continue"]').click()
		await expect(page.locator('[data-testid="step-review"]')).toBeVisible()
		await page.locator('[data-testid="btn-download"]').click()
		await queue.expectStatus(title, 'error', 90_000)

		fixtureServer.setBehavior({})
		await queue.action(title, 'retry')
		await queue.expectStatus(title, 'done', 120_000)

		const profileDir = path.join(outputDir, 'Small file 480p')
		const outputs = files.mediaFiles('.mp4', profileDir)
		expect(outputs.map(file => path.basename(file))).toEqual([`${title} [${videoId}] [3s-6s].mp4`])

		const container = probeContainer(outputs[0])
		// Cuts land on keyframes, which the fixture places every second.
		expect(container.durationSeconds).toBeGreaterThan(2)
		expect(container.durationSeconds).toBeLessThan(5)
		// yt-dlp would embed the whole video's chapters unshifted, so a part carries none.
		expect(container.chapters).toEqual([])

		const job = readPersistedQueue(userDataDir).find(item => item.title === title)?.job
		expect(job && 'videoPart' in job ? job.videoPart : undefined).toEqual({startSeconds: 3, endSeconds: 6, exactCut: false})
		expect(fixtureServer.telemetry().requests.some(request => request.kind === 'media' && request.videoId === videoId && request.status === 503)).toBe(true)
	})
})
