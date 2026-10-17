// A single-video interactive download starts from a download profile. This
// module is the pure bridge between the two: profile + probe → every wizard
// setting (the "baseline"), the wizard's current settings → which areas the
// user changed, and those settings → a profile to save. Kept I/O-free so the
// store slices only call it and `set()` the result.

import {resolveFilenameTemplate} from '@shared/downloadProfiles.js'
import {isH264, resolveProfileSelection, videoHeight, type FitNotice} from '@shared/profileSelection.js'
import {PLAYLIST_VIDEO_TIERS} from '@shared/schemas.js'
import type {AudioSelection, DownloadProfile, NativeAudioPreference, PlaylistVideoTier, SponsorBlockCategory, SponsorBlockMode, SubtitleFormat, SubtitleMode, WizardMediaKind} from '@shared/schemas.js'
import type {FormatOption, SubtitleMap} from '@shared/types.js'

export interface WizardSettingsSnapshot {
	mediaKind: WizardMediaKind
	videoFormatId: string
	audioSelection: AudioSelection
	subtitleLanguages: string[]
	subtitleMode: SubtitleMode
	subtitleFormat: SubtitleFormat
	sponsorBlockMode: SponsorBlockMode
	sponsorBlockCategories: SponsorBlockCategory[]
	embed: DownloadProfile['embed']
	outputDir: string
	subfolderEnabled: boolean
	subfolderName: string
	filenameTemplate: string
}

export interface ProfileApplicationInput {
	profile: DownloadProfile
	formats: readonly FormatOption[]
	subtitles: SubtitleMap
	automaticCaptions: SubtitleMap
	isAudioOnlySource: boolean
	nativeAudioPreference: NativeAudioPreference
	// Folder a `default`-output profile saves into: the global download folder.
	baseOutputDir: string
	globalFilenameTemplate: string | undefined
}

export function applyProfileToWizard(input: ProfileApplicationInput): {snapshot: WizardSettingsSnapshot; notices: FitNotice[]} {
	const {profile} = input
	const selection = resolveProfileSelection(input)
	const outputDir = profile.output.kind === 'fixed' ? profile.output.dir : input.baseOutputDir
	return {
		snapshot: {
			mediaKind: selection.media.kind,
			videoFormatId: selection.media.videoFormatId,
			audioSelection: selection.media.audioSelection,
			subtitleLanguages: selection.subtitleLanguages,
			subtitleMode: profile.subtitles.mode,
			subtitleFormat: profile.subtitles.format,
			sponsorBlockMode: profile.sponsorBlock.mode,
			sponsorBlockCategories: [...profile.sponsorBlock.categories],
			embed: {...profile.embed},
			outputDir,
			subfolderEnabled: profile.subfolder.enabled,
			subfolderName: profile.subfolder.name,
			filenameTemplate: resolveFilenameTemplate(profile, input.globalFilenameTemplate)
		},
		notices: selection.notices
	}
}

// The Review screen's rows, in screen order. `format` covers the Format screen.
export type ChangedArea = 'format' | 'subtitles' | 'sponsorBlock' | 'extras' | 'saveTo' | 'fileName'
export type ReviewRow = Exclude<ChangedArea, 'format'>

function sameSet<T>(a: readonly T[], b: readonly T[]): boolean {
	return a.length === b.length && a.every(item => b.includes(item))
}

function sameAudio(a: AudioSelection, b: AudioSelection): boolean {
	return JSON.stringify(a) === JSON.stringify(b)
}

export function changedFromProfile(baseline: WizardSettingsSnapshot, current: WizardSettingsSnapshot): ChangedArea[] {
	const changed: ChangedArea[] = []
	if (baseline.mediaKind !== current.mediaKind || baseline.videoFormatId !== current.videoFormatId || !sameAudio(baseline.audioSelection, current.audioSelection)) changed.push('format')
	if (!sameSet(baseline.subtitleLanguages, current.subtitleLanguages) || baseline.subtitleMode !== current.subtitleMode || baseline.subtitleFormat !== current.subtitleFormat) changed.push('subtitles')
	if (baseline.sponsorBlockMode !== current.sponsorBlockMode || !sameSet(baseline.sponsorBlockCategories, current.sponsorBlockCategories)) changed.push('sponsorBlock')
	if (JSON.stringify(baseline.embed) !== JSON.stringify(current.embed)) changed.push('extras')
	if (baseline.outputDir !== current.outputDir || baseline.subfolderEnabled !== current.subfolderEnabled || baseline.subfolderName !== current.subfolderName) changed.push('saveTo')
	if (baseline.filenameTemplate !== current.filenameTemplate) changed.push('fileName')
	return changed
}

export interface SaveProfileContext {
	id: string
	name: string
	now: string
	defaultOutputDir: string
	globalFilenameTemplate: string | undefined
	// The probe's tracks, to tell which picked subtitles are uploaded and which
	// auto-generated (YouTube marks auto keys with `-orig`; other sites don't).
	subtitles: SubtitleMap
	automaticCaptions: SubtitleMap
}

const NUMERIC_TIERS = PLAYLIST_VIDEO_TIERS.filter((tier): tier is Exclude<PlaylistVideoTier, 'best'> => tier !== 'best')

function tierFor(video: FormatOption, formats: readonly FormatOption[]): PlaylistVideoTier {
	if (formats.find(f => !f.isAudioOnly)?.formatId === video.formatId) return 'best'
	const height = videoHeight(video.resolution)
	return NUMERIC_TIERS.find(tier => Number(tier) <= height) ?? '144'
}

function audioOnlyMedia(selection: AudioSelection): Extract<DownloadProfile['media'], {kind: 'audio-only'}> {
	if (selection.kind === 'convert-lossy') return {kind: 'audio-only', audio: {format: selection.target, bitrateKbps: selection.bitrateKbps}}
	if (selection.kind === 'convert-lossless') return {kind: 'audio-only', audio: {format: 'wav'}}
	return {kind: 'audio-only', audio: {format: 'best'}}
}

// A concrete stream only approximates a profile's intent ("up to 1080p" on a
// video that tops out at 480p; the top stream standing in for "best"), so the
// video and audio halves are each rebuilt only when the user changed them.
function mediaFromWizard(base: DownloadProfile, baseline: WizardSettingsSnapshot, snapshot: WizardSettingsSnapshot, formats: readonly FormatOption[]): DownloadProfile['media'] {
	if (snapshot.mediaKind === 'subtitles') return {kind: 'subtitles-only'}
	if (snapshot.mediaKind === 'audio') return audioOnlyMedia(snapshot.audioSelection)
	const video = formats.find(f => f.formatId === snapshot.videoFormatId)
	if (!video) return base.media
	const baseVideo = base.media.kind === 'video-audio' || base.media.kind === 'video-only' ? base.media : null
	const videoChanged = baseVideo === null || baseline.mediaKind !== 'video' || baseline.videoFormatId !== snapshot.videoFormatId
	const codec = !videoChanged && baseVideo ? baseVideo.codec : baseVideo?.codec === 'mp4' && isH264(video) ? 'mp4' : 'best'
	const tiers = !videoChanged && baseVideo ? [...baseVideo.tiers] : [tierFor(video, formats)]
	if (snapshot.audioSelection.kind === 'none' && video.isVideoOnly) return {kind: 'video-only', codec, tiers}
	const audioChanged = !sameAudio(baseline.audioSelection, snapshot.audioSelection)
	if (!audioChanged && base.media.kind === 'video-audio') return {kind: 'video-audio', codec, tiers, audio: {...base.media.audio}}
	const audioId = snapshot.audioSelection.kind === 'native' ? snapshot.audioSelection.formatId : null
	const pickedM4a = audioId !== null && formats.find(f => f.formatId === audioId)?.ext === 'm4a'
	return {kind: 'video-audio', codec, tiers, audio: {format: pickedM4a ? 'm4a' : 'best'}}
}

function baseLanguageCode(trackKey: string): string {
	return trackKey.endsWith('-orig') ? trackKey.slice(0, -'-orig'.length) : trackKey
}

// Where the picked tracks come from decides the saved source, so reapplying
// the profile finds the same tracks again.
function subtitleSourceFor(keys: readonly string[], base: DownloadProfile['subtitles']['source'], context: SaveProfileContext): DownloadProfile['subtitles']['source'] {
	const isManual = (key: string): boolean => key in context.subtitles && !key.endsWith('-orig')
	const manual = keys.filter(isManual).length
	if (keys.length === 0) return base
	if (manual === keys.length) return base === 'auto-only' ? 'manual-first' : base
	if (manual === 0) return base === 'manual-only' ? 'auto-only' : base
	return 'manual-first'
}

function subtitlesFromWizard(base: DownloadProfile, snapshot: WizardSettingsSnapshot, context: SaveProfileContext): DownloadProfile['subtitles'] {
	const languages = [...new Set(snapshot.subtitleLanguages.map(baseLanguageCode))]
	return {enabled: languages.length > 0, languages, source: subtitleSourceFor(snapshot.subtitleLanguages, base.subtitles.source, context), mode: snapshot.subtitleMode, format: snapshot.subtitleFormat}
}

// The run's settings as a new profile. Every area the user left alone keeps
// the base profile's own value, which may say more than this one video could
// honour (languages it lacks, a tier above its best stream).
export function profileFromWizard(base: DownloadProfile, baseline: WizardSettingsSnapshot, snapshot: WizardSettingsSnapshot, formats: readonly FormatOption[], context: SaveProfileContext): DownloadProfile {
	const changed = new Set(changedFromProfile(baseline, snapshot))
	const defaultTemplate = resolveFilenameTemplate(undefined, context.globalFilenameTemplate)
	return {
		id: context.id,
		name: context.name,
		icon: base.icon,
		enabled: true,
		media: changed.has('format') ? mediaFromWizard(base, baseline, snapshot, formats) : base.media,
		subtitles: changed.has('subtitles') ? subtitlesFromWizard(base, snapshot, context) : {...base.subtitles, languages: [...base.subtitles.languages]},
		sponsorBlock: changed.has('sponsorBlock') ? {mode: snapshot.sponsorBlockMode, categories: [...snapshot.sponsorBlockCategories]} : {...base.sponsorBlock, categories: [...base.sponsorBlock.categories]},
		embed: changed.has('extras') ? {...snapshot.embed} : {...base.embed},
		output: !changed.has('saveTo') ? base.output : snapshot.outputDir === context.defaultOutputDir ? {kind: 'default'} : {kind: 'fixed', dir: snapshot.outputDir},
		subfolder: changed.has('saveTo') ? {enabled: snapshot.subfolderEnabled, name: snapshot.subfolderName} : {...base.subfolder},
		filename: !changed.has('fileName') ? base.filename : snapshot.filenameTemplate === defaultTemplate ? {kind: 'default'} : {kind: 'custom', template: snapshot.filenameTemplate},
		createdAt: context.now,
		updatedAt: context.now
	}
}
