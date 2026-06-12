import {DEFAULTS} from './constants.js'
import {DEFAULT_AUDIO_BITRATE} from './schemas.js'
import type {DownloadProfile, DownloadProfileRef, DownloadProfilesPrefs, MediaIntent, PlaylistVideoTier} from './schemas.js'
import {mediaIntentFromProfileMedia, mediaIntentSpec, type MediaIntentSpec} from './mediaIntent.js'
import type {EmbedOptions, SponsorBlockOptions, SubtitleOptions} from './preparedJob.js'
import {effectiveOutputDir, safeFolderName} from './subfolder.js'

const BUILTIN_TIMESTAMP = '2026-06-07T00:00:00.000Z'
const BUILTIN_PROFILE_EMBED = {chapters: true, metadata: true, thumbnail: false, description: false, thumbnailSidecar: false} as const

type VideoAudioProfileMedia = Extract<DownloadProfile['media'], {kind: 'video-audio'}>

function videoAudio(codec: 'best' | 'mp4', tiers: PlaylistVideoTier[]): VideoAudioProfileMedia {
	return {kind: 'video-audio', codec, tiers, audio: {format: codec === 'mp4' ? 'm4a' : 'best'}}
}

function baseProfile(id: string, name: string, media: DownloadProfile['media'], icon: DownloadProfile['icon']): DownloadProfile {
	return {
		id,
		name,
		icon,
		media,
		subtitles: {enabled: false, languages: [], source: 'manual-first', mode: DEFAULTS.subtitleMode, format: DEFAULTS.subtitleFormat},
		sponsorBlock: {mode: DEFAULTS.sponsorBlockMode, categories: [...DEFAULTS.sponsorBlockCategories]},
		embed: {...BUILTIN_PROFILE_EMBED},
		createdAt: BUILTIN_TIMESTAMP,
		updatedAt: BUILTIN_TIMESTAMP,
		output: {kind: 'default'},
		subfolder: {enabled: true, name: safeFolderName(name)}
	}
}

function videoCompatibilityLabel(codec: 'best' | 'mp4'): string {
	return codec === 'mp4' ? 'Smart TV H.264 MP4' : 'Best native'
}

function videoTierLabel(tiers: readonly PlaylistVideoTier[]): string {
	const tier = tiers[0] ?? 'best'
	return tier === 'best' ? 'best available' : `up to ${tier}p`
}

function videoAudioLabel(format: 'best' | 'm4a'): string {
	return format === 'm4a' ? 'AAC audio' : 'best native audio'
}

export const BUILTIN_DOWNLOAD_PROFILES: readonly DownloadProfile[] = [
	baseProfile('best-quality', 'Best available', videoAudio('best', ['best']), 'video'),
	baseProfile('best-2160', '4K UHD 2160p', videoAudio('best', ['2160']), 'video'),
	baseProfile('best-1440', 'QHD 1440p', videoAudio('best', ['1440']), 'video'),
	baseProfile('hd-1080', 'Full HD 1080p', videoAudio('best', ['1080']), 'video'),
	baseProfile('balanced', 'Balanced 720p', videoAudio('best', ['720']), 'controls'),
	baseProfile('small-file', 'Small file 480p', videoAudio('best', ['480']), 'clip'),
	baseProfile('mp4-1080', 'Smart TV MP4 Full HD', videoAudio('mp4', ['1080']), 'video'),
	baseProfile('mp4-720', 'Smart TV MP4 HD', videoAudio('mp4', ['720']), 'video'),
	baseProfile('mp4-480', 'Smart TV MP4 SD', videoAudio('mp4', ['480']), 'video'),
	baseProfile('audio-only', 'Audio only', {kind: 'audio-only', audio: {format: 'best'}}, 'audio')
] as const

export const DEFAULT_DOWNLOAD_PROFILE_REF: DownloadProfileRef = {kind: 'builtin', id: 'balanced'}

export const DEFAULT_DOWNLOAD_PROFILES_PREFS: DownloadProfilesPrefs = {active: DEFAULT_DOWNLOAD_PROFILE_REF, custom: [], overrides: []}

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

function isBuiltinDownloadProfileId(id: string): boolean {
	return BUILTIN_DOWNLOAD_PROFILES.some(profile => profile.id === id)
}

export function normalizeDownloadProfilesPrefs(prefs: DownloadProfilesPrefs | undefined): DownloadProfilesPrefs {
	const source = prefs ?? DEFAULT_DOWNLOAD_PROFILES_PREFS
	return {active: source.active ?? DEFAULT_DOWNLOAD_PROFILE_REF, custom: (source.custom ?? []).filter(profile => !isBuiltinDownloadProfileId(profile.id)), overrides: (source.overrides ?? []).filter(profile => isBuiltinDownloadProfileId(profile.id))}
}

function overriddenBuiltinProfiles(prefs: DownloadProfilesPrefs | undefined): DownloadProfile[] {
	const normalized = normalizeDownloadProfilesPrefs(prefs)
	return BUILTIN_DOWNLOAD_PROFILES.map(builtin => normalized.overrides.find(profile => profile.id === builtin.id) ?? builtin)
}

export function allDownloadProfiles(prefs: DownloadProfilesPrefs | undefined): DownloadProfile[] {
	const normalized = normalizeDownloadProfilesPrefs(prefs)
	return [...overriddenBuiltinProfiles(normalized), ...normalized.custom]
}

function findDownloadProfile(ref: DownloadProfileRef, prefs: DownloadProfilesPrefs | undefined): DownloadProfile | null {
	const normalized = normalizeDownloadProfilesPrefs(prefs)
	const profiles = ref.kind === 'builtin' ? overriddenBuiltinProfiles(normalized) : normalized.custom
	return profiles.find(profile => profile.id === ref.id) ?? null
}

export function resolveActiveDownloadProfile(prefs: DownloadProfilesPrefs | undefined): {profile: DownloadProfile; ref: DownloadProfileRef} {
	const normalized = normalizeDownloadProfilesPrefs(prefs)
	const found = findDownloadProfile(normalized.active, normalized)
	if (found) return {profile: found, ref: normalized.active}
	const fallback = findDownloadProfile(DEFAULT_DOWNLOAD_PROFILE_REF, normalized) ?? BUILTIN_DOWNLOAD_PROFILES[0]
	if (!fallback) throw new Error('No built-in download profiles available')
	return {profile: fallback, ref: DEFAULT_DOWNLOAD_PROFILE_REF}
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
	if (ref.kind === 'builtin') {
		const overrides = normalized.overrides.filter(item => item.id !== profile.id)
		return {...normalized, active: activate ? ref : normalized.active, custom: normalized.custom.filter(item => item.id !== profile.id), overrides: [...overrides, profile]}
	}
	const custom = normalized.custom.filter(item => item.id !== profile.id)
	return {...normalized, active: activate ? ref : normalized.active, custom: [...custom, profile]}
}

export function removeDownloadProfileFromPrefs(prefs: DownloadProfilesPrefs, id: string): DownloadProfilesPrefs {
	const normalized = normalizeDownloadProfilesPrefs(prefs)
	if (isBuiltinDownloadProfileId(id)) {
		return {...normalized, overrides: normalized.overrides.filter(profile => profile.id !== id)}
	}
	const custom = normalized.custom.filter(profile => profile.id !== id)
	const activeRemoved = normalized.active.kind === 'custom' && normalized.active.id === id
	return {...normalized, active: activeRemoved ? DEFAULT_DOWNLOAD_PROFILE_REF : normalized.active, custom}
}

export function resolveDownloadProfile(profile: DownloadProfile, ref: DownloadProfileRef = downloadProfileRefFor(profile, undefined)): ResolvedDownloadProfile {
	const intent = mediaIntentFromProfileMedia(profile.media)
	const spec = intent ? mediaIntentSpec(intent) : null
	const isSubtitleOnly = profile.media.kind === 'subtitles-only'
	const subtitleLanguages = profile.subtitles.enabled || isSubtitleOnly ? profile.subtitles.languages : []
	const subtitleMode = profile.subtitles.mode === 'embed' && spec?.producesVideo !== true ? 'sidecar' : profile.subtitles.mode
	const subtitles: SubtitleOptions | undefined = subtitleLanguages.length > 0 ? {languages: subtitleLanguages, mode: subtitleMode, format: profile.subtitles.format, writeAuto: profile.subtitles.source !== 'manual-only'} : undefined
	const sponsorBlock: SponsorBlockOptions = !spec?.producesVideo || profile.sponsorBlock.mode === 'off' || profile.sponsorBlock.categories.length === 0 ? {mode: 'off'} : {mode: profile.sponsorBlock.mode, categories: [...profile.sponsorBlock.categories]}
	const embed: EmbedOptions = isSubtitleOnly
		? {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}
		: {chapters: profile.embed.chapters, metadata: profile.embed.metadata, thumbnail: profile.embed.thumbnail, description: profile.embed.description, thumbnailSidecar: profile.embed.thumbnailSidecar}

	return {profile, ref, intent, spec, subtitles, sponsorBlock, embed, isSubtitleOnly}
}

export function resolveDownloadProfileBaseDir(profile: DownloadProfile, context: DownloadProfileOutputContext): string {
	if (profile.output.kind === 'fixed') {
		const fixedOutputDir = profile.output.dir.trim()
		if (fixedOutputDir) return fixedOutputDir
		throw new Error('Download profile output directory is required')
	}
	const currentOutputDir = context.currentOutputDir?.trim()
	if (currentOutputDir) return currentOutputDir
	const defaultOutputDir = context.defaultOutputDir?.trim()
	if (defaultOutputDir) return defaultOutputDir
	throw new Error('Download profile output directory is required')
}

export function resolveDownloadProfileOutputDir(profile: DownloadProfile, context: DownloadProfileOutputContext): string {
	const baseDir = resolveDownloadProfileBaseDir(profile, context)
	return effectiveOutputDir(baseDir, profile.subfolder.enabled, profile.subfolder.name)
}

export function downloadProfileLabel(profile: DownloadProfile): string {
	switch (profile.media.kind) {
		case 'video-audio':
			return `Video + audio · ${videoCompatibilityLabel(profile.media.codec)} · ${videoTierLabel(profile.media.tiers)} · ${videoAudioLabel(profile.media.audio.format)}`
		case 'video-only':
			return `Video, no audio · ${videoCompatibilityLabel(profile.media.codec)} · ${videoTierLabel(profile.media.tiers)}`
		case 'audio-only':
			if (profile.media.audio.format === 'best') return 'Audio only · best'
			if (profile.media.audio.format === 'wav') return 'Audio only · WAV'
			return `Audio only · ${profile.media.audio.format.toUpperCase()} ${profile.media.audio.bitrateKbps ?? DEFAULT_AUDIO_BITRATE}K`
		case 'subtitles-only':
			return 'Subtitles only'
	}
}
