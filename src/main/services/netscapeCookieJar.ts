import {inExploreCookieScope, type ExploreCookieScope} from '@shared/sites/exploreCookieScope.js'
import type {ExploreCookie} from '@shared/sites/types.js'

// Netscape cookie-file text for yt-dlp's --cookies. Pure: no I/O, no logging.
// A cookie is kept only when it is in the run's scope, so a YouTube jar never
// carries another site's (or Google's) session, and another site's jar never
// carries Google's or YouTube's.

// A TAB, CR or LF inside a field would break the line format and let one cookie
// forge another line, so such cookies are dropped rather than escaped.
const CONTROL_CHARACTER = /[\t\r\n]/

function writable(cookie: ExploreCookie): boolean {
	return [cookie.name, cookie.value, cookie.domain, cookie.path].every(field => !CONTROL_CHARACTER.test(field))
}

function line(cookie: ExploreCookie): string {
	const host = cookie.domain.replace(/^\./, '')
	const domain = cookie.hostOnly ? host : `.${host}`
	const expiry = cookie.session || cookie.expirationDate === undefined || !Number.isFinite(cookie.expirationDate) ? 0 : Math.floor(cookie.expirationDate)
	return [`${cookie.httpOnly ? '#HttpOnly_' : ''}${domain}`, cookie.hostOnly ? 'FALSE' : 'TRUE', cookie.path || '/', cookie.secure ? 'TRUE' : 'FALSE', String(expiry), cookie.name, cookie.value].join('\t')
}

export function toNetscapeJar(cookies: readonly ExploreCookie[], scope: ExploreCookieScope): string {
	const lines = cookies.filter(cookie => writable(cookie) && inExploreCookieScope(cookie, scope)).map(line)
	return ['# Netscape HTTP Cookie File', ...lines].join('\n') + '\n'
}
