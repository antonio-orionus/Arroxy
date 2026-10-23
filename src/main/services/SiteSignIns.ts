// Which listed sites the Explore session is signed in to, by each site's own
// sign-in cookie (ADR 0022), held in memory so the queue can decide a row's
// start identity synchronously. Refreshed at start and whenever Explore's
// cookies change. Only a fingerprint (hash) of each sign-in cookie is kept, never its value;
// a changed fingerprint means the user signed in again.

import {createHash} from 'node:crypto'
import log from 'electron-log/main.js'
import {knownSiteSignIn, signInSiteKeys} from '@shared/sites/siteKeys.js'
import {siteSignInCookie, type SignInRowFor} from '@shared/sites/siteSignIn.js'
import type {ExploreCookie} from '@shared/sites/types.js'

const logger = log.scope('sign-ins')

export interface SiteSignInsOptions {
	// The Explore session's cookies a download to the host may use.
	readCookies: (host: string) => Promise<ExploreCookie[]>
	now?: () => number
	// The sites checked and their sign-in rows; the known sites' when absent.
	sites?: readonly string[]
	rowFor?: SignInRowFor
}

export class SiteSignIns {
	private readonly readCookies: (host: string) => Promise<ExploreCookie[]>
	private readonly now: () => number
	private readonly sites: readonly string[]
	private readonly rowFor: SignInRowFor
	private readonly fingerprints = new Map<string, string>()
	private readonly listeners = new Set<(site: string) => void>()

	constructor(options: SiteSignInsOptions) {
		this.readCookies = options.readCookies
		this.now = options.now ?? Date.now
		this.sites = options.sites ?? signInSiteKeys()
		this.rowFor = options.rowFor ?? knownSiteSignIn
	}

	async refresh(): Promise<void> {
		for (const site of this.sites) {
			const row = this.rowFor(site)
			if (!row) continue
			let cookies: ExploreCookie[] = []
			try {
				cookies = await this.readCookies(row.host)
			} catch (err) {
				logger.warn('Could not read the Explore sign-ins', {site, error: err instanceof Error ? err.message : String(err)})
			}
			const cookie = siteSignInCookie(cookies, site, this.now() / 1000, this.rowFor)
			const fingerprint = cookie === null ? null : fingerprintOf(cookie)
			if ((this.fingerprints.get(site) ?? null) === fingerprint) continue
			if (fingerprint === null) this.fingerprints.delete(site)
			else this.fingerprints.set(site, fingerprint)
			logger.info('Explore sign-in changed', {site, signedIn: fingerprint !== null})
			for (const listener of this.listeners) listener(site)
		}
	}

	signedIn(site: string): boolean {
		return this.fingerprints.has(site)
	}

	cookieFingerprint(site: string): string | null {
		return this.fingerprints.get(site) ?? null
	}

	onChange(listener: (site: string) => void): () => void {
		this.listeners.add(listener)
		return () => this.listeners.delete(listener)
	}
}

function fingerprintOf(cookie: ExploreCookie): string {
	return createHash('sha256').update(`${cookie.name}\u0000${cookie.value}`).digest('hex').slice(0, 16)
}
