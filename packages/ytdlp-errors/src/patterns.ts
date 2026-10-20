import type {ClassifierKind} from './kinds.js'

// Order = declaration order = match precedence. When patterns overlap (e.g.
// retry-exhaustion containing ECONNRESET), the earlier entry wins.
//
// Regex sources are pinned to actual yt-dlp source strings — see
// scripts/scan-yt-dlp-source.mjs for the upstream-scanner that keeps these
// in sync with new yt-dlp releases.
export const ERROR_PATTERNS: Record<ClassifierKind, RegExp> = {
	// Raised before any extraction, so nothing else in the run explains it —
	// and first, because the rejected URL is echoed into the line and may hold
	// words other patterns key on. Three real sources:
	//  - utils/_utils.py UnsupportedError: "Unsupported URL: {url}"
	//  - YoutubeDL.py: "No suitable extractor ({ie_key}) found for URL {url}"
	//  - extractor/generic.py: "{url!r} is not a valid URL"
	// The colon keeps the networking layer's "Unsupported url scheme" out.
	unsupportedUrl: /\bunsupported url:|no suitable extractor\b[^\n]*\bfound for url\b|is not a valid url\b/i,

	// YouTube player API response. Tolerates ASCII apostrophe and U+2019.
	// Source: yt-dlp passes through YouTube's reason string verbatim. Captcha
	// challenge appended by extractor/youtube/_video.py:4053 also classifies
	// as botBlock since it's the same anti-automation gate.
	botBlock: /sign in to confirm you[’']re not a bot|captcha challenge before playback/i,

	// youtube/_video.py: 'All player responses are invalid. Your IP is likely
	// being blocked by Youtube'
	ipBlock: /IP is likely being blocked/i,

	// Three real sources:
	//  - HTTP 429 from any extractor
	//  - "This content isn't available, try again later" (YouTube)
	//  - "has been rate-limited by YouTube for up to an hour" (the expanded
	//    reason youtube/_video.py appends to the YouTube reason)
	rateLimit: /HTTP Error 429|too many requests|this content isn't available.*try again later|has been rate.?limited/i,

	// youtube/_video.py reason strings: 'confirm your age', 'age-restricted',
	// 'inappropriate'. Also matches yt-dlp's wrapper line 'This video is
	// age-restricted'.
	ageRestricted: /this video is age.?restricted|sign in to confirm your age|age.?restricted.*requires authentication/i,

	// Generic yt-dlp + extractor unavailability lines. Includes the youtube
	// 'This video is unavailable' reason and 'Private video' from the
	// playabilityStatus skip reasons.
	unavailable: /private video|this video is unavailable|video has been removed|requested format is not available/i,

	// Default GeoRestrictedError msg (extractor/common.py:1259): "This video
	// is not available from your location due to geo restriction". Plus the
	// YouTube subreason: "The uploader has not made this video available in
	// your country" — note: the negation is in "has not made", so we match on
	// the positive "available in your country" tail. Plus 'geo-restricted'
	// and 'geo restriction'.
	geoBlocked: /available in your country|geo.?restrict(?:ed|ion)|not available from your location/i,

	// YoutubeDL.py:2898 wraps with "This video is DRM protected and ..." when
	// _has_drm is set. Plus generic 'Unsupported DRM' from f4m/m3u8 paths.
	drmProtected: /this video is DRM protected|unsupported DRM/i,

	// raise_login_required default msg (extractor/common.py:1249): "This video
	// is only available for registered users". Plus generic "Login was
	// unsuccessful" and explicit "login required" phrasing from extractors.
	loginRequired: /only available for registered users|login was unsuccessful|login (?:is )?required/i,

	// YoutubeDL._write_subtitles: "[info] There are no subtitles for the
	// requested languages", printed to stdout (to_screen, not a warning) when
	// no requested language matched; the run still exits 0.
	noSubtitles: /there are no subtitles for the requested languages/i,

	// ENOSPC variants across platforms:
	//  - Linux: "No space left on device"
	//  - Windows: "There is not enough space on the disk"
	//  - macOS / NFS: "Disk quota exceeded"
	//  - Some installers: "not enough storage"
	outOfDiskSpace: /no space left on device|there is not enough space on the disk|disk quota exceeded|not enough storage/i,

	// The output or temp location refuses writes. Anchored on the call sites
	// that touch the destination so an unrelated permission error (an
	// unreadable cookies file, say) stays unknown:
	//  - downloader/http.py: "unable to open for writing: {err}" and
	//    "unable to write data: {err}"
	//  - YoutubeDL._ensure_dir_exists and MoveFilesAfterDownloadPP:
	//    "Unable to create directory: {e}"
	// each carrying EACCES ([Errno 13] / [WinError 5]), EROFS ([Errno 30]),
	// or EPERM ([Errno 1], e.g. a macOS privacy-protected folder). Plus
	// YoutubeDL.py's errno-less "Cannot write ... metadata to JSON file /
	// description file / subtitles file". Sits after outOfDiskSpace so ENOSPC
	// on the same call sites keeps its own kind, and before postprocessFailure
	// so a "Postprocessing: Unable to create directory" line names the cause.
	outputNotWritable: /unable to (?:open for writing|write data|create directory):[^\n]*(?:\[Errno (?:1|13|30)\]|\[WinError 5\]|permission denied|read-only file system|access is denied|operation not permitted)|cannot write [^\n]*(?:metadata to JSON file|description file|subtitles file)/i,

	// YouTube ranged-HTTP truncation + retry exhaustion. Three real sources:
	//  - utils/_utils.py report_retry: "{e}. Giving up after N retries"
	//  - ContentTooShortError from http downloader:
	//    "content too short (expected N bytes and served M)"
	//  - Older yt-dlp variant: "N bytes read, M more expected"
	//  - http downloader: "Did not get any data blocks" when stream is empty
	chunkTransferFailure: /Giving up after \d+ retries|content too short \(expected \d+ bytes and served \d+\)|\d+ bytes read, \d+ more expected|Did not get any data blocks/i,

	// yt-dlp postprocessor/ffmpeg.py: missing both probe and converter tools.
	// Keep this before postprocessFailure so hosts can offer installation UI
	// instead of a generic retry/remux path.
	missingDependency: /ffprobe and ffmpeg not found/i,

	// Anchored on `ERROR:` to avoid matching titles or filenames containing
	// "Conversion failed". ENOSPC during merge masquerades as ffmpeg failure;
	// host apps re-probe disk space after seeing this kind.
	postprocessFailure: /ERROR:\s*(?:Postprocessing:|Conversion failed|Error (?:writing|muxing|merging)|ffmpeg (?:exited|failed))/i,

	// ProbeService / dump-json parse failures.
	parse: /failed to parse (?:json|probe output)|unexpected token|schema validation|invalid json|json (?:parse|decode)/i,

	// Transport-level failures. Not perfectly disjoint from
	// `chunkTransferFailure` — that one fires on retry-exhaustion specifically;
	// this one on bare transport errors. Order matters: chunkTransferFailure
	// is checked first so "Giving up after N retries" lines classify correctly
	// even when they also contain ECONNRESET. Includes Python's textual error
	// form ("Connection reset by peer") emitted via OSError.strerror.
	network: /unable to download video data|\b(?:timed? out|timeout|econn(?:reset|refused|aborted)|enotfound|getaddrinfo|network is unreachable|connection reset by peer)\b/i
}

// Signals that are not failure kinds of their own: they qualify a run (which
// rate limit, whose cookies, which formats) rather than name why it failed.
// Pinned to yt-dlp's wording like ERROR_PATTERNS; consumed by signals.ts.
export const SIGNAL_PATTERNS = {
	// youtube/_video.py expands YouTube's "This content isn't available, try
	// again later" into "The current session" / "Your account" "has been
	// rate-limited by YouTube for up to an hour".
	sessionRateLimit: /has been rate.?limited by youtube|this content isn['’]t available,? try again later/i,
	// common.py's request failures carry "HTTP Error 429: Too Many Requests",
	// as a warning when the request was optional (the webpage) or an error.
	http429: /HTTP Error 429\b|\b429: Too Many Requests/i,
	// A subtitle 429 is YouTube's translation endpoint throttling one track; the
	// original-language track downloads from the same address moments later. It
	// says nothing about the connection.
	subtitleDownload: /unable to download (?:video |automatic )?(?:subtitles|captions)/i,
	// youtube/_base.py, after any request once the passed auth cookies stop
	// carrying a session (usually rotated in the browser).
	accountCookiesRejected: /provided YouTube account cookies are no longer valid/i,
	// youtube/_video.py, when a player client lists https formats but withholds
	// their URLs (SABR-only streaming). Captures the client name.
	sabrSkippedFormats: /Some (\S+) client https formats have been skipped as they are missing a URL/
} as const satisfies Record<string, RegExp>

export const PATTERN_ENTRIES = Object.entries(ERROR_PATTERNS) as [ClassifierKind, RegExp][]
