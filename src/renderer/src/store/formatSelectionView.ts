import {useMemo} from 'react'
import {i18next} from '@shared/i18n/index.js'
import {humanSize} from '@shared/format.js'
import {AUDIO_CONVERT_TARGETS} from '@shared/audioTargets.js'
import {videoCodecName} from '@shared/fileTypeFit.js'
import type {AudioBitrate, AudioConvertTarget, FormatOption} from '@shared/types.js'
import type {AudioTrackQuality, WizardMediaKind} from '@shared/schemas.js'
import type {AudioSelection} from './types.js'
import {useAppStore} from './useAppStore.js'
import {groupVideoFormats, resolveVideoResolution} from './helpers.js'

export type ConvertTooltipKey = 'wizard.formats.convert.requiresLossy'

export interface FormatSelectionFilters {
	audioExt: string | null
	dynamicRange: string | null
	videoExt: string | null
}

export interface VideoFormatRow {
	barWidth: number
	filesize: number | undefined
	formatId: string
	meta: string
	resolution: string
	// The stream the download profile picked for this video.
	isProfilePick: boolean
}

export interface NativeAudioRow {
	ext: string
	formatId: string
	label: string
	meta: string
	quality: AudioTrackQuality | null
	title: string
	isProfilePick: boolean
}

export interface FormatSelectionView {
	mode: 'video+audio' | 'audio-only' | 'subtitle-only'
	// The media part of the selection is complete (Download may still wait on
	// subtitle languages in Subtitles mode or an invalid folder).
	canDownload: boolean
	currentResolutionLabel: string
	selectedFilesize: number | undefined
	// `profilePickIsFallback`: the video can't honour the profile's tier, so its
	// tagged row is the closest stream rather than an exact match.
	video: {disabled: boolean; dynamicRangeOptions: string[]; extOptions: string[]; rows: VideoFormatRow[]; profilePickIsFallback: boolean}
	audio: {
		audioExtOptions: string[]
		// Empty in Video mode: conversions belong to Audio mode.
		convertTargets: AudioConvertTarget[]
		nativeRows: NativeAudioRow[]
		noAudioDisabled: boolean
		// The "no audio" row's meaning depends on whether the selected video
		// format is muxed (audio + video in one stream) or video-only. For muxed
		// sources, picking it downloads the file as-is — the embedded audio is
		// kept. The renderer flips the row's label/meta accordingly so users
		// don't think they're throwing away audio.
		selectedVideoIsMuxed: boolean
		bitrateStrip: {hidden: boolean; blocked: boolean; value: AudioBitrate; tooltipKey: ConvertTooltipKey | null}
	}
}

const DEFAULT_FILTERS: FormatSelectionFilters = {audioExt: null, dynamicRange: null, videoExt: null}

function nativeAudioRow(format: FormatOption, profileAudioId: string | null): NativeAudioRow {
	const title = format.audioTrackLabel ?? format.audioLanguage ?? (format.audioTrackQuality ? '' : format.ext)
	const meta = format.audioTrackLabel ? format.label.replace(`${format.audioTrackLabel} · `, '') : format.label
	return {ext: format.ext, formatId: format.formatId, label: format.label, meta, quality: format.audioTrackQuality ?? null, title, isProfilePick: format.formatId === profileAudioId}
}

export interface SelectViewInput {
	selectedVideoFormatId: string
	audioSelection: AudioSelection
	lastConvertBitrate: AudioBitrate
	mediaKind: WizardMediaKind
	wizardFormats: FormatOption[]
	// What the download profile picked, to tag those rows. Null outside single mode.
	profilePick?: {videoFormatId: string; audioSelection: AudioSelection} | null
	profileVideoFallback?: boolean
	filters?: Partial<FormatSelectionFilters>
}

// Exported for unit-testing the gating logic (muxed-only sources, audio-only
// modes, etc.) without spinning up the zustand store.
export function selectView(state: SelectViewInput): FormatSelectionView {
	const {selectedVideoFormatId, audioSelection, lastConvertBitrate, mediaKind, wizardFormats} = state
	const filters = {...DEFAULT_FILTERS, ...state.filters}
	const pickedVideo = state.profilePick?.videoFormatId
	const profileVideoId = pickedVideo !== undefined && pickedVideo !== '' ? pickedVideo : null
	const profileAudio = state.profilePick?.audioSelection
	const profileAudioId = profileAudio?.kind === 'native' ? profileAudio.formatId : null

	const isAudioOnly = mediaKind === 'audio'
	const isSubtitleOnly = mediaKind === 'subtitles'
	// Some extractors (PornHub, Twitch VODs, smaller hosts) return only muxed
	// formats — no separable audio streams. With separable audio, picking
	// convert-* alongside a video stream is invalid because yt-dlp's `-x` is
	// mutually exclusive with video+audio merging. With muxed-only sources,
	// there's no merging step — yt-dlp downloads the muxed stream and `-x`
	// extracts the audio track. The `setAudioSelection` reducer clears video on
	// convert-* anyway, so the operation reduces to audio-convert kind cleanly.
	const hasSeparableAudio = wizardFormats.some(f => f.isAudioOnly)

	const mode: FormatSelectionView['mode'] = isSubtitleOnly ? 'subtitle-only' : isAudioOnly ? 'audio-only' : 'video+audio'

	const canDownload = isSubtitleOnly || (isAudioOnly ? audioSelection.kind !== 'none' : selectedVideoFormatId !== '')

	const currentResolutionLabel = isSubtitleOnly ? i18next.t('wizard.formats.kind.subtitles') : isAudioOnly ? i18next.t('wizard.formats.audioOnly') : resolveVideoResolution(selectedVideoFormatId, wizardFormats, i18next.t('wizard.formats.audioOnly'))

	// Video plus its native audio track; a conversion's size isn't known ahead.
	const nativeAudioId = audioSelection.kind === 'native' ? audioSelection.formatId : null
	const sizes = [isAudioOnly ? null : selectedVideoFormatId, nativeAudioId].flatMap(id => (id ? [wizardFormats.find(f => f.formatId === id)?.filesize] : []))
	const selectedFilesize = isSubtitleOnly || sizes.length === 0 || sizes.some(size => size === undefined) ? undefined : sizes.reduce<number>((total, size) => total + (size ?? 0), 0)

	// Conversions belong to Audio mode; with a video pick they'd be merged with
	// video, which yt-dlp's `-x` can't do. A muxed-only source keeps them, since
	// converting its stream is the only way to get audio from it.
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
	const groupedVideo = groupVideoFormats(filteredVideoFormats, [selectedVideoFormatId, profileVideoId ?? ''])
	const formatById = new Map(filteredVideoFormats.map(format => [format.formatId, format]))
	const maxFilesize = Math.max(...groupedVideo.map(group => formatById.get(group.formatId)?.filesize ?? 0), 1)
	const videoRows = groupedVideo.map(group => {
		const rawFormat = formatById.get(group.formatId)
		const filesize = rawFormat?.filesize
		const meta = [rawFormat?.ext, videoCodecName(rawFormat?.videoCodec), rawFormat?.fps ? `${rawFormat.fps}fps` : null, rawFormat?.dynamicRange ?? null, filesize ? humanSize(filesize) : null].flatMap(part => (part ? [part] : [])).join(' · ')
		return {barWidth: filesize ? Math.max(2, (filesize / maxFilesize) * 100) : 0, filesize, formatId: group.formatId, meta, resolution: group.resolution, isProfilePick: group.formatId === profileVideoId}
	})
	const nativeAudios = wizardFormats.filter(f => f.isAudioOnly)
	const nativeExts = [...new Set(nativeAudios.map(f => f.ext))]
	const convertTargets = AUDIO_CONVERT_TARGETS.map(spec => spec.target)
	const nativeExtSet = new Set(nativeExts)
	const audioExtOptions = convertDisabled ? nativeExts : [...nativeExts, ...convertTargets.filter(ext => !nativeExtSet.has(ext))]
	const matchesAudioExt = (ext: string): boolean => !filters.audioExt || ext === filters.audioExt
	const nativeRows = nativeAudios.flatMap(format => (matchesAudioExt(format.ext) ? [nativeAudioRow(format, profileAudioId)] : []))
	const filteredConvertTargets = convertDisabled ? [] : convertTargets.filter(matchesAudioExt)

	return {
		mode,
		canDownload,
		currentResolutionLabel,
		selectedFilesize,
		video: {disabled: isSubtitleOnly, dynamicRangeOptions, extOptions: videoExtOptions, rows: videoRows, profilePickIsFallback: state.profileVideoFallback === true},
		audio: {audioExtOptions, convertTargets: filteredConvertTargets, nativeRows, noAudioDisabled, selectedVideoIsMuxed, bitrateStrip: {hidden: convertDisabled, blocked: bitrateBlocked, value: bitrateValue, tooltipKey: bitrateBlocked ? 'wizard.formats.convert.requiresLossy' : null}}
	}
}

export function useFormatSelectionView(filters?: Partial<FormatSelectionFilters>): FormatSelectionView {
	const selectedVideoFormatId = useAppStore(s => s.selectedVideoFormatId)
	const audioSelection = useAppStore(s => s.audioSelection)
	const lastConvertBitrate = useAppStore(s => s.lastConvertBitrate)
	const mediaKind = useAppStore(s => s.wizardMediaKind)
	const wizardFormats = useAppStore(s => s.wizardFormats)
	const baseline = useAppStore(s => s.wizardProfileBaseline)
	const profileVideoFallback = useAppStore(s => s.wizardFitNotices.some(notice => notice.kind === 'video-tier-fallback'))

	return useMemo(() => selectView({selectedVideoFormatId, audioSelection, lastConvertBitrate, mediaKind, wizardFormats, profilePick: baseline, profileVideoFallback, filters}), [selectedVideoFormatId, audioSelection, lastConvertBitrate, mediaKind, wizardFormats, baseline, profileVideoFallback, filters])
}
