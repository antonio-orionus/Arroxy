// @vitest-environment node
import {describe, expect, it, vi} from 'vite-plus/test'
import {ProbeService} from '@main/services/ProbeService.js'
import {ProbeSlots} from '@main/services/ProbeSlots.js'
import {titleBackfillProbe} from '@main/services/download/titleBackfillProbe.js'
import type {YtDlpRequest, YtDlpResult} from '@main/services/YtDlp.js'

// The title backfill's lookup, through the real ProbeService and probe slots:
// its probe is keyed to the backfill, so the window's cancel never reaches it
// while it waits for a slot (#650), and it tells a cancelled or deferred
// lookup apart from one that found nothing.

const ROW_URL = 'https://www.youtube.com/watch?v=row'
const TITLE_URL = 'https://www.youtube.com/watch?v=abc'

const video = (url: string, title: string): YtDlpResult => ({
	kind: 'success',
	stdout: JSON.stringify({_type: 'video', id: 'abc', title, extractor: 'youtube', extractor_key: 'Youtube', webpage_url: url, formats: [{format_id: '18', ext: 'mp4', vcodec: 'avc1', acodec: 'mp4a.40.2'}]}),
	stderr: '',
	usedExtractorFallback: false
})
const cancelled = (): YtDlpResult => ({kind: 'exit-error', exitCode: -1, errorKind: 'unknown', rawError: 'Cancelled', stdout: '', stderr: ''})

async function settle(): Promise<void> {
	for (let i = 0; i < 30; i++) await Promise.resolve()
}

function controlledYtDlp() {
	const pending: Array<{url: string; answer: (result: YtDlpResult) => void}> = []
	const run = vi.fn(
		(req: YtDlpRequest, signal?: {abortSignal?: AbortSignal}) =>
			new Promise<YtDlpResult>(resolve => {
				pending.push({url: req.url, answer: resolve})
				signal?.abortSignal?.addEventListener('abort', () => resolve(cancelled()), {once: true})
			})
	)
	return {ytDlp: {run} as never, pending}
}

describe('titleBackfillProbe', () => {
	it("keeps waiting for its slot through the window's cancel, then resolves the title", async () => {
		const {ytDlp, pending} = controlledYtDlp()
		const service = new ProbeService(ytDlp, false, undefined, {slots: new ProbeSlots({backgroundLimit: 1})})
		void service.probe(ROW_URL, {kind: 'intake', playlistMode: 'video', ownerKey: 'row-1'})
		const lookup = titleBackfillProbe(service)(TITLE_URL, () => true)
		await settle()

		service.cancelInFlight()
		pending.shift()?.answer(video(ROW_URL, 'Row'))
		await settle()
		expect(pending.map(run => run.url)).toEqual([TITLE_URL])
		pending.shift()?.answer(video(TITLE_URL, '  Real Title  '))

		expect(await lookup).toEqual({kind: 'found', title: 'Real Title'})
	})

	it('says deferred when a download started while it waited for its slot', async () => {
		const {ytDlp, pending} = controlledYtDlp()
		const service = new ProbeService(ytDlp, false, undefined, {slots: new ProbeSlots({backgroundLimit: 1})})
		void service.probe(ROW_URL, {kind: 'intake', playlistMode: 'video', ownerKey: 'row-1'})
		let downloading = false
		const lookup = titleBackfillProbe(service)(TITLE_URL, () => !downloading)
		await settle()
		downloading = true
		pending.shift()?.answer(video(ROW_URL, 'Row'))

		expect(await lookup).toEqual({kind: 'deferred'})
		expect(pending).toEqual([])
	})

	it('says cancelled when its own probe was aborted', async () => {
		const service = {probe: vi.fn(async () => ({ok: false as const, error: {kind: 'other' as const, code: 'cancelled' as const, message: 'Probe cancelled'}}))}
		expect(await titleBackfillProbe(service)(TITLE_URL, () => true)).toEqual({kind: 'cancelled'})
	})

	it('finds nothing in a failed probe, a playlist or a blank title', async () => {
		const answers = [
			{ok: false as const, error: {kind: 'other' as const, code: 'no_formats' as const, message: 'none'}},
			{ok: true as const, data: {kind: 'playlist' as const}},
			{ok: true as const, data: {kind: 'video' as const, title: '   '}}
		]
		for (const answer of answers) {
			const service = {probe: vi.fn(async () => answer)}
			expect(await titleBackfillProbe(service as never)(TITLE_URL, () => true)).toEqual({kind: 'none'})
		}
	})

	it('probes anonymously on the pinned budget, keyed to the backfill', async () => {
		const service = {probe: vi.fn(async () => ({ok: true as const, data: {kind: 'video' as const, title: 'T'}}))}
		const admit = (): boolean => true
		await titleBackfillProbe(service as never)(TITLE_URL, admit)
		expect(service.probe).toHaveBeenCalledWith(TITLE_URL, {kind: 'backfill', ownerKey: 'title-backfill', playlistMode: 'video', timeoutMs: 180_000, escalate: false, admit})
	})
})
