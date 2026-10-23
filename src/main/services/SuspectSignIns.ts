// Which sites' Explore sign-ins downloads showed are in the way (ADR 0022).
// Nothing tells Arroxy that a session stopped working, so downloads find out:
//   - two items on a site that worked only anonymously after failing signed
//     in, within ten minutes, with no signed-in success between them;
//   - three unclassified signed-in failures on a site within ten minutes, with
//     no signed-in success between them (a dead X session arrives that way);
//   - at once: an account wall (a checkpoint, a challenge), or the engine
//     saying the account cookies were rejected.
// A suspect site starts anonymous and never escalates. The mark is kept across
// restarts as a hash of the site's sign-in cookie, never its value; signing in
// again changes the cookie and clears it, and so does "Use my sign-in again".

import log from 'electron-log/main.js'

const logger = log.scope('sign-ins')

const WINDOW_MS = 10 * 60_000

export type SignInEvidence = 'anonymousWorked' | 'signedInUnknown' | 'signedInSucceeded' | 'accountWall' | 'cookiesRejected'

export interface SuspectSignInMark {
	site: string
	cookieHash: string
	since: string
	evidence: SignInEvidence
}

export interface SuspectSignInStorePort {
	read(): SuspectSignInMark[]
	write(marks: SuspectSignInMark[]): void
}

export interface SuspectSignInsOptions {
	store: SuspectSignInStorePort
	// A hash of the site's current sign-in cookie; null when the session holds none.
	cookieHash: (site: string) => string | null
	now?: () => number
}

// Evidence that counts toward a mark, and how many make one.
const THRESHOLDS: Partial<Record<SignInEvidence, number>> = {anonymousWorked: 2, signedInUnknown: 3, accountWall: 1, cookiesRejected: 1}

export class SuspectSignIns {
	private readonly store: SuspectSignInStorePort
	private readonly cookieHash: (site: string) => string | null
	private readonly now: () => number
	private marks: SuspectSignInMark[]
	private readonly seen = new Map<string, Array<{kind: SignInEvidence; at: number}>>()
	private readonly listeners = new Set<(sites: string[]) => void>()

	constructor(options: SuspectSignInsOptions) {
		this.store = options.store
		this.cookieHash = options.cookieHash
		this.now = options.now ?? Date.now
		this.marks = options.store.read()
	}

	record(site: string, evidence: SignInEvidence): void {
		if (evidence === 'signedInSucceeded') {
			this.seen.delete(site)
			return
		}
		const threshold = THRESHOLDS[evidence]
		if (threshold === undefined || this.isSuspect(site)) return
		const now = this.now()
		const recent = (this.seen.get(site) ?? []).filter(entry => entry.at > now - WINDOW_MS)
		recent.push({kind: evidence, at: now})
		this.seen.set(site, recent)
		const count = recent.filter(entry => entry.kind === evidence).length
		logger.info('Sign-in evidence', {site, evidence, count, threshold})
		if (count >= threshold) this.mark(site, evidence)
	}

	isSuspect(site: string): boolean {
		const mark = this.marks.find(entry => entry.site === site)
		return mark !== undefined && mark.cookieHash === this.cookieHash(site)
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

	// The site's sign-in cookie changed: a fresh sign-in clears the mark.
	cookieChanged(site: string): void {
		const mark = this.marks.find(entry => entry.site === site)
		if (mark === undefined || mark.cookieHash === this.cookieHash(site)) return
		this.seen.delete(site)
		if (this.unmark(site)) logger.info('Sign-in mark cleared: the site’s sign-in cookie changed', {site})
	}

	onChange(listener: (sites: string[]) => void): () => void {
		this.listeners.add(listener)
		return () => this.listeners.delete(listener)
	}

	private mark(site: string, evidence: SignInEvidence): void {
		const cookieHash = this.cookieHash(site)
		if (cookieHash === null) return
		this.marks = [...this.marks.filter(entry => entry.site !== site), {site, cookieHash, since: new Date(this.now()).toISOString(), evidence}]
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
