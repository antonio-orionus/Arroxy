// @vitest-environment node

import {describe, expect, it} from 'vite-plus/test'
import {intakeViewSchema, profileViewSchema, queueItemViewSchema, type QueueItemStatus} from 'arroxy-control'
import {intakeView, profileView, queueItemView, type ItemProjection} from '@main/control/controlProjections.js'
import {BUILTIN_DOWNLOAD_PROFILES} from '@shared/downloadProfiles.js'
import type {QueueItemStatus as InternalStatus} from '@shared/schemas.js'
import type {DownloadProfile, QueueItem} from '@shared/types.js'
import {makeItem} from '../shared/fixtures.js'

// Public projections: never an internal type, a temp dir, raw stderr or an
// output folder; artifact paths only for a caller holding paths.read.

const UNRESOLVED: QueueItem['job'] = {kind: 'unresolved', extractor: '', extractorKey: ''}
const PROJECTION: ItemProjection = {clientLabel: clientId => (clientId === 'client-1' ? 'Claude Code' : null), errorText: kind => `English text for ${kind}`, pathsRead: false}

function view(item: QueueItem, projection: ItemProjection = PROJECTION) {
	const projected = queueItemView(item, projection)
	expect(queueItemViewSchema.safeParse(projected).success).toBe(true)
	return projected
}

function rowIn(status: InternalStatus): QueueItem {
	if (status === 'probing') return makeItem({id: 'row', status, job: UNRESOLVED, probeMode: 'video'})
	if (status === 'needs-choice') return makeItem({id: 'row', status, job: UNRESOLVED, probeMode: 'video', choice: {kind: 'playlist-cap', loaded: 3}})
	if (status === 'error') return makeItem({id: 'row', status, error: {kind: 'network', raw: 'boom'}})
	return makeItem({id: 'row', status})
}

describe('queueItemView', () => {
	it.each<[InternalStatus, QueueItemStatus]>([
		['probing', 'probing'],
		['needs-choice', 'needsYourChoice'],
		['pending', 'pending'],
		['running', 'running'],
		['paused-held', 'paused'],
		['paused-active', 'paused'],
		['done', 'done'],
		['error', 'failed'],
		['cancelled', 'cancelled']
	])('shows %s as %s', (status, expected) => {
		expect(view(rowIn(status)).status).toBe(expected)
	})

	it('names the site the way cooldowns do, from the link', () => {
		expect(view(makeItem({id: 'a', status: 'pending', url: 'https://www.youtube.com/watch?v=a'})).site).toBe('youtube')
		expect(view(makeItem({id: 'b', status: 'pending', url: 'https://www.vimeo.com/123'})).site).toBe('vimeo.com')
	})

	it('has no title while the row only knows its link', () => {
		const probing = makeItem({id: 'p', status: 'probing', url: 'https://youtube.com/watch?v=p', title: 'https://youtube.com/watch?v=p', job: UNRESOLVED, probeMode: 'video'})
		expect(view(probing).title).toBeNull()
		expect(view(makeItem({id: 'q', status: 'pending', title: 'A real title'})).title).toBe('A real title')
	})

	it('has progress once the row has a job, with nulls for what the row does not know', () => {
		expect(view(rowIn('probing')).progress).toBeNull()
		expect(view(makeItem({id: 'r', status: 'running', progressPercent: 42.5})).progress).toEqual({percent: 42.5, downloadedBytes: null, totalBytes: null, speedBytesPerSecond: null, etaSeconds: null})
		expect(view(makeItem({id: 'r', status: 'running', progressPercent: 140})).progress?.percent).toBe(100)
	})

	it('keeps the lane', () => {
		expect(view(makeItem({id: 'r', status: 'pending', lane: 'priority'})).lane).toBe('priority')
	})

	it("shows the app's own rows as app, a client's with its label and the intake", () => {
		expect(view(makeItem({id: 'w', status: 'pending', origin: {kind: 'window', intakeId: 'i-w'}}))).toMatchObject({origin: {kind: 'app'}, intakeId: 'i-w'})
		expect(view(makeItem({id: 'h', status: 'pending', origin: {kind: 'hotkey', intakeId: 'i-h'}})).origin).toEqual({kind: 'app'})
		expect(view(makeItem({id: 'n', status: 'pending'}))).toMatchObject({origin: {kind: 'app'}, intakeId: null})
		expect(view(makeItem({id: 'c', status: 'pending', origin: {kind: 'localClient', clientId: 'client-1', intakeId: 'i-c'}}))).toMatchObject({origin: {kind: 'localClient', clientId: 'client-1', label: 'Claude Code'}, intakeId: 'i-c'})
		// A client the user removed since has no label left.
		expect(view(makeItem({id: 'g', status: 'pending', origin: {kind: 'localClient', clientId: 'gone', intakeId: 'i-g'}})).origin).toEqual({kind: 'localClient', clientId: 'gone'})
	})

	it("explains a failure in the user's words, never the raw output", () => {
		const failed = view(makeItem({id: 'f', status: 'error', error: {kind: 'rateLimit', raw: 'HTTP Error 429 at /Users/me/tmp'}}))
		expect(failed.error).toEqual({ytdlpKind: 'rateLimit', message: 'English text for rateLimit', retryable: true})
		const unknown = view(makeItem({id: 'u', status: 'error', error: {kind: 'unknown', raw: 'Traceback /Users/me/.cache'}}))
		expect(unknown.error?.ytdlpKind).toBe('unknown')
		expect(JSON.stringify(unknown)).not.toContain('/Users/')
		expect(view(makeItem({id: 'd', status: 'done'})).error).toBeNull()
	})

	it('lists the files an item wrote only for a caller holding paths.read', () => {
		const artifacts: QueueItem['artifacts'] = [
			{id: 'a1', kind: 'media', path: '/Videos/clip.mp4', fileName: 'clip.mp4', discoveredAt: '2026-01-01T00:00:00.000Z'},
			{id: 'a2', kind: 'subtitle', path: '/Videos/clip.en.vtt', fileName: 'clip.en.vtt', discoveredAt: '2026-01-01T00:00:00.000Z', missing: true},
			{id: 'a3', kind: 'unknown', path: '/tmp/arroxy-x/info.json', fileName: 'info.json', discoveredAt: '2026-01-01T00:00:00.000Z', internal: true}
		]
		const item = makeItem({id: 'd', status: 'done', artifacts})
		expect(view(item)).not.toHaveProperty('artifacts')
		expect(view(item, {...PROJECTION, pathsRead: true}).artifacts).toEqual([{kind: 'media', path: '/Videos/clip.mp4'}])
	})

	it('never carries internal fields', () => {
		const projected = view(makeItem({id: 'p', status: 'paused-active', tempDir: '/tmp/arroxy-part', lastJobId: 'job-1', outputDir: '/Videos'}))
		expect(Object.keys(projected).sort()).toEqual(['error', 'id', 'intakeId', 'lane', 'origin', 'progress', 'site', 'status', 'title'])
	})
})

describe('intakeView', () => {
	it('leaves out the client that started it', () => {
		const projected = intakeView({intakeId: 'i1', placeholderId: 'p1', clientId: 'client-1', state: {state: 'probing'}, updatedAt: 5})
		expect(projected).toEqual({intakeId: 'i1', placeholderId: 'p1', state: {state: 'probing'}, updatedAt: 5})
		expect(intakeViewSchema.safeParse(projected).success).toBe(true)
	})
})

describe('profileView', () => {
	it.each([
		['balanced', 'videoAudio'],
		['audio-only', 'audioOnly'],
		['subtitles-only', 'subtitlesOnly']
	])('gives %s the kind %s', (id, kind) => {
		const profile = BUILTIN_DOWNLOAD_PROFILES.find(candidate => candidate.id === id)
		if (!profile) throw new Error(`no built-in ${id}`)
		const projected = profileView(profile, 'Label')
		expect(projected).toEqual({ref: {kind: 'builtin', id}, label: 'Label', kind})
		expect(profileViewSchema.safeParse(projected).success).toBe(true)
	})

	it('names a custom profile as custom, and a video-only one as videoOnly', () => {
		const base = BUILTIN_DOWNLOAD_PROFILES[0]
		if (base?.media.kind !== 'video-audio') throw new Error('expected a video profile first')
		const {audio: _audio, ...video} = base.media
		const custom: DownloadProfile = {...base, id: 'my-mute', name: 'Mute', media: {...video, kind: 'video-only'}}
		expect(profileView(custom, 'Mute')).toEqual({ref: {kind: 'custom', id: 'my-mute'}, label: 'Mute', kind: 'videoOnly'})
	})
})
