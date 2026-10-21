import {hostMatches} from './hostRules.js'
import type {SignInPage} from './types.js'
import {youtubeSite} from './youtube.js'

// Meta signs in on paths of the hosts that also serve Facebook, Instagram and
// Threads, so those paths are sign-in pages and the rest of each site is not.
// No Explore site owns Meta, so its pages live here rather than on a Site.
const META_SIGN_IN_PAGES: readonly SignInPage[] = [
	{host: {kind: 'suffix', domain: 'facebook.com'}, paths: ['/login', '/login.php', '/checkpoint', '/two_step_verification', '/auth_platform', '/recover']},
	{host: {kind: 'suffix', domain: 'instagram.com'}, paths: ['/accounts/login', '/accounts/onetap', '/challenge', '/auth_platform']},
	{host: {kind: 'suffix', domain: 'threads.com'}, paths: ['/login']},
	{host: {kind: 'suffix', domain: 'threads.net'}, paths: ['/login']},
	{host: {kind: 'exact', host: 'auth.meta.com'}},
	{host: {kind: 'exact', host: 'accountscenter.meta.com'}}
]

// Every sign-in page Explore's ad blocker leaves alone: each Explore site's
// sign-in hosts, whole, and Meta's sign-in pages.
export const EXPLORE_SIGN_IN_PAGES: readonly SignInPage[] = [...(youtubeSite.explore?.signInHosts ?? []).map(host => ({host})), ...META_SIGN_IN_PAGES]

// Whether the URL is on one of the sign-in pages. A path matches itself and
// what is below it (/login matches /login/ and /login/x, never /loginhelp),
// case-insensitively.
export function isSignInPage(url: URL, pages: readonly SignInPage[]): boolean {
	const path = url.pathname.toLowerCase()
	return pages.some(page => hostMatches(url.hostname, [page.host]) && (page.paths === undefined || page.paths.some(prefix => path === prefix || path.startsWith(`${prefix}/`))))
}
