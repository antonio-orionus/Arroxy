// Fixture Product E2E — Download Profile embedded subtitles.
//
// 1. User-facing risk: a Download Profile that embeds subtitles in several
//    languages must put every chosen language inside the saved video as its own
//    switchable track, and must not strip the embedded cover art on the way.
//    The subtitle mux once ran ffmpeg without stream maps, so ffmpeg's default
//    stream selection kept a single subtitle track and dropped the cover.
//    Only real yt-dlp + ffmpeg on a real file proves it.
//
// 2. Fixtures: one fixture video with manual English and Spanish subtitles, a
//    JPEG thumbnail and a muxed MP4. A custom profile, pinned active, embeds
//    subtitles (en + es) and the thumbnail; every other embed and SponsorBlock
//    option is off so the run stays fast.
//
// 3. Real user actions: paste the URL into the home input, click Quick Download.
//
// 4. Milestones: the active profile card names the custom profile; the queue
//    row reaches `done`.
//
// 5. Oracles: exactly one MKV in the profile's folder and no leftover MP4 or
//    sidecar subtitle files; ffprobe finds one subtitle track per language,
//    tagged eng and spa, plus the cover art; both subtitle files were fetched
//    from the fixture server.
import path from 'node:path'
import {expect, test} from '@playwright/test'
import {BUILTIN_DOWNLOAD_PROFILES} from '../../src/shared/downloadProfiles.js'
import type {DownloadProfile} from '../../src/shared/types.js'
import {FIXTURE_VIDEO_IDS} from './fixtureHarness.js'
import {probeStreams} from './ffprobe.js'
import {withFixtureProductApp} from './fixtureProductE2E.js'

function embedSubtitlesProfile(): DownloadProfile {
	const base = BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'small-file')
	if (!base) throw new Error('small-file built-in profile missing')
	return {
		...base,
		id: 'embed-subs',
		name: 'Embed Subs',
		media: {kind: 'video-audio', goal: 'smart-tv', tier: '480', fileType: 'auto', audio: {native: {kind: 'default'}}},
		subtitles: {enabled: true, languages: ['en', 'es'], source: 'manual-only', mode: 'embed', format: 'srt'},
		subfolder: {enabled: true, name: 'Embed Subs'},
		sponsorBlock: {mode: 'off', categories: []},
		embed: {chapters: false, metadata: false, thumbnail: true, description: false, thumbnailSidecar: false}
	}
}

test('Electron Download Profile embeds every chosen subtitle language and keeps the cover art', async () => {
	test.setTimeout(160_000)
	const videoIndex = 9
	const videoId = FIXTURE_VIDEO_IDS[videoIndex]
	const profile = embedSubtitlesProfile()

	await withFixtureProductApp(
		{
			userDataPrefix: 'arroxy-fixture-embed-subs-user-',
			outputPrefix: 'arroxy-fixture-embed-subs-out-',
			settings: settings => {
				settings.profiles.custom = [profile]
				settings.profiles.active = {kind: 'custom', id: profile.id}
			}
		},
		async ({page, outputDir, urls, queue, files, fixtureServer}) => {
			await expect(page.locator('[data-testid="profiles-active-profile-card"]')).toContainText(profile.name)
			await page.locator('[data-testid="profiles-main-input"]').fill(urls.video(videoId))
			await page.locator('[data-testid="profiles-quick-download"]').click()
			await queue.expectStatus(`Fixture Video ${videoIndex + 1}`, 'done', 140_000)

			const profileDir = path.join(outputDir, profile.name)
			const outputs = files.mediaFiles('.mkv', profileDir)
			expect(outputs).toHaveLength(1)
			const leftovers = files.listRecursive(profileDir).filter(file => /\.(mp4|srt|vtt)$/.test(file))
			expect(leftovers).toEqual([])

			const streams = probeStreams(outputs[0])
			const subtitleLanguages = streams.flatMap(stream => (stream.codecType === 'subtitle' ? [stream.language ?? 'und'] : []))
			expect(subtitleLanguages.toSorted((a, b) => a.localeCompare(b))).toEqual(['eng', 'spa'])
			expect(streams.some(stream => stream.attachedPic || stream.mimetype?.startsWith('image/'))).toBe(true)

			const fetched = fixtureServer.telemetry().requests.flatMap(request => (request.kind === 'subtitle' && request.videoId === videoId && request.status === 200 ? [request.lang] : []))
			expect(fetched.toSorted((a, b) => a.localeCompare(b))).toEqual(['en', 'es'])
		}
	)
})
