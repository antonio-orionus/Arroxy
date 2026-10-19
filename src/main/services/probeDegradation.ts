import type {ProbeDegradationReason, RateLimitEvidence} from '@shared/schemas.js'
import {rateLimitEvidence} from 'ytdlp-errors'

// Signs in a successful probe's stderr that its result may be incomplete.
//
// Patterns sourced from yt-dlp's stderr emit sites — verified against
// yt-dlp/yt_dlp/extractor/youtube/_video.py and yt-dlp/yt_dlp/downloader/common.py
// (search the repo for each exact string). yt-dlp wording occasionally changes
// across releases; if a probe stops being marked degraded, re-grep yt-dlp main
// and update these patterns.

type ProbeSignalCategory = 'extractor' | 'bot'

const PROBE_DEGRADATION_SIGNALS: readonly {label: string; pattern: RegExp; category: ProbeSignalCategory}[] = [
	{label: 'n challenge solving failed', pattern: /n challenge solving failed/i, category: 'extractor'},
	{label: 'Some formats may be missing', pattern: /some formats may be missing/i, category: 'extractor'},
	{label: 'Error solving n challenge request', pattern: /error solving n challenge request/i, category: 'extractor'},
	{label: 'Failed to download m3u8 information', pattern: /failed to download m3u8 information/i, category: 'extractor'},
	{label: 'Unable to download webpage', pattern: /unable to download webpage/i, category: 'extractor'},
	{label: 'IncompleteRead', pattern: /incompleteread/i, category: 'extractor'},
	{label: 'Sign in to confirm', pattern: /sign in to confirm you['’]?re not a bot/i, category: 'bot'}
]

const RATE_LIMIT_LABEL = {rateLimited: 'HTTP 429', sessionRateLimited: 'Session rate limit'} as const satisfies Record<RateLimitEvidence, string>

export type ProbeSignal = {label: string; category: ProbeSignalCategory} | {label: string; category: 'rateLimit'; evidence: RateLimitEvidence}

// Classified per line. A rate-limited line is only a rate limit: the
// "Unable to download webpage" in front of its HTTP 429 is the same event,
// not a second, extractor-side one.
export function detectProbeDegradationSignals(stderr: string): ProbeSignal[] {
	const signals = new Map<string, ProbeSignal>()
	for (const line of stderr.split(/\r?\n/)) {
		const evidence = rateLimitEvidence(line)
		if (evidence) {
			signals.set(RATE_LIMIT_LABEL[evidence], {label: RATE_LIMIT_LABEL[evidence], category: 'rateLimit', evidence})
			continue
		}
		for (const {label, pattern, category} of PROBE_DEGRADATION_SIGNALS) {
			if (pattern.test(line)) signals.set(label, {label, category})
		}
	}
	return [...signals.values()]
}

// A 4xx other than 429 is the site's final answer (a stream list that is Gone
// or Forbidden): a second probe gets the same answer after the same wait.
const PERMANENT_HTTP_ERROR = /HTTP Error 4(?!29)\d\d\b/i

// Whether running the probe again could recover what the warnings lost: not
// when every degradation warning is a permanent HTTP error.
export function degradationIsTransient(stderr: string): boolean {
	const degradationLines = stderr.split(/\r?\n/).filter(line => PROBE_DEGRADATION_SIGNALS.some(({pattern}) => pattern.test(line)))
	return degradationLines.length === 0 || degradationLines.some(line => !PERMANENT_HTTP_ERROR.test(line))
}

export function isRateLimited(signals: readonly ProbeSignal[]): boolean {
	return signals.some(signal => signal.category === 'rateLimit')
}

const REASON_FOR = {bot: 'botWall', extractor: 'extractor', rateLimit: 'rateLimit'} as const satisfies Record<ProbeSignal['category'], ProbeDegradationReason>

export function deriveDegraded(signals: readonly ProbeSignal[]): {reasons: ProbeDegradationReason[]} | undefined {
	if (signals.length === 0) return undefined
	return {reasons: [...new Set(signals.map(signal => REASON_FOR[signal.category]))]}
}
