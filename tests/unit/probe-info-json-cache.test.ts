import {mkdtemp, rm, access, writeFile, utimes} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {afterEach, beforeEach, describe, expect, it} from 'vitest'
import {ProbeInfoJsonCache} from '@main/services/ProbeInfoJsonCache.js'

describe('ProbeInfoJsonCache', () => {
	let dir: string

	beforeEach(async () => {
		dir = await mkdtemp(join(tmpdir(), 'arroxy-probe-info-'))
	})

	afterEach(async () => {
		await rm(dir, {recursive: true, force: true})
	})

	it('writes a probe info-json file and resolves it from an opaque ref', async () => {
		const cache = new ProbeInfoJsonCache(dir)
		const ref = await cache.write({_type: 'video', id: 'abc', title: 'Video'}, {videoId: 'abc'})

		expect(ref).toMatchObject({videoId: 'abc'})
		expect(ref.id).toMatch(/^[0-9a-f-]{36}$/i)

		const path = await cache.resolve(ref)
		expect(path).toMatch(/\.info\.json$/)
		await expect(access(path!)).resolves.toBeUndefined()
	})

	it('ignores invalid or missing refs instead of exposing paths', async () => {
		const cache = new ProbeInfoJsonCache(dir)

		await expect(cache.resolve({id: '../escape', createdAt: '2026-06-14T00:00:00.000Z'})).resolves.toBeUndefined()
		await expect(cache.resolve({id: '00000000-0000-4000-8000-000000000000', createdAt: '2026-06-14T00:00:00.000Z'})).resolves.toBeUndefined()
	})

	it('sweeps stale cache files by age', async () => {
		const cache = new ProbeInfoJsonCache(dir)
		const ref = await cache.write({_type: 'video', id: 'old'}, {videoId: 'old'})
		const path = await cache.resolve(ref)
		if (!path) throw new Error('expected cache path')
		await writeFile(path, '{}')
		const stale = new Date(Date.now() - 60_000)
		await utimes(path, stale, stale)

		await cache.sweepExpired(1)

		await expect(access(path)).rejects.toThrow()
	})
})
