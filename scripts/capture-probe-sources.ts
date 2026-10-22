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
// jar per run, deleted afterwards. Sizes the site leaves out are looked up
// the way the app looks them up (formatSizeLookup), except on YouTube. Each
// fixture keeps only the fields Arroxy reads (no stream URLs, headers,
// fragments or cookies).

import {mkdir, mkdtemp, rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import path from 'node:path'
import {PROBE_SOURCES} from '../src/renderer/src/dev/probeSources/sources.js'
import {captureFixture, exportCookies, OUT_DIR, writeFixture, type SignInScope} from './probe-source-capture.js'

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
			const fixture = await captureFixture(source, sharedJar, privateDir)
			await writeFixture(fixture, path.join(OUT_DIR, `${source.id}.json`))
			console.log(`${source.id}: ${fixture.info.formats.length} formats → ${source.id}.json`)
		} catch (error) {
			failed += 1
			console.error(`${source.id}: ${error instanceof Error ? (error.message.split('\n').find(line => line.includes('ERROR')) ?? error.message) : String(error)}`)
		}
	}
} finally {
	await rm(privateDir, {recursive: true, force: true})
}
if (failed > 0) process.exitCode = 1
