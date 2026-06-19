import {describe, expect, it} from 'vitest'
import {transition, illegalTransition, type QueueEvent} from '@shared/queueTransition.js'
import type {QueueItem, QueueResumeContext} from '@shared/types.js'
import type {PreparedJob, EmbedOptions, SponsorBlockOptions} from '@shared/preparedJob.js'

const EMBED_OFF: EmbedOptions = {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}
const SB_OFF: SponsorBlockOptions = {mode: 'off'}
const PREPARED: PreparedJob = {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: '137+251', preset: 'custom', sponsorBlock: SB_OFF, embed: EMBED_OFF}
const RESUME_CONTEXT: QueueResumeContext = {kind: 'media-retry', tempDir: '/tmp/.arroxy-temp/resume', reason: 'media-transfer', failureKind: 'network'}

function makeItem(overrides: Partial<QueueItem> = {}): QueueItem {
	const base: QueueItem = {
		id: 'q-1',
		url: 'https://www.youtube.com/watch?v=test',
		title: 'Test',
		thumbnail: '',
		outputDir: '/tmp',
		formatLabel: '720p mp4',
		status: 'pending',
		lane: 'normal',
		progressPercent: 0,
		progressDetail: null,
		lastStatus: null,
		error: null,
		addedAt: null,
		finishedAt: null,
		artifacts: [],
		writeM3u: true,
		job: PREPARED
	}
	return {...base, ...overrides, addedAt: overrides.addedAt ?? base.addedAt}
}

describe('transition', () => {
	it('started → status=running + clears error/resume context + records lastJobId', () => {
		const start = makeItem({status: 'pending', error: {kind: 'unknown', raw: 'prev'}, resumeContext: RESUME_CONTEXT})
		const next = transition(start, {kind: 'started', lastJobId: 'job-9'})
		expect(next.status).toBe('running')
		expect(next.lastJobId).toBe('job-9')
		expect(next.error).toBeNull()
		expect(next.resumeContext).toBeUndefined()
	})

	it('progress updates percent + detail without changing status', () => {
		const start = makeItem({status: 'running', progressPercent: 10})
		const next = transition(start, {kind: 'progress', percent: 47, detail: '1.4 MiB/s'})
		expect(next.progressPercent).toBe(47)
		expect(next.progressDetail).toBe('1.4 MiB/s')
		expect(next.status).toBe('running')
	})

	it('paused-active → status=paused-active + clears progressDetail + records tempDir', () => {
		const start = makeItem({status: 'running', progressDetail: '1.4 MiB/s'})
		const next = transition(start, {kind: 'paused-active', tempDir: '/tmp/.arroxy-temp/x'})
		expect(next.status).toBe('paused-active')
		expect(next.progressDetail).toBeNull()
		expect(next.tempDir).toBe('/tmp/.arroxy-temp/x')
	})

	it('paused-held → status=paused-held + clears progressDetail', () => {
		const start = makeItem({status: 'pending'})
		const next = transition(start, {kind: 'paused-held'})
		expect(next.status).toBe('paused-held')
		expect(next.progressDetail).toBeNull()
	})

	it('resumed → status=running + clears error/resume context', () => {
		const start = makeItem({status: 'paused-active', error: {kind: 'network', raw: 'fail'}, resumeContext: RESUME_CONTEXT})
		const next = transition(start, {kind: 'resumed'})
		expect(next.status).toBe('running')
		expect(next.error).toBeNull()
		expect(next.resumeContext).toBeUndefined()
	})

	it('failed → status=error + records error/resume context + clears lastJobId/tempDir', () => {
		const start = makeItem({status: 'running', lastJobId: 'job-9', tempDir: '/tmp/x'})
		const next = transition(start, {kind: 'failed', error: {kind: 'network', raw: 'read reset'}, resumeContext: RESUME_CONTEXT})
		expect(next.status).toBe('error')
		expect(next.error?.kind).toBe('network')
		expect(next.lastJobId).toBeUndefined()
		expect(next.tempDir).toBeUndefined()
		expect(next.resumeContext).toEqual(RESUME_CONTEXT)
	})

	it('failed without resume context clears any stale resume context', () => {
		const start = makeItem({status: 'running', lastJobId: 'job-9', tempDir: '/tmp/x', resumeContext: RESUME_CONTEXT})
		const next = transition(start, {kind: 'failed', error: {kind: 'botBlock', raw: 'sign-in'}})
		expect(next.status).toBe('error')
		expect(next.resumeContext).toBeUndefined()
	})

	it('completed → status=done + percent=100 + finishedAt + clears lastJobId/tempDir/resume context', () => {
		const start = makeItem({status: 'running', progressPercent: 99, lastJobId: 'job-9', resumeContext: RESUME_CONTEXT})
		const finishedAt = '2026-05-09T12:00:00.000Z'
		const next = transition(start, {kind: 'completed', finishedAt})
		expect(next.status).toBe('done')
		expect(next.progressPercent).toBe(100)
		expect(next.finishedAt).toBe(finishedAt)
		expect(next.lastJobId).toBeUndefined()
		expect(next.resumeContext).toBeUndefined()
	})

	it('cancelled → status=cancelled + clears lastJobId/tempDir/resume context', () => {
		const start = makeItem({status: 'running', lastJobId: 'job-9', tempDir: '/tmp/x', resumeContext: RESUME_CONTEXT})
		const next = transition(start, {kind: 'cancelled'})
		expect(next.status).toBe('cancelled')
		expect(next.lastJobId).toBeUndefined()
		expect(next.tempDir).toBeUndefined()
		expect(next.resumeContext).toBeUndefined()
	})

	it('retry-reset → status=pending + clears error/finishedAt/lastJobId/tempDir while preserving resume context', () => {
		const start = makeItem({status: 'error', error: {kind: 'unknown', raw: 'fail'}, finishedAt: 'before', lastJobId: 'job-old', tempDir: '/tmp/old', resumeContext: RESUME_CONTEXT})
		const next = transition(start, {kind: 'retry-reset'})
		expect(next.status).toBe('pending')
		expect(next.error).toBeNull()
		expect(next.finishedAt).toBeNull()
		expect(next.lastJobId).toBeUndefined()
		expect(next.tempDir).toBeUndefined()
		expect(next.resumeContext).toEqual(RESUME_CONTEXT)
	})
})

describe('illegalTransition', () => {
	it('blocks progress/completed/failed on cancelled items', () => {
		const cancelled = makeItem({status: 'cancelled'})
		const events: QueueEvent[] = [
			{kind: 'progress', percent: 50},
			{kind: 'completed', finishedAt: 'now'},
			{kind: 'failed', error: {kind: 'unknown', raw: 'x'}}
		]
		for (const evt of events) {
			expect(illegalTransition(cancelled, evt)).toBeTruthy()
		}
	})

	it('blocks all events except retry-reset on done items', () => {
		const done = makeItem({status: 'done'})
		expect(illegalTransition(done, {kind: 'progress', percent: 50})).toBeTruthy()
		expect(illegalTransition(done, {kind: 'retry-reset'})).toBeNull()
	})

	it('allows normal progression on running items', () => {
		const running = makeItem({status: 'running'})
		expect(illegalTransition(running, {kind: 'progress', percent: 50})).toBeNull()
		expect(illegalTransition(running, {kind: 'completed', finishedAt: 'now'})).toBeNull()
	})
})
