// The catalogue build (scripts/ytdlp-catalogue/build.ts) end to end over the
// miniature yt-dlp tree: extract, label, write the catalogue one site per line
// and its coverage report, and compare with the previous catalogue.

import {mkdtemp, readFile, rm} from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {afterAll, describe, expect, it} from 'vite-plus/test'
import {buildCatalogue, readPrevious, GENERATOR_FILES, writeCatalogue} from '../../scripts/ytdlp-catalogue/build.js'
import {catalogueSchema} from '../../scripts/ytdlp-catalogue/catalogue.js'
import {findPython} from '../../scripts/selection-parity/python.js'

const TREE = path.resolve(import.meta.dirname, '../fixtures/ytdlp-catalogue/tree')
const YT_DLP = {commit: 'b'.repeat(40), version: '2026.10.21.233146', channel: 'nightly', manifestGeneratedAt: '2026-10-22T13:00:31.439Z'} as const

// Without Python 3.10+ the suite skips locally, as the parity checks do; CI has it.
const python = await findPython()

describe.skipIf(python === null && !process.env.CI)('ytdlp-catalogue build', async () => {
	const out = await mkdtemp(path.join(os.tmpdir(), 'ytdlp-catalogue-'))
	afterAll(() => rm(out, {recursive: true, force: true}))
	const first = python === null ? null : await buildCatalogue({src: TREE, ytDlp: YT_DLP, previous: null})
	if (first) await writeCatalogue(out, first)

	it('writes a catalogue that reads back through its schema, one site per line', async () => {
		const text = await readFile(path.join(out, 'ytdlp-catalogue.json'), 'utf8')
		const parsed = catalogueSchema.parse(JSON.parse(text))
		expect(parsed.ytDlp).toEqual(YT_DLP)
		expect(parsed.sites.length).toBeGreaterThan(50)
		expect(text.split('\n').filter(line => line.startsWith('{"id":'))).toHaveLength(parsed.sites.length)
		expect(parsed.generator.hash).toMatch(/^[0-9a-f]{12}$/)
	})

	it('labels the fixture sites by their rules', () => {
		const byScope = (scope: string) => first!.catalogue.sites.find(site => site.at.scope === scope)!
		expect(byScope('ExampleIE.login_password').label).toMatchObject({failureKind: 'loginRequired', accountHelps: 'no'})
		// The app never tries the account on it: the text is not "Unable to extract".
		expect(byScope('ExampleIE.bug_report').label).toMatchObject({failureKind: 'siteChanged', accountHelps: 'no'})
		expect(byScope('ExampleIE.geo_default').label.failureKind).toBe('geoBlocked')
	})

	it('writes the coverage report under the version, naming the file that did not parse', async () => {
		const report = await readFile(path.join(out, 'coverage', '2026.10.21.233146.md'), 'utf8')
		expect(report).toContain('# yt-dlp message catalogue: 2026.10.21.233146')
		expect(report).toContain('yt_dlp/extractor/broken.py')
		expect(report).toContain('No previous catalogue')
	})

	it('compares with the previous catalogue', async () => {
		const previous = catalogueSchema.parse(JSON.parse(await readFile(path.join(out, 'ytdlp-catalogue.json'), 'utf8')))
		const second = await buildCatalogue({src: TREE, ytDlp: {...YT_DLP, version: '2026.10.22.000000'}, previous})
		expect(second.report).toContain('## Changes since 2026.10.21.233146')
		expect(second.report).toContain('0 new, 0 changed, 0 removed; 0 relabelled')
	})

	it('a --previous path that does not exist is an error, not a first run', async () => {
		await expect(readPrevious(path.join(out, 'missing.json'))).rejects.toThrow(/missing\.json/)
		expect(await readPrevious(undefined)).toBeNull()
	})

	it('the generator hash covers the extractor, the labels, the report, the classifier and the app escalation', () => {
		expect(
			GENERATOR_FILES.map(file =>
				path
					.relative(path.resolve(import.meta.dirname, '../..'), file)
					.split(path.sep)
					.join('/')
			)
		).toEqual(
			expect.arrayContaining([
				'scripts/ytdlp-catalogue/extract.py',
				'scripts/ytdlp-catalogue/extract.ts',
				'scripts/ytdlp-catalogue/coverage.ts',
				'scripts/ytdlp-catalogue/label.ts',
				'scripts/ytdlp-catalogue/overrides.json',
				'packages/ytdlp-errors/src/patterns.ts',
				'src/main/services/exploreEscalation.ts',
				'src/shared/ytdlp/loginHint.ts'
			])
		)
	})

	it('refuses a version that cannot name a file', async () => {
		await expect(buildCatalogue({src: TREE, ytDlp: {...YT_DLP, version: '../x'}, previous: null})).rejects.toThrow(/version/)
	})
})
