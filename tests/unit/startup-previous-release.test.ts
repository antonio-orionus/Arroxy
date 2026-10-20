import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {afterEach, beforeEach, describe, expect, it} from 'vite-plus/test'
import {assertWarmupFinished, assetNameFor, previousStableTag} from '../../scripts/startup/fetchPreviousRelease.js'

describe('previousStableTag', () => {
	const tags = ['v0.4.3', 'v0.4.4', 'v0.4.5', 'v0.4.6', 'v0.4.7', 'v0.4.8-beta.1']

	it('picks the highest stable tag below the current version', () => {
		expect(previousStableTag(tags, 'v0.4.8')).toBe('v0.4.7')
	})

	it('ignores pre-release tags when choosing the predecessor', () => {
		expect(previousStableTag(tags, 'v0.4.8-beta.2')).toBe('v0.4.7')
	})

	it('returns null when there is no earlier stable release', () => {
		expect(previousStableTag(['v0.1.0'], 'v0.1.0')).toBeNull()
	})
})

describe('assetNameFor', () => {
	it('uses the portable form per platform so no installer is required', () => {
		expect(assetNameFor('linux', 'x64')).toMatch(/AppImage$/)
		expect(assetNameFor('darwin', 'arm64')).toMatch(/\.dmg$/)
		expect(assetNameFor('win32', 'x64')).toMatch(/Portable\.exe$/)
	})

	it('matches the asset names electron-builder actually publishes', () => {
		// Canonical names per electron-builder.json5 artifactName and the
		// release-asset-names contract: electron-builder substitutes ${arch}
		// verbatim, so linux is 'x64' — 'x86_64' matches no release asset.
		expect(assetNameFor('linux', 'x64')).toBe('Arroxy-linux-x64.AppImage')
		expect(assetNameFor('darwin', 'arm64')).toBe('Arroxy-mac-arm64.dmg')
		expect(assetNameFor('win32', 'x64')).toBe('Arroxy-win-x64-Portable.exe')
	})
})

describe('assertWarmupFinished', () => {
	let profileDir: string

	const writeLog = (text: string) => {
		fs.mkdirSync(path.join(profileDir, 'logs'), {recursive: true})
		fs.writeFileSync(path.join(profileDir, 'logs', 'main.log'), text)
	}
	const writeCache = () => fs.mkdirSync(path.join(profileDir, 'runtime-cache', 'binaries'), {recursive: true})

	beforeEach(() => {
		profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arroxy-inherited-'))
	})

	afterEach(() => {
		fs.rmSync(profileDir, {recursive: true, force: true})
	})

	it('rejects a profile closed before warmup logged its summary', () => {
		writeLog("[2026-10-20 10:00:00.000] [info]  Warmup branch settled { branch: 'ytDlp' }\n")
		writeCache()
		expect(() => assertWarmupFinished(profileDir)).toThrow(/Warmup completed/)
	})

	it('rejects a profile without a main.log', () => {
		writeCache()
		expect(() => assertWarmupFinished(profileDir)).toThrow(/Warmup completed/)
	})

	it('rejects a profile the previous release left without a runtime cache', () => {
		writeLog('[2026-10-20 10:00:00.000] [info]  Warmup completed { totalMs: 900 }\n')
		expect(() => assertWarmupFinished(profileDir)).toThrow(/runtime-cache/)
	})

	it('rejects an empty runtime cache', () => {
		writeLog('[2026-10-20 10:00:00.000] [info]  Warmup completed { totalMs: 900 }\n')
		fs.mkdirSync(path.join(profileDir, 'runtime-cache'))
		expect(() => assertWarmupFinished(profileDir)).toThrow(/runtime-cache/)
	})

	it('names what the profile does contain, so a red gate can be triaged from its log', () => {
		fs.writeFileSync(path.join(profileDir, 'settings.json'), '{}')
		expect(() => assertWarmupFinished(profileDir)).toThrow(/settings\.json/)
	})

	it('accepts a profile whose warmup logged its summary and wrote the runtime cache', () => {
		writeLog('[2026-10-20 10:00:00.000] [info]  Warmup completed { totalMs: 900 }\n')
		writeCache()
		expect(() => assertWarmupFinished(profileDir)).not.toThrow()
	})
})
