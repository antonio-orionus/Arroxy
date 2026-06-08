import fs from 'node:fs'
import path from 'node:path'
import {expect, test} from '@playwright/test'
import {FIXTURE_PLAYLIST_ID, FIXTURE_PLAYLIST_VIDEO_IDS, FIXTURE_PLUGIN_DIR_ARG, FIXTURE_VIDEO_IDS} from './fixtureHarness.js'
import {withFixtureYtDlp} from './fixtureProductE2E.js'
import {isRecord, parseInfoJson, recordArrayField, stringField} from './fixtureWorkflow.js'
import {isYouTubeExtractor} from '../../src/shared/ytdlp/extractorPredicates.js'

test.describe.configure({mode: 'serial'})

test('fixture plugin metadata smoke returns YouTube-shaped local info', async () => {
	test.setTimeout(90_000)

	await withFixtureYtDlp({userDataPrefix: 'arroxy-fixture-metadata-'}, async ({fixtureServer, urls, runYtDlp}) => {
		const result = await runYtDlp(['--ignore-config', '--plugin-dirs', FIXTURE_PLUGIN_DIR_ARG, '--no-cache-dir', '--dump-single-json', urls.video(FIXTURE_VIDEO_IDS[0])], 60_000)

		expect(result.exitCode, result.stderr).toBe(0)
		const info = parseInfoJson(result.stdout)
		expect(info.id).toBe(FIXTURE_VIDEO_IDS[0])
		expect(info.title).toBe('Fixture Video 1')
		expect(info.extractor_key).toBe('Youtube')
		expect(isYouTubeExtractor(stringField(info, 'extractor'))).toBe(true)

		const formats = recordArrayField(info, 'formats')
		expect(formats.map(format => format.format_id)).toEqual(expect.arrayContaining(['18', '22']))
		for (const format of formats) {
			expect(stringField(format, 'url')).toMatch(new RegExp(`^${fixtureServer.baseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/media/`))
		}

		const subtitles = info.subtitles
		expect(isRecord(subtitles)).toBe(true)
		const englishSubs = isRecord(subtitles) && Array.isArray(subtitles.en) ? subtitles.en.filter(isRecord) : []
		expect(englishSubs).toHaveLength(1)
		expect(stringField(englishSubs[0], 'url')).toContain(`${fixtureServer.baseUrl}/subtitles/${FIXTURE_VIDEO_IDS[0]}/en.vtt`)
		expect(stringField(info, 'thumbnail')).toContain(`${fixtureServer.baseUrl}/thumbnails/${FIXTURE_VIDEO_IDS[0]}.jpg`)
	})
})

test('fixture plugin playlist metadata smoke returns flat YouTube-shaped entries', async () => {
	test.setTimeout(90_000)

	await withFixtureYtDlp({userDataPrefix: 'arroxy-fixture-playlist-metadata-'}, async ({urls, runYtDlp}) => {
		const result = await runYtDlp(['--ignore-config', '--plugin-dirs', FIXTURE_PLUGIN_DIR_ARG, '--no-cache-dir', '--dump-single-json', '--flat-playlist', urls.playlist()], 60_000)

		expect(result.exitCode, result.stderr).toBe(0)
		const info = parseInfoJson(result.stdout)
		expect(info._type).toBe('playlist')
		expect(info.id).toBe(FIXTURE_PLAYLIST_ID)
		expect(info.playlist_title).toBe('Fixture Playlist')
		expect(isYouTubeExtractor(stringField(info, 'extractor'))).toBe(true)

		const entries = recordArrayField(info, 'entries')
		expect(entries).toHaveLength(FIXTURE_PLAYLIST_VIDEO_IDS.length)
		expect(entries.map(entry => entry.id)).toEqual([...FIXTURE_PLAYLIST_VIDEO_IDS])
		expect(stringField(entries[0], 'url')).toBe(urls.video(FIXTURE_PLAYLIST_VIDEO_IDS[0]))
		expect(stringField(entries[0], 'title')).toBe('Fixture Video 1')
	})
})

test('fixture plugin direct download smoke writes a real file through yt-dlp', async () => {
	test.setTimeout(120_000)

	await withFixtureYtDlp({userDataPrefix: 'arroxy-fixture-download-user-', outputPrefix: 'arroxy-fixture-download-out-'}, async ({outputDir, urls, runYtDlp}) => {
		const result = await runYtDlp(['--ignore-config', '--plugin-dirs', FIXTURE_PLUGIN_DIR_ARG, '--no-cache-dir', '--newline', '-f', '18', '-o', path.join(outputDir, '%(id)s.%(ext)s'), urls.video(FIXTURE_VIDEO_IDS[0])], 90_000)

		expect(result.exitCode, result.stderr).toBe(0)
		const outputPath = path.join(outputDir, `${FIXTURE_VIDEO_IDS[0]}.mp4`)
		expect(fs.existsSync(outputPath)).toBe(true)
		expect(fs.statSync(outputPath).size).toBeGreaterThan(200_000)
	})
})
