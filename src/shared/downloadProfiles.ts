import {DEFAULTS} from './constants.js'
import {DEFAULT_HDR_PREFERENCE} from './hdrSetting.js'
import {builtinDownloadProfileIdSchema, DEFAULT_AUDIO_BITRATE} from './schemas.js'
import type {BuiltinDownloadProfileId, DownloadProfile, DownloadProfileRef, DownloadProfilesPrefs, HdrPreference, MediaIntent, NativeAudioPreference, PlaylistVideoTier, VideoFileType, VideoGoal} from './schemas.js'
import {mediaIntentFromProfileMedia, mediaIntentSpec, type MediaIntentSpec} from './mediaIntent.js'
import type {EmbedOptions, SponsorBlockOptions, SubtitleOptions} from './preparedJob.js'
import {effectiveOutputDir, safeFolderName} from './subfolder.js'
import {validateFilenameTemplate, type FilenameTemplateFailure} from './filenameTemplate.js'

const BUILTIN_TIMESTAMP = '2026-06-07T00:00:00.000Z'
const BUILTIN_PROFILE_EMBED = {chapters: true, metadata: true, thumbnail: false, description: false, thumbnailSidecar: false} as const

type VideoAudioProfileMedia = Extract<DownloadProfile['media'], {kind: 'video-audio'}>

function videoAudio(goal: VideoGoal, tier: PlaylistVideoTier): VideoAudioProfileMedia {
	return {kind: 'video-audio', goal, tier, fileType: 'auto', audio: {native: {kind: 'default'}}}
}

// A built-in stores no name: it is shown from the catalog in the app language.
// `subfolderName` is its download folder, which stays put whatever it is called.
function baseProfile(id: BuiltinDownloadProfileId, subfolderName: string, media: DownloadProfile['media'], icon: DownloadProfile['icon'], enabled = true): DownloadProfile {
	return {
		id,
		icon,
		enabled,
		media,
		subtitles: {enabled: false, languages: [], source: 'manual-first', mode: DEFAULTS.subtitleMode, format: DEFAULTS.subtitleFormat},
		sponsorBlock: {mode: DEFAULTS.sponsorBlockMode, categories: [...DEFAULTS.sponsorBlockCategories]},
		embed: {...BUILTIN_PROFILE_EMBED},
		createdAt: BUILTIN_TIMESTAMP,
		updatedAt: BUILTIN_TIMESTAMP,
		output: {kind: 'default'},
		filename: {kind: 'default'},
		subfolder: {enabled: true, name: safeFolderName(subfolderName)}
	}
}

// Ships with English so quick download can queue it unedited; the profile is
// editable, and the batch wizard seeds from the app language instead.
function subtitlesOnlyProfile(): DownloadProfile {
	const base = baseProfile('subtitles-only', 'Subtitles only', {kind: 'subtitles-only'}, 'captions')
	return {...base, subtitles: {...base.subtitles, enabled: true, languages: ['en']}}
}

function videoGoalLabel(goal: VideoGoal): string {
	return goal === 'smart-tv' ? 'Smart TV' : 'Best picture'
}

function videoTierLabel(tier: PlaylistVideoTier): string {
	return tier === 'best' ? 'Best available' : `Up to ${tier}p`
}

function videoFileTypeLabel(fileType: VideoFileType): string[] {
	return fileType === 'auto' ? [] : [fileType.toUpperCase()]
}

export const BUILTIN_DOWNLOAD_PROFILES: readonly DownloadProfile[] = [
	baseProfile('best-quality', 'Best available', videoAudio('best-picture', 'best'), 'video'),
	baseProfile('best-2160', '4K UHD 2160p', videoAudio('best-picture', '2160'), 'video'),
	baseProfile('best-1440', 'QHD 1440p', videoAudio('best-picture', '1440'), 'video'),
	baseProfile('hd-1080', 'Full HD 1080p', videoAudio('best-picture', '1080'), 'video'),
	baseProfile('balanced', 'Balanced 720p', videoAudio('best-picture', '720'), 'controls'),
	baseProfile('small-file', 'Small file 480p', videoAudio('best-picture', '480'), 'clip'),
	// The Smart TV folders keep the names these built-ins had before a rename.
	baseProfile('mp4-1080', 'Smart TV MP4 Full HD 1080p', videoAudio('smart-tv', '1080'), 'video'),
	baseProfile('mp4-720', 'Smart TV MP4 HD 720p', videoAudio('smart-tv', '720'), 'video'),
	baseProfile('mp4-480', 'Smart TV MP4 SD 480p', videoAudio('smart-tv', '480'), 'video'),
	baseProfile('audio-only', 'Audio only', {kind: 'audio-only', audio: {format: 'best'}}, 'audio'),
	subtitlesOnlyProfile(),
	baseProfile('low-240', 'Low data 240p', videoAudio('best-picture', '240'), 'clip', false),
	baseProfile('low-144', 'Lowest 144p', videoAudio('best-picture', '144'), 'clip', false)
] as const

export const DEFAULT_DOWNLOAD_PROFILE_REF: DownloadProfileRef = {kind: 'builtin', id: 'balanced'}

export const DEFAULT_DOWNLOAD_PROFILES_PREFS: DownloadProfilesPrefs = {active: DEFAULT_DOWNLOAD_PROFILE_REF, custom: [], overrides: [], enabledOverrides: {}}

export type DownloadProfileOrigin = {kind: 'builtin'; overridden: boolean} | {kind: 'custom'}

export interface ResolvedDownloadProfile {
	profile: DownloadProfile
	ref: DownloadProfileRef
	intent: MediaIntent | null
	spec: MediaIntentSpec | null
	subtitles?: SubtitleOptions
	sponsorBlock: SponsorBlockOptions
	embed: EmbedOptions
	isSubtitleOnly: boolean
}

export interface DownloadProfileOutputContext {
	currentOutputDir?: string
	defaultOutputDir?: string
}

export function isBuiltinDownloadProfileId(id: string): id is BuiltinDownloadProfileId {
	return builtinDownloadProfileIdSchema.safeParse(id).success
}

export function normalizeDownloadProfilesPrefs(prefs: DownloadProfilesPrefs | undefined): DownloadProfilesPrefs {
	const source = prefs ?? DEFAULT_DOWNLOAD_PROFILES_PREFS
	const rawOverrides = source.enabledOverrides ?? {}
	const enabledOverrides = Object.fromEntries(Object.entries(rawOverrides).filter(([id, value]) => typeof value === 'boolean' && isBuiltinDownloadProfileId(id)))
	const custom = (source.custom ?? []).filter(profile => !isBuiltinDownloadProfileId(profile.id))
	const normalized: DownloadProfilesPrefs = {active: source.active ?? DEFAULT_DOWNLOAD_PROFILE_REF, custom, overrides: (source.overrides ?? []).filter(profile => isBuiltinDownloadProfileId(profile.id)), enabledOverrides}
	if (!source.order) return normalized
	// Ids of deleted profiles drop out, so a removed profile leaves no gap.
	const known = new Set([...BUILTIN_DOWNLOAD_PROFILES.map(profile => profile.id), ...custom.map(profile => profile.id)])
	return {...normalized, order: [...new Set(source.order)].filter(id => known.has(id))}
}

// Profiles the user never placed (made after the last reorder, or built-ins an
// update added) follow the placed ones, in catalog order.
function inUserOrder(profiles: DownloadProfile[], order: readonly string[] | undefined): DownloadProfile[] {
	if (!order || order.length === 0) return profiles
	const placed = order.flatMap(id => profiles.filter(profile => profile.id === id))
	return [...placed, ...profiles.filter(profile => !order.includes(profile.id))]
}

function builtinEnabled(id: string, prefs: DownloadProfilesPrefs): boolean {
	const forced = prefs.enabledOverrides[id]
	if (forced !== undefined) return forced
	return BUILTIN_DOWNLOAD_PROFILES.find(builtin => builtin.id === id)?.enabled ?? true
}

function overriddenBuiltinProfiles(prefs: DownloadProfilesPrefs | undefined): DownloadProfile[] {
	const normalized = normalizeDownloadProfilesPrefs(prefs)
	return BUILTIN_DOWNLOAD_PROFILES.map(builtin => {
		const base = normalized.overrides.find(profile => profile.id === builtin.id) ?? builtin
		return {...base, enabled: builtinEnabled(builtin.id, normalized)}
	})
}

export function allDownloadProfiles(prefs: DownloadProfilesPrefs | undefined): DownloadProfile[] {
	const normalized = normalizeDownloadProfilesPrefs(prefs)
	return inUserOrder([...overriddenBuiltinProfiles(normalized), ...normalized.custom], normalized.order)
}

// Moves a profile to where `targetId` stands, shifting the ones between. The
// whole order is written, so later lists all agree with this one.
export function moveDownloadProfile(prefs: DownloadProfilesPrefs, id: string, targetId: string): DownloadProfilesPrefs {
	const normalized = normalizeDownloadProfilesPrefs(prefs)
	const order = allDownloadProfiles(normalized).map(profile => profile.id)
	const from = order.indexOf(id)
	const to = order.indexOf(targetId)
	if (from === -1 || to === -1 || from === to) return normalized
	order.splice(to, 0, ...order.splice(from, 1))
	return {...normalized, order}
}

export function enabledDownloadProfiles(prefs: DownloadProfilesPrefs | undefined): DownloadProfile[] {
	return allDownloadProfiles(prefs).filter(profile => profile.enabled)
}

function findDownloadProfile(ref: DownloadProfileRef, prefs: DownloadProfilesPrefs | undefined): DownloadProfile | null {
	const normalized = normalizeDownloadProfilesPrefs(prefs)
	const profiles = ref.kind === 'builtin' ? overriddenBuiltinProfiles(normalized) : normalized.custom
	return profiles.find(profile => profile.id === ref.id) ?? null
}

export function resolveActiveDownloadProfile(prefs: DownloadProfilesPrefs | undefined): {profile: DownloadProfile; ref: DownloadProfileRef} {
	const normalized = normalizeDownloadProfilesPrefs(prefs)
	const active = findDownloadProfile(normalized.active, normalized)
	if (active?.enabled) return {profile: active, ref: normalized.active}
	const fallbackDefault = findDownloadProfile(DEFAULT_DOWNLOAD_PROFILE_REF, normalized)
	if (fallbackDefault?.enabled) return {profile: fallbackDefault, ref: DEFAULT_DOWNLOAD_PROFILE_REF}
	const firstEnabled = allDownloadProfiles(normalized).find(profile => profile.enabled)
	if (firstEnabled) return {profile: firstEnabled, ref: downloadProfileRefFor(firstEnabled, normalized)}
	const fallback = BUILTIN_DOWNLOAD_PROFILES[0]
	if (!fallback) throw new Error('No built-in download profiles available')
	return {profile: fallback, ref: {kind: 'builtin', id: fallback.id}}
}

// A profile chosen earlier, as it is now: the active one if it was deleted or
// disabled since.
export function resolveChosenDownloadProfile(ref: DownloadProfileRef, prefs: DownloadProfilesPrefs | undefined): {profile: DownloadProfile; ref: DownloadProfileRef} {
	const chosen = findDownloadProfile(ref, prefs)
	return chosen?.enabled ? {profile: chosen, ref} : resolveActiveDownloadProfile(prefs)
}

export function downloadProfileOrigin(profile: DownloadProfile, prefs: DownloadProfilesPrefs | undefined): DownloadProfileOrigin {
	if (!isBuiltinDownloadProfileId(profile.id)) return {kind: 'custom'}
	const normalized = normalizeDownloadProfilesPrefs(prefs)
	return {kind: 'builtin', overridden: normalized.overrides.some(item => item.id === profile.id)}
}

export function downloadProfileRefFor(profile: DownloadProfile, _prefs: DownloadProfilesPrefs | undefined): DownloadProfileRef {
	return isBuiltinDownloadProfileId(profile.id) ? {kind: 'builtin', id: profile.id} : {kind: 'custom', id: profile.id}
}

export function saveDownloadProfileToPrefs(prefs: DownloadProfilesPrefs, profile: DownloadProfile, activate = true): DownloadProfilesPrefs {
	const normalized = normalizeDownloadProfilesPrefs(prefs)
	const ref = downloadProfileRefFor(profile, normalized)
	// For a built-in, prefs.enabledOverrides is authoritative over any `enabled` carried
	// on the incoming snapshot (same ownership rule as builtinEnabled/allDownloadProfiles).
	// A custom profile owns its own `enabled`. Never activate a profile that will not be
	// enabled after this save — that would silently strand prefs.active on a hidden profile.
	const willBeEnabled = ref.kind === 'builtin' ? builtinEnabled(profile.id, normalized) : profile.enabled
	const shouldActivate = activate && willBeEnabled
	if (ref.kind === 'builtin') {
		const overrides = normalized.overrides.filter(item => item.id !== profile.id)
		return {...normalized, active: shouldActivate ? ref : normalized.active, custom: normalized.custom.filter(item => item.id !== profile.id), overrides: [...overrides, profile]}
	}
	const custom = normalized.custom.filter(item => item.id !== profile.id)
	return {...normalized, active: shouldActivate ? ref : normalized.active, custom: [...custom, profile]}
}

export function removeDownloadProfileFromPrefs(prefs: DownloadProfilesPrefs, id: string): DownloadProfilesPrefs {
	const normalized = normalizeDownloadProfilesPrefs(prefs)
	if (isBuiltinDownloadProfileId(id)) {
		return {...normalized, overrides: normalized.overrides.filter(profile => profile.id !== id)}
	}
	const custom = normalized.custom.filter(profile => profile.id !== id)
	const activeRemoved = normalized.active.kind === 'custom' && normalized.active.id === id
	return normalizeDownloadProfilesPrefs({...normalized, active: activeRemoved ? DEFAULT_DOWNLOAD_PROFILE_REF : normalized.active, custom})
}

export function setDownloadProfileEnabled(prefs: DownloadProfilesPrefs, id: string, enabled: boolean): DownloadProfilesPrefs {
	const normalized = normalizeDownloadProfilesPrefs(prefs)
	const all = allDownloadProfiles(normalized)
	const target = all.find(profile => profile.id === id)
	if (!target || target.enabled === enabled) return normalized
	if (!enabled && all.filter(profile => profile.enabled).length <= 1) return normalized
	let next: DownloadProfilesPrefs
	if (isBuiltinDownloadProfileId(id)) {
		const builtinDefault = BUILTIN_DOWNLOAD_PROFILES.find(builtin => builtin.id === id)?.enabled ?? true
		const enabledOverrides = {...normalized.enabledOverrides}
		if (enabled === builtinDefault) delete enabledOverrides[id]
		else enabledOverrides[id] = enabled
		next = {...normalized, enabledOverrides}
	} else {
		const custom = normalized.custom.map(profile => (profile.id === id ? {...profile, enabled} : profile))
		next = {...normalized, custom}
	}
	const resolved = resolveActiveDownloadProfile(next)
	const activeStillValid = resolved.ref.kind === next.active.kind && resolved.ref.id === next.active.id
	if (activeStillValid) return next
	return {...next, active: resolved.ref}
}

export function resolveDownloadProfile(profile: DownloadProfile, ref: DownloadProfileRef = downloadProfileRefFor(profile, undefined), nativeAudioPreference: NativeAudioPreference = DEFAULTS.nativeAudioPreference, hdrPreference: HdrPreference = DEFAULT_HDR_PREFERENCE): ResolvedDownloadProfile {
	const intent = mediaIntentFromProfileMedia(profile.media)
	const spec = intent ? mediaIntentSpec(intent, nativeAudioPreference, hdrPreference) : null
	const isSubtitleOnly = profile.media.kind === 'subtitles-only'
	const subtitleLanguages = profile.subtitles.enabled || isSubtitleOnly ? profile.subtitles.languages : []
	const subtitleMode = profile.subtitles.mode === 'embed' && spec?.producesVideo !== true ? 'sidecar' : profile.subtitles.mode
	const subtitles: SubtitleOptions | undefined = subtitleLanguages.length > 0 ? {request: {kind: 'languages', languages: [...subtitleLanguages], source: profile.subtitles.source}, mode: subtitleMode, format: profile.subtitles.format} : undefined
	const sponsorBlock: SponsorBlockOptions = !spec?.producesVideo || profile.sponsorBlock.mode === 'off' || profile.sponsorBlock.categories.length === 0 ? {mode: 'off'} : {mode: profile.sponsorBlock.mode, categories: [...profile.sponsorBlock.categories]}
	const embed: EmbedOptions = isSubtitleOnly
		? {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}
		: {chapters: profile.embed.chapters, metadata: profile.embed.metadata, thumbnail: profile.embed.thumbnail, description: profile.embed.description, thumbnailSidecar: profile.embed.thumbnailSidecar}

	return {profile, ref, intent, spec, subtitles, sponsorBlock, embed, isSubtitleOnly}
}

function nonBlank(dir: string | undefined): string | undefined {
	return dir?.trim() ? dir : undefined
}

// A profile whose output folder can't be resolved: a fixed folder left blank,
// or no current or default folder to fall back on. Callers show it in the app
// language; the message is for logs.
export class DownloadProfileOutputMissingError extends Error {
	constructor() {
		super('Download profile output directory is required')
		this.name = 'DownloadProfileOutputMissingError'
	}
}

export function resolveDownloadProfileBaseDir(profile: DownloadProfile, context: DownloadProfileOutputContext): string {
	// Blank means absent; any other folder is kept as given, since a trailing
	// space is part of a macOS or Linux folder's name.
	const dir = profile.output.kind === 'fixed' ? nonBlank(profile.output.dir) : (nonBlank(context.currentOutputDir) ?? nonBlank(context.defaultOutputDir))
	if (dir !== undefined) return dir
	throw new DownloadProfileOutputMissingError()
}

export function resolveDownloadProfileOutputDir(profile: DownloadProfile, context: DownloadProfileOutputContext): string {
	const baseDir = resolveDownloadProfileBaseDir(profile, context)
	return effectiveOutputDir(baseDir, profile.subfolder.enabled, profile.subfolder.name)
}

/**
 * Profile override wins, else the global setting, else the built-in default.
 * The result is an Arroxy template (`{title} [{id}]`), not a yt-dlp one —
 * compilation happens at queue-submission time.
 */
export function resolveFilenameTemplate(profile: DownloadProfile | undefined, globalTemplate: string | undefined): string {
	if (profile?.filename.kind === 'custom') return profile.filename.template
	// An empty or whitespace-only stored value must fall through to the default,
	// which `??` would not do — hence the explicit length check.
	const trimmed = globalTemplate?.trim() ?? ''
	return trimmed.length > 0 ? trimmed : DEFAULTS.filenameTemplate
}

// Why the profile's own filename template is unusable, or null when it is fine
// or the profile inherits the global one. A profile kept with such a template
// would fail every download it starts.
export function downloadProfileFilenameFailure(profile: Pick<DownloadProfile, 'filename'>): FilenameTemplateFailure | null {
	if (profile.filename.kind !== 'custom') return null
	const validation = validateFilenameTemplate(profile.filename.template)
	return validation.ok ? null : validation
}

export function downloadProfileLabel(profile: DownloadProfile): string {
	switch (profile.media.kind) {
		case 'video-audio':
			return [videoTierLabel(profile.media.tier), videoGoalLabel(profile.media.goal), ...videoFileTypeLabel(profile.media.fileType)].join(' · ')
		case 'video-only':
			return [videoTierLabel(profile.media.tier), videoGoalLabel(profile.media.goal), ...videoFileTypeLabel(profile.media.fileType), 'No audio'].join(' · ')
		case 'audio-only':
			if (profile.media.audio.format === 'best') return 'Audio only · best'
			if (profile.media.audio.format === 'wav') return 'Audio only · WAV'
			return `Audio only · ${profile.media.audio.format.toUpperCase()} ${profile.media.audio.bitrateKbps ?? DEFAULT_AUDIO_BITRATE}K`
		case 'subtitles-only':
			return ['Subtitles only', profile.subtitles.languages.join(', '), profile.subtitles.format.toUpperCase()].filter(part => part.length > 0).join(' · ')
	}
}
