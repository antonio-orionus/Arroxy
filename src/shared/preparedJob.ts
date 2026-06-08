// Type aliases live here. Runtime zod schemas live in `./schemas` so that
// `schemas.ts` (which depends on these types via `queueItemSchema` and
// `startDownloadSchema`) does not import a sibling that would re-import
// it — keeps module init free of circular hazards.
import type {AudioConvert, MediaIntent, Preset, SponsorBlockCategory, SubtitleFormat, SubtitleMode} from './schemas.js'

export interface ExtractorIdentity {
	// yt-dlp's IE_NAME for the extractor that produced this job — e.g. 'youtube',
	// 'vimeo', 'twitch:vod'. Used by isYouTubeExtractor() to gate YT-only quirks
	// (PoT minting, rolling-cue dedupe, SponsorBlock UI, etc.).
	extractor: string
	// yt-dlp's extractor_key (PascalCase form, e.g. 'Youtube'). Carried for
	// logging / analytics; not used in branching logic.
	extractorKey: string
}

export interface SubtitleOptions {
	languages: string[]
	mode: SubtitleMode
	format: SubtitleFormat
	writeAuto: boolean
}

export type SponsorBlockOptions = {mode: 'off'} | {mode: 'mark' | 'remove'; categories: SponsorBlockCategory[]}

export interface EmbedOptions {
	chapters: boolean
	metadata: boolean
	thumbnail: boolean
	description: boolean
	thumbnailSidecar: boolean
}

export type PresetOrCustom = Preset | 'custom'

// Discriminated on `kind`. Adding a new mode = new arm + new switch arm in
// every consumer (compiler-enforced exhaustiveness).
export type PreparedJob =
	| (ExtractorIdentity & {kind: 'single-format'; formatId: string; preset: PresetOrCustom; outputTemplate?: string; subtitles?: SubtitleOptions; sponsorBlock: SponsorBlockOptions; embed: EmbedOptions; expectedBytes?: number})
	| (ExtractorIdentity & {kind: 'audio-convert'; audioConvert: AudioConvert; preset: PresetOrCustom; outputTemplate?: string; subtitles?: SubtitleOptions; sponsorBlock: SponsorBlockOptions; embed: EmbedOptions})
	| (ExtractorIdentity & {kind: 'ranged-format'; intent: MediaIntent; formatSelector?: string; formatSort?: string; mergeOutputFormat?: string; audioConvert?: AudioConvert; outputTemplate: string; subtitles?: SubtitleOptions; sponsorBlock: SponsorBlockOptions; embed: EmbedOptions})
	| (ExtractorIdentity & {kind: 'subtitle-only'; outputTemplate?: string; subtitles: SubtitleOptions})

// Schema re-exported here so `@shared/preparedJob` is the canonical path for
// both type and runtime validator.
export {preparedJobSchema} from './schemas.js'
