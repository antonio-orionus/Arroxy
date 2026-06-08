import type {CookiesBrowser, CookiesMode} from './schemas.js'

export interface CookiesConfigInput {
	cookiesMode?: CookiesMode
	cookiesPath?: string
	cookiesBrowser?: CookiesBrowser
}

export type IncompleteCookiesConfigIssue = 'file-missing-path' | 'browser-missing-selection'

export function getIncompleteCookiesConfigIssue(input: CookiesConfigInput | null | undefined): IncompleteCookiesConfigIssue | null {
	const mode = input?.cookiesMode ?? 'off'
	if (mode === 'file') {
		return input?.cookiesPath?.trim() ? null : 'file-missing-path'
	}
	if (mode === 'browser') {
		return input?.cookiesBrowser ? null : 'browser-missing-selection'
	}
	return null
}

export function cookiesConfigIssueMessage(issue: IncompleteCookiesConfigIssue): string {
	return issue === 'file-missing-path' ? 'Pick a file to use cookies' : 'Pick a browser to use cookies'
}
