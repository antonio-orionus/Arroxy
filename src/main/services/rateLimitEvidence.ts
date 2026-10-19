import type {RateLimitEvidence} from '@shared/schemas.js'

// Whether a yt-dlp run shows that the site is rate-limiting this connection,
// read line by line from its stderr. Pinned to yt-dlp's wording:
//   - youtube/_video.py expands YouTube's "This content isn't available, try
//     again later" into "The current session" / "Your account" "has been
//     rate-limited by YouTube for up to an hour".
//   - common.py's request failures carry "HTTP Error 429: Too Many Requests",
//     as a warning when the request was optional (the webpage) or an error.
// yt-dlp itself never retries a 429 and reads no Retry-After, so how long to
// wait is Arroxy's call (SiteRequestState).

const SESSION_RATE_LIMIT = /has been rate.?limited by youtube|this content isn['’]t available,? try again later/i
const HTTP_429 = /HTTP Error 429\b|\b429: Too Many Requests/i
// A subtitle 429 is YouTube's translation endpoint throttling one track; the
// original-language track downloads from the same address moments later. It
// says nothing about the connection, and the subtitle phase is a soft failure.
const SUBTITLE_DOWNLOAD = /unable to download (?:video |automatic )?(?:subtitles|captions)/i

export function rateLimitEvidence(stderr: string): RateLimitEvidence | null {
	return rateLimitSighting(stderr)?.evidence ?? null
}

// The line that shows the limit, the session limit first: it reads as a rate
// limit wherever a caller classifies a message.
export function rateLimitLine(stderr: string): string | null {
	return rateLimitSighting(stderr)?.line ?? null
}

function rateLimitSighting(stderr: string): {evidence: RateLimitEvidence; line: string} | null {
	let sighting: {evidence: RateLimitEvidence; line: string} | null = null
	for (const line of stderr.split(/\r?\n/)) {
		if (SESSION_RATE_LIMIT.test(line)) return {evidence: 'sessionRateLimited', line: line.trim()}
		if (sighting === null && HTTP_429.test(line) && !SUBTITLE_DOWNLOAD.test(line)) sighting = {evidence: 'rateLimited', line: line.trim()}
	}
	return sighting
}
