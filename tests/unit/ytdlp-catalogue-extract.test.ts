// The yt-dlp message catalogue's extractor (scripts/ytdlp-catalogue/extract.py)
// against a miniature yt-dlp tree: one fixture case per site kind, message shape
// and flag the label rules read. Each fixture method holds one case, so a site is
// found by its scope.

import path from 'node:path'
import {describe, expect, it} from 'vite-plus/test'
import {extractSites, type RawSite} from '../../scripts/ytdlp-catalogue/extract.js'
import {findPython} from '../../scripts/selection-parity/python.js'

const TREE = path.resolve(import.meta.dirname, '../fixtures/ytdlp-catalogue/tree')

// Without Python 3.10+ the suite skips locally, as the parity checks do; CI has it.
const python = await findPython()

describe.skipIf(python === null && !process.env.CI)('ytdlp-catalogue extract.py', async () => {
	const result = python === null ? null : await extractSites(TREE)
	const sites = result?.sites ?? []

	function at(scope: string, call?: string): RawSite[] {
		return sites.filter(site => site.scope === scope && (call === undefined || site.call === call))
	}

	function one(scope: string, call?: string): RawSite {
		const found = at(scope, call)
		expect(found, `${scope}${call ? ` ${call}` : ''}: ${JSON.stringify(found)}`).toHaveLength(1)
		return found[0]
	}

	it('reads every file and reports the one that does not parse', () => {
		expect(result?.files).toBe(9)
		expect(result?.parseFailures.map(failure => failure.file)).toEqual(['yt_dlp/extractor/broken.py'])
	})

	it.each([
		['a folder without a yt_dlp package', path.dirname(TREE)],
		['the yt_dlp package itself instead of the checkout', path.join(TREE, 'yt_dlp')]
	])('refuses %s instead of listing no sites', async (_, src) => {
		await expect(extractSites(src)).rejects.toThrow(/yt_dlp/)
	})

	it('resolves a class name in its own module first', () => {
		expect(at('connect')).toEqual([])
		expect(one('proxy')).toMatchObject({kind: 'raise', call: 'ProxyError', template: 'Proxy refused the connection'})
	})

	it('records where a site is and which extractor owns it', () => {
		expect(one('ExampleIE.literal')).toMatchObject({file: 'yt_dlp/extractor/example.py', line: 11, extractor: 'example:site'})
		expect(one('OtherIE.plain').extractor).toBe('Other')
		expect(one('module_helper').extractor).toBeNull()
		expect(one('InfoExtractor._search_regex', 'RegexNotFoundError').extractor).toBeNull()
	})

	it('lists sites in file and line order', () => {
		const keys = sites.map(site => `${site.file}:${String(site.line).padStart(6, '0')}`)
		expect(keys).toEqual([...keys].sort())
	})

	describe('message shapes', () => {
		it.each([
			['ExampleIE.literal', 'This video has been removed', 'literal'],
			['ExampleIE.fstring', 'Video {video_id} is private', 'template'],
			['ExampleIE.percent', 'Video {video_id} is {kind}', 'template'],
			['ExampleIE.format_call', 'Video {video_id} not found', 'template'],
			['ExampleIE.concatenated', 'Premium only: {video_id}', 'template'],
			['ExampleIE.local_literal', 'Sold out', 'literal'],
			// Non-ASCII text survives the pipe on every platform, Windows' legacy code page included.
			['ExampleIE.non_ascii', '您所在区域暂无此内容版权 – Sign in to confirm you’re not a bot', 'literal']
		])('%s → %s', (scope, template, shape) => {
			expect(one(scope)).toMatchObject({kind: 'raise', call: 'ExtractorError', template, shape, relays: null})
		})

		it('a message that resolves to nothing known is dynamic, with no template', () => {
			expect(one('ExampleIE.not_resolvable')).toMatchObject({template: null, shape: 'dynamic'})
			expect(one('FFmpegPostProcessor.run')).toMatchObject({call: 'PostProcessingError', template: null, shape: 'dynamic', relays: null})
		})

		it('a call without its message takes the callee default from the source', () => {
			expect(one('ExampleIE.unsupported')).toMatchObject({kind: 'raise', call: 'UnsupportedError', template: 'Unsupported URL: {url}', shape: 'default'})
			expect(one('ExampleIE.not_live')).toMatchObject({call: 'UserNotLive', template: 'The channel is not currently live', shape: 'default'})
			expect(one('YoutubeDL.process', 'ExistingVideoReached')).toMatchObject({template: 'The download was cancelled', shape: 'default'})
			expect(one('ExampleIE.drm')).toMatchObject({kind: 'helper', call: 'report_drm', template: 'This video is DRM protected', shape: 'default'})
			// Built in a local, passed by keyword, with an optional suffix appended by +=.
			expect(one('fail')).toMatchObject({call: 'HTTPError', template: "HTTP Error {response.status}: {response.reason}{' (redirect loop detected)'}", shape: 'default'})
		})

		it('a message or flag passed through *args or **kwargs is unknown, not the default', () => {
			expect(one('ExampleIE.kwargs_forward')).toMatchObject({kind: 'download', template: null, shape: 'dynamic', flags: {fatal: 'dynamic'}})
			expect(one('ExampleIE.starred_raise')).toMatchObject({template: null, shape: 'dynamic'})
		})
	})

	describe('flags', () => {
		it('expected: literal, absent or dynamic', () => {
			expect(one('ExampleIE.literal').flags.expected).toBe('yes')
			expect(one('ExampleIE.bug_report').flags.expected).toBe('absent')
			expect(one('ExampleIE.dynamic_expected').flags.expected).toBe('dynamic')
		})

		it('cause and an HTTP error check around the site', () => {
			expect(one('ExampleIE.with_cause', 'ExtractorError').flags).toMatchObject({cause: true, onHttpError: true})
			expect(one('ExampleIE.literal').flags.cause).toBeUndefined()
			expect(one('ExampleIE.literal').flags.onHttpError).toBeUndefined()
		})

		it('an HTTP error check counts only on its own branch', () => {
			const branches = Object.fromEntries(at('ExampleIE.http_else', 'ExtractorError').map(site => [site.template, site.flags.onHttpError]))
			expect(branches).toEqual({'The HTTP side': true, 'The other side': undefined})
			expect(one('ExampleIE.http_negated', 'ExtractorError').flags.onHttpError).toBeUndefined()
		})

		it('an elif after `if ... or not <HTTP check>: raise` runs only on an HTTP error', () => {
			expect(one('ExampleIE.http_compound', 'ExtractorError').flags.onHttpError).toBe(true)
		})

		it('an `or` of HTTP checks still implies an HTTP error', () => {
			expect(one('ExampleIE.http_either').flags.onHttpError).toBe(true)
		})

		it('a call short-circuited behind an HTTP check in the test itself', () => {
			const inTest = at('ExampleIE.http_short_circuit').find(site => site.template === 'Unable to read the error')
			expect(inTest?.flags.onHttpError).toBe(true)
		})

		it('a login method passed through **kwargs is unknown', () => {
			expect(one('ExampleIE.login_kwargs').flags.loginMethod).toBe('dynamic')
		})

		it.each([
			['ExampleIE.login_default', 'default', 'This video is only available for registered users', 'default'],
			['ExampleIE.login_password', 'password', 'This video is only available for registered users', 'default'],
			['ExampleIE.login_cookies', 'cookies', 'Members only', 'literal'],
			['ExampleIE.login_dynamic', 'dynamic', 'This video is only available for registered users', 'default']
		])('raise_login_required in %s reads method %s', (scope, loginMethod, template, shape) => {
			expect(one(scope)).toMatchObject({kind: 'helper', call: 'raise_login_required', template, shape, flags: {loginMethod}})
		})

		it('metadata_available', () => {
			expect(one('ExampleIE.login_metadata').flags.metadataAvailable).toBe('yes')
			expect(one('ExampleIE.login_default').flags.metadataAvailable).toBeUndefined()
		})
	})

	describe('site kinds', () => {
		it('geo restriction, by helper and by class', () => {
			expect(one('ExampleIE.geo_default')).toMatchObject({kind: 'helper', call: 'raise_geo_restricted', template: 'This video is not available from your location due to geo restriction', shape: 'default'})
			expect(one('ExampleIE.geo_class')).toMatchObject({kind: 'raise', call: 'GeoRestrictedError', template: 'Only in Germany'})
		})

		it('raise_no_formats', () => {
			expect(one('ExampleIE.no_formats')).toMatchObject({kind: 'helper', template: 'No video formats found', flags: {expected: 'yes'}})
		})

		it.each([
			['ExampleIE.warning', 'report', 'report_warning', 'Falling back to the mobile API'],
			['ExampleIE.deprecation', 'report', 'deprecation_warning', '--old-option is deprecated'],
			['ExampleIE.status', 'status', 'to_screen', '{video_id}: Downloading the archive'],
			['ExampleIE.debug', 'status', 'write_debug', 'Using the TV client']
		])('%s is a %s site', (scope, kind, call, template) => {
			expect(one(scope)).toMatchObject({kind, call, template})
		})

		it('core sites outside the extractors', () => {
			expect(one('YoutubeDL.process', 'report_error')).toMatchObject({kind: 'report', template: 'no suitable formats'})
			expect(one('YoutubeDL.process', 'DownloadError')).toMatchObject({kind: 'raise', template: 'Requested format is not available'})
		})

		it('a bare name matches only a module-level class; self.X also matches a nested one', () => {
			expect(at('YoutubeDL.builtin')).toEqual([])
			expect(one('JSInterpreter.interpret')).toMatchObject({kind: 'raise', call: 'Exception', template: 'Unsupported JS expression {expr}'})
		})

		it('the helpers own messages are sites of their own', () => {
			expect(one('InfoExtractor._search_regex', 'RegexNotFoundError')).toMatchObject({kind: 'raise', template: 'Unable to extract {_name}'})
		})
	})

	describe('regex helpers', () => {
		it('a fatal search records the field name, with fatal from the signature', () => {
			expect(one('ExampleIE.regex_fatal')).toMatchObject({kind: 'regex', call: '_search_regex', template: 'title', shape: 'literal', flags: {fatal: 'yes'}})
		})

		it('fatal=False is a warning site', () => {
			expect(one('ExampleIE.regex_not_fatal').flags.fatal).toBe('no')
		})

		it('a search with a default never prints, so it is no site', () => {
			expect(at('ExampleIE.regex_with_default')).toEqual([])
		})

		it('a helper whose fatal defaults to False', () => {
			expect(one('ExampleIE.regex_meta')).toMatchObject({call: '_html_search_meta', template: 'description', flags: {fatal: 'no'}})
		})
	})

	describe('regex helpers with an unknown default', () => {
		it('a default that may be NO_DEFAULT, or may come through **kwargs, keeps the site', () => {
			expect(one('ExampleIE.regex_dynamic_default')).toMatchObject({template: 'meta refresh redirect', flags: {fatal: 'yes', hasDefault: 'dynamic'}})
			expect(one('ExampleIE.regex_kwargs')).toMatchObject({template: 'title', flags: {fatal: 'dynamic', hasDefault: 'dynamic'}})
			expect(one('ExampleIE.regex_fatal').flags.hasDefault).toBeUndefined()
		})
	})

	describe('download helpers', () => {
		it('no errnote: the signature default, fatal by default', () => {
			expect(one('ExampleIE.download_default')).toMatchObject({kind: 'download', call: '_download_json', template: 'Unable to download JSON metadata', shape: 'default', flags: {fatal: 'yes'}})
		})

		it('a method built by a factory in InfoExtractor is matched like a def', () => {
			expect(at('ExampleIE.download_default').map(site => site.call)).toEqual(['_download_json'])
		})

		it('a method that only passes *args and **kwargs on takes the signature it forwards to', () => {
			expect(one('ExampleIE.download_forwarded')).toMatchObject({kind: 'download', call: '_extract_m3u8_formats', template: null, shape: 'default', flags: {fatal: 'no'}})
		})

		it('positional note and errnote: a status site and a download site', () => {
			const kinds = Object.fromEntries(at('ExampleIE.download_errnote').map(site => [site.kind, site.template]))
			expect(kinds).toEqual({status: 'Downloading player', download: 'Unable to download player'})
		})

		it('note=False and errnote=False print nothing', () => {
			expect(at('ExampleIE.download_quiet')).toEqual([])
		})

		it('a default errnote set only in the body has no template', () => {
			expect(one('ExampleIE.download_not_fatal')).toMatchObject({call: '_request_webpage', template: null, shape: 'default', flags: {fatal: 'no'}})
		})
	})

	describe('relayed site text', () => {
		it.each([
			['RelayIE.whole_subscript', 'error.message'],
			['RelayIE.get_chain', 'error.reason'],
			['RelayIE.traverse_path', 'error.message'],
			['RelayIE.traverse_branches', 'errors.errorMessage'],
			['RelayIE.try_get_lambda', 'meta.msg'],
			['RelayIE.in_fstring', 'detail'],
			['RelayIE.via_local', 'playability.reason'],
			['RelayIE.via_two_locals', 'status.description'],
			['RelayIE.via_get_text', 'reason'],
			['RelayIE.via_get_first', 'subreason'],
			['RelayIE.warning_relay', 'notice'],
			['RelayIE.traverse_alternatives', 'title'],
			['RelayIE.dict_get_alternatives', 'message'],
			['RelayIE.list_index', 'errors.message'],
			['RelayIE.via_list_item', 'errors.message']
		])('%s relays %s', (scope, relays) => {
			expect(one(scope)).toMatchObject({shape: 'relay', relays})
		})

		it.each([
			['RelayIE.page_regex', 'page:error message'],
			['RelayIE.page_element', 'page:vp_video_stub_txt']
		])('%s relays text scraped from the page: %s', (scope, relays) => {
			expect(one(scope, 'ExtractorError')).toMatchObject({shape: 'relay', relays})
		})

		it('a page scrape of an id or a number is a hole, not a relay', () => {
			expect(one('RelayIE.page_regex_id_only', 'ExtractorError')).toMatchObject({shape: 'template', relays: null})
			expect(one('RelayIE.page_element_number')).toMatchObject({shape: 'template', relays: null})
		})

		it('keeps the template around a relay', () => {
			expect(one('RelayIE.in_fstring').template).toBe("The site said: {data['detail']}")
		})

		it('an id, a count or a code from the response is a hole, not a relay', () => {
			expect(one('RelayIE.id_only')).toMatchObject({shape: 'template', relays: null})
			expect(one('RelayIE.count_only')).toMatchObject({shape: 'template', relays: null})
			// The container is named `error`, but only its code is shown.
			expect(one('RelayIE.container_code')).toMatchObject({shape: 'template', relays: null})
			expect(one('RelayIE.get_chain_code')).toMatchObject({shape: 'template', relays: null})
		})

		it('a nested tuple in a traverse_obj path is a set of branches', () => {
			expect(one('RelayIE.branch_alternatives').relays).toBe('error')
			expect(one('RelayIE.identity_branch').relays).toBe('error')
		})

		it('the fallback of a read can supply the text', () => {
			expect(one('RelayIE.get_fallback').relays).toBe('message')
			expect(one('RelayIE.fallback_through_index').relays).toBe('message')
		})

		it('`relays` is a may: every append counts except one on the other branch of the site’s if', () => {
			expect(one('RelayIE.append_other_branch', 'ExtractorError')).toMatchObject({shape: 'literal', template: 'Login failed', relays: null})
			expect(one('RelayIE.append_other_branch', 'report_warning')).toMatchObject({shape: 'relay', relays: 'description'})
		})

		it('a template takes only appends that come before the site', () => {
			expect(one('RelayIE.append_after_site')).toMatchObject({shape: 'literal', template: 'Unable to login'})
			expect(one('RelayIE.append_after_copy')).toMatchObject({shape: 'literal', template: 'Unable to login'})
			expect(one('expire')).toMatchObject({call: 'LateSuffixError', template: 'Session expired', shape: 'default'})
			expect(one('branched')).toMatchObject({call: 'BranchedError', template: 'Login failed', shape: 'default'})
			expect(one('RelayIE.appends_in_order').template).toBe("Login failed{': first'}{': second'}")
			// A nested function's own `msg` is another variable.
			expect(one('RelayIE.nested_scope')).toMatchObject({shape: 'literal', template: 'Login failed'})
			// …unless it declares the name nonlocal; defaults run in the enclosing scope.
			expect(one('RelayIE.nonlocal_append', 'report_warning').relays).toBe('description')
			expect(one('RelayIE.default_in_enclosing_scope', 'report_warning').relays).toBe('message')
		})

		it('text appended with += is followed', () => {
			expect(one('RelayIE.appended')).toMatchObject({shape: 'relay', relays: 'description', template: "Unable to login{': ' + error['description']}"})
		})
	})
})
