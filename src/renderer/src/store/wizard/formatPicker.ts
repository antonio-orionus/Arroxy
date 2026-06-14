// FormatPicker — pure post-probe selection helpers + the slice that owns
// format / audio / subtitle / preset state.
//
// The pure helpers (applyPreset, restoreFormatSelection, restoreSubtitleSelection)
// are I/O-free: inputs are FormatOption[] + AppSettings, outputs are plain
// selection objects the caller drops on the slice via `set()`. The slice
// (createFormatPickerSlice) wires those helpers to actions plus subtitle
// language toggling and bitrate stickiness.

import {DEFAULTS} from '@shared/constants.js'
import {DEFAULT_AUDIO_BITRATE} from '@shared/schemas.js'
import type {AppSettings, AudioSelection, FormatOption, Preset, SubtitleMap} from '@shared/types.js'
import {isDolbyNativeAudio, isDrcNativeAudio, preferredNativeAudioId} from '@shared/nativeAudioPreference.js'
import type {FormatPickerSlice, GetState, SetState} from '../types.js'
import {groupVideoFormats} from '../helpers.js'

function nativeAudio(formatId: string | null): AudioSelection {
	return formatId === null ? {kind: 'none'} : {kind: 'native', formatId}
}

function preferredNativeAudioIdForSettings(audioFormats: FormatOption[], settings: AppSettings | null): string | null {
	return preferredNativeAudioId(audioFormats, settings?.common?.nativeAudioPreference ?? DEFAULTS.nativeAudioPreference)
}

// When a video format is itself muxed (audio embedded — e.g. Twitch HLS,
// PornHub progressive, Reddit DASH muxed), pairing it with a separate native
// audio stream double-tracks the audio (yt-dlp downloads both then ffmpeg
// merges, ending with dual audio or worse). The right default is `none` =
// keep as-is — the muxed stream already has audio.
//
// Muxed detection is format-driven, not preset-driven: every preset and the
// manual resolution selector call this function, so 1080p+ muxed sources (rare
// on YouTube, common on Twitch/other hosts) are handled correctly regardless of
// which preset is active.
function audioForVideoPick(videoFormatId: string, formats: FormatOption[], fallbackAudioId: string | null): AudioSelection {
	const f = formats.find(x => x.formatId === videoFormatId)
	const isMuxed = !!f && !f.isVideoOnly && !f.isAudioOnly
	if (isMuxed) return {kind: 'none'}
	return nativeAudio(fallbackAudioId)
}

const RESOLUTION_NUMBER_PATTERN = /(\d+)/

export function applyPreset(preset: Preset, formats: FormatOption[], nativeAudioPreference = DEFAULTS.nativeAudioPreference): {videoFormatId: string; audioSelection: AudioSelection} {
	// groupVideoFormats appends an `audio-only` sentinel for the format dropdown;
	// for preset/restore math we only want real video rows.
	const grouped = groupVideoFormats(formats).filter(g => !g.isAudioOnly)
	const audioFormats = formats.filter(f => f.isAudioOnly)
	const bestAudio = preferredNativeAudioId(audioFormats, nativeAudioPreference)
	const worstAudio = audioFormats[audioFormats.length - 1]?.formatId ?? bestAudio

	if (preset === 'best-quality') {
		const videoFormatId = grouped[0]?.formatId ?? ''
		return {videoFormatId, audioSelection: audioForVideoPick(videoFormatId, formats, bestAudio)}
	}
	if (preset === 'audio-only') {
		if (bestAudio !== null) return {videoFormatId: '', audioSelection: nativeAudio(bestAudio)}
		// Muxed-only source: no separable audio streams. Default to converting the
		// embedded track — native 'none' would land on the disabled "No audio" row.
		return {videoFormatId: '', audioSelection: {kind: 'convert-lossy', target: 'mp3', bitrateKbps: DEFAULT_AUDIO_BITRATE}}
	}
	if (preset === 'subtitle-only') return {videoFormatId: '', audioSelection: {kind: 'none'}}
	if (preset === 'balanced') {
		const target = grouped.find(g => {
			const m = RESOLUTION_NUMBER_PATTERN.exec(g.resolution)
			return m ? Number(m[1]) <= 720 : false
		})
		const videoFormatId = target?.formatId ?? grouped[grouped.length - 1]?.formatId ?? ''
		return {videoFormatId, audioSelection: audioForVideoPick(videoFormatId, formats, bestAudio)}
	}
	// small-file
	const videoFormatId = grouped[grouped.length - 1]?.formatId ?? ''
	return {videoFormatId, audioSelection: audioForVideoPick(videoFormatId, formats, worstAudio)}
}

// Persisted audio selection is stored verbatim. Convert/none kinds carry no
// per-video identifiers and revive directly — except `none` (muxed keep-as-is)
// only makes sense when the new source is also muxed-only. If the new source
// has separable audio streams, `none` would silently drop the audio track,
// which is rarely what the user meant ("keep as-is" on a separable source =
// video-only download). Auto-upgrade to the best native audio in that case.
//
// For native, the formatId can change between videos, so fall back:
// exact id → same ext → bestAudio.
// Returns null when nothing is persisted; caller uses its default in that case.
function reviveAudio(persisted: AudioSelection | undefined, formats: FormatOption[], settings: AppSettings | null): AudioSelection | null {
	if (!persisted) return null
	const audioFormats = formats.filter(f => f.isAudioOnly)

	if (persisted.kind === 'none') {
		if (audioFormats.length === 0) return persisted
		return nativeAudio(preferredNativeAudioIdForSettings(audioFormats, settings))
	}

	if (persisted.kind !== 'native') return persisted

	if (audioFormats.length === 0) return {kind: 'none'}
	const persistedFormat = audioFormats.find(f => f.formatId === persisted.formatId)
	if (persistedFormat) {
		const preference = settings?.common?.nativeAudioPreference ?? DEFAULTS.nativeAudioPreference
		const defaultAudioId = preferredNativeAudioId(audioFormats, preference)
		if (preference === 'compatible' && (isDolbyNativeAudio(persistedFormat) || isDrcNativeAudio(persistedFormat)) && defaultAudioId !== persisted.formatId) return nativeAudio(defaultAudioId)
		return persisted
	}

	// The persisted formatId came from an earlier probe and isn't in this list.
	// Without that earlier probe we can't recover its ext, so just pick the best
	// native audio for the current video.
	return nativeAudio(preferredNativeAudioIdForSettings(audioFormats, settings))
}

export function restoreFormatSelection(formats: FormatOption[], settings: AppSettings | null): {videoFormatId: string; audioSelection: AudioSelection; preset: Preset | null} {
	// groupVideoFormats appends an `audio-only` sentinel for the format dropdown;
	// for preset/restore math we only want real video rows.
	const grouped = groupVideoFormats(formats).filter(g => !g.isAudioOnly)
	const audioFormats = formats.filter(f => f.isAudioOnly)
	const bestAudio = preferredNativeAudioIdForSettings(audioFormats, settings)
	const single = settings?.single
	const revived = reviveAudio(single?.lastAudioSelection, formats, settings)

	if (single?.lastPreset) {
		const base = applyPreset(single.lastPreset, formats, settings?.common?.nativeAudioPreference ?? DEFAULTS.nativeAudioPreference)
		return {...base, audioSelection: revived ?? base.audioSelection, preset: single.lastPreset}
	}
	if (single?.lastVideoResolution === 'audio-only') {
		return {videoFormatId: '', audioSelection: revived ?? nativeAudio(bestAudio), preset: 'audio-only'}
	}
	if (single?.lastVideoResolution) {
		const match = grouped.find(g => g.resolution === single.lastVideoResolution)
		if (match) return {videoFormatId: match.formatId, audioSelection: revived ?? nativeAudio(bestAudio), preset: null}
	}
	const base = applyPreset('best-quality', formats, settings?.common?.nativeAudioPreference ?? DEFAULTS.nativeAudioPreference)
	return {...base, audioSelection: revived ?? base.audioSelection, preset: 'best-quality'}
}

export function restoreSubtitleSelection(subtitles: SubtitleMap | undefined, automaticCaptions: SubtitleMap | undefined, settings: AppSettings | null): {languages: string[]} {
	const available = new Set([...Object.keys(subtitles ?? {}), ...Object.keys(automaticCaptions ?? {})])
	const languages = (settings?.single?.lastSubtitleLanguages ?? []).filter(l => available.has(l))
	return {languages}
}

export function createFormatPickerSlice(set: SetState, get: GetState): FormatPickerSlice {
	return {
		wizardFormats: [],
		selectedVideoFormatId: '',
		audioSelection: {kind: 'none'},
		lastConvertBitrate: DEFAULT_AUDIO_BITRATE,
		activePreset: null,
		wizardSubtitles: {},
		wizardAutomaticCaptions: {},
		wizardSubtitleLanguages: [],
		wizardSubtitleSkipped: false,
		wizardSubtitleMode: DEFAULTS.subtitleMode,
		wizardSubtitleFormat: DEFAULTS.subtitleFormat,

		// Invariant: (video !== '') && (audio.kind === 'convert-lossy' | 'convert-lossless') is invalid —
		// convert (-x) is mutually exclusive with video+audio merging. Reconcile here
		// instead of relying on the UI to prevent it.
		setSelectedVideoFormatId: id =>
			set(state => {
				const reconcileAudio = id !== '' && (state.audioSelection.kind === 'convert-lossy' || state.audioSelection.kind === 'convert-lossless')
				if (!reconcileAudio) {
					return {selectedVideoFormatId: id, activePreset: id === '' ? 'audio-only' : null}
				}
				const bestAudio = preferredNativeAudioId(
					state.wizardFormats.filter(f => f.isAudioOnly),
					state.settings?.common?.nativeAudioPreference ?? DEFAULTS.nativeAudioPreference
				)
				return {selectedVideoFormatId: id, activePreset: null, audioSelection: bestAudio === null ? {kind: 'none'} : {kind: 'native', formatId: bestAudio}}
			}),

		setAudioSelection: sel =>
			set(state => {
				// Symmetric guard: picking a convert target while a video is selected
				// clears the video to audio-only — the user's intent is "I want this
				// audio-converted file", and convert can't be merged with video.
				const clearVideo = (sel.kind === 'convert-lossy' || sel.kind === 'convert-lossless') && state.selectedVideoFormatId !== ''
				return {
					audioSelection: sel,
					selectedVideoFormatId: clearVideo ? '' : state.selectedVideoFormatId,
					activePreset: clearVideo || state.selectedVideoFormatId === '' ? 'audio-only' : null,
					// Keep the user's bitrate choice sticky across mp3/m4a/opus toggles.
					lastConvertBitrate: sel.kind === 'convert-lossy' ? sel.bitrateKbps : state.lastConvertBitrate
				}
			}),

		setPreset: p => {
			const {wizardFormats} = get()
			const {videoFormatId, audioSelection} = applyPreset(p, wizardFormats, get().settings?.common?.nativeAudioPreference ?? DEFAULTS.nativeAudioPreference)
			set({activePreset: p, selectedVideoFormatId: videoFormatId, audioSelection})
		},

		toggleSubtitleLanguage: lang => set(state => ({wizardSubtitleLanguages: state.wizardSubtitleLanguages.includes(lang) ? state.wizardSubtitleLanguages.filter(l => l !== lang) : [...state.wizardSubtitleLanguages, lang]})),

		setSubtitleMode: mode => set({wizardSubtitleMode: mode}),
		setSubtitleFormat: format => set({wizardSubtitleFormat: format})
	}
}
