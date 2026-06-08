import fs from 'node:fs'
import path from 'node:path'
import {expect, test} from '@playwright/test'
import {FIXTURE_PLAYLIST_VIDEO_IDS, FIXTURE_VIDEO_IDS} from './fixtureHarness.js'
import {withFixtureProductApp} from './fixtureProductE2E.js'
import {clickContinue, preparePlaylistConfirm, prepareSingleConfirm, startBulkFromClipboard} from './fixtureWorkflow.js'

test.describe.configure({mode: 'serial'})

test('Electron quick download queues and completes a fixture video', async () => {
	test.setTimeout(140_000)
	const videoId = FIXTURE_VIDEO_IDS[7]

	await withFixtureProductApp({userDataPrefix: 'arroxy-fixture-quick-user-', outputPrefix: 'arroxy-fixture-quick-out-'}, async ({page, urls, queue, files}) => {
		await page.locator('[data-testid="url-input"]').fill(urls.video(videoId))
		await page.locator('[data-testid="btn-quick-download"]').click()
		await expect(page.locator('[data-testid="quick-download-feedback"]')).toContainText(/queue/i, {timeout: 60_000})
		await queue.expectStatus('Fixture Video 8', 'done', 120_000)

		files.expectMp4Count(1)
	})
})

test('Electron full single-video wizard completes media and sidecar subtitles', async () => {
	test.setTimeout(180_000)
	const videoId = FIXTURE_VIDEO_IDS[8]

	await withFixtureProductApp(
		{
			userDataPrefix: 'arroxy-fixture-full-single-user-',
			outputPrefix: 'arroxy-fixture-full-single-out-',
			settings: settings => {
				settings.single.lastSubtitleLanguages = ['en']
				settings.single.lastSubtitleMode = 'sidecar'
				settings.single.lastSubtitleFormat = 'srt'
			}
		},
		async ({page, fixtureServer, queue, files}) => {
			await prepareSingleConfirm(page, videoId, 'continue')
			await page.locator('[data-testid="btn-download-now"]').click()
			await queue.expectStatus('Fixture Video 9', 'done', 140_000)

			files.expectMp4Count(1)
			const subtitleFiles = files.mediaFiles('.en.srt')
			expect(subtitleFiles).toHaveLength(1)
			expect(fs.readFileSync(subtitleFiles[0], 'utf8')).toContain(`Fixture subtitle for ${videoId}`)
			const subtitleRequest = fixtureServer.telemetry().requests.find(request => request.kind === 'subtitle' && request.videoId === videoId && request.status === 200)
			expect(subtitleRequest).toBeTruthy()
		}
	)
})

test('Electron true playlist URL queues entries and writes an ordered M3U', async () => {
	test.setTimeout(220_000)

	await withFixtureProductApp({userDataPrefix: 'arroxy-fixture-playlist-user-', outputPrefix: 'arroxy-fixture-playlist-out-'}, async ({page, outputDir, urls, files}) => {
		await preparePlaylistConfirm(page, urls.playlist())
		await expect(page.locator('[data-testid="confirm-playlist"]')).toContainText('Fixture Playlist')
		await expect(page.locator('[data-testid="confirm-items"]')).toContainText(String(FIXTURE_PLAYLIST_VIDEO_IDS.length))
		await page.locator('[data-testid="btn-add-to-queue"]').click()

		await expect(page.locator('[data-testid^="queue-card-"]')).toHaveCount(FIXTURE_PLAYLIST_VIDEO_IDS.length, {timeout: 20_000})
		await expect(page.locator('[data-testid^="queue-card-"][data-status="done"]')).toHaveCount(FIXTURE_PLAYLIST_VIDEO_IDS.length, {timeout: 160_000})

		const playlistDir = path.join(outputDir, 'Fixture Playlist')
		files.expectMp4Count(FIXTURE_PLAYLIST_VIDEO_IDS.length, playlistDir)
		const m3uPath = path.join(playlistDir, 'Fixture Playlist.m3u')
		await expect.poll(() => fs.existsSync(m3uPath), {timeout: 20_000}).toBe(true)
		const m3u = fs.readFileSync(m3uPath, 'utf8')
		expect(m3u.startsWith('#EXTM3U\n')).toBe(true)
		for (const videoId of FIXTURE_PLAYLIST_VIDEO_IDS) {
			expect(m3u).toContain(`[${videoId}].mp4`)
		}
		const orderedIds = [...m3u.matchAll(/\[(ARX[0-9A-Z]{8})\]\.mp4/g)].map(match => match[1])
		expect(orderedIds).toEqual([...FIXTURE_PLAYLIST_VIDEO_IDS])
	})
})

test('Electron bulk metadata concurrency and back/next navigation reach completed queue files', async () => {
	test.setTimeout(240_000)

	await withFixtureProductApp({behavior: {metadataDelayMs: 2_000}, userDataPrefix: 'arroxy-fixture-electron-user-', outputPrefix: 'arroxy-fixture-electron-out-'}, async ({app, page, fixtureServer, urls, files}) => {
		const rawBulkText = [...urls.videos(FIXTURE_VIDEO_IDS), urls.video(FIXTURE_VIDEO_IDS[0]), urls.playlist()].join('\n')
		await startBulkFromClipboard(page, app, rawBulkText)
		await expect(page.locator('[data-testid="bulk-url-valid-count"]')).toContainText('10')
		await expect(page.locator('[data-testid="bulk-url-ignored-count"]')).toContainText('2')
		await page.locator('[data-testid="bulk-url-confirm"]').click()

		await expect(page.locator('[data-testid="step-playlist-items"]')).toBeVisible()
		await expect.poll(() => fixtureServer.telemetry().maxActiveProbes, {timeout: 10_000}).toBe(2)
		await expect(page.locator('[data-testid="bulk-metadata-status"]')).toContainText('/10')

		await clickContinue(page)
		await expect(page.locator('[data-testid="step-playlist-presets"]')).toBeVisible()
		const probeEndsBeforeBack = fixtureServer.telemetry().requests.filter(request => request.kind === 'probe-end').length
		expect(probeEndsBeforeBack).toBeLessThan(FIXTURE_VIDEO_IDS.length)

		await page.getByRole('button', {name: /^back$/i}).click()
		await expect(page.locator('[data-testid="step-playlist-items"]')).toBeVisible()
		await expect(page.locator('[data-testid="bulk-metadata-status"]')).toContainText('/10')

		await clickContinue(page)
		await expect(page.locator('[data-testid="step-playlist-presets"]')).toBeVisible()
		const probeEndsBeforeQueue = fixtureServer.telemetry().requests.filter(request => request.kind === 'probe-end').length
		expect(probeEndsBeforeQueue).toBeLessThan(FIXTURE_VIDEO_IDS.length)

		await page.getByRole('button', {name: /skip to confirm/i}).click()
		await expect(page.locator('[data-testid="step-confirm"]')).toBeVisible()
		await expect(page.locator('[data-testid="confirm-items"]')).toContainText('10')
		await page.locator('[data-testid="btn-add-to-queue"]').click()

		await expect(page.locator('[data-testid^="queue-card-"]')).toHaveCount(10, {timeout: 20_000})
		await expect(page.locator('[data-testid^="queue-card-"][data-status="done"]')).toHaveCount(10, {timeout: 180_000})

		files.expectMp4Count(10)
		expect(files.listRecursive().filter(fileName => fileName.endsWith('.m3u'))).toHaveLength(0)
	})
})
