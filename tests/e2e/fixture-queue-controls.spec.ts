import {expect, test} from '@playwright/test'
import {FIXTURE_PLAYLIST_VIDEO_IDS} from './fixtureHarness.js'
import {withFixtureProductApp} from './fixtureProductE2E.js'
import {openQueueTab} from './fixtureWorkflow.js'

// Queue-controls risk group: the global queue pause must surface over real IPC
// and survive an app restart. Unit/jsdom coverage cannot see the hydration gap
// — the renderer only learns the persisted schedulerPaused flag through the
// boot snapshot crossing the real preload bridge.
//
// Scenario: quick-download the fixture playlist (3 entries; the normal-lane
// cap leaves two waiting while one runs, and the running one is slowed so it
// cannot finish before we pause). Pause all, then assert the banner over real
// IPC, relaunch against the same profile, assert the banner is still there
// (persistence + hydration), resume from the banner, and prove the queue
// drains to real files on disk. The harness's deny proxy asserts no external
// network was touched.

const FIRST_VIDEO_ID = FIXTURE_PLAYLIST_VIDEO_IDS[0]

test('Electron pause-all banner is visible over real IPC, survives restart, and resumes to completed files', async () => {
	test.setTimeout(300_000)

	await withFixtureProductApp({behavior: {mediaSlowIds: [FIRST_VIDEO_ID]}, userDataPrefix: 'arroxy-fixture-queue-pause-user-', outputPrefix: 'arroxy-fixture-queue-pause-out-'}, async ({page, relaunch, urls, files}) => {
		await page.locator('[data-testid="profiles-main-input"]').fill(urls.playlist())
		await page.locator('[data-testid="profiles-quick-download"]').click()

		await openQueueTab(page)
		await expect(page.locator('[data-testid^="queue-manager-row-"]')).toHaveCount(FIXTURE_PLAYLIST_VIDEO_IDS.length, {timeout: 60_000})

		// Pause the whole queue through the real toolbar control.
		const pauseAll = page.getByTestId('btn-pause-all')
		await expect(pauseAll).toBeEnabled()
		await pauseAll.click()

		// Visible milestone: the paused banner appears and the pause-all control
		// is disabled while paused. Nothing may keep running.
		const banner = page.getByTestId('queue-paused-banner')
		await expect(banner).toBeVisible()
		await expect(pauseAll).toBeDisabled()
		await expect(page.locator('[data-testid^="queue-manager-row-"][data-status="running"]')).toHaveCount(0, {timeout: 30_000})

		// Hydration oracle: relaunch against the same profile; the restored
		// schedulerPaused flag must reach the renderer through the boot snapshot.
		const relaunched = await relaunch()
		await relaunched.queue.open()
		await expect(relaunched.page.locator('[data-testid^="queue-manager-row-"]')).toHaveCount(FIXTURE_PLAYLIST_VIDEO_IDS.length, {timeout: 60_000})
		await expect(relaunched.page.getByTestId('queue-paused-banner')).toBeVisible()
		await expect(relaunched.page.locator('[data-testid^="queue-manager-row-"][data-status="running"]')).toHaveCount(0, {timeout: 30_000})

		// Resume from the banner; the queue drains to real output files.
		await relaunched.page.getByTestId('queue-resume-from-banner').click()
		await expect(relaunched.page.getByTestId('queue-paused-banner')).toBeHidden()
		await expect(relaunched.page.locator('[data-testid^="queue-manager-row-"][data-status="done"]')).toHaveCount(FIXTURE_PLAYLIST_VIDEO_IDS.length, {timeout: 200_000})

		files.expectMp4Count(FIXTURE_PLAYLIST_VIDEO_IDS.length)
	})
})
