// Which sites' Explore sign-ins downloads showed are in the way (ADR 0022).
// Nothing tells Arroxy that a session stopped working, so downloads find out:
//   - two items on a site that worked only anonymously after failing signed
//     in, within ten minutes, with no signed-in success between them;
//   - three unclassified signed-in failures on a site within ten minutes, with
//     no signed-in success between them (a dead X session arrives that way);
//   - at once: an account wall (a checkpoint, a challenge), or the engine
//     saying the account cookies were rejected.
// A suspect site starts anonymous and never escalates. The mark is kept across
// restarts as a fingerprint (hash) of the site's sign-in cookie, never its value; signing in
// again changes the cookie and clears it, and so does "Use my sign-in again".

import log from 'electron-log/main.js'

const logger = log.scope('sign-ins')

const WINDOW_MS = 10 * 60_000

export type SignInEvidence = 'anonymousWorked' | 'signedInUnknown' | 'signedInSucceeded' | 'accountWall' | 'cookiesRejected'

// The run the evidence came from: its item (the link), and when its launch
// started, so a result from before the user signed in again is dropped.
export interface SignInEvidenceSource {
	item: string
	startedAt: number
}

export interface SuspectSignInMark {
	site: string
	cookieFingerprint: string
	since: string
	evidence: SignInEvidence
}

export interface SuspectSignInStorePort {
	read(): SuspectSignInMark[]
	write(marks: SuspectSignInMark[]): void
}

export interface SuspectSignInsOptions {
	store: SuspectSignInStorePort
	// A fingerprint of the site's current sign-in cookie; null when the session holds none.
	cookieFingerprint: (site: string) => string | null
	now?: () => number
}

// Evidence that counts toward a mark, and how many make one.
const THRESHOLDS: Partial<Record<SignInEvidence, number>> = {anonymousWorked: 2, signedInUnknown: 3, accountWall: 1, cookiesRejected: 1}

export class SuspectSignIns {
	private readonly store: SuspectSignInStorePort
	private readonly cookieFingerprint: (site: string) => string | null
	private readonly now: () => number
	private marks: SuspectSignInMark[]
	private readonly seen = new Map<string, Array<{kind: SignInEvidence; at: number; item: string | undefined}>>()
	// When each site's sign-in cookie last changed.
	private readonly changedAt = new Map<string, number>()
	private readonly listeners = new Set<(sites: string[]) => void>()

	constructor(options: SuspectSignInsOptions) {
		this.store = options.store
		this.cookieFingerprint = options.cookieFingerprint
		this.now = options.now ?? Date.now
		this.marks = options.store.read()
	}

	record(site: string, evidence: SignInEvidence, source?: SignInEvidenceSource): void {
		if (source && source.startedAt < (this.changedAt.get(site) ?? Number.NEGATIVE_INFINITY)) {
			logger.info('Sign-in evidence dropped: its launch used a sign-in the user has since replaced', {site, evidence})
			return
		}
		if (evidence === 'signedInSucceeded') {
			this.seen.delete(site)
			return
		}
		const threshold = THRESHOLDS[evidence]
		if (threshold === undefined || this.isSuspect(site)) return
		const now = this.now()
		const recent = (this.seen.get(site) ?? []).filter(entry => entry.at > now - WINDOW_MS)
		recent.push({kind: evidence, at: now, item: source === undefined ? undefined : itemKey(source.item)})
		this.seen.set(site, recent)
		const matching = recent.filter(entry => entry.kind === evidence)
		// Two items worked only anonymously: one item's probe and download count once.
		const count = evidence === 'anonymousWorked' ? new Set(matching.map((entry, index) => entry.item ?? index)).size : matching.length
		logger.info('Sign-in evidence', {site, evidence, count, threshold})
		if (count >= threshold) this.mark(site, evidence)
	}

	isSuspect(site: string): boolean {
		const mark = this.marks.find(entry => entry.site === site)
		return mark !== undefined && mark.cookieFingerprint === this.cookieFingerprint(site)
	}

	// The sites marked now, in the order they were marked.
	list(): string[] {
		return this.marks.filter(mark => this.isSuspect(mark.site)).map(mark => mark.site)
	}

	// The user says the sign-in works again (they dealt with a checkpoint).
	useAgain(site: string): void {
		this.seen.delete(site)
		if (this.unmark(site)) logger.info('Sign-in marked as working again by the user', {site})
	}

	// The site's sign-in cookie changed: a fresh sign-in clears the mark, and
	// what the old cookie showed no longer counts.
	cookieChanged(site: string): void {
		this.seen.delete(site)
		this.changedAt.set(site, this.now())
		const mark = this.marks.find(entry => entry.site === site)
		if (mark === undefined || mark.cookieFingerprint === this.cookieFingerprint(site)) return
		if (this.unmark(site)) logger.info('Sign-in mark cleared: the site’s sign-in cookie changed', {site})
	}

	onChange(listener: (sites: string[]) => void): () => void {
		this.listeners.add(listener)
		return () => this.listeners.delete(listener)
	}

	private mark(site: string, evidence: SignInEvidence): void {
		const cookieFingerprint = this.cookieFingerprint(site)
		if (cookieFingerprint === null) return
		this.marks = [...this.marks.filter(entry => entry.site !== site), {site, cookieFingerprint, since: new Date(this.now()).toISOString(), evidence}]
		this.seen.delete(site)
		this.store.write(this.marks)
		logger.warn('Sign-in marked as not working for downloads', {site, evidence})
		this.notify()
	}

	private unmark(site: string): boolean {
		const before = this.marks.length
		this.marks = this.marks.filter(entry => entry.site !== site)
		if (this.marks.length === before) return false
		this.store.write(this.marks)
		this.notify()
		return true
	}

	private notify(): void {
		const sites = this.list()
		for (const listener of this.listeners) listener(sites)
	}
}

// One item however its link was written: a probe records the pasted link, its
// download the canonical one (a share link loses its `?igsh=…`, twitter.com
// becomes x.com). Evidence is kept per site, so the path names the item; a
// video id in `v` is kept, since it is the item on a watch page.
function itemKey(item: string): string {
	try {
		const url = new URL(item)
		const video = url.searchParams.get('v')
		return `${url.pathname.replace(/\/+$/, '')}${video === null ? '' : `?v=${video}`}`
	} catch {
		return item
	}
}
