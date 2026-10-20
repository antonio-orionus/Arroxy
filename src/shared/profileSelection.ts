// Download profile + probe → the concrete pre-selection of the single-video
// Format screen. The profile describes intent ("up to 720p, MP4"); the probe
// lists what this video has. The pick runs the very `-f` and `-S` a queued
// download hands yt-dlp (`mediaIntentSpec`) through yt-dlp's own format sort
// and selection, translated (`ytdlp/formatSorter.ts`, `ytdlp/formatSelector.ts`)
// and held to yt-dlp by the selection parity check, so the Format screen
// pre-selects what Quick Download downloads. The result names exact format
// ids so sizes and the review are exact, plus fit notices for every part of
// the profile this video can't honour.

import {DEFAULT_AUDIO_BITRATE} from './schemas.js'
import type {AudioBitrate, AudioSelection, DownloadProfile, DownloadProfileAudioFormat, MediaIntent, NativeAudioPreference, PlaylistVideoTier, WizardMediaKind} from './schemas.js'
import type {FormatOption, SubtitleMap} from './types.js'
import {asResolvedHdr, DEFAULT_HDR_PREFERENCE, type GlobalHdr} from './hdrSetting.js'
import {mediaIntentSpec} from './mediaIntent.js'
import {selectionOrder, type SelectionOrder} from './selectionOrder.js'
import {pickSubtitleTracks} from './subtitleLanguages.js'
import {tierHeightOf} from './videoTier.js'
import type {FormatSelectionSource} from './ytdlp/selectableFormat.js'
import {createFormatSorter, prepareForSort, sortFormats} from './ytdlp/formatSorter.js'
import {selectFormats, type SelectedFormats} from './ytdlp/formatSelector.js'

export interface ProfileSelectionInput {
	profile: DownloadProfile
	// The Format screen's options; the pick names some of them.
	formats: readonly FormatOption[]
	// The same formats as yt-dlp sees them, which the pick runs on.
	selection: FormatSelectionSource
	subtitles: SubtitleMap
	automaticCaptions: SubtitleMap
	isAudioOnlySource: boolean
	nativeAudioPreference: NativeAudioPreference
	// The app-wide HDR choice; the profile may override it. Absent reads as the app default.
	hdrPreference?: GlobalHdr
}

export interface MediaSelection {
	kind: WizardMediaKind
	videoFormatId: string
	audioSelection: AudioSelection
}

export type FitNotice = {kind: 'video-tier-fallback'; wanted: Exclude<PlaylistVideoTier, 'best'>; picked: number} | {kind: 'mp4-unavailable'} | {kind: 'webm-unavailable'; blocker: string} | {kind: 'no-video'} | {kind: 'subtitle-languages-missing'; languages: string[]}

export interface ProfileSelection {
	media: MediaSelection
	subtitleLanguages: string[]
	notices: FitNotice[]
	// The order that made the pick, for the "Why this one" explanation. Null
	// when the profile has no video (audio or subtitles only).
	order: SelectionOrder | null
}

const NO_AUDIO: AudioSelection = {kind: 'none'}

// The stream's tier (see videoTier.ts): the same height the Format screen names
// its row by, so a letterboxed 1280x640 is 720, never a 640 "fallback".
export function videoHeight(resolution: string): number {
	const dims = /(\d+)\s*x\s*(\d+)/.exec(resolution)
	if (dims) return tierHeightOf(Number(dims[1]), Number(dims[2])) ?? Math.min(Number(dims[1]), Number(dims[2]))
	const p = /(\d{3,4})p/.exec(resolution)
	if (p) return Number(p[1])
	const any = /(\d{3,4})/.exec(resolution)
	return any ? Number(any[1]) : 0
}

export function isH264(format: FormatOption): boolean {
	const codec = format.videoCodec?.toLowerCase() ?? ''
	return codec.startsWith('avc1') || codec.startsWith('h264')
}

// What the yt-dlp run for `intent` would download from this video.
function ytDlpPick(intent: MediaIntent, input: ProfileSelectionInput): SelectedFormats | null {
	const spec = mediaIntentSpec(intent, input.nativeAudioPreference, asResolvedHdr(input.hdrPreference ?? DEFAULT_HDR_PREFERENCE).preference)
	if (!spec.formatSelector) return null
	const sorter = createFormatSorter(spec.formatSort ? spec.formatSort.split(',') : [], input.selection.sortFields)
	return selectFormats(spec.formatSelector, sortFormats(prepareForSort(input.selection.formats, input.selection.durationSeconds), sorter))
}

// The picked streams as the Format screen's options: the one with video, and
// a separate audio stream when yt-dlp merges one in. A muxed video keeps its
// own sound. Read by the options' own flags, which also name as audio a
// stream whose site left its video codec out.
function pickedOptions(picked: SelectedFormats | null, formats: readonly FormatOption[]): {video?: FormatOption; audio?: FormatOption} {
	const options = (picked?.formats ?? []).flatMap(format => formats.filter(option => option.formatId === format.format_id))
	return {video: options.find(option => !option.isAudioOnly), audio: options.find(option => option.isAudioOnly)}
}

function audioOnlySelection(profileAudio: {format: DownloadProfileAudioFormat; bitrateKbps?: AudioBitrate}, input: ProfileSelectionInput): AudioSelection {
	if (profileAudio.format === 'wav') return {kind: 'convert-lossless', target: 'wav'}
	if (profileAudio.format !== 'best') return {kind: 'convert-lossy', target: profileAudio.format, bitrateKbps: profileAudio.bitrateKbps ?? DEFAULT_AUDIO_BITRATE}
	const picked = pickedOptions(ytDlpPick({kind: 'audio-only', audio: {format: 'best'}}, input), input.formats)
	// A source with no separable audio track can only give audio by converting
	// its muxed stream; "native" would land on the disabled "No audio" row.
	return picked.audio && !picked.video ? {kind: 'native', formatId: picked.audio.formatId} : {kind: 'convert-lossy', target: 'mp3', bitrateKbps: DEFAULT_AUDIO_BITRATE}
}

// The order shown as "Why this one" names the source and protocol ranks only
// where the extractor's own sort ranks them as the rows say (YouTube's plain
// `source` and `proto`): elsewhere every copy ties on them before the codec
// and size decide, and `proto:m3u8` (X) would put HLS first, not last.
function forThisVideo(order: SelectionOrder, sortFields: readonly string[]): SelectionOrder {
	const named = (field: string): boolean => sortFields.includes(field)
	return {...order, video: order.video.filter(rank => (rank.kind !== 'source' || named('source')) && (rank.kind !== 'protocol' || named('proto')))}
}

function resolveMedia(input: ProfileSelectionInput, notices: FitNotice[]): {media: MediaSelection; order: SelectionOrder | null} {
	const {profile, formats, nativeAudioPreference} = input
	const media = profile.media

	if (media.kind === 'subtitles-only') return {media: {kind: 'subtitles', videoFormatId: '', audioSelection: NO_AUDIO}, order: null}
	if (media.kind === 'audio-only') return {media: {kind: 'audio', videoFormatId: '', audioSelection: audioOnlySelection(media.audio, input)}, order: null}

	const order = forThisVideo(selectionOrder(media, nativeAudioPreference, input.hdrPreference), input.selection.sortFields)
	if (input.isAudioOnlySource || !formats.some(format => !format.isAudioOnly)) {
		notices.push({kind: 'no-video'})
		return {media: {kind: 'audio', videoFormatId: '', audioSelection: audioOnlySelection({format: 'best'}, input)}, order}
	}

	const picked = ytDlpPick(media, input)
	const {video, audio} = pickedOptions(picked, formats)
	if (!video) return {media: {kind: 'video', videoFormatId: '', audioSelection: NO_AUDIO}, order}
	if (order.goal === 'smart-tv' && !isH264(video)) notices.push({kind: 'mp4-unavailable'})
	// A stream meets the tier when either measure says so: the row's label
	// (a 1280x640 trailer reads 720p) or the tier as `-S res:N` counts it,
	// yt-dlp's `res`, the smaller side (an ultra-wide 2560x1080 is 1080 though
	// its row reads 1440p). A stream whose site gives no size (0) says nothing.
	const pickedHeight = videoHeight(video.resolution)
	const raw = picked?.formats.find(format => format.format_id === video.formatId)
	const sides = [raw?.height, raw?.width].filter((side): side is number => side !== undefined && side > 0)
	const res = sides.length > 0 ? Math.min(...sides) : pickedHeight
	const meetsTier = (height: number): boolean => height === Number(order.tier)
	if (order.tier !== 'best' && pickedHeight !== 0 && !meetsTier(pickedHeight) && !meetsTier(res)) notices.push({kind: 'video-tier-fallback', wanted: order.tier, picked: pickedHeight})
	return {media: {kind: 'video', videoFormatId: video.formatId, audioSelection: audio ? {kind: 'native', formatId: audio.formatId} : NO_AUDIO}, order}
}

function resolveSubtitles(input: ProfileSelectionInput, notices: FitNotice[]): string[] {
	const {profile, subtitles, automaticCaptions} = input
	const wanted = profile.media.kind === 'subtitles-only' || profile.subtitles.enabled ? profile.subtitles.languages : []
	const {tracks, missing} = pickSubtitleTracks(wanted, profile.subtitles.source, {subtitles, automaticCaptions})
	if (missing.length > 0) notices.push({kind: 'subtitle-languages-missing', languages: missing})
	return tracks
}

export function resolveProfileSelection(input: ProfileSelectionInput): ProfileSelection {
	const notices: FitNotice[] = []
	const {media, order} = resolveMedia(input, notices)
	const subtitleLanguages = resolveSubtitles(input, notices)
	return {media, subtitleLanguages, notices, order}
}
