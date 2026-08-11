import fs from 'node:fs'
import path from 'node:path'
import {expect, test} from '@playwright/test'
import {BUILTIN_DOWNLOAD_PROFILES} from '../../src/shared/downloadProfiles.js'
import type {AppSettings} from '../../src/shared/types.js'
import {AWKWARD_TITLE_VIDEO_ID, FIXTURE_PLAYLIST_VIDEO_IDS, FIXTURE_VIDEO_IDS} from './fixtureHarness.js'
import {withFixtureProductApp} from './fixtureProductE2E.js'
import {clickContinue, openQueueTab, preparePlaylistConfirm, prepareSingleConfirm, startBulkFromClipboard} from './fixtureWorkflow.js'

test.describe.configure({mode: 'serial'})

const FIXTURE_M3U_VIDEO_ID_PATTERN = /\[(ARX[0-9A-Z]{8})\]\.mp4/g

function configureSmallFileQuickProfile(settings: AppSettings): void {
	const smallFileProfile = BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'small-file')
	if (!smallFileProfile) throw new Error('small-file built-in profile missing')
	settings.profiles.active = {kind: 'builtin', id: 'small-file'}
	settings.profiles.overrides = [{...smallFileProfile, embed: {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}, sponsorBlock: {mode: 'off', categories: []}}]
}

function smallFileProfileDir(outputDir: string): string {
	return path.join(outputDir, 'Small file 480p')
}

async function expectOrderedM3u(dir: string, playlistTitle: string, expectedIds: readonly string[]): Promise<void> {
	const m3uPath = path.join(dir, `${playlistTitle}.m3u`)
	await expect.poll(() => fs.existsSync(m3uPath), {timeout: 20_000}).toBe(true)
	const m3u = fs.readFileSync(m3uPath, 'utf8')
	expect(m3u.startsWith('#EXTM3U\n')).toBe(true)
	const orderedIds = [...m3u.matchAll(FIXTURE_M3U_VIDEO_ID_PATTERN)].map(match => match[1])
	expect(orderedIds).toEqual([...expectedIds])
}

test('Electron quick download applies the active Download Profile to a fixture video', async () => {
	test.setTimeout(140_000)
	const videoId = FIXTURE_VIDEO_IDS[7]

	await withFixtureProductApp(
		{
			userDataPrefix: 'arroxy-fixture-profile-quick-user-',
			outputPrefix: 'arroxy-fixture-profile-quick-out-',
			settings: settings => {
				configureSmallFileQuickProfile(settings)
			}
		},
		async ({page, outputDir, fixtureServer, urls, queue, files}) => {
			await expect(page.locator('[data-testid="profiles-active-profile-card"]')).toContainText('Small file 480p')
			await page.locator('[data-testid="profiles-main-input"]').fill(urls.video(videoId))
			await page.locator('[data-testid="profiles-quick-download"]').click()
			// No intermediate mascot-copy assertion: the queued-state body reads
			// "The queue is handling this download" (never "queued") and it reverts
			// to idle within the poll window, so it's both wrong and racy. The queue
			// status below is the real oracle.
			await queue.expectStatus('Fixture Video 8', 'done', 120_000)

			const profileOutputDir = smallFileProfileDir(outputDir)
			files.expectMp4Count(1, profileOutputDir)
			const mediaRequest = fixtureServer.telemetry().requests.find(request => request.kind === 'media' && request.videoId === videoId && request.status === 200)
			expect(mediaRequest).toMatchObject({kind: 'media', videoId, formatId: '18', status: 200})
		}
	)
})

test('Electron Quick Download playlist queues entries and writes an ordered M3U', async () => {
	test.setTimeout(220_000)

	await withFixtureProductApp({userDataPrefix: 'arroxy-fixture-quick-playlist-user-', outputPrefix: 'arroxy-fixture-quick-playlist-out-', settings: configureSmallFileQuickProfile}, async ({page, outputDir, urls, files}) => {
		await page.locator('[data-testid="profiles-main-input"]').fill(urls.playlist())
		await page.locator('[data-testid="profiles-quick-download"]').click()

		await openQueueTab(page)
		await expect(page.locator('[data-testid^="queue-manager-row-"]')).toHaveCount(FIXTURE_PLAYLIST_VIDEO_IDS.length, {timeout: 60_000})
		await expect(page.locator('[data-testid^="queue-manager-row-"][data-status="done"]')).toHaveCount(FIXTURE_PLAYLIST_VIDEO_IDS.length, {timeout: 160_000})

		const profileDir = smallFileProfileDir(outputDir)
		files.expectMp4Count(FIXTURE_PLAYLIST_VIDEO_IDS.length, profileDir)
		await expectOrderedM3u(profileDir, 'Fixture Playlist', FIXTURE_PLAYLIST_VIDEO_IDS)
	})
})

test('Electron Quick Download capped playlist can queue the globally loaded slice', async () => {
	test.setTimeout(180_000)
	const expectedIds = FIXTURE_PLAYLIST_VIDEO_IDS.slice(0, 2)
	const skippedId = FIXTURE_PLAYLIST_VIDEO_IDS[2]
	if (!skippedId) throw new Error('fixture playlist needs a skipped third item')

	await withFixtureProductApp(
		{
			userDataPrefix: 'arroxy-fixture-quick-playlist-cap-queue-user-',
			outputPrefix: 'arroxy-fixture-quick-playlist-cap-queue-out-',
			settings: settings => {
				configureSmallFileQuickProfile(settings)
				settings.common.playlistProbeLimit = 2
			}
		},
		async ({page, outputDir, urls, files}) => {
			await page.locator('[data-testid="profiles-main-input"]').fill(urls.playlist())
			await page.locator('[data-testid="profiles-quick-download"]').click()

			await expect(page.locator('[data-testid="quick-playlist-cap-dialog"]')).toBeVisible({timeout: 60_000})
			await expect(page.locator('[data-testid="quick-playlist-cap-dialog"]')).toContainText('Arroxy loaded 2 items using the current limit of 2')
			await page.locator('[data-testid="quick-playlist-cap-queue-loaded"]').click()

			await expect(page.locator('[data-testid="quick-playlist-cap-dialog"]')).toBeHidden({timeout: 20_000})
			await openQueueTab(page)
			await expect(page.locator('[data-testid^="queue-manager-row-"]')).toHaveCount(expectedIds.length, {timeout: 20_000})
			await expect(page.locator('[data-testid^="queue-manager-row-"][data-status="done"]')).toHaveCount(expectedIds.length, {timeout: 140_000})

			const profileDir = smallFileProfileDir(outputDir)
			files.expectMp4Count(expectedIds.length, profileDir)
			files.expectNoMp4For(skippedId, profileDir)
			await expectOrderedM3u(profileDir, 'Fixture Playlist', expectedIds)
		}
	)
})

test('Electron Quick Download capped playlist can increase the global cap and retry', async () => {
	test.setTimeout(220_000)

	await withFixtureProductApp(
		{
			userDataPrefix: 'arroxy-fixture-quick-playlist-cap-retry-user-',
			outputPrefix: 'arroxy-fixture-quick-playlist-cap-retry-out-',
			settings: settings => {
				configureSmallFileQuickProfile(settings)
				settings.common.playlistProbeLimit = 2
			}
		},
		async ({page, outputDir, urls, files}) => {
			await page.locator('[data-testid="profiles-main-input"]').fill(urls.playlist())
			await page.locator('[data-testid="profiles-quick-download"]').click()

			await expect(page.locator('[data-testid="quick-playlist-cap-dialog"]')).toBeVisible({timeout: 60_000})
			await page.locator('[data-testid="quick-playlist-cap-probe-limit-trigger"]').click()
			await page.locator('[data-testid="quick-playlist-cap-probe-limit-option-100"]').click()

			await expect(page.locator('[data-testid="quick-playlist-cap-dialog"]')).toBeHidden({timeout: 20_000})
			await openQueueTab(page)
			await expect(page.locator('[data-testid^="queue-manager-row-"]')).toHaveCount(FIXTURE_PLAYLIST_VIDEO_IDS.length, {timeout: 60_000})
			await expect(page.locator('[data-testid^="queue-manager-row-"][data-status="done"]')).toHaveCount(FIXTURE_PLAYLIST_VIDEO_IDS.length, {timeout: 160_000})

			const profileDir = smallFileProfileDir(outputDir)
			files.expectMp4Count(FIXTURE_PLAYLIST_VIDEO_IDS.length, profileDir)
			await expectOrderedM3u(profileDir, 'Fixture Playlist', FIXTURE_PLAYLIST_VIDEO_IDS)
		}
	)
})

test('Electron full single-video wizard completes media and sidecar subtitles', async () => {
	test.setTimeout(180_000)
	const videoId = FIXTURE_VIDEO_IDS[8]

	await withFixtureProductApp(
		{
			userDataPrefix: 'arroxy-fixture-full-single-user-',
			outputPrefix: 'arroxy-fixture-full-single-out-',
			settings: settings => {
				settings.single.lastSubtitleLanguages = ['en']
				settings.single.lastSubtitleMode = 'sidecar'
				settings.single.lastSubtitleFormat = 'srt'
			}
		},
		async ({page, fixtureServer, queue, files}) => {
			await prepareSingleConfirm(page, videoId, 'continue')
			await page.locator('[data-testid="btn-download-now"]').click()
			await queue.expectStatus('Fixture Video 9', 'done', 140_000)

			files.expectMp4Count(1)
			const subtitleFiles = files.mediaFiles('.en.srt')
			expect(subtitleFiles).toHaveLength(1)
			expect(fs.readFileSync(subtitleFiles[0], 'utf8')).toContain(`Fixture subtitle for ${videoId}`)
			const subtitleRequest = fixtureServer.telemetry().requests.find(request => request.kind === 'subtitle' && request.videoId === videoId && request.status === 200)
			expect(subtitleRequest).toBeTruthy()
		}
	)
})

test('Electron true playlist URL queues entries and writes an ordered M3U', async () => {
	test.setTimeout(220_000)

	await withFixtureProductApp({userDataPrefix: 'arroxy-fixture-playlist-user-', outputPrefix: 'arroxy-fixture-playlist-out-'}, async ({page, outputDir, urls, files}) => {
		await preparePlaylistConfirm(page, urls.playlist())
		await expect(page.locator('[data-testid="confirm-playlist"]')).toContainText('Fixture Playlist')
		await expect(page.locator('[data-testid="confirm-items"]')).toContainText(String(FIXTURE_PLAYLIST_VIDEO_IDS.length))
		await page.locator('[data-testid="btn-add-to-queue"]').click()

		await openQueueTab(page)
		await expect(page.locator('[data-testid^="queue-manager-row-"]')).toHaveCount(FIXTURE_PLAYLIST_VIDEO_IDS.length, {timeout: 20_000})
		await expect(page.locator('[data-testid^="queue-manager-row-"][data-status="done"]')).toHaveCount(FIXTURE_PLAYLIST_VIDEO_IDS.length, {timeout: 160_000})

		const playlistDir = path.join(outputDir, 'Fixture Playlist')
		files.expectMp4Count(FIXTURE_PLAYLIST_VIDEO_IDS.length, playlistDir)
		await expectOrderedM3u(playlistDir, 'Fixture Playlist', FIXTURE_PLAYLIST_VIDEO_IDS)
	})
})

test('Electron bulk metadata concurrency and back/next navigation reach completed queue files', async () => {
	test.setTimeout(240_000)

	await withFixtureProductApp({behavior: {metadataDelayMs: 2_000}, userDataPrefix: 'arroxy-fixture-electron-user-', outputPrefix: 'arroxy-fixture-electron-out-'}, async ({app, page, fixtureServer, urls, files}) => {
		const rawBulkText = [...urls.videos(FIXTURE_VIDEO_IDS), urls.video(FIXTURE_VIDEO_IDS[0])].join('\n')
		await startBulkFromClipboard(page, app, rawBulkText)
		await expect(page.locator('[data-testid="bulk-url-valid-count"]')).toContainText('10')
		await expect(page.locator('[data-testid="bulk-url-ignored-count"]')).toContainText('1')
		await page.locator('[data-testid="bulk-url-confirm"]').click()

		await expect(page.locator('[data-testid="step-playlist-items"]')).toBeVisible()
		await expect.poll(() => fixtureServer.telemetry().maxActiveProbes, {timeout: 10_000}).toBe(2)
		await expect(page.locator('[data-testid="bulk-metadata-status"]')).toContainText('/10')

		await clickContinue(page)
		await expect(page.locator('[data-testid="step-playlist-presets"]')).toBeVisible()
		const probeEndsBeforeBack = fixtureServer.telemetry().requests.filter(request => request.kind === 'probe-end').length
		expect(probeEndsBeforeBack).toBeLessThan(FIXTURE_VIDEO_IDS.length)

		await page.getByRole('button', {name: /^back$/i}).click()
		await expect(page.locator('[data-testid="step-playlist-items"]')).toBeVisible()
		await expect(page.locator('[data-testid="bulk-metadata-status"]')).toContainText('/10')

		await clickContinue(page)
		await expect(page.locator('[data-testid="step-playlist-presets"]')).toBeVisible()
		const probeEndsBeforeQueue = fixtureServer.telemetry().requests.filter(request => request.kind === 'probe-end').length
		expect(probeEndsBeforeQueue).toBeLessThan(FIXTURE_VIDEO_IDS.length)

		await page.getByRole('button', {name: /skip to confirm/i}).click()
		await expect(page.locator('[data-testid="step-confirm"]')).toBeVisible()
		await expect(page.locator('[data-testid="confirm-items"]')).toContainText('10')
		await page.locator('[data-testid="btn-add-to-queue"]').click()

		await openQueueTab(page)
		await expect(page.locator('[data-testid^="queue-manager-row-"]')).toHaveCount(10, {timeout: 20_000})
		await expect(page.locator('[data-testid^="queue-manager-row-"][data-status="done"]')).toHaveCount(10, {timeout: 180_000})

		files.expectMp4Count(10)
		expect(files.listRecursive().filter(fileName => fileName.endsWith('.m3u'))).toHaveLength(0)
	})
})

test('Electron bulk Quick Download shows preparation progress and queues fixture files', async () => {
	test.setTimeout(180_000)

	await withFixtureProductApp(
		{
			behavior: {metadataDelayMs: 1_500},
			userDataPrefix: 'arroxy-fixture-bulk-quick-user-',
			outputPrefix: 'arroxy-fixture-bulk-quick-out-',
			settings: settings => {
				configureSmallFileQuickProfile(settings)
			}
		},
		async ({app, page, outputDir, urls, files}) => {
			const rawBulkText = urls.videos([FIXTURE_VIDEO_IDS[0], FIXTURE_VIDEO_IDS[1]]).join('\n')
			await startBulkFromClipboard(page, app, rawBulkText)
			await expect(page.locator('[data-testid="bulk-url-valid-count"]')).toContainText('2')
			await expect(page.locator('[data-testid="bulk-active-profile-card"]')).toContainText('Small file 480p')
			await page.locator('[data-testid="bulk-quick-download"]').click()

			await expect(page.locator('[data-testid="quick-download-progress-dialog"]')).toBeVisible({timeout: 10_000})
			await expect(page.locator('[data-testid="quick-download-progress-dialog"]')).toContainText('Small file 480p')
			await expect(page.locator('[data-testid="quick-download-progress-count"]')).toContainText('/ 2')
			await expect(page.locator('[data-testid="quick-download-progress-dialog"]')).toBeHidden({timeout: 60_000})

			await openQueueTab(page)
			await expect(page.locator('[data-testid^="queue-manager-row-"]')).toHaveCount(2, {timeout: 20_000})
			await expect
				.poll(async () => page.locator('[data-testid^="queue-manager-row-"]').evaluateAll(cards => cards.map(card => ({status: card.getAttribute('data-status'), text: card.textContent?.replace(/\s+/g, ' ').trim()}))), {timeout: 140_000})
				.toEqual([expect.objectContaining({status: 'done'}), expect.objectContaining({status: 'done'})])
			const profileDir = smallFileProfileDir(outputDir)
			await expect.poll(() => files.mediaFiles('.mp4', profileDir).length, {timeout: 20_000}).toBe(2)
			files.expectMp4Count(2, profileDir)
		}
	)
})

// Filename templates are the acceptance case for "file output" — unit tests
// prove the compiler emits the right -o string, but only a real download proves
// yt-dlp then writes the file we expected under that name.
test('Electron custom filename template names the downloaded file and never writes NA', async () => {
	test.setTimeout(140_000)
	const videoId = FIXTURE_VIDEO_IDS[7]

	await withFixtureProductApp(
		{
			userDataPrefix: 'arroxy-fixture-filename-template-user-',
			outputPrefix: 'arroxy-fixture-filename-template-out-',
			settings: settings => {
				configureSmallFileQuickProfile(settings)
				// {date} is deliberately included: the fixture extractor supplies no
				// upload_date, so this asserts the compiled `|` empty-default rather
				// than yt-dlp writing the literal string "NA" into the filename.
				settings.common.filenameTemplate = '{uploader} - {title}{date}'
			}
		},
		async ({page, outputDir, urls, queue, files}) => {
			await page.locator('[data-testid="profiles-main-input"]').fill(urls.video(videoId))
			await page.locator('[data-testid="profiles-quick-download"]').click()
			await queue.expectStatus('Fixture Video 8', 'done', 120_000)

			const profileOutputDir = smallFileProfileDir(outputDir)
			const produced = files.mediaFiles('mp4', profileOutputDir).map(file => path.basename(file))
			expect(produced).toEqual(['Arroxy Fixtures - Fixture Video 8.mp4'])
		}
	)
})

test('Electron writes a filesystem-legal name for a title the filesystem cannot take whole', async () => {
	// Risk: a real title that no filesystem accepts verbatim. This one carries
	// ':' and '|' (which yt-dlp's sanitizer *grows* — ':' to two characters, '|'
	// to a 3-byte full-width form, both applied *after* any cap yt-dlp is given),
	// CJK text whose byte and UTF-16 lengths differ threefold, an emoji that a
	// careless cut would split into a lone surrogate, and enough length to
	// overrun 255 in either unit.
	//
	// Only this layer can prove the outcome: the oracle is a real file on disk,
	// written by real yt-dlp through real IPC. Unit tests own the arithmetic.
	test.setTimeout(140_000)

	await withFixtureProductApp(
		{
			userDataPrefix: 'arroxy-fixture-awkward-title-user-',
			outputPrefix: 'arroxy-fixture-awkward-title-out-',
			settings: settings => {
				configureSmallFileQuickProfile(settings)
				settings.common.filenameTemplate = '{title} [{id}]'
			}
		},
		async ({page, outputDir, urls, files}) => {
			await page.locator('[data-testid="profiles-main-input"]').fill(urls.video(AWKWARD_TITLE_VIDEO_ID))
			await page.locator('[data-testid="profiles-quick-download"]').click()

			await openQueueTab(page)
			await expect(page.locator('[data-testid^="queue-manager-row-"][data-status="done"]')).toHaveCount(1, {timeout: 120_000})

			const produced = files.mediaFiles('mp4', smallFileProfileDir(outputDir)).map(file => path.basename(file))
			expect(produced).toHaveLength(1)
			const name = produced[0] ?? ''

			// The file existing is itself the strongest oracle: the OS accepted the
			// name, which is the thing the budget exists to guarantee.
			//
			// Asserting the length has to use the *host's* unit. Demanding 255 bytes
			// everywhere would re-impose the Linux rule on macOS and Windows and
			// contradict the whole design — this very name is ~650 bytes and writes
			// fine on APFS, which counts UTF-16 code units and caps at 255.
			const countsCodeUnits = process.platform === 'darwin' || process.platform === 'win32'
			const measured = countsCodeUnits ? name.length : new TextEncoder().encode(name).length
			expect(measured).toBeLessThanOrEqual(255)

			// Identity survives the shortening. Playlist dedupe and M3U writing
			// match `[videoId]` before the extension, so losing it would break both
			// silently — the shrink ladder must spend the title, never the id.
			expect(name).toContain(`[${AWKWARD_TITLE_VIDEO_ID}]`)

			// Arroxy sanitized these before yt-dlp ever saw them, so the growing
			// substitutions never ran. Neither the raw characters nor the
			// full-width forms yt-dlp would have produced appear on disk.
			expect(name).not.toMatch(/[:|]/)
			expect(name).not.toMatch(/[：｜]/)

			// A cut that split the emoji would leave an unpaired surrogate.
			expect(name).not.toMatch(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/)

			// Shortened, not gutted: enough of the title survives to recognise it.
			expect(name.length).toBeGreaterThan(40)
		}
	)
})

test('Electron filename template without {id} skips the M3U it could never match', async () => {
	test.setTimeout(220_000)

	await withFixtureProductApp(
		{
			userDataPrefix: 'arroxy-fixture-no-id-template-user-',
			outputPrefix: 'arroxy-fixture-no-id-template-out-',
			settings: settings => {
				settings.common.filenameTemplate = '{title}'
			}
		},
		async ({page, outputDir, urls, files}) => {
			await preparePlaylistConfirm(page, urls.playlist())
			await page.locator('[data-testid="btn-add-to-queue"]').click()

			await openQueueTab(page)
			await expect(page.locator('[data-testid^="queue-manager-row-"][data-status="done"]')).toHaveCount(FIXTURE_PLAYLIST_VIDEO_IDS.length, {timeout: 160_000})

			const playlistDir = path.join(outputDir, 'Fixture Playlist')
			files.expectMp4Count(FIXTURE_PLAYLIST_VIDEO_IDS.length, playlistDir)
			// M3U locates entries by `[videoId]`; without {id} it would list names
			// that never appear on disk, so it must not be written at all.
			expect(fs.existsSync(path.join(playlistDir, 'Fixture Playlist.m3u'))).toBe(false)
			expect(files.mediaFiles('mp4', playlistDir).every(file => !path.basename(file).includes('['))).toBe(true)
		}
	)
})

test('Electron nesting filename template sorts a playlist into folders without duplicating the playlist folder', async () => {
	test.setTimeout(220_000)

	await withFixtureProductApp(
		{
			userDataPrefix: 'arroxy-fixture-nested-template-user-',
			outputPrefix: 'arroxy-fixture-nested-template-out-',
			settings: settings => {
				// The exact shape the feature request asked for, in Arroxy token syntax.
				settings.common.filenameTemplate = '{playlist_title}/{playlist_index} - {title} [{id}]'
			}
		},
		async ({page, outputDir, urls, files}) => {
			await preparePlaylistConfirm(page, urls.playlist())
			await page.locator('[data-testid="btn-add-to-queue"]').click()

			await openQueueTab(page)
			await expect(page.locator('[data-testid^="queue-manager-row-"][data-status="done"]')).toHaveCount(FIXTURE_PLAYLIST_VIDEO_IDS.length, {timeout: 160_000})

			const playlistDir = path.join(outputDir, 'Fixture Playlist')
			files.expectMp4Count(FIXTURE_PLAYLIST_VIDEO_IDS.length, playlistDir)

			// The template renders the playlist folder, so the auto-folder must step
			// aside — otherwise every file lands in 'Fixture Playlist/Fixture Playlist'.
			expect(fs.existsSync(path.join(playlistDir, 'Fixture Playlist'))).toBe(false)

			// Zero-padded index prefix, in playlist order.
			const produced = files
				.mediaFiles('mp4', playlistDir)
				.map(file => path.basename(file))
				.sort()
			expect(produced.map(name => name.slice(0, 5))).toEqual(FIXTURE_PLAYLIST_VIDEO_IDS.map((_, index) => `${String(index + 1).padStart(3, '0')} - `.slice(0, 5)))
			expect(produced.every(name => /^\d{3} - Fixture Video \d+ \[ARX[0-9A-Z]{8}\]\.mp4$/.test(name))).toBe(true)

			// A nesting template can scatter entries across folders, so the playlist
			// file that would point at one directory is not written.
			expect(fs.existsSync(path.join(playlistDir, 'Fixture Playlist.m3u'))).toBe(false)
		}
	)
})

test('Electron filename template names a folder after the uploader for a single video', async () => {
	test.setTimeout(140_000)
	const videoId = FIXTURE_VIDEO_IDS[7]

	await withFixtureProductApp(
		{
			userDataPrefix: 'arroxy-fixture-uploader-dir-user-',
			outputPrefix: 'arroxy-fixture-uploader-dir-out-',
			settings: settings => {
				configureSmallFileQuickProfile(settings)
				// {uploader} is resolved by Arroxy here, not yt-dlp, because it names a
				// directory the app must know before the download starts.
				settings.common.filenameTemplate = '{uploader}/{title}'
			}
		},
		async ({page, outputDir, urls, queue, files}) => {
			await page.locator('[data-testid="profiles-main-input"]').fill(urls.video(videoId))
			await page.locator('[data-testid="profiles-quick-download"]').click()
			await queue.expectStatus('Fixture Video 8', 'done', 120_000)

			const uploaderDir = path.join(smallFileProfileDir(outputDir), 'Arroxy Fixtures')
			const produced = files.mediaFiles('mp4', uploaderDir).map(file => path.basename(file))
			expect(produced).toEqual(['Fixture Video 8.mp4'])
		}
	)
})

test('Electron nesting template collapses the folder when the flat playlist probe has no uploader', async () => {
	test.setTimeout(220_000)

	await withFixtureProductApp(
		{
			userDataPrefix: 'arroxy-fixture-collapse-user-',
			outputPrefix: 'arroxy-fixture-collapse-out-',
			settings: settings => {
				// The fixture playlist supplies no per-entry uploader — the real sparse
				// case. The folder must collapse rather than become 'NA' or empty.
				settings.common.filenameTemplate = '{uploader}/{title} [{id}]'
			}
		},
		async ({page, outputDir, urls, files}) => {
			await preparePlaylistConfirm(page, urls.playlist())
			await page.locator('[data-testid="btn-add-to-queue"]').click()

			await openQueueTab(page)
			await expect(page.locator('[data-testid^="queue-manager-row-"][data-status="done"]')).toHaveCount(FIXTURE_PLAYLIST_VIDEO_IDS.length, {timeout: 160_000})

			files.expectMp4Count(FIXTURE_PLAYLIST_VIDEO_IDS.length, outputDir)
			for (const stray of ['NA', 'Arroxy Fixtures', 'Playlist']) {
				expect(fs.existsSync(path.join(outputDir, stray))).toBe(false)
			}
		}
	)
})
