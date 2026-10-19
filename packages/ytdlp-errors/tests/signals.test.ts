import {describe, expect, it} from 'vite-plus/test'
import {accountCookiesRejected, RATE_LIMIT_EVIDENCE, rateLimitEvidence, rateLimitLine, sabrSkippedClient} from '../src/index.js'

// yt-dlp's own wording: common.py's webpage request failing on HTTP 429 (a
// warning when the request is non-fatal, an error otherwise), and the reason
// youtube/_video.py expands "This content isn't available, try again later" into.
const WEBPAGE_429_WARNING = 'WARNING: [youtube] dQw4w9WgXcQ: Unable to download webpage: HTTP Error 429: Too Many Requests (caused by <HTTPError 429: Too Many Requests>)'
const WEBPAGE_429_ERROR = 'ERROR: [youtube] dQw4w9WgXcQ: Unable to download webpage: HTTP Error 429: Too Many Requests (caused by <HTTPError 429: Too Many Requests>)'
const SESSION_RATE_LIMIT = "ERROR: [youtube] dQw4w9WgXcQ: This content isn't available, try again later. The current session has been rate-limited by YouTube for up to an hour. It is recommended to use `-t sleep` to add a delay between video requests to avoid exceeding the rate limit."
const ACCOUNT_RATE_LIMIT = "ERROR: [youtube] dQw4w9WgXcQ: This content isn't available, try again later. Your account has been rate-limited by YouTube for up to an hour."
const SUBTITLE_429 = "WARNING: Unable to download video subtitles for 'en': HTTP Error 429: Too Many Requests"

describe('rateLimitEvidence', () => {
	it('exposes the closed evidence enum', () => {
		expect(RATE_LIMIT_EVIDENCE).toEqual(['rateLimited', 'sessionRateLimited'])
	})

	it('finds nothing in a clean run', () => {
		expect(rateLimitEvidence('[youtube] dQw4w9WgXcQ: Downloading webpage\n[info] Downloading 1 format(s): 18')).toBeNull()
	})

	it('reads an HTTP 429 as a rate limit, warning or error', () => {
		expect(rateLimitEvidence(WEBPAGE_429_WARNING)).toBe('rateLimited')
		expect(rateLimitEvidence(`[youtube] x: Downloading webpage\n${WEBPAGE_429_ERROR}`)).toBe('rateLimited')
	})

	it('reads the session rate-limit message, for a guest session and for an account', () => {
		expect(rateLimitEvidence(SESSION_RATE_LIMIT)).toBe('sessionRateLimited')
		expect(rateLimitEvidence(ACCOUNT_RATE_LIMIT)).toBe('sessionRateLimited')
		expect(rateLimitEvidence('ERROR: [youtube] x: This content isn’t available, try again later.')).toBe('sessionRateLimited')
	})

	it('lets the session limit win over a plain 429 in the same run', () => {
		expect(rateLimitEvidence(`${WEBPAGE_429_WARNING}\n${SESSION_RATE_LIMIT}`)).toBe('sessionRateLimited')
		expect(rateLimitEvidence(`${SESSION_RATE_LIMIT}\n${WEBPAGE_429_WARNING}`)).toBe('sessionRateLimited')
	})

	// A subtitle 429 is the translation endpoint throttling one track, not the
	// connection being rate-limited: the original-language track downloads fine
	// from the same address moments later.
	it('ignores a subtitle download refused with 429', () => {
		expect(rateLimitEvidence(SUBTITLE_429)).toBeNull()
	})
})

describe('rateLimitLine', () => {
	it('returns the trimmed line that shows the limit, the session limit first', () => {
		expect(rateLimitLine(`  ${WEBPAGE_429_WARNING}  \n${SESSION_RATE_LIMIT}`)).toBe(SESSION_RATE_LIMIT)
		expect(rateLimitLine(`[youtube] x: Downloading webpage\r\n${WEBPAGE_429_ERROR}`)).toBe(WEBPAGE_429_ERROR)
	})

	it('returns null when no line shows a limit', () => {
		expect(rateLimitLine(SUBTITLE_429)).toBeNull()
	})
})

describe('accountCookiesRejected', () => {
	// youtube/_base.py warns after any request once the passed auth cookies stop
	// carrying a session.
	it('matches the YouTube rotated-cookies warning', () => {
		expect(accountCookiesRejected('WARNING: [youtube] The provided YouTube account cookies are no longer valid. They have likely been rotated in the browser as a security measure.')).toBe(true)
	})

	it('ignores unrelated cookie lines', () => {
		expect(accountCookiesRejected('[Cookies] Extracting cookies from firefox')).toBe(false)
	})
})

describe('sabrSkippedClient', () => {
	it('returns the player client whose https formats were dropped', () => {
		expect(sabrSkippedClient('WARNING: [youtube] abc: Some web client https formats have been skipped as they are missing a URL. YouTube is forcing SABR streaming for this client.')).toBe('web')
		expect(sabrSkippedClient('WARNING: [youtube] z1NNgSu8hTI: Some web_embedded client https formats have been skipped as they are missing a URL. YouTube may have enabled the SABR-only streaming experiment for your account. See  https://github.com/yt-dlp/yt-dlp/issues/12482  for more details')).toBe('web_embedded')
		expect(sabrSkippedClient('[debug] [youtube] abc: Some tv_downgraded client https formats have been skipped as they are missing a URL.')).toBe('tv_downgraded')
	})

	it('returns null for other lines', () => {
		expect(sabrSkippedClient('[youtube] abc: Downloading tv client config')).toBeNull()
	})
})
