// @vitest-environment node

import {beforeEach, describe, expect, it} from 'vite-plus/test'
import {CONTROL_PROBING_INTAKES_PER_CLIENT} from '@main/control/intakeAdmission.js'
import type {IntakeAddRequest} from '@main/intake/IntakeService.js'
import {BUILTIN_DOWNLOAD_PROFILES} from '@shared/downloadProfiles.js'
import type {IntakePlacement} from '@shared/intake/intakeEvents.js'
import {fail} from '@shared/result.js'
import type {DownloadProfile} from '@shared/types.js'
import type {ListSizeChoice} from '@shared/schemas.js'
import {createAppError} from '@main/utils/errorFactory.js'
import {makeItem} from '../shared/fixtures.js'
import {context, errorOf, harness, resultOf, UNRESOLVED, type Harness} from '../helpers/controlServiceHarness.js'

// Taking a link in for a client and answering its intake: links.add places a
// row through intake (once per request id), and intake.choose, intake.retry
// and intake.cancel move the intake on with its placeholder row.

const VIDEO = 'https://www.youtube.com/watch?v=abc'

function lastAdd(h: Harness): IntakeAddRequest {
	const call = h.intake.add.mock.lastCall
	if (!call) throw new Error('intake.add was not called')
	return call[0]
}

// A deferred placement, to hold links.add while it places its row.
function held(): {promise: Promise<IntakePlacement>; release(placement: IntakePlacement): void} {
	let release: (placement: IntakePlacement) => void = () => undefined
	const promise = new Promise<IntakePlacement>(resolve => {
		release = resolve
	})
	return {promise, release}
}

async function addLink(h: Harness, requestId: string, url = VIDEO): Promise<{intakeId: string; placeholderId: string}> {
	return resultOf('links.add', await h.send('links.add', {requestId, url}))
}

describe('ControlService links.add', () => {
	let h: Harness
	beforeEach(() => {
		h = harness()
	})

	it("places the link through intake as the client's, with the active profile", async () => {
		const {intakeId, placeholderId} = await addLink(h, 'r1')
		expect(lastAdd(h)).toMatchObject({url: VIDEO, playlistMode: 'video', profile: {kind: 'builtin', id: 'balanced'}, origin: {kind: 'localClient', clientId: 'client-1'}})
		expect(h.registry.get(intakeId)).toMatchObject({placeholderId, clientId: 'client-1', state: {state: 'probing'}})
	})

	it.each([
		['a video in a playlist queues the video', 'https://www.youtube.com/watch?v=abc&list=PLx', undefined, 'video'],
		['a radio list counts as one video', 'https://www.youtube.com/watch?v=abc&list=RDabc', undefined, 'video'],
		['a playlist queues the playlist', 'https://www.youtube.com/playlist?list=PLx', undefined, 'playlist'],
		['another site lets the probe tell', 'https://vimeo.com/123', undefined, 'auto'],
		['a caller that wants the playlist says so', 'https://www.youtube.com/watch?v=abc&list=PLx', 'playlist', 'playlist'],
		['a caller that wants the video says so', 'https://www.youtube.com/playlist?list=PLx', 'video', 'video']
	])('%s', async (_name, url, playlistMode, expected) => {
		resultOf('links.add', await h.send('links.add', {requestId: 'r', url, ...(playlistMode ? {playlistMode} : {})}))
		expect(lastAdd(h).playlistMode).toBe(expected)
	})

	it("takes a channel's root as its videos, as the hotkey does", async () => {
		await addLink(h, 'r1', 'https://www.youtube.com/@someone')
		expect(lastAdd(h).url).toBe('https://www.youtube.com/@someone/videos')
	})

	it('cleans the link as the window and the hotkey do, before anything reads it', async () => {
		await addLink(h, 'r1', 'https://www.youtube.com/show/VLPLabc123')
		expect(lastAdd(h)).toMatchObject({url: 'https://www.youtube.com/playlist?list=PLabc123', playlistMode: 'playlist'})
		await addLink(h, 'r2', 'https://www.youtube.com/watch?v=abc&utm_source=newsletter')
		expect(lastAdd(h).url).toBe('https://www.youtube.com/watch?v=abc')
	})

	it('names an unknown profile before a cooling site', async () => {
		h.status.value = {...h.status.value, cooldowns: [{site: 'youtube', until: h.clock.now + 90_000}]}
		expect(errorOf(await h.send('links.add', {requestId: 'r1', url: VIDEO, profile: {kind: 'custom', id: 'nope'}})).code).toBe('profile_unavailable')
	})

	it('prepares the link with the profile the caller names, never making it active', async () => {
		const custom: DownloadProfile = {...BUILTIN_DOWNLOAD_PROFILES[0], id: 'mine', name: 'Mine'}
		h.settings.profiles = {...h.settings.profiles, custom: [custom]}
		resultOf('links.add', await h.send('links.add', {requestId: 'r1', url: VIDEO, profile: {kind: 'custom', id: 'mine'}}))
		expect(lastAdd(h).profile).toEqual({kind: 'custom', id: 'mine'})
		expect(h.settings.profiles.active).toEqual({kind: 'builtin', id: 'balanced'})
	})

	it('uses the profile the window shows when the caller names none', async () => {
		h.intake.windowProfile.mockReturnValue({kind: 'builtin', id: 'audio-only'})
		await addLink(h, 'r1')
		expect(lastAdd(h).profile).toEqual({kind: 'builtin', id: 'audio-only'})
	})

	it.each([
		['an unknown profile', {kind: 'custom', id: 'nope'}],
		['a disabled profile', {kind: 'builtin', id: 'low-240'}],
		['a built-in id named as custom', {kind: 'custom', id: 'balanced'}]
	])('answers profile_unavailable for %s, never falling back', async (_name, profile) => {
		expect(errorOf(await h.send('links.add', {requestId: 'r1', url: VIDEO, profile})).code).toBe('profile_unavailable')
		expect(h.intake.add).not.toHaveBeenCalled()
	})

	it('answers rate_limited while the link’s site is cooling down', async () => {
		h.status.value = {...h.status.value, cooldowns: [{site: 'youtube', until: h.clock.now + 90_000}]}
		const error = errorOf(await h.send('links.add', {requestId: 'r1', url: VIDEO}))
		expect(error).toMatchObject({code: 'rate_limited', retryable: true, details: {retryAfterMs: 90_000}})
		expect(h.intake.add).not.toHaveBeenCalled()
		await addLink(h, 'r2', 'https://vimeo.com/1')
	})

	it('answers an already-live link with a fresh intake queued on its row', async () => {
		h.put(makeItem({id: 'live', status: 'running', url: VIDEO}))
		h.intake.add.mockResolvedValueOnce({kind: 'already-queued', itemId: 'live'})
		const {intakeId, placeholderId} = await addLink(h, 'r1')
		expect(placeholderId).toBe('live')
		expect(resultOf('intake.get', await h.send('intake.get', {intakeId})).intake.state).toEqual({state: 'queued', itemIds: ['live']})
	})

	it.each<[string, IntakePlacement]>([
		['a refused row', {kind: 'not-added'}],
		['a conflict whose row is gone', {kind: 'already-queued', itemId: null}]
	])('answers internal for %s', async (_name, placement) => {
		h.intake.add.mockResolvedValueOnce(placement)
		expect(errorOf(await h.send('links.add', {requestId: 'r1', url: VIDEO})).code).toBe('internal')
	})

	it('answers internal when intake throws, without its message', async () => {
		h.intake.add.mockRejectedValueOnce(new Error('ENOENT /Users/me/Library/queue.json'))
		const error = errorOf(await h.send('links.add', {requestId: 'r1', url: VIDEO}))
		expect(error.code).toBe('internal')
		expect(error.message).not.toContain('/Users/')
	})

	describe('caller limits', () => {
		it(`refuses a link past ${CONTROL_PROBING_INTAKES_PER_CLIENT} intakes still probing`, async () => {
			for (let index = 0; index < CONTROL_PROBING_INTAKES_PER_CLIENT; index++) await addLink(h, `r${index}`, `https://example.com/${index}`)
			const error = errorOf(await h.send('links.add', {requestId: 'one-more', url: 'https://example.com/more'}))
			expect(error).toMatchObject({code: 'limit_exceeded', retryable: true, details: {limit: CONTROL_PROBING_INTAKES_PER_CLIENT}})
			// Another client has its own.
			resultOf('links.add', await h.send('links.add', {requestId: 'r0', url: 'https://example.com/other'}, context('client-2')))
		})

		it('counts links still placing their row', async () => {
			const placing = held()
			h.intake.add.mockImplementation(() => placing.promise)
			const pending = Array.from({length: CONTROL_PROBING_INTAKES_PER_CLIENT}, (_, index) => h.send('links.add', {requestId: `r${index}`, url: `https://example.com/${index}`}))
			const refused = await h.send('links.add', {requestId: 'one-more', url: 'https://example.com/more'})
			expect(errorOf(refused).code).toBe('limit_exceeded')
			placing.release({kind: 'not-added'})
			await Promise.all(pending)
		})
	})

	describe('idempotency', () => {
		it('answers the same request id with the same intake, placing once', async () => {
			const first = await addLink(h, 'same')
			expect(await addLink(h, 'same')).toEqual(first)
			expect(h.intake.add).toHaveBeenCalledTimes(1)
		})

		it('shares a duplicate that arrives while the first is still placing', async () => {
			const placing = held()
			h.intake.add.mockImplementationOnce(() => placing.promise)
			const first = h.send('links.add', {requestId: 'same', url: VIDEO})
			const second = h.send('links.add', {requestId: 'same', url: VIDEO})
			placing.release({kind: 'added', itemId: 'row-x', title: VIDEO, intakeId: 'intake-x'})
			expect(resultOf('links.add', await first)).toEqual({intakeId: 'intake-x', placeholderId: 'row-x'})
			expect(resultOf('links.add', await second)).toEqual({intakeId: 'intake-x', placeholderId: 'row-x'})
			expect(h.intake.add).toHaveBeenCalledTimes(1)
		})

		it('keeps clients apart', async () => {
			const mine = await addLink(h, 'same')
			const theirs = resultOf('links.add', await h.send('links.add', {requestId: 'same', url: 'https://example.com/theirs'}, context('client-2')))
			expect(theirs.intakeId).not.toBe(mine.intakeId)
			expect(h.intake.add).toHaveBeenCalledTimes(2)
		})

		it('lets a refused request id be sent again', async () => {
			expect(errorOf(await h.send('links.add', {requestId: 'retry-me', url: VIDEO, profile: {kind: 'custom', id: 'nope'}})).code).toBe('profile_unavailable')
			await addLink(h, 'retry-me')
			expect(h.intake.add).toHaveBeenCalledTimes(1)
		})
	})
})

describe('ControlService intake answers', () => {
	let h: Harness
	beforeEach(() => {
		h = harness()
	})

	// A client's intake whose placeholder now asks for a choice.
	async function needingChoice(choice: ListSizeChoice): Promise<{intakeId: string; placeholderId: string}> {
		const added = await addLink(h, `r-${choice.kind}`, 'https://www.youtube.com/playlist?list=PLx')
		const row = h.rows.find(candidate => candidate.id === added.placeholderId)
		if (!row) throw new Error('no placeholder')
		h.put({...row, status: 'needs-choice', choice})
		h.outcome(added.intakeId, {kind: 'needs-choice', itemId: added.placeholderId, choice})
		return added
	}

	it('takes every video of a playlist over the load limit', async () => {
		const {intakeId, placeholderId} = await needingChoice({kind: 'list-size', loaded: 100, capped: true})
		resultOf('intake.choose', await h.send('intake.choose', {intakeId, take: 'all'}))
		expect(h.intake.choose).toHaveBeenCalledWith(expect.objectContaining({itemId: placeholderId, take: 'all', origin: 'localClient'}))
	})

	it('takes the first videos when the count is what was offered', async () => {
		const {intakeId, placeholderId} = await needingChoice({kind: 'list-size', loaded: 100, capped: true})
		resultOf('intake.choose', await h.send('intake.choose', {intakeId, take: 'first', count: 100}))
		expect(h.intake.choose).toHaveBeenCalledWith(expect.objectContaining({itemId: placeholderId, take: 'first'}))
	})

	it('answers invalid_request for any other count', async () => {
		const {intakeId} = await needingChoice({kind: 'list-size', loaded: 100, capped: true})
		expect(errorOf(await h.send('intake.choose', {intakeId, take: 'first', count: 10})).code).toBe('invalid_request')
		expect(h.intake.choose).not.toHaveBeenCalled()
	})

	it('answers desktop_required for some videos of a playlist to review', async () => {
		const {intakeId} = await needingChoice({kind: 'list-size', loaded: 12, capped: false})
		expect(errorOf(await h.send('intake.choose', {intakeId, take: 'first', count: 12})).code).toBe('desktop_required')
		resultOf('intake.choose', await h.send('intake.choose', {intakeId, take: 'all'}))
	})

	it('answers invalid_state to a choice nobody asked for, and not_found to an unknown intake', async () => {
		const {intakeId} = await addLink(h, 'r1')
		expect(errorOf(await h.send('intake.choose', {intakeId, take: 'all'})).code).toBe('invalid_state')
		expect(errorOf(await h.send('intake.choose', {intakeId: 'nope', take: 'all'})).code).toBe('not_found')
	})

	it("answers intake's refusal through the error table", async () => {
		const {intakeId} = await needingChoice({kind: 'list-size', loaded: 100, capped: true})
		h.intake.choose.mockReturnValueOnce(fail(createAppError('validation', 'queue item row-1 is not waiting for a choice')))
		expect(errorOf(await h.send('intake.choose', {intakeId, take: 'all'})).code).toBe('invalid_state')
	})

	it('retries only a probe failure, through intake with the placeholder', async () => {
		const {intakeId, placeholderId} = await addLink(h, 'r1')
		expect(errorOf(await h.send('intake.retry', {intakeId})).code).toBe('invalid_state')
		const row = h.rows.find(candidate => candidate.id === placeholderId)
		if (!row) throw new Error('no placeholder')
		h.put({...row, status: 'error', error: {kind: 'network', raw: 'x'}})
		h.outcome(intakeId, {kind: 'failed', itemId: placeholderId, title: VIDEO, probeError: {kind: 'ytdlp', error: {kind: 'network', raw: 'x'}}})
		resultOf('intake.retry', await h.send('intake.retry', {intakeId}))
		expect(h.intake.retry).toHaveBeenCalledWith(expect.objectContaining({itemId: placeholderId, origin: 'localClient'}))
		expect(errorOf(await h.send('intake.retry', {intakeId: 'nope'})).code).toBe('not_found')
	})

	it('cancels a probing intake through the queue, and answers cancelled', async () => {
		const {intakeId, placeholderId} = await addLink(h, 'r1')
		const {intake} = resultOf('intake.cancel', await h.send('intake.cancel', {intakeId}))
		expect(h.queue.cancel).toHaveBeenCalledWith(placeholderId)
		expect(intake.state).toEqual({state: 'cancelled'})
	})

	it('answers invalid_state to cancelling an intake that already ended', async () => {
		const {intakeId, placeholderId} = await addLink(h, 'r1')
		h.put(makeItem({id: placeholderId, status: 'pending', origin: {kind: 'localClient', clientId: 'client-1', intakeId}}))
		h.outcome(intakeId, {kind: 'queued', itemId: placeholderId, skippedAlreadyQueued: 0})
		expect(errorOf(await h.send('intake.cancel', {intakeId})).code).toBe('invalid_state')
		expect(h.queue.cancel).not.toHaveBeenCalled()
	})

	it('cancels an intake waiting for a choice', async () => {
		const {intakeId} = await needingChoice({kind: 'list-size', loaded: 100, capped: true})
		expect(resultOf('intake.cancel', await h.send('intake.cancel', {intakeId})).intake.state).toEqual({state: 'cancelled'})
	})

	it('keeps a placeholder of the app’s own intake out of reach', () => {
		// Only Control intakes are in the registry: a window row has no handle.
		h.put(makeItem({id: 'w', status: 'probing', job: UNRESOLVED, probeMode: 'video', origin: {kind: 'window', intakeId: 'win-1'}}))
		expect(h.registry.get('win-1')).toBeUndefined()
	})
})
