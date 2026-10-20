// The prepared-job contract: its types and the runtime validator for jobs that
// cross IPC. It imports from `./schemas`, never the other way round, so module
// init stays free of circular hazards.
import {z} from 'zod'
import {SubtitleFormatSchema as subtitleFormatSchema, SubtitleModeSchema as subtitleModeSchema} from 'yt-dlp-bridge/schemas'
import {audioConvertSchema, cookiesModeSchema, jobAuthSchema, mediaIntentSchema, sponsorBlockCategorySchema, webUrlSchema} from './schemas.js'
import type {AudioConvert, MediaIntent, SponsorBlockCategory, SubtitleFormat, SubtitleMode} from './schemas.js'

export interface ExtractorIdentity {
	// yt-dlp's IE_NAME for the extractor that produced this job — e.g. 'youtube',
	// 'vimeo', 'twitch:vod'. Used by isYouTubeExtractor() to gate YT-only quirks
	// (PoT minting, rolling-cue dedupe, SponsorBlock UI, etc.).
	extractor: string
	// yt-dlp's extractor_key (PascalCase form, e.g. 'Youtube'). Carried for
	// logging; not used in branching logic.
	extractorKey: string
}

export interface SubtitleOptions {
	languages: string[]
	mode: SubtitleMode
	format: SubtitleFormat
	writeAuto: boolean
	// Request automatic captions only and skip manual tracks, so an "auto-only"
	// source choice is honoured even when a manual track exists. Implies
	// `writeAuto`; absent means manual tracks are requested as usual.
	autoOnly?: boolean
	// `languages` are a profile's or batch's language codes (`de`), not this
	// video's track keys (`de-DE`, `en-orig`). Set until the video's subtitle
	// maps are known: queueing resolves them from the probe, the subtitle phase
	// from an info-json. Absent: exact track keys, as the Format screen sends.
	languagesAreCodes?: true
}

export type SponsorBlockOptions = {mode: 'off'} | {mode: 'mark' | 'remove'; categories: SponsorBlockCategory[]}

export interface EmbedOptions {
	chapters: boolean
	metadata: boolean
	thumbnail: boolean
	description: boolean
	thumbnailSidecar: boolean
}

// Part of video: a time range of one video, in whole seconds. `exactCut`
// re-encodes so the cuts land exactly; otherwise they land on keyframes.
export interface VideoPart {
	startSeconds: number
	endSeconds: number
	exactCut: boolean
}

// Discriminated on `kind`. Adding a new mode = new arm + new switch arm in
// every consumer (compiler-enforced exhaustiveness). `unresolved` is the
// probe-stage placeholder: carried by a `probing` queue item until the probe
// produces a real job — never startable (DownloadService refuses it).
export type PreparedJob =
	| (ExtractorIdentity & {kind: 'single-format'; formatId: string; mergeOutputFormat?: string; remuxVideo?: string; filenameTemplate?: string; subtitles?: SubtitleOptions; sponsorBlock: SponsorBlockOptions; embed: EmbedOptions; expectedBytes?: number; videoPart?: VideoPart})
	| (ExtractorIdentity & {kind: 'audio-convert'; audioConvert: AudioConvert; formatId?: string; filenameTemplate?: string; subtitles?: SubtitleOptions; sponsorBlock: SponsorBlockOptions; embed: EmbedOptions; expectedBytes?: number; videoPart?: VideoPart})
	| (ExtractorIdentity & {kind: 'ranged-format'; intent: MediaIntent; formatSelector?: string; formatSort?: string; mergeOutputFormat?: string; remuxVideo?: string; audioConvert?: AudioConvert; filenameTemplate: string; subtitles?: SubtitleOptions; sponsorBlock: SponsorBlockOptions; embed: EmbedOptions})
	| (ExtractorIdentity & {kind: 'subtitle-only'; filenameTemplate?: string; subtitles: SubtitleOptions})
	| {kind: 'unresolved'; extractor: ''; extractorKey: ''}

// `languagesAreCodes`: see `SubtitleOptions`.
const subtitleOptionsSchema = z.object({languages: z.array(z.string()), mode: subtitleModeSchema, format: subtitleFormatSchema, writeAuto: z.boolean(), autoOnly: z.boolean().optional(), languagesAreCodes: z.literal(true).optional()})

const sponsorBlockOptionsSchema = z.discriminatedUnion('mode', [z.object({mode: z.literal('off')}), z.object({mode: z.enum(['mark', 'remove']), categories: z.array(sponsorBlockCategorySchema)})])

const videoPartSchema = z.object({startSeconds: z.number().int().min(0), endSeconds: z.number().int().positive(), exactCut: z.boolean()}).refine(part => part.startSeconds < part.endSeconds, {message: 'startSeconds must be before endSeconds'})

const embedOptionsSchema = z.object({chapters: z.boolean(), metadata: z.boolean(), thumbnail: z.boolean(), description: z.boolean(), thumbnailSidecar: z.boolean()})

// Each variant carries the yt-dlp `extractor` + `extractor_key` strings that
// were observed at probe time. These plumb through to download jobs so the
// download path can branch on extractor without re-probing.
const extractorIdentitySchema = {extractor: z.string(), extractorKey: z.string()}

export const preparedJobSchema = z.discriminatedUnion('kind', [
	z.object({
		kind: z.literal('single-format'),
		...extractorIdentitySchema,
		formatId: z.string().min(1),
		mergeOutputFormat: z.string().min(1).optional(),
		remuxVideo: z.string().min(1).optional(),
		filenameTemplate: z.string().min(1).optional(),
		subtitles: subtitleOptionsSchema.optional(),
		sponsorBlock: sponsorBlockOptionsSchema,
		embed: embedOptionsSchema,
		expectedBytes: z.number().positive().optional(),
		videoPart: videoPartSchema.optional()
	}),
	z.object({
		kind: z.literal('audio-convert'),
		...extractorIdentitySchema,
		audioConvert: audioConvertSchema,
		formatId: z.string().min(1).optional(),
		filenameTemplate: z.string().min(1).optional(),
		subtitles: subtitleOptionsSchema.optional(),
		sponsorBlock: sponsorBlockOptionsSchema,
		embed: embedOptionsSchema,
		expectedBytes: z.number().positive().optional(),
		videoPart: videoPartSchema.optional()
	}),
	z.object({
		kind: z.literal('ranged-format'),
		...extractorIdentitySchema,
		intent: mediaIntentSchema,
		formatSelector: z.string().min(1).optional(),
		formatSort: z.string().min(1).optional(),
		mergeOutputFormat: z.string().min(1).optional(),
		remuxVideo: z.string().min(1).optional(),
		audioConvert: audioConvertSchema.optional(),
		filenameTemplate: z.string().min(1),
		subtitles: subtitleOptionsSchema.optional(),
		sponsorBlock: sponsorBlockOptionsSchema,
		embed: embedOptionsSchema
	}),
	z.object({kind: z.literal('subtitle-only'), ...extractorIdentitySchema, filenameTemplate: z.string().min(1).optional(), subtitles: subtitleOptionsSchema}),
	z.object({kind: z.literal('unresolved'), extractor: z.literal(''), extractorKey: z.literal('')})
])

export const startDownloadSchema = z.object({url: webUrlSchema, outputDir: z.string().min(1).optional(), cookiesMode: cookiesModeSchema.optional(), job: preparedJobSchema, auth: jobAuthSchema.optional()})
