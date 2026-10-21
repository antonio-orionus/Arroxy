import {describe, expect, it} from 'vite-plus/test'
import {CONTROL_EVENT_NAMES, parseControlEvent} from '../src/index'

const item = {id: 'q1', title: 'A', site: 'youtube', status: 'pending', progress: null, lane: 'normal', origin: {kind: 'pairedDevice', label: 'Pixel 8'}, intakeId: 'i1', error: null}
const progress = {percent: 5, downloadedBytes: 5, totalBytes: 100, speedBytesPerSecond: 1, etaSeconds: 95}
const status = {ready: true, binaries: {ytDlp: 'ready', ffmpeg: 'ready'}, scheduler: 'running', cooldowns: []}

describe('events', () => {
	it('covers the v1 event kinds', () => {
		expect([...CONTROL_EVENT_NAMES].sort()).toEqual(['app.status', 'events.resync', 'intake.updated', 'queue.item', 'queue.progress', 'queue.removed', 'queue.replaced', 'queue.snapshot'].sort())
	})

	it.each([
		['queue.item', {item}],
		['queue.removed', {itemId: 'q1', reason: 'autoRemoved'}],
		['queue.replaced', {fromId: 'q1', toIds: ['q2', 'q3']}],
		['queue.progress', {itemId: 'q1', progress}],
		['queue.snapshot', {items: [item], final: true}],
		['intake.updated', {intake: {intakeId: 'i1', placeholderId: 'q1', state: {state: 'queued', itemIds: ['q2']}, updatedAt: 2}}],
		['app.status', {status}],
		['events.resync', {reason: 'lagging'}]
	])('parses %s with its seq and boot id', (event, data) => {
		const parsed = parseControlEvent({type: 'event', event, seq: 7, bootId: 'b1', data})
		expect(parsed).toEqual({status: 'event', event: {type: 'event', event, seq: 7, bootId: 'b1', data}})
	})

	it('ignores an unknown event kind instead of failing', () => {
		expect(parseControlEvent({type: 'event', event: 'queue.renamed', seq: 1, bootId: 'b1', data: {itemId: 'q1'}})).toEqual({status: 'ignored'})
	})

	it('drops unknown data fields of a known kind', () => {
		const parsed = parseControlEvent({type: 'event', event: 'queue.removed', seq: 1, bootId: 'b1', data: {itemId: 'q1', reason: 'removed', by: 'someone'}})
		expect(parsed).toEqual({status: 'event', event: {type: 'event', event: 'queue.removed', seq: 1, bootId: 'b1', data: {itemId: 'q1', reason: 'removed'}}})
	})

	it('reports invalid data of a known kind', () => {
		const parsed = parseControlEvent({type: 'event', event: 'queue.removed', seq: 1, bootId: 'b1', data: {itemId: 'q1', reason: 'exploded'}})
		expect(parsed.status).toBe('invalid')
	})

	it('accepts exactly the v1 removal reasons', () => {
		for (const reason of ['cancelled', 'removed', 'replaced', 'nothingNew', 'autoRemoved']) expect(parseControlEvent({type: 'event', event: 'queue.removed', seq: 1, bootId: 'b1', data: {itemId: 'q1', reason}}).status).toBe('event')
		for (const reason of ['expired', 'Removed', '']) expect(parseControlEvent({type: 'event', event: 'queue.removed', seq: 1, bootId: 'b1', data: {itemId: 'q1', reason}}).status).toBe('invalid')
	})
})
