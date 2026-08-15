// Fixture Product E2E — playlist multi-profile acceptance.
//
// 1. User-facing risk: a playlist used to download as one homogeneous batch
//    into one directory. "Per-item profiles" lets a user assign a *different*
//    DownloadProfile (media + subtitles + output dir + filename + subfolder +
//    SponsorBlock + embed) to individual playlist rows. If assignment or
//    per-item routing silently regresses, every item would land back in one
//    directory and the feature would appear to work while doing nothing —
//    only a real download into two real directories proves it.
//
// 2. Fixtures: the 3-video fixture playlist (`FIXTURE_PLAYLIST_VIDEO_IDS`,
//    playlist id `PLarroxyfixture`). No delays or failures configured — this
//    scenario is about routing, not resilience. Settings pin the active
//    (baseline) profile to the builtin "Small file 480p" and pre-strip embed
//    metadata/SponsorBlock from both profiles used, so the run stays fast and
//    deterministic. Two output directories are exercised, both children of
//    the test's temp `outputDir`: `Small file 480p` (baseline, item 3) and
//    `Best available` (reassigned, items 1-2).
//
// 3. Real user actions: paste the fixture playlist URL and click the
//    interactive-download entry point; wait for playlist rows to load; click
//    "Per-item profiles" (routes to the playlistProfiles step); click the
//    first row, then shift-click the second row (real range selection, not
//    select-all — one item must stay on the baseline profile or there is only
//    one output directory and the whole point of the test is gone); open the
//    "Assign to selection" dropdown and click the second profile; click
//    Continue; click "Add to Queue".
//
// 4. Milestones: playlist rows visible; stepper collapses to 4 dots (url,
//    playlist, profiles, confirm — Quality/SponsorBlock/Output/Save never
//    separately visited, only "Profiles" carries them); selection
//    summary reflects 2 selected; both reassigned rows show "Best available"
//    and the untouched row keeps "Small file 480p"; confirm screen's profile
//    breakdown lists both profiles with correct counts; queue reaches 3 rows,
//    all `done`.
//
// 5. Oracles: real files exist under *both* profile directories (1 under
//    "Small file 480p", 2 under "Best available") — two directories is the
//    entire feature, one directory means it silently fell back to
//    homogeneous playlist behavior. No `.m3u` exists anywhere under
//    `outputDir` — multi-profile submission omits `playlistGroupId` and the
//    manifest write on purpose (see `prepareMultiProfileQueueSubmission`), so
//    a stray M3U would mean that path regressed. `withFixtureProductApp`
//    asserts the deny-proxy log is empty after the run, so any non-local
//    network reach (real YouTube, real yt-dlp update checks) fails the test
//    automatically.

import path from 'node:path'
import {expect, test} from '@playwright/test'
import {BUILTIN_DOWNLOAD_PROFILES} from '../../src/shared/downloadProfiles.js'
import type {AppSettings, DownloadProfile} from '../../src/shared/types.js'
import {withFixtureProductApp} from './fixtureProductE2E.js'
import {clickContinue, openQueueTab} from './fixtureWorkflow.js'

const BASELINE_PROFILE_ID = 'small-file'
const BASELINE_PROFILE_NAME = 'Small file 480p'
const SECOND_PROFILE_ID = 'best-quality'
const SECOND_PROFILE_NAME = 'Best available'

function findBuiltinProfile(id: string): DownloadProfile {
	const profile = BUILTIN_DOWNLOAD_PROFILES.find(candidate => candidate.id === id)
	if (!profile) throw new Error(`builtin download profile missing: ${id}`)
	return profile
}

// Strips embed post-processing and SponsorBlock off both profiles used in
// this scenario, matching the fixture-workflows.spec.ts "quick profile"
// convention — keeps the run fast without touching profile *identity* (id,
// name, subfolder), which is what the two-directories oracle depends on.
function fastProfile(profile: DownloadProfile): DownloadProfile {
	return {...profile, embed: {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}, sponsorBlock: {mode: 'off', categories: []}}
}

function configureMultiProfileBaseline(settings: AppSettings): void {
	const baseline = findBuiltinProfile(BASELINE_PROFILE_ID)
	const second = findBuiltinProfile(SECOND_PROFILE_ID)
	settings.profiles.active = {kind: 'builtin', id: BASELINE_PROFILE_ID}
	settings.profiles.overrides = [fastProfile(baseline), fastProfile(second)]
}

function baselineProfileDir(outputDir: string): string {
	return path.join(outputDir, BASELINE_PROFILE_NAME)
}

function secondProfileDir(outputDir: string): string {
	return path.join(outputDir, SECOND_PROFILE_NAME)
}

test('Electron playlist multi-profile assigns a second profile to a selection and downloads both into their own directories', async () => {
	test.setTimeout(220_000)

	await withFixtureProductApp({userDataPrefix: 'arroxy-fixture-multi-profile-user-', outputPrefix: 'arroxy-fixture-multi-profile-out-', settings: configureMultiProfileBaseline}, async ({page, outputDir, urls, files}) => {
		await page.locator('[data-testid="profiles-main-input"]').fill(urls.playlist())
		await page.locator('[data-testid="profiles-interactive-download"]').click()
		await expect(page.locator('[data-testid="step-playlist-items"]')).toBeVisible({timeout: 60_000})
		await expect(page.locator('[data-testid^="playlist-item-row-"]')).toHaveCount(3)

		// Real user action: enters multi-profile mode instead of Continue —
		// this is the one gesture that must skip Quality/SponsorBlock/Output/Save.
		await page.locator('[data-testid="enter-multi-profile"]').click()
		await expect(page.locator('[data-testid="step-playlist-profiles"]')).toBeVisible()

		// Milestone: the stepper collapsed. Multi-profile mode replaces
		// Quality/SponsorBlock/Output/Save with the single Profiles step, so
		// the visible step count drops to 4 (url, playlist, profiles, confirm)
		// and none of the collapsed labels render.
		const stepIndicator = page.locator('[data-testid="step-indicator"]')
		await expect(stepIndicator.locator('> div')).toHaveCount(4)
		await expect(stepIndicator).toContainText('Profiles')
		await expect(stepIndicator).not.toContainText('Quality')
		await expect(stepIndicator).not.toContainText('SponsorBlock')
		await expect(stepIndicator).not.toContainText('Output')
		await expect(stepIndicator).not.toContainText('Save')

		// Discoverability surface from the same task set — present by default
		// (multiProfileHintDismissed is unset in fixture settings).
		await expect(page.locator('[data-testid="multi-profile-hint"]')).toBeVisible()

		const rows = page.locator('[data-testid^="profile-row-"]')
		await expect(rows).toHaveCount(3)
		// Every row starts on the baseline (active) profile.
		await expect(rows.nth(0)).toContainText(BASELINE_PROFILE_NAME)
		await expect(rows.nth(1)).toContainText(BASELINE_PROFILE_NAME)
		await expect(rows.nth(2)).toContainText(BASELINE_PROFILE_NAME)

		// Real selection interaction: click row 1, shift-click row 2. Range of
		// two, deliberately not all three — one item must stay on the baseline
		// profile, or reassigning everything collapses back to a single output
		// directory and the two-directories oracle can never be satisfied.
		await rows.nth(0).click()
		await rows.nth(1).click({modifiers: ['Shift']})
		await expect(page.locator('[data-testid="playlist-profile-summary"]')).toContainText('2 of 3 selected')

		// Dropdown assignment: open "Assign to selection" and click the second
		// profile by id, rather than relying on its position in the list.
		await page.locator('[data-testid="playlist-profile-assign-trigger"]').click()
		await page.locator(`[data-testid="assign-profile-${SECOND_PROFILE_ID}"]`).click()

		await expect(rows.nth(0)).toContainText(SECOND_PROFILE_NAME)
		await expect(rows.nth(1)).toContainText(SECOND_PROFILE_NAME)
		// The untouched row keeps the baseline profile — proves assignment is
		// per-selection, not global.
		await expect(rows.nth(2)).toContainText(BASELINE_PROFILE_NAME)

		await clickContinue(page)
		await expect(page.locator('[data-testid="step-confirm"]')).toBeVisible()
		await expect(page.locator('[data-testid="confirm-profile-breakdown"]')).toBeVisible()
		await expect(page.locator('[data-testid="confirm-profile-breakdown"]')).toContainText(BASELINE_PROFILE_NAME)
		await expect(page.locator('[data-testid="confirm-profile-breakdown"]')).toContainText(SECOND_PROFILE_NAME)
		await page.locator('[data-testid="btn-add-to-queue"]').click()

		await openQueueTab(page)
		await expect(page.locator('[data-testid^="queue-manager-row-"]')).toHaveCount(3, {timeout: 20_000})
		await expect(page.locator('[data-testid^="queue-manager-row-"][data-status="done"]')).toHaveCount(3, {timeout: 160_000})

		// Oracle 1: real files under BOTH profile directories.
		files.expectMp4Count(1, baselineProfileDir(outputDir))
		files.expectMp4Count(2, secondProfileDir(outputDir))

		// Oracle 2: no .m3u anywhere under the output root. Multi-profile
		// submission carries no playlistGroupId and writes no manifest — a
		// stray M3U here would mean that path silently regressed.
		expect(files.listRecursive(outputDir).some(fileName => fileName.endsWith('.m3u'))).toBe(false)

		// Oracle 3 (deny-proxy: no non-local network access) is asserted
		// automatically by withFixtureProductApp once this callback returns.
	})
})
