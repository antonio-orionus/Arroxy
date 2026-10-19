import type {ExploreCookieScope} from '@shared/sites/exploreCookieScope.js'

// How core download code reaches the Explore session without importing Electron.
// The adapter writes a fresh jar of the scope's cookies for one spawn and deletes it
// when `fn` settles — always, including on throw.
export interface SessionCookieJarPort {
	withJar<T>(scope: ExploreCookieScope, fn: (jarPath: string) => Promise<T>): Promise<T>
	// The user agent the session's pages load with. Some sites tie a cookie to
	// the browser that earned it (Cloudflare's clearance cookie), so a run on
	// another site presents the jar under this user agent.
	getUserAgent(): string
}
