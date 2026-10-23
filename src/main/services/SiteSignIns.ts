// Which listed sites the Explore session is signed in to, by each site's own
// sign-in cookie (ADR 0022), held in memory so the queue can decide a row's
// start identity synchronously. Refreshed at start and whenever Explore's
// cookies change. Only a hash of each sign-in cookie is kept, never its value;
// a changed hash means the user signed in again.

import {createHash} from 'node:crypto'
import log from 'electron-log/main.js'
import {signInSiteKeys} from '@shared/sites/siteKeys.js'
import {siteSignInCookie} from '@shared/sites/siteSignIn.js'
import type {ExploreCookie} from '@shared/sites/types.js'

const logger = log.scope('sign-ins')

export interface SiteSignInsOptions {
	// Every cookie in the Explore session that a download may use.
	readCookies: () => Promise<ExploreCookie[]>
	now?: () => number
}

export class SiteSignIns {
	private readonly readCookies: () => Promise<ExploreCookie[]>
	private readonly now: () => number
	private readonly hashes = new Map<string, string>()
	private readonly listeners = new Set<(site: string) => void>()

	constructor(options: SiteSignInsOptions) {
		this.readCookies = options.readCookies
		this.now = options.now ?? Date.now
	}

	async refresh(): Promise<void> {
		let cookies: ExploreCookie[] = []
		try {
			cookies = await this.readCookies()
		} catch (err) {
			logger.warn('Could not read the Explore sign-ins', {error: err instanceof Error ? err.message : String(err)})
		}
		for (const site of signInSiteKeys()) {
			const cookie = siteSignInCookie(cookies, site, this.now() / 1000)
			const hash = cookie === null ? null : hashOf(cookie)
			if ((this.hashes.get(site) ?? null) === hash) continue
			if (hash === null) this.hashes.delete(site)
			else this.hashes.set(site, hash)
			logger.info('Explore sign-in changed', {site, signedIn: hash !== null})
			for (const listener of this.listeners) listener(site)
		}
	}

	signedIn(site: string): boolean {
		return this.hashes.has(site)
	}

	cookieHash(site: string): string | null {
		return this.hashes.get(site) ?? null
	}

	onChange(listener: (site: string) => void): () => void {
		this.listeners.add(listener)
		return () => this.listeners.delete(listener)
	}
}

function hashOf(cookie: ExploreCookie): string {
	return createHash('sha256').update(`${cookie.name}\u0000${cookie.value}`).digest('hex').slice(0, 16)
}
