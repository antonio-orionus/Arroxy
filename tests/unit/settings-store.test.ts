import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {describe, expect, it, vi} from 'vite-plus/test'
import {RecentJobsStore} from '@main/stores/RecentJobsStore.js'
import {SettingsStore} from '@main/stores/SettingsStore.js'
import {DEFAULTS, defaultAppSettings} from '@shared/constants.js'
import {BUILTIN_DOWNLOAD_PROFILES} from '@shared/downloadProfiles.js'
import {appSettingsSchema, UI_STYLES, updateSettingsSchema} from '@shared/schemas.js'
import type {AppSettings} from '@shared/types.js'
import {z} from 'zod'

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false
type Assert<T extends true> = T
const appSettingsSchemaMatchesType: Assert<Equal<z.infer<typeof appSettingsSchema>, AppSettings>> = true

describe('settings and recent stores', () => {
	const baseDefaults = defaultAppSettings('/tmp')
	const NOW = '2026-06-10T12:00:00.000Z'

	it('persists settings updates', async () => {
		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-store-'))
		const store = new SettingsStore(userData, baseDefaults)

		const updated = await store.update({common: {defaultOutputDir: '/home/test/downloads'}})
		expect(updated.common.defaultOutputDir).toBe('/home/test/downloads')

		const readBack = await store.get()
		expect(readBack.common.defaultOutputDir).toBe('/home/test/downloads')
	})

	it('records the heartbeat day internally and keeps no install identifier', async () => {
		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-store-heartbeat-'))
		await fs.writeFile(path.join(userData, 'settings.json'), JSON.stringify({...baseDefaults, common: {...baseDefaults.common, installId: 'legacy-install-id'}}), 'utf-8')
		const store = new SettingsStore(userData, baseDefaults)
		expect(store.getSync().common).not.toHaveProperty('installId')

		await store.recordHeartbeatDay('2026-10-16')
		expect(new SettingsStore(userData, baseDefaults).getSync().common.lastHeartbeatDay).toBe('2026-10-16')
		expect(updateSettingsSchema.safeParse({common: {lastHeartbeatDay: '2026-10-17'}}).success).toBe(false)
	})

	it('keeps the user settings when the stored heartbeat day is malformed', async () => {
		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-store-heartbeat-bad-'))
		await fs.writeFile(path.join(userData, 'settings.json'), JSON.stringify({...baseDefaults, common: {...baseDefaults.common, defaultOutputDir: '/persisted/downloads', lastHeartbeatDay: 'not-a-date'}}), 'utf-8')
		expect(new SettingsStore(userData, baseDefaults).getSync().common.defaultOutputDir).toBe('/persisted/downloads')
	})

	it('validates the Explore user-agent token on write only', async () => {
		for (const bad of ['Gecko/20100101', 'Mozilla/5.0 (X11) Gecko/20100101 Firefox/140.0', 'x'.repeat(65) + '/1']) expect(updateSettingsSchema.safeParse({common: {exploreUserAgent: bad}}).success).toBe(false)
		expect(updateSettingsSchema.safeParse({common: {exploreUserAgent: 'Desktop/2.0'}}).success).toBe(true)

		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-store-explore-ua-'))
		const store = new SettingsStore(userData, baseDefaults)
		const updated = await store.update({common: {exploreUserAgent: 'Desktop/2.0'}})
		expect(updated.common.exploreUserAgent).toBe('Desktop/2.0')
	})

	it('keeps every other common setting when a stored Explore user-agent token is no longer valid', async () => {
		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-store-explore-ua-stored-'))
		await fs.writeFile(path.join(userData, 'settings.json'), JSON.stringify({common: {...baseDefaults.common, exploreUserAgent: 'Gecko/1', defaultOutputDir: '/home/test/keep', hotkeyEnabled: false}, playlist: baseDefaults.playlist, profiles: baseDefaults.profiles}))
		const store = new SettingsStore(userData, baseDefaults)

		const loaded = await store.get()
		expect(loaded.common).toMatchObject({defaultOutputDir: '/home/test/keep', hotkeyEnabled: false, exploreUserAgent: 'Gecko/1'})
	})

	it('persists the Explore notice and mode-nudge flags', async () => {
		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-store-explore-flags-'))
		const store = new SettingsStore(userData, baseDefaults)
		expect(updateSettingsSchema.safeParse({common: {exploreModeNudgeDismissedFor: 'bogus'}}).success).toBe(false)

		const updated = await store.update({common: {exploreNoticeSeen: true, exploreModeAutoSwitched: true, exploreModeNudgeDismissedFor: 'browser'}})
		expect(updated.common).toMatchObject({exploreNoticeSeen: true, exploreModeAutoSwitched: true, exploreModeNudgeDismissedFor: 'browser'})
		expect((await new SettingsStore(userData, baseDefaults).get()).common).toMatchObject({exploreNoticeSeen: true, exploreModeAutoSwitched: true, exploreModeNudgeDismissedFor: 'browser'})
	})

	it('leaves the Explore ad blocker setting unset (unset means on) and persists an explicit choice', async () => {
		expect(baseDefaults.common.exploreAdBlock).toBeUndefined()
		expect(updateSettingsSchema.safeParse({common: {exploreAdBlock: 'yes'}}).success).toBe(false)

		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-store-explore-adblock-'))
		const store = new SettingsStore(userData, baseDefaults)
		expect((await store.update({common: {exploreAdBlock: true}})).common.exploreAdBlock).toBe(true)
		expect((await new SettingsStore(userData, baseDefaults).get()).common.exploreAdBlock).toBe(true)
		expect((await store.update({common: {exploreAdBlock: false}})).common.exploreAdBlock).toBe(false)
		expect((await new SettingsStore(userData, baseDefaults).get()).common.exploreAdBlock).toBe(false)
	})

	it('leaves the Explore search engine unset (unset means DuckDuckGo) and persists a choice', async () => {
		expect(baseDefaults.common.exploreSearchEngine).toBeUndefined()

		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-store-explore-search-'))
		const store = new SettingsStore(userData, baseDefaults)
		expect((await store.update({common: {exploreSearchEngine: 'brave'}})).common.exploreSearchEngine).toBe('brave')
		expect((await new SettingsStore(userData, baseDefaults).get()).common.exploreSearchEngine).toBe('brave')
	})

	it('defaults and persists the style', async () => {
		expect(baseDefaults.common.uiStyle).toBe(DEFAULTS.uiStyle)

		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-store-style-'))
		const store = new SettingsStore(userData, baseDefaults)
		const other = UI_STYLES.find(style => style !== DEFAULTS.uiStyle)
		if (!other) throw new Error('expected a second style')

		const updated = await store.update({common: {uiStyle: other}})
		expect(updated.common.uiStyle).toBe(other)

		const readBack = await store.get()
		expect(readBack.common.uiStyle).toBe(other)
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

	it('defaults, validates, and persists global hotkey settings', async () => {
		expect(baseDefaults.common.hotkeyEnabled).toBe(true)
		expect(baseDefaults.common.hotkeyAccelerator).toBe('CommandOrControl+Shift+D')
		expect(updateSettingsSchema.safeParse({common: {hotkeyAccelerator: 'CommandOrControl+Alt+H'}}).success).toBe(true)
		expect(updateSettingsSchema.safeParse({common: {hotkeyAccelerator: 'Not A Chord'}}).success).toBe(false)

		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-store-hotkey-'))
		const store = new SettingsStore(userData, baseDefaults)

		const updated = await store.update({common: {hotkeyEnabled: false, hotkeyAccelerator: 'CommandOrControl+Alt+H'}})
		expect(updated.common.hotkeyEnabled).toBe(false)
		expect(updated.common.hotkeyAccelerator).toBe('CommandOrControl+Alt+H')

		const readBack = await store.get()
		expect(readBack.common.hotkeyEnabled).toBe(false)
		expect(readBack.common.hotkeyAccelerator).toBe('CommandOrControl+Alt+H')
	})

	it('drops the retired single-video section from an existing settings file', async () => {
		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-store-single-'))
		const settingsPath = path.join(userData, 'settings.json')
		await fs.writeFile(settingsPath, JSON.stringify({...baseDefaults, single: {lastPreset: 'best-quality', lastSubtitleLanguages: ['en']}}), 'utf-8')

		const settings = await new SettingsStore(userData, baseDefaults).get()

		expect(settings).not.toHaveProperty('single')
		expect(JSON.parse(await fs.readFile(settingsPath, 'utf-8'))).not.toHaveProperty('single')
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
		await fs.writeFile(path.join(userData, 'settings.json'), JSON.stringify({common: {...baseDefaults.common, firstRunCompleted: true}, playlist: {}}), 'utf-8')
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

	it('loads and validates a current nested settings shape', async () => {
		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-store-current-shape-'))
		await fs.writeFile(path.join(userData, 'settings.json'), JSON.stringify({...baseDefaults, common: {...baseDefaults.common, defaultOutputDir: '/persisted/downloads'}}), 'utf-8')

		const store = new SettingsStore(userData, baseDefaults)

		expect((await store.get()).common.defaultOutputDir).toBe('/persisted/downloads')
	})

	it('keeps valid settings sections when the common section is malformed', async () => {
		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-store-invalid-section-'))
		await fs.writeFile(path.join(userData, 'settings.json'), JSON.stringify({...baseDefaults, common: {...baseDefaults.common, defaultOutputDir: 42, language: 'fr'}, profiles: {...baseDefaults.profiles, active: {kind: 'builtin', id: 'audio-only'}}}), 'utf-8')

		const store = new SettingsStore(userData, baseDefaults)
		const settings = await store.get()

		expect(settings.common.defaultOutputDir).toBe('/tmp')
		expect(settings.common.language).toBeUndefined()
		expect(settings.profiles.active).toEqual({kind: 'builtin', id: 'audio-only'})
	})

	it('preserves current cookies mode and preferences when the legacy flag is malformed', async () => {
		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-store-cookies-mode-'))
		const settingsPath = path.join(userData, 'settings.json')
		await fs.writeFile(settingsPath, JSON.stringify({...baseDefaults, common: {...baseDefaults.common, defaultOutputDir: '/persisted/downloads', language: 'fr', cookiesMode: 'file', cookiesEnabled: 'true'}}), 'utf-8')

		const store = new SettingsStore(userData, baseDefaults)
		const settings = await store.get()

		expect(settings.common.defaultOutputDir).toBe('/persisted/downloads')
		expect(settings.common.language).toBe('fr')
		expect(settings.common.cookiesMode).toBe('file')
		expect((settings.common as unknown as {cookiesEnabled?: string}).cookiesEnabled).toBeUndefined()

		const persisted = JSON.parse(await fs.readFile(settingsPath, 'utf-8'))
		expect(persisted.common.defaultOutputDir).toBe('/persisted/downloads')
		expect(persisted.common.language).toBe('fr')
		expect(persisted.common.cookiesMode).toBe('file')
		expect(persisted.common).not.toHaveProperty('cookiesEnabled')

		const marker = new Date('2000-01-01T00:00:00.000Z')
		await fs.utimes(settingsPath, marker, marker)
		new SettingsStore(userData, baseDefaults)
		expect((await fs.stat(settingsPath)).mtimeMs).toBe(marker.getTime())
	})

	it('defaults cookies mode to off while preserving preferences when the legacy flag is malformed', async () => {
		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-store-cookies-mode-legacy-'))
		await fs.writeFile(path.join(userData, 'settings.json'), JSON.stringify({...baseDefaults, common: {...baseDefaults.common, defaultOutputDir: '/persisted/downloads', language: 'fr', cookiesEnabled: 'true'}}), 'utf-8')

		const store = new SettingsStore(userData, baseDefaults)
		const settings = await store.get()

		expect(settings.common.defaultOutputDir).toBe('/persisted/downloads')
		expect(settings.common.language).toBe('fr')
		expect(settings.common.cookiesMode).toBe('off')

		const persisted = JSON.parse(await fs.readFile(path.join(userData, 'settings.json'), 'utf-8'))
		expect(persisted.common.cookiesMode).toBe('off')
		expect(persisted.common).not.toHaveProperty('cookiesEnabled')
	})

	it('does not rewrite a stable settings file on the next boot', async () => {
		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-store-no-rewrite-'))
		const firstStore = new SettingsStore(userData, baseDefaults)
		await firstStore.get()
		const settingsPath = path.join(userData, 'settings.json')
		const marker = new Date('2000-01-01T00:00:00.000Z')
		await fs.utimes(settingsPath, marker, marker)

		new SettingsStore(userData, baseDefaults)

		expect((await fs.stat(settingsPath)).mtimeMs).toBe(marker.getTime())
	})

	it('keeps previous settings when post-merge validation rejects an update or launch', async () => {
		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-store-post-merge-validation-'))
		const store = new SettingsStore(userData, baseDefaults)
		const before = await store.get()
		const rejected = {success: false, error: {issues: [{message: 'forced schema failure'}]}}
		const safeParseSpy = vi
			.spyOn(appSettingsSchema, 'safeParse')
			.mockReturnValueOnce(rejected as never)
			.mockReturnValueOnce(rejected as never)

		await expect(store.update({common: {defaultOutputDir: '/should-not-persist'}})).resolves.toEqual(before)
		await expect(store.recordLaunch()).resolves.toEqual({settings: before, isFirstRun: true, launchCount: 0})

		safeParseSpy.mockRestore()
	})

	it('keeps the persisted AppSettings interface in exact schema parity', () => {
		expect(appSettingsSchemaMatchesType).toBe(true)
	})

	it('falls back to defaults when a recognized legacy setting has the wrong primitive type', async () => {
		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-store-invalid-legacy-'))
		await fs.writeFile(path.join(userData, 'settings.json'), JSON.stringify({defaultOutputDir: 42, rememberLastOutputDir: true, clipboardWatchEnabled: true, hotkeyEnabled: false}), 'utf-8')

		const store = new SettingsStore(userData, baseDefaults)

		expect((await store.get()).common.defaultOutputDir).toBe('/tmp')
	})

	it('falls back to defaults when a nested current setting is malformed', async () => {
		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-store-invalid-nested-'))
		await fs.writeFile(path.join(userData, 'settings.json'), JSON.stringify({...baseDefaults, common: {...baseDefaults.common, defaultOutputDir: 42}}), 'utf-8')

		const store = new SettingsStore(userData, baseDefaults)

		expect((await store.get()).common.defaultOutputDir).toBe('/tmp')
	})

	it('backfills newly introduced defaults when the persisted common object is partial', async () => {
		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-store-partial-common-'))
		await fs.writeFile(path.join(userData, 'settings.json'), JSON.stringify({common: {defaultOutputDir: '/persisted/downloads', rememberLastOutputDir: true, clipboardWatchEnabled: true, hotkeyEnabled: false}, playlist: {}, profiles: baseDefaults.profiles}), 'utf-8')

		const store = new SettingsStore(userData, baseDefaults)
		const settings = await store.get()

		expect(settings.common.defaultOutputDir).toBe('/persisted/downloads')
		expect(settings.common.uiStyle).toBe(DEFAULTS.uiStyle)
		expect(settings.common.nativeAudioPreference).toBe('compatible')
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
		expect(settings.common.lastSubfolder).toBe('old-subfolder')
		// Legacy flat `lastPlaylistPreset` has no mapping in the new schema — dropped on migration.
		expect((settings.playlist as Record<string, unknown>).lastPlaylistPreset).toBeUndefined()

		// After migration the file holds only the nested shape — flat keys gone.
		const persisted = JSON.parse(await fs.readFile(path.join(userData, 'settings.json'), 'utf-8'))
		expect(persisted).not.toHaveProperty('lastPreset')
		expect(persisted).not.toHaveProperty('defaultOutputDir')
		expect(persisted.common).toBeDefined()
		expect(persisted).not.toHaveProperty('single')
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

	it('migrates profile overrides saved before filename templates existed', async () => {
		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-profile-filename-migrate-'))
		const balanced = BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'balanced')
		expect(balanced).toBeDefined()
		const {filename: _filename, ...legacyOverride} = balanced!
		await fs.writeFile(path.join(userData, 'settings.json'), JSON.stringify({...baseDefaults, profiles: {active: {kind: 'builtin', id: 'balanced'}, custom: [], overrides: [legacyOverride]}}), 'utf-8')

		const store = new SettingsStore(userData, baseDefaults)
		const settings = await store.get()

		expect(settings.profiles.overrides[0]?.filename).toEqual({kind: 'default'})

		const reloadedStore = new SettingsStore(userData, baseDefaults)
		const reloaded = await reloadedStore.get()
		expect(reloaded.profiles.overrides[0]?.filename).toEqual({kind: 'default'})
	})

	it('reads profiles saved with a codec and a tiers list into goal, tier and file type', async () => {
		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-profile-goal-migrate-'))
		const base = BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'balanced')!
		const legacy = (id: string, media: unknown) => ({...base, id, name: id, media, createdAt: NOW, updatedAt: NOW})
		const custom = [
			legacy('old-smart-tv', {kind: 'video-audio', codec: 'mp4', tiers: ['720'], audio: {format: 'm4a'}}),
			legacy('old-native', {kind: 'video-audio', codec: 'best', tiers: ['1440'], audio: {format: 'best'}}),
			legacy('old-native-aac', {kind: 'video-audio', codec: 'best', tiers: ['1080'], audio: {format: 'm4a'}}),
			legacy('old-video-only', {kind: 'video-only', codec: 'mp4', tiers: ['480']}),
			legacy('old-audio', {kind: 'audio-only', audio: {format: 'mp3', bitrateKbps: 192}})
		]
		await fs.writeFile(path.join(userData, 'settings.json'), JSON.stringify({...baseDefaults, profiles: {active: {kind: 'custom', id: 'old-smart-tv'}, custom, overrides: [legacy('balanced', {kind: 'video-audio', codec: 'best', tiers: ['720'], audio: {format: 'best'}})]}}), 'utf-8')

		const settings = await new SettingsStore(userData, baseDefaults).get()
		const media = Object.fromEntries(settings.profiles.custom.map(profile => [profile.id, profile.media]))

		expect(settings.profiles.custom).toHaveLength(5)
		expect(settings.profiles.active).toEqual({kind: 'custom', id: 'old-smart-tv'})
		expect(media['old-smart-tv']).toEqual({kind: 'video-audio', goal: 'smart-tv', tier: '720', fileType: 'auto', audio: {native: {kind: 'default'}}})
		expect(media['old-native']).toEqual({kind: 'video-audio', goal: 'best-picture', tier: '1440', fileType: 'auto', audio: {native: {kind: 'default'}}})
		expect(media['old-native-aac']).toEqual({kind: 'video-audio', goal: 'best-picture', tier: '1080', fileType: 'mp4', audio: {native: {kind: 'default'}}})
		expect(media['old-video-only']).toEqual({kind: 'video-only', goal: 'smart-tv', tier: '480', fileType: 'auto'})
		expect(media['old-audio']).toEqual({kind: 'audio-only', audio: {format: 'mp3', bitrateKbps: 192}})
		expect(settings.profiles.overrides[0]?.media).toMatchObject({goal: 'best-picture', tier: '720'})
	})

	describe('HDR preference for installs that already have settings', () => {
		const savedWithoutIt = (extra: Record<string, unknown> = {}) => {
			const {hdrPreference: _drop, ...common} = baseDefaults.common
			return JSON.stringify({...baseDefaults, common: {...common, ...extra}})
		}

		it('a fresh install starts on Auto', async () => {
			const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-hdr-fresh-'))

			const store = new SettingsStore(userData, baseDefaults)

			expect(store.getSync().common.hdrPreference).toBe('auto')
		})

		it('an install saved before the setting existed keeps HDR first, so no download changes', async () => {
			const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-hdr-existing-'))
			await fs.writeFile(path.join(userData, 'settings.json'), savedWithoutIt(), 'utf-8')

			const store = new SettingsStore(userData, baseDefaults)

			expect(store.getSync().common.hdrPreference).toBe('hdr')
			expect(JSON.parse(await fs.readFile(path.join(userData, 'settings.json'), 'utf-8')).common.hdrPreference).toBe('hdr')
		})

		it('a user who turned it off is not flipped back on the next launch', async () => {
			const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-hdr-off-'))
			await fs.writeFile(path.join(userData, 'settings.json'), savedWithoutIt(), 'utf-8')
			const first = new SettingsStore(userData, baseDefaults)
			await first.update({common: {hdrPreference: 'sdr'}})

			const second = new SettingsStore(userData, baseDefaults)

			expect(second.getSync().common.hdrPreference).toBe('sdr')
		})

		it('keeps a saved choice as it is', async () => {
			const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-hdr-saved-'))
			await fs.writeFile(path.join(userData, 'settings.json'), savedWithoutIt({hdrPreference: 'sdr'}), 'utf-8')

			expect(new SettingsStore(userData, baseDefaults).getSync().common.hdrPreference).toBe('sdr')
		})
	})

	describe('backup before profiles are converted', () => {
		const legacyMedia = {kind: 'video-audio', codec: 'mp4', tiers: ['720'], audio: {format: 'm4a'}}
		const BACKUP = 'settings.before-selection-order.json'

		async function writeSettings(userData: string, media: unknown): Promise<string> {
			const base = BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'balanced')!
			const text = JSON.stringify({...baseDefaults, profiles: {active: {kind: 'custom', id: 'mine'}, custom: [{...base, id: 'mine', name: 'Mine', media, createdAt: NOW, updatedAt: NOW}], overrides: []}})
			await fs.writeFile(path.join(userData, 'settings.json'), text, 'utf-8')
			return text
		}

		it('keeps the settings file as it was before rewriting old-shape profiles', async () => {
			const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-profile-backup-'))
			const original = await writeSettings(userData, legacyMedia)

			const store = new SettingsStore(userData, baseDefaults)

			expect(store.getSync().profiles.custom[0]?.media).toMatchObject({goal: 'smart-tv', tier: '720'})
			expect(await fs.readFile(path.join(userData, BACKUP), 'utf-8')).toBe(original)
			expect(await fs.readFile(path.join(userData, 'settings.json'), 'utf-8')).not.toContain('"codec"')
		})

		it('backs up the original bytes, not the file with defaults merged in', async () => {
			const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-profile-backup-bytes-'))
			const base = BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'balanced')!
			const original = JSON.stringify({profiles: {active: {kind: 'custom', id: 'mine'}, custom: [{...base, id: 'mine', name: 'Mine', media: legacyMedia, createdAt: NOW, updatedAt: NOW}], overrides: []}})
			await fs.writeFile(path.join(userData, 'settings.json'), original, 'utf-8')

			new SettingsStore(userData, baseDefaults)

			expect(await fs.readFile(path.join(userData, BACKUP), 'utf-8')).toBe(original)
		})

		it('never overwrites an earlier backup', async () => {
			const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-profile-backup-keep-'))
			await fs.writeFile(path.join(userData, BACKUP), 'first backup', 'utf-8')
			await writeSettings(userData, legacyMedia)

			new SettingsStore(userData, baseDefaults)

			expect(await fs.readFile(path.join(userData, BACKUP), 'utf-8')).toBe('first backup')
		})

		it('makes no backup when every profile is already in the new shape', async () => {
			const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-profile-backup-none-'))
			await writeSettings(userData, {kind: 'video-audio', goal: 'best-picture', tier: '720', fileType: 'auto', audio: {native: {kind: 'default'}}})

			new SettingsStore(userData, baseDefaults)

			await expect(fs.access(path.join(userData, BACKUP))).rejects.toThrow()
		})

		it('makes a second backup of nothing: a store opened again after the conversion leaves the first one alone', async () => {
			const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-profile-backup-twice-'))
			const original = await writeSettings(userData, legacyMedia)
			new SettingsStore(userData, baseDefaults)

			new SettingsStore(userData, baseDefaults)

			expect(await fs.readFile(path.join(userData, BACKUP), 'utf-8')).toBe(original)
		})
	})

	// One unparseable profile must not cost the user every other profile they
	// built. Whole-object validation would reset the entire bucket, including
	// the active selection, with nothing on disk or in the log to explain it.
	it('drops only the invalid profile and keeps the rest of the bucket', async () => {
		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-profile-partial-'))
		const balanced = BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'balanced')!
		const good = {...balanced, id: 'keep-me', name: 'Keep me', createdAt: NOW, updatedAt: NOW}
		const broken = {...balanced, id: 'drop-me', media: {kind: 'nonsense'}}
		const override = {...balanced, subfolder: {enabled: false, name: 'Balanced 720p'}}
		await fs.writeFile(path.join(userData, 'settings.json'), JSON.stringify({...baseDefaults, profiles: {active: {kind: 'custom', id: 'keep-me'}, custom: [good, broken], overrides: [override]}}), 'utf-8')

		const settings = await new SettingsStore(userData, baseDefaults).get()

		expect(settings.profiles.custom.map(profile => profile.id)).toEqual(['keep-me'])
		expect(settings.profiles.overrides).toHaveLength(1)
		expect(settings.profiles.overrides[0]?.subfolder.enabled).toBe(false)
		expect(settings.profiles.active).toEqual({kind: 'custom', id: 'keep-me'})
	})

	it('falls back to the default profile when the active custom profile is dropped', async () => {
		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-profile-dangling-'))
		const balanced = BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'balanced')!
		const broken = {...balanced, id: 'gone', name: ''}
		await fs.writeFile(path.join(userData, 'settings.json'), JSON.stringify({...baseDefaults, profiles: {active: {kind: 'custom', id: 'gone'}, custom: [broken], overrides: []}}), 'utf-8')

		const settings = await new SettingsStore(userData, baseDefaults).get()

		expect(settings.profiles.custom).toEqual([])
		expect(settings.profiles.active).toEqual({kind: 'builtin', id: 'balanced'})
	})

	it('persists built-in visibility overrides and prunes invalid keys', async () => {
		const userData = await fs.mkdtemp(path.join(os.tmpdir(), 'settings-profile-enabled-'))
		await fs.writeFile(path.join(userData, 'settings.json'), JSON.stringify({...baseDefaults, profiles: {active: {kind: 'builtin', id: 'balanced'}, custom: [], overrides: [], enabledOverrides: {'low-240': true, 'not-a-profile': true, balanced: 'yes'}}}), 'utf-8')

		const settings = await new SettingsStore(userData, baseDefaults).get()
		expect(settings.profiles.enabledOverrides).toEqual({'low-240': true})

		const store = new SettingsStore(userData, baseDefaults)
		const updated = await store.update({profiles: {enabledOverrides: {'low-144': true}}})
		expect(updated.profiles.enabledOverrides).toEqual({'low-144': true})
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
