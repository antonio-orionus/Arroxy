// Run with Electron, not Node: writes the Explore session's YouTube cookies
// from a dev profile as a Netscape jar (mode 0600) for a yt-dlp run outside
// the app. Same line format as src/main/services/netscapeCookieJar.ts.
//
//   electron scripts/export-explore-cookies.cjs <userData> <out.txt>
//
// The app name must match the profile's ("arroxy"): Chromium keeps the cookie
// key in the Keychain under "<name> Safe Storage".
const {app, session} = require('electron')
const fs = require('node:fs')

// Electron's argv is [electron, this script, ...args]: take exactly the two
// after the script, so a short command line never writes a jar to a stray path.
const scriptAt = process.argv.findIndex(arg => arg.endsWith('export-explore-cookies.cjs'))
const args = scriptAt === -1 ? [] : process.argv.slice(scriptAt + 1)
if (args.length !== 2 || args.some(arg => arg.trim() === '')) {
	console.error('usage: electron scripts/export-explore-cookies.cjs <userData> <out.txt>')
	process.exit(2)
}
const [userData, out] = args
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
	const youtube = all.filter(cookie => /(^|\.)youtube\.com$/i.test(cookie.domain.replace(/^\./, '')) && ![cookie.name, cookie.value, cookie.domain, cookie.path].some(field => /[\t\r\n]/.test(field)))
	fs.writeFileSync(out, ['# Netscape HTTP Cookie File', ...youtube.map(line)].join('\n') + '\n', {mode: 0o600})
	console.log(`signed in: ${youtube.some(cookie => cookie.name === 'SAPISID')}`)
	app.quit()
})
