import type {YtDlpErrorKind} from './kinds.js'

export interface KindMetadata {
	// Stable identifier suitable for i18n keys, analytics labels, and logs.
	// Format: YTDLP_<UPPER_SNAKE_KIND>. Guaranteed stable across yt-dlp
	// upgrades — adding a regex to a kind does not change the code.
	code: string

	// True when the user (not the developer) can plausibly fix it by
	// changing their input or waiting. botBlock, rateLimit, geoBlocked → true.
	// network, postprocessFailure → also true (transient / retry).
	recoverable: boolean

	// True when there is a concrete user action that addresses it (paste
	// cookies, wait, change region, free disk space). Drives whether the
	// host app surfaces a CTA vs. a "report this" path.
	userActionable: boolean

	// yt-dlp flags the host app might suggest the user enable. Purely
	// advisory — host UX decides whether to expose them.
	suggestedFlags?: readonly string[]

	// Link to the yt-dlp wiki entry that explains the symptom in detail.
	// Host apps can render this as "Learn more".
	docsUrl?: string
}

const WIKI = 'https://github.com/yt-dlp/yt-dlp/wiki'

export const ERROR_KIND_METADATA: Record<YtDlpErrorKind, KindMetadata> = {
	botBlock: {code: 'YTDLP_BOT_BLOCK', recoverable: true, userActionable: true, suggestedFlags: ['--cookies-from-browser', '--cookies'], docsUrl: `${WIKI}/Extractors#exporting-youtube-cookies`},
	ipBlock: {code: 'YTDLP_IP_BLOCK', recoverable: true, userActionable: true, suggestedFlags: ['--proxy', '--source-address'], docsUrl: `${WIKI}/FAQ#http-error-403-forbidden`},
	rateLimit: {code: 'YTDLP_RATE_LIMIT', recoverable: true, userActionable: true, suggestedFlags: ['--sleep-requests', '--sleep-interval', '--max-sleep-interval'], docsUrl: `${WIKI}/Extractors#this-content-isnt-available-try-again-later`},
	ageRestricted: {code: 'YTDLP_AGE_RESTRICTED', recoverable: true, userActionable: true, suggestedFlags: ['--cookies-from-browser', '--cookies'], docsUrl: `${WIKI}/Extractors#age-restricted-videos`},
	unavailable: {code: 'YTDLP_UNAVAILABLE', recoverable: false, userActionable: false},
	geoBlocked: {code: 'YTDLP_GEO_BLOCKED', recoverable: true, userActionable: true, suggestedFlags: ['--geo-bypass', '--geo-bypass-country', '--proxy']},
	drmProtected: {code: 'YTDLP_DRM_PROTECTED', recoverable: false, userActionable: false, docsUrl: `${WIKI}/FAQ#yt-dlp-cant-download-drm-protected-content`},
	loginRequired: {code: 'YTDLP_LOGIN_REQUIRED', recoverable: true, userActionable: true, suggestedFlags: ['--cookies-from-browser', '--cookies', '--username', '--password']},
	outOfDiskSpace: {code: 'YTDLP_OUT_OF_DISK_SPACE', recoverable: true, userActionable: true},
	outputNotWritable: {code: 'YTDLP_OUTPUT_NOT_WRITABLE', recoverable: true, userActionable: true},
	chunkTransferFailure: {code: 'YTDLP_CHUNK_TRANSFER_FAILURE', recoverable: true, userActionable: false, suggestedFlags: ['--retries', '--fragment-retries', '--http-chunk-size']},
	missingDependency: {code: 'YTDLP_MISSING_DEPENDENCY', recoverable: true, userActionable: true, suggestedFlags: ['--ffmpeg-location'], docsUrl: `${WIKI}/FFmpeg`},
	postprocessFailure: {code: 'YTDLP_POSTPROCESS_FAILURE', recoverable: true, userActionable: false, suggestedFlags: ['--ffmpeg-location']},
	parse: {code: 'YTDLP_PARSE_FAILURE', recoverable: false, userActionable: false},
	network: {code: 'YTDLP_NETWORK', recoverable: true, userActionable: false, suggestedFlags: ['--retries', '--socket-timeout']},
	outputPathExpands: {code: 'YTDLP_OUTPUT_PATH_EXPANDS', recoverable: true, userActionable: true},
	unsupportedUrl: {code: 'YTDLP_UNSUPPORTED_URL', recoverable: false, userActionable: true, docsUrl: 'https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md'},
	unknown: {code: 'YTDLP_UNKNOWN', recoverable: false, userActionable: false}
}

export function errorKindMetadata(kind: YtDlpErrorKind): KindMetadata {
	return ERROR_KIND_METADATA[kind]
}
