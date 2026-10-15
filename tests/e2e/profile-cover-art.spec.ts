// Fixture Product E2E — Download Profile cover art.
//
// 1. User-facing risk: a Download Profile with "Embed thumbnail" on must put
//    the video thumbnail inside the saved file as cover art. Profiles used to
//    hardcode the option off, so profile downloads only ever got a sidecar .jpg.
//    Only real yt-dlp + ffmpeg postprocessing on a real file proves it.
//
// 2. Fixtures: one fixture video per profile. The fixture server serves a JPEG
//    thumbnail, a split m4a audio stream (converted to MP3) and a muxed MP4.
//    Each run uses a custom profile pinned active, with every other embed and
//    SponsorBlock option off so the run stays fast.
//
// 3. Real user actions: paste the URL into the home input, click Quick Download.
//
// 4. Milestones: the active profile card names the custom profile; the queue
//    row reaches `done`.
//
// 5. Oracles: exactly one output file with the profile's extension in the
//    profile's folder, carrying an `attached_pic` stream per ffprobe.
import path from 'node:path'
import {expect, test} from '@playwright/test'
import {BUILTIN_DOWNLOAD_PROFILES} from '../../src/shared/downloadProfiles.js'
import type {DownloadProfile} from '../../src/shared/types.js'
import {FIXTURE_VIDEO_IDS} from './fixtureHarness.js'
import {probeStreams} from './ffprobe.js'
import {withFixtureProductApp} from './fixtureProductE2E.js'

function coverArtProfile(id: string, name: string, media: DownloadProfile['media']): DownloadProfile {
	const base = BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'small-file')
	if (!base) throw new Error('small-file built-in profile missing')
	return {...base, id, name, media, subfolder: {enabled: true, name}, sponsorBlock: {mode: 'off', categories: []}, embed: {chapters: false, metadata: false, thumbnail: true, description: false, thumbnailSidecar: false}}
}

const CASES = [
	{label: 'MP3 audio', videoIndex: 8, extension: '.mp3', profile: coverArtProfile('cover-mp3', 'Cover MP3', {kind: 'audio-only', audio: {format: 'mp3', bitrateKbps: 192}})},
	{label: 'MP4 video', videoIndex: 9, extension: '.mp4', profile: coverArtProfile('cover-mp4', 'Cover MP4', {kind: 'video-audio', codec: 'mp4', tiers: ['480'], audio: {format: 'm4a'}})}
] as const

for (const {label, videoIndex, extension, profile} of CASES) {
	test(`Electron Download Profile embeds the thumbnail as cover art in ${label}`, async () => {
		test.setTimeout(140_000)
		const videoId = FIXTURE_VIDEO_IDS[videoIndex]

		await withFixtureProductApp(
			{
				userDataPrefix: `arroxy-fixture-${profile.id}-user-`,
				outputPrefix: `arroxy-fixture-${profile.id}-out-`,
				settings: settings => {
					settings.profiles.custom = [profile]
					settings.profiles.active = {kind: 'custom', id: profile.id}
				}
			},
			async ({page, outputDir, urls, queue, files}) => {
				await expect(page.locator('[data-testid="profiles-active-profile-card"]')).toContainText(profile.name)
				await page.locator('[data-testid="profiles-main-input"]').fill(urls.video(videoId))
				await page.locator('[data-testid="profiles-quick-download"]').click()
				await queue.expectStatus(`Fixture Video ${videoIndex + 1}`, 'done', 120_000)

				const profileDir = path.join(outputDir, profile.name)
				const outputs = files.mediaFiles(extension, profileDir)
				expect(outputs).toHaveLength(1)
				expect(probeStreams(outputs[0]).some(stream => stream.attachedPic)).toBe(true)
			}
		)
	})
}
