import type {YtDlpErrorKind} from 'ytdlp-errors'

// Kinds that suggest "yt-dlp needs cookies / signed-in account" to the user.
// Single source of truth — replaces the regex set we used to ship in the
// renderer. The classifier (npm `ytdlp-errors`) drives this; if a new
// auth-related kind appears, add it here.
const COOKIES_KINDS: ReadonlySet<YtDlpErrorKind> = new Set(['botBlock', 'ageRestricted', 'unavailable', 'loginRequired'])

export function isCookiesNeededKind(kind: YtDlpErrorKind | undefined): boolean {
	return kind !== undefined && COOKIES_KINDS.has(kind)
}

// Bot-wall is the narrower subset that triggers the "you're hitting a bot
// wall" notice (alongside the cookies CTA). 429 / rate-limit also belongs here
// since the user's IP is being shaped.
const BOT_WALL_KINDS: ReadonlySet<YtDlpErrorKind> = new Set(['botBlock', 'rateLimit'])

export function isBotWallKind(kind: YtDlpErrorKind | undefined): boolean {
	return kind !== undefined && BOT_WALL_KINDS.has(kind)
}
