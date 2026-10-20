// Fixture Product E2E — a subtitles-only Download Profile on a video without
// the chosen language.
//
// 1. User-facing risk: Quick Download with a subtitles-only profile on a video
//    that has none of its languages saved nothing, yet the queue row finished
//    as a plain success, so the user had no sign that nothing was downloaded.
//
// 2. Fixtures: one fixture video with English and Spanish subtitles only. A
//    custom subtitles-only profile, pinned active, asks for German.
//
// 3. Real user actions: paste the URL into the home input, click Quick Download.
//
// 4. Milestones: the queue row reaches `done`.
//
// 5. Oracles: the row carries the subtitle warning, no subtitle file is saved,
//    and no subtitle was fetched from the fixture server.
import {expect, test} from '@playwright/test'
import {BUILTIN_DOWNLOAD_PROFILES} from '../../src/shared/downloadProfiles.js'
import type {DownloadProfile} from '../../src/shared/types.js'
import {FIXTURE_VIDEO_IDS} from './fixtureHarness.js'
import {withFixtureProductApp} from './fixtureProductE2E.js'

function subtitlesOnlyProfile(languages: string[]): DownloadProfile {
	const base = BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'subtitles-only')
	if (!base) throw new Error('subtitles-only built-in profile missing')
	return {...base, id: 'german-subs', name: 'German Subs', subtitles: {...base.subtitles, enabled: true, languages}, subfolder: {enabled: true, name: 'German Subs'}}
}

test('Electron subtitles-only profile warns when the video has none of its languages', async () => {
	test.setTimeout(160_000)
	const videoIndex = 9
	const videoId = FIXTURE_VIDEO_IDS[videoIndex]
	const profile = subtitlesOnlyProfile(['de'])

	await withFixtureProductApp(
		{
			userDataPrefix: 'arroxy-fixture-subs-only-missing-user-',
			outputPrefix: 'arroxy-fixture-subs-only-missing-out-',
			settings: settings => {
				settings.profiles.custom = [profile]
				settings.profiles.active = {kind: 'custom', id: profile.id}
			}
		},
		async ({page, urls, queue, files, fixtureServer}) => {
			await expect(page.locator('[data-testid="profiles-active-profile-card"]')).toContainText(profile.name)
			await page.locator('[data-testid="profiles-main-input"]').fill(urls.video(videoId))
			await page.locator('[data-testid="profiles-quick-download"]').click()
			await queue.expectStatus(`Fixture Video ${videoIndex + 1}`, 'done', 140_000)

			await expect(queue.cardByTitle(`Fixture Video ${videoIndex + 1}`).getByTestId('queue-subs-warning')).toBeVisible()
			expect(files.listRecursive().filter(file => /\.(srt|vtt|ass)$/.test(file))).toEqual([])
			expect(fixtureServer.telemetry().requests.filter(request => request.kind === 'subtitle' && request.videoId === videoId)).toEqual([])
		}
	)
})
