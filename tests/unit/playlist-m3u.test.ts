// @vitest-environment node
import {describe, expect, it} from 'vitest'
import {buildM3u} from '@main/services/playlistM3u.js'
import type {PlaylistManifest} from '@shared/playlistManifest.js'

const manifest: PlaylistManifest = {
	playlistGroupId: 'g',
	playlistTitle: 'My List',
	outputDir: '/dl',
	items: [
		{videoId: 'a', title: 'First', duration: 65},
		{videoId: 'gone', title: 'Missing', duration: 10},
		{videoId: null, title: 'No id'},
		{videoId: 'b', title: 'Second'}
	]
}

describe('buildM3u', () => {
	it('writes matched files in playlist order, omitting missing/id-less', () => {
		const files = ['First [a].mp4', 'Second [b].webm', 'unrelated.txt']
		expect(buildM3u(manifest, files)).toBe(['#EXTM3U', '#EXTINF:65,First', 'First [a].mp4', '#EXTINF:-1,Second', 'Second [b].webm', ''].join('\n'))
	})
})
