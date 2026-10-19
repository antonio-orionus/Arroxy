import {describe, expect, it} from 'vite-plus/test'
import {classifyYtDlpStderr, type YtDlpErrorKind} from 'ytdlp-errors'
import {escalationReason, reachesPlaylistItems, type EscalationInput} from '@main/services/exploreEscalation.js'
import type {EscalationReason} from '@shared/schemas.js'

const YOUTUBE_WATCH = 'https://www.youtube.com/watch?v=abc'
const WATCH_LATER = 'https://www.youtube.com/playlist?list=WL'
const LIKED = 'https://www.youtube.com/playlist?list=LL'
const PUBLIC_PLAYLIST = 'https://www.youtube.com/playlist?list=PLx'

type ProbeInput = Extract<EscalationInput, {stage: 'probe'}>
type DownloadInput = Extract<EscalationInput, {stage: 'download'}>

function probeFailure(kind: YtDlpErrorKind, raw: string, url: string = YOUTUBE_WATCH): ProbeInput {
	return {stage: 'probe', url, error: {kind: 'ytdlp', error: {kind, raw}}}
}

function downloadFailure(errorKind: YtDlpErrorKind, rawError: string | null, ladderExhausted = true): DownloadInput {
	return {stage: 'download', errorKind, rawError, ladderExhausted}
}

// Full yt-dlp stderr lines for account-only videos. Kinds come from the production classifier,
// so these rows follow what it actually emits (it reports `unknown` for some of them).
const ACCOUNT_ONLY_VIDEO_LINES = [
	'ERROR: [youtube] abc: Join this channel to get access to members-only content like this video, and other exclusive perks.',
	"ERROR: [youtube] abc: This video is available to this channel's members on level: Fan (or any higher level). Join this channel to get access to members-only content and other exclusive perks.",
	'ERROR: [youtube] abc: This video is available to this channel’s members on level: Fan (or any higher level). Join this channel to get access to members-only content and other exclusive perks.',
	"ERROR: [youtube] abc: Private video. Sign in if you've been granted access to this video",
	'ERROR: [youtube] abc: Private video. Sign in if you’ve been granted access to this video'
]

describe('escalationReason', () => {
	it.each(ACCOUNT_ONLY_VIDEO_LINES)('escalates an account-only video line at probe and download stage: %s', line => {
		const {kind} = classifyYtDlpStderr(line)
		expect(['unknown', 'unavailable']).toContain(kind)
		expect(escalationReason(probeFailure(kind, line))).not.toBeNull()
		expect(escalationReason(downloadFailure(kind, line))).not.toBeNull()
	})

	it.each<[YtDlpErrorKind, string]>([
		['loginRequired', 'Sign in to confirm your age'],
		['ageRestricted', 'This video may be inappropriate for some users'],
		['botBlock', "Sign in to confirm you're not a bot"]
	])('escalates %s: %s', (kind, raw) => {
		expect(escalationReason(probeFailure(kind, raw))).not.toBeNull()
	})

	it.each<[YtDlpErrorKind, string]>([
		['ipBlock', 'HTTP Error 403'],
		['rateLimit', 'HTTP Error 429'],
		['geoBlocked', 'not available in your country'],
		['drmProtected', 'DRM protected'],
		['unavailable', 'This video has been removed by the uploader'],
		['network', 'Connection reset']
	])('does not escalate %s: %s', (kind, raw) => {
		expect(escalationReason(probeFailure(kind, raw))).toBeNull()
	})

	it('escalates an empty Watch Later playlist probe', () => {
		expect(escalationReason({stage: 'probe', url: WATCH_LATER, error: {kind: 'other', code: 'playlist_empty', message: 'Playlist returned no entries'}})).not.toBeNull()
	})

	it('escalates a Liked playlist probe whose message says the playlist does not exist', () => {
		expect(escalationReason(probeFailure('unknown', 'The playlist does not exist.', LIKED))).not.toBeNull()
	})

	it('escalates a probe whose message says the playlist does not exist, whatever the playlist id', () => {
		expect(escalationReason(probeFailure('unknown', 'The playlist does not exist.', PUBLIC_PLAYLIST))).not.toBeNull()
	})

	it('does not escalate an empty public playlist that is not account-only', () => {
		expect(escalationReason({stage: 'probe', url: PUBLIC_PLAYLIST, error: {kind: 'other', code: 'playlist_empty', message: 'Playlist returned no entries'}})).toBeNull()
	})

	it('escalates a download-time bot wall only after the PoT ladder is exhausted', () => {
		expect(escalationReason(downloadFailure('botBlock', "Sign in to confirm you're not a bot", false))).toBeNull()
		expect(escalationReason(downloadFailure('botBlock', "Sign in to confirm you're not a bot", true))).not.toBeNull()
	})

	it('does not escalate an unknown download failure even when it names a playlist', () => {
		expect(escalationReason(downloadFailure('unknown', 'The playlist does not exist.', true))).toBeNull()
	})

	it('never escalates a cancellation', () => {
		expect(escalationReason({stage: 'probe', url: YOUTUBE_WATCH, error: {kind: 'other', code: 'cancelled', message: 'Probe cancelled'}})).toBeNull()
	})
})

// Any site: yt-dlp's extractors share one login helper whose hint says what
// would let the run through, plus their own wording for cookies, private and
// subscriber-only content. Lines are real yt-dlp messages, classified by the
// production classifier, so they follow what it actually reports.
const COOKIES_HINT = 'Use --cookies-from-browser or --cookies for the authentication. See  https://github.com/yt-dlp/yt-dlp/wiki/FAQ#how-do-i-pass-cookies-to-yt-dlp  for how to manually pass cookies'
const SESSION_COOKIES_HINT = 'Use --cookies for the authentication (--cookies-from-browser might not work). See  https://github.com/yt-dlp/yt-dlp/wiki/FAQ#how-do-i-pass-cookies-to-yt-dlp  for how to manually pass cookies'
const PASSWORD_HINT = 'Use --username and --password, --netrc-cmd, or --netrc (nebula) to provide account credentials'
const OTHER_SITE = 'https://www.instagram.com/stories/highlights/18141219742583856/'

describe('escalationReason on any site', () => {
	it.each([
		`ERROR: [instagram:story] 18141219742583856: You need to log in to access this content. ${COOKIES_HINT}`,
		`ERROR: [BiliBiliWatchlater] watchlater: You need to login to access your watchlater list. ${COOKIES_HINT}`,
		`ERROR: [boosty] 123: This post requires a subscription. ${COOKIES_HINT}`,
		`ERROR: [site] 123: Login is required. ${SESSION_COOKIES_HINT}`,
		'ERROR: [TikTok] 123: Fresh cookies (not necessarily logged in) are needed',
		'ERROR: [ixigua] 123: Cookies (not necessarily logged in) are needed',
		'ERROR: [udemy] 123: Udemy asks you to solve a CAPTCHA. Login with browser, solve CAPTCHA, then export cookies and pass cookie file to yt-dlp with --cookies.',
		'ERROR: [fox] 123: This video is only available via cable service provider subscription. You may want to use --cookies.',
		'ERROR: [wrestleuniverse] 123: Expired token. Refresh your cookies in browser and try again',
		'ERROR: [afreecatv] 123: This VOD is private',
		'ERROR: [youku] 123: Youku said: Sorry, this video is private',
		'ERROR: [raywenderlich] 123: This content is only available for subscribers',
		'ERROR: [cda] 123: Video requires CDA Premium - subscription needed',
		'ERROR: [zingmp3] 123: The song is only for VIP accounts.'
	])('escalates at probe and download stage: %s', line => {
		const {kind} = classifyYtDlpStderr(line)
		expect(escalationReason(probeFailure(kind, line, OTHER_SITE))).not.toBeNull()
		expect(escalationReason(downloadFailure(kind, line, false))).not.toBeNull()
	})

	// A login wall reads to the extractor as a page it cannot parse (Facebook reels
	// signed out); signed in, the same probe succeeds. YouTube's account is never
	// spent on a parse failure, and a download run has its probe's answer already.
	it.each([
		'ERROR: [facebook] 1583709809895177: Cannot parse data; please report this issue on  https://github.com/yt-dlp/yt-dlp/issues?q= , filling out the appropriate issue template. Confirm you are on the latest version using  yt-dlp -U',
		'ERROR: [site] 123: Unable to extract video data; please report this issue on  https://github.com/yt-dlp/yt-dlp/issues?q= , filling out the appropriate issue template.'
	])('escalates a probe on another site that the extractor could not parse: %s', line => {
		const {kind} = classifyYtDlpStderr(line)
		expect(escalationReason(probeFailure(kind, line, 'https://www.facebook.com/reel/1583709809895177/'))).toBe('loginRequired')
		expect(escalationReason(probeFailure(kind, line, YOUTUBE_WATCH))).toBeNull()
		expect(escalationReason(downloadFailure(kind, line))).toBeNull()
	})

	// The site takes only yt-dlp's own username and password: no cookie lets the run through.
	it('never escalates a login that takes only a username and password', () => {
		const line = `ERROR: [nebula] 123: This video is only available for registered users. ${PASSWORD_HINT}`
		const {kind} = classifyYtDlpStderr(line)
		expect(escalationReason(probeFailure(kind, line, OTHER_SITE))).toBeNull()
		expect(escalationReason(downloadFailure(kind, line))).toBeNull()
	})

	it.each(['ERROR: [vimeo] 123: Unable to log in: bad username or password', 'ERROR: [site] 123: This video is not available from your location due to geo restriction', 'ERROR: [site] 123: Unsupported URL: https://example.com/'])('does not escalate: %s', line => {
		const {kind} = classifyYtDlpStderr(line)
		expect(escalationReason(probeFailure(kind, line, OTHER_SITE))).toBeNull()
	})

	// A YouTube bot wall carries the same cookies hint; it still waits for the PoT ladder.
	it('keeps a YouTube bot wall behind the PoT ladder, cookies hint and all', () => {
		const line = `ERROR: [youtube] abc: Sign in to confirm you’re not a bot. ${COOKIES_HINT}`
		const {kind} = classifyYtDlpStderr(line)
		expect(kind).toBe('botBlock')
		expect(escalationReason(downloadFailure(kind, line, false))).toBeNull()
		expect(escalationReason(downloadFailure(kind, line, true))).toBe('botBlock')
	})
})

describe('escalation reasons and playlist items (R20)', () => {
	it.each<[EscalationInput, EscalationReason]>([
		[probeFailure('loginRequired', 'Sign in to confirm your age'), 'loginRequired'],
		[probeFailure('ageRestricted', 'This video may be inappropriate for some users'), 'ageRestricted'],
		[probeFailure('unknown', "ERROR: [youtube] abc: Private video. Sign in if you've been granted access to this video"), 'accountOnlyVideo'],
		[{stage: 'probe', url: WATCH_LATER, error: {kind: 'other', code: 'playlist_empty', message: 'Playlist returned no entries'}}, 'accountOnlyPlaylist'],
		[probeFailure('unknown', 'The playlist does not exist.', LIKED), 'playlistMissing'],
		[probeFailure('botBlock', "Sign in to confirm you're not a bot"), 'botBlock'],
		[downloadFailure('botBlock', "Sign in to confirm you're not a bot", true), 'botBlock']
	])('names why %j escalates: %s', (input, reason) => {
		expect(escalationReason(input)).toBe(reason)
	})

	it.each<EscalationReason>(['loginRequired', 'ageRestricted', 'accountOnlyVideo', 'accountOnlyPlaylist', 'playlistMissing'])('an account-only reason (%s) signs in the playlist items too', reason => {
		expect(reachesPlaylistItems(reason)).toBe(true)
	})

	it('a bot wall signs in only the enumeration: its items start anonymous', () => {
		expect(reachesPlaylistItems('botBlock')).toBe(false)
	})
})
