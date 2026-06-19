import {z} from 'zod'

export const ResponseFormatSchema = z.enum(['json', 'markdown']).default('json')
export const UrlSchema = z.url()
export const DependencyStatusSchema = z.enum(['available', 'missing', 'unknown'])
export const ProgressEventPhaseSchema = z.enum(['download', 'postprocess', 'unknown'])
export const ProbePlaylistModeSchema = z.enum(['auto', 'video', 'playlist'])
export const SubtitleFormatSchema = z.enum(['srt', 'vtt', 'ass'])
export const SubtitleModeSchema = z.enum(['sidecar', 'subfolder', 'embed'])
export const InspectWorkflowKindSchema = z.enum(['metadata', 'single-json', 'formats', 'subtitles', 'thumbnails'])
export const OptionRiskPhaseSchema = z.enum(['inspect', 'plan', 'download', 'postprocess', 'expert'])
export const OptionRiskSchema = z.enum(['low', 'medium', 'high'])
export const OptionPolicySchema = z.enum(['safe', 'path-gated', 'expert-only', 'blocked-in-expert'])
export const YtDlpPostprocessPhaseSchema = z.enum(['extractingAudio', 'convertingVideo', 'embeddingMetadata', 'movingFiles'])
export const YtDlpOutputEventKindSchema = z.enum(['destination', 'merge', 'already-downloaded', 'move', 'artifact', 'sleep', 'sponsorblock-fetch', 'sponsorblock-retry', 'postprocess', 'progress'])

export type DependencyStatus = z.infer<typeof DependencyStatusSchema>
export type ProgressEventPhase = z.infer<typeof ProgressEventPhaseSchema>
export type ProbePlaylistMode = z.infer<typeof ProbePlaylistModeSchema>
export type SubtitleFormat = z.infer<typeof SubtitleFormatSchema>
export type SubtitleMode = z.infer<typeof SubtitleModeSchema>
export type InspectWorkflowKind = z.infer<typeof InspectWorkflowKindSchema>
export type OptionRiskPhase = z.infer<typeof OptionRiskPhaseSchema>
export type OptionRisk = z.infer<typeof OptionRiskSchema>
export type OptionPolicy = z.infer<typeof OptionPolicySchema>
export type YtDlpPostprocessPhase = z.infer<typeof YtDlpPostprocessPhaseSchema>
export type YtDlpOutputEventKind = z.infer<typeof YtDlpOutputEventKindSchema>

export const DEPENDENCY_STATUSES = DependencyStatusSchema.options
export const PROGRESS_EVENT_PHASES = ProgressEventPhaseSchema.options
export const PROBE_PLAYLIST_MODES = ProbePlaylistModeSchema.options
export const SUBTITLE_FORMATS = SubtitleFormatSchema.options
export const SUBTITLE_MODES = SubtitleModeSchema.options
export const INSPECT_WORKFLOW_KINDS = InspectWorkflowKindSchema.options
export const OPTION_RISK_PHASES = OptionRiskPhaseSchema.options
export const OPTION_RISKS = OptionRiskSchema.options
export const OPTION_POLICIES = OptionPolicySchema.options
export const YT_DLP_POSTPROCESS_PHASES = YtDlpPostprocessPhaseSchema.options
export const YT_DLP_OUTPUT_EVENT_KINDS = YtDlpOutputEventKindSchema.options

export const OutputPolicySchema = z.object({outputRoot: z.string().optional(), tempRoot: z.string().optional(), outputTemplate: z.string().optional(), allowOverwrite: z.boolean().default(false)})

export const NetworkOptionsSchema = z.object({
	proxy: z.string().optional(),
	socketTimeout: z.number().int().positive().optional(),
	sourceAddress: z.string().optional(),
	impersonate: z.string().optional(),
	forceIpv4: z.boolean().optional(),
	forceIpv6: z.boolean().optional(),
	geoVerificationProxy: z.string().optional(),
	xff: z.string().optional()
})

export const SelectionOptionsSchema = z.object({
	playlistItems: z.string().optional(),
	noPlaylist: z.boolean().optional(),
	yesPlaylist: z.boolean().optional(),
	minFilesize: z.string().optional(),
	maxFilesize: z.string().optional(),
	date: z.string().optional(),
	dateBefore: z.string().optional(),
	dateAfter: z.string().optional(),
	matchFilters: z.array(z.string()).default([]),
	breakMatchFilters: z.array(z.string()).default([]),
	ageLimit: z.number().int().nonnegative().optional(),
	downloadArchive: z.string().optional(),
	maxDownloads: z.number().int().positive().optional(),
	breakOnExisting: z.boolean().optional(),
	breakPerInput: z.boolean().optional(),
	skipPlaylistAfterErrors: z.number().int().nonnegative().optional()
})

export const DownloadOptionsSchema = z.object({
	concurrentFragments: z.number().int().positive().optional(),
	limitRate: z.string().optional(),
	throttledRate: z.string().optional(),
	retries: z.string().optional(),
	fileAccessRetries: z.string().optional(),
	fragmentRetries: z.string().optional(),
	retrySleep: z.array(z.string()).default([]),
	keepFragments: z.boolean().optional(),
	bufferSize: z.string().optional(),
	httpChunkSize: z.string().optional(),
	playlistRandom: z.boolean().optional(),
	lazyPlaylist: z.boolean().optional(),
	hlsUseMpegts: z.boolean().optional(),
	downloadSections: z.array(z.string()).default([]),
	downloader: z.array(z.string()).default([]),
	downloaderArgs: z.array(z.string()).default([])
})

export const FormatOptionsSchema = z.object({
	format: z.string().optional(),
	formatSort: z.array(z.string()).default([]),
	formatSortReset: z.boolean().optional(),
	formatSortForce: z.boolean().optional(),
	videoMultistreams: z.boolean().optional(),
	audioMultistreams: z.boolean().optional(),
	preferFreeFormats: z.boolean().optional(),
	checkFormats: z.boolean().optional(),
	checkAllFormats: z.boolean().optional(),
	mergeOutputFormat: z.string().optional()
})

export const SubtitleOptionsSchema = z.object({writeSubs: z.boolean().optional(), writeAutoSubs: z.boolean().optional(), subFormat: z.string().optional(), subLangs: z.string().optional(), convertSubs: z.string().optional()})

export const ThumbnailOptionsSchema = z.object({writeThumbnail: z.boolean().optional(), writeAllThumbnails: z.boolean().optional(), convertThumbnails: z.string().optional()})

export const AuthOptionsSchema = z.object({
	username: z.string().optional(),
	password: z.string().optional(),
	twofactor: z.string().optional(),
	netrc: z.boolean().optional(),
	netrcLocation: z.string().optional(),
	netrcCmd: z.string().optional(),
	videoPassword: z.string().optional(),
	cookiesFile: z.string().optional(),
	cookiesFromBrowser: z.string().optional()
})

export const PostprocessOptionsSchema = z.object({
	extractAudio: z.boolean().optional(),
	audioFormat: z.enum(['best', 'aac', 'alac', 'flac', 'm4a', 'mp3', 'opus', 'vorbis', 'wav']).optional(),
	audioQuality: z.string().optional(),
	remuxVideo: z.string().optional(),
	recodeVideo: z.string().optional(),
	postprocessorArgs: z.array(z.string()).default([]),
	keepVideo: z.boolean().optional(),
	postOverwrites: z.boolean().optional(),
	embedSubs: z.boolean().optional(),
	embedThumbnail: z.boolean().optional(),
	embedMetadata: z.boolean().optional(),
	embedChapters: z.boolean().optional(),
	embedInfoJson: z.boolean().optional(),
	parseMetadata: z.array(z.string()).default([]),
	replaceInMetadata: z.array(z.string()).default([]),
	xattrs: z.boolean().optional(),
	concatPlaylist: z.enum(['never', 'always', 'multi_video']).optional(),
	fixup: z.enum(['never', 'warn', 'detect_or_warn', 'force']).optional(),
	splitChapters: z.boolean().optional(),
	removeChapters: z.array(z.string()).default([]),
	forceKeyframesAtCuts: z.boolean().optional(),
	usePostprocessor: z.array(z.string()).default([])
})

export const SponsorBlockOptionsSchema = z.object({mark: z.string().optional(), remove: z.string().optional(), chapterTitle: z.string().optional(), api: z.url().optional()})

export const ExtractorOptionsSchema = z.object({
	extractorRetries: z.string().optional(),
	allowDynamicMpd: z.boolean().optional(),
	hlsSplitDiscontinuity: z.boolean().optional(),
	extractorArgs: z.array(z.string()).default([]),
	youtube: z
		.object({
			lang: z.string().optional(),
			skip: z.array(z.string()).default([]),
			playerClient: z.array(z.string()).default([]),
			commentSort: z.enum(['top', 'new']).optional(),
			maxComments: z.string().optional(),
			formats: z.array(z.string()).default([]),
			poToken: z.array(z.string()).default([]),
			fetchPot: z.enum(['always', 'never', 'auto']).optional()
		})
		.optional()
})

export const InspectInputSchema = z.object({
	url: UrlSchema,
	responseFormat: ResponseFormatSchema,
	flatPlaylist: z.boolean().default(false),
	limit: z.number().int().positive().max(500).default(50),
	offset: z.number().int().nonnegative().default(0),
	auth: AuthOptionsSchema.default({}),
	network: NetworkOptionsSchema.default({})
})

export const WorkflowInspectInputSchema = InspectInputSchema.extend({kind: z.literal('inspect'), inspect: InspectWorkflowKindSchema.default('metadata')})

export const WorkflowDownloadInputSchema = z.object({
	url: UrlSchema,
	kind: z.enum(['media', 'audio', 'subtitles', 'thumbnail', 'playlist']).default('media'),
	format: FormatOptionsSchema.default({formatSort: []}),
	output: OutputPolicySchema.default({allowOverwrite: false}),
	network: NetworkOptionsSchema.default({}),
	selection: SelectionOptionsSchema.default({matchFilters: [], breakMatchFilters: []}),
	download: DownloadOptionsSchema.default({retrySleep: [], downloadSections: [], downloader: [], downloaderArgs: []}),
	subtitles: SubtitleOptionsSchema.default({}),
	thumbnails: ThumbnailOptionsSchema.default({}),
	auth: AuthOptionsSchema.default({}),
	postprocess: PostprocessOptionsSchema.default({postprocessorArgs: [], parseMetadata: [], replaceInMetadata: [], removeChapters: [], usePostprocessor: []}),
	sponsorblock: SponsorBlockOptionsSchema.default({}),
	extractor: ExtractorOptionsSchema.default({extractorArgs: []})
})

export const WorkflowExecutionInputSchema = WorkflowDownloadInputSchema.extend({dryRun: z.boolean().default(false)})

export const WorkflowPostprocessInputSchema = z.object({
	kind: z.literal('postprocess'),
	url: UrlSchema.optional(),
	inputFile: z.string().optional(),
	output: OutputPolicySchema.default({allowOverwrite: false}),
	postprocess: PostprocessOptionsSchema.default({postprocessorArgs: [], parseMetadata: [], replaceInMetadata: [], removeChapters: [], usePostprocessor: []}),
	sponsorblock: SponsorBlockOptionsSchema.default({}),
	format: FormatOptionsSchema.default({formatSort: []}),
	auth: AuthOptionsSchema.default({}),
	network: NetworkOptionsSchema.default({})
})

export const WorkflowExpertInputSchema = z.object({kind: z.literal('expert'), url: UrlSchema.optional(), args: z.array(z.string()).default([]), dryRun: z.boolean().default(true), output: OutputPolicySchema.default({allowOverwrite: false})})

export const WorkflowInputSchema = z.union([WorkflowInspectInputSchema, WorkflowDownloadInputSchema, WorkflowPostprocessInputSchema, WorkflowExpertInputSchema])

export const ValidateWorkflowInputSchema = WorkflowDownloadInputSchema.partial().extend({url: UrlSchema.optional()})
export const ArchivePathInputSchema = z.object({archivePath: z.string(), entry: z.string().optional()})
export const EmptyInputSchema = z.object({})
export const GenericOutputSchema = z.object({ok: z.boolean(), data: z.unknown().optional(), error: z.unknown().optional()})
