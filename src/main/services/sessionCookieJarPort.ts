import type {SiteId} from '@shared/sites/types.js'

// How core download code reaches the Explore session without importing Electron.
// The adapter writes a fresh, domain-filtered jar for one spawn and deletes it
// when `fn` settles — always, including on throw.
export interface SessionCookieJarPort {
	withJar<T>(siteId: SiteId, fn: (jarPath: string) => Promise<T>): Promise<T>
}
