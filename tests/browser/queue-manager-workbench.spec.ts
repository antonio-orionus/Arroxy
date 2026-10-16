import {test, expect} from '@playwright/test'
import type {Page} from '@playwright/test'

async function openScenario(page: Page, scenario: string): Promise<void> {
	await page.goto(`/?scenario=${scenario}`)
	await page.waitForSelector('[data-testid="app-root"]')
}

async function openQueueScenario(page: Page, scenario: string): Promise<void> {
	await openScenario(page, scenario)
	await page.getByRole('tab', {name: /^downloads/i}).click()
	await expect(page.getByTestId('queue-manager-tab')).toBeVisible()
}

test('queue manager scenario states hydrate without walking a fake download', async ({page}) => {
	for (const [scenario, status] of [
		['queue-active', 'running'],
		['queue-pending', 'pending'],
		['queue-mixed-selection', 'running'],
		['queue-errors', 'error'],
		['queue-artifacts', 'done']
	] as const) {
		await openQueueScenario(page, scenario)
		await expect(page.locator('[data-testid^="queue-manager-row-"]').first()).toHaveAttribute('data-status', status)
	}
})

test('paused scheduler shows the banner and Resume queue starts waiting items', async ({page}) => {
	await openQueueScenario(page, 'queue-scheduler-paused')

	const banner = page.getByTestId('queue-paused-banner')
	await expect(banner).toBeVisible()
	await expect(banner).toContainText('The queue is paused')
	await expect(page.locator('[data-testid^="queue-manager-row-"]').first()).toHaveAttribute('data-status', 'pending')
	await expect(page.getByTestId('btn-pause-all')).toBeDisabled()

	await page.getByTestId('queue-resume-from-banner').click()

	await expect(banner).toBeHidden()
	await expect(page.locator('[data-testid^="queue-manager-row-"]').first()).toHaveAttribute('data-status', 'running')
})

test('cancel all on a paused queue clears the scheduler pause state', async ({page}) => {
	await openQueueScenario(page, 'queue-scheduler-paused')
	await expect(page.getByTestId('btn-pause-all')).toBeDisabled()

	await page.getByRole('button', {name: 'Cancel all active and pending downloads'}).click()

	await expect(page.getByTestId('queue-paused-banner')).toBeHidden()
	await expect(page.getByTestId('btn-pause-all')).toBeEnabled()
})

test('"Clear completed" button appears for completed scenario items', async ({page}) => {
	await openQueueScenario(page, 'queue-artifacts')

	await expect(page.getByTestId('btn-clear-completed')).toBeVisible()
	await expect(page.locator('[data-testid^="queue-manager-row-"]').first()).toHaveAttribute('data-status', 'done')
})

test('"Clear completed" removes terminal scenario items and keeps queue manager open', async ({page}) => {
	await openQueueScenario(page, 'queue-artifacts')

	await page.getByTestId('btn-clear-completed').click()

	await expect(page.getByTestId('queue-manager-tab')).toBeVisible()
	await expect(page.locator('[data-testid^="queue-manager-row-"]')).toHaveCount(0)
	await expect(page.getByTestId('queue-manager-tab')).toContainText('Queued downloads will appear here')
})

test('screenshot - Clear button in queue manager toolbar for completed scenario', async ({page}) => {
	await openQueueScenario(page, 'queue-artifacts')

	const manager = page.getByTestId('queue-manager-tab')
	const box = await manager.boundingBox()
	if (!box) {
		throw new Error('Expected queue manager bounding box before queue-clear-button screenshot capture')
	}
	await page.screenshot({path: 'tests/browser/screenshots/queue-clear-button.png', clip: {x: box.x, y: box.y, width: box.width, height: box.height}})
	await expect(page.getByTestId('btn-clear-completed')).toBeVisible()
})

// The Downloads tab resolves a quick download (P2-R38): Cancel on a probing
// row, the probe error alert's guidance on a failed one, the answers on a
// needs-choice one; the badge counts the rows that need the user, and the
// toasts carry their actions.
test('quick download rows carry their actions, the badge counts them, and the toasts offer View', async ({page}) => {
	await openScenario(page, 'queue-quick-download')

	const added = page.locator('[data-sonner-toast]', {hasText: 'Added: youtube.com · jNQXAC9IVRw'})
	await expect(added.getByRole('button', {name: 'View'})).toBeVisible()
	const failedToast = page.locator('[data-sonner-toast]', {hasText: "Couldn't prepare"})
	await expect(failedToast.getByRole('button', {name: 'Retry'})).toBeVisible()
	await expect(failedToast.getByRole('button', {name: 'View'})).toBeVisible()
	await expect(page.getByTestId('downloads-attention-badge')).toHaveText('3')

	await failedToast.getByRole('button', {name: 'View'}).click()
	await expect(page.getByTestId('queue-manager-tab')).toBeVisible()
	await expect(page.getByTestId('queue-manager-row-qd-failed')).toHaveAttribute('data-highlighted', 'true')

	await expect(page.getByTestId('queue-cancel-probing-qd-probing')).toBeVisible()
	const failed = page.getByTestId('queue-attention-qd-failed')
	await expect(failed.getByTestId('bot-wall-notice')).toContainText('Probe was limited')
	await expect(failed.getByRole('button', {name: 'Retry'})).toBeVisible()
	const capped = page.getByTestId('queue-attention-qd-capped')
	for (const name of ['All videos', 'First 100', 'Review']) await expect(capped.getByRole('button', {name})).toBeVisible()
	await expect(page.getByTestId('queue-attention-qd-review').getByRole('button')).toHaveText(['Review'])

	await page.getByTestId('queue-cancel-probing-qd-probing').click()
	await expect(page.getByTestId('queue-manager-row-qd-probing')).toHaveCount(0)
})
