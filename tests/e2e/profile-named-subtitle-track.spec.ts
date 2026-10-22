// Fixture Product E2E — a Download Profile asking for a language whose only
// uploaded track was given a name of its own.
//
// 1. User-facing risk: yt-dlp keys such a YouTube track by its vssId
//    (`en-nP7-2PuUl7o`, not `en`), and a profile asking for English treated it
//    as no English at all. The profile fetched the English automatic caption
//    in its place, or, on a video without one, failed with "no subtitles in
//    English"; the Format screen warned the same.
//
// 2. Fixtures: one fixture video whose English uploaded track is keyed
//    `en-<id>`, beside an English automatic caption. A custom subtitles-only
//    profile, pinned active, asks for `en`.
//
// 3. Real user actions: paste the URL into the home input, click Quick Download.
//
// 4. Milestones: the row reaches `done`.
//
// 5. Oracles: one subtitle file is saved, named by the track's key, and the
//    fixture server served only the uploaded English track, not the caption.
//
// A second scenario embeds the track and the caption beside it (Manual and
// auto): ffprobe finds both tagged eng, the caption titled Auto-generated so
// the two can be told apart.
import path from 'node:path'
import {expect, test} from '@playwright/test'
import {BUILTIN_DOWNLOAD_PROFILES} from '../../src/shared/downloadProfiles.js'
import type {DownloadProfile} from '../../src/shared/types.js'
import {probeStreams} from './ffprobe.js'
import {NAMED_SUBTITLE_TRACK_KEY, NAMED_SUBTITLE_TRACK_VIDEO_ID} from './fixtureMediaCatalog.js'
import {withFixtureProductApp} from './fixtureProductE2E.js'

const base = BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'subtitles-only')
if (!base) throw new Error('subtitles-only built-in profile missing')
const profile: DownloadProfile & {name: string} = {...base, id: 'english-subtitles-only', name: 'English subtitles-only', subtitles: {...base.subtitles, enabled: true, languages: ['en'], source: 'manual-first', mode: 'sidecar'}, subfolder: {enabled: true, name: 'English subtitles-only'}}

const title = 'Fixture Video 20'

test('Electron subtitles-only profile fetches an English track uploaded under a name of its own', async () => {
	test.setTimeout(160_000)

	await withFixtureProductApp(
		{
			userDataPrefix: 'arroxy-fixture-named-subs-user-',
			outputPrefix: 'arroxy-fixture-named-subs-out-',
			settings: settings => {
				settings.profiles.custom = [profile]
				settings.profiles.active = {kind: 'custom', id: profile.id}
			}
		},
		async ({page, urls, queue, files, fixtureServer}) => {
			await expect(page.locator('[data-testid="profiles-active-profile-card"]')).toContainText(profile.name)
			await page.locator('[data-testid="profiles-main-input"]').fill(urls.video(NAMED_SUBTITLE_TRACK_VIDEO_ID))
			await page.locator('[data-testid="profiles-quick-download"]').click()
			await queue.expectStatus(title, 'done', 140_000)

			expect(files.mediaFiles(`.${NAMED_SUBTITLE_TRACK_KEY}.srt`)).toHaveLength(1)
			const fetched = fixtureServer.telemetry().requests.flatMap(request => (request.kind === 'subtitle' && request.status === 200 ? [`${request.videoId}:${request.lang}:${request.track}`] : []))
			expect(fetched).toEqual([`${NAMED_SUBTITLE_TRACK_VIDEO_ID}:en:manual`])
		}
	)
})

test('Electron Manual and auto profile embeds a named English track and the English caption apart', async () => {
	test.setTimeout(160_000)
	const small = BUILTIN_DOWNLOAD_PROFILES.find(candidate => candidate.id === 'small-file')
	if (!small) throw new Error('small-file built-in profile missing')
	const embed: DownloadProfile & {name: string} = {
		...small,
		id: 'embed-named-subs',
		name: 'Embed Named Subs',
		subtitles: {enabled: true, languages: ['en'], source: 'manual-and-auto', mode: 'embed', format: 'srt'},
		subfolder: {enabled: true, name: 'Embed Named Subs'},
		sponsorBlock: {mode: 'off', categories: []},
		embed: {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}
	}

	await withFixtureProductApp(
		{
			userDataPrefix: 'arroxy-fixture-embed-named-subs-user-',
			outputPrefix: 'arroxy-fixture-embed-named-subs-out-',
			settings: settings => {
				settings.profiles.custom = [embed]
				settings.profiles.active = {kind: 'custom', id: embed.id}
			}
		},
		async ({page, outputDir, urls, queue, files, fixtureServer}) => {
			await page.locator('[data-testid="profiles-main-input"]').fill(urls.video(NAMED_SUBTITLE_TRACK_VIDEO_ID))
			await page.locator('[data-testid="profiles-quick-download"]').click()
			await queue.expectStatus(title, 'done', 140_000)

			const outputs = files.mediaFiles('.mkv', path.join(outputDir, embed.name))
			expect(outputs).toHaveLength(1)
			const subtitleTracks = probeStreams(outputs[0]).flatMap(stream => (stream.codecType === 'subtitle' ? [`${stream.language ?? 'und'}|${stream.title ?? ''}`] : []))
			expect(subtitleTracks.toSorted((a, b) => a.localeCompare(b))).toEqual(['eng|Auto-generated', 'eng|English'])
			const fetched = fixtureServer.telemetry().requests.flatMap(request => (request.kind === 'subtitle' && request.status === 200 ? [`${request.lang}:${request.track}`] : []))
			expect(fetched.toSorted((a, b) => a.localeCompare(b))).toEqual(['en:auto', 'en:manual'])
		}
	)
})
