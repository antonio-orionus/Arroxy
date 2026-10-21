import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {afterEach, describe, expect, it} from 'vite-plus/test'
import {makeFixtureOutputDir} from '../e2e/outputRoot.js'

const made: string[] = []

function track(dir: string): string {
	made.push(dir)
	return dir
}

afterEach(() => {
	for (const dir of made.splice(0)) fs.rmSync(dir, {recursive: true, force: true})
})

describe('makeFixtureOutputDir', () => {
	it('makes the folder under the system temp folder by default', () => {
		const dir = track(makeFixtureOutputDir('arroxy-output-root-test-', {}))
		expect(path.dirname(dir)).toBe(os.tmpdir())
		expect(path.basename(dir)).toMatch(/^arroxy-output-root-test-/)
		expect(fs.statSync(dir).isDirectory()).toBe(true)
	})

	// Only the download folder goes deep: a deep TEMP breaks yt-dlp itself,
	// which unpacks into it, and says nothing about Arroxy's path handling.
	it('makes it under ARROXY_E2E_OUTPUT_ROOT, creating the root when missing', () => {
		const base = track(fs.mkdtempSync(path.join(os.tmpdir(), 'arroxy-output-root-base-')))
		const root = path.join(base, 'a'.repeat(40), 'b'.repeat(40))
		const dir = makeFixtureOutputDir('arroxy-output-root-test-', {ARROXY_E2E_OUTPUT_ROOT: root})
		expect(path.dirname(dir)).toBe(root)
		expect(fs.statSync(dir).isDirectory()).toBe(true)
	})

	it('resolves a relative root to an absolute folder', () => {
		const base = track(fs.mkdtempSync(path.join(os.tmpdir(), 'arroxy-output-root-base-')))
		const relative = path.relative(process.cwd(), path.join(base, 'rel'))
		const dir = makeFixtureOutputDir('arroxy-output-root-test-', {ARROXY_E2E_OUTPUT_ROOT: relative})
		expect(path.isAbsolute(dir)).toBe(true)
		expect(path.dirname(dir)).toBe(path.join(base, 'rel'))
	})

	it('treats an empty value as unset', () => {
		const dir = track(makeFixtureOutputDir('arroxy-output-root-test-', {ARROXY_E2E_OUTPUT_ROOT: ''}))
		expect(path.dirname(dir)).toBe(os.tmpdir())
	})
})
