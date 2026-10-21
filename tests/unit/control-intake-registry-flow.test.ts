// @vitest-environment node

import {describe, expect, it, vi} from 'vite-plus/test'
import {EventEmitter} from 'node:events'
import {IntakeRegistry} from '@main/control/IntakeRegistry.js'
import {ControlOutcomes} from '@main/intake/ControlOutcomes.js'
import {IntakeService} from '@main/intake/IntakeService.js'
import {QueueService} from '@main/services/QueueService.js'
import type {DownloadService} from '@main/services/DownloadService.js'
import type {QueueRemovalReason} from '@main/services/download/queueMutation.js'
import type {QueueStore} from '@main/stores/QueueStore.js'
import {defaultAppSettings} from '@shared/constants.js'
import {ok, type Result} from '@shared/result.js'
import type {ProbeError, ProbeResult, QueueItem} from '@shared/types.js'
import {makeItem} from '../shared/fixtures.js'

// The registry against the real queue and intake: a client's link moves from
// probing straight to its outcome. The probe's swap takes the placeholder out
// before the outcome is told, and that removal must never read as a cancel.

const VIDEO_URL = 'https://www.youtube.com/watch?v=abc'
const VIDEO = {kind: 'video', videoId: 'abc', extractor: 'youtube', extractorKey: 'Youtube', webpageUrl: VIDEO_URL, isAudioOnlySource: false, formats: [], title: 'Fixture Video', thumbnail: '', subtitles: {}, automaticCaptions: {}, isLive: false, hasDrm: false} as unknown as ProbeResult
const CLIENT = {kind: 'localClient', clientId: 'client-1'} as const

class FakeDownloadService extends EventEmitter {
	start = vi.fn().mockResolvedValue(ok({job: {id: 'j', url: ''}}))
	cancel = vi.fn()
	pause = vi.fn()
	resume = vi.fn()
}

function wired(answer: () => Promise<Result<ProbeResult, ProbeError>>) {
	const store = {load: vi.fn().mockResolvedValue(ok({items: [], schedulerPaused: true})), save: vi.fn().mockResolvedValue(ok(undefined))} as unknown as QueueStore
	const queue = new QueueService(store, new FakeDownloadService() as unknown as DownloadService)
	void queue.pauseAll()
	let id = 0
	const registry = new IntakeRegistry({rows: () => queue.snapshot(), now: () => 0, newId: () => `fresh-${++id}`})
	queue.on('added', ({items}: {items: QueueItem[]}) => registry.hearRows(items))
	queue.on('updated', ({item}: {item: QueueItem}) => registry.hearRows([item]))
	queue.on('removed', ({itemId, reason}: {itemId: string; reason: QueueRemovalReason}) => registry.hearRemoved(itemId, reason))
	const control = new ControlOutcomes()
	control.listen(event => registry.hearOutcome(event))
	const settings = defaultAppSettings('/downloads')
	const intake = new IntakeService({queue, probe: answer, registerManifest: () => Promise.resolve(), settings: () => Promise.resolve(settings), text: key => key, profileFormatLabel: () => 'Best', emit: event => control.hear(event), platform: 'linux', newId: () => `id-${++id}`})
	intake.setWindowContext({currentOutputDir: '/wizard-folder', displayShowsHdr: false})
	const states: string[] = []
	registry.onChange(record => states.push(record.state.state))
	return {queue, registry, intake, states}
}

async function intakeIdOf(placement: Awaited<ReturnType<IntakeService['add']>>): Promise<string> {
	expect(placement.kind).toBe('added')
	return placement.kind === 'added' ? placement.intakeId : ''
}

describe('IntakeRegistry with the real queue and intake', () => {
	it('a queued video goes from probing to queued, never through cancelled', async () => {
		const h = wired(() => Promise.resolve(ok(VIDEO)))
		const intakeId = await intakeIdOf(await h.intake.add({requestId: 'r1', url: VIDEO_URL, playlistMode: 'video', origin: CLIENT}))
		await vi.waitFor(() => expect(h.registry.get(intakeId)?.state.state).toBe('queued'))
		expect(h.states).toEqual(['probing', 'queued'])
		expect(h.registry.get(intakeId)?.state).toEqual({state: 'queued', itemIds: [h.queue.snapshot()[0]?.id]})
	})

	// The swap drops the placeholder for no rows, then tells the live row.
	it('a link live in another form goes from probing to queued on the live row, never through cancelled', async () => {
		const h = wired(() => Promise.resolve(ok(VIDEO)))
		h.queue.add([makeItem({id: 'live', status: 'pending', url: VIDEO_URL})])
		// Another form of the link, so intake places it and the probe finds the live row.
		const intakeId = await intakeIdOf(await h.intake.add({requestId: 'r1', url: 'https://youtu.be/abc', playlistMode: 'video', origin: CLIENT}))
		await vi.waitFor(() => expect(h.registry.get(intakeId)?.state.state).not.toBe('probing'))
		expect(h.states).toEqual(['probing', 'queued'])
		expect(h.registry.get(intakeId)?.state).toEqual({state: 'queued', itemIds: ['live']})
	})

	it('cancelling the placeholder while it probes cancels the intake', async () => {
		let release: (value: Result<ProbeResult, ProbeError>) => void = () => undefined
		const h = wired(() => new Promise(resolve => (release = resolve)))
		const placement = await h.intake.add({requestId: 'r1', url: VIDEO_URL, playlistMode: 'video', origin: CLIENT})
		const intakeId = await intakeIdOf(placement)
		await h.queue.cancel(placement.kind === 'added' ? placement.itemId : '')
		release(ok(VIDEO))
		await new Promise(resolve => setTimeout(resolve, 0))
		expect(h.states).toEqual(['probing', 'cancelled'])
		expect(h.registry.get(intakeId)?.state).toEqual({state: 'cancelled'})
	})
})
