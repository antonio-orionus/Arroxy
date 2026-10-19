import type {DependencyStatus} from './schemas.js'

export interface DetectedDependency {
	name: string
	status: DependencyStatus
	command?: string
	version?: string
	requiredFor: string[]
	notes: string[]
}

export interface StructuredError {
	kind: string
	message: string
	retryable: boolean
	exitCode?: number
	dependency?: string
	stderrExcerpt?: string
	suggestedFixes: string[]
}

export interface CommandResult {
	command: string
	args: string[]
	stdout: string
	stderr: string
	exitCode: number
	durationMs: number
}

export interface CommandPreview {
	command: string
	args: string[]
	redactedArgs: string[]
}

export type YtdlpCommand = CommandPreview

export interface PaginationResult<T> {
	total: number
	count: number
	offset: number
	limit: number
	hasMore: boolean
	nextOffset?: number
	items: T[]
}

export interface ParsedJsonLines<T = unknown> {
	items: T[]
	rawLines: string[]
	parseErrors: Array<{line: string; message: string}>
}

export interface SanitizedFormatSummary {
	formatId?: string
	extension?: string
	protocol?: string
	resolution?: string
	width?: number
	height?: number
	fps?: number
	audioCodec?: string
	videoCodec?: string
	audioBitrate?: number
	videoBitrate?: number
	totalBitrate?: number
	filesize?: number
	filesizeApprox?: number
	formatNote?: string
	dynamicRange?: string
	language?: string
}

export interface SanitizedMetadataItem {
	id?: string
	title?: string
	fulltitle?: string
	description?: string
	duration?: number
	durationString?: string
	uploader?: string
	uploaderId?: string
	channel?: string
	channelId?: string
	channelUrl?: string
	webpageUrl?: string
	extractor?: string
	extractorKey?: string
	uploadDate?: string
	timestamp?: number
	availability?: string
	liveStatus?: string
	ageLimit?: number
	categories?: string[]
	tags?: string[]
	chapters?: unknown[]
	subtitleCount?: number
	subtitleLanguages?: string[]
	automaticCaptionCount?: number
	automaticCaptionLanguages?: string[]
	thumbnailCount?: number
	formatCount?: number
	formats?: SanitizedFormatSummary[]
	selectedFormat?: SanitizedFormatSummary
}

export interface FormatSummary {
	formatId: string
	extension?: string
	resolution?: string
	fps?: number
	filesizeApprox?: string
	note?: string
	raw: string
}

export interface SubtitleSummary {
	language: string
	name?: string
	formats: string[]
	source: 'manual' | 'automatic' | 'unknown'
	raw: string
}

export interface ThumbnailSummary {
	id: string
	url?: string
	resolution?: string
	note?: string
	raw: string
}

export interface FinalPathResult {
	paths: string[]
	stdoutLines: string[]
}

export interface DownloadPlan {
	intent: string
	url: string
	argv: string[]
	redactedArgv: string[]
	outputRoot: string
	outputTemplate: string
	tempRoot: string
	selectedFormat?: string
	formatSort: string[]
	requiredDependencies: DetectedDependency[]
	optionalDependencies: DetectedDependency[]
	risks: string[]
	sideEffects: string[]
	archive?: {path: string; mode: 'read-write' | 'read-only'}
	commandPreview: CommandPreview
	overwrite: boolean
	cookies: {enabled: boolean; source?: 'file' | 'browser'; value?: string}
	expertMode: boolean
}
