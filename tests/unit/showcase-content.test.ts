import {describe, expect, it} from 'vitest'
import type {QueueItem} from '@shared/types.js'
import {readKnobs} from '@renderer/dev/browserMockKnobs.js'
import {normalVideoProbe, playlistProbe} from '@renderer/dev/browserMockScenarios.js'
import {showcaseArtwork, showcaseProbe, showcaseQueueItem, showcaseTitle, showcaseWatchUrl} from '@renderer/dev/showcaseContent.js'
import {buildQueueItems} from '@renderer/dev/scenarios/queueScenarios.js'

function queueFixture(): QueueItem {
	const [item] = buildQueueItems({id: 'queue-active'})
	if (!item) throw new Error('queue-active scenario has no items')
	return item
}

describe('showcase content', () => {
	it('is off unless the showcase knob is set', () => {
		expect(readKnobs(new URL('http://localhost:5173/')).showcase).toBe(false)
		expect(readKnobs(new URL('http://localhost:5173/?showcase=1')).showcase).toBe(true)
	})

	it('replaces fixture titles, hosts, and remote thumbnails on a video probe', () => {
		const probe = showcaseProbe(normalVideoProbe({webpageUrl: 'https://example.com/single-normal'}))
		if (probe.kind !== 'video') throw new Error('expected a video probe')
		expect(probe.title).not.toMatch(/^Mock/)
		expect(probe.webpageUrl).toMatch(/^https:\/\/www\.youtube\.com\/watch\?v=/)
		expect(probe.thumbnail).toMatch(/^data:image\/svg\+xml/)
		expect(probe.duration ?? 0).toBeLessThan(4 * 60 * 60)
	})

	it('gives every playlist row a title and artwork, including rows that had none', () => {
		const probe = showcaseProbe(playlistProbe(10))
		if (probe.kind !== 'playlist') throw new Error('expected a playlist probe')
		for (const entry of probe.entries) {
			expect(entry.title).toBe(showcaseTitle(entry.id))
			expect(entry.thumbnail).toMatch(/^data:image\/svg\+xml/)
		}
	})

	it('is deterministic so screenshots are reproducible', () => {
		expect(showcaseTitle('row-3')).toBe(showcaseTitle('row-3'))
		expect(showcaseArtwork('row-3')).toBe(showcaseArtwork('row-3'))
	})
})

describe('showcase titles that are not fixtures', () => {
	it('keeps real-world names and replaces only workbench fixtures', () => {
		const source = playlistProbe(2)
		if (source.kind !== 'playlist') throw new Error('expected a playlist probe')
		const probe = showcaseProbe({...source, playlistTitle: 'Greatest Hits (1998-2012)'})
		if (probe.kind !== 'playlist') throw new Error('expected a playlist probe')
		expect(probe.playlistTitle).toBe('Greatest Hits (1998-2012)')
	})

	it('rewrites queue items the same way', () => {
		const item = showcaseQueueItem({...queueFixture(), id: 'q1', title: 'Scenario Queue Item - parallel A'})
		expect(item.title).toBe(showcaseTitle('q1'))
		expect(item.thumbnail).toMatch(/^data:image\/svg\+xml/)
	})
})

describe('showcase watch URLs', () => {
	it('swaps the video ID and keeps the rest of the link', () => {
		const url = showcaseWatchUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10')
		expect(url).toMatch(/^https:\/\/www\.youtube\.com\/watch\?v=[0-9a-z]+&t=10$/)
		expect(url).not.toContain('dQw4w9WgXcQ')
	})
})
