import {expect, test} from '@playwright/test'
import fs from 'node:fs'
import {FIXTURE_VIDEO_IDS, SPLIT_MEDIA_VIDEO_ID} from './fixtureHarness.js'
import {withFixtureProductApp} from './fixtureProductE2E.js'
import {clickContinue, isMediaRequestFor, openQueueTab, prepareSingleConfirm, startBulkFromClipboard} from './fixtureWorkflow.js'

test.describe.configure({mode: 'serial'})

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

		const secondCard = queue.cardByTitle('Fixture Video 2')
		await secondCard.getByTestId('btn-hold').click()
		await queue.expectStatus('Fixture Video 2', 'paused-held')

		const thirdCard = queue.cardByTitle('Fixture Video 3')
		await thirdCard.getByTestId('btn-pull-now').click()
		await queue.expectStatus('Fixture Video 3', 'running')
		await thirdCard.getByTestId('btn-cancel').click()
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
		await queue.cardByTitle('Fixture Video 5').getByTestId('btn-retry').click()
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
			return result.data.find(item => item.title === itemTitle) ?? null
		}, title)
		expect(failedItem?.resumeContext).toMatchObject({kind: 'media-retry', reason: 'media-transfer'})
		const tempDir = failedItem?.resumeContext?.tempDir
		expect(typeof tempDir).toBe('string')
		if (!tempDir) throw new Error('expected resumable failed item to expose tempDir')
		expect(fs.existsSync(tempDir)).toBe(true)
		expect(files.listRecursive(tempDir).length).toBeGreaterThan(0)

		fixtureServer.setBehavior({})
		await queue.cardByTitle(title).getByTestId('btn-retry').click()
		await queue.expectStatus(title, 'done', 120_000)

		expect(fs.existsSync(tempDir)).toBe(false)
		const outputs = files.mediaFiles('.mp4')
		expect(outputs).toHaveLength(1)
		expect(fs.statSync(outputs[0]).size).toBeGreaterThan(8_000)
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

test('Electron paused active fixture download resumes after app relaunch', async () => {
	test.setTimeout(180_000)
	const videoId = FIXTURE_VIDEO_IDS[6]

	await withFixtureProductApp({behavior: {mediaSlowIds: [videoId]}, userDataPrefix: 'arroxy-fixture-restart-user-', outputPrefix: 'arroxy-fixture-restart-out-'}, async ({page, queue, files, relaunch}) => {
		await prepareSingleConfirm(page, videoId)
		await page.locator('[data-testid="btn-download-now"]').click()
		await queue.expectStatus('Fixture Video 7', 'running', 60_000)
		await queue.cardByTitle('Fixture Video 7').getByTestId('btn-pause').click()
		await queue.expectStatus('Fixture Video 7', 'paused-active', 60_000)

		const relaunched = await relaunch()
		await relaunched.queue.open()
		await relaunched.queue.expectStatus('Fixture Video 7', 'paused-active', 60_000)
		await relaunched.queue.cardByTitle('Fixture Video 7').getByTestId('btn-resume').click()
		await relaunched.queue.expectStatus('Fixture Video 7', 'done', 120_000)

		files.expectMp4Count(1)
	})
})
