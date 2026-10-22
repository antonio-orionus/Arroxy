// Fixture Product E2E — a download into a folder near the path limit.
//
// 1. User-facing risk: a user downloads into a deeply nested folder. Windows
//    refuses any path past 260 characters, so a full title would not fit under
//    such a folder. Arroxy must shorten the name to keep every path it and
//    yt-dlp write under the limit, and the file must land. Unit tests own the
//    arithmetic (`nameBudget`); only a real download proves the paths written
//    on the way (the job's temp folder, `.part` files, the move out of it) all
//    fit.
//
// 2. Fixtures: the video with a long plain title, downloaded with the default
//    profile into a folder the scenario sizes so that the whole path has
//    HEADROOM units left under this platform's limit (260 UTF-16 units on
//    Windows, 1024 bytes on macOS, 4096 bytes on Linux): too little for the
//    whole title, enough for a shortened one. Each platform runs into its own
//    limit; CI runs the scenario on Windows as well as Linux.
//
// 3. Real user actions: paste the URL into the home input, click Quick Download.
//
// 4. Milestones: the queue row reaches `done`.
//
// 5. Oracles: the renderer never hears that the folder is too deep (the budget
//    giving up and falling back to the default name); exactly one MP4 in the
//    folder, named with the shortened title and the video id, whose full
//    path is within the limit and within HEADROOM of it; the deny proxy log
//    (checked by withFixtureProductApp).
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {expect, test} from '@playwright/test'
import {limitsFor, measure, type LengthUnit} from '../../src/shared/pathLimits.js'
import {LONG_PLAIN_TITLE, LONG_PLAIN_TITLE_VIDEO_ID} from './fixtureMediaCatalog.js'
import {withFixtureProductApp} from './fixtureProductE2E.js'
import {openQueueTab} from './fixtureWorkflow.js'

// Room left under the limit once the download folder is counted. Out of it come
// the default profile's subfolder (`Balanced 720p`, 14), the room Arroxy keeps
// for yt-dlp's in-flight names and the job's temp folder (52 for this video's
// formats) and the name itself, whose title keeps at least 40 characters. 140
// leaves the title about 60 characters of its 199: shortened, with room to spare.
const HEADROOM = 140
const OUTPUT_PREFIX = 'arroxy-fixture-deep-out-'
// mkdtemp's random suffix.
const MKDTEMP_SUFFIX = 6
const SEGMENT_MAX = 200

/**
 * A folder under `base` in which the download folder (OUTPUT_PREFIX plus
 * mkdtemp's suffix) measures exactly `outputDirLength`. Built from ASCII
 * segments, which measure the same in either unit.
 */
function makeDeepRoot(base: string, outputDirLength: number, unit: LengthUnit): string {
	let remaining = outputDirLength - measure(base, unit) - 1 - OUTPUT_PREFIX.length - MKDTEMP_SUFFIX
	if (remaining < 2) throw new Error(`the temp folder ${base} is already too deep for a ${outputDirLength}-unit download folder`)
	const segments: string[] = []
	const count = Math.ceil(remaining / (SEGMENT_MAX + 1))
	for (let index = 0; index < count; index++) {
		// Each segment costs its length plus one separator.
		const length = Math.ceil(remaining / (count - index)) - 1
		segments.push(String.fromCharCode(97 + (index % 26)).repeat(length))
		remaining -= length + 1
	}
	const root = path.join(base, ...segments)
	fs.mkdirSync(root, {recursive: true})
	return root
}

test('Electron downloads into a folder near the path limit with a shortened name', {tag: '@path-limit'}, async () => {
	test.setTimeout(150_000)
	const limits = limitsFor(process.platform)
	const base = fs.mkdtempSync(path.join(os.tmpdir(), 'arroxy-deep-'))

	try {
		const outputRoot = makeDeepRoot(base, limits.pathMax - HEADROOM, limits.pathUnit)

		await withFixtureProductApp({userDataPrefix: 'arroxy-fixture-deep-user-', outputPrefix: OUTPUT_PREFIX, outputRoot}, async ({page, outputDir, urls, files}) => {
			expect(measure(outputDir, limits.pathUnit)).toBe(limits.pathMax - HEADROOM)
			// The renderer logs each `filename-budget-failed` it hears from main.
			const budgetFailures: string[] = []
			page.on('console', message => {
				if (message.text().startsWith('[filename] path-too-deep')) budgetFailures.push(message.text())
			})

			await page.locator('[data-testid="profiles-main-input"]').fill(urls.video(LONG_PLAIN_TITLE_VIDEO_ID))
			await page.locator('[data-testid="profiles-quick-download"]').click()
			await openQueueTab(page)
			await expect(page.locator('[data-testid^="queue-manager-row-"][data-status="done"]')).toHaveCount(1, {timeout: 120_000})

			// The budget fitted the name itself; it never gave up on the folder.
			expect(budgetFailures).toEqual([])

			const produced = files.mediaFiles('.mp4')
			expect(produced).toHaveLength(1)
			const file = produced[0] ?? ''
			const name = path.basename(file)

			// The OS accepted the path, and it sits near the limit.
			const length = measure(file, limits.pathUnit)
			expect(length).toBeLessThanOrEqual(limits.pathMax)
			expect(length).toBeGreaterThan(limits.pathMax - HEADROOM)

			// The title's start and the id survive; the whole title does not.
			expect(name).toContain(`[${LONG_PLAIN_TITLE_VIDEO_ID}]`)
			expect(name.startsWith(LONG_PLAIN_TITLE.slice(0, 40))).toBe(true)
			expect(name).not.toContain(LONG_PLAIN_TITLE)
		})
	} finally {
		fs.rmSync(base, {recursive: true, force: true})
	}
})
