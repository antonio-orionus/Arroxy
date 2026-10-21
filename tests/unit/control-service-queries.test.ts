// @vitest-environment node

import {beforeEach, describe, expect, it} from 'vite-plus/test'
import {CONTROL_METHOD_NAMES, type ControlMethod} from 'arroxy-control'
import {makeItem} from '../shared/fixtures.js'
import {context, errorOf, harness, resultOf, type Harness} from '../helpers/controlServiceHarness.js'

// What a Control API client reads: the app's status, the profiles, the queue
// in pages, one item, one intake. Every method needs the trusted rule, and
// every result is checked against the package's schema before it goes out.

const PARAMS: Partial<Record<ControlMethod, Record<string, unknown>>> = {
	'queue.get': {itemId: 'x'},
	'intake.get': {intakeId: 'x'},
	wait: {itemId: 'x', until: 'settled', timeoutMs: 0},
	'links.add': {requestId: 'r', url: 'https://example.com/v'},
	'intake.choose': {intakeId: 'x', take: 'all'},
	'intake.retry': {intakeId: 'x'},
	'intake.cancel': {intakeId: 'x'},
	'queue.pause': {itemId: 'x'},
	'queue.resume': {itemId: 'x'},
	'queue.cancel': {itemId: 'x'},
	'queue.retry': {itemId: 'x'},
	'queue.remove': {itemId: 'x'}
}

describe('ControlService queries', () => {
	let h: Harness
	beforeEach(() => {
		h = harness()
	})

	it('answers unauthorized to every method for a caller without the trusted rule', async () => {
		const untrusted = context('client-9', ['paths.read'])
		for (const method of CONTROL_METHOD_NAMES.filter(name => name !== 'hello' && name !== 'auth')) {
			expect(errorOf(await h.send(method, PARAMS[method] ?? {}, untrusted)).code).toBe('unauthorized')
		}
		expect(h.intake.add).not.toHaveBeenCalled()
		expect(h.feed.subscribe).not.toHaveBeenCalled()
	})

	it('leaves hello and auth to the transport', async () => {
		const response = await h.send('auth', {proof: 'a'.repeat(43)})
		expect(errorOf(response).code).toBe('invalid_state')
	})

	it('answers status from the status source', async () => {
		expect(resultOf('status', await h.send('status', {}))).toEqual(h.status.value)
	})

	it('answers internal, never an invalid result, when a source misbehaves', async () => {
		h.status.value = {...h.status.value, cooldowns: [{site: '', until: -1}]}
		const error = errorOf(await h.send('status', {}))
		expect(error.code).toBe('internal')
	})

	it('lists the enabled profiles and the active one', async () => {
		const {profiles, active} = resultOf('profiles.list', await h.send('profiles.list', {}))
		expect(active).toEqual({kind: 'builtin', id: 'balanced'})
		expect(profiles).toContainEqual({ref: {kind: 'builtin', id: 'balanced'}, label: 'Built-in balanced', kind: 'videoAudio'})
		expect(profiles).toContainEqual({ref: {kind: 'builtin', id: 'audio-only'}, label: 'Built-in audio-only', kind: 'audioOnly'})
		// Disabled by default.
		expect(profiles.map(profile => profile.ref.id)).not.toContain('low-240')
	})

	it('names the profile the window shows as the active one', async () => {
		h.intake.windowProfile.mockReturnValue({kind: 'builtin', id: 'audio-only'})
		expect(resultOf('profiles.list', await h.send('profiles.list', {})).active).toEqual({kind: 'builtin', id: 'audio-only'})
	})

	it('reads one item, and not_found for an unknown one', async () => {
		h.put(makeItem({id: 'a', status: 'running', title: 'Clip', progressPercent: 10}))
		expect(resultOf('queue.get', await h.send('queue.get', {itemId: 'a'})).item).toMatchObject({id: 'a', title: 'Clip', status: 'running'})
		expect(errorOf(await h.send('queue.get', {itemId: 'nope'})).code).toBe('not_found')
	})

	it('shows artifact paths only to a caller holding paths.read', async () => {
		h.put(makeItem({id: 'd', status: 'done', artifacts: [{id: 'a1', kind: 'media', path: '/Videos/clip.mp4', fileName: 'clip.mp4', discoveredAt: '2026-01-01T00:00:00.000Z'}]}))
		expect(resultOf('queue.get', await h.send('queue.get', {itemId: 'd'})).item).not.toHaveProperty('artifacts')
		const reader = context('client-1', ['trusted', 'paths.read'])
		expect(resultOf('queue.get', await h.send('queue.get', {itemId: 'd'}, reader)).item.artifacts).toEqual([{kind: 'media', path: '/Videos/clip.mp4'}])
	})

	it('labels a row with the client that added it', async () => {
		h.put(makeItem({id: 'c', status: 'pending', origin: {kind: 'localClient', clientId: 'client-1', intakeId: 'i1'}}))
		expect(resultOf('queue.get', await h.send('queue.get', {itemId: 'c'})).item.origin).toEqual({kind: 'localClient', clientId: 'client-1', label: 'Claude Code'})
	})

	describe('queue.list', () => {
		it('pages by limit, in queue order, until nextCursor is null', async () => {
			for (let index = 0; index < 5; index++) h.put(makeItem({id: `row-${index}`, status: 'pending'}))
			const first = resultOf('queue.list', await h.send('queue.list', {limit: 2}))
			expect(first.items.map(item => item.id)).toEqual(['row-0', 'row-1'])
			expect(first.nextCursor).not.toBeNull()
			const second = resultOf('queue.list', await h.send('queue.list', {limit: 2, cursor: first.nextCursor ?? ''}))
			expect(second.items.map(item => item.id)).toEqual(['row-2', 'row-3'])
			const third = resultOf('queue.list', await h.send('queue.list', {limit: 2, cursor: second.nextCursor ?? ''}))
			expect(third.items.map(item => item.id)).toEqual(['row-4'])
			expect(third.nextCursor).toBeNull()
		})

		it('cuts a page by size before the limit', async () => {
			for (let index = 0; index < 40; index++) h.put(makeItem({id: `row-${index}`, status: 'pending', title: 'x'.repeat(1000)}))
			const page = resultOf('queue.list', await h.send('queue.list', {limit: 500}))
			expect(page.items.length).toBeGreaterThan(0)
			expect(page.items.length).toBeLessThan(40)
			expect(Buffer.byteLength(JSON.stringify(page.items))).toBeLessThanOrEqual(12 * 1024)
			let seen = page.items.length
			let cursor = page.nextCursor
			while (cursor !== null) {
				const next = resultOf('queue.list', await h.send('queue.list', {limit: 500, cursor}))
				seen += next.items.length
				cursor = next.nextCursor
			}
			expect(seen).toBe(40)
		})

		it('always moves on, even past a row larger than a page', async () => {
			h.put(makeItem({id: 'huge', status: 'pending', title: 'x'.repeat(20_000)}))
			h.put(makeItem({id: 'small', status: 'pending'}))
			const page = resultOf('queue.list', await h.send('queue.list', {}))
			expect(page.items.map(item => item.id)).toEqual(['huge'])
			expect(resultOf('queue.list', await h.send('queue.list', {cursor: page.nextCursor ?? ''})).items.map(item => item.id)).toEqual(['small'])
		})

		it('resumes after the last row it gave, though rows before it left', async () => {
			for (let index = 0; index < 4; index++) h.put(makeItem({id: `row-${index}`, status: 'pending'}))
			const first = resultOf('queue.list', await h.send('queue.list', {limit: 2}))
			h.drop('row-0', 'removed')
			expect(resultOf('queue.list', await h.send('queue.list', {limit: 2, cursor: first.nextCursor ?? ''})).items.map(item => item.id)).toEqual(['row-2', 'row-3'])
		})

		it('answers invalid_request to a cursor it did not make', async () => {
			expect(errorOf(await h.send('queue.list', {cursor: 'not-a-cursor'})).code).toBe('invalid_request')
		})

		it('answers an empty queue with an empty last page', async () => {
			expect(resultOf('queue.list', await h.send('queue.list', {}))).toEqual({items: [], nextCursor: null})
		})
	})

	it('reads an intake, and not_found for an unknown one', async () => {
		const {intakeId, placeholderId} = resultOf('links.add', await h.send('links.add', {requestId: 'r1', url: 'https://example.com/v'}))
		expect(resultOf('intake.get', await h.send('intake.get', {intakeId})).intake).toEqual({intakeId, placeholderId, state: {state: 'probing'}, updatedAt: h.clock.now})
		expect(errorOf(await h.send('intake.get', {intakeId: 'nope'})).code).toBe('not_found')
	})
})
