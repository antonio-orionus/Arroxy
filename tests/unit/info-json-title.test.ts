// @vitest-environment node

import {mkdtemp, rm, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {afterEach, beforeEach, describe, expect, it} from 'vite-plus/test'
import {readInfoJsonTitle} from '@main/services/download/infoJsonTitle.js'

let dir: string

beforeEach(async () => {
	dir = await mkdtemp(join(tmpdir(), 'arroxy-info-json-title-'))
})

afterEach(async () => {
	await rm(dir, {recursive: true, force: true})
})

async function infoJson(contents: string): Promise<string> {
	const path = join(dir, '_arroxy.info.json')
	await writeFile(path, contents)
	return path
}

describe('readInfoJsonTitle', () => {
	it('returns the title exactly as yt-dlp wrote it, with the characters a filename cannot hold', async () => {
		const title = `AC/DC: Live? "Best" | <Of> * ${'x'.repeat(300)}`
		expect(await readInfoJsonTitle(await infoJson(JSON.stringify({id: 'abc123', title, ext: 'mp4'})))).toBe(title)
	})

	it('trims surrounding whitespace', async () => {
		expect(await readInfoJsonTitle(await infoJson(JSON.stringify({title: '  Real Title \n'})))).toBe('Real Title')
	})

	it('returns null for a missing file', async () => {
		expect(await readInfoJsonTitle(join(dir, 'missing.info.json'))).toBeNull()
	})

	it('returns null for a file that is not JSON', async () => {
		expect(await readInfoJsonTitle(await infoJson('{"title": "Real'))).toBeNull()
	})

	it('returns null when the title is absent, not a string, or blank', async () => {
		expect(await readInfoJsonTitle(await infoJson(JSON.stringify({id: 'abc123'})))).toBeNull()
		expect(await readInfoJsonTitle(await infoJson(JSON.stringify({title: 42})))).toBeNull()
		expect(await readInfoJsonTitle(await infoJson(JSON.stringify({title: '   '})))).toBeNull()
		expect(await readInfoJsonTitle(await infoJson(JSON.stringify(['Real Title'])))).toBeNull()
	})
})
