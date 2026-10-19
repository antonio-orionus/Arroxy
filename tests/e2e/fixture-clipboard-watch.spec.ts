import {expect, test} from '@playwright/test'
import {FIXTURE_VIDEO_IDS} from './fixtureHarness.js'
import {withFixtureProductApp} from './fixtureProductE2E.js'
import {withClipboardLock} from './clipboardLock.js'
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

test('Electron clipboard watcher fills and replaces single links with undo, and hints at bulk links', async () => {
	test.setTimeout(90_000)
	// ClipboardWatcher only polls while the window is focused AND visible, so the
	// behavior under test cannot exist in a hidden window. This is a real product
	// guarantee, not a test limitation — Arroxy reads the clipboard only when the
	// user is looking at it. CI runs visible (xvfb) and still covers this.
	test.skip(process.env.ARROXY_E2E_HEADLESS === '1', 'clipboard watching is focus-gated and needs a visible window')

	// The whole test needs the clipboard to itself: it writes several times and
	// waits for the watcher to react, so a parallel worker writing in any of
	// those gaps would be seen as a new candidate.
	await withClipboardLock(async () =>
		withClipboardWatchEnabled(async () => {
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
					// ca33d7d: multi-URL clipboards only produce a hint toast —
					// automation never opens dialogs, so the watcher must not
					// auto-open the Bulk dialog on the watcher's behalf.
					await expect(page.locator('[data-sonner-toast]', {hasText: 'Multiple links copied — use Bulk URLs'})).toBeVisible({timeout: 5_000})
					await expect(page.locator('[data-testid="bulk-url-dialog"]')).toHaveCount(0)

					// One rule: a copied link replaces whatever the field holds, and
					// the toast's Undo puts the previous text back.
					await input.fill('https://example.com/already-here')
					const replacingUrl = urls.video(FIXTURE_VIDEO_IDS[3])
					await writeClipboard(app, replacingUrl)
					await expect(input).toHaveValue(replacingUrl, {timeout: 5_000})
					const replacedToast = page.locator('[data-sonner-toast]', {hasText: 'Replaced with copied link'})
					await expect(replacedToast).toBeVisible()
					await replacedToast.getByRole('button', {name: 'Undo'}).click()
					await expect(input).toHaveValue('https://example.com/already-here')
				}
			)
		})
	)
})
