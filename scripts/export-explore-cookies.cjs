// Run with Electron, not Node: writes the Explore session's cookies from a dev
// profile as a Netscape jar (mode 0600) for a yt-dlp run outside the app. Same
// line format as src/main/services/netscapeCookieJar.ts. Scope `youtube` (the
// default) keeps YouTube's cookies; `web` keeps every cookie but Google's and
// YouTube's account cookies, as the app's jar for any other site.
//
//   electron scripts/export-explore-cookies.cjs <userData> <out.txt> [youtube|web]
//
// The app name must match the profile's ("arroxy"): Chromium keeps the cookie
// key in the Keychain under "<name> Safe Storage".
const {app, session} = require('electron')
const fs = require('node:fs')

// Electron's argv is [electron, this script, ...args]: take exactly the two
// after the script, so a short command line never writes a jar to a stray path.
const scriptAt = process.argv.findIndex(arg => arg.endsWith('export-explore-cookies.cjs'))
const args = scriptAt === -1 ? [] : process.argv.slice(scriptAt + 1)
if (args.length < 2 || args.length > 3 || args.some(arg => arg.trim() === '') || (args[2] !== undefined && args[2] !== 'youtube' && args[2] !== 'web')) {
	console.error('usage: electron scripts/export-explore-cookies.cjs <userData> <out.txt> [youtube|web]')
	process.exit(2)
}
const [userData, out, scope = 'youtube'] = args
// The account cookies another site's jar never carries (SiteExplore.accountCookieHosts).
const ACCOUNT_COOKIE_HOST = /(^|\.)(youtube\.com|google\.com|google\.(?:(?:co|com)\.)?[a-z]{2})$/i
app.setName('arroxy')
app.setPath('userData', userData)
app.dock?.hide()

/** @param {import('electron').Cookie} cookie */
function line(cookie) {
	const host = cookie.domain.replace(/^\./, '')
	const expiry = cookie.session || !Number.isFinite(cookie.expirationDate) ? 0 : Math.floor(cookie.expirationDate)
	return [(cookie.httpOnly ? '#HttpOnly_' : '') + (cookie.hostOnly ? host : `.${host}`), cookie.hostOnly ? 'FALSE' : 'TRUE', cookie.path === '' ? '/' : cookie.path, cookie.secure ? 'TRUE' : 'FALSE', String(expiry), cookie.name, cookie.value].join('\t')
}

void app.whenReady().then(async () => {
	const all = await session.fromPartition('persist:arroxy-explore').cookies.get({})
	const writable = all.filter(cookie => ![cookie.name, cookie.value, cookie.domain, cookie.path].some(field => /[\t\r\n]/.test(field)))
	const host = (/** @type {import('electron').Cookie} */ cookie) => (cookie.domain ?? '').replace(/^\./, '')
	const kept = writable.filter(cookie => (scope === 'youtube' ? /(^|\.)youtube\.com$/i.test(host(cookie)) : !ACCOUNT_COOKIE_HOST.test(host(cookie))))
	fs.writeFileSync(out, ['# Netscape HTTP Cookie File', ...kept.map(line)].join('\n') + '\n', {mode: 0o600})
	console.log(scope === 'youtube' ? `signed in: ${kept.some(cookie => cookie.name === 'SAPISID')}` : `cookies: ${kept.length}`)
	app.quit()
})
