// Fixture Product E2E — Download Profiles asking for subtitle languages the
// video does not have.
//
// 1. User-facing risk: Quick Download with a subtitles-only profile on a video
//    that has none of its languages saved nothing, yet the queue row finished
//    as a plain success, so the user had no sign that nothing was downloaded.
//    A video profile with such a language finished without saying the
//    subtitles were missing.
//
// 2. Fixtures: one fixture video with English and Spanish subtitles only.
//    Custom profiles, pinned active, ask for German.
//
// 3. Real user actions: paste the URL into the home input, click Quick Download.
//
// 4. Milestones: the subtitles-only row reaches `error`; the video row `done`.
//
// 5. Oracles: the subtitles-only row says the video has no German subtitles,
//    no subtitle file is saved, and no subtitle was fetched from the fixture
//    server. The video row keeps its video and carries the warning naming
//    German.
import {expect, test} from '@playwright/test'
import {BUILTIN_DOWNLOAD_PROFILES} from '../../src/shared/downloadProfiles.js'
import type {DownloadProfile} from '../../src/shared/types.js'
import {FIXTURE_VIDEO_IDS} from './fixtureHarness.js'
import {withFixtureProductApp} from './fixtureProductE2E.js'

function germanProfile(baseId: 'subtitles-only' | 'balanced'): DownloadProfile {
	const base = BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === baseId)
	if (!base) throw new Error(`${baseId} built-in profile missing`)
	return {...base, id: `german-${baseId}`, name: `German ${baseId}`, subtitles: {...base.subtitles, enabled: true, languages: ['de'], mode: 'sidecar'}, subfolder: {enabled: true, name: `German ${baseId}`}}
}

const videoIndex = 9
const videoId = FIXTURE_VIDEO_IDS[videoIndex]
const title = `Fixture Video ${videoIndex + 1}`

test('Electron subtitles-only profile fails, naming the languages, when the video has none of them', async () => {
	test.setTimeout(160_000)
	const profile = germanProfile('subtitles-only')

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
			await queue.expectStatus(title, 'error', 140_000)

			await expect(queue.cardByTitle(title)).toContainText('This video has no subtitles in German.')
			expect(files.listRecursive().filter(file => /\.(srt|vtt|ass)$/.test(file))).toEqual([])
			expect(fixtureServer.telemetry().requests.filter(request => request.kind === 'subtitle' && request.videoId === videoId)).toEqual([])
		}
	)
})

test('Electron video profile keeps the video and names the subtitle languages it lacks', async () => {
	test.setTimeout(160_000)
	const profile = germanProfile('balanced')

	await withFixtureProductApp(
		{
			userDataPrefix: 'arroxy-fixture-video-subs-missing-user-',
			outputPrefix: 'arroxy-fixture-video-subs-missing-out-',
			settings: settings => {
				settings.profiles.custom = [profile]
				settings.profiles.active = {kind: 'custom', id: profile.id}
			}
		},
		async ({page, urls, queue, files, fixtureServer}) => {
			await expect(page.locator('[data-testid="profiles-active-profile-card"]')).toContainText(profile.name)
			await page.locator('[data-testid="profiles-main-input"]').fill(urls.video(videoId))
			await page.locator('[data-testid="profiles-quick-download"]').click()
			await queue.expectStatus(title, 'done', 140_000)

			await expect(queue.cardByTitle(title).getByTestId('queue-subs-warning')).toHaveText('No subtitles in German')
			expect(files.listRecursive().filter(file => /\.(srt|vtt|ass)$/.test(file))).toEqual([])
			expect(files.mediaFiles('mp4').length + files.mediaFiles('webm').length + files.mediaFiles('mkv').length).toBeGreaterThan(0)
			expect(fixtureServer.telemetry().requests.filter(request => request.kind === 'subtitle' && request.videoId === videoId)).toEqual([])
		}
	)
})
