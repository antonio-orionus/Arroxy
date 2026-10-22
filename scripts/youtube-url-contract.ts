// Regenerates the YouTube URL contract snapshot: what a yt-dlp release knows
// about YouTube links (the URLs in its extractors' test cases and the extractor
// each goes to, every shape a video can be shared in with a list, and the list
// ids it accepts). tests/unit/youtube-url-contract.test.ts holds Arroxy's own
// reading of links (cleanUrl, classifyUrlIntent, the list kinds) to it, so a
// yt-dlp release that changes how it reads a YouTube link fails a test instead
// of shipping a button that downloads the wrong thing.
//
//   bun run youtube:url-contract                 # the release the snapshot records
//   bun run youtube:url-contract --version latest
//   bun run youtube:url-contract --version 2026.08.19
//
// The release's zipapp is fetched once, checked against the SHA2-256SUMS yt-dlp
// publishes with it, and run in-process by scripts/youtube-url-contract/extract.py
// (Python 3.10+, found as the parity checks find it). Nothing else is downloaded.

import {execFile} from 'node:child_process'
import {createHash} from 'node:crypto'
import {existsSync, readFileSync} from 'node:fs'
import {mkdir, rename, writeFile} from 'node:fs/promises'
import path from 'node:path'
import {parseArgs, promisify} from 'node:util'
import {z} from 'zod'
import {findPython, PYTHON_REQUIREMENT} from './selection-parity/python.js'

const ROOT = path.resolve(import.meta.dirname, '..')
const SNAPSHOT = path.join(ROOT, 'tests/fixtures/youtube-url-contract/yt-dlp.json')
const CACHE_DIR = path.join(ROOT, 'node_modules/.cache/arroxy-youtube-url-contract')
const EXTRACT = path.join(ROOT, 'scripts/youtube-url-contract/extract.py')
const RELEASES = 'https://github.com/yt-dlp/yt-dlp/releases'
const run = promisify(execFile)

const claimSchema = z.strictObject({url: z.string(), extractor: z.string().nullable()})
const extractSchema = z.strictObject({urls: z.array(claimSchema), shapes: z.array(claimSchema), listIds: z.strictObject({pattern: z.string(), prefixes: z.array(z.string()), exact: z.array(z.string())})})

function sha256(bytes: Uint8Array): string {
	return createHash('sha256').update(bytes).digest('hex')
}

async function fetchBytes(url: string): Promise<Uint8Array> {
	const response = await fetch(url)
	if (!response.ok) throw new Error(`could not fetch ${url}: HTTP ${response.status}`)
	return new Uint8Array(await response.arrayBuffer())
}

// `latest` follows the release page's redirect to the newest stable tag.
async function resolveVersion(requested: string | undefined): Promise<string> {
	if (requested && requested !== 'latest') return requested
	if (!requested && existsSync(SNAPSHOT)) {
		const recorded: unknown = JSON.parse(readFileSync(SNAPSHOT, 'utf8'))
		const version = z.object({ytDlp: z.object({version: z.string()})}).parse(recorded).ytDlp.version
		return version
	}
	const response = await fetch(`${RELEASES}/latest`, {redirect: 'manual'})
	const location = response.headers.get('location') ?? ''
	const tag = /\/releases\/tag\/([^/]+)$/.exec(location)?.[1]
	if (!tag) throw new Error(`could not resolve the latest yt-dlp release (got ${response.status} ${location})`)
	return tag
}

async function zipapp(version: string): Promise<{file: string; sha256: string}> {
	const sums = new TextDecoder().decode(await fetchBytes(`${RELEASES}/download/${version}/SHA2-256SUMS`))
	const expected = /^([0-9a-f]{64}) {2}yt-dlp$/m.exec(sums)?.[1]
	if (!expected) throw new Error(`yt-dlp ${version} publishes no checksum for its zipapp`)
	const file = path.join(CACHE_DIR, `yt-dlp-${version}.zip`)
	if (existsSync(file) && sha256(readFileSync(file)) === expected) return {file, sha256: expected}
	const bytes = await fetchBytes(`${RELEASES}/download/${version}/yt-dlp`)
	const actual = sha256(bytes)
	if (actual !== expected) throw new Error(`yt-dlp ${version} has SHA-256 ${actual}, expected ${expected}`)
	await mkdir(CACHE_DIR, {recursive: true})
	await writeFile(`${file}.partial`, bytes)
	await rename(`${file}.partial`, file)
	return {file, sha256: expected}
}

const {values} = parseArgs({options: {version: {type: 'string'}}})
const version = await resolveVersion(values.version)
const python = await findPython()
if (!python) throw new Error(`the YouTube URL contract needs ${PYTHON_REQUIREMENT}`)
const ytDlp = await zipapp(version)
const {stdout} = await run(python.command, [...python.args, EXTRACT, ytDlp.file], {maxBuffer: 64 * 1024 * 1024})
const extracted = extractSchema.parse(JSON.parse(stdout))
await mkdir(path.dirname(SNAPSHOT), {recursive: true})
await writeFile(SNAPSHOT, `${JSON.stringify({ytDlp: {version, sha256: ytDlp.sha256}, ...extracted}, null, '\t')}\n`)
console.log(`YouTube URL contract: yt-dlp ${version}, ${extracted.urls.length} test URLs, ${extracted.shapes.length} shapes, ${extracted.listIds.prefixes.length + extracted.listIds.exact.length} list ids -> ${path.relative(ROOT, SNAPSHOT)}`)
