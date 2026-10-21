// Fixture Product E2E — Download Profile cover art.
//
// 1. User-facing risk: a Download Profile with "Embed thumbnail" on must put
//    the video thumbnail inside the saved file as cover art. Profiles used to
//    hardcode the option off, so profile downloads only ever got a sidecar .jpg.
//    Video without audio saved as MP4 or MKV holds cover art too, as yt-dlp
//    embeds by container; profiles once left it out whenever there was no
//    audio. Its audio then comes off a stream with sound, and embedded
//    subtitles remux the file, and both must keep the cover.
//    Only real yt-dlp + ffmpeg postprocessing on a real file proves it.
//
// 2. Fixtures: one fixture video per profile. The fixture server serves a JPEG
//    thumbnail, a split m4a audio stream (converted to MP3), a muxed MP4 (no
//    video-only stream, so video without audio drops the muxed one's audio)
//    and English subtitles. Each run uses a custom profile pinned active, with
//    every other embed and SponsorBlock option off so the run stays fast.
//
// 3. Real user actions: paste the URL into the home input, click Quick Download.
//
// 4. Milestones: the active profile card names the custom profile; the queue
//    row reaches `done`.
//
// 5. Oracles: exactly one output file with the profile's extension in the
//    profile's folder, carrying cover art per ffprobe (an `attached_pic` stream,
//    or an image attachment in MKV); video without audio has no audio stream.
import path from 'node:path'
import {expect, test} from '@playwright/test'
import {BUILTIN_DOWNLOAD_PROFILES} from '../../src/shared/downloadProfiles.js'
import type {DownloadProfile} from '../../src/shared/types.js'
import {FIXTURE_VIDEO_IDS} from './fixtureHarness.js'
import {probeStreams} from './ffprobe.js'
import {withFixtureProductApp} from './fixtureProductE2E.js'

function coverArtProfile(id: string, name: string, media: DownloadProfile['media'], embedSubtitles = false): DownloadProfile & {name: string} {
	const base = BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'small-file')
	if (!base) throw new Error('small-file built-in profile missing')
	const subtitles: DownloadProfile['subtitles'] = embedSubtitles ? {enabled: true, languages: ['en'], source: 'manual-only', mode: 'embed', format: 'srt'} : base.subtitles
	return {...base, id, name, media, subtitles, subfolder: {enabled: true, name}, sponsorBlock: {mode: 'off', categories: []}, embed: {chapters: false, metadata: false, thumbnail: true, description: false, thumbnailSidecar: false}}
}

function videoOnly(fileType: 'mp4' | 'mkv'): DownloadProfile['media'] {
	return {kind: 'video-only', goal: 'best-picture', tier: '480', fileType}
}

const CASES = [
	{label: 'MP3 audio', videoIndex: 8, extension: '.mp3', audio: true, profile: coverArtProfile('cover-mp3', 'Cover MP3', {kind: 'audio-only', audio: {format: 'mp3', bitrateKbps: 192}})},
	{label: 'MP4 video', videoIndex: 9, extension: '.mp4', audio: true, profile: coverArtProfile('cover-mp4', 'Cover MP4', {kind: 'video-audio', goal: 'smart-tv', tier: '480', fileType: 'auto', audio: {native: {kind: 'default'}}})},
	{label: 'MP4 video without audio', videoIndex: 9, extension: '.mp4', audio: false, profile: coverArtProfile('cover-mp4-silent', 'Cover MP4 Silent', videoOnly('mp4'))},
	{label: 'MKV video without audio', videoIndex: 9, extension: '.mkv', audio: false, profile: coverArtProfile('cover-mkv-silent', 'Cover MKV Silent', videoOnly('mkv'))},
	{label: 'video without audio with embedded subtitles', videoIndex: 9, extension: '.mkv', audio: false, profile: coverArtProfile('cover-mp4-silent-subs', 'Cover Silent Subs', videoOnly('mp4'), true)}
] as const

for (const {label, videoIndex, extension, audio, profile} of CASES) {
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
				const streams = probeStreams(outputs[0])
				const isCover = (stream: (typeof streams)[number]): boolean => stream.attachedPic || (extension === '.mkv' && stream.mimetype?.startsWith('image/') === true)
				expect(streams.some(isCover)).toBe(true)
				expect(streams.some(stream => stream.codecType === 'audio')).toBe(audio)
			}
		)
	})
}
