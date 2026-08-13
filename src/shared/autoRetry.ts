// Pure policy for automatic retry after a failed download. Lives in shared so
// the rule can be tested without spawning a queue, and so any renderer-side
// projection reads the same definition of "will this retry?".

import type {YtDlpErrorKind} from './types.js'

// Failure kinds worth retrying on their own. Deliberately narrower than
// `errorKindMetadata().recoverable`:
//
//   - botBlock / ipBlock are excluded. Retrying a bot wall without new
//     cookies is what escalates a soft block into a hard one, so the user has
//     to act instead.
//   - outOfDiskSpace is excluded. Nothing about waiting frees the disk, so a
//     retry just burns an attempt and fails identically.
//   - Permanent kinds (unavailable, drmProtected, parse, geoBlocked,
//     ageRestricted, loginRequired, unsupportedUrl) are excluded because the
//     next attempt cannot succeed either.
const AUTO_RETRY_ERROR_KINDS: ReadonlySet<YtDlpErrorKind> = new Set(['network', 'chunkTransferFailure', 'postprocessFailure', 'rateLimit'])

// Backoff before each attempt, indexed by retries already consumed. Growing
// delays give a rate-limit window time to roll over; the last entry repeats
// for any attempt beyond the table.
export const AUTO_RETRY_BACKOFF_MS = [30_000, 60_000, 120_000, 300_000] as const

export function autoRetryDelayMs(retriesConsumed: number): number {
	const index = Math.min(Math.max(0, retriesConsumed), AUTO_RETRY_BACKOFF_MS.length - 1)
	return AUTO_RETRY_BACKOFF_MS[index]
}

export interface AutoRetryDecision {
	retry: boolean
	attempt: number
	delayMs: number
}

// `retriesConsumed` is the item's current retryCount; `maxAttempts` is the
// user's setting (0 = off).
export function decideAutoRetry(kind: YtDlpErrorKind, retriesConsumed: number, maxAttempts: number): AutoRetryDecision {
	const attempt = retriesConsumed + 1
	if (maxAttempts <= 0) return {retry: false, attempt, delayMs: 0}
	if (!AUTO_RETRY_ERROR_KINDS.has(kind)) return {retry: false, attempt, delayMs: 0}
	if (retriesConsumed >= maxAttempts) return {retry: false, attempt, delayMs: 0}
	return {retry: true, attempt, delayMs: autoRetryDelayMs(retriesConsumed)}
}
