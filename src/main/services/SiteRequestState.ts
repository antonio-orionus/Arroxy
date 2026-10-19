import log from 'electron-log/main.js'
import type {RateLimitEvidence, SiteCooldown} from '@shared/schemas.js'

// The app-owned rate-limit cooldown, one per site and network route. yt-dlp
// never retries a 429 and has no Retry-After support, so without this every
// probe, queued job and automatic retry would go on asking a site that has just
// refused the connection. Probes, job starts and automatic retries all read it;
// the user's "Try now" lets one request through.
//
// In memory only: a restart clears it, which is acceptable because cooldowns
// are short.
//
// A rate limit never changes who a request runs as. YouTube rate-limits
// signed-in accounts too, so escalating to the Explore session cannot help.

const logger = log.scope('site-requests')

export const RATE_LIMIT_BASE_MS = 60_000
export const RATE_LIMIT_CAP_MS = 15 * 60_000
// YouTube's session limit lasts "up to an hour".
export const SESSION_RATE_LIMIT_MS = 30 * 60_000
// A limit seen within this long after the previous one ended is a repeat.
const RATE_LIMIT_REPEAT_WINDOW_MS = 15 * 60_000
// How long a "Try now" pass waits for the request it was granted for.
export const TRY_NOW_PASS_MS = 30_000

// The first cooldown is the 60 s base. Each repeat doubles the ceiling, up to
// 15 minutes, and the wait is drawn uniformly between the base and that
// ceiling (full jitter above a floor), so retries never line up with the
// site's own window.
export function rateLimitCooldownMs(evidence: RateLimitEvidence, repeats: number, random: () => number): number {
	if (evidence === 'sessionRateLimited') return SESSION_RATE_LIMIT_MS
	if (repeats <= 0) return RATE_LIMIT_BASE_MS
	const ceiling = Math.min(RATE_LIMIT_CAP_MS, RATE_LIMIT_BASE_MS * 2 ** Math.min(repeats, 30))
	return Math.round(RATE_LIMIT_BASE_MS + random() * (ceiling - RATE_LIMIT_BASE_MS))
}

export type SiteAdmission = {kind: 'launch'; bypassed: boolean} | {kind: 'wait'; until: number}

interface SiteRecord {
	until: number
	evidence: RateLimitEvidence
	repeats: number
	lastSeenAt: number
	passUntil: number
}

export interface SiteRequestStateOptions {
	now?: () => number
	random?: () => number
	// The current network route: `direct`, or the proxy's scheme, host and port.
	// Read on every call, so a changed proxy setting applies at once.
	route?: () => string
}

export class SiteRequestState {
	private readonly records = new Map<string, SiteRecord>()
	private readonly listeners = new Set<(cooldowns: SiteCooldown[]) => void>()
	private readonly now: () => number
	private readonly random: () => number
	private readonly route: () => string

	constructor(options: SiteRequestStateOptions = {}) {
		this.now = options.now ?? Date.now
		this.random = options.random ?? Math.random
		this.route = options.route ?? (() => 'direct')
	}

	// Called after a run whose output shows the site rate-limiting this connection.
	recordRateLimit(site: string, evidence: RateLimitEvidence): number {
		const now = this.now()
		const key = this.key(site)
		const previous = this.records.get(key)
		const cooling = previous !== undefined && now < previous.until
		// Limits inside a running cooldown are one burst (requests already in
		// flight when it started); a limit soon after it ended is a repeat.
		const repeats = previous === undefined ? 0 : cooling ? previous.repeats : now - previous.until < RATE_LIMIT_REPEAT_WINDOW_MS ? previous.repeats + 1 : 0
		const until = Math.max(cooling ? previous.until : 0, now + rateLimitCooldownMs(evidence, repeats, this.random))
		const keepsEvidence = cooling && previous.until >= until
		this.records.set(key, {until, evidence: keepsEvidence ? previous.evidence : evidence, repeats, lastSeenAt: now, passUntil: 0})
		logger.info('Rate limit seen; new requests wait', {site, evidence, repeats, waitMs: until - now})
		this.notify()
		return until
	}

	// When new requests to the site may go out again; null when they may now.
	rateLimitedUntil(site: string): number | null {
		const record = this.records.get(this.key(site))
		return record && this.now() < record.until ? record.until : null
	}

	// Whether a request may launch now. Spends a "Try now" pass when it is the
	// only thing letting the request through.
	admit(site: string): SiteAdmission {
		const record = this.records.get(this.key(site))
		const now = this.now()
		if (!record || now >= record.until) return {kind: 'launch', bypassed: false}
		if (now < record.passUntil) {
			record.passUntil = 0
			logger.info('Try now: one request goes through the cooldown', {site})
			return {kind: 'launch', bypassed: true}
		}
		return {kind: 'wait', until: record.until}
	}

	// The user's "Try now": the next request to the site skips the cooldown once.
	allowOnce(site: string): void {
		const record = this.records.get(this.key(site))
		if (!record || this.now() >= record.until) return
		record.passUntil = this.now() + TRY_NOW_PASS_MS
	}

	// The request "Try now" let through came back without a rate limit, so the
	// site is answering again. The repeat count stays, so a limit soon after
	// still doubles.
	recordCleanBypass(site: string): void {
		const record = this.records.get(this.key(site))
		if (!record || this.now() >= record.until) return
		record.until = this.now()
		logger.info('Cooldown ended early: the site answered a "Try now" request', {site})
		this.notify()
	}

	// The current route's running cooldowns.
	snapshot(): SiteCooldown[] {
		const now = this.now()
		const prefix = `${this.route()}\u0000`
		const cooldowns: SiteCooldown[] = []
		for (const [key, record] of this.records) {
			if (key.startsWith(prefix) && now < record.until) cooldowns.push({site: key.slice(prefix.length), until: new Date(record.until).toISOString(), evidence: record.evidence})
		}
		return cooldowns
	}

	onChange(listener: (cooldowns: SiteCooldown[]) => void): () => void {
		this.listeners.add(listener)
		return () => this.listeners.delete(listener)
	}

	private notify(): void {
		const cooldowns = this.snapshot()
		for (const listener of this.listeners) listener(cooldowns)
	}

	private key(site: string): string {
		return `${this.route()}\u0000${site}`
	}
}
