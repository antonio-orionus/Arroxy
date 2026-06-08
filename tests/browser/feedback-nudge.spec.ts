import {test, expect} from '@playwright/test'

// Uses the renderer dev server in explicit browser-mock mode.
// NUDGE_DELAY_MS is overridden via window before page load so the nudge
// appears after 200ms instead of 45s.

test.beforeEach(async ({page}) => {
	// Inject override before any scripts run
	await page.addInitScript(() => {
		;(window as unknown as Record<string, unknown>).__NUDGE_DELAY_MS = 200
	})
	await page.goto('/')
	// Wait for splash / init to clear
	await page.waitForSelector('[data-testid="app-root"]')
})

test('feedback nudge appears after delay and shows mascot + message', async ({page}) => {
	// Should not exist yet
	await expect(page.getByTestId('feedback-nudge')).not.toBeVisible()

	// Wait for the 200ms delay + animation
	await page.waitForSelector('[data-testid="feedback-nudge"]', {timeout: 2_000})

	await expect(page.getByTestId('feedback-nudge')).toBeVisible()
	await expect(page.getByTestId('feedback-nudge')).toContainText('Enjoying Arroxy')

	await page.screenshot({path: 'tests/browser/screenshots/nudge-visible.png', fullPage: false})
})

test('feedback button has nudging animation class while nudge is shown', async ({page}) => {
	await page.waitForSelector('[data-testid="feedback-nudge"]', {timeout: 2_000})

	const btn = page.getByTestId('btn-feedback')
	await expect(btn).toHaveClass(/feedback-btn-nudging/)
})

test('visual screenshot — nudge above Feedback button', async ({page}) => {
	await page.waitForSelector('[data-testid="feedback-nudge"]', {timeout: 2_000})

	// Zoom into footer area for a pixel-level check
	const footer = page.locator('footer')
	const box = await footer.boundingBox()
	if (box) {
		await page.screenshot({path: 'tests/browser/screenshots/nudge-footer-zoom.png', clip: {x: box.x, y: box.y - 80, width: box.width, height: box.height + 80}})
	}

	await expect(page.getByTestId('feedback-nudge')).toBeVisible()
})
