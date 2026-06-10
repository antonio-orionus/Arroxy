import {expect, test} from '@playwright/test'
import type {Page} from '@playwright/test'

const BASE_URL = process.env.SCENARIO_BASE_URL ?? ''

async function openScenario(page: Page, scenario: string): Promise<void> {
	await page.goto(`${BASE_URL}/?scenario=${scenario}`)
	await page.waitForSelector('[data-testid="app-root"]')
}

async function openWithParams(page: Page, params: string): Promise<void> {
	await page.goto(`${BASE_URL}/?${params}`)
	await page.waitForSelector('[data-testid="app-root"]')
}

async function waitForSplashToLeave(page: Page): Promise<void> {
	await page.waitForSelector('[data-testid="splash-overlay"]', {state: 'detached', timeout: 6_000}).catch(() => undefined)
}

async function waitForPlaylist(page: Page): Promise<void> {
	await page.waitForSelector('[data-testid="step-playlist-items"]', {timeout: 6_000})
}

test('scenario gallery is available in browser-mock mode', async ({page}) => {
	await openScenario(page, 'default')

	await expect(page.getByTestId('scenario-gallery')).toBeVisible()
	await expect(page.getByTestId('splash-overlay')).toHaveCount(0)
	await page.getByTestId('scenario-gallery-toggle').click()
	await expect(page.getByTestId('scenario-button-queue-running')).toBeVisible()
})

test('backdrop-only gallery action preserves environment knobs', async ({page}) => {
	await openWithParams(page, 'theme=light&locale=uk&platform=darwin&scenario=queue-running&playlist=101&mockStep=confirm')

	await page.getByTestId('scenario-gallery-toggle').click()
	await page.getByTestId('scenario-backdrop-only').click()
	await page.waitForURL(/backdrop=1/)

	const url = new URL(page.url())
	expect(url.searchParams.get('backdrop')).toBe('1')
	expect(url.searchParams.get('theme')).toBe('light')
	expect(url.searchParams.get('locale')).toBe('uk')
	expect(url.searchParams.get('platform')).toBe('darwin')
	expect(url.searchParams.get('scenario')).toBeNull()
	expect(url.searchParams.get('playlist')).toBeNull()
	expect(url.searchParams.get('mockStep')).toBeNull()
	await expect(page.getByTestId('backdrop-stage')).toBeVisible()
})

test('startup launch modes keep the browser-mock splash available', async ({page}) => {
	await openWithParams(page, 'mockLaunch=cold-loading')

	await expect(page.getByTestId('splash-overlay')).toBeVisible()
})

test('playlist cap alert follows ?playlist=n param counts', async ({page}) => {
	await openWithParams(page, 'playlist=99')
	await waitForPlaylist(page)
	await expect(page.getByTestId('playlist-probe-limit-alert')).not.toBeVisible()

	await openWithParams(page, 'playlist=100')
	await waitForPlaylist(page)
	await expect(page.getByTestId('playlist-probe-limit-alert')).not.toBeVisible()

	await openWithParams(page, 'playlist=101')
	await waitForPlaylist(page)
	await expect(page.getByTestId('playlist-probe-limit-alert')).toBeVisible()
})

test('playlist count presets in gallery navigate to ?playlist=n', async ({page}) => {
	await openScenario(page, 'default')
	await page.getByTestId('scenario-gallery-toggle').click()
	await expect(page.getByTestId('playlist-preset-101')).toBeVisible()
})

test('screen preset scenarios land on their natural screens', async ({page}) => {
	await openScenario(page, 'single-normal')
	await expect(page.getByTestId('step-formats')).toBeVisible({timeout: 6_000})

	await openScenario(page, 'playlist-normal')
	await expect(page.getByTestId('step-playlist-items')).toBeVisible({timeout: 6_000})
})

test('mockStep opens screen presets directly to confirm', async ({page}) => {
	await openWithParams(page, 'scenario=single-normal&mockStep=confirm')
	await expect(page.getByTestId('step-confirm')).toBeVisible({timeout: 6_000})

	await openWithParams(page, 'scenario=playlist-normal&mockStep=confirm')
	await expect(page.getByTestId('step-confirm')).toBeVisible({timeout: 6_000})
})

test('screen preset scenarios expose the screen picker', async ({page}) => {
	await openScenario(page, 'single-normal')
	await page.getByTestId('scenario-gallery-toggle').click()
	await expect(page.getByTestId('scenario-button-single-normal')).toBeVisible()
	await expect(page.getByTestId('scenario-button-playlist-normal')).toBeVisible()
	await expect(page.getByTestId('scenario-button-playlist-scope-empty-reload')).toBeVisible()
	await expect(page.getByTestId('scenario-button-bulk-stress')).toBeVisible()
	await expect(page.getByTestId('mock-step-select')).toBeVisible()
})

test('profile scenarios render their seeded browser-mock states', async ({page}) => {
	await openScenario(page, 'profiles-home-empty')
	await expect(page.getByTestId('download-profiles-home')).toBeVisible()
	await expect(page.getByTestId('profiles-active-profile-card')).toContainText('Balanced')

	await openScenario(page, 'profiles-home-clipboard-single')
	await expect(page.getByTestId('profiles-main-input')).toHaveValue('https://www.youtube.com/watch?v=dQw4w9WgXcQ')

	await openScenario(page, 'profiles-split-menu')
	await expect(page.getByTestId('profiles-profile-menu')).toBeVisible()

	await openScenario(page, 'profiles-editor')
	await expect(page.getByTestId('profiles-editor-dialog')).toBeVisible()

	await openScenario(page, 'profiles-bulk')
	await expect(page.getByTestId('bulk-url-dialog')).toBeVisible()

	await openScenario(page, 'profiles-playlist-cap')
	await expect(page.getByTestId('quick-playlist-cap-dialog')).toBeVisible()
	await expect(page.getByTestId('quick-playlist-cap-dialog')).toContainText('Mock Browser Playlist')
})

test('playlist scope empty reload scenario stays on playlist with inline error', async ({page}) => {
	await openScenario(page, 'playlist-scope-empty-reload')
	await waitForPlaylist(page)

	await page.getByTestId('playlist-scope-change').click()
	await page.getByText('Range', {exact: true}).click()
	await page.getByTestId('playlist-scope-range-from').fill('900')
	await page.getByTestId('playlist-scope-range-to').fill('950')
	await page.getByTestId('playlist-scope-apply').click()

	await expect(page.getByTestId('playlist-scope-apply')).toHaveText('Reloading...')
	await expect(page.getByTestId('playlist-scope-error')).toContainText('No videos matched that playlist scope')
	await expect(page.getByTestId('step-playlist-items')).toBeVisible()
})

test('probe error dropdown shows all error kinds', async ({page}) => {
	await openScenario(page, 'default')
	await page.getByTestId('scenario-gallery-toggle').click()
	await expect(page.getByTestId('probe-error-kind-select')).toBeVisible()
})

test('update scenarios render channel-specific actions', async ({page}) => {
	await openScenario(page, 'update-homebrew')
	await expect(page.getByTestId('update-command')).toHaveText('brew upgrade --cask arroxy')

	await openScenario(page, 'update-scoop')
	await expect(page.getByTestId('update-command')).toHaveText('scoop update arroxy')

	await openScenario(page, 'update-portable')
	await expect(page.getByTestId('update-banner').getByRole('link', {name: 'Download'})).toBeVisible()
})

test('queue scenarios hydrate drawer states', async ({page}) => {
	for (const [scenario, status] of [
		['queue-running', 'running'],
		['queue-paused-active', 'paused-active'],
		['queue-error', 'error'],
		['queue-completed', 'done']
	] as const) {
		await openScenario(page, scenario)
		await expect(page.getByTestId('drawer-body')).toBeVisible()
		await expect(page.getByTestId('queue-card-scenario-queue-item')).toHaveAttribute('data-status', status)
	}
})

test('screenshots - playlist cap alert across viewports', async ({page}) => {
	for (const viewport of [
		{width: 390, height: 844},
		{width: 768, height: 900},
		{width: 1200, height: 900}
	]) {
		await page.setViewportSize(viewport)
		await openWithParams(page, 'playlist=101')
		await waitForPlaylist(page)
		await waitForSplashToLeave(page)
		await page.screenshot({path: `tests/browser/screenshots/scenario-playlist-over-limit-${viewport.width}.png`, fullPage: false})
	}
})

test('screenshots - bulk stress workbench state across viewports', async ({page}) => {
	for (const viewport of [
		{width: 390, height: 844},
		{width: 768, height: 900},
		{width: 1200, height: 900}
	]) {
		await page.setViewportSize(viewport)
		await openScenario(page, 'bulk-stress')
		await expect(page.getByTestId('step-playlist-items')).toBeVisible({timeout: 6_000})
		await expect(page.getByTestId('bulk-metadata-status')).toContainText('/50')
		await expect(page.locator('[role="checkbox"][data-index="0"]')).toBeVisible()
		await expect(page.getByText('Fetching details').first()).toBeVisible()
		await expect(page.getByText('Waiting').first()).toBeVisible()
		await expect(page.getByText('Details unavailable').first()).toBeVisible()

		const scroller = page.locator('[data-testid="step-playlist-items"] .overflow-y-auto').last()
		await scroller.evaluate(element => {
			element.scrollTop = element.scrollHeight
		})
		await expect(page.locator('[role="checkbox"][data-index="49"]')).toBeVisible()

		await waitForSplashToLeave(page)
		await page.screenshot({path: `tests/browser/screenshots/scenario-bulk-stress-${viewport.width}.png`, fullPage: false})
	}
})
