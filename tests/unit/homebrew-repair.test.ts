import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'

const execFileMock = vi.hoisted(() => vi.fn())
const whereOnPathMock = vi.hoisted(() => vi.fn())
const firstExecutableMock = vi.hoisted(() => vi.fn())

vi.mock('node:child_process', () => ({execFile: execFileMock}))
vi.mock('@main/services/binary/BinaryProbe.js', () => ({whereOnPath: whereOnPathMock, firstExecutable: firstExecutableMock}))

import {canMoveUnderHomebrew, installArroxyWithHomebrew, upgradeArroxyWithHomebrew} from '@main/services/binary/HomebrewRepair.js'

function stubPlatform(platform: NodeJS.Platform): void {
	Object.defineProperty(process, 'platform', {value: platform, configurable: true})
}

const realPlatform = process.platform

beforeEach(() => {
	vi.clearAllMocks()
	stubPlatform('darwin')
	whereOnPathMock.mockResolvedValue(['/opt/homebrew/bin/brew'])
	firstExecutableMock.mockResolvedValue('/opt/homebrew/bin/brew')
	execFileMock.mockImplementation((_file: string, _args: string[], _opts: unknown, cb: (err: Error | null, out: {stdout: string; stderr: string}) => void) => cb(null, {stdout: '', stderr: ''}))
})

afterEach(() => {
	stubPlatform(realPlatform)
})

// Homebrew installs the cask under /Applications. A copy running from elsewhere
// (Downloads, ~/Applications) would be left behind and a relaunch would reopen
// the stale one, so the switch is offered only to /Applications installs.
describe('canMoveUnderHomebrew', () => {
	const inApplications = '/Applications/Arroxy.app/Contents/MacOS/Arroxy'

	it('is true for an /Applications install on a Mac with brew', async () => {
		await expect(canMoveUnderHomebrew(inApplications)).resolves.toBe(true)
	})

	it('is false when brew is not installed', async () => {
		firstExecutableMock.mockResolvedValue(null)

		await expect(canMoveUnderHomebrew(inApplications)).resolves.toBe(false)
	})

	it.each(['/Users/me/Downloads/Arroxy.app/Contents/MacOS/Arroxy', '/Users/me/Applications/Arroxy.app/Contents/MacOS/Arroxy', '/Volumes/Arroxy/Arroxy.app/Contents/MacOS/Arroxy'])('is false for a copy running from %s, without looking for brew', async execPath => {
		await expect(canMoveUnderHomebrew(execPath)).resolves.toBe(false)
		expect(whereOnPathMock).not.toHaveBeenCalled()
	})

	it('is false off macOS', async () => {
		stubPlatform('linux')

		await expect(canMoveUnderHomebrew(inApplications)).resolves.toBe(false)
	})
})

// `--adopt` cannot work for an update: it demands the installed app be
// identical to the cask's. `--force` overwrites the old DMG-installed bundle
// and registers the cask, so later updates run through Homebrew.
describe('installArroxyWithHomebrew', () => {
	it('runs `brew install --cask --force antonio-orionus/arroxy/arroxy` non-interactively with a fixed argv', async () => {
		await installArroxyWithHomebrew()

		expect(execFileMock).toHaveBeenCalledOnce()
		const [file, args, opts] = execFileMock.mock.calls[0]
		expect(file).toBe('/opt/homebrew/bin/brew')
		expect(args).toEqual(['install', '--cask', '--force', 'antonio-orionus/arroxy/arroxy'])
		expect(opts).toMatchObject({env: expect.objectContaining({NONINTERACTIVE: '1', HOMEBREW_NO_ANALYTICS: '1'})})
	})

	it('fails with guidance when Homebrew is not installed', async () => {
		firstExecutableMock.mockResolvedValue(null)

		await expect(installArroxyWithHomebrew()).rejects.toThrow(/Homebrew was not found/)
		expect(execFileMock).not.toHaveBeenCalled()
	})

	it('refuses to run outside macOS', async () => {
		stubPlatform('linux')

		await expect(installArroxyWithHomebrew()).rejects.toThrow(/only available on macOS/)
	})
})

describe('upgradeArroxyWithHomebrew', () => {
	it('runs `brew upgrade --cask arroxy` non-interactively with a fixed argv', async () => {
		await upgradeArroxyWithHomebrew()

		expect(execFileMock).toHaveBeenCalledOnce()
		const [file, args, opts] = execFileMock.mock.calls[0]
		expect(file).toBe('/opt/homebrew/bin/brew')
		expect(args).toEqual(['upgrade', '--cask', 'arroxy'])
		expect(opts).toMatchObject({env: expect.objectContaining({NONINTERACTIVE: '1', HOMEBREW_NO_ANALYTICS: '1'}), timeout: expect.any(Number)})
	})

	it('fails with guidance when Homebrew is not installed', async () => {
		firstExecutableMock.mockResolvedValue(null)

		await expect(upgradeArroxyWithHomebrew()).rejects.toThrow(/Homebrew was not found/)
		expect(execFileMock).not.toHaveBeenCalled()
	})

	it('refuses to run outside macOS', async () => {
		stubPlatform('linux')

		await expect(upgradeArroxyWithHomebrew()).rejects.toThrow(/only available on macOS/)
		expect(execFileMock).not.toHaveBeenCalled()
	})

	it('surfaces brew failures to the caller', async () => {
		execFileMock.mockImplementation((_file: string, _args: string[], _opts: unknown, cb: (err: Error | null) => void) => cb(new Error('Error: Cask arroxy is not installed')))

		await expect(upgradeArroxyWithHomebrew()).rejects.toThrow(/not installed/)
	})
})
