import {describe, expect, it} from 'vite-plus/test'
import {appStatusSchema, intakeStateSchema, intakeViewSchema, profileViewSchema, queueItemViewSchema} from '../src/index'

const item = {id: 'q1', title: null, site: null, status: 'probing', progress: null, lane: 'priority', origin: {kind: 'app'}, intakeId: null, error: null}

describe('QueueItemView', () => {
	it('is a projection: internal fields an app object carries are dropped', () => {
		const internal = {...item, outputDir: '/Users/me/Downloads', tempDir: '/tmp/x', jobOptions: {format: 'best'}, stderr: 'ERROR: ...'}
		expect(queueItemViewSchema.parse(internal)).toEqual(item)
	})

	it('carries artifact paths only when present, for callers holding paths.read', () => {
		const withPaths = {...item, status: 'done', artifacts: [{kind: 'media', path: '/Users/me/Downloads/a.mp4'}]}
		expect(queueItemViewSchema.parse(withPaths)).toEqual(withPaths)
		expect(queueItemViewSchema.parse(item)).not.toHaveProperty('artifacts')
	})

	it('carries a public error with the yt-dlp error kind', () => {
		const failed = {...item, status: 'failed', error: {ytdlpKind: 'botBlock', message: 'YouTube asked to sign in.', retryable: true}}
		expect(queueItemViewSchema.parse(failed)).toEqual(failed)
	})

	it('has public statuses, not internal ones', () => {
		for (const status of ['probing', 'needsYourChoice', 'pending', 'running', 'paused', 'done', 'failed', 'cancelled']) expect(queueItemViewSchema.safeParse({...item, status}).success).toBe(true)
		for (const status of ['needs-choice', 'paused-held', 'paused-active', 'error']) expect(queueItemViewSchema.safeParse({...item, status}).success).toBe(false)
	})

	it('bounds progress percent to 0..100', () => {
		const progress = {percent: 101, downloadedBytes: null, totalBytes: null, speedBytesPerSecond: null, etaSeconds: null}
		expect(queueItemViewSchema.safeParse({...item, progress}).success).toBe(false)
	})
})

describe('intake states', () => {
	it.each([
		{state: 'probing'},
		{state: 'queued', itemIds: ['q1', 'q2']},
		{state: 'needsYourChoice', kind: 'loadLimit', total: null, offered: 200},
		{state: 'needsYourChoice', kind: 'playlistReview', total: 12, offered: 12},
		{state: 'probeFailed', ytdlpKind: 'unavailable', retryable: false},
		{state: 'nothingNew'},
		{state: 'cancelled'}
	])('accepts $state', state => {
		expect(intakeStateSchema.parse(state)).toEqual(state)
	})

	it('refuses an unknown state and a queued state without items', () => {
		expect(intakeStateSchema.safeParse({state: 'done'}).success).toBe(false)
		expect(intakeStateSchema.safeParse({state: 'needsYourChoice', kind: 'playlistCap', total: null, offered: 1}).success).toBe(false)
		expect(intakeStateSchema.safeParse({state: 'queued'}).success).toBe(false)
	})

	it('names the intake, its placeholder and when it last changed', () => {
		const intake = {intakeId: 'i1', placeholderId: 'q1', state: {state: 'nothingNew'}, updatedAt: 1_760_000_000_000}
		expect(intakeViewSchema.parse(intake)).toEqual(intake)
	})
})

describe('ProfileView', () => {
	it('has a ref, a label and a media kind', () => {
		const profile = {ref: {kind: 'builtin', id: 'best-video'}, label: 'Best video', kind: 'videoAudio'}
		expect(profileViewSchema.parse({...profile, filename: {kind: 'default'}})).toEqual(profile)
		expect(profileViewSchema.safeParse({...profile, ref: {kind: 'shared', id: 'x'}}).success).toBe(false)
	})
})

describe('app status', () => {
	it('reports readiness, binaries, the scheduler and site cooldowns', () => {
		const status = {ready: true, binaries: {ytDlp: 'ready', ffmpeg: 'installing'}, scheduler: 'paused', cooldowns: [{site: 'youtube', until: 1_760_000_000_000}]}
		expect(appStatusSchema.parse(status)).toEqual(status)
		expect(appStatusSchema.safeParse({...status, scheduler: {paused: true}}).success).toBe(false)
	})
})
