import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {afterEach, describe, expect, it} from 'vitest'
import {copyProfilePreservingMtime, provisionProfile} from '../../scripts/startup/provisionProfile.js'

const created: string[] = []

function tempBase(): string {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'arroxy-provision-test-'))
	created.push(dir)
	return dir
}

afterEach(() => {
	while (created.length > 0) {
		const dir = created.pop()
		if (dir) fs.rmSync(dir, {recursive: true, force: true})
	}
})

describe('provisionProfile', () => {
	it('creates an empty directory for the empty kind', async () => {
		const profile = await provisionProfile({kind: 'empty', baseDir: tempBase()})
		expect(fs.existsSync(profile)).toBe(true)
		expect(fs.readdirSync(profile)).toEqual([])
	})

	it('writes malformed settings and queue files for the corrupt kind', async () => {
		const profile = await provisionProfile({kind: 'corrupt', baseDir: tempBase()})
		expect(fs.readFileSync(path.join(profile, 'settings.json'), 'utf8')).toBe('{"common":')
		expect(fs.readFileSync(path.join(profile, 'queue.json'), 'utf8')).toBe('not json at all')
	})

	it('requires a warm source directory for the warm kind', async () => {
		await expect(provisionProfile({kind: 'warm', baseDir: tempBase()})).rejects.toThrow(/warmSource/)
	})

	it('preserves mtime when copying a profile', () => {
		const base = tempBase()
		const from = path.join(base, 'from')
		const to = path.join(base, 'to')
		fs.mkdirSync(from, {recursive: true})
		const file = path.join(from, 'marker.txt')
		fs.writeFileSync(file, 'x')
		const past = new Date(Date.now() - 60_000)
		fs.utimesSync(file, past, past)

		copyProfilePreservingMtime(from, to)

		const copied = fs.statSync(path.join(to, 'marker.txt'))
		expect(Math.abs(copied.mtime.getTime() - past.getTime())).toBeLessThan(2000)
	})
})
