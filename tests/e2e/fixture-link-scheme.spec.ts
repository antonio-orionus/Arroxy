import fs from 'node:fs'
import path from 'node:path'
import {expect, test} from '@playwright/test'
import {buildArroxyLink} from '../../src/main/linkScheme/arroxyLink.js'
import {FIXTURE_VIDEO_IDS, fixtureUrl} from './fixtureHarness.js'
import {withFixtureProductApp} from './fixtureProductE2E.js'

// Risk: an arroxy:// link is an untrusted caller. It may only put its link in
// the URL field, with Undo when it replaces something, and must never start a
// probe or queue a download.
//
// Paths: the link on the launch command line (a cold start on Windows and
// Linux), and the link on a second launch, which hands it to the running app
// through `second-instance`. macOS `open-url` needs LaunchServices and a
// packaged app, so its buffering is covered by the LinkInbox unit tests.
// Oracles: the URL field, the toast, and an empty queue.

test.describe.configure({mode: 'serial'})

function mainLog(userDataDir: string): string {
	try {
		return fs.readFileSync(path.join(userDataDir, 'logs', 'main.log'), 'utf8')
	} catch {
		return ''
	}
}

test('a link on the launch command line fills the URL field and queues nothing', async () => {
	test.setTimeout(90_000)
	const videoUrl = fixtureUrl(FIXTURE_VIDEO_IDS[0])
	await withFixtureProductApp({userDataPrefix: 'arroxy-fixture-link-launch-user-', outputPrefix: 'arroxy-fixture-link-launch-out-', launchArgs: [buildArroxyLink(videoUrl)]}, async ({page, queue}) => {
		await expect(page.getByTestId('profiles-main-input')).toHaveValue(videoUrl, {timeout: 10_000})
		await expect(page.getByTestId('step-formats')).toHaveCount(0)
		await queue.open()
		await expect(page.getByTestId('queue-title')).toHaveCount(0)
	})
})

test('a second launch hands its link to the running app, which replaces the field with Undo', async () => {
	test.setTimeout(120_000)
	await withFixtureProductApp({userDataPrefix: 'arroxy-fixture-link-second-user-', outputPrefix: 'arroxy-fixture-link-second-out-'}, async ({page, urls, queue, userDataDir, launchSecondInstance}) => {
		const input = page.getByTestId('profiles-main-input')
		await input.fill('https://example.com/already-here')
		const videoUrl = urls.video(FIXTURE_VIDEO_IDS[0])

		const second = await launchSecondInstance([buildArroxyLink(videoUrl)])
		expect(second.exitCode).toBe(0)

		await expect(input).toHaveValue(videoUrl, {timeout: 10_000})
		const replacedToast = page.locator('[data-sonner-toast]', {hasText: 'Replaced with the link opened in Arroxy'})
		await expect(replacedToast).toBeVisible()
		await replacedToast.getByRole('button', {name: 'Undo'}).click()
		await expect(input).toHaveValue('https://example.com/already-here')

		// A malformed link is dropped with a log line, and the field keeps what the user typed.
		const rejected = await launchSecondInstance([`arroxy://open?url=${encodeURIComponent(videoUrl)}&folder=%2Ftmp`])
		expect(rejected.exitCode).toBe(0)
		await expect.poll(() => mainLog(userDataDir).match(/arroxy link ignored.*wrongParams/g)?.length ?? 0, {timeout: 10_000}).toBe(1)
		await expect(input).toHaveValue('https://example.com/already-here')

		await expect(page.getByTestId('step-formats')).toHaveCount(0)
		await queue.open()
		await expect(page.getByTestId('queue-title')).toHaveCount(0)
	})
})
