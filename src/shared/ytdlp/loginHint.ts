// yt-dlp's own login hints (InfoExtractor._login_hint), appended by every
// extractor that reports a missing login through its shared helper, whatever
// the site's own wording.

// The cookie hints: a signed-in session would let the run through.
const COOKIE_LOGIN_HINT = /Use --cookies, --cookies-from-browser,|Use --cookies-from-browser or --cookies for the authentication|Use --cookies for the authentication/
// The password-only hint: the site takes only yt-dlp's own username and
// password, which Arroxy never passes, so cookies cannot help.
const PASSWORD_ONLY_HINT = 'Use --username and --password'

export function asksForCookieLogin(raw: string): boolean {
	return COOKIE_LOGIN_HINT.test(raw)
}

export function asksOnlyForPassword(raw: string): boolean {
	return raw.includes(PASSWORD_ONLY_HINT)
}
