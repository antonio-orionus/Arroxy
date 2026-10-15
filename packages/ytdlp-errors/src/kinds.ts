// Closed taxonomy of yt-dlp failure kinds. Adding a new kind = minor SemVer
// bump (consumers may need to handle a new branch). Renaming or removing a
// kind = major bump. Adding a new regex to an existing kind = patch.

export const YT_DLP_ERROR_KINDS = [
	// Patterns derived from yt-dlp stderr — `classifyYtDlpStderr` produces these.
	'botBlock',
	'ipBlock',
	'rateLimit',
	'ageRestricted',
	'unavailable',
	'geoBlocked',
	'drmProtected',
	'loginRequired',
	'outOfDiskSpace',
	'outputNotWritable',
	'chunkTransferFailure',
	'missingDependency',
	'postprocessFailure',
	'parse',
	'network',
	// Caller-supplied (not produced by stderr classifier). Kept in the union so
	// i18n and UX switches can stay exhaustive across all error surfaces the
	// host app deals with (e.g. URL validation before yt-dlp is even spawned).
	'unsupportedUrl',
	// Fallback when no pattern matches. `raw` carries the verbatim stderr.
	'unknown'
] as const

export type YtDlpErrorKind = (typeof YT_DLP_ERROR_KINDS)[number]

// Kinds the stderr classifier can produce. `unsupportedUrl` is set by callers
// (URL validation, probe paths); never emitted by yt-dlp stderr directly.
export type ClassifierKind = Exclude<YtDlpErrorKind, 'unsupportedUrl' | 'unknown'>

export interface ClassifiedError {
	kind: YtDlpErrorKind
	raw: string
}
