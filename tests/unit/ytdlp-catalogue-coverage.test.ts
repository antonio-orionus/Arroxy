// The coverage report written beside each catalogue (scripts/ytdlp-catalogue/
// coverage.ts): how much is labelled, what changed since the previous pin, which
// error sites still need a label, and where the rules drift.

import {describe, expect, it} from 'vite-plus/test'
import type {Catalogue, Override} from '../../scripts/ytdlp-catalogue/catalogue.js'
import {coverageReport} from '../../scripts/ytdlp-catalogue/coverage.js'
import type {RawSite} from '../../scripts/ytdlp-catalogue/extract.js'
import {labelSites} from '../../scripts/ytdlp-catalogue/label.js'

function raw(site: Partial<RawSite>): RawSite {
	return {file: 'yt_dlp/extractor/example.py', line: 10, scope: 'ExampleIE._real_extract', extractor: 'example', call: 'ExtractorError', kind: 'raise', template: 'Something broke', shape: 'literal', relays: null, flags: {expected: 'yes'}, ...site}
}

const COMMIT = 'a'.repeat(40)

function catalogue(sites: RawSite[], overrides: Override[] = [], version = '2026.10.21.233146') {
	const labelled = labelSites(sites, overrides)
	const built: Catalogue = {schemaVersion: 1, ytDlp: {commit: COMMIT, version, channel: 'nightly', manifestGeneratedAt: null}, generator: {extractVersion: 1, hash: '0123456789ab'}, sites: labelled.sites}
	return {catalogue: built, overrideHits: labelled.overrideHits, disagreements: labelled.disagreements}
}

const SITES = [
	raw({line: 1, template: 'Something broke'}),
	raw({line: 2, template: 'Something else broke', scope: 'ExampleIE._other'}),
	raw({line: 3, kind: 'helper', call: 'raise_login_required', template: 'Members only', flags: {loginMethod: 'default'}}),
	raw({line: 4, file: 'yt_dlp/YoutubeDL.py', extractor: null, scope: 'YoutubeDL.process', kind: 'report', call: 'report_error', template: 'Requested format is not available', flags: {}}),
	raw({line: 5, kind: 'report', call: 'report_warning', template: '{self.IE_NAME} said: {error}', shape: 'relay', relays: 'error', flags: {}}),
	raw({line: 6, kind: 'status', call: 'to_screen', template: 'Downloading player', flags: {}}),
	raw({line: 7, kind: 'download', call: '_download_json', template: 'Unable to download JSON metadata', shape: 'default', flags: {fatal: 'yes'}}),
	raw({line: 8, file: 'yt_dlp/extractor/other.py', extractor: 'other', scope: 'OtherIE._real_extract', template: 'Something broke'})
]

describe('coverage report', () => {
	const current = catalogue(SITES, [{name: 'stale', match: {template: '^Gone$'}, label: {failureKind: 'unavailable'}, note: 'test'}])
	const report = coverageReport({...current, previous: null, parseFailures: []})

	it('names the pin it covers', () => {
		expect(report).toContain('# yt-dlp message catalogue: 2026.10.21.233146')
		expect(report).toContain(`\`${COMMIT}\``)
	})

	it('counts sites by kind and by category', () => {
		expect(report).toMatch(/\| raise \| 3 \|/)
		expect(report).toMatch(/\| error \| 6 \|/)
		expect(report).toMatch(/\| status \| 1 \|/)
	})

	it('reports the labelled share per field, overall and for core and YouTube', () => {
		// Six error sites: login, the format error and the download are labelled or decided at run time.
		expect(report).toMatch(/\| failureKind \| 2 \/ 6 .*\| 1 \/ 6 .*\| 3 \/ 6/)
		expect(report).toContain('Core and YouTube')
	})

	it('counts relays', () => {
		expect(report).toContain('1 site may show site text')
	})

	it('counts the core and YouTube column from core files only', () => {
		// The one core error site (YoutubeDL.py) is labelled.
		expect(report).toMatch(/\| failureKind \| [^|]+\|[^|]+\|[^|]+\| 1 \/ 1 \(100%\) \| 0 \/ 1 \| 0 \/ 1 \|/)
	})

	it('puts a core site ahead of a bigger group outside core', () => {
		const withCore = catalogue([...SITES, raw({line: 11, file: 'yt_dlp/extractor/youtube/_video.py', extractor: 'youtube', scope: 'YoutubeIE._real_extract', template: 'A lonely core failure'})])
		const section = coverageReport({...withCore, previous: null, parseFailures: []}).split('## Unlabelled error sites')[1]
		expect(section.indexOf('A lonely core failure')).toBeLessThan(section.indexOf('Something broke'))
	})

	it('a kind an override deliberately cleared is decided, in the table and the list alike', () => {
		const cleared = catalogue(SITES, [{name: 'cleared', match: {template: '^Something broke$'}, label: {failureKind: null}, note: 'test'}])
		const text = coverageReport({...cleared, previous: null, parseFailures: []})
		expect(text).toMatch(/\| failureKind \| 4 \/ 6 .*\| 1 \/ 6 .*\| 1 \/ 6/)
		expect(text).toContain('1 error sites have no kind')
	})

	it('ranks unlabelled error sites, core first, then by how many share the template', () => {
		const section = report.slice(report.indexOf('## Unlabelled error sites'))
		expect(section.indexOf('Something broke')).toBeLessThan(section.indexOf('Something else broke'))
		expect(section).toMatch(/Something broke.*\| 2 \|/)
	})

	it('lists drift: overrides that matched nothing, and text against call', () => {
		expect(report).toContain('`stale`')
		const disagreeing = catalogue([raw({kind: 'helper', call: 'raise_geo_restricted', template: 'Sign in to confirm you’re not a bot', flags: {}})])
		expect(coverageReport({...disagreeing, previous: null, parseFailures: []})).toMatch(/geoBlocked.*botBlock/)
	})

	it('says when there is no previous catalogue to compare with', () => {
		expect(report).toContain('No previous catalogue')
	})
})

describe('changes since the previous pin', () => {
	it('pairs a reworded site in the same scope as changed, not removed and added', () => {
		const before = catalogue(SITES, [], '2026.10.20.000000').catalogue
		const next = SITES.map(site => (site.template === 'Something else broke' ? {...site, template: 'Something else went wrong'} : site))
		next.push(raw({line: 9, scope: 'ExampleIE._new', template: 'Brand new failure'}))
		const report = coverageReport({...catalogue(next.filter(site => site.call !== 'to_screen')), previous: before, parseFailures: []})
		const section = report.slice(report.indexOf('## Changes since 2026.10.20.000000'))
		expect(section).toMatch(/1 new, 1 changed, 1 removed/)
		expect(section).toContain('Something else broke')
		expect(section).toContain('Something else went wrong')
		expect(section).toContain('Brand new failure')
		expect(section).toContain('Downloading player')
	})

	it('counts a site whose printed form changed under the same id as changed', () => {
		const before = catalogue(SITES, [], '2026.10.20.000000').catalogue
		const next = SITES.map(site => (site.line === 1 ? {...site, flags: {...site.flags, cause: true as const}} : site))
		const section = coverageReport({...catalogue(next), previous: before, parseFailures: []}).split('## Changes since')[1]
		expect(section).toMatch(/0 new, 1 changed, 0 removed/)
		expect(section).toContain('(caused by {cause})')
	})

	it('does not count the sites of a file that failed to parse as removed', () => {
		const before = catalogue(SITES, [], '2026.10.20.000000').catalogue
		const report = coverageReport({...catalogue(SITES.filter(site => site.file !== 'yt_dlp/extractor/other.py')), previous: before, parseFailures: [{file: 'yt_dlp/extractor/other.py', error: 'SyntaxError'}]})
		expect(report).toMatch(/0 new, 0 changed, 0 removed/)
		expect(report).toContain('1 site in files that did not parse')
	})

	it('counts sites whose label changed under the same id', () => {
		const before = catalogue(SITES, [], '2026.10.20.000000').catalogue
		const relabelled = catalogue(SITES, [{name: 'broke', match: {template: '^Something broke$'}, label: {failureKind: 'unavailable'}, note: 'test'}])
		expect(coverageReport({...relabelled, previous: before, parseFailures: []})).toContain('2 relabelled')
	})
})
