// Builds the yt-dlp message catalogue for one yt-dlp commit: extract every
// message site, label it, and write the catalogue (one site per line) and its
// coverage report, compared with the previous catalogue when there is one.
//
//   bun run ytdlp:catalogue --src <yt-dlp checkout> --commit <sha> --version <tag>
//     --channel nightly|stable [--manifest-generated-at <iso>] [--previous <catalogue.json>]
//     --out-dir <dir>
//
// Writes <dir>/ytdlp-catalogue.json and <dir>/coverage/<version>.md.

import {createHash} from 'node:crypto'
import {existsSync} from 'node:fs'
import {mkdir, readFile, writeFile} from 'node:fs/promises'
import path from 'node:path'
import {parseArgs} from 'node:util'
import {type Catalogue, catalogueSchema, overridesSchema, serializeCatalogue} from './catalogue.js'
import {coverageReport} from './coverage.js'
import {extractSites} from './extract.js'
import {labelSites} from './label.js'

const HERE = import.meta.dirname
const ROOT = path.resolve(HERE, '../..')
const OVERRIDES = path.join(HERE, 'overrides.json')
// The files whose change alone re-labels the same sites: the rules, the
// overrides, the patterns the text rule classifies with, and the app's sign-in
// escalation the account rule asks.
export const RULE_FILES = [
	path.join(HERE, 'label.ts'),
	path.join(HERE, 'catalogue.ts'),
	OVERRIDES,
	...['patterns.ts', 'classifier.ts', 'kinds.ts'].map(file => path.join(ROOT, 'packages/ytdlp-errors/src', file)),
	path.join(ROOT, 'src/main/services/exploreEscalation.ts'),
	path.join(ROOT, 'src/shared/ytdlp/loginHint.ts')
]

export interface BuildOptions {
	src: string
	ytDlp: Catalogue['ytDlp']
	previous: Catalogue | null
}

export interface Built {
	catalogue: Catalogue
	report: string
	parseFailures: {file: string; error: string}[]
}

export async function buildCatalogue({src, ytDlp, previous}: BuildOptions): Promise<Built> {
	if (!/^[\w.-]+$/.test(ytDlp.version) || ytDlp.version.startsWith('.')) throw new Error(`yt-dlp version "${ytDlp.version}" cannot name a coverage file`)
	const overrides = overridesSchema.parse(JSON.parse(await readFile(OVERRIDES, 'utf8')))
	const extracted = await extractSites(src)
	const {sites, overrideHits, disagreements} = labelSites(extracted.sites, overrides)
	const catalogue = catalogueSchema.parse({schemaVersion: 1, ytDlp, generator: {extractVersion: 1, rulesHash: await rulesHash()}, sites})
	return {catalogue, report: coverageReport({catalogue, previous, overrideHits, disagreements, parseFailures: extracted.parseFailures}), parseFailures: extracted.parseFailures}
}

export async function writeCatalogue(outDir: string, {catalogue, report}: Built): Promise<void> {
	await mkdir(path.join(outDir, 'coverage'), {recursive: true})
	await writeFile(path.join(outDir, 'ytdlp-catalogue.json'), serializeCatalogue(catalogue))
	await writeFile(path.join(outDir, 'coverage', `${catalogue.ytDlp.version}.md`), report)
}

async function rulesHash(): Promise<string> {
	const hash = createHash('sha256')
	for (const file of RULE_FILES) hash.update(await readFile(file))
	return hash.digest('hex').slice(0, 12)
}

// No --previous is a first run; a --previous that does not exist is a mistake.
export async function readPrevious(file: string | undefined): Promise<Catalogue | null> {
	if (file === undefined) return null
	if (!existsSync(file)) throw new Error(`previous catalogue ${file} does not exist`)
	return catalogueSchema.parse(JSON.parse(await readFile(file, 'utf8')))
}

async function main(): Promise<void> {
	const {values} = parseArgs({options: {src: {type: 'string'}, commit: {type: 'string'}, version: {type: 'string'}, channel: {type: 'string'}, 'manifest-generated-at': {type: 'string'}, previous: {type: 'string'}, 'out-dir': {type: 'string'}}})
	const {src, commit, version, channel} = values
	const outDir = values['out-dir']
	if (!src || !commit || !version || !channel || !outDir) throw new Error('usage: bun run ytdlp:catalogue --src <checkout> --commit <sha> --version <tag> --channel nightly|stable [--manifest-generated-at <iso>] [--previous <catalogue.json>] --out-dir <dir>')
	const ytDlp = catalogueSchema.shape.ytDlp.parse({commit, version, channel, manifestGeneratedAt: values['manifest-generated-at'] ?? null})
	const built = await buildCatalogue({src: path.resolve(src), ytDlp, previous: await readPrevious(values.previous)})
	await writeCatalogue(outDir, built)
	const failures = built.parseFailures.length ? `; ${built.parseFailures.length} files did not parse (${built.parseFailures.map(failure => failure.file).join(', ')}), their sites are missing` : ''
	console.error(`${built.catalogue.sites.length} sites for yt-dlp ${version}${failures}; coverage in ${path.join(outDir, 'coverage', `${version}.md`)}`)
}

if (import.meta.main) await main()
