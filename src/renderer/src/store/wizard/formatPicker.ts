import {extractSelection} from '@shared/audioConversionSource.js'
// FormatPicker — the slice that owns the single-video selection: format /
// audio / subtitle state and the download profile the run started from.
// Profile → selection logic lives in profileApplication (pure) and
// wizardProfileState (store adapters); this slice wires them to actions.

import {DEFAULTS} from '@shared/constants.js'
import {EMPTY_FORMAT_SELECTION} from '@shared/ytdlp/selectableFormat.js'
import {resolveChosenDownloadProfile} from '@shared/downloadProfiles.js'
import {DEFAULT_AUDIO_BITRATE} from '@shared/schemas.js'
import type {AudioSelection, DownloadProfile, FormatOption, VideoFileType, WizardMediaKind} from '@shared/types.js'
import {webmBlocker} from '@shared/fileTypeFit.js'
import {preferredNativeAudioId} from '@shared/nativeAudioPreference.js'
import {planSubtitleTracks} from '@shared/subtitleTracks.js'
import type {AppState, FormatPickerSlice, GetState, SetState} from '../types.js'
import {notify} from '@renderer/lib/notify.js'
import {profileDisplayName} from '@renderer/lib/profileName.js'
import {formatMode} from './formatMode.js'
import {codecFilterPick, videoCodecFilterOf} from '../videoCodecFilter.js'
import type {FormatMode} from '@shared/schemas.js'
import {editedProfileDraft, profilePatch, profileVideoPick, switchProfilePatch, updatedProfileDraft, wizardSnapshot} from './wizardProfileState.js'

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
	if (!state.wizardFormats.some(f => f.isAudioOnly)) return current.kind === 'extract' && current.formatId !== undefined && hasFormat(state.wizardFormats, current.formatId) ? current : extractSelection(state.wizardFormatSelection)
	return bestNativeAudio(state.wizardFormats, state)
}

// Subtitles-only with nothing picked starts from the app language when the
// video has it, so the common case is one click: its manual tracks when it
// has any in that language, else its automatic captions.
function appLanguageTracks(state: AppState): string[] {
	const language = state.settings?.common?.language?.split('-')[0]
	if (!language) return []
	const maps = {subtitles: state.wizardSubtitles, automaticCaptions: state.wizardAutomaticCaptions}
	const pick = (source: 'manual-only' | 'auto-only'): string[] => planSubtitleTracks({kind: 'languages', languages: [language], source}, maps).tracks.map(track => track.key)
	const manual = pick('manual-only')
	return manual.length > 0 ? manual : pick('auto-only')
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
	// The profile's own pick, else what its ranking picks: never just the first row.
	const ranked = baseline?.mediaKind === 'video' && hasFormat(videos, baseline.videoFormatId) ? baseline.videoFormatId : profileVideoPick(state)
	const videoId = hasFormat(videos, ranked) ? ranked : videos[0].formatId
	const video = videos.find(f => f.formatId === videoId)
	const audioSelection = audioForVideo(video, state)
	return {wizardMediaKind: kind, selectedVideoFormatId: videoId, audioSelection, ...fileTypeAfterPick(state, videoId, audioSelection)}
}

// Video, no audio: the current stream when it has no audio of its own, else
// the silent stream at the same height, else the profile's silent pick.
function videoOnlyPatch(state: AppState): Partial<AppState> {
	const silent = state.wizardFormats.filter(f => f.isVideoOnly)
	if (silent.length === 0) return {}
	const current = state.wizardFormats.find(f => f.formatId === state.selectedVideoFormatId)
	// From Audio or Subtitles there is no current stream: the profile's ranking picks, never just the first row.
	const ranked = current ? undefined : silent.find(f => f.formatId === profileVideoPick(state, {silent: true}))
	const video = current?.isVideoOnly ? current : (silent.find(f => f.resolution === current?.resolution) ?? ranked ?? silent[0])
	const audioSelection: AudioSelection = {kind: 'none'}
	const silenced = state.audioSelection.kind === 'native' ? state.audioSelection : state.wizardSilencedAudio
	return {wizardMediaKind: 'video', selectedVideoFormatId: video.formatId, audioSelection, wizardSilencedAudio: silenced, ...fileTypeAfterPick(state, video.formatId, audioSelection)}
}

function formatModePatch(mode: FormatMode, state: AppState): Partial<AppState> {
	if (mode === 'video-only') return videoOnlyPatch(state)
	// Back from Video, no audio: the same stream, with the audio it set aside
	// (language, DRC and bitrate as picked), else the preferred audio.
	if (mode === 'video' && formatMode(state) === 'video-only') {
		const silenced = state.wizardSilencedAudio
		const audioSelection = silenced?.kind === 'native' && hasFormat(state.wizardFormats, silenced.formatId) ? silenced : bestNativeAudio(state.wizardFormats, state)
		return {audioSelection, wizardSilencedAudio: null, ...fileTypeAfterPick(state, state.selectedVideoFormatId, audioSelection)}
	}
	return mediaKindPatch(mode, state)
}

export function createFormatPickerSlice(set: SetState, get: GetState): FormatPickerSlice {
	// Saves a profile made from the run's settings without activating it; the run
	// then starts from it, so nothing shows as changed.
	async function persistWizardProfile(profile: DownloadProfile): Promise<boolean> {
		const snapshot = wizardSnapshot(get())
		try {
			// A failed write resolves false: the settings are rolled back and the user told, so no success here.
			if (!(await get().saveDownloadProfile(profile, false))) return false
		} catch (error) {
			notify.profileSaveFailed(error)
			return false
		}
		set({wizardProfile: profile, wizardProfileBaseline: snapshot, wizardFitNotices: []})
		return true
	}

	return {
		wizardFormats: [],
		wizardFormatSelection: EMPTY_FORMAT_SELECTION,
		selectedVideoFormatId: '',
		audioSelection: {kind: 'none'},
		wizardSilencedAudio: null,
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

		keepPickInCodecFilter: () => {
			const state = get()
			if (state.wizardMediaKind !== 'video') return
			// The streams the Video list shows: Video, no audio leaves out those with their own sound.
			const silentOnly = state.wizardFormats.filter(f => f.isVideoOnly || f.isAudioOnly)
			const formats = formatMode(state) === 'video-only' ? silentOnly : state.wizardFormats
			const filter = videoCodecFilterOf(state)
			// The profile's pick is seen through the filter, from the profile's own
			// mode, audio and file type: a filtered video doesn't read as changed
			// from the profile, and the user's edits still do. A silent profile
			// (video, no audio) stays silent, among silent streams.
			const baseline = state.wizardProfileBaseline
			const baseVideo = state.wizardFormats.find(f => f.formatId === baseline?.videoFormatId)
			const baseSilent = baseline?.audioSelection.kind === 'none' && baseVideo?.isVideoOnly === true
			const baseId = baseline?.mediaKind === 'video' ? codecFilterPick(baseSilent ? silentOnly : state.wizardFormats, baseline.videoFormatId, filter, [state.selectedVideoFormatId]) : null
			if (baseline && baseId) {
				const asProfile: AppState = {...state, audioSelection: baseline.audioSelection, wizardFileType: baseline.fileType}
				const audioSelection: AudioSelection = baseSilent
					? {kind: 'none'}
					: audioForVideo(
							state.wizardFormats.find(f => f.formatId === baseId),
							asProfile
						)
				const fileType = fileTypeAfterPick(asProfile, baseId, audioSelection)
				set({wizardProfileBaseline: {...baseline, videoFormatId: baseId, audioSelection, fileType: 'wizardFileType' in fileType ? fileType.wizardFileType : baseline.fileType}})
			}
			const current = get()
			const profileId = current.wizardProfileBaseline?.videoFormatId
			const id = codecFilterPick(formats, current.selectedVideoFormatId, filter, profileId ? [profileId] : [])
			if (id) current.setSelectedVideoFormatId(id)
		},

		// Invariant: a video stream and a convert target are mutually exclusive —
		// convert (-x) can't be merged with video. Reconcile here instead of
		// relying on the UI to prevent it.
		setSelectedVideoFormatId: id =>
			set(state => {
				const video = state.wizardFormats.find(f => f.formatId === id)
				if (!video) return {}
				// Video, no audio stays silent; Video + audio keeps its audio pick, and
				// a stream with its own audio keeps that (Keep as-is).
				const silent = formatMode(state) === 'video-only' && video.isVideoOnly
				const audioSelection: AudioSelection = silent ? {kind: 'none'} : audioForVideo(video, state)
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

		setWizardMediaKind: kind => {
			set(state => mediaKindPatch(kind, state))
			get().keepPickInCodecFilter()
		},
		setFormatMode: mode => {
			set(state => formatModePatch(mode, state))
			get().keepPickInCodecFilter()
		},

		toggleSubtitleLanguage: lang => set(state => ({wizardSubtitleLanguages: state.wizardSubtitleLanguages.includes(lang) ? state.wizardSubtitleLanguages.filter(l => l !== lang) : [...state.wizardSubtitleLanguages, lang]})),
		clearSubtitleLanguages: () => set({wizardSubtitleLanguages: []}),
		setSubtitleMode: mode => set({wizardSubtitleMode: mode}),
		setSubtitleFormat: format => set({wizardSubtitleFormat: format}),
		setWizardFilenameTemplate: template => set({wizardFilenameTemplate: template}),

		chooseWizardProfile: (ref, keepEdits = false) => {
			const {profile} = resolveChosenDownloadProfile(ref, get().settings?.profiles)
			set(switchProfilePatch(profile, get(), keepEdits))
			get().keepPickInCodecFilter()
		},

		resetWizardToProfile: () => {
			const profile = get().wizardProfile
			if (!profile) return
			set(profilePatch(profile, get()))
			get().keepPickInCodecFilter()
		},

		saveWizardAsProfile: async name => {
			const trimmed = name.trim()
			const profile = trimmed ? editedProfileDraft(get(), trimmed) : null
			if (!profile || !(await persistWizardProfile(profile))) return false
			notify.profileSaved(profileDisplayName(profile))
			return true
		},

		updateWizardProfile: async () => {
			const profile = updatedProfileDraft(get())
			if (!profile || !(await persistWizardProfile(profile))) return false
			notify.profileUpdated(profileDisplayName(profile))
			return true
		}
	}
}
