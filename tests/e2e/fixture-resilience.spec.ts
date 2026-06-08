import {expect, test} from '@playwright/test'
import {FIXTURE_VIDEO_IDS} from './fixtureHarness.js'
import {withFixtureProductApp} from './fixtureProductE2E.js'
import {clickContinue, isMediaRequestFor, prepareSingleConfirm, startBulkFromClipboard} from './fixtureWorkflow.js'

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

		await expect(page.locator('[data-testid^="queue-card-"]')).toHaveCount(3, {timeout: 20_000})
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

		await expect(page.locator('[data-testid^="queue-card-"][data-status="done"]')).toHaveCount(2, {timeout: 150_000})
		await queue.expectStatus('Fixture Video 3', 'cancelled')
		files.expectMp4Count(2)
		files.expectNoMp4For(thirdId)
	})
})

test('Electron metadata failure surfaces retry and recovers', async () => {
	test.setTimeout(120_000)
	const videoId = FIXTURE_VIDEO_IDS[3]

	await withFixtureProductApp({behavior: {metadataFailureIds: [videoId]}, userDataPrefix: 'arroxy-fixture-metadata-retry-user-', outputPrefix: 'arroxy-fixture-metadata-retry-out-'}, async ({page, fixtureServer, urls}) => {
		await page.locator('[data-testid="url-input"]').fill(urls.video(videoId))
		await page.locator('[data-testid="btn-find-formats"]').click()
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
		await expect(relaunched.page.locator('[data-testid="drawer-body"]')).toBeVisible()
		await relaunched.queue.expectStatus('Fixture Video 7', 'paused-active', 60_000)
		await relaunched.queue.cardByTitle('Fixture Video 7').getByTestId('btn-resume').click()
		await relaunched.queue.expectStatus('Fixture Video 7', 'done', 120_000)

		files.expectMp4Count(1)
	})
})
