import {randomUUID} from 'node:crypto'
import Store from 'electron-store'
import log from 'electron-log/main.js'
import type {AppSettings, CommonSettings} from '@shared/types.js'
import type {SettingsPatch} from '@shared/api.js'
import {appSettingsSchema} from '@shared/schemas.js'

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

function migrateFlatToNested(raw: Record<string, unknown>, defaults: AppSettings): Record<string, unknown> {
	const picked = {...pickKeys(raw, COMMON_FLAT_KEYS), ...pickKeys(raw, LEGACY_COMMON_FLAT_KEYS)}
	const common = {...defaults.common, ...picked}
	const single = {...defaults.single, ...pickKeys(raw, SINGLE_FLAT_KEYS)}
	const playlist = {...defaults.playlist, ...pickKeys(raw, PLAYLIST_FLAT_KEYS)}
	return {common, single, playlist, profiles: defaults.profiles}
}

// Normalize the cookies setting from the pre-radio shape (`cookiesEnabled`
// boolean) to the tri-state `cookiesMode`. Idempotent — a no-op once
// `cookiesMode` is set, regardless of any leftover legacy fields.
function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asRecord(value: unknown): Record<string, unknown> | null {
	return isRecord(value) ? value : null
}

function canonicalize(value: unknown): unknown {
	if (Array.isArray(value)) return value.map(canonicalize)
	if (!isRecord(value)) return value
	return Object.fromEntries(
		Object.keys(value)
			.sort()
			.map(key => [key, canonicalize(value[key])])
	)
}

function stableJson(value: unknown): string {
	return JSON.stringify(canonicalize(value)) ?? ''
}

type NestedSettings = AppSettings['common'] | AppSettings['single'] | AppSettings['playlist'] | AppSettings['profiles']

function mergeNested(raw: Record<string, unknown>, key: string, defaults: NestedSettings): unknown {
	const persisted = raw[key]
	if (persisted === undefined) return defaults
	const record = asRecord(persisted)
	return record ? {...defaults, ...record} : persisted
}

function currentShape(raw: Record<string, unknown>, defaults: AppSettings): Record<string, unknown> {
	return {...defaults, ...raw, common: mergeNested(raw, 'common', defaults.common), single: mergeNested(raw, 'single', defaults.single), playlist: mergeNested(raw, 'playlist', defaults.playlist), profiles: mergeNested(raw, 'profiles', defaults.profiles)}
}

function migrateCookiesMode(common: Record<string, unknown>): Record<string, unknown> {
	const cookiesEnabled = common.cookiesEnabled
	if (common.cookiesMode !== undefined) {
		if (cookiesEnabled === undefined) return common
		const {cookiesEnabled: _drop, ...rest} = common
		return rest
	}
	const enabled = cookiesEnabled === true
	const hasPath = typeof common.cookiesPath === 'string' && common.cookiesPath.length > 0
	const mode = enabled && hasPath ? 'file' : 'off'
	const {cookiesEnabled: _drop, ...rest} = common
	return {...rest, cookiesMode: mode}
}

type SettingsSection = 'common' | 'single' | 'playlist' | 'profiles'

interface PersistedSettingsLoad {
	settings: AppSettings
	shouldPersist: boolean
	invalidSections: readonly SettingsSection[]
}

function normalizeCommon(value: unknown): unknown {
	const common = asRecord(value)
	return common ? migrateCookiesMode(common) : value
}

function parsePersistedSettings(raw: Record<string, unknown>, defaults: AppSettings): PersistedSettingsLoad {
	const candidate = isLegacyShape(raw) ? migrateFlatToNested(raw, defaults) : currentShape(raw, defaults)
	const common = appSettingsSchema.shape.common.safeParse(normalizeCommon(candidate.common))
	const single = appSettingsSchema.shape.single.safeParse(candidate.single)
	const playlist = appSettingsSchema.shape.playlist.safeParse(candidate.playlist)
	const profiles = appSettingsSchema.shape.profiles.safeParse(candidate.profiles)
	const invalidSections: SettingsSection[] = []
	if (!common.success) invalidSections.push('common')
	if (!single.success) invalidSections.push('single')
	if (!playlist.success) invalidSections.push('playlist')
	if (!profiles.success) invalidSections.push('profiles')
	const settings: AppSettings = {common: common.success ? common.data : defaults.common, single: single.success ? single.data : defaults.single, playlist: playlist.success ? playlist.data : defaults.playlist, profiles: profiles.success ? profiles.data : defaults.profiles}
	return {settings, shouldPersist: stableJson(raw) !== stableJson(rawSettings(settings)), invalidSections}
}

function rawSettings(settings: AppSettings): Record<string, unknown> {
	return {common: settings.common, single: settings.single, playlist: settings.playlist, profiles: settings.profiles}
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
	// electron-store exposes unvalidated JSON. Keep its generic honest and parse
	// the payload before storing or returning the trusted AppSettings value.
	private readonly store: Store<Record<string, unknown>>
	private readonly defaults: AppSettings
	private settings: AppSettings

	constructor(userDataPath: string, defaults: AppSettings) {
		this.store = new Store<Record<string, unknown>>({name: 'settings', cwd: userDataPath, defaults: rawSettings(defaults), clearInvalidConfig: true})
		this.defaults = defaults
		const loaded = parsePersistedSettings(this.store.store, this.defaults)
		this.settings = loaded.settings
		for (const section of loaded.invalidSections) logger.warn('Invalid persisted settings section; using defaults', {section})
		if (loaded.shouldPersist) this.persist()
		this.ensureInstallId()
	}

	private persist(): void {
		this.store.store = rawSettings(this.settings)
	}

	// Guarantee a per-install UUID for telemetry (OpenPanel `profileId`).
	// electron-store's `defaults` is shallow-merged at the top level, so an
	// existing user whose on-disk `common` predates this field would never
	// receive the default. Stamp lazily here after migration.
	private ensureInstallId(): void {
		if (this.settings.common.installId) return
		this.settings = {...this.settings, common: {...this.settings.common, installId: randomUUID()}}
		this.persist()
	}

	async get(): Promise<AppSettings> {
		await Promise.resolve()
		return this.settings
	}

	// Sync read for callers (BinaryManager overridesProvider) that run during
	// chains where awaiting would force every probe path to become async-leaky.
	// Returns the same data as get(); exists only because the async signature
	// would create plumbing churn for no benefit.
	getSync(): AppSettings {
		return this.settings
	}

	async update(patch: SettingsPatch): Promise<AppSettings> {
		const parsed = appSettingsSchema.safeParse(deepMerge(this.settings, patch, this.defaults))
		if (!parsed.success) {
			logger.error('Settings update failed validation; keeping previous settings', {issue: parsed.error.issues[0]?.message ?? 'schema mismatch'})
			await Promise.resolve()
			return this.settings
		}
		this.settings = parsed.data
		this.persist()
		await Promise.resolve()
		return this.settings
	}

	async recordLaunch(): Promise<{settings: AppSettings; isFirstRun: boolean; launchCount: number}> {
		const current = this.settings
		const isFirstRun = !current.common.firstRunCompleted
		const baselineLaunchCount = current.common.launchCount ?? (isFirstRun ? 0 : 2)
		const launchCount = baselineLaunchCount + 1
		const next: AppSettings = {...current, common: {...current.common, firstRunCompleted: true, launchCount}}
		const parsed = appSettingsSchema.safeParse(next)
		if (!parsed.success) {
			logger.error('Launch settings failed validation; keeping previous settings', {issue: parsed.error.issues[0]?.message ?? 'schema mismatch'})
			await Promise.resolve()
			return {settings: current, isFirstRun, launchCount: current.common.launchCount ?? baselineLaunchCount}
		}
		this.settings = parsed.data
		this.persist()
		await Promise.resolve()
		return {settings: this.settings, isFirstRun, launchCount}
	}
}
