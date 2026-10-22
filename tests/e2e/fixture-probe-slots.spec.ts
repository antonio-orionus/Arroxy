import {expect, test, type Page} from '@playwright/test'
import {FIXTURE_VIDEO_IDS, type FixtureServer, type FixtureServerRequest} from './fixtureHarness.js'
import {withFixtureProductApp} from './fixtureProductE2E.js'

// Metadata fetching risk group: probe slots. Main checks only a few links at
// once ("Links checked at once"), so a burst of quick downloads never floods a
// site: the rest wait as probing rows. The window's own probe goes first, and
// a waiting row cancelled before its turn never asks the site anything.
//
// Fixtures: six videos whose probes the server holds open (metadataHeldIds)
// until the test releases them, and a seventh for Interactive Download. The
// saved limit is 3, not the default 2, so the count main reads at startup is
// the one under test.
// Actions: Quick Download six links one after another from the URL tab, an
// Interactive Download of the seventh, Cancel on a waiting row, then release.
// Oracles: the rows' status, the server's probe-start / probe-end log (how
// many background probes ran at once, and which never started), the Format
// step, and the files on disk.

const LIMIT = 3

type ProbeEvent = Extract<FixtureServerRequest, {kind: 'probe-start' | 'probe-end'}>

function probeEvents(fixtureServer: FixtureServer, videoIds: readonly string[]): ProbeEvent[] {
	const ids = new Set(videoIds)
	return fixtureServer.telemetry().requests.filter((request): request is ProbeEvent => (request.kind === 'probe-start' || request.kind === 'probe-end') && ids.has(request.videoId))
}

function startedIds(fixtureServer: FixtureServer, videoIds: readonly string[]): string[] {
	return probeEvents(fixtureServer, videoIds).flatMap(event => (event.kind === 'probe-start' ? [event.videoId] : []))
}

// The most probes for these videos that were open at the server at once.
function mostAtOnce(fixtureServer: FixtureServer, videoIds: readonly string[]): number {
	let open = 0
	let most = 0
	for (const event of probeEvents(fixtureServer, videoIds)) {
		open += event.kind === 'probe-start' ? 1 : -1
		most = Math.max(most, open)
	}
	return most
}

function rows(page: Page) {
	return page.locator('[data-testid^="queue-manager-row-"]')
}

async function quickDownloadFromUrlTab(page: Page, url: string): Promise<void> {
	const input = page.locator('[data-testid="profiles-main-input"]')
	await input.fill(url)
	await page.locator('[data-testid="profiles-quick-download"]').click()
	await expect(input).toHaveValue('')
}

test('links are checked as many at a time as the saved setting, the window probe goes first, and a cancelled waiting row never starts', async () => {
	test.setTimeout(240_000)
	const background = FIXTURE_VIDEO_IDS.slice(0, 6)
	const interactive = FIXTURE_VIDEO_IDS[6]
	if (background.length < 6 || !interactive) throw new Error('fixture catalog needs seven videos')

	await withFixtureProductApp(
		{
			behavior: {metadataHeldIds: background},
			settings: settings => {
				settings.common.concurrentProbes = LIMIT
			},
			userDataPrefix: 'arroxy-fixture-probe-slots-user-',
			outputPrefix: 'arroxy-fixture-probe-slots-out-'
		},
		async ({page, urls, fixtureServer, files}) => {
			for (const id of background) await quickDownloadFromUrlTab(page, urls.video(id))

			await page.locator('.downloads-tab-trigger').click()
			await expect(page.locator('[data-testid^="queue-manager-row-"][data-status="probing"]')).toHaveCount(background.length, {timeout: 15_000})
			await expect.poll(() => startedIds(fixtureServer, background).length, {timeout: 30_000, message: 'as many probes as the setting reach the site'}).toBe(LIMIT)

			// The window's probe does not wait behind the batch.
			await page.getByTestId('home-tab-download').click()
			await page.locator('[data-testid="profiles-main-input"]').fill(urls.video(interactive))
			await page.locator('[data-testid="profiles-interactive-download"]').click()
			await expect(page.getByTestId('step-formats')).toBeVisible({timeout: 30_000})
			expect(startedIds(fixtureServer, background)).toHaveLength(LIMIT)
			await page.getByTestId('step-formats').getByRole('button', {name: 'Back', exact: true}).click()
			await expect(page.getByTestId('download-profiles-home')).toBeVisible()

			// Cancel a row still waiting for its turn.
			const started = startedIds(fixtureServer, background)
			const waitingId = background.findLast(id => !started.includes(id))
			if (!waitingId) throw new Error('a row should still be waiting')
			await page.locator('.downloads-tab-trigger').click()
			const waitingRow = rows(page).filter({hasText: urls.video(waitingId)})
			await expect(waitingRow).toHaveAttribute('data-status', 'probing')
			await waitingRow.getByRole('button', {name: 'Cancel'}).click()
			await expect(rows(page)).toHaveCount(background.length - 1)

			fixtureServer.releaseMetadata()
			await expect(page.locator('[data-testid^="queue-manager-row-"][data-status="done"]')).toHaveCount(background.length - 1, {timeout: 180_000})
			await expect.poll(() => files.mediaFiles('mp4').length, {timeout: 20_000}).toBe(background.length - 1)

			expect(startedIds(fixtureServer, background)).not.toContain(waitingId)
			expect(new Set(startedIds(fixtureServer, background))).toEqual(new Set(background.filter(id => id !== waitingId)))
			expect(mostAtOnce(fixtureServer, background)).toBe(LIMIT)
		}
	)
})
