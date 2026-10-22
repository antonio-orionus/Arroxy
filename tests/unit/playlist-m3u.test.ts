// @vitest-environment node
import {describe, expect, it} from 'vite-plus/test'
import {mkdtemp, readdir, rm, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import path from 'node:path'
import {buildM3u, writePlaylistM3u} from '@main/services/playlistM3u.js'
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

	it('has nothing to build when no file matches an entry', () => {
		expect(buildM3u(manifest, ['First.en.vtt', 'unrelated.txt'])).toBeNull()
	})
})

describe('writePlaylistM3u', () => {
	// Subtitle files are not media: a folder of them must not get an empty playlist.
	it('writes no .m3u when no media file matches an entry', async () => {
		const dir = await mkdtemp(path.join(tmpdir(), 'arroxy-m3u-'))
		try {
			await writeFile(path.join(dir, 'First [a].en.vtt'), '')
			await writePlaylistM3u({...manifest, outputDir: dir})
			expect(await readdir(dir)).toEqual(['First [a].en.vtt'])
		} finally {
			await rm(dir, {recursive: true, force: true})
		}
	})
})
