import {describe, expect, it} from 'vitest'
import {queueItemSchema} from '@shared/schemas.js'
import {artifactKindForPath, markMissingArtifacts, moveQueueArtifactPath, queueArtifactFromPath, upsertQueueArtifact, visibleQueueArtifacts} from '@shared/queueArtifacts.js'
import {makeItem} from '../shared/fixtures.js'

describe('queue artifacts', () => {
	it.each([
		['/tmp/video.mkv', 'media'],
		['/tmp/video.en.vtt', 'subtitle'],
		['/tmp/video.fr.srt', 'subtitle'],
		['/tmp/video.jpg', 'thumbnail'],
		['/tmp/video.webp', 'thumbnail'],
		['/tmp/video.description', 'description'],
		['/tmp/video.info.json', 'companion'],
		['/tmp/video.unknown-sidecar', 'unknown']
	])('classifies %s as %s', (path, kind) => {
		expect(artifactKindForPath(path)).toBe(kind)
	})

	it('defaults queue artifacts to an empty array for persisted queue items', () => {
		const item = makeItem({id: 'q1', status: 'pending'})
		expect(item.artifacts).toEqual([])
	})

	it('builds a stable artifact record from a path', () => {
		const artifact = queueArtifactFromPath('/tmp/Video Title.en.vtt', {discoveredAt: '2026-06-18T10:00:00.000Z'})

		expect(artifact).toEqual({id: 'artifact:/tmp/Video Title.en.vtt', kind: 'subtitle', path: '/tmp/Video Title.en.vtt', fileName: 'Video Title.en.vtt', discoveredAt: '2026-06-18T10:00:00.000Z'})
	})

	it('upserts artifacts by path without duplicating existing records', () => {
		const first = queueArtifactFromPath('/tmp/video.mkv', {discoveredAt: '2026-06-18T10:00:00.000Z'})
		const updated = queueArtifactFromPath('/tmp/video.mkv', {discoveredAt: '2026-06-18T10:05:00.000Z', sizeBytes: 42})

		expect(upsertQueueArtifact([first], updated)).toEqual([{...first, sizeBytes: 42}])
	})

	it('moves an artifact path while preserving its identity', () => {
		const artifact = queueArtifactFromPath('/old/video.mkv', {discoveredAt: '2026-06-18T10:00:00.000Z', sizeBytes: 42})

		expect(moveQueueArtifactPath([artifact], '/old/video.mkv', '/new/video.mkv')).toEqual([{...artifact, path: '/new/video.mkv', fileName: 'video.mkv', sizeBytes: 42}])
	})

	it('marks selected artifacts as missing without dropping them', () => {
		const media = queueArtifactFromPath('/tmp/video.mkv', {discoveredAt: '2026-06-18T10:00:00.000Z'})
		const subtitles = queueArtifactFromPath('/tmp/video.en.vtt', {discoveredAt: '2026-06-18T10:00:00.000Z'})

		expect(markMissingArtifacts([media, subtitles], new Set(['/tmp/video.en.vtt']))).toEqual([media, {...subtitles, missing: true}])
	})

	it('filters internal artifacts by explicit marker and Arroxy sidecar name', () => {
		const media = queueArtifactFromPath('/tmp/video.mkv', {discoveredAt: '2026-06-18T10:00:00.000Z'})
		const userVisibleInfoJson = queueArtifactFromPath('/tmp/video.info.json', {discoveredAt: '2026-06-18T10:00:00.000Z'})
		const internalResumeInfoJson = queueArtifactFromPath('/tmp/.arroxy-temp/job/_arroxy.info.json', {discoveredAt: '2026-06-18T10:00:00.000Z'})
		const internalProbeInfoJson = {...queueArtifactFromPath('/tmp/.arroxy/probe.info.json', {discoveredAt: '2026-06-18T10:00:00.000Z'}), internal: true}

		expect(internalResumeInfoJson.internal).toBe(true)
		expect(visibleQueueArtifacts([media, userVisibleInfoJson, internalResumeInfoJson, internalProbeInfoJson])).toEqual([media, userVisibleInfoJson])
	})

	it('validates artifacts through the queue item schema', () => {
		const parsed = queueItemSchema.parse({
			id: 'q1',
			url: 'https://example.com/video',
			title: 'Video',
			thumbnail: '',
			outputDir: '/tmp',
			formatLabel: 'Best',
			status: 'done',
			lane: 'normal',
			progressPercent: 100,
			progressDetail: null,
			lastStatus: null,
			error: null,
			finishedAt: '2026-06-18T10:00:00.000Z',
			writeM3u: true,
			artifacts: [{...queueArtifactFromPath('/tmp/video.mkv', {discoveredAt: '2026-06-18T10:00:00.000Z', sizeBytes: 42}), internal: true}],
			job: {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: '22', preset: 'custom', sponsorBlock: {mode: 'off'}, embed: {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}}
		})

		expect(parsed.artifacts).toHaveLength(1)
		expect(parsed.artifacts[0]?.internal).toBe(true)
	})
})
