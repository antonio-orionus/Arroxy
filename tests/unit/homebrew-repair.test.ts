import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'

const execFileMock = vi.hoisted(() => vi.fn())
const whereOnPathMock = vi.hoisted(() => vi.fn())
const firstExecutableMock = vi.hoisted(() => vi.fn())

vi.mock('node:child_process', () => ({execFile: execFileMock}))
vi.mock('@main/services/binary/BinaryProbe.js', () => ({whereOnPath: whereOnPathMock, firstExecutable: firstExecutableMock}))

import {canMoveUnderHomebrew, installArroxyWithHomebrew, installFfmpegWithHomebrew, upgradeArroxyWithHomebrew} from '@main/services/binary/HomebrewRepair.js'

type ExecCallback = (err: Error | null, out?: {stdout: string; stderr: string}) => void

function stubPlatform(platform: NodeJS.Platform): void {
	Object.defineProperty(process, 'platform', {value: platform, configurable: true})
}

// Stands in for brew: the install/upgrade command succeeds, and `brew list
// --versions` reports whatever the cask looks like after it ran.
function fakeBrew({installed = 'arroxy 0.5.3\n'}: {installed?: string} = {}): void {
	execFileMock.mockImplementation((_file: string, args: string[], _opts: unknown, cb: ExecCallback) => cb(null, {stdout: args[0] === 'list' ? installed : '', stderr: ''}))
}

function commandCalls(): string[][] {
	return execFileMock.mock.calls.map(call => call[1] as string[]).filter(args => args[0] !== 'list')
}

const realPlatform = process.platform

beforeEach(() => {
	vi.clearAllMocks()
	stubPlatform('darwin')
	whereOnPathMock.mockResolvedValue(['/opt/homebrew/bin/brew'])
	firstExecutableMock.mockResolvedValue('/opt/homebrew/bin/brew')
	fakeBrew()
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
		await installArroxyWithHomebrew('0.5.3')

		expect(commandCalls()).toEqual([['install', '--cask', '--force', 'antonio-orionus/arroxy/arroxy']])
		const [file, , opts] = execFileMock.mock.calls[0]
		expect(file).toBe('/opt/homebrew/bin/brew')
		expect(opts).toMatchObject({env: expect.objectContaining({NONINTERACTIVE: '1', HOMEBREW_NO_ANALYTICS: '1'})})
	})

	it('fails with guidance when Homebrew is not installed', async () => {
		firstExecutableMock.mockResolvedValue(null)

		await expect(installArroxyWithHomebrew('0.5.3')).rejects.toThrow(/Homebrew was not found/)
		expect(execFileMock).not.toHaveBeenCalled()
	})

	it('refuses to run outside macOS', async () => {
		stubPlatform('linux')

		await expect(installArroxyWithHomebrew('0.5.3')).rejects.toThrow(/only available on macOS/)
	})
})

describe('upgradeArroxyWithHomebrew', () => {
	it('runs `brew upgrade --cask arroxy` non-interactively with a fixed argv', async () => {
		await upgradeArroxyWithHomebrew('0.5.3')

		expect(commandCalls()).toEqual([['upgrade', '--cask', 'arroxy']])
		const [file, , opts] = execFileMock.mock.calls[0]
		expect(file).toBe('/opt/homebrew/bin/brew')
		expect(opts).toMatchObject({env: expect.objectContaining({NONINTERACTIVE: '1', HOMEBREW_NO_ANALYTICS: '1'}), timeout: expect.any(Number)})
	})

	it('fails with guidance when Homebrew is not installed', async () => {
		firstExecutableMock.mockResolvedValue(null)

		await expect(upgradeArroxyWithHomebrew('0.5.3')).rejects.toThrow(/Homebrew was not found/)
		expect(execFileMock).not.toHaveBeenCalled()
	})

	it('refuses to run outside macOS', async () => {
		stubPlatform('linux')

		await expect(upgradeArroxyWithHomebrew('0.5.3')).rejects.toThrow(/only available on macOS/)
		expect(execFileMock).not.toHaveBeenCalled()
	})

	it('surfaces brew failures to the caller', async () => {
		execFileMock.mockImplementation((_file: string, _args: string[], _opts: unknown, cb: ExecCallback) => cb(new Error('Error: Cask arroxy is not installed')))

		await expect(upgradeArroxyWithHomebrew('0.5.3')).rejects.toThrow(/not installed/)
	})
})

// Homebrew refreshes its taps at most once per 24 h before an install or
// upgrade. Right after a release a throttled refresh leaves the tap on the old
// cask, and `brew upgrade` then exits 0 with "latest version is already
// installed": the app would relaunch into the version it was already on.
describe.each([
	['upgradeArroxyWithHomebrew', upgradeArroxyWithHomebrew],
	['installArroxyWithHomebrew', installArroxyWithHomebrew]
])('%s freshness', (_name, run) => {
	it('forces a tap refresh instead of trusting the 24 h throttle', async () => {
		await run('0.5.3')

		const [, , opts] = execFileMock.mock.calls[0]
		expect(opts.env.HOMEBREW_AUTO_UPDATE_SECS).toBe('0')
	})

	it('asks Homebrew which cask version is installed, and accepts the announced one', async () => {
		await run('0.5.3')

		const listCall = execFileMock.mock.calls.find(call => (call[1] as string[])[0] === 'list')
		expect(listCall?.[1]).toEqual(['list', '--cask', '--versions', 'arroxy'])
	})

	it('accepts a cask that is already newer than the announced version', async () => {
		fakeBrew({installed: 'arroxy 0.5.4\n'})

		await expect(run('0.5.3')).resolves.toBeUndefined()
	})

	it('rejects when brew succeeded but the cask is still older, so the app is not relaunched into it', async () => {
		fakeBrew({installed: 'arroxy 0.5.2\n'})

		await expect(run('0.5.3')).rejects.toThrow(/0\.5\.2.*0\.5\.3|0\.5\.3.*0\.5\.2/)
	})

	it('rejects when the installed version cannot be read', async () => {
		fakeBrew({installed: ''})

		await expect(run('0.5.3')).rejects.toThrow(/0\.5\.3/)
	})

	it('compares versions numerically, not as text', async () => {
		fakeBrew({installed: 'arroxy 0.5.10\n'})

		await expect(run('0.5.9')).resolves.toBeUndefined()
	})
})

describe('installFfmpegWithHomebrew', () => {
	function onPath(found: Record<string, string>): void {
		whereOnPathMock.mockImplementation(async (name: string) => (name === 'brew' ? ['/opt/homebrew/bin/brew'] : found[name] ? [found[name]] : []))
		firstExecutableMock.mockImplementation(async (candidates: string[]) => candidates[0] ?? null)
	}

	it('installs ffmpeg with brew and returns both media tools', async () => {
		onPath({ffmpeg: '/opt/homebrew/bin/ffmpeg', ffprobe: '/opt/homebrew/bin/ffprobe'})

		await expect(installFfmpegWithHomebrew()).resolves.toEqual({ffmpegPath: '/opt/homebrew/bin/ffmpeg', ffprobePath: '/opt/homebrew/bin/ffprobe'})
		expect(commandCalls()).toEqual([['install', 'ffmpeg']])
	})

	// Pointing Arroxy at an ffmpeg without its matching ffprobe would leave the
	// pair broken, so a half-found install is an error.
	it('fails when brew leaves no ffprobe beside ffmpeg', async () => {
		onPath({ffmpeg: '/opt/homebrew/bin/ffmpeg'})

		await expect(installFfmpegWithHomebrew()).rejects.toThrow('ffmpeg and ffprobe were not both found')
	})
})
