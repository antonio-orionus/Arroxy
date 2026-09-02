import {randomUUID} from 'node:crypto'
import Store from 'electron-store'
import log from 'electron-log/main.js'
import type {ZodError} from 'zod'
import type {AppSettings, CommonSettings, DownloadProfile, DownloadProfileRef, DownloadProfilesPrefs, SinglePrefs} from '@shared/types.js'
import type {SettingsPatch} from '@shared/api.js'
import {DEFAULT_DOWNLOAD_PROFILE_REF} from '@shared/downloadProfiles.js'
import {downloadProfileRefSchema, downloadProfileSchema} from '@shared/schemas.js'

export type {SettingsPatch}

const logger = log.scope('settings')

const COMMON_FLAT_KEYS = [
	'defaultOutputDir',
	'rememberLastOutputDir',
	'uiZoom',
	'uiTheme',
	'backdropRenderMode',
	'language',
	'commonPaths',
	'cookiesPath',
	'cookiesMode',
	'cookiesBrowser',
	'proxyUrl',
	'nativeAudioPreference',
	'limitRate',
	'playlistProbeLimit',
	'networkPacingPreset',
	'pacingSleepRequests',
	'pacingSleepInterval',
	'pacingMaxSleepInterval',
	'pacingSleepSubtitles',
	'downloadConnections',
	'concurrentDownloads',
	'autoRetryAttempts',
	'clipboardWatchEnabled',
	'hotkeyEnabled',
	'hotkeyAccelerator',
	'filenameTemplate',
	'closeBehavior',
	'embedChapters',
	'embedMetadata',
	'embedThumbnail',
	'writeDescription',
	'writeThumbnail',
	'lastSponsorBlockMode',
	'lastSponsorBlockCategories',
	'analyticsEnabled',
	'firstRunCompleted',
	'launchCount',
	'installId',
	'lastSubfolderEnabled',
	'lastSubfolder'
] as const

// Legacy keys retained only so the flat-to-nested migration can pick them up
// from old settings files. The values are normalized in `migrateCookiesMode`
// and the legacy keys are stripped from the persisted shape.
const LEGACY_COMMON_FLAT_KEYS = ['cookiesEnabled'] as const

const SINGLE_FLAT_KEYS = ['lastPreset', 'lastVideoResolution', 'lastSubtitleLanguages', 'lastSubtitleMode', 'lastSubtitleFormat'] as const

const PLAYLIST_FLAT_KEYS = [] as const

function pickKeys<K extends string>(src: Record<string, unknown>, keys: readonly K[]): Partial<Record<K, unknown>> {
	const out: Partial<Record<K, unknown>> = {}
	for (const k of keys) {
		if (k in src && src[k] !== undefined) out[k] = src[k]
	}
	return out
}

function isLegacyShape(raw: Record<string, unknown>): boolean {
	// electron-store always seeds defaults into store.store, so `common` is
	// present even on a fresh install. The signal of legacy data is the
	// presence of any flat key — those only appear if the on-disk file came
	// from a pre-nested version.
	return COMMON_FLAT_KEYS.some(k => k in raw) || LEGACY_COMMON_FLAT_KEYS.some(k => k in raw) || SINGLE_FLAT_KEYS.some(k => k in raw) || PLAYLIST_FLAT_KEYS.some(k => k in raw)
}

function migrateFlatToNested(raw: Record<string, unknown>, defaults: AppSettings): AppSettings {
	const picked = {...pickKeys(raw, COMMON_FLAT_KEYS), ...pickKeys(raw, LEGACY_COMMON_FLAT_KEYS)}
	const common = {...defaults.common, ...picked} as CommonSettings & {cookiesEnabled?: boolean}
	const single = {...defaults.single, ...pickKeys(raw, SINGLE_FLAT_KEYS)} as SinglePrefs
	const playlist = {...defaults.playlist, ...pickKeys(raw, PLAYLIST_FLAT_KEYS)}
	return {common, single, playlist, profiles: defaults.profiles}
}

// Normalize the cookies setting from the pre-radio shape (`cookiesEnabled`
// boolean) to the tri-state `cookiesMode`. Idempotent — a no-op once
// `cookiesMode` is set, regardless of any leftover legacy fields.
function migrateCookiesMode(common: CommonSettings): CommonSettings {
	const legacy = common as CommonSettings & {cookiesEnabled?: boolean}
	if (legacy.cookiesMode !== undefined) {
		if (legacy.cookiesEnabled === undefined) return common
		const {cookiesEnabled: _drop, ...rest} = legacy
		return rest
	}
	const enabled = legacy.cookiesEnabled === true
	const hasPath = typeof legacy.cookiesPath === 'string' && legacy.cookiesPath.length > 0
	const mode = enabled && hasPath ? 'file' : 'off'
	const {cookiesEnabled: _drop, ...rest} = legacy
	return {...rest, cookiesMode: mode}
}

function mergeCommon(base: CommonSettings, patch: Partial<CommonSettings> | undefined): CommonSettings {
	if (!patch) return base
	// binaryOverrides is the one nested object inside common — patch fields must
	// merge by key instead of replacing the whole map. Without this, setting a
	// single binary path would wipe the others.
	const binaryOverrides = patch.binaryOverrides ? {...(base.binaryOverrides ?? {}), ...patch.binaryOverrides} : base.binaryOverrides
	return {...base, ...patch, binaryOverrides}
}

function deepMerge(base: AppSettings, patch: SettingsPatch, defaults: AppSettings): AppSettings {
	const profileSource = base.profiles ?? defaults.profiles
	const baseProfiles = {...profileSource, overrides: profileSource.overrides ?? []}
	return {common: mergeCommon(base.common, patch.common), single: {...base.single, ...(patch.single ?? {})}, playlist: {...base.playlist, ...(patch.playlist ?? {})}, profiles: {...baseProfiles, ...(patch.profiles ?? {})}}
}

function profileIdOf(value: unknown): string | null {
	if (typeof value !== 'object' || value === null) return null
	const id = (value as {id?: unknown}).id
	return typeof id === 'string' ? id : null
}

function issuePaths(error: ZodError): string[] {
	return error.issues.map(issue => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
}

function parseProfileList(value: unknown, bucket: 'custom' | 'overrides'): DownloadProfile[] {
	if (!Array.isArray(value)) {
		if (value !== undefined) logger.warn('Discarded download profile bucket that is not an array', {bucket, type: typeof value})
		return []
	}
	return value.flatMap((item, index) => {
		const parsed = downloadProfileSchema.safeParse(item)
		if (parsed.success) return [parsed.data]
		logger.warn('Dropped invalid download profile', {bucket, index, id: profileIdOf(item), issues: issuePaths(parsed.error)})
		return []
	})
}

/**
 * Validate persisted download profiles one entry at a time.
 *
 * A whole-object parse is all-or-nothing: a single unparseable profile — one
 * written by a newer build, or hand-edited — would silently discard every other
 * profile plus the active selection. Dropping only the offending entry keeps the
 * rest, and the warn lines name what was lost and why.
 *
 * Schema defaults are what repair a profile persisted before a field existed
 * (`filename` on any profile saved before 0.4.5), so parsing here is also the
 * migration.
 */
function normalizePersistedProfiles(source: DownloadProfilesPrefs | undefined): DownloadProfilesPrefs {
	const custom = parseProfileList(source?.custom, 'custom')
	const overrides = parseProfileList(source?.overrides, 'overrides')
	const parsedActive = downloadProfileRefSchema.safeParse(source?.active)
	if (!parsedActive.success) {
		if (source?.active !== undefined) logger.warn('Reset unreadable active download profile reference', {issues: issuePaths(parsedActive.error)})
		return {active: DEFAULT_DOWNLOAD_PROFILE_REF, custom, overrides}
	}
	const active: DownloadProfileRef = parsedActive.data
	// A dangling custom reference resolves to the default profile at read time
	// anyway; resetting it here keeps disk and UI telling the same story.
	if (active.kind === 'custom' && !custom.some(profile => profile.id === active.id)) {
		logger.warn('Active download profile no longer exists — falling back to the default', {id: active.id})
		return {active: DEFAULT_DOWNLOAD_PROFILE_REF, custom, overrides}
	}
	return {active, custom, overrides}
}

export class SettingsStore {
	// electron-store types are pinned to AppSettings, but the on-disk file may
	// hold the legacy flat shape until the first read. Cast at the boundary.
	private readonly store: Store<AppSettings>
	private readonly defaults: AppSettings

	constructor(userDataPath: string, defaults: AppSettings) {
		this.store = new Store<AppSettings>({name: 'settings', cwd: userDataPath, defaults, clearInvalidConfig: true})
		this.defaults = defaults
		this.maybeMigrate()
		this.ensureInstallId()
		this.logProfileSummary()
	}

	// Guarantee a per-install UUID for telemetry (OpenPanel `profileId`).
	// electron-store's `defaults` is shallow-merged at the top level, so an
	// existing user whose on-disk `common` predates this field would never
	// receive the default. Stamp lazily here after migration.
	private ensureInstallId(): void {
		const current = this.store.store
		if (current.common.installId) return
		const next: AppSettings = {...current, common: {...current.common, installId: randomUUID()}}
		this.store.set(next)
	}

	private maybeMigrate(): void {
		const raw = this.store.store as unknown as Record<string, unknown>
		const isLegacy = isLegacyShape(raw)
		const baseline: AppSettings = isLegacy ? migrateFlatToNested(raw, this.defaults) : this.store.store
		const profileSource = baseline.profiles ?? this.defaults.profiles
		const profiles = normalizePersistedProfiles(profileSource)
		const profilesMigrated = JSON.stringify(profiles) !== JSON.stringify(profileSource)
		const withDefaults: AppSettings = {...baseline, profiles}
		const cookiesMigrated: AppSettings = {...withDefaults, common: migrateCookiesMode(withDefaults.common)}
		const cookiesMigratedShape = cookiesMigrated.common !== withDefaults.common
		if (!isLegacy && !profilesMigrated && !cookiesMigratedShape) return
		logger.info('Settings migrated', {legacyFlatShape: isLegacy, profilesNormalized: profilesMigrated, cookiesModeMigrated: cookiesMigratedShape})
		// Replace the entire on-disk shape with the migrated one. Wiping any
		// legacy flat keys first prevents both shapes from coexisting on disk.
		this.store.clear()
		this.store.set(cookiesMigrated)
	}

	// Startup snapshot of the settings that shape a download but never appear in
	// any later log line. A profile override is invisible in the job logs, so a
	// bug that only reproduces under a customized profile is otherwise
	// undiagnosable from a user's main.log. Ids and counts only — no paths,
	// templates, or install identifiers.
	private logProfileSummary(): void {
		const {common} = this.store.store
		const profiles = this.store.store.profiles ?? this.defaults.profiles
		logger.info('Settings loaded', {
			activeProfile: profiles.active,
			customProfiles: profiles.custom.map(profile => profile.id),
			overriddenBuiltins: profiles.overrides.map(profile => profile.id),
			profilesWithCustomFilename: [...profiles.custom, ...profiles.overrides].filter(profile => profile.filename?.kind === 'custom').map(profile => profile.id),
			hasGlobalFilenameTemplate: (common.filenameTemplate ?? '').trim().length > 0
		})
	}

	async get(): Promise<AppSettings> {
		await Promise.resolve()
		return this.store.store
	}

	// Sync read for callers (BinaryManager overridesProvider) that run during
	// chains where awaiting would force every probe path to become async-leaky.
	// Returns the same data as get(); exists only because the async signature
	// would create plumbing churn for no benefit.
	getSync(): AppSettings {
		return this.store.store
	}

	async update(patch: SettingsPatch): Promise<AppSettings> {
		const merged = deepMerge(this.store.store, patch, this.defaults)
		this.store.set(merged)
		await Promise.resolve()
		return this.store.store
	}

	async recordLaunch(): Promise<{settings: AppSettings; isFirstRun: boolean; launchCount: number}> {
		const current = this.store.store
		const isFirstRun = !current.common.firstRunCompleted
		const baselineLaunchCount = current.common.launchCount ?? (isFirstRun ? 0 : 2)
		const launchCount = baselineLaunchCount + 1
		const next: AppSettings = {...current, common: {...current.common, firstRunCompleted: true, launchCount}}
		this.store.set(next)
		await Promise.resolve()
		return {settings: next, isFirstRun, launchCount}
	}
}
