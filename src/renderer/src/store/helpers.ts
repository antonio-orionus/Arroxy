import {resolutionLabel} from '@renderer/lib/resolutionLabel.js'
import type {AudioConvert, FormatOption, LocalizedError, ProbeError, StatusSnapshot, WizardMediaKind} from '@shared/types.js'
import {i18next} from '@shared/i18n/index.js'
import {videoCodecName} from '@shared/fileTypeFit.js'
import {selectedConversionSource} from '@shared/audioConversionSource.js'
import type {FormatSelectionSource} from '@shared/ytdlp/selectableFormat.js'
import type {AudioSelection} from './types.js'

export interface GroupedVideoFormat {
	resolution: string
	formatId: string
	label: string
	dynamicRange?: string
}

// Composes the yt-dlp `-f` value for native + video selections. Convert
// selections pass `audioConvert` plus, with several audio languages, the
// chosen language's stream as `formatId`; without it the default track converts.
export function buildFormatId(videoFormatId: string, audioSelection: AudioSelection): string | undefined {
	if (audioSelection.kind === 'convert-lossy' || audioSelection.kind === 'convert-lossless') return audioSelection.sourceFormatId
	if (audioSelection.kind === 'extract') return audioSelection.formatId
	const audioFormatId = audioSelection.kind === 'native' ? audioSelection.formatId : null
	if (videoFormatId === '' && audioFormatId === null) return undefined
	if (videoFormatId === '') return audioFormatId ?? undefined
	if (audioFormatId === null) return videoFormatId
	return `${videoFormatId}+${audioFormatId}`
}

// IPC payload mirror of audioSelection. Returns the `audioConvert` field for
// the IPC schema, or undefined for none, and a native pick beside a video.
// Audio mode extracts what it downloads (`-x --audio-format best`), as an
// Audio only profile's Quick Download does.
export function buildAudioConvertPayload(audioSelection: AudioSelection, mediaKind: WizardMediaKind): AudioConvert | undefined {
	if (audioSelection.kind === 'extract' || (audioSelection.kind === 'native' && mediaKind === 'audio')) return {target: 'best'}
	if (audioSelection.kind === 'convert-lossless') return {target: 'wav'}
	if (audioSelection.kind === 'convert-lossy') return {target: audioSelection.target, bitrateKbps: audioSelection.bitrateKbps}
	return undefined
}

// Selected audio → human label. Used by buildFormatLabel (queue item) and
// StepConfirm (preview row) so they can't drift.
// `formatSelection`: the probe's own yt-dlp formats, which say which stream a conversion starts from.
export function resolveAudioLabel(audioSelection: AudioSelection, audioFormats: FormatOption[], formatSelection: FormatSelectionSource): string {
	if (audioSelection.kind === 'none') return i18next.t('wizard.formats.noAudio')
	if (audioSelection.kind === 'extract') return i18next.t('wizard.formats.keepAudio')
	if (audioSelection.kind === 'convert-lossless') return i18next.t('wizard.formats.convert.wavLabel')
	if (audioSelection.kind === 'convert-lossy') {
		// i18next typed-resource inference doesn't always pick up placeholders in
		// every locale variant — cast through `unknown` like formatStatus does.
		const t = i18next.t as (k: string, opts?: Record<string, unknown>) => string
		const target = audioSelection.target.toUpperCase()
		// A source already in the target codec is copied: the chosen bitrate doesn't apply.
		const source = selectedConversionSource(formatSelection, audioSelection.target, audioSelection.sourceFormatId)
		if (source?.copies) return source.kbps ? t('wizard.formats.convert.copyLabel', {target, bitrate: Math.round(source.kbps)}) : t('wizard.formats.convert.copyLabelNoBitrate', {target})
		return t('wizard.formats.convert.lossyLabel', {target, bitrate: audioSelection.bitrateKbps})
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

export function buildFormatLabel(videoFormatId: string, videoResolution: string, audioSelection: AudioSelection, audioFormats: FormatOption[], formatSelection: FormatSelectionSource): string {
	const audioLabel = resolveAudioLabel(audioSelection, audioFormats, formatSelection)
	if (videoFormatId === '') return i18next.t('formatLabel.audioOnlyDot', {audio: audioLabel})
	return i18next.t('formatLabel.videoDot', {resolution: videoResolution, audio: audioLabel})
}

// Everything a chip shows of a stream, and everything yt-dlp ranks it by:
// streams equal in all of it are copies of one stream.
function videoCopyKey(format: FormatOption): string {
	return JSON.stringify([format.resolution, format.dynamicRange, format.videoCodec, format.audioCodec, format.ext, format.fps, format.tbr, format.filesize, format.quality, format.preference, format.isVideoOnly, format.markers ?? []])
}

// One chip per resolution, dynamic range and codec, so H.264 or VP9 at a height
// stays reachable. A stream whose codec the site doesn't name joins a named
// codec's chip at its height, or is the height's only other chip: an unnamed
// codec is never a choice of its own. The first stream in quality order
// represents its chip unless one of `preferIds` (the user's pick, the profile's
// pick) is in it: that stream must stay visible and selectable.
// Of identical copies (Vimeo lists each stream once per CDN) it is the one
// yt-dlp would take: it lists formats worst first, and equals keep their order, so the last.
export function groupVideoFormats(formats: FormatOption[], preferIds: readonly string[] = []): GroupedVideoFormat[] {
	const groups = new Map<string, FormatOption>()
	function consider(key: string, f: FormatOption): void {
		const current = groups.get(key)
		// A chip with both shows the video-only stream, so every chip pairs with
		// the Audio column the same way; a stream with its own audio (YouTube's
		// 360p MP4) shows only where it is the sole one, or the picked one.
		const preferred = preferIds.includes(f.formatId) && !preferIds.includes(current?.formatId ?? '')
		const silentOverMuxed = current !== undefined && !preferIds.includes(current.formatId) && !current.isVideoOnly && f.isVideoOnly
		// The copy the site rates higher (yt-dlp's quality), e.g. Twitch's landscape clip over its portrait crop.
		const higherRated = current !== undefined && !preferIds.includes(current.formatId) && current.isVideoOnly === f.isVideoOnly && (f.quality ?? 0) > (current.quality ?? 0)
		const laterCopy = current !== undefined && !preferIds.includes(current.formatId) && videoCopyKey(current) === videoCopyKey(f)
		if (!current || preferred || silentOverMuxed || higherRated || laterCopy) groups.set(key, f)
	}
	const videos = formats.filter(f => !f.isAudioOnly)
	// By the name the row shows: "1920x1080" and "1080p" are one 1080p row.
	const rowKey = (f: FormatOption): string => `${resolutionLabel(f.resolution).label}|${f.dynamicRange ?? ''}|`
	for (const f of videos) {
		const codec = videoCodecName(f.videoCodec)
		if (codec !== null) consider(rowKey(f) + codec, f)
	}
	for (const f of videos) {
		if (videoCodecName(f.videoCodec) !== null) continue
		// A file with no resolution and no codec: only its size tells it from
		// another one (Facebook's sd and hd); the same file listed twice stays one.
		if (resolutionLabel(f.resolution).label === '' && f.filesize !== undefined) {
			consider(`${rowKey(f)}size:${f.filesize}`, f)
			continue
		}
		const named = [...groups.keys()].find(key => key.startsWith(rowKey(f)))
		consider(named ?? rowKey(f), f)
	}
	// Back in the probe's quality order: the second pass appended the unnamed ones.
	const order = new Map(formats.map((f, index) => [f.formatId, index]))
	return [...groups.values()].toSorted((a, b) => (order.get(a.formatId) ?? 0) - (order.get(b.formatId) ?? 0)).map(f => ({resolution: f.resolution, formatId: f.formatId, label: f.label, dynamicRange: f.dynamicRange}))
}

// Queue item and playlist group ids. Opaque: nothing orders or parses them.
export function generateId(): string {
	return crypto.randomUUID()
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
