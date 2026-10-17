import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {afterEach, describe, expect, it, vi} from 'vite-plus/test'
import {anonymousDevUserData, prepareAnonymousDevProfile} from '../../scripts/dev-env.js'
import {EXPLORE_PARTITION} from '@main/services/ExploreSessionService.js'

vi.mock('electron', () => ({app: {}, BrowserWindow: class {}, session: {}}))

// `bun run dev:anon`: the dev app with its own profile, where Explore browses
// YouTube signed out on every launch and opens straight onto the page (the
// first-run notice and the cookie-mode nudge already dealt with). The normal
// dev profile, and any sign-in in it, is never touched.

const temps: string[] = []

async function tempDir(): Promise<string> {
	const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'arroxy-dev-anon-'))
	temps.push(dir)
	return dir
}

async function readSettings(userData: string): Promise<{common: Record<string, unknown>} & Record<string, unknown>> {
	return JSON.parse(await fs.readFile(path.join(userData, 'settings.json'), 'utf8')) as {common: Record<string, unknown>} & Record<string, unknown>
}

afterEach(async () => {
	await Promise.all(temps.splice(0).map(dir => fs.rm(dir, {recursive: true, force: true})))
})

describe('anonymous dev profile', () => {
	it('lives next to the dev profile, never in it', () => {
		expect(anonymousDevUserData('/repo/.electron-user-data/dev')).toBe(path.join('/repo/.electron-user-data', 'dev-anon'))
		expect(anonymousDevUserData('/tmp/custom-user-data')).toBe(path.join('/tmp', 'custom-user-data-anon'))
	})

	it('wipes the Explore partition, so YouTube opens signed out, and keeps the rest of the profile', async () => {
		const userData = await tempDir()
		const partitionDir = path.join(userData, 'Partitions', EXPLORE_PARTITION.replace(/^persist:/, ''))
		await fs.mkdir(partitionDir, {recursive: true})
		await fs.writeFile(path.join(partitionDir, 'Cookies'), 'signed-in')
		await fs.mkdir(path.join(userData, 'runtime-cache'), {recursive: true})
		await fs.writeFile(path.join(userData, 'runtime-cache', 'yt-dlp'), 'binary')

		await prepareAnonymousDevProfile(userData)

		await expect(fs.stat(partitionDir)).rejects.toThrow()
		await expect(fs.readFile(path.join(userData, 'runtime-cache', 'yt-dlp'), 'utf8')).resolves.toBe('binary')
	})

	it('opens Explore straight onto the page, with downloads using no cookies', async () => {
		const userData = await tempDir()

		await prepareAnonymousDevProfile(userData)

		expect((await readSettings(userData)).common).toEqual({exploreEnabled: true, exploreNoticeSeen: true, exploreModeAutoSwitched: true, cookiesMode: 'off', exploreModeNudgeDismissedFor: 'off'})
	})

	it('keeps the settings changed in an earlier anonymous run, but always goes back to no cookies', async () => {
		const userData = await tempDir()
		await fs.writeFile(path.join(userData, 'settings.json'), JSON.stringify({common: {uiTheme: 'dark', cookiesMode: 'explore', exploreLastUrl: 'https://www.youtube.com/feed/trending'}, profiles: {active: {kind: 'builtin', id: 'audio-only'}}}))

		await prepareAnonymousDevProfile(userData)

		const settings = await readSettings(userData)
		expect(settings.common).toMatchObject({uiTheme: 'dark', exploreLastUrl: 'https://www.youtube.com/feed/trending', cookiesMode: 'off', exploreNoticeSeen: true})
		expect(settings.profiles).toEqual({active: {kind: 'builtin', id: 'audio-only'}})
	})

	it('starts the settings over when the file is not readable JSON', async () => {
		const userData = await tempDir()
		await fs.writeFile(path.join(userData, 'settings.json'), '{not json')

		await prepareAnonymousDevProfile(userData)

		expect((await readSettings(userData)).common).toMatchObject({cookiesMode: 'off', exploreNoticeSeen: true})
	})
})
