// Snapshot coverage tests — bind the curated patterns in src/patterns.ts to
// the strings yt-dlp actually emits (data/known-yt-dlp-strings.json) and
// the strings external APIs forward through yt-dlp (data/known-extractor-
// strings.json). Whenever upstream changes wording, these tests fail —
// surfacing the drift before users hit it.

import {describe, expect, it} from 'vite-plus/test'
import {readFileSync} from 'node:fs'
import {join, dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {classifyYtDlpStderr, YT_DLP_ERROR_KINDS} from '../src/index.js'
import type {YtDlpErrorKind} from '../src/index.js'

const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'data')

interface SnapshotEntry {
	id: string
	fragment: string
	kind: YtDlpErrorKind | null
	source?: string
	provenance?: string
	notes?: string
}

interface Snapshot {
	schemaVersion: number
	strings: SnapshotEntry[]
}

function load(name: string): Snapshot {
	return JSON.parse(readFileSync(join(DATA_DIR, name), 'utf8'))
}

// Synthesize a realistic stderr line for a fragment. yt-dlp prefixes
// report_error output with "ERROR: " — we reproduce that to test in a
// representative context. We do NOT add an [extractor] id: prefix because
// some patterns (postprocessFailure) anchor on `ERROR:` directly followed by
// the wrapper keyword. Extractor-scoped messages still classify correctly
// without the prefix since their patterns match keywords anywhere in the
// blob. Python printf placeholders are substituted with concrete values
// that round-trip through the classifier's digit/string matchers correctly.
function asStderrLine(fragment: string): string {
	const concrete = fragment
		.replace(/%\(\w+\)d/g, '42')
		.replace(/%\(\w+\)s/g, 'foo')
		.replace(/%d/g, '42')
		.replace(/%s/g, 'foo')
	return `ERROR: ${concrete}`
}

function runCoverage(snap: Snapshot, label: string) {
	describe(`${label} — kind round-trip`, () => {
		for (const entry of snap.strings) {
			if (entry.kind === null) continue
			it(`[${entry.id}] "${entry.fragment.slice(0, 60)}" → ${entry.kind}`, () => {
				const {kind} = classifyYtDlpStderr(asStderrLine(entry.fragment))
				expect(kind, `Snapshot entry ${entry.id} declares kind="${entry.kind}" but classifier returned "${kind}"`).toBe(entry.kind)
			})
		}

		it('every non-null kind in snapshot is a member of YT_DLP_ERROR_KINDS', () => {
			for (const entry of snap.strings) {
				if (entry.kind === null) continue
				expect(YT_DLP_ERROR_KINDS, `unknown kind "${entry.kind}" in snapshot entry ${entry.id}`).toContain(entry.kind)
			}
		})

		it('snapshot ids are unique', () => {
			const ids = new Set<string>()
			for (const entry of snap.strings) {
				expect(ids.has(entry.id), `duplicate snapshot id: ${entry.id}`).toBe(false)
				ids.add(entry.id)
			}
		})
	})
}

runCoverage(load('known-yt-dlp-strings.json'), 'data/known-yt-dlp-strings.json')
runCoverage(load('known-extractor-strings.json'), 'data/known-extractor-strings.json')

describe('snapshot triage backlog', () => {
	it('reports kind:null entries (warning, not failure)', () => {
		const ytdlp = load('known-yt-dlp-strings.json')
		const extractors = load('known-extractor-strings.json')
		const pending = [...ytdlp.strings, ...extractors.strings].filter(s => s.kind === null)
		if (pending.length > 0) {
			console.warn(`[ytdlp-errors] ${pending.length} snapshot entries have kind: null — triage before next release.`)
			for (const p of pending) console.warn(`  - ${p.id}: "${p.fragment.slice(0, 80)}"`)
		}
		// Soft-fail: high water mark prevents the backlog from growing unchecked.
		expect(pending.length).toBeLessThanOrEqual(5)
	})
})
