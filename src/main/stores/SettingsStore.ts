import {randomUUID} from 'node:crypto'
import Store from 'electron-store'
import type {AppSettings, CommonSettings, SinglePrefs} from '@shared/types.js'
import type {SettingsPatch} from '@shared/api.js'

export type {SettingsPatch}

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
	'pacingConcurrentFragments',
	'clipboardWatchEnabled',
	'includeIdInSingleFilenames',
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
		const profiles = profileSource.overrides === undefined ? {...profileSource, overrides: []} : profileSource
		const withDefaults: AppSettings = {...baseline, profiles}
		const cookiesMigrated: AppSettings = {...withDefaults, common: migrateCookiesMode(withDefaults.common)}
		if (!isLegacy && cookiesMigrated.common === withDefaults.common && withDefaults.profiles === baseline.profiles) return
		// Replace the entire on-disk shape with the migrated one. Wiping any
		// legacy flat keys first prevents both shapes from coexisting on disk.
		this.store.clear()
		this.store.set(cookiesMigrated)
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
