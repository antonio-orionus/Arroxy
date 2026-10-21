// @vitest-environment node

import {describe, expect, it} from 'vite-plus/test'
import {KeptProbes} from '@main/intake/KeptProbes.js'
import type {PlaylistProbeResult} from '@shared/types.js'

// Kept probes are bounded in count and age, so a long session never piles them up.

function probe(title: string): PlaylistProbeResult {
	return {kind: 'playlist', extractor: 'youtube:tab', extractorKey: 'YoutubeTab', webpageUrl: 'https://www.youtube.com/playlist?list=PL', isAudioOnlySource: false, playlistTitle: title, playlistId: 'PL', isMultiVideo: false, entries: []}
}

describe('KeptProbes', () => {
	it('drops the oldest past the limit', () => {
		const kept = new KeptProbes(() => 0, 2)
		kept.keep('a', probe('A'))
		kept.keep('b', probe('B'))
		kept.keep('c', probe('C'))
		expect(kept.get('a')).toBeUndefined()
		expect(kept.get('b')?.playlistTitle).toBe('B')
		expect(kept.get('c')?.playlistTitle).toBe('C')
	})

	it('keeping a row again makes it the newest', () => {
		const kept = new KeptProbes(() => 0, 2)
		kept.keep('a', probe('A'))
		kept.keep('b', probe('B'))
		kept.keep('a', probe('A2'))
		kept.keep('c', probe('C'))
		expect(kept.get('b')).toBeUndefined()
		expect(kept.get('a')?.playlistTitle).toBe('A2')
	})

	it('forgets a probe older than its lifetime', () => {
		let now = 0
		const kept = new KeptProbes(() => now, 10, 1000)
		kept.keep('a', probe('A'))
		now = 1000
		expect(kept.get('a')?.playlistTitle).toBe('A')
		now = 1001
		expect(kept.get('a')).toBeUndefined()
	})
})
