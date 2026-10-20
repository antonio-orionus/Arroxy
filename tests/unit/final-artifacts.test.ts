// @vitest-environment node

import {describe, expect, it} from 'vite-plus/test'
import {announcedArtifactEvents, finalArtifactsOf} from '@main/services/download/finalArtifacts.js'
import {AsyncStack} from '@main/services/phases/types.js'
import type {ActiveDownload} from '@main/services/phases/types.js'
import type {ResolvedStartDownloadInput} from '@shared/types.js'

const JOB: ResolvedStartDownloadInput['job'] = {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: '22', sponsorBlock: {mode: 'off'}, embed: {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}}

function makeActive(overrides: Partial<ActiveDownload> = {}): ActiveDownload {
	const controller = new AbortController()
	return {
		job: {id: 'job-final', url: 'https://www.youtube.com/watch?v=abc', outputDir: '/downloads', status: 'running', createdAt: '', updatedAt: ''},
		input: {url: 'https://www.youtube.com/watch?v=abc', outputDir: '/downloads', job: JOB},
		controller,
		signal: controller.signal,
		cancelRequested: false,
		pauseRequested: false,
		subtitlePaths: [],
		disposables: new AsyncStack(),
		...overrides
	}
}

describe('announcedArtifactEvents', () => {
	it('puts the media title on the media event only', () => {
		const active = makeActive({mediaPath: '/downloads/AC⧸DC [abc].mp4', mediaTitle: 'AC/DC', subtitlePaths: ['/downloads/AC⧸DC [abc].en.srt']})

		const events = announcedArtifactEvents('job-final', finalArtifactsOf(active))

		expect(events).toEqual([expect.objectContaining({kind: 'media', path: '/downloads/AC⧸DC [abc].mp4', title: 'AC/DC'}), expect.objectContaining({kind: 'subtitle'})])
		expect(events[1]).not.toHaveProperty('title')
	})

	it('carries no title when the job read none', () => {
		const events = announcedArtifactEvents('job-final', finalArtifactsOf(makeActive({mediaPath: '/downloads/Video.mp4'})))

		expect(events).toEqual([expect.objectContaining({kind: 'media'})])
		expect(events[0]).not.toHaveProperty('title')
	})
})
