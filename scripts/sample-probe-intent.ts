// Probes a few fresh YouTube videos the way the app does and runs the intent
// rules (`probe-intent/rules.ts`) on them, so a shape of real data no recorded
// probe has yet is found by a run, not by a user. A video that breaks a rule
// is a candidate bug: check it against the raw data, and record it as a probe
// source (`sources.ts`) when it shows a shape worth keeping.
//
//   bun run probe-intent:sample                      # this week's searches
//   bun run probe-intent:sample --keep <dir>         # also save each video that breaks a rule
//   bun run probe-intent:sample <url> [<url>...]     # these videos instead
//
// Stays inside the live YouTube budget (memory `live-youtube-request-budget`):
// two searches and at most MAX_PROBES probes a run, one at a time, signed out.

import {execFile} from 'node:child_process'
import {mkdir, mkdtemp, rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import path from 'node:path'
import {promisify} from 'node:util'
import {probeResultFromFixture} from '../src/renderer/src/dev/probeSources/index.js'
import {PROBE_SOURCES} from '../src/renderer/src/dev/probeSources/sources.js'
import {rawFormats, RULES} from './probe-intent/rules.js'
import {captureFixture, writeFixture, YT_DLP} from './probe-source-capture.js'

const run = promisify(execFile)
const MAX_PROBES = 5
const PER_SEARCH = 3

// Searches that tend to bring different shapes: named and regional subtitle
// tracks, dubbed audio, HDR and 8K, portrait Shorts, hours-long episodes.
const SEARCHES = ['official music video', 'movie trailer 4k hdr', 'podcast full episode', 'mrbeast', 'documentary english subtitles', 'youtube shorts', 'lecture with subtitles', '8k hdr nature', 'news today', 'live concert', 'cooking recipe', 'video game trailer']

function weekNumber(date: Date): number {
	return Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000))
}

async function search(query: string): Promise<string[]> {
	const {stdout} = await run(YT_DLP, ['--flat-playlist', '--no-warnings', '--print', 'id', `ytsearch${PER_SEARCH}:${query}`], {env: {...process.env, ELECTRON_RUN_AS_NODE: '1'}})
	return stdout.split('\n').filter(id => /^[\w-]{11}$/.test(id))
}

async function freshUrls(): Promise<string[]> {
	const week = weekNumber(new Date())
	const queries = [SEARCHES[(week * 2) % SEARCHES.length], SEARCHES[(week * 2 + 1) % SEARCHES.length]].filter((query): query is string => query !== undefined)
	const recorded = new Set(PROBE_SOURCES.map(source => new URL(source.url).searchParams.get('v')).filter(Boolean))
	const ids: string[] = []
	for (const query of queries) {
		for (const id of await search(query)) if (!recorded.has(id) && !ids.includes(id)) ids.push(id)
	}
	return ids.slice(0, MAX_PROBES).map(id => `https://www.youtube.com/watch?v=${id}`)
}

const args = process.argv.slice(2)
const keepIndex = args.indexOf('--keep')
const keepDir = keepIndex === -1 ? null : (args[keepIndex + 1] ?? null)
if (keepIndex !== -1 && keepDir === null) throw new Error('--keep needs a directory')
const given = args.filter((arg, index) => arg !== '--keep' && index !== keepIndex + 1)
const urls = given.length > 0 ? given.slice(0, MAX_PROBES) : await freshUrls()

const privateDir = await mkdtemp(path.join(tmpdir(), 'arroxy-probe-intent-'))
const noSignIn = (): Promise<string> => Promise.reject(new Error('sampled videos are probed signed out'))
let broken = 0
let failed = 0
try {
	if (keepDir) await mkdir(keepDir, {recursive: true})
	for (const url of urls) {
		const id = new URL(url).searchParams.get('v') ?? url
		try {
			const fixture = await captureFixture({id: `sample-${id}`, url, shows: 'sampled'}, noSignIn, privateDir)
			const probe = probeResultFromFixture(fixture, id)
			const raw = rawFormats(fixture.info)
			const violations = Object.entries(RULES).flatMap(([rule, check]) => check(probe, raw).map(line => `  ${rule}: ${line}`))
			console.log(`${url} — ${probe.title}: ${violations.length === 0 ? 'ok' : `${violations.length} violation(s)`}`)
			for (const line of violations) console.log(line)
			if (violations.length > 0) {
				broken += 1
				if (keepDir) await writeFixture(fixture, path.join(keepDir, `sample-${id}.json`))
			}
		} catch (error) {
			failed += 1
			console.error(`${url}: ${error instanceof Error ? (error.message.split('\n').find(line => line.includes('ERROR')) ?? error.message) : String(error)}`)
		}
	}
} finally {
	await rm(privateDir, {recursive: true, force: true})
}
console.log(`${urls.length} video(s) probed: ${broken} broke a rule, ${failed} could not be probed`)
if (broken > 0 || failed > 0) process.exitCode = 1
