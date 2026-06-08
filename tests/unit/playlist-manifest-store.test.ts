// @vitest-environment node
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {describe, expect, it} from 'vitest'
import {PlaylistManifestStore} from '@main/stores/PlaylistManifestStore.js'
import type {PlaylistManifest} from '@shared/playlistManifest.js'

async function tmpStore(): Promise<PlaylistManifestStore> {
	const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pl-manifest-'))
	return new PlaylistManifestStore(dir)
}

const m: PlaylistManifest = {
	playlistGroupId: 'g1',
	playlistTitle: 'My List',
	outputDir: '/dl/My List',
	items: [
		{videoId: 'a', title: 'A', duration: 10},
		{videoId: null, title: 'B'}
	]
}

describe('PlaylistManifestStore', () => {
	it('round-trips a manifest by group id', async () => {
		const s = await tmpStore()
		await s.save(m)
		expect(s.get('g1')).toEqual(m)
	})
	it('returns null for an unknown group', async () => {
		const s = await tmpStore()
		expect(s.get('nope')).toBeNull()
	})
	it('drops a manifest on remove', async () => {
		const s = await tmpStore()
		await s.save(m)
		await s.remove('g1')
		expect(s.get('g1')).toBeNull()
	})
	it('returns null when persisted byGroup is malformed', async () => {
		const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pl-manifest-'))
		await fs.writeFile(path.join(dir, 'playlist-manifests.json'), JSON.stringify({byGroup: null}))
		const s = new PlaylistManifestStore(dir)
		expect(s.get('g1')).toBeNull()
	})
})
