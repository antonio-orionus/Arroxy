// The yt-dlp message catalogue's label rules (scripts/ytdlp-catalogue/label.ts):
// each field from the first rule that answers it (an override, the call, the
// text, else null), with the rule recorded. The login and site-changed rows
// mirror the app's sign-in escalation (asksOnlyForPassword,
// extractionFailureReason), so the catalogue never disagrees with it.

import {readFile} from 'node:fs/promises'
import path from 'node:path'
import {describe, expect, it} from 'vite-plus/test'
import {type Override, overridesSchema} from '../../scripts/ytdlp-catalogue/catalogue.js'
import type {RawSite} from '../../scripts/ytdlp-catalogue/extract.js'
import {classifyYtDlpStderr} from 'ytdlp-errors'
import {escalationReason} from '@main/services/exploreEscalation.js'
import {fill, labelSites} from '../../scripts/ytdlp-catalogue/label.js'

function raw(site: Partial<RawSite>): RawSite {
	return {file: 'yt_dlp/extractor/example.py', line: 10, scope: 'ExampleIE._real_extract', extractor: 'example', call: 'ExtractorError', kind: 'raise', template: 'Something broke', shape: 'literal', relays: null, flags: {expected: 'yes'}, ...site}
}

function label(site: Partial<RawSite>, overrides: Override[] = []) {
	return labelSites([raw(site)], overrides).sites[0]
}

describe('category, from the call', () => {
	it.each([
		[{kind: 'raise'}, 'error'],
		[{kind: 'helper', call: 'raise_login_required', flags: {loginMethod: 'default'}}, 'error'],
		[{kind: 'report', call: 'report_error'}, 'error'],
		[{kind: 'report', call: 'report_warning', flags: {}}, 'warning'],
		[{kind: 'report', call: 'deprecation_warning', flags: {}}, 'deprecation'],
		[{kind: 'status', call: 'to_screen', flags: {}}, 'status'],
		[{kind: 'status', call: 'write_debug', flags: {}}, 'debug'],
		[{kind: 'regex', call: '_search_regex', flags: {fatal: 'yes'}}, 'error'],
		[{kind: 'regex', call: '_search_regex', flags: {fatal: 'no'}}, 'warning'],
		[{kind: 'download', call: '_download_json', flags: {fatal: 'dynamic'}}, 'error']
	] as const)('%o → %s', (site, category) => {
		expect(label(site as Partial<RawSite>).label.category).toBe(category)
	})
})

describe('call rules', () => {
	it.each([
		['default', 'yes', 'signIn'],
		['cookies', 'yes', 'signIn'],
		['session_cookies', 'yes', 'signIn'],
		['any', 'yes', 'signIn'],
		// Only a username and password, which Arroxy never passes: cookies can't help.
		['password', 'no', 'none'],
		['dynamic', 'maybe', 'signIn']
	] as const)('raise_login_required with method %s: account helps %s', (loginMethod, accountHelps, action) => {
		expect(label({kind: 'helper', call: 'raise_login_required', template: 'Members only', flags: {loginMethod}}).label).toMatchObject({failureKind: 'loginRequired', accountHelps, action, from: {failureKind: 'call:raise_login_required', accountHelps: 'call:raise_login_required', action: 'call:raise_login_required'}})
	})

	it.each([
		[{kind: 'helper', call: 'raise_geo_restricted', flags: {}}, 'geoBlocked', 'no', 'changeNetwork'],
		[{kind: 'raise', call: 'GeoRestrictedError', flags: {}}, 'geoBlocked', 'no', 'changeNetwork'],
		[{kind: 'helper', call: 'report_drm', flags: {}}, 'drmProtected', 'no', 'none'],
		[{kind: 'raise', call: 'UnsupportedError', flags: {}}, 'unsupportedUrl', 'no', 'none'],
		[{kind: 'raise', call: 'UserNotLive', flags: {expected: 'absent'}}, 'unavailable', 'no', 'retryLater']
	] as const)('%o → %s', (site, failureKind, accountHelps, action) => {
		expect(label(site as Partial<RawSite>).label).toMatchObject({failureKind, accountHelps, action})
	})

	it('raise_no_formats takes its kind from the text, else unavailable', () => {
		expect(label({kind: 'helper', call: 'raise_no_formats', template: 'Requested format is not available', flags: {expected: 'yes'}}).label).toMatchObject({failureKind: 'formatUnavailable', from: {failureKind: 'pattern:formatUnavailable'}})
		expect(label({kind: 'helper', call: 'raise_no_formats', template: 'No video formats found', flags: {expected: 'yes'}}).label).toMatchObject({failureKind: 'unavailable', accountHelps: 'maybe', from: {failureKind: 'call:raise_no_formats'}})
	})

	describe('the bug-report suffix: the page was not what the extractor expected', () => {
		it.each([
			[{kind: 'raise', call: 'ExtractorError', template: 'Something broke', flags: {expected: 'absent'}}],
			[{kind: 'raise', call: 'ExtractorError', template: 'Something broke', flags: {expected: 'no'}}],
			[{kind: 'regex', call: '_search_regex', template: 'title', flags: {fatal: 'yes'}}],
			[{kind: 'helper', call: 'raise_no_formats', template: 'No video formats found', flags: {expected: 'absent'}}]
		] as const)('%o: siteChanged when the text names nothing else', site => {
			const labelled = label({...site, file: 'yt_dlp/extractor/facebook.py'})
			expect(labelled.label).toMatchObject({failureKind: 'siteChanged', action: 'updateEngine', from: {failureKind: 'suffix:bugReport'}})
			expect(labelled.message.suffixes).toContain('bugReport')
		})

		it('the text wins: an unexpected error that names a bot wall is a bot wall', () => {
			expect(label({template: 'Sign in to confirm you’re not a bot', flags: {expected: 'absent'}}).label).toMatchObject({failureKind: 'botBlock', from: {failureKind: 'pattern:botBlock'}})
		})

		// Whether an account helps is the app's own escalation: off YouTube the probe
		// tries the account on "Unable to extract" (a login wall reads that way), and
		// on any site on text that names private or members-only content.
		it.each([
			['yt_dlp/extractor/facebook.py', 'regex', 'title', 'maybe'],
			['yt_dlp/extractor/facebook.py', 'raise', 'Cannot parse data', 'maybe'],
			['yt_dlp/extractor/facebook.py', 'raise', 'Could not find player data', 'no'],
			['yt_dlp/extractor/youtube/_video.py', 'regex', 'title', 'no'],
			['yt_dlp/extractor/youtube/_video.py', 'raise', 'This video is private', 'maybe']
		] as const)('%s %s %s: account helps %s', (file, kind, template, accountHelps) => {
			const site = kind === 'regex' ? {kind, call: '_search_regex', template, flags: {fatal: 'yes'}} : {kind, call: 'ExtractorError', template, flags: {expected: 'absent'}}
			expect(label({...site, file} as Partial<RawSite>).label).toMatchObject({failureKind: 'siteChanged', accountHelps, from: {accountHelps: 'suffix:bugReport'}})
		})

		it('expected=True, or an expected only known at run time, prints no suffix', () => {
			expect(label({flags: {expected: 'yes'}}).message.suffixes).not.toContain('bugReport')
			expect(label({flags: {expected: 'dynamic'}}).label.failureKind).toBeNull()
			expect(label({kind: 'helper', call: 'raise_no_formats', template: 'No video formats found', flags: {expected: 'yes'}}).label).toMatchObject({failureKind: 'unavailable', from: {failureKind: 'call:raise_no_formats'}})
		})

		it('a relayed or computed message keeps the account at maybe: the site’s own words may name a private video', () => {
			expect(label({template: '{error}', shape: 'relay', relays: 'error', flags: {expected: 'absent'}}).label).toMatchObject({failureKind: 'siteChanged', accountHelps: 'maybe'})
			expect(label({template: null, shape: 'dynamic', flags: {expected: 'absent'}}).label).toMatchObject({failureKind: 'siteChanged', accountHelps: 'maybe'})
		})

		it('an except that may or may not hold an exact network error claims no suffix', () => {
			expect(label({template: 'Transport failed', flags: {expected: 'absent', networkExcept: 'maybe'}}).message.suffixes).not.toContain('bugReport')
		})

		it('any hole in the text may carry the site’s words: the account stays maybe', () => {
			expect(label({template: 'Could not download profile info; {str(e)}', shape: 'template', flags: {expected: 'absent'}}).label).toMatchObject({failureKind: 'siteChanged', accountHelps: 'maybe'})
			expect(label({template: "Could not find player; {{'error': data['message']}}", shape: 'relay', relays: 'message', flags: {expected: 'absent'}}).label.accountHelps).toBe('maybe')
			// A literal message wrapping another error prints that error too.
			expect(label({template: 'Relinker URL not found', flags: {expected: 'absent', cause: true}}).label.accountHelps).toBe('maybe')
			expect(label({template: 'Relinker URL not found', flags: {expected: 'absent'}}).label.accountHelps).toBe('no')
		})

		it('a fatal regex inside an except for a network error prints no suffix either', () => {
			expect(label({kind: 'regex', call: '_search_regex', template: 'title', flags: {fatal: 'yes', networkExcept: 'yes'}}).message.suffixes).not.toContain('bugReport')
			expect(label({kind: 'regex', call: '_search_regex', template: 'title', flags: {fatal: 'no', networkExcept: 'yes'}}).message.suffixes).toContain('bugReport')
		})

		it('inside an except for a network error yt-dlp sets expected itself: no suffix, decided by the HTTP status', () => {
			const labelled = label({template: 'Request failed', flags: {expected: 'absent', networkExcept: 'yes', onHttpError: true}})
			expect(labelled.message.suffixes).not.toContain('bugReport')
			expect(labelled.label).toMatchObject({failureKind: null, from: {failureKind: 'cause:http'}})
		})
	})

	it.each([[{kind: 'download', call: '_download_json', template: 'Unable to download JSON metadata', shape: 'default', flags: {fatal: 'yes'}}], [{kind: 'raise', call: 'HTTPError', template: 'HTTP Error {response.status}: {response.reason}', shape: 'default', flags: {}}]] as const)(
		'%o is decided at run time by its HTTP status',
		site => {
			expect(label(site as Partial<RawSite>).label).toMatchObject({failureKind: null, accountHelps: 'maybe', action: null, from: {failureKind: 'cause:http', accountHelps: 'cause:http', action: 'cause:http'}})
		}
	)

	it.each([
		['TransportError', 'network'],
		['SSLError', 'network'],
		['ProxyError', 'network'],
		['CertificateVerifyError', 'network'],
		['IncompleteRead', 'chunkTransferFailure']
	] as const)('%s → %s', (call, failureKind) => {
		expect(label({kind: 'raise', call, template: 'whatever it says', flags: {}}).label).toMatchObject({failureKind, accountHelps: 'no', action: 'retry'})
	})

	it('a PostProcessingError is a post-processing failure unless its text says more', () => {
		expect(label({kind: 'raise', call: 'PostProcessingError', template: 'audio conversion failed: {err.msg}', flags: {}}).label).toMatchObject({failureKind: 'postprocessFailure', action: 'retry', from: {failureKind: 'call:PostProcessingError'}})
		expect(label({kind: 'raise', call: 'PostProcessingError', template: 'ffprobe and ffmpeg not found. Please install or provide the path using --ffmpeg-location', flags: {}}).label).toMatchObject({failureKind: 'missingDependency', from: {failureKind: 'pattern:missingDependency'}})
	})
})

describe('text rule', () => {
	it('classifies the literal text with the ytdlp-errors patterns', () => {
		expect(label({template: 'Sign in to confirm you’re not a bot'}).label).toMatchObject({failureKind: 'botBlock', accountHelps: 'yes', action: 'signIn', from: {failureKind: 'pattern:botBlock'}})
	})

	it('reads only the literal parts, not the holes', () => {
		expect(label({template: '{video_id}: This video is DRM protected', shape: 'template'}).label.failureKind).toBe('drmProtected')
		expect(label({template: '{self.IE_NAME} said: {error}', shape: 'relay', relays: 'error'}).label.failureKind).toBeNull()
	})

	it('labels warnings too, but never status or debug lines', () => {
		expect(label({kind: 'report', call: 'report_warning', template: 'HTTP Error 429: Too Many Requests', flags: {}}).label.failureKind).toBe('rateLimit')
		expect(label({kind: 'status', call: 'to_screen', template: 'HTTP Error 429: Too Many Requests', flags: {}}).label).toMatchObject({category: 'status', failureKind: null, accountHelps: null, action: null})
	})

	it('nothing known: every field stays null and counts as unlabelled', () => {
		expect(label({template: 'Something broke'}).label).toMatchObject({failureKind: null, accountHelps: null, action: null, from: {failureKind: null, accountHelps: null, action: null}})
	})
})

describe('overrides', () => {
	const members: Override = {name: 'example-members', match: {file: 'yt_dlp/extractor/example.py', template: '^Members only$'}, label: {failureKind: 'loginRequired', accountHelps: 'yes', action: 'signIn'}, note: 'test'}

	it('win over every other rule, field by field', () => {
		const labelled = label({template: 'Members only'}, [members])
		expect(labelled.label).toMatchObject({failureKind: 'loginRequired', accountHelps: 'yes', action: 'signIn', from: {failureKind: 'override:example-members'}})
		const partial = label({kind: 'helper', call: 'raise_login_required', template: 'Members only', flags: {loginMethod: 'password'}}, [{...members, label: {accountHelps: 'maybe'}}])
		expect(partial.label).toMatchObject({failureKind: 'loginRequired', accountHelps: 'maybe', from: {failureKind: 'call:raise_login_required', accountHelps: 'override:example-members'}})
	})

	it('match by id, call, a file glob and a template regex together', () => {
		const site = raw({template: 'Members only'})
		const [labelled] = labelSites([site], []).sites
		const byId: Override = {name: 'by-id', match: {id: labelled.id}, label: {action: 'retry'}, note: 'test'}
		expect(labelSites([site], [byId]).sites[0].label.action).toBe('retry')
		expect(label({template: 'Members only'}, [{...members, match: {file: 'yt_dlp/extractor/*.py', call: 'ExtractorError'}}]).label.failureKind).toBe('loginRequired')
		expect(label({template: 'Members only'}, [{...members, match: {file: 'yt_dlp/postprocessor/**'}}]).label.failureKind).toBeNull()
	})

	it('are refused when a template is not a regular expression, or nothing is matched on', () => {
		expect(() => overridesSchema.parse([{...members, match: {template: '(unclosed'}}])).toThrow(/regular expression/)
		expect(() => overridesSchema.parse([{...members, match: {}}])).toThrow(/match on something/)
		expect(overridesSchema.parse([members])).toHaveLength(1)
	})

	it('set the category before the rules run: a status line made an error gets labelled, an error made a status line does not', () => {
		const promoted = label({kind: 'status', call: 'to_screen', template: 'Sign in to confirm you’re not a bot', flags: {}}, [{name: 'promote', match: {call: 'to_screen'}, label: {category: 'error'}, note: 'test'}])
		expect(promoted).toMatchObject({label: {category: 'error', failureKind: 'botBlock'}, message: {printed: 'ERROR: [example] Sign in to confirm you’re not a bot'}})
		const demoted = label({template: 'Something broke', flags: {expected: 'absent'}}, [{name: 'demote', match: {call: 'ExtractorError'}, label: {category: 'status'}, note: 'test'}])
		expect(demoted.label).toMatchObject({category: 'status', failureKind: null, accountHelps: null, action: null})
		expect(demoted.message.printed).toBe('[example] Something broke{bugReport}')
	})

	it('the shipped overrides parse, and each labels the site it was written for', async () => {
		const shipped = overridesSchema.parse(JSON.parse(await readFile(path.resolve(import.meta.dirname, '../../scripts/ytdlp-catalogue/overrides.json'), 'utf8')))
		const site = raw({file: 'yt_dlp/YoutubeDL.py', extractor: null, scope: 'YoutubeDL.dl', kind: 'report', call: 'report_error', template: 'content too short (expected {err.expected} bytes and served {err.downloaded})', shape: 'template', flags: {}})
		const {sites, overrideHits} = labelSites([site], shipped)
		expect(sites[0].label).toMatchObject({failureKind: 'chunkTransferFailure', from: {failureKind: 'override:content-too-short'}})
		expect(overrideHits.get('content-too-short')).toBe(1)
	})

	it('count their hits, so an override that matches nothing shows as drift', () => {
		const {overrideHits} = labelSites([raw({template: 'Members only'})], [members, {...members, name: 'stale', match: {template: '^Gone$'}}])
		expect(Object.fromEntries(overrideHits)).toEqual({'example-members': 1, stale: 0})
	})
})

describe('drift', () => {
	it('records a site whose text says something other than its call rule', () => {
		const {disagreements} = labelSites([raw({kind: 'helper', call: 'raise_geo_restricted', template: 'Sign in to confirm you’re not a bot', flags: {}})], [])
		expect(disagreements).toEqual([expect.objectContaining({call: 'geoBlocked', text: 'botBlock'})])
	})
})

describe('the catalogue entry', () => {
	it('keeps where the site is, its call and its message', () => {
		const labelled = label({kind: 'helper', call: 'raise_login_required', template: 'Members only', flags: {loginMethod: 'cookies'}})
		expect(labelled).toMatchObject({at: {file: 'yt_dlp/extractor/example.py', line: 10, scope: 'ExampleIE._real_extract', extractor: 'example'}, call: {name: 'raise_login_required', kind: 'helper', loginMethod: 'cookies'}, message: {template: 'Members only', shape: 'literal', relays: null, suffixes: ['loginHint']}})
		expect(labelled.message.printed).toBe('ERROR: [example] Members only. {loginHint}')
	})

	it.each([
		[{kind: 'regex', call: '_search_regex', template: 'title', flags: {fatal: 'yes'}}, 'ERROR: [example] Unable to extract title{bugReport}'],
		[{kind: 'regex', call: '_search_regex', template: 'view count', flags: {fatal: 'no'}}, 'WARNING: [example] unable to extract view count{bugReport}'],
		[{kind: 'download', call: '_download_json', template: 'Unable to download player', flags: {fatal: 'yes'}}, 'ERROR: [example] Unable to download player: {cause}'],
		[{kind: 'raise', template: null, shape: 'dynamic', flags: {expected: 'yes', cause: true}}, 'ERROR: [example] {message} (caused by {cause})'],
		// yt-dlp puts the cause before the bug-report request.
		[{kind: 'raise', template: 'Something broke', flags: {expected: 'absent', cause: true}}, 'ERROR: [example] Something broke (caused by {cause}){bugReport}'],
		[{kind: 'report', call: 'report_error', file: 'yt_dlp/YoutubeDL.py', extractor: null, template: 'no suitable formats', flags: {}}, 'ERROR: no suitable formats']
	] as const)('printed: %o', (site, printed) => {
		expect(label(site as Partial<RawSite>).message.printed).toBe(printed)
	})

	it('ids ignore line numbers, and tell apart sites that would otherwise collide', () => {
		const a = labelSites([raw({line: 10}), raw({line: 20})], []).sites
		const b = labelSites([raw({line: 30}), raw({line: 40})], []).sites
		expect(a.map(site => site.id)).toEqual(b.map(site => site.id))
		expect(new Set(a.map(site => site.id)).size).toBe(2)
		expect(a[0].id).toMatch(/^[0-9a-f]{12}$/)
	})
})

// The catalogue's "account helps" against the app's own sign-in escalation, for
// one site per rule: `yes` means the probe tries the account, `no` that it never
// does. (`maybe` promises neither.) A change to either side that breaks the
// pairing fails here.
describe('parity with the app’s sign-in escalation', () => {
	const cases: Partial<RawSite>[] = [
		...(['default', 'any', 'cookies', 'session_cookies', 'password', 'dynamic'] as const).map(loginMethod => ({kind: 'helper' as const, call: 'raise_login_required', template: 'This video is only available for registered users', shape: 'default' as const, flags: {loginMethod}})),
		{kind: 'helper', call: 'raise_login_required', template: 'Members only', flags: {loginMethod: 'cookies'}},
		{kind: 'helper', call: 'raise_geo_restricted', template: 'This video is not available from your location due to geo restriction', shape: 'default', flags: {}},
		{kind: 'helper', call: 'report_drm', template: 'This video is DRM protected', shape: 'default', flags: {}},
		{kind: 'raise', call: 'UserNotLive', template: 'The channel is not currently live', shape: 'default', flags: {}},
		{kind: 'raise', call: 'TransportError', template: 'Connection reset', flags: {}},
		{template: 'Sign in to confirm you’re not a bot'},
		{template: 'Sign in to confirm your age'},
		{template: 'HTTP Error 429: Too Many Requests'},
		{kind: 'raise', call: 'PostProcessingError', template: 'audio conversion failed: {err.msg}', flags: {}},
		...(['yt_dlp/extractor/facebook.py', 'yt_dlp/extractor/youtube/_video.py'] as const).flatMap(file => [
			{file, kind: 'regex' as const, call: '_search_regex', template: 'title', flags: {fatal: 'yes' as const}},
			{file, template: 'Could not find player data', flags: {expected: 'absent' as const}},
			{file, template: 'Cannot parse data', flags: {expected: 'absent' as const}},
			{file, template: 'This video is private', flags: {expected: 'absent' as const}},
			{file, template: 'Join this channel to get access to members-only content', flags: {expected: 'absent' as const}},
			{file, kind: 'helper' as const, call: 'raise_no_formats', template: 'No video formats found', flags: {expected: 'absent' as const}}
		])
	]

	it.each(cases)('%o', site => {
		const labelled = label(site)
		const raw = fill(labelled.message.printed, labelled.call.loginMethod)
		const url = labelled.at.file.startsWith('yt_dlp/extractor/youtube/') ? 'https://www.youtube.com/watch?v=aaaaaaaaaaa' : 'https://example.org/video'
		const tried = escalationReason({stage: 'probe', url, error: {kind: 'ytdlp', error: {kind: classifyYtDlpStderr(raw).kind, raw}}}) !== null
		if (labelled.label.accountHelps === 'yes') expect(tried, raw).toBe(true)
		if (labelled.label.accountHelps === 'no') expect(tried, raw).toBe(false)
		expect(labelled.label.accountHelps, raw).not.toBeNull()
	})
})
