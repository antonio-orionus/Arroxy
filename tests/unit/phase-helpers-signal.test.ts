import {EventEmitter} from 'node:events'
import {describe, expect, it, vi} from 'vite-plus/test'
import {buildYtDlpSignal} from '@main/services/phases/phaseHelpers.js'
import {AsyncStack, type ActiveJob, type PhaseContext} from '@main/services/phases/types.js'

function makeActive(): ActiveJob {
	return {
		job: {id: 'job-1', url: 'https://example.com/v', outputDir: '/downloads', status: 'running', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z'},
		input: {url: 'https://example.com/v', outputDir: '/downloads', job: {kind: 'single-format', extractor: 'generic', extractorKey: 'Generic', formatId: '18', sponsorBlock: {mode: 'off'}, embed: {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}}},
		controller: new AbortController(),
		get signal(): AbortSignal {
			return this.controller.signal
		},
		cancelRequested: false,
		pauseRequested: false,
		subtitlePaths: [],
		disposables: new AsyncStack()
	}
}

function fakeProc() {
	return Object.assign(new EventEmitter(), {kill: vi.fn()}) as never
}

describe('buildYtDlpSignal — the run folder', () => {
	// ProgressParser resolves the paths a run prints against this folder, so it
	// must follow every spawn: a later run without a folder must not inherit one.
	it('records the folder each spawn runs in on the job', () => {
		const active = makeActive()
		const ctx = {register: vi.fn(), safeConsume: vi.fn()} as unknown as PhaseContext
		const extraOnSpawn = vi.fn()
		const signal = buildYtDlpSignal(ctx, active, {onSpawn: extraOnSpawn})

		signal.onSpawn?.(fakeProc(), '/downloads/Show')
		expect(active.ytDlpCwd).toBe('/downloads/Show')
		expect(extraOnSpawn).toHaveBeenCalledWith(expect.anything(), '/downloads/Show')

		signal.onSpawn?.(fakeProc(), undefined)
		expect(active.ytDlpCwd).toBeUndefined()
	})
})
