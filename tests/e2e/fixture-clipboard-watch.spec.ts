import {expect, test} from '@playwright/test'
import {FIXTURE_VIDEO_IDS} from './fixtureHarness.js'
import {withFixtureProductApp} from './fixtureProductE2E.js'
import {writeClipboard} from './fixtureWorkflow.js'

test.describe.configure({mode: 'serial'})

async function withClipboardWatchEnabled(run: () => Promise<void>): Promise<void> {
	const previous = process.env.ARROXY_E2E_ENABLE_CLIPBOARD_WATCH
	process.env.ARROXY_E2E_ENABLE_CLIPBOARD_WATCH = '1'
	try {
		await run()
	} finally {
		if (previous === undefined) delete process.env.ARROXY_E2E_ENABLE_CLIPBOARD_WATCH
		else process.env.ARROXY_E2E_ENABLE_CLIPBOARD_WATCH = previous
	}
}

test('Electron clipboard watcher fills single links, opens bulk links, and preserves pending candidates', async () => {
	test.setTimeout(90_000)

	await withClipboardWatchEnabled(async () => {
		await withFixtureProductApp(
			{
				userDataPrefix: 'arroxy-fixture-clipboard-user-',
				outputPrefix: 'arroxy-fixture-clipboard-out-',
				settings: settings => {
					settings.common.clipboardWatchEnabled = true
				}
			},
			async ({app, page, urls}) => {
				const input = page.locator('[data-testid="profiles-main-input"]')
				const firstUrl = urls.video(FIXTURE_VIDEO_IDS[0])
				await page.bringToFront()
				await writeClipboard(app, firstUrl)
				await expect(input).toHaveValue(firstUrl, {timeout: 5_000})

				await page.locator('[data-testid="url-clear"]').click()
				await expect(input).toHaveValue('')

				const bulkRaw = [FIXTURE_VIDEO_IDS[1], FIXTURE_VIDEO_IDS[2]].map(urls.video).join('\n')
				await writeClipboard(app, bulkRaw)
				await expect(page.locator('[data-testid="bulk-url-dialog"]')).toBeVisible({timeout: 5_000})
				await expect(page.locator('[data-testid="bulk-url-textarea"]')).toHaveValue(bulkRaw)
				await expect(page.locator('[data-testid="bulk-url-valid-count"]')).toContainText('2')
				await page.getByRole('button', {name: /^cancel$/i}).click()

				await input.fill('https://example.com/already-here')
				const pendingUrl = urls.video(FIXTURE_VIDEO_IDS[3])
				await writeClipboard(app, pendingUrl)
				await expect(page.locator('[data-testid="clipboard-pending-action"]')).toContainText('Use copied link', {timeout: 5_000})

				await page.locator('[data-testid="url-clear"]').click()
				await expect(input).toHaveValue(pendingUrl)
				await expect(page.locator('[data-testid="clipboard-pending-action"]')).toHaveCount(0)
			}
		)
	})
})
