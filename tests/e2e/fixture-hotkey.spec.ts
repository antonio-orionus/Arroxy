import fs from 'node:fs'
import path from 'node:path'
import {expect, test, type ElectronApplication} from '@playwright/test'
import {FIXTURE_VIDEO_IDS} from './fixtureHarness.js'
import {withFixtureProductApp} from './fixtureProductE2E.js'
import {writeClipboard} from './fixtureWorkflow.js'

// Global hotkey lane, end to end. The chord itself is OS-owned (and contested
// chords are covered by the manual matrix), so the spec drives
// HotkeyService.handleTrigger() directly — clipboard pre-classification,
// renderer pipeline, queue add, and outcome feedback all run for real.
//
// Feedback assertions follow the either/or rule: focused → sonner toast only;
// hidden → OS notification only. OS notifications are observable through the
// E2E sink file (ARROXY_E2E_OS_NOTIFIER_SINK_PATH, wired in fixtureHarness).
//
// Immediate-ack contract: a valid single URL plants a `probing` Downloads row
// and fires `queued` before yt-dlp returns. A second press on the same URL
// while that row is live is `already-queued`, never `busy`. `metadataDelayMs`
// keeps the probe window open long enough to observe the placeholder.

test.describe.configure({mode: 'serial'})

const PROBE_DELAY_MS = 4_000
const PROBING_TIMEOUT_MS = 2_500

const sinkPath = (userDataDir: string): string => path.join(userDataDir, 'hotkey-os-notifications.log')

async function readSinkLines(file: string): Promise<string[]> {
	try {
		return (await fs.promises.readFile(file, 'utf8')).split('\n').filter(line => line.length > 0)
	} catch {
		return []
	}
}

async function expectSinkLine(file: string, text: string, timeout = 30_000): Promise<void> {
	await expect.poll(async () => (await readSinkLines(file)).some(line => line.includes(text)), {timeout, message: `expected OS notification sink to contain "${text}"`}).toBe(true)
}

// Mirrors the registered chord handler: main reads + pre-classifies the
// clipboard, then dispatches the trigger to the renderer.
async function pressHotkey(app: ElectronApplication): Promise<void> {
	await app.evaluate(() => {
		const service = (globalThis as Record<string, unknown>).__arroxyHotkeyService as {handleTrigger(): void} | undefined
		if (!service) throw new Error('__arroxyHotkeyService is not exposed on globalThis')
		service.handleTrigger()
	})
}

// Focus is part of the toast verdict, so it is established explicitly and
// asserted — `page.bringToFront()` alone proved unreliable on macOS (window
// visible but not OS-focused, verdict silently takes the OS-notification path).
async function focusAppWindow(app: ElectronApplication, page: import('@playwright/test').Page): Promise<void> {
	await page.bringToFront()
	await app.evaluate(({app: electronApp, BrowserWindow}) => {
		electronApp.focus({steal: true})
		const win = BrowserWindow.getAllWindows()[0]
		win?.show()
		win?.focus()
	})
	await expect.poll(async () => app.evaluate(({BrowserWindow}) => BrowserWindow.getAllWindows()[0]?.isFocused() ?? false), {timeout: 5_000, message: 'window never gained OS focus'}).toBe(true)
}

function expectToastCount(page: import('@playwright/test').Page, text: string, count: number): Promise<void> {
	return expect(page.locator('[data-sonner-toast]', {hasText: text})).toHaveCount(count, {timeout: 30_000})
}

// Assumes Downloads is already open. `queue.expectStatus` re-clicks the tab,
// which would un-hide the window and break the OS-channel verdict.
function expectProbingRow(page: import('@playwright/test').Page, title: string, timeout = PROBING_TIMEOUT_MS): Promise<void> {
	return expect(page.locator('[data-testid^="queue-manager-row-"]').filter({hasText: title}).first()).toHaveAttribute('data-status', 'probing', {timeout})
}

test('hotkey acknowledges every attempt through exactly one channel', async () => {
	test.setTimeout(300_000)
	// The focused branch needs a real, visible, frontmost window — headless
	// launches show:false by design. The hidden/unfocused branch is covered in
	// the headless test below; visible mode is how CI (xvfb) runs this anyway.
	test.skip(process.env.ARROXY_E2E_HEADLESS === '1', 'focused feedback needs a visible window')

	await withFixtureProductApp(
		{
			behavior: {metadataDelayMs: PROBE_DELAY_MS},
			userDataPrefix: 'arroxy-fixture-hotkey-user-',
			outputPrefix: 'arroxy-fixture-hotkey-out-',
			settings: settings => {
				settings.common.hotkeyEnabled = true
			}
		},
		async ({app, page, userDataDir, urls, queue, files}) => {
			const sink = sinkPath(userDataDir)
			const firstUrl = urls.video(FIXTURE_VIDEO_IDS[0])
			const firstTitle = 'Fixture Video 1'

			// Open Downloads first so the probing row is in the DOM the moment
			// the placeholder lands (the queue tab is not keepMounted).
			await queue.open()

			// 1. Focused window: outcome lands as a sonner toast, never as an OS
			// notification, and the queue gains a probing row before yt-dlp returns.
			await focusAppWindow(app, page)
			await writeClipboard(app, firstUrl)
			await pressHotkey(app)
			await expectToastCount(page, 'Download queued from clipboard', 1)
			expect(await readSinkLines(sink)).toEqual([])
			await expectProbingRow(page, firstUrl)

			// 2. Same link again while the probing row is still live: dedupe fires
			// an already-queued toast, still no OS notification, never busy.
			await focusAppWindow(app, page)
			await pressHotkey(app)
			await expectToastCount(page, 'Already in the queue', 1)
			expect(await readSinkLines(sink)).toEqual([])
			await expect(page.locator('[data-sonner-toast]', {hasText: 'Still working on the previous link'})).toHaveCount(0)

			// 3. Filesystem oracle: the acknowledged download really completed.
			// Hidden-window outcomes (OS channel, dead link, multi hint, empty
			// clipboard) are owned by the headless test below — this test stays
			// focused for its whole life so the toast verdict is never raced by
			// a mid-test hide().
			await queue.expectStatus(firstTitle, 'done', 60_000)
			await expect.poll(() => files.mediaFiles('mp4').length, {timeout: 30_000, message: 'the acknowledged fixture download should land as mp4'}).toBe(1)
			files.expectMp4Count(1)
			expect(await readSinkLines(sink)).toEqual([])
		}
	)
})

test('hotkey acknowledges every hidden-window attempt through the OS channel only', async () => {
	test.setTimeout(300_000)

	await withFixtureProductApp(
		{
			behavior: {metadataDelayMs: PROBE_DELAY_MS},
			userDataPrefix: 'arroxy-fixture-hotkey-hidden-user-',
			outputPrefix: 'arroxy-fixture-hotkey-hidden-out-',
			settings: settings => {
				settings.common.hotkeyEnabled = true
			}
		},
		async ({app, page, userDataDir, urls, queue, files}) => {
			const sink = sinkPath(userDataDir)
			const url = urls.video(FIXTURE_VIDEO_IDS[0])

			await queue.open()
			// Hidden from the start (headless launches show:false; hide anyway so
			// visible CI runs exercise the same path).
			await app.evaluate(({BrowserWindow}) => BrowserWindow.getAllWindows()[0]?.hide())

			// Queued fires immediately — before the delayed fixture probe ends —
			// as an OS notification, never a toast, never a window pop.
			//
			// The probing ROW is deliberately not asserted on a hidden window:
			// Electron occlusion-throttles hidden renderers and CI runners have
			// pushed the DOM paint past any sane window (three runs). The
			// placeholder's existence is proven state-side below — the second press
			// can only answer `already-queued` because a `probing` item counts as
			// live in the renderer's queue — and visibly via the focused test.
			await writeClipboard(app, url)
			await pressHotkey(app)
			await expectSinkLine(sink, 'Download queued from clipboard')

			await expect(page.locator('[data-sonner-toast]')).toHaveCount(0)

			// Immediate second press on the same URL while probing: already-queued,
			// never busy, and it must not cancel the first run. Press before the
			// delayed probe can finish — completed items legitimately re-queue.
			await pressHotkey(app)
			await expectSinkLine(sink, 'Already in the queue')
			expect((await readSinkLines(sink)).some(line => line.includes('Still working on the previous link'))).toBe(false)

			// Dead link: queued placeholder, then submission-failed, not silence.
			await writeClipboard(app, 'https://www.youtube.com/watch?v=ARXDEAD0000')
			await pressHotkey(app)
			await expectSinkLine(sink, 'Could not add that link')

			// Multi-URL clipboard: hint copy, no dialog opens.
			await writeClipboard(app, `${url}\n${urls.video(FIXTURE_VIDEO_IDS[1])}`)
			await pressHotkey(app)
			await expectSinkLine(sink, 'Multiple links copied — use Bulk URLs')
			await expect(page.locator('[data-testid="bulk-url-dialog"]')).toHaveCount(0)

			// Empty clipboard: acknowledged, not silent.
			await writeClipboard(app, '   ')
			await pressHotkey(app)
			await expectSinkLine(sink, 'No link on your clipboard')

			// Filesystem oracle: the queued download really completed. Poll — the
			// file lands a moment after the 'queued' outcome.
			await expect.poll(() => files.mediaFiles('mp4').length, {timeout: 60_000, message: 'fixture download should land as mp4'}).toBe(1)
			files.expectMp4Count(1)
		}
	)
})
