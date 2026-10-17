import {DEFAULTS} from './constants.js'
import {DEFAULT_HDR_PREFERENCE} from './hdrSetting.js'
import {canEmbedThumbnail, mediaIntentSpec, playlistSelectionToMediaIntent, playlistSubtitleOptions} from './mediaIntent.js'
import type {EmbedOptions, ExtractorIdentity, PreparedJob, SponsorBlockOptions, SubtitleOptions, VideoPart} from './preparedJob.js'
import type {AudioConvert, HdrPreference, MediaIntent, NativeAudioPreference, PlaylistSelection, SponsorBlockCategory, SponsorBlockMode} from './schemas.js'
import type {ContainerArgs} from './selectionOrder.js'

// Pure builder. Lives in `src/shared/` (not renderer) so future QueueStore
// migrations in main can synthesize jobs without a renderer dependency.
//
// The renderer's queueSlice constructs `PrepareJobInput` from wizard state
// (single mode) or playlist entry context (playlist mode) and hands the DTO
// here. Keeping the builder DTO-shaped lets unit tests cover every kind in
// isolation without spinning up the zustand store.
export interface PrepareJobInput extends ExtractorIdentity {
	mode: 'single' | 'playlist'
	// single-mode inputs (set when mode === 'single')
	formatId?: string
	// The file type the user picked on the Format screen, as yt-dlp flags.
	container?: ContainerArgs
	audioConvert?: AudioConvert
	// The single-video Subtitles kind: subtitle files only, no media.
	subtitleOnly?: boolean
	expectedBytes?: number
	// Part of video: only this range is downloaded. Single mode only.
	videoPart?: VideoPart
	// playlist-mode inputs (set when mode === 'playlist')
	playlistSelection?: PlaylistSelection | null
	mediaIntent?: MediaIntent | null
	nativeAudioPreference?: NativeAudioPreference
	hdrPreference?: HdrPreference
	filenameTemplate?: string
	// shared
	subtitles?: SubtitleOptions
	sponsorBlockMode: SponsorBlockMode
	sponsorBlockCategories: SponsorBlockCategory[]
	embed: EmbedOptions
}

export function prepareJob(input: PrepareJobInput): PreparedJob {
	const sponsorBlock = toSponsorBlockOptions(input.sponsorBlockMode, input.sponsorBlockCategories)
	const subtitles = input.subtitles && input.subtitles.languages.length > 0 ? input.subtitles : undefined
	const identity: ExtractorIdentity = {extractor: input.extractor, extractorKey: input.extractorKey}
	const filenameTemplate = input.filenameTemplate ? {filenameTemplate: input.filenameTemplate} : {}

	if (input.mode === 'playlist') {
		if (input.playlistSelection?.kind === 'subtitles') {
			const batchSubtitles = playlistSubtitleOptions(input.playlistSelection)
			if (batchSubtitles.languages.length === 0) throw new Error('prepareJob: subtitle-only requires non-empty subtitle languages')
			return {kind: 'subtitle-only', ...identity, ...filenameTemplate, subtitles: batchSubtitles}
		}
		const intent = input.mediaIntent ?? (input.playlistSelection ? playlistSelectionToMediaIntent(input.playlistSelection) : null)
		if (!intent) throw new Error('prepareJob: playlist mode requires mediaIntent')
		if (!input.filenameTemplate) throw new Error('prepareJob: playlist mode requires filenameTemplate')
		const spec = mediaIntentSpec(intent, input.nativeAudioPreference ?? DEFAULTS.nativeAudioPreference, input.hdrPreference ?? DEFAULT_HDR_PREFERENCE)
		return {
			kind: 'ranged-format',
			...identity,
			intent,
			formatSelector: spec.formatSelector,
			formatSort: spec.formatSort,
			mergeOutputFormat: spec.mergeOutputFormat,
			remuxVideo: spec.remuxVideo,
			audioConvert: spec.audioConvert,
			filenameTemplate: input.filenameTemplate,
			subtitles,
			sponsorBlock,
			embed: {...input.embed, thumbnail: input.embed.thumbnail && canEmbedThumbnail(spec)}
		}
	}

	const hasMedia = !!input.formatId || !!input.audioConvert
	const hasSubs = !!subtitles

	if (input.subtitleOnly === true || (!hasMedia && hasSubs)) {
		if (!subtitles) throw new Error('prepareJob: subtitle-only requires non-empty subtitle languages')
		return {kind: 'subtitle-only', ...identity, ...filenameTemplate, subtitles}
	}

	// SponsorBlock is not offered for a part: its segments are timed against
	// the whole video, and removing them would cut the part a second time.
	const part = input.videoPart ? {videoPart: input.videoPart, sponsorBlock: {mode: 'off'} as const} : {sponsorBlock}

	if (input.audioConvert) {
		return {kind: 'audio-convert', ...identity, audioConvert: input.audioConvert, ...filenameTemplate, subtitles, embed: input.embed, ...part}
	}

	if (!input.formatId) throw new Error('prepareJob: single-format requires formatId')
	return {kind: 'single-format', ...identity, formatId: input.formatId, ...input.container, ...filenameTemplate, subtitles, embed: input.embed, expectedBytes: input.expectedBytes, ...part}
}

function toSponsorBlockOptions(mode: SponsorBlockMode, categories: SponsorBlockCategory[]): SponsorBlockOptions {
	if (mode === 'off' || categories.length === 0) return {mode: 'off'}
	return {mode, categories: [...categories]}
}
