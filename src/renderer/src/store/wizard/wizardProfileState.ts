// Store adapters for profileApplication: read the wizard's settings out of
// AppState as one snapshot, write a snapshot back as a state patch, and apply a
// profile to the probe the wizard currently holds.

import {DEFAULTS} from '@shared/constants.js'
import type {DownloadProfile} from '@shared/types.js'
import type {AppState} from '../types.js'
import {applyProfileToWizard, changedFromProfile, profileFromWizard, type ChangedArea, type WizardSettingsSnapshot} from './profileApplication.js'

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
		filenameTemplate: state.wizardFilenameTemplate
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
		wizardFilenameTemplate: snapshot.filenameTemplate
	}
}

type ProbeFields = Pick<AppState, 'wizardFormats' | 'wizardSubtitles' | 'wizardAutomaticCaptions' | 'wizardIsAudioOnlySource' | 'settings' | 'wizardOutputDir'>

// Every setting the profile gives for the probe in `state`, as a state patch
// plus the baseline and notices that go with it.
export function profilePatch(profile: DownloadProfile, state: ProbeFields): Partial<AppState> {
	const common = state.settings?.common
	const globalDir = common?.defaultOutputDir?.trim()
	const {snapshot, notices} = applyProfileToWizard({
		profile,
		formats: state.wizardFormats,
		subtitles: state.wizardSubtitles,
		automaticCaptions: state.wizardAutomaticCaptions,
		isAudioOnlySource: state.wizardIsAudioOnlySource,
		nativeAudioPreference: common?.nativeAudioPreference ?? DEFAULTS.nativeAudioPreference,
		baseOutputDir: globalDir !== undefined && globalDir !== '' ? globalDir : state.wizardOutputDir,
		globalFilenameTemplate: common?.filenameTemplate
	})
	return {...snapshotPatch(snapshot), wizardProfile: profile, wizardProfileBaseline: snapshot, wizardFitNotices: notices}
}

export function wizardChangedAreas(state: AppState): ChangedArea[] {
	return state.wizardProfileBaseline ? changedFromProfile(state.wizardProfileBaseline, wizardSnapshot(state)) : []
}

function newProfileId(): string {
	return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `profile-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// The run's settings as a new profile, or null when nothing differs from the
// profile it started from (or this isn't a single-video run).
export function editedProfileDraft(state: AppState, name: string): DownloadProfile | null {
	const base = state.wizardProfile
	const baseline = state.wizardProfileBaseline
	if (state.wizardMode !== 'single' || !base || !baseline || wizardChangedAreas(state).length === 0) return null
	return profileFromWizard(base, baseline, wizardSnapshot(state), state.wizardFormats, {
		id: newProfileId(),
		name,
		now: new Date().toISOString(),
		defaultOutputDir: state.settings?.common?.defaultOutputDir ?? '',
		globalFilenameTemplate: state.settings?.common?.filenameTemplate,
		subtitles: state.wizardSubtitles,
		automaticCaptions: state.wizardAutomaticCaptions
	})
}
