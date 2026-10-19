import type {RateLimitEvidence} from './kinds.js'
import {SIGNAL_PATTERNS} from './patterns.js'

interface RateLimitSighting {
	evidence: RateLimitEvidence
	line: string
}

// Whether a run shows that the site is rate-limiting this connection, read line
// by line from its stderr. A subtitle 429 does not count.
export function rateLimitEvidence(stderr: string): RateLimitEvidence | null {
	return rateLimitSighting(stderr)?.evidence ?? null
}

// The line that shows the limit, the session limit first: it classifies as
// `rateLimit` wherever a caller passes it on as a message.
export function rateLimitLine(stderr: string): string | null {
	return rateLimitSighting(stderr)?.line ?? null
}

function rateLimitSighting(stderr: string): RateLimitSighting | null {
	let sighting: RateLimitSighting | null = null
	for (const line of stderr.split(/\r?\n/)) {
		if (SIGNAL_PATTERNS.sessionRateLimit.test(line)) return {evidence: 'sessionRateLimited', line: line.trim()}
		if (sighting === null && SIGNAL_PATTERNS.http429.test(line) && !SIGNAL_PATTERNS.subtitleDownload.test(line)) sighting = {evidence: 'rateLimited', line: line.trim()}
	}
	return sighting
}

// True when YouTube stopped honouring the account cookies passed to the run.
export function accountCookiesRejected(stderr: string): boolean {
	return SIGNAL_PATTERNS.accountCookiesRejected.test(stderr)
}

// The player client whose https formats yt-dlp dropped for missing URLs, or
// null. Format selection then falls back to what is left, typically 360p.
export function sabrSkippedClient(line: string): string | null {
	return SIGNAL_PATTERNS.sabrSkippedFormats.exec(line)?.[1] ?? null
}
