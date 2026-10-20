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
	// yt-dlp found no extractor for the URL, or the input was not a URL at all.
	// Classified from stderr; callers may also set it from their own URL
	// validation before yt-dlp is spawned.
	'unsupportedUrl',
	// The output folder's name holds text yt-dlp expands before it writes
	// (`$NAME`, `%NAME%`, a leading `~`), so the files would land elsewhere.
	// yt-dlp reports nothing: only a caller that checks the folder before
	// spawning can set it.
	'outputPathExpands',
	// Fallback when no pattern matches. `raw` carries the verbatim stderr.
	'unknown'
] as const

export type YtDlpErrorKind = (typeof YT_DLP_ERROR_KINDS)[number]

// Kinds the stderr classifier matches by pattern. `unknown` is its fallback;
// `outputPathExpands` never shows in stderr.
export type ClassifierKind = Exclude<YtDlpErrorKind, 'unknown' | 'outputPathExpands'>

export interface ClassifiedError {
	kind: YtDlpErrorKind
	raw: string
}

// Which rate limit a run shows. `rateLimited`: an HTTP 429 on a request.
// `sessionRateLimited`: YouTube's session or account limit, which lasts up to
// an hour. yt-dlp never retries a 429 and reads no Retry-After, so how long to
// wait is the host's call.
export const RATE_LIMIT_EVIDENCE = ['rateLimited', 'sessionRateLimited'] as const

export type RateLimitEvidence = (typeof RATE_LIMIT_EVIDENCE)[number]
