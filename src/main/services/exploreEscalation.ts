import type {YtDlpErrorKind} from 'ytdlp-errors'
import type {ProbeError} from '@shared/types.js'
import type {EscalationReason} from '@shared/schemas.js'

// Decides whether a failed run should be retried with the Explore session.
// ytdlp-errors kinds alone are not enough: a private or members-only video
// classifies as `unavailable` or `unknown`, many sites' login errors classify
// as `unknown` with only yt-dlp's login hint to go on, and Watch Later / Liked
// surface as a missing or empty playlist, so the raw message and URL are
// consulted for those cases.

export type EscalationInput = {stage: 'probe'; url: string; error: ProbeError} | {stage: 'download'; errorKind: YtDlpErrorKind; rawError: string | null; ladderExhausted: boolean}

// Account-only content: private, members-only or subscriber-only. The same
// message can arrive as `unavailable` or `unknown` depending on the yt-dlp
// line; removed videos carry none of these.
const ACCOUNT_ONLY_VIDEO_KINDS: ReadonlySet<YtDlpErrorKind> = new Set<YtDlpErrorKind>(['unavailable', 'unknown'])
const ACCOUNT_ONLY_VIDEO_MESSAGE = /private video|\b(?:video|vod|post|stream) is private\b|members[- ]only|channel['’]s members|join this channel|only available (?:for|to) (?:subscribers|premium|members)\b|subscription needed|requires? a subscription|only for VIP\b|premium (?:users|members)\b/i
// yt-dlp's own login hints (InfoExtractor._login_hint), appended by every
// extractor that reports a missing login through its shared helper, whatever
// the site's own wording. The cookie hints mean a signed-in session lets the
// run through; the password-only hint means the site takes only yt-dlp's own
// username and password, which Arroxy never passes, so cookies cannot help.
const COOKIE_LOGIN_HINT = /Use --cookies, --cookies-from-browser,|Use --cookies-from-browser or --cookies for the authentication|Use --cookies for the authentication/
const PASSWORD_ONLY_HINT = 'Use --username and --password'
// An extractor's own words for "cookies would let it through" (a CAPTCHA
// solved in a browser, fresh cookies, a session to pass along).
const COOKIES_NEEDED = /--cookies\b|\bcookies\b[^.]*\bare (?:needed|required)\b|\b(?:refresh|export|provide|pass) (?:your )?cookies\b/i
const PLAYLIST_MISSING = /the playlist does not exist/i
// Watch Later and Liked are only reachable with the account's session.
const ACCOUNT_ONLY_PLAYLISTS: ReadonlySet<string> = new Set(['WL', 'LL'])

function isAccountOnlyPlaylist(url: string): boolean {
	try {
		const list = new URL(url).searchParams.get('list')
		return list !== null && ACCOUNT_ONLY_PLAYLISTS.has(list)
	} catch {
		return false
	}
}

// Kind-based rules shared by both stages. The playlist message match is probe-only (see escalationReason).
function classifiedFailureReason(kind: YtDlpErrorKind, raw: string, botBlockEscalates: boolean): EscalationReason | null {
	if (raw.includes(PASSWORD_ONLY_HINT)) return null
	// Kinds that a signed-in account resolves outright.
	if (kind === 'loginRequired' || kind === 'ageRestricted') return kind
	if (kind === 'botBlock') return botBlockEscalates ? 'botBlock' : null
	// Only a line the classifier could not name: a YouTube bot wall carries the
	// cookies hint too, and must still wait for the PoT ladder.
	if (!ACCOUNT_ONLY_VIDEO_KINDS.has(kind)) return null
	if (ACCOUNT_ONLY_VIDEO_MESSAGE.test(raw)) return 'accountOnlyVideo'
	return COOKIE_LOGIN_HINT.test(raw) || COOKIES_NEEDED.test(raw) ? 'loginRequired' : null
}

// Why the run should be retried with the Explore session, or null when an account would not help.
export function escalationReason(input: EscalationInput): EscalationReason | null {
	if (input.stage === 'download') {
		return classifiedFailureReason(input.errorKind, input.rawError ?? '', input.ladderExhausted)
	}
	const {error, url} = input
	if (error.kind === 'other') {
		return error.code === 'playlist_empty' && isAccountOnlyPlaylist(url) ? 'accountOnlyPlaylist' : null
	}
	// A probe bot wall escalates at once: single-video probes have already run YtDlp's 3-attempt ladder (invokeWithRetry), and playlist probes have none (intended).
	return classifiedFailureReason(error.error.kind, error.error.raw, true) ?? (PLAYLIST_MISSING.test(error.error.raw) ? 'playlistMissing' : null)
}

// Whether a playlist that escalated for this reason needs the account for its
// items as well. A bot wall is about the request, not the content: the items
// start anonymous and escalate one by one if they hit a wall of their own.
export function reachesPlaylistItems(reason: EscalationReason): boolean {
	return reason !== 'botBlock'
}
