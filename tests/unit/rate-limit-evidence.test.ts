// @vitest-environment node

import {describe, expect, it} from 'vite-plus/test'
import {rateLimitEvidence} from '@main/services/rateLimitEvidence.js'

// yt-dlp's own wording: common.py's webpage request failing on HTTP 429 (a
// warning when the request is non-fatal, an error otherwise), and the reason
// youtube/_video.py expands "This content isn't available, try again later" into.
const WEBPAGE_429_WARNING = 'WARNING: [youtube] dQw4w9WgXcQ: Unable to download webpage: HTTP Error 429: Too Many Requests (caused by <HTTPError 429: Too Many Requests>)'
const WEBPAGE_429_ERROR = 'ERROR: [youtube] dQw4w9WgXcQ: Unable to download webpage: HTTP Error 429: Too Many Requests (caused by <HTTPError 429: Too Many Requests>)'
const SESSION_RATE_LIMIT = "ERROR: [youtube] dQw4w9WgXcQ: This content isn't available, try again later. The current session has been rate-limited by YouTube for up to an hour. It is recommended to use `-t sleep` to add a delay between video requests to avoid exceeding the rate limit."
const ACCOUNT_RATE_LIMIT = "ERROR: [youtube] dQw4w9WgXcQ: This content isn't available, try again later. Your account has been rate-limited by YouTube for up to an hour."
const SUBTITLE_429 = "WARNING: Unable to download video subtitles for 'en': HTTP Error 429: Too Many Requests"

describe('rateLimitEvidence', () => {
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
