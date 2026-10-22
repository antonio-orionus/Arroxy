import {describe, expect, it} from 'vite-plus/test'
import {queueItemSchema} from '@shared/queueItemSchema.js'
import {makeItem} from '../shared/fixtures.js'

describe('queue item schema', () => {
	it('defaults addedAt to null for persisted queue items that predate the field', () => {
		expect(makeItem({id: 'legacy', status: 'pending'}).addedAt).toBeNull()
	})

	it('preserves addedAt for newly queued items', () => {
		expect(makeItem({id: 'new', status: 'pending', addedAt: '2026-06-19T09:00:00.000Z'}).addedAt).toBe('2026-06-19T09:00:00.000Z')
	})

	it('round-trips the placeholder-title flag', () => {
		expect(makeItem({id: 'placeholder', status: 'pending', titleIsPlaceholder: true}).titleIsPlaceholder).toBe(true)
	})

	it('omits the placeholder-title flag by default', () => {
		expect(makeItem({id: 'real', status: 'pending'}).titleIsPlaceholder).toBeUndefined()
	})

	it('rejects a non-true placeholder-title flag', () => {
		const candidate = {...makeItem({id: 'bad-flag', status: 'pending'}), titleIsPlaceholder: false}
		expect(queueItemSchema.safeParse(candidate).success).toBe(false)
	})

	it('accepts probeTake on a placeholder and refuses it on a resolved row', () => {
		const unresolved = {kind: 'unresolved', extractor: '', extractorKey: ''} as const
		const placeholder = {...makeItem({id: 'probing', status: 'probing', probeMode: 'playlist', job: unresolved})}
		expect(queueItemSchema.safeParse({...placeholder, probeTake: {kind: 'first', count: 100}}).success).toBe(true)
		expect(queueItemSchema.safeParse({...placeholder, probeTake: {kind: 'all'}}).success).toBe(true)
		expect(queueItemSchema.safeParse({...placeholder, probeTake: {kind: 'first', count: 0}}).success).toBe(false)
		expect(queueItemSchema.safeParse({...makeItem({id: 'resolved', status: 'pending'}), probeTake: {kind: 'first', count: 100}}).success).toBe(false)
	})

	it('accepts a skipped video id on a placeholder and refuses it on a resolved row', () => {
		const unresolved = {kind: 'unresolved', extractor: '', extractorKey: ''} as const
		const placeholder = {...makeItem({id: 'probing', status: 'probing', probeMode: 'playlist', job: unresolved})}
		expect(queueItemSchema.safeParse({...placeholder, skipVideoId: 'abc'}).success).toBe(true)
		expect(queueItemSchema.safeParse({...makeItem({id: 'resolved', status: 'pending'}), skipVideoId: 'abc'}).success).toBe(false)
	})

	it('keeps a list offer on a row, and loads a row saved without one', () => {
		const row = makeItem({id: 'video', status: 'done'})
		expect(queueItemSchema.parse({...row, listOffer: 'https://www.youtube.com/watch?v=abc&list=PL1'}).listOffer).toBe('https://www.youtube.com/watch?v=abc&list=PL1')
		expect(queueItemSchema.parse(row).listOffer).toBeUndefined()
	})

	// The intake origin is users' data: rows saved before the Control API keep
	// loading, and a Control client's row names the client that added it.
	it('accepts every intake origin kind, and a Control client origin only with its client id', () => {
		const origin = (value: unknown) => queueItemSchema.safeParse({...makeItem({id: 'row', status: 'pending'}), origin: value})
		expect(origin({kind: 'window', intakeId: 'i1'}).success).toBe(true)
		expect(origin({kind: 'hotkey', intakeId: 'i1'}).success).toBe(true)
		expect(origin({kind: 'localClient', clientId: 'c1', intakeId: 'i1'}).success).toBe(true)
		expect(origin({kind: 'localClient', intakeId: 'i1'}).success).toBe(false)
		expect(origin({kind: 'pairedDevice', clientId: 'c1', intakeId: 'i1'}).success).toBe(false)
	})

	it('still loads a saved placeholder that has no probeTake', () => {
		const unresolved = {kind: 'unresolved', extractor: '', extractorKey: ''} as const
		const parsed = queueItemSchema.safeParse(makeItem({id: 'old', status: 'probing', probeMode: 'video', job: unresolved}))
		expect(parsed.success && parsed.data.probeTake).toBeUndefined()
	})
})
