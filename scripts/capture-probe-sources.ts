// Records real yt-dlp probes from different sites as fixtures for the Format
// screen: the source snapshot test and the browser mock's "Source:" scenarios
// replay them through the app's own format mapping, so a picker change can be
// checked against every kind of site without probing.
//
//   bun run probe-sources:capture                 # every source
//   bun run probe-sources:capture vk dailymotion  # just these
//
// yt-dlp runs the way the app runs it: the dev profile's own managed yt-dlp
// (newest in its runtime cache; YT_DLP overrides) with Electron as its
// JavaScript runtime. Sources marked `signIn` run signed in with the dev
// profile's Explore session (ARROXY_USER_DATA overrides the profile): its
// YouTube cookies (plus the player client the app uses for signed-in runs) or,
// for any other site, every cookie but Google's and YouTube's, go to a fresh
// jar per run, deleted afterwards. Each fixture keeps only the
// fields Arroxy reads (no stream URLs, headers, fragments or cookies).

import {execFile} from 'node:child_process'
import {createRequire} from 'node:module'
import {existsSync, readdirSync, statSync} from 'node:fs'
import {copyFile, mkdir, mkdtemp, rm, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import path from 'node:path'
import {promisify} from 'node:util'
import {PROBE_SOURCES, type ProbeSource} from '../src/renderer/src/dev/probeSources/sources.js'

const run = promisify(execFile)
const ROOT = path.resolve(import.meta.dirname, '..')
const OUT_DIR = path.join(ROOT, 'src/renderer/src/dev/probeSources')
const USER_DATA = process.env.ARROXY_USER_DATA ?? path.join(ROOT, '.electron-user-data/dev')
// Outside Electron, the electron package exports its binary's path.
const electronModule: unknown = createRequire(import.meta.url)('electron')
if (typeof electronModule !== 'string') throw new Error('the electron package did not resolve to its binary path')
const ELECTRON = electronModule
const SIGNED_IN_EXTRACTOR_ARGS = 'youtube:player_client=default,web_embedded'

function managedYtDlp(): string | null {
	const artifacts = path.join(USER_DATA, 'runtime-cache/artifact-cache-v1/artifacts')
	if (!existsSync(artifacts)) return null
	const binaries = readdirSync(artifacts)
		.map(dir => path.join(artifacts, dir, 'yt-dlp'))
		.filter(file => existsSync(file))
	return binaries.toSorted((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0] ?? null
}

const YT_DLP = process.env.YT_DLP ?? managedYtDlp() ?? 'yt-dlp'
const JS_RUNTIME_ARGS = ['--no-js-runtimes', '--js-runtimes', `node:${ELECTRON}`]
const CHILD_ENV = {...process.env, ELECTRON_RUN_AS_NODE: '1'}

type SignInScope = NonNullable<ProbeSource['signIn']>

// The dev profile's Explore cookies for one scope, exported once per capture into a private directory.
async function exportCookies(dir: string, scope: SignInScope): Promise<string> {
	const jar = path.join(dir, `explore-${scope}.txt`)
	const {stdout} = await run(ELECTRON, [path.join(ROOT, 'scripts/export-explore-cookies.cjs'), USER_DATA, jar, scope])
	if (scope === 'youtube' && !stdout.includes('signed in: true')) throw new Error('the dev profile is not signed in to YouTube in Explore')
	return jar
}

// yt-dlp writes cookies back into its jar, so each run gets its own copy.
async function signInArgs(source: ProbeSource, cookieJar: (scope: SignInScope) => Promise<string>, dir: string): Promise<string[]> {
	if (source.signIn === undefined) return []
	const jar = path.join(dir, `${source.id}.txt`)
	await copyFile(await cookieJar(source.signIn), jar)
	return ['--cookies', jar, ...(source.signIn === 'youtube' ? ['--extractor-args', SIGNED_IN_EXTRACTOR_ARGS] : [])]
}

const FORMAT_FIELDS = [
	'format_id',
	'ext',
	'resolution',
	'format_note',
	'width',
	'height',
	'fps',
	'tbr',
	'vbr',
	'abr',
	'asr',
	'audio_channels',
	'filesize',
	'filesize_approx',
	'vcodec',
	'acodec',
	'dynamic_range',
	'protocol',
	'language',
	'language_preference',
	'source_preference',
	'preference',
	'quality',
	'has_drm'
] as const
const INFO_FIELDS = ['id', 'title', 'thumbnail', 'duration', 'webpage_url', 'extractor', 'extractor_key', 'is_live', 'live_status', 'availability', 'has_drm', 'age_limit', 'uploader', 'channel', 'upload_date', 'timestamp', 'chapters'] as const

function pick(source: Record<string, unknown>, fields: readonly string[]): Record<string, unknown> {
	return Object.fromEntries(fields.flatMap(field => (source[field] === undefined || source[field] === null ? [] : [[field, source[field]]])))
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// One track per language, name and format only: the picker needs the
// languages, not every caption format's URL.
function subtitleKeys(value: unknown): Record<string, {ext?: string; name?: string}[]> {
	if (!isRecord(value)) return {}
	return Object.fromEntries(
		Object.entries(value).map(([language, tracks]) => [
			language,
			(Array.isArray(tracks) ? tracks : [])
				.filter(isRecord)
				.slice(0, 1)
				.map(track => pick(track, ['ext', 'name']))
		])
	)
}

// A CDN thumbnail URL can carry signed, expiring access tokens in its query
// (Streamable's Signature, TikTok's x-signature): the fixture keeps the path only.
function thumbnailWithoutQuery(thumbnail: unknown): {thumbnail?: string} {
	return typeof thumbnail === 'string' ? {thumbnail: thumbnail.split('?')[0]} : {}
}

// Tab-indented, but one format per line: a recapture diffs by stream.
function serialize(fixture: {source: unknown; info: Record<string, unknown> & {formats: unknown[]}}): string {
	const formats = fixture.info.formats.map(format => `\t\t\t${JSON.stringify(format)}`).join(',\n')
	const marker = '"__formats__"'
	return `${JSON.stringify({...fixture, info: {...fixture.info, formats: marker}}, null, '\t').replace(`"formats": ${JSON.stringify(marker)}`, `"formats": [\n${formats}\n\t\t]`)}\n`
}

async function capture(source: ProbeSource, cookieJar: (scope: SignInScope) => Promise<string>, dir: string): Promise<void> {
	const {id, url} = source
	const {stdout: version} = await run(YT_DLP, ['--version'], {env: CHILD_ENV})
	const args = [...JS_RUNTIME_ARGS, ...(await signInArgs(source, cookieJar, dir)), '--dump-single-json', '--no-playlist', '--no-warnings', url]
	const {stdout} = await run(YT_DLP, args, {maxBuffer: 256 * 1024 * 1024, env: CHILD_ENV})
	const info: unknown = JSON.parse(stdout)
	if (!isRecord(info)) throw new Error(`${id}: yt-dlp returned no info dict`)
	const formats = (Array.isArray(info.formats) ? info.formats : []).filter(isRecord).map(format => pick(format, FORMAT_FIELDS))
	const fixture = {
		source: {id, url, capturedAt: new Date().toISOString().slice(0, 10), ytDlp: version.trim(), ...(source.signIn === undefined ? {} : {signedIn: true})},
		info: {...pick(info, INFO_FIELDS), ...thumbnailWithoutQuery(info.thumbnail), formats, subtitles: subtitleKeys(info.subtitles), automatic_captions: subtitleKeys(info.automatic_captions)}
	}
	await writeFile(path.join(OUT_DIR, `${id}.json`), serialize(fixture))
	console.log(`${id}: ${formats.length} formats → ${id}.json`)
}

const wanted = process.argv.slice(2)
const sources = wanted.length > 0 ? PROBE_SOURCES.filter(source => wanted.includes(source.id)) : PROBE_SOURCES
if (sources.length === 0) throw new Error(`No source named ${wanted.join(', ')}. Known: ${PROBE_SOURCES.map(source => source.id).join(', ')}`)
await mkdir(OUT_DIR, {recursive: true})
const privateDir = await mkdtemp(path.join(tmpdir(), 'arroxy-probe-sources-'))
const cookieJars = new Map<SignInScope, Promise<string>>()
const sharedJar = (scope: SignInScope): Promise<string> => {
	const jar = cookieJars.get(scope) ?? exportCookies(privateDir, scope)
	cookieJars.set(scope, jar)
	return jar
}
let failed = 0
try {
	for (const source of sources) {
		try {
			await capture(source, sharedJar, privateDir)
		} catch (error) {
			failed += 1
			console.error(`${source.id}: ${error instanceof Error ? (error.message.split('\n').find(line => line.includes('ERROR')) ?? error.message) : String(error)}`)
		}
	}
} finally {
	await rm(privateDir, {recursive: true, force: true})
}
if (failed > 0) process.exitCode = 1
