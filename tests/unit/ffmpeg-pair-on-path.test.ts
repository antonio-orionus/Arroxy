import path from 'node:path'
import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'

const whereOnPathMock = vi.hoisted(() => vi.fn())
const firstExecutableMock = vi.hoisted(() => vi.fn())
vi.mock('@main/services/binary/BinaryProbe.js', () => ({whereOnPath: whereOnPathMock, firstExecutable: firstExecutableMock}))

import {ffmpegPairOnPath} from '@main/services/binary/ffmpegPairOnPath.js'

const ext = process.platform === 'win32' ? '.exe' : ''
const tool = (dir: string, name: 'ffmpeg' | 'ffprobe'): string => path.join(dir, `${name}${ext}`)
const STALE = path.resolve('/stale/bin')
const FRESH = path.resolve('/fresh/bin')

// `onPath` is PATH order; `files` is every executable that exists.
function machine(onPath: string[], files: string[] = onPath): void {
	whereOnPathMock.mockImplementation(async (name: string) => onPath.filter(candidate => path.basename(candidate) === name))
	firstExecutableMock.mockImplementation(async (candidates: string[]) => candidates.find(candidate => files.includes(candidate)) ?? null)
}

beforeEach(() => {
	vi.clearAllMocks()
})

describe('ffmpegPairOnPath', () => {
	// Found in review: an older ffmpeg earlier on PATH, with no ffprobe beside
	// it, was paired with the ffprobe just installed.
	it('takes both tools from the first folder that has both', async () => {
		machine([tool(STALE, 'ffmpeg'), tool(FRESH, 'ffmpeg'), tool(FRESH, 'ffprobe')])

		await expect(ffmpegPairOnPath('WinGet')).resolves.toEqual({ffmpegPath: tool(FRESH, 'ffmpeg'), ffprobePath: tool(FRESH, 'ffprobe')})
	})

	it('finds the pair in an extra folder when PATH has only a stray ffmpeg', async () => {
		machine([tool(STALE, 'ffmpeg')], [tool(STALE, 'ffmpeg'), tool(FRESH, 'ffmpeg'), tool(FRESH, 'ffprobe')])

		await expect(ffmpegPairOnPath('WinGet', {extra: [FRESH]})).resolves.toEqual({ffmpegPath: tool(FRESH, 'ffmpeg'), ffprobePath: tool(FRESH, 'ffprobe')})
	})

	// Found in review: a complete older pair earlier on PATH beat the one just
	// installed, so a repair could save the very pair that had failed.
	it('prefers the package manager folder over a complete older pair on PATH', async () => {
		machine([tool(STALE, 'ffmpeg'), tool(STALE, 'ffprobe')], [tool(STALE, 'ffmpeg'), tool(STALE, 'ffprobe'), tool(FRESH, 'ffmpeg'), tool(FRESH, 'ffprobe')])

		await expect(ffmpegPairOnPath('Homebrew', {preferred: [FRESH]})).resolves.toEqual({ffmpegPath: tool(FRESH, 'ffmpeg'), ffprobePath: tool(FRESH, 'ffprobe')})
	})

	it('fails when no folder has both tools', async () => {
		machine([tool(STALE, 'ffmpeg'), tool(FRESH, 'ffprobe')])

		await expect(ffmpegPairOnPath('Homebrew')).rejects.toThrow('Homebrew finished, but ffmpeg and ffprobe were not both found.')
	})
})
