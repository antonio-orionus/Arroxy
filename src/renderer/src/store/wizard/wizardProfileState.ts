// Store adapters for profileApplication: read the wizard's settings out of
// AppState as one snapshot, write a snapshot back as a state patch, and apply a
// profile to the probe the wizard currently holds.

import {DEFAULTS} from '@shared/constants.js'
import {resolveAppHdr} from '@renderer/lib/displayHdr.js'
import {BUILTIN_DOWNLOAD_PROFILES, DEFAULT_DOWNLOAD_PROFILE_REF} from '@shared/downloadProfiles.js'
import {resolveProfileSelection} from '@shared/profileSelection.js'
import type {DownloadProfile} from '@shared/types.js'
import type {AppState} from '../types.js'
import {applyProfileToWizard, changedFromProfile, profileFromWizard, withAreasFrom, type ChangedArea, type WizardSettingsSnapshot} from './profileApplication.js'

export function wizardSnapshot(state: AppState): WizardSettingsSnapshot {
	return {
		mediaKind: state.wizardMediaKind,
		videoFormatId: state.selectedVideoFormatId,
		audioSelection: state.audioSelection,
		subtitleLanguages: state.wizardSubtitleLanguages,
		subtitleMode: state.wizardSubtitleMode,
		subtitleFormat: state.wizardSubtitleFormat,
		sponsorBlockMode: state.wizardSponsorBlockMode,
		sponsorBlockCategories: state.wizardSponsorBlockCategories,
		embed: {chapters: state.wizardEmbedChapters, metadata: state.wizardEmbedMetadata, thumbnail: state.wizardEmbedThumbnail, description: state.wizardWriteDescription, thumbnailSidecar: state.wizardWriteThumbnail},
		outputDir: state.wizardOutputDir,
		subfolderEnabled: state.wizardSubfolderEnabled,
		subfolderName: state.wizardSubfolderName,
		filenameTemplate: state.wizardFilenameTemplate,
		fileType: state.wizardFileType
	}
}

export function snapshotPatch(snapshot: WizardSettingsSnapshot): Partial<AppState> {
	return {
		wizardMediaKind: snapshot.mediaKind,
		selectedVideoFormatId: snapshot.videoFormatId,
		audioSelection: snapshot.audioSelection,
		wizardSubtitleLanguages: [...snapshot.subtitleLanguages],
		wizardSubtitleMode: snapshot.subtitleMode,
		wizardSubtitleFormat: snapshot.subtitleFormat,
		wizardSponsorBlockMode: snapshot.sponsorBlockMode,
		wizardSponsorBlockCategories: [...snapshot.sponsorBlockCategories],
		wizardEmbedChapters: snapshot.embed.chapters,
		wizardEmbedMetadata: snapshot.embed.metadata,
		wizardEmbedThumbnail: snapshot.embed.thumbnail,
		wizardWriteDescription: snapshot.embed.description,
		wizardWriteThumbnail: snapshot.embed.thumbnailSidecar,
		wizardOutputDir: snapshot.outputDir,
		wizardSubfolderEnabled: snapshot.subfolderEnabled,
		wizardSubfolderName: snapshot.subfolderName,
		wizardFilenameTemplate: snapshot.filenameTemplate,
		wizardFileType: snapshot.fileType,
		wizardFileTypeReset: null
	}
}

type ProbeFields = Pick<AppState, 'wizardFormats' | 'wizardSubtitles' | 'wizardAutomaticCaptions' | 'wizardIsAudioOnlySource' | 'settings' | 'wizardOutputDir'>

// Every setting the profile gives for the probe in `state`, as a state patch
// plus the baseline and notices that go with it.
export function profilePatch(profile: DownloadProfile, state: ProbeFields): Partial<AppState> {
	const common = state.settings?.common
	const globalDir = common?.defaultOutputDir?.trim()
	const {snapshot, notices, order} = applyProfileToWizard({
		profile,
		formats: state.wizardFormats,
		subtitles: state.wizardSubtitles,
		automaticCaptions: state.wizardAutomaticCaptions,
		isAudioOnlySource: state.wizardIsAudioOnlySource,
		nativeAudioPreference: common?.nativeAudioPreference ?? DEFAULTS.nativeAudioPreference,
		hdrPreference: resolveAppHdr(common?.hdrPreference),
		baseOutputDir: globalDir !== undefined && globalDir !== '' ? globalDir : state.wizardOutputDir,
		globalFilenameTemplate: common?.filenameTemplate
	})
	return {...snapshotPatch(snapshot), wizardProfile: profile, wizardProfileBaseline: snapshot, wizardFitNotices: notices, wizardSelectionOrder: order}
}

// The video stream the run's profile would pick, for switching to Video from
// Audio only or Subtitles only. A profile with no video ranks by the app's
// default profile (720p), not the tallest stream, which may be gigabytes.
export function profileVideoPick(state: ProbeFields & Pick<AppState, 'wizardProfile'>): string {
	const profile = state.wizardProfile
	const hasVideo = profile?.media.kind === 'video-audio' || profile?.media.kind === 'video-only'
	const ranking = hasVideo ? profile : BUILTIN_DOWNLOAD_PROFILES.find(candidate => candidate.id === DEFAULT_DOWNLOAD_PROFILE_REF.id)
	if (!ranking) return ''
	const common = state.settings?.common
	const {media} = resolveProfileSelection({profile: ranking, formats: state.wizardFormats, subtitles: {}, automaticCaptions: {}, isAudioOnlySource: false, nativeAudioPreference: common?.nativeAudioPreference ?? DEFAULTS.nativeAudioPreference, hdrPreference: resolveAppHdr(common?.hdrPreference)})
	return media.videoFormatId
}

export function wizardChangedAreas(state: AppState): ChangedArea[] {
	return state.wizardProfileBaseline ? changedFromProfile(state.wizardProfileBaseline, wizardSnapshot(state)) : []
}

// The edits a profile switch can keep: everything but the streams, which the
// new profile always picks.
export function keepableEdits(state: AppState): ChangedArea[] {
	return wizardChangedAreas(state).filter(area => area !== 'format')
}

// Applies `profile`; with `keepEdits`, the areas the user changed keep their
// values and show as changed from the new profile.
export function switchProfilePatch(profile: DownloadProfile, state: AppState, keepEdits: boolean): Partial<AppState> {
	const patch = profilePatch(profile, state)
	const baseline = patch.wizardProfileBaseline
	const kept = keepEdits ? keepableEdits(state) : []
	if (!baseline || kept.length === 0) return patch
	const {wizardMediaKind, selectedVideoFormatId, audioSelection, wizardFileType, wizardFileTypeReset, ...settings} = snapshotPatch(withAreasFrom(baseline, wizardSnapshot(state), kept))
	return {...patch, ...settings}
}

function newProfileId(): string {
	return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `profile-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// The run's settings as a profile with the given identity, or null when nothing
// differs from the profile it started from (or this isn't a single-video run).
function draftFromWizard(state: AppState, identity: {id: string; name: string}): DownloadProfile | null {
	const base = state.wizardProfile
	const baseline = state.wizardProfileBaseline
	if (state.wizardMode !== 'single' || !base || !baseline || wizardChangedAreas(state).length === 0) return null
	return profileFromWizard(base, baseline, wizardSnapshot(state), state.wizardFormats, {
		...identity,
		now: new Date().toISOString(),
		defaultOutputDir: state.settings?.common?.defaultOutputDir ?? '',
		globalFilenameTemplate: state.settings?.common?.filenameTemplate,
		subtitles: state.wizardSubtitles,
		automaticCaptions: state.wizardAutomaticCaptions
	})
}

// The run's settings as a new profile.
export function editedProfileDraft(state: AppState, name: string): DownloadProfile | null {
	return draftFromWizard(state, {id: newProfileId(), name})
}

// The profile the run started from, with the run's settings in it. It keeps its
// identity, so a built-in one is saved as that built-in's override.
export function updatedProfileDraft(state: AppState): DownloadProfile | null {
	const base = state.wizardProfile
	const draft = base ? draftFromWizard(state, {id: base.id, name: base.name}) : null
	return base && draft ? {...draft, enabled: base.enabled, createdAt: base.createdAt} : null
}
