import type {AudioConvert, FormatOption, LocalizedError, ProbeError, StatusSnapshot} from '@shared/types.js'
import {i18next} from '@shared/i18n/index.js'
import type {AudioSelection} from './types.js'

export interface GroupedVideoFormat {
	resolution: string
	formatId: string
	label: string
	dynamicRange?: string
}

// Composes the yt-dlp `-f` value for native + video selections. Convert
// selections set `formatId: undefined` and pass `audioConvert` instead — the
// main process then forces `-f bestaudio/best`.
export function buildFormatId(videoFormatId: string, audioSelection: AudioSelection): string | undefined {
	if (audioSelection.kind === 'convert-lossy' || audioSelection.kind === 'convert-lossless') return undefined
	const audioFormatId = audioSelection.kind === 'native' ? audioSelection.formatId : null
	if (videoFormatId === '' && audioFormatId === null) return undefined
	if (videoFormatId === '') return audioFormatId ?? undefined
	if (audioFormatId === null) return videoFormatId
	return `${videoFormatId}+${audioFormatId}`
}

// IPC payload mirror of audioSelection. Returns the `audioConvert` field for
// the IPC schema, or undefined for native/none picks.
export function buildAudioConvertPayload(audioSelection: AudioSelection): AudioConvert | undefined {
	if (audioSelection.kind === 'convert-lossless') return {target: 'wav'}
	if (audioSelection.kind === 'convert-lossy') return {target: audioSelection.target, bitrateKbps: audioSelection.bitrateKbps}
	return undefined
}

// Selected audio → human label. Used by buildFormatLabel (queue item) and
// StepConfirm (preview row) so they can't drift.
export function resolveAudioLabel(audioSelection: AudioSelection, audioFormats: FormatOption[]): string {
	if (audioSelection.kind === 'none') return i18next.t('wizard.formats.noAudio')
	if (audioSelection.kind === 'convert-lossless') return i18next.t('wizard.formats.convert.wavLabel')
	if (audioSelection.kind === 'convert-lossy') {
		// i18next typed-resource inference doesn't always pick up placeholders in
		// every locale variant — cast through `unknown` like formatStatus does.
		return (i18next.t as (k: string, opts?: Record<string, unknown>) => string)('wizard.formats.convert.lossyLabel', {target: audioSelection.target.toUpperCase(), bitrate: audioSelection.bitrateKbps})
	}
	const audioFmt = audioFormats.find(f => f.formatId === audioSelection.formatId)
	return audioFmt?.label ?? i18next.t('formatLabel.audioFallback')
}

// Selected-video-id → resolution label. The audio-only case returns
// `audioOnlyFallback`, which differs by caller: queue items store the
// untranslated sentinel `'audio-only'`; the confirm view shows a translated string.
export function resolveVideoResolution(selectedVideoFormatId: string, formats: FormatOption[], audioOnlyFallback: string): string {
	if (selectedVideoFormatId === '') return audioOnlyFallback
	return formats.find(f => f.formatId === selectedVideoFormatId && !f.isAudioOnly)?.resolution ?? selectedVideoFormatId
}

export function buildFormatLabel(videoFormatId: string, videoResolution: string, audioSelection: AudioSelection, audioFormats: FormatOption[]): string {
	const audioLabel = resolveAudioLabel(audioSelection, audioFormats)
	if (videoFormatId === '') return i18next.t('formatLabel.audioOnlyDot', {audio: audioLabel})
	return i18next.t('formatLabel.videoDot', {resolution: videoResolution, audio: audioLabel})
}

// One row per resolution and dynamic range. The first stream in quality order
// represents its group unless one of `preferIds` (the user's pick, the
// profile's pick) is in it: that stream must stay visible and selectable.
export function groupVideoFormats(formats: FormatOption[], preferIds: readonly string[] = []): GroupedVideoFormat[] {
	const groups = new Map<string, FormatOption>()
	for (const f of formats) {
		if (f.isAudioOnly) continue
		const key = `${f.resolution}|${f.dynamicRange ?? ''}`
		const current = groups.get(key)
		if (!current || (preferIds.includes(f.formatId) && !preferIds.includes(current.formatId))) groups.set(key, f)
	}
	return [...groups.values()].map(f => ({resolution: f.resolution, formatId: f.formatId, label: f.label, dynamicRange: f.dynamicRange}))
}

export function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function formatStatus(snapshot: StatusSnapshot | null): string {
	if (!snapshot) return ''
	const key = `status.${snapshot.key}`
	// i18next typed resources don't compose with computed keys + interpolation params; cast through unknown.
	return (i18next.t as (k: string, opts?: Record<string, unknown>) => string)(key, snapshot.params)
}

export function formatLocalizedError(error: LocalizedError | null): string {
	if (!error) return ''
	// For 'unknown', prefer the verbatim raw stderr so the user sees something
	// concrete rather than a generic localized fallback.
	if (error.kind === 'unknown') return error.raw || i18next.t('errors.ytdlp.unknown' as const)
	return i18next.t(`errors.ytdlp.${error.kind}` as const)
}

export function formatProbeError(error: ProbeError | null): string {
	if (!error) return ''
	if (error.kind === 'ytdlp') return formatLocalizedError(error.error)
	return error.message
}
