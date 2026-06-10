import {DEFAULTS} from '@shared/constants.js'
import type {AudioBitrate, DownloadProfile, DownloadProfileAudioFormat, DownloadProfileIcon, DownloadProfileSubtitleSource, PlaylistVideoCodec, PlaylistVideoTier, SponsorBlockMode, SubtitleFormat, SubtitleMode} from '@shared/types.js'
import {DEFAULT_AUDIO_BITRATE} from '@shared/schemas.js'
import {isValidSubfolder, safeFolderName} from '@shared/subfolder.js'

export type DownloadProfileMediaMode = DownloadProfile['media']['kind']
export type DownloadProfileAudioQuality = 'best' | '320' | '192' | '128'
export type DownloadProfilePlaylistCap = 'confirm' | '100' | '250' | '500' | '1000'

export interface DownloadProfileDraft {
	profileId: string | null
	createdAt: string | null
	profileName: string
	profileIcon: DownloadProfileIcon
	mediaMode: DownloadProfileMediaMode
	codec: PlaylistVideoCodec
	resolution: PlaylistVideoTier
	audioFormat: DownloadProfileAudioFormat
	audioQuality: DownloadProfileAudioQuality
	subtitleEnabled: boolean
	subtitleLanguages: string[]
	subtitleLanguageDraft: string
	subtitleSource: DownloadProfileSubtitleSource
	subtitleDelivery: SubtitleMode
	subtitleFormat: SubtitleFormat
	destination: string
	saveInsideSubfolder: boolean
	subfolderName: string
	embedMetadata: boolean
	embedChapters: boolean
	saveDescription: boolean
	saveThumbnail: boolean
	sponsorBlockMode: SponsorBlockMode
	playlistCap: DownloadProfilePlaylistCap
}

export type DownloadProfileDraftAction =
	| {type: 'set-profile-name'; profileName: string}
	| {type: 'set-profile-icon'; profileIcon: DownloadProfileIcon}
	| {type: 'set-media-mode'; mediaMode: DownloadProfileMediaMode}
	| {type: 'set-codec'; codec: PlaylistVideoCodec}
	| {type: 'set-resolution'; resolution: PlaylistVideoTier}
	| {type: 'set-audio-format'; audioFormat: DownloadProfileAudioFormat}
	| {type: 'set-audio-quality'; audioQuality: DownloadProfileAudioQuality}
	| {type: 'set-subtitle-enabled'; subtitleEnabled: boolean}
	| {type: 'set-subtitle-languages'; subtitleLanguages: string[]}
	| {type: 'set-subtitle-language-draft'; subtitleLanguageDraft: string}
	| {type: 'add-subtitle-languages'}
	| {type: 'remove-subtitle-language'; code: string}
	| {type: 'set-subtitle-source'; subtitleSource: DownloadProfileSubtitleSource}
	| {type: 'set-subtitle-delivery'; subtitleDelivery: SubtitleMode}
	| {type: 'set-subtitle-format'; subtitleFormat: SubtitleFormat}
	| {type: 'set-destination'; destination: string}
	| {type: 'set-save-inside-subfolder'; saveInsideSubfolder: boolean}
	| {type: 'set-subfolder-name'; subfolderName: string}
	| {type: 'set-embed-metadata'; embedMetadata: boolean}
	| {type: 'set-embed-chapters'; embedChapters: boolean}
	| {type: 'set-save-description'; saveDescription: boolean}
	| {type: 'set-save-thumbnail'; saveThumbnail: boolean}
	| {type: 'set-sponsor-block-mode'; sponsorBlockMode: SponsorBlockMode}
	| {type: 'set-playlist-cap'; playlistCap: DownloadProfilePlaylistCap}

export interface DownloadProfileDraftValidation {
	subfolderInvalid: boolean
}

const SMART_TV_MP4_MAX_TIER: PlaylistVideoTier = '1080'
const SMART_TV_MP4_BLOCKED_TIERS = new Set<PlaylistVideoTier>(['best', '2160', '1440'])

export function defaultProfileSubfolderName(name: string): string {
	return safeFolderName(name.trim() || 'Download Profile')
}

function smartTvCompatibleResolution(codec: PlaylistVideoCodec, resolution: PlaylistVideoTier): PlaylistVideoTier {
	return codec === 'mp4' && SMART_TV_MP4_BLOCKED_TIERS.has(resolution) ? SMART_TV_MP4_MAX_TIER : resolution
}

function parseLanguageCodes(value: string): string[] {
	return value
		.split(/[\s,]+/)
		.map(code => code.trim().toLowerCase())
		.filter(code => /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/.test(code))
}

function bitrateToQuality(bitrateKbps: number | undefined): DownloadProfileAudioQuality {
	if (bitrateKbps === 320) return '320'
	if (bitrateKbps === 128) return '128'
	return bitrateKbps === undefined ? 'best' : '192'
}

function playlistCapToControlValue(cap: DownloadProfile['playlistProbeCap'] | undefined): DownloadProfilePlaylistCap {
	if (cap === 100 || cap === 250 || cap === 500 || cap === 1000) return String(cap) as DownloadProfilePlaylistCap
	return 'confirm'
}

function initialCodec(profile: DownloadProfile | null): PlaylistVideoCodec {
	const media = profile?.media
	return media?.kind === 'video-audio' || media?.kind === 'video-only' ? media.codec : 'mp4'
}

function initialResolution(profile: DownloadProfile | null): PlaylistVideoTier {
	const media = profile?.media
	return media?.kind === 'video-audio' || media?.kind === 'video-only' ? (media.tiers[0] ?? '1080') : '1080'
}

function initialAudioFormat(profile: DownloadProfile | null): DownloadProfileAudioFormat {
	const media = profile?.media
	if (media?.kind === 'audio-only') return media.audio.format
	if (media?.kind === 'video-audio') return media.audio.format
	return 'm4a'
}

function nextVideoAudioFormat(codec: PlaylistVideoCodec): Extract<DownloadProfileAudioFormat, 'best' | 'm4a'> {
	return codec === 'mp4' ? 'm4a' : 'best'
}

export function createDownloadProfileDraft(initialProfile: DownloadProfile | null): DownloadProfileDraft {
	const profileName = initialProfile?.name ?? 'Study Captions'
	const codec = initialCodec(initialProfile)
	const resolution = smartTvCompatibleResolution(codec, initialResolution(initialProfile))
	return {
		profileId: initialProfile?.id ?? null,
		createdAt: initialProfile?.createdAt ?? null,
		profileName,
		profileIcon: initialProfile?.icon ?? 'captions',
		mediaMode: initialProfile?.media.kind ?? 'video-audio',
		codec,
		resolution,
		audioFormat: initialAudioFormat(initialProfile),
		audioQuality: initialProfile?.media.kind === 'audio-only' ? bitrateToQuality(initialProfile.media.audio.bitrateKbps) : '192',
		subtitleEnabled: initialProfile ? initialProfile.subtitles.enabled || initialProfile.media.kind === 'subtitles-only' : true,
		subtitleLanguages: initialProfile ? initialProfile.subtitles.languages : ['en', 'uk'],
		subtitleLanguageDraft: '',
		subtitleSource: initialProfile?.subtitles.source ?? 'manual-first',
		subtitleDelivery: initialProfile?.subtitles.mode ?? 'sidecar',
		subtitleFormat: initialProfile?.subtitles.format ?? 'srt',
		destination: initialProfile?.output.kind === 'fixed' ? initialProfile.output.dir : '',
		saveInsideSubfolder: initialProfile?.subfolder.enabled ?? true,
		subfolderName: initialProfile?.subfolder.name ?? defaultProfileSubfolderName(profileName),
		embedMetadata: initialProfile?.embed.metadata ?? true,
		embedChapters: initialProfile?.embed.chapters ?? true,
		saveDescription: initialProfile?.embed.description ?? true,
		saveThumbnail: initialProfile?.embed.thumbnailSidecar ?? true,
		sponsorBlockMode: initialProfile?.sponsorBlock.mode ?? 'off',
		playlistCap: playlistCapToControlValue(initialProfile?.playlistProbeCap)
	}
}

export function updateDownloadProfileDraft(draft: DownloadProfileDraft, action: DownloadProfileDraftAction): DownloadProfileDraft {
	switch (action.type) {
		case 'set-profile-name': {
			const previousDefaultSubfolder = defaultProfileSubfolderName(draft.profileName)
			const nextDefaultSubfolder = defaultProfileSubfolderName(action.profileName)
			return {...draft, profileName: action.profileName, subfolderName: draft.subfolderName === previousDefaultSubfolder ? nextDefaultSubfolder : draft.subfolderName}
		}
		case 'set-profile-icon':
			return {...draft, profileIcon: action.profileIcon}
		case 'set-media-mode':
			if (action.mediaMode === 'audio-only') return {...draft, mediaMode: action.mediaMode, audioFormat: 'best', audioQuality: 'best'}
			return {...draft, mediaMode: action.mediaMode, subtitleEnabled: action.mediaMode === 'subtitles-only' ? true : draft.subtitleEnabled, audioFormat: nextVideoAudioFormat(draft.codec), audioQuality: 'best'}
		case 'set-codec':
			return {...draft, codec: action.codec, resolution: smartTvCompatibleResolution(action.codec, draft.resolution), audioFormat: draft.mediaMode === 'video-audio' ? nextVideoAudioFormat(action.codec) : draft.audioFormat}
		case 'set-resolution':
			return {...draft, resolution: smartTvCompatibleResolution(draft.codec, action.resolution)}
		case 'set-audio-format':
			return {...draft, audioFormat: action.audioFormat}
		case 'set-audio-quality':
			return {...draft, audioQuality: action.audioQuality}
		case 'set-subtitle-enabled':
			return {...draft, subtitleEnabled: action.subtitleEnabled}
		case 'set-subtitle-languages':
			return {...draft, subtitleLanguages: [...action.subtitleLanguages]}
		case 'set-subtitle-language-draft':
			return {...draft, subtitleLanguageDraft: action.subtitleLanguageDraft}
		case 'add-subtitle-languages': {
			const nextCodes = parseLanguageCodes(draft.subtitleLanguageDraft)
			if (nextCodes.length === 0) return draft
			return {...draft, subtitleLanguages: [...new Set([...draft.subtitleLanguages, ...nextCodes])], subtitleLanguageDraft: ''}
		}
		case 'remove-subtitle-language':
			return {...draft, subtitleLanguages: draft.subtitleLanguages.filter(item => item !== action.code)}
		case 'set-subtitle-source':
			return {...draft, subtitleSource: action.subtitleSource}
		case 'set-subtitle-delivery':
			return {...draft, subtitleDelivery: action.subtitleDelivery}
		case 'set-subtitle-format':
			return {...draft, subtitleFormat: action.subtitleFormat}
		case 'set-destination':
			return {...draft, destination: action.destination}
		case 'set-save-inside-subfolder':
			return {...draft, saveInsideSubfolder: action.saveInsideSubfolder}
		case 'set-subfolder-name':
			return {...draft, subfolderName: action.subfolderName}
		case 'set-embed-metadata':
			return {...draft, embedMetadata: action.embedMetadata}
		case 'set-embed-chapters':
			return {...draft, embedChapters: action.embedChapters}
		case 'set-save-description':
			return {...draft, saveDescription: action.saveDescription}
		case 'set-save-thumbnail':
			return {...draft, saveThumbnail: action.saveThumbnail}
		case 'set-sponsor-block-mode':
			return {...draft, sponsorBlockMode: action.sponsorBlockMode}
		case 'set-playlist-cap':
			return {...draft, playlistCap: action.playlistCap}
	}
}

export function validateDownloadProfileDraft(draft: DownloadProfileDraft): DownloadProfileDraftValidation {
	return {subfolderInvalid: draft.saveInsideSubfolder && draft.subfolderName.trim() !== '' && !isValidSubfolder(draft.subfolderName)}
}

function audioBitrateFromQuality(audioQuality: DownloadProfileAudioQuality): AudioBitrate {
	return audioQuality === 'best' ? DEFAULT_AUDIO_BITRATE : (Number(audioQuality) as AudioBitrate)
}

function effectiveSubtitleEnabled(draft: DownloadProfileDraft): boolean {
	return draft.mediaMode === 'subtitles-only' || draft.subtitleEnabled
}

function videoAudioFormat(draft: DownloadProfileDraft): Extract<DownloadProfileAudioFormat, 'best' | 'm4a'> {
	return draft.audioFormat === 'm4a' ? 'm4a' : 'best'
}

export function downloadProfileFromDraft(draft: DownloadProfileDraft, now: string, idFactory: () => string): DownloadProfile {
	const showVideo = draft.mediaMode === 'video-audio' || draft.mediaMode === 'video-only'
	const subtitlesEnabled = effectiveSubtitleEnabled(draft)
	return {
		id: draft.profileId ?? idFactory(),
		name: draft.profileName.trim() || 'Download Profile',
		icon: draft.profileIcon,
		media:
			draft.mediaMode === 'audio-only'
				? {kind: 'audio-only', audio: draft.audioFormat === 'best' || draft.audioFormat === 'wav' ? {format: draft.audioFormat} : {format: draft.audioFormat, bitrateKbps: audioBitrateFromQuality(draft.audioQuality)}}
				: draft.mediaMode === 'subtitles-only'
					? {kind: 'subtitles-only'}
					: draft.mediaMode === 'video-audio'
						? {kind: draft.mediaMode, codec: draft.codec, tiers: [draft.resolution], audio: {format: videoAudioFormat(draft)}}
						: {kind: draft.mediaMode, codec: draft.codec, tiers: [draft.resolution]},
		subtitles: {enabled: subtitlesEnabled, languages: subtitlesEnabled ? draft.subtitleLanguages : [], source: draft.subtitleSource, mode: draft.subtitleDelivery, format: draft.subtitleFormat},
		output: draft.destination.trim() ? {kind: 'fixed', dir: draft.destination.trim()} : {kind: 'default'},
		subfolder: {enabled: draft.saveInsideSubfolder, name: draft.saveInsideSubfolder ? draft.subfolderName.trim() || defaultProfileSubfolderName(draft.profileName) : ''},
		sponsorBlock: {mode: showVideo ? draft.sponsorBlockMode : 'off', categories: showVideo && draft.sponsorBlockMode !== 'off' ? [...DEFAULTS.sponsorBlockCategories] : []},
		embed: {chapters: showVideo && draft.embedChapters, metadata: draft.embedMetadata, thumbnail: false, description: draft.saveDescription, thumbnailSidecar: draft.saveThumbnail},
		playlistProbeCap: draft.playlistCap === 'confirm' ? 'confirm' : Number(draft.playlistCap),
		createdAt: draft.createdAt ?? now,
		updatedAt: now
	}
}
