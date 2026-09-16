import {describe, expect, it} from 'vitest'
import {buildMediaRequest, type MediaJob} from '@main/services/phases/mediaRequest.js'
import type {EmbedOptions} from '@shared/preparedJob.js'

const EMBED_OFF: EmbedOptions = {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}

const RANGED: MediaJob = {
	kind: 'ranged-format',
	extractor: 'youtube',
	extractorKey: 'Youtube',
	intent: {kind: 'video-audio', codec: 'best', tiers: ['720'], audio: {format: 'best'}},
	formatSelector: 'bestvideo*+bestaudio/best',
	formatSort: 'res:720,fps',
	mergeOutputFormat: undefined,
	audioConvert: undefined,
	filenameTemplate: '{title} [{id}]',
	sponsorBlock: {mode: 'off'},
	embed: {...EMBED_OFF, chapters: true, metadata: true}
}

describe('buildMediaRequest', () => {
	it('builds the production ranged-format request with default YouTube player clients', () => {
		const req = buildMediaRequest({url: 'https://www.youtube.com/watch?v=z1NNgSu8hTI', job: RANGED, outputDir: '/out', tempDir: '/out/.arroxy-temp/abc', embed: false})
		expect(req.kind).toBe('media')
		expect(req.selection).toEqual({formatId: undefined, formatSelector: 'bestvideo*+bestaudio/best', formatSort: 'res:720,fps', mergeOutputFormat: undefined})
		expect(req.output.directory).toBe('/out')
		expect(req.output.tempDirectory).toBe('/out/.arroxy-temp/abc')
		expect(req.extractor).toEqual({youtube: {playerClient: ['default', 'web_embedded']}})
		expect(req.embed).toEqual({chapters: true, metadata: true, thumbnail: false, description: false, thumbnailSidecar: false})
		expect(req.resume).toBeUndefined()
	})

	it('honours an explicit player client override', () => {
		const req = buildMediaRequest({url: 'https://www.youtube.com/watch?v=x', job: RANGED, outputDir: '/out', embed: false, youtubePlayerClients: ['web_safari']})
		expect(req.extractor).toEqual({youtube: {playerClient: ['web_safari']}})
	})

	it('omits YouTube extractor args for non-YouTube jobs', () => {
		const req = buildMediaRequest({url: 'https://vimeo.com/1', job: {...RANGED, extractor: 'vimeo', extractorKey: 'Vimeo'}, outputDir: '/out', embed: false})
		expect(req.extractor).toBeUndefined()
	})

	it('passes the info-json path through as resume.loadInfoJsonPath', () => {
		const req = buildMediaRequest({url: 'https://www.youtube.com/watch?v=x', job: RANGED, outputDir: '/out', embed: false, infoJsonPath: '/tmp/_arroxy.info.json'})
		expect(req.resume).toEqual({loadInfoJsonPath: '/tmp/_arroxy.info.json'})
	})
})
