// When the daily catalogue job rebuilds (scripts/ytdlp-catalogue/daily.ts): a
// new pinned yt-dlp commit, or new rules for the same one. Otherwise it leaves
// the data branch alone.

import {mkdtemp, rm, writeFile} from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {describe, expect, it} from 'vite-plus/test'
import type {Catalogue} from '../../scripts/ytdlp-catalogue/catalogue.js'
import {loadPrevious, rebuildReason, reportName} from '../../scripts/ytdlp-catalogue/daily.js'

const PIN = {commit: 'a'.repeat(40), version: '2026.10.21.233146', channel: 'nightly', manifestGeneratedAt: '2026-10-22T13:00:31.439Z'} as const

function previous(commit: string, hash: string): Catalogue {
	return {schemaVersion: 1, ytDlp: {...PIN, commit}, generator: {extractVersion: 1, hash}, sites: []}
}

describe('rebuildReason', () => {
	it('builds the first catalogue', () => {
		expect(rebuildReason(null, PIN, '0123456789ab')).toBe('first catalogue')
	})

	it('rebuilds over a previous catalogue it can no longer read, rather than failing every day', () => {
		expect(rebuildReason('unreadable', PIN, '0123456789ab')).toBe('previous catalogue unreadable')
	})

	it('rebuilds for a new pinned commit', () => {
		expect(rebuildReason(previous('b'.repeat(40), '0123456789ab'), PIN, '0123456789ab')).toBe(`yt-dlp ${PIN.version}`)
	})

	it('rebuilds the same commit when the generator changed', () => {
		expect(rebuildReason(previous(PIN.commit, 'ba9876543210'), PIN, '0123456789ab')).toBe('generator changed')
	})

	it('leaves the same commit under the same rules alone', () => {
		expect(rebuildReason(previous(PIN.commit, '0123456789ab'), PIN, '0123456789ab')).toBeNull()
	})
})

describe('loadPrevious', () => {
	it('reads nothing as a first run, and a file the current schema rejects as unreadable', async () => {
		const dir = await mkdtemp(path.join(os.tmpdir(), 'ytdlp-catalogue-daily-'))
		try {
			expect(await loadPrevious(dir)).toBeNull()
			await writeFile(path.join(dir, 'ytdlp-catalogue.json'), JSON.stringify({schemaVersion: 2, sites: []}))
			expect(await loadPrevious(dir)).toBe('unreadable')
		} finally {
			await rm(dir, {recursive: true, force: true})
		}
	})
})

describe('reportName', () => {
	it('a pin’s first report gets its version; any later one for the same pin a name of its own, so the pin’s diff survives', () => {
		expect(reportName(PIN.version, false, '0123456789ab')).toBe(PIN.version)
		expect(reportName(PIN.version, true, '0123456789ab')).toBe(`${PIN.version}+generator-0123456789ab`)
	})
})
