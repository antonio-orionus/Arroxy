// The Fixture Product E2E extractor must list every shape of subtitle key that
// real YouTube probes have, so E2E runs on the data users meet rather than on
// the shapes we expected. Its English track was keyed plain `en` while real
// YouTube keyed the same track `en-nP7-2PuUl7o`, and every subtitle E2E passed
// over a bug any named track showed.
//
// A recorded probe (`src/renderer/src/dev/probeSources/youtube-*.json`) with a
// new shape fails this test until a fixture video lists one
// (`tests/e2e/fixture-media-catalog.json`, `extraSubtitleTracks`).

import {readdirSync, readFileSync} from 'node:fs'
import path from 'node:path'
import {describe, expect, it} from 'vite-plus/test'
import {FIXTURE_SUBTITLE_KEYS} from '../e2e/fixtureMediaCatalog.js'

const LANGUAGE = '[a-z]{2,3}'
const SUBTAG = '(?:[A-Z]{2}|[A-Z][a-z]{3}|\\d{3})'
const SHAPES: [string, RegExp][] = [
	['live chat', /^live_chat$/],
	['language', new RegExp(`^${LANGUAGE}$`)],
	['original caption', new RegExp(`^${LANGUAGE}(?:-${SUBTAG})?-orig$`)],
	['region or script', new RegExp(`^${LANGUAGE}-${SUBTAG}$`)],
	['named track', new RegExp(`^${LANGUAGE}-[\\w-]{11}$`)],
	['named regional track', new RegExp(`^${LANGUAGE}-${SUBTAG}-[\\w-]{11}$`)],
	['translation', new RegExp(`^${LANGUAGE}(?:-${SUBTAG})?-${LANGUAGE}(?:-${SUBTAG})?$`)]
]

function shapeOf(key: string): string {
	return SHAPES.find(([, pattern]) => pattern.test(key))?.[0] ?? `unclassified (${key})`
}

const PROBE_DIR = path.join(process.cwd(), 'src/renderer/src/dev/probeSources')

function recordedKeys(map: 'subtitles' | 'automatic_captions'): Map<string, string> {
	const shapes = new Map<string, string>()
	for (const file of readdirSync(PROBE_DIR).filter(name => name.startsWith('youtube') && name.endsWith('.json'))) {
		const fixture: unknown = JSON.parse(readFileSync(path.join(PROBE_DIR, file), 'utf8'))
		const info = typeof fixture === 'object' && fixture !== null && 'info' in fixture && typeof fixture.info === 'object' && fixture.info !== null ? fixture.info : {}
		const tracks = map in info ? (info as Record<string, unknown>)[map] : undefined
		for (const key of Object.keys(typeof tracks === 'object' && tracks !== null ? tracks : {})) if (!shapes.has(shapeOf(key))) shapes.set(shapeOf(key), `${file}: ${key}`)
	}
	return shapes
}

describe('fixture subtitle keys cover every shape real YouTube probes have', () => {
	for (const [map, fixtureMap] of [
		['subtitles', 'subtitles'],
		['automatic_captions', 'automaticCaptions']
	] as const) {
		it(map, () => {
			const covered = new Set(FIXTURE_SUBTITLE_KEYS[fixtureMap].map(shapeOf))
			const uncovered = [...recordedKeys(map)].filter(([shape]) => !covered.has(shape)).map(([shape, example]) => `${shape} (${example})`)
			expect(uncovered).toEqual([])
		})
	}

	it('classifies every key a fixture lists', () => {
		expect([...FIXTURE_SUBTITLE_KEYS.subtitles, ...FIXTURE_SUBTITLE_KEYS.automaticCaptions].map(shapeOf).filter(shape => shape.startsWith('unclassified'))).toEqual([])
	})
})
