import {DEFAULTS} from '@shared/constants.js'
import type {
	AudioBitrate,
	DownloadProfile,
	DownloadProfileAudioFormat,
	DownloadProfileIcon,
	DownloadProfileSubtitleSource,
	HdrPreference,
	NativeAudioChoice,
	NativeAudioPreference,
	PlaylistVideoTier,
	SponsorBlockCategory,
	SponsorBlockMode,
	SubtitleFormat,
	SubtitleMode,
	VideoCodecPreference,
	VideoFileType,
	VideoGoal
} from '@shared/types.js'
import type {GlobalHdr} from '@shared/hdrSetting.js'
import {BUILTIN_DOWNLOAD_PROFILES, isBuiltinDownloadProfileId} from '@shared/downloadProfiles.js'
import {effectiveFileType, effectiveVideoCodec, selectionOrder, type SelectionOrder} from '@shared/selectionOrder.js'
import {DEFAULT_AUDIO_BITRATE, MAX_SUBTITLE_LANGUAGES, SPONSORBLOCK_CATEGORIES, type AiUpscaled} from '@shared/schemas.js'
import {canEmbedThumbnail, mediaIntentFromProfileMedia, mediaIntentSpec} from '@shared/mediaIntent.js'
import {isValidSubfolder, safeFolderName} from '@shared/subfolder.js'
import {type FilenameTemplateFailure, validateFilenameTemplate} from '@shared/filenameTemplate.js'

export type DownloadProfileMediaMode = DownloadProfile['media']['kind']
export type DownloadProfileAudioQuality = 'best' | '320' | '192' | '128'
// The editor's Native audio select: follow Settings, or this profile's own.
export type DownloadProfileNativeAudio = 'default' | NativeAudioPreference
// The editor's HDR video select: follow Settings, or this profile's own.
export type DownloadProfileHdr = 'default' | HdrPreference
// The editor's Video codec select: yt-dlp's own order, or one codec first.
export type DownloadProfileVideoCodec = 'auto' | VideoCodecPreference

export interface DownloadProfileDraft {
	profileId: string | null
	createdAt: string | null
	enabled: boolean
	// null: a built-in on its own name, shown in the app language. Text the user
	// clears on a built-in saves as its own name too.
	profileName: string | null
	// The name a profile saves under when its name is left empty, in the app language.
	fallbackName: string
	profileIcon: DownloadProfileIcon
	mediaMode: DownloadProfileMediaMode
	goal: VideoGoal
	resolution: PlaylistVideoTier
	fileType: VideoFileType
	nativeAudio: DownloadProfileNativeAudio
	hdr: DownloadProfileHdr
	aiUpscaled: AiUpscaled
	videoCodec: DownloadProfileVideoCodec
	audioFormat: DownloadProfileAudioFormat
	audioQuality: DownloadProfileAudioQuality
	subtitleEnabled: boolean
	subtitleLanguages: string[]
	subtitleSource: DownloadProfileSubtitleSource
	subtitleDelivery: SubtitleMode
	subtitleFormat: SubtitleFormat
	destination: string
	// Empty string means "inherit the global filename template".
	filenameTemplate: string
	saveInsideSubfolder: boolean
	subfolderName: string
	embedMetadata: boolean
	embedChapters: boolean
	embedThumbnail: boolean
	saveDescription: boolean
	saveThumbnail: boolean
	sponsorBlockMode: SponsorBlockMode
	sponsorBlockCategories: SponsorBlockCategory[]
}

export type DownloadProfileDraftAction =
	| {type: 'set-profile-name'; profileName: string}
	| {type: 'set-profile-icon'; profileIcon: DownloadProfileIcon}
	| {type: 'set-media-mode'; mediaMode: DownloadProfileMediaMode}
	| {type: 'set-goal'; goal: VideoGoal}
	| {type: 'set-resolution'; resolution: PlaylistVideoTier}
	| {type: 'set-file-type'; fileType: VideoFileType}
	| {type: 'set-native-audio'; nativeAudio: DownloadProfileNativeAudio}
	| {type: 'set-hdr'; hdr: DownloadProfileHdr}
	| {type: 'set-ai-upscaled'; aiUpscaled: AiUpscaled}
	| {type: 'set-video-codec'; videoCodec: DownloadProfileVideoCodec}
	| {type: 'set-audio-format'; audioFormat: DownloadProfileAudioFormat}
	| {type: 'set-audio-quality'; audioQuality: DownloadProfileAudioQuality}
	| {type: 'set-subtitle-enabled'; subtitleEnabled: boolean}
	| {type: 'set-subtitle-languages'; subtitleLanguages: string[]}
	| {type: 'set-subtitle-source'; subtitleSource: DownloadProfileSubtitleSource}
	| {type: 'set-subtitle-delivery'; subtitleDelivery: SubtitleMode}
	| {type: 'set-subtitle-format'; subtitleFormat: SubtitleFormat}
	| {type: 'set-destination'; destination: string}
	| {type: 'set-filename-template'; filenameTemplate: string}
	| {type: 'set-save-inside-subfolder'; saveInsideSubfolder: boolean}
	| {type: 'set-subfolder-name'; subfolderName: string}
	| {type: 'set-embed-metadata'; embedMetadata: boolean}
	| {type: 'set-embed-chapters'; embedChapters: boolean}
	| {type: 'set-embed-thumbnail'; embedThumbnail: boolean}
	| {type: 'set-save-description'; saveDescription: boolean}
	| {type: 'set-save-thumbnail'; saveThumbnail: boolean}
	| {type: 'set-sponsor-block-mode'; sponsorBlockMode: SponsorBlockMode}
	| {type: 'toggle-sponsor-block-category'; category: SponsorBlockCategory}

export interface DownloadProfileDraftValidation {
	subfolderInvalid: boolean
	filenameTemplateError: FilenameTemplateFailure | null
	// Subtitles are on but no language is chosen: media profiles would silently
	// download without subtitles, and subtitles-only profiles cannot be queued.
	subtitleLanguagesMissing: boolean
}

export const SMART_TV_MP4_MAX_TIER: PlaylistVideoTier = '1080'
export const SMART_TV_MP4_BLOCKED_TIERS = new Set<PlaylistVideoTier>(['best', '2160', '1440'])

function defaultProfileSubfolderName(name: string, fallbackName: string): string {
	return safeFolderName(name.trim() || fallbackName)
}

// What a new profile starts from that depends on the app language: the name it
// saves under when left empty, and the subtitle language it asks for.
export interface NewProfileDefaults {
	fallbackName: string
	subtitleLanguage: string
}

// The folder a profile saves into when its subfolder field is left empty: a
// built-in's own, which no rename moves, or one named after a custom profile.
export function draftDefaultSubfolderName(draft: Pick<DownloadProfileDraft, 'profileId' | 'profileName' | 'fallbackName'>): string {
	const builtin = BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === draft.profileId)
	return builtin ? builtin.subfolder.name : defaultProfileSubfolderName(draft.profileName ?? '', draft.fallbackName)
}

function smartTvCompatibleResolution(goal: VideoGoal, resolution: PlaylistVideoTier): PlaylistVideoTier {
	return goal === 'smart-tv' && SMART_TV_MP4_BLOCKED_TIERS.has(resolution) ? SMART_TV_MP4_MAX_TIER : resolution
}

function bitrateToQuality(bitrateKbps: number | undefined): DownloadProfileAudioQuality {
	if (bitrateKbps === 320) return '320'
	if (bitrateKbps === 128) return '128'
	return bitrateKbps === undefined ? 'best' : '192'
}

function videoMedia(profile: DownloadProfile | null): Extract<DownloadProfile['media'], {kind: 'video-audio' | 'video-only'}> | null {
	const media = profile?.media
	return media?.kind === 'video-audio' || media?.kind === 'video-only' ? media : null
}

function initialAudioFormat(profile: DownloadProfile | null): DownloadProfileAudioFormat {
	const media = profile?.media
	return media?.kind === 'audio-only' ? media.audio.format : 'best'
}

function initialNativeAudio(profile: DownloadProfile | null): DownloadProfileNativeAudio {
	const media = profile?.media
	return media?.kind === 'video-audio' && media.audio.native.kind === 'custom' ? media.audio.native.preference : 'default'
}

function initialHdr(profile: DownloadProfile | null): DownloadProfileHdr {
	const media = profile?.media
	return (media?.kind === 'video-audio' || media?.kind === 'video-only') && media.hdr?.kind === 'custom' ? media.hdr.preference : 'default'
}

function initialAiUpscaled(profile: DownloadProfile | null): AiUpscaled {
	const media = profile?.media
	return (media?.kind === 'video-audio' || media?.kind === 'video-only') && media.aiUpscaled === 'allow' ? 'allow' : 'skip'
}

function initialVideoCodec(profile: DownloadProfile | null): DownloadProfileVideoCodec {
	return videoMedia(profile)?.videoCodec ?? 'auto'
}

// A codec preference the goal and file type can't use (Smart TV; H.264 in
// WebM) goes back to Auto, as Smart TV's WebM goes back to Auto.
function withVideoCodec(draft: DownloadProfileDraft, videoCodec: DownloadProfileVideoCodec): DownloadProfileDraft {
	return {...draft, videoCodec: effectiveVideoCodec(draft.goal, draft.fileType, videoCodec === 'auto' ? undefined : videoCodec) ?? 'auto'}
}

function nativeAudioChoice(nativeAudio: DownloadProfileNativeAudio): NativeAudioChoice {
	return nativeAudio === 'default' ? {kind: 'default'} : {kind: 'custom', preference: nativeAudio}
}

export function createDownloadProfileDraft(initialProfile: DownloadProfile | null, newProfile: NewProfileDefaults): DownloadProfileDraft {
	const profileName = initialProfile ? (initialProfile.name ?? null) : ''
	const video = videoMedia(initialProfile)
	const goal = video?.goal ?? 'smart-tv'
	const resolution = smartTvCompatibleResolution(goal, video?.tier ?? '1080')
	return {
		profileId: initialProfile?.id ?? null,
		createdAt: initialProfile?.createdAt ?? null,
		enabled: initialProfile?.enabled ?? true,
		profileName,
		fallbackName: newProfile.fallbackName,
		profileIcon: initialProfile?.icon ?? 'captions',
		mediaMode: initialProfile?.media.kind ?? 'video-audio',
		goal,
		resolution,
		fileType: effectiveFileType(goal, video?.fileType ?? 'auto'),
		nativeAudio: initialNativeAudio(initialProfile),
		hdr: initialHdr(initialProfile),
		aiUpscaled: initialAiUpscaled(initialProfile),
		videoCodec: initialVideoCodec(initialProfile),
		audioFormat: initialAudioFormat(initialProfile),
		audioQuality: initialProfile?.media.kind === 'audio-only' ? bitrateToQuality(initialProfile.media.audio.bitrateKbps) : '192',
		subtitleEnabled: initialProfile ? initialProfile.subtitles.enabled || initialProfile.media.kind === 'subtitles-only' : true,
		subtitleLanguages: initialProfile ? initialProfile.subtitles.languages : [newProfile.subtitleLanguage],
		subtitleSource: initialProfile?.subtitles.source ?? 'manual-first',
		subtitleDelivery: initialProfile?.subtitles.mode ?? 'sidecar',
		subtitleFormat: initialProfile?.subtitles.format ?? 'srt',
		destination: initialProfile?.output.kind === 'fixed' ? initialProfile.output.dir : '',
		filenameTemplate: initialProfile?.filename.kind === 'custom' ? initialProfile.filename.template : '',
		saveInsideSubfolder: initialProfile?.subfolder.enabled ?? true,
		subfolderName: initialProfile?.subfolder.name ?? defaultProfileSubfolderName(profileName ?? '', newProfile.fallbackName),
		embedMetadata: initialProfile?.embed.metadata ?? true,
		embedChapters: initialProfile?.embed.chapters ?? true,
		embedThumbnail: initialProfile?.embed.thumbnail ?? DEFAULTS.embedThumbnail,
		saveDescription: initialProfile?.embed.description ?? true,
		saveThumbnail: initialProfile?.embed.thumbnailSidecar ?? true,
		sponsorBlockMode: initialProfile?.sponsorBlock.mode ?? 'off',
		sponsorBlockCategories: initialSponsorBlockCategories(initialProfile)
	}
}

export function updateDownloadProfileDraft(draft: DownloadProfileDraft, action: DownloadProfileDraftAction): DownloadProfileDraft {
	switch (action.type) {
		case 'set-profile-name': {
			const renamed = {...draft, profileName: action.profileName}
			return draft.subfolderName === draftDefaultSubfolderName(draft) ? {...renamed, subfolderName: draftDefaultSubfolderName(renamed)} : renamed
		}
		case 'set-profile-icon':
			return {...draft, profileIcon: action.profileIcon}
		case 'set-media-mode':
			if (action.mediaMode === 'audio-only') return {...draft, mediaMode: action.mediaMode, audioFormat: 'best', audioQuality: 'best'}
			return {...draft, mediaMode: action.mediaMode, subtitleEnabled: action.mediaMode === 'subtitles-only' ? true : draft.subtitleEnabled}
		case 'set-goal':
			return withVideoCodec({...draft, goal: action.goal, resolution: smartTvCompatibleResolution(action.goal, draft.resolution), fileType: effectiveFileType(action.goal, draft.fileType)}, draft.videoCodec)
		case 'set-resolution':
			return {...draft, resolution: smartTvCompatibleResolution(draft.goal, action.resolution)}
		case 'set-file-type':
			return withVideoCodec({...draft, fileType: effectiveFileType(draft.goal, action.fileType)}, draft.videoCodec)
		case 'set-native-audio':
			return {...draft, nativeAudio: action.nativeAudio}
		case 'set-hdr':
			return {...draft, hdr: action.hdr}
		case 'set-ai-upscaled':
			return {...draft, aiUpscaled: action.aiUpscaled}
		case 'set-video-codec':
			return withVideoCodec(draft, action.videoCodec)
		case 'set-audio-format':
			return {...draft, audioFormat: action.audioFormat}
		case 'set-audio-quality':
			return {...draft, audioQuality: action.audioQuality}
		case 'set-subtitle-enabled':
			return {...draft, subtitleEnabled: action.subtitleEnabled}
		case 'set-subtitle-languages':
			return {...draft, subtitleLanguages: [...new Set(action.subtitleLanguages)].slice(0, MAX_SUBTITLE_LANGUAGES)}
		case 'set-subtitle-source':
			return {...draft, subtitleSource: action.subtitleSource}
		case 'set-subtitle-delivery':
			return {...draft, subtitleDelivery: action.subtitleDelivery}
		case 'set-subtitle-format':
			return {...draft, subtitleFormat: action.subtitleFormat}
		case 'set-destination':
			return {...draft, destination: action.destination}
		case 'set-filename-template':
			return {...draft, filenameTemplate: action.filenameTemplate}
		case 'set-save-inside-subfolder':
			return {...draft, saveInsideSubfolder: action.saveInsideSubfolder}
		case 'set-subfolder-name':
			return {...draft, subfolderName: action.subfolderName}
		case 'set-embed-metadata':
			return {...draft, embedMetadata: action.embedMetadata}
		case 'set-embed-chapters':
			return {...draft, embedChapters: action.embedChapters}
		case 'set-embed-thumbnail':
			return {...draft, embedThumbnail: action.embedThumbnail}
		case 'set-save-description':
			return {...draft, saveDescription: action.saveDescription}
		case 'set-save-thumbnail':
			return {...draft, saveThumbnail: action.saveThumbnail}
		case 'set-sponsor-block-mode':
			return {...draft, sponsorBlockMode: action.sponsorBlockMode}
		case 'toggle-sponsor-block-category': {
			const selected = new Set(draft.sponsorBlockCategories)
			if (selected.has(action.category)) selected.delete(action.category)
			else selected.add(action.category)
			return {...draft, sponsorBlockCategories: SPONSORBLOCK_CATEGORIES.filter(category => selected.has(category))}
		}
	}
}

// An active mode keeps exactly what was saved, even an empty selection. A profile
// saved with SponsorBlock off stores no categories, so turning it on again starts
// from the same defaults the wizard uses.
function initialSponsorBlockCategories(initialProfile: DownloadProfile | null): SponsorBlockCategory[] {
	if (!initialProfile) return [...DEFAULTS.sponsorBlockCategories]
	const {mode, categories} = initialProfile.sponsorBlock
	if (mode !== 'off' || categories.length > 0) return [...categories]
	return [...DEFAULTS.sponsorBlockCategories]
}

function profileMediaFromDraft(draft: DownloadProfileDraft): DownloadProfile['media'] {
	if (draft.mediaMode === 'audio-only') return {kind: 'audio-only', audio: draft.audioFormat === 'best' || draft.audioFormat === 'wav' ? {format: draft.audioFormat} : {format: draft.audioFormat, bitrateKbps: audioBitrateFromQuality(draft.audioQuality)}}
	if (draft.mediaMode === 'subtitles-only') return {kind: 'subtitles-only'}
	// Absent `hdr` follows the app setting, absent `aiUpscaled` skips and absent
	// `videoCodec` keeps yt-dlp's order, so only a choice that differs is stored.
	const fileType = effectiveFileType(draft.goal, draft.fileType)
	const videoCodec = draft.videoCodec === 'auto' ? null : effectiveVideoCodec(draft.goal, fileType, draft.videoCodec)
	const video = {goal: draft.goal, tier: draft.resolution, fileType, ...(draft.hdr === 'default' ? {} : {hdr: {kind: 'custom' as const, preference: draft.hdr}}), ...(draft.aiUpscaled === 'allow' ? {aiUpscaled: 'allow' as const} : {}), ...(videoCodec === null ? {} : {videoCodec})}
	if (draft.mediaMode === 'video-audio') return {kind: draft.mediaMode, ...video, audio: {native: nativeAudioChoice(draft.nativeAudio)}}
	return {kind: draft.mediaMode, ...video}
}

// The order the draft would pick streams by, for the editor's summary and list.
// Null when the draft has no video.
export function draftSelectionOrder(draft: DownloadProfileDraft, globalNativeAudio: NativeAudioPreference, globalHdr: GlobalHdr): SelectionOrder | null {
	const media = profileMediaFromDraft(draft)
	return media.kind === 'video-audio' || media.kind === 'video-only' ? selectionOrder(media, globalNativeAudio, globalHdr) : null
}

export function canDraftEmbedThumbnail(draft: DownloadProfileDraft): boolean {
	const intent = mediaIntentFromProfileMedia(profileMediaFromDraft(draft))
	return intent !== null && canEmbedThumbnail(mediaIntentSpec(intent))
}

export function validateDownloadProfileDraft(draft: DownloadProfileDraft): DownloadProfileDraftValidation {
	// An empty template is not an error — it means "inherit the global one".
	const template = draft.filenameTemplate.trim()
	const validation = template ? validateFilenameTemplate(template) : {ok: true as const}
	return {subfolderInvalid: draft.saveInsideSubfolder && draft.subfolderName.trim() !== '' && !isValidSubfolder(draft.subfolderName), filenameTemplateError: validation.ok ? null : validation, subtitleLanguagesMissing: effectiveSubtitleEnabled(draft) && draft.subtitleLanguages.length === 0}
}

function audioBitrateFromQuality(audioQuality: DownloadProfileAudioQuality): AudioBitrate {
	return audioQuality === 'best' ? DEFAULT_AUDIO_BITRATE : (Number(audioQuality) as AudioBitrate)
}

function effectiveSubtitleEnabled(draft: DownloadProfileDraft): boolean {
	return draft.mediaMode === 'subtitles-only' || draft.subtitleEnabled
}

function savedProfileName(draft: DownloadProfileDraft): string | undefined {
	const typed = draft.profileName?.trim() ?? ''
	if (typed) return typed
	return draft.profileId !== null && isBuiltinDownloadProfileId(draft.profileId) ? undefined : draft.fallbackName
}

export function downloadProfileFromDraft(draft: DownloadProfileDraft, now: string, idFactory: () => string): DownloadProfile {
	const showVideo = draft.mediaMode === 'video-audio' || draft.mediaMode === 'video-only'
	const subtitlesEnabled = effectiveSubtitleEnabled(draft)
	return {
		id: draft.profileId ?? idFactory(),
		name: savedProfileName(draft),
		icon: draft.profileIcon,
		enabled: draft.enabled,
		media: profileMediaFromDraft(draft),
		subtitles: {enabled: subtitlesEnabled, languages: subtitlesEnabled ? draft.subtitleLanguages : [], source: draft.subtitleSource, mode: draft.subtitleDelivery, format: draft.subtitleFormat},
		output: draft.destination.trim() ? {kind: 'fixed', dir: draft.destination.trim()} : {kind: 'default'},
		filename: draft.filenameTemplate.trim() ? {kind: 'custom', template: draft.filenameTemplate.trim()} : {kind: 'default'},
		subfolder: {enabled: draft.saveInsideSubfolder, name: draft.saveInsideSubfolder ? draft.subfolderName.trim() || draftDefaultSubfolderName(draft) : ''},
		sponsorBlock: {mode: showVideo ? draft.sponsorBlockMode : 'off', categories: showVideo && draft.sponsorBlockMode !== 'off' ? [...draft.sponsorBlockCategories] : []},
		embed: {chapters: showVideo && draft.embedChapters, metadata: draft.embedMetadata, thumbnail: draft.embedThumbnail && canDraftEmbedThumbnail(draft), description: draft.saveDescription, thumbnailSidecar: draft.saveThumbnail},
		createdAt: draft.createdAt ?? now,
		updatedAt: now
	}
}
