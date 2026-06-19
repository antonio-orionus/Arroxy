import {useMemo} from 'react'
import {i18next} from '@shared/i18n/index.js'
import {humanSize} from '@shared/format.js'
import {AUDIO_CONVERT_TARGETS} from '@shared/audioTargets.js'
import type {AudioBitrate, AudioConvertTarget, FormatOption} from '@shared/types.js'
import type {AudioTrackQuality, Preset} from '@shared/schemas.js'
import type {AudioSelection} from './types.js'
import {useAppStore} from './useAppStore.js'
import {groupVideoFormats, resolveVideoResolution} from './helpers.js'
import {presetProducesMedia} from '@shared/presetTraits.js'

export type ConvertTooltipKey = 'wizard.formats.convert.requiresAudioOnly' | 'wizard.formats.convert.requiresLossy'

export interface FormatSelectionFilters {
	audioExt: string | null
	dynamicRange: string | null
	videoExt: string | null
}

export interface VideoFormatRow {
	barWidth: number
	filesize: number | undefined
	formatId: string
	isAudioOnly: boolean
	meta: string
	resolution: string
}

export interface NativeAudioRow {
	ext: string
	formatId: string
	label: string
	meta: string
	quality: AudioTrackQuality | null
	title: string
}

export interface FormatSelectionView {
	mode: 'video+audio' | 'audio-only' | 'subtitle-only'
	canContinue: boolean
	currentResolutionLabel: string
	selectedFilesize: number | undefined
	video: {disabled: boolean; dynamicRangeOptions: string[]; extOptions: string[]; rows: VideoFormatRow[]}
	audio: {
		audioExtOptions: string[]
		convertDisabled: boolean
		convertTargets: AudioConvertTarget[]
		convertTooltipKey: ConvertTooltipKey | null
		nativeRows: NativeAudioRow[]
		noAudioDisabled: boolean
		// The "no audio" row's meaning depends on whether the selected video
		// format is muxed (audio + video in one stream) or video-only. For muxed
		// sources, picking it downloads the file as-is — the embedded audio is
		// kept. The renderer flips the row's label/meta accordingly so users
		// don't think they're throwing away audio.
		selectedVideoIsMuxed: boolean
		bitrateStrip: {blocked: boolean; value: AudioBitrate; tooltipKey: ConvertTooltipKey | null}
	}
}

const DEFAULT_FILTERS: FormatSelectionFilters = {audioExt: null, dynamicRange: null, videoExt: null}

function nativeAudioRow(format: FormatOption): NativeAudioRow {
	const title = format.audioTrackLabel ?? format.audioLanguage ?? (format.audioTrackQuality ? '' : format.ext)
	const meta = format.audioTrackLabel ? format.label.replace(`${format.audioTrackLabel} · `, '') : format.label
	return {ext: format.ext, formatId: format.formatId, label: format.label, meta, quality: format.audioTrackQuality ?? null, title}
}

// Exported for unit-testing the gating logic (muxed-only sources, audio-only
// modes, etc.) without spinning up the zustand store.
export function selectView(state: {selectedVideoFormatId: string; audioSelection: AudioSelection; lastConvertBitrate: AudioBitrate; activePreset: Preset | null; wizardFormats: FormatOption[]; filters?: Partial<FormatSelectionFilters>}): FormatSelectionView {
	const {selectedVideoFormatId, audioSelection, lastConvertBitrate, activePreset, wizardFormats} = state
	const filters = {...DEFAULT_FILTERS, ...state.filters}

	const isAudioOnly = selectedVideoFormatId === ''
	const isSubtitleOnly = activePreset !== null && !presetProducesMedia(activePreset)
	// Some extractors (PornHub, Twitch VODs, smaller hosts) return only muxed
	// formats — no separable audio streams. With separable audio, picking
	// convert-* alongside a video stream is invalid because yt-dlp's `-x` is
	// mutually exclusive with video+audio merging. With muxed-only sources,
	// there's no merging step — yt-dlp downloads the muxed stream and `-x`
	// extracts the audio track. The `setAudioSelection` reducer clears video on
	// convert-* anyway, so the operation reduces to audio-convert kind cleanly.
	const hasSeparableAudio = wizardFormats.some(f => f.isAudioOnly)

	const mode: FormatSelectionView['mode'] = isSubtitleOnly ? 'subtitle-only' : isAudioOnly ? 'audio-only' : 'video+audio'

	const canContinue = isSubtitleOnly || !(isAudioOnly && audioSelection.kind === 'none')

	const currentResolutionLabel = isSubtitleOnly ? i18next.t('presets.subtitle-only.label') : isAudioOnly ? i18next.t('wizard.formats.audioOnly') : resolveVideoResolution(selectedVideoFormatId, wizardFormats, i18next.t('wizard.formats.audioOnly'))

	const selectedFilesize = wizardFormats.find(f => f.formatId === selectedVideoFormatId)?.filesize

	// Only gate convert when a separate audio track exists alongside a video pick.
	const convertDisabled = !isAudioOnly && hasSeparableAudio
	const lossyConvert = audioSelection.kind === 'convert-lossy' ? audioSelection : null
	const bitrateBlocked = lossyConvert === null
	const bitrateValue = lossyConvert?.bitrateKbps ?? lastConvertBitrate
	// "No audio" row makes no sense in audio-only mode when separable audio
	// exists — the user has affirmatively asked for audio. With muxed-only
	// sources, audio-only mode is reached via convert-*; "No audio" still
	// doesn't apply, so the existing behavior holds.
	const noAudioDisabled = isAudioOnly
	const selectedFormat = wizardFormats.find(f => f.formatId === selectedVideoFormatId)
	const selectedVideoIsMuxed = !!selectedFormat && !selectedFormat.isVideoOnly && !selectedFormat.isAudioOnly
	const videoOnlyFormats = wizardFormats.filter(f => f.isVideoOnly)
	const videoExtOptions = [...new Set(videoOnlyFormats.map(f => f.ext))]
	const dynamicRangeOptions = [...new Set(videoOnlyFormats.map(f => f.dynamicRange ?? 'SDR'))]
	const filteredVideoFormats = wizardFormats.filter(f => (!filters.videoExt || f.ext === filters.videoExt) && (!filters.dynamicRange || (filters.dynamicRange === 'SDR' ? !f.dynamicRange : f.dynamicRange === filters.dynamicRange)))
	const groupedVideo = groupVideoFormats(filteredVideoFormats)
	const formatById = new Map(filteredVideoFormats.map(format => [format.formatId, format]))
	const maxFilesize = Math.max(...groupedVideo.flatMap(group => (group.isAudioOnly ? [] : [formatById.get(group.formatId)?.filesize ?? 0])), 1)
	const videoRows = groupedVideo.map(group => {
		const rawFormat = formatById.get(group.formatId)
		const filesize = rawFormat?.filesize
		const meta = group.isAudioOnly ? '' : [rawFormat?.ext, rawFormat?.fps ? `${rawFormat.fps}fps` : null, rawFormat?.dynamicRange ?? null, filesize ? humanSize(filesize) : null].flatMap(part => (part ? [part] : [])).join(' · ')
		return {barWidth: filesize ? Math.max(2, (filesize / maxFilesize) * 100) : 0, filesize, formatId: group.formatId, isAudioOnly: group.isAudioOnly, meta, resolution: group.resolution}
	})
	const nativeAudios = wizardFormats.filter(f => f.isAudioOnly)
	const nativeExts = [...new Set(nativeAudios.map(f => f.ext))]
	const convertTargets = AUDIO_CONVERT_TARGETS.map(spec => spec.target)
	const nativeExtSet = new Set(nativeExts)
	const audioExtOptions = [...nativeExts, ...convertTargets.filter(ext => !nativeExtSet.has(ext))]
	const matchesAudioExt = (ext: string): boolean => !filters.audioExt || ext === filters.audioExt
	const nativeRows = nativeAudios.flatMap(format => (matchesAudioExt(format.ext) ? [nativeAudioRow(format)] : []))
	const filteredConvertTargets = convertTargets.filter(matchesAudioExt)

	return {
		mode,
		canContinue,
		currentResolutionLabel,
		selectedFilesize,
		video: {disabled: isSubtitleOnly, dynamicRangeOptions, extOptions: videoExtOptions, rows: videoRows},
		audio: {
			audioExtOptions,
			convertDisabled,
			convertTargets: filteredConvertTargets,
			convertTooltipKey: convertDisabled ? 'wizard.formats.convert.requiresAudioOnly' : null,
			nativeRows,
			noAudioDisabled,
			selectedVideoIsMuxed,
			bitrateStrip: {blocked: bitrateBlocked, value: bitrateValue, tooltipKey: convertDisabled ? 'wizard.formats.convert.requiresAudioOnly' : bitrateBlocked ? 'wizard.formats.convert.requiresLossy' : null}
		}
	}
}

export function useFormatSelectionView(filters?: Partial<FormatSelectionFilters>): FormatSelectionView {
	const selectedVideoFormatId = useAppStore(s => s.selectedVideoFormatId)
	const audioSelection = useAppStore(s => s.audioSelection)
	const lastConvertBitrate = useAppStore(s => s.lastConvertBitrate)
	const activePreset = useAppStore(s => s.activePreset)
	const wizardFormats = useAppStore(s => s.wizardFormats)

	return useMemo(() => selectView({selectedVideoFormatId, audioSelection, lastConvertBitrate, activePreset, wizardFormats, filters}), [selectedVideoFormatId, audioSelection, lastConvertBitrate, activePreset, wizardFormats, filters])
}
