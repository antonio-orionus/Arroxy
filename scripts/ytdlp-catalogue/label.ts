// Labels for the yt-dlp message catalogue. Each field of a site's label comes
// from the first rule that answers it, and records which rule did:
//
//   1. an override (overrides.json, human-written), which may also set the
//      category before any rule runs;
//   2. the call: raise_login_required by its login method, the geo helpers,
//      report_drm, the networking errors, a download or HTTPError decided by
//      its HTTP status at run time;
//   3. the text: the site's literal text through the ytdlp-errors patterns;
//   4. call fallbacks, for when the text names nothing: the bug-report suffix
//      (siteChanged), raise_no_formats, PostProcessingError;
//   5. a model (reserved: fills only what every rule above left null);
//   6. otherwise null, and the site counts as unlabelled.
//
// Whether an account helps a site-changed failure is the app's own sign-in
// escalation (escalationReason) asked about the message as it prints, so the
// catalogue cannot disagree with it. The login rows mirror asksOnlyForPassword;
// tests/unit/ytdlp-catalogue-label.test.ts holds both to the app.

import {createHash} from 'node:crypto'
import {matchesGlob} from 'node:path'
import {classifyYtDlpStderr} from 'ytdlp-errors'
import {escalationReason} from '../../src/main/services/exploreEscalation.js'
import type {AccountHelps, Category, CatalogueSite, FailureKind, Override, Provenance, Suffix, UserAction} from './catalogue.js'
import type {RawSite} from './extract.js'

type Field = 'failureKind' | 'accountHelps' | 'action'
interface FieldValues {
	failureKind: FailureKind | null
	accountHelps: AccountHelps
	action: UserAction | null
}
type Answer = {[K in Field]?: {value: FieldValues[K]; from: NonNullable<Provenance>}}

// What a kind found in the text implies for the account and the user.
const KIND_DEFAULTS: Record<FailureKind, {accountHelps: AccountHelps; action: UserAction}> = {
	botBlock: {accountHelps: 'yes', action: 'signIn'},
	ipBlock: {accountHelps: 'no', action: 'changeNetwork'},
	rateLimit: {accountHelps: 'no', action: 'retryLater'},
	ageRestricted: {accountHelps: 'yes', action: 'signIn'},
	unavailable: {accountHelps: 'maybe', action: 'none'},
	formatUnavailable: {accountHelps: 'no', action: 'chooseAnotherFormat'},
	geoBlocked: {accountHelps: 'no', action: 'changeNetwork'},
	drmProtected: {accountHelps: 'no', action: 'none'},
	loginRequired: {accountHelps: 'yes', action: 'signIn'},
	outOfDiskSpace: {accountHelps: 'no', action: 'freeDiskSpace'},
	outputNotWritable: {accountHelps: 'no', action: 'chooseOutputFolder'},
	chunkTransferFailure: {accountHelps: 'no', action: 'retry'},
	missingDependency: {accountHelps: 'no', action: 'installDependency'},
	postprocessFailure: {accountHelps: 'no', action: 'retry'},
	parse: {accountHelps: 'no', action: 'updateEngine'},
	network: {accountHelps: 'no', action: 'retry'},
	unsupportedUrl: {accountHelps: 'no', action: 'none'},
	noSubtitles: {accountHelps: 'no', action: 'none'},
	siteChanged: {accountHelps: 'maybe', action: 'updateEngine'}
}

// Calls whose meaning is fixed, whatever their text says.
const FIXED_CALLS: Record<string, {failureKind: FailureKind; accountHelps: AccountHelps; action: UserAction}> = {
	raise_geo_restricted: {failureKind: 'geoBlocked', accountHelps: 'no', action: 'changeNetwork'},
	GeoRestrictedError: {failureKind: 'geoBlocked', accountHelps: 'no', action: 'changeNetwork'},
	report_drm: {failureKind: 'drmProtected', accountHelps: 'no', action: 'none'},
	UnsupportedError: {failureKind: 'unsupportedUrl', accountHelps: 'no', action: 'none'},
	UserNotLive: {failureKind: 'unavailable', accountHelps: 'no', action: 'retryLater'},
	// The networking layer's own failures.
	TransportError: {failureKind: 'network', accountHelps: 'no', action: 'retry'},
	SSLError: {failureKind: 'network', accountHelps: 'no', action: 'retry'},
	ProxyError: {failureKind: 'network', accountHelps: 'no', action: 'retry'},
	CertificateVerifyError: {failureKind: 'network', accountHelps: 'no', action: 'retry'},
	IncompleteRead: {failureKind: 'chunkTransferFailure', accountHelps: 'no', action: 'retry'}
}

const FIELDS: readonly Field[] = ['failureKind', 'accountHelps', 'action']

export interface Disagreement {
	id: string
	file: string
	line: number
	call: FailureKind
	text: FailureKind
}

export interface LabelResult {
	sites: CatalogueSite[]
	// Sites each override matched, by name; 0 is drift.
	overrideHits: Map<string, number>
	// Sites whose text says another kind than their call rule.
	disagreements: Disagreement[]
}

export function labelSites(raw: readonly RawSite[], overrides: readonly Override[]): LabelResult {
	const ids = siteIds(raw)
	const overrideHits = new Map(overrides.map(override => [override.name, 0]))
	const disagreements: Disagreement[] = []
	const sites = raw.map((site, index) => {
		const id = ids[index]
		const matched = overrides.filter(override => matches(override, site, id))
		for (const override of matched) overrideHits.set(override.name, (overrideHits.get(override.name) ?? 0) + 1)
		const category = matched.find(override => override.label.category)?.label.category ?? categoryOf(site)
		const shown = printed(site, category)
		const labelled = category === 'error' || category === 'warning'
		const call = labelled ? callAnswer(site, category) : {}
		const text = labelled ? textAnswer(site) : {}
		const fallback = labelled ? fallbackAnswer(site, category, shown) : {}
		const callKind = call.failureKind?.value
		const textKind = text.failureKind?.value
		if (callKind && textKind && callKind !== textKind) disagreements.push({id, file: site.file, line: site.line, call: callKind, text: textKind})
		const answers = [...matched.map(overrideAnswer), call, text, fallback]
		const label = {category, failureKind: pick(answers, 'failureKind'), accountHelps: pick(answers, 'accountHelps'), action: pick(answers, 'action')}
		return {
			id,
			at: {file: site.file, line: site.line, scope: site.scope, extractor: site.extractor},
			call: {name: site.call, kind: site.kind, ...(site.flags.loginMethod ? {loginMethod: site.flags.loginMethod} : {})},
			message: {template: site.template, shape: site.shape, relays: site.relays, printed: shown, suffixes: suffixes(site)},
			label: {category: label.category, failureKind: label.failureKind.value, accountHelps: label.accountHelps.value, action: label.action.value, from: {failureKind: label.failureKind.from, accountHelps: label.accountHelps.from, action: label.action.from}}
		} satisfies CatalogueSite
	})
	return {sites, overrideHits, disagreements}
}

function pick<K extends Field>(answers: readonly Answer[], field: K): {value: FieldValues[K] | null; from: Provenance} {
	for (const answer of answers) {
		const found = answer[field]
		if (found) return {value: found.value, from: found.from}
	}
	return {value: null, from: null}
}

function all(values: Partial<FieldValues>, from: NonNullable<Provenance>): Answer {
	const answer: Answer = {}
	for (const field of FIELDS) {
		if (values[field] !== undefined) Object.assign(answer, {[field]: {value: values[field], from}})
	}
	return answer
}

function overrideAnswer(override: Override): Answer {
	const {failureKind, accountHelps, action} = override.label
	return all({failureKind, accountHelps, action}, `override:${override.name}`)
}

function callAnswer(site: RawSite, category: Category): Answer {
	const from = `call:${site.call}` as const
	if (site.call === 'raise_login_required') {
		const method = site.flags.loginMethod
		// A password-only site takes a username and password, which Arroxy never passes.
		if (method === 'password') return all({failureKind: 'loginRequired', accountHelps: 'no', action: 'none'}, from)
		return all({failureKind: 'loginRequired', accountHelps: method === 'dynamic' ? 'maybe' : 'yes', action: 'signIn'}, from)
	}
	const fixed = FIXED_CALLS[site.call]
	if (fixed) return all(fixed, from)
	if (category === 'error' && (site.kind === 'download' || site.call === 'HTTPError')) return HTTP_STATUS
	return {}
}

// A fatal download fails with the HTTP error under it, and an HTTPError is one:
// the status (403, 404, 429) says what happened, and only a run has it.
const HTTP_STATUS: Answer = {failureKind: {value: null, from: 'cause:http'}, accountHelps: {value: 'maybe', from: 'cause:http'}, action: {value: null, from: 'cause:http'}}

// Answers that hold only when the text names nothing: an unexpected error is
// a site change, raise_no_formats is `unavailable`, a PostProcessingError a
// post-processing failure, and an error raised while a network error is being
// handled is that error's HTTP status.
function fallbackAnswer(site: RawSite, category: Category, shown: string): Answer {
	if (category !== 'error') return {}
	if (hasBugReport(site)) return all({failureKind: 'siteChanged', accountHelps: accountTried(site, shown) ? 'maybe' : 'no', action: 'updateEngine'}, 'suffix:bugReport')
	if (site.call === 'raise_no_formats') return all({failureKind: 'unavailable', accountHelps: 'maybe'}, 'call:raise_no_formats')
	if (site.call === 'PostProcessingError') return all({failureKind: 'postprocessFailure', ...KIND_DEFAULTS.postprocessFailure}, 'call:PostProcessingError')
	if (site.kind === 'raise' && site.flags.networkExcept) return HTTP_STATUS
	return {}
}

// yt-dlp's own words for the parts `printed` names (bug_reports_message,
// InfoExtractor._login_hint), close enough for the app's escalation to read
// them as it reads a real run.
const BUG_REPORT = '; please report this issue on  https://github.com/yt-dlp/yt-dlp/issues?q= , filling out the appropriate issue template. Confirm you are on the latest version using  yt-dlp -U'
const COOKIES_FAQ = 'See  https://github.com/yt-dlp/yt-dlp/wiki/FAQ#how-do-i-pass-cookies-to-yt-dlp  for how to manually pass cookies'
const PASSWORD_HINT = '--username and --password, --netrc-cmd, or --netrc (site) to provide account credentials'
const LOGIN_HINTS: Record<NonNullable<RawSite['flags']['loginMethod']>, string> = {
	any: `Use --cookies, --cookies-from-browser, ${PASSWORD_HINT}. ${COOKIES_FAQ}`,
	// No method: `any` when the extractor takes a password, else `cookies`; both offer cookies.
	default: `Use --cookies, --cookies-from-browser, ${PASSWORD_HINT}. ${COOKIES_FAQ}`,
	dynamic: `Use --cookies, --cookies-from-browser, ${PASSWORD_HINT}. ${COOKIES_FAQ}`,
	password: `Use ${PASSWORD_HINT}`,
	cookies: `Use --cookies-from-browser or --cookies for the authentication. ${COOKIES_FAQ}`,
	session_cookies: `Use --cookies for the authentication (--cookies-from-browser might not work). ${COOKIES_FAQ}`
}

// Whether the app tries the account when a probe fails with this message: a
// login wall off YouTube reads as "Unable to extract", and text naming private
// or members-only content escalates on any site.
function accountTried(site: RawSite, shown: string): boolean {
	// Any hole, or a wrapped cause, may carry the site's own words or a run-time
	// message (a relayed error, `str(e)`), which may name a private video or ask
	// for cookies: the app may try the account. Only fully literal text gets a
	// definite answer. The extractor's shape says where its holes are; a callee
	// default is read from the source and may hold one too.
	if (site.shape !== 'literal' && site.shape !== 'default') return true
	if (site.template === null || site.flags.cause || hasHole(site.template)) return true
	const raw = fill(shown, site.flags.loginMethod)
	const url = isYouTube(site) ? 'https://www.youtube.com/watch?v=aaaaaaaaaaa' : 'https://example.org/video'
	return escalationReason({stage: 'probe', url, error: {kind: 'ytdlp', error: {kind: classifyYtDlpStderr(raw).kind, raw}}}) !== null
}

// The printed form as a run prints it: its named parts in yt-dlp's words and
// every other hole as a placeholder value.
export function fill(shown: string, loginMethod?: RawSite['flags']['loginMethod']): string {
	const parts: Record<string, string> = {bugReport: BUG_REPORT, loginHint: LOGIN_HINTS[loginMethod ?? 'default']}
	let out = ''
	let depth = 0
	let hole = ''
	for (let index = 0; index < shown.length; index++) {
		const char = shown[index]
		if (depth === 0 && (char === '{' || char === '}') && shown[index + 1] === char) {
			out += char
			index++
		} else if (char === '{') {
			if (depth > 0) hole += char
			depth++
		} else if (char === '}' && depth > 0) {
			depth--
			if (depth === 0) {
				out += parts[hole] ?? 'x'
				hole = ''
			} else hole += char
		} else if (depth > 0) {
			hole += char
		} else {
			out += char
		}
	}
	return out
}

function textAnswer(site: RawSite): Answer {
	const text = literalText(site.template)
	if (!/[a-z]{3}/i.test(text)) return {}
	const {kind} = classifyYtDlpStderr(`ERROR: ${text}`)
	if (kind === 'unknown') return {}
	return all({failureKind: kind, ...KIND_DEFAULTS[kind]}, `pattern:${kind}`)
}

function hasHole(template: string): boolean {
	return literalText(template) !== template.replaceAll('{{', '{').replaceAll('}}', '}')
}

// The template's literal parts: `{{` and `}}` are braces, `{...}` a hole
// (holes may hold braces of their own).
function literalText(template: string | null): string {
	if (template === null) return ''
	let out = ''
	let depth = 0
	for (let index = 0; index < template.length; index++) {
		const char = template[index]
		const next = template[index + 1]
		if (depth === 0 && (char === '{' || char === '}') && next === char) {
			out += char
			index++
		} else if (char === '{') {
			if (depth === 0) out += ' '
			depth++
		} else if (char === '}' && depth > 0) {
			depth--
		} else if (depth === 0) {
			out += char
		}
	}
	return out
}

export function categoryOf(site: RawSite): Category {
	switch (site.kind) {
		case 'raise':
		case 'helper':
			return 'error'
		case 'status':
			return site.call === 'write_debug' ? 'debug' : 'status'
		case 'report':
			return site.call === 'report_warning' ? 'warning' : site.call === 'deprecation_warning' ? 'deprecation' : 'error'
		case 'regex':
		case 'download':
			return site.flags.fatal === 'no' ? 'warning' : 'error'
	}
}

// ExtractorError appends the bug-report request unless expected=True, which it
// sets itself while a network error is being handled; raise_no_formats passes
// its own expected on; a regex helper's message always carries it.
function hasBugReport(site: RawSite): boolean {
	// A warning appends it by hand; a fatal search raises RegexNotFoundError, an ExtractorError.
	if (site.kind === 'regex') return site.flags.fatal === 'no' || !site.flags.networkExcept
	const raises = site.kind === 'raise' || site.call === 'raise_no_formats'
	return raises && (site.flags.expected === 'absent' || site.flags.expected === 'no') && !site.flags.networkExcept
}

function isYouTube(site: RawSite): boolean {
	return site.file === 'yt_dlp/extractor/youtube.py' || site.file.startsWith('yt_dlp/extractor/youtube/')
}

function suffixes(site: RawSite): Suffix[] {
	const out: Suffix[] = []
	if (site.call === 'raise_login_required') out.push('loginHint')
	// ExtractorError puts the cause before the bug-report request.
	if (site.flags.cause) out.push('causedBy')
	if (hasBugReport(site)) out.push('bugReport')
	return out
}

const PREFIX: Record<Category, string> = {error: 'ERROR: ', warning: 'WARNING: ', deprecation: 'DeprecationWarning: ', status: '', debug: '[debug] '}
const SUFFIX_TEXT: Record<Suffix, string> = {loginHint: '. {loginHint}', bugReport: '{bugReport}', causedBy: ' (caused by {cause})'}

function printed(site: RawSite, category: Category): string {
	const extractor = site.extractor ? `[${site.extractor}] ` : ''
	let body = site.template ?? '{message}'
	if (site.kind === 'regex') body = `${category === 'warning' ? 'unable' : 'Unable'} to extract ${site.template ?? '{name}'}`
	if (site.kind === 'download') body = `${site.template ?? '{errnote}'}: {cause}`
	const tail = suffixes(site)
		.filter(suffix => !(site.kind === 'download' && suffix === 'causedBy'))
		.map(suffix => SUFFIX_TEXT[suffix])
		.join('')
	return `${PREFIX[category]}${extractor}${body}${tail}`
}

function matches(override: Override, site: RawSite, id: string): boolean {
	const {match} = override
	if (match.id !== undefined && match.id !== id) return false
	if (match.call !== undefined && match.call !== site.call) return false
	if (match.file !== undefined && !matchesGlob(site.file, match.file)) return false
	// eslint-disable-next-line security/detect-non-literal-regexp -- the pattern is a maintainer's, from overrides.json in this repo
	if (match.template !== undefined && (site.template === null || !new RegExp(match.template).test(site.template))) return false
	return true
}

function siteIds(raw: readonly RawSite[]): string[] {
	const seen = new Map<string, number>()
	return raw.map(site => {
		const key = [site.file, site.scope, site.call, site.kind, site.template ?? ''].join('\0')
		const nth = seen.get(key) ?? 0
		seen.set(key, nth + 1)
		return createHash('sha1').update(`${key}\0${nth}`).digest('hex').slice(0, 12)
	})
}
