import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {describe, expect, it} from 'vitest'
import {RecentJobsStore} from '@main/stores/RecentJobsStore.js'
import {SettingsStore} from '@main/stores/SettingsStore.js'
import {defaultAppSettings} from '@shared/constants.js'
import {updateSettingsSchema} from '@shared/schemas.js'

describe('settings and recent stores', () => {
	const baseDefaults = defaultAppSettings('/tmp')

	it('persists settings updates', async () => {
		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-store-'))
		const store = new SettingsStore(userData, baseDefaults)

		const updated = await store.update({common: {defaultOutputDir: '/home/test/downloads'}})
		expect(updated.common.defaultOutputDir).toBe('/home/test/downloads')

		const readBack = await store.get()
		expect(readBack.common.defaultOutputDir).toBe('/home/test/downloads')
	})

	it('defaults and persists the remaining backdrop render modes', async () => {
		expect(baseDefaults.common.backdropRenderMode).toBe('gpu')

		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-store-backdrop-'))
		const store = new SettingsStore(userData, baseDefaults)

		const updated = await store.update({common: {backdropRenderMode: 'css-only'}})
		expect(updated.common.backdropRenderMode).toBe('css-only')

		const readBack = await store.get()
		expect(readBack.common.backdropRenderMode).toBe('css-only')
	})

	it('defaults, validates, and persists native audio preference', async () => {
		expect(baseDefaults.common.nativeAudioPreference).toBe('compatible')
		expect(updateSettingsSchema.safeParse({common: {nativeAudioPreference: 'surround'}}).success).toBe(true)
		expect(updateSettingsSchema.safeParse({common: {nativeAudioPreference: 'cinema'}}).success).toBe(false)

		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-store-native-audio-'))
		const store = new SettingsStore(userData, baseDefaults)

		const updated = await store.update({common: {nativeAudioPreference: 'surround'}})
		expect(updated.common.nativeAudioPreference).toBe('surround')
		expect((await store.get()).common.nativeAudioPreference).toBe('surround')
	})

	it('validates and persists the last shown release notes version', async () => {
		expect(updateSettingsSchema.safeParse({common: {lastReleaseNotesVersionShown: '1.2.0'}}).success).toBe(true)
		expect(updateSettingsSchema.safeParse({common: {lastReleaseNotesVersionShown: ''}}).success).toBe(false)

		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-store-release-notes-'))
		const store = new SettingsStore(userData, baseDefaults)

		const updated = await store.update({common: {lastReleaseNotesVersionShown: '1.2.0'}})
		expect(updated.common.lastReleaseNotesVersionShown).toBe('1.2.0')
		expect((await store.get()).common.lastReleaseNotesVersionShown).toBe('1.2.0')
	})

	it('persists subtitle language preferences', async () => {
		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-store-subs-'))
		const store = new SettingsStore(userData, baseDefaults)

		const updated = await store.update({single: {lastSubtitleLanguages: ['en', 'es']}})
		expect(updated.single.lastSubtitleLanguages).toEqual(['en', 'es'])

		const readBack = await store.get()
		expect(readBack.single.lastSubtitleLanguages).toEqual(['en', 'es'])
	})

	it('records launch count so only the second launch is marked welcome-back eligible', async () => {
		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-store-launch-count-'))
		const store = new SettingsStore(userData, baseDefaults)

		const first = await store.recordLaunch()
		expect(first.isFirstRun).toBe(true)
		expect(first.launchCount).toBe(1)
		expect(first.settings.common.firstRunCompleted).toBe(true)

		const second = await store.recordLaunch()
		expect(second.isFirstRun).toBe(false)
		expect(second.launchCount).toBe(2)

		const third = await store.recordLaunch()
		expect(third.isFirstRun).toBe(false)
		expect(third.launchCount).toBe(3)
	})

	it('treats existing installs without launch history as past the welcome-back launch', async () => {
		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-store-existing-launch-count-'))
		await fs.writeFile(path.join(userData, 'settings.json'), JSON.stringify({common: {...baseDefaults.common, firstRunCompleted: true}, single: {}, playlist: {}}), 'utf-8')
		const store = new SettingsStore(userData, baseDefaults)

		const launch = await store.recordLaunch()

		expect(launch.isFirstRun).toBe(false)
		expect(launch.launchCount).toBe(3)
	})

	it('keeps recent jobs bounded and sorted', async () => {
		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'recent-jobs-'))
		const store = new RecentJobsStore(userData)

		await store.push({id: '1', url: 'https://youtu.be/a', outputDir: '/tmp', status: 'completed', finishedAt: '2024-01-01T00:00:00.000Z'})

		await store.push({id: '2', url: 'https://youtu.be/b', outputDir: '/tmp', status: 'failed', finishedAt: '2024-01-02T00:00:00.000Z', error: {kind: 'unknown', raw: 'boom'}})

		const list = await store.list()
		expect(list[0].id).toBe('2')
		expect(list[1].id).toBe('1')
	})

	it('handles concurrent push() calls — push is synchronous so both jobs land without interleaving', async () => {
		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'recent-jobs-concurrent-'))
		const store = new RecentJobsStore(userData)

		await Promise.all([store.push({id: 'job-a', url: 'https://youtu.be/a', outputDir: '/tmp', status: 'completed', finishedAt: '2024-01-01T00:00:00.000Z'}), store.push({id: 'job-b', url: 'https://youtu.be/b', outputDir: '/tmp', status: 'completed', finishedAt: '2024-01-02T00:00:00.000Z'})])

		const list = await store.list()
		expect(list).toHaveLength(2)
		expect(list.map(j => j.id)).toContain('job-a')
		expect(list.map(j => j.id)).toContain('job-b')
	})

	it('returns defaults when settings.json is corrupted', async () => {
		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-store-corrupt-'))
		await fs.writeFile(path.join(userData, 'settings.json'), 'not valid json', 'utf-8')
		const store = new SettingsStore(userData, baseDefaults)

		const settings = await store.get()
		expect(settings.common.defaultOutputDir).toBe('/tmp')
		expect(settings.profiles.active).toEqual({kind: 'builtin', id: 'balanced'})
	})

	it('migrates legacy flat shape to nested on first read', async () => {
		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-store-migrate-'))
		// Pre-seed disk with the legacy flat shape (versions <= 0.0.x).
		await fs.writeFile(
			path.join(userData, 'settings.json'),
			JSON.stringify({defaultOutputDir: '/legacy/dir', rememberLastOutputDir: false, clipboardWatchEnabled: true, lastPreset: 'best-quality', lastSubfolder: 'old-subfolder', lastPlaylistPreset: 'video-1080p', cookiesEnabled: true, cookiesPath: '/legacy/cookies.txt'}),
			'utf-8'
		)

		const store = new SettingsStore(userData, baseDefaults)
		const settings = await store.get()

		expect(settings.common.defaultOutputDir).toBe('/legacy/dir')
		// Legacy `cookiesEnabled: true` + non-empty path migrates to `cookiesMode: 'file'`.
		expect(settings.common.cookiesMode).toBe('file')
		expect((settings.common as unknown as {cookiesEnabled?: boolean}).cookiesEnabled).toBeUndefined()
		expect(settings.single.lastPreset).toBe('best-quality')
		expect(settings.common.lastSubfolder).toBe('old-subfolder')
		// Legacy flat `lastPlaylistPreset` has no mapping in the new schema — dropped on migration.
		expect((settings.playlist as Record<string, unknown>).lastPlaylistPreset).toBeUndefined()

		// After migration the file holds only the nested shape — flat keys gone.
		const persisted = JSON.parse(await fs.readFile(path.join(userData, 'settings.json'), 'utf-8'))
		expect(persisted).not.toHaveProperty('lastPreset')
		expect(persisted).not.toHaveProperty('defaultOutputDir')
		expect(persisted.common).toBeDefined()
		expect(persisted.single).toBeDefined()
		expect(persisted.playlist).toBeDefined()
		expect(persisted.profiles).toBeDefined()
	})

	it('merges download profile patches by bucket', async () => {
		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-profile-patch-'))
		const store = new SettingsStore(userData, baseDefaults)

		const updated = await store.update({profiles: {active: {kind: 'builtin', id: 'audio-only'}}})
		expect(updated.profiles.active).toEqual({kind: 'builtin', id: 'audio-only'})
		expect(updated.profiles.custom).toEqual([])

		const readBack = await store.get()
		expect(readBack.profiles.active).toEqual({kind: 'builtin', id: 'audio-only'})
	})

	it('merges binaryOverrides patches by key — partial patch leaves siblings intact', async () => {
		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-binary-overrides-'))
		const store = new SettingsStore(userData, baseDefaults)

		await store.update({common: {binaryOverrides: {ytDlp: '/usr/local/bin/yt-dlp', ffmpeg: '/usr/local/bin/ffmpeg'}}})
		let read = await store.get()
		expect(read.common.binaryOverrides).toEqual({ytDlp: '/usr/local/bin/yt-dlp', ffmpeg: '/usr/local/bin/ffmpeg'})

		// Patching only ffprobe must not wipe ytDlp + ffmpeg.
		await store.update({common: {binaryOverrides: {ffprobe: '/usr/local/bin/ffprobe'}}})
		read = await store.get()
		expect(read.common.binaryOverrides).toEqual({ytDlp: '/usr/local/bin/yt-dlp', ffmpeg: '/usr/local/bin/ffmpeg', ffprobe: '/usr/local/bin/ffprobe'})

		// Setting one to undefined clears it but leaves others intact.
		await store.update({common: {binaryOverrides: {ytDlp: undefined}}})
		read = await store.get()
		expect(read.common.binaryOverrides?.ytDlp).toBeUndefined()
		expect(read.common.binaryOverrides?.ffmpeg).toBe('/usr/local/bin/ffmpeg')
		expect(read.common.binaryOverrides?.ffprobe).toBe('/usr/local/bin/ffprobe')
	})

	it('returns empty list when recent-jobs.json is corrupted', async () => {
		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'recent-jobs-corrupt-'))
		await fs.writeFile(path.join(userData, 'recent-jobs.json'), 'not valid json', 'utf-8')
		const store = new RecentJobsStore(userData)

		expect(await store.list()).toEqual([])
	})

	it('push() deduplicates by id — re-pushing same id keeps only the latest entry', async () => {
		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'recent-jobs-dedup-'))
		const store = new RecentJobsStore(userData)

		await store.push({id: 'dup', url: 'https://youtu.be/a', outputDir: '/tmp', status: 'failed', finishedAt: '2024-01-01T00:00:00.000Z', error: {kind: 'unknown', raw: 'first'}})
		await store.push({id: 'dup', url: 'https://youtu.be/a', outputDir: '/tmp', status: 'completed', finishedAt: '2024-01-02T00:00:00.000Z'})

		const list = await store.list()
		expect(list).toHaveLength(1)
		expect(list[0].status).toBe('completed')
	})

	it('push() enforces cap=30 — oldest entries evicted when full', async () => {
		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'recent-jobs-cap-'))
		const store = new RecentJobsStore(userData)

		for (let i = 0; i < 32; i++) {
			await store.push({id: `job-${i}`, url: `https://youtu.be/${i}`, outputDir: '/tmp', status: 'completed', finishedAt: new Date(i * 1000).toISOString()})
		}

		const list = await store.list()
		expect(list).toHaveLength(30)
		// The most-recent 30 survive; the two oldest (job-0, job-1) are gone.
		expect(list.some(j => j.id === 'job-0')).toBe(false)
		expect(list.some(j => j.id === 'job-1')).toBe(false)
		expect(list.some(j => j.id === 'job-31')).toBe(true)
	})

	it('push() migrates beta-shape error { key, rawMessage } → { kind, raw } on read', async () => {
		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'recent-jobs-migrate-'))
		await fs.writeFile(path.join(userData, 'recent-jobs.json'), JSON.stringify({jobs: [{id: 'beta-job', url: 'https://youtu.be/x', outputDir: '/tmp', status: 'failed', finishedAt: '2024-01-01T00:00:00.000Z', error: {key: 'botBlock', rawMessage: 'Sign in to confirm'}}]}), 'utf-8')

		const store = new RecentJobsStore(userData)
		const list = await store.list()

		expect(list).toHaveLength(1)
		expect(list[0].error).toEqual({kind: 'botBlock', raw: 'Sign in to confirm'})
	})
})
