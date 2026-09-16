import {expect, test} from '@playwright/test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {FIXTURE_VIDEO_IDS, SPLIT_MEDIA_VIDEO_ID} from './fixtureHarness.js'
import {COOKIE_LIMITED_VIDEO_ID, SABR_LIMITED_VIDEO_ID, fixtureMediaFileSize} from './fixtureMediaCatalog.js'
import {withFixtureProductApp} from './fixtureProductE2E.js'
import {clickContinue, isMediaRequestFor, openQueueTab, prepareSingleConfirm, startBulkFromClipboard} from './fixtureWorkflow.js'

// Parallel-safe: every test allocates its own temp dirs and ephemeral ports,
// the shared runtime cache is warmed once in globalSetup, and clipboard
// access is serialized by withClipboardLock.

test('Electron queue controls handle hold, priority, cancel, pause queue, and resume queue', async () => {
	test.setTimeout(180_000)
	const [firstId, secondId, thirdId] = FIXTURE_VIDEO_IDS

	await withFixtureProductApp({behavior: {mediaSlowIds: [firstId, secondId, thirdId]}, userDataPrefix: 'arroxy-fixture-controls-user-', outputPrefix: 'arroxy-fixture-controls-out-'}, async ({app, page, urls, queue, files}) => {
		await startBulkFromClipboard(page, app, [firstId, secondId, thirdId].map(urls.video).join('\n'))
		await expect(page.locator('[data-testid="bulk-url-valid-count"]')).toContainText('3')
		await page.locator('[data-testid="bulk-url-confirm"]').click()
		await expect(page.getByText('Fixture Video 1')).toBeVisible({timeout: 45_000})
		await expect(page.getByText('Fixture Video 2')).toBeVisible()
		await expect(page.getByText('Fixture Video 3')).toBeVisible()
		await clickContinue(page)
		await page.getByRole('button', {name: /skip to confirm/i}).click()
		await page.locator('[data-testid="btn-add-to-queue"]').click()

		await openQueueTab(page)
		await expect(page.locator('[data-testid^="queue-manager-row-"]')).toHaveCount(3, {timeout: 20_000})
		await queue.expectStatus('Fixture Video 1', 'running')
		await queue.expectStatus('Fixture Video 2', 'pending')
		await queue.expectStatus('Fixture Video 3', 'pending')

		// Holding a pending item keeps it out of the running lane.
		await queue.action('Fixture Video 2', 'pause')
		await queue.expectStatus('Fixture Video 2', 'paused-held')

		// Priority lane spawns alongside the running normal-lane item.
		await queue.action('Fixture Video 3', 'pull-now')
		await queue.expectStatus('Fixture Video 3', 'running')
		await queue.action('Fixture Video 3', 'cancel')
		await queue.expectStatus('Fixture Video 3', 'cancelled')

		await page.getByTestId('btn-pause-all').click()
		await queue.expectStatus('Fixture Video 1', 'paused-active')
		await expect(page.getByTestId('btn-resume-first')).toBeVisible()
		await page.getByTestId('btn-resume-first').click()

		await expect(page.locator('[data-testid^="queue-manager-row-"][data-status="done"]')).toHaveCount(2, {timeout: 150_000})
		await queue.expectStatus('Fixture Video 3', 'cancelled')
		files.expectMp4Count(2)
		files.expectNoMp4For(thirdId)
	})
})

test('Electron metadata failure surfaces retry and recovers', async () => {
	test.setTimeout(120_000)
	const videoId = FIXTURE_VIDEO_IDS[3]

	await withFixtureProductApp({behavior: {metadataFailureIds: [videoId]}, userDataPrefix: 'arroxy-fixture-metadata-retry-user-', outputPrefix: 'arroxy-fixture-metadata-retry-out-'}, async ({page, fixtureServer, urls}) => {
		await page.locator('[data-testid="profiles-main-input"]').fill(urls.video(videoId))
		await page.locator('[data-testid="profiles-interactive-download"]').click()
		await expect(page.locator('[data-testid="step-error"]')).toBeVisible({timeout: 60_000})
		await expect(page.locator('[data-testid="error-message"]')).toContainText('Fixture metadata failed')

		fixtureServer.setBehavior({})
		await page.locator('[data-testid="btn-retry"]').click()
		await expect(page.locator('[data-testid="step-formats"]')).toBeVisible({timeout: 60_000})
		await expect(page.getByText('Fixture Video 4')).toBeVisible()

		const failedProbe = fixtureServer.telemetry().requests.find(request => request.kind === 'probe-end' && request.videoId === videoId && request.status === 503)
		expect(failedProbe).toBeTruthy()
	})
})

test('Electron media failure can be retried to a completed output file', async () => {
	test.setTimeout(160_000)
	const videoId = FIXTURE_VIDEO_IDS[4]

	await withFixtureProductApp({behavior: {mediaFailureIds: [videoId]}, userDataPrefix: 'arroxy-fixture-media-retry-user-', outputPrefix: 'arroxy-fixture-media-retry-out-'}, async ({page, fixtureServer, queue, files}) => {
		await prepareSingleConfirm(page, videoId)
		await page.locator('[data-testid="btn-download-now"]').click()
		await queue.expectStatus('Fixture Video 5', 'error', 90_000)
		await expect(queue.cardByTitle('Fixture Video 5').getByTestId('queue-error-msg')).toBeVisible()

		fixtureServer.setBehavior({})
		await queue.action('Fixture Video 5', 'retry')
		await queue.expectStatus('Fixture Video 5', 'done', 120_000)

		files.expectMp4Count(1)
		const mediaRequests = fixtureServer.telemetry().requests.filter(request => isMediaRequestFor(videoId, request))
		expect(mediaRequests.some(request => request.status === 503)).toBe(true)
		expect(mediaRequests.length).toBeGreaterThan(1)
	})
})

test('Electron split media failure preserves temp artifacts and retries from resume context', async () => {
	test.setTimeout(180_000)
	const videoId = SPLIT_MEDIA_VIDEO_ID
	const title = 'Fixture Video 11'

	await withFixtureProductApp({behavior: {mediaFormatTruncateIds: [`${videoId}:140`]}, userDataPrefix: 'arroxy-fixture-split-resume-user-', outputPrefix: 'arroxy-fixture-split-resume-out-'}, async ({page, fixtureServer, queue, files}) => {
		await prepareSingleConfirm(page, videoId)
		await page.locator('[data-testid="btn-download-now"]').click()
		await queue.expectStatus(title, 'error', 120_000)

		const failedItem = await page.evaluate(async itemTitle => {
			const result = await window.appApi.queue.cmd.getSnapshot()
			if (!result.ok) throw new Error(result.error.message)
			return result.data.items.find(item => item.title === itemTitle) ?? null
		}, title)
		expect(failedItem?.resumeContext).toMatchObject({kind: 'media-retry', reason: 'media-transfer'})
		const tempDir = failedItem?.resumeContext?.tempDir
		expect(typeof tempDir).toBe('string')
		if (!tempDir) throw new Error('expected resumable failed item to expose tempDir')
		expect(fs.existsSync(tempDir)).toBe(true)
		expect(files.listRecursive(tempDir).length).toBeGreaterThan(0)

		fixtureServer.setBehavior({})
		await queue.action(title, 'retry')
		await queue.expectStatus(title, 'done', 120_000)

		expect(fs.existsSync(tempDir)).toBe(false)
		const outputs = files.mediaFiles('.mp4')
		expect(outputs).toHaveLength(1)
		// Derived rather than a magic number: the merged file must exceed the
		// video-only stream, which is what proves audio was actually muxed in.
		// A hardcoded floor is platform-dependent — the BtbN (Linux) and
		// Martin-Riedl (macOS) ffmpeg builds emit different container overhead
		// for identical input, so 8_000 passed on macOS and failed at 7_586 on CI.
		expect(fs.statSync(outputs[0]).size).toBeGreaterThan(fixtureMediaFileSize('137'))
		const mediaGets = fixtureServer
			.telemetry()
			.requests.filter(request => isMediaRequestFor(videoId, request))
			.filter(request => request.method === 'GET')
		expect(mediaGets.filter(request => request.formatId === '137' && request.status === 200)).toHaveLength(1)
		expect(mediaGets.some(request => request.formatId === '140' && request.status === 599)).toBe(true)
		expect(mediaGets.some(request => request.formatId === '140' && request.status === 200)).toBe(true)
	})
})

test('Electron sidecar subtitle failure completes the video with a subtitle warning', async () => {
	test.setTimeout(160_000)
	const videoId = FIXTURE_VIDEO_IDS[5]

	await withFixtureProductApp(
		{
			behavior: {subtitleFailureIds: [videoId]},
			userDataPrefix: 'arroxy-fixture-subtitle-soft-user-',
			outputPrefix: 'arroxy-fixture-subtitle-soft-out-',
			settings: settings => {
				settings.single.lastSubtitleLanguages = ['en']
				settings.single.lastSubtitleMode = 'sidecar'
				settings.single.lastSubtitleFormat = 'srt'
			}
		},
		async ({page, fixtureServer, queue, files}) => {
			await prepareSingleConfirm(page, videoId, 'continue')
			await page.locator('[data-testid="btn-download-now"]').click()
			await queue.expectStatus('Fixture Video 6', 'done', 120_000)
			await expect(queue.cardByTitle('Fixture Video 6').getByTestId('queue-subs-warning')).toBeVisible()

			files.expectMp4Count(1)
			const subtitleFailure = fixtureServer.telemetry().requests.find(request => request.kind === 'subtitle' && request.videoId === videoId && request.status === 503)
			expect(subtitleFailure).toBeTruthy()
		}
	)
})

// Risk: YouTube withholds format URLs for a session, the 720p profile silently
// falls back to 360p, and the user is never told why. The SABR-limited fixture
// withholds 720p and prints yt-dlp's warning during the probe; an ordinary
// fixture in the same app is the control. Oracles: the row notice, the format
// actually fetched, and the absence of the notice on the control row.
test('Electron quick download flags a download YouTube limited below the profile quality', async () => {
	test.setTimeout(160_000)
	const controlId = FIXTURE_VIDEO_IDS[8]

	await withFixtureProductApp({userDataPrefix: 'arroxy-fixture-quality-limit-user-', outputPrefix: 'arroxy-fixture-quality-limit-out-'}, async ({page, fixtureServer, urls, queue, files}) => {
		await expect(page.locator('[data-testid="profiles-active-profile-card"]')).toContainText('720p')
		const quickDownload = page.locator('[data-testid="profiles-quick-download"]')
		for (const videoId of [SABR_LIMITED_VIDEO_ID, controlId]) {
			// Quick download stays busy while it probes and queues the previous link.
			await page.locator('[data-testid="profiles-main-input"]').fill(urls.video(videoId))
			await expect(quickDownload).toBeEnabled({timeout: 60_000})
			await quickDownload.click()
			await expect(page.locator('[data-slot="dialog-overlay"]')).toHaveCount(0, {timeout: 60_000})
		}

		await queue.expectStatus('Fixture Video 13', 'done', 120_000)
		await queue.expectStatus('Fixture Video 9', 'done', 120_000)
		const notice = queue.cardByTitle('Fixture Video 13').getByTestId('queue-quality-warning')
		await expect(notice).toBeVisible()
		await expect(notice).toContainText('360p')
		await expect(queue.cardByTitle('Fixture Video 9').getByTestId('queue-quality-warning')).toHaveCount(0)

		files.expectMp4Count(2)
		const mediaFormats = (videoId: string): string[] => fixtureServer.telemetry().requests.flatMap(request => (request.kind === 'media' && request.videoId === videoId && request.status === 200 ? [request.formatId] : []))
		expect(mediaFormats(SABR_LIMITED_VIDEO_ID)).toEqual(['18'])
		expect(mediaFormats(controlId)).toEqual(['22'])
	})
})

// Risk: a signed-in session YouTube limits saves every video at 360p even
// though the same video downloads at 720p signed out. The fixture extractor
// withholds 720p for ARX14 only when yt-dlp got cookies, and for ARX13 always.
test('Electron quick download retries a cookie-limited download without cookies and remembers the verdict', async () => {
	test.setTimeout(200_000)
	const cookiesDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arroxy-fixture-cookies-'))
	const cookiesPath = path.join(cookiesDir, 'cookies.txt')
	fs.writeFileSync(cookiesPath, '# Netscape HTTP Cookie File\n')
	try {
		await withFixtureProductApp(
			{
				settings: settings => {
					settings.common.cookiesMode = 'file'
					settings.common.cookiesPath = cookiesPath
				},
				userDataPrefix: 'arroxy-fixture-cookieless-user-',
				outputPrefix: 'arroxy-fixture-cookieless-out-'
			},
			async ({page, fixtureServer, urls, queue, files}) => {
				const quickDownload = page.locator('[data-testid="profiles-quick-download"]')
				const quickDownloadVideo = async (videoId: string): Promise<void> => {
					await page.locator('[data-testid="profiles-main-input"]').fill(urls.video(videoId))
					await expect(quickDownload).toBeEnabled({timeout: 60_000})
					await quickDownload.click()
					await expect(page.locator('[data-slot="dialog-overlay"]')).toHaveCount(0, {timeout: 60_000})
				}
				// One entry per yt-dlp extraction: the probe, then any download that re-extracts.
				const extractionsSignedIn = (videoId: string): boolean[] => fixtureServer.telemetry().requests.flatMap(request => (request.kind === 'probe-start' && request.videoId === videoId ? [request.signedIn] : []))
				const completedFormats = (videoId: string): string[] => fixtureServer.telemetry().requests.flatMap(request => (request.kind === 'media' && request.videoId === videoId && request.status === 200 ? [request.formatId] : []))

				// The probe (with cookies) finds 720p withheld, so the download skips the
				// signed-in run and fetches without cookies, getting 720p and no notice.
				await quickDownloadVideo(COOKIE_LIMITED_VIDEO_ID)
				await queue.expectStatus('Fixture Video 14', 'done', 120_000)
				await expect(queue.cardByTitle('Fixture Video 14').getByTestId('queue-quality-warning')).toHaveCount(0)
				expect(completedFormats(COOKIE_LIMITED_VIDEO_ID).at(-1)).toBe('22')
				// Probe with cookies, then the download's own extraction without them.
				expect(extractionsSignedIn(COOKIE_LIMITED_VIDEO_ID)).toEqual([true, false])

				// Having helped, the session starts the next download without cookies.
				// This video is limited regardless, so it lands at 360p with the notice.
				// The queue checks switched tabs; the download tab is the first one.
				await page.getByRole('tab').first().click()
				await quickDownloadVideo(SABR_LIMITED_VIDEO_ID)
				await queue.expectStatus('Fixture Video 13', 'done', 120_000)
				await expect(queue.cardByTitle('Fixture Video 13').getByTestId('queue-quality-warning')).toContainText('360p')
				expect(completedFormats(SABR_LIMITED_VIDEO_ID)).toEqual(['18'])
				expect(extractionsSignedIn(SABR_LIMITED_VIDEO_ID)).toEqual([true, false])

				files.expectMp4Count(2)
			}
		)
	} finally {
		fs.rmSync(cookiesDir, {recursive: true, force: true})
	}
})

test('Electron paused active fixture download resumes after app relaunch', async () => {
	test.setTimeout(180_000)
	const videoId = FIXTURE_VIDEO_IDS[6]

	await withFixtureProductApp({behavior: {mediaSlowIds: [videoId]}, userDataPrefix: 'arroxy-fixture-restart-user-', outputPrefix: 'arroxy-fixture-restart-out-'}, async ({page, queue, files, relaunch}) => {
		await prepareSingleConfirm(page, videoId)
		await page.locator('[data-testid="btn-download-now"]').click()
		await queue.expectStatus('Fixture Video 7', 'running', 60_000)
		await queue.action('Fixture Video 7', 'pause')
		await queue.expectStatus('Fixture Video 7', 'paused-active', 60_000)

		const relaunched = await relaunch()
		await relaunched.queue.open()
		await relaunched.queue.expectStatus('Fixture Video 7', 'paused-active', 60_000)
		await relaunched.queue.action('Fixture Video 7', 'resume')
		await relaunched.queue.expectStatus('Fixture Video 7', 'done', 120_000)

		files.expectMp4Count(1)
	})
})
