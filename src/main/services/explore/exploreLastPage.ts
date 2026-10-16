import {hostMatches} from '@shared/sites/hostRules.js'
import type {HostRule} from '@shared/sites/types.js'

// P2-R34: the Explore view reopens on the last page it showed, kept in the
// local settings. Only the site's own pages qualify: a sign-in or consent hop
// carries session material in its query and is no page to come back to.

// Longer than any page worth reopening; a longer URL is not kept.
const MAX_URL_LENGTH = 2048
// Sign-in and consent hosts inside the site's own domains (accounts.youtube.com, consent.youtube.com).
const NOT_A_PAGE_HOST = /^(?:accounts|consent)\./
// Hops on the site itself that are no page to reopen: the outbound-link
// interstitial (its query is the outside URL), the sign-in hops, and sign-out.
const NOT_A_PAGE_PATH = /^\/(?:redirect|signin\w*|logout|signout)(?:\/|$)/i
// How long navigations settle before the page is written: YouTube's SPA
// commits several in-page navigations per click.
const WRITE_DELAY_MS = 1_000

// Which pages may be kept: the site's own hosts (https only), or — under the
// E2E home override — that origin and nothing else, so a test never reopens a
// real site page.
export type LastPageScope = {kind: 'site'; hosts: readonly HostRule[]} | {kind: 'origin'; origin: string}

// The page as it may be stored and reopened, or null when it may not.
export function restorablePage(raw: string, scope: LastPageScope): string | null {
	if (raw.length === 0 || raw.length > MAX_URL_LENGTH) return null
	let url: URL
	try {
		url = new URL(raw)
	} catch {
		return null
	}
	if (url.username !== '' || url.password !== '') return null
	if (scope.kind === 'origin') return url.origin === scope.origin ? url.href : null
	if (url.protocol !== 'https:' || NOT_A_PAGE_HOST.test(url.hostname) || NOT_A_PAGE_PATH.test(url.pathname) || !hostMatches(url.hostname, scope.hosts)) return null
	return url.href
}

// Where a new view opens: the stored page while it still qualifies, else home.
export function startPage(stored: string | undefined, scope: LastPageScope, homeUrl: string): string {
	return (stored === undefined ? null : restorablePage(stored, scope)) ?? homeUrl
}

export interface LastPageRecorderDeps {
	scope: LastPageScope
	read: () => string | undefined
	write: (url: string | undefined) => void
	delayMs?: number
}

// Records the view's committed pages into the settings, one write per burst
// of navigations. The URL is never logged.
export class LastPageRecorder {
	private pending: string | null = null
	private timer: NodeJS.Timeout | undefined

	constructor(private readonly deps: LastPageRecorderDeps) {}

	record(url: string): void {
		const page = restorablePage(url, this.deps.scope)
		if (page === null) return
		this.pending = page
		clearTimeout(this.timer)
		this.timer = setTimeout(() => this.flush(), this.deps.delayMs ?? WRITE_DELAY_MS)
	}

	// Writes a pending page now (the window is closing).
	flush(): void {
		clearTimeout(this.timer)
		this.timer = undefined
		const page = this.pending
		this.pending = null
		if (page !== null && page !== this.deps.read()) this.deps.write(page)
	}

	// Sign-out: the stored page goes, and so does one still pending.
	clear(): void {
		clearTimeout(this.timer)
		this.timer = undefined
		this.pending = null
		if (this.deps.read() !== undefined) this.deps.write(undefined)
	}
}
