import type {HostRule} from './types.js'

type HostPattern = Extract<HostRule, {kind: 'pattern'}>['pattern']

// accounts.google.<cc>, accounts.google.co.<cc> and accounts.google.com.<cc>:
// Google's per-country sign-in hosts. Two-letter country codes only — a
// generic TLD (.xyz, .biz, .net) is never one of them.
const GOOGLE_ACCOUNTS_CCTLD = /^accounts\.google\.(?:(?:co|com)\.)?[a-z]{2}$/
// consent.google.<cc> and its co./com. forms: Google's per-country consent hosts.
const GOOGLE_CONSENT_CCTLD = /^consent\.google\.(?:(?:co|com)\.)?[a-z]{2}$/
// google.<cc>, google.co.<cc> and google.com.<cc>, and any host under them:
// where Google's per-country account cookies live.
const GOOGLE_CCTLD = /(?:^|\.)google\.(?:(?:co|com)\.)?[a-z]{2}$/

// One matcher per named pattern: a new pattern in HostRule fails to compile
// until it gets its own matcher here.
const PATTERN_MATCHERS: {readonly [P in HostPattern]: (host: string) => boolean} = {'google-accounts-cctld': host => GOOGLE_ACCOUNTS_CCTLD.test(host), 'google-consent-cctld': host => GOOGLE_CONSENT_CCTLD.test(host), 'google-cctld': host => GOOGLE_CCTLD.test(host)}

function matchesRule(host: string, rule: HostRule): boolean {
	switch (rule.kind) {
		case 'exact':
			return host === rule.host
		case 'suffix':
			return host === rule.domain || host.endsWith(`.${rule.domain}`)
		case 'pattern':
			return PATTERN_MATCHERS[rule.pattern](host)
	}
}

// Whether a hostname matches any of the rules.
// Case-insensitive; a single trailing dot (the absolute-name form) is ignored.
export function hostMatches(host: string, rules: readonly HostRule[]): boolean {
	const normalized = host.toLowerCase().replace(/\.$/, '')
	return normalized !== '' && rules.some(rule => matchesRule(normalized, rule))
}
