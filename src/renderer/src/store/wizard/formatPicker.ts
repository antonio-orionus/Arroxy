// FormatPicker — the slice that owns the single-video selection: format /
// audio / subtitle state and the download profile the run started from.
// Profile → selection logic lives in profileApplication (pure) and
// wizardProfileState (store adapters); this slice wires them to actions.

import {DEFAULTS} from '@shared/constants.js'
import {resolveChosenDownloadProfile} from '@shared/downloadProfiles.js'
import {DEFAULT_AUDIO_BITRATE} from '@shared/schemas.js'
import type {AudioSelection, FormatOption, SubtitleMap, VideoFileType, WizardMediaKind} from '@shared/types.js'
import {webmBlocker} from '@shared/fileTypeFit.js'
import {preferredNativeAudioId} from '@shared/nativeAudioPreference.js'
import {matchesSubtitleLanguage} from '@shared/subtitleLanguages.js'
import type {AppState, FormatPickerSlice, GetState, SetState} from '../types.js'
import {notify} from '@renderer/lib/notify.js'
import {editedProfileDraft, profilePatch, wizardSnapshot} from './wizardProfileState.js'

function isConvert(sel: AudioSelection): boolean {
	return sel.kind === 'convert-lossy' || sel.kind === 'convert-lossless'
}

function bestNativeAudio(formats: readonly FormatOption[], state: Pick<AppState, 'settings'>): AudioSelection {
	const id = preferredNativeAudioId(
		formats.filter(f => f.isAudioOnly),
		state.settings?.common?.nativeAudioPreference ?? DEFAULTS.nativeAudioPreference
	)
	return id === null ? {kind: 'none'} : {kind: 'native', formatId: id}
}

function hasFormat(formats: readonly FormatOption[], id: string): boolean {
	return formats.some(f => f.formatId === id)
}

// Audio for a picked video stream: a muxed stream keeps its own track ("Keep
// as-is"), otherwise the current native pick survives if it still exists.
function audioForVideo(video: FormatOption | undefined, state: AppState): AudioSelection {
	if (video && !video.isVideoOnly) return {kind: 'none'}
	const current = state.audioSelection
	if (current.kind === 'native' && hasFormat(state.wizardFormats, current.formatId)) return current
	return bestNativeAudio(state.wizardFormats, state)
}

function audioForAudioOnly(state: AppState): AudioSelection {
	const current = state.audioSelection
	if (isConvert(current)) return current
	if (current.kind === 'native' && hasFormat(state.wizardFormats, current.formatId)) return current
	if (!state.wizardFormats.some(f => f.isAudioOnly)) return {kind: 'convert-lossy', target: 'mp3', bitrateKbps: state.lastConvertBitrate}
	return bestNativeAudio(state.wizardFormats, state)
}

// Subtitles-only with nothing picked starts from the app language when the
// video has it, so the common case is one click.
function appLanguageTracks(state: AppState): string[] {
	const language = state.settings?.common?.language?.split('-')[0]
	if (!language) return []
	const pick = (map: SubtitleMap): string[] => Object.keys(map).filter(key => matchesSubtitleLanguage(language, key.replace(/-orig$/, '')))
	const manual = pick(state.wizardSubtitles)
	return manual.length > 0 ? manual : pick(state.wizardAutomaticCaptions)
}

// A stream pick the file type can't hold sends the file type back to Auto:
// the newer action wins, and the stream the user picked is never swapped.
function fileTypeAfterPick(state: AppState, videoFormatId: string, audio: AudioSelection): Pick<AppState, 'wizardFileType' | 'wizardFileTypeReset'> | Record<string, never> {
	if (state.wizardFileType !== 'webm') return {}
	const video = state.wizardFormats.find(f => f.formatId === videoFormatId)
	const audioFormat = audio.kind === 'native' ? state.wizardFormats.find(f => f.formatId === audio.formatId) : undefined
	const blocker = video ? webmBlocker(video, audioFormat) : null
	return blocker ? {wizardFileType: 'auto', wizardFileTypeReset: {from: 'webm', blocker}} : {}
}

function mediaKindPatch(kind: WizardMediaKind, state: AppState): Partial<AppState> {
	if (kind === 'subtitles') {
		// Nothing to embed subtitles into without a media file.
		const subtitleMode = state.wizardSubtitleMode === 'embed' ? 'sidecar' : state.wizardSubtitleMode
		return {wizardMediaKind: kind, selectedVideoFormatId: '', audioSelection: {kind: 'none'}, wizardSubtitleMode: subtitleMode, wizardSubtitleLanguages: state.wizardSubtitleLanguages.length > 0 ? state.wizardSubtitleLanguages : appLanguageTracks(state)}
	}
	if (kind === 'audio') return {wizardMediaKind: kind, selectedVideoFormatId: '', audioSelection: audioForAudioOnly(state)}
	const videos = state.wizardFormats.filter(f => !f.isAudioOnly)
	if (videos.length === 0) return {}
	const baseline = state.wizardProfileBaseline
	const videoId = baseline?.mediaKind === 'video' && hasFormat(videos, baseline.videoFormatId) ? baseline.videoFormatId : videos[0].formatId
	const video = videos.find(f => f.formatId === videoId)
	const audioSelection = audioForVideo(video, state)
	return {wizardMediaKind: kind, selectedVideoFormatId: videoId, audioSelection, ...fileTypeAfterPick(state, videoId, audioSelection)}
}

export function createFormatPickerSlice(set: SetState, get: GetState): FormatPickerSlice {
	return {
		wizardFormats: [],
		selectedVideoFormatId: '',
		audioSelection: {kind: 'none'},
		lastConvertBitrate: DEFAULT_AUDIO_BITRATE,
		wizardMediaKind: 'video',
		wizardSubtitles: {},
		wizardAutomaticCaptions: {},
		wizardSubtitleLanguages: [],
		wizardSubtitleMode: DEFAULTS.subtitleMode,
		wizardSubtitleFormat: DEFAULTS.subtitleFormat,
		wizardProfile: null,
		wizardProfileBaseline: null,
		wizardFitNotices: [],
		wizardSelectionOrder: null,
		wizardFilenameTemplate: DEFAULTS.filenameTemplate,
		wizardIsAudioOnlySource: false,
		wizardFileType: 'auto',
		wizardFileTypeReset: null,

		// Invariant: a video stream and a convert target are mutually exclusive —
		// convert (-x) can't be merged with video. Reconcile here instead of
		// relying on the UI to prevent it.
		setSelectedVideoFormatId: id =>
			set(state => {
				const video = state.wizardFormats.find(f => f.formatId === id)
				if (!video) return {}
				const keepAudio = !isConvert(state.audioSelection) && video.isVideoOnly
				const audioSelection = keepAudio ? state.audioSelection : audioForVideo(video, state)
				return {wizardMediaKind: 'video', selectedVideoFormatId: id, audioSelection, ...fileTypeAfterPick(state, id, audioSelection)}
			}),

		setWizardFileType: (fileType: VideoFileType) => set({wizardFileType: fileType, wizardFileTypeReset: null}),

		setAudioSelection: sel =>
			set(state => {
				// Picking a convert target is "I want this audio-converted file":
				// it can't be merged with video, so the run becomes audio-only.
				const toAudio = isConvert(sel) && state.selectedVideoFormatId !== ''
				return {
					audioSelection: sel,
					...(toAudio ? {selectedVideoFormatId: '', wizardMediaKind: 'audio' as const} : fileTypeAfterPick(state, state.selectedVideoFormatId, sel)),
					// Keep the user's bitrate choice sticky across mp3/m4a/opus toggles.
					lastConvertBitrate: sel.kind === 'convert-lossy' ? sel.bitrateKbps : state.lastConvertBitrate
				}
			}),

		setWizardMediaKind: kind => set(state => mediaKindPatch(kind, state)),

		toggleSubtitleLanguage: lang => set(state => ({wizardSubtitleLanguages: state.wizardSubtitleLanguages.includes(lang) ? state.wizardSubtitleLanguages.filter(l => l !== lang) : [...state.wizardSubtitleLanguages, lang]})),
		clearSubtitleLanguages: () => set({wizardSubtitleLanguages: []}),
		setSubtitleMode: mode => set({wizardSubtitleMode: mode}),
		setSubtitleFormat: format => set({wizardSubtitleFormat: format}),
		setWizardFilenameTemplate: template => set({wizardFilenameTemplate: template}),

		chooseWizardProfile: ref => {
			const {profile} = resolveChosenDownloadProfile(ref, get().settings?.profiles)
			set(profilePatch(profile, get()))
		},

		resetWizardToProfile: () => {
			const profile = get().wizardProfile
			if (profile) set(profilePatch(profile, get()))
		},

		saveWizardAsProfile: async name => {
			const state = get()
			const trimmed = name.trim()
			const profile = trimmed ? editedProfileDraft(state, trimmed) : null
			if (!profile) return false
			const snapshot = wizardSnapshot(state)
			try {
				await state.saveDownloadProfile(profile, false)
			} catch (error) {
				notify.profileSaveFailed(error)
				return false
			}
			notify.profileSaved(profile.name)
			set({wizardProfile: profile, wizardProfileBaseline: snapshot, wizardFitNotices: []})
			return true
		}
	}
}
