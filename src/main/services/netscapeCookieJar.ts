import type {ExploreCookie} from '@shared/sites/types.js'

// Netscape cookie-file text for yt-dlp's --cookies. Pure: no I/O, no logging.
// A cookie is kept only when its host is one of `domains` or a subdomain of one,
// so a YouTube jar never carries another site's (or Google's) session.

// A TAB, CR or LF inside a field would break the line format and let one cookie
// forge another line, so such cookies are dropped rather than escaped.
const CONTROL_CHARACTER = /[\t\r\n]/

function writable(cookie: ExploreCookie): boolean {
	return [cookie.name, cookie.value, cookie.domain, cookie.path].every(field => !CONTROL_CHARACTER.test(field))
}

function onAllowedDomain(cookie: ExploreCookie, domains: readonly string[]): boolean {
	const host = cookie.domain.replace(/^\./, '').toLowerCase()
	return domains.some(domain => host === domain || host.endsWith(`.${domain}`))
}

function line(cookie: ExploreCookie): string {
	const host = cookie.domain.replace(/^\./, '')
	const domain = cookie.hostOnly ? host : `.${host}`
	const expiry = cookie.session || cookie.expirationDate === undefined || !Number.isFinite(cookie.expirationDate) ? 0 : Math.floor(cookie.expirationDate)
	return [`${cookie.httpOnly ? '#HttpOnly_' : ''}${domain}`, cookie.hostOnly ? 'FALSE' : 'TRUE', cookie.path || '/', cookie.secure ? 'TRUE' : 'FALSE', String(expiry), cookie.name, cookie.value].join('\t')
}

// `domains` must be lowercase registrable domains without a leading dot (caller contract).
export function toNetscapeJar(cookies: readonly ExploreCookie[], domains: readonly string[]): string {
	const lines = cookies.filter(cookie => writable(cookie) && onAllowedDomain(cookie, domains)).map(line)
	return ['# Netscape HTTP Cookie File', ...lines].join('\n') + '\n'
}
