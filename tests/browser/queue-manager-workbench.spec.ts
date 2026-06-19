import {test, expect} from '@playwright/test'
import type {Page} from '@playwright/test'

async function openScenario(page: Page, scenario: string): Promise<void> {
	await page.goto(`/?scenario=${scenario}`)
	await page.waitForSelector('[data-testid="app-root"]')
}

async function openQueueScenario(page: Page, scenario: string): Promise<void> {
	await openScenario(page, scenario)
	await page.getByRole('tab', {name: /^queue/i}).click()
	await expect(page.getByTestId('queue-manager-tab')).toBeVisible()
}

test('queue manager scenario states hydrate without walking a fake download', async ({page}) => {
	for (const [scenario, status] of [
		['queue-active', 'running'],
		['queue-pending', 'pending'],
		['queue-mixed-selection', 'paused-active'],
		['queue-errors', 'error'],
		['queue-artifacts', 'done']
	] as const) {
		await openQueueScenario(page, scenario)
		await expect(page.locator('[data-testid^="queue-manager-row-"]').first()).toHaveAttribute('data-status', status)
	}
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
	await expect(page.getByTestId('queue-manager-tab')).toContainText('Downloads you queue')
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
