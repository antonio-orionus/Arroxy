// Session memory for retrying YouTube-limited downloads without cookies.
//
// YouTube can withhold the higher formats from a signed-in session while the
// same video downloads at full quality signed out. Whether dropping cookies
// helps depends on the account and network, so the first limited download
// finds out and the rest of the session follows the verdict:
//   untested  a limited run with cookies is stopped and retried without them
//   helps     later downloads start without cookies (a failure still falls
//             back to cookies, which covers videos that need sign-in)
//   no-help   cookies stay on and nothing is retried
export type CookielessVerdict = 'untested' | 'helps' | 'no-help'
export type CookielessOutcome = 'full-quality' | 'still-limited' | 'failed'

export class CookielessRetry {
	private verdict: CookielessVerdict = 'untested'

	get current(): CookielessVerdict {
		return this.verdict
	}

	startWithoutCookies(): boolean {
		return this.verdict === 'helps'
	}

	stopLimitedRun(): boolean {
		return this.verdict === 'untested'
	}

	record(outcome: CookielessOutcome): void {
		this.verdict = outcome === 'full-quality' ? 'helps' : 'no-help'
	}
}
