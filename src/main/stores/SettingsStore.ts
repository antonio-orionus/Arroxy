import fs from 'node:fs'
import path from 'node:path'
import Store from 'electron-store'
import log from 'electron-log/main.js'
import type {ZodError, ZodType} from 'zod'
import type {AppSettings, CommonSettings, DownloadProfile, DownloadProfileRef, DownloadProfilesPrefs} from '@shared/types.js'
import type {SettingsPatch} from '@shared/api.js'
import {BUILTIN_DOWNLOAD_PROFILES, DEFAULT_DOWNLOAD_PROFILE_REF, isBuiltinDownloadProfileId, withRunnableSubtitleMode} from '@shared/downloadProfiles.js'
import {appSettingsSchema, customDownloadProfileSchema, downloadProfileRefSchema, downloadProfileSchema} from '@shared/schemas.js'
import {isShippedBuiltinProfileName} from './shippedBuiltinProfileNames.js'

export type {SettingsPatch}

const logger = log.scope('settings')

const COMMON_FLAT_KEYS = [
	'defaultOutputDir',
	'rememberLastOutputDir',
	'uiZoom',
	'uiTheme',
	'uiStyle',
	'language',
	'commonPaths',
	'cookiesPath',
	'cookiesMode',
	'cookiesBrowser',
	'proxyUrl',
	'nativeAudioPreference',
	'hdrPreference',
	'limitRate',
	'playlistProbeLimit',
	'networkPacingPreset',
	'pacingSleepRequests',
	'pacingSleepInterval',
	'pacingMaxSleepInterval',
	'pacingSleepSubtitles',
	'downloadConnections',
	'concurrentDownloads',
	'concurrentProbes',
	'autoRetryAttempts',
	'autoRemoveCompleted',
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
	'lastHeartbeatDay',
	'lastSubfolderEnabled',
	'lastSubfolder'
] as const

// Legacy keys retained only so the flat-to-nested migration can pick them up
// from old settings files. The values are normalized in `migrateCookiesMode`
// and the legacy keys are stripped from the persisted shape.
const LEGACY_COMMON_FLAT_KEYS = ['cookiesEnabled'] as const

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
	return COMMON_FLAT_KEYS.some(k => k in raw) || LEGACY_COMMON_FLAT_KEYS.some(k => k in raw) || PLAYLIST_FLAT_KEYS.some(k => k in raw)
}

function migrateFlatToNested(raw: Record<string, unknown>, defaults: AppSettings): Record<string, unknown> {
	const picked = {...pickKeys(raw, COMMON_FLAT_KEYS), ...pickKeys(raw, LEGACY_COMMON_FLAT_KEYS)}
	const common = {...defaults.common, ...picked}
	const playlist = {...defaults.playlist, ...pickKeys(raw, PLAYLIST_FLAT_KEYS)}
	return {common, playlist, profiles: defaults.profiles}
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

type NestedSettings = AppSettings['common'] | AppSettings['playlist'] | AppSettings['profiles']

function mergeNested(raw: Record<string, unknown>, key: string, defaults: NestedSettings): unknown {
	const persisted = raw[key]
	if (persisted === undefined) return defaults
	const record = asRecord(persisted)
	return record ? {...defaults, ...record} : persisted
}

function currentShape(raw: Record<string, unknown>, defaults: AppSettings): Record<string, unknown> {
	return {...defaults, ...raw, common: mergeNested(raw, 'common', defaults.common), playlist: mergeNested(raw, 'playlist', defaults.playlist), profiles: mergeNested(raw, 'profiles', defaults.profiles)}
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

type SettingsSection = 'common' | 'playlist'

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
	const playlist = appSettingsSchema.shape.playlist.safeParse(candidate.playlist)
	// Profiles are normalized entry by entry rather than section-parsed: a single
	// unreadable profile must not take the whole bucket and the active selection
	// with it. `normalizePersistedProfiles` always yields a valid value, so there
	// is no profiles branch in `invalidSections`.
	const profiles = normalizePersistedProfiles(candidate.profiles, asRecord(candidate.common)?.builtinProfileNamesMigrated !== true)
	const invalidSections: SettingsSection[] = []
	if (!common.success) invalidSections.push('common')
	if (!playlist.success) invalidSections.push('playlist')
	const settings: AppSettings = {common: {...(common.success ? common.data : defaults.common), builtinProfileNamesMigrated: true}, playlist: playlist.success ? playlist.data : defaults.playlist, profiles}
	return {settings, shouldPersist: stableJson(raw) !== stableJson(rawSettings(settings)), invalidSections}
}

function rawSettings(settings: AppSettings): Record<string, unknown> {
	return {common: settings.common, playlist: settings.playlist, profiles: settings.profiles}
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
	const baseProfiles = {...profileSource, overrides: profileSource.overrides ?? [], enabledOverrides: profileSource.enabledOverrides ?? {}}
	return {common: mergeCommon(base.common, patch.common), playlist: {...base.playlist, ...(patch.playlist ?? {})}, profiles: {...baseProfiles, ...(patch.profiles ?? {})}}
}

function profileIdOf(value: unknown): string | null {
	if (typeof value !== 'object' || value === null) return null
	const id = (value as {id?: unknown}).id
	return typeof id === 'string' ? id : null
}

function issuePaths(error: ZodError): string[] {
	return error.issues.map(issue => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
}

function parseProfileList<T extends DownloadProfile>(value: unknown, bucket: 'custom' | 'overrides', schema: ZodType<T>): T[] {
	if (!Array.isArray(value)) {
		if (value !== undefined) logger.warn('Discarded download profile bucket that is not an array', {bucket, type: typeof value})
		return []
	}
	return value.flatMap((item, index) => {
		const parsed = schema.safeParse(item)
		if (parsed.success) return [parsed.data]
		logger.warn('Dropped invalid download profile', {bucket, index, id: profileIdOf(item), issues: issuePaths(parsed.error)})
		return []
	})
}

// An edited built-in saved before built-ins stopped storing their name still
// carries the English one it shipped with; dropping it shows the built-in's
// own name in the app language. Runs once per settings file.
function withoutShippedName(profile: DownloadProfile): DownloadProfile {
	if (profile.name === undefined || !isBuiltinDownloadProfileId(profile.id) || !isShippedBuiltinProfileName(profile.id, profile.name)) return profile
	const {name: _shipped, ...rest} = profile
	return rest
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
function parseEnabledOverrides(value: unknown): Record<string, boolean> {
	const record = asRecord(value)
	if (!record) {
		if (value !== undefined) logger.warn('Discarded enabledOverrides that is not an object', {type: typeof value})
		return {}
	}
	const builtinIds = new Set(BUILTIN_DOWNLOAD_PROFILES.map(profile => profile.id))
	const out: Record<string, boolean> = {}
	for (const [id, enabled] of Object.entries(record)) {
		if (typeof enabled !== 'boolean') {
			logger.warn('Dropped invalid enabled override', {id})
			continue
		}
		if (!builtinIds.has(id)) continue
		out[id] = enabled
	}
	return out
}

function parseProfileOrder(value: unknown): string[] | undefined {
	if (value === undefined) return undefined
	if (!Array.isArray(value)) {
		logger.warn('Discarded download profile order that is not an array', {type: typeof value})
		return undefined
	}
	return value.filter((id): id is string => typeof id === 'string')
}

function persistedActiveRef(value: unknown, custom: readonly DownloadProfile[]): DownloadProfileRef {
	const parsedActive = downloadProfileRefSchema.safeParse(value)
	if (!parsedActive.success) {
		if (value !== undefined) logger.warn('Reset unreadable active download profile reference', {issues: issuePaths(parsedActive.error)})
		return DEFAULT_DOWNLOAD_PROFILE_REF
	}
	const active: DownloadProfileRef = parsedActive.data
	// A dangling custom reference resolves to the default profile at read time
	// anyway; resetting it here keeps disk and UI telling the same story.
	if (active.kind === 'custom' && !custom.some(profile => profile.id === active.id)) {
		logger.warn('Active download profile no longer exists — falling back to the default', {id: active.id})
		return DEFAULT_DOWNLOAD_PROFILE_REF
	}
	return active
}

function normalizePersistedProfiles(source: unknown, dropShippedNames: boolean): DownloadProfilesPrefs {
	const record = asRecord(source)
	// A profile without video saved with Embed already wrote sidecar files, so
	// loading stores that and the editor shows it.
	const custom = parseProfileList(record?.custom, 'custom', customDownloadProfileSchema).map(withRunnableSubtitleMode)
	const overrides = parseProfileList(record?.overrides, 'overrides', downloadProfileSchema).map(withRunnableSubtitleMode)
	const prefs: DownloadProfilesPrefs = {active: persistedActiveRef(record?.active, custom), custom, overrides: dropShippedNames ? overrides.map(withoutShippedName) : overrides, enabledOverrides: parseEnabledOverrides(record?.enabledOverrides)}
	const order = parseProfileOrder(record?.order)
	return order ? {...prefs, order} : prefs
}

// Profiles saved before goals and file types carry `codec` and `tiers` in their
// media. Loading reads them into the new shape, and the next save writes that
// shape, which an older app version cannot read (it drops such profiles).
function hasLegacyProfileMedia(raw: Record<string, unknown>): boolean {
	const profiles = asRecord(raw.profiles)
	return [profiles?.custom, profiles?.overrides].some(bucket => Array.isArray(bucket) && bucket.some(item => asRecord(asRecord(item)?.media)?.codec !== undefined))
}

// An edited built-in that still stores a name it shipped with. Loading drops
// that name, and an older app version drops a built-in edit without one.
function hasShippedBuiltinName(raw: Record<string, unknown>): boolean {
	const overrides = asRecord(raw.profiles)?.overrides
	if (!Array.isArray(overrides)) return false
	return overrides.some(item => {
		const record = asRecord(item)
		return typeof record?.id === 'string' && typeof record.name === 'string' && isBuiltinDownloadProfileId(record.id) && isShippedBuiltinProfileName(record.id, record.name)
	})
}

// Each conversion an older app version cannot read back, with the file that
// keeps the settings as they were before it.
const PROFILE_CONVERSION_BACKUPS: readonly {file: string; applies: (raw: Record<string, unknown>) => boolean}[] = [
	{file: 'settings.before-selection-order.json', applies: hasLegacyProfileMedia},
	{file: 'settings.before-profile-names.json', applies: hasShippedBuiltinName}
]

interface PriorSettings {
	// The file's exact bytes, kept so a backup is the file as it was.
	text: string
	data: Record<string, unknown>
}

// The settings file as an earlier version left it, or null on a first launch
// (or a file that cannot be read). Read before the store opens, because the
// store writes its defaults into the file at construction and would hide which
// keys were really saved.
function readPriorSettings(userDataPath: string): PriorSettings | null {
	try {
		const text = fs.readFileSync(path.join(userDataPath, 'settings.json'), 'utf-8')
		const data = asRecord(JSON.parse(text))
		return data ? {text, data} : null
	} catch {
		return null
	}
}

// SDR is the default for new installs, but an install that already had settings
// was getting HDR-first picks from yt-dlp's own order: it keeps them, so no
// download changes. Settings can turn it off.
function savedBeforeHdrPreference(prior: PriorSettings | null): boolean {
	if (!prior) return false
	return asRecord(prior.data.common)?.hdrPreference === undefined && prior.data.hdrPreference === undefined
}

// Which cookie mode a failed download ran under is otherwise invisible in a
// feedback log: the startup snapshot goes stale as soon as the user changes it.
function logCookieSettingsChange(previous: AppSettings['common'], next: AppSettings['common']): void {
	const from = previous.cookiesMode ?? 'off'
	const to = next.cookiesMode ?? 'off'
	if (from !== to) logger.info('Cookie mode changed', {from, to})
	// Absent means enabled.
	const wasEnabled = previous.exploreEnabled !== false
	const isEnabled = next.exploreEnabled !== false
	if (wasEnabled !== isEnabled) logger.info('Explore tab toggled', {from: wasEnabled, to: isEnabled})
}

export class SettingsStore {
	// electron-store exposes unvalidated JSON. Keep its generic honest and parse
	// the payload before storing or returning the trusted AppSettings value.
	private readonly store: Store<Record<string, unknown>>
	private readonly defaults: AppSettings
	private settings: AppSettings

	constructor(userDataPath: string, defaults: AppSettings) {
		const priorSettings = readPriorSettings(userDataPath)
		this.store = new Store<Record<string, unknown>>({name: 'settings', cwd: userDataPath, defaults: rawSettings(defaults), clearInvalidConfig: true})
		this.defaults = defaults
		const loaded = parsePersistedSettings(this.store.store, this.defaults)
		this.settings = savedBeforeHdrPreference(priorSettings) ? {...loaded.settings, common: {...loaded.settings.common, hdrPreference: 'hdr'}} : loaded.settings
		for (const section of loaded.invalidSections) logger.warn('Invalid persisted settings section; using defaults', {section})
		if (loaded.shouldPersist || this.settings !== loaded.settings) {
			this.backUpLegacyProfiles(userDataPath, priorSettings)
			this.persist()
		}
		this.logProfileSummary()
	}

	// Once, before profiles saved in the old shape are rewritten: keep the file
	// as it was, so going back to an older build loses nothing. Never blocks
	// startup, and never overwrites an earlier backup.
	private backUpLegacyProfiles(userDataPath: string, prior: PriorSettings | null): void {
		if (!prior) return
		for (const {file, applies} of PROFILE_CONVERSION_BACKUPS) {
			if (!applies(prior.data)) continue
			try {
				// `wx` fails if a backup already exists, so an earlier one is never overwritten.
				fs.writeFileSync(path.join(userDataPath, file), prior.text, {encoding: 'utf-8', flag: 'wx'})
				logger.info('Backed up settings before converting profiles', {file})
			} catch (error) {
				if (error instanceof Error && 'code' in error && error.code === 'EEXIST') continue
				logger.warn('Could not back up settings before converting profiles', {file, error: error instanceof Error ? error.message : String(error)})
			}
		}
	}

	private persist(): void {
		this.store.store = rawSettings(this.settings)
	}

	// Startup snapshot of the settings that shape a download but never appear in
	// any later log line. A profile override is invisible in the job logs, so a
	// bug that only reproduces under a customized profile is otherwise
	// undiagnosable from a user's main.log. Ids and counts only — no paths,
	// templates, or install identifiers.
	private logProfileSummary(): void {
		const {common, profiles} = this.settings
		logger.info('Settings loaded', {
			activeProfile: profiles.active,
			customProfiles: profiles.custom.map(profile => profile.id),
			overriddenBuiltins: profiles.overrides.map(profile => profile.id),
			profilesWithCustomFilename: [...profiles.custom, ...profiles.overrides].filter(profile => profile.filename.kind === 'custom').map(profile => profile.id),
			hasGlobalFilenameTemplate: (common.filenameTemplate ?? '').trim().length > 0,
			hotkeyEnabled: common.hotkeyEnabled
		})
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
		const previous = this.settings.common
		this.settings = parsed.data
		logCookieSettingsChange(previous, this.settings.common)
		this.persist()
		await Promise.resolve()
		return this.settings
	}

	// Internal fields outside the renderer patch contract, so this bypasses update().
	async recordHeartbeat({firstDay, lastDay}: {firstDay?: string; lastDay: string}): Promise<void> {
		this.settings = {...this.settings, common: {...this.settings.common, lastHeartbeatDay: lastDay, ...(firstDay === undefined ? {} : {firstHeartbeatDay: firstDay})}}
		this.persist()
		await Promise.resolve()
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
